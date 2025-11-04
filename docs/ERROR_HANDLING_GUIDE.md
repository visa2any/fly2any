# Error Handling System - Developer Guide

## Overview

This comprehensive error handling system provides graceful degradation, user-friendly error messages, and robust error recovery throughout the application.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Error Boundaries](#error-boundaries)
3. [Error Display Components](#error-display-components)
4. [API Error Handling](#api-error-handling)
5. [Database Error Handling](#database-error-handling)
6. [Missing Credentials Handling](#missing-credentials-handling)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Installation

All error handling components are already installed. Just import what you need:

```typescript
import {
  GlobalErrorBoundary,
  ApiErrorBoundary,
  DatabaseErrorBoundary,
  ErrorAlert,
  ErrorPage,
  ErrorToast,
  useToast,
  withRetry,
  handleApiError
} from '@/lib/errors';
```

### Basic Usage

**Wrap your app with error boundaries:**

```tsx
// app/layout.tsx
import { GlobalErrorBoundary } from '@/lib/errors';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <GlobalErrorBoundary>
          {children}
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}
```

**Show inline error messages:**

```tsx
import { ErrorAlert } from '@/lib/errors';

function MyComponent() {
  const [error, setError] = useState(null);

  return (
    <>
      {error && (
        <ErrorAlert
          type="error"
          title="Connection Failed"
          message={error}
          closeable
          onClose={() => setError(null)}
        />
      )}
    </>
  );
}
```

**Use toast notifications:**

```tsx
import { useToast } from '@/lib/errors';

function MyComponent() {
  const { toast, showToast } = useToast();

  const handleAction = async () => {
    try {
      await someAction();
      showToast({
        type: 'success',
        title: 'Success!',
        message: 'Action completed successfully',
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Action Failed',
        message: 'Please try again',
      });
    }
  };

  return (
    <>
      {toast}
      <button onClick={handleAction}>Do Something</button>
    </>
  );
}
```

---

## Error Boundaries

### GlobalErrorBoundary

Catches all unhandled React errors at the app level.

**Features:**
- User-friendly error messages (no technical jargon)
- Automatic error logging
- Recovery options (refresh, go home)
- Developer info in development mode

**Usage:**

```tsx
import { GlobalErrorBoundary } from '@/lib/errors';

<GlobalErrorBoundary>
  <YourApp />
</GlobalErrorBoundary>
```

**Custom Fallback:**

```tsx
<GlobalErrorBoundary
  fallback={
    <div>Custom error page</div>
  }
>
  <YourApp />
</GlobalErrorBoundary>
```

### ApiErrorBoundary

Handles API-related errors with automatic retry logic.

**Features:**
- Detects network/API failures
- Automatic retry with exponential backoff
- User-friendly API error messages
- Max 3 retry attempts

**Usage:**

```tsx
import { ApiErrorBoundary } from '@/lib/errors';

<ApiErrorBoundary>
  <FlightResults />
</ApiErrorBoundary>
```

**With Custom Handler:**

```tsx
<ApiErrorBoundary
  onError={(error, errorInfo) => {
    console.log('API error occurred:', error);
  }}
>
  <FlightResults />
</ApiErrorBoundary>
```

### DatabaseErrorBoundary

Handles database and Prisma errors gracefully.

**Features:**
- Detects Prisma/database errors
- User-friendly database error messages
- Fallback content for unavailable features
- Developer hints for missing DATABASE_URL

**Usage:**

```tsx
import { DatabaseErrorBoundary } from '@/lib/errors';

<DatabaseErrorBoundary>
  <UserAccount />
</DatabaseErrorBoundary>
```

---

## Error Display Components

### ErrorAlert

Inline alert for displaying errors, warnings, info, or success messages.

**Props:**
- `type`: 'error' | 'warning' | 'info' | 'success' (default: 'error')
- `title`: Optional title
- `message`: Alert message (required)
- `closeable`: Show close button (default: false)
- `onClose`: Callback when closed
- `className`: Additional CSS classes

**Example:**

```tsx
<ErrorAlert
  type="error"
  title="Upload Failed"
  message="File size exceeds 10MB limit"
  closeable
  onClose={() => setError(null)}
/>
```

### ErrorPage

Full-page error display for critical errors.

**Props:**
- `title`: Error title (default: "Something went wrong")
- `message`: Error message
- `statusCode`: HTTP status code (optional)
- `showRefresh`: Show refresh button (default: true)
- `showHome`: Show home button (default: true)
- `showBack`: Show back button (default: false)
- `onRefresh`: Custom refresh handler

**Example:**

```tsx
<ErrorPage
  title="Page Not Found"
  message="The page you're looking for doesn't exist."
  statusCode={404}
  showHome
  showBack
/>
```

### ErrorToast

Toast notification for temporary error/success messages.

**Props:**
- `type`: 'error' | 'warning' | 'info' | 'success' (default: 'error')
- `title`: Optional title
- `message`: Toast message (required)
- `duration`: Auto-dismiss duration in ms (default: 5000)
- `position`: Toast position (default: 'top-right')
- `onClose`: Callback when closed

**Example:**

```tsx
import { useToast } from '@/lib/errors';

function MyComponent() {
  const { toast, showToast } = useToast();

  const handleError = () => {
    showToast({
      type: 'error',
      title: 'Error',
      message: 'Something went wrong',
      duration: 5000,
    });
  };

  return (
    <>
      {toast}
      <button onClick={handleError}>Show Error</button>
    </>
  );
}
```

---

## API Error Handling

### withRetry

Executes an API call with automatic retry logic.

**Features:**
- Exponential backoff
- Configurable max retries
- Respects Retry-After headers
- Only retries on retryable errors (408, 429, 500+)

**Example:**

```tsx
import { withRetry } from '@/lib/errors';

const data = await withRetry(
  () => fetch('/api/flights').then(r => r.json()),
  {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    onRetry: (attempt, error) => {
      console.log(`Retry attempt ${attempt}:`, error);
    }
  }
);
```

### handleApiError

Converts any error into a standardized ApiErrorResponse.

**Example:**

```tsx
import { handleApiError } from '@/lib/errors';

try {
  const response = await fetch('/api/flights');
  if (!response.ok) throw new Error('API error');
  return await response.json();
} catch (error) {
  const apiError = handleApiError(error);
  console.log('User message:', apiError.message);
  console.log('Developer message:', apiError.devMessage);
  console.log('Retryable:', apiError.retryable);
}
```

### Error Messages

**User sees (production):**
- "We're having trouble connecting. Please try again in a moment."
- "Service temporarily unavailable. Please try again later."
- "You need to sign in to access this feature."

**Developer sees (development):**
- Full error stack trace
- HTTP status code
- Retry information
- Original error details

---

## Database Error Handling

### withDatabaseRetry

Executes database operations with retry logic.

**Example:**

```tsx
import { withDatabaseRetry } from '@/lib/errors';
import { prisma } from '@/lib/prisma';

const user = await withDatabaseRetry(
  () => prisma.user.findUnique({ where: { id: userId } }),
  3, // maxRetries
  1000 // initialDelay in ms
);
```

### handleDatabaseError

Converts Prisma errors into user-friendly messages.

**Example:**

```tsx
import { handleDatabaseError } from '@/lib/errors';

try {
  await prisma.user.create({ data: { email: 'test@example.com' } });
} catch (error) {
  const dbError = handleDatabaseError(error);
  console.log('User message:', dbError.userMessage);
  console.log('Prisma code:', dbError.code);
  console.log('Retryable:', dbError.retryable);
}
```

### Fallback Data

When database is unavailable, use fallback data from localStorage:

```tsx
import { getFallbackData, saveFallbackData } from '@/lib/errors';

// Save user data as fallback
saveFallbackData('user', userData);

// Retrieve fallback data if database fails
try {
  const user = await prisma.user.findUnique({ where: { id } });
} catch (error) {
  const user = getFallbackData('user', { id: null, name: 'Guest' });
}
```

### Check Database Health

```tsx
import { checkDatabaseHealth } from '@/lib/errors';

const health = await checkDatabaseHealth();
console.log('Healthy:', health.healthy);
console.log('Message:', health.message);
console.log('Latency:', health.latency);
```

---

## Missing Credentials Handling

### Check Credentials

```tsx
import {
  checkAllCredentials,
  getMissingCredentials,
  areRequiredCredentialsConfigured
} from '@/lib/errors';

// Check all credentials
const allChecks = checkAllCredentials();
console.log('All configured:', allChecks.every(c => c.configured));

// Get missing credentials
const missing = getMissingCredentials();
missing.forEach(check => {
  console.log('Missing:', check.name);
  console.log('Feature affected:', check.feature);
  console.log('User message:', check.userMessage);
  console.log('Dev hint:', check.devHint);
});

// Check if required credentials are configured
if (!areRequiredCredentialsConfigured()) {
  console.error('Required credentials missing!');
}
```

### Require Credentials in API Route

```tsx
import { requireCredentials } from '@/lib/errors';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Check if credentials are configured
  const check = requireCredentials(['AMADEUS_API_KEY', 'AMADEUS_API_SECRET']);

  if (!check.configured) {
    return NextResponse.json(check.response, { status: 503 });
  }

  // Continue with API call...
}
```

### Get User-Friendly Messages

```tsx
import { getUserMessage, getDevHint } from '@/lib/errors';

// User sees:
const userMsg = getUserMessage('Flight Search');
// "Flight search is temporarily unavailable. Our team is working on it!"

// Developer sees (dev mode only):
const devMsg = getDevHint('Flight Search');
// "Add AMADEUS_API_KEY to your .env.local file. Get your key from..."
```

---

## Troubleshooting

### Missing DATABASE_URL

**Symptom:** "Account features unavailable" error

**Solution:**
1. Create a `.env.local` file in the project root
2. Add: `DATABASE_URL="postgresql://user:password@localhost:5432/fly2any"`
3. Run: `npx prisma generate`
4. Run: `npx prisma db push`

### Missing API Keys

**Symptom:** "Flight search temporarily unavailable" error

**Solution:**
1. Sign up at https://developers.amadeus.com/
2. Create a new app to get API key and secret
3. Add to `.env.local`:
   ```
   AMADEUS_API_KEY=your_key_here
   AMADEUS_API_SECRET=your_secret_here
   ```
4. Restart the development server

### Database Connection Errors

**Symptom:** "Unable to connect to the database" error

**Solution:**
1. Check if PostgreSQL is running: `pg_isready`
2. Verify DATABASE_URL format is correct
3. Test connection: `psql $DATABASE_URL`
4. Check firewall settings
5. Restart database: `brew services restart postgresql` (Mac) or `sudo service postgresql restart` (Linux)

### API Rate Limit Errors

**Symptom:** "Too many requests" error

**Solution:**
- The system automatically retries with exponential backoff
- Wait 1-5 minutes before retrying manually
- Consider implementing caching to reduce API calls
- Upgrade your API plan if needed

### Debugging Tips

**Enable verbose error logging:**

```tsx
// In development, errors are automatically logged with full details
if (process.env.NODE_ENV === 'development') {
  console.log('Full error:', error);
}
```

**Check configuration status:**

```tsx
import { getConfigurationReport } from '@/lib/errors';

const report = getConfigurationReport();
console.log('All configured:', report.allConfigured);
console.log('Required configured:', report.requiredConfigured);
console.log('Missing:', report.missing);
console.log('Configured:', report.configured);
```

**Create a debug API endpoint:**

```tsx
// app/api/debug/credentials/route.ts
import { getConfigurationReport } from '@/lib/errors';
import { NextResponse } from 'next/server';

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const report = getConfigurationReport();
  return NextResponse.json(report);
}
```

Then visit: `http://localhost:3000/api/debug/credentials`

---

## Best Practices

1. **Always wrap API calls with error handling:**
   ```tsx
   try {
     const data = await withRetry(() => fetchData());
   } catch (error) {
     const apiError = handleApiError(error);
     showToast({ type: 'error', message: apiError.message });
   }
   ```

2. **Use appropriate error boundaries:**
   - `GlobalErrorBoundary` at app level
   - `ApiErrorBoundary` around API-dependent components
   - `DatabaseErrorBoundary` around user account features

3. **Provide fallback data when possible:**
   ```tsx
   try {
     const user = await fetchUser();
   } catch (error) {
     const user = getFallbackData('user', defaultUser);
   }
   ```

4. **Show user-friendly messages:**
   - Never expose technical errors to users
   - Provide actionable next steps
   - Use dev hints in development mode only

5. **Log errors for monitoring:**
   ```tsx
   catch (error) {
     logApiError(error, { userId, action: 'search' });
     // Show user-friendly message to user
   }
   ```

---

## Support

For additional help:
- Check the error message's dev hint (development mode only)
- Review the troubleshooting section above
- Contact: support@fly2any.com
