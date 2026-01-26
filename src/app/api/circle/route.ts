import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createCircle, getCircle } from '@/lib/circle-service';
import { getAppUser } from '@/lib/user-service';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getAppUser(session.user.id);
  if (!user?.circleId) {
    return NextResponse.json({ circle: null });
  }

  const circle = await getCircle(user.circleId);
  return NextResponse.json({ circle });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Circle name is required' },
        { status: 400 }
      );
    }

    const circle = await createCircle(name.trim(), session.user.id);
    return NextResponse.json({ circle });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
