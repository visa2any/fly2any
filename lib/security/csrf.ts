/**
 * CSRF (Cross-Site Request Forgery) Protection
 *
 * Implements double-submit cookie pattern for CSRF protection.
 * Generates and validates CSRF tokens for all state-changing operations.
 *
 * Features:
 * - Token generation with cryptographic randomness
 * - Double-submit cookie pattern
 * - Token expiration
 * - Per-session tokens
 * - Middleware integration
 *
 * @module security/csrf
 */

import * as crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// ==========================================
// CONFIGURATION
// ==========================================

const CSRF_CONFIG = {
  tokenLength: 32, // 256 bits
  tokenLifetime: 60 * 60 * 1000, // 1 hour in milliseconds
  cookieName: 'csrf-token',
  headerName: 'x-csrf-token',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
  },
};

// ==========================================
// TOKEN GENERATION
// ==========================================

/**
 * Generate a cryptographically secure CSRF token
 *
 * @returns CSRF token
 *
 * @example
 * const token = generateCSRFToken();
 * // Returns: 'a1b2c3d4e5f6...' (64 hex characters)
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_CONFIG.tokenLength).toString('hex');
}

/**
 * Create a token with timestamp for expiration checking
 *
 * @returns Token with timestamp
 */
function createTimestampedToken(): string {
  const token = generateCSRFToken();
  const timestamp = Date.now();
  return `${token}:${timestamp}`;
}

/**
 * Parse timestamped token
 *
 * @param timestampedToken - Token with timestamp
 * @returns Parsed token and timestamp
 */
function parseTimestampedToken(timestampedToken: string): {
  token: string;
  timestamp: number;
} | null {
  try {
    const [token, timestampStr] = timestampedToken.split(':');
    const timestamp = parseInt(timestampStr, 10);

    if (!token || isNaN(timestamp)) {
      return null;
    }

    return { token, timestamp };
  } catch {
    return null;
  }
}

// ==========================================
// TOKEN VALIDATION
// ==========================================

/**
 * Check if token is expired
 *
 * @param timestamp - Token creation timestamp
 * @returns True if token is expired
 */
function isTokenExpired(timestamp: number): boolean {
  return Date.now() - timestamp > CSRF_CONFIG.tokenLifetime;
}

/**
 * Validate CSRF token
 *
 * @param tokenFromHeader - Token from request header
 * @param tokenFromCookie - Token from cookie
 * @returns Validation result
 */
export function validateCSRFToken(
  tokenFromHeader: string | null,
  tokenFromCookie: string | null
): {
  valid: boolean;
  error?: string;
} {
  // Both tokens must be present
  if (!tokenFromHeader || !tokenFromCookie) {
    return {
      valid: false,
      error: 'CSRF token missing',
    };
  }

  // Parse cookie token (has timestamp)
  const parsed = parseTimestampedToken(tokenFromCookie);
  if (!parsed) {
    return {
      valid: false,
      error: 'Invalid CSRF token format',
    };
  }

  // Check if token is expired
  if (isTokenExpired(parsed.timestamp)) {
    return {
      valid: false,
      error: 'CSRF token expired',
    };
  }

  // Compare tokens (constant-time comparison to prevent timing attacks)
  const headerBuffer = Buffer.from(tokenFromHeader);
  const cookieBuffer = Buffer.from(parsed.token);

  if (headerBuffer.length !== cookieBuffer.length) {
    return {
      valid: false,
      error: 'CSRF token mismatch',
    };
  }

  const isValid = crypto.timingSafeEqual(headerBuffer, cookieBuffer);

  if (!isValid) {
    return {
      valid: false,
      error: 'CSRF token mismatch',
    };
  }

  return { valid: true };
}

// ==========================================
// SERVER-SIDE FUNCTIONS (App Router)
// ==========================================

/**
 * Generate and set CSRF token in cookie (Server Components)
 *
 * @returns CSRF token (for including in forms)
 */
export async function generateAndSetCSRFToken(): Promise<string> {
  const timestampedToken = createTimestampedToken();
  const [token] = timestampedToken.split(':');

  const cookieStore = await cookies();
  cookieStore.set(CSRF_CONFIG.cookieName, timestampedToken, {
    ...CSRF_CONFIG.cookieOptions,
    maxAge: CSRF_CONFIG.tokenLifetime / 1000, // Convert to seconds
  });

  return token; // Return token without timestamp for client use
}

/**
 * Validate CSRF token from request (Server Components)
 *
 * @param request - Request object
 * @returns Validation result
 */
export async function validateCSRFFromRequest(
  request: NextRequest
): Promise<{ valid: boolean; error?: string }> {
  // Get token from header
  const tokenFromHeader = request.headers.get(CSRF_CONFIG.headerName);

  // Get token from cookie
  const tokenFromCookie = request.cookies.get(CSRF_CONFIG.cookieName)?.value;

  return validateCSRFToken(tokenFromHeader, tokenFromCookie || null);
}

// ==========================================
// MIDDLEWARE
// ==========================================

/**
 * CSRF protection middleware
 * Validates CSRF tokens for POST, PUT, DELETE, PATCH requests
 *
 * @param request - Next.js request object
 * @returns Response or null to continue
 *
 * @example
 * // In middleware.ts or API route
 * export async function POST(request: NextRequest) {
 *   const csrfResult = await csrfMiddleware(request);
 *   if (csrfResult) return csrfResult; // CSRF validation failed
 *
 *   // Continue with request handling...
 * }
 */
export async function csrfMiddleware(
  request: NextRequest
): Promise<NextResponse | null> {
  // Only check state-changing methods
  const method = request.method;
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return null;
  }

  // Skip CSRF check for certain paths (e.g., webhooks)
  const path = request.nextUrl.pathname;
  const skipPaths = [
    '/api/webhooks/', // Webhook endpoints
    '/api/stripe/webhook', // Stripe webhook
    '/api/duffel/webhook', // Duffel webhook
  ];

  if (skipPaths.some((skipPath) => path.startsWith(skipPath))) {
    return null;
  }

  // Validate CSRF token
  const result = await validateCSRFFromRequest(request);

  if (!result.valid) {
    console.warn(`🚨 CSRF validation failed: ${result.error} - ${path}`);

    return NextResponse.json(
      {
        error: 'Invalid CSRF token',
        message: 'This request appears to be invalid. Please refresh the page and try again.',
      },
      { status: 403 }
    );
  }

  return null; // Continue processing
}

/**
 * Higher-order function to wrap API routes with CSRF protection
 *
 * @param handler - API route handler
 * @returns Wrapped handler with CSRF protection
 *
 * @example
 * export const POST = withCSRFProtection(async (request: NextRequest) => {
 *   // Your handler code here
 *   return NextResponse.json({ success: true });
 * });
 */
export function withCSRFProtection(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Apply CSRF protection
    const csrfResult = await csrfMiddleware(request);
    if (csrfResult) {
      return csrfResult; // Return error response
    }

    // Execute handler
    return handler(request);
  };
}

// ==========================================
// CLIENT-SIDE HELPERS
// ==========================================

/**
 * Get CSRF token from cookie (client-side)
 *
 * @returns CSRF token or null
 *
 * @example
 * // In a React component
 * const token = getCSRFTokenFromCookie();
 */
export function getCSRFTokenFromCookie(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookies = document.cookie.split(';');
  const csrfCookie = cookies.find((cookie) =>
    cookie.trim().startsWith(`${CSRF_CONFIG.cookieName}=`)
  );

  if (!csrfCookie) {
    return null;
  }

  const timestampedToken = csrfCookie.split('=')[1];
  const parsed = parseTimestampedToken(timestampedToken);

  return parsed ? parsed.token : null;
}

/**
 * Add CSRF token to fetch request headers
 *
 * @param headers - Fetch headers object
 * @returns Headers with CSRF token
 *
 * @example
 * const response = await fetch('/api/booking', {
 *   method: 'POST',
 *   headers: addCSRFToken({
 *     'Content-Type': 'application/json',
 *   }),
 *   body: JSON.stringify(data),
 * });
 */
export function addCSRFToken(headers: Record<string, string> = {}): Record<string, string> {
  const token = getCSRFTokenFromCookie();

  if (token) {
    return {
      ...headers,
      [CSRF_CONFIG.headerName]: token,
    };
  }

  return headers;
}

/**
 * Create fetch wrapper with automatic CSRF token
 *
 * @example
 * const secureFetch = createSecureFetch();
 *
 * // Use like regular fetch
 * const response = await secureFetch('/api/booking', {
 *   method: 'POST',
 *   body: JSON.stringify(data),
 * });
 */
export function createSecureFetch() {
  return async (url: string, options: RequestInit = {}): Promise<Response> => {
    const method = options.method?.toUpperCase() || 'GET';

    // Add CSRF token for state-changing methods
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      const headers = new Headers(options.headers);
      const token = getCSRFTokenFromCookie();

      if (token) {
        headers.set(CSRF_CONFIG.headerName, token);
      }

      options.headers = headers;
    }

    return fetch(url, options);
  };
}

// ==========================================
// REACT HOOK
// ==========================================

/**
 * React hook for CSRF token management
 *
 * @returns CSRF token and secure fetch function
 *
 * @example
 * function MyComponent() {
 *   const { token, secureFetch } = useCSRFToken();
 *
 *   const handleSubmit = async () => {
 *     const response = await secureFetch('/api/booking', {
 *       method: 'POST',
 *       body: JSON.stringify(data),
 *     });
 *   };
 * }
 */
export function useCSRFToken() {
  if (typeof window === 'undefined') {
    return {
      token: null,
      secureFetch: fetch,
    };
  }

  return {
    token: getCSRFTokenFromCookie(),
    secureFetch: createSecureFetch(),
  };
}

// ==========================================
// FORM HELPER COMPONENTS
// ==========================================

/**
 * Get CSRF token input element for forms
 *
 * @returns HTML input element with CSRF token
 *
 * @example
 * <form>
 *   {getCSRFTokenInput()}
 *   <input name="email" />
 *   <button type="submit">Submit</button>
 * </form>
 */
export function getCSRFTokenInput(): string {
  const token = getCSRFTokenFromCookie();
  if (!token) return '';

  return `<input type="hidden" name="csrf_token" value="${token}" />`;
}

// ==========================================
// EXPORTS
// ==========================================

export const csrf = {
  // Token generation
  generateCSRFToken,
  generateAndSetCSRFToken,

  // Token validation
  validateCSRFToken,
  validateCSRFFromRequest,

  // Middleware
  csrfMiddleware,
  withCSRFProtection,

  // Client helpers
  getCSRFTokenFromCookie,
  addCSRFToken,
  createSecureFetch,
  useCSRFToken,
  getCSRFTokenInput,

  // Config
  config: CSRF_CONFIG,
};

export default csrf;

// ==========================================
// USAGE EXAMPLES
// ==========================================

/**
 * EXAMPLE 1: API Route Protection
 *
 * // app/api/booking/route.ts
 * import { withCSRFProtection } from '@/lib/security/csrf';
 *
 * export const POST = withCSRFProtection(async (request: NextRequest) => {
 *   // Your booking logic here
 *   return NextResponse.json({ success: true });
 * });
 *
 *
 * EXAMPLE 2: Manual CSRF Check in API Route
 *
 * // app/api/payment/route.ts
 * import { csrfMiddleware } from '@/lib/security/csrf';
 *
 * export async function POST(request: NextRequest) {
 *   const csrfResult = await csrfMiddleware(request);
 *   if (csrfResult) return csrfResult;
 *
 *   // Your payment logic here
 * }
 *
 *
 * EXAMPLE 3: Client-Side Form Submission
 *
 * // components/BookingForm.tsx
 * import { useCSRFToken } from '@/lib/security/csrf';
 *
 * function BookingForm() {
 *   const { secureFetch } = useCSRFToken();
 *
 *   const handleSubmit = async (data) => {
 *     const response = await secureFetch('/api/booking', {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify(data),
 *     });
 *   };
 * }
 *
 *
 * EXAMPLE 4: Server Component Token Generation
 *
 * // app/booking/page.tsx
 * import { generateAndSetCSRFToken } from '@/lib/security/csrf';
 *
 * export default async function BookingPage() {
 *   const csrfToken = await generateAndSetCSRFToken();
 *
 *   return (
 *     <BookingForm csrfToken={csrfToken} />
 *   );
 * }
 */
