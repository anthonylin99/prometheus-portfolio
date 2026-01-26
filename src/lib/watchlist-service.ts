import { getOptionalRedis } from './redis';

export interface WatchlistItem {
  ticker: string;
  addedAt: string;
  note?: string;
}

const WATCHLIST_KEY = (visitorId: string) => `watchlist:${visitorId}`;

/**
 * Get a visitor's full watchlist.
 */
export async function getWatchlist(visitorId: string): Promise<WatchlistItem[]> {
  const redis = getOptionalRedis();
  if (!redis) return [];

  const data = await redis.get<WatchlistItem[]>(WATCHLIST_KEY(visitorId));
  return data || [];
}

/**
 * Add a ticker to the watchlist. No-op if already present.
 */
export async function addToWatchlist(
  visitorId: string,
  ticker: string,
  note?: string
): Promise<WatchlistItem[]> {
  const redis = getOptionalRedis();
  if (!redis) return [];

  const list = await getWatchlist(visitorId);
  const upperTicker = ticker.toUpperCase();

  if (list.some((item) => item.ticker === upperTicker)) {
    return list; // Already in watchlist
  }

  const item: WatchlistItem = {
    ticker: upperTicker,
    addedAt: new Date().toISOString(),
    ...(note ? { note } : {}),
  };

  const updated = [...list, item];
  await redis.set(WATCHLIST_KEY(visitorId), updated);
  return updated;
}

/**
 * Remove a ticker from the watchlist.
 */
export async function removeFromWatchlist(
  visitorId: string,
  ticker: string
): Promise<WatchlistItem[]> {
  const redis = getOptionalRedis();
  if (!redis) return [];

  const list = await getWatchlist(visitorId);
  const updated = list.filter((item) => item.ticker !== ticker.toUpperCase());
  await redis.set(WATCHLIST_KEY(visitorId), updated);
  return updated;
}

/**
 * Check if a ticker is in the watchlist.
 */
export async function isInWatchlist(
  visitorId: string,
  ticker: string
): Promise<boolean> {
  const list = await getWatchlist(visitorId);
  return list.some((item) => item.ticker === ticker.toUpperCase());
}

/**
 * Clear the entire watchlist.
 */
export async function clearWatchlist(visitorId: string): Promise<void> {
  const redis = getOptionalRedis();
  if (!redis) return;
  await redis.del(WATCHLIST_KEY(visitorId));
}
