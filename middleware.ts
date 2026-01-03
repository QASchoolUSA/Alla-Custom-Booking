import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['ru', 'ua'],
  defaultLocale: 'ru',
  localePrefix: 'always'
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};