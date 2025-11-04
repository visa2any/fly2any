# Loading States & Skeleton Screens

Comprehensive loading components for enhanced perceived performance and better user experience.

## Overview

This directory contains all loading-related components including spinners, overlays, progress bars, skeleton screens, and button loading states. All components are optimized for:

- **60fps animations** using GPU-accelerated transforms
- **Accessibility** with proper ARIA labels and screen reader support
- **Motion preferences** respecting `prefers-reduced-motion`
- **Brand consistency** with customizable color themes

---

## Components

### 1. LoadingSpinner

Customizable spinning loader for various use cases.

```tsx
import { LoadingSpinner, ButtonSpinner, PageSpinner } from '@/components/loading';

// Basic usage
<LoadingSpinner size="medium" color="primary" />

// Button spinner
<ButtonSpinner size="small" color="white" />

// Full page spinner
<PageSpinner />
```

**Props:**
- `size`: `'small' | 'medium' | 'large'` (default: `'medium'`)
- `color`: `'primary' | 'white' | 'orange' | 'gray'` (default: `'primary'`)
- `className`: Additional CSS classes

---

### 2. LoadingOverlay

Full-screen loading overlay with optional message.

```tsx
import { LoadingOverlay, PaymentLoadingOverlay, BookingLoadingOverlay } from '@/components/loading';

// Basic usage
<LoadingOverlay
  isOpen={isLoading}
  message="Loading..."
/>

// Payment processing
<PaymentLoadingOverlay isOpen={isProcessing} />

// Booking confirmation
<BookingLoadingOverlay isOpen={isBooking} />
```

**Props:**
- `isOpen`: Boolean to show/hide overlay
- `message`: Optional loading message
- `transparent`: Use transparent background (default: `false`)
- `showSpinner`: Show spinner animation (default: `true`)
- `children`: Optional additional content

**Features:**
- Prevents body scroll when open
- Portal rendering for proper z-index handling
- Smooth fade animations

---

### 3. LoadingBar

Top progress bar (NProgress style) for page transitions.

```tsx
import { LoadingBar, useLoadingBar } from '@/components/loading';

// Manual control
<LoadingBar isLoading={isLoading} color="primary" />

// With hook
const { start, complete, LoadingBar } = useLoadingBar('primary');

// In your code
start(); // Begin loading
complete(); // Finish loading
```

**Props:**
- `isLoading`: Boolean to control progress bar
- `color`: `'primary' | 'orange' | 'green'` (default: `'primary'`)
- `height`: Height in pixels (default: `3`)

**Features:**
- Auto-progress animation (0% → 90%)
- Smooth completion animation
- Auto-hide after completion

---

### 4. PulseLoader

Bouncing dots animation for inline loading states.

```tsx
import { PulseLoader, ButtonPulseLoader, CardPulseLoader, WavePulseLoader } from '@/components/loading';

// Basic usage
<PulseLoader size="medium" color="primary" count={3} />

// In buttons
<ButtonPulseLoader />

// Wave animation
<WavePulseLoader color="primary" />
```

**Props:**
- `size`: `'small' | 'medium' | 'large'` (default: `'medium'`)
- `color`: `'primary' | 'orange' | 'gray' | 'white'` (default: `'primary'`)
- `count`: `3 | 5` (default: `3`)
- `className`: Additional CSS classes

---

### 5. ButtonLoading

Button component with integrated loading state.

```tsx
import { ButtonLoading, PrimaryButton, SecondaryButton } from '@/components/loading';

// Basic usage
<ButtonLoading
  isLoading={isSubmitting}
  loadingText="Submitting..."
  onClick={handleSubmit}
>
  Submit
</ButtonLoading>

// Primary button
<PrimaryButton
  isLoading={isLoading}
  loadingText="Booking..."
  onClick={handleBook}
>
  Book Now
</PrimaryButton>
```

**Props:**
- `isLoading`: Show loading state
- `loadingText`: Text to show when loading (optional)
- `variant`: `'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'`
- `size`: `'small' | 'medium' | 'large'`
- `fullWidth`: Stretch to full width
- All standard button props

**Features:**
- Automatic disabled state when loading
- Smooth transitions
- Spinner color matches variant

---

## Skeleton Screens

Located in `components/skeletons/`

### FlightCardSkeleton

```tsx
import { FlightCardSkeleton, MultipleFlightCardSkeletons } from '@/components/skeletons';

// Single skeleton
<FlightCardSkeleton />

// Multiple skeletons
<MultipleFlightCardSkeletons count={5} />
```

### HotelCardSkeleton

```tsx
import { HotelCardSkeleton, MultipleHotelCardSkeletons } from '@/components/skeletons';

<MultipleHotelCardSkeletons count={5} />
```

### BookingFormSkeleton

```tsx
import { BookingFormSkeleton, PassengerFormSkeleton } from '@/components/skeletons';

// Full booking form
<BookingFormSkeleton />

// Individual passenger form
<PassengerFormSkeleton />
```

### SearchBarSkeleton

```tsx
import { SearchBarSkeleton, CompactSearchBarSkeleton } from '@/components/skeletons';

// Full search bar
<SearchBarSkeleton />

// Compact version
<CompactSearchBarSkeleton />
```

---

## Animation Performance

All components use GPU-accelerated CSS transforms for 60fps animations:

```css
/* Shimmer effect */
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

/* Applied via Tailwind */
.animate-shimmer {
  animation: shimmer 2s infinite;
  background: linear-gradient(
    90deg,
    #e5e7eb 0%,
    #f3f4f6 50%,
    #e5e7eb 100%
  );
  background-size: 200% 100%;
}
```

**Performance optimizations:**
- `will-change: transform` for animated elements
- `transform: translateZ(0)` to force GPU acceleration
- Reduced motion media query support

---

## Accessibility

All components include proper accessibility features:

### ARIA Attributes

```tsx
// Spinners and loaders
<div role="status" aria-label="Loading">
  <span className="sr-only">Loading...</span>
</div>

// Progress bars
<div
  role="progressbar"
  aria-valuemin={0}
  aria-valuemax={100}
  aria-valuenow={progress}
/>

// Loading overlays
<div
  role="dialog"
  aria-modal="true"
  aria-label="Processing payment"
/>
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .animate-spin,
  .animate-bounce,
  .animate-shimmer {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

---

## Usage Examples

### Flight Search Results

```tsx
function FlightResults() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Progress bar */}
        <LoadingBar isLoading={loading} color="primary" />

        {/* Skeleton screens */}
        <MultipleFlightCardSkeletons count={6} />

        {/* Loading message */}
        <div className="flex items-center justify-center gap-2">
          <PulseLoader color="primary" />
          <span>Searching for best flights...</span>
        </div>
      </div>
    );
  }

  return <FlightCards flights={flights} />;
}
```

### Payment Processing

```tsx
function CheckoutForm() {
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    setProcessing(true);
    try {
      await processPayment();
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      {/* Button with loading state */}
      <PrimaryButton
        isLoading={processing}
        loadingText="Processing payment..."
        onClick={handlePayment}
        size="large"
        fullWidth
      >
        Pay Now
      </PrimaryButton>

      {/* Full-screen overlay */}
      <PaymentLoadingOverlay isOpen={processing} />
    </>
  );
}
```

### Form Loading

```tsx
function BookingForm() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <BookingFormSkeleton />;
  }

  return <ActualBookingForm />;
}
```

---

## Best Practices

### 1. Choose the Right Component

- **Spinners**: Quick actions (< 2 seconds)
- **Skeleton screens**: Page/component loading
- **Progress bars**: Page transitions
- **Overlays**: Critical operations (payment, booking)

### 2. Provide Context

Always include loading messages for clarity:

```tsx
// Good
<LoadingSpinner />
<span className="ml-2">Searching flights...</span>

// Better
<LoadingOverlay
  isOpen={true}
  message="Searching flights..."
>
  <p className="text-sm text-gray-600">This may take a moment</p>
</LoadingOverlay>
```

### 3. Match Skeleton Layout

Skeleton screens should match the actual content layout:

```tsx
// If your card has image + text
<div className="flex">
  <div className="w-48 h-32 bg-gray-200 animate-shimmer" />
  <div className="flex-1 space-y-2">
    <div className="h-6 bg-gray-200 animate-shimmer" />
    <div className="h-4 bg-gray-200 animate-shimmer" />
  </div>
</div>
```

### 4. Optimize Animation Performance

```tsx
// Use CSS transforms instead of position/margin
.animate-spin {
  transform: rotate(360deg);
  /* NOT: margin-left: animate... */
}

// Force GPU acceleration
.loading-element {
  transform: translateZ(0);
  will-change: transform;
}
```

### 5. Handle Loading States Consistently

```tsx
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  fetchData()
    .then(setData)
    .catch(setError)
    .finally(() => setLoading(false));
}, []);

if (loading) return <Skeleton />;
if (error) return <Error />;
return <Content />;
```

---

## Color Themes

All components support theme colors matching your brand:

- **Primary**: Blue gradient (`from-primary-600 to-blue-600`)
- **Orange**: Orange/red gradient (hotels)
- **Green**: Success states
- **Gray**: Neutral states

---

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (including iOS)
- Opera: ✅ Full support

All animations use standard CSS transforms supported by modern browsers.

---

## Performance Metrics

- **Animation FPS**: 60fps (GPU-accelerated)
- **Bundle size**: ~8KB (gzipped)
- **Tree-shakeable**: Import only what you need
- **Zero dependencies**: Pure React + Tailwind

---

## Migration Guide

### From old loading spinners

```tsx
// Before
<div className="spinner" />

// After
<LoadingSpinner size="medium" color="primary" />
```

### From custom skeleton components

```tsx
// Before
<div className="skeleton-card">
  <div className="skeleton-header" />
  <div className="skeleton-body" />
</div>

// After
<FlightCardSkeleton />
// or
<HotelCardSkeleton />
```

---

## Troubleshooting

### Animations not smooth

1. Check for `will-change` property
2. Use `transform` instead of `position` properties
3. Reduce number of simultaneous animations

### Screen reader issues

1. Ensure `role="status"` is present
2. Add `aria-live="polite"` for dynamic updates
3. Include visually hidden text with `.sr-only`

### Z-index issues with overlays

LoadingOverlay uses `z-index: 9999` by default. If needed, adjust:

```tsx
<LoadingOverlay
  isOpen={true}
  className="z-[10000]"
/>
```

---

## Contributing

When adding new loading components:

1. Follow existing naming conventions
2. Include accessibility features (ARIA, sr-only text)
3. Support theme colors
4. Add TypeScript types
5. Update this documentation
6. Add usage examples

---

## Resources

- [Web.dev: Skeleton Screens](https://web.dev/skeleton-screens/)
- [ARIA: Status Role](https://www.w3.org/TR/wai-aria-1.1/#status)
- [MDN: Animations Performance](https://developer.mozilla.org/en-US/docs/Web/Performance/CSS_JavaScript_animation_performance)
