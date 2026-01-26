'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { usePortfolio, useEarnings } from '@/lib/hooks';
import { CompanyLogo } from '@/components/ui/CompanyLogo';
import { SocialFeed } from '@/components/social/SocialFeed';
import { HoldingsPriceChart } from '@/components/charts/HoldingsPriceChart';
import { ThesisSection } from '@/components/holdings/ThesisSection';
import { StockAnalysisPanel } from '@/components/holdings/StockAnalysisPanel';
import { useStockAnalysis } from '@/hooks/useStockAnalysis';
import { formatCurrency, formatPercentage, formatPercentagePrecise, cn } from '@/lib/utils';
import { useVisibility } from '@/lib/visibility-context';
import { categoryColors } from '@/types/portfolio';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  ExternalLink,
  Target,
  Calendar,
  Coins,
  MessageSquare,
  Clock
} from 'lucide-react';

export default function AssetDetailPage() {
  const params = useParams();
  const ticker = params.ticker as string;
  const { holdings, loading } = usePortfolio();
  const { earnings } = useEarnings(ticker);

  const holding = holdings.find(h => h.ticker.toUpperCase() === ticker.toUpperCase());
  const { isVisible } = useVisibility();
  const { analysisProps, historicalMetrics, loading: analysisLoading, error: analysisError, refetch } = useStockAnalysis(ticker, holding ?? null);

  if (loading && !holding) {
    return (
      <div className="p-6 lg:p-8 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400">Loading asset data...</p>
        </div>
      </div>
    );
  }

  if (!holding) {
    return (
      <div className="p-6 lg:p-8 min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 rounded-2xl text-center max-w-md">
          <p className="text-slate-400 mb-4">Asset &quot;{ticker}&quot; not found in portfolio</p>
          <Link 
            href="/holdings"
            className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors inline-block"
          >
            Back to Holdings
          </Link>
        </div>
      </div>
    );
  }

  const color = categoryColors[holding.category];
  const isPositive = holding.dayChange >= 0;

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      {/* Back Button */}
      <Link 
        href="/holdings"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Holdings
      </Link>

      {/* Hero Section */}
      <div className="glass-card p-8 rounded-3xl mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-transparent" />
        
        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            {/* Left: Logo & Info */}
            <div className="flex items-start gap-5">
              <CompanyLogo ticker={holding.ticker} size="lg" className="w-20 h-20 text-2xl" />
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-4xl font-bold text-white">{holding.ticker}</h1>
                  <span 
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    {holding.category}
                  </span>
                </div>
                <p className="text-xl text-slate-400">{holding.name}</p>
                <p className="text-slate-500 mt-2 max-w-lg">{holding.description}</p>
                
                {/* Earnings Date */}
                {earnings && (
                  <div className="flex items-center gap-2 mt-3">
                    <Clock className="w-4 h-4 text-violet-400" />
                    <span className="text-sm text-slate-400">Next Earnings:</span>
                    <span className="text-sm font-medium text-white">{earnings.formatted}</span>
                    {earnings.daysUntil <= 7 && earnings.daysUntil >= 0 && (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full font-medium">
                        {earnings.daysUntil === 0 ? 'Today' : earnings.daysUntil === 1 ? 'Tomorrow' : `In ${earnings.daysUntil} days`}
                      </span>
                    )}
                    {earnings.daysUntil < 0 && (
                      <span className="px-2 py-0.5 bg-slate-500/20 text-slate-400 text-xs rounded-full font-medium">
                        Passed
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Price */}
            <div className="text-left lg:text-right">
              <p className="text-sm text-slate-400 mb-1">Current Price</p>
              <p className="text-4xl font-bold text-white tabular-nums">
                {isVisible ? `$${holding.currentPrice.toFixed(2)}` : '$••••••'}
              </p>
              <div className={cn(
                "flex items-center gap-1 mt-1 lg:justify-end text-lg font-medium",
                isPositive ? "text-emerald-400" : "text-red-400"
              )}>
                {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                <span>{formatPercentagePrecise(holding.dayChangePercent)} today</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-5 rounded-xl">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
            <Coins className="w-4 h-4" />
            <span>Shares Held</span>
          </div>
          <p className="text-2xl font-bold text-white tabular-nums">
            {isVisible ? holding.shares.toLocaleString() : '••••'}
          </p>
        </div>

        <div className="glass-card p-5 rounded-xl">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
            <TrendingUp className="w-4 h-4" />
            <span>Total Value</span>
          </div>
          <p className="text-2xl font-bold text-white tabular-nums">
            {isVisible ? formatCurrency(holding.value) : '$••••••'}
          </p>
        </div>

        <div className="glass-card p-5 rounded-xl">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
            <Target className="w-4 h-4" />
            <span>Portfolio Weight</span>
          </div>
          <p className="text-2xl font-bold text-white tabular-nums">
            {formatPercentage(holding.weight)}
          </p>
        </div>

        <div className="glass-card p-5 rounded-xl">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
            <Calendar className="w-4 h-4" />
            <span>Day Change</span>
          </div>
          <p className={cn(
            "text-2xl font-bold tabular-nums",
            isPositive ? "text-emerald-400" : "text-red-400"
          )}>
            {isVisible ? `${isPositive ? '+' : ''}${formatCurrency(holding.dayChange)}` : '$••••'}
          </p>
        </div>
      </div>

      {/* Price Chart */}
      <div className="mb-8">
        <HoldingsPriceChart ticker={holding.ticker} companyName={holding.name} />
      </div>

      {/* Anthony's Thesis */}
      <div className="mb-8">
        <ThesisSection ticker={holding.ticker} />
      </div>

      {/* Stock Analysis (AI) */}
      {analysisError && (
        <div className="mb-4 p-4 rounded-xl bg-red-900/30 border border-red-800/50 flex items-center gap-2">
          <p className="text-red-300 text-sm">{analysisError}</p>
        </div>
      )}
      <div className="mb-8">
        <StockAnalysisPanel
          {...analysisProps}
          loading={analysisLoading}
          onRefresh={refetch}
          historicalMetrics={historicalMetrics}
        />
      </div>

      {/* News & Community Feed */}
      <div className="glass-card p-6 rounded-2xl mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">News & Community</h2>
            <p className="text-sm text-slate-400">Latest updates and social sentiment</p>
          </div>
        </div>
        
        <SocialFeed ticker={holding.ticker} />
      </div>

      {/* Quick Links */}
      <div className="glass-card p-6 rounded-2xl">
        <h2 className="text-lg font-bold text-white mb-4">Quick Links</h2>
        <div className="flex flex-wrap gap-3">
          <a 
            href={`https://finance.yahoo.com/quote/${holding.ticker}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
          >
            Yahoo Finance <ExternalLink className="w-4 h-4" />
          </a>
          <a 
            href={`https://www.tradingview.com/symbols/${holding.ticker}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
          >
            TradingView <ExternalLink className="w-4 h-4" />
          </a>
          <a 
            href={`https://www.google.com/search?q=${holding.name}+stock`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
          >
            Google <ExternalLink className="w-4 h-4" />
          </a>
          <a 
            href={`https://stocktwits.com/symbol/${holding.ticker}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
          >
            StockTwits <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
