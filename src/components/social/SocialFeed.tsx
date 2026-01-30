'use client';

import { useState } from 'react';
import { useNews, useStockTwits } from '@/lib/hooks';
import { NewsArticle, StockTwitsMessage } from '@/types/portfolio';
import { tickerTwitterAccounts } from '@/data/etf-config';
import { cn } from '@/lib/utils';
import { Newspaper, MessageCircle, ExternalLink, Twitter } from 'lucide-react';

interface SocialFeedProps {
  ticker: string;
  className?: string;
}

export function SocialFeed({ ticker, className }: SocialFeedProps) {
  const [activeTab, setActiveTab] = useState<'news' | 'stocktwits'>('news');
  
  const { articles, loading: newsLoading } = useNews(ticker);
  const { messages, loading: stocktwitsLoading } = useStockTwits(ticker);

  const twitterAccounts = tickerTwitterAccounts[ticker.toUpperCase()] || [];

  return (
    <div className={cn("bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden", className)}>
      {/* Tab Header */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('news')}
          className={cn(
            "flex-1 px-4 py-3 text-sm font-medium transition flex items-center justify-center gap-2",
            activeTab === 'news'
              ? "text-white bg-slate-800/50 border-b-2 border-violet-400"
              : "text-gray-400 hover:text-white"
          )}
        >
          <Newspaper className="w-4 h-4" />
          News
        </button>
        <button
          onClick={() => setActiveTab('stocktwits')}
          className={cn(
            "flex-1 px-4 py-3 text-sm font-medium transition flex items-center justify-center gap-2",
            activeTab === 'stocktwits'
              ? "text-white bg-slate-800/50 border-b-2 border-violet-400"
              : "text-gray-400 hover:text-white"
          )}
        >
          <MessageCircle className="w-4 h-4" />
          StockTwits
        </button>
      </div>
      
      {/* Scrollable Content - Fixed Height */}
      <div className="h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {activeTab === 'news' && (
          <NewsFeed articles={articles} isLoading={newsLoading} />
        )}
        {activeTab === 'stocktwits' && (
          <StockTwitsFeed messages={messages} isLoading={stocktwitsLoading} />
        )}
      </div>
      
      {/* Twitter/X Links for specific tickers */}
      {twitterAccounts.length > 0 && (
        <div className="px-4 py-3 border-t border-slate-800 bg-slate-900/30">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <Twitter className="w-3.5 h-3.5" />
            <span>Community on X</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {twitterAccounts.map(account => (
              <a 
                key={account}
                href={`https://x.com/${account}`} 
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-slate-800 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-slate-700 transition flex items-center gap-1"
              >
                @{account}
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface NewsFeedProps {
  articles: NewsArticle[];
  isLoading: boolean;
}

function NewsFeed({ articles, isLoading }: NewsFeedProps) {
  if (isLoading) return <LoadingState />;
  if (!articles.length) return <EmptyState message="No recent news" />;
  
  return (
    <div className="divide-y divide-slate-800">
      {articles.map((article) => (
        <a
          key={article.id}
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-4 hover:bg-slate-800/50 transition"
        >
          <div className="flex gap-4">
            {article.image && (
              <img 
                src={article.image} 
                alt=""
                className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium line-clamp-2 mb-1">
                {article.headline}
              </h4>
              {article.summary && (
                <p className="text-gray-400 text-sm line-clamp-2 mb-2">
                  {article.summary}
                </p>
              )}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{article.source}</span>
                <span>•</span>
                <span>{formatTimeAgo(article.datetime * 1000)}</span>
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}

interface StockTwitsFeedProps {
  messages: StockTwitsMessage[];
  isLoading: boolean;
}

function StockTwitsFeed({ messages, isLoading }: StockTwitsFeedProps) {
  if (isLoading) return <LoadingState />;
  if (!messages.length) return <EmptyState message="No recent posts" />;
  
  return (
    <div className="divide-y divide-slate-800">
      {messages.map((msg) => (
        <div key={msg.id} className="p-4 hover:bg-slate-800/30 transition">
          <div className="flex items-start gap-3">
            <img 
              src={msg.user.avatarUrl} 
              alt={msg.user.username}
              className="w-10 h-10 rounded-full bg-slate-700"
              onError={(e) => { 
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.user.username}`;
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-medium text-white">{msg.user.name}</span>
                {msg.user.official && (
                  <span className="px-1.5 py-0.5 bg-violet-400/20 text-violet-400 text-xs rounded">Official</span>
                )}
                <span className="text-gray-500 text-sm">@{msg.user.username}</span>
              </div>
              <p className="text-gray-300 text-sm whitespace-pre-wrap break-words">{msg.body}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span>{formatTimeAgo(new Date(msg.createdAt).getTime())}</span>
                {msg.sentiment && (
                  <span className={cn(
                    "px-2 py-0.5 rounded-full",
                    msg.sentiment === 'Bullish' 
                      ? "bg-emerald-500/20 text-emerald-400" 
                      : "bg-red-500/20 text-red-400"
                  )}>
                    {msg.sentiment}
                  </span>
                )}
                {msg.likes > 0 && <span>❤️ {msg.likes}</span>}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-slate-400 text-sm">Loading...</span>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-slate-500 text-sm">{message}</p>
    </div>
  );
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  
  return new Date(timestamp).toLocaleDateString();
}
