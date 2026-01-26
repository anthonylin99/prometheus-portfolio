'use client';

import { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollectionSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function CollectionSearchBar({
  onSearch,
  placeholder = 'Search collections, tickers, or themes...',
  className,
}: CollectionSearchBarProps) {
  const [value, setValue] = useState('');

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setValue(v);
      onSearch(v);
    },
    [onSearch]
  );

  const handleClear = useCallback(() => {
    setValue('');
    onSearch('');
  }, [onSearch]);

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-11 pr-10 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors text-sm"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-500 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
