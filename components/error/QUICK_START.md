# Error Recovery Manager - Quick Start

## 🚀 Get Started in 3 Minutes

### Step 1: Import the Component
```tsx
import ErrorRecoveryManager from '@/components/error/ErrorRecoveryManager';
import { Calendar, Plane, MessageCircle } from 'lucide-react';
```

### Step 2: Add to Your Component
```tsx
const [error, setError] = useState(null);

// When an error occurs
try {
  await searchFlights();
} catch (err) {
  setError({
    type: 'api-failure',
    message: err.message,
    originalRequest: 'NYC to Miami Nov 15'
  });
}
```

### Step 3: Render the Error Recovery
```tsx
{error && (
  <ErrorRecoveryManager
    error={error}
    onRetry={() => retrySearch()}
    alternatives={[
      { label: 'Try nearby dates', action: adjustDates, icon: <Calendar /> },
      { label: 'Include layovers', action: addLayovers, icon: <Plane /> },
      { label: 'Contact support', action: openSupport, icon: <MessageCircle /> }
    ]}
    canRetry={true}
    consultant="flight-operations"
  />
)}
```

---

## 📋 Error Types

| Type | When to Use |
|------|-------------|
| `api-failure` | API errors, network issues |
| `no-results` | Search returns 0 results |
| `timeout` | Request takes too long |
| `invalid-input` | User provides invalid data |

---

## 🎣 Using the Hook (Easier!)

```tsx
import { useErrorRecovery } from '@/components/error';

function MyComponent() {
  const { error, setError, retry, isRetrying } = useErrorRecovery({
    onRetry: async () => await searchFlights(),
    maxRetries: 3
  });

  // Set error when needed
  try {
    await api.search();
  } catch (err) {
    setError({
      type: 'api-failure',
      message: err.message,
      originalRequest: query
    });
  }

  // Render
  return error ? <ErrorRecoveryManager error={error} onRetry={retry} /> : null;
}
```

---

## 🎨 Common Patterns

### Pattern 1: No Results
```tsx
<ErrorRecoveryManager
  error={{ type: 'no-results', message: 'No flights found' }}
  alternatives={[
    commonAlternatives.adjustDates(() => tryDifferentDates()),
    commonAlternatives.addLayovers(() => includeConnecting()),
    commonAlternatives.contactSupport(() => getHelp())
  ]}
/>
```

### Pattern 2: API Failure
```tsx
<ErrorRecoveryManager
  error={{ type: 'api-failure', message: 'Connection error' }}
  onRetry={() => retryConnection()}
  canRetry={true}
  consultant="flight-operations"
/>
```

### Pattern 3: Invalid Input
```tsx
<ErrorRecoveryManager
  error={{
    type: 'invalid-input',
    message: 'Invalid date format',
    originalRequest: 'Flight on 45/67/2025'
  }}
  alternatives={[
    { label: 'See examples', action: showExamples },
    { label: 'Clear form', action: resetForm }
  ]}
/>
```

---

## 💡 Pro Tips

### Tip 1: Use commonAlternatives
```tsx
import { commonAlternatives } from '@/components/error';

alternatives={[
  commonAlternatives.adjustDates(() => adjust()),
  commonAlternatives.nearbyLocations(() => nearby()),
  commonAlternatives.contactSupport(() => support())
]}
```

### Tip 2: Always Provide Context
```tsx
// Good ✓
error={{
  type: 'no-results',
  message: 'No flights',
  originalRequest: 'NYC to LA Nov 15'  // ← Include this!
}}

// Less helpful ✗
error={{ type: 'no-results', message: 'No flights' }}
```

### Tip 3: Set canRetry Appropriately
```tsx
canRetry={true}   // For temporary issues (API, timeout, no results)
canRetry={false}  // For permanent issues (invalid input, out of scope)
```

### Tip 4: Use Consultant Types
```tsx
consultant="flight-operations"      // For flight searches
consultant="hotel-accommodations"   // For hotel searches
consultant="customer-service"       // For general errors
```

---

## 📦 What's Included

```
/components/error/
├── ErrorRecoveryManager.tsx      # Main component
├── useErrorRecovery.ts           # React hook
├── types.ts                      # TypeScript types
├── index.ts                      # Exports
├── README.md                     # Full docs
├── INTEGRATION_GUIDE.md          # Integration guide
└── QUICK_START.md                # This file
```

---

## 🔗 Resources

- **Full Documentation**: [README.md](./README.md)
- **Integration Guide**: [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
- **Examples**: [ErrorRecoveryExample.tsx](./ErrorRecoveryExample.tsx)
- **Build Summary**: [BUILD_SUMMARY.md](./BUILD_SUMMARY.md)

---

## ⚡ Examples in Action

### Example 1: Flight Search Error
```tsx
const handleFlightSearch = async (params) => {
  try {
    const results = await searchFlights(params);
    return results;
  } catch (error) {
    return (
      <ErrorRecoveryManager
        error={{
          type: 'no-results',
          message: 'No flights found for your search',
          originalRequest: `${params.from} to ${params.to} on ${params.date}`
        }}
        onRetry={() => handleFlightSearch(params)}
        alternatives={[
          { label: 'Try ±3 days', action: () => flexDates(params), icon: <Calendar /> },
          { label: 'Include 1-stop flights', action: () => addStops(params), icon: <Plane /> },
          { label: 'Search nearby airports', action: () => nearby(params), icon: <MapPin /> }
        ]}
        consultant="flight-operations"
      />
    );
  }
};
```

### Example 2: With Hook (Simpler)
```tsx
function FlightSearch() {
  const { error, setError, retry, isRetrying } = useErrorRecovery({
    onRetry: async () => await searchFlights(),
    maxRetries: 3,
    exponentialBackoff: true
  });

  const search = async () => {
    try {
      await api.searchFlights();
    } catch (err) {
      setError({
        type: 'api-failure',
        message: 'Search failed',
        originalRequest: query
      });
    }
  };

  return (
    <>
      <SearchForm onSubmit={search} />
      {error && (
        <ErrorRecoveryManager
          error={error}
          onRetry={retry}
          canRetry={!isRetrying}
        />
      )}
    </>
  );
}
```

---

## 🆘 Need Help?

1. **Check the docs**: [README.md](./README.md)
2. **See integration patterns**: [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
3. **Run the examples**: [ErrorRecoveryExample.tsx](./ErrorRecoveryExample.tsx)
4. **Contact support**: dev-support@fly2any.com

---

**You're ready to go!** 🎉

Start by copying one of the examples above and customize it for your use case.
