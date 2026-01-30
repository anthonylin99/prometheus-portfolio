'use client';

import Link from 'next/link';
import { HoldingWithPrice, categoryColors } from '@/types/portfolio';
import { formatCurrency, formatPercentage, formatPercentagePrecise, cn } from '@/lib/utils';
import { useVisibility } from '@/lib/visibility-context';
import { CompanyLogo } from '@/components/ui/CompanyLogo';
import { TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';

/**
 * TopHoldingCard - Stripe-inspired holding card with gradient accents
 *
 * Design Philosophy:
 * - Gradient border that animates on hover
 * - Bottom accent bar that reveals on hover (green for positive, red for negative)
 * - Smooth micro-interactions
 * - Clean data presentation like Robinhood
 */

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
      className={cn(
        "holding-card relative block group animate-fade-in-up",
        isPositive ? "positive" : "negative"
      )}
    >
      {/* Gradient border effect on hover */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-br from-[#A78BFA]/50 via-[#c026d3]/30 to-[#f97316]/50">
          <div className="w-full h-full rounded-xl bg-[#0f0f16]" />
        </div>
      </div>

      <div className="relative z-10">
        {/* Header with logo and rank */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <CompanyLogo ticker={holding.ticker} domain={holding.logoDomain} size="lg" />
              <div
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${color}, ${color}dd)`,
                }}
              >
                {rank}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white group-hover:text-[#A78BFA] transition-colors flex items-center gap-1">
                {holding.ticker}
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
              <p className="text-sm text-[#71717a] truncate max-w-[120px]">
                {holding.name}
              </p>
            </div>
          </div>
        </div>

        {/* Value and change */}
        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-white tabular-nums tracking-tight">
              {isVisible ? formatCurrency(holding.value) : '$••••••'}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className={cn(
              "flex items-center gap-1.5 font-semibold px-2 py-0.5 rounded-full",
              isPositive
                ? "text-[#10b981] bg-[#10b981]/10"
                : "text-[#ef4444] bg-[#ef4444]/10"
            )}>
              {isPositive
                ? <TrendingUp className="w-3 h-3" />
                : <TrendingDown className="w-3 h-3" />
              }
              {formatPercentagePrecise(holding.dayChangePercent)}
            </span>
            <span className="text-[#71717a] tabular-nums font-medium">
              {formatPercentage(portfolioPercentage)}
            </span>
          </div>
        </div>

        {/* Footer with shares and price */}
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#52525b]">
          <span>{isVisible ? `${holding.shares.toLocaleString()} shares` : '•••• shares'}</span>
          <span className="tabular-nums">
            {isVisible && Number.isFinite(holding.currentPrice)
              ? `$${holding.currentPrice.toFixed(2)}`
              : '$••••'
            }
          </span>
        </div>
      </div>
    </Link>
  );
}
