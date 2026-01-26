import NextAuth from 'next-auth';
import Resend from 'next-auth/providers/resend';
import { UpstashRedisAdapter } from '@auth/upstash-redis-adapter';
import { getRequiredRedis } from './redis';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: UpstashRedisAdapter(getRequiredRedis(), {
    baseKeyPrefix: 'auth:',
  }),
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY || 'fake-key-for-dev',
      from: process.env.AUTH_RESEND_FROM || 'noreply@localhost',
      ...(process.env.RESEND_API_KEY
        ? {}
        : {
            sendVerificationRequest: async ({ identifier, url }) => {
              console.log('\n========================================');
              console.log('  DEV MODE — Magic Link');
              console.log(`  Email: ${identifier}`);
              console.log(`  URL:   ${url}`);
              console.log('========================================\n');
              // Store for auto-redirect via /api/auth/dev-callback
              (globalThis as Record<string, unknown>).__devMagicLinkUrl = url;
            },
          }),
    }),
  ],
  pages: {
    signIn: '/login',
    newUser: '/onboarding',
  },
  callbacks: {
    session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  session: {
    strategy: 'database',
  },
});
