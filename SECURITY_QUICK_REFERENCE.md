# Security & Monitoring Quick Reference

**Last Updated:** January 3, 2025

---

## Rate Limiting Usage

### Apply to API Route

```typescript
import { withRateLimit, RateLimitPresets } from '@/lib/security/rate-limiter';

// Your handler function
async function myAPIHandler(request: NextRequest) {
  // Your logic here
  return NextResponse.json({ success: true });
}

// Wrap with rate limiting
export const POST = withRateLimit(
  myAPIHandler,
  RateLimitPresets.STANDARD // 60 req/min
);
```

### Available Presets

```typescript
RateLimitPresets.STRICT     // 10 req/min  (Auth, Payment)
RateLimitPresets.STANDARD   // 60 req/min  (Search, CRUD)
RateLimitPresets.RELAXED    // 120 req/min (Read-only)
RateLimitPresets.ANALYTICS  // 30 req/min  (Tracking)
```

### Custom Rate Limit

```typescript
import { rateLimit, createRateLimitResponse } from '@/lib/security/rate-limiter';

export async function POST(request: NextRequest) {
  // Apply custom rate limit
  const result = await rateLimit(request, {
    maxRequests: 100,
    windowSeconds: 60,
  });

  if (!result.allowed) {
    return createRateLimitResponse(result);
  }

  // Your handler logic
}
```

---

## Input Validation Usage

### Validate Single Values

```typescript
import { validateEmail, validateAirportCode } from '@/lib/security/input-validator';

// Validate email
const { valid, email, error } = validateEmail('user@example.com');
if (!valid) {
  return NextResponse.json({ error }, { status: 400 });
}

// Validate airport code
const { valid, code, error } = validateAirportCode('JFK');
if (!valid) {
  return NextResponse.json({ error }, { status: 400 });
}
```

### Validate Request Body with Zod

```typescript
import { validateRequestBody, FlightSearchSchema } from '@/lib/security/input-validator';

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Validate entire body
  const { valid, data, errors } = validateRequestBody(body, FlightSearchSchema);

  if (!valid) {
    return NextResponse.json(
      { error: 'Validation failed', details: errors },
      { status: 400 }
    );
  }

  // Use validated data
  const { origin, destination, departureDate } = data;
}
```

### Sanitize User Input

```typescript
import { sanitizeString } from '@/lib/security/input-validator';

const userInput = '<script>alert("XSS")</script>John';
const clean = sanitizeString(userInput); // "John"
```

---

## Error Tracking Usage

### Track General Error

```typescript
import { trackError } from '@/lib/monitoring/error-tracker';

try {
  // Your code
} catch (error) {
  trackError(error as Error, {
    component: 'FlightSearch',
    action: 'search_flights',
    userId: user?.id,
    sessionId: sessionId,
    metadata: { origin, destination },
  });
  throw error;
}
```

### Track API Error

```typescript
import { trackAPIError } from '@/lib/monitoring/error-tracker';

try {
  const response = await fetch('/api/flights/search', options);
  if (!response.ok) throw new Error('API Error');
} catch (error) {
  trackAPIError(error as Error, {
    endpoint: '/api/flights/search',
    method: 'POST',
    statusCode: response?.status,
    responseTime: Date.now() - startTime,
    requestParams: searchParams,
  });
}
```

### Track Specific Operations

```typescript
import {
  trackFlightSearchError,
  trackHotelSearchError,
  trackBookingError,
  trackPaymentError,
  trackExternalAPIFailure,
} from '@/lib/monitoring/error-tracker';

// Flight search error
trackFlightSearchError(error, { origin: 'JFK', destination: 'LAX', departureDate: '2025-03-15' });

// Hotel search error
trackHotelSearchError(error, { location: 'Paris', checkIn: '2025-03-15', checkOut: '2025-03-20' });

// Booking error
trackBookingError(error, { offerId: 'abc123', amount: 500, currency: 'USD' });

// Payment error
trackPaymentError(error, { bookingId: 'xyz789', amount: 500, currency: 'USD' });

// External API failure
trackExternalAPIFailure('amadeus', error, { endpoint: '/v2/shopping/flight-offers', statusCode: 500 });
```

### Add User Context

```typescript
import { setUserContext, clearUserContext } from '@/lib/monitoring/error-tracker';

// On login
setUserContext({
  id: user.id,
  email: user.email,
  username: user.username,
});

// On logout
clearUserContext();
```

---

## SEO Metadata Usage

### Use Preset Metadata

```typescript
// app/page.tsx
import { homeMetadata } from '@/lib/seo/metadata';

export const metadata = homeMetadata;
```

### Generate Dynamic Metadata

```typescript
// app/flights/[origin]-[destination]/page.tsx
import { flightSearchMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }) {
  return flightSearchMetadata(
    params.origin,
    params.destination,
    params.date
  );
}
```

### Custom Metadata

```typescript
import { generateMetadata } from '@/lib/seo/metadata';

export const metadata = generateMetadata({
  title: 'Custom Page Title',
  description: 'Custom description for SEO',
  keywords: ['keyword1', 'keyword2'],
  ogImage: 'https://example.com/custom-image.jpg',
});
```

### Add Structured Data

```typescript
import {
  StructuredData,
  getOrganizationSchema,
  getFlightSchema,
  getBreadcrumbSchema,
} from '@/lib/seo/metadata';

export default function Page({ flight }) {
  return (
    <>
      <StructuredData data={getOrganizationSchema()} />
      <StructuredData data={getFlightSchema({
        origin: flight.origin,
        destination: flight.destination,
        departureDate: flight.date,
        price: flight.price,
        currency: flight.currency,
        airline: flight.airline,
      })} />
      {/* Page content */}
    </>
  );
}
```

---

## Monitoring Dashboard

### Access Dashboard
```
URL: https://www.fly2any.com/admin/monitoring
```

### Cache Statistics API
```bash
GET /api/cache/stats

Response:
{
  "hits": 150,
  "misses": 50,
  "errors": 0,
  "sets": 200,
  "hitRate": "75.0%",
  "enabled": true
}
```

---

## Common Patterns

### Secure API Route Template

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit, RateLimitPresets } from '@/lib/security/rate-limiter';
import { validateRequestBody, FlightSearchSchema } from '@/lib/security/input-validator';
import { trackAPIError } from '@/lib/monitoring/error-tracker';

async function handler(request: NextRequest) {
  try {
    // 1. Parse request
    const body = await request.json();

    // 2. Validate input
    const { valid, data, errors } = validateRequestBody(body, FlightSearchSchema);
    if (!valid) {
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    // 3. Process request
    const result = await processRequest(data);

    // 4. Return success
    return NextResponse.json({ success: true, data: result });

  } catch (error) {
    // 5. Track error
    trackAPIError(error as Error, {
      endpoint: request.nextUrl.pathname,
      method: request.method,
    });

    // 6. Return error response
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 7. Export with rate limiting
export const POST = withRateLimit(handler, RateLimitPresets.STANDARD);
```

---

## Checklists

### New API Route Checklist

- [ ] Rate limiting applied
- [ ] Input validation implemented
- [ ] Error tracking configured
- [ ] Proper error responses (no stack traces)
- [ ] Request/response logging
- [ ] Cache strategy defined (if applicable)
- [ ] Documentation added

### New Page Checklist

- [ ] Metadata configured
- [ ] Structured data added (if applicable)
- [ ] Error boundary in place
- [ ] Loading states handled
- [ ] SEO optimized (title, description)
- [ ] Mobile responsive
- [ ] Accessibility verified

---

## Environment Variables

### Required for Security

```bash
# Rate Limiting
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here

# Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn
SENTRY_AUTH_TOKEN=your_auth_token
SENTRY_ORG=your_org
SENTRY_PROJECT=your_project

# Admin Access (Optional)
ADMIN_IP_WHITELIST=123.456.789.0,98.765.432.1
```

---

## Monitoring URLs

```
Monitoring Dashboard: /admin/monitoring
Cache Stats API:      /api/cache/stats
Sentry Dashboard:     https://sentry.io
Vercel Analytics:     https://vercel.com
```

---

## Rate Limit Headers

When a request is rate limited, these headers are returned:

```
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1704380400
Retry-After: 30
```

---

## Testing Commands

### Test Rate Limiting
```bash
# Rapid fire requests
for i in {1..70}; do
  curl -I http://localhost:3000/api/flights/search
done
# Should get 429 after 60 requests
```

### Test Input Validation
```bash
# Invalid airport code
curl -X POST http://localhost:3000/api/flights/search \
  -H "Content-Type: application/json" \
  -d '{"origin":"INVALID","destination":"LAX"}'
# Should return 400

# XSS attempt
curl -X POST http://localhost:3000/api/flights/search \
  -H "Content-Type: application/json" \
  -d '{"origin":"<script>alert(1)</script>","destination":"LAX"}'
# Should sanitize and return 400
```

### Test SEO
```bash
# Check sitemap
curl http://localhost:3000/sitemap.xml

# Check robots.txt
curl http://localhost:3000/robots.txt

# Run Lighthouse
npx lighthouse http://localhost:3000 --view
```

---

## Emergency Procedures

### Disable Rate Limiting
```bash
# Set in Vercel environment variables
DISABLE_RATE_LIMITING=true

# Or in code (temporary)
if (process.env.DISABLE_RATE_LIMITING === 'true') {
  return { allowed: true, limit: 999999, remaining: 999999, reset: Date.now() };
}
```

### Emergency Rollback
```bash
# Via Vercel CLI
vercel rollback

# Or via dashboard
# Deployments → Previous Deployment → "Promote to Production"
```

---

## Support Resources

- Documentation: `/docs`
- Security Audit: `SECURITY_AUDIT_REPORT.md`
- Production Checklist: `PRODUCTION_READINESS_CHECKLIST.md`
- SEO Guide: `SEO_OPTIMIZATION_GUIDE.md`
- Full Report: `PRODUCTION_HARDENING_REPORT.md`

---

**For detailed implementation guides, see the full documentation files.**
