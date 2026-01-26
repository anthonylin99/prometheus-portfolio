import { getQuotes, getHistoricalData, HistoricalData } from './yahoo-finance';
import portfolioData from '@/data/portfolio.json';
import { 
  Holding, 
  HoldingWithPrice, 
  CategoryData, 
  PortfolioSummary, 
  ETFData,
  HistoricalDataPoint,
  getCategoryColor,
  TimeRange
} from '@/types/portfolio';

const holdings = portfolioData.holdings as Holding[];
const etfConfig = portfolioData.etf;

// Get all tickers that need price fetching
export function getTradableTickers(): string[] {
  return holdings.map(h => h.ticker);
}

// Calculate portfolio with live prices
export async function getPortfolioWithPrices(): Promise<{
  holdings: HoldingWithPrice[];
  summary: PortfolioSummary;
  categories: CategoryData[];
}> {
  const tickers = getTradableTickers();
  const quotes = await getQuotes(tickers);
  
  // Calculate holdings with prices
  const holdingsWithPrices: HoldingWithPrice[] = holdings.map(holding => {
    const quote = quotes[holding.ticker];
    const currentPrice = quote?.price || 0;
    const previousClose = quote?.previousClose || currentPrice;
    
    const value = currentPrice * holding.shares;
    const previousValue = previousClose * holding.shares;
    const dayChange = value - previousValue;
    const dayChangePercent = previousValue > 0 ? (dayChange / previousValue) * 100 : 0;
    
    return {
      ...holding,
      currentPrice,
      previousClose,
      value,
      dayChange,
      dayChangePercent,
      weight: 0, // Will be calculated after total is known
    };
  });
  
  // Calculate total and weights
  const totalValue = holdingsWithPrices.reduce((sum, h) => sum + h.value, 0);
  const previousTotalValue = holdingsWithPrices.reduce((sum, h) => sum + (h.previousClose * h.shares), 0);
  
  holdingsWithPrices.forEach(h => {
    h.weight = totalValue > 0 ? (h.value / totalValue) * 100 : 0;
  });
  
  // Sort by value descending
  holdingsWithPrices.sort((a, b) => b.value - a.value);
  
  // Calculate category data
  const categoryMap = new Map<string, { value: number; holdings: HoldingWithPrice[] }>();
  holdingsWithPrices.forEach(h => {
    const existing = categoryMap.get(h.category) || { value: 0, holdings: [] };
    existing.value += h.value;
    existing.holdings.push(h);
    categoryMap.set(h.category, existing);
  });
  
  const categories: CategoryData[] = Array.from(categoryMap.entries())
    .map(([name, data]) => ({
      name: name as CategoryData['name'],
      value: data.value,
      percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
      color: getCategoryColor(name),
      holdings: data.holdings.sort((a, b) => b.value - a.value),
    }))
    .sort((a, b) => b.value - a.value);
  
  // Summary
  const dayChange = totalValue - previousTotalValue;
  const dayChangePercent = previousTotalValue > 0 ? (dayChange / previousTotalValue) * 100 : 0;
  
  const summary: PortfolioSummary = {
    totalValue,
    previousValue: previousTotalValue,
    dayChange,
    dayChangePercent,
    holdingsCount: holdingsWithPrices.length,
    categoriesCount: categories.length,
    lastUpdated: new Date().toISOString(),
  };
  
  return { holdings: holdingsWithPrices, summary, categories };
}

// Calculate $ALIN ETF price based on portfolio performance
export async function getETFData(): Promise<ETFData> {
  const { summary } = await getPortfolioWithPrices();
  
  // For a fresh start, the ETF price is simply $100
  // Day change comes from the portfolio's day change percentage applied to $100
  const currentPrice = etfConfig.inceptionPrice * (1 + summary.dayChangePercent / 100);
  const dayChange = currentPrice - etfConfig.inceptionPrice;
  const dayChangePercent = summary.dayChangePercent;
  
  // Total return is the same as day change since we just started
  const totalReturn = dayChange;
  const totalReturnPercent = dayChangePercent;
  
  return {
    ticker: etfConfig.ticker,
    name: etfConfig.name,
    inceptionDate: etfConfig.inceptionDate,
    inceptionPrice: etfConfig.inceptionPrice,
    currentPrice,
    dayChange,
    dayChangePercent,
    totalReturn,
    totalReturnPercent,
  };
}

// Calculate historical ETF prices based on weighted portfolio returns
export async function calculateHistoricalETFPrices(
  startDate: Date,
  endDate: Date = new Date()
): Promise<HistoricalDataPoint[]> {
  const tickers = getTradableTickers();
  const inceptionDate = new Date(etfConfig.inceptionDate);
  
  // If start date is before inception, use inception date
  const effectiveStartDate = startDate < inceptionDate ? inceptionDate : startDate;
  
  // Fetch historical data for all stocks
  const historicalDataMap: Record<string, HistoricalData[]> = {};
  
  await Promise.all(
    tickers.map(async (ticker) => {
      const data = await getHistoricalData(ticker, effectiveStartDate, endDate);
      if (data.length > 0) {
        historicalDataMap[ticker] = data;
      }
    })
  );
  
  // Find common dates across all stocks (only on or after inception)
  const allDates = new Set<string>();
  const inceptionDateStr = inceptionDate.toISOString().split('T')[0];
  
  Object.values(historicalDataMap).forEach(data => {
    data.forEach(d => {
      const dateStr = d.date.toISOString().split('T')[0];
      if (dateStr >= inceptionDateStr) {
        allDates.add(dateStr);
      }
    });
  });
  
  const sortedDates = Array.from(allDates).sort();
  
  if (sortedDates.length === 0) {
    // No data yet - return single point at inception price
    const today = new Date().toISOString().split('T')[0];
    return [{
      date: today,
      time: Date.now() / 1000,
      open: etfConfig.inceptionPrice,
      high: etfConfig.inceptionPrice,
      low: etfConfig.inceptionPrice,
      close: etfConfig.inceptionPrice,
      value: 0,
    }];
  }
  
  // Calculate portfolio value for each date
  const etfPrices: HistoricalDataPoint[] = [];
  let baselineValue: number | null = null;
  
  for (const dateStr of sortedDates) {
    let portfolioValue = 0;
    let validStocks = 0;
    
    holdings.forEach(holding => {
      const stockData = historicalDataMap[holding.ticker];
      if (stockData) {
        const dayData = stockData.find(d => d.date.toISOString().split('T')[0] === dateStr);
        if (dayData) {
          portfolioValue += dayData.close * holding.shares;
          validStocks++;
        }
      }
    });
    
    // Only include if we have data for most stocks
    if (validStocks >= holdings.length * 0.7) {
      if (baselineValue === null) {
        baselineValue = portfolioValue;
      }
      
      // Calculate ETF price based on portfolio performance since inception
      // The first day (inception) is always $100
      const etfPrice = baselineValue > 0 
        ? etfConfig.inceptionPrice * (portfolioValue / baselineValue)
        : etfConfig.inceptionPrice;
      
      etfPrices.push({
        date: dateStr,
        time: new Date(dateStr).getTime() / 1000,
        open: etfPrice,
        high: etfPrice,
        low: etfPrice,
        close: etfPrice,
        value: portfolioValue,
      });
    }
  }
  
  return etfPrices;
}

// Get date range for time filter
export function getDateRangeForFilter(range: TimeRange): Date {
  const now = new Date();
  const inceptionDate = new Date(etfConfig.inceptionDate);
  
  let startDate: Date;
  
  switch (range) {
    case '1D':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '5D':
      startDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
      break;
    case '1M':
      startDate = new Date(new Date().setMonth(new Date().getMonth() - 1));
      break;
    case '3M':
      startDate = new Date(new Date().setMonth(new Date().getMonth() - 3));
      break;
    case '6M':
      startDate = new Date(new Date().setMonth(new Date().getMonth() - 6));
      break;
    case 'YTD':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case '1Y':
      startDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
      break;
    case 'ALL':
    default:
      return inceptionDate;
  }
  
  // If the calculated start date is before inception, use inception date
  return startDate < inceptionDate ? inceptionDate : startDate;
}
