# Error Recovery Manager Component

A comprehensive error recovery component that provides empathetic, user-friendly error handling with actionable alternatives.

## Features

- **Never Shows Raw Errors**: All error messages are translated into user-friendly, empathetic language
- **Always Provides Alternatives**: Every error presents 2-3 alternative actions
- **Empathetic Language**: Uses warm, helpful tone that reduces user frustration
- **Integrated Error Handling**: Seamlessly integrates with `lib/ai/agent-error-handling.ts`
- **Color-Coded Alerts**: Visual severity indicators (red for errors, yellow for warnings, blue for info)
- **Retry with Loading State**: Built-in retry functionality with visual feedback
- **Smooth Animations**: Fade-in animations for better UX
- **Support Escalation**: Automatic escalation options for critical errors
- **Responsive Design**: Works beautifully on all screen sizes

## Installation

The component is already installed in your project at:
```
/home/user/fly2any/components/error/ErrorRecoveryManager.tsx
```

## Basic Usage

```tsx
import ErrorRecoveryManager from '@/components/error/ErrorRecoveryManager';
import { Calendar, Plane, MessageCircle } from 'lucide-react';

function MyComponent() {
  return (
    <ErrorRecoveryManager
      error={{
        type: 'no-results',
        message: 'No flights found',
        originalRequest: 'NYC to Miami Nov 15'
      }}
      onRetry={() => retrySearch()}
      alternatives={[
        {
          label: 'Try nearby dates',
          action: adjustDates,
          icon: <Calendar className="w-4 h-4" />
        },
        {
          label: 'Include connecting flights',
          action: addLayovers,
          icon: <Plane className="w-4 h-4" />
        },
        {
          label: 'Contact support',
          action: openSupport,
          icon: <MessageCircle className="w-4 h-4" />
        }
      ]}
      canRetry={true}
      consultant="flight-operations"
    />
  );
}
```

## Props Interface

```typescript
interface ErrorRecoveryManagerProps {
  // Error details
  error: {
    type: 'api-failure' | 'no-results' | 'timeout' | 'invalid-input';
    message: string;
    originalRequest?: string; // The user's original request
  };

  // Retry callback
  onRetry?: () => void | Promise<void>;

  // Alternative actions for the user
  alternatives?: Array<{
    label: string;
    action: () => void;
    icon?: React.ReactNode;
  }>;

  // Whether retry is allowed
  canRetry?: boolean;

  // The consultant type for context-specific messaging
  consultant?: 'flight-operations' | 'hotel-accommodations' | 'customer-service';
}
```

## Error Types

### 1. API Failure (`api-failure`)
**When to use**: External API calls fail or return errors

**Example**:
```tsx
<ErrorRecoveryManager
  error={{
    type: 'api-failure',
    message: 'Connection issue',
    originalRequest: 'Search hotels in Paris'
  }}
  onRetry={retryApiCall}
  consultant="hotel-accommodations"
/>
```

**User sees**: "Having trouble connecting to our hotel inventory system. Let me try an alternative approach..."

### 2. No Results (`no-results`)
**When to use**: Search returns zero results

**Example**:
```tsx
<ErrorRecoveryManager
  error={{
    type: 'no-results',
    message: 'No flights found',
    originalRequest: 'NYC to Tokyo Nov 15'
  }}
  alternatives={[
    { label: 'Try nearby dates', action: adjustDates, icon: <Calendar /> },
    { label: 'Check nearby airports', action: nearbyAirports, icon: <MapPin /> }
  ]}
  consultant="flight-operations"
/>
```

**User sees**: "I couldn't find any flights matching your exact criteria, but here are some options..."

### 3. Timeout (`timeout`)
**When to use**: Request takes too long to complete

**Example**:
```tsx
<ErrorRecoveryManager
  error={{
    type: 'timeout',
    message: 'Search taking longer than expected',
    originalRequest: 'Complex multi-city search'
  }}
  onRetry={retrySearch}
/>
```

**User sees**: "Your search is taking longer than expected. Here are your options..."

### 4. Invalid Input (`invalid-input`)
**When to use**: User provides malformed or invalid data

**Example**:
```tsx
<ErrorRecoveryManager
  error={{
    type: 'invalid-input',
    message: 'Invalid date format',
    originalRequest: 'Flight on 45/67/2025'
  }}
  alternatives={[
    { label: 'See format examples', action: showExamples },
    { label: 'Start over', action: reset }
  ]}
/>
```

**User sees**: "I didn't quite catch that date format. Could you try one of these..."

## Using Common Alternatives

The component exports a `commonAlternatives` helper with pre-built alternative actions:

```tsx
import ErrorRecoveryManager, { commonAlternatives } from '@/components/error';

<ErrorRecoveryManager
  error={{ type: 'no-results', message: 'No results' }}
  alternatives={[
    commonAlternatives.adjustDates(() => adjustDates()),
    commonAlternatives.nearbyLocations(() => searchNearby()),
    commonAlternatives.contactSupport(() => openSupport()),
  ]}
/>
```

Available common alternatives:
- `adjustDates(onAction)` - Suggest trying different dates
- `addLayovers(onAction)` - Suggest including connecting flights
- `nearbyLocations(onAction)` - Suggest nearby locations
- `contactSupport(onAction)` - Contact support team
- `simplifySearch(onAction)` - Simplify search criteria

## Integration with Error Handling System

The component automatically integrates with the existing error handling system:

```tsx
import { handleError, type ErrorContext } from '@/lib/ai/agent-error-handling';
import ErrorRecoveryManager from '@/components/error';

// In your API call
async function searchFlights() {
  try {
    const response = await api.searchFlights(params);
    return response;
  } catch (error) {
    // Create error context
    const errorContext: ErrorContext = {
      type: 'api-failure',
      originalRequest: userInput,
      consultant: 'flight-operations',
      specificError: error.message
    };

    // Get empathetic error response
    const errorResponse = handleError(errorContext);

    // Render ErrorRecoveryManager
    return (
      <ErrorRecoveryManager
        error={{
          type: 'api-failure',
          message: errorResponse.message,
          originalRequest: userInput
        }}
        onRetry={() => searchFlights()}
        canRetry={errorResponse.canRetry}
      />
    );
  }
}
```

## Styling and Customization

### Color Coding
The component automatically applies color coding based on error severity:

- **Red** (`api-failure`, `timeout`): Critical errors requiring attention
- **Yellow** (`no-results`): Warnings or no results found
- **Blue** (`invalid-input`): Informational messages

### Custom Alternatives
Provide custom alternatives with icons:

```tsx
import { Sparkles, Wand2, Star } from 'lucide-react';

<ErrorRecoveryManager
  error={errorData}
  alternatives={[
    {
      label: 'Get AI Suggestions',
      action: () => getAISuggestions(),
      icon: <Sparkles className="w-4 h-4" />
    },
    {
      label: 'Smart Search',
      action: () => smartSearch(),
      icon: <Wand2 className="w-4 h-4" />
    },
    {
      label: 'Popular Destinations',
      action: () => showPopular(),
      icon: <Star className="w-4 h-4" />
    }
  ]}
/>
```

## Support Escalation

For critical errors, the component automatically shows a support escalation section:

```tsx
// This happens automatically when errorResponse.escalateToHuman is true
// No additional configuration needed
```

The escalation section includes:
- Email support button
- Phone support button
- 24/7 availability message
- Professional, reassuring design

## Retry Behavior

The retry button includes automatic loading state management:

```tsx
<ErrorRecoveryManager
  error={errorData}
  onRetry={async () => {
    // Your async retry logic
    await retrySearch();
    // Loading state is handled automatically
  }}
  canRetry={true}
/>
```

The component:
1. Disables the button during retry
2. Shows a spinner animation
3. Changes button text to "Retrying..."
4. Maintains loading state for at least 500ms for better UX

## Accessibility

The component follows accessibility best practices:

- Semantic HTML with proper ARIA labels
- `role="alert"` for screen readers
- `aria-live="assertive"` for critical errors
- Keyboard navigation support
- Focus management
- High contrast color schemes

## Examples

See `ErrorRecoveryExample.tsx` for comprehensive usage examples including:
- All error types
- Custom alternatives
- Integration patterns
- Retry handling
- Support escalation

## Best Practices

### 1. Always Provide Context
```tsx
// Good
error={{
  type: 'no-results',
  message: 'No flights found',
  originalRequest: 'NYC to Miami Nov 15'  // ✅ Shows user their request
}}

// Less helpful
error={{
  type: 'no-results',
  message: 'No flights found'
  // ❌ Missing context
}}
```

### 2. Provide Meaningful Alternatives
```tsx
// Good - Specific, actionable
alternatives={[
  { label: 'Try dates ±3 days', action: flexibleDates },
  { label: 'Include 1-stop flights', action: addLayovers },
  { label: 'Search nearby airports (within 50mi)', action: nearbyAirports }
]}

// Less helpful - Too vague
alternatives={[
  { label: 'Try again', action: retry },
  { label: 'Change search', action: modify }
]}
```

### 3. Use Appropriate Error Types
```tsx
// API failed
type: 'api-failure'

// Search returned 0 results (but API worked)
type: 'no-results'

// Request timed out
type: 'timeout'

// User input was invalid
type: 'invalid-input'
```

### 4. Set canRetry Appropriately
```tsx
// Can retry - temporary issues
canRetry={true}  // API failures, timeouts, no results

// Cannot retry - permanent issues
canRetry={false}  // Out of scope, permission denied, authentication required
```

## Technical Details

### Dependencies
- React 18+
- TypeScript
- Tailwind CSS
- lucide-react (icons)
- `lib/ai/agent-error-handling.ts` (error handling system)

### File Structure
```
components/error/
├── ErrorRecoveryManager.tsx  # Main component
├── ErrorRecoveryExample.tsx  # Usage examples
├── index.ts                  # Exports
└── README.md                 # This file
```

## Support

For issues or questions:
- Email: support@fly2any.com
- Phone: 1-800-FLY-2ANY
- 24/7 availability

## License

Part of the Fly2Any platform - proprietary software.
