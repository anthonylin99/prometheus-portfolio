'use client';

import { useState, useMemo } from 'react';
import { Holding, categoryColors } from '@/types/portfolio';
import { formatCurrency, formatPercentage, cn } from '@/lib/utils';
import { CompanyLogo } from '@/components/ui/CompanyLogo';
import { ChevronUp, ChevronDown, ArrowUpDown, Search } from 'lucide-react';

interface HoldingsTableProps {
  holdings: Holding[];
  totalValue: number;
}

type SortKey = 'ticker' | 'name' | 'value' | 'category';
type SortOrder = 'asc' | 'desc';

export function HoldingsTable({ holdings, totalValue }: HoldingsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('value');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) {
      return <ArrowUpDown className="w-4 h-4 text-slate-500" />;
    }
    return sortOrder === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-violet-400" />
      : <ChevronDown className="w-4 h-4 text-violet-400" />;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search holdings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-violet-500 transition-colors appearance-none cursor-pointer"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat}
            </option>
          ))}
        </select>
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
                    <SortIcon columnKey="ticker" />
                  </button>
                </th>
                <th className="text-left p-4 hidden md:table-cell">
                  <button
                    onClick={() => handleSort('category')}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                  >
                    Category
                    <SortIcon columnKey="category" />
                  </button>
                </th>
                <th className="text-right p-4">
                  <button
                    onClick={() => handleSort('value')}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors ml-auto"
                  >
                    Value
                    <SortIcon columnKey="value" />
                  </button>
                </th>
                <th className="text-right p-4">
                  <span className="text-sm font-semibold text-slate-400">% of Portfolio</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedHoldings.map((holding, index) => {
                const percentage = (holding.value / totalValue) * 100;
                const color = categoryColors[holding.category];
                
                return (
                  <tr 
                    key={holding.ticker}
                    className="border-b border-slate-800/50 hover:bg-white/5 transition-colors animate-fade-in-up"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <CompanyLogo ticker={holding.ticker} size="md" />
                        <div>
                          <p className="font-semibold text-white">{holding.ticker}</p>
                          <p className="text-sm text-slate-400">{holding.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: `${color}20`, color }}
                      >
                        {holding.category}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <p className="font-bold text-white tabular-nums">
                        {formatCurrency(holding.value)}
                      </p>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                          <div 
                            className="h-full rounded-full"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                        <span className="text-sm text-slate-300 tabular-nums w-14 text-right">
                          {formatPercentage(percentage)}
                        </span>
                      </div>
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
            Total: {formatCurrency(filteredAndSortedHoldings.reduce((sum, h) => sum + h.value, 0))}
          </span>
        </div>
      </div>
    </div>
  );
}
