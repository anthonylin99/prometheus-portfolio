'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { DispersionChart, DispersionChartHeader } from '@/components/charts/DispersionChart';
import { SMAData, SMAPeriod, SMA_PERIODS } from '@/types/sma';
import { cn } from '@/lib/utils';
import { TrendingDown, Loader2, RefreshCw, BarChart3, ChevronDown } from 'lucide-react';
import { useCircle } from '@/lib/hooks';

type DataSource = 'portfolio' | 'watchlist';
type PortfolioType = 'personal' | 'sample' | 'friend';

interface PortfolioOption {
  id: string;
  type: PortfolioType;
  label: string;
  userId?: string;
}

interface SMAResponse {
  data: SMAData[];
  period: number;
  source: string;
  portfolioType?: string;
  calculatedAt: string;
}

export default function DipFinderPage() {
  const [source, setSource] = useState<DataSource>('portfolio');
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioOption>({
    id: 'personal',
    type: 'personal',
    label: 'My Portfolio',
  });
  const [period, setPeriod] = useState<SMAPeriod>(50);
  const [data, setData] = useState<SMAData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [showPortfolioDropdown, setShowPortfolioDropdown] = useState(false);

  const { circle } = useCircle();

  // Build portfolio options
  const portfolioOptions: PortfolioOption[] = [
    { id: 'personal', type: 'personal', label: 'My Portfolio' },
    { id: 'sample', type: 'sample', label: 'Prometheus ETF ($ALIN)' },
  ];

  // Add circle members if available
  if (circle?.members) {
    circle.members.forEach((memberId, index) => {
      // Skip showing current user in circle members list
      portfolioOptions.push({
        id: `friend-${memberId}`,
        type: 'friend',
        label: `Circle Member ${index + 1}`,
        userId: memberId,
      });
    });
  }

  const fetchSMAData = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/sma?source=${source}&period=${period}`;
      if (source === 'portfolio') {
        url += `&portfolioType=${selectedPortfolio.type}`;
        if (selectedPortfolio.userId) {
          url += `&userId=${selectedPortfolio.userId}`;
        }
      }
      const res = await fetch(url);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to fetch SMA data');
      }
      const result: SMAResponse = await res.json();
      setData(result.data);
      setLastUpdated(result.calculatedAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSMAData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, period, selectedPortfolio]);

  const maxDeviation = data.length > 0
    ? Math.max(...data.map((d) => Math.abs(d.deviation)), 10)
    : 20;

  // Separate dips (below SMA) from gains (above SMA)
  const dips = data.filter((d) => d.deviation < 0);
  const gains = data.filter((d) => d.deviation >= 0);

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <Header
        title="Dip Finder"
        subtitle="Find stocks trading below their moving average"
      />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-8">
        {/* Data Source Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Source:</span>
          <div className="flex rounded-lg overflow-hidden border border-slate-700/50">
            <button
              onClick={() => setSource('portfolio')}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors',
                source === 'portfolio'
                  ? 'bg-[#9b8ac4] text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white'
              )}
            >
              Portfolio
            </button>
            <button
              onClick={() => setSource('watchlist')}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors',
                source === 'watchlist'
                  ? 'bg-[#9b8ac4] text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white'
              )}
            >
              Watchlist
            </button>
          </div>
        </div>

        {/* Portfolio Selector - Only show when source is portfolio */}
        {source === 'portfolio' && (
          <div className="flex items-center gap-2 relative">
            <span className="text-sm text-slate-400">Portfolio:</span>
            <div className="relative">
              <button
                onClick={() => setShowPortfolioDropdown(!showPortfolioDropdown)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white text-sm hover:bg-slate-700/50 transition-colors min-w-[180px] justify-between"
              >
                <span className="truncate">{selectedPortfolio.label}</span>
                <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', showPortfolioDropdown && 'rotate-180')} />
              </button>
              {showPortfolioDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-700/60 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                  {portfolioOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setSelectedPortfolio(option);
                        setShowPortfolioDropdown(false);
                      }}
                      className={cn(
                        'w-full text-left px-4 py-2.5 text-sm hover:bg-slate-700/50 transition-colors',
                        option.id === selectedPortfolio.id
                          ? 'text-[#9b8ac4] bg-slate-700/30'
                          : 'text-slate-300'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SMA Period Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">SMA Period:</span>
          <div className="flex rounded-lg overflow-hidden border border-slate-700/50">
            {SMA_PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  'px-3 py-2 text-sm font-medium transition-colors',
                  period === p
                    ? 'bg-[#9b8ac4] text-white'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white'
                )}
              >
                {p}D
              </button>
            ))}
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={fetchSMAData}
          disabled={loading}
          className="ml-auto glass-card px-4 py-2 rounded-lg flex items-center gap-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-violet-500 animate-spin mb-4" />
          <p className="text-slate-400">Calculating SMA deviation...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="glass-card p-8 rounded-2xl text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchSMAData}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-500 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && data.length === 0 && (
        <div className="glass-card p-10 rounded-2xl text-center max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-violet-500/20 flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-violet-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            No Data Available
          </h2>
          <p className="text-slate-400 text-sm">
            {source === 'portfolio'
              ? 'Add holdings to your portfolio to see SMA analysis.'
              : 'Add stocks to your watchlist to see SMA analysis.'}
          </p>
        </div>
      )}

      {/* Results */}
      {!loading && !error && data.length > 0 && (
        <div className="space-y-8">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-xl">
              <p className="text-slate-400 text-xs mb-1">Total Stocks</p>
              <p className="text-2xl font-bold text-white">{data.length}</p>
            </div>
            <div className="glass-card p-4 rounded-xl">
              <p className="text-slate-400 text-xs mb-1">Below SMA</p>
              <p className="text-2xl font-bold text-red-400">{dips.length}</p>
            </div>
            <div className="glass-card p-4 rounded-xl">
              <p className="text-slate-400 text-xs mb-1">Above SMA</p>
              <p className="text-2xl font-bold text-emerald-400">{gains.length}</p>
            </div>
            <div className="glass-card p-4 rounded-xl">
              <p className="text-slate-400 text-xs mb-1">Biggest Dip</p>
              <p className="text-2xl font-bold text-red-400">
                {dips.length > 0 ? `${dips[0].deviation.toFixed(1)}%` : 'N/A'}
              </p>
            </div>
          </div>

          {/* Dips Section */}
          {dips.length > 0 && (
            <div className="glass-card p-6 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="w-5 h-5 text-red-400" />
                <h3 className="text-lg font-bold text-white">
                  Below {period}-Day SMA
                </h3>
                <span className="text-sm text-slate-500">
                  ({dips.length} stocks)
                </span>
              </div>
              <DispersionChartHeader maxDeviation={maxDeviation} />
              <DispersionChart data={dips} maxDeviation={maxDeviation} />
            </div>
          )}

          {/* Gains Section */}
          {gains.length > 0 && (
            <div className="glass-card p-6 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="w-5 h-5 text-emerald-400 rotate-180" />
                <h3 className="text-lg font-bold text-white">
                  Above {period}-Day SMA
                </h3>
                <span className="text-sm text-slate-500">
                  ({gains.length} stocks)
                </span>
              </div>
              <DispersionChartHeader maxDeviation={maxDeviation} />
              <DispersionChart data={gains} maxDeviation={maxDeviation} />
            </div>
          )}

          {/* Last Updated */}
          {lastUpdated && (
            <p className="text-center text-xs text-slate-500">
              Last calculated: {new Date(lastUpdated).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
