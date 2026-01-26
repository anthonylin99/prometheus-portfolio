import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAppUser } from '@/lib/user-service';
import { getCircleMembers } from '@/lib/circle-service';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getAppUser(session.user.id);
  if (!user?.circleId) {
    return NextResponse.json({ members: [] });
  }

  const members = await getCircleMembers(user.circleId);
  const result = members.map((m) => ({
    userId: m.id,
    name: m.name,
    etfTicker: m.etfTicker,
    etfName: m.etfName,
    avatarColor: m.avatarColor,
    isCurrentUser: m.id === session.user!.id,
  }));

  return NextResponse.json({ members: result });
}
