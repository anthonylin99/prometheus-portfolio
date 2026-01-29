import { NextResponse } from 'next/server';
import { getVirtualPortfolioAnalytics } from '@/lib/virtual-portfolio-service';
import { collections, collectionCategories } from '@/data/collections-seed';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  const { category: categoryId } = await params;

  // Find the category
  const category = collectionCategories.find((c) => c.id === categoryId);
  if (!category) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  // Get all collections in this category
  const categoryCollections = collections.filter(
    (c) => c.categoryId === categoryId
  );

  // Get all unique tickers from collections in this category
  const tickerSet = new Set<string>();
  for (const collection of categoryCollections) {
    for (const stock of collection.stocks) {
      tickerSet.add(stock.ticker);
    }
  }
  const tickers = Array.from(tickerSet);

  try {
    const analytics = await getVirtualPortfolioAnalytics(tickers, category.name);

    return NextResponse.json({
      category: {
        id: category.id,
        name: category.name,
        description: category.description,
        color: category.color,
      },
      collectionsCount: categoryCollections.length,
      analytics,
    });
  } catch (error) {
    console.error('Category analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate analytics' },
      { status: 500 }
    );
  }
}
