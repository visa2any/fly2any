# Human-Like Typing Simulation Guide

This guide explains the realistic human-like typing behavior system implemented for the AI Travel Assistant.

## Overview

The typing simulation system makes the AI assistant feel more natural and human-like by simulating realistic delays and behaviors that mimic how a real person would type and respond.

## Features

### 1. Two-Phase Response System

Every AI response goes through two distinct phases:

#### Phase 1: Thinking (Reading)
- **Duration**: 300-2000ms
- **Purpose**: Simulates the consultant reading and processing the user's message
- **Visual**: Spinning loader with "Reading..." text
- **Indicator**: "{Consultant Name} is reading your message..."

#### Phase 2: Typing
- **Duration**: 800-8000ms (based on message complexity)
- **Purpose**: Simulates the consultant typing the response
- **Visual**: Animated dots
- **Indicator**: "{Consultant Name} is typing..."

### 2. Intelligent Delay Calculation

The system calculates realistic delays based on multiple factors:

#### Message Length
- Base typing speed: 4 characters per second (48 words per minute)
- Professional typing speed that feels natural

#### Complexity Factors
- **Technical terms** (+200ms each): regulation, compensation, policy, flight, booking, etc.
- **Punctuation** (+150ms each): Adds natural pauses at sentence boundaries
- **Numbers** (+100ms each): Careful typing for accuracy
- **URLs/Emails** (+400ms each): Slower typing for precision

#### Message Type Pacing

Different message types have different pacing multipliers:

| Message Type | Speed Multiplier | Description |
|-------------|------------------|-------------|
| Emergency | 0.65x (faster) | Urgent responses get priority |
| Urgent | 0.75x (faster) | Quick response for time-sensitive matters |
| Simple/Greeting | 1.0x (normal) | Standard response speed |
| Question | 1.1x (slightly slower) | More thoughtful responses |
| Complex | 1.25x (slower) | Detailed explanations take time |
| Long | 1.15x (slightly slower) | Extended messages |

### 3. Human Variability

To make typing feel truly human, the system adds:
- **Random variance**: ±20% on typing delays
- **Random variance**: ±15% on thinking delays
- This prevents responses from feeling robotic or predictable

### 4. Multi-Message Flow

For responses that span multiple messages (like flight results + follow-up):

1. **First message**: Normal thinking + typing
2. **Pause**: 400-1200ms between messages
3. **Second message**: Resume typing (no re-thinking)
4. **Last message**: Slightly longer pause (wrap-up thinking)

### 5. Emotional Pacing

The system detects emotion and urgency in messages:

#### Urgent Detection
Messages containing: "urgent", "emergency", "asap", "immediately", "help", "crisis"
- **Result**: Faster response times (0.5x thinking multiplier)

#### Complex Detection
Messages with:
- 3+ technical terms
- 5+ line breaks
- Long explanations (500+ characters)
- **Result**: Slower, more thoughtful responses

## Implementation Details

### Core Files

1. **`lib/utils/typing-simulation.ts`**
   - All typing calculation logic
   - Message type detection
   - Delay calculators

2. **`components/ai/AITravelAssistant.tsx`**
   - Integration with chat UI
   - Phase management
   - Visual indicators

### Key Functions

#### `calculateTypingDelay(message, messageType)`
Calculates how long typing should take based on message content and type.

```typescript
const delay = calculateTypingDelay(
  "Hello! I can help you find flights.",
  'greeting'
);
// Returns: ~1200ms
```

#### `calculateThinkingDelay(userMessage, messageType)`
Calculates "reading time" before typing starts.

```typescript
const thinkingTime = calculateThinkingDelay(
  "I need urgent help with my flight!",
  'emergency'
);
// Returns: ~400ms (faster for urgent)
```

#### `detectMessageType(message)`
Automatically detects the type of message for appropriate pacing.

```typescript
const type = detectMessageType("URGENT: Need help now!");
// Returns: 'emergency'
```

#### `getTypingIndicatorText(phase, consultantName, language)`
Gets localized text for typing indicators.

```typescript
const text = getTypingIndicatorText('thinking', 'Sarah Chen', 'en');
// Returns: "Sarah Chen is reading your message..."
```

### Usage in Components

```typescript
// Send a response with realistic typing
await sendAIResponseWithTyping(
  responseContent,
  consultant,
  userMessage
);

// Send multiple messages with pauses
await sendMultipleAIResponses([
  { content: "I found these flights..." },
  { content: "Would you like to book?" }
], consultant, userMessage);
```

## Visual Indicators

### Thinking State
```
┌─────────────────────────────┐
│ 🤖 Sarah Chen is reading    │
│    your message...          │
│                             │
│  [⚪ spinner] Reading...    │
└─────────────────────────────┘
```

### Typing State
```
┌─────────────────────────────┐
│ 🤖 Sarah Chen is typing...  │
│                             │
│  ● ● ●  (animated)          │
└─────────────────────────────┘
```

### Flight Searching State
```
┌─────────────────────────────┐
│ ✈️ Searching flights...     │
│                             │
│  [⚪ spinner] Finding best  │
│              options...     │
└─────────────────────────────┘
```

## Message Type Detection

The system automatically detects message types:

### Emergency/Urgent
- Keywords: urgent, emergency, asap, help, crisis, lost, stolen
- Pacing: 150% faster

### Greetings
- Patterns: "hi", "hello", "hey", "hola", "olá"
- Length: < 100 characters
- Pacing: Normal

### Questions
- Contains "?" or starts with question words
- Pacing: 10% slower (thoughtful)

### Complex
- 3+ technical terms
- 5+ line breaks
- Pacing: 25% slower

### Long Messages
- 500+ characters
- Pacing: 15% slower

## Localization

The typing indicators support three languages:

### English
- Thinking: "{Name} is reading your message..."
- Typing: "{Name} is typing..."
- Reading: "Reading..."

### Portuguese
- Thinking: "{Name} está lendo sua mensagem..."
- Typing: "{Name} está digitando..."
- Reading: "Lendo..."

### Spanish
- Thinking: "{Name} está leyendo tu mensaje..."
- Typing: "{Name} está escribiendo..."
- Reading: "Leyendo..."

## Configuration

### Delay Ranges

```typescript
// Typing delays
const minDelay = 800;   // 0.8 seconds minimum
const maxDelay = 8000;  // 8 seconds maximum

// Thinking delays
const minThinking = 300;   // 0.3 seconds minimum
const maxThinking = 2000;  // 2 seconds maximum

// Multi-message delays
const minPause = 400;    // 0.4 seconds between messages
const maxPause = 1200;   // 1.2 seconds between messages
```

### Typing Speed

```typescript
const baseCharsPerSecond = 4;  // 240 chars/min, 48 wpm
```

This is calibrated to feel professional but not too fast or slow.

## Best Practices

### 1. Always Use Typing Simulation

```typescript
// ✅ Good: Use typing simulation
await sendAIResponseWithTyping(response, consultant, userMessage);

// ❌ Bad: Instant response
setMessages(prev => [...prev, response]);
```

### 2. Use Multi-Message for Sequences

```typescript
// ✅ Good: Natural pauses between messages
await sendMultipleAIResponses([
  { content: "I found 3 flights..." },
  { content: "Would you like to book?" }
], consultant, userMessage);

// ❌ Bad: No pauses
await sendAIResponseWithTyping(message1, ...);
await sendAIResponseWithTyping(message2, ...); // Too fast!
```

### 3. Let System Detect Message Types

```typescript
// ✅ Good: Automatic detection
await sendAIResponseWithTyping(response, consultant, userMessage);

// ⚠️ Okay: Manual override if needed
const messageType = detectMessageType(response);
const delay = calculateTypingDelay(response, messageType);
```

## Testing

### Manual Testing

1. Open the AI assistant
2. Send various message types:
   - Simple greeting: "Hi"
   - Complex question: "What's the cancellation policy for international flights?"
   - Urgent request: "URGENT: I need help NOW!"
   - Flight search: "Flight from NYC to Dubai on Nov 15"

3. Observe:
   - Thinking indicator appears first
   - Typing indicator follows
   - Delays feel natural and appropriate
   - Consultant name is shown

### Performance Testing

The system is optimized to:
- Use minimal memory (simple calculations)
- Clean up timeouts properly
- Handle rapid user input
- Support concurrent conversations

## Future Enhancements

Potential improvements:

1. **Character-by-character streaming**: Show message being typed in real-time
2. **Typing speed variation**: Different consultants type at different speeds
3. **Emotion-based pacing**: Adjust speed based on detected user emotion
4. **Smart pause detection**: Add pauses at natural break points in long messages
5. **Voice mode simulation**: Different timing for voice vs text responses

## Troubleshooting

### Typing feels too fast/slow

Adjust the `baseCharsPerSecond` in `typing-simulation.ts`:
- Faster: Increase to 5-6 chars/sec
- Slower: Decrease to 3 chars/sec

### No thinking phase showing

Check that `typingState` is being set correctly:
```typescript
setTypingState({
  phase: 'thinking',
  consultantName: consultant.name
});
```

### TypeScript errors

Ensure phase type is correct:
```typescript
// Phase must be 'thinking' or 'typing' for getTypingIndicatorText
if (typingState.phase === 'thinking' || typingState.phase === 'typing') {
  getTypingIndicatorText(typingState.phase, name, language);
}
```

## Summary

The typing simulation system creates a more human and natural feel for the AI assistant by:

1. Simulating realistic "reading" and "typing" phases
2. Calculating delays based on message complexity
3. Adding human-like variability
4. Showing clear visual indicators
5. Supporting multiple languages
6. Handling multi-message flows naturally

This makes users feel like they're chatting with a real person, not a bot, which increases trust and engagement.
