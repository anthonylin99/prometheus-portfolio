'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { collectionCategories, getCollectionsByCategory } from '@/data/collections-seed';
import { CollectionCard } from '@/components/collections/CollectionCard';

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params.category as string;

  const category = collectionCategories.find((c) => c.id === categoryId);
  const categoryCollections = getCollectionsByCategory(categoryId);

  if (!category) {
    return (
      <div className="p-6 lg:p-8 min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 rounded-2xl text-center max-w-md">
          <p className="text-slate-400 mb-4">Category not found</p>
          <Link
            href="/explore"
            className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors inline-block"
          >
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      {/* Back Button */}
      <Link
        href="/explore"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Explore
      </Link>

      {/* Header */}
      <div className="glass-card p-8 rounded-3xl mb-8 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{ background: `linear-gradient(135deg, ${category.color}, transparent)` }}
        />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${category.color}20` }}
            >
              {getCategoryEmoji(category.icon)}
            </div>
            <h1 className="text-3xl font-bold text-white">{category.name}</h1>
          </div>
          <p className="text-slate-400 ml-[60px] max-w-2xl">{category.description}</p>
          <p className="text-sm text-slate-500 ml-[60px] mt-2">
            {categoryCollections.length} collection{categoryCollections.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoryCollections.map((c) => (
          <CollectionCard key={c.id} collection={{ ...c, category }} />
        ))}
      </div>
    </div>
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
