import YahooFinance from 'yahoo-finance2';
import type { YahooQuote } from '@/lib/adapters/metricsAdapter';

// Create yahoo-finance instance (required for v3+)
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

// Ticker mapping for international/OTC stocks
// Note: GLXY moved from TSX to NASDAQ (May 2025), FIGR IPO'd on NASDAQ (Sept 2025)
// Both now trade directly without special mapping
const tickerMap: Record<string, string> = {
  'MTPLF': 'MTPLF',       // Metaplanet OTC
  'KRKNF': 'KRKNF',       // Kraken Robotics OTC
};

export function getYahooTicker(ticker: string): string {
  return tickerMap[ticker] || ticker;
}

export interface QuoteData {
  ticker: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  marketState: string;
  lastUpdated: string;
}

export async function getQuote(ticker: string): Promise<QuoteData | null> {
  try {
    const yahooTicker = getYahooTicker(ticker);
    const quote = await yahooFinance.quote(yahooTicker);
    
    if (!quote || !quote.regularMarketPrice) {
      console.error(`No quote data for ${ticker}`);
      return null;
    }

    return {
      ticker,
      price: quote.regularMarketPrice,
      previousClose: quote.regularMarketPreviousClose || quote.regularMarketPrice,
      change: quote.regularMarketChange || 0,
      changePercent: quote.regularMarketChangePercent || 0,
      marketState: quote.marketState || 'CLOSED',
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error fetching quote for ${ticker}:`, error);
    return null;
  }
}

/** Quote plus volume for catalyst/analytics. Volume and averageVolume can be undefined if not available. */
export async function getQuoteWithVolume(ticker: string): Promise<{
  price: number;
  changePercent: number;
  volume?: number;
  averageVolume?: number;
} | null> {
  try {
    const yahooTicker = getYahooTicker(ticker);
    const quote = await yahooFinance.quote(yahooTicker);
    if (!quote || quote.regularMarketPrice == null) return null;
    const q = quote as { regularMarketVolume?: number; averageDailyVolume3Month?: number; averageDailyVolume10Day?: number };
    return {
      price: quote.regularMarketPrice,
      changePercent: quote.regularMarketChangePercent ?? 0,
      volume: q.regularMarketVolume,
      averageVolume: q.averageDailyVolume3Month ?? q.averageDailyVolume10Day,
    };
  } catch {
    return null;
  }
}

export async function getQuotes(tickers: string[]): Promise<Record<string, QuoteData>> {
  const results: Record<string, QuoteData> = {};
  
  // Fetch quotes in parallel
  const promises = tickers.map(async (ticker) => {
    const quote = await getQuote(ticker);
    if (quote) {
      results[ticker] = quote;
    }
  });
  
  await Promise.all(promises);
  return results;
}

export interface HistoricalData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose: number;
}

export async function getHistoricalData(
  ticker: string,
  startDate: Date,
  endDate: Date = new Date(),
  interval: '1d' | '1wk' | '1mo' = '1d'
): Promise<HistoricalData[]> {
  try {
    const yahooTicker = getYahooTicker(ticker);
    const result = await yahooFinance.chart(yahooTicker, {
      period1: startDate,
      period2: endDate,
      interval,
    });

    if (!result || !result.quotes) {
      return [];
    }

    return result.quotes.map((q) => ({
      date: new Date(q.date),
      open: q.open || 0,
      high: q.high || 0,
      low: q.low || 0,
      close: q.close || 0,
      volume: q.volume || 0,
      adjClose: q.adjclose || q.close || 0,
    })).filter(q => q.close > 0);
  } catch (error) {
    console.error(`Error fetching historical data for ${ticker}:`, error);
    return [];
  }
}

/**
 * Fetches quote + quoteSummary (defaultKeyStatistics, calendarEvents) and merges
 * into a YahooQuote for buildMetricsFromQuote. Use when you need marketCap, 52W,
 * volume, beta, shortPercentOfFloat, and next earnings.
 */
export async function getQuoteForMetrics(ticker: string): Promise<YahooQuote | null> {
  try {
    const yahooTicker = getYahooTicker(ticker);
    const [quote, summary] = await Promise.all([
      yahooFinance.quote(yahooTicker),
      (yahooFinance as { quoteSummary(s: string, o: { modules: string[] }): Promise<Record<string, unknown>> })
        .quoteSummary(yahooTicker, { modules: ['defaultKeyStatistics', 'calendarEvents'] })
        .catch(() => null),
    ]);

    if (!quote) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dk = (summary as any)?.defaultKeyStatistics;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cal = (summary as any)?.calendarEvents;
    const earningsDate = cal?.earnings?.earningsDate?.[0];

    const out: YahooQuote = {
      marketCap: quote.marketCap,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
      regularMarketPrice: quote.regularMarketPrice,
      averageDailyVolume3Month: quote.averageDailyVolume3Month,
      beta: quote.beta ?? dk?.beta,
      shortPercentOfFloat: dk?.shortPercentOfFloat ?? quote.shortPercentOfFloat,
      earningsTimestamp: quote.earningsTimestamp ?? (earningsDate ? new Date(earningsDate) : undefined),
    };
    return out;
  } catch (error) {
    console.error(`Error fetching quote for metrics (${ticker}):`, error);
    return null;
  }
}

// Check if US market is open (9:30 AM - 4:00 PM ET, Mon-Fri)
export function isMarketOpen(): boolean {
  const now = new Date();
  const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const day = et.getDay();
  const hour = et.getHours();
  const minute = et.getMinutes();
  
  // Weekend
  if (day === 0 || day === 6) return false;
  
  // Before 9:30 AM or after 4:00 PM
  const timeInMinutes = hour * 60 + minute;
  if (timeInMinutes < 9 * 60 + 30 || timeInMinutes >= 16 * 60) return false;
  
  return true;
}

// Check if we should refresh prices (every hour during market hours)
export function shouldRefreshPrices(lastFetch: string | null): boolean {
  if (!lastFetch) return true;
  
  const lastFetchTime = new Date(lastFetch);
  const now = new Date();
  const hoursSinceLastFetch = (now.getTime() - lastFetchTime.getTime()) / (1000 * 60 * 60);
  
  // Always refresh if more than 1 hour since last fetch
  if (hoursSinceLastFetch >= 1) {
    return isMarketOpen();
  }
  
  return false;
}
