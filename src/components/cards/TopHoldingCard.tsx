'use client';

import Link from 'next/link';
import { HoldingWithPrice, categoryColors } from '@/types/portfolio';
import { formatCurrency, formatPercentage, formatPercentagePrecise, cn } from '@/lib/utils';
import { useVisibility } from '@/lib/visibility-context';
import { CompanyLogo } from '@/components/ui/CompanyLogo';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TopHoldingCardProps {
  holding: HoldingWithPrice;
  rank: number;
  portfolioPercentage: number;
}

export function TopHoldingCard({ holding, rank, portfolioPercentage }: TopHoldingCardProps) {
  const color = categoryColors[holding.category];
  const isPositive = holding.dayChangePercent >= 0;
  const { isVisible } = useVisibility();
  
  return (
    <Link 
      href={`/holdings/${holding.ticker}`}
      className="glass-card p-4 rounded-xl group hover:border-violet-500/40 transition-all block animate-fade-in-up"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <CompanyLogo ticker={holding.ticker} domain={holding.logoDomain} size="lg" />
            <div 
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-slate-900 border-2 flex items-center justify-center text-xs font-bold text-white"
              style={{ borderColor: color }}
            >
              {rank}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-white group-hover:text-violet-400 transition-colors">
              {holding.ticker}
            </h4>
            <p className="text-sm text-slate-400 truncate max-w-[120px]">
              {holding.name}
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-end justify-between">
          <span className="text-2xl font-bold text-white tabular-nums">
            {isVisible ? formatCurrency(holding.value) : '$••••••'}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className={cn(
            "flex items-center gap-1 font-medium",
            isPositive ? "text-emerald-400" : "text-red-400"
          )}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {formatPercentagePrecise(holding.dayChangePercent)}
          </span>
          <span className="text-slate-400 tabular-nums">
            {formatPercentage(portfolioPercentage)}
          </span>
        </div>
      </div>
      
      {/* Price info */}
      <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
        <span>{isVisible ? `${holding.shares.toLocaleString()} shares` : '•••• shares'}</span>
        <span>{isVisible ? `$${holding.currentPrice.toFixed(2)}` : '$••••'}</span>
      </div>
    </Link>
  );
}
