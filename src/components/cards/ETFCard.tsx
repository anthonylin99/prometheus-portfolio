'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ETFData } from '@/types/portfolio';
import { cn, formatCurrencyPrecise, formatPercentagePrecise } from '@/lib/utils';
import { useVisibility } from '@/lib/visibility-context';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

interface ETFCardProps {
  etf: ETFData;
  className?: string;
}

export function ETFCard({ etf, className }: ETFCardProps) {
  const isPositive = etf.dayChange >= 0;
  const totalPositive = etf.totalReturn >= 0;
  const { isVisible } = useVisibility();

  return (
    <Link 
      href="/etf"
      className={cn(
        "glass-card p-5 rounded-2xl group hover:border-violet-500/40 transition-all block",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="relative">
            <div className="w-14 h-14 rounded-xl overflow-hidden shadow-lg shadow-purple-500/25">
              <Image 
                src="/prometheus.png" 
                alt="Prometheus ETF" 
                width={56} 
                height={56}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">${etf.ticker}</span>
              <span className="text-sm text-slate-400">{etf.name}</span>
            </div>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-2xl font-bold text-white tabular-nums">
                {isVisible ? `$${etf.currentPrice.toFixed(2)}` : '$••••••'}
              </span>
              <span className={cn(
                "flex items-center gap-1 text-sm font-medium",
                isPositive ? "text-emerald-400" : "text-red-400"
              )}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {formatPercentagePrecise(etf.dayChangePercent)}
              </span>
            </div>
          </div>
        </div>

        {/* Total Return */}
        <div className="text-right hidden sm:block">
          <p className="text-sm text-slate-400">Since Inception</p>
          <p className={cn(
            "text-lg font-bold tabular-nums",
            totalPositive ? "text-emerald-400" : "text-red-400"
          )}>
            {formatPercentagePrecise(etf.totalReturnPercent)}
          </p>
          <p className="text-xs text-slate-500">
            {isVisible ? `${totalPositive ? '+' : ''}${formatCurrencyPrecise(etf.totalReturn)}` : '$••••'}
          </p>
        </div>

        {/* Arrow */}
        <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowRight className="w-5 h-5 text-violet-400" />
        </div>
      </div>
    </Link>
  );
}
