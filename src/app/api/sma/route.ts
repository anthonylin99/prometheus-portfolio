import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSMAForTickers, SMAPeriod, SMA_PERIODS } from '@/lib/sma-service';
import { getAppUser } from '@/lib/user-service';
import { getUserPortfolio } from '@/lib/user-portfolio-service';
import { getWatchlist } from '@/lib/watchlist-service';
import { getCircleByUserId } from '@/lib/circle-service';
import portfolioData from '@/data/portfolio.json';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const source = searchParams.get('source') || 'portfolio'; // 'portfolio' | 'watchlist'
  const portfolioType = searchParams.get('portfolioType') || 'personal'; // 'personal' | 'sample' | 'friend'
  const targetUserId = searchParams.get('userId'); // for friend portfolios
  const periodParam = searchParams.get('period') || '50';
  const period = parseInt(periodParam, 10) as SMAPeriod;

  // Validate period
  if (!SMA_PERIODS.includes(period)) {
    return NextResponse.json(
      { error: `Invalid period. Must be one of: ${SMA_PERIODS.join(', ')}` },
      { status: 400 }
    );
  }

  try {
    const user = await getAppUser(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let tickers: string[] = [];
    let sourceLabel = source;

    if (source === 'watchlist') {
      const watchlist = await getWatchlist(session.user.id);
      tickers = watchlist.map((w: { ticker: string }) => w.ticker);
    } else if (portfolioType === 'sample') {
      // Use the sample Prometheus ETF portfolio
      tickers = portfolioData.holdings.map((h: { ticker: string }) => h.ticker);
      sourceLabel = 'Prometheus ETF';
    } else if (portfolioType === 'friend' && targetUserId) {
      // Verify user is in the same circle as the target
      const circle = await getCircleByUserId(session.user.id);
      if (!circle || !circle.members.includes(targetUserId)) {
        return NextResponse.json(
          { error: 'You can only view portfolios of circle members' },
          { status: 403 }
        );
      }
      const friendPortfolio = await getUserPortfolio(targetUserId);
      tickers = friendPortfolio.holdings.map((h: { ticker: string }) => h.ticker);
      sourceLabel = `Friend portfolio`;
    } else {
      // Default to personal portfolio
      const portfolio = await getUserPortfolio(session.user.id);
      tickers = portfolio.holdings.map((h: { ticker: string }) => h.ticker);
    }

    if (tickers.length === 0) {
      return NextResponse.json({
        data: [],
        period,
        source: sourceLabel,
        portfolioType,
        calculatedAt: new Date().toISOString(),
      });
    }

    const result = await getSMAForTickers(tickers, period);

    return NextResponse.json({
      ...result,
      source: sourceLabel,
      portfolioType,
    });
  } catch (error) {
    console.error('SMA calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate SMA data' },
      { status: 500 }
    );
  }
}
