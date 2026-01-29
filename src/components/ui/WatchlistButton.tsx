'use client';

import { useState, useEffect } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';

interface WatchlistButtonProps {
  ticker: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function WatchlistButton({
  ticker,
  className,
  size = 'md',
  showLabel = false,
}: WatchlistButtonProps) {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check if ticker is in watchlist on mount
  useEffect(() => {
    if (!isAuthenticated) {
      setChecking(false);
      return;
    }

    const checkWatchlist = async () => {
      try {
        const res = await fetch(`/api/watchlist/check?ticker=${ticker}`);
        if (res.ok) {
          const data = await res.json();
          setIsInWatchlist(data.inWatchlist);
        }
      } catch {
        // Silently fail
      } finally {
        setChecking(false);
      }
    };

    checkWatchlist();
  }, [ticker, isAuthenticated]);

  const toggleWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated || loading) return;

    setLoading(true);
    try {
      if (isInWatchlist) {
        const res = await fetch(`/api/watchlist/${ticker}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setIsInWatchlist(false);
        }
      } else {
        const res = await fetch('/api/watchlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticker }),
        });
        if (res.ok) {
          setIsInWatchlist(true);
        }
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <button
      onClick={toggleWatchlist}
      disabled={loading || checking}
      className={cn(
        'rounded-lg transition-all luma-button',
        sizeClasses[size],
        isInWatchlist
          ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
          : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-amber-400',
        (loading || checking) && 'opacity-50 cursor-wait',
        className
      )}
      title={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
    >
      {loading || checking ? (
        <Loader2 className={cn(iconSizes[size], 'animate-spin')} />
      ) : (
        <div className="flex items-center gap-1.5">
          <Star
            className={cn(iconSizes[size], isInWatchlist && 'fill-current')}
          />
          {showLabel && (
            <span className="text-xs font-medium">
              {isInWatchlist ? 'Watching' : 'Watch'}
            </span>
          )}
        </div>
      )}
    </button>
  );
}
