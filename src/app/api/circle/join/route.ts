import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { joinCircle } from '@/lib/circle-service';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { inviteCode } = body;

    if (!inviteCode || typeof inviteCode !== 'string') {
      return NextResponse.json(
        { error: 'Invite code is required' },
        { status: 400 }
      );
    }

    const circle = await joinCircle(session.user.id, inviteCode.trim().toUpperCase());
    return NextResponse.json({ circle });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
