import { getRequiredRedis } from './redis';
import { v4 as uuidv4 } from 'uuid';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  etfTicker: string;
  etfName: string;
  avatarColor: string;
  circleId: string | null;
  createdAt: string;
  onboarded: boolean;
}

const AVATAR_COLORS = [
  '#8b5cf6', '#6366f1', '#22d3ee', '#34d399',
  '#f472b6', '#fbbf24', '#f97316', '#60a5fa',
];

function randomAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

export async function getAppUser(userId: string): Promise<AppUser | null> {
  const redis = getRequiredRedis();
  const data = await redis.get<AppUser>(`app:user:${userId}`);
  return data || null;
}

export async function createAppUser(
  data: Partial<AppUser> & { id: string; email: string }
): Promise<AppUser> {
  const redis = getRequiredRedis();

  const user: AppUser = {
    id: data.id,
    email: data.email,
    name: data.name || '',
    etfTicker: data.etfTicker || '',
    etfName: data.etfName || '',
    avatarColor: data.avatarColor || randomAvatarColor(),
    circleId: data.circleId ?? null,
    createdAt: data.createdAt || new Date().toISOString(),
    onboarded: data.onboarded ?? false,
  };

  await redis.set(`app:user:${user.id}`, user);
  await redis.set(`app:user:email:${user.email}`, user.id);
  if (user.etfTicker) {
    await redis.set(`app:user:ticker:${user.etfTicker}`, user.id);
  }

  return user;
}

export async function updateAppUser(
  userId: string,
  updates: Partial<AppUser>
): Promise<AppUser> {
  const redis = getRequiredRedis();
  const existing = await getAppUser(userId);
  if (!existing) {
    throw new Error(`User ${userId} not found`);
  }

  // If ticker is changing, remove old ticker index and set new one
  if (updates.etfTicker && updates.etfTicker !== existing.etfTicker) {
    if (existing.etfTicker) {
      await redis.del(`app:user:ticker:${existing.etfTicker}`);
    }
    await redis.set(`app:user:ticker:${updates.etfTicker}`, userId);
  }

  const updated: AppUser = { ...existing, ...updates };
  await redis.set(`app:user:${userId}`, updated);
  return updated;
}

export async function getAppUserByEmail(email: string): Promise<AppUser | null> {
  const redis = getRequiredRedis();
  const userId = await redis.get<string>(`app:user:email:${email}`);
  if (!userId) return null;
  return getAppUser(userId);
}

export async function getAppUserByTicker(ticker: string): Promise<AppUser | null> {
  const redis = getRequiredRedis();
  const userId = await redis.get<string>(`app:user:ticker:${ticker}`);
  if (!userId) return null;
  return getAppUser(userId);
}

export async function isTickerAvailable(ticker: string): Promise<boolean> {
  const redis = getRequiredRedis();
  const existing = await redis.get(`app:user:ticker:${ticker}`);
  return !existing;
}

export function generateUserId(): string {
  return uuidv4();
}
