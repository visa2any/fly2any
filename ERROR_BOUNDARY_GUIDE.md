# Error Boundary System - Implementation Guide

## Overview

The Fly2Any platform now includes a comprehensive, production-ready error boundary system that catches JavaScript errors, logs them to monitoring services, and displays user-friendly error UIs.

## Features

- **React Error Boundaries**: Catch errors in component trees
- **Three UI Variants**: Full-page, section, and inline error displays
- **Error Logging**: Centralized logging with Sentry preparation
- **Retry Functionality**: Allow users to recover from errors
- **Context Tracking**: Know where errors occurred
- **Development Mode**: Show detailed error info in development
- **Sensitive Data Filtering**: Automatically redact passwords, tokens, etc.
- **Unique Error IDs**: Track and reference specific errors

---

## File Structure

```
fly2any-fresh/
├── components/
│   └── ErrorBoundary.tsx          # Main error boundary component
├── lib/
│   └── errorLogger.ts             # Error logging utility
├── app/
│   ├── layout.tsx                 # Updated with root error boundary
│   └── api/
│       └── log-error/
│           └── route.ts           # API endpoint for error logging
└── ERROR_BOUNDARY_GUIDE.md        # This file
```

---

## Components

### 1. Main ErrorBoundary Component

**Location**: `components/ErrorBoundary.tsx`

The main React error boundary class component that catches errors in the component tree.

**Props**:
- `children`: React components to wrap
- `fallback`: Custom fallback UI (optional)
- `onError`: Callback when error occurs (optional)
- `variant`: UI style - 'full-page' | 'section' | 'inline' (default: 'section')
- `showDetails`: Show error details (default: false, auto-enabled in dev)
- `context`: String identifier for where the error occurred

### 2. Error UI Variants

#### Full Page Error
- Used for critical errors affecting the entire application
- Displays large error message with prominent call-to-action
- Includes "Try Again" and "Go to Homepage" buttons
- Best for: Root layout, critical page-level errors

#### Section Error
- Used for errors within a specific section of a page
- Shows contained error message within red border
- Includes "Retry" and "Refresh Page" buttons
- Best for: Search forms, result sections, widgets

#### Inline Error
- Compact error display for small components
- Minimal space, shows brief error message
- Single "Try again" link
- Best for: Form fields, small widgets, card components

---

## Usage Examples

### 1. Wrap Entire Application (Root Layout)

Already implemented in `app/layout.tsx`:

```tsx
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary
          variant="full-page"
          context="root-layout"
          showDetails={process.env.NODE_ENV === 'development'}
        >
          <GlobalLayout>
            {children}
          </GlobalLayout>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

### 2. Wrap Search Section

**File**: `app/page.tsx` or search components

```tsx
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function HomePage() {
  return (
    <div>
      {/* Other content */}

      <ErrorBoundary
        variant="section"
        context="flight-search"
        showDetails={false}
      >
        <FlightSearchForm />
      </ErrorBoundary>

      {/* Other content */}
    </div>
  );
}
```

### 3. Wrap Flight Results

**File**: `app/flights/page.tsx` or `components/flights/FlightResults.tsx`

```tsx
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function FlightResultsPage() {
  return (
    <ErrorBoundary
      variant="section"
      context="flight-results"
    >
      <FlightResults />
    </ErrorBoundary>
  );
}
```

### 4. Wrap Booking Flow

**File**: `app/flights/booking/page.tsx`

```tsx
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function BookingPage() {
  return (
    <ErrorBoundary
      variant="full-page"
      context="booking-checkout"
      onError={(error, errorInfo) => {
        // Custom handling for booking errors
        console.error('Booking error:', error);
      }}
    >
      <BookingCheckout />
    </ErrorBoundary>
  );
}
```

### 5. Wrap Payment Form

**File**: `components/booking/PaymentForm.tsx`

```tsx
import { ErrorBoundary } from "@/components/ErrorBoundary";

export function PaymentFormWrapper() {
  return (
    <ErrorBoundary
      variant="section"
      context="payment-form"
    >
      <StripePaymentForm />
    </ErrorBoundary>
  );
}
```

### 6. Wrap Small Widgets (Inline)

**File**: Any small component

```tsx
import { ErrorBoundary } from "@/components/ErrorBoundary";

export function PriceAlertWidget() {
  return (
    <ErrorBoundary
      variant="inline"
      context="price-alert-widget"
    >
      <PriceAlert />
    </ErrorBoundary>
  );
}
```

### 7. Custom Fallback UI

```tsx
import { ErrorBoundary } from "@/components/ErrorBoundary";

function CustomErrorUI() {
  return (
    <div className="text-center py-8">
      <h3>Oops! Something went wrong.</h3>
      <button onClick={() => window.location.reload()}>
        Reload Page
      </button>
    </div>
  );
}

export function MyComponent() {
  return (
    <ErrorBoundary
      fallback={<CustomErrorUI />}
      context="my-component"
    >
      <MyContent />
    </ErrorBoundary>
  );
}
```

---

## Error Logging

### Automatic Logging

Errors are automatically logged when caught by error boundaries. Each error receives:
- Unique error ID (format: `ERR-{timestamp}-{random}`)
- Error message and stack trace
- Component stack (React component tree)
- Browser metadata (URL, user agent, timestamp)
- Context information

### Manual Logging

**Import the logger**:

```tsx
import { logError, logWarning, logInfo, logFatal } from "@/lib/errorLogger";
```

**Log an error**:

```tsx
try {
  // Some code that might fail
  await bookFlight(flightData);
} catch (error) {
  const errorId = logError(error, {
    context: 'flight-booking',
    userId: user.id,
    flightId: flightData.id,
  });

  console.log('Error logged with ID:', errorId);
}
```

**Log a warning**:

```tsx
if (seats < 3) {
  logWarning('Low seat availability', {
    context: 'seat-selection',
    seatsRemaining: seats,
  });
}
```

**Create context-specific logger**:

```tsx
import { createContextLogger } from "@/lib/errorLogger";

const logger = createContextLogger('payment-processing');

// Use throughout the payment module
try {
  await processPayment(paymentData);
} catch (error) {
  logger.error(error, { amount: paymentData.amount });
}
```

---

## Critical Paths to Protect

### Priority 1: Must Have Error Boundaries

1. **Root Layout** ✅ (Already implemented)
   - File: `app/layout.tsx`
   - Variant: `full-page`
   - Context: `root-layout`

2. **Search Form**
   - File: `components/search/FlightSearchForm.tsx` or where it's used
   - Variant: `section`
   - Context: `flight-search`

3. **Flight Results**
   - File: `app/flights/page.tsx` or `components/flights/FlightResults.tsx`
   - Variant: `section`
   - Context: `flight-results`

4. **Booking Checkout**
   - File: `app/flights/booking/page.tsx`
   - Variant: `full-page`
   - Context: `booking-checkout`

5. **Payment Form**
   - File: `components/booking/PaymentForm.tsx` or `StripePaymentForm.tsx`
   - Variant: `section`
   - Context: `payment-form`

### Priority 2: Recommended

6. **Hotel Results**
   - File: `components/hotels/HotelResults.tsx`
   - Variant: `section`
   - Context: `hotel-results`

7. **Passenger Form**
   - File: `components/booking/PassengerDetailsForm.tsx`
   - Variant: `section`
   - Context: `passenger-form`

8. **Seat Selection**
   - File: `components/booking/SeatSelection.tsx`
   - Variant: `section`
   - Context: `seat-selection`

9. **Trip Match** (if applicable)
   - File: `app/tripmatch/page.tsx`
   - Variant: `full-page`
   - Context: `tripmatch`

10. **Blog Pages**
    - File: `app/blog/[slug]/page.tsx`
    - Variant: `section`
    - Context: `blog-article`

### Priority 3: Nice to Have

11. **Price Prediction Widget**
    - Variant: `inline`
    - Context: `price-prediction`

12. **Testimonials Section**
    - Variant: `section`
    - Context: `testimonials`

13. **Featured Routes**
    - Variant: `section`
    - Context: `featured-routes`

14. **Footer Components**
    - Variant: `inline`
    - Context: `footer-{component-name}`

---

## Integration with Sentry

The error logging system is prepared for Sentry integration. To enable:

### 1. Install Sentry

```bash
npm install @sentry/nextjs
```

### 2. Configure Sentry DSN

Add to `.env.local`:

```env
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

### 3. Uncomment Sentry Code

In `lib/errorLogger.ts`, uncomment the Sentry initialization and logging code:

```typescript
// Around line 67
if (config.enabled && config.sentryDsn && typeof window !== 'undefined') {
  try {
    import('@sentry/nextjs').then((Sentry) => {
      Sentry.init({
        dsn: config.sentryDsn,
        environment: config.environment,
        tracesSampleRate: 1.0,
      });
    });
  } catch (error) {
    console.error('[ErrorLogger] Failed to initialize Sentry:', error);
  }
}

// Around line 168
if (config.enabled && config.sentryDsn) {
  try {
    import('@sentry/nextjs').then((Sentry) => {
      Sentry.withScope((scope) => {
        scope.setLevel(severity);
        scope.setTag('errorId', errorId);
        Object.entries(filteredMetadata).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
        Sentry.captureException(errorObj);
      });
    });
  } catch (sentryError) {
    console.error('[ErrorLogger] Failed to send error to Sentry:', sentryError);
  }
}
```

### 4. Run Sentry Wizard (Optional)

```bash
npx @sentry/wizard@latest -i nextjs
```

---

## Testing Error Boundaries

### 1. Create a Test Error Component

```tsx
// components/TestError.tsx
'use client';

export function TestError() {
  const handleError = () => {
    throw new Error('Test error from button click');
  };

  return (
    <button onClick={handleError} className="bg-red-500 text-white px-4 py-2">
      Trigger Test Error
    </button>
  );
}
```

### 2. Wrap with Error Boundary

```tsx
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { TestError } from "@/components/TestError";

export default function TestPage() {
  return (
    <ErrorBoundary variant="section" context="test">
      <TestError />
    </ErrorBoundary>
  );
}
```

### 3. Test Different Variants

```tsx
<div className="space-y-8 p-8">
  {/* Full Page Error */}
  <ErrorBoundary variant="full-page" context="test-full-page">
    <TestError />
  </ErrorBoundary>

  {/* Section Error */}
  <ErrorBoundary variant="section" context="test-section">
    <TestError />
  </ErrorBoundary>

  {/* Inline Error */}
  <ErrorBoundary variant="inline" context="test-inline">
    <TestError />
  </ErrorBoundary>
</div>
```

---

## Best Practices

### 1. Granular Error Boundaries

Don't wrap the entire app in one boundary. Use multiple boundaries at different levels:

```tsx
// ✅ Good - Multiple boundaries
<ErrorBoundary variant="full-page">
  <Layout>
    <ErrorBoundary variant="section" context="search">
      <SearchForm />
    </ErrorBoundary>

    <ErrorBoundary variant="section" context="results">
      <Results />
    </ErrorBoundary>
  </Layout>
</ErrorBoundary>

// ❌ Bad - Single boundary for everything
<ErrorBoundary>
  <EntireApp />
</ErrorBoundary>
```

### 2. Use Descriptive Contexts

```tsx
// ✅ Good
<ErrorBoundary context="flight-search-form">

// ❌ Bad
<ErrorBoundary context="form">
```

### 3. Choose Appropriate Variants

- **Full Page**: Only for critical, page-level errors
- **Section**: For major sections and features
- **Inline**: For small components and widgets

### 4. Handle Async Errors

Error boundaries don't catch async errors. Handle them explicitly:

```tsx
async function searchFlights() {
  try {
    const results = await fetch('/api/flights');
    // ...
  } catch (error) {
    logError(error, { context: 'flight-search-api' });
    // Show error UI
  }
}
```

### 5. Don't Overuse

Not every component needs an error boundary. Use them strategically:
- At route/page boundaries
- Around critical features
- Around third-party integrations
- Around complex, error-prone components

### 6. Provide Recovery Options

Always give users a way to recover:
- Retry button
- Navigate to safe page
- Reload page
- Contact support

---

## Configuration

### Development Mode

Error details are automatically shown in development:

```tsx
<ErrorBoundary
  showDetails={process.env.NODE_ENV === 'development'}
>
```

### Production Mode

In production, error details are hidden but errors are still logged:
- Errors logged to `/api/log-error`
- Errors sent to Sentry (when configured)
- User sees friendly error message

### Custom Configuration

Customize error logging behavior:

```tsx
import { initErrorLogger } from "@/lib/errorLogger";

initErrorLogger({
  enabled: true,
  sentryDsn: 'your-sentry-dsn',
  environment: 'production',
  logToConsole: false,
  captureUnhandledRejections: true,
});
```

---

## API Endpoint

Error logs are sent to `/api/log-error` which can be extended to:

1. **Store in Database**: Save errors for analysis
2. **Send Alerts**: Notify team of critical errors
3. **Forward to Services**: Send to Datadog, Loggly, etc.
4. **Aggregate Stats**: Track error rates and patterns

**Implementation**: `app/api/log-error/route.ts`

---

## Monitoring and Analytics

### Error Metrics to Track

1. **Error Rate**: Errors per user session
2. **Error Types**: Most common error messages
3. **Error Locations**: Which contexts have most errors
4. **User Impact**: How many users affected
5. **Recovery Rate**: How many users retry successfully

### Using Error IDs

Every error gets a unique ID. Users can provide this ID to support:

```
Error ID: ERR-1699123456789-A1B2C3D
```

Search logs or Sentry with this ID to find the exact error.

---

## Troubleshooting

### Error Boundary Not Catching Errors

1. **Async Errors**: Error boundaries don't catch async/await errors. Handle them with try/catch.
2. **Event Handlers**: Errors in event handlers need try/catch.
3. **Server Components**: Error boundaries only work in client components ('use client').

### Error Not Being Logged

1. Check console for "[ErrorLogger]" messages
2. Verify `/api/log-error` endpoint is accessible
3. Check network tab for failed requests
4. Ensure `initErrorLogger()` was called

### Error Boundary Re-renders Constantly

1. Check if the error is in a useEffect or lifecycle method
2. Verify retry logic isn't causing infinite loops
3. Add error state to prevent repeated throws

---

## Migration Checklist

- [x] Create ErrorBoundary component
- [x] Create error logging utility
- [x] Create error log API endpoint
- [x] Wrap root layout
- [ ] Add to search form
- [ ] Add to flight results
- [ ] Add to booking flow
- [ ] Add to payment form
- [ ] Add to hotel results (if used)
- [ ] Add to seat selection
- [ ] Add to passenger form
- [ ] Configure Sentry (optional)
- [ ] Test all error boundaries
- [ ] Monitor error rates in production

---

## Support

For questions or issues with the error boundary system:

1. Check this documentation
2. Review error logs in console (dev) or Sentry (prod)
3. Test with the TestError component
4. Contact the development team

---

## Future Enhancements

Potential improvements to consider:

1. **Error Recovery Strategies**: Automatic retry with exponential backoff
2. **Error Grouping**: Group similar errors to reduce noise
3. **User Feedback**: Allow users to report additional context
4. **Error Predictions**: ML to predict and prevent errors
5. **Performance Monitoring**: Track performance impact of error boundaries
6. **A/B Testing**: Test different error UI variants
7. **Offline Support**: Handle offline errors gracefully
8. **Error Replay**: Record user actions leading to error (like LogRocket)

---

**Last Updated**: November 2, 2025
**Version**: 1.0.0
**Maintainer**: Fly2Any Engineering Team
