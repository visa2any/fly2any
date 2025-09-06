import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Simple middleware without NextAuth dependency to avoid Edge Runtime issues
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
    
    // For other admin routes, redirect to login - let the page handle auth check
    console.log('🔄 [MIDDLEWARE] Redirecting to login for admin route');
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