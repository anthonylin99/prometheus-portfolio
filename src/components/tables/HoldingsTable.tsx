'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { HoldingWithPrice, categoryColors } from '@/types/portfolio';
import { formatCurrency, formatPercentage, formatPercentagePrecise, cn } from '@/lib/utils';
import { useVisibility } from '@/lib/visibility-context';
import { CompanyLogo } from '@/components/ui/CompanyLogo';
import { ChevronUp, ChevronDown, ArrowUpDown, Search, ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react';

type VsBenchmarkRange = '1M' | '3M' | 'YTD' | '1Y';

interface VsBenchmarkResult {
  ticker: string;
  tickerReturn: number;
  benchmarkReturn: number;
  outperforming: boolean;
  delta: number;
}

interface HoldingsTableProps {
  holdings: HoldingWithPrice[];
  totalValue: number;
}

type SortKey = 'ticker' | 'name' | 'value' | 'category' | 'price' | 'dayChange' | 'weight';
type SortOrder = 'asc' | 'desc';

function SortIcon({ sortKey, sortOrder, columnKey }: { sortKey: SortKey; sortOrder: SortOrder; columnKey: SortKey }) {
  if (sortKey !== columnKey) return <ArrowUpDown className="w-4 h-4 text-slate-500" />;
  return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 text-violet-400" /> : <ChevronDown className="w-4 h-4 text-violet-400" />;
}

export function HoldingsTable({ holdings, totalValue }: HoldingsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('value');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [vsRange, setVsRange] = useState<VsBenchmarkRange>('YTD');
  const [vsData, setVsData] = useState<Record<string, VsBenchmarkResult>>({});
  const [vsLoading, setVsLoading] = useState(false);
  const { isVisible } = useVisibility();

  useEffect(() => {
    const tickers = holdings.map((h) => h.ticker);
    if (tickers.length === 0) {
      queueMicrotask(() => {
        setVsData({});
        setVsLoading(false);
      });
      return () => {};
    }
    let cancelled = false;
    queueMicrotask(() => setVsLoading(true));
    fetch(
      `/api/performance/vs-benchmark?tickers=${tickers.join(',')}&benchmark=SPY&range=${vsRange}`
    )
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && d.results) setVsData(d.results);
      })
      .catch(() => { if (!cancelled) setVsData({}); })
      .finally(() => { if (!cancelled) setVsLoading(false); });
    return () => { cancelled = true; };
  }, [holdings, vsRange]);

  const categories = useMemo(() => {
    const cats = new Set(holdings.map(h => h.category));
    return ['all', ...Array.from(cats)];
  }, [holdings]);

  const filteredAndSortedHoldings = useMemo(() => {
    let result = [...holdings];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        h => h.ticker.toLowerCase().includes(query) || 
             h.name.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(h => h.category === selectedCategory);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortKey) {
        case 'ticker':
        case 'name':
        case 'category':
          comparison = a[sortKey].localeCompare(b[sortKey]);
          break;
        case 'value':
          comparison = a.value - b.value;
          break;
        case 'price':
          comparison = a.currentPrice - b.currentPrice;
          break;
        case 'dayChange':
          comparison = a.dayChangePercent - b.dayChangePercent;
          break;
        case 'weight':
          comparison = a.weight - b.weight;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [holdings, sortKey, sortOrder, searchQuery, selectedCategory]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const showingAll = selectedCategory === 'all' && !searchQuery;
  const footerTotal = showingAll ? totalValue : filteredAndSortedHoldings.reduce((s, h) => s + h.value, 0);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search holdings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        {/* Category Filter - consistent button grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {categories.map(cat => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium",
                  "min-w-[140px] h-10",
                  "flex items-center justify-center",
                  "transition-colors duration-200",
                  isActive
                    ? "bg-violet-600 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                )}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left p-4">
                  <button
                    onClick={() => handleSort('ticker')}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                  >
                    Holding
                    <SortIcon sortKey={sortKey} sortOrder={sortOrder} columnKey="ticker" />
                  </button>
                </th>
                <th className="text-left p-4 hidden md:table-cell">
                  <button
                    onClick={() => handleSort('category')}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                  >
                    Category
                    <SortIcon sortKey={sortKey} sortOrder={sortOrder} columnKey="category" />
                  </button>
                </th>
                <th className="text-right p-4">
                  <button
                    onClick={() => handleSort('price')}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors ml-auto"
                  >
                    Price
                    <SortIcon sortKey={sortKey} sortOrder={sortOrder} columnKey="price" />
                  </button>
                </th>
                <th className="text-right p-4 hidden sm:table-cell">
                  <span className="text-sm font-semibold text-slate-400">Shares</span>
                </th>
                <th className="text-right p-4">
                  <button
                    onClick={() => handleSort('value')}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors ml-auto"
                  >
                    Value
                    <SortIcon sortKey={sortKey} sortOrder={sortOrder} columnKey="value" />
                  </button>
                </th>
                <th className="text-right p-4 hidden lg:table-cell">
                  <button
                    onClick={() => handleSort('dayChange')}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors ml-auto"
                  >
                    Day
                    <SortIcon sortKey={sortKey} sortOrder={sortOrder} columnKey="dayChange" />
                  </button>
                </th>
                <th className="text-right p-4 hidden xl:table-cell">
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-sm font-semibold text-slate-400">vs S&P</span>
                    <select
                      value={vsRange}
                      onChange={(e) => setVsRange(e.target.value as VsBenchmarkRange)}
                      className="ml-1 py-0.5 px-1.5 rounded bg-slate-800 border border-slate-600 text-slate-300 text-xs focus:outline-none focus:border-violet-500"
                    >
                      <option value="1M">1M</option>
                      <option value="3M">3M</option>
                      <option value="YTD">YTD</option>
                      <option value="1Y">1Y</option>
                    </select>
                  </div>
                </th>
                <th className="text-right p-4">
                  <button
                    onClick={() => handleSort('weight')}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors ml-auto"
                  >
                    Weight
                    <SortIcon sortKey={sortKey} sortOrder={sortOrder} columnKey="weight" />
                  </button>
                </th>
                <th className="w-10 p-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedHoldings.map((holding) => {
                const color = categoryColors[holding.category];
                const dayPositive = holding.dayChangePercent >= 0;
                
                return (
                  <tr 
                    key={holding.ticker}
                    className="border-b border-slate-800/50 hover:bg-white/5 transition-colors group"
                  >
                    <td className="p-4">
                      <Link href={`/holdings/${holding.ticker}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <CompanyLogo ticker={holding.ticker} size="md" />
                        <div>
                          <p className="font-semibold text-white">{holding.ticker}</p>
                          <p className="text-sm text-slate-400">{holding.name}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span 
                        className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-center leading-tight w-[100px]"
                        style={{ backgroundColor: `${color}20`, color }}
                      >
                        {holding.category}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <p className="font-medium text-white tabular-nums">
                        {isVisible ? `$${holding.currentPrice.toFixed(2)}` : '$••••'}
                      </p>
                    </td>
                    <td className="p-4 text-right hidden sm:table-cell">
                      <span className="text-slate-300 tabular-nums">
                        {isVisible ? holding.shares.toLocaleString() : '••••'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <p className="font-bold text-white tabular-nums">
                        {isVisible ? formatCurrency(holding.value) : '$••••••'}
                      </p>
                    </td>
                    <td className="p-4 text-right hidden lg:table-cell">
                      <p className={cn(
                        "font-medium tabular-nums",
                        dayPositive ? "text-emerald-400" : "text-red-400"
                      )}>
                        {formatPercentagePrecise(holding.dayChangePercent)}
                      </p>
                    </td>
                    <td className="p-4 text-right hidden xl:table-cell">
                      {(() => {
                        const vs = vsData[holding.ticker];
                        if (vsLoading || vs == null) {
                          return <span className="text-slate-500">—</span>;
                        }
                        const out = vs.outperforming;
                        const title = `${holding.ticker} is ${vs.tickerReturn >= 0 ? 'up' : 'down'} ${Math.abs(vs.tickerReturn).toFixed(1)}% (${vsRange}) vs S&P 500 ${vs.benchmarkReturn >= 0 ? 'up' : 'down'} ${Math.abs(vs.benchmarkReturn).toFixed(1)}%`;
                        return (
                          <span
                            title={title}
                            className={cn(
                              "inline-flex items-center gap-1 font-medium tabular-nums",
                              out ? "text-emerald-400" : "text-red-400"
                            )}
                          >
                            {out ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            {vs.delta >= 0 ? '+' : ''}{vs.delta.toFixed(1)}%
                          </span>
                        );
                      })()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                          <div 
                            className="h-full rounded-full"
                            style={{ 
                              width: `${Math.min(holding.weight * 3, 100)}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                        <span className="text-sm text-slate-300 tabular-nums w-12 text-right">
                          {formatPercentage(holding.weight)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Link 
                        href={`/holdings/${holding.ticker}`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-violet-500/20 rounded-lg inline-flex"
                      >
                        <ArrowUpRight className="w-4 h-4 text-violet-400" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 border-t border-slate-700/50 flex items-center justify-between bg-slate-900/30">
          <span className="text-sm text-slate-400">
            Showing {filteredAndSortedHoldings.length} of {holdings.length} holdings
          </span>
          <span className="text-sm font-medium text-white tabular-nums">
            Total: {isVisible ? formatCurrency(footerTotal) : '$••••••'}
          </span>
        </div>
      </div>
    </div>
  );
}
