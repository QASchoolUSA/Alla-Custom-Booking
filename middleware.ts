import { NextResponse } from 'next/server';
import type { NextRequest, NextFetchEvent } from 'next/server';
import { clerkMiddleware } from '@clerk/nextjs/server';

const clerkMw = clerkMiddleware() as (req: NextRequest, ev?: NextFetchEvent) => ReturnType<typeof clerkMiddleware>;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Redirect root to /en
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/en', request.url));
  }
  // Redirect non-locale, non-admin paths to /en/...
  const localePattern = /^\/(en|ru|ua)(\/|$)/;
  if (!localePattern.test(pathname) && !pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL(`/en${pathname}`, request.url));
  }
  // Protect /admin with Clerk
  if (pathname.startsWith('/admin')) {
    return clerkMw(request);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/|api/|static/|favicon.ico|[\\w-]+\\.\\w+$).*)',
  ],
};