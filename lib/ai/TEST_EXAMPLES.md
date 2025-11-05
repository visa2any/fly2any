# Conversational Intelligence - Test Examples

## Before & After Comparisons

### Test 1: Simple Greeting

**BEFORE (Robot-like):**
```
User: hi
Bot: How can I help you today?

✈️ Book flights
🏨 Find hotels
🚗 Rent cars
🎫 Create packages
```

**AFTER (Natural - Lisa):**
```
User: hi
Bot: Hi there! 😊 How are you doing today?
```

**AFTER (Natural - Sarah):**
```
User: hi
Bot: Hello! ✨ How are you today?
```

**AFTER (Natural - Captain Mike):**
```
User: hi
Bot: Good day! ✈️ How may I assist you?
```

---

### Test 2: "How Are You" Question

**BEFORE (Robot-like):**
```
User: How are you?
Bot: How can I help you today?

✈️ Book flights
🏨 Find hotels
🚗 Rent cars
```
*Note: Bot IGNORES the question completely!*

**AFTER (Natural - Lisa):**
```
User: How are you?
Bot: I'm doing great, thank you so much for asking! 😊 How about you? How's your day going?
```

**AFTER (Natural - Marcus):**
```
User: How are you?
Bot: I'm doing great, thanks! 🌟 How are things with you today?
```

---

### Test 3: Complete Natural Conversation

**BEFORE (Robot-like):**
```
User: hi
Bot: How can I help you today? [canned menu]

User: How are you?
Bot: How can I help you today? [SAME canned menu - ignoring question!]

User: I'm good
Bot: How can I help you today? [SAME canned menu again!]
```

**AFTER (Natural - Lisa):**
```
User: hi
Bot: Hi there! 😊 How are you doing today?

User: How are you?
Bot: I'm doing great, thank you so much for asking! 😊 How about you? How's your day going?

User: I'm good
Bot: That's wonderful to hear! 😊 I'm so glad! What brings you here today?

User: I need a flight
Bot: Wonderful! I'd love to help you with that. 😊

I can help you find the perfect flight. Where would you like to go? I'll search for the best deals and options for you.
```

---

### Test 4: Different Greeting Variations

**Greetings to Test:**
- hi
- hello
- hey
- good morning
- good afternoon
- good evening
- howdy
- what's up

**Expected Behavior:**
- Each gets a NATURAL, WARM response
- Never jump to canned menu
- Ask how user is doing
- Build rapport first

**Examples:**

```
User: good morning
Lisa: Good morning! Hope you're having a wonderful day! ☀️ How are you?

User: what's up
Marcus: Hey! 🌟 What's up? How are you doing?

User: hello
Sarah: Hello! ✨ How are you today?
```

---

### Test 5: Small Talk Responses

**BEFORE (Robot-like):**
```
User: I'm doing great!
Bot: How can I help you today? [ignores positive sentiment]

User: I'm tired
Bot: How can I help you today? [ignores emotional state]

User: thanks
Bot: How can I help you today? [ignores gratitude]
```

**AFTER (Natural):**
```
User: I'm doing great!
Lisa: That's wonderful to hear! 😊 I'm so glad! What brings you here today?

User: I'm tired
Marcus: Sounds like you could use a getaway! 🌴 Let me help you escape!

User: thanks
Sarah: You're welcome! ✨ Happy to assist.
```

---

### Test 6: Service Requests (Appropriate Menu)

**User Intent:** Clearly asking for service

```
User: I need to book a flight
Lisa: Wonderful! I'd love to help you with that. 😊

I can help you find the perfect flight. Where would you like to go? I'll search for the best deals and options for you.

---

User: Looking for hotels in Paris
Sarah: I can help you find great accommodation. ✨ What city are you looking to stay in? I'll find the best options within your budget.

---

User: Can you help me find cheap flights?
Captain Mike: I'd be happy to help you find the best prices! ✈️ Tell me where you want to go and when, and I'll search for the most budget-friendly options.
```

---

### Test 7: Conversation Flow (Building Rapport)

**Stage 1: Greeting**
```
User: hi
Bot: Hi there! 😊 How are you doing today?
[Context: hasGreeted = true, rapportLevel = 2]
```

**Stage 2: Building Rapport**
```
User: I'm good, how are you?
Bot: I'm doing great, thanks for asking! 😊 How about you?
[Context: hasAskedWellbeing = true, rapportLevel = 5]
```

**Stage 3: Rapport Established, Gentle Transition**
```
User: I'm doing well
Bot: That's wonderful! 😊 So, what can I help you with today?
[Context: rapportEstablished = true, can now offer services]
```

**Stage 4: Service Mode**
```
User: I need a flight
Bot: Perfect! I can definitely help you with that. 😊

Where would you like to go? I'll find the best options for you.
[Context: serviceMode = true]
```

---

### Test 8: Avoid Repetition

**Test:** User says "hi" multiple times

```
User: hi
Bot: Hi there! 😊 How are you doing today?

[User continues conversation, then later...]

User: hi again
Bot: Hey again! 😊 What can I help you with?
[Note: Different response, not repeated!]
```

---

### Test 9: Emotional Intelligence

**Frustration Detection:**
```
User: This is frustrating
Bot: I completely understand your frustration. 😊 Let me help make this easier for you.
```

**Urgency Detection:**
```
User: I need this ASAP
Bot: I understand this is urgent. 😊 Let me help you right away!
```

**Excitement Detection:**
```
User: I'm so excited!
Bot: Your enthusiasm is fantastic! 😊 Let's make it happen!
```

---

### Test 10: Personal Questions

```
User: What's your name?
Lisa: I'm Lisa Thompson, your travel consultant! 😊 I'm here to help make your travel dreams come true! What adventure are you planning?

User: Who are you?
Captain Mike: My name is Captain Mike. ✈️ I'm here to provide expert travel assistance. How can I help you today?

User: Are you a bot?
Sarah: I'm Sarah Chen! ✨ I'm passionate about helping travelers like you. What are you looking for?
```

---

### Test 11: Gratitude

```
User: thanks
Lisa: You're so welcome! 😊 It's my absolute pleasure to help!

User: thank you
Marcus: You're welcome! 🌟 Happy to help!

User: appreciate it
Sarah: My pleasure. ✨ Glad I could help.
```

---

### Test 12: Different Consultant Personalities

**Same greeting, different personalities:**

**Lisa (Warmth: 10, Formality: 3):**
```
User: hi
Bot: Hi there! 😊 How are you doing today?
[Very warm, casual, enthusiastic]
```

**Sarah (Warmth: 7, Formality: 7):**
```
User: hi
Bot: Hello! ✨ How are you today?
[Professional but approachable]
```

**Marcus (Warmth: 9, Formality: 4):**
```
User: hi
Bot: Hey! 🌟 How are you? Hope you're having a wonderful day!
[Friendly, hospitable]
```

**Captain Mike (Warmth: 6, Formality: 8):**
```
User: hi
Bot: Good day! ✈️ How may I assist you?
[Professional, calm, reassuring]
```

---

## Test Scenarios

### Scenario 1: New User, Casual Chat
```
1. User: "hello"
   Expected: Warm greeting + ask how they are

2. User: "I'm good"
   Expected: Positive acknowledgment + gentle inquiry

3. User: "just browsing"
   Expected: Supportive + offer help when ready

4. [Later] User: "actually I need a flight"
   Expected: Enthusiastic + transition to service
```

### Scenario 2: Direct Service Request
```
User: "book me a flight to NYC"
Expected:
- Brief warm acknowledgment
- Transition to service info
- NO lengthy small talk (respect urgency)
```

### Scenario 3: Lost/Confused User
```
User: "I don't know"
Expected:
- Empathetic response
- Helpful guidance
- Present options clearly
```

### Scenario 4: Returning User
```
Context: User has chatted before, context preserved

User: "hi again"
Expected:
- Acknowledge returning ("Hey again!")
- Don't repeat full intro
- Jump to helpfulness
```

---

## Success Criteria Checklist

### ✅ Natural Greetings
- [ ] "hi" gets warm greeting, NOT menu
- [ ] "hello" gets personalized response
- [ ] Different greetings get varied responses
- [ ] Never repeats same greeting twice

### ✅ How Are You Responses
- [ ] "How are you?" gets NATURAL answer
- [ ] Asks back how user is doing
- [ ] Feels like human conversation
- [ ] Matches consultant personality

### ✅ Small Talk Intelligence
- [ ] "I'm good" acknowledged positively
- [ ] "I'm tired" shows empathy
- [ ] "thanks" gets genuine gratitude response
- [ ] Builds rapport before selling

### ✅ Service Transitions
- [ ] Only offers menu when appropriate
- [ ] Builds rapport first (unless urgent request)
- [ ] Smooth transition to business mode
- [ ] Maintains warmth during service

### ✅ Personality Consistency
- [ ] Lisa is very warm and enthusiastic
- [ ] Sarah is professional but friendly
- [ ] Marcus is warm and hospitable
- [ ] Captain Mike is calm and reassuring

### ✅ Context Awareness
- [ ] Tracks conversation history
- [ ] Avoids repetition
- [ ] Remembers user sentiment
- [ ] Adjusts based on rapport level

### ✅ Emotional Intelligence
- [ ] Detects frustration → empathy
- [ ] Detects urgency → fast response
- [ ] Detects excitement → match energy
- [ ] Detects confusion → helpful guidance

---

## Integration Test

```typescript
import {
  analyzeConversationIntent,
  getConversationalResponse,
  ConversationContext
} from '@/lib/ai/conversational-intelligence';

// Test 1: Greeting
const context1 = new ConversationContext();
const analysis1 = analyzeConversationIntent('hi', []);
const response1 = getConversationalResponse(
  analysis1,
  { name: 'Lisa Thompson', personality: 'friendly', emoji: '😊' },
  context1
);
console.log(response1);
// Expected: Natural greeting like "Hi there! 😊 How are you doing today?"

// Test 2: How are you
const analysis2 = analyzeConversationIntent('How are you?', [
  { role: 'user', content: 'hi', timestamp: Date.now() }
]);
const response2 = getConversationalResponse(
  analysis2,
  { name: 'Lisa Thompson', personality: 'friendly', emoji: '😊' },
  context1
);
console.log(response2);
// Expected: Natural response like "I'm doing great, thank you so much for asking! 😊"

// Test 3: Service request
const analysis3 = analyzeConversationIntent('I need to book a flight', []);
const response3 = getConversationalResponse(
  analysis3,
  { name: 'Lisa Thompson', personality: 'friendly', emoji: '😊' },
  context1
);
console.log(response3);
// Expected: Service response with context
```

---

## Manual Testing Guide

### Step 1: Test Basic Greetings
Open chat, try these one at a time:
- "hi"
- "hello"
- "hey"
- "good morning"

**Expected:** Each gets natural, warm response. No canned menus.

### Step 2: Test "How Are You"
Type: "How are you?"

**Expected:** Natural answer + asks how you are. NOT a menu.

### Step 3: Test Small Talk
Type: "I'm doing great!"

**Expected:** Acknowledges positively + asks what brings you here.

### Step 4: Test Service Request
Type: "I need to book a flight"

**Expected:** Warm acknowledgment + specific service help.

### Step 5: Test Different Consultants
Switch between Lisa, Sarah, Marcus, Captain Mike.
Type same greeting to each.

**Expected:** Each responds with their distinct personality.

---

## Debugging Tips

### Issue: Still getting canned responses
**Check:**
1. Is `getConversationalResponse()` being called?
2. Is `ConversationContext` initialized?
3. Is consultant object correct format?

### Issue: Repeating same response
**Check:**
1. Is context being preserved between messages?
2. Is `addInteraction()` being called?

### Issue: Wrong personality
**Check:**
1. Consultant name matches exactly
2. Personality string is correct
3. Emoji is included

### Issue: Jumping to service too fast
**Check:**
1. Rapport building enabled?
2. Context tracking working?
3. Service detection not too aggressive?

---

## Performance Benchmarks

Expected response times:
- Intent analysis: < 5ms
- Response generation: < 10ms
- Context update: < 2ms
- Total overhead: < 20ms

This system adds minimal latency while providing massive UX improvements!
