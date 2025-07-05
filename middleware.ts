import createMiddleware from 'next-intl/middleware';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const intlMiddleware = createMiddleware({
  locales: ['ru', 'ua'],
  defaultLocale: 'ru',
  localePrefix: 'always'
});

const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
  '/ru/admin(.*)',
  '/ua/admin(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
  
  return intlMiddleware(req);
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};