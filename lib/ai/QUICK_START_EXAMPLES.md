# Quick Start Examples - Copy & Paste Ready!

## 1. Basic Chat Response

```typescript
import { generateCompleteResponse, createConversationContext } from '@/lib/ai';

// User sends a message
const userMessage = "Hi! How are you?";
const consultantTeam = 'customer-service'; // Lisa Thompson

// Generate personalized response
const context = createConversationContext(true, 0); // first message
const response = generateCompleteResponse(consultantTeam, userMessage, context);

console.log(response);
// Output: "Hi there, sweetie! 😊 I'm doing wonderful, thank you so much for asking! 💕"
```

---

## 2. React Chat Component

```tsx
'use client';

import { useState } from 'react';
import { generateCompleteResponse, createConversationContext } from '@/lib/ai';
import type { TeamType } from '@/lib/ai';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ConsultantChat({ consultant = 'customer-service' }: { consultant?: TeamType }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const newMessages = [...messages, { role: 'user' as const, content: input }];
    setMessages(newMessages);

    // Generate consultant response
    const context = createConversationContext(
      messages.length === 0,
      messages.length
    );
    const response = generateCompleteResponse(consultant, input, context);

    // Add assistant message
    setMessages([...newMessages, { role: 'assistant' as const, content: response }]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <button
            onClick={handleSend}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 3. Next.js API Route

```typescript
// app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { generateCompleteResponse, createConversationContext } from '@/lib/ai';
import type { TeamType } from '@/lib/ai';

interface ChatRequest {
  message: string;
  consultant: TeamType;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export async function POST(request: Request) {
  try {
    const { message, consultant, conversationHistory }: ChatRequest = await request.json();

    // Create context
    const context = createConversationContext(
      conversationHistory.length === 0,
      conversationHistory.length
    );

    // Generate personalized response
    const response = generateCompleteResponse(consultant, message, context);

    return NextResponse.json({ response, success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate response', success: false },
      { status: 500 }
    );
  }
}
```

**Client usage:**
```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: userMessage,
    consultant: 'flight-operations',
    conversationHistory: messages,
  }),
});

const { response: aiResponse } = await response.json();
```

---

## 4. Server Action (Next.js App Router)

```typescript
// app/actions/chat.ts
'use server';

import { generateCompleteResponse, createConversationContext } from '@/lib/ai';
import type { TeamType } from '@/lib/ai';

export async function generateChatResponse(
  message: string,
  consultant: TeamType,
  conversationLength: number
) {
  const context = createConversationContext(
    conversationLength === 0,
    conversationLength
  );

  return generateCompleteResponse(consultant, message, context);
}
```

**Client usage:**
```tsx
'use client';

import { generateChatResponse } from '@/app/actions/chat';

export function ChatComponent() {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSend = async (input: string) => {
    setMessages(prev => [...prev, { role: 'user', content: input }]);

    const response = await generateChatResponse(
      input,
      'customer-service',
      messages.length
    );

    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
  };

  // ...
}
```

---

## 5. Dynamic Consultant Routing

```typescript
import { generateCompleteResponse, createConversationContext } from '@/lib/ai';
import type { TeamType } from '@/lib/ai';

function routeToConsultant(userMessage: string): TeamType {
  const message = userMessage.toLowerCase();

  if (message.match(/flight|plane|airline|boarding|departure|arrival/i)) {
    return 'flight-operations';
  }
  if (message.match(/hotel|room|accommodation|stay|check-in|check-out/i)) {
    return 'hotel-accommodations';
  }
  if (message.match(/legal|rights|compensation|refund|complaint/i)) {
    return 'legal-compliance';
  }
  if (message.match(/emergency|urgent|cancelled|stranded|help!/i)) {
    return 'crisis-management';
  }
  if (message.match(/payment|charge|billing|card|transaction/i)) {
    return 'payment-billing';
  }
  if (message.match(/insurance|coverage|protection|claim/i)) {
    return 'travel-insurance';
  }
  if (message.match(/visa|passport|documentation|embassy/i)) {
    return 'visa-documentation';
  }
  if (message.match(/car|rental|vehicle|drive|road/i)) {
    return 'car-rental';
  }
  if (message.match(/points|miles|rewards|loyalty|elite/i)) {
    return 'loyalty-rewards';
  }
  if (message.match(/technical|bug|error|login|password|platform/i)) {
    return 'technical-support';
  }
  if (message.match(/wheelchair|accessibility|dietary|assistance|special/i)) {
    return 'special-services';
  }

  // Default to customer service
  return 'customer-service';
}

export function handleUserMessage(message: string, conversationLength: number) {
  const consultant = routeToConsultant(message);
  const context = createConversationContext(conversationLength === 0, conversationLength);

  return {
    consultant,
    response: generateCompleteResponse(consultant, message, context),
  };
}
```

---

## 6. Specific Dialogue Intents

```typescript
import { generateDialogueResponse, createConversationContext } from '@/lib/ai';

const context = createConversationContext(false, 2);

// When searching
const searchingMsg = generateDialogueResponse('flight-operations', 'searching', context);
// "Searching through hundreds of airlines now..."

// When found results
const foundMsg = generateDialogueResponse('flight-operations', 'foundSomething', context);
// "I found some excellent options for you!"

// When showing empathy
const empathyMsg = generateDialogueResponse('customer-service', 'empathy', context);
// "I can only imagine how you must feel, sweetie! 💕"

// When reassuring
const reassuranceMsg = generateDialogueResponse('crisis-management', 'reassurance', context);
// "You're going to be fine. I've got this under control."

// When closing
const closingMsg = generateDialogueResponse('customer-service', 'closingOffers', context);
// "Is there anything else I can do for you today, sweetie? 💕"
```

---

## 7. Custom Base Response with Personality

```typescript
import { generateCompleteResponse, createConversationContext } from '@/lib/ai';

// Your technical response
const baseResponse = `
I found 3 flights to Paris:
- AF123: $450, departs 9:00 AM
- BA456: $480, departs 11:30 AM
- LH789: $520, departs 2:00 PM
`;

// Add Sarah's personality
const context = createConversationContext(false, 2);
const personalizedResponse = generateCompleteResponse(
  'flight-operations',
  "Show me flights to Paris",
  context,
  baseResponse
);

// Sarah will add her professional aviation personality to your data
console.log(personalizedResponse);
```

---

## 8. Emotion-Aware Response

```typescript
import {
  generateCompleteResponse,
  createConversationContext,
  detectUserEmotion,
} from '@/lib/ai';

function handleUserMessage(message: string, conversationLength: number) {
  // Detect emotion
  const emotion = detectUserEmotion(message);
  console.log('Detected emotion:', emotion);

  // Create context with emotion awareness
  const context = createConversationContext(false, conversationLength);

  // Generate emotion-aware response
  const response = generateCompleteResponse('customer-service', message, context);

  return { emotion, response };
}

// Example
handleUserMessage("This is ridiculous! It's been 3 days!", 5);
// Emotion: frustrated
// Response: "Oh no, sweetie! I'm so sorry you're dealing with this! 😔..."
```

---

## 9. Multi-Consultant Handoff

```typescript
import { generateCompleteResponse, createConversationContext } from '@/lib/ai';

export function handleConsultantHandoff(
  message: string,
  fromConsultant: TeamType,
  toConsultant: TeamType,
  conversationLength: number
) {
  const context = createConversationContext(false, conversationLength);

  // Closing from first consultant
  const closing = generateDialogueResponse(fromConsultant, 'escalating', context);

  // Greeting from second consultant
  const greeting = generateDialogueResponse(toConsultant, 'greetings', context);

  // Response from second consultant
  const response = generateCompleteResponse(toConsultant, message, context);

  return {
    handoffMessage: `${closing} ${greeting}`,
    response,
  };
}

// Example
handleConsultantHandoff(
  "What are my legal rights?",
  'customer-service',
  'legal-compliance',
  5
);
```

---

## 10. A/B Testing Setup

```typescript
import { generateCompleteResponse, createConversationContext } from '@/lib/ai';

export function abTestPersonality(
  userMessage: string,
  consultant: TeamType,
  conversationLength: number,
  enablePersonality: boolean = true
) {
  if (!enablePersonality) {
    // Generic response
    return "I'll help you with that. What would you like to know?";
  }

  // Personality-enhanced response
  const context = createConversationContext(conversationLength === 0, conversationLength);
  return generateCompleteResponse(consultant, userMessage, context);
}

// Track metrics
function trackEngagement(responseType: 'generic' | 'personality', metrics: {
  responseTime: number;
  userSatisfaction: number;
  conversationLength: number;
}) {
  // Send to analytics
  console.log({ responseType, metrics });
}
```

---

## 11. Load from Environment Variable

```typescript
// .env.local
// DEFAULT_CONSULTANT=customer-service

import { generateCompleteResponse, createConversationContext } from '@/lib/ai';
import type { TeamType } from '@/lib/ai';

const DEFAULT_CONSULTANT = (process.env.DEFAULT_CONSULTANT || 'customer-service') as TeamType;

export function generateResponse(
  message: string,
  conversationLength: number,
  consultant: TeamType = DEFAULT_CONSULTANT
) {
  const context = createConversationContext(conversationLength === 0, conversationLength);
  return generateCompleteResponse(consultant, message, context);
}
```

---

## 12. Testing Helper

```typescript
import { generateCompleteResponse, createConversationContext } from '@/lib/ai';
import type { TeamType } from '@/lib/ai';

export function testConsultantResponse(
  consultant: TeamType,
  message: string,
  conversationLength: number = 0
) {
  console.log('\n=== TEST ===');
  console.log(`Consultant: ${consultant}`);
  console.log(`Message: "${message}"`);
  console.log(`Conversation length: ${conversationLength}`);

  const context = createConversationContext(conversationLength === 0, conversationLength);
  const response = generateCompleteResponse(consultant, message, context);

  console.log(`Response: "${response}"`);
  console.log('============\n');

  return response;
}

// Quick tests
testConsultantResponse('customer-service', 'Hi!', 0);
testConsultantResponse('flight-operations', 'I need a flight to Paris', 2);
testConsultantResponse('crisis-management', 'Emergency! Help!', 0);
```

---

## 13. Webhook Integration

```typescript
// For external chatbot platforms (Slack, Discord, etc.)
import { generateCompleteResponse, createConversationContext } from '@/lib/ai';
import type { TeamType } from '@/lib/ai';

interface WebhookPayload {
  message: string;
  userId: string;
  conversationId: string;
}

export async function handleWebhook(payload: WebhookPayload) {
  // Get conversation history from database
  const history = await getConversationHistory(payload.conversationId);

  // Generate response
  const context = createConversationContext(
    history.length === 0,
    history.length
  );

  const response = generateCompleteResponse(
    'customer-service',
    payload.message,
    context
  );

  // Save to history
  await saveMessage(payload.conversationId, {
    role: 'user',
    content: payload.message,
  });
  await saveMessage(payload.conversationId, {
    role: 'assistant',
    content: response,
  });

  // Return response
  return { response };
}
```

---

## Common Patterns

### Pattern 1: Greeting New Users

```typescript
const context = createConversationContext(true, 0); // first message
const greeting = generateCompleteResponse('customer-service', 'Hi!', context);
```

### Pattern 2: Handling Follow-ups

```typescript
let conversationLength = 5;
const context = createConversationContext(false, conversationLength);
const response = generateCompleteResponse('flight-operations', 'What about baggage?', context);
```

### Pattern 3: Showing Search Progress

```typescript
const searchingMsg = generateDialogueResponse('flight-operations', 'searching', context);
// Show to user immediately

// After search completes
const foundMsg = generateDialogueResponse('flight-operations', 'foundSomething', context);
```

### Pattern 4: Handling Errors

```typescript
try {
  // Your code
} catch (error) {
  const apology = generateDialogueResponse('customer-service', 'apology', context);
  const solution = generateDialogueResponse('technical-support', 'offeringSolution', context);
  return `${apology} ${solution}`;
}
```

---

## TypeScript Types

```typescript
import type {
  TeamType,
  ConversationContext,
  ConversationIntent,
  ConsultantPersonality,
  DialogueSet,
} from '@/lib/ai';

// TeamType values
type ValidTeams =
  | 'customer-service'
  | 'flight-operations'
  | 'hotel-accommodations'
  | 'legal-compliance'
  | 'crisis-management'
  | 'payment-billing'
  | 'travel-insurance'
  | 'visa-documentation'
  | 'car-rental'
  | 'loyalty-rewards'
  | 'technical-support'
  | 'special-services';
```

---

## Tips & Best Practices

1. **Always track conversation length** for context-aware responses
2. **Set isFirstMessage correctly** for proper greetings
3. **Let the system detect intent/emotion** - it's automatic
4. **Route to appropriate consultant** for best results
5. **Test with different consultants** to find the right voice
6. **Use dialogue intents** for specific states (searching, found, etc.)
7. **Provide base responses** when you have technical content
8. **A/B test** personality vs generic to measure impact

---

Ready to get started? Copy any of these examples and start building amazing conversational experiences! 🚀
