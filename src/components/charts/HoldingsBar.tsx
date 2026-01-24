'use client';

import Link from 'next/link';
import { HoldingWithPrice, categoryColors } from '@/types/portfolio';
import { formatCurrency, formatPercentagePrecise, cn } from '@/lib/utils';
import { CompanyLogo } from '@/components/ui/CompanyLogo';
import { useVisibility } from '@/lib/visibility-context';

interface HoldingsBarProps {
  holdings: HoldingWithPrice[];
}

export function HoldingsBar({ holdings }: HoldingsBarProps) {
  const { isVisible } = useVisibility();
  const sortedHoldings = [...holdings].sort((a, b) => b.value - a.value);
  const maxValue = sortedHoldings[0]?.value || 1;
  
  return (
    <div className="space-y-3 animate-fade-in-up">
      {sortedHoldings.map((holding, index) => {
        const percentage = (holding.value / maxValue) * 100;
        const color = categoryColors[holding.category];
        const isPositive = holding.dayChangePercent >= 0;
        
        return (
          <Link 
            key={holding.ticker}
            href={`/holdings/${holding.ticker}`}
            className="group block relative"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-3 mb-1.5">
              <CompanyLogo ticker={holding.ticker} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white group-hover:text-violet-400 transition-colors">
                      {holding.ticker}
                    </span>
                    <span className="text-sm text-slate-500 hidden sm:inline truncate">
                      {holding.name}
                    </span>
                    <span className={cn(
                      "text-xs font-medium",
                      isPositive ? "text-emerald-400" : "text-red-400"
                    )}>
                      {formatPercentagePrecise(holding.dayChangePercent)}
                    </span>
                  </div>
                  <span className="font-bold text-white tabular-nums ml-2">
                    {isVisible ? formatCurrency(holding.value) : '$••••••'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden group-hover:bg-slate-700/50 transition-colors">
              <div 
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ 
                  width: `${percentage}%`,
                  background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                  boxShadow: `0 0 12px ${color}40`,
                }}
              />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
