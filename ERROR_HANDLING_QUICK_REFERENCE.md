# Error Handling System - Quick Reference Guide

**Version**: 2.0.0  
**Last Updated**: January 11, 2026

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [API Routes](#api-routes)
3. [Client Components](#client-components)
4. [Error Categories](#error-categories)
5. [Common Patterns](#common-patterns)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start

### 1 minute setup for API routes:

```typescript
import { createGetHandler } from '@/lib/api/error-middleware';

export const GET = createGetHandler(
  async (request, context) => {
    const data = await getData();
    return NextResponse.json({ data });
  }
);
```

### 1 minute setup for client requests:

```typescript
import { fetchWithRetry } from '@/lib/network/error-recovery';

const response = await fetchWithRetry('/api/data');
const data = await response.json();
```

---

## API Routes

### Basic GET Handler

```typescript
import { createGetHandler } from '@/lib/api/error-middleware';

export const GET = createGetHandler(
  async (request, context) => {
    const users = await db.user.findMany();
    return NextResponse.json({ users });
  },
  {
    operationName: 'Get Users',
    enableMonitoring: true,
  }
);
```

### POST Handler with Validation

```typescript
import { createPostHandler, validators } from '@/lib/api/error-middleware';

export const POST = createPostHandler(
  async (request, context) => {
    const body = await request.json();
    const result = await createData(body);
    return NextResponse.json({ result });
  },
  {
    validateRequest: validators.requiredFields(['name', 'email']),
    rateLimit: {
      identifier: 'create-user',
      window: 'minute',
      maxRequests: 10,
    },
  }
);
```

### PUT Handler with Auth

```typescript
import { createPutHandler } from '@/lib/api/error-middleware';

export const PUT = createPutHandler(
  async (request, context) => {
    const body = await request.json();
    const result = await updateData(context.params.id, body);
    return NextResponse.json({ result });
  },
  {
    requireAuth: true,
    enableMonitoring: true,
  }
);
```

### DELETE Handler

```typescript
import { createDeleteHandler } from '@/lib/api/error-middleware';

export const DELETE = createDeleteHandler(
  async (request, context) => {
    await deleteData(context.params.id);
    return NextResponse.json({ success: true });
  }
);
```

### Available Validators

```typescript
validators.jsonBody()           // Validate JSON body
validators.requiredFields(['name', 'email'])  // Check required fields
validators.queryParams(['page', 'limit'])     // Validate query params
```

---

## Client Components

### Basic Fetch with Retry

```typescript
import { fetchWithRetry } from '@/lib/network/error-recovery';

async function loadData() {
  try {
    const response = await fetchWithRetry('/api/data', {
      method: 'GET',
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

### Custom Retry Configuration

```typescript
const response = await fetchWithRetry('/api/data', {
  method: 'POST',
  body: JSON.stringify(data),
}, {
  maxRetries: 5,
  baseDelay: 2000,
  maxDelay: 60000,
  retryOnStatusCodes: [429, 500, 502, 503, 504],
});
```

### Monitored Fetch with Metrics

```typescript
import { monitoredFetch } from '@/lib/network/error-recovery';

const response = await monitoredFetch('/api/data', {
  method: 'GET',
}, {
  operationName: 'LoadData',
  endpoint: '/api/data',
  trackMetrics: true,
});
```

### Network Status Monitoring

```typescript
import { networkStatus } from '@/lib/network/error-recovery';

// Check current status
if (networkStatus.isOnline()) {
  console.log('Online');
} else {
  console.log('Offline');
}

// Listen to changes
networkStatus.addListener((online) => {
  console.log(`Network is ${online ? 'online' : 'offline'}`);
});
```

### React Hook for Network Status

```typescript
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

function MyComponent() {
  const { isOnline } = useNetworkStatus();
  
  return (
    <div>
      {isOnline ? 'Connected' : 'Offline - Changes will be saved'}
    </div>
  );
}
```

---

## Error Categories

### Automatic Categorization

The system automatically categorizes errors based on patterns:

```typescript
import { ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';

// Manual categorization
throw createAppError('Payment failed', {
  code: 'PAYMENT_ERROR',
  category: ErrorCategory.PAYMENT,
  severity: ErrorSeverity.CRITICAL,
  userMessage: 'Payment processing failed. Please try again.',
});
```

### Available Categories

```typescript
ErrorCategory.VALIDATION       // Input validation errors
ErrorCategory.AUTHENTICATION    // Login/auth failures
ErrorCategory.AUTHORIZATION     // Permission errors
ErrorCategory.PAYMENT           // Payment processing
ErrorCategory.BOOKING           // Booking operations
ErrorCategory.DATABASE          // Database errors
ErrorCategory.EXTERNAL_API      // Third-party APIs
ErrorCategory.NETWORK           // Network/HTTP errors
ErrorCategory.CONFIGURATION     // Config errors
ErrorCategory.UNKNOWN           // Uncategorized
```

### Severity Levels

```typescript
ErrorSeverity.CRITICAL         // Payment, booking failures
ErrorSeverity.HIGH             // Database, network errors
ErrorSeverity.NORMAL           // Validation, auth errors
ErrorSeverity.LOW              // Warnings, info
```

---

## Common Patterns

### Database Operations

```typescript
import { safeDbOperation } from '@/lib/monitoring/global-error-handler';

const users = await safeDbOperation(
  () => db.user.findMany(),
  'Get All Users',
  { userId: '123' }
);
```

### External API Calls

```typescript
import { safeApiCall } from '@/lib/monitoring/global-error-handler';

const flights = await safeApiCall(
  () => amadeusAPI.searchFlights(params),
  'Amadeus Flight Search',
  { searchId: 'abc123' }
);
```

### Payment Operations

```typescript
import { safePaymentOperation } from '@/lib/monitoring/global-error-handler';

const payment = await safePaymentOperation(
  () => stripeAPI.charge(amount, token),
  'Process Payment',
  { bookingId: 'xyz789', userId: '123' }
);
```

### Booking Operations

```typescript
import { safeBookingOperation } from '@/lib/monitoring/global-error-handler';

const booking = await safeBookingOperation(
  () => duffelAPI.createOrder(offerId, passengers),
  'Create Booking',
  { offerId, passengerCount: 2 }
);
```

### Error Boundaries

```typescript
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

### Client Error Reporting

```typescript
import { reportClientError } from '@/lib/monitoring/global-error-handler';

try {
  await riskyOperation();
} catch (error) {
  reportClientError(error as Error, {
    component: 'MyComponent',
    action: 'loadData',
    category: ErrorCategory.NETWORK,
    severity: ErrorSeverity.HIGH,
  });
}
```

---

## API Response Format

### Success Response

```json
{
  "success": true,
  "data": { /* your data */ },
  "metadata": {
    "requestId": "uuid",
    "timestamp": "2026-01-11T10:30:00.000Z",
    "processingTime": 245.50
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please check your input and try again.",
    "details": { "field": "error message" },
    "category": "validation",
    "timestamp": "2026-01-11T10:30:00.000Z"
  },
  "metadata": {
    "requestId": "uuid",
    "timestamp": "2026-01-11T10:30:00.000Z",
    "processingTime": 5.25
  }
}
```

---

## Configuration

### Environment Variables

```env
# Sentry
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production

# Alerts
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
ALERT_EMAIL_FROM=alerts@fly2any.com
ALERT_EMAIL_TO=admin@fly2any.com
```

### Default Retry Settings

```typescript
{
  maxRetries: 3,
  baseDelay: 1000,      // 1 second
  maxDelay: 30000,      // 30 seconds
  retryOnStatusCodes: [408, 429, 500, 502, 503, 504],
}
```

---

## Dashboard

### Access the Error Dashboard

```
URL: /admin/monitoring/errors
```

### Dashboard Features

- Real-time error monitoring (30s refresh)
- Time range filtering (1h, 24h, 7d, 30d)
- Error category breakdown
- System health indicators
- Recent errors table with filters
- Export functionality

### Analytics API

```typescript
// Get error metrics
const response = await fetch('/api/analytics/errors?range=24h');
const metrics = await response.json();
```

---

## Troubleshooting

### High Error Rate

```typescript
// 1. Check dashboard
// 2. Identify top error categories
// 3. Investigate top endpoints
// 4. Review system health
```

### Network Failures

```typescript
// 1. Check network status
if (!networkStatus.isOnline()) {
  showOfflineUI();
}

// 2. Monitor queue size
const queueSize = offlineQueue.getQueueSize();

// 3. Retry failed requests
await fetchWithRetry('/api/data');
```

### Database Errors

```typescript
// 1. Use safeDbOperation wrapper
await safeDbOperation(
  () => db.user.findMany(),
  'Get Users'
);

// 2. Check error category
if (error.category === ErrorCategory.DATABASE) {
  // Handle database error
}
```

### Payment Errors

```typescript
// 1. Use safePaymentOperation wrapper
await safePaymentOperation(
  () => stripeAPI.charge(amount, token),
  'Process Payment',
  { bookingId, userId }
);

// 2. Payment errors are CRITICAL by default
// Automatic alerts will be sent
```

---

## Best Practices

### ✅ DO

- Use `createApiHandler` wrappers for all API routes
- Use `fetchWithRetry` for all client requests
- Wrap async operations with `safeExecute` or specific wrappers
- Provide user-friendly error messages
- Log errors with context
- Monitor error dashboard regularly

### ❌ DON'T

- Use bare `fetch()` without retry logic
- Throw generic `Error()` objects
- Ignore error context
- Disable monitoring in production
- Hardcode retry configuration
- Suppress errors silently

---

## Common Error Messages

### Validation Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please check your input and try again.",
    "details": {
      "email": "Email is required",
      "password": "Password must be at least 8 characters"
    }
  }
}
```

### Authentication Error

```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Authentication failed. Please log in again."
  }
}
```

### Rate Limit Error

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again in 60 seconds."
  }
}
```

### Network Error

```json
{
  "success": false,
  "error": {
    "code": "NETWORK_ERROR",
    "message": "Unable to connect to the server. Please check your connection."
  }
}
```

---

## Testing

### Run Error Tests

```bash
npm run test:error-system
```

### Run Remediation Tests

```bash
npm run test:remediation
```

### Run Chaos Tests

```bash
npm run test:chaos
```

---

## Performance Tips

1. **Enable caching** for frequently accessed data
2. **Set appropriate rate limits** to prevent abuse
3. **Use monitoring** for critical endpoints
4. **Optimize queries** to reduce database load
5. **Monitor retry attempts** to identify failing services
6. **Check queue size** to prevent memory issues

---

## Support

### Documentation

- Full Documentation: `ERROR_HANDLING_SYSTEM_PHASE1_COMPLETE.md`
- API Setup Guide: `API-SETUP-GUIDE.md`
- Error Tests: `scripts/run-error-tests.js`

### Contacts

- **Architecture Team**: architecture@fly2any.com
- **DevOps Team**: devops@fly2any.com
- **Support Team**: support@fly2any.com

---

## Quick Command Reference

```bash
# Monitor errors (open dashboard)
open /admin/monitoring/errors

# Check error logs
tail -f logs/errors.log

# Run error tests
npm run test:error-system

# Check system health
curl /api/health
```

---

**Version**: 2.0.0  
**Last Updated**: January 11, 2026  
**Status**: Production-Ready ✅