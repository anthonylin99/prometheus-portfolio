'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePortfolio, useUserPortfolio, useEarnings, useAuth, useUserProfile } from '@/lib/hooks';
import { CompanyLogo } from '@/components/ui/CompanyLogo';
import { SocialFeed } from '@/components/social/SocialFeed';
import { HoldingsPriceChart } from '@/components/charts/HoldingsPriceChart';
import { ThesisSection } from '@/components/holdings/ThesisSection';
import { StockAnalysisPanel } from '@/components/holdings/StockAnalysisPanel';
import { CollectionBadges } from '@/components/holdings/CollectionBadges';
import { useStockAnalysis } from '@/hooks/useStockAnalysis';
import { formatCurrency, formatPercentage, formatPercentagePrecise, cn } from '@/lib/utils';
import { useVisibility } from '@/lib/visibility-context';
import { categoryColors, Category, HoldingWithPrice } from '@/types/portfolio';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  ExternalLink,
  Target,
  Calendar,
  Coins,
  MessageSquare,
  Clock,
  Plus,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface QuoteData {
  ticker: string;
  price: number;
  dayChangePercent: number;
  name?: string;
  shortName?: string;
  sector?: string;
  industry?: string;
}

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticker = (params.ticker as string).toUpperCase();
  
  // Auth and user state
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { profile } = useUserProfile();
  
  // Use user portfolio for authenticated users, public for guests
  const publicPortfolio = usePortfolio();
  const userPortfolio = useUserPortfolio();
  const { holdings, loading: portfolioLoading, refresh } = isAuthenticated ? userPortfolio : publicPortfolio;
  
  const { earnings } = useEarnings(ticker);
  const { isVisible } = useVisibility();

  // State for quote data and whether asset is in portfolio
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [addingToPortfolio, setAddingToPortfolio] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addFormData, setAddFormData] = useState({
    shares: 1,
    category: 'Big Tech' as Category,
    costBasis: 0,
  });

  const holding = holdings.find(h => h.ticker.toUpperCase() === ticker.toUpperCase()) as HoldingWithPrice | undefined;
  const alreadyInPortfolio = !!holding;
  
  // Get portfolio name for display
  const portfolioName = isAuthenticated 
    ? (profile?.etfTicker ? `$${profile.etfTicker}` : 'My Portfolio')
    : 'Prometheus ETF';
  
  // Fetch quote data if not in portfolio (static once loaded)
  useEffect(() => {
    if (!holding && !quoteData && !loadingQuote) {
      setLoadingQuote(true);
      fetch(`/api/quote/${ticker}`)
        .then(res => res.json())
        .then(data => {
          if (data.price) {
            setQuoteData({
              ticker: data.ticker,
              price: data.price,
              dayChangePercent: data.dayChangePercent || 0,
              name: data.name || data.shortName,
              shortName: data.shortName,
              sector: data.sector,
              industry: data.industry,
            });
          }
        })
        .catch(err => {
          console.error('Failed to fetch quote:', err);
        })
        .finally(() => {
          setLoadingQuote(false);
        });
    }
  }, [holding, ticker, quoteData, loadingQuote]);

  const { analysisProps, historicalMetrics, loading: analysisLoading, refreshing: analysisRefreshing, error: analysisError, refetch } = useStockAnalysis(ticker, holding ?? null);

  const handleAddToPortfolio = async () => {
    if (!quoteData) return;
    
    // Must be authenticated to add to portfolio
    if (!isAuthenticated) {
      setAddError('Please sign in to add stocks to your portfolio');
      return;
    }
    
    setAddingToPortfolio(true);
    setAddError(null);
    setAddSuccess(false);
    
    try {
      // Use user holdings API for authenticated users
      const response = await fetch('/api/user/holdings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: ticker,
          name: quoteData.name || quoteData.shortName || ticker,
          shares: addFormData.shares,
          category: addFormData.category,
          costBasis: addFormData.costBasis || undefined,
          description: quoteData.sector || quoteData.industry || '',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add holding');
      }

      // Success!
      const result = await response.json();
      setAddSuccess(true);
      setShowAddForm(false);
      
      // Update success message if duplicate
      if (result.wasDuplicate) {
        // Show a different message for duplicates
      }
      
      // Force refresh portfolio data immediately
      if (refresh) {
        await refresh();
      }
      
      // Also trigger a page refresh to ensure data is updated
      router.refresh();
      
      // Redirect to holdings page after short delay
      setTimeout(() => {
        // Force reload to ensure fresh data
        window.location.href = '/holdings';
      }, 1500);
    } catch (error) {
      console.error('Failed to add holding:', error);
      setAddError(error instanceof Error ? error.message : 'Failed to add holding. Please try again.');
    } finally {
      setAddingToPortfolio(false);
    }
  };

  // Show loading while auth or portfolio is loading
  if ((authLoading || portfolioLoading) && !holding && !quoteData) {
    return (
      <div className="p-6 lg:p-8 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-violet-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400">Loading asset data...</p>
        </div>
      </div>
    );
  }

  // If not in portfolio, show add option
  if (!holding) {
    const displayName = quoteData?.name || quoteData?.shortName || ticker;
    const price = quoteData?.price || 0;
    const dayChangePercent = quoteData?.dayChangePercent || 0;
    const isPositive = dayChangePercent >= 0;

    return (
      <div className="p-6 lg:p-8 min-h-screen">
        <Link 
          href="/holdings"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Holdings
        </Link>

        {loadingQuote ? (
          <div className="glass-card p-12 rounded-2xl text-center">
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading asset data...</p>
          </div>
        ) : quoteData ? (
          <>
            {/* Hero Section */}
            <div className="glass-card p-8 rounded-3xl mb-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-400/5 via-transparent to-transparent" />
              
              <div className="relative">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  <div className="flex items-start gap-5">
                    <CompanyLogo ticker={ticker} size="lg" className="w-20 h-20 text-2xl" />
                    <div>
                      <h1 className="text-4xl font-bold text-white mb-1">{ticker}</h1>
                      <p className="text-xl text-slate-400">{displayName}</p>
                      {quoteData.sector && (
                        <p className="text-slate-500 mt-2">{quoteData.sector} {quoteData.industry ? `• ${quoteData.industry}` : ''}</p>
                      )}
                    </div>
                  </div>

                  <div className="text-left lg:text-right">
                    <p className="text-sm text-slate-400 mb-1">Current Price</p>
                    <p className="text-4xl font-bold text-white tabular-nums">
                      ${price.toFixed(2)}
                    </p>
                    <div className={cn(
                      "flex items-center gap-1 mt-1 lg:justify-end text-lg font-medium",
                      isPositive ? "text-emerald-400" : "text-red-400"
                    )}>
                      {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                      <span>{formatPercentagePrecise(dayChangePercent)} today</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Add to Portfolio Section */}
            <div className="glass-card p-8 rounded-2xl mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-violet-400/20 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-violet-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-1">Add to Portfolio</h2>
                  {isAuthenticated ? (
                    <div className="flex items-center gap-2">
                      <p className="text-slate-400">Adding to:</p>
                      <span className="text-violet-400 font-bold text-lg">{portfolioName}</span>
                      {profile?.etfName && (
                        <span className="text-slate-500 text-sm">({profile.etfName})</span>
                      )}
                    </div>
                  ) : (
                    <p className="text-amber-400">Sign in to add stocks to your portfolio</p>
                  )}
                </div>
              </div>
              
              {/* Success message */}
              {addSuccess && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 mb-4">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <div className="flex-1">
                    <p className="text-emerald-400 font-medium">
                      {alreadyInPortfolio 
                        ? `Added more shares of ${ticker} to ${portfolioName}!`
                        : `Successfully added ${ticker} to ${portfolioName}!`}
                    </p>
                    <p className="text-emerald-400/70 text-sm">Redirecting to holdings...</p>
                  </div>
                </div>
              )}

              {/* Error message */}
              {addError && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/20 border border-red-500/30 mb-4">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <p className="text-red-400">{addError}</p>
                </div>
              )}

              {!isAuthenticated ? (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-400 to-violet-400 hover:from-violet-400 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-400/50"
                >
                  Sign In to Add
                </Link>
              ) : !showAddForm && !addSuccess ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-violet-400/10 border border-violet-400/20">
                    <p className="text-sm text-slate-300 mb-2">
                      <span className="font-semibold">Portfolio:</span> <span className="text-violet-400 font-bold">{portfolioName}</span>
                    </p>
                    {alreadyInPortfolio && (
                      <p className="text-xs text-amber-400">
                        This stock is already in your portfolio. Click below to add more shares.
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="w-full px-6 py-3 bg-gradient-to-r from-violet-400 to-violet-400 hover:from-violet-400 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-400/50"
                  >
                    {alreadyInPortfolio ? 'Add More Shares' : 'Add to Portfolio'}
                  </button>
                </div>
              ) : !addSuccess ? (
                <div className="space-y-4">
                  {/* Portfolio indicator - more prominent */}
                  <div className="p-4 rounded-lg bg-violet-400/10 border-2 border-violet-400/30">
                    <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Adding to Portfolio</p>
                    <p className="text-lg font-bold text-white">
                      {portfolioName}
                      {profile?.etfName && <span className="text-slate-400 text-base font-normal ml-2">({profile.etfName})</span>}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Shares</label>
                      <input
                        type="number"
                        min="0.0001"
                        step="0.0001"
                        value={addFormData.shares}
                        onChange={(e) => setAddFormData({ ...addFormData, shares: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-violet-400/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Category</label>
                      <select
                        value={addFormData.category}
                        onChange={(e) => setAddFormData({ ...addFormData, category: e.target.value as Category })}
                        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-violet-400/50"
                      >
                        {Object.keys(categoryColors).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Cost Basis (Optional)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={addFormData.costBasis}
                        onChange={(e) => setAddFormData({ ...addFormData, costBasis: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-violet-400/50"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleAddToPortfolio}
                      disabled={addingToPortfolio || addFormData.shares <= 0}
                      className="px-6 py-3 bg-gradient-to-r from-violet-400 to-violet-400 hover:from-violet-400 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addingToPortfolio ? (
                        <>
                          <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        'Add to Portfolio'
                      )}
                    </button>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-white font-medium rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Price Chart */}
            <div className="mb-8">
              <HoldingsPriceChart ticker={ticker} companyName={displayName} />
            </div>

            {/* Collection Badges */}
            <CollectionBadges ticker={ticker} />

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
              
              <SocialFeed ticker={ticker} />
            </div>

            {/* Quick Links */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="text-lg font-bold text-white mb-4">Quick Links</h2>
              <div className="flex flex-wrap gap-3">
                <a 
                  href={`https://finance.yahoo.com/quote/${ticker}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                >
                  Yahoo Finance <ExternalLink className="w-4 h-4" />
                </a>
                <a 
                  href={`https://www.tradingview.com/symbols/${ticker}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                >
                  TradingView <ExternalLink className="w-4 h-4" />
                </a>
                <a 
                  href={`https://www.google.com/search?q=${displayName}+stock`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                >
                  Google <ExternalLink className="w-4 h-4" />
                </a>
                <a 
                  href={`https://stocktwits.com/symbol/${ticker}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                >
                  StockTwits <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </>
        ) : (
          <div className="glass-card p-8 rounded-2xl text-center max-w-md mx-auto">
            <p className="text-slate-400 mb-4">Asset &quot;{ticker}&quot; not found</p>
            <Link 
              href="/holdings"
              className="px-4 py-2 bg-violet-400 text-white rounded-lg hover:bg-violet-400 transition-colors inline-block"
            >
              Back to Holdings
            </Link>
          </div>
        )}
      </div>
    );
  }

  // Existing portfolio holding view (unchanged)
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
        <div className="absolute inset-0 bg-gradient-to-br from-violet-400/5 via-transparent to-transparent" />
        
        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            {/* Left: Logo & Info */}
            <div className="flex items-start gap-5">
              <CompanyLogo ticker={holding.ticker} domain={holding.logoDomain} size="lg" className="w-20 h-20 text-2xl" />
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
                {isVisible && Number.isFinite(holding.currentPrice) ? `$${holding.currentPrice.toFixed(2)}` : '$••••••'}
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

      {/* Collection Badges */}
      <CollectionBadges ticker={holding.ticker} />

      {/* Price Chart */}
      <div className="mb-8">
        <HoldingsPriceChart ticker={holding.ticker} companyName={holding.name} logoDomain={holding.logoDomain} />
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
          refreshing={analysisRefreshing}
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
