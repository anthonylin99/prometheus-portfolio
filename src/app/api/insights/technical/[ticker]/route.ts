import { NextRequest, NextResponse } from 'next/server';
import { getHistoricalData, getQuoteForMetrics } from '@/lib/yahoo-finance';
import { generateTechnicalSignal, TechnicalSignal } from '@/lib/technical-analysis';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await context.params;
    const normalizedTicker = ticker.toUpperCase().trim();

    // Fetch 6 months of historical data for calculations
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);

    const [historicalData, quoteData] = await Promise.all([
      getHistoricalData(normalizedTicker, startDate, endDate),
      getQuoteForMetrics(normalizedTicker),
    ]);

    if (historicalData.length < 26) {
      return NextResponse.json(
        { error: 'Insufficient historical data for technical analysis' },
        { status: 400 }
      );
    }

    const fiftyTwoWeekHigh = quoteData?.fiftyTwoWeekHigh || Math.max(...historicalData.map(d => d.high));
    const fiftyTwoWeekLow = quoteData?.fiftyTwoWeekLow || Math.min(...historicalData.map(d => d.low));

    const signal: TechnicalSignal = generateTechnicalSignal(
      normalizedTicker,
      historicalData.map(d => ({
        high: d.high,
        low: d.low,
        close: d.close,
      })),
      fiftyTwoWeekHigh,
      fiftyTwoWeekLow
    );

    return NextResponse.json({ signal });
  } catch (error) {
    console.error('Technical analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to generate technical analysis' },
      { status: 500 }
    );
  }
}
