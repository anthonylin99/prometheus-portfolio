'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CompanyLogo } from '@/components/ui/CompanyLogo';
import type { Collection, CollectionCategory } from '@/data/collections-seed';

interface CollectionCardProps {
  collection: Collection & { category?: CollectionCategory };
  className?: string;
}

const categoryBorderColors: Record<string, string> = {
  'anchor-sleeves': 'border-l-indigo-500',
  'intelligence-compute': 'border-l-violet-500',
  'real-world-scarcity': 'border-l-amber-500',
  'alternative-assets': 'border-l-orange-500',
  'thematic-frontiers': 'border-l-cyan-500',
};

export function CollectionCard({ collection, className }: CollectionCardProps) {
  const categoryColor = collection.category?.color || '#6366f1';
  const stockCount = collection.stocks.length;
  const displayStocks = collection.stocks.slice(0, 9);
  const remainingCount = Math.max(0, stockCount - 9);
  const borderClass = categoryBorderColors[collection.categoryId] || 'border-l-violet-500';

  return (
    <Link
      href={`/explore/collection/${collection.id}`}
      className={cn(
        'group block rounded-2xl p-5 border-l-[3px] transition-all duration-200',
        'bg-slate-800/40 border border-slate-700/50',
        'hover:bg-slate-800/60 hover:border-slate-600/50',
        'hover:shadow-lg hover:shadow-slate-900/50 hover:-translate-y-0.5',
        borderClass,
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="px-2 py-0.5 rounded-full text-[11px] font-medium"
              style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
            >
              {collection.category?.name || collection.categoryId}
            </span>
            <span className="text-xs text-slate-500">
              {stockCount} stocks
            </span>
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-violet-400 transition-colors truncate">
            {collection.name}
          </h3>
        </div>
        <span
          className={cn(
            'text-[11px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ml-2',
            collection.riskLevel === 'low' && 'bg-emerald-500/20 text-emerald-400',
            collection.riskLevel === 'moderate' && 'bg-blue-500/20 text-blue-400',
            collection.riskLevel === 'high' && 'bg-amber-500/20 text-amber-400',
            collection.riskLevel === 'very-high' && 'bg-red-500/20 text-red-400'
          )}
        >
          {collection.riskLevel === 'very-high' ? 'Very High' : collection.riskLevel.charAt(0).toUpperCase() + collection.riskLevel.slice(1)}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-400 line-clamp-2 mb-4 leading-relaxed">
        {collection.description}
      </p>

      {/* Logo Grid */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {displayStocks.map((s) => (
          <CompanyLogo
            key={s.ticker}
            ticker={s.ticker}
            size="xs"
          />
        ))}
        {remainingCount > 0 && (
          <div className="w-7 h-7 rounded-full bg-slate-700/80 flex items-center justify-center text-[10px] font-medium text-slate-400">
            +{remainingCount}
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {collection.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="text-[11px] text-slate-500">
            #{tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
