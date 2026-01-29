'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn, formatPercentagePrecise } from '@/lib/utils';
import { HoldingWithPrice } from '@/types/portfolio';
import { CompanyLogo } from '@/components/ui/CompanyLogo';
import Link from 'next/link';

interface TodaysMoversProps {
  holdings: HoldingWithPrice[];
  maxItems?: number;
}

export function TodaysMovers({ holdings, maxItems = 3 }: TodaysMoversProps) {
  const sorted = [...holdings].sort(
    (a, b) => Math.abs(b.dayChangePercent) - Math.abs(a.dayChangePercent)
  );

  const gainers = sorted
    .filter((h) => h.dayChangePercent > 0)
    .slice(0, maxItems);
  const losers = sorted
    .filter((h) => h.dayChangePercent < 0)
    .slice(0, maxItems);

  if (gainers.length === 0 && losers.length === 0) {
    return (
      <div className="glass-card p-5 rounded-2xl">
        <h3 className="text-sm font-medium text-slate-400 mb-3">Today's Movers</h3>
        <p className="text-sm text-slate-500">No significant movement today</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 rounded-2xl">
      <h3 className="text-sm font-medium text-slate-400 mb-4">Today's Movers</h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Gainers */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">Top Gainers</span>
          </div>
          <div className="space-y-2">
            {gainers.length > 0 ? (
              gainers.map((h) => (
                <Link
                  key={h.ticker}
                  href={`/holdings/${h.ticker}`}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
                >
                  <CompanyLogo ticker={h.ticker} domain={h.logoDomain} size="xs" />
                  <span className="text-sm font-medium text-white flex-1">{h.ticker}</span>
                  <span className="text-sm text-emerald-400 tabular-nums">
                    {formatPercentagePrecise(h.dayChangePercent)}
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-xs text-slate-500">No gainers today</p>
            )}
          </div>
        </div>

        {/* Losers */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-xs font-medium text-red-400">Top Losers</span>
          </div>
          <div className="space-y-2">
            {losers.length > 0 ? (
              losers.map((h) => (
                <Link
                  key={h.ticker}
                  href={`/holdings/${h.ticker}`}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
                >
                  <CompanyLogo ticker={h.ticker} domain={h.logoDomain} size="xs" />
                  <span className="text-sm font-medium text-white flex-1">{h.ticker}</span>
                  <span className="text-sm text-red-400 tabular-nums">
                    {formatPercentagePrecise(h.dayChangePercent)}
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-xs text-slate-500">No losers today</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
