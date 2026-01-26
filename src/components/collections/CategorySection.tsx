'use client';

import Link from 'next/link';
import { CollectionCard } from './CollectionCard';
import { ChevronRight } from 'lucide-react';
import type { Collection, CollectionCategory } from '@/data/collections-seed';

interface CategorySectionProps {
  category: CollectionCategory;
  collections: Collection[];
  showViewAll?: boolean;
}

export function CategorySection({ category, collections, showViewAll = true }: CategorySectionProps) {
  if (collections.length === 0) return null;

  return (
    <section className="mb-10">
      {/* Category Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${category.color}20` }}
          >
            <span style={{ color: category.color }} className="text-lg">
              {getCategoryEmoji(category.icon)}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{category.name}</h2>
            <p className="text-sm text-slate-400">{category.description}</p>
          </div>
        </div>
        {showViewAll && (
          <Link
            href={`/explore/category/${category.id}`}
            className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 transition-colors"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Collection Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((c) => (
          <CollectionCard
            key={c.id}
            collection={{ ...c, category }}
          />
        ))}
      </div>
    </section>
  );
}

function getCategoryEmoji(icon: string): string {
  const map: Record<string, string> = {
    Anchor: '\u2693',
    Cpu: '\u{1F4BB}',
    Gem: '\u{1F48E}',
    Coins: '\u{1FA99}',
    Rocket: '\u{1F680}',
  };
  return map[icon] || '\u{1F4CA}';
}
