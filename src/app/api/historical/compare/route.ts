import { NextRequest, NextResponse } from 'next/server';
import { getHistoricalData } from '@/lib/yahoo-finance';
import { TimeRange } from '@/types/portfolio';

// For 1D and 5D we fetch 2 months so the chart has enough bars to scroll.
// The range label (1D/5D) still drives the period % in the UI.
function getStartDateForRange(range: TimeRange): Date {
  const now = new Date();
  switch (range) {
    case '1D':
    case '5D':
      return new Date(new Date().setMonth(now.getMonth() - 2));
    case '1M':
      return new Date(new Date().setMonth(now.getMonth() - 1));
    case '3M':
      return new Date(new Date().setMonth(now.getMonth() - 3));
    case '6M':
      return new Date(new Date().setMonth(now.getMonth() - 6));
    case 'YTD':
      return new Date(now.getFullYear(), 0, 1);
    case '1Y':
      return new Date(new Date().setFullYear(now.getFullYear() - 1));
    case '5Y':
    default:
      return new Date(new Date().setFullYear(now.getFullYear() - 5));
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tickersParam = searchParams.get('tickers');
    const range = (searchParams.get('range') || '1Y') as TimeRange;

    if (!tickersParam) {
      return NextResponse.json({ error: 'Missing tickers' }, { status: 400 });
    }

    const tickers = tickersParam.split(',').map((t) => t.trim().toUpperCase()).filter(Boolean);
    if (tickers.length === 0) {
      return NextResponse.json({ error: 'No valid tickers' }, { status: 400 });
    }

    const startDate = getStartDateForRange(range);
    const endDate = new Date();

    const results: Record<string, { date: string; open: number; high: number; low: number; close: number }[]> = {};

    await Promise.all(
      tickers.map(async (t) => {
        const data = await getHistoricalData(t, startDate, endDate);
        if (data.length === 0) {
          results[t] = [];
          return;
        }
        results[t] = data.map((d) => ({
          date: d.date.toISOString().split('T')[0],
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        }));
      })
    );

    return NextResponse.json({ data: results, range });
  } catch (error) {
    console.error('historical/compare error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comparison data' },
      { status: 500 }
    );
  }
}
