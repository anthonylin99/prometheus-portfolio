'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  HoldingWithPrice,
  PortfolioSummary,
  CategoryData,
  ETFData,
  HistoricalDataPoint,
  TimeRange,
  RiskMetrics,
  BenchmarkData,
  NewsArticle,
  StockTwitsMessage,
  EarningsInfo
} from '@/types/portfolio';

interface PortfolioData {
  holdings: HoldingWithPrice[];
  summary: PortfolioSummary;
  categories: CategoryData[];
  cached?: boolean;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function usePortfolio(): PortfolioData {
  const [holdings, setHoldings] = useState<HoldingWithPrice[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary>({
    totalValue: 0,
    previousValue: 0,
    dayChange: 0,
    dayChangePercent: 0,
    holdingsCount: 0,
    categoriesCount: 0,
    lastUpdated: new Date().toISOString(),
  });
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);

  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/prices', {
        method: forceRefresh ? 'POST' : 'GET',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch prices');
      }
      
      const data = await response.json();
      
      setHoldings(data.holdings || []);
      setSummary(data.summary || summary);
      setCategories(data.categories || []);
      setCached(data.cached || false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { holdings, summary, categories, cached, loading, error, refresh };
}

interface ETFDataHook {
  etf: ETFData | null;
  loading: boolean;
  error: string | null;
}

export function useETF(): ETFDataHook {
  const [etf, setETF] = useState<ETFData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchETF() {
      try {
        setLoading(true);
        const response = await fetch('/api/etf');
        if (!response.ok) throw new Error('Failed to fetch ETF data');
        const data = await response.json();
        setETF(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    
    fetchETF();
  }, []);

  return { etf, loading, error };
}

interface HistoricalDataHook {
  data: HistoricalDataPoint[];
  loading: boolean;
  error: string | null;
  range: TimeRange;
  setRange: (range: TimeRange) => void;
}

export function useHistoricalData(initialRange: TimeRange = 'ALL'): HistoricalDataHook {
  const [data, setData] = useState<HistoricalDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<TimeRange>(initialRange);

  useEffect(() => {
    async function fetchHistorical() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/historical?range=${range}`);
        if (!response.ok) throw new Error('Failed to fetch historical data');
        const result = await response.json();
        setData(result.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    
    fetchHistorical();
  }, [range]);

  return { data, loading, error, range, setRange };
}

// Risk Metrics Hook
interface RiskMetricsHook {
  metrics: RiskMetrics | null;
  loading: boolean;
  error: string | null;
}

export function useRiskMetrics(range: TimeRange = '1Y'): RiskMetricsHook {
  const [metrics, setMetrics] = useState<RiskMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/volatility?range=${range}`);
        if (!response.ok) throw new Error('Failed to fetch risk metrics');
        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    
    fetchMetrics();
  }, [range]);

  return { metrics, loading, error };
}

// Benchmarks Hook
interface BenchmarksHook {
  portfolio: BenchmarkData | null;
  benchmarks: BenchmarkData[];
  loading: boolean;
  error: string | null;
}

export function useBenchmarks(range: TimeRange = '1Y'): BenchmarksHook {
  const [portfolio, setPortfolio] = useState<BenchmarkData | null>(null);
  const [benchmarks, setBenchmarks] = useState<BenchmarkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBenchmarks() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/benchmarks?range=${range}`);
        if (!response.ok) throw new Error('Failed to fetch benchmarks');
        const data = await response.json();
        setPortfolio(data.portfolio);
        setBenchmarks(data.benchmarks || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    
    fetchBenchmarks();
  }, [range]);

  return { portfolio, benchmarks, loading, error };
}

// News Hook
interface NewsHook {
  articles: NewsArticle[];
  loading: boolean;
  error: string | null;
}

export function useNews(ticker: string): NewsHook {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/news/${ticker}`);
        if (!response.ok) throw new Error('Failed to fetch news');
        const data = await response.json();
        setArticles(data.articles || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    
    fetchNews();
  }, [ticker]);

  return { articles, loading, error };
}

// StockTwits Hook
interface StockTwitsHook {
  messages: StockTwitsMessage[];
  loading: boolean;
  error: string | null;
}

export function useStockTwits(ticker: string): StockTwitsHook {
  const [messages, setMessages] = useState<StockTwitsMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStockTwits() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/social/stocktwits/${ticker}`);
        if (!response.ok) throw new Error('Failed to fetch StockTwits');
        const data = await response.json();
        setMessages(data.messages || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    
    fetchStockTwits();
  }, [ticker]);

  return { messages, loading, error };
}

// Earnings Hook
interface EarningsHook {
  earnings: EarningsInfo | null;
  loading: boolean;
  error: string | null;
}

export function useEarnings(ticker: string): EarningsHook {
  const [earnings, setEarnings] = useState<EarningsInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEarnings() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/earnings/${ticker}`);
        if (!response.ok) throw new Error('Failed to fetch earnings');
        const data = await response.json();
        setEarnings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    
    fetchEarnings();
  }, [ticker]);

  return { earnings, loading, error };
}

// ============================================================
// Social / Multi-user hooks
// ============================================================

export function useAuth() {
  const { data: session, status } = useSession();
  return {
    user: session?.user ?? null,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
  };
}

// User-scoped portfolio (fetches from /api/user/portfolio)
export function useUserPortfolio(): PortfolioData {
  const [holdings, setHoldings] = useState<HoldingWithPrice[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary>({
    totalValue: 0,
    previousValue: 0,
    dayChange: 0,
    dayChangePercent: 0,
    holdingsCount: 0,
    categoriesCount: 0,
    lastUpdated: new Date().toISOString(),
  });
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/user/portfolio');
      if (!response.ok) throw new Error('Failed to fetch portfolio');
      const data = await response.json();
      setHoldings(data.holdings || []);
      setSummary(data.summary || summary);
      setCategories(data.categories || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { holdings, summary, categories, loading, error, refresh };
}

// Circle data
interface CircleData {
  id: string;
  name: string;
  ownerId: string;
  inviteCode: string;
  members: string[];
}

export function useCircle() {
  const [circle, setCircle] = useState<CircleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCircle() {
      try {
        setLoading(true);
        const res = await fetch('/api/circle');
        if (!res.ok) throw new Error('Failed to fetch circle');
        const data = await res.json();
        setCircle(data.circle || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchCircle();
  }, []);

  return { circle, loading, error };
}

// Leaderboard data
interface RankedMember {
  userId: string;
  name: string;
  etfTicker: string;
  avatarColor: string;
  periodReturn: number;
  rank: number;
  holdingsCount: number;
}

export function useLeaderboard(range: '1W' | '1M' | 'YTD' = 'YTD') {
  const [rankings, setRankings] = useState<RankedMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/circle/leaderboard?range=${range}`);
        if (!res.ok) throw new Error('Failed to fetch leaderboard');
        const data = await res.json();
        setRankings(data.rankings || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, [range]);

  return { rankings, loading, error };
}

// Activity feed
interface ActivityEvent {
  id: string;
  userId: string;
  userName: string;
  etfTicker: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

export function useActivityFeed(limit = 50) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivity() {
      try {
        setLoading(true);
        const res = await fetch(`/api/circle/activity?limit=${limit}`);
        if (!res.ok) throw new Error('Failed to fetch activity');
        const data = await res.json();
        setEvents(data.events || []);
      } catch {
        // Silently fail for activity feed
      } finally {
        setLoading(false);
      }
    }
    fetchActivity();
  }, [limit]);

  return { events, loading };
}

// User profile
interface AppUserProfile {
  id: string;
  email: string;
  name: string;
  etfTicker: string;
  etfName: string;
  avatarColor: string;
  circleId: string | null;
  onboarded: boolean;
}

export function useUserProfile() {
  const [profile, setProfile] = useState<AppUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch {
        // Profile may not exist yet
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  return { profile, loading };
}
