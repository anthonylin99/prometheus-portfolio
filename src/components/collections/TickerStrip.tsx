'use client';

import { useEffect, useState, useRef } from 'react';
import { cn, formatPercentagePrecise } from '@/lib/utils';
import type { CollectionStockWithPrice } from '@/lib/collection-service';

interface TickerStripProps {
  stocks: CollectionStockWithPrice[];
  className?: string;
}

export function TickerStrip({ stocks, className }: TickerStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || stocks.length < 6) return;

    let frame: number;
    const speed = 0.5; // px per frame

    const animate = () => {
      if (!isPaused && el) {
        el.scrollLeft += speed;
        // Loop: if scrolled past halfway, reset to start
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0;
        }
      }
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isPaused, stocks.length]);

  if (stocks.length === 0) return null;

  // Double the items for seamless loop
  const displayStocks = stocks.length >= 6 ? [...stocks, ...stocks] : stocks;

  return (
    <div
      ref={scrollRef}
      className={cn(
        'flex gap-3 overflow-x-auto scrollbar-hide py-2',
        className
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {displayStocks.map((stock, i) => {
        const isPositive = (stock.dayChangePercent ?? 0) >= 0;
        return (
          <div
            key={`${stock.ticker}-${i}`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 flex-shrink-0"
          >
            <span className="text-sm font-semibold text-white">{stock.ticker}</span>
            {stock.price !== undefined && (
              <span className="text-sm text-slate-400 tabular-nums">
                ${stock.price.toFixed(2)}
              </span>
            )}
            {stock.dayChangePercent !== undefined && (
              <span
                className={cn(
                  'text-xs font-medium tabular-nums',
                  isPositive ? 'text-emerald-400' : 'text-red-400'
                )}
              >
                {formatPercentagePrecise(stock.dayChangePercent)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
