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
  const isAdmin = req.auth?.user?.role === 'admin';

  // Protected routes
  const isAccountPage = nextUrl.pathname.startsWith('/account');
  const isAdminPage = nextUrl.pathname.startsWith('/admin');
  const isAuthPage = nextUrl.pathname.startsWith('/auth/signin');

  // CRITICAL: Protect admin routes - require login AND admin role
  if (isAdminPage) {
    if (!isLoggedIn) {
      // Not logged in - redirect to signin
      const signInUrl = new URL('/auth/signin', nextUrl.origin);
      signInUrl.searchParams.set('callbackUrl', nextUrl.pathname);
      signInUrl.searchParams.set('error', 'AdminAccessRequired');
      return NextResponse.redirect(signInUrl);
    }
    if (!isAdmin) {
      // Logged in but not admin - show access denied
      const deniedUrl = new URL('/auth/access-denied', nextUrl.origin);
      deniedUrl.searchParams.set('message', 'Admin access required');
      return NextResponse.redirect(deniedUrl);
    }
    // Admin user - allow access
    return NextResponse.next();
  }

  // Protect account pages - require login
  if (isAccountPage && !isLoggedIn) {
    const signInUrl = new URL('/auth/signin', nextUrl.origin);
    signInUrl.searchParams.set('callbackUrl', nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect logged-in users away from auth pages
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/account', nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/account/:path*', '/auth/:path*', '/admin/:path*'],
};
