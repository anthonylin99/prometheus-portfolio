import { NextResponse } from 'next/server';
import { getPortfolioWithPrices, getETFData } from '@/lib/portfolio-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const includeValues = searchParams.get('includeValues') === 'true';
  
  try {
    const { holdings, summary, categories } = await getPortfolioWithPrices();
    const etf = await getETFData();
    
    // Build CSV content
    const lines: string[] = [];
    const today = new Date().toISOString().split('T')[0];
    
    // Header section
    lines.push('Prometheus ETF ($ALIN) Export');
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push('');
    
    // ETF Summary (always public - simulated from $100)
    lines.push('=== ETF Performance ===');
    lines.push(`Ticker,$ALIN`);
    lines.push(`Inception Date,${etf.inceptionDate}`);
    lines.push(`Inception Price,$100.00`);
    lines.push(`Current Price,$${etf.currentPrice.toFixed(2)}`);
    lines.push(`Day Change,${etf.dayChangePercent >= 0 ? '+' : ''}${etf.dayChangePercent.toFixed(2)}%`);
    lines.push(`Total Return,${etf.totalReturnPercent >= 0 ? '+' : ''}${etf.totalReturnPercent.toFixed(2)}%`);
    lines.push('');
    
    // Category Allocation (always public - just percentages)
    lines.push('=== Category Allocation ===');
    lines.push('Category,Weight %');
    categories.forEach(cat => {
      lines.push(`${cat.name},${cat.percentage.toFixed(2)}%`);
    });
    lines.push('');
    
    // Holdings - conditional based on PIN
    if (includeValues) {
      // Full data with values (requires PIN)
      lines.push('=== Holdings (Full Details) ===');
      lines.push('Ticker,Name,Category,Shares,Current Price,Value,Weight %,Day Change %');
      holdings.forEach(h => {
        lines.push(`${h.ticker},"${h.name}",${h.category},${h.shares},$${h.currentPrice.toFixed(2)},$${h.value.toFixed(2)},${h.weight.toFixed(2)}%,${h.dayChangePercent >= 0 ? '+' : ''}${h.dayChangePercent.toFixed(2)}%`);
      });
      lines.push('');
      
      // Portfolio Summary (requires PIN)
      lines.push('=== Portfolio Summary ===');
      lines.push(`Date,${today}`);
      lines.push(`Total Value,$${summary.totalValue.toFixed(2)}`);
      lines.push(`Day Change,$${summary.dayChange.toFixed(2)}`);
      lines.push(`Day Change %,${summary.dayChangePercent >= 0 ? '+' : ''}${summary.dayChangePercent.toFixed(2)}%`);
      lines.push(`Holdings Count,${summary.holdingsCount}`);
    } else {
      // Public data only (no values)
      lines.push('=== Holdings (Public View) ===');
      lines.push('Ticker,Name,Category,Weight %,Day Change %');
      holdings.forEach(h => {
        lines.push(`${h.ticker},"${h.name}",${h.category},${h.weight.toFixed(2)}%,${h.dayChangePercent >= 0 ? '+' : ''}${h.dayChangePercent.toFixed(2)}%`);
      });
    }
    
    const csvContent = lines.join('\n');
    
    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=prometheus-etf-${today}${includeValues ? '-full' : ''}.csv`,
      },
    });
  } catch (error) {
    console.error('Error generating CSV:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSV' },
      { status: 500 }
    );
  }
}
