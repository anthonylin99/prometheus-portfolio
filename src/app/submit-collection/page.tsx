'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, X, Plus, CheckCircle } from 'lucide-react';
import { collectionCategories } from '@/data/collections-seed';
import { cn } from '@/lib/utils';

export default function SubmitCollectionPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('thematic-frontiers');
  const [tickerInput, setTickerInput] = useState('');
  const [tickers, setTickers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const addTicker = useCallback(() => {
    const t = tickerInput.trim().toUpperCase();
    if (!t) return;
    if (tickers.includes(t)) return;
    if (tickers.length >= 15) return;
    setTickers((prev) => [...prev, t]);
    setTickerInput('');
  }, [tickerInput, tickers]);

  const removeTicker = useCallback((ticker: string) => {
    setTickers((prev) => prev.filter((t) => t !== ticker));
  }, []);

  const handleSubmit = useCallback(async () => {
    setError('');

    if (!name.trim()) { setError('Name is required'); return; }
    if (!description.trim()) { setError('Description is required'); return; }
    if (tickers.length < 3) { setError('At least 3 tickers required'); return; }

    setSubmitting(true);

    try {
      // Ensure visitor ID exists
      let visitorId = localStorage.getItem('prometheus-visitor-id');
      if (!visitorId) {
        visitorId = crypto.randomUUID();
        localStorage.setItem('prometheus-visitor-id', visitorId);
      }

      const res = await fetch('/api/collections/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-visitor-id': visitorId,
        },
        body: JSON.stringify({ name, description, tickers, categoryId }),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error || 'Submission failed');
        return;
      }

      setSubmitted(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [name, description, tickers, categoryId]);

  if (submitted) {
    return (
      <div className="p-6 lg:p-8 min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 rounded-2xl text-center max-w-md animate-fade-in-up">
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Collection Submitted!</h2>
          <p className="text-slate-400 mb-6">
            Your collection &ldquo;{name}&rdquo; has been submitted for review. It will appear in the explore page once approved.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/explore"
              className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
            >
              Back to Explore
            </Link>
            <button
              onClick={() => {
                setSubmitted(false);
                setName('');
                setDescription('');
                setTickers([]);
              }}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
            >
              Submit Another
            </button>
          </div>
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
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
          <Send className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Submit a Collection</h1>
          <p className="text-sm text-slate-400">
            Create a themed stock collection for the community
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <div className="glass-card p-6 rounded-2xl space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Collection Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Quantum Computing Leaders"
              maxLength={100}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the investment theme and why these stocks belong together..."
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors resize-none"
            />
            <p className="text-xs text-slate-500 mt-1">{description.length}/500</p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {collectionCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    categoryId === cat.id
                      ? 'text-white'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
                  )}
                  style={
                    categoryId === cat.id
                      ? { backgroundColor: `${cat.color}30`, color: cat.color, border: `1px solid ${cat.color}50` }
                      : undefined
                  }
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Tickers */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Stock Tickers ({tickers.length}/15, min 3)
            </label>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={tickerInput}
                onChange={(e) => setTickerInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTicker()}
                placeholder="Add ticker (e.g. NVDA)"
                className="flex-1 px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 text-sm"
              />
              <button
                onClick={addTicker}
                disabled={tickers.length >= 15}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-500 transition-colors text-sm disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
            {tickers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tickers.map((t) => (
                  <span
                    key={t}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-sm text-white font-mono"
                  >
                    {t}
                    <button
                      onClick={() => removeTicker(t)}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-400 bg-red-900/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={cn(
              'w-full py-3 rounded-xl font-semibold text-white transition-colors',
              submitting
                ? 'bg-slate-700 cursor-not-allowed'
                : 'bg-violet-600 hover:bg-violet-500'
            )}
          >
            {submitting ? 'Submitting...' : 'Submit Collection'}
          </button>
        </div>
      </div>
    </div>
  );
}
