import { getRequiredRedis } from './redis';
import { getCircleMembers } from './circle-service';
import { getUserPortfolio } from './user-portfolio-service';
import { getQuotes, getHistoricalData } from './yahoo-finance';

export interface RankedMember {
  userId: string;
  name: string;
  etfTicker: string;
  avatarColor: string;
  periodReturn: number;
  rank: number;
  holdingsCount: number;
}

type LeaderboardRange = '1W' | '1M' | 'YTD';

function getStartDate(range: LeaderboardRange): Date {
  const now = new Date();
  switch (range) {
    case '1W':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '1M':
      return new Date(new Date().setMonth(now.getMonth() - 1));
    case 'YTD':
      return new Date(now.getFullYear(), 0, 1);
  }
}

async function calculateUserReturn(
  userId: string,
  range: LeaderboardRange
): Promise<{ periodReturn: number; holdingsCount: number }> {
  const portfolio = await getUserPortfolio(userId);
  if (portfolio.holdings.length === 0) {
    return { periodReturn: 0, holdingsCount: 0 };
  }

  const tickers = portfolio.holdings.map((h) => h.ticker);
  const startDate = getStartDate(range);
  const endDate = new Date();

  // Get current quotes
  const quotes = await getQuotes(tickers);

  // Get historical prices at period start
  const historicalPromises = tickers.map(async (ticker) => {
    const data = await getHistoricalData(ticker, startDate, endDate);
    return { ticker, data };
  });

  const historicalResults = await Promise.all(historicalPromises);

  let currentValue = 0;
  let startValue = 0;

  for (const holding of portfolio.holdings) {
    const currentPrice = quotes[holding.ticker]?.price || 0;
    currentValue += currentPrice * holding.shares;

    const historical = historicalResults.find(
      (r) => r.ticker === holding.ticker
    );
    if (historical && historical.data.length > 0) {
      // Use the first available price in the range as start price
      startValue += historical.data[0].close * holding.shares;
    } else {
      // Fallback: use current price (0% return for this holding)
      startValue += currentPrice * holding.shares;
    }
  }

  const periodReturn =
    startValue > 0 ? ((currentValue - startValue) / startValue) * 100 : 0;

  return { periodReturn, holdingsCount: portfolio.holdings.length };
}

export async function calculateLeaderboard(
  circleId: string,
  range: LeaderboardRange
): Promise<RankedMember[]> {
  const redis = getRequiredRedis();

  // Check cache first (15-minute TTL)
  const cacheKey = `app:leaderboard:${circleId}:${range}`;
  const cached = await redis.get<RankedMember[]>(cacheKey);
  if (cached) return cached;

  const members = await getCircleMembers(circleId);
  if (members.length === 0) return [];

  const rankings: RankedMember[] = await Promise.all(
    members.map(async (member) => {
      const { periodReturn, holdingsCount } = await calculateUserReturn(
        member.id,
        range
      );
      return {
        userId: member.id,
        name: member.name || member.email.split('@')[0],
        etfTicker: member.etfTicker,
        avatarColor: member.avatarColor,
        periodReturn,
        rank: 0, // Will be set after sorting
        holdingsCount,
      };
    })
  );

  // Sort by return descending
  rankings.sort((a, b) => b.periodReturn - a.periodReturn);
  rankings.forEach((r, i) => {
    r.rank = i + 1;
  });

  // Cache for 15 minutes
  await redis.set(cacheKey, rankings, { ex: 900 });

  return rankings;
}
