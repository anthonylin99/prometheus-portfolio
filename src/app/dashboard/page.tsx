'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { Header } from '@/components/layout/Header';
import { AllocationDonut } from '@/components/charts/AllocationDonut';
import { HoldingsBar } from '@/components/charts/HoldingsBar';
import { TopHoldingCard } from '@/components/cards/TopHoldingCard';
import { StatCard } from '@/components/cards/StatCard';
import { PortfolioSelector, PortfolioView } from '@/components/portfolio/PortfolioSelector';
import { TodaysMovers } from '@/components/dashboard/TodaysMovers';
import { useUserPortfolio, useUserProfile, useAggregatedPortfolio } from '@/lib/hooks';
import { useClearSensitiveData } from '@/lib/use-clear-on-leave';
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
  Lock,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

/**
 * UserDashboard - Stripe-inspired portfolio dashboard
 *
 * Design Philosophy:
 * - Flowing gradient background with subtle animations
 * - Premium card layouts with gradient accents
 * - Clean, Robinhood-style data presentation
 * - Micro-interactions that bring the interface to life
 */

export default function UserDashboard() {
  const router = useRouter();
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';
  const { profile, loading: profileLoading } = useUserProfile();
  const [portfolioView, setPortfolioView] = useState<PortfolioView>('personal');

  // Clear sensitive data from browser history on navigation
  useClearSensitiveData();

  // Only fetch portfolio data when authenticated
  const userPortfolio = useUserPortfolio();
  const aggregatedPortfolio = useAggregatedPortfolio(portfolioView);

  // Determine which data to use based on view selection (only for authenticated users)
  const { holdings, summary, categories, loading, error, refresh } =
    portfolioView === 'personal'
      ? userPortfolio
      : aggregatedPortfolio;

  // Redirect to onboarding if authenticated but not onboarded
  useEffect(() => {
    if (isAuthenticated && !profileLoading && profile && !profile.onboarded) {
      router.replace('/onboarding');
    }
  }, [isAuthenticated, profileLoading, profile, router]);

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 min-h-screen relative">
        <div className="stripe-gradient-bg" />
        <div className="relative z-10 flex items-center justify-center min-h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-[#A78BFA] animate-spin" />
              <div className="absolute inset-0 blur-xl bg-[#A78BFA]/30" />
            </div>
            <p className="text-[#a1a1aa]">Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  // SECURITY: Show sign-in prompt when not authenticated
  if (!isAuthenticated) {
    return (
      <div className="p-6 lg:p-8 min-h-screen relative">
        <div className="stripe-gradient-bg" />
        <div className="relative z-10 flex items-center justify-center min-h-[80vh]">
          <div className="gradient-card p-10 text-center max-w-md">
            <div className="card-gradient-animated opacity-10" />
            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#A78BFA] to-[#C4B5FD] flex items-center justify-center shadow-lg shadow-[#A78BFA]/30">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Portfolio Access Required
              </h2>
              <p className="text-[#a1a1aa] mb-8">
                Sign in to view your portfolio and track your investments securely.
              </p>
              <button
                onClick={() => signIn('google')}
                className="btn-primary w-full justify-center"
              >
                <Sparkles className="w-4 h-4" />
                Sign In to Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="p-6 lg:p-8 min-h-screen relative">
        <div className="stripe-gradient-bg" />
        <div className="relative z-10 flex items-center justify-center min-h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-[#A78BFA] animate-spin" />
              <div className="absolute inset-0 blur-xl bg-[#A78BFA]/30" />
            </div>
            <p className="text-[#a1a1aa]">Loading your portfolio...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading && holdings.length === 0) {
    return (
      <div className="p-6 lg:p-8 min-h-screen relative">
        <div className="stripe-gradient-bg" />
        <div className="relative z-10 flex items-center justify-center min-h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 border-3 border-[#A78BFA] border-t-transparent rounded-full animate-spin" />
              <div className="absolute inset-0 blur-xl bg-[#A78BFA]/30" />
            </div>
            <p className="text-[#a1a1aa]">Fetching market data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && holdings.length === 0) {
    return (
      <div className="p-6 lg:p-8 min-h-screen relative">
        <div className="stripe-gradient-bg" />
        <div className="relative z-10 flex items-center justify-center min-h-[80vh]">
          <div className="gradient-card p-8 text-center max-w-md">
            <p className="text-[#ef4444] mb-4">Error loading portfolio: {error}</p>
            <button
              onClick={refresh}
              className="btn-primary"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const topHoldings = holdings.slice(0, 5);

  // Determine header title based on view
  const getHeaderInfo = () => {
    if (portfolioView === 'combined') {
      return { ticker: 'COMBINED', name: 'Combined Portfolio' };
    }
    return {
      ticker: profile?.etfTicker || 'ETF',
      name: profile?.etfName || 'My Portfolio',
    };
  };

  const { ticker: etfTicker, name: etfName } = getHeaderInfo();

  // Empty portfolio state
  if (holdings.length === 0 && !loading) {
    return (
      <div className="p-6 lg:p-8 min-h-screen relative">
        <div className="stripe-gradient-bg" />
        <div className="relative z-10">
          <Header
            title={`$${etfTicker}`}
            subtitle={etfName}
            totalValue={0}
            change={0}
            changePercent={0}
            lastUpdated={new Date().toISOString()}
          />
          <div className="mt-12 flex flex-col items-center justify-center text-center">
            <div className="gradient-card p-10 max-w-md">
              <div className="card-gradient-animated opacity-10" />
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#A78BFA] to-[#C4B5FD] flex items-center justify-center shadow-lg shadow-[#A78BFA]/30">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Your portfolio is empty
                </h2>
                <p className="text-[#a1a1aa] mb-8">
                  Add your first holding to start tracking your portfolio performance.
                </p>
                <Link href="/holdings" className="btn-primary w-full justify-center">
                  <Plus className="w-4 h-4" />
                  Add Your First Holding
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 min-h-screen relative">
      {/* Stripe-style flowing gradient background */}
      <div className="stripe-gradient-bg" />

      <div className="relative z-10">
        <Header
          title={`$${etfTicker}`}
          subtitle={etfName}
          totalValue={summary.totalValue}
          change={summary.dayChange}
          changePercent={summary.dayChangePercent}
          lastUpdated={summary.lastUpdated}
        />

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {/* Portfolio Selector */}
          <PortfolioSelector
            selected={portfolioView}
            onSelect={setPortfolioView}
            personalLabel={profile?.etfTicker ? `$${profile.etfTicker}` : 'My Portfolio'}
          />

          <div className="flex-1" />

          <button
            onClick={refresh}
            disabled={loading}
            className="glass-card px-4 py-2.5 rounded-xl flex items-center gap-2 text-[#a1a1aa] hover:text-white hover:border-[#A78BFA]/40 transition-all disabled:opacity-50 text-sm font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>

          {profile?.circleId ? (
            <Link
              href="/circle"
              className="glass-card px-4 py-2.5 rounded-xl flex items-center gap-2 text-[#a1a1aa] hover:text-white hover:border-[#A78BFA]/40 transition-all text-sm font-medium"
            >
              <Users className="w-4 h-4" />
              View Circle
            </Link>
          ) : (
            <Link
              href="/circle"
              className="glass-card px-4 py-2.5 rounded-xl flex items-center gap-2 text-[#A78BFA] hover:text-white hover:border-[#A78BFA]/40 transition-all text-sm font-medium border-[#A78BFA]/20"
            >
              <Users className="w-4 h-4" />
              Join a Circle
            </Link>
          )}
        </div>

        {/* Stats Row - Bento style with different gradients */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Holdings"
            value={summary.holdingsCount.toString()}
            icon={Wallet}
            gradient={1}
          />
          <StatCard
            label="Categories"
            value={summary.categoriesCount.toString()}
            icon={Layers}
            gradient={2}
          />
          <StatCard
            label="Largest Position"
            value={formatCurrency(topHoldings[0]?.value || 0)}
            change={topHoldings[0]?.ticker}
            changeType="neutral"
            icon={TrendingUp}
            gradient={3}
          />
          <StatCard
            label="Avg. Position Size"
            value={formatCurrency(summary.totalValue / summary.holdingsCount || 0)}
            icon={PieChart}
            gradient={4}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
          <div className="xl:col-span-7 gradient-card">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">Holdings</h3>
                  <p className="text-sm text-[#71717a]">Sorted by value</p>
                </div>
                <span className="text-sm text-[#52525b] px-3 py-1 rounded-full bg-white/5">
                  {holdings.length} positions
                </span>
              </div>
              <HoldingsBar holdings={holdings} />
            </div>
          </div>

          <div className="xl:col-span-5 gradient-card">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Allocation</h3>
                  <p className="text-sm text-[#71717a]">By category</p>
                </div>
              </div>
              <AllocationDonut data={categories} totalValue={summary.totalValue} />
            </div>
          </div>
        </div>

        {/* Today's Movers + Top Holdings Row */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
          {/* Today's Movers */}
          <div className="xl:col-span-4">
            <TodaysMovers holdings={holdings} maxItems={3} />
          </div>

          {/* Top Holdings */}
          {topHoldings.length > 0 && (
            <div className="xl:col-span-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Top Holdings</h3>
                  <p className="text-sm text-[#71717a]">Largest positions</p>
                </div>
                <Link
                  href="/holdings"
                  className="text-sm text-[#A78BFA] hover:text-[#C4B5FD] font-medium transition-colors"
                >
                  View all
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {topHoldings.slice(0, 4).map((holding, index) => (
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
      </div>
    </div>
  );
}
