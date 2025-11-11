/**
 * Edge-compatible middleware for NextAuth
 *
 * CRITICAL: This file runs in Edge Runtime
 * - Uses edge-compatible auth from lib/auth-edge.ts
 * - NO Prisma imports (causes bundle size bloat)
 * - NO bcryptjs imports (Node.js only)
 * - NO database lookups (edge runtime limitation)
 */
import { authEdge } from '@/lib/auth-edge';
import { NextResponse } from 'next/server';

export default authEdge((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Protected routes
  const isAccountPage = nextUrl.pathname.startsWith('/account');

  // Redirect to signin if accessing protected routes while not logged in
  if (isAccountPage && !isLoggedIn) {
    const signInUrl = new URL('/auth/signin', nextUrl.origin);
    signInUrl.searchParams.set('callbackUrl', nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect logged-in users away from auth pages (unless coming from admin callback)
  const isAuthPage = nextUrl.pathname.startsWith('/auth/signin');
  const callbackUrl = nextUrl.searchParams.get('callbackUrl');
  if (isAuthPage && isLoggedIn) {
    // If callback URL is admin, redirect there instead of /account
    if (callbackUrl?.startsWith('/admin')) {
      return NextResponse.redirect(new URL(callbackUrl, nextUrl.origin));
    }
    return NextResponse.redirect(new URL('/account', nextUrl.origin));
  }

  // Create response with performance and security headers
  const response = NextResponse.next();

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
  matcher: ['/account/:path*', '/auth/:path*'],
};
