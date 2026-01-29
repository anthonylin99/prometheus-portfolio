'use client';

import { SMAData } from '@/types/sma';
import { cn } from '@/lib/utils';

interface DispersionChartProps {
  data: SMAData[];
  maxDeviation?: number; // For scaling, auto-calculated if not provided
}

export function DispersionChart({ data, maxDeviation }: DispersionChartProps) {
  if (data.length === 0) {
    return (
      <div className="text-center text-slate-400 py-12">
        No data available
      </div>
    );
  }

  // Calculate max deviation for scaling if not provided
  const max =
    maxDeviation ||
    Math.max(...data.map((d) => Math.abs(d.deviation)), 10);

  return (
    <div className="space-y-2">
      {data.map((item) => (
        <DispersionBar
          key={item.ticker}
          item={item}
          maxDeviation={max}
        />
      ))}
    </div>
  );
}

interface DispersionBarProps {
  item: SMAData;
  maxDeviation: number;
}

function DispersionBar({ item, maxDeviation }: DispersionBarProps) {
  const isNegative = item.deviation < 0;
  const absDeviation = Math.abs(item.deviation);
  const barWidth = Math.min((absDeviation / maxDeviation) * 100, 100);

  return (
    <div className="flex items-center gap-3 group hover:bg-slate-800/30 rounded-lg p-2 -mx-2 transition-colors">
      {/* Ticker */}
      <div className="w-16 text-sm font-mono font-semibold text-white shrink-0">
        {item.ticker}
      </div>

      {/* Bar chart centered at 0 */}
      <div className="flex-1 flex items-center h-8">
        {/* Left side (negative/below SMA) */}
        <div className="flex-1 flex justify-end">
          {isNegative && (
            <div
              className="h-6 rounded-l-md bg-gradient-to-l from-red-500 to-red-600 transition-all duration-300"
              style={{ width: `${barWidth}%` }}
            />
          )}
        </div>

        {/* Center line (0%) */}
        <div className="w-px h-8 bg-slate-600 shrink-0" />

        {/* Right side (positive/above SMA) */}
        <div className="flex-1 flex justify-start">
          {!isNegative && (
            <div
              className="h-6 rounded-r-md bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300"
              style={{ width: `${barWidth}%` }}
            />
          )}
        </div>
      </div>

      {/* Deviation % */}
      <div
        className={cn(
          'w-20 text-right text-sm font-mono shrink-0',
          isNegative ? 'text-red-400' : 'text-emerald-400'
        )}
      >
        {isNegative ? '' : '+'}
        {item.deviation.toFixed(1)}%
      </div>

      {/* Price vs SMA on hover */}
      <div className="w-32 text-right text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hidden sm:block">
        ${item.currentPrice.toFixed(2)} / ${item.sma.toFixed(2)}
      </div>
    </div>
  );
}

// Header component with scale labels
export function DispersionChartHeader({ maxDeviation = 20 }: { maxDeviation?: number }) {
  return (
    <div className="flex items-center gap-3 px-2 mb-2 text-xs text-slate-500">
      <div className="w-16 shrink-0">Ticker</div>
      <div className="flex-1 flex items-center">
        <div className="flex-1 text-right pr-2">-{maxDeviation.toFixed(0)}%</div>
        <div className="w-px h-3 bg-slate-600" />
        <div className="flex-1 text-left pl-2">+{maxDeviation.toFixed(0)}%</div>
      </div>
      <div className="w-20 text-right shrink-0">Deviation</div>
      <div className="w-32 shrink-0 hidden sm:block" />
    </div>
  );
}
