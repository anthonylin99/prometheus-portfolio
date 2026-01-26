import { NextResponse } from 'next/server';
import { getVisitorIdFromRequest } from '@/lib/visitor';
import { getOptionalRedis } from '@/lib/redis';
import { v4 as uuidv4 } from 'uuid';

export interface CollectionSubmission {
  id: string;
  visitorId: string;
  name: string;
  description: string;
  tickers: string[];
  categoryId: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export async function POST(request: Request) {
  const visitorId = getVisitorIdFromRequest(request);
  if (!visitorId) {
    return NextResponse.json({ error: 'Visitor ID required' }, { status: 400 });
  }

  const redis = getOptionalRedis();
  if (!redis) {
    return NextResponse.json({ error: 'Submissions require Redis' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { name, description, tickers, categoryId } = body;

    if (!name || !description || !tickers || !Array.isArray(tickers) || tickers.length < 3) {
      return NextResponse.json(
        { error: 'Name, description, and at least 3 tickers required' },
        { status: 400 }
      );
    }

    if (tickers.length > 15) {
      return NextResponse.json(
        { error: 'Maximum 15 tickers per collection' },
        { status: 400 }
      );
    }

    const submission: CollectionSubmission = {
      id: uuidv4(),
      visitorId,
      name: name.slice(0, 100),
      description: description.slice(0, 500),
      tickers: tickers.map((t: string) => t.toUpperCase().trim()).slice(0, 15),
      categoryId: categoryId || 'thematic-frontiers',
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };

    // Store submission
    await redis.set(`collection:submission:${submission.id}`, submission);

    // Add to submissions list
    await redis.zadd('collection:submissions', {
      score: Date.now(),
      member: submission.id,
    });

    return NextResponse.json({ submission: { id: submission.id, status: 'pending' } });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function GET() {
  const redis = getOptionalRedis();
  if (!redis) {
    return NextResponse.json({ submissions: [] });
  }

  // Get recent pending submissions (public endpoint for display)
  const ids = await redis.zrange('collection:submissions', -20, -1, { rev: true });
  if (!ids || ids.length === 0) {
    return NextResponse.json({ submissions: [] });
  }

  const submissions: CollectionSubmission[] = [];
  for (const id of ids) {
    const sub = await redis.get<CollectionSubmission>(`collection:submission:${id}`);
    if (sub && sub.status === 'pending') {
      submissions.push(sub);
    }
  }

  return NextResponse.json({ submissions });
}
