'use client';

import { cn } from '@/lib/utils';
import { useVisibility } from '@/lib/visibility-context';
import { LucideIcon } from 'lucide-react';

/**
 * StatCard - Stripe-inspired stat display with gradient accents
 *
 * Design Philosophy:
 * - Subtle gradient background that shifts on hover
 * - Top accent line with purple → fuchsia gradient
 * - Premium icon treatment with gradient background
 * - Clean, bold typography for numbers
 */

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: LucideIcon;
  className?: string;
  isCurrency?: boolean;
  gradient?: 1 | 2 | 3 | 4 | 5;
}

const gradientStyles = {
  1: {
    bg: 'linear-gradient(135deg, rgba(99, 91, 255, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)',
    border: 'rgba(99, 91, 255, 0.2)',
    icon: 'linear-gradient(135deg, #A78BFA, #C4B5FD)',
  },
  2: {
    bg: 'linear-gradient(135deg, rgba(192, 38, 211, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)',
    border: 'rgba(192, 38, 211, 0.2)',
    icon: 'linear-gradient(135deg, #c026d3, #ec4899)',
  },
  3: {
    bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
    border: 'rgba(59, 130, 246, 0.2)',
    icon: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
  },
  4: {
    bg: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
    border: 'rgba(6, 182, 212, 0.2)',
    icon: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
  },
  5: {
    bg: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)',
    border: 'rgba(249, 115, 22, 0.2)',
    icon: 'linear-gradient(135deg, #f97316, #ec4899)',
  },
};

export function StatCard({
  label,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  className,
  isCurrency = false,
  gradient = 1
}: StatCardProps) {
  const { isVisible } = useVisibility();
  const style = gradientStyles[gradient];

  // Check if value contains a dollar sign (is a currency value)
  const shouldMask = isCurrency || value.includes('$');
  const displayValue = shouldMask && !isVisible ? '$••••••' : value;

  return (
    <div
      className={cn(
        "stat-card relative p-5 rounded-xl animate-fade-in-up overflow-hidden group",
        className
      )}
      style={{
        background: style.bg,
        borderColor: style.border,
      }}
    >
      {/* Top gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#A78BFA] to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-[#a1a1aa] font-medium">{label}</span>
        {Icon && (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: style.icon }}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      <p className="text-3xl font-bold text-white tabular-nums mb-1 tracking-tight">
        {displayValue}
      </p>

      {change && (
        <p className={cn(
          "text-sm font-medium flex items-center gap-1",
          changeType === 'positive' && "text-[#10b981]",
          changeType === 'negative' && "text-[#ef4444]",
          changeType === 'neutral' && "text-[#a1a1aa]"
        )}>
          {changeType === 'positive' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
          )}
          {changeType === 'negative' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
          )}
          {change}
        </p>
      )}

      {/* Subtle hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#A78BFA]/5 to-transparent" />
      </div>
    </div>
  );
}
