import { getRequiredRedis } from './redis';
import { getQuotes } from './yahoo-finance';
import {
  HoldingWithPrice,
  PortfolioSummary,
  CategoryData,
  Category,
  getCategoryColor,
} from '@/types/portfolio';

export interface UserHolding {
  ticker: string;
  name: string;
  shares: number;
  costBasis?: number;
  category: Category;
  description: string;
  exchange?: string;
  logoDomain?: string;
  addedAt: string;
  notes?: string;
}

export interface UserPortfolio {
  holdings: UserHolding[];
  updatedAt: string;
}

export async function getUserPortfolio(userId: string): Promise<UserPortfolio> {
  const redis = getRequiredRedis();
  const data = await redis.get<UserPortfolio>(`app:portfolio:${userId}`);
  return data || { holdings: [], updatedAt: new Date().toISOString() };
}

export async function setUserPortfolio(
  userId: string,
  portfolio: UserPortfolio
): Promise<void> {
  const redis = getRequiredRedis();
  await redis.set(`app:portfolio:${userId}`, {
    ...portfolio,
    updatedAt: new Date().toISOString(),
  });
}

export async function addUserHolding(
  userId: string,
  holding: UserHolding
): Promise<void> {
  const portfolio = await getUserPortfolio(userId);
  const existingIndex = portfolio.holdings.findIndex(
    (h) => h.ticker === holding.ticker
  );

  if (existingIndex >= 0) {
    // Update existing holding (add shares)
    portfolio.holdings[existingIndex] = {
      ...portfolio.holdings[existingIndex],
      shares: portfolio.holdings[existingIndex].shares + holding.shares,
    };
  } else {
    portfolio.holdings.push(holding);
  }

  await setUserPortfolio(userId, portfolio);
}

export async function removeUserHolding(
  userId: string,
  ticker: string
): Promise<void> {
  const portfolio = await getUserPortfolio(userId);
  const normalizedTicker = ticker.toUpperCase().trim();
  portfolio.holdings = portfolio.holdings.filter(
    (h) => h.ticker.toUpperCase() !== normalizedTicker
  );
  await setUserPortfolio(userId, portfolio);
}

export async function updateUserHolding(
  userId: string,
  ticker: string,
  updates: Partial<UserHolding>
): Promise<void> {
  const portfolio = await getUserPortfolio(userId);
  const normalizedTicker = ticker.toUpperCase().trim();
  const index = portfolio.holdings.findIndex(
    (h) => h.ticker.toUpperCase() === normalizedTicker
  );
  if (index < 0) {
    throw new Error(`Holding ${ticker} not found`);
  }
  portfolio.holdings[index] = { ...portfolio.holdings[index], ...updates };
  await setUserPortfolio(userId, portfolio);
}

// Enrich holdings with live prices — reuses logic from portfolio-service.ts
export async function getUserPortfolioWithPrices(userId: string): Promise<{
  holdings: HoldingWithPrice[];
  summary: PortfolioSummary;
  categories: CategoryData[];
}> {
  const portfolio = await getUserPortfolio(userId);
  const tickers = portfolio.holdings.map((h) => h.ticker);

  if (tickers.length === 0) {
    return {
      holdings: [],
      summary: {
        totalValue: 0,
        previousValue: 0,
        dayChange: 0,
        dayChangePercent: 0,
        holdingsCount: 0,
        categoriesCount: 0,
        lastUpdated: new Date().toISOString(),
      },
      categories: [],
    };
  }

  const quotes = await getQuotes(tickers);

  const holdingsWithPrices: HoldingWithPrice[] = portfolio.holdings.map(
    (holding) => {
      const quote = quotes[holding.ticker];
      const currentPrice = quote?.price && Number.isFinite(quote.price) ? quote.price : 0;
      const previousClose = (quote?.previousClose && Number.isFinite(quote.previousClose)) ? quote.previousClose : currentPrice;

      const value = currentPrice * holding.shares;
      const previousValue = previousClose * holding.shares;
      const dayChange = value - previousValue;
      const dayChangePercent =
        previousValue > 0 && Number.isFinite(previousValue) ? (dayChange / previousValue) * 100 : 0;

      return {
        ticker: holding.ticker,
        name: holding.name,
        shares: holding.shares,
        category: holding.category,
        description: holding.description,
        exchange: holding.exchange,
        logoDomain: holding.logoDomain,
        currentPrice,
        previousClose,
        value,
        dayChange,
        dayChangePercent,
        weight: 0,
      };
    }
  );

  const totalValue = holdingsWithPrices.reduce((sum, h) => sum + h.value, 0);
  const previousTotalValue = holdingsWithPrices.reduce(
    (sum, h) => sum + h.previousClose * h.shares,
    0
  );

  holdingsWithPrices.forEach((h) => {
    h.weight = totalValue > 0 ? (h.value / totalValue) * 100 : 0;
  });

  holdingsWithPrices.sort((a, b) => b.value - a.value);

  // Calculate category data
  const categoryMap = new Map<
    string,
    { value: number; holdings: HoldingWithPrice[] }
  >();
  holdingsWithPrices.forEach((h) => {
    const existing = categoryMap.get(h.category) || {
      value: 0,
      holdings: [],
    };
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

  const dayChange = totalValue - previousTotalValue;
  const dayChangePercent =
    previousTotalValue > 0 ? (dayChange / previousTotalValue) * 100 : 0;

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
