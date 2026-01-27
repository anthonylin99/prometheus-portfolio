import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { addUserHolding, type UserHolding } from '@/lib/user-portfolio-service';
import { getAppUser, isOwnerEmail } from '@/lib/user-service';
import { logActivity } from '@/lib/circle-service';
import { upsertHolding } from '@/lib/holdings-service';
import { Category } from '@/types/portfolio';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { ticker, name, shares, costBasis, category, description } = body;

    if (!ticker || !shares) {
      return NextResponse.json(
        { error: 'ticker and shares are required' },
        { status: 400 }
      );
    }

    const isOwner = session.user.email && isOwnerEmail(session.user.email);

    if (isOwner) {
      // Owner adds to the main Prometheus ETF portfolio
      const success = await upsertHolding({
        ticker: ticker.toUpperCase(),
        name: name || ticker.toUpperCase(),
        shares: Number(shares),
        costBasis: costBasis ? Number(costBasis) : undefined,
        category: (category as Category) || 'Big Tech',
        description: description || '',
      });

      if (!success) {
        return NextResponse.json(
          { error: 'Failed to add to main portfolio. Redis may not be configured.' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, isOwner: true });
    }

    // Regular user adds to their own portfolio
    // Check if already exists
    const { getUserPortfolio } = await import('@/lib/user-portfolio-service');
    const portfolio = await getUserPortfolio(session.user.id);
    const existingHolding = portfolio.holdings.find(h => h.ticker.toUpperCase() === ticker.toUpperCase());
    const wasDuplicate = !!existingHolding;

    const holding: UserHolding = {
      ticker: ticker.toUpperCase(),
      name: name || ticker.toUpperCase(),
      shares: Number(shares),
      costBasis: costBasis ? Number(costBasis) : undefined,
      category: (category as Category) || 'Big Tech',
      description: description || '',
      addedAt: new Date().toISOString(),
    };

    await addUserHolding(session.user.id, holding);

    // Log activity if user is in a circle
    const user = await getAppUser(session.user.id);
    if (user?.circleId) {
      await logActivity(user.circleId, {
        userId: session.user.id,
        userName: user.name || user.email,
        etfTicker: user.etfTicker,
        type: 'HOLDING_ADDED',
        payload: { ticker: holding.ticker, shares: holding.shares },
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({ 
      success: true, 
      holding,
      wasDuplicate,
      message: wasDuplicate 
        ? `Added ${shares} more shares to existing ${ticker} position`
        : `Successfully added ${ticker} to portfolio`
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Failed to add holding:', err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
