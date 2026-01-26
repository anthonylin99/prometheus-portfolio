import { NextResponse } from 'next/server';
import {
  getCollectionsWithPrices,
  getCategoryById,
} from '@/lib/collection-service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  const { category } = await params;
  const { searchParams } = new URL(request.url);
  const withPrices = searchParams.get('prices') === 'true';

  const cat = getCategoryById(category);
  if (!cat) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  try {
    if (withPrices) {
      const enriched = await getCollectionsWithPrices(category);
      return NextResponse.json({ category: cat, collections: enriched });
    }

    const { getCollectionsByCategory } = await import('@/data/collections-seed');
    const collections = getCollectionsByCategory(category);
    return NextResponse.json({ category: cat, collections });
  } catch (err) {
    console.error(`Category ${category} error:`, err);
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 });
  }
}
