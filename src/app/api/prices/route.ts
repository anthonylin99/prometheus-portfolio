import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPortfolioWithPrices } from '@/lib/portfolio-service';
import { isOwnerEmail } from '@/lib/user-service';

// Cache for price data (only used for authenticated owner)
let priceCache: {
  data: Awaited<ReturnType<typeof getPortfolioWithPrices>> | null;
  lastFetch: number;
} = {
  data: null,
  lastFetch: 0,
};

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export async function GET() {
  // SECURITY: Require authentication to view portfolio data
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'Authentication required to view portfolio' },
      { status: 401 }
    );
  }

  // Only allow owner to access this endpoint
  if (!isOwnerEmail(session.user.email)) {
    return NextResponse.json(
      { error: 'Access denied. Use /api/user/portfolio for your portfolio.' },
      { status: 403 }
    );
  }

  try {
    const now = Date.now();

    // Check if cache is valid
    if (priceCache.data && (now - priceCache.lastFetch) < CACHE_DURATION) {
      return NextResponse.json({
        ...priceCache.data,
        cached: true,
        cacheAge: Math.floor((now - priceCache.lastFetch) / 1000),
      });
    }

    // Fetch fresh data
    const data = await getPortfolioWithPrices();

    // Update cache
    priceCache = {
      data,
      lastFetch: now,
    };

    return NextResponse.json({
      ...data,
      cached: false,
    });
  } catch (error) {
    console.error('Error fetching prices:', error);

    // Return cached data if available
    if (priceCache.data) {
      return NextResponse.json({
        ...priceCache.data,
        cached: true,
        error: 'Failed to fetch fresh data, using cache',
      });
    }

    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    );
  }
}

// Force refresh endpoint - also requires auth
export async function POST() {
  const session = await auth();

  if (!session?.user?.email || !isOwnerEmail(session.user.email)) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const data = await getPortfolioWithPrices();

    priceCache = {
      data,
      lastFetch: Date.now(),
    };

    return NextResponse.json({
      ...data,
      cached: false,
      refreshed: true,
    });
  } catch (error) {
    console.error('Error refreshing prices:', error);
    return NextResponse.json(
      { error: 'Failed to refresh prices' },
      { status: 500 }
    );
  }
}
