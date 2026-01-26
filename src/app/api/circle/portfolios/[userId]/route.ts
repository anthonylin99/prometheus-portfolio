import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAppUser } from '@/lib/user-service';
import { getUserPortfolioWithPrices } from '@/lib/user-portfolio-service';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId: targetUserId } = await params;

  // Verify both users are in the same circle
  const [currentUser, targetUser] = await Promise.all([
    getAppUser(session.user.id),
    getAppUser(targetUserId),
  ]);

  if (!currentUser?.circleId || !targetUser?.circleId) {
    return NextResponse.json({ error: 'Circle not found' }, { status: 403 });
  }

  if (currentUser.circleId !== targetUser.circleId) {
    return NextResponse.json({ error: 'Not in the same circle' }, { status: 403 });
  }

  // Get portfolio with prices
  const { holdings, summary, categories } = await getUserPortfolioWithPrices(targetUserId);

  // Sanitize: strip dollar amounts, keep only percentages and weights
  const sanitizedHoldings = holdings.map((h) => ({
    ticker: h.ticker,
    name: h.name,
    category: h.category,
    logoDomain: h.logoDomain,
    weight: h.weight,
    dayChangePercent: h.dayChangePercent,
    currentPrice: h.currentPrice,
  }));

  const sanitizedSummary = {
    holdingsCount: summary.holdingsCount,
    categoriesCount: summary.categoriesCount,
    dayChangePercent: summary.dayChangePercent,
    lastUpdated: summary.lastUpdated,
  };

  return NextResponse.json({
    user: {
      name: targetUser.name,
      etfTicker: targetUser.etfTicker,
      etfName: targetUser.etfName,
      avatarColor: targetUser.avatarColor,
    },
    holdings: sanitizedHoldings,
    summary: sanitizedSummary,
    categories,
  });
}
