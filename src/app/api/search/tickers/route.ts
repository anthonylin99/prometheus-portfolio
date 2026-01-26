import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();

  if (!query || query.length < 1) {
    return NextResponse.json({ results: [] });
  }

  try {
    const raw = await yahooFinance.search(query, { quotesCount: 12 });
    const quotes = (raw.quotes || [])
      .filter((q: Record<string, unknown>) => {
        const qt = q.quoteType as string | undefined;
        return qt === 'EQUITY' || qt === 'ETF';
      })
      .slice(0, 8)
      .map((q: Record<string, unknown>) => ({
        symbol: q.symbol as string,
        shortName: (q.shortname || q.shortName || '') as string,
        longName: (q.longname || q.longName || '') as string,
        exchange: (q.exchDisp || q.exchange || '') as string,
        quoteType: (q.quoteType || '') as string,
      }));

    return NextResponse.json({ results: quotes });
  } catch (e) {
    console.error('Ticker search error:', e);
    return NextResponse.json({ results: [] });
  }
}
