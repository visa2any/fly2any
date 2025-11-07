# Error Recovery Manager - Integration Guide

## Quick Start

### Step 1: Import the Component

```tsx
import ErrorRecoveryManager from '@/components/error/ErrorRecoveryManager';
// or
import { ErrorRecoveryManager } from '@/components/error';
```

### Step 2: Add to Your Error Handling

```tsx
'use client';

import { useState } from 'react';
import ErrorRecoveryManager from '@/components/error/ErrorRecoveryManager';
import { Calendar, Plane, MessageCircle } from 'lucide-react';

export default function FlightSearch() {
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState(null);

  const handleSearch = async (params) => {
    try {
      setError(null);
      const results = await searchFlights(params);
      return results;
    } catch (err) {
      // Determine error type
      const errorType = determineErrorType(err);

      setError({
        type: errorType,
        message: err.message,
        originalRequest: `${params.from} to ${params.to} on ${params.date}`
      });
    }
  };

  const handleRetry = async () => {
    if (searchParams) {
      await handleSearch(searchParams);
    }
  };

  return (
    <div>
      {/* Your search form */}
      <SearchForm onSubmit={(params) => {
        setSearchParams(params);
        handleSearch(params);
      }} />

      {/* Error recovery */}
      {error && (
        <ErrorRecoveryManager
          error={error}
          onRetry={handleRetry}
          alternatives={[
            {
              label: 'Try nearby dates',
              action: () => adjustDates(searchParams),
              icon: <Calendar className="w-4 h-4" />
            },
            {
              label: 'Include connecting flights',
              action: () => includeLayovers(searchParams),
              icon: <Plane className="w-4 h-4" />
            },
            {
              label: 'Contact support',
              action: () => window.open('mailto:support@fly2any.com', '_blank'),
              icon: <MessageCircle className="w-4 h-4" />
            }
          ]}
          canRetry={true}
          consultant="flight-operations"
        />
      )}
    </div>
  );
}

// Helper to determine error type
function determineErrorType(error): 'api-failure' | 'no-results' | 'timeout' | 'invalid-input' {
  if (error.code === 'TIMEOUT' || error.message.includes('timeout')) {
    return 'timeout';
  }
  if (error.response?.status === 404 || error.message.includes('no results')) {
    return 'no-results';
  }
  if (error.response?.status >= 500 || error.message.includes('network')) {
    return 'api-failure';
  }
  if (error.response?.status === 400 || error.message.includes('invalid')) {
    return 'invalid-input';
  }
  return 'api-failure'; // default
}
```

## Integration with Existing Error Handling System

### Using with `lib/ai/agent-error-handling.ts`

```tsx
import { handleError, type ErrorContext } from '@/lib/ai/agent-error-handling';
import ErrorRecoveryManager from '@/components/error/ErrorRecoveryManager';

async function searchWithErrorHandling(userInput: string) {
  try {
    const results = await api.search(userInput);
    return results;
  } catch (error) {
    // Create error context for the error handling system
    const errorContext: ErrorContext = {
      type: 'api-failure',
      originalRequest: userInput,
      consultant: 'flight-operations',
      specificError: error.message
    };

    // Get empathetic error response
    const errorResponse = handleError(errorContext);

    // Render ErrorRecoveryManager with the response
    return (
      <ErrorRecoveryManager
        error={{
          type: 'api-failure',
          message: errorResponse.message, // Already empathetic
          originalRequest: userInput
        }}
        onRetry={() => searchWithErrorHandling(userInput)}
        canRetry={errorResponse.canRetry}
        consultant="flight-operations"
      />
    );
  }
}
```

## Common Patterns

### Pattern 1: Form Validation Errors

```tsx
const handleSubmit = (formData) => {
  // Validate form
  const validation = validateSearchForm(formData);

  if (!validation.valid) {
    return (
      <ErrorRecoveryManager
        error={{
          type: 'invalid-input',
          message: validation.message,
          originalRequest: formData.toString()
        }}
        alternatives={[
          {
            label: 'See format examples',
            action: () => showExamples(),
            icon: <HelpCircle />
          },
          {
            label: 'Clear form',
            action: () => resetForm(),
            icon: <RefreshCw />
          }
        ]}
        canRetry={false}
      />
    );
  }
};
```

### Pattern 2: API Timeout with Fallback

```tsx
const searchWithTimeout = async (params, timeout = 30000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch('/api/search', {
      signal: controller.signal,
      body: JSON.stringify(params)
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      return (
        <ErrorRecoveryManager
          error={{
            type: 'timeout',
            message: 'Search timeout',
            originalRequest: params.query
          }}
          onRetry={() => searchWithTimeout(params, timeout * 2)}
          alternatives={[
            commonAlternatives.simplifySearch(() => simplify(params)),
            commonAlternatives.contactSupport(() => contact())
          ]}
          canRetry={true}
        />
      );
    }
  }
};
```

### Pattern 3: No Results with Smart Alternatives

```tsx
const handleNoResults = (searchParams) => {
  // Generate smart alternatives based on search
  const alternatives = generateAlternatives(searchParams);

  return (
    <ErrorRecoveryManager
      error={{
        type: 'no-results',
        message: 'No flights found',
        originalRequest: formatSearchParams(searchParams)
      }}
      onRetry={() => retrySearch(searchParams)}
      alternatives={alternatives.map(alt => ({
        label: alt.description,
        action: () => executeAlternative(alt),
        icon: getIconForAlternative(alt)
      }))}
      canRetry={true}
      consultant="flight-operations"
    />
  );
};

function generateAlternatives(params) {
  const alternatives = [];

  // Date flexibility
  if (params.date) {
    alternatives.push({
      type: 'date-flex',
      description: `Try dates ±3 days from ${params.date}`,
      action: () => ({ ...params, dateFlexible: true })
    });
  }

  // Nearby airports
  if (params.destination) {
    alternatives.push({
      type: 'nearby-airport',
      description: `Check airports near ${params.destination}`,
      action: () => ({ ...params, includeNearby: true })
    });
  }

  // Include layovers
  if (params.directOnly) {
    alternatives.push({
      type: 'layovers',
      description: 'Include flights with 1 stop',
      action: () => ({ ...params, directOnly: false, maxStops: 1 })
    });
  }

  return alternatives;
}
```

### Pattern 4: Progressive Error Recovery

```tsx
const searchWithFallbacks = async (params, attempt = 1) => {
  try {
    return await primarySearch(params);
  } catch (error) {
    if (attempt === 1) {
      // Try fallback API
      try {
        return await fallbackSearch(params);
      } catch (fallbackError) {
        return showError(params, 2);
      }
    }
    return showError(params, attempt);
  }
};

function showError(params, attempt) {
  const alternatives = [
    {
      label: attempt === 1 ? 'Try again' : 'Try different dates',
      action: () => attempt === 1
        ? searchWithFallbacks(params, 2)
        : adjustDates(params),
      icon: attempt === 1 ? <RefreshCw /> : <Calendar />
    },
    commonAlternatives.contactSupport(() => contact())
  ];

  return (
    <ErrorRecoveryManager
      error={{
        type: 'api-failure',
        message: 'Service unavailable',
        originalRequest: formatParams(params)
      }}
      onRetry={() => searchWithFallbacks(params, attempt + 1)}
      alternatives={alternatives}
      canRetry={attempt < 3}
      consultant="flight-operations"
    />
  );
}
```

## Advanced Usage

### Custom Error Messages

```tsx
const customErrorMessages = {
  'no-flights-peak-season': {
    type: 'no-results',
    message: 'This is a peak travel season! Flights to this destination sell out quickly.',
    alternatives: [
      'Book connecting flights (more availability)',
      'Try dates 1 week earlier/later',
      'Join waitlist for cancellations'
    ]
  },
  'hotel-full': {
    type: 'no-results',
    message: 'This hotel is fully booked for your dates.',
    alternatives: [
      'View similar hotels nearby',
      'Try dates ±2 days',
      'Join cancellation waitlist'
    ]
  }
};

<ErrorRecoveryManager
  error={customErrorMessages['hotel-full']}
  onRetry={retryBooking}
  alternatives={customErrorMessages['hotel-full'].alternatives.map(alt => ({
    label: alt,
    action: () => handleAlternative(alt)
  }))}
/>
```

### Context-Aware Alternatives

```tsx
function getContextAwareAlternatives(error, userContext) {
  const alternatives = [];

  // User has flexible dates
  if (userContext.flexibleDates) {
    alternatives.push({
      label: 'Search all dates in your range',
      action: () => searchDateRange(userContext.dateRange),
      icon: <Calendar />
    });
  }

  // User is a loyalty member
  if (userContext.loyaltyMember) {
    alternatives.push({
      label: 'Check member-only availability',
      action: () => searchLoyalty(),
      icon: <Star />
    });
  }

  // User has searched similar routes before
  if (userContext.previousSearches.length > 0) {
    alternatives.push({
      label: 'View your previous searches',
      action: () => showHistory(),
      icon: <History />
    });
  }

  return alternatives;
}

<ErrorRecoveryManager
  error={error}
  alternatives={getContextAwareAlternatives(error, userContext)}
/>
```

## Testing

### Unit Test Example

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ErrorRecoveryManager from '@/components/error/ErrorRecoveryManager';

describe('ErrorRecoveryManager', () => {
  it('renders error message', () => {
    render(
      <ErrorRecoveryManager
        error={{
          type: 'no-results',
          message: 'No flights found',
          originalRequest: 'NYC to LAX'
        }}
      />
    );

    expect(screen.getByText(/No results found/i)).toBeInTheDocument();
  });

  it('handles retry action', async () => {
    const mockRetry = jest.fn();

    render(
      <ErrorRecoveryManager
        error={{ type: 'api-failure', message: 'Error' }}
        onRetry={mockRetry}
        canRetry={true}
      />
    );

    const retryButton = screen.getByText(/Try Again/i);
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(mockRetry).toHaveBeenCalled();
    });
  });

  it('executes alternative actions', () => {
    const mockAction = jest.fn();

    render(
      <ErrorRecoveryManager
        error={{ type: 'no-results', message: 'No results' }}
        alternatives={[
          { label: 'Try dates', action: mockAction }
        ]}
      />
    );

    fireEvent.click(screen.getByText(/Try dates/i));
    expect(mockAction).toHaveBeenCalled();
  });
});
```

## Troubleshooting

### Issue: Error not showing
**Solution**: Ensure error state is properly managed and component is conditionally rendered

```tsx
{error && <ErrorRecoveryManager error={error} ... />}
```

### Issue: Retry not working
**Solution**: Ensure onRetry is an async function and error state is cleared on success

```tsx
const handleRetry = async () => {
  try {
    await retryAction();
    setError(null); // Clear error on success
  } catch (err) {
    // Error persists
  }
};
```

### Issue: Alternatives not showing
**Solution**: Ensure alternatives array is not empty and properly formatted

```tsx
alternatives={alternatives.length > 0 ? alternatives : undefined}
```

## Best Practices Summary

1. ✅ Always provide `originalRequest` for context
2. ✅ Use appropriate error types
3. ✅ Provide 2-3 meaningful alternatives
4. ✅ Clear error state on successful retry
5. ✅ Use empathetic, helpful language
6. ✅ Set `canRetry` appropriately
7. ✅ Specify correct `consultant` type
8. ✅ Include icons for better UX
9. ✅ Handle async retry operations
10. ✅ Test all error scenarios

## Support

Need help integrating? Contact:
- Email: dev-support@fly2any.com
- Slack: #frontend-help
- Docs: /docs/components/error-recovery
