import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getUserPortfolioWithPrices,
  setUserPortfolio,
  type UserPortfolio,
} from '@/lib/user-portfolio-service';
import { getPortfolioWithPrices } from '@/lib/portfolio-service';
import { isOwnerEmail } from '@/lib/user-service';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // If the user is the owner, return the main Prometheus ETF portfolio
    if (session.user.email && isOwnerEmail(session.user.email)) {
      const data = await getPortfolioWithPrices();
      return NextResponse.json({ ...data, isOwner: true });
    }

    const data = await getUserPortfolioWithPrices(session.user.id);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const portfolio: UserPortfolio = {
      holdings: body.holdings || [],
      updatedAt: new Date().toISOString(),
    };
    await setUserPortfolio(session.user.id, portfolio);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// DELETE - Clear user portfolio (for data management)
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Set empty portfolio
    const emptyPortfolio: UserPortfolio = {
      holdings: [],
      updatedAt: new Date().toISOString(),
    };
    await setUserPortfolio(session.user.id, emptyPortfolio);
    return NextResponse.json({ success: true, message: 'Portfolio cleared' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
