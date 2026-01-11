# FLY2ANY SECURITY AUDIT REPORT
**Date**: January 11, 2026  
**Auditor**: Senior Security Architect & Application Security Engineer  
**Platform Status**: LIVE - Production Grade Security Required

---

## 🔴 EXECUTIVE SUMMARY

Fly2Any is a complex travel booking SaaS platform with significant attack surface across authentication, payments, agent portals, and multiple third-party API integrations. The platform has several **CRITICAL vulnerabilities** that must be addressed immediately before production use.

### Critical Risk Summary
- **🔴 CRITICAL**: 7 issues requiring immediate action
- **🟠 HIGH**: 12 issues requiring urgent attention
- **🟡 MEDIUM**: 15 issues to address soon
- **🟢 SAFE**: 8 areas properly implemented

---

## 1️⃣ THREAT MODEL

### Attack Surface Map

```
┌─────────────────────────────────────────────────────────────────┐
│                     EXTERNAL ATTACKERS                          │
├─────────────────────────────────────────────────────────────────┤
│  • Credential stuffing attacks on login                         │
│  • Payment link enumeration and abuse                          │
│  • API endpoint scraping (flight prices, availability)         │
│  • Bot attacks on booking flow                                │
│  • SEO spam and malicious user generation                      │
│  • XSS/CSRF attacks on user inputs                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    MALICIOUS USERS                               │
├─────────────────────────────────────────────────────────────────┤
│  • Fake booking creation for testing purposes                  │
│  • Agent account abuse (commission fraud)                      │
│  • Payment link manipulation                                   │
│  • Account takeover attempts                                  │
│  • Abuse of free tiers/demo accounts                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       BOTS & SCRAPERS                           │
├─────────────────────────────────────────────────────────────────┤
│  • Price scraping for competitive analysis                     │
│  • Inventory monitoring for arbitrage                          │
│  • Automated booking attempts                                 │
│  • Data harvesting (email addresses, phone numbers)           │
│  • Rate limit evasion via IP rotation                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      FRAUD ACTORS                                │
├─────────────────────────────────────────────────────────────────┤
│  • Card testing/stolen card usage                              │
│  • Fake payment methods (test cards in prod)                  │
│  • Chargeback fraud                                            │
│  • Agent referral fraud                                        │
│  • Fake booking creation for refunds                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   THIRD-PARTY API RISKS                         │
├─────────────────────────────────────────────────────────────────┤
│  • Duffel API token exposure/leakage                           │
│  • Stripe secret key exposure                                  │
│  • Amadeus API credential abuse                                │
│  • API key rotation failures                                   │
│  • Rate limit exhaustion on external APIs                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       INSIDER RISK                              │
├─────────────────────────────────────────────────────────────────┤
│  • Agent account privilege escalation                           │
│  • Admin credential misuse                                    │
│  • Data exfiltration from booking records                      │
│  • Payment link manipulation                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2️⃣ OWASP TOP 10 — PRACTICAL ANALYSIS

### A01:2021 — Broken Access Control 🔴 CRITICAL

**Status**: CRITICAL

**Findings**:
1. **No authentication on `/api/pay/[linkId]` endpoint** - Payment links are completely public
2. **Agent portal check only validates session existence** - Doesn't verify agent role
3. **Admin endpoints lack proper RBAC enforcement**
4. **Demo account hardcoded and bypasses all security checks**
5. **Payment link enumeration possible - no UUID validation**

**Attack Scenario**: Attacker can enumerate payment links via `/api/pay/[linkId]`, view booking details, and potentially access sensitive customer information without authentication.

**Evidence**:
```typescript
// app/api/pay/[linkId]/route.ts - NO AUTHENTICATION
export async function GET(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  // No session check, no authentication
  const quote = await prisma!.agentQuote.findFirst({
    where: { paymentLinkId: params.linkId },
    // Returns full client data, agent data, pricing
  });
}

// app/agent/layout.tsx - Weak auth check
const session = await auth();
if (!session?.user?.id) {
  redirect("/auth/signin");
}
// Doesn't check if user is actually an agent
```

**Fix Priority**: IMMEDIATE

---

### A02:2021 — Cryptographic Failures 🔴 CRITICAL

**Status**: CRITICAL

**Findings**:
1. **Multiple encryption keys missing or using defaults**
2. **NEXTAUTH_SECRET may not be set (has fallback)**
3. **Database URLs in plain text in multiple locations**
4. **API keys stored in environment variables but no rotation strategy**
5. **Payment data encryption keys using default generation**

**Attack Scenario**: If NEXTAUTH_SECRET is not set or uses default value, attacker can forge session tokens, take over any account, and access admin panels.

**Evidence**:
```typescript
// lib/security/encryption.ts
function getEncryptionKey(purpose: string): string {
  let keyHex = process.env.ENCRYPTION_KEY_PAYMENT; // May be undefined
  // Falls back to hash of environment name - WEAK
  return createHash('sha256')
    .update(`fly2any-${purpose}-key-${process.env.NODE_ENV || 'development'}`)
    .digest('hex');
}

// lib/auth.config.ts
secret: process.env.NEXTAUTH_SECRET, // No fallback validation
```

**Fix Priority**: IMMEDIATE

---

### A03:2021 — Injection 🟠 HIGH

**Status**: HIGH

**Findings**:
1. **Prisma ORM used correctly** - No SQL injection risk
2. **User input validation present but inconsistent**
3. **Zod schemas defined but not universally applied**
4. **External API calls don't sanitize inputs before forwarding**

**Evidence**: Safe usage of Prisma
```typescript
// Good - Parameterized queries via Prisma
await prisma.user.findUnique({
  where: { email: credentials.email as string },
});
```

**Attack Scenario**: Attackers could potentially inject malicious content into search parameters or booking data that gets forwarded to third-party APIs without sanitization.

**Fix Priority**: HIGH

---

### A04:2021 — Insecure Design 🟠 HIGH

**Status**: HIGH

**Findings**:
1. **Auto-linking Google accounts without user consent** - Account takeover risk
2. **Payment links don't require any authentication** - Information leakage
3. **Demo account hardcoded and bypasses all security**
4. **No booking idempotency - can create duplicate bookings**
5. **Rate limiting in-memory only - resets on server restart**

**Attack Scenario**: Attacker can link their Google account to existing user accounts by guessing email addresses, leading to account takeover.

**Evidence**:
```typescript
// lib/auth.config.ts - Dangerous auto-linking
if (existingUser) {
  const hasGoogleAccount = existingUser.accounts?.some(
    (acc: { provider: string }) => acc.provider === 'google'
  );
  if (!hasGoogleAccount) {
    // AUTO-LINK without explicit user consent
    await prisma!.account.create({ ... });
  }
}
```

**Fix Priority**: HIGH

---

### A05:2021 — Security Misconfiguration 🟠 HIGH

**Status**: HIGH

**Findings**:
1. **Next.js config doesn't set security headers (CSP, HSTS)**
2. **CORS configuration not visible/reviewed**
3. **Debug logs expose sensitive information in development**
4. **`.env.local` files may be committed (checked in .gitignore but risky)**
5. **API routes don't consistently validate environment variables**

**Evidence**:
```typescript
// Missing security headers in lib/security/sanitize.ts
// No CSP, no X-Frame-Options, no X-Content-Type-Options

// Development logs expose secrets
if (process.env.NODE_ENV === 'development') {
  console.log(`   Token type: ${process.env.DUFFEL_ACCESS_TOKEN?.substring(0, 12)}...`);
}
```

**Fix Priority**: HIGH

---

### A06:2021 — Vulnerable and Outdated Components 🟡 MEDIUM

**Status**: MEDIUM

**Findings**:
1. **Dependabot configured** ✅ - Good practice
2. **Next.js 14.2.32** - Recent version
3. **Many dependencies with potential vulnerabilities**
4. **No automated dependency scanning in CI/CD**

**Evidence**:
```yaml
# .github/dependabot.yml exists - Good!
```

**Attack Scenario**: Attacker exploits known vulnerability in one of the hundreds of dependencies.

**Fix Priority**: MEDIUM

---

### A07:2021 — Identification and Authentication Failures 🔴 CRITICAL

**Status**: CRITICAL

**Findings**:
1. **Session maxAge: 30 days - Too long, increases token theft risk**
2. **No session revocation mechanism**
3. **No multi-factor authentication (MFA)**
4. **Password complexity not enforced**
5. **No account lockout on failed login attempts**
6. **Google OAuth auto-linking without verification**

**Evidence**:
```typescript
// lib/auth.config.ts
session: {
  strategy: 'jwt',
  maxAge: 30 * 24 * 60 * 60, // 30 DAYS - TOO LONG
}

// No rate limiting on login attempts visible
// No account lockout mechanism
```

**Attack Scenario**: Brute force credential stuffing attacks can succeed with 30-day sessions and no account lockout.

**Fix Priority**: IMMEDIATE

---

### A08:2021 — Software and Data Integrity Failures 🟡 MEDIUM

**Status**: MEDIUM

**Findings**:
1. **No request signing for critical operations**
2. **Payment webhook signature validation present but not verified**
3. **No code signing for production builds**

**Fix Priority**: MEDIUM

---

### A09:2021 — Security Logging and Monitoring Failures 🟠 HIGH

**Status**: HIGH

**Findings**:
1. **Sentry configured** ✅
2. **Custom error tracking system implemented** ✅
3. **Alert manager present** ✅
4. **BUT**: No specific security event logging (failed logins, suspicious patterns)
5. **No SIEM integration**
6. **Alerts only to console/slack - no automated response**

**Evidence**:
```typescript
// lib/monitoring/middleware.ts
// Good: Metrics tracking, alert manager
// Missing: Security event logging (failed auth, rate limit violations)
```

**Fix Priority**: HIGH

---

### A10:2021 — Server-Side Request Forgery (SSRF) 🟡 MEDIUM

**Status**: MEDIUM

**Findings**:
1. **External API calls to Amadeus, Duffel, Stripe - all trusted endpoints**
2. **No user-provided URLs used in server requests** ✅
3. **Webhook endpoints from external sources** - Need validation

**Fix Priority**: MEDIUM

---

## 3️⃣ AUTHENTICATION & AUTHORIZATION AUDIT

### Current Implementation Analysis

#### 🔴 CRITICAL ISSUES

**1. Session Configuration Too Permissive**
```typescript
// lib/auth.config.ts
session: {
  strategy: 'jwt',
  maxAge: 30 * 24 * 60 * 60, // 30 DAYS - CRITICAL
}
```
**Risk**: If JWT is stolen, attacker has 30 days of access.
**Fix**: Reduce to 1 hour for production, implement refresh tokens.

**2. No Session Revocation**
```typescript
// No mechanism to invalidate sessions
// No logout handling that invalidates server-side tokens
```
**Risk**: Compromised accounts cannot be secured.
**Fix**: Implement session revocation store (Redis) with token blacklisting.

**3. Google OAuth Auto-Linking - Account Takeover Risk**
```typescript
// lib/auth.config.ts
if (existingUser && !hasGoogleAccount) {
  // AUTO-LINK without explicit user consent
  await prisma!.account.create({
    data: {
      userId: existingUser.id,
      // Links attacker's Google to victim's account
    },
  });
}
```
**Risk**: Attacker can hijack accounts by registering with victim's email.
**Fix**: Require email verification before linking, or require password confirmation.

**4. Demo Account Bypasses All Security**
```typescript
// app/agent/layout.tsx
const DEMO_AGENT = {
  id: 'demo-agent-001',
  // Hardcoded demo data - ALWAYS accessible
};
const isDemo = session.user.id === 'demo-agent-001';
if (isDemo) {
  serializedAgent = DEMO_AGENT; // Bypasses all DB checks
}
```
**Risk**: Production system may allow demo account access.
**Fix**: Remove demo account from production, or restrict to whitelisted IPs.

**5. No Rate Limiting on Authentication**
```typescript
// lib/auth.config.ts
// No rate limiting on sign-in attempts
// No account lockout on failed attempts
```
**Risk**: Brute force attacks, credential stuffing.
**Fix**: Implement rate limiting (5 attempts/minute), account lockout after 10 failures.

---

### 🟠 HIGH RISK ISSUES

**6. Agent Portal Weak Authorization**
```typescript
// app/agent/layout.tsx
const session = await auth();
if (!session?.user?.id) {
  redirect("/auth/signin");
}
// Doesn't verify user has agent role!
// Any authenticated user can access agent portal
```
**Risk**: Regular users can access agent portal.
**Fix**: Check user.role === 'AGENT' or similar.

**7. No Multi-Factor Authentication (MFA)**
```Risk**: Account takeover via credential theft.
**Fix**: Implement TOTP-based MFA using libraries like 'otplib'.

**8. Password Policy Not Enforced**
```typescript
// lib/auth.config.ts
credentials: {
  email: { label: 'Email', type: 'email' },
  password: { label: 'Password', type: 'password' },
},
// No password strength validation
```
**Risk**: Weak passwords susceptible to brute force.
**Fix**: Implement password complexity requirements (12+ chars, mixed case, numbers, symbols).

---

### 🟡 MEDIUM RISK ISSUES

**9. Cookie Configuration Incomplete**
```typescript
// lib/security/csrf.ts
httpOnly: true,
secure: process.env.NODE_ENV === 'production',
sameSite: 'strict' as const,
// Missing: domain, path, priority
```
**Fix**: Add explicit domain configuration.

**10. No Password Reset Flow**
```Risk**: Users locked out of accounts.
**Fix**: Implement secure password reset with email verification and token expiration.

---

## 4️⃣ API SECURITY & ABUSE PREVENTION

### Current State Analysis

#### 🔴 CRITICAL ISSUES

**1. Public Payment Links Expose Sensitive Data**
```typescript
// app/api/pay/[linkId]/route.ts
// NO AUTHENTICATION
export async function GET(request, { params }) {
  const quote = await prisma!.agentQuote.findFirst({
    where: { paymentLinkId: params.linkId },
    include: {
      client: { select: { firstName, lastName, email } },
      agent: { select: { businessName, firstName, lastName, email } },
    },
    // Returns full pricing, trip details, etc.
  });
}
```
**Risk**: Anyone who guesses/generates a linkId can view booking details.
**Attack**: Enumeration attack on paymentLinkId.
**Fix**: 
- Add authentication or at least email verification token
- Implement rate limiting per linkId
- Expire links after view count limit
- Add CAPTCHA for anonymous access

**2. No Idempotency on Booking Creation**
```Risk**: Multiple identical bookings created on network retry.
**Fix**: Implement idempotency keys on booking endpoints.

**3. API Routes Without Authentication**
```typescript
// app/api/bookings/route.ts
export async function GET(request) {
  // No auth check
  const guestId = searchParams.get('guestId');
  const bookingsData = await liteAPI.getBookings({ guestId });
}
```
**Risk**: Anyone can query bookings by guestId enumeration.
**Fix**: Require authentication, verify user owns the bookings.

---

#### 🟠 HIGH RISK ISSUES

**4. Rate Limiting In-Memory Only**
```typescript
// lib/monitoring/middleware.ts
class RateLimiter {
  private requests = new Map<string, number[]>(); // In-memory!
  // Resets on server restart
}
```
**Risk**: Attackers bypass rate limits by restarting connections or scaling workers.
**Fix**: Use Redis-based rate limiting (Upstash already configured).

**5. No Request Validation Schema**
```typescript
// Many API routes lack input validation
export async function POST(request) {
  const body = await request.json();
  // No Zod schema validation
  await createBooking(body); // Direct use
}
```
**Risk**: Invalid data causes errors, potential injection.
**Fix**: Implement Zod validation on all API endpoints.

**6. No Anti-Bot Detection**
```Risk**: Bots scrape flight prices, automate bookings.
**Fix**: 
- Implement Cloudflare Turnstile or similar bot detection
- Check User-Agent headers
- Implement fingerprinting
- Detect headless browser patterns

---

#### 🟡 MEDIUM RISK ISSUES

**7. No API Versioning**
```Risk**: Breaking changes break clients.
**Fix**: Implement `/api/v1/`, `/api/v2/` versioning strategy.

**8. No Request ID Tracing**
```Risk**: Difficult to debug issues.
**Fix**: Already partially implemented - enhance.

---

### RECOMMENDED API SECURITY IMPLEMENTATION

```typescript
// lib/api/security-wrapper.ts
import { NextRequest } from 'next/server';
import { rateLimiter } from '@/lib/monitoring/middleware';
import { validateRequestSchema } from '@/lib/validation';

export function withSecurity<T>(
  handler: (request: NextRequest, context: any) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean;
    requireRole?: 'user' | 'agent' | 'admin';
    rateLimit?: { window: 'minute' | 'hour'; maxRequests: number };
    validateSchema?: z.ZodSchema<T>;
    requireCaptcha?: boolean;
    requireIdempotency?: boolean;
  } = {}
) {
  return async (request: NextRequest, context: any) => {
    // 1. Rate limiting
    if (options.rateLimit) {
      const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
      const limited = rateLimiter.isRateLimited(`${ip}:${request.url}`);
      if (limited.limited) {
        return NextResponse.json(
          { error: 'Rate limit exceeded', retryAfter: limited.retryAfter },
          { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } }
        );
      }
    }

    // 2. Schema validation
    if (options.validateSchema) {
      try {
        const body = await request.json();
        options.validateSchema.parse(body);
      } catch (error) {
        return NextResponse.json(
          { error: 'Validation failed', details: error },
          { status: 400 }
        );
      }
    }

    // 3. Authentication
    if (options.requireAuth) {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Role check
      if (options.requireRole) {
        // Check user role in database
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { role: true },
        });
        if (user?.role !== options.requireRole) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      }
    }

    // 4. Idempotency
    if (options.requireIdempotency) {
      const idempotencyKey = request.headers.get('Idempotency-Key');
      if (!idempotencyKey) {
        return NextResponse.json(
          { error: 'Idempotency-Key header required' },
          { status: 400 }
        );
      }
      // Check Redis for existing response
      const cached = await redis.get(`idempotency:${idempotencyKey}`);
      if (cached) {
        return NextResponse.json(JSON.parse(cached));
      }
    }

    // 5. Execute handler
    const response = await handler(request, context);

    // 6. Cache idempotency response
    if (options.requireIdempotency && response.status < 400) {
      const idempotencyKey = request.headers.get('Idempotency-Key');
      const data = await response.clone().json();
      await redis.setex(
        `idempotency:${idempotencyKey}`,
        86400, // 24 hours
        JSON.stringify(data)
      );
    }

    return response;
  };
}

// Usage example:
export const POST = withSecurity(
  async (request, context) => {
    const booking = await createBooking(request.body);
    return NextResponse.json(booking);
  },
  {
    requireAuth: true,
    requireRole: 'user',
    rateLimit: { window: 'minute', maxRequests: 10 },
    validateSchema: bookingSchema,
    requireIdempotency: true,
  }
);
```

---

## 5️⃣ BOOKING & PAYMENT FRAUD PROTECTION

### Current State Analysis

#### 🔴 CRITICAL ISSUES

**1. Test Mode Payments in Production**
```typescript
// lib/payments/payment-service.ts
if (isProduction && process.env.ENABLE_TEST_PAYMENTS !== 'true') {
  console.error('❌ SECURITY: Stripe not configured in production - blocking payment');
  // But check may not work correctly
}
```
**Risk**: Attackers use test cards in production.
**Fix**: Block all test cards in production via Stripe API settings.

**2. No Booking Fraud Detection**
```typescript
// No velocity checks, no fraud scoring
// No detection of:
// - Rapid bookings from same user
// - Multiple failed payment attempts
// - Suspicious booking patterns
```
**Risk**: Fraudulent bookings, stolen card testing.
**Fix**: Implement fraud detection system.

**3. Payment Link No Ownership Verification**
```typescript
// app/api/pay/[linkId]/route.ts
// Anyone can view and pay any payment link
```
**Risk**: Attacker pays for someone else's booking with stolen card.
**Fix**: Require email confirmation or auth.

---

#### 🟠 HIGH RISK ISSUES

**4. No Booking Idempotency**
```Risk**: Duplicate bookings created on network errors.
**Fix**: Implement idempotency keys on booking API.

**5. No Card Testing Prevention**
```Risk**: Attackers test stolen cards on your platform.
**Fix**: Implement Stripe Radar, rate limit payment attempts, block cards with too many declines.

**6. Agent Commission Fraud Risk**
```typescript
// No validation that agent owns the quote they're sending
// No rate limiting on quote creation
```
**Risk**: Agents create fake quotes for commission fraud.
**Fix**: Validate agent ownership, rate limit quote creation.

---

### RECOMMENDED FRAUD PREVENTION IMPLEMENTATION

```typescript
// lib/fraud/detection.ts
export class FraudDetection {
  // Velocity checks
  static async checkBookingVelocity(userId: string, ip: string): Promise<{
    allowed: boolean;
    reason?: string;
    score: number;
  }> {
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    
    // Count bookings in last hour
    const recentBookings = await prisma.booking.count({
      where: {
        userId,
        createdAt: { gte: new Date(oneHourAgo) },
      },
    });

    // Count bookings from IP
    const ipBookings = await redis.get(`fraud:ip:${ip}:count`) || '0';
    
    let score = 0;
    let reason = '';

    if (recentBookings > 3) {
      score += 50;
      reason = 'Too many bookings from user';
    }

    if (parseInt(ipBookings) > 5) {
      score += 30;
      reason = 'Too many bookings from IP';
    }

    return {
      allowed: score < 60,
      reason,
      score,
    };
  }

  // Card testing detection
  static async detectCardTesting(
    userId: string,
    cardFingerprint: string
  ): Promise<boolean> {
    const key = `fraud:card:${cardFingerprint}:attempts`;
    const attempts = await redis.incr(key);
    await redis.expire(key, 86400); // 24 hours

    if (attempts > 3) {
      // Too many attempts with same card
      return true;
    }

    return false;
  }

  // Suspicious patterns
  static async detectSuspiciousPattern(
    bookingData: any,
    userId: string
  ): Promise<{
    suspicious: boolean;
    risk: 'low' | 'medium' | 'high';
    reasons: string[];
  }> {
    const reasons: string[] = [];
    let risk: 'low' | 'medium' | 'high' = 'low';

    // Check for same-day bookings to different destinations
    const todayBookings = await prisma.booking.count({
      where: {
        userId,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
        destination: { not: bookingData.destination },
      },
    });

    if (todayBookings > 2) {
      reasons.push('Multiple destinations in one day');
      risk = 'medium';
    }

    // Check for high-value bookings
    if (bookingData.total > 5000) {
      reasons.push('High-value booking');
      risk = risk === 'low' ? 'medium' : 'high';
    }

    // Check for unusual departure time (e.g., immediate departure)
    const departureTime = new Date(bookingData.departureDate);
    const hoursUntilDeparture = (departureTime.getTime() - Date.now()) / 3600000;
    if (hoursUntilDeparture < 2) {
      reasons.push('Immediate departure');
      risk = risk === 'low' ? 'medium' : 'high';
    }

    return {
      suspicious: reasons.length > 0,
      risk,
      reasons,
    };
  }

  // Agent fraud detection
  static async detectAgentFraud(
    agentId: string,
    action: 'create_quote' | 'create_booking'
  ): Promise<boolean> {
    const key = `fraud:agent:${agentId}:${action}`;
    const count = await redis.incr(key);
    await redis.expire(key, 3600); // 1 hour

    const limit = action === 'create_quote' ? 20 : 5;
    if (count > limit) {
      return true;
    }

    return false;
  }
}

// Usage in booking API:
export async function POST(request: NextRequest) {
  const body = await request.json();
  const session = await auth();

  // Fraud checks
  const velocityCheck = await FraudDetection.checkBookingVelocity(
    session.user.id,
    request.ip || 'unknown'
  );

  if (!velocityCheck.allowed) {
    return NextResponse.json(
      { error: 'Booking temporarily blocked', reason: velocityCheck.reason },
      { status: 429 }
    );
  }

  const patternCheck = await FraudDetection.detectSuspiciousPattern(
    body,
    session.user.id
  );

  if (patternCheck.suspicious && patternCheck.risk === 'high') {
    // Flag for manual review
    await flagForReview(body, patternCheck);
    return NextResponse.json(
      { error: 'Booking requires manual review' },
      { status: 202 }
    );
  }

  // Proceed with booking
  const booking = await createBooking(body);
  return NextResponse.json(booking);
}
```

---

## 6️⃣ INFRASTRUCTURE & DEPLOYMENT HARDENING

### Current State Analysis

#### 🔴 CRITICAL ISSUES

**1. NEXTAUTH_SECRET May Not Be Set**
```typescript
// lib/auth.config.ts
secret: process.env.NEXTAUTH_SECRET, // Could be undefined
```
**Risk**: Default/missing secret allows token forgery.
**Fix**: Add validation at startup, crash if not set.

**2. Database URLs in Environment Variables**
```typescript
// Multiple DATABASE_URL references
// No rotation strategy
// No encryption at rest configuration verified
```
**Risk**: Credential exposure, data at risk.
**Fix**: Use secrets management (AWS Secrets Manager, Vercel env).

**3. No Security Headers Configured**
```typescript
// No CSP, HSTS, X-Frame-Options visible in middleware
```
**Risk**: XSS, clickjacking attacks.
**Fix**: Implement security headers.

---

#### 🟠 HIGH RISK ISSUES

**4. Environment Variable Exposure in Logs**
```typescript
if (process.env.NODE_ENV === 'development') {
  console.log(`   Token type: ${process.env.DUFFEL_ACCESS_TOKEN?.substring(0, 12)}...`);
}
```
**Risk**: Secrets logged in production if NODE_ENV not set correctly.
**Fix**: Never log secrets, use environment-specific log levels.

**5. No API Key Rotation Strategy**
```Risk**: Long-lived API keys increase exposure time.
**Fix**: Implement rotation script, automate via secrets manager.

**6. No WAF (Web Application Firewall)**
```Risk**: No protection against common attacks.
**Fix**: Deploy Cloudflare WAF or AWS WAF.

---

### RECOMMENDED INFRASTRUCTURE SECURITY

```typescript
// next.config.js - Add security headers
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.google.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://api.stripe.com https://www.google.com",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

// lib/security/env-validation.ts
export function validateCriticalEnvVars(): void {
  const required = [
    'NEXTAUTH_SECRET',
    'DATABASE_URL',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `CRITICAL: Missing required environment variables: ${missing.join(', ')}\n` +
      `Cannot start in production without these variables.`
    );
  }

  // Validate NEXTAUTH_SECRET strength
  if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
    throw new Error('CRITICAL: NEXTAUTH_SECRET must be at least 32 characters');
  }
}

// Call in middleware or app startup
if (process.env.NODE_ENV === 'production') {
  validateCriticalEnvVars();
}
```

---

## 7️⃣ MALWARE & PAYLOAD SAFETY

### Current State Analysis

#### 🟡 MEDIUM RISK ISSUES

**1. No File Upload Validation (if implemented)**
**Risk**: Malicious file uploads.
**Fix**: Validate file types, scan for malware, limit sizes.

**2. External API Payloads Trusted**
```typescript
// Direct use of Duffel/Amadeus responses without sanitization
```
**Risk**: XSS from third-party data.
**Fix**: Sanitize all external data before rendering.

**3. No JSON Size Limits**
**Risk**: DoS via large payloads.
**Fix**: Implement size limits on API routes.

---

### RECOMMENDED PAYLOAD SAFETY

```typescript
// lib/api/payload-security.ts
import { z } from 'zod';

// Max payload size: 1MB
const MAX_PAYLOAD_SIZE = 1024 * 1024;

export function validatePayloadSize(request: NextRequest): boolean {
  const contentLength = parseInt(request.headers.get('content-length') || '0');
  return contentLength <= MAX_PAYLOAD_SIZE;
}

// Sanitize external API responses
export function sanitizeExternalData(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  // Remove potentially dangerous fields
  const dangerousFields = ['script', 'onclick', 'onerror', 'eval', 'javascript:'];
  
  const sanitized: any = Array.isArray(data) ? [] : {};

  for (const key in data) {
    // Skip dangerous keys
    if (dangerousFields.some(df => key.toLowerCase().includes(df))) {
      continue;
    }

    const value = data[key];
    
    if (typeof value === 'string') {
      // Sanitize strings
      sanitized[key] = value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/javascript:/gi, '');
    } else if (typeof value === 'object') {
      // Recursively sanitize objects
      sanitized[key] = sanitizeExternalData(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

// Validation schemas using Zod
export const bookingSchema = z.object({
  flightId: z.string().min(1),
  passengers: z.array(z.object({
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
    email: z.string().email(),
    phone: z.string().regex(/^\+?[\d\s-()]+$/),
    passportNumber: z.string().optional(),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  })).min(1).max(9),
  paymentMethodId: z.string().optional(),
  paymentLinkId: z.string().optional(),
});

export const paymentSchema = z.object({
  amount: z.number().positive().max(999999),
  currency: z.string().length(3),
  paymentMethodId: z.string(),
  bookingId: z.string().uuid(),
});

// Usage in API routes
export async function POST(request: NextRequest) {
  // Validate payload size
  if (!validatePayloadSize(request)) {
    return NextResponse.json(
      { error: 'Payload too large' },
      { status: 413 }
    );
  }

  try {
    const body = await request.json();
    
    // Validate schema
    const validated = bookingSchema.parse(body);
    
    // Proceed with booking
    const booking = await createBooking(validated);
    return NextResponse.json(booking);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    throw error;
  }
}
```

---

## 8️⃣ MONITORING, DETECTION & INCIDENT RESPONSE

### Current State Analysis

#### ✅ GOOD PRACTICES

1. **Sentry configured** - Error tracking
2. **Custom monitoring system** - Metrics tracking
3. **Alert manager** - Alert infrastructure
4. **Performance monitoring** - Response times

#### 🟠 HIGH RISK GAPS

**1. No Security Event Logging**
```typescript
// Missing:
// - Failed login attempts
// - Suspicious API patterns
// - Rate limit violations
// - Failed payment attempts
```
**Fix**: Implement security event logging.

**2. No Real-Time Threat Detection**
```Risk**: Attacks detected only after damage.
**Fix**: Implement real-time alerting on suspicious patterns.

**3. No Automated Incident Response**
```Risk**: Manual response too slow.
**Fix**: Implement automated responses (account lockout, IP blocking).

---

### RECOMMENDED SECURITY MONITORING

```typescript
// lib/monitoring/security-events.ts
export class SecurityEventLogger {
  private static events: SecurityEvent[] = [];

  static async log(event: SecurityEvent): Promise<void> {
    // Store in database for persistence
    await prisma.securityEvent.create({
      data: {
        type: event.type,
        severity: event.severity,
        userId: event.userId,
        ip: event.ip,
        userAgent: event.userAgent,
        details: event.details,
        timestamp: new Date(),
      },
    });

    // Real-time alerting for critical events
    if (event.severity === 'critical' || event.severity === 'high') {
      await this.triggerAlert(event);
    }
  }

  static async triggerAlert(event: SecurityEvent): Promise<void> {
    // Send to security team
    await sendSecurityEmail(event);

    // Send to Slack
    if (process.env.SECURITY_SLACK_WEBHOOK) {
      await fetch(process.env.SECURITY_SLACK_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 Security Alert: ${event.type}`,
          attachments: [{
            color: event.severity === 'critical' ? 'danger' : 'warning',
            fields: [
              { title: 'Type', value: event.type, short: true },
              { title: 'Severity', value: event.severity, short: true },
              { title: 'IP', value: event.ip, short: true },
              { title: 'User ID', value: event.userId || 'N/A', short: true },
              { title: 'Details', value: JSON.stringify(event.details) },
            ],
          }],
        }),
      });
    }

    // Block IP if critical
    if (event.type === 'BRUTE_FORCE_ATTEMPT' && event.severity === 'critical') {
      await blockIP(event.ip, 3600); // 1 hour
    }
  }

  static async getRecentEvents(hours: number = 24): Promise<SecurityEvent[]> {
    const since = new Date(Date.now() - hours * 3600000);
    return prisma.securityEvent.findMany({
      where: { timestamp: { gte: since } },
      orderBy: { timestamp: 'desc' },
    });
  }
}

// Security event types
export interface SecurityEvent {
  type: 
    | 'FAILED_LOGIN'
    | 'BRUTE_FORCE_ATTEMPT'
    | 'SUSPICIOUS_API_PATTERN'
    | 'RATE_LIMIT_EXCEEDED'
    | 'PAYMENT_FRAUD'
    | 'BOOKING_FRAUD'
    | 'ACCOUNT_TAKEOVER_ATTEMPT'
    | 'UNAUTHORIZED_ACCESS';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ip: string;
  userAgent?: string;
  details: Record<string, any>;
}

// Usage examples

// Log failed login
await SecurityEventLogger.log({
  type: 'FAILED_LOGIN',
  severity: 'medium',
  userId: user?.id,
  ip: request.ip,
  userAgent: request.headers.get('user-agent'),
  details: { email: attempt.email },
});

// Log brute force detection
if (failedAttempts >= 5) {
  await SecurityEventLogger.log({
    type: 'BRUTE_FORCE_ATTEMPT',
    severity: 'critical',
    userId: user?.id,
    ip: request.ip,
    userAgent: request.headers.get('user-agent'),
    details: { email, failedAttempts, timeWindow: '5 minutes' },
  });
}

// Log payment fraud
await SecurityEventLogger.log({
  type: 'PAYMENT_FRAUD',
  severity: 'high',
  userId: booking.userId,
  ip: request.ip,
  details: {
    bookingId: booking.id,
    cardFingerprint: payment.card.fingerprint,
    fraudScore: fraudCheck.score,
  },
});

// Daily security monitoring script
// scripts/daily-security-check.ts
export async function dailySecurityCheck(): Promise<void> {
  const events = await SecurityEventLogger.getRecentEvents(24);

  const criticalCount = events.filter(e => e.severity === 'critical').length;
  const highCount = events.filter(e => e.severity === 'high').length;

  if (criticalCount > 0 || highCount > 10) {
    await sendDailySecurityReport({
      criticalCount,
      highCount,
      events: events.slice(0, 20), // Top 20 events
    });
  }

  // Check for blocked IPs that need review
  const blockedIPs = await getBlockedIPs();
  if (blockedIPs.length > 100) {
    await alert('Too many blocked IPs - possible DDoS', blockedIPs);
  }
}
```

---

## 9️⃣ FINAL SECURITY BLUEPRINT

### 🔴 CRITICAL ISSUES - FIX IMMEDIATELY

1. **NEXTAUTH_SECRET not validated** - Crash on startup if missing
2. **Public payment links expose sensitive data** - Add authentication
3. **No session revocation** - Implement token blacklisting
4. **Google OAuth auto-linking without consent** - Require verification
5. **Demo account bypasses security** - Remove from production
6. **No rate limiting on auth** - Implement auth rate limiting
7. **Test payments in production** - Block test cards

**Estimated Time**: 40 hours
**Priority**: P0 - Blocker for production

---

### 🟠 HIGH RISK ISSUES - FIX THIS WEEK

1. **Session maxAge 30 days** - Reduce to 1 hour
2. **Agent portal weak auth** - Verify agent role
3. **No MFA** - Implement TOTP-based MFA
4. **Password policy not enforced** - Add complexity requirements
5. **Payment link enumeration** - Add rate limiting, expire links
6. **No booking idempotency** - Implement idempotency keys
7. **API routes without auth** - Add auth checks
8. **Rate limiting in-memory only** - Migrate to Redis
9. **No request validation** - Add Zod schemas
10. **No anti-bot detection** - Implement Turnstile
11. **No booking fraud detection** - Implement fraud checks
12. **No security headers** - Add CSP, HSTS, etc.

**Estimated Time**: 80 hours
**Priority**: P1 - High risk

---

### 🟡 MEDIUM RISK ISSUES - FIX THIS MONTH

1. **Dependency vulnerabilities** - Automated scanning
2. **No security event logging** - Implement event tracking
3. **No automated incident response** - Add automated responses
4. **No API versioning** - Implement versioning
5. **No WAF** - Deploy Cloudflare WAF
6. **No API key rotation** - Implement rotation strategy
7. **Environment variable exposure in logs** - Remove sensitive logging
8. **Cookie configuration incomplete** - Add explicit settings
9. **No password reset flow** - Implement reset
10. **No file upload validation** - If uploads exist
11. **External payloads not sanitized** - Add sanitization
12. **No JSON size limits** - Add payload size limits
13. **No SIEM integration** - Integrate with monitoring
14. **SSRF risk in webhooks** - Validate webhook sources
15. **No code signing** - Implement if critical

**Estimated Time**: 60 hours
**Priority**: P2 - Medium risk

---

### 🟢 SAFE AREAS - MAINTAIN

1. **Prisma ORM usage** - Correct, parameterized queries
2. **Dependabot configured** - Good dependency management
3. **Sentry configured** - Error tracking
4. **Custom monitoring system** - Good foundation
5. **Alert manager** - Good alerting infrastructure
6. **Performance monitoring** - Response time tracking
7. **Rate limiting implemented** - Good start, needs Redis
8. **Error handling middleware** - Good error handling

---

## 📋 IMPLEMENTATION ROADMAP

### Week 1: Critical Security Fixes
- [ ] Validate NEXTAUTH_SECRET on startup
- [ ] Add authentication to payment links
- [ ] Implement session revocation with Redis
- [ ] Remove/disable demo account in production
- [ ] Add rate limiting to authentication endpoints
- [ ] Block test payments in production
- [ ] Remove Google OAuth auto-linking

### Week 2-3: High Risk Fixes
- [ ] Reduce session maxAge to 1 hour
- [ ] Verify agent role in agent portal
- [ ] Implement MFA (choose library: otplib)
- [ ] Add password complexity enforcement
- [ ] Add payment link rate limiting and expiration
- [ ] Implement booking idempotency
- [ ] Add authentication to all booking APIs
- [ ] Migrate rate limiting to Redis

### Week 4: Bot Protection & Fraud Detection
- [ ] Implement Cloudflare Turnstile
- [ ] Add Zod validation to all API endpoints
- [ ] Implement booking fraud detection
- [ ] Add card testing prevention
- [ ] Implement agent fraud detection

### Week 5-6: Infrastructure Hardening
- [ ] Add security headers (CSP, HSTS, etc.)
- [ ] Deploy WAF (Cloudflare or AWS)
- [ ] Implement API key rotation
- [ ] Remove sensitive data from logs
- [ ] Implement secrets management

### Week 7-8: Monitoring & Incident Response
- [ ] Implement security event logging
- [ ] Add automated incident responses
- [ ] Set up SIEM integration
- [ ] Implement daily security checks
- [ ] Create incident response runbooks

---

## 🎯 SECURITY METRICS TO TRACK

### Daily
- [ ] Failed login attempts
- [ ] Rate limit violations
- [ ] Suspicious API patterns
- [ ] Blocked IPs
- [ ] Fraud detection alerts

### Weekly
- [ ] Security event trends
- [ ] New vulnerability scan results
- [ ] API key rotation status
- [ ] Session revocation metrics

### Monthly
- [ ] Security audit review
- [ ] Penetration testing results
- [ ] Security training completion
- [ ] Incident response drills

---

## 📞 INCIDENT RESPONSE PLAN

### Severity Levels

**P0 - Critical**
- Account takeover confirmed
- Payment data breach
- Production system compromise
- **Response Time**: 15 minutes
- **Actions**: Immediate shutdown, notify CISO, legal, customers

**P1 - High**
- Brute force attack in progress
- Fraud pattern detected
- Unauthorized access attempt
- **Response Time**: 1 hour
- **Actions**: Block IPs, lock accounts, notify security team

**P2 - Medium**
- Security vulnerability discovered
- Suspicious activity detected
- Rate limit abuse
- **Response Time**: 24 hours
- **Actions**: Investigate, implement mitigations, monitor

**P3 - Low**
- Policy violation
- Minor security issue
- Documentation gap
- **Response Time**: 1 week
- **Actions**: Schedule fix, update documentation

---

## 📚 SECURITY RESOURCES

### Tools & Libraries
- **Authentication**: NextAuth v5, otplib (MFA)
- **Validation**: Zod
- **Rate Limiting**: Upstash Redis
- **Bot Detection**: Cloudflare Turnstile
- **Monitoring**: Sentry, Datadog
- **WAF**: Cloudflare WAF, AWS WAF
- **Secrets Management**: AWS Secrets Manager, Vercel Env

### Documentation
- OWASP Top 10: https://owasp.org/Top10/
- Next.js Security: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- Stripe Security: https://stripe.com/docs/security

---

## ✅ CONCLUSION

Fly2Any has a solid foundation with good error handling and monitoring infrastructure. However, **CRITICAL security vulnerabilities** must be addressed before the platform can be considered production-ready.

**Immediate Actions Required**:
1. Validate all critical environment variables on startup
2. Add authentication to payment links
3. Implement session revocation
4. Remove/disable demo account in production
5. Add authentication rate limiting

**Total Estimated Effort**: 180 hours over 8 weeks

**Risk if Not Addressed**: Account takeovers, payment fraud, regulatory non-compliance, reputational damage, legal liability.

**Recommendation**: Block production deployment until P0 issues are resolved. Implement P1 issues within 2 weeks of production launch.

---

**Report Prepared By**: Senior Security Architect  
**Date**: January 11, 2026  
**Classification**: CONFIDENTIAL  
**Distribution**: Engineering Leadership, CISO, CTO