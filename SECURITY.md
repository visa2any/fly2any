# Fly2Any Security Documentation

**Version:** 1.0.0
**Last Updated:** November 10, 2025
**Security Lead:** Development Team

---

## Table of Contents

1. [Overview](#overview)
2. [Security Architecture](#security-architecture)
3. [Input Validation](#input-validation)
4. [Data Encryption](#data-encryption)
5. [CSRF Protection](#csrf-protection)
6. [XSS Prevention](#xss-prevention)
7. [Rate Limiting](#rate-limiting)
8. [Database Security](#database-security)
9. [Authentication & Authorization](#authentication--authorization)
10. [Security Best Practices](#security-best-practices)
11. [Incident Response](#incident-response)
12. [Security Checklist](#security-checklist)

---

## Overview

Fly2Any implements enterprise-grade security measures to protect user data, prevent attacks, and ensure compliance with industry standards (PCI DSS, GDPR, CCPA).

### Security Principles

1. **Defense in Depth**: Multiple layers of security controls
2. **Least Privilege**: Minimal access rights for all components
3. **Zero Trust**: Verify everything, trust nothing
4. **Security by Default**: Secure configurations out of the box
5. **Fail Securely**: Graceful error handling without exposing data

---

## Security Architecture

### Layer 1: Input Validation
- All user inputs validated and sanitized
- RFC-compliant validation (Email: RFC 5322, Phone: E.164)
- Type-safe validation using Zod schemas

### Layer 2: Authentication & Authorization
- NextAuth.js for authentication
- Session-based authorization
- Role-based access control (RBAC)

### Layer 3: Data Protection
- AES-256-GCM encryption for sensitive data
- Encrypted at rest and in transit
- TLS 1.3 for all connections

### Layer 4: API Protection
- CSRF protection for state-changing operations
- Rate limiting per endpoint
- API key validation

### Layer 5: Database Security
- Parameterized queries (Prisma ORM)
- Row-level security
- Audit logging

---

## Input Validation

### Overview

Located in: `lib/validation/index.ts`

All user inputs are validated using our comprehensive validation library before processing.

### Validation Functions

#### Email Validation (RFC 5322 Compliant)

```typescript
import { validateEmail } from '@/lib/validation';

const result = validateEmail('user@example.com');
if (result.valid) {
  console.log(result.email); // Normalized email
} else {
  console.error(result.error); // Error message
}
```

**Features:**
- RFC 5322 compliant
- Blocks disposable email domains
- Length validation (max 254 characters)
- Normalization (lowercase, trim)

#### Phone Validation (E.164 Format)

```typescript
import { validatePhone } from '@/lib/validation';

const result = validatePhone('+1 (415) 555-2671');
if (result.valid) {
  console.log(result.phone); // '+14155552671'
  console.log(result.formatted); // '+1 415 555 2671'
}
```

**Format:** `+[country code][subscriber number]`

#### Passport Validation

```typescript
import { validatePassport } from '@/lib/validation';

const result = validatePassport('AB1234567');
// Valid: 6-9 alphanumeric characters
```

#### Date of Birth Validation

```typescript
import { validateDOB } from '@/lib/validation';

const result = validateDOB('1990-01-15', 'adult');
// Validates age requirements:
// - Adult: 18+ years
// - Child: 2-17 years
// - Infant: 0-2 years
```

#### Credit Card Validation (Luhn Algorithm)

```typescript
import { validateCardNumber } from '@/lib/validation';

const result = validateCardNumber('4532015112830366');
if (result.valid) {
  console.log(result.cardType); // 'visa', 'mastercard', 'amex', 'discover'
  console.log(result.lastFour); // '0366'
}
```

### Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| Email | RFC 5322 format | "Invalid email format. Please enter a valid email address." |
| Phone | E.164 format (+country code) | "Invalid phone format. Use international format: +[country code][number]" |
| Passport | 6-9 alphanumeric | "Invalid passport format. Must be 6-9 alphanumeric characters" |
| Name | 2-50 letters, spaces, hyphens | "Name can only contain letters, spaces, hyphens, apostrophes, and periods" |
| Date | YYYY-MM-DD, not future | "Invalid date format. Use YYYY-MM-DD" |
| Credit Card | Luhn algorithm | "Invalid card number. Please check and try again." |

---

## Data Encryption

### Overview

Located in: `lib/security/encryption.ts`

Sensitive data is encrypted using AES-256-GCM encryption.

### Encrypted Data Types

1. **Passport Numbers**: Required by aviation security regulations
2. **Phone Numbers**: PII protection
3. **Payment Information**: PCI DSS compliance
4. **General PII**: GDPR/CCPA compliance

### Encryption Functions

#### Encrypt Data

```typescript
import { encrypt } from '@/lib/security/encryption';

const encrypted = encrypt('ABC123456', 'passport');
// Returns: 'v1:iv:authTag:encryptedData'
```

#### Decrypt Data

```typescript
import { decrypt } from '@/lib/security/encryption';

const decrypted = decrypt(encryptedData, 'passport');
// Returns: 'ABC123456'
```

#### Specialized Functions

```typescript
import {
  encryptPassport,
  decryptPassport,
  encryptPhone,
  decryptPhone
} from '@/lib/security/encryption';

// Passport encryption
const encryptedPassport = encryptPassport('AB1234567');
const passport = decryptPassport(encryptedPassport);

// Phone encryption
const encryptedPhone = encryptPhone('+14155552671');
const phone = decryptPhone(encryptedPhone);
```

#### Field Masking (For Display)

```typescript
import { maskField } from '@/lib/security/encryption';

maskField('4532015112830366', 'card');      // '****-****-****-0366'
maskField('ABC123456', 'passport');         // 'ABC******'
maskField('+14155552671', 'phone');         // '+1***-***-2671'
maskField('user@example.com', 'email');     // 'u**r@example.com'
```

### Key Management

#### Development Environment

Keys are generated from environment variables:
- `ENCRYPTION_KEY_PASSPORT`
- `ENCRYPTION_KEY_PHONE`
- `ENCRYPTION_KEY_PAYMENT`
- `ENCRYPTION_KEY_GENERAL`

#### Generate Keys

```bash
# Run this once to generate all keys
node -e "const crypto = require('crypto'); console.log(crypto.randomBytes(32).toString('hex'));"
```

#### Production Environment (TODO)

**CRITICAL: Implement before production deployment**

1. **Use AWS KMS (Key Management Service)**
   ```typescript
   import { KMSClient, DecryptCommand } from '@aws-sdk/client-kms';

   async function getKeyFromKMS(keyId: string): Promise<Buffer> {
     const client = new KMSClient({ region: 'us-east-1' });
     const command = new DecryptCommand({ KeyId: keyId });
     const response = await client.send(command);
     return Buffer.from(response.Plaintext!);
   }
   ```

2. **Or use HashiCorp Vault**
   ```bash
   vault kv get -field=key secret/fly2any/encryption/passport
   ```

3. **Key Rotation Schedule**
   - Rotate keys quarterly
   - Re-encrypt data with new keys
   - Maintain old keys for decryption during transition
   - Document rotation in audit log

4. **Key Storage Rules**
   - Never commit keys to version control
   - Use separate keys for dev/staging/production
   - Restrict access to production keys
   - Enable audit logging for key access

---

## CSRF Protection

### Overview

Located in: `lib/security/csrf.ts`

CSRF (Cross-Site Request Forgery) protection using double-submit cookie pattern.

### How It Works

1. Server generates CSRF token
2. Token stored in httpOnly cookie
3. Client includes token in request header
4. Server validates token matches cookie

### Implementation

#### Server-Side (API Route)

```typescript
import { withCSRFProtection } from '@/lib/security/csrf';
import { NextRequest, NextResponse } from 'next/server';

export const POST = withCSRFProtection(async (request: NextRequest) => {
  // Your handler code here
  // CSRF protection is automatically applied
  return NextResponse.json({ success: true });
});
```

#### Manual CSRF Check

```typescript
import { csrfMiddleware } from '@/lib/security/csrf';

export async function POST(request: NextRequest) {
  const csrfResult = await csrfMiddleware(request);
  if (csrfResult) return csrfResult; // CSRF validation failed

  // Your handler code here
}
```

#### Client-Side (React Component)

```typescript
import { useCSRFToken } from '@/lib/security/csrf';

function BookingForm() {
  const { secureFetch } = useCSRFToken();

  const handleSubmit = async (data) => {
    const response = await secureFetch('/api/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  };
}
```

#### Server Component Token Generation

```typescript
import { generateAndSetCSRFToken } from '@/lib/security/csrf';

export default async function BookingPage() {
  const csrfToken = await generateAndSetCSRFToken();

  return <BookingForm csrfToken={csrfToken} />;
}
```

### Protected Routes

CSRF protection is applied to all state-changing operations:
- POST requests
- PUT requests
- DELETE requests
- PATCH requests

**Exceptions:** Webhook endpoints (Stripe, Duffel)

### Token Configuration

- **Length**: 256 bits (32 bytes)
- **Lifetime**: 1 hour
- **Storage**: httpOnly cookie
- **Validation**: Constant-time comparison

---

## XSS Prevention

### Overview

Located in: `lib/security/sanitize.ts`

Comprehensive XSS (Cross-Site Scripting) protection through input sanitization and Content Security Policy.

### HTML Sanitization

```typescript
import { sanitizeHTML } from '@/lib/security/sanitize';

const dirty = '<script>alert("XSS")</script><p>Safe content</p>';
const clean = sanitizeHTML(dirty);
// Returns: '<p>Safe content</p>'
```

### Strip All HTML

```typescript
import { stripHTML } from '@/lib/security/sanitize';

const text = stripHTML('<p>Hello <strong>World</strong></p>');
// Returns: 'Hello World'
```

### Escape HTML

```typescript
import { escapeHTML } from '@/lib/security/sanitize';

const escaped = escapeHTML('<script>alert("XSS")</script>');
// Returns: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
```

### URL Sanitization

```typescript
import { sanitizeURL } from '@/lib/security/sanitize';

const safe = sanitizeURL('javascript:alert("XSS")');
// Returns: null (blocked dangerous protocol)

const valid = sanitizeURL('https://example.com');
// Returns: 'https://example.com'
```

### Allowed Protocols
- `http:`
- `https:`
- `mailto:`
- `tel:`

**Blocked:** `javascript:`, `data:`, `file:`

### Content Security Policy (CSP)

```typescript
import { addSecurityHeaders } from '@/lib/security/sanitize';

export async function GET() {
  const response = NextResponse.json({ data: 'value' });
  return addSecurityHeaders(response);
}
```

### CSP Directives

```
default-src 'self'
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
img-src 'self' data: blob: https:
connect-src 'self' https://api.duffel.com https://api.stripe.com
frame-src 'self' https://js.stripe.com
object-src 'none'
base-uri 'self'
form-action 'self'
frame-ancestors 'none'
upgrade-insecure-requests
```

### Security Headers

All API responses include:
- `Content-Security-Policy`: Controls resource loading
- `X-Content-Type-Options: nosniff`: Prevents MIME sniffing
- `X-XSS-Protection: 1; mode=block`: Browser XSS protection
- `X-Frame-Options: DENY`: Prevents clickjacking
- `Referrer-Policy: strict-origin-when-cross-origin`: Controls referrer information
- `Strict-Transport-Security`: HTTPS enforcement (production only)

---

## Rate Limiting

### Overview

Located in: `lib/security/rate-limiter.ts` and `lib/security/rate-limit-config.ts`

Redis-backed rate limiting using sliding window algorithm.

### Endpoint-Specific Limits

#### Authentication Endpoints

| Endpoint | Limit | Window | Purpose |
|----------|-------|--------|---------|
| `/api/auth/login` | 5 requests | 15 minutes | Prevent brute force |
| `/api/auth/register` | 3 requests | 1 hour | Prevent spam accounts |
| `/api/auth/password-reset` | 3 requests | 1 hour | Prevent abuse |

#### Flight Operations

| Endpoint | Limit | Window | Purpose |
|----------|-------|--------|---------|
| `/api/flights/search` | 30 requests | 1 minute | Expensive API calls |
| `/api/flights/details` | 60 requests | 1 minute | Standard operations |
| `/api/flights/price-calendar` | 20 requests | 1 minute | Cached data |

#### Booking Operations

| Endpoint | Limit | Window | Purpose |
|----------|-------|--------|---------|
| `/api/bookings/create` | 10 requests | 1 minute | High-value operations |
| `/api/bookings/update` | 15 requests | 1 minute | Standard operations |
| `/api/bookings/cancel` | 10 requests | 1 minute | Sensitive operations |

#### Payment Operations

| Endpoint | Limit | Window | Purpose |
|----------|-------|--------|---------|
| `/api/payments/create-intent` | 5 requests | 1 minute | High-security |
| `/api/payments/confirm` | 5 requests | 1 minute | High-security |
| `/api/payments/refund` | 5 requests | 5 minutes | Administrative |

### Implementation

#### API Route Protection

```typescript
import { withRateLimit } from '@/lib/security/rate-limiter';
import { FLIGHT_RATE_LIMITS } from '@/lib/security/rate-limit-config';

export const POST = withRateLimit(
  async (request: NextRequest) => {
    // Your handler code
  },
  FLIGHT_RATE_LIMITS.search
);
```

#### Manual Rate Limiting

```typescript
import { rateLimit } from '@/lib/security/rate-limiter';

export async function POST(request: NextRequest) {
  const result = await rateLimit(request, {
    maxRequests: 30,
    windowSeconds: 60,
  });

  if (!result.allowed) {
    return createRateLimitResponse(result);
  }

  // Continue processing
}
```

### Rate Limit Tiers

| Tier | Multiplier | Description |
|------|------------|-------------|
| Anonymous | 1x | Base rate limit |
| Authenticated | 2x | Logged-in users |
| Premium | 5x | Premium subscribers |
| Partner | 10x | API partners |

### Response Headers

All rate-limited responses include:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Unix timestamp when limit resets
- `Retry-After`: Seconds until next request allowed (if exceeded)

---

## Database Security

### Overview

Located in: `lib/security/database-security.ts`

Secure database operations using Prisma ORM with parameterized queries.

### SQL Injection Prevention

**ALWAYS use Prisma's parameterized queries:**

```typescript
// GOOD (Safe)
const users = await prisma.user.findMany({
  where: { email: userInput }
});

// BAD (Unsafe - Never do this)
const users = await prisma.$queryRaw`SELECT * FROM users WHERE email = ${userInput}`;
```

### Safe Query Builders

#### Search Query

```typescript
import { buildSafeSearchWhere } from '@/lib/security/database-security';

const where = buildSafeSearchWhere(searchTerm, ['name', 'email']);
const users = await prisma.user.findMany({ where });
```

#### Pagination

```typescript
import { buildSafePagination } from '@/lib/security/database-security';

const { skip, take } = buildSafePagination(page, pageSize);
const users = await prisma.user.findMany({ skip, take });
```

#### Sorting

```typescript
import { buildSafeOrderBy } from '@/lib/security/database-security';

const orderBy = buildSafeOrderBy(
  sortField,
  sortOrder,
  ['name', 'email', 'createdAt'] // Whitelist
);
const users = await prisma.user.findMany({ orderBy });
```

### Access Control

```typescript
import { buildAccessControlWhere } from '@/lib/security/database-security';

// Ensure user can only access their own data
const where = buildAccessControlWhere(userId, {
  status: 'active'
});
const bookings = await prisma.booking.findMany({ where });
```

### Sensitive Data Protection

```typescript
import {
  removeSensitiveFields,
  SAFE_USER_SELECT
} from '@/lib/security/database-security';

// Option 1: Remove sensitive fields after query
const user = await prisma.user.findUnique({ where: { id } });
const safeUser = removeSensitiveFields(user);

// Option 2: Select only safe fields
const user = await prisma.user.findUnique({
  where: { id },
  select: SAFE_USER_SELECT
});
```

### Sensitive Fields (Never Return to Client)

- `password`
- `passwordHash`
- `resetToken`
- `verificationToken`
- `apiKey`
- `apiSecret`

### Transaction Safety

```typescript
import { safeTransaction } from '@/lib/security/database-security';

await safeTransaction(prisma, [
  (tx) => tx.booking.create({ data: bookingData }),
  (tx) => tx.payment.create({ data: paymentData }),
]);
```

**Transaction Settings:**
- Max wait: 5 seconds
- Timeout: 10 seconds
- Isolation level: Read Committed

### Query Limits

- **Maximum query limit**: 1000 items
- **Default pagination**: 20 items per page
- **Maximum page size**: 100 items per page
- **Maximum OR conditions**: 20
- **Maximum nesting depth**: 5 levels

### Audit Logging

Log sensitive database operations:

```typescript
import { logDatabaseOperation } from '@/lib/security/database-security';

await logDatabaseOperation(
  prisma,
  'CREATE',
  userId,
  'booking',
  booking.id
);
```

---

## Authentication & Authorization

### Overview

NextAuth.js v5 with Prisma adapter for secure authentication.

### Authentication Methods

1. **Email/Password**: bcrypt hashing
2. **OAuth**: Google, GitHub, Facebook
3. **Magic Links**: Email-based authentication
4. **2FA**: (Coming soon)

### Password Security

- **Minimum length**: 8 characters
- **Requirements**: Uppercase, lowercase, number, special character
- **Hashing**: bcrypt with salt rounds: 12
- **Storage**: Never store plaintext passwords

### Session Management

- **Session duration**: 30 days (default)
- **Sliding expiration**: Extended on activity
- **Storage**: Database (Prisma adapter)
- **Token**: JWT with HMAC-SHA256

### Authorization

```typescript
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Check permissions
  if (session.user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }

  // Authorized
}
```

### Role-Based Access Control (RBAC)

| Role | Permissions |
|------|-------------|
| `guest` | Browse, search |
| `user` | Book, manage bookings |
| `premium` | Priority support, exclusive deals |
| `admin` | Full system access |
| `superadmin` | User management, system config |

---

## Security Best Practices

### Development

1. **Never commit secrets to version control**
   - Use `.env.local` for local development
   - Use environment variables for production
   - Add sensitive files to `.gitignore`

2. **Keep dependencies updated**
   ```bash
   npm audit
   npm update
   ```

3. **Code review checklist**
   - Input validation on all user inputs
   - Parameterized database queries
   - CSRF protection on state-changing routes
   - Rate limiting on expensive operations
   - Sensitive data encrypted
   - No secrets in code

4. **Security testing**
   ```bash
   npm run test:security  # (TODO: Implement)
   ```

### Production

1. **Environment variables**
   ```bash
   # Required security environment variables
   ENCRYPTION_KEY_PASSPORT=...
   ENCRYPTION_KEY_PHONE=...
   ENCRYPTION_KEY_PAYMENT=...
   ENCRYPTION_KEY_GENERAL=...
   NEXTAUTH_SECRET=...
   ```

2. **HTTPS only**
   - Force HTTPS redirection
   - HSTS header enabled
   - TLS 1.3 minimum

3. **Monitoring & alerts**
   - Failed authentication attempts
   - Rate limit violations
   - Database anomalies
   - API errors

4. **Regular security audits**
   - Quarterly penetration testing
   - Monthly dependency audits
   - Weekly log reviews

### Compliance

1. **PCI DSS** (Payment Card Industry Data Security Standard)
   - Never store CVV/CVC codes
   - Encrypt credit card numbers
   - Use tokenization for payment processing
   - Stripe handles card data directly

2. **GDPR** (General Data Protection Regulation)
   - User consent for data collection
   - Right to access personal data
   - Right to delete personal data
   - Data encryption at rest and in transit

3. **CCPA** (California Consumer Privacy Act)
   - Disclosure of data collection
   - Right to opt-out of data sale
   - Access to collected data

4. **Aviation Security**
   - Secure Passenger Name Record (PNR) data
   - Encrypt passport information
   - Comply with TSA regulations

---

## Incident Response

### Security Incident Procedure

#### 1. Detection
- Automated monitoring alerts
- User reports
- Security audit findings

#### 2. Assessment
- Determine severity level
- Identify affected systems
- Document initial findings

#### 3. Containment
- Isolate affected systems
- Block malicious IPs
- Disable compromised accounts

#### 4. Eradication
- Remove malicious code
- Patch vulnerabilities
- Reset compromised credentials

#### 5. Recovery
- Restore from backups if needed
- Verify system integrity
- Monitor for recurrence

#### 6. Post-Incident
- Document lessons learned
- Update security procedures
- Notify affected users (if required)

### Severity Levels

| Level | Description | Response Time | Notification |
|-------|-------------|---------------|--------------|
| **Critical** | Active breach, data exposure | Immediate | Leadership, legal, users |
| **High** | Vulnerability with high risk | 4 hours | Security team, leadership |
| **Medium** | Vulnerability with moderate risk | 24 hours | Security team |
| **Low** | Minor issue, low risk | 1 week | Security team |

### Contact Information

**Security Team Email**: security@fly2any.com
**Security Hotline**: (Available 24/7)
**Bug Bounty**: (Coming soon)

---

## Security Checklist

### Pre-Production Deployment

- [ ] All environment variables configured
- [ ] Encryption keys generated and secured (AWS KMS/Vault)
- [ ] HTTPS certificates installed
- [ ] Database SSL enabled
- [ ] Rate limiting configured
- [ ] CSRF protection enabled
- [ ] Security headers configured
- [ ] Authentication tested
- [ ] Authorization rules verified
- [ ] Sensitive data encrypted
- [ ] Audit logging enabled
- [ ] Monitoring alerts configured
- [ ] Security audit completed
- [ ] Penetration test completed
- [ ] Incident response plan documented
- [ ] Team security training completed

### Regular Security Tasks

#### Daily
- [ ] Review security alerts
- [ ] Check failed authentication attempts
- [ ] Monitor rate limit violations

#### Weekly
- [ ] Review audit logs
- [ ] Check for new vulnerabilities
- [ ] Update IP blocklist if needed

#### Monthly
- [ ] Dependency security audit (`npm audit`)
- [ ] Review access controls
- [ ] Test backup restoration

#### Quarterly
- [ ] Rotate encryption keys
- [ ] Full security audit
- [ ] Penetration testing
- [ ] Update security documentation

---

## Additional Resources

### Documentation
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Security](https://www.prisma.io/docs/guides/database/advanced-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Stripe Security](https://stripe.com/docs/security)

### Tools
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [OWASP ZAP](https://www.zaproxy.org/)
- [Snyk](https://snyk.io/)
- [SonarQube](https://www.sonarqube.org/)

### Standards & Compliance
- [PCI DSS](https://www.pcisecuritystandards.org/)
- [GDPR](https://gdpr.eu/)
- [CCPA](https://oag.ca.gov/privacy/ccpa)
- [SOC 2](https://www.aicpa.org/soc)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-10 | Initial security documentation |

---

**Document Owner**: Security Lead
**Review Frequency**: Quarterly
**Next Review**: 2026-02-10
