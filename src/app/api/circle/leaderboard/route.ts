import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAppUser } from '@/lib/user-service';
import { calculateLeaderboard } from '@/lib/leaderboard-service';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getAppUser(session.user.id);
  if (!user?.circleId) {
    return NextResponse.json({ rankings: [] });
  }

  const { searchParams } = new URL(request.url);
  const range = (searchParams.get('range') || 'YTD') as '1W' | '1M' | 'YTD';

  try {
    const rankings = await calculateLeaderboard(user.circleId, range);
    return NextResponse.json({ rankings });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
