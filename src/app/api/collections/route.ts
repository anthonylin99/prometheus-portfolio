import { NextResponse } from 'next/server';
import {
  getCollectionsWithPrices,
  searchCollections,
  collectionCategories,
} from '@/lib/collection-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();
  const withPrices = searchParams.get('prices') === 'true';

  try {
    if (query) {
      // Text search — returns static data (no prices) for speed
      const results = searchCollections(query);
      return NextResponse.json({ collections: results, categories: collectionCategories });
    }

    if (withPrices) {
      const enriched = await getCollectionsWithPrices();
      return NextResponse.json({ collections: enriched, categories: collectionCategories });
    }

    // Default: static data without live prices (fast)
    const { collections } = await import('@/data/collections-seed');
    return NextResponse.json({ collections, categories: collectionCategories });
  } catch (err) {
    console.error('Collections API error:', err);
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
  }
}
