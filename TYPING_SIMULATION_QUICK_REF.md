# Typing Simulation Quick Reference

## Quick Start

```typescript
import { sendAIResponseWithTyping } from '@/components/ai/AITravelAssistant';

// Send a response with realistic typing
await sendAIResponseWithTyping(
  "Your response here",
  consultant,
  userMessage
);
```

## Message Speeds

| Type | Speed | Use Case |
|------|-------|----------|
| Emergency | 150% faster | Urgent help requests |
| Urgent | 133% faster | Time-sensitive matters |
| Simple | Normal | Quick answers, greetings |
| Question | 10% slower | Thoughtful responses |
| Complex | 80% slower | Detailed explanations |
| Long | 87% slower | Extended messages |

## Time Ranges

| Phase | Min | Max | Typical |
|-------|-----|-----|---------|
| Thinking | 300ms | 2000ms | 500-800ms |
| Typing | 800ms | 8000ms | 1500-3000ms |
| Multi-msg pause | 400ms | 1200ms | 500-700ms |

## Functions

### Core Functions
```typescript
// Calculate delays
calculateTypingDelay(message, messageType)
calculateThinkingDelay(userMessage, messageType)
calculateMultiMessageDelay(index, total)

// Detection
detectMessageType(message)
getEmotionalPacing(message)

// UI
getTypingIndicatorText(phase, consultantName, language)
```

### Helper Functions
```typescript
// Single message
await sendAIResponseWithTyping(content, consultant, userMessage)

// Multiple messages
await sendMultipleAIResponses([
  { content: "First message" },
  { content: "Second message" }
], consultant, userMessage)
```

## Message Types

```typescript
'emergency'  // URGENT, help, crisis
'urgent'     // Time-sensitive
'greeting'   // Hi, hello
'question'   // Contains ?
'complex'    // Long, technical
'simple'     // Short, basic
'long'       // 500+ chars
'answer'     // Default
```

## Languages

```typescript
'en'  // English: "Sarah is typing..."
'pt'  // Portuguese: "Sarah está digitando..."
'es'  // Spanish: "Sarah está escribiendo..."
```

## Typing States

```typescript
interface TypingState {
  phase: 'thinking' | 'typing' | 'paused' | 'complete';
  consultantName: string;
  message?: string;
}
```

## Visual Indicators

### Thinking
```
🤖 Sarah is reading your message...
   [spinner] Reading...
```

### Typing
```
🤖 Sarah is typing...
   ● ● ●  (animated dots)
```

## Examples

### Simple Response
```typescript
await sendAIResponseWithTyping(
  "I can help!",
  consultant,
  userMessage
);
// Thinking: ~400ms
// Typing: ~1000ms
// Total: ~1400ms
```

### Emergency Response
```typescript
const msg = "URGENT: I need help NOW!";
await sendAIResponseWithTyping(
  "I'll help right away!",
  consultant,
  msg
);
// Thinking: ~300ms (faster)
// Typing: ~950ms (faster)
// Total: ~1250ms
```

### Multi-Message
```typescript
await sendMultipleAIResponses([
  { content: "I found 5 options!" },
  { content: "All are highly rated." },
  { content: "Would you like to see?" }
], consultant, userMessage);
// Message 1: normal timing
// Pause: 500ms
// Message 2: normal timing
// Pause: 700ms (last)
// Message 3: normal timing
```

## Configuration

Located in `lib/utils/typing-simulation.ts`:

```typescript
const baseCharsPerSecond = 4;  // Typing speed
const minDelay = 800;          // Min typing time
const maxDelay = 8000;         // Max typing time
const minThinking = 300;       // Min thinking time
const maxThinking = 2000;      // Max thinking time
```

## Auto-Detection

The system automatically detects:
- Emergency keywords → faster
- Technical terms → slower
- Punctuation → adds pauses
- Numbers → careful typing
- Message length → proportional time

## Best Practices

✅ **DO:**
- Use `sendAIResponseWithTyping()` for all responses
- Let auto-detection handle message types
- Use `sendMultipleAIResponses()` for sequences
- Test with different message types

❌ **DON'T:**
- Send instant responses
- Skip typing simulation
- Chain multiple single sends (use multi-send instead)
- Manually calculate delays unless needed

## Common Patterns

### Flight Search
```typescript
// Initial
await sendAIResponseWithTyping("Searching...", consultant, userMessage);

// Results
await sendMultipleAIResponses([
  { content: "Found flights!", additionalData: { flights } },
  { content: "Want to book?" }
], consultant, userMessage);
```

### Error Handling
```typescript
try {
  await searchFlights();
} catch (error) {
  await sendAIResponseWithTyping(
    "Error occurred. Please try again.",
    consultant,
    userMessage
  );
}
```

### Localized Response
```typescript
const response = language === 'en'
  ? "I can help!"
  : language === 'pt'
  ? "Posso ajudar!"
  : "¡Puedo ayudar!";

await sendAIResponseWithTyping(response, consultant, userMessage);
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Too fast | Decrease `baseCharsPerSecond` to 3 |
| Too slow | Increase `baseCharsPerSecond` to 5-6 |
| No thinking | Check `typingState.phase === 'thinking'` |
| TypeScript error | Ensure phase is `'thinking' | 'typing'` |

## Key Files

- `lib/utils/typing-simulation.ts` - Core logic
- `components/ai/AITravelAssistant.tsx` - Integration
- `docs/TYPING_SIMULATION_GUIDE.md` - Full guide
- `docs/TYPING_SIMULATION_EXAMPLES.md` - Examples

## Summary

**What it does:** Makes AI responses feel human with realistic delays

**How it works:** Two phases (thinking → typing) with intelligent timing

**Why it matters:** Increases user trust and engagement

**When to use:** Every AI response (always!)
