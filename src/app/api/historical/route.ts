import { NextRequest, NextResponse } from 'next/server';
import { calculateHistoricalETFPrices, getDateRangeForFilter } from '@/lib/portfolio-service';
import { TimeRange } from '@/types/portfolio';

// Cache for historical data (different cache per range)
const historicalCache: Record<string, {
  data: Awaited<ReturnType<typeof calculateHistoricalETFPrices>>;
  lastFetch: number;
}> = {};

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = (searchParams.get('range') || '5Y') as TimeRange;
    
    const now = Date.now();
    const cacheKey = range;
    
    // Check cache
    if (historicalCache[cacheKey] && (now - historicalCache[cacheKey].lastFetch) < CACHE_DURATION) {
      return NextResponse.json({
        data: historicalCache[cacheKey].data,
        range,
        cached: true,
      });
    }
    
    // Calculate date range
    const startDate = getDateRangeForFilter(range);
    const endDate = new Date();
    
    // Fetch historical data
    const data = await calculateHistoricalETFPrices(startDate, endDate);
    
    // Update cache
    historicalCache[cacheKey] = {
      data,
      lastFetch: now,
    };
    
    return NextResponse.json({
      data,
      range,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      cached: false,
    });
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch historical data' },
      { status: 500 }
    );
  }
}
