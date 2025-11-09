# Hybrid AI System Architecture - Fly2Any Travel Platform
**Version**: 2.0 (LLM-Enhanced)
**Date**: November 9, 2025
**Status**: 🔨 IN DEVELOPMENT

---

## 🎯 SYSTEM GOALS

**Primary Objectives**:
1. ✅ Detect and support multiple languages (EN, PT, ES) automatically
2. ✅ Handle 100% of user queries (simple to complex)
3. ✅ Maintain fast response times (< 50ms for 80% of queries)
4. ✅ Provide natural, contextual conversations
5. ✅ Gracefully degrade if LLM APIs fail
6. ✅ Keep costs reasonable (< $200/month for 1000 users/day)
7. ✅ Production-ready with comprehensive error handling

---

## 🏗️ ARCHITECTURE OVERVIEW

```
┌──────────────────────────────────────────────────────────────┐
│                        USER INPUT                            │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  LAYER 1: LANGUAGE DETECTION (Hybrid)                        │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │   Patterns   │ ──Fast──│  LLM Fallback│                  │
│  │  (1-5ms)     │         │  (200-500ms) │                  │
│  └──────────────┘         └──────────────┘                  │
│  • Portuguese keywords    • Complex detection               │
│  • Spanish keywords       • Mixed languages                 │
│  • Language requests      • Ambiguous cases                 │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  LAYER 2: INTENT ANALYSIS (Enhanced)                         │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │200+ Patterns │ ──Fast──│  LLM Context │                  │
│  │  (5-10ms)    │         │  (300-800ms) │                  │
│  └──────────────┘         └──────────────┘                  │
│  • Greeting detection     • Complex queries                 │
│  • Service requests       • Contextual understanding        │
│  • Flight/hotel intents   • Ambiguous intents               │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  LAYER 3: RESPONSE GENERATION (Hybrid)                       │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │  Templates   │ ──Fast──│ LLM Generated│                  │
│  │  (1-2ms)     │         │ (500-1500ms) │                  │
│  └──────────────┘         └──────────────┘                  │
│  • 500+ pre-written       • Contextual responses            │
│  • Consultant personas    • Complex explanations            │
│  • Multi-language         • Edge case handling              │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  LAYER 4: CACHING & OPTIMIZATION                             │
│  • Response cache (Redis) - 1 hour TTL                       │
│  • Language preference persistence (Session)                 │
│  • Intent pattern cache (In-memory)                          │
│  • LLM response cache (Common queries)                       │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  LAYER 5: DELIVERY & UI                                      │
│  • Typing simulation                                         │
│  • Language indicator                                        │
│  • Smooth transitions                                        │
│  • Error feedback                                            │
└──────────────────────────────────────────────────────────────┘
```

---

## 📁 FILE STRUCTURE

```
lib/ai/
├── llm/
│   ├── openai-service.ts           # OpenAI API integration
│   ├── llm-config.ts                # LLM configuration & models
│   ├── llm-cache.ts                 # Response caching
│   ├── llm-fallback.ts              # Error handling & fallbacks
│   └── llm-rate-limit.ts            # Rate limiting & cost control
│
├── language/
│   ├── language-detection.ts        # Hybrid language detection
│   ├── language-patterns.ts         # Pattern-based detection
│   ├── language-switcher.ts         # Dynamic language switching
│   └── language-persistence.ts      # Session language preferences
│
├── intelligence/
│   ├── conversational-intelligence.ts  # Enhanced intent analysis
│   ├── intent-patterns.ts             # Pattern library (existing)
│   ├── intent-llm.ts                  # LLM-based intent detection
│   └── hybrid-analyzer.ts             # Pattern + LLM hybrid
│
├── response/
│   ├── hybrid-response-generator.ts   # Main response orchestrator
│   ├── template-selector.ts           # Template-based responses
│   ├── llm-response-generator.ts      # LLM-based responses
│   └── response-enhancer.ts           # Response polishing
│
└── core/
    ├── consultant-profiles.ts         # Existing consultant system
    ├── emotion-detection.ts           # Existing emotion system
    ├── consultant-handoff.ts          # Enhanced with language
    └── conversation-context.ts        # Enhanced context tracking

components/ai/
├── AITravelAssistant.tsx             # Enhanced with language switching
├── LanguageIndicator.tsx             # NEW: Language UI component
└── AITypingIndicator.tsx             # Enhanced with language

tests/
└── ai/
    ├── language-detection.test.ts    # Comprehensive language tests
    ├── hybrid-system.test.ts         # End-to-end tests
    ├── llm-integration.test.ts       # LLM integration tests
    └── edge-cases.test.ts            # Edge case scenarios
```

---

## 🔧 CORE COMPONENTS

### **1. OpenAI Service** (`lib/ai/llm/openai-service.ts`)

**Responsibilities**:
- Manage OpenAI API connections
- Handle authentication and API keys
- Implement retry logic with exponential backoff
- Track API usage and costs
- Provide streaming responses (future)

**Features**:
```typescript
interface OpenAIServiceConfig {
  apiKey: string;
  model: 'gpt-4o-mini' | 'gpt-4o' | 'gpt-3.5-turbo';
  maxTokens: number;
  temperature: number;
  timeout: number;
  maxRetries: number;
}

class OpenAIService {
  // Core methods
  async generateResponse(prompt: string, context: Context): Promise<string>
  async detectLanguage(text: string): Promise<LanguageResult>
  async analyzeIntent(message: string, history: Message[]): Promise<IntentResult>

  // Utility methods
  async healthCheck(): Promise<boolean>
  getUsageStats(): UsageStats
  estimateCost(tokens: number): number
}
```

---

### **2. Language Detection System** (`lib/ai/language/language-detection.ts`)

**Two-Tier Detection**:

**Tier 1: Pattern-Based (Fast - 1-5ms)**
```typescript
interface PatternDetectionResult {
  language: 'en' | 'pt' | 'es';
  confidence: number;
  indicators: string[];  // Matched keywords
  method: 'pattern';
}

// Patterns
const PORTUGUESE_INDICATORS = [
  // Greetings
  /\b(olá|oi|bom dia|boa tarde|boa noite)\b/i,
  // Common words
  /\b(quero|preciso|gostaria|poderia|você|senhor|senhora)\b/i,
  // Gratitude
  /\b(obrigad[oa]|por favor|desculpe)\b/i,
  // Questions
  /\b(como|quando|onde|por que|quanto)\b/i,
  // Verbs
  /\b(fazer|ter|ser|estar|ir|vir)\b/i,
];

const SPANISH_INDICATORS = [
  // Greetings
  /\b(hola|buenos días|buenas tardes|buenas noches)\b/i,
  // Common words
  /\b(necesito|quiero|quisiera|podría|usted|señor|señora)\b/i,
  // Gratitude
  /\b(gracias|por favor|disculpe|perdón)\b/i,
  // Questions
  /\b(cómo|cuándo|dónde|por qué|cuánto)\b/i,
  // Verbs
  /\b(hacer|tener|ser|estar|ir|venir)\b/i,
];
```

**Tier 2: LLM-Based (Fallback - 200-500ms)**
```typescript
interface LLMDetectionResult {
  language: 'en' | 'pt' | 'es';
  confidence: number;
  reasoning: string;
  method: 'llm';
}

// Used when:
// - Pattern confidence < 70%
// - Mixed language input
// - Ambiguous cases
// - Typos or informal text
```

**Decision Logic**:
```typescript
async function detectLanguage(message: string): Promise<LanguageDetectionResult> {
  // Step 1: Try pattern matching
  const patternResult = detectByPatterns(message);

  if (patternResult.confidence >= 0.85) {
    // High confidence - use pattern result (fast path)
    return patternResult;
  }

  if (patternResult.confidence >= 0.70) {
    // Medium confidence - validate with cache or use pattern
    const cachedResult = await checkLanguageCache(message);
    if (cachedResult) return cachedResult;
    return patternResult;
  }

  // Low confidence - use LLM (slow but accurate)
  try {
    const llmResult = await detectWithLLM(message);
    await cacheLanguageResult(message, llmResult);
    return llmResult;
  } catch (error) {
    // LLM failed - fall back to pattern result or default
    return patternResult.confidence > 0 ? patternResult : { language: 'en', confidence: 0.5, method: 'fallback' };
  }
}
```

---

### **3. Hybrid Intent Analysis** (`lib/ai/intelligence/hybrid-analyzer.ts`)

**Enhanced Intent Detection**:

```typescript
interface IntentAnalysisResult {
  intent: IntentType;
  confidence: number;
  method: 'pattern' | 'llm' | 'hybrid';
  language: 'en' | 'pt' | 'es';
  requiresLLM: boolean;
  context: {
    emotion?: EmotionalState;
    urgency: 'low' | 'medium' | 'high';
    serviceRequest: boolean;
  };
}

async function analyzeIntent(
  message: string,
  conversationHistory: Message[],
  detectedLanguage: 'en' | 'pt' | 'es'
): Promise<IntentAnalysisResult> {

  // Step 1: Pattern matching (existing system)
  const patternAnalysis = analyzeConversationIntent(message, conversationHistory);

  // Step 2: Enhance with language-specific patterns
  const languageEnhancement = analyzeLanguageSpecificPatterns(message, detectedLanguage);

  // Step 3: Decide if LLM is needed
  if (patternAnalysis.confidence >= 0.80 && !languageEnhancement.requiresLLM) {
    // High confidence pattern match - fast path
    return {
      ...patternAnalysis,
      method: 'pattern',
      language: detectedLanguage,
      requiresLLM: false
    };
  }

  // Step 4: Use LLM for complex cases
  try {
    const llmAnalysis = await analyzewithLLM(message, conversationHistory, detectedLanguage);
    return {
      ...llmAnalysis,
      method: 'llm',
      language: detectedLanguage,
      requiresLLM: true
    };
  } catch (error) {
    // LLM failed - use pattern result with lower confidence
    return {
      ...patternAnalysis,
      confidence: patternAnalysis.confidence * 0.8, // Reduce confidence
      method: 'pattern',
      language: detectedLanguage,
      requiresLLM: false
    };
  }
}
```

---

### **4. Hybrid Response Generator** (`lib/ai/response/hybrid-response-generator.ts`)

**Response Strategy**:

```typescript
interface ResponseGenerationConfig {
  useTemplates: boolean;       // Use pre-written templates
  useLLM: boolean;             // Use LLM for generation
  consultant: ConsultantProfile;
  language: 'en' | 'pt' | 'es';
  intent: IntentType;
  emotion: EmotionalState;
}

async function generateResponse(
  userMessage: string,
  context: ConversationContext,
  config: ResponseGenerationConfig
): Promise<string> {

  // Strategy 1: Simple intents → Templates (FAST)
  if (isSimpleIntent(config.intent) && config.useTemplates) {
    const template = selectTemplate(
      config.consultant,
      config.intent,
      config.language,
      config.emotion
    );
    return personalizeTemplate(template, context);
  }

  // Strategy 2: Service requests → Hybrid (Template + LLM enhancement)
  if (config.intent === 'service-request' || config.intent === 'flight-search') {
    const baseTemplate = selectTemplate(config.consultant, config.intent, config.language);

    if (config.useLLM && isComplexQuery(userMessage)) {
      // Enhance template with LLM for specific details
      const enhancement = await enhanceWithLLM(baseTemplate, userMessage, context);
      return enhancement;
    }

    return personalizeTemplate(baseTemplate, context);
  }

  // Strategy 3: Complex queries → Full LLM (INTELLIGENT)
  if (config.useLLM && (isComplexQuery(userMessage) || config.intent === 'complex')) {
    try {
      const llmResponse = await generateLLMResponse(
        userMessage,
        context,
        config.consultant,
        config.language
      );
      return llmResponse;
    } catch (error) {
      // LLM failed - fall back to template
      const fallbackTemplate = selectTemplate(
        config.consultant,
        'default',
        config.language,
        config.emotion
      );
      return personalizeTemplate(fallbackTemplate, context);
    }
  }

  // Default: Template-based
  const template = selectTemplate(config.consultant, config.intent, config.language);
  return personalizeTemplate(template, context);
}
```

---

### **5. Caching Strategy** (`lib/ai/llm/llm-cache.ts`)

**Multi-Layer Caching**:

```typescript
interface CacheStrategy {
  // Layer 1: In-Memory (Instant)
  inMemory: {
    languageDetection: Map<string, LanguageResult>;  // 1000 entries, 1 hour TTL
    commonIntents: Map<string, IntentResult>;         // 500 entries, 1 hour TTL
    templates: Map<string, string>;                   // All templates, permanent
  };

  // Layer 2: Redis (Fast - 10-20ms)
  redis: {
    llmResponses: Map<string, string>;  // Common queries, 24 hour TTL
    languagePreferences: Map<string, 'en' | 'pt' | 'es'>;  // Session-based
    conversationContext: Map<string, Context>;  // Session-based
  };
}

// Cache key generation
function generateCacheKey(
  userMessage: string,
  consultant: string,
  language: string,
  intent: string
): string {
  const normalized = userMessage.toLowerCase().trim();
  const hash = hashString(normalized);
  return `llm:${consultant}:${language}:${intent}:${hash}`;
}

// Cache hit rate target: > 60% for LLM calls
```

---

### **6. Error Handling & Fallbacks** (`lib/ai/llm/llm-fallback.ts`)

**Graceful Degradation**:

```typescript
class LLMFallbackSystem {
  async callWithFallback<T>(
    primary: () => Promise<T>,
    fallback: () => Promise<T>,
    errorHandler: (error: Error) => void
  ): Promise<T> {
    try {
      // Try primary method (LLM)
      return await primary();
    } catch (error) {
      // Log error
      errorHandler(error);

      // Track failure
      this.trackFailure('llm', error);

      // Use fallback (templates)
      try {
        return await fallback();
      } catch (fallbackError) {
        // Even fallback failed - use emergency response
        this.trackFailure('fallback', fallbackError);
        throw new SystemError('Complete system failure', fallbackError);
      }
    }
  }
}

// Error types
enum LLMErrorType {
  API_KEY_INVALID = 'api_key_invalid',
  RATE_LIMIT = 'rate_limit',
  TIMEOUT = 'timeout',
  NETWORK_ERROR = 'network_error',
  INVALID_RESPONSE = 'invalid_response',
  QUOTA_EXCEEDED = 'quota_exceeded',
}

// Retry strategy
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000,      // 1 second
  maxDelay: 10000,         // 10 seconds
  backoffMultiplier: 2,    // Exponential backoff
  retryableErrors: [
    LLMErrorType.TIMEOUT,
    LLMErrorType.NETWORK_ERROR,
    LLMErrorType.RATE_LIMIT,
  ],
};
```

---

## 📊 PERFORMANCE TARGETS

| Metric | Target | Current |
|--------|--------|---------|
| Pattern matching response time | < 50ms | TBD |
| LLM response time | < 2s | TBD |
| Cache hit rate | > 60% | TBD |
| Language detection accuracy | > 95% | TBD |
| Intent detection accuracy | > 90% | TBD |
| System uptime | > 99.5% | TBD |
| Average response quality | 8.5/10 | TBD |

---

## 💰 COST MANAGEMENT

**Daily Budget**: $10 ($300/month)

**Cost Controls**:
1. **Rate Limiting**:
   - 100 LLM calls/hour per user
   - 1000 LLM calls/hour system-wide

2. **Caching**:
   - 60% cache hit rate reduces costs by 60%

3. **Model Selection**:
   - GPT-4o-mini for most queries ($0.150/1M input tokens)
   - GPT-4o only for critical complex queries ($5.00/1M input tokens)

4. **Token Limits**:
   - System prompts: < 500 tokens
   - User context: < 1000 tokens
   - Max response: 300 tokens

**Estimated Costs** (1000 users/day, 20 messages each):
- Total messages: 20,000/day
- Pattern-matched (80%): 16,000 = $0
- LLM calls (20%): 4,000 calls
  - With 60% cache hit: 1,600 actual API calls
  - Average cost per call: $0.002
  - **Daily cost: ~$3.20**
  - **Monthly cost: ~$96**

---

## 🔐 SECURITY & PRIVACY

**API Key Management**:
```typescript
// Environment variables (NEVER commit)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

// Validation
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required');
}

// Rate limiting per user
const userRateLimit = new RateLimiter({
  points: 100,      // 100 requests
  duration: 3600,   // per hour
});
```

**Data Privacy**:
- No PII sent to LLM APIs
- Conversation history truncated to last 5 messages
- User IDs hashed before logging
- GDPR-compliant data retention (24 hours)

---

## 🧪 TESTING STRATEGY

**Test Coverage**: > 80%

**Test Suites**:
1. **Unit Tests**: Each component isolated
2. **Integration Tests**: Full conversation flows
3. **E2E Tests**: Real user scenarios
4. **Load Tests**: 1000 concurrent users
5. **Chaos Tests**: API failures, network issues

**Critical Test Scenarios**:
- ✅ User starts in Portuguese
- ✅ User switches languages mid-conversation
- ✅ OpenAI API is down (fallback to templates)
- ✅ Rate limit reached (queue or graceful error)
- ✅ Complex query with context
- ✅ Typos and informal language
- ✅ Code-switching ("Hi, quero viajar")
- ✅ All 12 consultants in all 3 languages

---

## 📈 MONITORING & OBSERVABILITY

**Metrics to Track**:
```typescript
interface SystemMetrics {
  // Performance
  responseTime: {
    pattern: number[];      // milliseconds
    llm: number[];          // milliseconds
    average: number;
  };

  // Quality
  userSatisfaction: number;   // 1-10 scale
  conversationCompletion: number;  // % completed successfully

  // Usage
  totalMessages: number;
  llmCalls: number;
  cacheHits: number;
  cacheMisses: number;

  // Costs
  dailyCost: number;
  monthlyCost: number;
  costPerConversation: number;

  // Errors
  llmErrors: Map<LLMErrorType, number>;
  fallbackUsage: number;
  systemFailures: number;
}
```

**Alerts**:
- ⚠️ Daily cost > $15
- ⚠️ Error rate > 5%
- ⚠️ Response time > 3s average
- 🔴 System failure rate > 1%

---

## 🚀 DEPLOYMENT PHASES

### **Phase 1: Foundation** (Hours 1-3)
- ✅ Create OpenAI service
- ✅ Implement language detection
- ✅ Add basic error handling
- ✅ Set up caching infrastructure

### **Phase 2: Intelligence** (Hours 4-6)
- ✅ Enhance intent analysis
- ✅ Build hybrid response generator
- ✅ Add LLM fallback system
- ✅ Implement rate limiting

### **Phase 3: Integration** (Hours 7-8)
- ✅ Update AITravelAssistant component
- ✅ Add language switching UI
- ✅ Enhance consultant handoffs
- ✅ Update conversation context

### **Phase 4: Polish** (Hours 9-10)
- ✅ Comprehensive testing
- ✅ Performance optimization
- ✅ Documentation
- ✅ Deployment validation

---

## ✅ SUCCESS CRITERIA

**System is production-ready when**:
1. ✅ All tests passing (> 80% coverage)
2. ✅ Language detection > 95% accurate
3. ✅ Response time < 2s for 95% of queries
4. ✅ Zero critical bugs
5. ✅ Error handling covers all scenarios
6. ✅ Costs within budget (< $5/day initially)
7. ✅ Documentation complete
8. ✅ User testing successful

---

**Status**: 🔨 **READY TO IMPLEMENT**
**Estimated Time**: 10 hours
**Team**: Full Stack + UI/UX + Travel OPS
**Next**: Begin Phase 1 implementation
