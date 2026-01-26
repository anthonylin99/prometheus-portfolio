import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAppUser } from '@/lib/user-service';
import { getActivityFeed } from '@/lib/circle-service';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getAppUser(session.user.id);
  if (!user?.circleId) {
    return NextResponse.json({ events: [] });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get('limit') || 50), 100);

  try {
    const events = await getActivityFeed(user.circleId, limit);
    return NextResponse.json({ events });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
