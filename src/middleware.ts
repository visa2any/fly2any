import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  
  console.log('🔒 [MIDDLEWARE] Route check:', {
    path: nextUrl.pathname,
    isLoggedIn,
    userRole: req.auth?.user?.role,
    timestamp: new Date().toISOString()
  });
  
  // Protect ALL admin routes (pages and API)
  if (nextUrl.pathname.startsWith('/admin')) {
    // Allow access to login page
    if (nextUrl.pathname === '/admin/login') {
      console.log('✅ [MIDDLEWARE] Login page access allowed');
      return NextResponse.next();
    }
    
    // Block access to other admin pages if not logged in
    if (!isLoggedIn) {
      console.log('❌ [MIDDLEWARE] Blocking unauthorized admin access - redirecting to login');
      const loginUrl = new URL('/admin/login', nextUrl.origin);
      loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    console.log('✅ [MIDDLEWARE] Admin access authorized for:', req.auth?.user?.email);
    return NextResponse.next();
  }
  
  // Protect admin API routes
  if (nextUrl.pathname.startsWith('/api/admin') && !isLoggedIn) {
    console.log('❌ [MIDDLEWARE] Blocking unauthorized API admin access');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  return NextResponse.next();
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)",
  ],
}