'use client';

import Link from 'next/link';
import { CompanyLogo } from '@/components/ui/CompanyLogo';
import { cn, formatCurrency, formatPercentagePrecise } from '@/lib/utils';
import { TrendingUp, TrendingDown, Star } from 'lucide-react';
import type { CollectionStockWithPrice } from '@/lib/collection-service';

interface StockRowProps {
  stock: CollectionStockWithPrice;
  rank?: number;
  isWatchlisted?: boolean;
  onToggleWatchlist?: (ticker: string) => void;
}

export function StockRow({ stock, rank, isWatchlisted, onToggleWatchlist }: StockRowProps) {
  const isPositive = (stock.dayChangePercent ?? 0) >= 0;

  return (
    <div className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors">
      {/* Rank */}
      {rank !== undefined && (
        <span className="w-6 text-center text-sm font-medium text-slate-500 tabular-nums">
          {rank}
        </span>
      )}

      {/* Logo */}
      <Link href={`/holdings/${stock.ticker}`} className="flex-shrink-0">
        <CompanyLogo ticker={stock.ticker} size="md" />
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link href={`/holdings/${stock.ticker}`} className="font-semibold text-white hover:text-violet-400 transition-colors">
            {stock.ticker}
          </Link>
          {stock.name && (
            <span className="text-sm text-slate-500 truncate hidden sm:inline">
              {stock.name}
            </span>
          )}
        </div>
        {stock.note && (
          <p className="text-xs text-slate-500 truncate mt-0.5">{stock.note}</p>
        )}
      </div>

      {/* Price */}
      <div className="text-right flex-shrink-0">
        {stock.price !== undefined ? (
          <>
            <p className="font-semibold text-white tabular-nums">
              {formatCurrency(stock.price)}
            </p>
            {stock.dayChangePercent !== undefined && (
              <p className={cn(
                'flex items-center gap-0.5 text-sm font-medium justify-end',
                isPositive ? 'text-emerald-400' : 'text-red-400'
              )}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {formatPercentagePrecise(stock.dayChangePercent)}
              </p>
            )}
          </>
        ) : (
          <div className="w-16 h-4 bg-slate-800 rounded animate-pulse" />
        )}
      </div>

      {/* Watchlist toggle */}
      {onToggleWatchlist && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleWatchlist(stock.ticker);
          }}
          className={cn(
            'p-1.5 rounded-lg transition-colors flex-shrink-0',
            isWatchlisted
              ? 'text-amber-400 hover:text-amber-300'
              : 'text-slate-600 hover:text-slate-400 opacity-0 group-hover:opacity-100'
          )}
          title={isWatchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          <Star className={cn('w-4 h-4', isWatchlisted && 'fill-current')} />
        </button>
      )}
    </div>
  );
}
