import { getHistoricalData } from './yahoo-finance';
import type { SMAData, SMAResult, SMAPeriod } from '@/types/sma';

// Re-export types for convenience (server-side imports)
export type { SMAData, SMAResult, SMAPeriod };
export { SMA_PERIODS } from '@/types/sma';

/**
 * Calculate Simple Moving Average deviation for a list of tickers.
 * Server-side only - do NOT import this file from client components.
 * @param tickers - Array of ticker symbols
 * @param period - SMA period (20, 50, 100, or 200 days)
 * @returns Array of SMA data sorted by deviation (most negative first)
 */
export async function getSMAForTickers(
  tickers: string[],
  period: SMAPeriod = 50
): Promise<SMAResult> {
  // Need enough historical data to calculate SMA
  // Fetch 1 year of data to ensure we have enough trading days
  const results: SMAData[] = [];
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);

  await Promise.all(
    tickers.map(async (ticker) => {
      try {
        const historical = await getHistoricalData(ticker, startDate);

        if (!historical || historical.length < period) {
          // Not enough data for SMA calculation
          return;
        }

        // Get the last N closing prices for SMA calculation
        const closingPrices = historical
          .slice(-period)
          .map((d: { close: number }) => d.close);

        const sma = closingPrices.reduce((a: number, b: number) => a + b, 0) / period;
        const currentPrice = historical[historical.length - 1].close;
        const deviation = ((currentPrice - sma) / sma) * 100;

        results.push({
          ticker,
          name: ticker, // Will be enriched by API
          currentPrice,
          sma,
          deviation,
        });
      } catch {
        // Skip tickers that fail
      }
    })
  );

  // Sort by deviation (most negative first = biggest dips)
  results.sort((a, b) => a.deviation - b.deviation);

  return {
    data: results,
    period,
    calculatedAt: new Date().toISOString(),
  };
}
