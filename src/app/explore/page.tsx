'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { collectionCategories, collections, getCollectionsByCategory } from '@/data/collections-seed';
import { CategorySection } from '@/components/collections/CategorySection';
import { CollectionCard } from '@/components/collections/CollectionCard';
import { CollectionSearchBar } from '@/components/collections/CollectionSearchBar';
import { Compass, Star, Send } from 'lucide-react';

export default function ExplorePage() {
  const [query, setQuery] = useState('');

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
  }, []);

  const filteredCollections = useMemo(() => {
    if (!query.trim()) return null; // null = show categories view
    const q = query.toLowerCase().trim();
    return collections.filter((c) => {
      if (c.name.toLowerCase().includes(q)) return true;
      if (c.description.toLowerCase().includes(q)) return true;
      if (c.tags.some((t) => t.includes(q))) return true;
      if (c.stocks.some((s) => s.ticker.toLowerCase() === q)) return true;
      return false;
    });
  }, [query]);

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <Compass className="w-5 h-5 text-violet-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Explore Collections</h1>
        </div>
        <p className="text-slate-400 ml-[52px]">
          Curated stock collections organized by investment themes and strategies
        </p>

        {/* Quick Actions */}
        <div className="flex items-center gap-3 ml-[52px] mt-3">
          <Link
            href="/watchlist"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-colors text-sm"
          >
            <Star className="w-4 h-4" />
            My Watchlist
          </Link>
          <Link
            href="/submit-collection"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors text-sm"
          >
            <Send className="w-4 h-4" />
            Submit Collection
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="mb-8">
        <CollectionSearchBar onSearch={handleSearch} />
      </div>

      {/* Search Results or Categories */}
      {filteredCollections ? (
        <div>
          <p className="text-sm text-slate-400 mb-4">
            {filteredCollections.length} collection{filteredCollections.length !== 1 ? 's' : ''} matching &ldquo;{query}&rdquo;
          </p>
          {filteredCollections.length === 0 ? (
            <div className="glass-card p-12 rounded-2xl text-center">
              <p className="text-slate-400 mb-2">No collections found</p>
              <p className="text-sm text-slate-500">Try a different search term or browse by category below</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCollections.map((c) => {
                const cat = collectionCategories.find((cat) => cat.id === c.categoryId);
                return (
                  <CollectionCard
                    key={c.id}
                    collection={{ ...c, category: cat }}
                  />
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div>
          {collectionCategories.map((category) => {
            const catCollections = getCollectionsByCategory(category.id);
            return (
              <CategorySection
                key={category.id}
                category={category}
                collections={catCollections}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
