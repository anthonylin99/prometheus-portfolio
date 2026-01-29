'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

/**
 * Luma-inspired 12-column Bento grid layout
 * Cards can span 3, 6, or 12 columns
 * 16px gap, 1200px max-width, responsive
 */
export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-12 gap-4 max-w-[1200px] mx-auto px-4 md:px-6 lg:px-10',
        className
      )}
    >
      {children}
    </div>
  );
}

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  span?: 3 | 4 | 6 | 8 | 12; // Column span
  rowSpan?: 1 | 2; // Row span (for tall cards)
}

/**
 * Bento grid card with configurable column span
 * Mobile: full width, Desktop: configurable
 */
export function BentoCard({
  children,
  className,
  span = 6,
  rowSpan = 1,
}: BentoCardProps) {
  const spanClasses = {
    3: 'col-span-12 sm:col-span-6 lg:col-span-3',
    4: 'col-span-12 sm:col-span-6 lg:col-span-4',
    6: 'col-span-12 lg:col-span-6',
    8: 'col-span-12 lg:col-span-8',
    12: 'col-span-12',
  };

  const rowSpanClasses = {
    1: '',
    2: 'row-span-2',
  };

  return (
    <div
      className={cn(
        'luma-card',
        spanClasses[span],
        rowSpanClasses[rowSpan],
        className
      )}
    >
      {children}
    </div>
  );
}

// Re-export for convenience
export { BentoGrid as default };
