export { auth as middleware } from '@/lib/auth';

export const config = {
  matcher: ['/dashboard/:path*', '/circle/:path*', '/onboarding/:path*', '/admin/:path*'],
};
