import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Rate limiting storage (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMITS = {
  '/api/leads': { requests: 10, windowMs: 60 * 1000 }, // 10 requests per minute
  '/api/health': { requests: 30, windowMs: 60 * 1000 }, // 30 requests per minute
  '/api/admin': { requests: 60, windowMs: 60 * 1000 }, // 60 requests per minute
  'default': { requests: 100, windowMs: 60 * 1000 } // 100 requests per minute for other routes
};

// Security headers
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

function getClientIP(request: NextRequest): string {
  // Get client IP from various headers (reverse proxy support)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const clientIp = request.headers.get('cf-connecting-ip'); // Cloudflare
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  if (clientIp) {
    return clientIp;
  }
  
  // Fallback to unknown if no IP found
  return 'unknown';
}

function getRateLimitConfig(pathname: string) {
  // Find matching rate limit configuration
  for (const [path, config] of Object.entries(RATE_LIMITS)) {
    if (path !== 'default' && pathname.startsWith(path)) {
      return config;
    }
  }
  return RATE_LIMITS.default;
}

function checkRateLimit(clientIp: string, pathname: string): { allowed: boolean; remaining: number; resetTime: number } {
  const config = getRateLimitConfig(pathname);
  const key = `${clientIp}:${pathname}`;
  const now = Date.now();
  
  // Clean up expired entries
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
  
  const current = rateLimitStore.get(key);
  
  if (!current) {
    // First request
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs
    });
    return {
      allowed: true,
      remaining: config.requests - 1,
      resetTime: now + config.windowMs
    };
  }
  
  if (current.resetTime < now) {
    // Reset window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs
    });
    return {
      allowed: true,
      remaining: config.requests - 1,
      resetTime: now + config.windowMs
    };
  }
  
  if (current.count >= config.requests) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime
    };
  }
  
  // Increment counter
  current.count++;
  rateLimitStore.set(key, current);
  
  return {
    allowed: true,
    remaining: config.requests - current.count,
    resetTime: current.resetTime
  };
}

async function validateAPIRequest(request: NextRequest): Promise<{ isValid: boolean; error?: string }> {
  const pathname = request.nextUrl.pathname;
  
  // Validate Content-Type for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    const contentType = request.headers.get('content-type');
    
    if (pathname.startsWith('/api/leads') || pathname.startsWith('/api/admin')) {
      if (!contentType || !contentType.includes('application/json')) {
        return {
          isValid: false,
          error: 'Content-Type must be application/json'
        };
      }
    }
  }
  
  // Validate authentication for admin API routes
  if (pathname.startsWith('/api/admin')) {
    try {
      const token = await getToken({ 
        req: request,
        secret: process.env.NEXTAUTH_SECRET || 'fly2any-super-secret-key-2024'
      });
      
      if (!token || token.role !== 'admin') {
        return {
          isValid: false,
          error: 'Acesso não autorizado'
        };
      }
    } catch (error) {
      return {
        isValid: false,
        error: 'Erro de autenticação'
      };
    }
  }
  
  return { isValid: true };
}

function createRateLimitResponse(resetTime: number): NextResponse {
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
  
  return NextResponse.json(
    {
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please try again later.',
      retryAfter
    },
    {
      status: 429,
      headers: {
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Reset': new Date(resetTime).toISOString(),
        ...SECURITY_HEADERS
      }
    }
  );
}

function createValidationErrorResponse(error: string): NextResponse {
  return NextResponse.json(
    {
      error: 'Validation failed',
      message: error
    },
    {
      status: 400,
      headers: SECURITY_HEADERS
    }
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') // Skip files with extensions
  ) {
    return NextResponse.next();
  }
  
  // Apply security headers to all responses
  const response = NextResponse.next();
  
  // Add security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Check authentication for admin pages (but not login page or API auth routes)
  if (pathname.startsWith('/admin') && 
      pathname !== '/admin/login' && 
      !pathname.startsWith('/api/auth/')) {
    
    try {
      const token = await getToken({ 
        req: request,
        secret: process.env.NEXTAUTH_SECRET || 'fly2any-super-secret-key-2024',
        cookieName: process.env.NODE_ENV === 'production' 
          ? '__Secure-next-auth.session-token'
          : 'next-auth.session-token'
      });
      
      // More detailed debugging in production
      if (process.env.NODE_ENV === 'production') {
        console.log('🔒 [PROD-MIDDLEWARE] Auth check:', {
          pathname,
          hasToken: !!token,
          tokenExp: token?.exp,
          tokenRole: token?.role,
          currentTime: Math.floor(Date.now() / 1000),
          isExpired: token?.exp ? (token.exp as number) < Math.floor(Date.now() / 1000) : 'no-exp'
        });
      }
      
      if (!token || token.role !== 'admin') {
        if (process.env.NODE_ENV === 'production') {
          console.log('❌ [PROD-MIDDLEWARE] Auth failed - redirecting to login');
        }
        
        // Prevent redirect loops
        const loginUrl = new URL('/admin/login', request.url);
        if (pathname !== '/admin') {  // Only set callback if not root admin
          loginUrl.searchParams.set('callbackUrl', pathname);
        }
        return NextResponse.redirect(loginUrl);
      }
      
      if (process.env.NODE_ENV === 'production') {
        console.log('✅ [PROD-MIDDLEWARE] Auth successful');
      }
      
    } catch (error) {
      console.error('❌ [MIDDLEWARE] Auth error:', error);
      // Only redirect on auth errors, not token parsing errors
      if (error.message?.includes('JSON') === false) {
        const loginUrl = new URL('/admin/login', request.url);
        return NextResponse.redirect(loginUrl);
      }
    }
  }
  
  // Only apply rate limiting and validation to API routes
  if (pathname.startsWith('/api/')) {
    const clientIp = getClientIP(request);
    
    // Rate limiting
    const rateLimit = checkRateLimit(clientIp, pathname);
    
    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit.resetTime);
    }
    
    // Add rate limit headers to response
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(rateLimit.resetTime).toISOString());
    
    // Request validation
    const validation = await validateAPIRequest(request);
    
    if (!validation.isValid && validation.error) {
      return createValidationErrorResponse(validation.error);
    }
    
    // Add request ID for tracking
    const requestId = crypto.randomUUID();
    response.headers.set('X-Request-Id', requestId);
    
    // Log API requests (in production, use proper logging service)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${new Date().toISOString()}] ${request.method} ${pathname} - IP: ${clientIp} - ID: ${requestId}`);
    }
  }
  
  return response;
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}