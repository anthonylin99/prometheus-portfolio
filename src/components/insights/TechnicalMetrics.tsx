'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { TechnicalSignal, SignalStrength } from '@/lib/technical-analysis';
import { Activity, ChevronDown, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { CompanyLogo } from '@/components/ui/CompanyLogo';
import Link from 'next/link';

interface TechnicalMetricsProps {
  signals: TechnicalSignal[];
}

export function TechnicalMetrics({ signals }: TechnicalMetricsProps) {
  const [selectedTicker, setSelectedTicker] = useState<string | null>(
    signals.length > 0 ? signals[0].ticker : null
  );
  const [showDropdown, setShowDropdown] = useState(false);

  const selectedSignal = signals.find(s => s.ticker === selectedTicker);

  const getSignalBadge = (signal: SignalStrength) => {
    const styles = {
      strong_buy: 'bg-emerald-500/20 text-emerald-400',
      buy: 'bg-emerald-500/15 text-emerald-300',
      hold: 'bg-slate-500/20 text-slate-400',
      sell: 'bg-red-500/15 text-red-300',
      strong_sell: 'bg-red-500/20 text-red-400',
    };
    const labels = {
      strong_buy: 'Strong Buy',
      buy: 'Buy',
      hold: 'Hold',
      sell: 'Sell',
      strong_sell: 'Strong Sell',
    };
    return (
      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', styles[signal])}>
        {labels[signal]}
      </span>
    );
  };

  const getScoreIcon = (score: number) => {
    if (score > 15) return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    if (score < -15) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  if (signals.length === 0) {
    return (
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-[#9b8ac4]" />
          <h3 className="text-lg font-semibold text-white">Technical Analysis</h3>
        </div>
        <p className="text-slate-400 text-sm">Add holdings to see technical analysis.</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#9b8ac4]" />
          <h3 className="text-lg font-semibold text-white">Technical Analysis</h3>
        </div>

        {/* Ticker Selector */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50 text-white text-sm hover:bg-slate-700/80 transition-colors"
          >
            {selectedTicker && (
              <>
                <CompanyLogo ticker={selectedTicker} size="xs" />
                <span>{selectedTicker}</span>
              </>
            )}
            <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', showDropdown && 'rotate-180')} />
          </button>
          {showDropdown && (
            <div className="absolute z-50 right-0 w-48 mt-1 bg-slate-800 border border-slate-700/60 rounded-lg shadow-xl max-h-64 overflow-y-auto">
              {signals.map(signal => (
                <button
                  key={signal.ticker}
                  onClick={() => {
                    setSelectedTicker(signal.ticker);
                    setShowDropdown(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-700/50 transition-colors',
                    signal.ticker === selectedTicker ? 'text-[#9b8ac4] bg-slate-700/30' : 'text-slate-300'
                  )}
                >
                  <CompanyLogo ticker={signal.ticker} size="xs" />
                  <span className="flex-1 text-left">{signal.ticker}</span>
                  {getSignalBadge(signal.overallSignal)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedSignal && (
        <div className="space-y-4">
          {/* Overall Signal */}
          <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl">
            <div className="flex items-center gap-2">
              {getScoreIcon(selectedSignal.signalScore)}
              <span className="text-white font-medium">Overall Signal</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(
                'text-sm font-semibold tabular-nums',
                selectedSignal.signalScore > 0 ? 'text-emerald-400' :
                selectedSignal.signalScore < 0 ? 'text-red-400' : 'text-slate-400'
              )}>
                {selectedSignal.signalScore > 0 ? '+' : ''}{selectedSignal.signalScore}
              </span>
              {getSignalBadge(selectedSignal.overallSignal)}
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* RSI */}
            <div className="p-3 bg-slate-800/30 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">RSI (14)</p>
              <div className="flex items-center justify-between">
                <span className={cn(
                  'text-lg font-semibold',
                  selectedSignal.rsi.signal === 'oversold' ? 'text-emerald-400' :
                  selectedSignal.rsi.signal === 'overbought' ? 'text-red-400' : 'text-white'
                )}>
                  {selectedSignal.rsi.value.toFixed(0)}
                </span>
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded',
                  selectedSignal.rsi.signal === 'oversold' ? 'bg-emerald-500/20 text-emerald-400' :
                  selectedSignal.rsi.signal === 'overbought' ? 'bg-red-500/20 text-red-400' : 'bg-slate-600/50 text-slate-400'
                )}>
                  {selectedSignal.rsi.signal}
                </span>
              </div>
            </div>

            {/* MACD */}
            <div className="p-3 bg-slate-800/30 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">MACD</p>
              <div className="flex items-center justify-between">
                <span className={cn(
                  'text-lg font-semibold',
                  selectedSignal.macd.trend === 'bullish' ? 'text-emerald-400' :
                  selectedSignal.macd.trend === 'bearish' ? 'text-red-400' : 'text-white'
                )}>
                  {selectedSignal.macd.histogram > 0 ? '+' : ''}{selectedSignal.macd.histogram.toFixed(2)}
                </span>
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded',
                  selectedSignal.macd.trend === 'bullish' ? 'bg-emerald-500/20 text-emerald-400' :
                  selectedSignal.macd.trend === 'bearish' ? 'bg-red-500/20 text-red-400' : 'bg-slate-600/50 text-slate-400'
                )}>
                  {selectedSignal.macd.trend}
                </span>
              </div>
            </div>

            {/* 52W Position */}
            <div className="p-3 bg-slate-800/30 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">52W Range</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-white">
                  {selectedSignal.fiftyTwoWeek.position.toFixed(0)}%
                </span>
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded',
                  selectedSignal.fiftyTwoWeek.signal === 'near_high' ? 'bg-amber-500/20 text-amber-400' :
                  selectedSignal.fiftyTwoWeek.signal === 'near_low' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-600/50 text-slate-400'
                )}>
                  {selectedSignal.fiftyTwoWeek.signal.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Support/Resistance */}
            <div className="p-3 bg-slate-800/30 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Support / Resistance</p>
              <div className="text-sm">
                <span className="text-emerald-400">${selectedSignal.supportResistance.support.toFixed(2)}</span>
                <span className="text-slate-500"> / </span>
                <span className="text-red-400">${selectedSignal.supportResistance.resistance.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* View Details Link */}
          <Link
            href={`/holdings/${selectedSignal.ticker}`}
            className="block w-full text-center py-2 text-sm text-[#9b8ac4] hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
          >
            View {selectedSignal.ticker} Details →
          </Link>
        </div>
      )}
    </div>
  );
}
