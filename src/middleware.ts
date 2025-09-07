import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Improved middleware that allows authenticated users to access admin pages
export function middleware(request: NextRequest) {
  const { nextUrl } = request;
  
  console.log('🔒 [MIDDLEWARE] Route check:', {
    path: nextUrl.pathname,
    timestamp: new Date().toISOString()
  });
  
  // Only handle admin routes  
  if (nextUrl.pathname.startsWith('/admin')) {
    // Always allow access to login page
    if (nextUrl.pathname === '/admin/login') {
      console.log('✅ [MIDDLEWARE] Login page access allowed');
      return NextResponse.next();
    }
    
    // Check for session token in cookies to determine if user is authenticated
    const sessionToken = request.cookies.get('next-auth.session-token') || 
                        request.cookies.get('__Secure-next-auth.session-token');
    
    if (sessionToken && sessionToken.value) {
      console.log('✅ [MIDDLEWARE] Session token found, allowing admin access');
      return NextResponse.next();
    }
    
    // No session found, redirect to login
    console.log('🔄 [MIDDLEWARE] No session found, redirecting to login');
    const loginUrl = new URL('/admin/login', nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // For admin API routes, let them handle their own auth
  if (nextUrl.pathname.startsWith('/api/admin')) {
    console.log('🔄 [MIDDLEWARE] Allowing API admin route (will check auth internally)');
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"]
}