'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Header } from '@/components/layout/Header';
import { HealthScoreCard } from '@/components/insights/HealthScoreCard';
import { SignalsCard } from '@/components/insights/SignalsCard';
import { OpportunityCard } from '@/components/insights/OpportunityCard';
import { TechnicalMetrics } from '@/components/insights/TechnicalMetrics';
import type { PortfolioInsights } from '@/types/insights';
import { Loader2, Lock, RefreshCw, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InsightsResponse {
  insights: PortfolioInsights;
  holdingsCount: number;
  signalsGenerated: number;
}

export default function InsightsPage() {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';

  const [insights, setInsights] = useState<PortfolioInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [holdingsCount, setHoldingsCount] = useState(0);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/insights/portfolio');
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to fetch insights');
      }
      const data: InsightsResponse = await res.json();
      setInsights(data.insights);
      setHoldingsCount(data.holdingsCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchInsights();
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#9b8ac4] animate-spin" />
          <p className="text-slate-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-6 lg:p-8 min-h-screen flex items-center justify-center">
        <div className="glass-card p-10 rounded-2xl text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#9b8ac4]/20 flex items-center justify-center">
            <Lock className="w-8 h-8 text-[#9b8ac4]" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Insights Require Authentication
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            Sign in to access AI-powered portfolio insights and technical analysis.
          </p>
          <button
            onClick={() => signIn('google')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#7c6baa] to-[#9b8ac4] text-white font-medium rounded-xl shadow-lg shadow-[#9b8ac4]/25 hover:from-[#9b8ac4] hover:to-[#b8a8d9] transition-all"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <Header
        title="Insights Hub"
        subtitle="AI-powered portfolio analysis and signals"
      />

      {/* Quick Actions */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#9b8ac4]/10 border border-[#9b8ac4]/20">
          <Sparkles className="w-4 h-4 text-[#9b8ac4]" />
          <span className="text-sm text-[#9b8ac4]">
            Analyzing {holdingsCount} holdings
          </span>
        </div>
        <div className="flex-1" />
        <button
          onClick={fetchInsights}
          disabled={loading}
          className="glass-card px-4 py-2.5 rounded-xl flex items-center gap-2 text-slate-400 hover:text-white hover:border-[#9b8ac4]/40 transition-all disabled:opacity-50 text-sm"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          {loading ? 'Analyzing...' : 'Refresh'}
        </button>
      </div>

      {/* Loading State */}
      {loading && !insights && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-[#9b8ac4] animate-spin mb-4" />
          <p className="text-slate-400">Generating portfolio insights...</p>
          <p className="text-xs text-slate-500 mt-1">This may take a few moments</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="glass-card p-8 rounded-2xl text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchInsights}
            className="px-4 py-2 bg-[#9b8ac4] text-white rounded-lg hover:bg-[#7c6baa] transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Content */}
      {insights && !loading && (
        <div className="space-y-6">
          {/* Top Row: Health Score + Signals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HealthScoreCard health={insights.health} />
            <SignalsCard alerts={insights.alerts} />
          </div>

          {/* Bottom Row: Technical Analysis + Opportunities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TechnicalMetrics signals={insights.signals} />
            <OpportunityCard opportunities={insights.opportunities} />
          </div>

          {/* Last Updated */}
          <p className="text-center text-xs text-slate-500">
            Last analyzed: {new Date(insights.calculatedAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
