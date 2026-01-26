import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

export interface EarningsInfo {
  date: string;
  formatted: string;
  isEstimate: boolean;
  daysUntil: number;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase();
  
  try {
    const result = await yahooFinance.quoteSummary(upperTicker, {
      modules: ['calendarEvents']
    });
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const calendarEvents = (result as any).calendarEvents;
    
    if (calendarEvents?.earnings?.earningsDate?.length) {
      const earningsDate = new Date(calendarEvents.earnings.earningsDate[0]);
      const now = new Date();
      const daysUntil = Math.ceil((earningsDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      const earningsInfo: EarningsInfo = {
        date: earningsDate.toISOString(),
        formatted: formatEarningsDate(earningsDate),
        isEstimate: true,
        daysUntil,
      };
      
      return NextResponse.json(earningsInfo, {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
        },
      });
    }
    
    return NextResponse.json(null);
  } catch (error) {
    console.error(`Failed to get earnings for ${upperTicker}:`, error);
    return NextResponse.json(null);
  }
}

function formatEarningsDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
}
