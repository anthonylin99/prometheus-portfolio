'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  CrosshairMode,
  LineSeries,
  CandlestickSeries,
  LineStyle,
} from 'lightweight-charts';
import { TimeRange } from '@/types/portfolio';
import { cn } from '@/lib/utils';
import { CompanyLogo } from '@/components/ui/CompanyLogo';
import { rangeLabels } from '@/data/etf-config';
import { getChartColor, POPULAR_COMPARISONS } from '@/lib/chart-colors';
import { X } from 'lucide-react';

const TIME_RANGES: TimeRange[] = ['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y'];

type CandleData = { date: string; open: number; high: number; low: number; close: number };

interface HoldingsPriceChartProps {
  ticker: string;
  companyName: string;
  logoDomain?: string;
}

export function HoldingsPriceChart({ ticker, companyName, logoDomain }: HoldingsPriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRefs = useRef<Map<string, ISeriesApi<'Line'> | ISeriesApi<'Candlestick'>>>(new Map());

  const [range, setRange] = useState<TimeRange>('1Y');
  const [compareTickers, setCompareTickers] = useState<string[]>([]);
  const [compareInput, setCompareInput] = useState('');
  const [data, setData] = useState<Record<string, CandleData[]>>({});
  const [loading, setLoading] = useState(true);
  const [displayMode, setDisplayMode] = useState<'price' | 'percent'>('price');
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [currentPriceLoading, setCurrentPriceLoading] = useState(false);

  useEffect(() => {
    setDisplayMode(compareTickers.length > 0 ? 'percent' : 'price');
  }, [compareTickers]);

  // Fetch current live price to match holdings page
  const fetchCurrentPrice = useCallback(async () => {
    setCurrentPriceLoading(true);
    try {
      const res = await fetch(`/api/quote/${ticker}`);
      if (res.ok) {
        const json = await res.json();
        if (json.price) {
          setCurrentPrice(json.price);
        }
      }
    } catch {
      // Silently fail - will use historical lastClose as fallback
    } finally {
      setCurrentPriceLoading(false);
    }
  }, [ticker]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const list = [ticker, ...compareTickers];
    try {
      const res = await fetch(`/api/historical/compare?tickers=${list.join(',')}&range=${range}`);
      const json = await res.json();
      setData(json.data || {});
    } catch {
      setData({});
    } finally {
      setLoading(false);
    }
  }, [ticker, compareTickers, range]);

  useEffect(() => {
    fetchData();
    fetchCurrentPrice();
  }, [fetchData, fetchCurrentPrice]);

  const primary = data[ticker] || [];
  const firstClose = primary.length > 0 && Number.isFinite(primary[0].close) ? primary[0].close : 0;
  const lastClose = primary.length > 0 && Number.isFinite(primary[primary.length - 1].close) ? primary[primary.length - 1].close : 0;
  
  // Use current live price if available and valid, otherwise fall back to last close from historical data
  const displayPrice = (currentPrice && Number.isFinite(currentPrice) && currentPrice > 0) ? currentPrice : (lastClose > 0 ? lastClose : 0);

  // For 1D/5D we fetch 2 months; period % uses the range-appropriate lookback.
  let periodPct = 0;
  if (primary.length > 0 && displayPrice > 0 && Number.isFinite(displayPrice)) {
    if (range === '1D' && primary.length >= 2) {
      const prev = primary[primary.length - 2].close;
      if (prev > 0 && Number.isFinite(prev)) periodPct = ((displayPrice - prev) / prev) * 100;
    } else if (range === '5D' && primary.length >= 6) {
      const fiveAgo = primary[primary.length - 6].close;
      if (fiveAgo > 0 && Number.isFinite(fiveAgo)) periodPct = ((displayPrice - fiveAgo) / fiveAgo) * 100;
    } else if (firstClose > 0 && Number.isFinite(firstClose)) {
      periodPct = ((displayPrice - firstClose) / firstClose) * 100;
    }
  }
  const periodLabel = rangeLabels[range] || range;
  const periodSign = periodPct >= 0 ? '+' : '';

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#131722' },
        textColor: '#d1d4dc',
        fontFamily: 'Outfit, system-ui, sans-serif',
      },
      grid: {
        vertLines: { color: '#2B2B43' },
        horzLines: { color: '#2B2B43' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: 'rgba(42, 46, 57, 0.8)',
          width: 1,
          style: LineStyle.Solid,
          labelBackgroundColor: '#2B2B43',
        },
        horzLine: {
          color: 'rgba(42, 46, 57, 0.8)',
          width: 1,
          style: LineStyle.Solid,
          labelBackgroundColor: '#2B2B43',
        },
      },
      rightPriceScale: {
        borderColor: '#2B2B43',
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: '#2B2B43',
        timeVisible: true,
        secondsVisible: false,
      },
    });
    chartRef.current = chart;

    const onResize = () => {
      if (containerRef.current)
        chart.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
    };
    window.addEventListener('resize', onResize);
    onResize();

    const refs = seriesRefs.current;
    return () => {
      window.removeEventListener('resize', onResize);
      chart.remove();
      refs.clear();
    };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    seriesRefs.current.forEach((s) => {
      try {
        chart.removeSeries(s);
      } catch {
        /* noop */
      }
    });
    seriesRefs.current.clear();

    const isPercent = displayMode === 'percent';

    if (primary.length > 0) {
      if (isPercent && firstClose > 0 && Number.isFinite(firstClose)) {
        const k = 100 / firstClose;
        const candleData = primary
          .filter(d => Number.isFinite(d.open) && Number.isFinite(d.high) && Number.isFinite(d.low) && Number.isFinite(d.close))
          .map((d) => ({
            time: d.date as string,
            open: (d.open - firstClose) * k,
            high: (d.high - firstClose) * k,
            low: (d.low - firstClose) * k,
            close: (d.close - firstClose) * k,
          }));
        const cs = chart.addSeries(CandlestickSeries, {
          upColor: '#26a69a',
          downColor: '#ef5350',
          borderUpColor: '#26a69a',
          borderDownColor: '#ef5350',
          wickUpColor: '#26a69a',
          wickDownColor: '#ef5350',
          priceFormat: { type: 'percent', precision: 2 },
        });
        cs.setData(candleData);
        seriesRefs.current.set(ticker, cs);
      } else {
        const candleData = primary
          .filter(d => Number.isFinite(d.open) && Number.isFinite(d.high) && Number.isFinite(d.low) && Number.isFinite(d.close))
          .map((d) => ({
            time: d.date as string,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
          }));
        const cs = chart.addSeries(CandlestickSeries, {
          upColor: '#26a69a',
          downColor: '#ef5350',
          borderUpColor: '#26a69a',
          borderDownColor: '#ef5350',
          wickUpColor: '#26a69a',
          wickDownColor: '#ef5350',
          priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
        });
        cs.setData(candleData);
        seriesRefs.current.set(ticker, cs);
      }
    }

    // Add comparison tickers
    compareTickers.forEach((compare, index) => {
      const ov = (data[compare] || []) as CandleData[];
      if (ov.length > 0) {
        const color = getChartColor(index);
        if (isPercent) {
          const f0 = ov[0]?.close;
          if (f0 > 0 && Number.isFinite(f0)) {
            const lineData = ov
              .filter(d => Number.isFinite(d.close))
              .map((d) => ({
                time: d.date as string,
                value: ((d.close - f0) / f0) * 100,
              }));
            const ls = chart.addSeries(LineSeries, {
              color,
              lineWidth: 2,
              lineStyle: LineStyle.Solid,
              priceFormat: { type: 'percent', precision: 2 },
            });
            ls.setData(lineData);
            seriesRefs.current.set(compare, ls);
          }
        } else {
          const lineData = ov
            .filter(d => Number.isFinite(d.close))
            .map((d) => ({ time: d.date as string, value: d.close }));
          try {
            chart.priceScale('left').applyOptions({ visible: true });
          } catch {
            /* left scale may not exist yet */
          }
          const ls = chart.addSeries(LineSeries, {
            color,
            lineWidth: 2,
            lineStyle: LineStyle.Solid,
            priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
            priceScaleId: 'left',
          });
          ls.setData(lineData);
          seriesRefs.current.set(compare, ls);
        }
      }
    });

    chart.timeScale().fitContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, ticker, compareTickers, displayMode]);

  const addCompare = (tickerToAdd?: string) => {
    const t = (tickerToAdd || compareInput).trim().toUpperCase();
    if (t && t !== ticker.toUpperCase() && !compareTickers.includes(t)) {
      setCompareTickers([...compareTickers, t]);
      setCompareInput('');
    }
  };

  const removeCompare = (tickerToRemove: string) => {
    setCompareTickers(compareTickers.filter((t) => t !== tickerToRemove));
  };

  const clearAllCompare = () => {
    setCompareTickers([]);
    setCompareInput('');
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-700/50" style={{ background: '#131722' }}>
      <div className="p-4 pb-2 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <CompanyLogo ticker={ticker} domain={logoDomain} size="lg" className="flex-shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-white">{ticker}</h3>
            <p className="text-sm text-slate-400">{companyName}</p>
            {displayPrice > 0 && Number.isFinite(displayPrice) && (
              <p className={cn('text-sm font-semibold tabular-nums mt-0.5', periodPct >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                {displayMode === 'price'
                  ? `${periodLabel}: $${displayPrice.toFixed(2)} (${Number.isFinite(periodPct) ? `${periodSign}${periodPct.toFixed(1)}%` : 'N/A'})`
                  : `${periodLabel}: ${Number.isFinite(periodPct) ? `${periodSign}${periodPct.toFixed(1)}%` : 'N/A'}`}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap items-center gap-1">
            <input
              type="text"
              placeholder="Compare (e.g. SPY)"
              value={compareInput}
              onChange={(e) => setCompareInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCompare()}
              className="w-32 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-violet-400 text-sm"
            />
            <button
              onClick={() => addCompare()}
              className="px-2.5 py-1.5 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 text-sm font-medium"
            >
              Add
            </button>
            {compareTickers.length > 0 && (
              <button
                onClick={clearAllCompare}
                className="px-2.5 py-1.5 rounded-lg bg-red-900/40 text-red-300 hover:bg-red-900/60 text-sm"
              >
                Clear All
              </button>
            )}
            {/* Popular comparisons */}
            <div className="hidden md:flex items-center gap-1 ml-1">
              <span className="text-xs text-slate-500">Quick:</span>
              {POPULAR_COMPARISONS.slice(0, 3).map((p) => (
                <button
                  key={p.ticker}
                  onClick={() => addCompare(p.ticker)}
                  disabled={compareTickers.includes(p.ticker) || p.ticker === ticker.toUpperCase()}
                  className={cn(
                    'px-2 py-1 rounded text-xs font-medium transition-all',
                    compareTickers.includes(p.ticker) || p.ticker === ticker.toUpperCase()
                      ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
                  )}
                  title={p.label}
                >
                  {p.ticker}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-1 items-center">
            <span className="text-xs text-slate-500 mr-1">View:</span>
            <button
              onClick={() => setDisplayMode('price')}
              className={cn(
                'px-2.5 py-1 rounded text-sm font-medium transition-all',
                displayMode === 'price' ? 'bg-violet-400 text-white' : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
              )}
            >
              $
            </button>
            <button
              onClick={() => setDisplayMode('percent')}
              className={cn(
                'px-2.5 py-1 rounded text-sm font-medium transition-all',
                displayMode === 'percent' ? 'bg-violet-400 text-white' : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
              )}
            >
              %
            </button>
            <span className="w-px h-4 bg-slate-600 mx-1" />
            {TIME_RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  'px-2.5 py-1 rounded text-sm font-medium transition-all',
                  range === r ? 'bg-violet-400 text-white' : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 px-4 pb-1 text-sm">
        <span className="flex items-center gap-2 text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          {ticker} ({displayMode === 'price' ? '$' : '%'})
        </span>
        {compareTickers.map((ct, index) => (
          <button
            key={ct}
            onClick={() => removeCompare(ct)}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800/60 hover:bg-slate-700 transition-colors group"
            title={`Click to remove ${ct}`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getChartColor(index) }}
            />
            <span className="text-slate-400">{ct}</span>
            <X className="w-3 h-3 text-slate-500 group-hover:text-red-400" />
          </button>
        ))}
      </div>

      <div className="relative">
        {loading && (
          <div
            className="absolute inset-0 flex items-center justify-center z-10"
            style={{ background: 'rgba(19,23,34,0.9)' }}
          >
            <div className="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <div ref={containerRef} className="w-full h-[360px]" />
      </div>
    </div>
  );
}
