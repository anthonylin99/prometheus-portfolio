import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';
import { getYahooTicker } from '@/lib/yahoo-finance';

const yahooFinance = new YahooFinance();

export interface QuoteResponse {
  ticker: string;
  price: number;
  dayChangePercent: number;
  marketCap?: number;
  fiftyTwoWeekLow?: number;
  fiftyTwoWeekHigh?: number;
  averageVolume?: number;
  beta?: number;
  shortPercentOfFloat?: number;
  nextEarnings?: string;
}

function formatEarningsDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const yahooTicker = getYahooTicker(ticker);

  try {
    const [quoteRes, summaryRes] = await Promise.all([
      yahooFinance.quote(yahooTicker),
      yahooFinance.quoteSummary(yahooTicker, {
        modules: ['summaryDetail', 'defaultKeyStatistics', 'calendarEvents'],
      }),
    ]);

    const q = quoteRes as { regularMarketPrice?: number; regularMarketChangePercent?: number } | null | undefined;
    const price = q?.regularMarketPrice ?? 0;
    const dayChangePercent = q?.regularMarketChangePercent ?? 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sum = (summaryRes as any)?.summaryDetail;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const def = (summaryRes as any)?.defaultKeyStatistics;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cal = (summaryRes as any)?.calendarEvents;

    let nextEarnings: string | undefined;
    if (cal?.earnings?.earningsDate?.length) {
      const d = new Date(cal.earnings.earningsDate[0]);
      nextEarnings = formatEarningsDate(d);
    }

    const out: QuoteResponse = {
      ticker,
      price,
      dayChangePercent,
      marketCap: typeof sum?.marketCap === 'number' ? sum.marketCap : undefined,
      fiftyTwoWeekLow: typeof sum?.fiftyTwoWeekLow === 'number' ? sum.fiftyTwoWeekLow : undefined,
      fiftyTwoWeekHigh: typeof sum?.fiftyTwoWeekHigh === 'number' ? sum.fiftyTwoWeekHigh : undefined,
      averageVolume:
        typeof sum?.averageVolume === 'number'
          ? sum.averageVolume
          : typeof sum?.averageDailyVolume3Month === 'number'
            ? sum.averageDailyVolume3Month
            : undefined,
      beta: typeof def?.beta === 'number' ? def.beta : undefined,
      shortPercentOfFloat:
        typeof def?.shortPercentOfFloat === 'number' ? def.shortPercentOfFloat * 100 : undefined,
      nextEarnings,
    };

    return NextResponse.json(out, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=120' },
    });
  } catch (e) {
    console.error(`Quote API error for ${ticker}:`, e);
    return NextResponse.json(
      { error: 'Failed to fetch quote', ticker },
      { status: 500 }
    );
  }
}
