import type { StockAnalysisProps } from '@/components/holdings/StockAnalysisPanel';

/** Raw quote shape from Yahoo or holding. Adapter accepts partial data. */
export interface QuoteData {
  symbol?: string;
  ticker?: string;
  regularMarketPrice?: number;
  price?: number;
  regularMarketChangePercent?: number;
  dayChangePercent?: number;
  marketCap?: number;
  fiftyTwoWeekLow?: number;
  fiftyTwoWeekHigh?: number;
  averageDailyVolume3Month?: number;
  averageVolume?: number;
  beta?: number;
  shortPercentOfFloat?: number;
  earningsTimestamp?: number;
  nextEarnings?: string;
}

export interface StructuredThesis {
  thesis: {
    bullCase: string[];
    bearCase: string[];
    valuation: string[];
    catalysts: string[];
  };
  oneLinerSummary: string;
  generatedAt: string;
}

export interface CatalystData {
  catalystText: string;
  generatedAt: string;
}

export function formatMarketCap(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value) || value < 0) return '—';
  if (value >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toFixed(0)}`;
}

export function formatVolume(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value) || value < 0) return '—';
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
  return String(Math.round(value));
}

function getPrice(q: QuoteData): number {
  return q.regularMarketPrice ?? q.price ?? 0;
}

function getDayChangePercent(q: QuoteData): number {
  return q.regularMarketChangePercent ?? q.dayChangePercent ?? 0;
}

function getSymbol(q: QuoteData): string {
  return q.symbol ?? q.ticker ?? '';
}

export interface IVData {
  currentIV: number;
  ivPercentile: number | null;
  buildingHistory: boolean;
}

export function buildStockAnalysisProps(
  quote: QuoteData | null,
  thesis: StructuredThesis | null,
  catalyst: CatalystData | null,
  ivData?: IVData | null,
): Omit<StockAnalysisProps, 'loading' | 'onRefresh' | 'metricDeltas'> {
  const q = quote ?? ({} as QuoteData);
  const price = getPrice(q);
  const dayChange = getDayChangePercent(q);
  const sym = getSymbol(q);
  const low = q.fiftyTwoWeekLow;
  const high = q.fiftyTwoWeekHigh;
  const vol = q.averageDailyVolume3Month ?? q.averageVolume;

  const lastAnalysis = thesis?.generatedAt || catalyst?.generatedAt || new Date().toISOString();

  return {
    ticker: sym || '—',
    catalyst: {
      text: catalyst?.catalystText?.trim() || 'Price movement as of last update.',
      priceChange: Number.isFinite(dayChange) ? dayChange : 0,
      timestamp: new Date(catalyst?.generatedAt || lastAnalysis),
    },
    metrics: {
      marketCap: formatMarketCap(q.marketCap),
      fiftyTwoWeekRange: {
        low: Number.isFinite(low) ? (low as number) : 0,
        high: Number.isFinite(high) ? (high as number) : 0,
        current: Number.isFinite(price) ? price : 0,
      },
      avgVolume: formatVolume(vol),
      beta: Number.isFinite(q.beta) ? (q.beta as number) : NaN,
      shortInterest: Number.isFinite(q.shortPercentOfFloat) ? (q.shortPercentOfFloat as number) : NaN,
      nextEarnings: typeof q.nextEarnings === 'string' ? q.nextEarnings : '—',
      ivPercentile: ivData?.ivPercentile ?? null,
      currentIV: ivData?.currentIV ?? null,
    },
    thesis: thesis?.thesis ?? { bullCase: [], bearCase: [], valuation: [], catalysts: [] },
    thesisStatus: thesis?.thesis && Object.values(thesis.thesis).some(arr => arr.length > 0) ? 'ready' : 'empty',
    lastAnalysisUpdate: new Date(lastAnalysis),
  };
}
