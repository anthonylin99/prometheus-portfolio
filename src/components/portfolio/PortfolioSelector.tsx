'use client';

import { cn } from '@/lib/utils';
import { Wallet, Flame, Layers } from 'lucide-react';

export type PortfolioView = 'personal' | 'public' | 'combined';

interface PortfolioSelectorProps {
  selected: PortfolioView;
  onSelect: (view: PortfolioView) => void;
  personalLabel?: string;
  className?: string;
}

export function PortfolioSelector({
  selected,
  onSelect,
  personalLabel = 'My Portfolio',
  className,
}: PortfolioSelectorProps) {
  const options: Array<{
    id: PortfolioView;
    label: string;
    icon: typeof Wallet;
    description: string;
  }> = [
    {
      id: 'personal',
      label: personalLabel,
      icon: Wallet,
      description: 'Your holdings only',
    },
    {
      id: 'public',
      label: '$ALIN',
      icon: Flame,
      description: 'Prometheus ETF',
    },
    {
      id: 'combined',
      label: 'Combined',
      icon: Layers,
      description: 'Both portfolios merged',
    },
  ];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-xs text-slate-500 mr-1">View:</span>
      {options.map((opt) => {
        const isActive = selected === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            title={opt.description}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all luma-button',
              isActive
                ? 'bg-violet-400 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            )}
          >
            <opt.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
