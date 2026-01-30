'use client';

import { formatCurrency, formatDate } from '@/lib/utils';
import { useVisibility } from '@/lib/visibility-context';
import { usePortfolioViewing } from '@/lib/portfolio-context';
import { PortfolioSwitcher } from '@/components/layout/PortfolioSwitcher';
import { TrendingUp, TrendingDown, Clock, Sparkles } from 'lucide-react';

/**
 * Header - Stripe-inspired portfolio header with gradient accents
 *
 * Design Philosophy:
 * - Clean, bold typography with gradient text on hover
 * - Pill badges for performance indicators
 * - Subtle animations and premium feel
 */

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
  const { isVisible } = useVisibility();
  const { isViewingOther } = usePortfolioViewing();

  return (
    <header className="mb-8 relative">
      {/* Subtle gradient glow behind header */}
      <div className="absolute -top-20 -left-20 w-60 h-60 bg-[#A78BFA]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        {/* Title Section */}
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight hover:glow-text-stripe transition-all cursor-default">
              {title}
            </h1>
            <PortfolioSwitcher />
          </div>
          {subtitle && (
            <p className="text-[#a1a1aa] text-lg mt-1 font-medium">{subtitle}</p>
          )}
        </div>

        {/* Portfolio Value Section */}
        {totalValue !== undefined && (
          <div className="flex flex-col lg:items-end gap-3 animate-fade-in-up delay-100">
            <div className="flex items-baseline gap-4">
              {isViewingOther ? (
                <span className="text-2xl lg:text-3xl font-bold text-[#52525b] italic">
                  Percentages only
                </span>
              ) : (
                <span className="text-4xl lg:text-5xl font-bold text-white tabular-nums tracking-tight">
                  {isVisible ? formatCurrency(totalValue) : '$••••••'}
                </span>
              )}

              {/* Performance Badge - Stripe style */}
              <div className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold
                ${isPositive
                  ? 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/20'
                  : 'bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/20'
                }
              `}>
                {isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="tabular-nums">
                  {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Day Change Amount */}
            {!isViewingOther && change !== 0 && (
              <div className={`
                text-sm font-medium flex items-center gap-1
                ${isPositive ? 'text-[#10b981]' : 'text-[#ef4444]'}
              `}>
                <span className="text-[#52525b]">Today:</span>
                <span className="tabular-nums">
                  {isVisible
                    ? `${isPositive ? '+' : ''}${formatCurrency(change)}`
                    : '••••'
                  }
                </span>
              </div>
            )}

            {/* Last Updated */}
            {lastUpdated && (
              <div className="flex items-center gap-2 text-[#52525b] text-sm">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Updated {formatDate(lastUpdated)}</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-[#10b981] animate-pulse" />
                <span className="text-[#10b981] text-xs font-medium">Live</span>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
