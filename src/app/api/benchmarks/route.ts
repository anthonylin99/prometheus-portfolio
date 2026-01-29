import { NextResponse } from 'next/server';
import { getHistoricalData } from '@/lib/yahoo-finance';
import { calculateHistoricalETFPrices } from '@/lib/portfolio-service';
import { TimeRange, BenchmarkData } from '@/types/portfolio';
import { benchmarks, etfConfig } from '@/data/etf-config';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = (searchParams.get('range') || '1Y') as TimeRange;
  
  try {
    const endDate = new Date();
    const inceptionDate = new Date(etfConfig.inceptionDate);
    
    // Calculate start date based on range
    // For benchmarks, we always show historical data (2 years max)
    let benchmarkStartDate: Date;
    switch (range) {
      case '1D':
        benchmarkStartDate = new Date(endDate.getTime() - 1 * 24 * 60 * 60 * 1000);
        break;
      case '5D':
        benchmarkStartDate = new Date(endDate.getTime() - 5 * 24 * 60 * 60 * 1000);
        break;
      case '1M':
        benchmarkStartDate = new Date(new Date().setMonth(endDate.getMonth() - 1));
        break;
      case '3M':
        benchmarkStartDate = new Date(new Date().setMonth(endDate.getMonth() - 3));
        break;
      case '6M':
        benchmarkStartDate = new Date(new Date().setMonth(endDate.getMonth() - 6));
        break;
      case 'YTD':
        benchmarkStartDate = new Date(endDate.getFullYear(), 0, 1);
        break;
      case '1Y':
        benchmarkStartDate = new Date(new Date().setFullYear(endDate.getFullYear() - 1));
        break;
      case '5Y':
      default:
        // Show 5 years of benchmark history
        benchmarkStartDate = new Date(new Date().setFullYear(endDate.getFullYear() - 5));
    }
    
    // Fetch benchmark data in parallel - always with full history for context
    const benchmarkPromises = benchmarks.map(async (benchmark) => {
      try {
        const data = await getHistoricalData(benchmark.ticker, benchmarkStartDate, endDate);
        
        if (data.length === 0) return null;
        
        // Normalize to base 100
        const basePrice = data[0].close;
        const normalizedData = data.map(d => ({
          date: d.date.toISOString().split('T')[0],
          value: (d.close / basePrice) * 100,
        }));
        
        const performance = data.length > 1
          ? ((data[data.length - 1].close - data[0].close) / data[0].close) * 100
          : 0;
        
        return {
          ticker: benchmark.ticker,
          name: benchmark.name,
          color: benchmark.color,
          data: normalizedData,
          performance,
        } as BenchmarkData;
      } catch (error) {
        console.error(`Failed to fetch ${benchmark.ticker}:`, error);
        return null;
      }
    });
    
    const benchmarkResults = await Promise.all(benchmarkPromises);
    const validBenchmarks = benchmarkResults.filter(Boolean) as BenchmarkData[];
    
    // Fetch portfolio historical data (only from inception)
    const portfolioStartDate = benchmarkStartDate < inceptionDate ? inceptionDate : benchmarkStartDate;
    const portfolioHistory = await calculateHistoricalETFPrices(portfolioStartDate, endDate);
    
    // Normalize portfolio data to base 100
    let portfolioNormalized: { date: string; value: number }[] = [];
    let portfolioPerformance = 0;
    
    if (portfolioHistory.length > 1) {
      const basePrice = portfolioHistory[0].close;
      portfolioNormalized = portfolioHistory.map(p => ({
        date: p.date,
        value: (p.close / basePrice) * 100,
      }));
      portfolioPerformance = ((portfolioHistory[portfolioHistory.length - 1].close - basePrice) / basePrice) * 100;
    } else if (validBenchmarks.length > 0 && validBenchmarks[0].data.length > 0) {
      // If no portfolio history yet, show $ALIN as a flat line at 100 starting from inception
      // Or if inception is in the future/today, show it at the last date
      const inceptionDateStr = inceptionDate.toISOString().split('T')[0];
      const todayStr = endDate.toISOString().split('T')[0];
      
      // Add portfolio data point at inception date (or today if inception is today/future)
      const startDateStr = inceptionDateStr <= todayStr ? inceptionDateStr : todayStr;
      
      portfolioNormalized = [
        { date: startDateStr, value: 100 },
        { date: todayStr, value: 100 },
      ];
      portfolioPerformance = 0;
    }
    
    // Add portfolio as first item
    const alinData: BenchmarkData = {
      ticker: 'ALIN',
      name: 'Prometheus ETF',
      color: '#8b5cf6',
      data: portfolioNormalized,
      performance: portfolioPerformance,
    };
    
    return NextResponse.json({
      portfolio: alinData,
      benchmarks: validBenchmarks,
      range,
    });
  } catch (error) {
    console.error('Error fetching benchmarks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch benchmark data' },
      { status: 500 }
    );
  }
}
