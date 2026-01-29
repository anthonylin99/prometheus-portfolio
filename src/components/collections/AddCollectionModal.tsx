'use client';

import { useState } from 'react';
import { X, Loader2, Check, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollectionTicker {
  ticker: string;
  name: string;
}

interface AddCollectionModalProps {
  collectionName: string;
  tickers: CollectionTicker[];
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddCollectionModal({
  collectionName,
  tickers,
  onClose,
  onSuccess,
}: AddCollectionModalProps) {
  const [selectedTickers, setSelectedTickers] = useState<string[]>(
    tickers.map((t) => t.ticker)
  );
  const [shares, setShares] = useState('1');
  const [adding, setAdding] = useState(false);
  const [result, setResult] = useState<{
    added: number;
    failed: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleTicker = (ticker: string) => {
    setSelectedTickers((prev) =>
      prev.includes(ticker)
        ? prev.filter((t) => t !== ticker)
        : [...prev, ticker]
    );
  };

  const selectAll = () => {
    setSelectedTickers(tickers.map((t) => t.ticker));
  };

  const selectNone = () => {
    setSelectedTickers([]);
  };

  const handleAdd = async () => {
    if (selectedTickers.length === 0) return;

    const numShares = Number(shares);
    if (isNaN(numShares) || numShares <= 0) {
      setError('Shares must be a positive number');
      return;
    }

    setAdding(true);
    setError(null);

    try {
      const res = await fetch('/api/user/holdings/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tickers: selectedTickers,
          shares: numShares,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add holdings');
      }

      setResult({ added: data.added, failed: data.failed });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add holdings');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative glass-card p-6 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-1">Add to Portfolio</h2>
        <p className="text-sm text-slate-400 mb-4">
          Add stocks from <span className="text-violet-400">{collectionName}</span>
        </p>

        {result ? (
          // Success state
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Check className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Added {result.added} stocks
            </h3>
            {result.failed > 0 && (
              <p className="text-sm text-amber-400">
                {result.failed} stocks could not be added (may already exist)
              </p>
            )}
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Shares input */}
            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-1">
                Shares per stock
              </label>
              <input
                type="number"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                min="0.01"
                step="any"
                className="w-32 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-violet-500/50"
              />
            </div>

            {/* Selection controls */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-400">
                {selectedTickers.length} of {tickers.length} selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-xs text-violet-400 hover:text-violet-300"
                >
                  Select All
                </button>
                <span className="text-slate-600">|</span>
                <button
                  onClick={selectNone}
                  className="text-xs text-slate-400 hover:text-slate-300"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Ticker list */}
            <div className="flex-1 overflow-y-auto max-h-64 space-y-1 mb-4">
              {tickers.map((t) => (
                <button
                  key={t.ticker}
                  onClick={() => toggleTicker(t.ticker)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left',
                    selectedTickers.includes(t.ticker)
                      ? 'bg-violet-500/10 border border-violet-500/30'
                      : 'bg-slate-800/30 border border-transparent hover:bg-slate-700/30'
                  )}
                >
                  <div
                    className={cn(
                      'w-5 h-5 rounded flex items-center justify-center',
                      selectedTickers.includes(t.ticker)
                        ? 'bg-violet-600 text-white'
                        : 'bg-slate-700 text-transparent'
                    )}
                  >
                    <Check className="w-3 h-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">{t.ticker}</p>
                    <p className="text-sm text-slate-400 truncate">{t.name}</p>
                  </div>
                </button>
              ))}
            </div>

            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-slate-800/50 border border-slate-700/50 text-slate-300 font-medium rounded-xl hover:bg-slate-700/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={adding || selectedTickers.length === 0}
                className="flex-1 py-3 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {adding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add {selectedTickers.length} Stocks
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
