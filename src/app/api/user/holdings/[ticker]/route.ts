import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  updateUserHolding,
  removeUserHolding,
} from '@/lib/user-portfolio-service';
import { getAppUser } from '@/lib/user-service';
import { logActivity } from '@/lib/circle-service';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { ticker } = await params;
    const body = await request.json();
    await updateUserHolding(session.user.id, ticker.toUpperCase(), body);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { ticker } = await params;
    await removeUserHolding(session.user.id, ticker.toUpperCase());

    // Log activity if user is in a circle
    const user = await getAppUser(session.user.id);
    if (user?.circleId) {
      await logActivity(user.circleId, {
        userId: session.user.id,
        userName: user.name || user.email,
        etfTicker: user.etfTicker,
        type: 'HOLDING_REMOVED',
        payload: { ticker: ticker.toUpperCase() },
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
