# Loading States - Quick Reference

## Import Everything You Need

```tsx
// Skeleton screens
import {
  FlightCardSkeleton,
  HotelCardSkeleton,
  BookingFormSkeleton,
  SearchBarSkeleton,
} from '@/components/skeletons';

// Loading indicators
import {
  LoadingSpinner,
  LoadingOverlay,
  LoadingBar,
  PulseLoader,
  PrimaryButton,
  SecondaryButton,
} from '@/components/loading';
```

---

## Quick Copy-Paste Examples

### 1. Page Loading with Skeleton

```tsx
function MyPage() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return (
      <>
        <LoadingBar isLoading={true} color="primary" />
        <div className="space-y-4">
          <FlightCardSkeleton />
          <FlightCardSkeleton />
          <FlightCardSkeleton />
        </div>
      </>
    );
  }

  return <ActualContent />;
}
```

### 2. Button with Loading State

```tsx
<PrimaryButton
  isLoading={isSubmitting}
  loadingText="Submitting..."
  onClick={handleSubmit}
  size="large"
  fullWidth
>
  Submit Form
</PrimaryButton>
```

### 3. Payment Processing

```tsx
import { PaymentLoadingOverlay } from '@/components/loading';

<PaymentLoadingOverlay isOpen={isProcessing} />
```

### 4. Inline Loading

```tsx
<div className="flex items-center gap-2">
  <PulseLoader color="primary" size="medium" />
  <span>Loading data...</span>
</div>
```

### 5. Hotel Results Loading

```tsx
if (loading) {
  return (
    <>
      <LoadingBar isLoading={true} color="orange" />
      <MultipleHotelCardSkeletons count={5} />
    </>
  );
}
```

---

## Component Cheat Sheet

| Component | Use Case | Props |
|-----------|----------|-------|
| `LoadingSpinner` | Quick actions | `size`, `color` |
| `LoadingOverlay` | Full-screen blocking | `isOpen`, `message` |
| `LoadingBar` | Page transitions | `isLoading`, `color` |
| `PulseLoader` | Inline loading | `size`, `color`, `count` |
| `ButtonLoading` | Buttons with loading | `isLoading`, `loadingText` |
| `FlightCardSkeleton` | Flight results | - |
| `HotelCardSkeleton` | Hotel results | - |
| `BookingFormSkeleton` | Booking forms | - |

---

## Common Patterns

### Pattern 1: Search Results

```tsx
const [loading, setLoading] = useState(true);
const [results, setResults] = useState([]);

useEffect(() => {
  search().then(data => {
    setResults(data);
    setLoading(false);
  });
}, [query]);

if (loading) return <MultipleFlightCardSkeletons count={6} />;
return <Results data={results} />;
```

### Pattern 2: Form Submission

```tsx
const [submitting, setSubmitting] = useState(false);

const handleSubmit = async () => {
  setSubmitting(true);
  try {
    await api.submit(data);
  } finally {
    setSubmitting(false);
  }
};

return (
  <PrimaryButton
    isLoading={submitting}
    loadingText="Submitting..."
    onClick={handleSubmit}
  >
    Submit
  </PrimaryButton>
);
```

### Pattern 3: Multi-Step Process

```tsx
const [step, setStep] = useState(1);
const [processing, setProcessing] = useState(false);

return (
  <>
    {processing && <LoadingBar isLoading={true} color="primary" />}

    <StepIndicator current={step} total={3} />

    {step === 1 && <StepOne />}
    {step === 2 && <StepTwo />}
    {step === 3 && <StepThree />}

    <PrimaryButton
      isLoading={processing}
      onClick={handleNext}
    >
      Next
    </PrimaryButton>
  </>
);
```

---

## Color Themes

```tsx
// Flights (Blue)
<LoadingSpinner color="primary" />
<LoadingBar color="primary" />
<PrimaryButton>Book Flight</PrimaryButton>

// Hotels (Orange)
<LoadingSpinner color="orange" />
<LoadingBar color="orange" />
<SecondaryButton>Book Hotel</SecondaryButton>

// Success (Green)
<LoadingBar color="green" />

// Neutral (Gray)
<LoadingSpinner color="gray" />
```

---

## Sizes

```tsx
// Small (buttons, inline)
<LoadingSpinner size="small" />
<PulseLoader size="small" />
<ButtonLoading size="small">Click</ButtonLoading>

// Medium (default)
<LoadingSpinner size="medium" />
<PulseLoader size="medium" />
<ButtonLoading size="medium">Click</ButtonLoading>

// Large (page headers, CTAs)
<LoadingSpinner size="large" />
<PulseLoader size="large" />
<ButtonLoading size="large">Click</ButtonLoading>
```

---

## Accessibility Quick Tips

```tsx
// Always include ARIA labels
<LoadingSpinner />
// Automatically includes:
// role="status"
// aria-label="Loading"
// <span className="sr-only">Loading...</span>

// For overlays
<LoadingOverlay
  isOpen={true}
  message="Processing payment..."
/>
// Automatically includes:
// role="dialog"
// aria-modal="true"
// aria-label="Processing payment..."
```

---

## Performance Tips

1. **Use skeletons for > 1 second loads**
   ```tsx
   if (loading) return <Skeleton />;
   ```

2. **Use spinners for < 2 second loads**
   ```tsx
   if (loading) return <LoadingSpinner />;
   ```

3. **Use overlays for critical operations only**
   ```tsx
   <PaymentLoadingOverlay isOpen={isPaymentProcessing} />
   ```

4. **Optimize animations**
   ```tsx
   // Already optimized with GPU acceleration
   // No action needed!
   ```

---

## Common Mistakes to Avoid

❌ **Don't** stack multiple loading indicators
```tsx
// BAD
<LoadingBar isLoading={true} />
<LoadingSpinner />
<PulseLoader />
```

✅ **Do** use one appropriate indicator
```tsx
// GOOD
<LoadingBar isLoading={true} />
```

❌ **Don't** forget error states
```tsx
// BAD
if (loading) return <Skeleton />;
return <Content />;
```

✅ **Do** handle all states
```tsx
// GOOD
if (loading) return <Skeleton />;
if (error) return <Error />;
return <Content />;
```

---

## Testing Loading States

```tsx
// Force loading state for testing
const [loading, setLoading] = useState(true);

// In development, toggle easily:
<button onClick={() => setLoading(!loading)}>
  Toggle Loading
</button>

{loading ? <Skeleton /> : <Content />}
```

---

## Full Example: Flight Booking Flow

```tsx
function FlightBooking() {
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Initial load
  if (loading) {
    return (
      <>
        <LoadingBar isLoading={true} color="primary" />
        <BookingFormSkeleton />
      </>
    );
  }

  return (
    <>
      {/* Form */}
      <BookingForm onSubmit={() => setBooking(true)} />

      {/* Submit button */}
      <PrimaryButton
        isLoading={booking}
        loadingText="Creating booking..."
        onClick={handleBook}
        size="large"
        fullWidth
      >
        Book Flight $599.00
      </PrimaryButton>

      {/* Payment processing */}
      <PaymentLoadingOverlay isOpen={processing} />
    </>
  );
}
```

---

## Need More Help?

1. **Detailed Documentation**: `components/loading/README.md`
2. **Implementation Guide**: `LOADING_STATES_IMPLEMENTATION.md`
3. **Live Examples**: Check existing pages:
   - `app/flights/results/page.tsx`
   - `app/hotels/results/page.tsx`
   - `app/flights/booking-optimized/page.tsx`

---

**Quick Tips:**
- Skeleton screens for page loads
- Spinners for quick actions
- Overlays for payments/critical ops
- Button loading for forms
- Always handle error states!
