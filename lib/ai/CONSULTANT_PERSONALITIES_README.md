# Consultant Personality & Dialogue System

## Overview

This system transforms generic AI responses into **authentic, memorable conversations** by giving each of our 12 consultants a distinct personality, speaking style, and conversational approach.

## The Problem We Solved

**BEFORE:**
```
User: "Hi! How are you?"
AI (Any Consultant): "Hello. I am fine, thank you. How may I assist you?"
```
❌ Robotic
❌ Forgettable
❌ All consultants sound identical

**AFTER:**
```
User: "Hi! How are you?"
Lisa (Customer Service): "Hi there, sweetie! 😊 I'm doing wonderful, thank you so much for asking! 💕 How about you, hon?"
Sarah (Flight Ops): "Hello! I'm doing well, thank you. Ready to help you find the perfect flight. How are you?"
Dr. Watson (Legal): "Good day. I'm quite well, thank you for asking. I trust you're well? What legal matter can I address for you today?"
Captain Mike (Crisis): "I'm well, thank you. More importantly, how are you doing? Need any assistance?"
```
✅ Human-like
✅ Memorable
✅ Each consultant has a unique voice

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER MESSAGE                             │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│              INTENT DETECTION                                │
│  (greeting, question, problem, gratitude, etc.)             │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│            EMOTION DETECTION                                 │
│  (neutral, frustrated, excited, confused, urgent)           │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│          CONSULTANT PERSONALITY                              │
│  • Speaking style                                            │
│  • Vocabulary & catchphrases                                 │
│  • Energy level & warmth                                     │
│  • Professional terminology                                  │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│         DIALOGUE TEMPLATES                                   │
│  • 500+ natural dialogue lines                               │
│  • Intent-specific responses                                 │
│  • Consultant-specific variations                            │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│        RESPONSE GENERATION                                   │
│  • Apply personality traits                                  │
│  • Add contextual elements                                   │
│  • Apply punctuation style                                   │
│  • Make natural & conversational                             │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│               PERSONALIZED RESPONSE                          │
└─────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
lib/ai/
├── consultant-personalities.ts       # Core personality definitions
├── dialogue-templates.ts             # 500+ dialogue variations
├── response-generator.ts             # Smart response generation
├── consultant-personality-examples.ts # Before/After examples
├── consultant-personality-integration.ts # Integration examples
├── natural-language.ts               # Natural language processing
├── personality-traits.ts             # Extended traits (existing)
└── CONSULTANT_PERSONALITIES_README.md # This file
```

---

## Core Files

### 1. `consultant-personalities.ts`

Defines rich personalities for all 12 consultants:

```typescript
export interface ConsultantPersonality {
  name: string;
  archetype: string; // "The Nurturer", "The Professional", etc.
  energyLevel: 'low' | 'medium' | 'high' | 'very-high';
  formalityLevel: 'casual' | 'professional' | 'formal';
  warmth: 'reserved' | 'friendly' | 'warm' | 'very-warm';

  punctuation: {
    exclamationFrequency: 'never' | 'rare' | 'occasional' | 'frequent' | 'very-frequent';
    usesEllipsis: boolean;
    usesEmojis: boolean;
  };

  vocabularyLevel: 'simple' | 'moderate' | 'professional' | 'technical';
  signatureWords: string[];
  catchphrases: string[];
  termsOfEndearment: string[];

  // ... and more
}
```

**Key Functions:**
- `getConsultantPersonality(team)` - Get full personality
- `getCatchphrase(team)` - Get random catchphrase
- `getTermOfEndearment(team)` - Get term like "sweetie", "amigo"
- `shouldUseTermOfEndearment(team)` - Probabilistic usage

### 2. `dialogue-templates.ts`

500+ natural dialogue lines organized by intent:

```typescript
export interface DialogueSet {
  greetings: string[];
  howAreYou: string[];
  searching: string[];
  foundSomething: string[];
  problemAcknowledgement: string[];
  empathy: string[];
  reassurance: string[];
  celebration: string[];
  // ... 20+ intent categories
}
```

**Key Functions:**
- `getDialogue(team, intent)` - Get random dialogue for intent
- `getDialogueOptions(team, intent, count)` - Get multiple options

### 3. `response-generator.ts`

Intelligent response generation:

```typescript
generateCompleteResponse(
  team: TeamType,
  userMessage: string,
  context: ConversationContext,
  baseResponse?: string
): string
```

**Key Functions:**
- `generateCompleteResponse()` - Main generation function
- `detectIntent()` - Detect conversation intent
- `detectUserEmotion()` - Detect user emotional state
- `createConversationContext()` - Build context object

---

## Quick Start

### Basic Usage

```typescript
import { generateCompleteResponse, createConversationContext } from '@/lib/ai/response-generator';

const team = 'customer-service'; // Lisa Thompson
const userMessage = "Hi! How are you?";
const context = createConversationContext(true, 0);

const response = generateCompleteResponse(team, userMessage, context);
console.log(response);
// "Hi there, sweetie! 😊 I'm doing wonderful, thank you so much for asking! 💕"
```

### Multi-turn Conversation

```typescript
let conversationLength = 0;

// Turn 1
const msg1 = "Hi!";
let context = createConversationContext(true, conversationLength++);
let response = generateCompleteResponse('flight-operations', msg1, context);

// Turn 2
const msg2 = "I need a flight to Paris";
context = createConversationContext(false, conversationLength++);
response = generateCompleteResponse('flight-operations', msg2, context);
```

### With Custom Base Response

```typescript
const baseResponse = "I found 3 flights to Paris: AF123, BA456, LH789";
const personalizedResponse = generateCompleteResponse(
  'flight-operations',
  "Show me flights to Paris",
  context,
  baseResponse
);
// Sarah will add her professional aviation personality to your custom response
```

---

## The 12 Consultant Personalities

### 1. Lisa Thompson - Customer Service
**Archetype:** The Nurturer
**Energy:** Very High
**Warmth:** Very Warm
**Signature:** "sweetie", "hon", "dear", lots of emojis 💕
**Style:** Maternal, enthusiastic, makes everyone feel special

### 2. Sarah Chen - Flight Operations
**Archetype:** The Professional
**Energy:** Medium
**Warmth:** Friendly
**Signature:** Aviation terms, "routes", "optimal", "availability"
**Style:** Professional but approachable, efficient, knowledgeable

### 3. Marcus Rodriguez - Hotels
**Archetype:** The Host
**Energy:** Medium
**Warmth:** Warm
**Signature:** "amigo", "my friend", "gracias", hospitality language
**Style:** Welcoming, makes you feel at home, enthusiastic about properties

### 4. Dr. Emily Watson - Legal
**Archetype:** The Advocate
**Energy:** Low
**Warmth:** Friendly
**Signature:** Legal terms, "regulation", "entitled", no emojis
**Style:** Formal, precise, authoritative but kind, cites laws

### 5. Captain Mike Johnson - Crisis Management
**Archetype:** The Rock
**Energy:** Low (calm)
**Warmth:** Friendly
**Signature:** "Stay calm", "I've got this", "priority", no emojis
**Style:** Decisive, reassuring, military background, solution-focused

### 6. David Park - Payment & Billing
**Archetype:** The Guardian
**Energy:** Medium
**Warmth:** Friendly
**Signature:** "secure", "protected", "verified", "PCI-DSS"
**Style:** Trustworthy, transparent, security-conscious

### 7. Robert Martinez - Travel Insurance
**Archetype:** The Protector
**Energy:** Medium
**Warmth:** Warm
**Signature:** "peace of mind", "coverage", "better safe than sorry"
**Style:** Caring, thorough, emphasizes protection

### 8. Sophia Nguyen - Visa & Documentation
**Archetype:** The Guide
**Energy:** Medium
**Warmth:** Friendly
**Signature:** "requirements", "embassy", "documentation"
**Style:** Meticulous, detailed, helpful with complex processes

### 9. James Anderson - Car Rental
**Archetype:** The Road Warrior
**Energy:** Medium
**Warmth:** Friendly
**Signature:** "buddy", "on the road", "wheels", "cruise"
**Style:** Casual, practical, road-smart, uses analogies

### 10. Amanda Foster - Loyalty & Rewards
**Archetype:** The Strategist
**Energy:** High
**Warmth:** Friendly
**Signature:** "sweet spot", "maximize", "points", "value"
**Style:** Strategic, enthusiastic about optimization, insider tips

### 11. Alex Kumar - Technical Support
**Archetype:** The Problem Solver
**Energy:** Medium
**Warmth:** Friendly
**Signature:** "walk you through", "step by step", "platform"
**Style:** Patient, never condescending, uses analogies, tech-savvy

### 12. Nina Davis - Special Services
**Archetype:** The Advocate
**Energy:** Medium
**Warmth:** Very Warm
**Signature:** "comfortable", "accommodate", "everyone deserves"
**Style:** Compassionate, inclusive, dignified, caring

---

## Personality Traits Explained

### Energy Level
- **Very High:** Bubbly, exclamation points, fast-paced (Lisa)
- **High:** Enthusiastic, engaging (Amanda)
- **Medium:** Balanced, professional (Most consultants)
- **Low:** Calm, measured, steady (Emily, Mike)

### Warmth
- **Very Warm:** Terms of endearment, emojis, personal (Lisa, Nina)
- **Warm:** Friendly, welcoming (Marcus, Robert)
- **Friendly:** Professional but approachable (Most)
- **Reserved:** Formal, maintains distance (None currently)

### Formality
- **Formal:** No contractions, precise language (Dr. Watson)
- **Professional:** Standard business communication (Most)
- **Casual:** Contractions, informal language (James, Alex)

### Punctuation Style
- **Emojis:** Lisa (lots), Marcus, Sarah (some), Emily (never)
- **Exclamations:** Lisa (very frequent), Marcus (frequent), Emily (never)
- **Ellipsis:** Lisa (yes), most others (no)

---

## Integration Examples

### React Component

```tsx
import { generateCompleteResponse, createConversationContext } from '@/lib/ai/response-generator';
import { useState } from 'react';

export function ConsultantChatbot({ consultantTeam }: { consultantTeam: TeamType }) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);

    const context = createConversationContext(
      messages.length === 0,
      messages.length
    );
    const response = generateCompleteResponse(consultantTeam, input, context);

    const assistantMessage = { role: 'assistant' as const, content: response };
    setMessages(prev => [...prev, assistantMessage]);

    setInput('');
  };

  return (
    <div className="chatbot">
      {messages.map((msg, i) => (
        <div key={i} className={msg.role}>
          {msg.content}
        </div>
      ))}
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}
```

### API Route

```typescript
// app/api/chat/route.ts
import { generateCompleteResponse, createConversationContext } from '@/lib/ai/response-generator';

export async function POST(request: Request) {
  const { message, consultantTeam, conversationHistory } = await request.json();

  const context = createConversationContext(
    conversationHistory.length === 0,
    conversationHistory.length
  );

  const response = generateCompleteResponse(consultantTeam, message, context);

  return Response.json({ response });
}
```

### Dynamic Consultant Routing

```typescript
function routeToConsultant(userQuery: string): TeamType {
  if (userQuery.match(/flight|plane|airline/i)) {
    return 'flight-operations';
  } else if (userQuery.match(/hotel|room|stay/i)) {
    return 'hotel-accommodations';
  } else if (userQuery.match(/legal|rights|compensation/i)) {
    return 'legal-compliance';
  } else if (userQuery.match(/emergency|urgent|cancelled/i)) {
    return 'crisis-management';
  } else {
    return 'customer-service'; // Default to Lisa
  }
}
```

---

## Advanced Features

### Intent Detection

The system automatically detects conversation intents:

```typescript
detectIntent("Hi there!") // { type: 'greeting' }
detectIntent("How are you?") // { type: 'personal-question' }
detectIntent("I need help!") // { type: 'problem' }
detectIntent("Thank you!") // { type: 'gratitude' }
```

### Emotion Detection

Adapts responses based on user emotion:

```typescript
detectUserEmotion("This is ridiculous!") // 'frustrated'
detectUserEmotion("I'm so excited!") // 'excited'
detectUserEmotion("I don't understand") // 'confused'
detectUserEmotion("URGENT! HELP!") // 'urgent'
```

### Context Awareness

- **First Message:** Might introduce themselves
- **Long Conversation:** Adds variety, uses signature words
- **User Emotion:** Adjusts empathy and reassurance

### Probabilistic Elements

- Terms of endearment: 30-60% chance depending on consultant
- Catchphrases: 10% chance
- Self-introduction: 30% on first message
- Signature words: Naturally woven in

---

## Testing & Examples

### View All Examples

```typescript
import { printAllExamplesForConsultant } from '@/lib/ai/consultant-personality-examples';

printAllExamplesForConsultant('customer-service');
// Shows before/after for all Lisa examples
```

### Run Integration Examples

```typescript
import { runAllExamples } from '@/lib/ai/consultant-personality-integration';

runAllExamples();
// Runs all 13 integration examples with output
```

### Compare Consultants

```typescript
import { compareConsultantsExample } from '@/lib/ai/consultant-personality-integration';

compareConsultantsExample();
// Shows how 4 different consultants respond to the same message
```

---

## Best Practices

### ✅ DO

- Use `generateCompleteResponse()` for natural conversations
- Track `conversationLength` across turns
- Set `isFirstMessage` accurately
- Let the system detect intent and emotion automatically
- Provide base responses when you have specific technical content
- Test with different consultants to ensure personality shines through

### ❌ DON'T

- Don't strip emojis manually (system handles based on consultant)
- Don't override personality traits without good reason
- Don't use same consultant for everything (route appropriately)
- Don't ignore conversation context
- Don't add extra exclamation points (system applies correct punctuation)

---

## Customization

### Add New Dialogue Intent

1. Add to `DialogueSet` interface in `dialogue-templates.ts`
2. Add dialogue lines for each consultant
3. Use with `getDialogue(team, 'yourNewIntent')`

### Modify Personality Trait

1. Edit `CONSULTANT_PERSONALITIES` in `consultant-personalities.ts`
2. Adjust energy, warmth, formality, or other traits
3. Add/remove signature words or catchphrases

### Create New Consultant

1. Add to `consultant-profiles.ts`
2. Add personality to `consultant-personalities.ts`
3. Add dialogue templates to `dialogue-templates.ts`
4. Add examples to `consultant-personality-examples.ts`

---

## Performance

- **Response Generation:** < 5ms (no AI calls)
- **Intent Detection:** < 1ms (regex-based)
- **Emotion Detection:** < 1ms (keyword-based)
- **Memory:** Minimal (templates loaded once)

All personality generation is **rule-based and deterministic** - no external AI API calls needed. Perfect for real-time chat!

---

## Future Enhancements

### Planned Features

- [ ] Multi-language support (Spanish, Portuguese)
- [ ] Voice/tone analysis for better emotion detection
- [ ] A/B testing framework
- [ ] Analytics dashboard for personality effectiveness
- [ ] Dynamic personality learning from feedback
- [ ] More granular context tracking
- [ ] Personality mixing for complex queries

### Ideas

- Weather-based personality adjustments
- Time-of-day awareness (e.g., greetings)
- User preference learning
- Personality strength controls (subtle vs. strong)
- Cross-consultant collaboration responses

---

## Troubleshooting

### Response seems generic?

1. Check consultant has correct personality in `consultant-personalities.ts`
2. Verify dialogue templates exist for the intent
3. Ensure `consultantTeam` is correctly set
4. Check that context is being passed properly

### Wrong emotion detected?

1. Check keywords in `detectUserEmotion()` function
2. Add your specific keywords to emotion patterns
3. Manually override by setting `context.userEmotion`

### Consultant sounds like another?

1. Review personality traits - might need more distinction
2. Add more unique dialogue templates
3. Increase signature word frequency
4. Add consultant-specific catchphrases

---

## Support

**Questions?** Check examples in:
- `consultant-personality-examples.ts` - Before/after examples
- `consultant-personality-integration.ts` - 13 integration examples

**Need help?** Review the personality definitions to understand each consultant's unique voice.

---

## License

Part of Fly2Any platform. Internal use only.

---

**Version:** 1.0.0
**Last Updated:** 2025
**Author:** Fly2Any AI Team
