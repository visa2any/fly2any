# Typing Simulation Examples

Quick examples showing how to use the typing simulation system.

## Basic Usage

### Simple Response

```typescript
import {
  calculateTypingDelay,
  calculateThinkingDelay,
  detectMessageType
} from '@/lib/utils/typing-simulation';

// 1. Calculate delays
const userMessage = "What's the weather like?";
const response = "The weather is sunny and warm today!";

const messageType = detectMessageType(response);
const thinkingTime = calculateThinkingDelay(userMessage, messageType);
const typingTime = calculateTypingDelay(response, messageType);

console.log(`Thinking: ${thinkingTime}ms`);  // ~500ms
console.log(`Typing: ${typingTime}ms`);      // ~1500ms

// 2. Show indicators
setTypingState({ phase: 'thinking', consultantName: 'Sarah' });
setIsTyping(true);

// 3. Wait for thinking
await new Promise(resolve => setTimeout(resolve, thinkingTime));

// 4. Switch to typing
setTypingState({ phase: 'typing', consultantName: 'Sarah' });

// 5. Wait for typing
await new Promise(resolve => setTimeout(resolve, typingTime));

// 6. Display message
setMessages(prev => [...prev, newMessage]);
setIsTyping(false);
setTypingState(null);
```

## Using Helper Functions

### Single Message

```typescript
// Use the built-in helper (recommended)
await sendAIResponseWithTyping(
  "I can help you book that flight!",
  consultant,
  userMessage
);

// This handles:
// - Thinking phase
// - Typing phase
// - Message display
// - State cleanup
// - Analytics tracking
```

### Multiple Messages

```typescript
// Send a sequence of messages
await sendMultipleAIResponses([
  {
    content: "I found 5 hotels in Paris!",
    additionalData: { hotels: hotelResults }
  },
  {
    content: "All of them have great reviews and are within your budget."
  },
  {
    content: "Would you like to see the details?"
  }
], consultant, userMessage);

// This adds natural pauses between messages
// First message: 0ms delay
// Second message: ~500ms pause
// Third message: ~700ms pause (last message pause)
```

## Different Message Types

### Emergency Response

```typescript
const emergencyMessage = "URGENT: I lost my passport!";
const response = "I'll help you right away! Let me connect you with our emergency team.";

await sendAIResponseWithTyping(response, consultant, emergencyMessage);

// Result:
// - Thinking: ~350ms (faster)
// - Typing: ~1200ms (faster)
// - Total: ~1550ms
```

### Complex Explanation

```typescript
const userMessage = "What are the baggage policies for international flights?";
const response = `For international flights, the standard baggage policy includes:

1. Checked baggage: 2 bags up to 23kg each
2. Cabin baggage: 1 carry-on (7kg) + 1 personal item
3. Additional fees apply for extra or overweight bags
4. Special items like sports equipment have separate regulations

Would you like more details about any specific item?`;

await sendAIResponseWithTyping(response, consultant, userMessage);

// Result:
// - Thinking: ~800ms (user asked complex question)
// - Typing: ~6500ms (long, complex response)
// - Total: ~7300ms
```

### Simple Greeting

```typescript
const userMessage = "Hi!";
const response = "Hello! How can I help you today?";

await sendAIResponseWithTyping(response, consultant, userMessage);

// Result:
// - Thinking: ~400ms
// - Typing: ~1000ms
// - Total: ~1400ms
```

## Manual Delay Calculation

### Custom Delays

```typescript
import { calculateTypingDelay, calculateThinkingDelay } from '@/lib/utils/typing-simulation';

// Calculate delays for different scenarios
const greeting = "Hello!";
const question = "What's the cancellation policy?";
const emergency = "I need urgent help!";

console.log('Greeting typing:', calculateTypingDelay(greeting, 'greeting'));
// ~800ms

console.log('Question typing:', calculateTypingDelay(question, 'question'));
// ~1200ms

console.log('Emergency typing:', calculateTypingDelay(emergency, 'emergency'));
// ~950ms (faster)

console.log('Emergency thinking:', calculateThinkingDelay(emergency, 'emergency'));
// ~300ms (faster)
```

## Flight Search Flow

### Complete Flight Search Example

```typescript
// User sends: "Flight from NYC to Dubai on Nov 15"

// 1. Initial response
await sendAIResponseWithTyping(
  "I'll search for flights for you right away...",
  flightConsultant,
  userMessage,
  { isSearching: true }
);

// 2. Show flight searching indicator
setIsSearchingFlights(true);

// 3. Search flights (API call)
const flights = await searchFlights(origin, destination, date);

// 4. Remove searching state
setIsSearchingFlights(false);
setMessages(prev => prev.filter(m => !m.isSearching));

// 5. Send results with natural pauses
await sendMultipleAIResponses([
  {
    content: "I found these great options for you:",
    additionalData: { flightResults: flights.slice(0, 3) }
  },
  {
    content: "Would you like to proceed with booking any of these flights?"
  }
], flightConsultant, userMessage);
```

## Localized Examples

### English

```typescript
import { getTypingIndicatorText } from '@/lib/utils/typing-simulation';

const text = getTypingIndicatorText('thinking', 'Sarah Chen', 'en');
// "Sarah Chen is reading your message..."

const text2 = getTypingIndicatorText('typing', 'Sarah Chen', 'en');
// "Sarah Chen is typing..."
```

### Portuguese

```typescript
const text = getTypingIndicatorText('thinking', 'Sarah Chen', 'pt');
// "Sarah Chen está lendo sua mensagem..."

const text2 = getTypingIndicatorText('typing', 'Sarah Chen', 'pt');
// "Sarah Chen está digitando..."
```

### Spanish

```typescript
const text = getTypingIndicatorText('thinking', 'Sarah Chen', 'es');
// "Sarah Chen está leyendo tu mensaje..."

const text2 = getTypingIndicatorText('typing', 'Sarah Chen', 'es');
// "Sarah Chen está escribiendo..."
```

## Message Type Detection

### Auto-Detection Examples

```typescript
import { detectMessageType } from '@/lib/utils/typing-simulation';

// Emergency
detectMessageType("URGENT: Help needed!");
// Returns: 'emergency'

// Greeting
detectMessageType("Hi there!");
// Returns: 'greeting'

// Question
detectMessageType("How do I cancel my booking?");
// Returns: 'question'

// Complex
detectMessageType(`
  Here's the detailed breakdown of your refund policy:

  1. Full refund within 24 hours
  2. 50% refund within 7 days
  3. No refund after 7 days

  Additional terms and conditions apply based on...
`);
// Returns: 'complex'

// Long
detectMessageType("A very long message with lots of text explaining various policies and procedures in great detail with multiple sentences and paragraphs that go on for quite a while to provide comprehensive information to the user about all the different aspects of the topic at hand...");
// Returns: 'long'

// Simple
detectMessageType("Yes, that works for me!");
// Returns: 'simple'
```

## Error Handling

### Graceful Degradation

```typescript
// If typing state is not available, fall back to simple display
{isTyping && (
  <div>
    <p>
      {typingState && (typingState.phase === 'thinking' || typingState.phase === 'typing')
        ? getTypingIndicatorText(typingState.phase, typingState.consultantName, language)
        : 'Typing...'}  {/* Fallback */}
    </p>
  </div>
)}
```

### Cleanup on Unmount

```typescript
const typingTimeoutRef = useRef<NodeJS.Timeout>();

// Cleanup effect
useEffect(() => {
  return () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };
}, []);

// Use in delays
await new Promise(resolve => {
  typingTimeoutRef.current = setTimeout(resolve, delay);
});
```

## Testing Different Speeds

### Speed Comparison

```typescript
// Test different message types
const messages = [
  { text: "HELP!", type: 'emergency' },
  { text: "Hi", type: 'greeting' },
  { text: "What's the policy?", type: 'question' },
  { text: "Here's a detailed explanation...", type: 'complex' }
];

for (const msg of messages) {
  const delay = calculateTypingDelay(msg.text, msg.type);
  console.log(`${msg.type}: ${delay}ms`);
}

// Output:
// emergency: ~650ms   (fastest)
// greeting: ~800ms    (normal)
// question: ~1100ms   (slower)
// complex: ~2200ms    (slowest)
```

## Integration with Analytics

```typescript
// Track typing metrics
await sendAIResponseWithTyping(response, consultant, userMessage);

// This automatically tracks:
// - Message sent
// - Consultant assigned
// - Response time
// - Message type

analytics.trackMessage('assistant', {
  team: consultant.team,
  name: consultant.name,
});
```

## Summary

The typing simulation makes interactions feel natural by:
- Showing "reading" before "typing"
- Calculating realistic delays
- Using natural pauses between messages
- Supporting multiple languages
- Handling different message types appropriately

Use the helper functions (`sendAIResponseWithTyping`, `sendMultipleAIResponses`) for the easiest integration!
