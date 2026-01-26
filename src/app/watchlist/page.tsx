'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Star, Trash2, Plus, ArrowLeft } from 'lucide-react';
import { cn, formatCurrency, formatPercentagePrecise } from '@/lib/utils';
import { CompanyLogo } from '@/components/ui/CompanyLogo';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { getCollectionsForTicker } from '@/data/collections-seed';

interface WatchlistStock {
  ticker: string;
  name?: string;
  price?: number;
  dayChangePercent?: number;
}

export default function WatchlistPage() {
  const [tickers, setTickers] = useState<string[]>([]);
  const [stocks, setStocks] = useState<Record<string, WatchlistStock>>({});
  const [loading, setLoading] = useState(true);
  const [addInput, setAddInput] = useState('');

  // Load watchlist from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('prometheus-watchlist-tickers');
      if (stored) {
        const parsed = JSON.parse(stored);
        setTickers(parsed);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  // Fetch prices for watchlist tickers
  useEffect(() => {
    if (tickers.length === 0) return;

    async function fetchPrices() {
      try {
        const res = await fetch(`/api/historical/compare?tickers=${tickers.join(',')}&range=1D`);
        const json = await res.json();
        const data = json.data || {};
        const newStocks: Record<string, WatchlistStock> = {};

        for (const ticker of tickers) {
          const candles = data[ticker] || [];
          const last = candles[candles.length - 1];
          const prev = candles.length >= 2 ? candles[candles.length - 2] : null;

          newStocks[ticker] = {
            ticker,
            price: last?.close,
            dayChangePercent: prev && prev.close > 0
              ? ((last.close - prev.close) / prev.close) * 100
              : undefined,
          };
        }

        setStocks(newStocks);
      } catch (err) {
        console.error('Failed to fetch watchlist prices:', err);
      }
    }

    fetchPrices();
  }, [tickers]);

  const removeTicker = useCallback((ticker: string) => {
    setTickers((prev) => {
      const next = prev.filter((t) => t !== ticker);
      localStorage.setItem('prometheus-watchlist-tickers', JSON.stringify(next));
      return next;
    });
  }, []);

  const addTicker = useCallback(() => {
    const t = addInput.trim().toUpperCase();
    if (!t) return;
    setTickers((prev) => {
      if (prev.includes(t)) return prev;
      const next = [...prev, t];
      localStorage.setItem('prometheus-watchlist-tickers', JSON.stringify(next));
      return next;
    });
    setAddInput('');
  }, [addInput]);

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
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
          <Star className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">My Watchlist</h1>
          <p className="text-sm text-slate-400">
            Track stocks you&apos;re interested in. Data saved to your browser.
          </p>
        </div>
      </div>

      {/* Add Ticker */}
      <div className="glass-card p-4 rounded-xl mb-6 flex items-center gap-3">
        <input
          type="text"
          value={addInput}
          onChange={(e) => setAddInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTicker()}
          placeholder="Add ticker (e.g. NVDA, AAPL)"
          className="flex-1 px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 text-sm"
        />
        <button
          onClick={addTicker}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-500 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {/* Watchlist */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tickers.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center">
          <Star className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 mb-2">Your watchlist is empty</p>
          <p className="text-sm text-slate-500 mb-4">
            Add tickers above or star stocks from any collection
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors text-sm"
          >
            Browse Collections
          </Link>
        </div>
      ) : (
        <div className="glass-card p-4 rounded-2xl">
          <div className="divide-y divide-slate-700/50">
            {tickers.map((ticker) => {
              const stock = stocks[ticker];
              const isPositive = (stock?.dayChangePercent ?? 0) >= 0;
              const relatedCollections = getCollectionsForTicker(ticker);

              return (
                <div key={ticker} className="flex items-center gap-3 p-3 hover:bg-slate-800/50 rounded-xl transition-colors">
                  <Link href={`/holdings/${ticker}`} className="flex-shrink-0">
                    <CompanyLogo ticker={ticker} size="md" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/holdings/${ticker}`} className="font-semibold text-white hover:text-violet-400 transition-colors">
                      {ticker}
                    </Link>
                    {relatedCollections.length > 0 && (
                      <p className="text-xs text-slate-500 truncate">
                        In: {relatedCollections.map((c) => c.name).join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    {stock?.price !== undefined ? (
                      <>
                        <p className="font-semibold text-white tabular-nums">
                          {formatCurrency(stock.price)}
                        </p>
                        {stock.dayChangePercent !== undefined && (
                          <p className={cn(
                            'flex items-center gap-0.5 text-sm font-medium justify-end',
                            isPositive ? 'text-emerald-400' : 'text-red-400'
                          )}>
                            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {formatPercentagePrecise(stock.dayChangePercent)}
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="w-16 h-4 bg-slate-800 rounded animate-pulse" />
                    )}
                  </div>
                  <button
                    onClick={() => removeTicker(ticker)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 transition-colors"
                    title="Remove from watchlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
