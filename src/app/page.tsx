'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { AllocationDonut } from '@/components/charts/AllocationDonut';
import { HoldingsBar } from '@/components/charts/HoldingsBar';
import { TopHoldingCard } from '@/components/cards/TopHoldingCard';
import { StatCard } from '@/components/cards/StatCard';
import { ETFCard } from '@/components/cards/ETFCard';
import { usePortfolio, useETF, useAuth } from '@/lib/hooks';
import { formatCurrency, getRelativeTime } from '@/lib/utils';
import { Wallet, PieChart, TrendingUp, Layers, RefreshCw, Rocket, X } from 'lucide-react';

export default function Dashboard() {
  const { holdings, summary, categories, loading, error, refresh, cached } = usePortfolio();
  const { etf } = useETF();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [bannerDismissed, setBannerDismissed] = useState(false);

  if (loading && holdings.length === 0) {
    return (
      <div className="p-6 lg:p-8 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400">Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  if (error && holdings.length === 0) {
    return (
      <div className="p-6 lg:p-8 min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 rounded-2xl text-center max-w-md">
          <p className="text-red-400 mb-4">Error loading portfolio: {error}</p>
          <button 
            onClick={refresh}
            className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const topHoldings = holdings.slice(0, 5);

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      {/* CTA Banner for unauthenticated visitors */}
      {!authLoading && !isAuthenticated && !bannerDismissed && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-violet-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Rocket className="w-5 h-5 text-violet-400 flex-shrink-0" />
            <p className="text-sm text-slate-300">
              <span className="text-white font-medium">Create your own ETF</span>{' '}
              and compete with friends on portfolio performance
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/login"
              className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Get Started
            </Link>
            <button
              onClick={() => setBannerDismissed(true)}
              className="p-1 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <Header
        title="Prometheus ETF"
        subtitle="Personal Investment Portfolio"
        totalValue={summary.totalValue}
        change={summary.dayChange}
        changePercent={summary.dayChangePercent}
        lastUpdated={summary.lastUpdated}
      />

      {/* ETF Card & Refresh */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        {etf && <ETFCard etf={etf} className="flex-1" />}
        
        <button
          onClick={refresh}
          disabled={loading}
          className="glass-card px-4 py-3 rounded-xl flex items-center gap-2 text-slate-400 hover:text-white hover:border-violet-500/40 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="text-sm">
            {loading ? 'Refreshing...' : cached ? 'Refresh Prices' : 'Prices Updated'}
          </span>
          {cached && summary.lastUpdated && (
            <span className="text-xs text-slate-500">
              ({getRelativeTime(summary.lastUpdated)})
            </span>
          )}
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          label="Total Holdings"
          value={summary.holdingsCount.toString()}
          icon={Wallet}
        />
        <StatCard 
          label="Categories"
          value={summary.categoriesCount.toString()}
          icon={Layers}
        />
        <StatCard 
          label="Largest Position"
          value={formatCurrency(topHoldings[0]?.value || 0)}
          change={topHoldings[0]?.ticker}
          changeType="neutral"
          icon={TrendingUp}
        />
        <StatCard 
          label="Avg. Position Size"
          value={formatCurrency(summary.totalValue / summary.holdingsCount || 0)}
          icon={PieChart}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
        {/* Holdings Bar Chart */}
        <div className="xl:col-span-7 glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">Holdings</h3>
              <p className="text-sm text-slate-400">Sorted by value • Click to view details</p>
            </div>
            <span className="text-sm text-slate-500">{holdings.length} positions</span>
          </div>
          <HoldingsBar holdings={holdings} />
        </div>

        {/* Allocation Donut */}
        <div className="xl:col-span-5 glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white">Allocation</h3>
              <p className="text-sm text-slate-400">By category</p>
            </div>
          </div>
          <AllocationDonut data={categories} totalValue={summary.totalValue} />
        </div>
      </div>

      {/* Top Holdings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white">Top Holdings</h3>
            <p className="text-sm text-slate-400">Largest positions in portfolio</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {topHoldings.map((holding, index) => (
            <TopHoldingCard 
              key={holding.ticker}
              holding={holding}
              rank={index + 1}
              portfolioPercentage={holding.weight}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
