'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, LineStyle, CrosshairMode, AreaSeries } from 'lightweight-charts';
import { HistoricalDataPoint, TimeRange, ChartDisplayState } from '@/types/portfolio';
import { rangeLabels } from '@/data/etf-config';
import { cn } from '@/lib/utils';

interface TradingViewChartProps {
  data: HistoricalDataPoint[];
  loading?: boolean;
  range: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  ticker?: string;
  currentPrice?: number;
  priceChange?: number;
  priceChangePercent?: number;
}

const timeRanges: TimeRange[] = ['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y'];

export function TradingViewChart({
  data,
  loading,
  range,
  onRangeChange,
  ticker = 'ALIN',
  currentPrice,
  priceChange = 0,
  priceChangePercent = 0,
}: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null);
  const [crosshairData, setCrosshairData] = useState<{
    price: number;
    date: string;
    change: number;
    changePercent: number;
  } | null>(null);

  // Calculate chart display state based on current data and range
  const chartDisplayState = useMemo<ChartDisplayState>(() => {
    if (!data.length) {
      return {
        selectedRange: range,
        displayPrice: currentPrice || 100,
        displayChange: priceChange,
        displayChangePercent: priceChangePercent,
        periodStartPrice: 100,
        periodEndPrice: currentPrice || 100,
        periodLabel: rangeLabels[range] || 'All time',
      };
    }

    const startPrice = data[0]?.close || 100;
    const endPrice = data[data.length - 1]?.close || currentPrice || 100;
    const change = endPrice - startPrice;
    const changePercent = startPrice > 0 ? (change / startPrice) * 100 : 0;

    return {
      selectedRange: range,
      displayPrice: endPrice,
      displayChange: change,
      displayChangePercent: changePercent,
      periodStartPrice: startPrice,
      periodEndPrice: endPrice,
      periodLabel: rangeLabels[range] || 'All time',
    };
  }, [data, range, currentPrice, priceChange, priceChangePercent]);

  const isPositive = chartDisplayState.displayChange >= 0;
  const lineColor = isPositive ? '#22c55e' : '#ef4444';
  const areaTopColor = isPositive ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)';
  const areaBottomColor = isPositive ? 'rgba(34, 197, 94, 0)' : 'rgba(239, 68, 68, 0)';

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
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
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: 'rgba(100, 116, 139, 0.2)',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScale: {
        axisPressedMouseMove: true,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
      },
    });

    chartRef.current = chart;

    // Create area series using new API
    const series = chart.addSeries(AreaSeries, {
      lineColor,
      topColor: areaTopColor,
      bottomColor: areaBottomColor,
      lineWidth: 2,
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    });

    seriesRef.current = series;

    // Handle crosshair move
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData) {
        setCrosshairData(null);
        return;
      }

      const price = param.seriesData.get(series);
      if (price && typeof price === 'object' && 'value' in price) {
        const firstPrice = data[0]?.close || 100;
        const currentVal = price.value as number;
        const change = currentVal - firstPrice;
        const changePercent = (change / firstPrice) * 100;

        setCrosshairData({
          price: currentVal,
          date: param.time.toString(),
          change,
          changePercent,
        });
      }
    });

    // Handle resize
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

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Update data when it changes
  useEffect(() => {
    if (!seriesRef.current || !data.length) return;

    const chartData = data.map((d) => ({
      time: d.date as string,
      value: d.close,
    }));

    seriesRef.current.setData(chartData);

    // Update colors based on performance
    const firstPrice = data[0]?.close || 100;
    const lastPrice = data[data.length - 1]?.close || 100;
    const positive = lastPrice >= firstPrice;
    const color = positive ? '#22c55e' : '#ef4444';

    seriesRef.current.applyOptions({
      lineColor: color,
      topColor: positive ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)',
      bottomColor: positive ? 'rgba(34, 197, 94, 0)' : 'rgba(239, 68, 68, 0)',
    });

    // Fit content
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  // Use crosshair data if hovering, otherwise use the calculated display state
  const displayPrice = crosshairData?.price ?? chartDisplayState.displayPrice;
  const displayChange = crosshairData?.change ?? chartDisplayState.displayChange;
  const displayChangePercent = crosshairData?.changePercent ?? chartDisplayState.displayChangePercent;
  const displayPositive = displayChange >= 0;

  return (
    <div className="glass-card rounded-2xl p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl font-bold text-white">${ticker}</span>
            <span className="text-sm text-slate-400">Prometheus ETF</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-white tabular-nums">
              ${displayPrice.toFixed(2)}
            </span>
            <span className={cn(
              "text-lg font-medium tabular-nums",
              displayPositive ? "text-emerald-400" : "text-red-400"
            )}>
              {displayPositive ? '+' : '-'}${Math.abs(displayChange).toFixed(2)} ({displayPositive ? '+' : ''}{displayChangePercent.toFixed(2)}%)
            </span>
          </div>
          {crosshairData ? (
            <span className="text-sm text-slate-500">{crosshairData.date}</span>
          ) : (
            <span className="text-sm text-slate-500">{chartDisplayState.periodLabel}</span>
          )}
        </div>

        {/* Time Range Selector */}
        <div className="flex flex-wrap gap-1 bg-slate-900/50 rounded-xl p-1">
          {timeRanges.map((r) => (
            <button
              key={r}
              onClick={() => onRangeChange(r)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                range === r
                  ? "bg-violet-400 text-white shadow-lg shadow-violet-400/25"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm rounded-xl z-10">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-slate-400">Loading chart data...</span>
            </div>
          </div>
        )}
        <div
          ref={chartContainerRef}
          className="w-full h-[400px] lg:h-[500px]"
        />
      </div>

      {/* Chart Footer */}
      <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4 text-slate-400">
          <span>Inception: Jan 24, 2026</span>
          <span>•</span>
          <span>Starting Price: $100.00</span>
        </div>
        <div className="text-slate-500">
          {data.length > 0 && `${data.length} data points`}
        </div>
      </div>
    </div>
  );
}
