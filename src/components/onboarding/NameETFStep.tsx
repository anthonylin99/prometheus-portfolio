'use client';

import { useState, useEffect } from 'react';
import { User, DollarSign, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

const AVATAR_COLORS = [
  { hex: '#8b5cf6', name: 'Purple' },
  { hex: '#6366f1', name: 'Indigo' },
  { hex: '#22d3ee', name: 'Cyan' },
  { hex: '#34d399', name: 'Emerald' },
  { hex: '#f472b6', name: 'Pink' },
  { hex: '#fbbf24', name: 'Amber' },
  { hex: '#f97316', name: 'Orange' },
  { hex: '#60a5fa', name: 'Blue' },
];

interface NameETFStepProps {
  data: {
    displayName: string;
    etfTicker: string;
    etfName: string;
    avatarColor: string;
  };
  onChange: (data: {
    displayName: string;
    etfTicker: string;
    etfName: string;
    avatarColor: string;
  }) => void;
}

export function NameETFStep({ data, onChange }: NameETFStepProps) {
  const [tickerError, setTickerError] = useState<string | null>(null);

  const handleTickerChange = (value: string) => {
    // Auto-format: uppercase, remove non-alpha, max 5 chars
    const clean = value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5);
    onChange({ ...data, etfTicker: clean });

    if (clean.length > 0 && clean.length < 2) {
      setTickerError('Ticker must be 2-5 letters');
    } else {
      setTickerError(null);
    }
  };

  const initials = data.displayName
    ? data.displayName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-white mb-1">Name your ETF</h2>
        <p className="text-slate-400 text-sm">
          Create your personal investment fund identity
        </p>
      </div>

      {/* Avatar Preview */}
      <div className="flex justify-center">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg transition-colors duration-300"
          style={{ backgroundColor: data.avatarColor }}
        >
          {initials}
        </div>
      </div>

      {/* Avatar Color Picker */}
      <div className="flex justify-center gap-2">
        {AVATAR_COLORS.map((color) => (
          <button
            key={color.hex}
            onClick={() => onChange({ ...data, avatarColor: color.hex })}
            className={cn(
              'w-8 h-8 rounded-full transition-all duration-200',
              data.avatarColor === color.hex
                ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0a1a] scale-110'
                : 'hover:scale-110'
            )}
            style={{ backgroundColor: color.hex }}
            title={color.name}
          />
        ))}
      </div>

      {/* Display Name */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Display Name
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={data.displayName}
            onChange={(e) => onChange({ ...data, displayName: e.target.value })}
            placeholder="Anthony"
            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/25 transition-colors"
          />
        </div>
      </div>

      {/* ETF Ticker */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          ETF Ticker
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={data.etfTicker}
            onChange={(e) => handleTickerChange(e.target.value)}
            placeholder="ALIN"
            maxLength={5}
            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/25 transition-colors uppercase tracking-wider font-mono"
          />
        </div>
        {tickerError ? (
          <p className="text-red-400 text-xs mt-1">{tickerError}</p>
        ) : data.etfTicker ? (
          <p className="text-slate-500 text-xs mt-1">
            Your fund will be called <span className="text-violet-400 font-mono">${data.etfTicker}</span>
          </p>
        ) : null}
      </div>

      {/* ETF Name */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          ETF Name
        </label>
        <div className="relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={data.etfName}
            onChange={(e) => onChange({ ...data, etfName: e.target.value })}
            placeholder="Prometheus ETF"
            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/25 transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
