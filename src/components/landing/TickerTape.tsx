'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TickerData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

const TICKERS = ['BTC-USD', 'SPY', 'QQQ', 'ASTS'];
const DISPLAY_NAMES: Record<string, string> = {
  'BTC-USD': 'BTC',
  'SPY': 'SPY',
  'QQQ': 'QQQ',
  'ASTS': 'ASTS',
};

export function TickerTape() {
  const [tickers, setTickers] = useState<TickerData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const response = await fetch(`/api/quote/batch?symbols=${TICKERS.join(',')}`);
        if (response.ok) {
          const data = await response.json();
          setTickers(data.quotes || []);
        } else {
          // Fallback with mock data if API fails
          setTickers([
            { symbol: 'BTC-USD', price: 104250.00, change: 1250.50, changePercent: 1.21 },
            { symbol: 'SPY', price: 598.45, change: 3.21, changePercent: 0.54 },
            { symbol: 'QQQ', price: 512.30, change: -2.15, changePercent: -0.42 },
            { symbol: 'ASTS', price: 28.75, change: 1.85, changePercent: 6.88 },
          ]);
        }
      } catch {
        // Fallback with mock data
        setTickers([
          { symbol: 'BTC-USD', price: 104250.00, change: 1250.50, changePercent: 1.21 },
          { symbol: 'SPY', price: 598.45, change: 3.21, changePercent: 0.54 },
          { symbol: 'QQQ', price: 512.30, change: -2.15, changePercent: -0.42 },
          { symbol: 'ASTS', price: 28.75, change: 1.85, changePercent: 6.88 },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchPrices();
    const interval = setInterval(fetchPrices, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number, symbol: string) => {
    if (symbol === 'BTC-USD') {
      return price.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
    return price.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
  };

  // Double the tickers for seamless loop
  const displayTickers = [...tickers, ...tickers, ...tickers, ...tickers];

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-black/80 via-slate-900/80 to-black/80 backdrop-blur-md border-b border-violet-400/20">
      <div className="relative overflow-hidden h-8">
        <div className="ticker-scroll flex items-center h-full gap-12 whitespace-nowrap">
          {loading ? (
            <div className="flex items-center gap-2 text-slate-500 text-xs px-4">
              <div className="w-3 h-3 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
              Loading market data...
            </div>
          ) : (
            displayTickers.map((ticker, index) => (
              <div key={`${ticker.symbol}-${index}`} className="flex items-center gap-3 text-sm">
                <span className="font-semibold text-white">{DISPLAY_NAMES[ticker.symbol] || ticker.symbol}</span>
                <span className="text-slate-300 tabular-nums">{formatPrice(ticker.price, ticker.symbol)}</span>
                <span className={`flex items-center gap-1 tabular-nums ${ticker.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {ticker.changePercent >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {ticker.changePercent >= 0 ? '+' : ''}{ticker.changePercent.toFixed(2)}%
                </span>
              </div>
            ))
          )}
        </div>
      </div>
      
    </div>
  );
}
