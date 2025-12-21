/**
 * Edge-compatible middleware for NextAuth & i18n
 *
 * CRITICAL: This file runs in Edge Runtime
 * - Uses edge-compatible auth from lib/auth-edge.ts
 * - Handles language cookie management
 * - NO Prisma imports (causes bundle size bloat)
 * - NO bcryptjs imports (Node.js only)
 * - NO database lookups (edge runtime limitation)
 */
import { authEdge } from '@/lib/auth-edge';
import { NextResponse } from 'next/server';

// Supported languages
const locales = ['en', 'pt', 'es'] as const;
type Locale = (typeof locales)[number];
const defaultLocale: Locale = 'en';

/**
 * Detect browser language from Accept-Language header
 */
function detectBrowserLanguage(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;
  const languages = acceptLanguage
    .split(',')
    .map(lang => lang.split(';')[0].trim().split('-')[0].toLowerCase());
  for (const lang of languages) {
    if (locales.includes(lang as Locale)) {
      return lang as Locale;
    }
  }
  return defaultLocale;
}

export default authEdge((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // CANONICAL DOMAIN REDIRECT: non-www → www (SEO fix)
  const host = req.headers.get('host') || '';
  if (host === 'fly2any.com') {
    const redirectUrl = new URL(nextUrl.pathname + nextUrl.search, 'https://www.fly2any.com');
    return NextResponse.redirect(redirectUrl, 301);
  }

  // Protected routes
  const isAccountPage = nextUrl.pathname.startsWith('/account');

  // Redirect to signin if accessing protected routes while not logged in
  if (isAccountPage && !isLoggedIn) {
    const signInUrl = new URL('/auth/signin', nextUrl.origin);
    signInUrl.searchParams.set('callbackUrl', nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect logged-in users away from auth pages
  const isAuthPage = nextUrl.pathname.startsWith('/auth/signin');
  const callbackUrl = nextUrl.searchParams.get('callbackUrl');
  if (isAuthPage && isLoggedIn && !callbackUrl) {
    // Only redirect if there's NO callbackUrl - let NextAuth handle callbackUrl redirects
    return NextResponse.redirect(new URL('/account', nextUrl.origin));
  }

  // Create response with performance and security headers
  const response = NextResponse.next();

  // LANGUAGE COOKIE MANAGEMENT - DISABLED: Always use English
  // Auto-detection disabled per user request - will be re-enabled later
  const languageCookie = req.cookies.get('fly2any_language');

  // Always force English regardless of browser settings
  if (!languageCookie || languageCookie.value !== 'en') {
    response.cookies.set('fly2any_language', 'en', {
      path: '/',
      maxAge: 31536000, // 1 year in seconds
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }

  // Performance headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

  // Enable aggressive caching for static assets
  if (nextUrl.pathname.startsWith('/_next/static/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  // Cache API responses briefly
  if (nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
  }

  return response;
});

export const config = {
  matcher: ['/account/:path*', '/auth/:path*', '/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
