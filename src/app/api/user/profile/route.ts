import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAppUser, updateAppUser, createAppUser } from '@/lib/user-service';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getAppUser(session.user.id);
  if (!user) {
    return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, etfTicker, etfName, avatarColor, onboarded } = body;

    // Check if user exists; create if not (first call during onboarding)
    const existing = await getAppUser(session.user.id);
    if (!existing) {
      const created = await createAppUser({
        id: session.user.id,
        email: session.user.email,
        name: name || '',
        etfTicker: etfTicker || '',
        etfName: etfName || '',
        avatarColor: avatarColor || '#8b5cf6',
        onboarded: onboarded ?? false,
      });
      return NextResponse.json(created);
    }

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (etfTicker !== undefined) updates.etfTicker = etfTicker;
    if (etfName !== undefined) updates.etfName = etfName;
    if (avatarColor !== undefined) updates.avatarColor = avatarColor;
    if (onboarded !== undefined) updates.onboarded = onboarded;

    const updated = await updateAppUser(session.user.id, updates);
    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
