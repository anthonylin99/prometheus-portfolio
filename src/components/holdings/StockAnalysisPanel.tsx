'use client';

import { useState, useCallback } from 'react';
import { RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
import { cn, getRelativeTime } from '@/lib/utils';

export interface MetricHistorical {
  percentile: number | null;
  high52w: number | null;
  low52w: number | null;
  buildingHistory: boolean;
}

export interface StockAnalysisProps {
  ticker: string;
  catalyst: {
    text: string;
    priceChange: number;
    timestamp: Date;
  };
  metrics: {
    marketCap: string;
    fiftyTwoWeekRange: { low: number; high: number; current: number };
    avgVolume: string;
    beta: number;
    shortInterest: number;
    nextEarnings: string;
    ivPercentile?: number | null;
    currentIV?: number | null;
  };
  thesis: {
    bullCase: string[];
    bearCase: string[];
    valuation: string[];
    catalysts: string[];
  };
  /** Indicates the state of thesis data: 'ready' = has content, 'empty' = API returned no content */
  thesisStatus?: 'ready' | 'empty';
  lastAnalysisUpdate: Date;
  /** Optional: show loading skeleton instead of content */
  loading?: boolean;
  /** Called when the user taps the refresh button */
  onRefresh?: () => void;
  /** Optional per-metric delta strings, e.g. { marketCap: '+5%', beta: '-0.1' } */
  metricDeltas?: Partial<Record<string, string>>;
  /** Optional historical context per metric (percentile, 52w range) */
  historicalMetrics?: Partial<Record<string, MetricHistorical>>;
}

function stripMarkdown(s: string): string {
  return s
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#+\s*/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();
}

function format52WPosition(range: { low: number; high: number; current: number }): string {
  const { low, high, current } = range;
  if (high <= low) return '—';
  const pct = ((current - low) / (high - low)) * 100;
  return `${Math.round(pct)}% of range`;
}

const ACCORDION_SECTIONS = [
  { key: 'bullCase' as const, label: 'Bull Case', accent: 'border-l-emerald-500' },
  { key: 'bearCase' as const, label: 'Bear Case / Risks', accent: 'border-l-red-500' },
  { key: 'valuation' as const, label: 'Valuation', accent: 'border-l-blue-500' },
  { key: 'catalysts' as const, label: 'Catalysts & Timeline', accent: 'border-l-violet-500' },
] as const;

function StockAnalysisSkeleton() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-slate-700/50">
      {/* Banner skeleton */}
      <div className="h-[72px] shimmer border-b border-slate-700/50" />
      {/* Metrics grid skeleton */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-[60px] rounded-lg shimmer" />
          ))}
        </div>
      </div>
      {/* Accordion skeleton */}
      <div className="p-6 space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 rounded-lg shimmer" />
        ))}
      </div>
      {/* Footer skeleton */}
      <div className="h-10 px-6 border-t border-slate-700/50 shimmer" />
    </div>
  );
}

export function StockAnalysisPanel({
  ticker,
  catalyst,
  metrics,
  thesis,
  thesisStatus,
  lastAnalysisUpdate,
  loading = false,
  onRefresh,
  metricDeltas,
  historicalMetrics,
}: StockAnalysisProps) {
  const [expanded, setExpanded] = useState<typeof ACCORDION_SECTIONS[number]['key'] | undefined>('bullCase');

  const toggle = useCallback((key: typeof ACCORDION_SECTIONS[number]['key']) => {
    setExpanded((k) => (k === key ? undefined : key));
  }, []);

  if (loading) {
    return <StockAnalysisSkeleton />;
  }

  const isPositive = catalyst.priceChange >= 0;
  const direction = isPositive ? 'up' : 'down';
  const pctStr = `${isPositive ? '+' : ''}${catalyst.priceChange.toFixed(1)}%`;

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-slate-700/50 shadow-lg">
      {/* ——— Section 1: Price Catalyst Banner ——— */}
      <div
        className={cn(
          'px-5 py-4',
          isPositive
            ? 'bg-gradient-to-r from-emerald-950/60 via-emerald-900/30 to-transparent border-b border-emerald-800/30'
            : 'bg-gradient-to-r from-red-950/60 via-red-900/30 to-transparent border-b border-red-800/30'
        )}
      >
        <p className="text-slate-100 font-medium">
          <span className="font-semibold text-white">{ticker}</span> is {direction}{' '}
          <span className={cn('font-semibold tabular-nums', isPositive ? 'text-emerald-300' : 'text-red-300')}>
            {pctStr}
          </span>
          {' — '}
          <span className="text-slate-200">{stripMarkdown(catalyst.text?.trim() || 'Price movement as of last update.')}</span>
        </p>
        <p className="text-slate-500 text-xs mt-1.5">
          Updated {getRelativeTime(catalyst.timestamp instanceof Date ? catalyst.timestamp.toISOString() : String(catalyst.timestamp))}
        </p>
      </div>

      {/* ——— Section 2: Key Metrics Grid ——— */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <MetricCell label="Market Cap" value={metrics.marketCap} delta={metricDeltas?.marketCap} historical={historicalMetrics?.marketCap} favorability="higher" />
          <MetricCell
            label="52W Range"
            value={format52WPosition(metrics.fiftyTwoWeekRange)}
            delta={metricDeltas?.fiftyTwoWeekRange}
          />
          <MetricCell label="Avg Volume" value={metrics.avgVolume} delta={metricDeltas?.avgVolume} historical={historicalMetrics?.avgVolume} favorability="higher" />
          <MetricCell label="Beta" value={Number.isFinite(metrics.beta) ? metrics.beta.toFixed(2) : '—'} delta={metricDeltas?.beta} historical={historicalMetrics?.beta} favorability="neutral" />
          <MetricCell
            label="Short Interest"
            value={Number.isFinite(metrics.shortInterest) ? `${metrics.shortInterest.toFixed(2)}%` : '—'}
            delta={metricDeltas?.shortInterest}
            historical={historicalMetrics?.shortInterest}
            favorability="lower"
          />
          <MetricCell label="Next Earnings" value={metrics.nextEarnings || '—'} delta={metricDeltas?.nextEarnings} />
          <IVMetricCell ivPercentile={metrics.ivPercentile} currentIV={metrics.currentIV} />
        </div>
      </div>

      {/* ——— Section 3: Investment Thesis Accordion ——— */}
      <div className="p-6">
        {ACCORDION_SECTIONS.map(({ key, label, accent }) => {
          const items = thesis[key] ?? [];
          const isOpen = expanded === key;
          const isEmpty = items.length === 0;
          return (
            <div
              key={key}
              className={cn(
                'rounded-lg border border-slate-700/50 mb-3 overflow-hidden',
                'border-l-4',
                accent,
                isEmpty && 'opacity-60'
              )}
            >
              <button
                type="button"
                onClick={() => toggle(key)}
                className="w-full flex items-center justify-between px-4 py-3 text-left bg-slate-800/40 hover:bg-slate-800/60 transition-colors"
              >
                <span className="font-medium text-slate-200">{label}</span>
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                )}
              </button>
              {isOpen && (
                isEmpty ? (
                  <div className="px-4 pb-4 pt-2">
                    <p className="text-sm text-slate-500 italic">
                      {thesisStatus === 'empty'
                        ? 'No analysis available. Click Refresh to generate.'
                        : 'Generating analysis\u2026'}
                    </p>
                  </div>
                ) : (
                  <ul className="px-4 pb-4 pt-1 space-y-2 text-sm text-slate-300">
                    {items.map((item, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-slate-500 mt-0.5 flex-shrink-0">•</span>
                        <span>{stripMarkdown(item)}</span>
                      </li>
                    ))}
                  </ul>
                )
              )}
            </div>
          );
        })}
      </div>

      {/* ——— Footer: AI-generated · Last updated · Refresh ——— */}
      <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-700/50 bg-slate-900/30">
        <p className="text-xs text-slate-500">
          AI-generated · Last updated {getRelativeTime(lastAnalysisUpdate instanceof Date ? lastAnalysisUpdate.toISOString() : String(lastAnalysisUpdate))}
        </p>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        )}
      </div>
    </div>
  );
}

function getPercentileColor(pct: number, fav?: 'higher' | 'lower' | 'neutral'): string {
  if (!fav || fav === 'neutral') return 'text-slate-400';
  if (fav === 'higher') {
    if (pct >= 70) return 'text-emerald-400';
    if (pct <= 30) return 'text-red-400';
    return 'text-slate-400';
  }
  // lower = green when low percentile
  if (pct <= 30) return 'text-emerald-400';
  if (pct >= 70) return 'text-red-400';
  return 'text-slate-400';
}

function MetricCell({
  label,
  value,
  delta,
  historical,
  favorability,
}: {
  label: string;
  value: string;
  delta?: string;
  historical?: MetricHistorical;
  favorability?: 'higher' | 'lower' | 'neutral';
}) {
  return (
    <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className="font-semibold text-white font-mono text-base tabular-nums">{value}</p>
      {delta != null && delta !== '' && (
        <p className="text-xs text-slate-400 mt-1 tabular-nums">{delta}</p>
      )}
      {historical && (
        <div className="mt-1.5">
          {historical.buildingHistory ? (
            <p className="text-[11px] text-slate-500 italic">Building history\u2026</p>
          ) : historical.percentile != null ? (
            <p className={cn('text-[11px] tabular-nums font-medium', getPercentileColor(historical.percentile, favorability))}>
              {ordinal(historical.percentile)} %ile
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function getIVColor(pct: number): string {
  if (pct > 70) return 'text-emerald-400';
  if (pct >= 40) return 'text-amber-400';
  return 'text-red-400';
}

function IVMetricCell({ ivPercentile, currentIV }: { ivPercentile?: number | null; currentIV?: number | null }) {
  const hasData = ivPercentile != null && Number.isFinite(ivPercentile);
  const hasIV = currentIV != null && Number.isFinite(currentIV);

  return (
    <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">IV Percentile</p>
      {hasData ? (
        <>
          <p className={cn('font-semibold font-mono text-base tabular-nums', getIVColor(ivPercentile!))}>
            {ordinal(Math.round(ivPercentile!))} %ile
          </p>
          {hasIV && (
            <p className="text-[11px] text-slate-400 mt-1 tabular-nums">IV: {currentIV!.toFixed(1)}%</p>
          )}
        </>
      ) : hasIV ? (
        <>
          <p className="font-semibold text-white font-mono text-base tabular-nums">
            {currentIV!.toFixed(1)}%
          </p>
          <p className="text-[11px] text-slate-500 italic mt-1">Building history\u2026</p>
        </>
      ) : (
        <>
          <p className="font-semibold text-slate-500 font-mono text-base">&mdash;</p>
          <p className="text-[11px] text-slate-600 mt-1">Options data unavailable</p>
        </>
      )}
    </div>
  );
}
