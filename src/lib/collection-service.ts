import {
  collections,
  collectionCategories,
  getCollectionById,
  getCollectionsByCategory,
  getCategoryById,
  getCollectionsForTicker,
  type Collection,
  type CollectionCategory,
} from '@/data/collections-seed';
import { getOptionalRedis } from './redis';

export type { Collection, CollectionCategory };
export { collectionCategories, getCollectionById, getCollectionsByCategory, getCategoryById, getCollectionsForTicker };

// ─── Live price enrichment ──────────────────────────────────

export interface CollectionStockWithPrice {
  ticker: string;
  note?: string;
  name?: string;
  price?: number;
  dayChangePercent?: number;
  marketCap?: number;
}

export interface CollectionWithPrices extends Omit<Collection, 'stocks'> {
  stocks: CollectionStockWithPrice[];
  category: CollectionCategory;
}

const CACHE_TTL = 300; // 5 min

/**
 * Fetch live quotes for a list of tickers, with optional Redis caching.
 */
async function fetchQuotes(
  tickers: string[]
): Promise<Record<string, { name?: string; price?: number; dayChangePercent?: number; marketCap?: number }>> {
  const redis = getOptionalRedis();
  const result: Record<string, { name?: string; price?: number; dayChangePercent?: number; marketCap?: number }> = {};

  // Try Redis cache first
  const uncached: string[] = [];
  if (redis) {
    const cacheKeys = tickers.map((t) => `collection:quote:${t}`);
    const cached = await redis.mget<(string | null)[]>(...cacheKeys);
    for (let i = 0; i < tickers.length; i++) {
      if (cached[i]) {
        try {
          const raw = cached[i];
          result[tickers[i]] = typeof raw === 'string' ? JSON.parse(raw) : raw as unknown as Record<string, unknown>;
        } catch {
          uncached.push(tickers[i]);
        }
      } else {
        uncached.push(tickers[i]);
      }
    }
  } else {
    uncached.push(...tickers);
  }

  if (uncached.length === 0) return result;

  // Fetch from Yahoo via internal API (batched)
  try {
    const yahooFinance = (await import('yahoo-finance2')).default;
    const raw = await yahooFinance.quote(uncached);
    const quoteArray: Record<string, unknown>[] = Array.isArray(raw) ? raw : [raw];

    for (const q of quoteArray) {
      if (!q || !q.symbol) continue;
      const data = {
        name: (q.longName as string) || (q.shortName as string) || undefined,
        price: (q.regularMarketPrice as number) ?? undefined,
        dayChangePercent: (q.regularMarketChangePercent as number) ?? undefined,
        marketCap: (q.marketCap as number) ?? undefined,
      };
      result[q.symbol as string] = data;

      // Cache in Redis
      if (redis) {
        await redis.set(`collection:quote:${q.symbol as string}`, JSON.stringify(data), { ex: CACHE_TTL });
      }
    }
  } catch (err) {
    console.error('Failed to fetch quotes for collections:', err);
  }

  return result;
}

/**
 * Get all collections with live prices, optionally filtered by category.
 */
export async function getCollectionsWithPrices(
  categoryId?: string
): Promise<CollectionWithPrices[]> {
  const filtered = categoryId ? getCollectionsByCategory(categoryId) : collections;

  // Gather all unique tickers
  const allTickers = new Set<string>();
  filtered.forEach((c) => c.stocks.forEach((s) => allTickers.add(s.ticker)));

  const quotes = await fetchQuotes(Array.from(allTickers));

  return filtered.map((c) => {
    const category = getCategoryById(c.categoryId)!;
    return {
      ...c,
      category,
      stocks: c.stocks.map((s) => ({
        ...s,
        ...(quotes[s.ticker] || {}),
      })),
    };
  });
}

/**
 * Get a single collection with live prices.
 */
export async function getCollectionWithPrices(
  id: string
): Promise<CollectionWithPrices | null> {
  const collection = getCollectionById(id);
  if (!collection) return null;

  const tickers = collection.stocks.map((s) => s.ticker);
  const quotes = await fetchQuotes(tickers);
  const category = getCategoryById(collection.categoryId)!;

  return {
    ...collection,
    category,
    stocks: collection.stocks.map((s) => ({
      ...s,
      ...(quotes[s.ticker] || {}),
    })),
  };
}

/**
 * Search collections by name, description, tags, or stock tickers.
 */
export function searchCollections(query: string): Collection[] {
  const q = query.toLowerCase().trim();
  if (!q) return collections;

  return collections.filter((c) => {
    if (c.name.toLowerCase().includes(q)) return true;
    if (c.description.toLowerCase().includes(q)) return true;
    if (c.tags.some((t) => t.toLowerCase().includes(q))) return true;
    if (c.stocks.some((s) => s.ticker.toLowerCase() === q)) return true;
    return false;
  });
}

