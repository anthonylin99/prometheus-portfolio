import { Holding, categoryColors } from '@/types/portfolio';
import { formatCurrency, formatPercentage, cn } from '@/lib/utils';
import { CompanyLogo } from '@/components/ui/CompanyLogo';
import { TrendingUp } from 'lucide-react';

interface TopHoldingCardProps {
  holding: Holding;
  rank: number;
  portfolioPercentage: number;
}

export function TopHoldingCard({ holding, rank, portfolioPercentage }: TopHoldingCardProps) {
  const color = categoryColors[holding.category];
  
  return (
    <div className="glass-card p-4 rounded-xl group hover:border-violet-500/40 transition-all animate-fade-in-up">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <CompanyLogo ticker={holding.ticker} size="lg" />
            <div 
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-slate-900 border-2 flex items-center justify-center text-xs font-bold text-white"
              style={{ borderColor: color }}
            >
              {rank}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-white">{holding.ticker}</h4>
            <p className="text-sm text-slate-400 truncate max-w-[120px]">
              {holding.name}
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-end justify-between">
          <span className="text-2xl font-bold text-white tabular-nums">
            {formatCurrency(holding.value)}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span 
            className="px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {holding.category}
          </span>
          <span className="text-slate-400 tabular-nums">
            {formatPercentage(portfolioPercentage)}
          </span>
        </div>
      </div>
      
      {/* Hover description */}
      <div className="mt-3 pt-3 border-t border-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-xs text-slate-400">{holding.description}</p>
      </div>
    </div>
  );
}
