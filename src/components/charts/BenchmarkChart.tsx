'use client';

import { useState, useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, LineStyle, CrosshairMode, LineSeries } from 'lightweight-charts';
import { useBenchmarks } from '@/lib/hooks';
import { TimeRange } from '@/types/portfolio';
import { cn, formatPercentagePrecise } from '@/lib/utils';

interface BenchmarkChartProps {
  range: TimeRange;
  className?: string;
}

export function BenchmarkChart({ range, className }: BenchmarkChartProps) {
  const { portfolio, benchmarks, loading } = useBenchmarks(range);
  const [activeBenchmarks, setActiveBenchmarks] = useState<string[]>(['SPY']);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRefs = useRef<Map<string, ISeriesApi<'Line'>>>(new Map());

  const toggleBenchmark = (ticker: string) => {
    setActiveBenchmarks(prev => 
      prev.includes(ticker) 
        ? prev.filter(t => t !== ticker)
        : [...prev, ticker]
    );
  };

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94a3b8',
        fontFamily: 'Outfit, system-ui, sans-serif',
      },
      grid: {
        vertLines: { color: 'rgba(100, 116, 139, 0.1)' },
        horzLines: { color: 'rgba(100, 116, 139, 0.1)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: 'rgba(139, 92, 246, 0.5)',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#6366f1',
        },
        horzLine: {
          color: 'rgba(139, 92, 246, 0.5)',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#6366f1',
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(100, 116, 139, 0.2)',
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: 'rgba(100, 116, 139, 0.2)',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Store ref value for cleanup
    const currentSeriesRefs = seriesRefs.current;

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      currentSeriesRefs.clear();
    };
  }, []);

  // Update chart data when portfolio/benchmarks/active benchmarks change
  useEffect(() => {
    if (!chartRef.current) return;
    
    // Allow chart to render with just benchmarks, even if portfolio is null
    const chart = chartRef.current;

    // Remove existing series
    seriesRefs.current.forEach(series => {
      try {
        chart.removeSeries(series);
      } catch {
        // Series may already be removed
      }
    });
    seriesRefs.current.clear();

    // Add portfolio series (always visible, thicker) - if we have data
    if (portfolio && portfolio.data.length > 0) {
      const portfolioSeries = chart.addSeries(LineSeries, {
        color: portfolio.color,
        lineWidth: 3,
        priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
      });
      portfolioSeries.setData(portfolio.data.map(d => ({
        time: d.date,
        value: d.value,
      })));
      seriesRefs.current.set('ALIN', portfolioSeries);
    }

    // Add active benchmark series
    benchmarks.forEach(benchmark => {
      if (activeBenchmarks.includes(benchmark.ticker) && benchmark.data.length > 0) {
        const series = chart.addSeries(LineSeries, {
          color: benchmark.color,
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
          priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
        });
        series.setData(benchmark.data.map(d => ({
          time: d.date,
          value: d.value,
        })));
        seriesRefs.current.set(benchmark.ticker, series);
      }
    });

    chart.timeScale().fitContent();
  }, [portfolio, benchmarks, activeBenchmarks]);

  if (loading) {
    return (
      <div className={cn("glass-card p-6 rounded-2xl", className)}>
        <div className="h-[400px] flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-400">Loading benchmark data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("glass-card p-6 rounded-2xl", className)}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-xl font-bold text-white">Benchmark Comparison</h3>
          <p className="text-sm text-slate-400">Performance normalized to 100</p>
        </div>

        {/* Benchmark Toggle Buttons */}
        <div className="flex flex-wrap gap-2">
          {benchmarks.map(b => (
            <button
              key={b.ticker}
              onClick={() => toggleBenchmark(b.ticker)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 border",
                activeBenchmarks.includes(b.ticker)
                  ? "bg-slate-700 text-white border-slate-600"
                  : "bg-slate-800/50 text-gray-400 border-slate-800 hover:border-slate-700"
              )}
            >
              <span 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: b.color }}
              />
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div
        ref={chartContainerRef}
        className="w-full h-[350px]"
      />

      {/* Performance Comparison Table */}
      <div className="mt-4 pt-4 border-t border-slate-700/50 grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Portfolio */}
        {portfolio && (
          <PerformanceBox 
            name="$ALIN" 
            color={portfolio.color} 
            value={portfolio.performance} 
          />
        )}
        {/* Active benchmarks */}
        {benchmarks
          .filter(b => activeBenchmarks.includes(b.ticker))
          .map(benchmark => (
            <PerformanceBox 
              key={benchmark.ticker}
              name={benchmark.name} 
              color={benchmark.color} 
              value={benchmark.performance} 
            />
          ))}
      </div>
    </div>
  );
}

interface PerformanceBoxProps {
  name: string;
  color: string;
  value: number;
}

function PerformanceBox({ name, color, value }: PerformanceBoxProps) {
  const isPositive = value >= 0;
  
  return (
    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
      <div className="flex items-center gap-2 mb-1">
        <span 
          className="w-2.5 h-2.5 rounded-full" 
          style={{ backgroundColor: color }}
        />
        <span className="text-sm text-slate-400">{name}</span>
      </div>
      <span className={cn(
        "text-lg font-semibold tabular-nums",
        isPositive ? "text-emerald-400" : "text-red-400"
      )}>
        {formatPercentagePrecise(value)}
      </span>
    </div>
  );
}
