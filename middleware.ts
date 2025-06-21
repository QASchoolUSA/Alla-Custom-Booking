import createMiddleware from 'next-intl/middleware';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const intlMiddleware = createMiddleware({
  locales: ['ru', 'ua'],
  defaultLocale: 'ru',
  localePrefix: 'as-needed'
});

const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const session = await auth();
    if (!session.userId) {
      throw new Error('Unauthorized');
    }
  }
  
  return intlMiddleware(req);
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};