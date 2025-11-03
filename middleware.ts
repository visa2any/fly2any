import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
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

  // Redirect logged-in users away from auth pages
  const isAuthPage = nextUrl.pathname.startsWith('/auth/signin');
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/account', nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/account/:path*', '/auth/:path*'],
};
