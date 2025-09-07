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
    
    // Check for NextAuth v5 session tokens (multiple possible cookie names)
    const possibleSessionCookies = [
      'authjs.session-token',           // NextAuth v5 standard
      'next-auth.session-token',        // NextAuth v4 fallback
      '__Secure-next-auth.session-token', // Secure version
      '__Secure-authjs.session-token',  // NextAuth v5 secure
      'next-auth.csrf-token',           // CSRF token indicates active session
      'authjs.csrf-token'               // NextAuth v5 CSRF
    ];
    
    let sessionFound = false;
    for (const cookieName of possibleSessionCookies) {
      const cookie = request.cookies.get(cookieName);
      if (cookie && cookie.value) {
        console.log(`✅ [MIDDLEWARE] Session token found (${cookieName}), allowing admin access`);
        sessionFound = true;
        break;
      }
    }
    
    if (sessionFound) {
      return NextResponse.next();
    }
    
    // Debug: Log all cookies for troubleshooting
    console.log('🔍 [MIDDLEWARE] Available cookies:', 
      Array.from(request.cookies.getAll()).map(c => `${c.name}=${c.value.substring(0, 20)}...`)
    );
    
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