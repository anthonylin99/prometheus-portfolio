import { NextResponse } from 'next/server';
import { getCollectionsForTicker } from '@/lib/collection-service';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const collections = getCollectionsForTicker(ticker);

  return NextResponse.json({
    ticker: ticker.toUpperCase(),
    collections,
    count: collections.length,
  });
}
