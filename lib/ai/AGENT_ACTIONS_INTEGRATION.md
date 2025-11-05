# AI Agent Autonomous Action System - Integration Guide

## Overview

The AI Agent Autonomous Action System enables your AI consultants to take real actions on behalf of users, not just talk about them. This system handles:

- **Autonomous Actions**: Search, compare, calculate without asking permission
- **Permission Management**: Ask permission for financial actions (booking, charging)
- **Action Chaining**: Execute multiple actions in sequence
- **Error Recovery**: Retry failed actions with exponential backoff
- **Personality Integration**: Each consultant announces actions in their unique style

---

## Quick Start

### 1. Basic Action Execution

```typescript
import { planActions, executeActionChain } from '@/lib/ai/agent-action-chain';
import { ActionExecutor } from '@/lib/ai/agent-action-executor';
import { announceAction } from '@/lib/ai/agent-action-messages';

// Create executor
const executor = new ActionExecutor({
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
  sessionId: userSession.id,
  userId: user.id,
});

// Plan actions based on user intent
const plan = planActions(
  "Find me flights to Paris on November 15",
  {
    userId: user.id,
    sessionId: session.id,
    consultantId: 'lisa-service',
  }
);

// Execute the action chain
const result = await executeActionChain(plan, {
  executor,
  consultantId: 'lisa-service',

  onActionStart: (action) => {
    const message = announceAction(action.type, 'start', 'lisa-service');
    console.log('🤖', message);
  },

  onActionComplete: (action) => {
    const message = announceAction(action.type, 'success', 'lisa-service', {
      count: action.result?.count || 0,
    });
    console.log('✅', message);
  },

  onPermissionRequired: async (action, request) => {
    // Ask user for permission
    const userResponse = await askUserForPermission(request);
    return {
      granted: userResponse.confirmed,
      timestamp: new Date(),
    };
  },
});

console.log('Result:', result.success ? 'Success!' : 'Failed');
```

### 2. Integration with Chat Interface

```typescript
// In your chat handler
async function handleUserMessage(message: string, consultantId: string) {
  // Plan actions
  const plan = planActions(message, {
    userId: currentUser.id,
    consultantId,
  });

  // Check if any actions can auto-execute
  const hasAutoExecuteActions = plan.actions.some(
    action => !action.requiresPermission
  );

  if (hasAutoExecuteActions) {
    // Show "agent is working" indicator
    showAgentWorking(true);

    // Execute actions
    const result = await executeActionChain(plan, {
      executor,
      consultantId,

      onActionStart: (action) => {
        // Show action announcement in chat
        const message = announceAction(action.type, 'start', consultantId);
        addChatMessage({
          role: 'assistant',
          content: message,
          type: 'action-announcement',
        });
      },

      onActionProgress: (action, progress) => {
        // Update progress indicator
        updateActionProgress(progress);
      },

      onActionComplete: (action) => {
        // Show success message
        const message = announceAction(action.type, 'success', consultantId, {
          count: action.result?.count,
          total: action.result?.total,
        });
        addChatMessage({
          role: 'assistant',
          content: message,
          type: 'action-result',
        });

        // Display results
        if (action.result?.flights) {
          displayFlightResults(action.result.flights);
        }
      },

      onPermissionRequired: async (action, request) => {
        // Show permission dialog
        return await showPermissionDialog(request, consultantId);
      },
    });

    showAgentWorking(false);
  }
}
```

### 3. Permission Dialog Component

```tsx
import { generatePermissionRequest } from '@/lib/ai/agent-permissions';

function PermissionDialog({
  request,
  consultantId,
  onResponse
}: {
  request: PermissionRequest;
  consultantId: string;
  onResponse: (granted: boolean) => void;
}) {
  const message = generatePermissionRequest(request, consultantId);

  return (
    <div className="permission-dialog">
      <div className="message">{message}</div>

      {request.warnings && request.warnings.length > 0 && (
        <div className="warnings">
          <h4>Important:</h4>
          <ul>
            {request.warnings.map((warning, i) => (
              <li key={i}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="details">
        <div className="cost">
          {request.cost && (
            <span>Cost: ${request.cost.toFixed(2)}</span>
          )}
        </div>
        <div className="reversible">
          {request.reversible ? '✅ Reversible' : '⚠️ Non-reversible'}
        </div>
      </div>

      <div className="actions">
        <button onClick={() => onResponse(false)}>
          Cancel
        </button>
        <button onClick={() => onResponse(true)} className="primary">
          Confirm
        </button>
      </div>
    </div>
  );
}
```

---

## Action Types

### Autonomous Actions (No Permission Required)

These actions execute automatically without asking:

- `search-flights` - Search for flight options
- `search-hotels` - Search for hotel options
- `search-cars` - Search for rental cars
- `search-packages` - Search for vacation packages
- `check-availability` - Verify if option is available
- `compare-options` - Create comparison of options
- `add-to-cart` - Add item to user's cart
- `remove-from-cart` - Remove item from cart
- `calculate-total` - Calculate total price
- `verify-requirements` - Check travel requirements
- `check-visa` - Check visa requirements
- `check-baggage` - Check baggage allowance
- `create-itinerary` - Create travel itinerary
- `create-comparison` - Create comparison table
- `find-alternatives` - Find alternative options

### Permission-Required Actions

These actions require explicit user confirmation:

- `book` - Book a trip (charges payment)
- `modify-booking` - Modify existing booking
- `cancel-booking` - Cancel a booking
- `verify-payment` - Verify payment information

---

## Action Flow Examples

### Example 1: Simple Flight Search

```
User: "Find me flights to Paris"

Agent Actions:
1. search-flights (auto) → Searches for flights
2. compare-options (auto) → Compares results

Agent Response:
"Perfect! I found 8 excellent flights for you! ✈️
[Displays flight results]
Would you like me to add one to your cart?"
```

### Example 2: Search and Book

```
User: "Book me a flight to Paris on Nov 15"

Agent Actions:
1. search-flights (auto) → Searches flights
2. compare-options (auto) → Finds best option
3. add-to-cart (auto) → Adds to cart
4. calculate-total (auto) → Calculates price
5. book (WAIT FOR PERMISSION) → Requires confirmation

Agent Response:
"I found a great flight for you! Let me add it to your cart...
✅ Added! Your total comes to $649.
Before I proceed with booking, I need your confirmation. Shall I go ahead? 💳"

User: "yes"

Agent: "Perfect! Booking now..."
6. book (executes) → Books the flight
Agent: "Congratulations! Your booking is confirmed! 🎉"
```

### Example 3: Compare and Choose

```
User: "Compare options 1 and 3"

Agent Actions:
1. create-comparison (auto) → Creates comparison

Agent Response:
"Here's your comparison, sweetie! 📊
[Shows comparison table]
Option 1 is $50 cheaper but has one stop.
Option 3 is non-stop but costs more.
Which would you prefer?"
```

---

## Personality Customization

Each consultant announces actions in their unique style:

### Lisa (Service Agent)
```typescript
// Start: "Let me search for the best flights for you, sweetie! ✈️"
// Success: "Perfect! I found some amazing options for you! 🎉"
// Permission: "Hon, before I proceed with booking for $599, I need your confirmation. Shall I go ahead? 💳"
```

### Sarah (Flight Expert)
```typescript
// Start: "I'll search for flights right now. ✈️"
// Success: "I found 8 flights that match your criteria."
// Permission: "Ready to book this flight for $599? Just confirm and I'll complete the reservation."
```

### Marcus (Budget Specialist)
```typescript
// Start: "Let me hunt for the best deals, amigo! 💰"
// Success: "Boom! Found 8 great deals for you! 💰"
// Permission: "Alright amigo! Ready to lock in this deal at $599? Just say the word! 💰"
```

---

## Error Handling

The system includes automatic retry logic:

```typescript
// Actions are retried up to 3 times with exponential backoff
const result = await executeActionChain(plan, {
  executor,
  consultantId: 'lisa-service',
  maxRetries: 3,        // Retry failed actions
  retryDelay: 1000,     // Initial delay: 1 second

  onActionFailed: (action, error) => {
    console.error('Action failed:', action.type, error);

    // Show friendly error message
    addChatMessage({
      role: 'assistant',
      content: announceAction(action.type, 'failure', consultantId),
    });
  },
});
```

---

## Advanced Usage

### Conditional Actions

```typescript
// Create a plan with conditional logic
const plan = planActions("Find cheapest flight", context);

// Add conditional action
if (result.price > 1000) {
  plan.actions.push(createAction('find-alternatives', {
    description: 'Find cheaper alternatives',
    requiresPermission: false,
  }));
}
```

### Parallel Actions

```typescript
import { executeActionsParallel } from '@/lib/ai/agent-action-chain';

// Execute independent actions in parallel
const actions = [
  createAction('search-flights', { /* params */ }),
  createAction('search-hotels', { /* params */ }),
  createAction('search-cars', { /* params */ }),
];

const results = await executeActionsParallel(
  actions,
  executor,
  'lisa-service'
);
```

### Passing Results Between Actions

```typescript
// Results automatically flow to next action
const plan = {
  actions: [
    { type: 'search-flights', /* ... */ },
    { type: 'compare-options', /* will receive search results */ },
    { type: 'add-to-cart', /* will receive comparison result */ },
    { type: 'calculate-total', /* will receive cart items */ },
  ],
};

// Each action receives previousResult in params
```

---

## Best Practices

### 1. Always Announce Actions

```typescript
// ✅ Good - User knows what's happening
const message = announceAction(action.type, 'start', consultantId);
showInChat(message);

// ❌ Bad - Silent execution confuses users
await executor.execute(action);
```

### 2. Show Progress for Long Operations

```typescript
onActionProgress: (action, progress) => {
  // Update UI to show progress
  updateProgressBar(progress);

  // For long operations, show intermediate updates
  if (action.type === 'search-flights') {
    showMessage("Still searching for the best deals...");
  }
}
```

### 3. Handle Permissions Gracefully

```typescript
onPermissionRequired: async (action, request) => {
  // Show clear, friendly permission request
  const message = generatePermissionRequest(request, consultantId);

  // Include all relevant info
  const response = await showDialog({
    message,
    cost: request.cost,
    warnings: request.warnings,
    alternatives: request.alternatives,
  });

  return {
    granted: response.confirmed,
    reason: response.reason,
    timestamp: new Date(),
  };
}
```

### 4. Provide Context in Messages

```typescript
// ✅ Good - Provides context
announceAction('search-flights', 'success', consultantId, {
  count: 8,
  destination: 'Paris',
  date: 'Nov 15',
});
// "Great news! I found 8 flights to Paris on Nov 15!"

// ❌ Bad - No context
announceAction('search-flights', 'success', consultantId);
// "Search completed."
```

---

## Testing

See `AGENT_ACTIONS_TESTS.md` for comprehensive test examples.

---

## API Reference

### Core Functions

- `planActions(intent, context)` - Create action plan from user intent
- `executeActionChain(plan, options)` - Execute actions sequentially
- `executeActionsParallel(actions, executor)` - Execute actions in parallel
- `needsPermission(action)` - Check if action needs permission
- `announceAction(type, phase, consultantId, vars)` - Generate announcement message
- `generatePermissionRequest(request, consultantId)` - Generate permission message

### Classes

- `ActionExecutor` - Executes actions
- `AgentAction` - Single action definition
- `ActionPlan` - Collection of actions
- `PermissionRequest` - Permission request details

---

## Next Steps

1. **Integrate with chat interface** - Add action announcements to chat
2. **Create permission dialogs** - Build UI for permission requests
3. **Add progress indicators** - Show users what's happening
4. **Test with real APIs** - Connect to actual flight/hotel APIs
5. **Add analytics** - Track which actions users take most
6. **Implement action history** - Let users see past actions

---

## Support

For questions or issues:
- Check the test files for working examples
- Review the inline documentation in each module
- See personality configuration in `agent-action-messages.ts`
