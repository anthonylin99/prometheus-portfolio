'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Header } from '@/components/layout/Header';
import { HoldingsTable } from '@/components/tables/HoldingsTable';
import { CategoryHoldingsSection } from '@/components/charts/CategoryHoldingsSection';
import { usePortfolio, useUserPortfolio, useUserProfile } from '@/lib/hooks';
import { RefreshCw, Plus, Wallet, Flame, Search, X, Loader2 } from 'lucide-react';
import { getRelativeTime, cn } from '@/lib/utils';
import { CompanyLogo } from '@/components/ui/CompanyLogo';

export default function HoldingsPage() {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  // Use the appropriate hook based on auth status
  const publicPortfolio = usePortfolio();
  const userPortfolio = useUserPortfolio();
  const { profile } = useUserProfile();

  // Select data based on auth status
  const { holdings, summary, categories, loading, refresh, cached } = isAuthenticated
    ? userPortfolio
    : publicPortfolio;

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ ticker: string; name: string }>>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 1) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`/api/search/tickers?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleAddTicker = async (ticker: string) => {
    // Clear search results immediately to close dropdown
    setSearchResults([]);
    setAdding(ticker);
    try {
      const res = await fetch('/api/user/holdings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker, shares: 1 }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setSearchQuery('');
        refresh();
      }
    } catch (err) {
      console.error('Failed to add ticker:', err);
    } finally {
      setAdding(null);
    }
  };

  if (loading && holdings.length === 0) {
    return (
      <div className="p-6 lg:p-8 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-violet-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400">Loading holdings...</p>
        </div>
      </div>
    );
  }

  // Empty state for authenticated users with no holdings
  if (isAuthenticated && holdings.length === 0 && !loading) {
    return (
      <div className="p-6 lg:p-8 min-h-screen">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
          <Header 
            title="Holdings"
            subtitle="Manage and track all portfolio positions"
          />
        </div>

        <div className="mt-8 flex flex-col items-center justify-center text-center">
          <div className="glass-card p-10 rounded-2xl max-w-lg">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-violet-400/20 flex items-center justify-center">
              <Wallet className="w-8 h-8 text-violet-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Your portfolio is empty
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              Add your first holding to start tracking your portfolio performance and compete with your circle.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-400 to-violet-400 text-white font-medium rounded-xl shadow-lg shadow-violet-400/25 hover:from-violet-400 hover:to-purple-500 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Your First Holding
              </button>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 glass-card text-slate-300 font-medium rounded-xl hover:text-white hover:border-violet-400/40 transition-all"
              >
                <Flame className="w-4 h-4 text-orange-400" />
                View Prometheus ETF
              </Link>
            </div>
          </div>
        </div>

        {/* Add Ticker Modal */}
        {showAddModal && (
          <AddTickerModal
            searchQuery={searchQuery}
            searchResults={searchResults}
            searching={searching}
            adding={adding}
            existingTickers={holdings.map(h => h.ticker.toUpperCase())}
            portfolioName={profile?.etfTicker ? `$${profile.etfTicker}` : 'My Portfolio'}
            onSearch={handleSearch}
            onAdd={handleAddTicker}
            onClose={() => {
              setShowAddModal(false);
              setSearchQuery('');
              setSearchResults([]);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
        <Header 
          title="Holdings"
          subtitle={isAuthenticated && profile?.etfTicker ? `$${profile.etfTicker} Portfolio` : "Manage and track all portfolio positions"}
        />
        
        <div className="flex flex-wrap gap-2 self-start">
          {isAuthenticated && (
            <button
              onClick={() => setShowAddModal(true)}
              className="glass-card px-4 py-3 rounded-xl flex items-center gap-2 text-violet-400 hover:text-white hover:border-violet-400/40 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Add Ticker</span>
            </button>
          )}
          
          {!isAuthenticated && (
            <Link
              href="/"
              className="glass-card px-4 py-3 rounded-xl flex items-center gap-2 text-orange-400 hover:text-white hover:border-orange-500/40 transition-all"
            >
              <Flame className="w-4 h-4" />
              <span className="text-sm">Prometheus ETF</span>
            </Link>
          )}
          
          <button
            onClick={refresh}
            disabled={loading}
            className="glass-card px-4 py-3 rounded-xl flex items-center gap-2 text-slate-400 hover:text-white hover:border-violet-400/40 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm">
              {loading ? 'Refreshing...' : 'Refresh'}
            </span>
            {cached && summary.lastUpdated && (
              <span className="text-xs text-slate-500">
                ({getRelativeTime(summary.lastUpdated)})
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Individual Holdings Table */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-white mb-4">All Holdings</h3>
        <HoldingsTable holdings={holdings} totalValue={summary.totalValue} onRefresh={refresh} />
      </div>

      {/* Category Overview with Pie Chart */}
      <div>
        <CategoryHoldingsSection data={categories} totalValue={summary.totalValue} />
      </div>

      {/* Add Ticker Modal */}
      {showAddModal && (
        <AddTickerModal
          searchQuery={searchQuery}
          searchResults={searchResults}
          searching={searching}
          adding={adding}
          existingTickers={holdings.map(h => h.ticker.toUpperCase())}
          portfolioName={profile?.etfTicker ? `$${profile.etfTicker}` : 'My Portfolio'}
          onSearch={handleSearch}
          onAdd={handleAddTicker}
          onClose={() => {
            setShowAddModal(false);
            setSearchQuery('');
            setSearchResults([]);
          }}
        />
      )}
    </div>
  );
}

interface AddTickerModalProps {
  searchQuery: string;
  searchResults: Array<{ ticker: string; name: string }>;
  searching: boolean;
  adding: string | null;
  existingTickers: string[];
  portfolioName: string;
  onSearch: (query: string) => void;
  onAdd: (ticker: string) => void;
  onClose: () => void;
}

function AddTickerModal({
  searchQuery,
  searchResults,
  searching,
  adding,
  existingTickers,
  portfolioName,
  onSearch,
  onAdd,
  onClose,
}: AddTickerModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card p-6 rounded-2xl w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-2">Add Holding</h2>
        <p className="text-sm text-slate-400 mb-4">Adding to: <span className="text-violet-400">{portfolioName}</span></p>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search by ticker or company name..."
            autoFocus
            className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-400/50 focus:ring-1 focus:ring-violet-400/25 transition-colors"
          />
        </div>

        <div className="max-h-64 overflow-y-auto space-y-2">
          {searching && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
            </div>
          )}

          {!searching && searchResults.length === 0 && searchQuery.length > 0 && (
            <p className="text-center text-slate-500 py-8">No results found</p>
          )}

          {!searching && searchResults.map((result) => {
            const isInPortfolio = existingTickers.includes(result.ticker.toUpperCase());
            
            return (
              <button
                key={result.ticker}
                onClick={() => onAdd(result.ticker)}
                disabled={adding === result.ticker}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left",
                  isInPortfolio 
                    ? "bg-violet-400/10 border border-violet-400/30" 
                    : "hover:bg-slate-700/50 disabled:opacity-50"
                )}
              >
                <CompanyLogo ticker={result.ticker} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white">{result.ticker}</p>
                    {isInPortfolio && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-violet-400/20 text-violet-400">
                        In Portfolio
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 truncate">{result.name}</p>
                  {isInPortfolio && (
                    <p className="text-xs text-amber-400 mt-1">Click to add more shares</p>
                  )}
                </div>
                {adding === result.ticker ? (
                  <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
                ) : (
                  <Plus className="w-5 h-5 text-violet-400" />
                )}
              </button>
            );
          })}
        </div>

        {searchQuery.length === 0 && (
          <p className="text-center text-slate-500 text-sm py-4">
            Type a ticker symbol or company name to search
          </p>
        )}
      </div>
    </div>
  );
}
