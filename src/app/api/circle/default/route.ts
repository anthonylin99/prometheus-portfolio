import { NextResponse } from 'next/server';
import { getOptionalRedis } from '@/lib/redis';

export async function GET() {
  try {
    const redis = getOptionalRedis();
    if (!redis) {
      return NextResponse.json({ circle: null });
    }

    const defaultCircleId = await redis.get<string>('app:default-circle-id');
    if (!defaultCircleId) {
      return NextResponse.json({ circle: null });
    }

    const circle = await redis.get<{
      id: string;
      name: string;
      inviteCode: string;
      members: string[];
    }>(`app:circle:${defaultCircleId}`);

    if (!circle) {
      return NextResponse.json({ circle: null });
    }

    return NextResponse.json({
      circle: {
        id: circle.id,
        name: circle.name,
        memberCount: circle.members.length,
        inviteCode: circle.inviteCode,
      },
    });
  } catch (e) {
    console.error('Default circle API error:', e);
    return NextResponse.json({ circle: null });
  }
}
