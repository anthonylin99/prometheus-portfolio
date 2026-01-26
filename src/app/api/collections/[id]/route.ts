import { NextResponse } from 'next/server';
import { getCollectionWithPrices } from '@/lib/collection-service';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const collection = await getCollectionWithPrices(id);
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }
    return NextResponse.json({ collection });
  } catch (err) {
    console.error(`Collection ${id} error:`, err);
    return NextResponse.json({ error: 'Failed to fetch collection' }, { status: 500 });
  }
}
