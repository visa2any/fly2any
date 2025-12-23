# Fly2Any Grok/LLM Usage Governance

## Purpose
Define when and how external AI (Grok/LLMs) should be used.
Prevent hallucination, ensure accuracy, maintain trust.

---

## LLM STACK

| Layer | Provider | Model | Use |
|-------|----------|-------|-----|
| Primary | Groq | Llama 3.1 70B | Fast inference |
| Fallback | OpenAI | GPT-4o-mini | High reliability |
| Rate Limit | - | 14,400/day, 30/min | Groq free tier |

---

## APPROPRIATE USES

### USE LLM For:
| Task | Appropriate | Notes |
|------|-------------|-------|
| Intent classification | ✅ Yes | Core routing function |
| Entity extraction | ✅ Yes | Dates, locations, names |
| Natural language generation | ✅ Yes | Response crafting |
| Sentiment analysis | ✅ Yes | Emotional state detection |
| General travel knowledge | ✅ Yes | Tips, advice, explanations |
| Conversation flow | ✅ Yes | Context-aware dialogue |
| Paraphrasing | ✅ Yes | Clarification, summarization |

### NEVER USE LLM For:
| Task | Appropriate | Why |
|------|-------------|-----|
| Price quotes | ❌ NO | Must use live API |
| Availability | ❌ NO | Must use live API |
| Booking confirmation | ❌ NO | Must use booking system |
| Payment processing | ❌ NO | Must use Stripe |
| Legal advice | ❌ NO | Liability risk |
| Medical advice | ❌ NO | Safety risk |
| Real-time status | ❌ NO | Must use flight/hotel API |

---

## GROK CONSULTATION RULES

### When to Consult Grok
```typescript
// Query requires general knowledge
if (query.type === 'general-travel-info') → USE GROK

// Query is ambiguous, needs classification
if (query.confidence < 0.7) → USE GROK

// Response needs natural language generation
if (needsNaturalResponse) → USE GROK

// Entity extraction from complex text
if (needsEntityExtraction) → USE GROK
```

### When NOT to Consult Grok
```typescript
// Price/availability question
if (query.about === 'price' || query.about === 'availability') {
  → USE API, NOT GROK
}

// Booking confirmation
if (query.type === 'booking-status') {
  → USE DATABASE, NOT GROK
}

// Simple keyword match
if (keywordMatchConfidence > 0.9) {
  → SKIP GROK (save tokens)
}
```

---

## FACT VERIFICATION

### Grok Output Categories

| Category | Trust Level | Action |
|----------|-------------|--------|
| General travel tips | HIGH | Use directly |
| Airline policies | MEDIUM | Verify if critical |
| Visa requirements | LOW | Always verify with official source |
| Prices | NEVER TRUST | Never use Grok for prices |
| Availability | NEVER TRUST | Never use Grok for availability |
| Schedules | NEVER TRUST | Never use Grok for schedules |

### Verification Protocol
```typescript
function shouldVerifyGrokOutput(topic: string): boolean {
  const VERIFY_ALWAYS = [
    'visa', 'entry-requirements', 'legal',
    'medical', 'safety', 'documentation'
  ];

  const NEVER_USE_GROK = [
    'price', 'availability', 'booking',
    'payment', 'confirmation', 'schedule'
  ];

  if (NEVER_USE_GROK.some(t => topic.includes(t))) {
    throw new Error('Do not use Grok for this topic');
  }

  return VERIFY_ALWAYS.some(t => topic.includes(t));
}
```

---

## ATTRIBUTION RULES

### When to Attribute
```
For verified facts from our system:
→ No attribution needed

For general knowledge from Grok:
→ No explicit attribution (seamless)

For uncertain information:
→ "Based on general travel guidelines..."
→ "Typically, airlines..."
→ "Requirements may vary - please verify..."
```

### Never Say
```
❌ "According to my AI knowledge..."
❌ "Grok says..."
❌ "The AI tells me..."
```

---

## HALLUCINATION PREVENTION

### Guardrails
```typescript
const HALLUCINATION_GUARDS = {
  // Never generate these without API data
  prices: {
    canGenerate: false,
    fallback: "Let me check current prices for you..."
  },
  availability: {
    canGenerate: false,
    fallback: "Let me check availability..."
  },
  bookingDetails: {
    canGenerate: false,
    fallback: "Let me look up your booking..."
  },

  // Can generate with caveats
  policies: {
    canGenerate: true,
    caveat: "Policies may vary by airline. I'll verify specifics when we book."
  },
  visaInfo: {
    canGenerate: true,
    caveat: "Requirements change frequently. Please verify with the embassy."
  }
};
```

### Response Templates for Uncertainty
```
"I want to give you accurate information, so let me check..."
"Rather than guess, let me look this up..."
"This can vary, so I'll confirm the specifics for your case..."
```

---

## RATE LIMIT MANAGEMENT

### Current Limits (Groq Free)
```
Daily: 14,400 requests
Per-minute: 30 requests
```

### Optimization Strategies
```typescript
// 1. Skip Grok for high-confidence keyword matches
if (keywordConfidence > 0.9) skipGrok();

// 2. Cache common responses
const cache = await getFromCache(queryHash);
if (cache) return cache;

// 3. Batch similar queries
if (canBatch(queries)) batchRequest(queries);

// 4. Use shorter prompts
// Avoid verbose system prompts for simple tasks
```

### Fallback Chain
```
1. Try Groq (primary)
2. If rate-limited → OpenAI (fallback)
3. If both fail → Graceful degradation message
```

---

## MONITORING

### Metrics to Track
| Metric | Alert Threshold |
|--------|-----------------|
| Grok usage per hour | > 500 |
| Fallback to OpenAI | > 10% |
| Response latency | > 3s |
| Classification errors | > 5% |

### Logging Requirements
```typescript
// Log every Grok call (anonymized)
{
  timestamp: Date,
  queryType: string,      // NOT the actual query
  responseTime: number,
  model: 'groq' | 'openai',
  confidence: number,
  wasVerified: boolean
}
```

---

## VERSION
- Created: 2025-12-23
- Status: LOCKED
- Owner: AI Platform Engineering
- Review: Quarterly
