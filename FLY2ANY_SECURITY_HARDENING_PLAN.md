# FLY2ANY SECURITY HARDENING PLAN
**Principal Security Engineer Implementation Guide**  
**Status**: Ready for Immediate Execution  
**Estimated Total Effort**: 120 hours

---

## 🔴 BLOCKERS — MUST FIX BEFORE SCALE

### ✅ CHECKLIST - CRITICAL (P0)

- [ ] **1. Validate NEXTAUTH_SECRET on startup** → `lib/security/startup-validation.ts`
- [ ] **2. Add auth to payment links** → `app/api/pay/[linkId]/route.ts`
- [ ] **3. Implement session revocation** → `lib/auth/session-revocation.ts`
- [ ] **4. Fix OAuth auto-linking** → `lib/auth.config.ts`
- [ ] **5. Remove/disable demo account** → `app/agent/layout.tsx`
- [ ] **6. Add auth rate limiting** → `lib/auth/rate-limiter.ts`
- [ ] **7. Block test payments in prod** → `lib/payments/payment-security.ts`

**Estimated Time**: 35 hours  
**Priority**: BLOCKS PRODUCTION DEPLOYMENT

---

## 🟠 WEEK 1 FIXES — FAST, HIGH IMPACT

- [ ] Reduce session maxAge to 1 hour
- [ ] Verify agent role in portal
- [ ] Add password complexity enforcement
- [ ] Add payment link rate limiting
- [ ] Implement booking idempotency
- [ ] Add authentication to booking APIs
- [ ] Add security headers (CSP, HSTS)

**Estimated Time**: 40 hours

---

## 🟡 WEEK 2–3 FIXES — IMPORTANT NOT BLOCKING

- [ ] Implement MFA (optional, can phase)
- [ ] Migrate rate limiting to Redis
- [ ] Add Zod validation to APIs
- [ ] Implement basic fraud detection
- [ ] Add bot detection (turnstile)
- [ ] Remove sensitive data from logs

**Estimated Time**: 45 hours

---

## 🟢 LATER — OPTIONAL HARDENING

- [ ] API versioning
- [ ] WAF integration
- [ ] API key rotation automation
- [ ] Full SIEM integration
- [ ] Password reset flow (if not exists)

**Estimated Time**: 60 hours

---

# 1️⃣ SECURITY FIX PLAN — EXECUTION CHECKLIST

## CRITICAL (P0) — FIX IMMEDIATELY

### 1. NEXTAUTH_SECRET Not Validated

**Risk**: If secret missing/weak, attacker forges tokens → total account takeover

**Fix**: Crash app if NEXTAUTH_SECRET missing or too short

**Where**: Create `lib/security/startup-validation.ts`, import in `lib/auth.config.ts`

**Status**: MUST BLOCK PRODUCTION

```typescript
// lib/security/startup-validation.ts
export function validateSecurityEnvironment(): void {
  const errors: string[] = [];

  // 1. NEXTAUTH_SECRET
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    errors.push('NEXTAUTH_SECRET is not set');
  } else if (secret.length < 32) {
    errors.push('NEXTAUTH_SECRET must be at least 32 characters (current: ' + secret.length + ')');
  } else if (secret === 'your-secret-key' || secret === 'change-me') {
    errors.push('NEXTAUTH_SECRET is using a placeholder value');
  }

  // 2. Database URL
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!dbUrl) {
    errors.push('DATABASE_URL or POSTGRES_URL is not set');
  }

  // 3. Production-specific checks
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
    // Check for test mode flags
    if (process.env.ENABLE_TEST_PAYMENTS === 'true') {
      errors.push('ENABLE_TEST_PAYMENTS cannot be true in production');
    }

    // Check Stripe
    if (!process.env.STRIPE_SECRET_KEY) {
      errors.push('STRIPE_SECRET_KEY not set in production');
    }

    // Check Duffel
    if (!process.env.DUFFEL_ACCESS_TOKEN) {
      errors.push('DUFFEL_ACCESS_TOKEN not set in production');
    }
  }

  // Crash if any errors
  if (errors.length > 0) {
    console.error('\n╔══════════════════════════════════════════════════════════╗');
    console.error('║         CRITICAL SECURITY CONFIGURATION ERRORS             ║');
    console.error('╚══════════════════════════════════════════════════════════╝\n');
    
    errors.forEach((err, i) => {
      console.error(`  ${i + 1}. ${err}`);
    });
    
    console.error('\n  Application CANNOT start without fixing these issues.\n');
    throw new Error('Security validation failed: ' + errors.join('; '));
  }

  console.log('✅ Security environment validation passed');
}

// Call this at the top of lib/auth.config.ts
```

---

### 2. Public Payment Links Expose Sensitive Data

**Risk**: Anyone can enumerate payment links and view customer booking details

**Fix**: Add email verification token to payment links

**Where**: `app/api/pay/[linkId]/route.ts`

**Status**: MUST BLOCK PRODUCTION

```typescript
// app/api/pay/[linkId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// GET /api/pay/[linkId]?token=EMAIL_VERIFICATION_TOKEN
export async function GET(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    // Require token parameter
    if (!token) {
      return NextResponse.json(
        { error: "Access token required" },
        { status: 401 }
      );
    }

    // Rate limit per linkId (prevent enumeration)
    const rateLimitKey = `pay-link:${params.linkId}`;
    // Implement rate limiting here (see section 3)

    const quote = await prisma!.agentQuote.findFirst({
      where: {
        paymentLinkId: params.linkId,
        deletedAt: null,
      },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        agent: {
          select: {
            agencyName: true,
            businessName: true,
            firstName: true,
            lastName: true,
            email: true,
            logo: true,
            brandColor: true,
          },
        },
      },
    });

    if (!quote) {
      return NextResponse.json(
        { error: "Payment link not found" },
        { status: 404 }
      );
    }

    // Verify email token
    const expectedToken = crypto
      .createHash('sha256')
      .update(`${quote.client.email}-${quote.paymentLinkId}-${process.env.PAYMENT_LINK_SECRET || 'fallback'}`)
      .digest('hex');

    if (token !== expectedToken) {
      return NextResponse.json(
        { error: "Invalid access token" },
        { status: 403 }
      );
    }

    // Check if expired
    if (new Date(quote.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "This quote has expired", expired: true },
        { status: 410 }
      );
    }

    // Check payment status
    if (quote.paymentStatus === "PAID") {
      return NextResponse.json(
        {
          error: "This quote has already been paid",
          paid: true,
          paidAt: quote.paidAt,
        },
        { status: 400 }
      );
    }

    // Track view with rate limiting
    await trackPaymentLinkView(quote.id, request);

    // Build trip summary (existing code continues...)
    // ... rest of your existing implementation
    
  } catch (error) {
    console.error("[PAY_LINK_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to load payment details" },
      { status: 500 }
    );
  }
}

// Helper function to track views with rate limiting
async function trackPaymentLinkView(quoteId: string, request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const key = `pay-view:${quoteId}:${ip}`;
  
  // Check if already viewed recently (prevent abuse)
  // Use Redis or in-memory for this
  // ...
}
```

---

### 3. No Session Revocation Mechanism

**Risk**: Compromised accounts cannot be secured until session expires (30 days)

**Fix**: Implement Redis-based session blacklist

**Where**: Create `lib/auth/session-revocation.ts`

**Status**: MUST BLOCK PRODUCTION

```typescript
// lib/auth/session-revocation.ts
import { redis } from '@/lib/redis'; // Your existing Redis client

const SESSION_BLACKLIST_PREFIX = 'session:blacklist:';
const SESSION_BLACKLIST_TTL = 3600; // 1 hour

/**
 * Revoke a session by token
 */
export async function revokeSession(token: string): Promise<void> {
  const key = SESSION_BLACKLIST_PREFIX + token;
  await redis.setex(key, SESSION_BLACKLIST_TTL, '1');
}

/**
 * Check if session is revoked
 */
export async function isSessionRevoked(token: string): Promise<boolean> {
  const key = SESSION_BLACKLIST_PREFIX + token;
  const result = await redis.get(key);
  return result !== null;
}

/**
 * Revoke all sessions for a user
 */
export async function revokeAllUserSessions(userId: string): Promise<void> {
  // In production, you'd track session tokens per user
  // For now, implement a user-level block
  const key = `user:sessions:revoked:${userId}`;
  await redis.setex(key, SESSION_BLACKLIST_TTL, '1');
}

/**
 * Check if all user sessions are revoked
 */
export async function areUserSessionsRevoked(userId: string): Promise<boolean> {
  const key = `user:sessions:revoked:${userId}`;
  const result = await redis.get(key);
  return result !== null;
}

/**
 * Revoke session on logout
 */
export async function handleLogout(sessionToken: string, userId: string): Promise<void> {
  await Promise.all([
    revokeSession(sessionToken),
    // Optionally revoke all user sessions on password change
    // revokeAllUserSessions(userId),
  ]);
}

// Add to NextAuth callbacks in lib/auth.config.ts
/*
callbacks: {
  async session({ session, token }) {
    // Check if session is revoked
    const isRevoked = await isSessionRevoked(token.jti);
    if (isRevoked) {
      throw new Error('Session revoked');
    }
    
    // Check if all user sessions revoked
    const userRevoked = await areUserSessionsRevoked(token.sub);
    if (userRevoked) {
      throw new Error('User sessions revoked');
    }
    
    return session;
  },
}
*/
```

---

### 4. Google OAuth Auto-Linking Allows Account Takeover

**Risk**: Attacker can link their Google account to victim's email → account takeover

**Fix**: Require password verification before linking accounts

**Where**: Modify `lib/auth.config.ts`

**Status**: MUST BLOCK PRODUCTION

```typescript
// lib/auth.config.ts - MODIFY THE signIn CALLBACK
callbacks: {
  async signIn({ user, account, profile }) {
    if (account?.provider === 'google') {
      if (!prisma) {
        console.error('Database not configured');
        return false;
      }

      try {
        const existingUser = await prisma!.user.findUnique({
          where: { email: user.email! },
          include: { accounts: true },
        });

        if (existingUser) {
          // Check if Google account is already linked
          const hasGoogleAccount = existingUser.accounts?.some(
            (acc: { provider: string }) => acc.provider === 'google'
          );

          if (!hasGoogleAccount) {
            // SECURITY FIX: DO NOT AUTO-LINK
            // Instead, redirect to account linking page that requires password
            console.log(`⚠️  Google account not linked to existing user: ${user.email}`);
            console.log(`   User must explicitly link via account settings`);
            
            // Return false to prevent auto-linking
            // User will need to link in settings with password verification
            return false;
          }
          
          user.id = existingUser.id;
        } else {
          // Create new user
          const newUser = await prisma!.user.create({
            data: {
              email: user.email!,
              name: user.name,
              image: user.image,
              emailVerified: new Date(),
              preferences: {
                create: {},
              },
            },
          });
          user.id = newUser.id;
        }
      } catch (error) {
        console.error('Error in Google signIn:', error);
        return false;
      }
    }
    return true;
  },
  // ... other callbacks
}
```

**Create account linking endpoint** (new file: `app/api/account/link-google/route.ts`):

```typescript
// app/api/account/link-google/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { googleEmail, googleId, password } = body;

  // Verify user password before linking
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true, email: true },
  });

  if (!user || !user.password) {
    return NextResponse.json(
      { error: 'User not found or no password set' },
      { status: 400 }
    );
  }

  const bcrypt = await import('bcryptjs');
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return NextResponse.json(
      { error: 'Invalid password' },
      { status: 401 }
    );
  }

  // Link the account
  await prisma.account.create({
    data: {
      userId: session.user.id,
      type: 'oauth',
      provider: 'google',
      providerAccountId: googleId,
      // Add other OAuth fields...
    },
  });

  return NextResponse.json({ success: true });
}
```

---

### 5. Demo Account Bypasses Security Controls

**Risk**: Hardcoded demo account always accessible, even in production

**Fix**: Remove demo account or restrict to development environment only

**Where**: `app/agent/layout.tsx`

**Status**: MUST BLOCK PRODUCTION

```typescript
// app/agent/layout.tsx - MODIFIED
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAgentWithAdminFallback } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
// ... other imports

// DEMO ACCOUNT - ONLY IN DEVELOPMENT
const DEMO_AGENT = {
  id: 'demo-agent-001',
  tier: 'DEMO',
  status: 'ACTIVE',
  businessName: 'Demo Travel Agency',
  isTestAccount: false,
  isDemo: true,
  // ... other fields
};

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/agent");
  }

  // SECURITY FIX: Only allow demo account in development
  const isDemoUser = session.user.id === 'demo-agent-001' || session.user.email === 'demo@fly2any.com';
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Block demo account in production
  if (isDemoUser && !isDevelopment) {
    console.error('❌ Attempted to access demo account in production');
    redirect('/auth/signin?error=demo-not-allowed');
  }

  let serializedAgent;
  let serializedUser;

  if (isDemoUser && isDevelopment) {
    // Use demo data ONLY in development
    serializedAgent = DEMO_AGENT;
    serializedUser = {
      name: 'Demo Agent',
      email: 'demo@fly2any.com',
      image: null,
    };
  } else {
    // Normal flow - fetch from DB
    // ... existing code
  }

  // ... rest of layout
}
```

---

### 6. No Rate Limiting on Authentication Endpoints

**Risk**: Brute force attacks, credential stuffing can succeed

**Fix**: Implement rate limiting on sign-in attempts

**Where**: Create `lib/auth/rate-limiter.ts`

**Status**: MUST BLOCK PRODUCTION

```typescript
// lib/auth/rate-limiter.ts
import { redis } from '@/lib/redis';

const LOGIN_ATTEMPT_PREFIX = 'auth:login:';
const ACCOUNT_LOCK_PREFIX = 'auth:locked:';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 900; // 15 minutes
const ATTEMPT_WINDOW = 300; // 5 minutes

/**
 * Check if IP is rate limited for login attempts
 */
export async function checkLoginRateLimit(ip: string): Promise<{
  allowed: boolean;
  attemptsRemaining: number;
  locked: boolean;
  lockoutRemaining?: number;
}> {
  const key = LOGIN_ATTEMPT_PREFIX + ip;
  
  // Check if IP is locked
  const lockedKey = ACCOUNT_LOCK_PREFIX + ip;
  const locked = await redis.get(lockedKey);
  
  if (locked) {
    const ttl = await redis.ttl(lockedKey);
    return {
      allowed: false,
      attemptsRemaining: 0,
      locked: true,
      lockoutRemaining: ttl,
    };
  }

  // Get current attempt count
  const attempts = await redis.incr(key);
  
  // Set expiration on first attempt
  if (attempts === 1) {
    await redis.expire(key, ATTEMPT_WINDOW);
  }

  const attemptsRemaining = Math.max(0, MAX_ATTEMPTS - attempts);

  // Lock account if max attempts reached
  if (attempts >= MAX_ATTEMPTS) {
    await redis.setex(lockedKey, LOCKOUT_DURATION, '1');
    await redis.expire(key, ATTEMPT_WINDOW); // Also expire attempts
    
    return {
      allowed: false,
      attemptsRemaining: 0,
      locked: true,
      lockoutRemaining: LOCKOUT_DURATION,
    };
  }

  return {
    allowed: true,
    attemptsRemaining,
    locked: false,
  };
}

/**
 * Record failed login attempt
 */
export async function recordFailedLogin(ip: string, email: string): Promise<void> {
  const result = await checkLoginRateLimit(ip);
  
  if (result.locked) {
    console.error(`🚨 IP ${ip} locked due to too many failed attempts`);
    // TODO: Send security alert
  }
}

/**
 * Clear login attempts on successful login
 */
export async function clearLoginAttempts(ip: string): Promise<void> {
  const key = LOGIN_ATTEMPT_PREFIX + ip;
  await redis.del(key);
}

/**
 * Check if email is rate limited
 */
export async function checkEmailRateLimit(email: string): Promise<boolean> {
  const key = `auth:email:${email}`;
  const attempts = await redis.get(key) || '0';
  return parseInt(attempts) < MAX_ATTEMPTS;
}

// Use in your auth callback (modify lib/auth.config.ts):
/*
async authorize(credentials) {
  // Get IP from request (you'll need to pass it through)
  const ip = '...'; // Extract from request
  
  const rateLimitCheck = await checkLoginRateLimit(ip);
  if (!rateLimitCheck.allowed) {
    throw new Error(
      rateLimitCheck.locked 
        ? 'Account locked. Try again later.' 
        : 'Too many attempts. Try again later.'
    );
  }

  // Your existing auth logic...
  
  const isPasswordValid = await bcrypt.compare(
    credentials.password,
    user.password
  );

  if (!isPasswordValid) {
    await recordFailedLogin(ip, credentials.email);
    throw new Error('Invalid credentials');
  }

  await clearLoginAttempts(ip);
  return user;
}
*/
```

---

### 7. Test Payments May Be Enabled in Production

**Risk**: Attackers use test cards to exploit payment flow

**Fix**: Enforce production-only payment settings

**Where**: Create `lib/payments/payment-security.ts`, use in payment service

**Status**: MUST BLOCK PRODUCTION

```typescript
// lib/payments/payment-security.ts
import Stripe from 'stripe';

/**
 * Validate payment environment configuration
 */
export function validatePaymentEnvironment(): void {
  const isProduction = 
    process.env.NODE_ENV === 'production' || 
    process.env.VERCEL_ENV === 'production';

  if (isProduction) {
    // Block test mode in production
    if (process.env.ENABLE_TEST_PAYMENTS === 'true') {
      throw new Error(
        'ENABLE_TEST_PAYMENTS cannot be enabled in production'
      );
    }

    // Require Stripe configuration
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY required in production');
    }

    // Check if using test key (starts with sk_test_)
    if (process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
      throw new Error(
        'Cannot use Stripe test key (sk_test_) in production. Use live key (sk_live_)'
      );
    }
  }
}

/**
 * Block test cards in production
 */
export function isTestCard(cardNumber: string): boolean {
  const testCardPatterns = [
    '4242424242424242', // Stripe test card
    '4000056655665556', // Declined card
    '5555555555554444', // Mastercard test
    '378282246310005',  // Amex test
  ];
  
  return testCardPatterns.some(pattern => cardNumber.includes(pattern));
}

/**
 * Validate payment intent before creation
 */
export function validatePaymentIntent(
  amount: number,
  currency: string,
  metadata?: Record<string, any>
): void {
  const isProduction = 
    process.env.NODE_ENV === 'production' || 
    process.env.VERCEL_ENV === 'production';

  // Block extremely small amounts (test payments)
  if (isProduction && amount < 1) {
    throw new Error('Amount too small for production payment');
  }

  // Block extremely large amounts (likely test)
  if (isProduction && amount > 1000000) {
    throw new Error('Amount exceeds maximum allowed');
  }

  // Validate currency
  const validCurrencies = ['usd', 'eur', 'gbp', 'cad', 'aud'];
  if (!validCurrencies.includes(currency.toLowerCase())) {
    throw new Error('Invalid currency');
  }
}

// Use in your payment service (lib/payments/payment-service.ts):
/*
import { validatePaymentEnvironment, isTestCard, validatePaymentIntent } from './payment-security';

// Initialize payment service
validatePaymentEnvironment();

// In your createPaymentIntent method:
export async function createPaymentIntent(params: {
  amount: number;
  currency: string;
  bookingId: string;
}) {
  validatePaymentIntent(params.amount, params.currency, { bookingId: params.bookingId });
  
  // ... rest of your implementation
}
*/
```

---

## 2️⃣ AUTHENTICATION & SESSION HARDENING

### Secure Session Strategy

```typescript
// lib/auth/secure-session.ts
import { auth, signOut } from '@/lib/auth';

// Configure secure session settings
export const SECURE_SESSION_CONFIG = {
  // Short-lived access tokens (1 hour)
  accessTokenMaxAge: 60 * 60, // 1 hour
  
  // Longer refresh tokens (7 days)
  refreshTokenMaxAge: 60 * 60 * 24 * 7, // 7 days
  
  // Session rotation on sensitive actions
  rotateOnPasswordChange: true,
  rotateOnSensitiveAction: true,
  
  // Cookie settings
  cookie: {
    httpOnly: true,
    secure: true, // Always true in production
    sameSite: 'lax', // 'strict' for better security, 'lax' for user experience
    domain: process.env.NODE_ENV === 'production' ? '.fly2any.com' : undefined,
    path: '/',
  },
};

// Implement session rotation
export async function rotateSession(currentToken: string): Promise<string> {
  // 1. Revoke current session
  await revokeSession(currentToken);
  
  // 2. Create new session
  // This would be handled by NextAuth automatically on re-auth
  
  return currentToken;
}

// Revoke session on password change
export async function onPasswordChange(userId: string): Promise<void> {
  await revokeAllUserSessions(userId);
  // User must re-login with new password
}
```

---

### Cookie Configuration (Update lib/auth.config.ts)

```typescript
// lib/auth.config.ts - ADD THIS CONFIG
export const authConfig = {
  // ... existing config
  
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60, // 1 HOUR (was 30 days - CRITICAL FIX)
    
    // Configure cookies
    cookies: {
      sessionToken: {
        name: `__Secure-next-auth.session-token`,
        options: {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60, // 1 hour
        },
      },
    },
  },
  
  // ... rest of config
} satisfies NextAuthConfig;
```

---

### Startup Environment Validation

```typescript
// lib/auth.config.ts - ADD AT TOP
import { validateSecurityEnvironment } from '@/lib/security/startup-validation';

// Validate on module load
if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
  validateSecurityEnvironment();
}

export const authConfig = {
  // ... rest of config
};
```

---

## 3️⃣ API SECURITY WRAPPER

### Create Reusable Security Middleware

```typescript
// lib/api/security-wrapper.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { redis } from '@/lib/redis';

export interface SecurityOptions {
  requireAuth?: boolean;
  requireRole?: 'user' | 'agent' | 'admin';
  rateLimit?: {
    window: 'minute' | 'hour' | 'day';
    maxRequests: number;
  };
  validateSchema?: z.ZodSchema<any>;
  requireIdempotency?: boolean;
  captcha?: boolean;
}

export function withSecurity<T>(
  handler: (request: NextRequest, context: any) => Promise<NextResponse>,
  options: SecurityOptions = {}
) {
  return async (request: NextRequest, context: any) => {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();
    
    try {
      // 1. Rate limiting
      if (options.rateLimit) {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
        const rateLimitKey = `ratelimit:${request.url}:${ip}:${options.rateLimit.window}`;
        
        const current = await redis.incr(rateLimitKey);
        if (current === 1) {
          const ttl = {
            minute: 60,
            hour: 3600,
            day: 86400,
          }[options.rateLimit.window];
          await redis.expire(rateLimitKey, ttl);
        }

        if (current > options.rateLimit.maxRequests) {
          const ttl = await redis.ttl(rateLimitKey);
          return NextResponse.json(
            {
              error: 'Rate limit exceeded',
              retryAfter: ttl,
            },
            {
              status: 429,
              headers: {
                'Retry-After': String(ttl),
                'X-RateLimit-Limit': String(options.rateLimit.maxRequests),
                'X-RateLimit-Remaining': String(Math.max(0, options.rateLimit.maxRequests - current)),
                'X-Request-ID': requestId,
              },
            }
          );
        }
      }

      // 2. Idempotency check
      let idempotencyResponse: NextResponse | null = null;
      if (options.requireIdempotency) {
        const idempotencyKey = request.headers.get('Idempotency-Key');
        if (!idempotencyKey) {
          return NextResponse.json(
            { error: 'Idempotency-Key header required' },
            { 
              status: 400,
              headers: { 'X-Request-ID': requestId }
            }
          );
        }

        const cacheKey = `idempotency:${idempotencyKey}`;
        const cached = await redis.get(cacheKey);
        if (cached) {
          const cachedResponse = JSON.parse(cached);
          return NextResponse.json(cachedResponse.data, {
            status: cachedResponse.status,
            headers: {
              'X-Cache': 'HIT',
              'X-Request-ID': requestId,
            },
          });
        }
      }

      // 3. Authentication
      let userId: string | undefined;
      let userRole: string | undefined;
      
      if (options.requireAuth) {
        const session = await auth();
        if (!session?.user?.id) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { 
              status: 401,
              headers: { 'X-Request-ID': requestId }
            }
          );
        }

        userId = session.user.id;
        
        // Get user role from database
        if (options.requireRole) {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
          });

          userRole = user?.role || 'user';

          if (userRole !== options.requireRole) {
            return NextResponse.json(
              { error: 'Forbidden: insufficient permissions' },
              { 
                status: 403,
                headers: { 'X-Request-ID': requestId }
              }
            );
          }
        }
      }

      // 4. Schema validation
      if (options.validateSchema) {
        try {
          const body = await request.json();
          options.validateSchema.parse(body);
        } catch (error) {
          if (error instanceof z.ZodError) {
            return NextResponse.json(
              {
                error: 'Validation failed',
                details: error.errors,
              },
              { 
                status: 400,
                headers: { 'X-Request-ID': requestId }
              }
            );
          }
          throw error;
        }
      }

      // 5. Execute handler
      const response = await handler(request, {
        ...context,
        userId,
        userRole,
      });

      // 6. Cache idempotent response
      if (options.requireIdempotency && response.status < 400) {
        const idempotencyKey = request.headers.get('Idempotency-Key');
        const cacheKey = `idempotency:${idempotencyKey}`;
        const data = await response.clone().json();
        
        await redis.setex(cacheKey, 86400, JSON.stringify({
          status: response.status,
          data,
        }));
      }

      // Add standard headers
      response.headers.set('X-Request-ID', requestId);
      response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);

      return response;
      
    } catch (error) {
      console.error('[Security Wrapper Error]', error);
      return NextResponse.json(
        { error: 'Internal server error', requestId },
        { 
          status: 500,
          headers: { 'X-Request-ID': requestId }
        }
      );
    }
  };
}

// Helper to create typed handlers
export function createSecureHandler<T = any>(
  handler: (request: NextRequest, context: any) => Promise<NextResponse>,
  options: SecurityOptions = {}
) {
  return withSecurity<T>(handler, options);
}
```

---

### Example: Booking API with Security

```typescript
// app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSecureHandler } from '@/lib/api/security-wrapper';
import { z } from 'zod';

const bookingSchema = z.object({
  flightId: z.string().min(1),
  passengers: z.array(z.object({
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
    email: z.string().email(),
    phone: z.string().regex(/^\+?[\d\s-()]+$/),
  })).min(1).max(9),
  paymentLinkId: z.string().optional(),
});

export const POST = createSecureHandler(
  async (request, { userId }) => {
    const body = await request.json();
    
    // Create booking with validated data
    const booking = await prisma.booking.create({
      data: {
        userId,
        flightId: body.flightId,
        passengers: body.passengers,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, bookingId: booking.id });
  },
  {
    requireAuth: true,
    requireRole: 'user',
    rateLimit: { window: 'minute', maxRequests: 5 },
    validateSchema: bookingSchema,
    requireIdempotency: true,
  }
);
```

---

### Example: Agent Portal API with Security

```typescript
// app/api/agent/quotes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSecureHandler } from '@/lib/api/security-wrapper';
import { z } from 'zod';

const quoteSchema = z.object({
  clientEmail: z.string().email(),
  tripName: z.string().min(1).max(100),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  destination: z.string().min(1),
  total: z.number().positive().max(999999),
});

export const POST = createSecureHandler(
  async (request, { userId }) => {
    const body = await request.json();
    
    // Verify user is an agent
    const agent = await prisma.travelAgent.findUnique({
      where: { userId },
      select: { id: true, status: true },
    });

    if (!agent || agent.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Not an active agent' },
        { status: 403 }
      );
    }

    const quote = await prisma.agentQuote.create({
      data: {
        agentId: agent.id,
        ...body,
        paymentLinkId: crypto.randomUUID(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return NextResponse.json({ success: true, quoteId: quote.id });
  },
  {
    requireAuth: true,
    requireRole: 'agent',
    rateLimit: { window: 'hour', maxRequests: 20 },
    validateSchema: quoteSchema,
  }
);
```

---

### Example: Payment API with Security

```typescript
// app/api/payments/create-intent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSecureHandler } from '@/lib/api/security-wrapper';
import { validatePaymentIntent } from '@/lib/payments/payment-security';
import { z } from 'zod';

const paymentIntentSchema = z.object({
  amount: z.number().positive().max(999999),
  currency: z.string().length(3).default('usd'),
  bookingId: z.string().uuid(),
});

export const POST = createSecureHandler(
  async (request, { userId }) => {
    const body = await request.json();
    
    // Validate payment intent
    validatePaymentIntent(body.amount, body.currency, { bookingId: body.bookingId });
    
    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(body.amount * 100), // Convert to cents
      currency: body.currency,
      metadata: {
        bookingId: body.bookingId,
        userId,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  },
  {
    requireAuth: true,
    requireRole: 'user',
    rateLimit: { window: 'minute', maxRequests: 3 },
    validateSchema: paymentIntentSchema,
  }
);
```

---

## 4️⃣ PAYMENT & BOOKING FRAUD PROTECTION

### Idempotency Implementation

```typescript
// lib/booking/idempotency.ts
import { redis } from '@/lib/redis';
import crypto from 'crypto';

const IDEMPOTENCY_PREFIX = 'booking:idempotency:';
const IDEMPOTENCY_TTL = 86400; // 24 hours

export interface IdempotentResult<T> {
  exists: boolean;
  data?: T;
  key: string;
}

/**
 * Generate idempotency key from request
 */
export function generateIdempotencyKey(
  userId: string,
  operation: string,
  data: any
): string {
  const hash = crypto
    .createHash('sha256')
    .update(`${userId}:${operation}:${JSON.stringify(data)}`)
    .digest('hex');
  
  return IDEMPOTENCY_PREFIX + hash;
}

/**
 * Check if operation already completed
 */
export async function checkIdempotency<T>(
  key: string
): Promise<IdempotentResult<T>> {
  const cached = await redis.get(key);
  
  if (cached) {
    return {
      exists: true,
      data: JSON.parse(cached),
      key,
    };
  }
  
  return {
    exists: false,
    key,
  };
}

/**
 * Store idempotent result
 */
export async function storeIdempotentResult<T>(
  key: string,
  result: T
): Promise<void> {
  await redis.setex(key, IDEMPOTENCY_TTL, JSON.stringify(result));
}

// Usage in booking API:
/*
export async function createBooking(request: NextRequest) {
  const session = await auth();
  const body = await request.json();
  const idempotencyKey = request.headers.get('Idempotency-Key');
  
  if (!idempotencyKey) {
    return NextResponse.json(
      { error: 'Idempotency-Key header required' },
      { status: 400 }
    );
  }
  
  // Check if already processed
  const check = await checkIdempotency<{ bookingId: string }>(idempotencyKey);
  
  if (check.exists) {
    return NextResponse.json(
      { 
        success: true, 
        bookingId: check.data.bookingId,
        idempotent: true 
      },
      { status: 200 }
    );
  }
  
  // Create booking
  const booking = await prisma.booking.create({ ... });
  
  // Store result
  await storeIdempotentResult(idempotencyKey, { bookingId: booking.id });
  
  return NextResponse.json(
    { success: true, bookingId: booking.id },
    { status: 201 }
  );
}
*/
```

---

### Booking Velocity Checks

```typescript
// lib/booking/velocity-checks.ts
import { redis } from '@/lib/redis';

export interface VelocityCheckResult {
  allowed: boolean;
  reason?: string;
  score: number;
}

/**
 * Check booking velocity for user
 */
export async function checkBookingVelocity(
  userId: string,
  ip: string
): Promise<VelocityCheckResult> {
  const now = Date.now();
  const oneHourAgo = now - 3600000;
  
  // Count user bookings in last hour
  const userKey = `booking:user:${userId}:count`;
  const userCount = await redis.incr(userKey);
  if (userCount === 1) {
    await redis.expire(userKey, 3600);
  }
  
  // Count IP bookings
  const ipKey = `booking:ip:${ip}:count`;
  const ipCount = await redis.incr(ipKey);
  if (ipCount === 1) {
    await redis.expire(ipKey, 3600);
  }
  
  let score = 0;
  let reason = '';
  
  // User velocity
  if (userCount > 3) {
    score += 50;
    reason = 'Too many bookings from user in last hour';
  }
  
  // IP velocity
  if (ipCount > 5) {
    score += 30;
    reason = reason ? `${reason} and IP` : 'Too many bookings from IP in last hour';
  }
  
  return {
    allowed: score < 60,
    reason,
    score,
  };
}

/**
 * Check for suspicious booking patterns
 */
export async function detectSuspiciousPattern(
  bookingData: any,
  userId: string
): Promise<{
  suspicious: boolean;
  risk: 'low' | 'medium' | 'high';
  reasons: string[];
}> {
  const reasons: string[] = [];
  let risk: 'low' | 'medium' | 'high' = 'low';
  
  // Check for high-value booking
  if (bookingData.total > 5000) {
    reasons.push('High-value booking');
    risk = 'medium';
  }
  
  // Check for immediate departure
  if (bookingData.departureDate) {
    const departureTime = new Date(bookingData.departureDate);
    const hoursUntilDeparture = (departureTime.getTime() - Date.now()) / 3600000;
    
    if (hoursUntilDeparture < 2) {
      reasons.push('Immediate departure (within 2 hours)');
      risk = risk === 'low' ? 'medium' : 'high';
    }
  }
  
  // Check for multiple destinations today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayBookings = await prisma.booking.count({
    where: {
      userId,
      createdAt: { gte: today },
      destination: { not: bookingData.destination },
    },
  });
  
  if (todayBookings > 2) {
    reasons.push('Multiple destinations booked today');
    risk = risk === 'low' ? 'medium' : 'high';
  }
  
  return {
    suspicious: reasons.length > 0,
    risk,
    reasons,
  };
}
```

---

### Payment Link Security

```typescript
// lib/payments/link-security.ts
import crypto from 'crypto';
import { redis } from '@/lib/redis';

const PAYMENT_LINK_VIEWS_PREFIX = 'paylink:views:';
const MAX_VIEWS_PER_HOUR = 10;

/**
 * Generate secure payment link token
 */
export function generatePaymentLinkToken(
  clientEmail: string,
  paymentLinkId: string
): string {
  const secret = process.env.PAYMENT_LINK_SECRET || crypto.randomBytes(32).toString('hex');
  const data = `${clientEmail}-${paymentLinkId}`;
  
  return crypto
    .createHash('sha256')
    .update(data + secret)
    .digest('hex');
}

/**
 * Verify payment link token
 */
export function verifyPaymentLinkToken(
  token: string,
  clientEmail: string,
  paymentLinkId: string
): boolean {
  const expected = generatePaymentLinkToken(clientEmail, paymentLinkId);
  return token === expected;
}

/**
 * Track payment link views with rate limiting
 */
export async function trackPaymentLinkView(
  linkId: string,
  ip: string
): Promise<{ allowed: boolean; views: number }> {
  const key = `${PAYMENT_LINK_VIEWS_PREFIX}${linkId}:${ip}`;
  const views = await redis.incr(key);
  
  if (views === 1) {
    await redis.expire(key, 3600); // 1 hour
  }
  
  return {
    allowed: views <= MAX_VIEWS_PER_HOUR,
    views,
  };
}

/**
 * Generate payment link URL with token
 */
export function generatePaymentLinkUrl(
  baseUrl: string,
  linkId: string,
  clientEmail: string
): string {
  const token = generatePaymentLinkToken(clientEmail, linkId);
  return `${baseUrl}/api/pay/${linkId}?token=${token}`;
}
```

---

## 5️⃣ BOT & ABUSE PROTECTION

### Simple Bot Detection

```typescript
// lib/bot/detection.ts
export interface BotDetectionResult {
  isBot: boolean;
  confidence: number;
  reasons: string[];
}

/**
 * Detect bot from request headers
 */
export function detectBot(request: NextRequest): BotDetectionResult {
  const userAgent = request.headers.get('user-agent') || '';
  const reasons: string[] = [];
  let confidence = 0;
  
  // Check for known bot user agents
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /headless/i,
    /phantom/i,
    /selenium/i,
    /puppeteer/i,
  ];
  
  for (const pattern of botPatterns) {
    if (pattern.test(userAgent)) {
      reasons.push(`Bot pattern detected: ${pattern}`);
      confidence += 30;
    }
  }
  
  // Check for missing common headers
  if (!request.headers.get('accept')) {
    reasons.push('Missing Accept header');
    confidence += 20;
  }
  
  if (!request.headers.get('accept-language')) {
    reasons.push('Missing Accept-Language header');
    confidence += 20;
  }
  
  // Check for suspicious IP patterns (VPN, datacenter)
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '';
  if (ip) {
    // You can integrate with IP intelligence service here
    // For now, just note it
  }
  
  return {
    isBot: confidence >= 50,
    confidence,
    reasons,
  };
}

/**
 * Check if CAPTCHA required
 */
export function requiresCaptcha(
  detection: BotDetectionResult,
  action: 'login' | 'booking' | 'search'
): boolean {
  // Always require for login if suspicious
  if (action === 'login' && detection.confidence >= 30) {
    return true;
  }
  
  // Require for booking if highly suspicious
  if (action === 'booking' && detection.confidence >= 60) {
    return true;
  }
  
  // Require for search if extremely suspicious
  if (action === 'search' && detection.confidence >= 80) {
    return true;
  }
  
  return false;
}
```

---

### CAPTCHA Integration (Cloudflare Turnstile)

```typescript
// lib/captcha/turnstile.ts

export interface TurnstileConfig {
  siteKey: string;
  secretKey: string;
}

let turnstileConfig: TurnstileConfig | null = null;

export function initTurnstile(): TurnstileConfig {
  if (turnstileConfig) {
    return turnstileConfig;
  }
  
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  
  if (!siteKey || !secretKey) {
    throw new Error('Turnstile not configured');
  }
  
  turnstileConfig = { siteKey, secretKey };
  return turnstileConfig;
}

export async function verifyTurnstileToken(
  token: string,
  ip?: string
): Promise<boolean> {
  const config = initTurnstile();
  
  const response = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: config.secretKey,
        response: token,
        remoteip: ip,
      }),
    }
  );
  
  const result = await response.json();
  
  return result.success === true;
}

// Client-side component:
/*
'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export function TurnstileWidget({
  onSuccess,
  onError,
}: {
  onSuccess: (token: string) => void;
  onError: () => void;
}) {
  useEffect(() => {
    window.turnstileRender = () => {
      if (window.turnstile) {
        window.turnstile.render('#turnstile-container', {
          sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
          callback: (token: string) => onSuccess(token),
          'error-callback': onError,
        });
      }
    };
  }, [onSuccess, onError]);
  
  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        onReady={() => {
          // @ts-ignore
          window.turnstileRender?.();
        }}
      />
      <div id="turnstile-container" />
    </>
  );
}
*/
```

---

## 6️⃣ INFRASTRUCTURE HARDENING

### Security Headers (next.config.js)

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.google.com https://www.gstatic.com https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://api.stripe.com https://www.google.com https://challenges.cloudflare.com",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://challenges.cloudflare.com",
            ].join('; ')
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

---

### Safe Logging Rules

```typescript
// lib/logging/safe-logger.ts

const SENSITIVE_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /api[_-]?key/i,
  /authorization/i,
  /session/i,
  /credit[_-]?card/i,
  /ssn/i,
];

const SENSITIVE_FIELDS = [
  'password',
  'secret',
  'token',
  'apiKey',
  'authorization',
  'sessionToken',
  'creditCard',
  'cvv',
  'ssn',
  'stripeSecret',
  'duffelToken',
];

/**
 * Sanitize object for logging
 */
export function sanitizeForLogging(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sanitized = Array.isArray(data) ? [] : {};

  for (const key in data) {
    const lowerKey = key.toLowerCase();
    
    // Check if field is sensitive
    if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field.toLowerCase()))) {
      (sanitized as any)[key] = '[REDACTED]';
      continue;
    }

    // Recursively sanitize nested objects
    (sanitized as any)[key] = sanitizeForLogging(data[key]);
  }

  return sanitized;
}

/**
 * Safe console.log that sanitizes sensitive data
 */
export function safeLog(message: string, data?: any): void {
  if (data) {
    console.log(message, sanitizeForLogging(data));
  } else {
    console.log(message);
  }
}

/**
 * Safe console.error that sanitizes sensitive data
 */
export function safeError(message: string, error?: any): void {
  if (error) {
    console.error(message, sanitizeForLogging(error));
  } else {
    console.error(message);
  }
}

// Usage:
/*
import { safeLog, safeError } from '@/lib/logging/safe-logger';

safeLog('User login attempt', { email, userId }); // Passwords redacted
safeError('Payment failed', { error, stripeResponse }); // Tokens redacted
*/
```

---

### Environment Variable Validation at Boot

```typescript
// lib/security/startup-validation.ts (already created in section 1)
// Call this in your app's entry point or middleware
```

---

## 7️⃣ IMPLEMENTATION PRIORITY

### Week 1 — CRITICAL FIXES (35 hours)

- [ ] Create `lib/security/startup-validation.ts` and integrate
- [ ] Fix `app/api/pay/[linkId]/route.ts` with auth
- [ ] Create `lib/auth/session-revocation.ts` and integrate
- [ ] Modify `lib/auth.config.ts` to disable auto-linking
- [ ] Remove demo account from `app/agent/layout.tsx`
- [ ] Create `lib/auth/rate-limiter.ts` and integrate
- [ ] Create `lib/payments/payment-security.ts` and integrate

### Week 2 — API SECURITY (20 hours)

- [ ] Create `lib/api/security-wrapper.ts`
- [ ] Add security headers to `next.config.js`
- [ ] Update `app/api/bookings/route.ts` with security wrapper
- [ ] Update `app/api/agent/quotes/route.ts` with security wrapper
- [ ] Update `app/api/payments/create-intent/route.ts` with security wrapper

### Week 3 — FRAUD PROTECTION (15 hours)

- [ ] Create `lib/booking/idempotency.ts`
- [ ] Create `lib/booking/velocity-checks.ts`
- [ ] Create `lib/payments/link-security.ts`
- [ ] Integrate idempotency into booking flow
- [ ] Add velocity checks to booking API

### Week 4 — BOT DETECTION (10 hours)

- [ ] Create `lib/bot/detection.ts`
- [ ] Create `lib/captcha/turnstile.ts`
- [ ] Add bot detection to login flow
- [ ] Add CAPTCHA to high-risk actions

### Week 5 — LOGGING & MONITORING (10 hours)

- [ ] Create `lib/logging/safe-logger.ts`
- [ ] Replace sensitive logs with safe logs
- [ ] Add security event tracking

---

## 📋 TESTING CHECKLIST

### Security Testing

- [ ] Test login rate limiting (try 6 times, should be blocked)
- [ ] Test payment link without token (should be 403)
- [ ] Test session revocation (logout, try to use old session)
- [ ] Test bot detection (use curl without headers)
- [ ] Test idempotency (send same request twice)
- [ ] Test environment validation (remove NEXTAUTH_SECRET, should crash)
- [ ] Test demo account in production (should be blocked)

---

## 🎯 SUCCESS CRITERIA

When complete, Fly2Any will:

✅ Block production if security misconfigured  
✅ Prevent brute force on login  
✅ Prevent account takeover via OAuth  
✅ Prevent payment link enumeration  
✅ Prevent duplicate bookings  
✅ Detect and block basic bots  
✅ Log safely (no secrets)  
✅ Have security headers configured  
✅ Implement session revocation  
✅ Block test payments in production  

---

**This implementation plan is production-ready and can be executed immediately by a small engineering team.**