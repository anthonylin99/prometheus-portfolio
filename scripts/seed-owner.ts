/**
 * Migration script: Associate existing $ALIN portfolio with an owner account.
 *
 * Usage:
 *   1. Sign up via the login page to create your Auth.js user record.
 *   2. Find your Auth.js user ID in Redis (key: auth:user:*).
 *   3. Run: OWNER_ID=<your-auth-user-id> OWNER_EMAIL=<your-email> npx tsx scripts/seed-owner.ts
 *
 * This script is idempotent — safe to run multiple times.
 */

import { Redis } from '@upstash/redis';
import { v4 as uuidv4 } from 'uuid';
import portfolioData from '../src/data/portfolio.json';

const OWNER_ID = process.env.OWNER_ID;
const OWNER_EMAIL = process.env.OWNER_EMAIL || 'anthony@example.com';

if (!OWNER_ID) {
  console.error('Error: OWNER_ID environment variable is required.');
  console.error('Run: OWNER_ID=<your-user-id> OWNER_EMAIL=<your-email> npx tsx scripts/seed-owner.ts');
  process.exit(1);
}

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  console.error('Error: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set.');
  process.exit(1);
}

const redis = new Redis({ url, token });

async function seed() {
  console.log(`Seeding owner account: ${OWNER_ID} (${OWNER_EMAIL})\n`);

  // 1. Check if app user already exists
  const existing = await redis.get(`app:user:${OWNER_ID}`);
  if (existing) {
    console.log('  App user already exists, updating...');
  }

  // 2. Create/update app user
  const appUser = {
    id: OWNER_ID,
    email: OWNER_EMAIL,
    name: 'Anthony',
    etfTicker: 'ALIN',
    etfName: 'Prometheus ETF',
    avatarColor: '#8b5cf6',
    circleId: null as string | null,
    createdAt: new Date().toISOString(),
    onboarded: true,
  };

  await redis.set(`app:user:${OWNER_ID}`, appUser);
  await redis.set(`app:user:email:${OWNER_EMAIL}`, OWNER_ID);
  await redis.set(`app:user:ticker:ALIN`, OWNER_ID);
  console.log('  Created app user: $ALIN (Prometheus ETF)');

  // 3. Migrate portfolio.json to user portfolio
  const holdings = portfolioData.holdings.map((h) => ({
    ticker: h.ticker,
    name: h.name,
    shares: h.shares,
    category: h.category,
    description: h.description,
    exchange: (h as Record<string, unknown>).exchange as string | undefined,
    addedAt: '2026-01-24T00:00:00Z',
  }));

  const portfolio = {
    holdings,
    updatedAt: new Date().toISOString(),
  };

  await redis.set(`app:portfolio:${OWNER_ID}`, portfolio);
  console.log(`  Migrated ${holdings.length} holdings to user portfolio`);

  // 4. Create default circle ("Anthony's Investing Group")
  const circleId = uuidv4();
  const inviteCode = require('crypto').randomBytes(4).toString('hex').toUpperCase();

  const circle = {
    id: circleId,
    name: "Anthony's Investing Group",
    ownerId: OWNER_ID,
    inviteCode,
    createdAt: new Date().toISOString(),
    members: [OWNER_ID],
  };

  await redis.set(`app:circle:${circleId}`, circle);
  await redis.set(`app:circle:invite:${inviteCode}`, circleId);

  // 5. Store default circle ID for discovery
  await redis.set('app:default-circle-id', circleId);

  // Update user with circle ID
  appUser.circleId = circleId;
  await redis.set(`app:user:${OWNER_ID}`, appUser);

  console.log(`  Created default circle: "${circle.name}" (invite code: ${inviteCode})`);
  console.log(`  Set app:default-circle-id = ${circleId}`);

  console.log('\nDone! Share invite code with friends:', inviteCode);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
