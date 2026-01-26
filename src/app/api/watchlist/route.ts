import { NextResponse } from 'next/server';
import { getVisitorIdFromRequest } from '@/lib/visitor';
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from '@/lib/watchlist-service';

export async function GET(request: Request) {
  const visitorId = getVisitorIdFromRequest(request);
  if (!visitorId) {
    return NextResponse.json({ watchlist: [] });
  }

  const watchlist = await getWatchlist(visitorId);
  return NextResponse.json({ watchlist });
}

export async function POST(request: Request) {
  const visitorId = getVisitorIdFromRequest(request);
  if (!visitorId) {
    return NextResponse.json({ error: 'Visitor ID required' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { ticker, note } = body;

    if (!ticker || typeof ticker !== 'string') {
      return NextResponse.json({ error: 'Ticker is required' }, { status: 400 });
    }

    const watchlist = await addToWatchlist(visitorId, ticker, note);
    return NextResponse.json({ watchlist });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const visitorId = getVisitorIdFromRequest(request);
  if (!visitorId) {
    return NextResponse.json({ error: 'Visitor ID required' }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker');

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker query parameter required' }, { status: 400 });
  }

  const watchlist = await removeFromWatchlist(visitorId, ticker);
  return NextResponse.json({ watchlist });
}
