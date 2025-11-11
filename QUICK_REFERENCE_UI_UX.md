# UI/UX Quick Reference Guide

Quick reference for using the new UI/UX components in Fly2Any.

---

## Error Handling

```tsx
import { ErrorState, getErrorType } from '@/components/common/ErrorState';

// Automatic error type detection
<ErrorState
  error={error}
  type={getErrorType(error)}
  onRetry={() => refetch()}
/>

// Manual error type
<ErrorState
  error="Connection failed"
  type="network"
  onRetry={() => refetch()}
/>
```

**Error Types:** `network`, `api`, `timeout`, `validation`, `generic`

---

## Empty States

```tsx
import { NoFlightsFound } from '@/components/common/EmptyState';

// Preset: No flight results
<NoFlightsFound onModifySearch={() => scrollToTop()} />
```

```tsx
import { EmptyState } from '@/components/common/EmptyState';

// Custom empty state
<EmptyState
  icon="🎯"
  title="No Items Found"
  message="Start by adding your first item."
  suggestions={[
    'Try different search terms',
    'Check your filters',
    'Browse popular categories'
  ]}
  action={{
    label: 'Search Again',
    onClick: () => navigate('/search')
  }}
/>
```

---

## Loading States

```tsx
import { SearchLoadingState } from '@/components/common/LoadingStates';

// Flight search loading (with progress)
<SearchLoadingState message="Searching..." showProgress={true} />

// Simple spinner
<LoadingState message="Loading..." />

// Skeleton screens
<FlightCardSkeleton delay={0} />
<TableSkeleton rows={5} />
<CardGridSkeleton cards={6} />
```

---

## Toast Notifications

```tsx
import { useToast } from '@/components/common/Toast';

function MyComponent() {
  const toast = useToast();

  // Success
  toast.success('Flight booked!', 'Success');

  // Error
  toast.error('Payment failed', 'Error');

  // Warning
  toast.warning('Session expiring soon');

  // Info
  toast.info('New features available');

  // With action button
  toast.success('Booking confirmed', 'Success', {
    action: {
      label: 'View Details',
      onClick: () => navigate('/booking')
    }
  });
}
```

**Setup (one-time):**
```tsx
// app/layout.tsx
import { ToastProvider } from '@/components/common/Toast';

<ToastProvider>
  {children}
</ToastProvider>
```

---

## Retry Logic

```tsx
import { retryWithExponentialBackoff } from '@/lib/utils/retry';

// Basic retry
const data = await retryWithExponentialBackoff(
  () => fetchData(),
  { maxRetries: 3, initialDelay: 1000 }
);

// With callback
const data = await retryWithExponentialBackoff(
  () => fetchData(),
  {
    maxRetries: 3,
    onRetry: (attempt, error) => {
      console.log(`Retry ${attempt}:`, error.message);
      toast.warning(`Retrying... (${attempt}/3)`);
    }
  }
);
```

```tsx
import { fetchWithRetry } from '@/lib/utils/retry';

// Fetch with auto-retry
const response = await fetchWithRetry(
  '/api/flights',
  { method: 'POST', body: JSON.stringify(data) },
  { maxRetries: 3 }
);
```

---

## Buttons

```tsx
import { Button } from '@/components/ui/Button';

// Primary (main actions)
<Button variant="primary">Search Flights</Button>

// Secondary (alternative actions)
<Button variant="secondary">View Details</Button>

// Outline (subtle actions)
<Button variant="outline">Cancel</Button>

// Ghost (minimal actions)
<Button variant="ghost">Learn More</Button>

// Danger (destructive actions)
<Button variant="danger">Delete</Button>

// With loading state
<Button loading={isLoading}>Submit</Button>

// With icon
<Button icon={<Search />} iconPosition="left">
  Search
</Button>
```

---

## CSS Utility Classes

```tsx
// Button hover effect
<button className="btn-hover-lift">Click Me</button>

// Standard card
<div className="card-standard card-hover">
  Content
</div>

// Spacing
<section className="spacing-section">
  <div className="spacing-component">
    <p className="spacing-element">Text</p>
  </div>
</section>

// Animations
<div className="animate-fadeIn">Fade in</div>
<div className="animate-slideIn">Slide in</div>
<div className="animate-scaleIn">Scale in</div>

// Loading skeleton
<div className="skeleton-shimmer h-4 rounded" />

// Form states
<input className="focus-primary" />
<input className="error-input" />
<input className="success-input" />
```

---

## Common Patterns

### API Call with Full Error Handling

```tsx
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<Error | null>(null);
const toast = useToast();

const fetchData = async () => {
  setLoading(true);
  setError(null);

  try {
    const response = await fetchWithRetry('/api/data', {}, {
      maxRetries: 3,
      onRetry: (attempt) => {
        toast.warning(`Retrying... (${attempt}/3)`);
      }
    });
    const result = await response.json();
    setData(result);
    toast.success('Data loaded successfully');
  } catch (err) {
    setError(err as Error);
    toast.error('Failed to load data');
  } finally {
    setLoading(false);
  }
};

// In render
if (error) return <ErrorState error={error} type={getErrorType(error)} onRetry={fetchData} />;
if (loading) return <LoadingState message="Loading data..." />;
if (!data) return <EmptyState title="No Data" message="Start by fetching data" />;
```

### Search Results Page

```tsx
<FlightResults
  offers={flights}
  isLoading={loading}
  error={error}
  onRetry={() => searchFlights()}
  onModifySearch={() => scrollTo(0)}
  onSelectFlight={handleSelect}
  lang="en"
/>
```

### Form Submission

```tsx
const handleSubmit = async (formData) => {
  try {
    await submitForm(formData);
    toast.success('Form submitted successfully!');
    navigate('/success');
  } catch (error) {
    toast.error('Submission failed. Please try again.');
  }
};
```

---

## Timeout Pattern

```tsx
const [searchTimeout, setSearchTimeout] = useState(false);

useEffect(() => {
  if (isSearching) {
    const timer = setTimeout(() => {
      setSearchTimeout(true);
      toast.warning('Search is taking longer than expected');
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  }
  setSearchTimeout(false);
}, [isSearching]);

// Show timeout UI
{searchTimeout && (
  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
    <p className="text-yellow-800">
      Search is taking longer than usual. This might be due to:
    </p>
    <ul className="list-disc ml-6 mt-2 text-yellow-700">
      <li>High search volume</li>
      <li>Complex route</li>
      <li>API response delays</li>
    </ul>
    <Button onClick={retrySearch} variant="outline" className="mt-3">
      Retry Search
    </Button>
  </div>
)}
```

---

## Component Import Map

```tsx
// Error handling
import { ErrorState, getErrorType } from '@/components/common/ErrorState';

// Empty states
import { EmptyState, NoFlightsFound, NoSavedSearches, NoPriceAlerts } from '@/components/common/EmptyState';

// Loading states
import { LoadingState, SearchLoadingState, FlightCardSkeleton, TableSkeleton } from '@/components/common/LoadingStates';

// Toasts
import { useToast, ToastProvider } from '@/components/common/Toast';

// Retry
import { retryWithExponentialBackoff, fetchWithRetry, retryConditions } from '@/lib/utils/retry';

// UI components
import { Button } from '@/components/ui/Button';
```

---

## Accessibility Checklist

- [ ] Error states have `role="alert"`
- [ ] Loading states have `aria-live="polite"`
- [ ] Buttons have clear labels
- [ ] Focus indicators visible
- [ ] Keyboard navigation works
- [ ] Screen reader announcements clear
- [ ] Color contrast meets WCAG AA
- [ ] Touch targets ≥44x44px

---

## Performance Tips

1. **Use skeleton screens** for content with known layout
2. **Debounce search inputs** to reduce API calls
3. **Implement timeout** for operations >3 seconds
4. **Use retry logic** for transient failures
5. **Show immediate feedback** (<100ms) for user actions

---

## Browser Support

✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+

---

## Need Help?

- **Full Documentation:** `UI_UX_IMPROVEMENTS.md`
- **Component Examples:** Check source file JSDoc
- **Issues:** Create GitHub issue with component name
- **Questions:** Contact UI/UX team

---

**Last Updated:** 2025-11-10
