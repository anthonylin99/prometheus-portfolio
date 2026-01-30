'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Plus, X, Loader2, ChevronDown } from 'lucide-react';
import { cn, formatCurrency, extractDomain } from '@/lib/utils';
import { DEFAULT_CATEGORIES, Category } from '@/types/portfolio';
import { resolveCategory } from '@/lib/category-mapping';
import { CompanyLogo } from '@/components/ui/CompanyLogo';

interface HoldingEntry {
  ticker: string;
  name: string;
  shares: number;
  costBasis?: number;
  category: Category;
  logoDomain?: string;
}

interface AddHoldingsStepProps {
  holdings: HoldingEntry[];
  onChange: (holdings: HoldingEntry[]) => void;
}

interface SearchResult {
  symbol: string;
  shortName: string;
  longName: string;
  exchange: string;
  quoteType: string;
}

interface QuoteData {
  ticker: string;
  price: number;
  name?: string;
  shortName?: string;
  sector?: string;
  industry?: string;
  website?: string;
}

export function AddHoldingsStep({ holdings, onChange }: AddHoldingsStepProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<QuoteData | null>(null);
  const [fetchingQuote, setFetchingQuote] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [shares, setShares] = useState('');
  const [costBasis, setCostBasis] = useState('');
  const [category, setCategory] = useState<string>('Big Tech');
  const [categoryInput, setCategoryInput] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [autoDetectedHint, setAutoDetectedHint] = useState<string | null>(null);
  const [logoDomain, setLogoDomain] = useState<string | undefined>(undefined);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Existing categories from current holdings
  const existingCategories = Array.from(new Set(holdings.map(h => h.category)));
  const allCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...existingCategories]));

  // Filter categories for the combo box
  const filteredCategories = categoryInput
    ? allCategories.filter(c => c.toLowerCase().includes(categoryInput.toLowerCase()))
    : allCategories;

  // Debounced search - don't show dropdown when quote selected or fetching
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 1 || fetchingQuote || selectedQuote) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/search/tickers?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        // Only show results if we're not in the process of selecting
        if (!fetchingQuote && !selectedQuote) {
          setSearchResults(data.results || []);
          setShowDropdown(true);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchingQuote, selectedQuote]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setShowCategoryDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setShowDropdown(false);
        setShowCategoryDropdown(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const selectResult = useCallback(async (result: SearchResult) => {
    // Clear results BEFORE closing dropdown to prevent re-render flicker
    setSearchResults([]);
    setShowDropdown(false);
    setSearchQuery(result.symbol);
    setFetchingQuote(true);
    setSearchError(null);
    setAutoDetectedHint(null);

    try {
      const res = await fetch(`/api/quote/${result.symbol}`);
      if (!res.ok) {
        setSearchError(`Could not fetch details for "${result.symbol}"`);
        setFetchingQuote(false);
        return;
      }
      const data: QuoteData = await res.json();

      setSelectedQuote({
        ...data,
        name: data.name || result.longName || result.shortName || result.symbol,
      });

      // Auto-detect category
      const resolved = resolveCategory(data.sector, data.industry, existingCategories);
      setCategory(resolved);
      setCategoryInput(resolved);
      if (data.sector || data.industry) {
        const hint = [data.sector, data.industry].filter(Boolean).join(' / ');
        setAutoDetectedHint(hint);
      }

      // Capture logo domain from website
      if (data.website) {
        setLogoDomain(extractDomain(data.website));
      } else {
        setLogoDomain(undefined);
      }
    } catch {
      setSearchError('Failed to look up ticker');
    } finally {
      setFetchingQuote(false);
    }
  }, [existingCategories]);

  const handleAddHolding = () => {
    if (!selectedQuote || !shares) return;

    const numShares = Number(shares);
    if (numShares <= 0) return;

    // Check for duplicate
    if (holdings.some(h => h.ticker === selectedQuote.ticker)) {
      setSearchError('This ticker is already in your portfolio');
      return;
    }

    const finalCategory = categoryInput.trim() || category;

    const newHolding: HoldingEntry = {
      ticker: selectedQuote.ticker,
      name: selectedQuote.name || selectedQuote.shortName || selectedQuote.ticker,
      shares: numShares,
      costBasis: costBasis ? Number(costBasis) : undefined,
      category: finalCategory,
      logoDomain,
    };

    onChange([...holdings, newHolding]);

    // Reset form
    setSearchQuery('');
    setSelectedQuote(null);
    setSearchResults([]);
    setShares('');
    setCostBasis('');
    setCategory('Big Tech');
    setCategoryInput('');
    setSearchError(null);
    setAutoDetectedHint(null);
    setLogoDomain(undefined);
    inputRef.current?.focus();
  };

  const removeHolding = (ticker: string) => {
    onChange(holdings.filter(h => h.ticker !== ticker));
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-white mb-1">Add your holdings</h2>
        <p className="text-slate-400 text-sm">
          Search for stocks and add them to your portfolio
        </p>
      </div>

      {/* Search with autocomplete */}
      <div className="space-y-3">
        <div className="relative" ref={dropdownRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedQuote(null);
                setAutoDetectedHint(null);
              }}
              placeholder="Search by ticker or company name..."
              className="w-full pl-10 pr-10 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-400/50 focus:ring-1 focus:ring-violet-400/25 transition-colors font-mono uppercase"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-700/60 rounded-xl shadow-xl overflow-hidden max-h-80 overflow-y-auto">
              {searchResults.map((result) => (
                <button
                  key={result.symbol}
                  onClick={() => selectResult(result)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700/50 transition-colors text-left"
                >
                  <CompanyLogo ticker={result.symbol} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {result.longName || result.shortName || result.symbol}
                    </p>
                    <p className="text-slate-400 text-xs">
                      <span className="font-mono font-semibold text-slate-300">${result.symbol}</span>
                      {result.exchange && (
                        <span className="ml-1.5 text-slate-500">{result.exchange}</span>
                      )}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {showDropdown && searchResults.length === 0 && searchQuery.length >= 2 && !searching && (
            <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-700/60 rounded-xl shadow-xl p-4 text-center">
              <p className="text-slate-400 text-sm">No results found</p>
            </div>
          )}
        </div>

        {searchError && (
          <p className="text-red-400 text-sm">{searchError}</p>
        )}

        {/* Loading quote */}
        {fetchingQuote && (
          <div className="glass-card p-4 rounded-xl flex items-center justify-center gap-2 text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading stock details...</span>
          </div>
        )}

        {/* Selected Result + Add Form */}
        {selectedQuote && !fetchingQuote && (
          <div className="glass-card p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CompanyLogo ticker={selectedQuote.ticker} domain={logoDomain} size="md" />
                <div>
                  <span className="text-white font-mono font-semibold">
                    {selectedQuote.ticker}
                  </span>
                  <p className="text-slate-400 text-sm truncate max-w-[200px]">
                    {selectedQuote.name}
                  </p>
                </div>
              </div>
              {selectedQuote.price > 0 && (
                <span className="text-slate-300 text-sm font-mono">
                  {formatCurrency(selectedQuote.price)}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Shares *
                </label>
                <input
                  type="number"
                  value={shares}
                  onChange={(e) => setShares(e.target.value)}
                  placeholder="100"
                  min="0.01"
                  step="any"
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-violet-400/50 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Cost Basis ($)
                </label>
                <input
                  type="number"
                  value={costBasis}
                  onChange={(e) => setCostBasis(e.target.value)}
                  placeholder="Optional"
                  min="0"
                  step="any"
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-violet-400/50 text-sm"
                />
              </div>
            </div>

            {/* Category combo box */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Category
              </label>
              <div className="relative" ref={categoryDropdownRef}>
                <input
                  type="text"
                  value={categoryInput}
                  onChange={(e) => {
                    setCategoryInput(e.target.value);
                    setCategory(e.target.value);
                    setShowCategoryDropdown(true);
                  }}
                  onFocus={() => setShowCategoryDropdown(true)}
                  placeholder="Select or type a category"
                  className="w-full px-3 py-2 pr-8 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-violet-400/50 text-sm"
                />
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />

                {showCategoryDropdown && filteredCategories.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-700/60 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                    {filteredCategories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => {
                          setCategory(cat);
                          setCategoryInput(cat);
                          setShowCategoryDropdown(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 text-sm hover:bg-slate-700/50 transition-colors",
                          cat === category ? "text-violet-400" : "text-slate-300"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {autoDetectedHint && (
                <p className="text-xs text-slate-500 mt-1">
                  Auto-detected: {autoDetectedHint}
                </p>
              )}
            </div>

            <button
              onClick={handleAddHolding}
              disabled={!shares || Number(shares) <= 0}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-violet-400 hover:bg-violet-400 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <Plus className="w-4 h-4" />
              Add to Portfolio
            </button>
          </div>
        )}
      </div>

      {/* Holdings List */}
      {holdings.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-slate-300">
            Your Holdings ({holdings.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {holdings.map((h) => (
              <div
                key={h.ticker}
                className="flex items-center justify-between p-3 bg-slate-800/30 border border-slate-700/30 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <CompanyLogo ticker={h.ticker} domain={h.logoDomain} size="sm" />
                  <div>
                    <span className="text-white font-mono font-semibold text-sm">
                      {h.ticker}
                    </span>
                    <span className="text-slate-400 text-xs ml-2 hidden sm:inline">
                      {h.name}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-300 text-sm">
                    {h.shares} shares
                  </span>
                  <button
                    onClick={() => removeHolding(h.ticker)}
                    className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {holdings.length === 0 && (
        <p className="text-center text-slate-500 text-sm py-4">
          Add at least one holding to continue
        </p>
      )}
    </div>
  );
}
