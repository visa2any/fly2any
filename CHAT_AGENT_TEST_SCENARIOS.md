# Chat Agent Test Scenarios - Comprehensive Testing Plan

## Executive Summary
This document outlines comprehensive test scenarios for the Lisa Thompson AI Travel Concierge chat agent. The primary focus is on multilingual support, context persistence, and natural conversation flows.

## Critical Bugs Identified

### 🔴 HIGH PRIORITY - Language Response Bug
**Issue**: Language is detected but responses are in English
**Location**: `natural-responses.ts`, `small-talk.ts`, `conversational-intelligence.ts`
**Impact**: User sets language to Portuguese/Spanish but receives English responses
**Root Cause**: Language parameter not passed to response generation functions

---

## Test Scenarios

### 1. Language Detection & Switching

#### 1.1 Portuguese Language Flow
```
User: "Hi"
Expected: English greeting (user hasn't indicated language yet)
Actual: ✅ Works

User: "quero fazer uma cotação"
Expected: Portuguese response
Actual: ❌ FAILS - Responds in English
```

#### 1.2 Spanish Language Flow
```
User: "Hola"
Expected: Spanish greeting
Actual: Need to test

User: "quiero reservar un vuelo"
Expected: Spanish response
Actual: Need to test
```

#### 1.3 Explicit Language Request
```
User: "Fine thanks! quero fazer uma cotação"
Expected: Detect Portuguese, respond in Portuguese
Actual: ❌ FAILS - Detects but responds in English

User: "pode ser em português?"
Expected: Confirm and switch to Portuguese for ALL future responses
Actual: ❌ FAILS - Confirms in English, continues in English
```

#### 1.4 Language Persistence
```
User: Sets language to Portuguese
User: "Hi" (new session)
Expected: Remember language preference, greet in Portuguese
Actual: Need to test
```

---

### 2. Greeting & Small Talk Scenarios

#### 2.1 Simple Greetings (Each Language)
```
EN: "Hi", "Hello", "Hey", "Good morning"
PT: "Oi", "Olá", "Bom dia", "Boa tarde"
ES: "Hola", "Buenos días", "Buenas tardes"

Expected: Appropriate greeting in same language
Test: First greeting vs returning greeting
```

#### 2.2 How Are You Patterns
```
EN: "How are you?", "How's it going?", "What's up?"
PT: "Como vai?", "Tudo bem?", "Como está?"
ES: "¿Cómo estás?", "¿Qué tal?", "¿Cómo te va?"

Expected: Natural response + ask how user is doing (in same language)
```

#### 2.3 Reciprocal Greetings
```
User: "I'm fine, and you?"
Expected: "I'm great, thanks! What can I help you with?" (warm personality)

User: "Estou bem, e você?"
Expected: Portuguese equivalent
```

#### 2.4 Small Talk Response
```
User: "I'm excited!"
Expected: Match enthusiasm + transition to service

User: "I'm tired, need a vacation"
Expected: Empathetic + suggest escape/getaway

User: "Nice weather today"
Expected: Brief acknowledgment + transition to service
```

---

### 3. Personal Questions

#### 3.1 Identity Questions
```
EN: "Who are you?", "What's your name?"
PT: "Quem é você?", "Qual é o seu nome?"
ES: "¿Quién eres?", "¿Cuál es tu nombre?"

Expected: "I'm Lisa Thompson, your Travel Concierge..." (in appropriate language)
```

#### 3.2 Bot/AI Questions
```
User: "Are you a bot?"
Expected: Honest + friendly explanation + transition

User: "Are you real?"
Expected: Acknowledge AI nature + emphasize helpfulness
```

---

### 4. Service Request Scenarios

#### 4.1 Flight Search Queries
```
EN: "I need a flight from NYC to Dubai"
PT: "Preciso de um voo de São Paulo para Lisboa"
ES: "Necesito un vuelo de Madrid a Nueva York"

Expected:
- Acknowledge in correct language
- Extract flight details
- Initiate search
- Show results in correct language
```

#### 4.2 Hotel Search Queries
```
EN: "Looking for hotels in Paris"
PT: "Procurando hotéis em Lisboa"
ES: "Buscando hoteles en Barcelona"

Expected:
- Respond in correct language
- Ask for dates/guests if missing
- Search and show results
```

#### 4.3 Incomplete Information
```
User: "I want to fly"
Expected: Ask for origin, destination, dates (in user's language)

User: "Need a hotel"
Expected: Ask for city, check-in, check-out, guests
```

---

### 5. Mixed Language & Edge Cases

#### 5.1 Language Switching Mid-Conversation
```
User: "Hi" (English)
Agent: English greeting
User: "Mas prefiro português"
Expected: Switch to Portuguese immediately + acknowledge switch
```

#### 5.2 Multilingual Input
```
User: "I want to fly para Lisboa"
Expected: Detect primary language + respond appropriately
```

#### 5.3 Typos & Informal Language
```
User: "helllo"
User: "wanna fly"
User: "thx"
Expected: Understand intent + respond naturally
```

---

### 6. Context Persistence

#### 6.1 Remembering Previous Interactions
```
User: "How are you?"
Agent: Responds
User: "How are you?" (asks again)
Expected: Different response or "Still great! What can I help with?"
```

#### 6.2 Conversation Flow Tracking
```
User: "Hi"
Agent: Greeting
User: "Hi" again
Agent: Should not repeat initial greeting, use returning greeting
```

#### 6.3 Service Transition Timing
```
Scenario: User chats 3+ messages without service request
Expected: Agent should naturally transition to offering services
```

---

### 7. Gratitude & Farewell

#### 7.1 Thank You Responses
```
EN: "Thanks!", "Thank you so much"
PT: "Obrigado!", "Muito obrigada"
ES: "¡Gracias!", "Muchas gracias"

Expected: Warm acknowledgment + offer continued help (in same language)
```

#### 7.2 Goodbye Handling
```
EN: "Bye", "See you", "Goodbye"
PT: "Tchau", "Até logo", "Adeus"
ES: "Adiós", "Hasta luego", "Nos vemos"

Expected: Friendly farewell + invitation to return (in same language)
```

---

### 8. Consultant Handoff Scenarios

#### 8.1 Flight Specialist Handoff
```
User asks about specific flight
Expected: Lisa should seamlessly hand off to Flight Operations specialist
Test: Handoff message in correct language
```

#### 8.2 Hotel Specialist Handoff
```
User asks about accommodations
Expected: Hand off to Hotel Accommodations specialist
Test: Specialist intro in correct language
```

---

### 9. Error Handling

#### 9.1 No Results Found
```
User: "Flight from Mars to Jupiter"
Expected: Polite error message + ask for clarification (in user's language)
```

#### 9.2 API Errors
```
Service unavailable
Expected: Apologize + suggest alternative (in user's language)
```

#### 9.3 Unclear Intent
```
User: "asdfghjkl"
Expected: Polite confusion + ask to clarify (in user's language)
```

---

### 10. Complex Conversation Flows

#### 10.1 Multi-Turn Booking
```
1. User: "I need to travel"
2. Agent: "Where to?" (in user's language)
3. User: Provides destination
4. Agent: Asks for dates
5. User: Provides dates
6. Agent: Searches + shows results
7. User: Selects option
8. Agent: Confirms + next steps

Test: Language consistency throughout entire flow
```

#### 10.2 Question During Booking
```
User in middle of booking: "Wait, what's the cancellation policy?"
Expected: Answer question + remember booking context
```

#### 10.3 Multiple Service Requests
```
User: "I need a flight AND a hotel"
Expected: Acknowledge both + ask which to start with
```

---

### 11. Emotional Intelligence

#### 11.1 Excited User
```
User: "I'm so excited! First trip abroad!"
Expected: Match enthusiasm + extra warmth
```

#### 11.2 Stressed User
```
User: "I'm so stressed, need this trip ASAP"
Expected: Calm, efficient, reassuring tone
```

#### 11.3 Confused User
```
User: "I don't understand how this works"
Expected: Patient explanation + offer help
```

---

### 12. Edge Cases

#### 12.1 Very Long Messages
```
User: [Paragraph with multiple questions]
Expected: Address all points or prioritize
```

#### 12.2 Special Characters
```
User: "São Paulo → Paris 🛫"
Expected: Parse correctly + respond
```

#### 12.3 Numbers & Dates
```
User: "12/25/2025"
Expected: Understand date format (US vs international)
```

#### 12.4 Multiple Greetings
```
User: "Hi hello hey"
Expected: Single appropriate greeting
```

---

## Testing Checklist

### For Each Scenario:
- [ ] Test in English
- [ ] Test in Portuguese
- [ ] Test in Spanish
- [ ] Verify context persistence
- [ ] Check response uniqueness (no repetition)
- [ ] Validate personality consistency (Lisa's warmth)
- [ ] Ensure smooth service transitions
- [ ] Check emoji usage appropriateness

### Performance Metrics:
- Response time: < 2 seconds
- Language detection accuracy: > 95%
- Intent detection accuracy: > 90%
- User satisfaction: Measured by conversation completion rate

---

## Priority Fixes Needed

### 🔴 CRITICAL (Fix Immediately):
1. ✅ Language parameter missing in `getConversationalResponse()`
2. ✅ All responses in `natural-responses.ts` are English-only
3. ✅ All responses in `small-talk.ts` are English-only
4. ✅ Language not passed from AITravelAssistant to response functions

### 🟡 HIGH (Fix Soon):
5. Context should persist language preference across sessions
6. Consultant handoff messages need language support
7. Error messages need full multilingual coverage

### 🟢 MEDIUM (Enhancement):
8. Add more Portuguese/Spanish response variations
9. Improve regional dialect handling (BR vs PT Portuguese)
10. Add more emotional intelligence patterns

---

## Test Execution Strategy

### Phase 1: Fix Critical Bugs
1. Add language parameter to all response functions
2. Create multilingual response templates
3. Update function calls to pass language

### Phase 2: Manual Testing
1. Test each scenario above manually
2. Document failures
3. Fix bugs iteratively

### Phase 3: Automated Testing
1. Create test suite for language detection
2. Create test suite for intent analysis
3. Create test suite for response generation

### Phase 4: User Acceptance Testing
1. Get real users to test in each language
2. Collect feedback
3. Iterate on conversation flows

---

## Success Criteria

✅ User writes in Portuguese → ALL responses in Portuguese
✅ User writes in Spanish → ALL responses in Spanish
✅ Language persists across conversation
✅ Natural conversation flow (not robotic)
✅ Appropriate personality (warm, helpful Lisa)
✅ No repeated responses in short conversations
✅ Smooth transitions to service requests
✅ Accurate intent detection > 90%
✅ Fast response time < 2s
✅ Context maintained throughout conversation

---

## Notes for Developers

### Current Architecture:
- Template-based responses (300+ patterns)
- No LLM integration
- RegEx intent detection
- Context tracking via ConversationContext class
- 11 specialized consultants with handoff logic

### Language Support Structure:
```typescript
type Language = 'en' | 'pt' | 'es';

// All response functions should accept:
function generateResponse(..., language: Language): string {
  return language === 'en' ? 'English'
       : language === 'pt' ? 'Portuguese'
       : 'Spanish';
}
```

### Testing Tools:
- Browser console for localStorage
- React DevTools for state inspection
- Network tab for API calls
- Chat history export for analysis
