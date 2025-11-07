# SearchProgressIndicator Component

A comprehensive, real-time search progress indicator component for React/TypeScript applications. Shows live search status, progress bars, step-by-step tracking, and animated result counts.

## Features

✅ **Real-Time Updates** - Shows which APIs are being queried with live progress
✅ **Animated Progress Bar** - Smooth 0-100% progress with shimmer effect
✅ **Step-by-Step Status** - Visual indicators for each search phase
✅ **Live Results Counter** - Animated count of found results
✅ **Estimated Time Display** - Shows remaining time in seconds/minutes
✅ **Color-Coded Status** - Different colors for searching/analyzing/presenting
✅ **Accessible** - ARIA labels and screen reader announcements
✅ **Icon Support** - Different icons for flights/hotels/cars

## Installation

The component is located at:
```
/home/user/fly2any/components/search/SearchProgressIndicator.tsx
```

### Dependencies
- React 18+
- TypeScript
- Tailwind CSS
- lucide-react (for icons)

All dependencies are already installed in the project.

## Props Interface

```typescript
interface SearchProgressProps {
  // Current search status
  status: 'searching' | 'analyzing' | 'presenting' | 'complete';

  // Array of search steps with progress
  steps: Array<{
    label: string;           // Step name (e.g., "Searching Amadeus")
    complete: boolean;        // Is this step complete?
    current?: boolean;        // Is this the active step?
    progress?: number;        // Progress percentage (0-100)
  }>;

  // Number of results found (updates in real-time)
  foundCount?: number;

  // Estimated time remaining in seconds
  estimatedTime?: number;

  // Type of search being performed
  searchType?: 'flights' | 'hotels' | 'cars';
}
```

## Basic Usage

```tsx
import SearchProgressIndicator from '@/components/search/SearchProgressIndicator';

function MySearchPage() {
  return (
    <SearchProgressIndicator
      status="searching"
      steps={[
        { label: "Searching Amadeus", complete: true },
        { label: "Searching Duffel", complete: false, current: true, progress: 60 },
        { label: "Analyzing results", complete: false }
      ]}
      foundCount={47}
      estimatedTime={8}
      searchType="flights"
    />
  );
}
```

## Advanced Integration

### With State Management

```tsx
import { useState, useEffect } from 'react';
import SearchProgressIndicator from '@/components/search/SearchProgressIndicator';

function FlightSearchResults() {
  const [searchState, setSearchState] = useState({
    status: 'searching' as const,
    foundCount: 0,
    steps: [
      { label: 'Searching Amadeus', complete: false, current: true, progress: 0 },
      { label: 'Searching Duffel', complete: false },
      { label: 'Searching Kiwi', complete: false },
      { label: 'Analyzing results', complete: false },
      { label: 'Presenting options', complete: false }
    ]
  });

  // Update progress as APIs respond
  const updateApiProgress = (apiName: string, progress: number) => {
    setSearchState(prev => ({
      ...prev,
      steps: prev.steps.map(step =>
        step.label.includes(apiName)
          ? { ...step, progress, current: true }
          : step
      )
    }));
  };

  // Mark API as complete and add results
  const completeApi = (apiName: string, resultsCount: number) => {
    setSearchState(prev => ({
      ...prev,
      foundCount: prev.foundCount + resultsCount,
      steps: prev.steps.map(step =>
        step.label.includes(apiName)
          ? { ...step, complete: true, current: false }
          : step
      )
    }));
  };

  // Simulate API calls
  useEffect(() => {
    const searchApis = async () => {
      // Amadeus
      updateApiProgress('Amadeus', 50);
      await new Promise(resolve => setTimeout(resolve, 1000));
      completeApi('Amadeus', 23);

      // Duffel
      updateApiProgress('Duffel', 30);
      await new Promise(resolve => setTimeout(resolve, 1200));
      completeApi('Duffel', 18);

      // Continue with other APIs...
    };

    searchApis();
  }, []);

  return (
    <SearchProgressIndicator
      status={searchState.status}
      steps={searchState.steps}
      foundCount={searchState.foundCount}
      estimatedTime={15}
      searchType="flights"
    />
  );
}
```

### With Real API Integration

```tsx
import { useState } from 'react';
import SearchProgressIndicator from '@/components/search/SearchProgressIndicator';

function RealFlightSearch() {
  const [progress, setProgress] = useState({
    status: 'searching' as const,
    foundCount: 0,
    steps: [
      { label: 'Searching Amadeus', complete: false, current: true, progress: 0 },
      { label: 'Searching Duffel', complete: false },
      { label: 'Analyzing results', complete: false }
    ]
  });

  const searchFlights = async (searchParams) => {
    // Search Amadeus
    setProgress(prev => ({
      ...prev,
      steps: prev.steps.map((s, i) =>
        i === 0 ? { ...s, current: true, progress: 0 } : s
      )
    }));

    try {
      const amadeusResults = await fetch('/api/search/amadeus', {
        method: 'POST',
        body: JSON.stringify(searchParams)
      }).then(res => res.json());

      setProgress(prev => ({
        ...prev,
        foundCount: prev.foundCount + amadeusResults.length,
        steps: prev.steps.map((s, i) =>
          i === 0 ? { ...s, complete: true, current: false } :
          i === 1 ? { ...s, current: true, progress: 0 } : s
        )
      }));

      // Continue with other APIs...

    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (
    <SearchProgressIndicator
      status={progress.status}
      steps={progress.steps}
      foundCount={progress.foundCount}
      estimatedTime={20}
      searchType="flights"
    />
  );
}
```

## Visual States

### 1. Searching
```tsx
<SearchProgressIndicator
  status="searching"
  steps={[
    { label: "Searching Amadeus", complete: true },
    { label: "Searching Duffel", current: true, progress: 45 },
    { label: "Analyzing results", complete: false }
  ]}
  foundCount={23}
  estimatedTime={12}
  searchType="flights"
/>
```
- Blue color scheme
- Spinner on current step
- Progress bar animating

### 2. Analyzing
```tsx
<SearchProgressIndicator
  status="analyzing"
  steps={[
    { label: "Searching Amadeus", complete: true },
    { label: "Searching Duffel", complete: true },
    { label: "Analyzing results", current: true, progress: 70 }
  ]}
  foundCount={45}
  estimatedTime={5}
  searchType="flights"
/>
```
- Purple color scheme
- All searches complete
- Analyzing results in progress

### 3. Complete
```tsx
<SearchProgressIndicator
  status="complete"
  steps={[
    { label: "Searching Amadeus", complete: true },
    { label: "Searching Duffel", complete: true },
    { label: "Analyzing results", complete: true }
  ]}
  foundCount={127}
  searchType="flights"
/>
```
- Green color scheme
- All steps complete with checkmarks
- Success message displayed

## Customization

### Step Labels
You can customize step labels for different search scenarios:

**Flight Search:**
- "Searching Amadeus"
- "Searching Duffel"
- "Searching Kiwi"
- "Analyzing routes"
- "Comparing prices"

**Hotel Search:**
- "Searching Booking.com"
- "Searching Expedia"
- "Searching Hotels.com"
- "Checking availability"
- "Finding best deals"

**Car Rental:**
- "Searching Hertz"
- "Searching Enterprise"
- "Searching Budget"
- "Comparing rates"
- "Checking availability"

### Progress Updates
For smooth progress animation, update frequently:

```tsx
// Good: Frequent small updates
for (let i = 0; i <= 100; i += 10) {
  updateProgress(i);
  await delay(200);
}

// Avoid: Large jumps
updateProgress(0);
await delay(2000);
updateProgress(100); // Too sudden
```

## Accessibility

The component includes:
- `role="status"` for progress updates
- `aria-live="polite"` for non-intrusive announcements
- `aria-atomic="true"` for complete context
- Progress bar with `role="progressbar"`
- Screen reader announcements for status changes
- Semantic HTML structure

## Performance

- Uses CSS transitions for smooth animations
- Implements `React.memo` internally for step components
- Debounced count animations for better performance
- Efficient re-renders with proper state management

## Examples

See `SearchProgressIndicator.example.tsx` for:
- Simulated real-time search demo
- Multiple search type examples
- State management patterns
- Integration code snippets

## Testing

```tsx
import { render, screen } from '@testing-library/react';
import SearchProgressIndicator from './SearchProgressIndicator';

test('shows current step with spinner', () => {
  render(
    <SearchProgressIndicator
      status="searching"
      steps={[
        { label: "Searching API", current: true, progress: 50 }
      ]}
    />
  );

  expect(screen.getByText('Searching API')).toBeInTheDocument();
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
});
```

## Troubleshooting

### Progress bar not animating
- Ensure Tailwind CSS is properly configured
- Check that `transition-all` class is not being overridden
- Verify `duration-500` timing is appropriate

### Icons not showing
- Install `lucide-react`: `npm install lucide-react`
- Import icons are available
- Check that icon components are not filtered out by bundler

### Results count not updating
- Verify `foundCount` prop is changing
- Check React re-render is triggered
- Ensure parent component state is updating

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support with touch interactions

## License

Part of the Fly2Any project.
