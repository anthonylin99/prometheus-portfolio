import { getQuotes } from './yahoo-finance';
import { getCategoryColor } from '@/types/portfolio';

export interface VirtualPortfolioStock {
  ticker: string;
  name: string;
  weight: number;
  currentPrice: number;
  dayChange: number;
  dayChangePercent: number;
}

export interface VirtualPortfolioAnalytics {
  stocks: VirtualPortfolioStock[];
  totalValue: number; // Based on equal-weighted $10,000 investment
  dayChange: number;
  dayChangePercent: number;
  topGainer: { ticker: string; percent: number } | null;
  topLoser: { ticker: string; percent: number } | null;
  avgDayChange: number;
  stocksUp: number;
  stocksDown: number;
  color: string;
}

/**
 * Calculate analytics for a virtual equal-weighted portfolio from a list of tickers.
 * Assumes equal weighting across all positions.
 */
export async function getVirtualPortfolioAnalytics(
  tickers: string[],
  categoryName: string,
  initialValue = 10000
): Promise<VirtualPortfolioAnalytics> {
  if (tickers.length === 0) {
    return {
      stocks: [],
      totalValue: 0,
      dayChange: 0,
      dayChangePercent: 0,
      topGainer: null,
      topLoser: null,
      avgDayChange: 0,
      stocksUp: 0,
      stocksDown: 0,
      color: getCategoryColor(categoryName),
    };
  }

  // Fetch current quotes
  const quotes = await getQuotes(tickers);

  // Equal weight per position
  const weightPerStock = 100 / tickers.length;
  const valuePerStock = initialValue / tickers.length;

  const stocks: VirtualPortfolioStock[] = [];
  let totalDayChange = 0;
  let stocksUp = 0;
  let stocksDown = 0;
  let topGainer: { ticker: string; percent: number } | null = null;
  let topLoser: { ticker: string; percent: number } | null = null;

  for (const ticker of tickers) {
    const quote = quotes[ticker];
    if (!quote) continue;

    const dayChangePercent = quote.changePercent || 0;
    const dayChange = (valuePerStock * dayChangePercent) / 100;

    stocks.push({
      ticker,
      name: ticker,
      weight: weightPerStock,
      currentPrice: quote.price,
      dayChange,
      dayChangePercent,
    });

    totalDayChange += dayChange;

    if (dayChangePercent >= 0) {
      stocksUp++;
    } else {
      stocksDown++;
    }

    // Track top gainer/loser
    if (!topGainer || dayChangePercent > topGainer.percent) {
      topGainer = { ticker, percent: dayChangePercent };
    }
    if (!topLoser || dayChangePercent < topLoser.percent) {
      topLoser = { ticker, percent: dayChangePercent };
    }
  }

  const validStocks = stocks.length;
  const totalValue = initialValue + totalDayChange;
  const dayChangePercent = (totalDayChange / initialValue) * 100;
  const avgDayChange = validStocks > 0 ? dayChangePercent / validStocks : 0;

  // Sort stocks by day change percent (best first)
  stocks.sort((a, b) => b.dayChangePercent - a.dayChangePercent);

  return {
    stocks,
    totalValue,
    dayChange: totalDayChange,
    dayChangePercent,
    topGainer,
    topLoser,
    avgDayChange,
    stocksUp,
    stocksDown,
    color: getCategoryColor(categoryName),
  };
}
