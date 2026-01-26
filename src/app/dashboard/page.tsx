'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { AllocationDonut } from '@/components/charts/AllocationDonut';
import { HoldingsBar } from '@/components/charts/HoldingsBar';
import { TopHoldingCard } from '@/components/cards/TopHoldingCard';
import { StatCard } from '@/components/cards/StatCard';
import { useUserPortfolio, useAuth, useUserProfile } from '@/lib/hooks';
import { formatCurrency } from '@/lib/utils';
import {
  Wallet,
  PieChart,
  TrendingUp,
  Layers,
  RefreshCw,
  Plus,
  Users,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

export default function UserDashboard() {
  const router = useRouter();
  const { isLoading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const { holdings, summary, categories, loading, error, refresh } =
    useUserPortfolio();

  // Redirect to onboarding if not onboarded
  useEffect(() => {
    if (!authLoading && !profileLoading && profile && !profile.onboarded) {
      router.push('/onboarding');
    }
  }, [authLoading, profileLoading, profile, router]);

  if (authLoading || profileLoading) {
    return (
      <div className="p-6 lg:p-8 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
          <p className="text-slate-400">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

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
  const etfTicker = profile?.etfTicker || 'ETF';
  const etfName = profile?.etfName || 'My Portfolio';

  // Empty portfolio state
  if (holdings.length === 0 && !loading) {
    return (
      <div className="p-6 lg:p-8 min-h-screen">
        <Header
          title={`$${etfTicker}`}
          subtitle={etfName}
          totalValue={0}
          change={0}
          changePercent={0}
          lastUpdated={new Date().toISOString()}
        />
        <div className="mt-12 flex flex-col items-center justify-center text-center">
          <div className="glass-card p-10 rounded-2xl max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-violet-500/20 flex items-center justify-center">
              <Wallet className="w-8 h-8 text-violet-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Your portfolio is empty
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              Add your first holding to start tracking your portfolio
              performance.
            </p>
            <Link
              href="/holdings"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium rounded-xl shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-purple-500 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Holdings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <Header
        title={`$${etfTicker}`}
        subtitle={etfName}
        totalValue={summary.totalValue}
        change={summary.dayChange}
        changePercent={summary.dayChangePercent}
        lastUpdated={summary.lastUpdated}
      />

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={refresh}
          disabled={loading}
          className="glass-card px-4 py-2.5 rounded-xl flex items-center gap-2 text-slate-400 hover:text-white hover:border-violet-500/40 transition-all disabled:opacity-50 text-sm"
        >
          <RefreshCw
            className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
          />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>

        {profile?.circleId ? (
          <Link
            href="/circle"
            className="glass-card px-4 py-2.5 rounded-xl flex items-center gap-2 text-slate-400 hover:text-white hover:border-violet-500/40 transition-all text-sm"
          >
            <Users className="w-4 h-4" />
            View Circle
          </Link>
        ) : (
          <Link
            href="/circle"
            className="glass-card px-4 py-2.5 rounded-xl flex items-center gap-2 text-violet-400 hover:text-white hover:border-violet-500/40 transition-all text-sm border-violet-500/20"
          >
            <Users className="w-4 h-4" />
            Join a Circle
          </Link>
        )}
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
          value={formatCurrency(
            summary.totalValue / summary.holdingsCount || 0
          )}
          icon={PieChart}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
        <div className="xl:col-span-7 glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">Holdings</h3>
              <p className="text-sm text-slate-400">
                Sorted by value
              </p>
            </div>
            <span className="text-sm text-slate-500">
              {holdings.length} positions
            </span>
          </div>
          <HoldingsBar holdings={holdings} />
        </div>

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
      {topHoldings.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white">Top Holdings</h3>
              <p className="text-sm text-slate-400">
                Largest positions in portfolio
              </p>
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
      )}
    </div>
  );
}
