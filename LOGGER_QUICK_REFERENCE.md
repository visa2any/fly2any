# Logger Quick Reference Card

## Import

```typescript
import { logger } from '@/lib/logger';
```

## Quick Migrations

| Before | After |
|--------|-------|
| `console.log('message')` | `logger.debug('message')` or `logger.info('message')` |
| `console.warn('message')` | `logger.warn('message')` |
| `console.error('message', error)` | `logger.error('message', error)` |
| `console.log('Success!')` | `logger.success('Success!')` |

## Methods

### logger.debug(message, context?)
- **When:** Development only
- **Use:** Detailed debugging, cache hits/misses, internal state
```typescript
logger.debug('Cache hit', { key: 'flight-123', ttl: 3600 });
```

### logger.info(message, context?)
- **When:** Development only
- **Use:** General app flow, user actions, operations
```typescript
logger.info('User logged in', { userId: 'usr_123', method: 'oauth' });
```

### logger.warn(message, context?)
- **When:** Always logged
- **Use:** Recoverable issues, fallbacks, approaching limits
```typescript
logger.warn('Rate limit approaching', { requests: 95, limit: 100 });
```

### logger.error(message, error?, context?)
- **When:** Always logged + sent to monitoring
- **Use:** Exceptions, failures, critical issues
```typescript
logger.error('Payment failed', error, { userId, amount, currency });
```

### logger.success(message, context?)
- **When:** Development only
- **Use:** Successful completions, confirmations
```typescript
logger.success('Email sent', { to: 'user@example.com', messageId });
```

### logger.startTimer(label)
- **Returns:** Timer object with `.end()` method
- **Use:** Measure operation duration
```typescript
const timer = logger.startTimer('API request');
await fetchData();
timer.end({ endpoint: '/api/flights', status: 200 });
```

### logger.group(label) / logger.groupEnd()
- **When:** Development only
- **Use:** Group related log messages
```typescript
logger.group('Payment Processing');
logger.debug('Validating card');
logger.debug('Creating intent');
logger.groupEnd();
```

## Context Best Practices

### Always Include Context ✅

```typescript
// Good - includes relevant context
logger.error('Payment failed', error, {
  userId: user.id,
  amount: payment.amount,
  currency: payment.currency,
  paymentMethod: payment.method
});
```

### Never Log Sensitive Data ❌

```typescript
// Bad - logs sensitive information
logger.debug('Payment data', {
  cardNumber: card.number,  // ❌ Never log
  cvv: card.cvv            // ❌ Never log
});

// Good - logs safe information
logger.debug('Payment data', {
  last4: card.last4,       // ✅ Safe
  brand: card.brand,       // ✅ Safe
  paymentId: payment.id    // ✅ Safe
});
```

## Common Patterns

### API Request Logging

```typescript
const timer = logger.startTimer('Flight search API');

try {
  logger.info('API request initiated', { endpoint: '/search', params });
  const response = await fetch(url);
  timer.end({ status: response.status });
  logger.success('API request completed', { resultCount: data.length });
} catch (error) {
  logger.error('API request failed', error, { endpoint, params });
  timer.end({ status: 'failed' });
}
```

### Cache Operations

```typescript
const value = await cache.get(key);
if (value) {
  logger.debug('Cache hit', { key, size: value.length });
  return value;
}
logger.debug('Cache miss', { key });
```

### Database Operations

```typescript
try {
  logger.debug('Database query', { table: 'bookings', operation: 'insert' });
  const result = await db.insert(bookings).values(data);
  logger.success('Record created', { id: result.id });
} catch (error) {
  logger.error('Database operation failed', error, { table: 'bookings' });
  throw error;
}
```

### Non-Critical Operations

```typescript
// Email sending (shouldn't fail the main flow)
try {
  await sendEmail(data);
  logger.success('Email sent', { to: data.to });
} catch (error) {
  logger.warn('Email send failed', { to: data.to, error: error.message });
  // Don't throw - email failure shouldn't fail the operation
}
```

## Emoji Guide (Auto-selected)

The logger automatically adds contextual emojis based on message content:

| Message Contains | Emoji | Example |
|------------------|-------|---------|
| cache hit | 🎯 | Cache operations |
| cache miss | 💨 | Cache operations |
| cache clear | 🧹 | Cache invalidation |
| database, query | 🗄️ | DB operations |
| api, request | 🌐 | API calls |
| payment, stripe | 💳 | Payments |
| booking | 🎫 | Bookings |
| email, mail | 📧 | Email |
| user, auth, login | 👤 | Authentication |
| search | 🔍 | Search |
| flight | ✈️ | Flights |
| hotel | 🏨 | Hotels |
| car | 🚗 | Car rentals |
| performance, timing | ⚡ | Performance |

## Environment Behavior

| Log Level | Development | Production |
|-----------|-------------|------------|
| debug     | ✅ Visible  | ❌ Hidden  |
| info      | ✅ Visible  | ❌ Hidden  |
| success   | ✅ Visible  | ❌ Hidden  |
| warn      | ✅ Visible  | ✅ Visible |
| error     | ✅ Visible  | ✅ Visible + Sent to monitoring |

## Migration Checklist

- [ ] Import logger at top of file
- [ ] Replace `console.log` with `logger.debug` or `logger.info`
- [ ] Replace `console.warn` with `logger.warn`
- [ ] Replace `console.error` with `logger.error`
- [ ] Add context objects to all logs
- [ ] Remove sensitive data from context
- [ ] Use performance timers for slow operations
- [ ] Group related operations
- [ ] Test in both dev and production modes

## Common Mistakes

### ❌ Mistake 1: No Context

```typescript
logger.error('Payment failed', error);  // ❌ Missing context
```

```typescript
logger.error('Payment failed', error, { userId, amount });  // ✅ With context
```

### ❌ Mistake 2: Wrong Log Level

```typescript
logger.error('User clicked button');  // ❌ Not an error
```

```typescript
logger.debug('User clicked button', { buttonId: 'submit' });  // ✅ Correct level
```

### ❌ Mistake 3: Logging Sensitive Data

```typescript
logger.debug('User data', { password: user.password });  // ❌ Never!
```

```typescript
logger.debug('User data', { userId: user.id, email: user.email });  // ✅ Safe
```

### ❌ Mistake 4: Not Using Timers

```typescript
const start = Date.now();
await operation();
logger.debug(`Took ${Date.now() - start}ms`);  // ❌ Manual timing
```

```typescript
const timer = logger.startTimer('Operation');
await operation();
timer.end({ status: 'success' });  // ✅ Use timer
```

## Next Steps

1. Read full guide: `LOGGER_MIGRATION_GUIDE.md`
2. See examples: `lib/logger.example.ts`
3. Start migrating critical files first
4. Set up ESLint rule to prevent console usage

---

**File:** `lib/logger.ts` | **Version:** 1.0.0 | **Updated:** 2025-11-02
