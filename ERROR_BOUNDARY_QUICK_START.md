# Error Boundary Quick Start

## 5-Minute Setup Guide

### 1. Import the Component

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';
```

### 2. Wrap Your Component

```tsx
<ErrorBoundary variant="section" context="my-component">
  <MyComponent />
</ErrorBoundary>
```

### 3. Choose the Right Variant

| Variant | Use Case | Example |
|---------|----------|---------|
| `full-page` | Critical page-level errors | Root layout, booking page |
| `section` | Major sections/features | Search form, results, payment |
| `inline` | Small widgets/components | Price alerts, badges, cards |

---

## Common Patterns

### Pattern 1: Wrap a Page

```tsx
// app/booking/page.tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function BookingPage() {
  return (
    <ErrorBoundary variant="full-page" context="booking">
      <BookingContent />
    </ErrorBoundary>
  );
}
```

### Pattern 2: Wrap a Section

```tsx
// In any component
<ErrorBoundary variant="section" context="flight-results">
  <FlightResults />
</ErrorBoundary>
```

### Pattern 3: Wrap Multiple Sections

```tsx
<div>
  <ErrorBoundary variant="section" context="search">
    <SearchForm />
  </ErrorBoundary>

  <ErrorBoundary variant="section" context="results">
    <Results />
  </ErrorBoundary>
</div>
```

### Pattern 4: Inline Widget

```tsx
<ErrorBoundary variant="inline" context="price-alert">
  <PriceAlert />
</ErrorBoundary>
```

---

## Manual Error Logging

```tsx
import { logError } from '@/lib/errorLogger';

try {
  await someAsyncOperation();
} catch (error) {
  const errorId = logError(error, {
    context: 'my-operation',
    userId: user.id,
  });
  console.log('Error ID:', errorId);
}
```

---

## Where to Add Error Boundaries

### Must Have (Priority 1)
- ✅ Root layout (`app/layout.tsx`) - Already done!
- [ ] Flight search form
- [ ] Flight results page
- [ ] Booking checkout page
- [ ] Payment form

### Recommended (Priority 2)
- [ ] Hotel results
- [ ] Passenger form
- [ ] Seat selection
- [ ] Trip match page

### Nice to Have (Priority 3)
- [ ] Price prediction widget
- [ ] Testimonials section
- [ ] Featured routes

---

## Testing

Create a test page to verify error boundaries work:

```tsx
// app/test-errors/page.tsx
'use client';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { TestError } from '@/components/TestError';

export default function TestPage() {
  return (
    <div className="p-8 space-y-8">
      <h1>Error Boundary Test</h1>

      <ErrorBoundary variant="section" context="test">
        <TestError />
      </ErrorBoundary>
    </div>
  );
}
```

Visit `/test-errors` and click "Trigger Error" to test.

---

## Configuration

### Show Details in Development

```tsx
<ErrorBoundary
  showDetails={process.env.NODE_ENV === 'development'}
>
```

### Custom Error Handler

```tsx
<ErrorBoundary
  onError={(error, errorInfo) => {
    console.error('Custom handling:', error);
  }}
>
```

### Custom Fallback UI

```tsx
<ErrorBoundary
  fallback={<div>Custom error message</div>}
>
```

---

## Next Steps

1. Add error boundaries to critical paths (see list above)
2. Test error boundaries work correctly
3. Configure Sentry (optional) - see main guide
4. Monitor error rates in production

**Full Documentation**: See `ERROR_BOUNDARY_GUIDE.md`

**Examples**: See `components/ErrorBoundaryExamples.tsx`

**Test Component**: See `components/TestError.tsx`
