import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';
import { redis, isRedisAvailable } from '@/lib/redis';
import { getYahooTicker } from '@/lib/yahoo-finance';

const yahooFinance = new YahooFinance();

/* ── Response type ───────────────────────────────────────────── */

export interface IVResponse {
  ticker: string;
  currentIV: number;             // as percentage, e.g. 58.3
  ivPercentile: number | null;   // null when < 5 data points
  iv52wHigh: number | null;
  iv52wLow: number | null;
  dataPoints: number;
  buildingHistory: boolean;
  expirationUsed: string;        // ISO date of option expiration used
}

/* ── Helpers ─────────────────────────────────────────────────── */

/** Monthly options expire on the 3rd Friday of the month. */
function isMonthlyExpiration(date: Date): boolean {
  const day = date.getDay();        // 0=Sun … 5=Fri
  const dom = date.getDate();
  return day === 5 && dom >= 15 && dom <= 21;
}

function redisKey(ticker: string): string {
  return `iv:${ticker}:history`;
}

/* ── Record today's IV reading in Redis sorted set ───────────── */

async function recordIVSnapshot(ticker: string, iv: number): Promise<boolean> {
  if (!isRedisAvailable() || !redis) return false;

  const today = new Date().toISOString().split('T')[0];
  const dedupeKey = `iv:${ticker}:last-snapshot`;

  try {
    const last = await redis.get<string>(dedupeKey);
    if (last === today) return false;
  } catch { /* continue */ }

  const todayTs = new Date(today + 'T00:00:00Z').getTime();

  try {
    await redis.zadd(redisKey(ticker), {
      score: todayTs,
      member: JSON.stringify({ value: iv, date: today }),
    });
    await redis.set(dedupeKey, today, { ex: 86400 });

    // Prune entries older than 400 days
    const cutoff = Date.now() - 400 * 24 * 60 * 60 * 1000;
    await redis.zremrangebyscore(redisKey(ticker), 0, cutoff);
    return true;
  } catch (e) {
    console.error(`Failed to record IV snapshot for ${ticker}:`, e);
    return false;
  }
}

/* ── Compute IV percentile from sorted set ───────────────────── */

async function computeIVHistory(ticker: string, currentIV: number): Promise<{
  ivPercentile: number | null;
  iv52wHigh: number | null;
  iv52wLow: number | null;
  dataPoints: number;
  buildingHistory: boolean;
}> {
  if (!isRedisAvailable() || !redis) {
    return { ivPercentile: null, iv52wHigh: null, iv52wLow: null, dataPoints: 0, buildingHistory: true };
  }

  const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;

  try {
    const entries = await redis.zrange(redisKey(ticker), oneYearAgo, '+inf', { byScore: true });

    const values: number[] = [];
    for (const entry of entries) {
      try {
        const parsed = typeof entry === 'string' ? JSON.parse(entry) : entry;
        if (typeof parsed?.value === 'number' && Number.isFinite(parsed.value)) {
          values.push(parsed.value);
        }
      } catch { /* skip malformed */ }
    }

    if (!values.includes(currentIV)) {
      values.push(currentIV);
    }

    const dataPoints = values.length;
    const buildingHistory = dataPoints < 5;
    const sorted = [...values].sort((a, b) => a - b);
    const iv52wLow = sorted[0] ?? null;
    const iv52wHigh = sorted[sorted.length - 1] ?? null;

    let ivPercentile: number | null = null;
    if (!buildingHistory && iv52wHigh != null && iv52wLow != null && iv52wHigh > iv52wLow) {
      // IV Percentile = (current - low) / (high - low) * 100
      ivPercentile = Math.round(((currentIV - iv52wLow) / (iv52wHigh - iv52wLow)) * 100);
      ivPercentile = Math.max(0, Math.min(100, ivPercentile));
    }

    return { ivPercentile, iv52wHigh, iv52wLow, dataPoints, buildingHistory };
  } catch (e) {
    console.error(`Failed to compute IV history for ${ticker}:`, e);
    return { ivPercentile: null, iv52wHigh: null, iv52wLow: null, dataPoints: 0, buildingHistory: true };
  }
}

/* ── Route handler ───────────────────────────────────────────── */

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticker: string }> },
) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase();
  const yahooTicker = getYahooTicker(upperTicker);

  try {
    // Fetch options chain
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const optionsData = await (yahooFinance as any).options(yahooTicker);

    if (!optionsData?.options?.length) {
      return NextResponse.json(
        { error: 'No options data available', ticker: upperTicker },
        { status: 404 },
      );
    }

    // Get current price from the embedded quote
    const currentPrice: number =
      optionsData.quote?.regularMarketPrice ?? 0;

    if (currentPrice <= 0) {
      return NextResponse.json(
        { error: 'Could not determine current price', ticker: upperTicker },
        { status: 500 },
      );
    }

    // Find the best expiration: prefer nearest monthly 20-60 days out,
    // fallback to nearest expiration >= 7 days out
    const now = Date.now();
    const expirations: Date[] = (optionsData.expirationDates ?? [])
      .map((d: Date | string | number) => new Date(d))
      .filter((d: Date) => d.getTime() > now + 7 * 86400000); // at least 7 days out

    let targetExpiration: Date | null = null;

    // Try monthly expirations 20-60 days out
    for (const exp of expirations) {
      const daysOut = (exp.getTime() - now) / 86400000;
      if (daysOut >= 20 && daysOut <= 60 && isMonthlyExpiration(exp)) {
        targetExpiration = exp;
        break;
      }
    }

    // Fallback: nearest expiration 20+ days out
    if (!targetExpiration) {
      for (const exp of expirations) {
        const daysOut = (exp.getTime() - now) / 86400000;
        if (daysOut >= 20) {
          targetExpiration = exp;
          break;
        }
      }
    }

    // Last resort: nearest available
    if (!targetExpiration && expirations.length > 0) {
      targetExpiration = expirations[0];
    }

    if (!targetExpiration) {
      return NextResponse.json(
        { error: 'No suitable expiration found', ticker: upperTicker },
        { status: 404 },
      );
    }

    // Find the option chain for the target expiration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let chain: any = optionsData.options.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (o: any) => new Date(o.expirationDate).toDateString() === targetExpiration!.toDateString(),
    );

    // If target expiration isn't in the default chain, refetch with specific date
    if (!chain) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const specificData = await (yahooFinance as any).options(yahooTicker, { date: targetExpiration });
        chain = specificData?.options?.[0];
      } catch {
        // Fall back to first available chain
        chain = optionsData.options[0];
      }
    }

    if (!chain?.calls?.length) {
      return NextResponse.json(
        { error: 'No call options in chain', ticker: upperTicker },
        { status: 404 },
      );
    }

    // Find ATM call (strike closest to current price)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const calls: any[] = chain.calls;
    let atmCall = calls[0];
    let minDist = Math.abs(calls[0].strike - currentPrice);

    for (const call of calls) {
      const dist = Math.abs(call.strike - currentPrice);
      if (dist < minDist) {
        minDist = dist;
        atmCall = call;
      }
    }

    const rawIV = atmCall.impliedVolatility;
    if (rawIV == null || !Number.isFinite(rawIV) || rawIV <= 0) {
      return NextResponse.json(
        { error: 'No IV data on ATM option', ticker: upperTicker },
        { status: 404 },
      );
    }

    // Convert from decimal to percentage
    const currentIV = Math.round(rawIV * 10000) / 100; // e.g. 0.583 → 58.3

    // Store and compute history
    await recordIVSnapshot(upperTicker, currentIV);
    const history = await computeIVHistory(upperTicker, currentIV);

    const response: IVResponse = {
      ticker: upperTicker,
      currentIV,
      ivPercentile: history.ivPercentile,
      iv52wHigh: history.iv52wHigh,
      iv52wLow: history.iv52wLow,
      dataPoints: history.dataPoints,
      buildingHistory: history.buildingHistory,
      expirationUsed: targetExpiration.toISOString(),
    };

    return NextResponse.json(response, {
      headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=300' },
    });
  } catch (e) {
    console.error(`Options IV error for ${upperTicker}:`, e);
    return NextResponse.json(
      { error: 'Failed to fetch options data', ticker: upperTicker },
      { status: 500 },
    );
  }
}
