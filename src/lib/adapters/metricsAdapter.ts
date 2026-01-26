import type { StockAnalysisProps } from '@/components/holdings/StockAnalysisPanel';

/**
 * Shape expected from Yahoo quote + quoteSummary (defaultKeyStatistics, calendarEvents).
 * quote() provides most fields; quoteSummary adds shortPercentOfFloat and can
 * supplement earningsTimestamp from calendarEvents.
 */
export interface YahooQuote {
  marketCap?: number;
  fiftyTwoWeekLow?: number;
  fiftyTwoWeekHigh?: number;
  regularMarketPrice?: number;
  averageDailyVolume3Month?: number;
  beta?: number;
  shortPercentOfFloat?: number;
  /** Date from quote, or Unix seconds; calendarEvents.earnings.earningsDate[0] as Date also works */
  earningsTimestamp?: Date | number;
}

function formatMarketCap(n: number | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—';
  if (n >= 1e12) return `$${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n}`;
}

function formatVolume(n: number | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—';
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toLocaleString();
}

export function buildMetricsFromQuote(quote: YahooQuote): StockAnalysisProps['metrics'] {
  const ts = quote.earningsTimestamp;
  const nextEarnings =
    ts == null
      ? 'TBD'
      : new Date(ts instanceof Date ? ts.getTime() : ts * 1000).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });

  const low = quote.fiftyTwoWeekLow ?? 0;
  const high = quote.fiftyTwoWeekHigh ?? 0;
  const current = quote.regularMarketPrice ?? 0;

  return {
    marketCap: formatMarketCap(quote.marketCap),
    fiftyTwoWeekRange: { low, high, current },
    avgVolume: formatVolume(quote.averageDailyVolume3Month),
    beta: quote.beta ?? 1.0,
    shortInterest: quote.shortPercentOfFloat ?? 0,
    nextEarnings,
  };
}
