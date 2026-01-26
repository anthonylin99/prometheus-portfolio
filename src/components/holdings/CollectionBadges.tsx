'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layers } from 'lucide-react';
import { collectionCategories, getCollectionsForTicker, type Collection } from '@/data/collections-seed';

interface CollectionBadgesProps {
  ticker: string;
}

const categoryColors: Record<string, string> = {
  'anchor-sleeves': '#6366f1',
  'intelligence-compute': '#8b5cf6',
  'real-world-scarcity': '#f59e0b',
  'alternative-assets': '#f97316',
  'thematic-frontiers': '#06b6d4',
};

export function CollectionBadges({ ticker }: CollectionBadgesProps) {
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    setCollections(getCollectionsForTicker(ticker));
  }, [ticker]);

  if (collections.length === 0) return null;

  return (
    <div className="glass-card p-5 rounded-2xl mb-8">
      <div className="flex items-center gap-2 mb-3">
        <Layers className="w-4 h-4 text-violet-400" />
        <span className="text-sm font-medium text-slate-300">
          Part of {collections.length} Collection{collections.length > 1 ? 's' : ''}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {collections.map((c) => {
          const color = categoryColors[c.categoryId] || '#6366f1';
          const catName = collectionCategories.find((cat) => cat.id === c.categoryId)?.name;
          return (
            <Link
              key={c.id}
              href={`/explore/collection/${c.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors hover:brightness-125"
              style={{
                backgroundColor: `${color}15`,
                color,
                border: `1px solid ${color}30`,
              }}
            >
              {catName && <span className="opacity-70">{catName}</span>}
              {catName && <span className="opacity-40">|</span>}
              {c.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
