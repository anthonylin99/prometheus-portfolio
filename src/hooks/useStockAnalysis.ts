'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  buildStockAnalysisProps,
  formatMarketCap,
  type QuoteData,
  type StructuredThesis,
  type CatalystData,
  type IVData,
} from '@/lib/adapters/stockAnalysisAdapter';
import type { StockAnalysisProps, MetricHistorical } from '@/components/holdings/StockAnalysisPanel';

export interface HoldingQuote {
  ticker: string;
  name: string;
  currentPrice: number;
  dayChangePercent: number;
}

interface QuoteApiResponse {
  ticker: string;
  price: number;
  dayChangePercent: number;
  marketCap?: number;
  fiftyTwoWeekLow?: number;
  fiftyTwoWeekHigh?: number;
  averageVolume?: number;
  beta?: number;
  shortPercentOfFloat?: number;
  nextEarnings?: string;
}

interface StructuredThesisResponse {
  thesis: StructuredThesis['thesis'];
  oneLinerSummary: string;
  generatedAt: string;
}

interface CatalystApiResponse {
  catalystText: string;
  generatedAt: string;
}

interface NewsArticle {
  headline: string;
  source: string;
  datetime?: number;
}

interface NewsApiResponse {
  articles?: NewsArticle[];
}

interface MetricHistoricalData {
  current: number;
  percentile: number | null;
  high52w: number | null;
  low52w: number | null;
  dataPoints: number;
  buildingHistory: boolean;
}

interface HistoricalMetricsApiResponse {
  ticker: string;
  metrics: {
    marketCap: MetricHistoricalData | null;
    shortInterest: MetricHistoricalData | null;
    beta: MetricHistoricalData | null;
    avgVolume: MetricHistoricalData | null;
  };
  snapshotRecorded: boolean;
}

interface IVApiResponse {
  ticker: string;
  currentIV: number;
  ivPercentile: number | null;
  iv52wHigh: number | null;
  iv52wLow: number | null;
  dataPoints: number;
  buildingHistory: boolean;
  expirationUsed: string;
}

export function useStockAnalysis(
  ticker: string,
  holding: HoldingQuote | null
): {
  analysisProps: Omit<StockAnalysisProps, 'loading' | 'onRefresh' | 'metricDeltas' | 'historicalMetrics'>;
  historicalMetrics: Partial<Record<string, MetricHistorical>> | undefined;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refetch: () => void;
} {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [thesis, setThesis] = useState<StructuredThesis | null>(null);
  const [catalyst, setCatalyst] = useState<CatalystData | null>(null);
  const [historicalRaw, setHistoricalRaw] = useState<HistoricalMetricsApiResponse['metrics'] | null>(null);
  const [ivRaw, setIvRaw] = useState<IVApiResponse | null>(null);

  const companyName = holding?.name ?? ticker;
  const priceFallback = holding?.currentPrice ?? 0;
  const dayChangeFallback = holding?.dayChangePercent ?? 0;

  const run = useCallback(
    async (forceRegenerate = false) => {
      if (!ticker) {
        setQuote(null);
        setThesis(null);
        setCatalyst(null);
        setHistoricalRaw(null);
        setIvRaw(null);
        setLoading(false);
        setRefreshing(false);
        return;
      }
      const isRefetch = forceRegenerate;
      if (isRefetch) setRefreshing(true);
      else setLoading(true);
      setError(null);

      let quoteData: QuoteData = {
        ticker,
        price: priceFallback,
        dayChangePercent: dayChangeFallback,
      };
      let thesisData: StructuredThesis | null = null;
      let catalystData: CatalystData | null = null;

      try {
        const [quoteRes, newsRes, metricsHistRes, ivRes] = await Promise.all([
          fetch(`/api/quote/${encodeURIComponent(ticker)}`).then((r) =>
            r.ok ? (r.json() as Promise<QuoteApiResponse>) : null
          ),
          fetch(`/api/news/${encodeURIComponent(ticker)}`).then((r) =>
            r.ok ? (r.json() as Promise<NewsApiResponse>) : { articles: [] }
          ),
          fetch(`/api/metrics/historical/${encodeURIComponent(ticker)}`).then((r) =>
            r.ok ? (r.json() as Promise<HistoricalMetricsApiResponse>) : null
          ),
          fetch(`/api/options/iv/${encodeURIComponent(ticker)}`).then((r) =>
            r.ok ? (r.json() as Promise<IVApiResponse>) : null
          ),
        ]);

        if (quoteRes) {
          quoteData = {
            ticker: quoteRes.ticker,
            price: quoteRes.price ?? priceFallback,
            dayChangePercent: quoteRes.dayChangePercent ?? dayChangeFallback,
            marketCap: quoteRes.marketCap,
            fiftyTwoWeekLow: quoteRes.fiftyTwoWeekLow,
            fiftyTwoWeekHigh: quoteRes.fiftyTwoWeekHigh,
            averageVolume: quoteRes.averageVolume,
            beta: quoteRes.beta,
            shortPercentOfFloat: quoteRes.shortPercentOfFloat,
            nextEarnings: quoteRes.nextEarnings,
          };
        }

        if (metricsHistRes) {
          setHistoricalRaw(metricsHistRes.metrics);
        }

        if (ivRes) {
          setIvRaw(ivRes);
        }

        const recentNews = (newsRes?.articles ?? [])
          .slice(0, 8)
          .map((a) => ({
            headline: a.headline || '',
            source: a.source || 'Unknown',
            publishedAt: new Date((a.datetime ?? 0) * 1000).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
          }));

        const [thesisRes, catalystRes] = await Promise.all([
          fetch('/api/ai/generate-structured-thesis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ticker,
              companyName,
              currentPrice: quoteData.price,
              marketCap:
                quoteData.marketCap != null ? formatMarketCap(quoteData.marketCap) : undefined,
              dayChange: quoteData.dayChangePercent,
              forceRegenerate,
            }),
            cache: 'no-store',
          }).then(async (r) => {
            if (r.ok) return r.json() as Promise<StructuredThesisResponse>;
            const errData = await r.json().catch(() => null);
            const msg = errData?.error || `Structured thesis failed (${r.status})`;
            setError(msg);
            return null;
          }),
          fetch('/api/ai/generate-catalyst', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ticker,
              priceChange: quoteData.dayChangePercent,
              recentNews,
              forceRegenerate,
            }),
            cache: 'no-store',
          }).then((r) => (r.ok ? (r.json() as Promise<CatalystApiResponse>) : null)),
        ]);

        if (thesisRes) {
          thesisData = {
            thesis: thesisRes.thesis,
            oneLinerSummary: thesisRes.oneLinerSummary,
            generatedAt: thesisRes.generatedAt,
          };
        }

        if (catalystRes) {
          catalystData = { catalystText: catalystRes.catalystText, generatedAt: catalystRes.generatedAt };
        } else {
          catalystData = {
            catalystText: 'Price movement as of last update.',
            generatedAt: new Date().toISOString(),
          };
        }
      } catch (e) {
        console.error('useStockAnalysis error:', e);
        setError(e instanceof Error ? e.message : 'Failed to load analysis');
      } finally {
        setQuote(quoteData);
        setThesis(thesisData);
        setCatalyst(catalystData);
        setLoading(false);
        setRefreshing(false);
      }
    },
    [ticker, companyName, priceFallback, dayChangeFallback]
  );

  useEffect(() => {
    run(false);
  }, [run]);

  const refetch = useCallback(() => run(true), [run]);

  const fallbackQuote: QuoteData = {
    ticker,
    price: priceFallback,
    dayChangePercent: dayChangeFallback,
  };
  const ivData: IVData | null = ivRaw
    ? { currentIV: ivRaw.currentIV, ivPercentile: ivRaw.ivPercentile, buildingHistory: ivRaw.buildingHistory }
    : null;

  const analysisProps: Omit<StockAnalysisProps, 'loading' | 'onRefresh' | 'metricDeltas' | 'historicalMetrics'> =
    buildStockAnalysisProps(quote ?? fallbackQuote, thesis, catalyst, ivData);

  // Transform raw API response → MetricHistorical prop shape
  const historicalMetrics: Partial<Record<string, MetricHistorical>> | undefined =
    historicalRaw
      ? Object.fromEntries(
          Object.entries(historicalRaw)
            .filter(([, v]) => v != null)
            .map(([k, v]) => [
              k,
              {
                percentile: v!.percentile,
                high52w: v!.high52w,
                low52w: v!.low52w,
                buildingHistory: v!.buildingHistory,
              },
            ]),
        )
      : undefined;

  return { analysisProps, historicalMetrics, loading, refreshing, error, refetch };
}
