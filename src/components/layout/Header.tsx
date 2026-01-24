'use client';

import { formatCurrency, formatDate } from '@/lib/utils';
import { TrendingUp, TrendingDown, Clock, RefreshCw } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  totalValue?: number;
  change?: number;
  changePercent?: number;
  lastUpdated?: string;
}

export function Header({ 
  title, 
  subtitle, 
  totalValue, 
  change = 0, 
  changePercent = 0,
  lastUpdated 
}: HeaderProps) {
  const isPositive = change >= 0;

  return (
    <header className="mb-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        {/* Title Section */}
        <div className="animate-fade-in-up">
          <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight mb-1">
            {title}
          </h1>
          {subtitle && (
            <p className="text-slate-400 text-lg">{subtitle}</p>
          )}
        </div>

        {/* Portfolio Value Section */}
        {totalValue !== undefined && (
          <div className="flex flex-col lg:items-end gap-2 animate-fade-in-up delay-100">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl lg:text-5xl font-bold text-white tabular-nums glow-text">
                {formatCurrency(totalValue)}
              </span>
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                isPositive 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{isPositive ? '+' : ''}{changePercent.toFixed(2)}%</span>
              </div>
            </div>
            
            {lastUpdated && (
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Clock className="w-3.5 h-3.5" />
                <span>Last updated: {formatDate(lastUpdated)}</span>
                <button className="p-1 hover:text-violet-400 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
