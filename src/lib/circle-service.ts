import { getRequiredRedis } from './redis';
import { getAppUser, updateAppUser, type AppUser } from './user-service';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export interface Circle {
  id: string;
  name: string;
  ownerId: string;
  inviteCode: string;
  createdAt: string;
  members: string[];
}

export interface ActivityEvent {
  id: string;
  userId: string;
  userName: string;
  etfTicker: string;
  type:
    | 'HOLDING_ADDED'
    | 'HOLDING_REMOVED'
    | 'MEMBER_JOINED'
    | 'PORTFOLIO_CREATED';
  payload: Record<string, unknown>;
  timestamp: string;
}

function generateInviteCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

export async function createCircle(
  name: string,
  ownerId: string
): Promise<Circle> {
  const redis = getRequiredRedis();
  const circle: Circle = {
    id: uuidv4(),
    name,
    ownerId,
    inviteCode: generateInviteCode(),
    createdAt: new Date().toISOString(),
    members: [ownerId],
  };

  await redis.set(`app:circle:${circle.id}`, circle);
  await redis.set(`app:circle:invite:${circle.inviteCode}`, circle.id);
  await updateAppUser(ownerId, { circleId: circle.id });

  return circle;
}

export async function getCircle(circleId: string): Promise<Circle | null> {
  const redis = getRequiredRedis();
  const data = await redis.get<Circle>(`app:circle:${circleId}`);
  return data || null;
}

export async function getCircleByInviteCode(
  code: string
): Promise<Circle | null> {
  const redis = getRequiredRedis();
  const circleId = await redis.get<string>(`app:circle:invite:${code}`);
  if (!circleId) return null;
  return getCircle(circleId);
}

export async function getCircleByUserId(
  userId: string
): Promise<Circle | null> {
  const user = await getAppUser(userId);
  if (!user?.circleId) return null;
  return getCircle(user.circleId);
}

export async function joinCircle(
  userId: string,
  inviteCode: string
): Promise<Circle> {
  const circle = await getCircleByInviteCode(inviteCode);
  if (!circle) {
    throw new Error('Invalid invite code');
  }

  if (circle.members.includes(userId)) {
    return circle; // Already a member
  }

  circle.members.push(userId);
  const redis = getRequiredRedis();
  await redis.set(`app:circle:${circle.id}`, circle);
  await updateAppUser(userId, { circleId: circle.id });

  // Log activity
  const user = await getAppUser(userId);
  if (user) {
    await logActivity(circle.id, {
      userId,
      userName: user.name || user.email,
      etfTicker: user.etfTicker,
      type: 'MEMBER_JOINED',
      payload: {},
      timestamp: new Date().toISOString(),
    });
  }

  return circle;
}

export async function getCircleMembers(circleId: string): Promise<AppUser[]> {
  const circle = await getCircle(circleId);
  if (!circle) return [];

  const members = await Promise.all(
    circle.members.map((id) => getAppUser(id))
  );
  return members.filter((m): m is AppUser => m !== null);
}

export async function logActivity(
  circleId: string,
  event: Omit<ActivityEvent, 'id'>
): Promise<void> {
  const redis = getRequiredRedis();
  const activity: ActivityEvent = {
    id: uuidv4(),
    ...event,
  };

  // Use a sorted set with timestamp as score for chronological ordering
  await redis.zadd(`app:activity:${circleId}`, {
    score: Date.now(),
    member: JSON.stringify(activity),
  });

  // Trim to last 500 events
  const count = await redis.zcard(`app:activity:${circleId}`);
  if (count > 500) {
    await redis.zremrangebyrank(`app:activity:${circleId}`, 0, count - 501);
  }
}

export async function getActivityFeed(
  circleId: string,
  limit = 50
): Promise<ActivityEvent[]> {
  const redis = getRequiredRedis();
  // Get most recent events (highest scores = most recent)
  const raw = await redis.zrange(`app:activity:${circleId}`, -limit, -1, {
    rev: true,
  });

  if (!raw || raw.length === 0) return [];

  return raw.map((item) => {
    if (typeof item === 'string') {
      return JSON.parse(item) as ActivityEvent;
    }
    return item as unknown as ActivityEvent;
  });
}
