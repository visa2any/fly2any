# Error Handling - Quick Reference

## Common Patterns

### 1. Wrap Component with Error Boundary

```tsx
import { ApiErrorBoundary } from '@/lib/errors';

<ApiErrorBoundary>
  <FlightResults />
</ApiErrorBoundary>
```

### 2. Show Inline Error Alert

```tsx
import { ErrorAlert } from '@/lib/errors';

{error && (
  <ErrorAlert
    type="error"
    message={error}
    closeable
    onClose={() => setError(null)}
  />
)}
```

### 3. Show Toast Notification

```tsx
import { useToast } from '@/lib/errors';

const { toast, showToast } = useToast();

showToast({
  type: 'success',
  message: 'Saved successfully!',
});

return <>{toast}</>;
```

### 4. API Call with Retry

```tsx
import { withRetry } from '@/lib/errors';

const data = await withRetry(
  () => fetch('/api/flights').then(r => r.json())
);
```

### 5. Handle API Error

```tsx
import { handleApiError } from '@/lib/errors';

try {
  await apiCall();
} catch (error) {
  const apiError = handleApiError(error);
  setError(apiError.message); // User-friendly message
}
```

### 6. Database Call with Retry

```tsx
import { withDatabaseRetry } from '@/lib/errors';

const user = await withDatabaseRetry(
  () => prisma.user.findUnique({ where: { id } })
);
```

### 7. Check Missing Credentials

```tsx
import { requireCredentials } from '@/lib/errors';

const check = requireCredentials(['AMADEUS_API_KEY']);
if (!check.configured) {
  return NextResponse.json(check.response, { status: 503 });
}
```

### 8. Use Fallback Data

```tsx
import { getFallbackData, saveFallbackData } from '@/lib/errors';

// Save data
saveFallbackData('user', userData);

// Get fallback if DB fails
try {
  const user = await fetchUser();
} catch {
  const user = getFallbackData('user', defaultUser);
}
```

---

## Error Messages

### What Users See (Production)

- "We're having trouble connecting. Please try again."
- "Flight search temporarily unavailable. Our team is working on it!"
- "Account features unavailable. You can still search without signing in."
- "Unable to complete booking. Please contact support."

### What Developers See (Dev Mode)

- "DATABASE_URL not configured. Add to .env.local"
- "AMADEUS_API_KEY missing. Flight search will fail."
- "Redis not configured. Caching disabled."
- Full error stack traces
- Retry information

---

## Component Props Reference

### ErrorAlert

```tsx
<ErrorAlert
  type="error" | "warning" | "info" | "success"
  title="Optional Title"
  message="Required message"
  closeable={true}
  onClose={() => {}}
  className="custom-class"
/>
```

### ErrorToast

```tsx
const { toast, showToast } = useToast();

showToast({
  type: "error" | "warning" | "info" | "success",
  title: "Optional Title",
  message: "Required message",
  duration: 5000, // ms
  position: "top-right" | "top-center" | "bottom-right" // etc.
});
```

### ErrorPage

```tsx
<ErrorPage
  title="Page Not Found"
  message="The page doesn't exist."
  statusCode={404}
  showRefresh={true}
  showHome={true}
  showBack={false}
  onRefresh={() => {}}
/>
```

---

## API Route Error Handling

### Basic Pattern

```tsx
import { requireCredentials, handleApiError } from '@/lib/errors';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Check credentials
    const check = requireCredentials(['AMADEUS_API_KEY']);
    if (!check.configured) {
      return NextResponse.json(check.response, { status: 503 });
    }

    // Make API call
    const data = await fetchData();
    return NextResponse.json(data);

  } catch (error: any) {
    const apiError = handleApiError(error);

    return NextResponse.json({
      error: apiError.error,
      message: apiError.message,
      ...(process.env.NODE_ENV === 'development' && {
        devMessage: apiError.devMessage
      })
    }, { status: apiError.statusCode });
  }
}
```

---

## Troubleshooting Commands

### Check all credentials

```bash
# Visit in browser (dev mode only)
http://localhost:3000/api/debug/credentials
```

### Fix missing DATABASE_URL

```bash
# 1. Add to .env.local
echo 'DATABASE_URL="postgresql://user:pass@localhost:5432/fly2any"' >> .env.local

# 2. Generate Prisma client
npx prisma generate

# 3. Push schema
npx prisma db push

# 4. Restart server
```

### Fix missing API keys

```bash
# 1. Get keys from https://developers.amadeus.com/
# 2. Add to .env.local
echo 'AMADEUS_API_KEY=your_key' >> .env.local
echo 'AMADEUS_API_SECRET=your_secret' >> .env.local

# 3. Restart server
```

### Check database connection

```bash
# Test connection
psql $DATABASE_URL

# Check if PostgreSQL is running
pg_isready

# Restart PostgreSQL
brew services restart postgresql  # Mac
sudo service postgresql restart   # Linux
```

---

## Import Cheatsheet

```tsx
// All-in-one import
import {
  // Boundaries
  GlobalErrorBoundary,
  ApiErrorBoundary,
  DatabaseErrorBoundary,

  // Display Components
  ErrorAlert,
  ErrorPage,
  ErrorToast,
  useToast,

  // API Handlers
  withRetry,
  handleApiError,
  ApiError,

  // Database Handlers
  withDatabaseRetry,
  handleDatabaseError,
  DatabaseError,
  getFallbackData,
  saveFallbackData,

  // Credentials
  checkAllCredentials,
  requireCredentials,
  getMissingCredentials,

} from '@/lib/errors';
```

---

## Environment Variables Checklist

### Required (App won't work without these)

- [ ] `AMADEUS_API_KEY` - Flight search API key
- [ ] `AMADEUS_API_SECRET` - Flight search API secret

### Optional (Features will gracefully degrade)

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NEXTAUTH_SECRET` - Authentication secret
- [ ] `NEXTAUTH_URL` - Auth callback URL
- [ ] `GOOGLE_CLIENT_ID` - Google OAuth
- [ ] `GOOGLE_CLIENT_SECRET` - Google OAuth secret

---

## Status Codes

### Handled Automatically

- `400` - Bad Request → "Invalid request. Check your search criteria."
- `401` - Unauthorized → "You need to sign in."
- `403` - Forbidden → "You don't have permission."
- `404` - Not Found → "Information not found."
- `408` - Timeout → "Request took too long." (RETRIES)
- `429` - Rate Limit → "Too many requests." (RETRIES)
- `500` - Server Error → "Technical difficulties." (RETRIES)
- `502` - Bad Gateway → "Service unavailable." (RETRIES)
- `503` - Unavailable → "Temporarily down." (RETRIES)
- `504` - Gateway Timeout → "Connection timed out." (RETRIES)

### Retry Behavior

- **Retryable errors:** 408, 429, 500+
- **Max retries:** 3 attempts
- **Backoff:** Exponential with jitter
- **Initial delay:** 1 second
- **Max delay:** 10 seconds

---

For complete documentation, see: `docs/ERROR_HANDLING_GUIDE.md`
