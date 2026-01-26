import { NextResponse } from 'next/server';
import { redis, isRedisAvailable } from '@/lib/redis';
import { getQuoteForMetrics } from '@/lib/yahoo-finance';
import type { YahooQuote } from '@/lib/adapters/metricsAdapter';

/* ── Metric keys we track ────────────────────────────────────── */

const METRIC_KEYS = ['marketCap', 'shortInterest', 'beta', 'avgVolume'] as const;
type MetricKey = (typeof METRIC_KEYS)[number];

/* ── Response types ──────────────────────────────────────────── */

export interface MetricHistoricalData {
  current: number;
  percentile: number | null;  // null when < 5 data points
  high52w: number | null;
  low52w: number | null;
  dataPoints: number;
  buildingHistory: boolean;   // true when < 5 data points
}

export interface HistoricalMetricsResponse {
  ticker: string;
  metrics: Record<MetricKey, MetricHistoricalData | null>;
  snapshotRecorded: boolean;
}

/* ── Helpers ─────────────────────────────────────────────────── */

function extractMetricValue(quote: YahooQuote, key: MetricKey): number | null {
  switch (key) {
    case 'marketCap':
      return quote.marketCap ?? null;
    case 'shortInterest':
      // Match the quote API which multiplies by 100
      return quote.shortPercentOfFloat != null ? quote.shortPercentOfFloat * 100 : null;
    case 'beta':
      return quote.beta ?? null;
    case 'avgVolume':
      return quote.averageDailyVolume3Month ?? null;
  }
}

function redisKey(ticker: string, key: MetricKey): string {
  return `metrics:${ticker}:${key}`;
}

/* ── Record today's snapshot (idempotent) ────────────────────── */

async function recordDailySnapshot(ticker: string, quote: YahooQuote): Promise<boolean> {
  if (!isRedisAvailable() || !redis) return false;

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const dedupeKey = `metrics:${ticker}:last-snapshot`;

  try {
    const lastSnapshot = await redis.get<string>(dedupeKey);
    if (lastSnapshot === today) return false; // already recorded today
  } catch { /* continue */ }

  const todayTs = new Date(today + 'T00:00:00Z').getTime();
  let recorded = false;

  for (const key of METRIC_KEYS) {
    const value = extractMetricValue(quote, key);
    if (value == null || !Number.isFinite(value)) continue;

    try {
      await redis.zadd(redisKey(ticker, key), {
        score: todayTs,
        member: JSON.stringify({ value, date: today }),
      });
      recorded = true;
    } catch (e) {
      console.error(`Failed to record metric snapshot ${key} for ${ticker}:`, e);
    }
  }

  if (recorded) {
    try {
      await redis.set(dedupeKey, today, { ex: 86400 });
    } catch { /* non-fatal */ }
  }

  // Prune entries older than 365 days
  const cutoff = Date.now() - 365 * 24 * 60 * 60 * 1000;
  for (const key of METRIC_KEYS) {
    try {
      await redis.zremrangebyscore(redisKey(ticker, key), 0, cutoff);
    } catch { /* non-fatal */ }
  }

  return recorded;
}

/* ── Compute percentile & range for one metric ───────────────── */

async function computeMetricHistory(
  ticker: string,
  key: MetricKey,
  currentValue: number | null,
): Promise<MetricHistoricalData | null> {
  if (currentValue == null || !Number.isFinite(currentValue)) return null;

  if (!isRedisAvailable() || !redis) {
    return {
      current: currentValue,
      percentile: null,
      high52w: null,
      low52w: null,
      dataPoints: 0,
      buildingHistory: true,
    };
  }

  const rKey = redisKey(ticker, key);
  const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;

  try {
    const entries = await redis.zrange(rKey, oneYearAgo, '+inf', { byScore: true });

    const values: number[] = [];
    for (const entry of entries) {
      try {
        const parsed = typeof entry === 'string' ? JSON.parse(entry) : entry;
        if (typeof parsed?.value === 'number' && Number.isFinite(parsed.value)) {
          values.push(parsed.value);
        }
      } catch { /* skip malformed entries */ }
    }

    // Include current value if not already represented
    if (!values.includes(currentValue)) {
      values.push(currentValue);
    }

    const dataPoints = values.length;
    const buildingHistory = dataPoints < 5;

    const sorted = [...values].sort((a, b) => a - b);
    const low52w = sorted[0] ?? null;
    const high52w = sorted[sorted.length - 1] ?? null;

    let percentile: number | null = null;
    if (!buildingHistory) {
      const belowOrEqual = sorted.filter((v) => v <= currentValue).length;
      percentile = Math.round((belowOrEqual / sorted.length) * 100);
    }

    return { current: currentValue, percentile, high52w, low52w, dataPoints, buildingHistory };
  } catch (e) {
    console.error(`Failed to compute metric history for ${key}/${ticker}:`, e);
    return {
      current: currentValue,
      percentile: null,
      high52w: null,
      low52w: null,
      dataPoints: 0,
      buildingHistory: true,
    };
  }
}

/* ── Route handler ───────────────────────────────────────────── */

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticker: string }> },
) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase();

  try {
    const quote = await getQuoteForMetrics(upperTicker);
    if (!quote) {
      return NextResponse.json(
        { error: 'Failed to fetch quote data' },
        { status: 500 },
      );
    }

    // Record today's snapshot (fire-and-forget style but awaited)
    const snapshotRecorded = await recordDailySnapshot(upperTicker, quote);

    // Compute history for all tracked metrics in parallel
    const [marketCap, shortInterest, beta, avgVolume] = await Promise.all([
      computeMetricHistory(upperTicker, 'marketCap', quote.marketCap ?? null),
      computeMetricHistory(
        upperTicker,
        'shortInterest',
        quote.shortPercentOfFloat != null ? quote.shortPercentOfFloat * 100 : null,
      ),
      computeMetricHistory(upperTicker, 'beta', quote.beta ?? null),
      computeMetricHistory(upperTicker, 'avgVolume', quote.averageDailyVolume3Month ?? null),
    ]);

    const response: HistoricalMetricsResponse = {
      ticker: upperTicker,
      metrics: { marketCap, shortInterest, beta, avgVolume },
      snapshotRecorded,
    };

    return NextResponse.json(response, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300' },
    });
  } catch (e) {
    console.error(`Metrics historical error for ${upperTicker}:`, e);
    return NextResponse.json(
      { error: 'Failed to compute historical metrics' },
      { status: 500 },
    );
  }
}
