# Logger Migration Guide

## Overview

This guide helps you migrate from `console.log` statements to the new production-ready logging system in Fly2Any.

**File Location:** `lib/logger.ts`

## Why Migrate?

1. **Environment-aware**: Debug/info logs only in development, errors always logged
2. **Structured logging**: Attach context data to every log
3. **Error monitoring ready**: Integrates with Sentry/Datadog
4. **Type-safe**: Full TypeScript support
5. **Better debugging**: Visual emoji indicators, grouping, performance timing

## Quick Start

### Basic Import

```typescript
import { logger } from '@/lib/logger';
```

### Simple Migrations

#### Before (console.log)
```typescript
console.log('User authenticated');
console.log('Cache hit for key:', cacheKey);
console.error('Payment failed:', error);
```

#### After (logger)
```typescript
logger.info('User authenticated');
logger.debug('Cache hit', { key: cacheKey });
logger.error('Payment failed', error);
```

## Migration Patterns

### Pattern 1: Debug Information

**Before:**
```typescript
console.log('🔍 [DEBUG] Flight search:', { origin, destination, date });
console.log(`Cache hit for ${key}`);
console.log('API response:', data);
```

**After:**
```typescript
logger.debug('Flight search', { origin, destination, date });
logger.debug('Cache hit', { key });
logger.debug('API response received', { endpoint: '/api/flights', status: 200 });
```

### Pattern 2: Informational Messages

**Before:**
```typescript
console.log('✅ Booking created:', bookingId);
console.log(`Logged flight search: ${origin}→${destination}`);
console.log('User preferences updated');
```

**After:**
```typescript
logger.success('Booking created', { bookingId });
logger.info('Flight search logged', { origin, destination });
logger.info('User preferences updated', { userId });
```

### Pattern 3: Warnings

**Before:**
```typescript
console.warn('⚠️ Rate limit approaching');
console.warn('Geolocation API returned', response.status);
console.log('⚠️ Fallback to default currency');
```

**After:**
```typescript
logger.warn('Rate limit approaching', { requests: 95, limit: 100 });
logger.warn('Geolocation API error', { status: response.status });
logger.warn('Using fallback currency', { currency: 'USD' });
```

### Pattern 4: Error Handling

**Before:**
```typescript
console.error('Failed to create booking:', error);
console.error('Payment processing failed');
console.log('Error:', error.message);
```

**After:**
```typescript
logger.error('Booking creation failed', error, { userId, flightId });
logger.error('Payment processing failed', error, { amount, currency });
logger.error('Operation failed', error);
```

### Pattern 5: With Context Data

**Before:**
```typescript
console.log('🛒 Tracked abandoned cart:', cart.id, 'at step', cart.step);
console.log(`🔄 Request deduplication: Reusing pending request for ${key}`);
console.log('🌍 Resolved geolocation:', ipAddress, '→', countryCode);
```

**After:**
```typescript
logger.debug('Abandoned cart tracked', {
  cartId: cart.id,
  step: cart.step,
  timestamp: new Date().toISOString()
});

logger.debug('Request deduplication active', {
  key: key.substring(0, 50),
  action: 'reuse'
});

logger.info('Geolocation resolved', {
  ipAddress,
  countryCode,
  region,
  timezone
});
```

### Pattern 6: Performance Timing

**Before:**
```typescript
const start = Date.now();
await performOperation();
console.log(`Operation took ${Date.now() - start}ms`);
```

**After:**
```typescript
const timer = logger.startTimer('Operation name');
await performOperation();
timer.end({ operationId: '123' });
```

### Pattern 7: Grouped Logs

**Before:**
```typescript
console.log('=== Flight Search Operation ===');
console.log('Step 1: Validate input');
console.log('Step 2: Check cache');
console.log('Step 3: Call API');
console.log('=== End ===');
```

**After:**
```typescript
logger.group('Flight Search Operation');
logger.debug('Validating input', { origin, destination });
logger.debug('Checking cache', { key });
logger.debug('Calling API', { endpoint });
logger.groupEnd();
```

## API Reference

### Methods

#### `logger.debug(message, context?)`
- **Environment:** Development only
- **Use for:** Detailed debugging, cache operations, internal state
- **Example:** `logger.debug('Cache miss', { key: 'flight-123' })`

#### `logger.info(message, context?)`
- **Environment:** Development only
- **Use for:** General app flow, successful operations
- **Example:** `logger.info('User logged in', { userId: 'usr_123' })`

#### `logger.warn(message, context?)`
- **Environment:** Always logged
- **Use for:** Recoverable issues, deprecated features, fallbacks
- **Example:** `logger.warn('Rate limit approaching', { requests: 95 })`

#### `logger.error(message, error?, context?)`
- **Environment:** Always logged + sent to monitoring
- **Use for:** Exceptions, failed operations, critical issues
- **Example:** `logger.error('Payment failed', error, { userId, amount })`

#### `logger.success(message, context?)`
- **Environment:** Development only
- **Use for:** Successful completions, confirmations
- **Example:** `logger.success('Email sent', { to: 'user@example.com' })`

#### `logger.startTimer(label)`
- **Returns:** PerformanceTimer instance
- **Use for:** Measuring operation duration
- **Example:**
  ```typescript
  const timer = logger.startTimer('Database query');
  const results = await db.query();
  timer.end({ rowCount: results.length });
  ```

#### `logger.group(label)` / `logger.groupEnd()`
- **Environment:** Development only
- **Use for:** Grouping related log messages
- **Example:**
  ```typescript
  logger.group('Payment Processing');
  logger.debug('Validating card');
  logger.debug('Creating payment intent');
  logger.groupEnd();
  ```

## File-by-File Migration Strategy

### Phase 1: API Routes (Critical)
Files: `app/api/**/*.ts`

Priority: High - These handle critical business logic

Example files:
- `app/api/flights/search/route.ts`
- `app/api/payments/create-intent/route.ts`
- `app/api/bookings/route.ts`

### Phase 2: Services (High Impact)
Files: `lib/**/*.ts`

Priority: High - Core business logic

Example files:
- `lib/api/duffel.ts`
- `lib/payments/payment-service.ts`
- `lib/cache/redis.ts`

### Phase 3: Components (User-facing)
Files: `components/**/*.tsx`

Priority: Medium - User interaction logging

Example files:
- `components/flights/FlightCardEnhanced.tsx`
- `components/booking/ReviewAndPayEnhanced.tsx`

### Phase 4: Utilities (Low Priority)
Files: `lib/utils/**/*.ts`

Priority: Low - Helper functions

## Real-World Migration Examples

### Example 1: API Route

**Before:**
```typescript
// app/api/flights/search/route.ts
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Flight search request:', body);

    const results = await searchFlights(body);
    console.log(`Found ${results.length} flights`);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Flight search failed:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
```

**After:**
```typescript
// app/api/flights/search/route.ts
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  const timer = logger.startTimer('Flight search API');

  try {
    const body = await request.json();
    logger.info('Flight search initiated', {
      origin: body.origin,
      destination: body.destination,
      date: body.date
    });

    const results = await searchFlights(body);
    timer.end({ resultCount: results.length });

    logger.success('Flight search completed', {
      resultCount: results.length,
      origin: body.origin,
      destination: body.destination
    });

    return NextResponse.json(results);
  } catch (error) {
    logger.error('Flight search failed', error, {
      origin: body?.origin,
      destination: body?.destination
    });
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
```

### Example 2: Service Layer

**Before:**
```typescript
// lib/cache/redis.ts
async function getCached(key: string) {
  const value = await redis.get(key);
  if (value) {
    console.log(`🎯 Cache hit: ${key}`);
    return JSON.parse(value);
  }
  console.log(`💨 Cache miss: ${key}`);
  return null;
}
```

**After:**
```typescript
// lib/cache/redis.ts
import { logger } from '@/lib/logger';

async function getCached(key: string) {
  const value = await redis.get(key);
  if (value) {
    logger.debug('Cache hit', { key, size: value.length });
    return JSON.parse(value);
  }
  logger.debug('Cache miss', { key });
  return null;
}
```

### Example 3: Error Handling

**Before:**
```typescript
// lib/payments/payment-service.ts
async function processPayment(paymentData: PaymentData) {
  try {
    const result = await stripe.paymentIntents.create(paymentData);
    console.log('Payment successful:', result.id);
    return result;
  } catch (error) {
    console.error('Payment failed:', error);
    throw error;
  }
}
```

**After:**
```typescript
// lib/payments/payment-service.ts
import { logger } from '@/lib/logger';

async function processPayment(paymentData: PaymentData) {
  logger.group('Payment Processing');

  try {
    logger.debug('Creating payment intent', {
      amount: paymentData.amount,
      currency: paymentData.currency
    });

    const result = await stripe.paymentIntents.create(paymentData);

    logger.success('Payment processed', {
      paymentId: result.id,
      amount: result.amount,
      status: result.status
    });

    logger.groupEnd();
    return result;
  } catch (error) {
    logger.error('Payment processing failed', error, {
      amount: paymentData.amount,
      currency: paymentData.currency,
      customerId: paymentData.customer
    });
    logger.groupEnd();
    throw error;
  }
}
```

## Integration with Error Monitoring

### Sentry Integration (Future)

```typescript
// app/layout.tsx or similar initialization file
import * as Sentry from '@sentry/nextjs';
import { logger } from '@/lib/logger';

// Initialize Sentry
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// Connect logger to Sentry
logger.initializeErrorMonitoring({
  captureException: (error, context) => {
    Sentry.captureException(error, {
      extra: context
    });
  },
  captureMessage: (message, level, context) => {
    Sentry.captureMessage(message, {
      level,
      extra: context
    });
  }
});
```

## Best Practices

### 1. Always Include Context

**Bad:**
```typescript
logger.error('Payment failed', error);
```

**Good:**
```typescript
logger.error('Payment failed', error, {
  userId: user.id,
  amount: payment.amount,
  currency: payment.currency,
  paymentMethod: payment.method
});
```

### 2. Use Appropriate Log Levels

- `debug`: Cache hits, internal state, verbose details
- `info`: User actions, successful operations, app flow
- `warn`: Fallbacks, deprecated features, recoverable issues
- `error`: Exceptions, failures, critical issues

### 3. Don't Log Sensitive Data

**Bad:**
```typescript
logger.debug('Payment processed', {
  cardNumber: '4242-4242-4242-4242',
  cvv: '123'
});
```

**Good:**
```typescript
logger.debug('Payment processed', {
  last4: '4242',
  brand: 'visa',
  paymentId: 'pi_123'
});
```

### 4. Use Performance Timers

```typescript
const timer = logger.startTimer('Database query');
const results = await expensiveOperation();
timer.end({ resultCount: results.length });
```

### 5. Group Related Operations

```typescript
logger.group('Booking Creation');
logger.debug('Validating passenger data');
logger.debug('Creating payment intent');
logger.debug('Reserving seats');
logger.success('Booking created', { bookingId });
logger.groupEnd();
```

## Testing Your Migration

### 1. Development Environment

Run your app in development mode and verify logs appear:

```bash
npm run dev
```

Logs should show with emojis and full context.

### 2. Production Environment

Build and run in production mode:

```bash
npm run build
npm start
```

Only warnings and errors should appear in logs.

### 3. Check for Remaining Console Statements

```bash
# Search for remaining console statements
grep -r "console.log" --include="*.ts" --include="*.tsx" lib/ app/ components/

# Count remaining occurrences
grep -r "console\.(log|error|warn)" --include="*.ts" --include="*.tsx" lib/ app/ components/ | wc -l
```

## Next Steps

1. **Phase 1:** Migrate critical API routes (1-2 days)
2. **Phase 2:** Migrate service layer (2-3 days)
3. **Phase 3:** Migrate components (1-2 days)
4. **Phase 4:** Set up Sentry integration (1 day)
5. **Phase 5:** Create ESLint rule to prevent console usage

## ESLint Rule (Prevent Future Console Usage)

Add to `.eslintrc.json`:

```json
{
  "rules": {
    "no-console": ["error", {
      "allow": []
    }]
  }
}
```

This will prevent new `console.log` statements from being added.

## Support

For questions or issues with the logger:
1. Check this migration guide
2. Review `lib/logger.ts` implementation
3. Check existing migrations in the codebase for examples

---

**Summary:** The new logger provides production-ready logging with environment awareness, structured data, error monitoring integration, and better debugging tools. Start migrating critical paths first, then work through the rest of the codebase systematically.
