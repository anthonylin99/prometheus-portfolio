'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, BarChart3, Loader2 } from 'lucide-react';
import { collectionCategories, getCollectionsByCategory } from '@/data/collections-seed';
import { CollectionCard } from '@/components/collections/CollectionCard';
import { cn, formatCurrency, formatPercentagePrecise } from '@/lib/utils';
import type { VirtualPortfolioAnalytics } from '@/lib/virtual-portfolio-service';

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params.category as string;

  const category = collectionCategories.find((c) => c.id === categoryId);
  const categoryCollections = getCollectionsByCategory(categoryId);

  // Analytics state
  const [analytics, setAnalytics] = useState<VirtualPortfolioAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  // Fetch analytics on mount
  useEffect(() => {
    if (!categoryId) return;

    const fetchAnalytics = async () => {
      setAnalyticsLoading(true);
      setAnalyticsError(null);
      try {
        const res = await fetch(`/api/collections/category/${categoryId}/analytics`);
        if (!res.ok) throw new Error('Failed to fetch analytics');
        const data = await res.json();
        setAnalytics(data.analytics);
      } catch (err) {
        setAnalyticsError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchAnalytics();
  }, [categoryId]);

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

      {/* Category Analytics */}
      {analyticsLoading ? (
        <div className="glass-card p-6 rounded-2xl mb-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-violet-500 animate-spin mr-2" />
          <span className="text-slate-400">Loading analytics...</span>
        </div>
      ) : analyticsError ? (
        <div className="glass-card p-6 rounded-2xl mb-8">
          <p className="text-red-400 text-sm">{analyticsError}</p>
        </div>
      ) : analytics ? (
        <div className="mb-8 space-y-6">
          {/* Analytics Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-xl">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Day Change</p>
              <p className={cn(
                'text-xl font-bold',
                analytics.dayChangePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
              )}>
                {analytics.dayChangePercent >= 0 ? '+' : ''}{formatPercentagePrecise(analytics.dayChangePercent)}
              </p>
              <p className={cn(
                'text-sm',
                analytics.dayChange >= 0 ? 'text-emerald-400/70' : 'text-red-400/70'
              )}>
                {analytics.dayChange >= 0 ? '+' : ''}{formatCurrency(analytics.dayChange)}
              </p>
            </div>

            <div className="glass-card p-4 rounded-xl">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Top Gainer</p>
              {analytics.topGainer ? (
                <>
                  <p className="text-xl font-bold text-emerald-400">{analytics.topGainer.ticker}</p>
                  <p className="text-sm text-emerald-400/70">+{formatPercentagePrecise(analytics.topGainer.percent)}</p>
                </>
              ) : (
                <p className="text-slate-500">—</p>
              )}
            </div>

            <div className="glass-card p-4 rounded-xl">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Top Loser</p>
              {analytics.topLoser ? (
                <>
                  <p className="text-xl font-bold text-red-400">{analytics.topLoser.ticker}</p>
                  <p className="text-sm text-red-400/70">{formatPercentagePrecise(analytics.topLoser.percent)}</p>
                </>
              ) : (
                <p className="text-slate-500">—</p>
              )}
            </div>

            <div className="glass-card p-4 rounded-xl">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Movers</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-lg font-bold text-white">{analytics.stocksUp}</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  <span className="text-lg font-bold text-white">{analytics.stocksDown}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">{analytics.stocks.length} total stocks</p>
            </div>
          </div>

          {/* Stocks Performance List */}
          {analytics.stocks.length > 0 && (
            <div className="glass-card p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-violet-400" />
                  <h3 className="text-lg font-semibold text-white">Stocks in Category</h3>
                </div>
                <span className="text-sm text-slate-500">Sorted by day change</span>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {analytics.stocks.map((stock) => (
                  <div
                    key={stock.ticker}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{stock.ticker.slice(0, 3)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-white">{stock.ticker}</p>
                        <p className="text-xs text-slate-500">{formatCurrency(stock.currentPrice)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        'font-semibold',
                        stock.dayChangePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
                      )}>
                        {stock.dayChangePercent >= 0 ? '+' : ''}{formatPercentagePrecise(stock.dayChangePercent)}
                      </p>
                      <p className={cn(
                        'text-xs',
                        stock.dayChange >= 0 ? 'text-emerald-400/70' : 'text-red-400/70'
                      )}>
                        {stock.dayChange >= 0 ? '+' : ''}{formatCurrency(stock.dayChange)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

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
