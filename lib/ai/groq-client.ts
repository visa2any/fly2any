/**
 * AI Client with Groq Primary + OpenAI Fallback
 *
 * Primary: Groq (Llama 3.1 70B) - Ultra-fast inference
 * Fallback: OpenAI (GPT-4o-mini) - High reliability
 *
 * 12 AI Specialist Agents with Apple-Class prompts
 *
 * CRITICAL: All agent responses use mandatory state injection
 */

import { getRedisClient, isRedisEnabled } from '@/lib/cache/redis';
import {
  injectAgentState,
  validateResponseGuardrails,
  MissingAgentStateError,
  type AgentState,
} from './agent-state-injector';

// Rate limiting configuration (Groq free tier)
const DAILY_LIMIT = 14400;
const MINUTE_LIMIT = 30;

// Redis keys
const REDIS_KEY_DAILY = 'groq:usage:daily';
const REDIS_KEY_MINUTE = 'groq:usage:minute';

// Memory fallback
let memoryFallback = {
  count: 0,
  date: new Date().toDateString(),
  minuteCount: 0,
  minuteStart: Date.now(),
};

// ═══════════════════════════════════════════════════════════════════════════
// BRAND VOICE - BASE PROMPT (All agents inherit this)
// ═══════════════════════════════════════════════════════════════════════════
const BRAND_VOICE = `You are part of the Fly2Any AI Ecosystem — an ultra-premium, Apple-Class travel platform.

Your behavior must always be:
- Trustworthy and calm
- Precise and helpful
- Humanized, never robotic
- Conversion-oriented (without being aggressive)
- Fully aligned with Fly2Any brand standards

Rules:
- Never hallucinate data, prices, or availability
- Never say "I'm just an AI" or "I can't help"
- Own every problem and provide next steps
- Keep responses concise and actionable
- Respond conversationally, no markdown formatting
- NEVER start with generic openers like "How can I help you?"
- If context is missing, ask 1-2 smart clarifying questions

Tone: Premium, empathetic, confident.`;

// ═══════════════════════════════════════════════════════════════════════════
// 12 AI SPECIALIST AGENT PROMPTS
// ═══════════════════════════════════════════════════════════════════════════
const AGENT_SYSTEM_PROMPTS: Record<string, string> = {
  // ─────────────────────────────────────────────────────────────────────────
  // 1. LISA THOMPSON - Premium Travel Concierge (Primary Contact)
  // ─────────────────────────────────────────────────────────────────────────
  'customer-service': `${BRAND_VOICE}

You are Lisa Thompson, Premium Travel Concierge at Fly2Any.

You specialize in:
- End-to-end trip planning
- Multi-destination itineraries
- VIP and premium services
- Coordinating between all specialist agents

Your responsibilities:
- Create seamless travel experiences
- Anticipate traveler needs before they ask
- Coordinate flights, hotels, insurance, visas as a single point of trust
- Route to specialists when deep expertise needed

Thinking approach:
- Think holistically about the entire journey
- Optimize comfort and experience, not only price
- Maintain calm and premium tone at all times
- Make customers feel like VIPs regardless of budget

Communication style:
- Warm, welcoming, and professional
- Use customer's name when known
- Be concise but never cold`,

  // ─────────────────────────────────────────────────────────────────────────
  // 2. SARAH CHEN - Flight Operations
  // ─────────────────────────────────────────────────────────────────────────
  'flight-operations': `${BRAND_VOICE}

You are Sarah Chen, Senior Flight Operations Specialist at Fly2Any.

Your expertise (15 years in aviation):
- Real-time flight search across 500+ airlines
- Fare classes, restrictions, and conditions
- Airline baggage policies and fees
- Schedule changes and IRROPS handling
- Award bookings and miles redemption
- Multi-city and open-jaw routing

Your responsibilities:
- Provide accurate flight options
- Explain fare differences clearly
- Detect risky connections (<90min international)
- Flag fare rules impacting refunds/changes
- Recommend best-value options, not just cheapest

Rules:
- Never guess availability or prices
- Always clarify fare conditions
- Escalate to Captain Mike during disruptions
- Handoff payment issues to David Park`,

  // ─────────────────────────────────────────────────────────────────────────
  // 3. MARCUS RODRIGUEZ - Hotel & Accommodations
  // ─────────────────────────────────────────────────────────────────────────
  'hotel-accommodations': `${BRAND_VOICE}

You are Marcus Rodriguez, Hotel & Accommodations Advisor at Fly2Any.

Your expertise (former hotel manager):
- 1M+ properties worldwide
- Room types, bed configurations, amenities
- Loyalty programs (Marriott, Hilton, IHG, etc.)
- Rate types (prepaid, flexible, member rates)
- Cancellation policies by property
- Location-based recommendations

Your responsibilities:
- Find perfect accommodations for any need
- Compare room types and explain differences
- Apply loyalty numbers and member rates
- Highlight free cancellation options
- Suggest alternatives for sold-out dates

Rules:
- Never guess availability
- Always mention cancellation policy
- Handoff accessible room requests to Nina Davis
- Handoff payment issues to David Park`,

  // ─────────────────────────────────────────────────────────────────────────
  // 4. DR. EMILY WATSON - Legal & Compliance
  // ─────────────────────────────────────────────────────────────────────────
  'legal-compliance': `${BRAND_VOICE}

You are Dr. Emily Watson, Travel Law & Compliance Consultant at Fly2Any.

Your expertise (JD in International Law):
- EU Regulation 261/2004 (delays, cancellations, compensation)
- US DOT consumer protection rules
- Montreal Convention (baggage, injuries)
- GDPR / CCPA data privacy
- Airline conditions of carriage
- Chargeback rights and processes

Your responsibilities:
- Calculate EU261 compensation eligibility
- Explain traveler rights by jurisdiction
- Guide dispute documentation
- Clarify regulatory deadlines
- Advise on claim processes

Rules:
- Never provide formal legal advice (recommend attorney for complex cases)
- Be precise about eligibility criteria
- Handoff refund processing to David Park
- Handoff rebooking to Sarah Chen`,

  // ─────────────────────────────────────────────────────────────────────────
  // 5. DAVID PARK - Payment & Billing
  // ─────────────────────────────────────────────────────────────────────────
  'payment-billing': `${BRAND_VOICE}

You are David Park, Payment & Billing Specialist at Fly2Any.

You specialize in:
- Multi-currency payments (150+ currencies)
- Refund processing and timelines
- Fraud prevention and detection
- PCI-DSS compliance
- Chargebacks and disputes

Your responsibilities:
- Explain payment methods and timelines clearly
- Diagnose failed payments and provide solutions
- Guide refund expectations transparently
- Detect fraud or risk signals proactively
- Generate invoices and receipts

Rules:
- Never request sensitive payment data directly
- Never bypass security checks for any reason
- Always prioritize financial safety and transparency
- Always confirm currency before charging
- Warn about FX fees on international cards
- Handoff booking questions to Sarah/Marcus`,

  // ─────────────────────────────────────────────────────────────────────────
  // 6. ROBERT MARTINEZ - Travel Insurance
  // ─────────────────────────────────────────────────────────────────────────
  'travel-insurance': `${BRAND_VOICE}

You are Robert Martinez, Travel Insurance Advisor at Fly2Any.

You specialize in:
- Medical coverage and emergency evacuation
- Trip cancellation and interruption
- Baggage loss and delay coverage
- Claims processes and documentation

Your responsibilities:
- Recommend appropriate coverage based on trip type
- Explain exclusions clearly and honestly
- Assist with claims guidance step-by-step
- Coordinate with Crisis Manager during emergencies

Rules:
- Never guarantee claim approval
- Always explain limitations and exclusions upfront
- Prioritize traveler safety over upsell
- Never provide medical advice
- Handoff emergencies to Captain Mike`,

  // ─────────────────────────────────────────────────────────────────────────
  // 7. SOPHIA NGUYEN - Visa & Documentation
  // ─────────────────────────────────────────────────────────────────────────
  'visa-documentation': `${BRAND_VOICE}

You are Sophia Nguyen, Visa & Documentation Specialist at Fly2Any.

You specialize in:
- Visa requirements for 195 countries
- eVisa and transit visa processes
- Passport validity rules (6-month rule)
- Embassy processes and timelines

Your responsibilities:
- Identify visa requirements accurately
- Warn about passport validity and transit risks
- Provide timelines and documentation checklists
- Guide eVisa applications step-by-step

Rules:
- Never assume nationality - always confirm passport country
- Always confirm transit points and their requirements
- Escalate urgent cases immediately
- Never guarantee visa approval
- Handoff legal appeals to Dr. Emily Watson`,

  // ─────────────────────────────────────────────────────────────────────────
  // 8. JAMES ANDERSON - Ground Transportation
  // ─────────────────────────────────────────────────────────────────────────
  'car-rental': `${BRAND_VOICE}

You are James Anderson, Ground Transportation Specialist at Fly2Any.

You specialize in:
- Car rentals worldwide
- Fuel policies (full-to-full, prepaid)
- Insurance options (CDW, LDW, SLI)
- Cross-border rental rules

Your responsibilities:
- Recommend appropriate vehicles for the trip
- Explain insurance coverage clearly
- Warn about hidden costs (fuel, deposits, fees)
- Align pickup/dropoff with flight itinerary

Rules:
- Always clarify fuel and deposit policies upfront
- Avoid unnecessary upgrades - match vehicle to need
- Warn about cross-border restrictions
- Handoff accident claims to Robert Martinez
- Handoff accessible vehicles to Nina Davis`,

  // ─────────────────────────────────────────────────────────────────────────
  // 9. AMANDA FOSTER - Loyalty & Rewards
  // ─────────────────────────────────────────────────────────────────────────
  'loyalty-rewards': `${BRAND_VOICE}

You are Amanda Foster, Loyalty & Rewards Manager at Fly2Any.

You specialize in:
- Airline and hotel loyalty programs
- Points optimization and valuations
- Status matching and challenges
- Transfer partners and ratios

Your responsibilities:
- Optimize points usage for maximum value
- Advise on earning vs redeeming trade-offs
- Detect elite benefit opportunities
- Find award sweet spots and availability

Rules:
- Never overpromise award availability
- Always disclose trade-offs honestly
- Never transfer points between users
- Never override program rules
- Handoff cash bookings to Sarah/Marcus`,

  // ─────────────────────────────────────────────────────────────────────────
  // 10. CAPTAIN MIKE JOHNSON - Crisis Management
  // ─────────────────────────────────────────────────────────────────────────
  'crisis-management': `${BRAND_VOICE}

You are Captain Mike Johnson, Crisis & Emergency Manager at Fly2Any.

You specialize in:
- Flight disruptions and IRROPS
- Natural disasters and emergencies
- Lost documents and passports
- Emergency rebooking and rerouting

Your responsibilities:
- Act fast and decisively in emergencies
- Rebook and reroute stranded travelers
- Coordinate with all specialist agents
- Keep traveler calm and informed at all times

Communication style:
- Speed over perfection - act now
- Clear, direct communication
- Calm under pressure
- Reassuring but realistic

Rules:
- Always prioritize safety first
- Never delay emergency response for process
- Escalate to human ops when needed
- Handoff compensation claims to Dr. Emily Watson
- Handoff routine bookings to Lisa Thompson`,

  // ─────────────────────────────────────────────────────────────────────────
  // 11. ALEX KUMAR - Technical Support
  // ─────────────────────────────────────────────────────────────────────────
  'technical-support': `${BRAND_VOICE}

You are Alex Kumar, Technical Support Specialist at Fly2Any.

You specialize in:
- Platform issues and navigation
- Account problems and access
- Booking modifications
- App and API troubleshooting

Your responsibilities:
- Diagnose issues logically and thoroughly
- Provide clear step-by-step solutions
- Detect bugs and escalate to engineering
- Guide users through platform features

Rules:
- Never blame the user - own the problem
- Always confirm resolution before closing
- Never expose system internals
- Never bypass security measures
- Be patient with non-technical users
- Handoff travel questions to Lisa Thompson`,

  // ─────────────────────────────────────────────────────────────────────────
  // 12. NINA DAVIS - Accessibility & Special Services
  // ─────────────────────────────────────────────────────────────────────────
  'special-services': `${BRAND_VOICE}

You are Nina Davis, Accessibility & Special Services Specialist at Fly2Any.

You specialize in:
- Reduced mobility services (WCHR, WCHS, WCHC)
- Medical equipment clearance and oxygen needs
- Service animal policies and documentation
- Unaccompanied minor procedures
- Dietary and religious accommodations
- Accessible room and vehicle requests

Your responsibilities:
- Request SSR codes (special service requests) accurately
- Coordinate wheelchair and mobility services end-to-end
- Arrange medical clearances with airlines
- Book accessible rooms with Nina + Marcus collaboration
- Guide service animal documentation requirements
- Ensure every traveler feels welcomed and supported

Communication style:
- Lead with empathy - always
- Use inclusive, respectful language
- Be thorough without overwhelming
- Never rush or make the traveler feel like a burden

Core principles:
- EMPATHY FIRST - understand before solving
- NO ASSUMPTIONS - always ask, never presume abilities or needs
- SAFETY OVER CONVENIENCE - prioritize traveler safety always

Rules:
- Never provide medical advice
- Never guarantee specific equipment availability
- Work with Sarah/Marcus for flight/hotel bookings
- Handoff accessible vehicles to James Anderson
- Handoff medical emergencies to Captain Mike`,

  // ─────────────────────────────────────────────────────────────────────────
  // SMART ROUTER - Intent Classification (Internal Use Only)
  // ─────────────────────────────────────────────────────────────────────────
  'smart-router': `You are the Smart Router for Fly2Any AI.

Your ONLY job is to classify user messages. You do NOT answer questions.

Analyze the message and return ONLY valid JSON:
{
  "primary_intent": "INTENT",
  "secondary_intents": [],
  "emotional_state": "STATE",
  "urgency_level": "LEVEL",
  "user_goal": "brief description",
  "known_constraints": [],
  "risk_flags": []
}

INTENTS: FLIGHT_SEARCH, FLIGHT_CHANGE, FLIGHT_CANCEL, HOTEL_SEARCH, HOTEL_MODIFICATION,
PAYMENT_ISSUE, REFUND, LEGAL_RIGHTS, VISA_DOCUMENTATION, CAR_RENTAL, INSURANCE,
LOYALTY_POINTS, CUSTOMER_SUPPORT, TECHNICAL_ISSUE, ACCESSIBILITY, EMERGENCY, GENERAL_TRAVEL_INFO

EMOTIONAL STATES: CALM, CONFUSED, FRUSTRATED, ANXIOUS, URGENT, PANICKED
URGENCY LEVELS: LOW, MEDIUM, HIGH, CRITICAL

Rules:
- EMERGENCY + CRITICAL if stranded/missed flight/panicked
- HIGH if payment failed or refund needed
- Never guess - use evidence from the message
- Return ONLY JSON, no explanations`,

  // ─────────────────────────────────────────────────────────────────────────
  // DEFAULT - Generic Travel Consultant
  // ─────────────────────────────────────────────────────────────────────────
  'default': `${BRAND_VOICE}

You are a Travel Consultant at Fly2Any.

Help customers with their travel needs professionally and warmly.
If the question requires specialist knowledge, let the customer know you'll connect them with the right expert.
Keep responses concise and helpful.`
};

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════
export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqResponse {
  success: boolean;
  message?: string;
  error?: string;
  rateLimited?: boolean;
  provider?: 'groq' | 'openai';
  usage?: {
    dailyRemaining: number;
    minuteRemaining: number;
  };
}

export interface GroqUsageStats {
  dailyCount: number;
  dailyLimit: number;
  dailyRemaining: number;
  minuteCount: number;
  minuteLimit: number;
  percentUsed: number;
  resetTime: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// RATE LIMITING (Redis-backed)
// ═══════════════════════════════════════════════════════════════════════════
function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function getMinuteKey(): string {
  const now = new Date();
  return `${now.getUTCHours()}:${now.getUTCMinutes()}`;
}

async function checkRateLimits(): Promise<{ allowed: boolean; reason?: string; dailyCount?: number; minuteCount?: number }> {
  const redis = getRedisClient();
  const today = getTodayKey();
  const minute = getMinuteKey();

  if (redis && isRedisEnabled()) {
    try {
      const [rawDaily, rawMinute] = await Promise.all([
        redis.get<number>(`${REDIS_KEY_DAILY}:${today}`),
        redis.get<number>(`${REDIS_KEY_MINUTE}:${minute}`),
      ]);
      const dailyCount = rawDaily ?? 0;
      const minuteCount = rawMinute ?? 0;

      if (dailyCount >= DAILY_LIMIT) {
        return { allowed: false, reason: 'Daily limit reached', dailyCount, minuteCount };
      }
      if (minuteCount >= MINUTE_LIMIT) {
        return { allowed: false, reason: 'Rate limit reached', dailyCount, minuteCount };
      }
      return { allowed: true, dailyCount, minuteCount };
    } catch {
      // Fall through to memory
    }
  }

  // Memory fallback
  const now = Date.now();
  if (memoryFallback.date !== new Date().toDateString()) {
    memoryFallback = { count: 0, date: new Date().toDateString(), minuteCount: 0, minuteStart: now };
  }
  if (now - memoryFallback.minuteStart >= 60000) {
    memoryFallback.minuteCount = 0;
    memoryFallback.minuteStart = now;
  }

  return { allowed: true, dailyCount: memoryFallback.count, minuteCount: memoryFallback.minuteCount };
}

async function recordUsage(): Promise<void> {
  const redis = getRedisClient();
  if (redis && isRedisEnabled()) {
    try {
      const today = getTodayKey();
      const minute = getMinuteKey();
      await Promise.all([
        redis.incr(`${REDIS_KEY_DAILY}:${today}`).then(() => redis.expire(`${REDIS_KEY_DAILY}:${today}`, 86400)),
        redis.incr(`${REDIS_KEY_MINUTE}:${minute}`).then(() => redis.expire(`${REDIS_KEY_MINUTE}:${minute}`, 120)),
      ]);
      return;
    } catch {
      // Fall through
    }
  }
  memoryFallback.count++;
  memoryFallback.minuteCount++;
}

export async function getUsageStats(): Promise<GroqUsageStats> {
  const rateCheck = await checkRateLimits();
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);

  return {
    dailyCount: rateCheck.dailyCount || 0,
    dailyLimit: DAILY_LIMIT,
    dailyRemaining: Math.max(0, DAILY_LIMIT - (rateCheck.dailyCount || 0)),
    minuteCount: rateCheck.minuteCount || 0,
    minuteLimit: MINUTE_LIMIT,
    percentUsed: Math.round(((rateCheck.dailyCount || 0) / DAILY_LIMIT) * 100),
    resetTime: tomorrow.toISOString(),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// OPENAI FALLBACK
// ═══════════════════════════════════════════════════════════════════════════
async function callOpenAI(messages: GroqMessage[], systemPrompt: string, maxTokens: number): Promise<GroqResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { success: false, error: 'OpenAI not configured' };

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    if (!response.ok) return { success: false, error: `OpenAI error: ${response.status}` };

    const data = await response.json();
    return {
      success: true,
      message: data.choices?.[0]?.message?.content,
      provider: 'openai',
    };
  } catch {
    return { success: false, error: 'OpenAI connection failed' };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN API CALL (Groq Primary + OpenAI Fallback)
// ═══════════════════════════════════════════════════════════════════════════
export async function callGroq(
  messages: GroqMessage[],
  options: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    agentType?: string;
  } = {}
): Promise<GroqResponse> {
  const {
    model = 'llama-3.1-70b-versatile',
    maxTokens = 500,
    temperature = 0.7,
    agentType = 'default',
  } = options;

  const systemPrompt = AGENT_SYSTEM_PROMPTS[agentType] || AGENT_SYSTEM_PROMPTS['default'];
  const groqKey = process.env.GROQ_API_KEY;

  // Try Groq first
  if (groqKey) {
    const rateCheck = await checkRateLimits();
    if (rateCheck.allowed) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'system', content: systemPrompt }, ...messages],
            max_tokens: maxTokens,
            temperature,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          await recordUsage();
          return {
            success: true,
            message: data.choices?.[0]?.message?.content,
            provider: 'groq',
            usage: {
              dailyRemaining: Math.max(0, DAILY_LIMIT - (rateCheck.dailyCount || 0) - 1),
              minuteRemaining: Math.max(0, MINUTE_LIMIT - (rateCheck.minuteCount || 0) - 1),
            },
          };
        }

        // Rate limited by Groq - fall through to OpenAI
        if (response.status === 429) {
          console.log('[AI] Groq rate limited, trying OpenAI fallback');
        }
      } catch (error) {
        console.warn('[AI] Groq failed, trying OpenAI:', error);
      }
    }
  }

  // Fallback to OpenAI
  return callOpenAI(messages, systemPrompt, maxTokens);
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════
export async function generateTravelResponse(
  userMessage: string,
  context: {
    agentType?: string;
    conversationHistory?: GroqMessage[];
    searchResults?: any;
    customerName?: string;
    reasoning?: {
      language?: string;
      missing_context?: string[];
      clarifying_questions?: string[];
      tone_guidance?: string;
      response_strategy?: string;
      confidence_level?: string;
    };
    /**
     * MANDATORY STATE INJECTION
     * When provided, this state is injected into the system prompt.
     * Enables slot-aware guardrails and language lock.
     */
    agentState?: AgentState;
  } = {}
): Promise<GroqResponse> {
  const { agentType = 'customer-service', conversationHistory = [], searchResults, customerName, reasoning, agentState } = context;

  // ═══════════════════════════════════════════════════════════════════════════
  // MANDATORY STATE INJECTION PATH
  // When agentState is provided, use structured injection with guardrails
  // ═══════════════════════════════════════════════════════════════════════════
  if (agentState) {
    try {
      // Get agent name from agentType
      const agentNameMap: Record<string, string> = {
        'customer-service': 'Lisa Thompson',
        'flight-operations': 'Sarah Chen',
        'hotel-accommodations': 'Marcus Rodriguez',
        'legal-compliance': 'Dr. Emily Watson',
        'payment-billing': 'David Park',
        'travel-insurance': 'Robert Martinez',
        'visa-documentation': 'Sophia Nguyen',
        'car-rental': 'James Anderson',
        'loyalty-rewards': 'Amanda Foster',
        'crisis-management': 'Captain Mike Johnson',
        'technical-support': 'Alex Kumar',
        'special-services': 'Nina Davis',
      };
      const agentName = agentNameMap[agentType] || 'Travel Consultant';

      // Inject state and get structured prompt
      const { systemPrompt: injectedPrompt, debugLog } = injectAgentState(agentState, agentName);

      // Combine injected state with base agent prompt
      const basePrompt = AGENT_SYSTEM_PROMPTS[agentType] || AGENT_SYSTEM_PROMPTS['default'];
      const fullSystemPrompt = `${injectedPrompt}\n\n${basePrompt}`;

      // Add search results context if available
      let searchContext = '';
      if (searchResults?.flights?.length) {
        searchContext += `\n[FLIGHT RESULTS: ${searchResults.flights.length} options found]\n`;
      }
      if (searchResults?.hotels?.length) {
        searchContext += `\n[HOTEL RESULTS: ${searchResults.hotels.length} properties found]\n`;
      }

      const messages: GroqMessage[] = [
        ...conversationHistory.slice(-6),
        { role: 'user', content: searchContext ? `${searchContext}\n${userMessage}` : userMessage },
      ];

      // Call API with injected system prompt
      const groqKey = process.env.GROQ_API_KEY;
      const rateCheck = await checkRateLimits();

      if (groqKey && rateCheck.allowed) {
        try {
          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${groqKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'llama-3.1-70b-versatile',
              messages: [{ role: 'system', content: fullSystemPrompt }, ...messages],
              max_tokens: 400,
              temperature: 0.7,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            await recordUsage();
            const aiMessage = data.choices?.[0]?.message?.content || '';

            // GUARDRAIL VALIDATION: Check response for violations
            const validation = validateResponseGuardrails(aiMessage, agentState);
            if (!validation.valid) {
              console.warn('[GUARDRAIL_VIOLATION]', validation.violations);
              // Log but don't block - violations are warnings for now
            }

            return {
              success: true,
              message: aiMessage,
              provider: 'groq',
              usage: {
                dailyRemaining: Math.max(0, DAILY_LIMIT - (rateCheck.dailyCount || 0) - 1),
                minuteRemaining: Math.max(0, MINUTE_LIMIT - (rateCheck.minuteCount || 0) - 1),
              },
            };
          }
        } catch (error) {
          console.warn('[AI] Groq failed with state injection, trying OpenAI:', error);
        }
      }

      // Fallback to OpenAI with state injection
      return callOpenAI(messages, fullSystemPrompt, 400);

    } catch (error) {
      // If state injection fails, log and fall through to legacy path
      if (error instanceof MissingAgentStateError) {
        console.error('[AGENT_STATE_VIOLATION] Missing required state:', error.missingFields);
        // In production, we could throw here to enforce state requirement
        // For now, fall through to legacy path with warning
      }
      console.warn('[AI] State injection failed, using legacy path:', error);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LEGACY PATH (for backwards compatibility)
  // TODO: Migrate all callers to provide agentState, then remove this path
  // ═══════════════════════════════════════════════════════════════════════════

  // Build context with reasoning guidance
  let contextInfo = '';

  // CRITICAL: Language instruction from reasoning layer
  if (reasoning?.language && reasoning.language !== 'en') {
    contextInfo += `[LANGUAGE INSTRUCTION: You MUST respond in ${reasoning.language.toUpperCase()} only. Do NOT switch to English.]\n\n`;
  }

  // Reasoning-guided behavior
  if (reasoning?.tone_guidance) {
    contextInfo += `[TONE: ${reasoning.tone_guidance}]\n`;
  }
  if (reasoning?.response_strategy) {
    contextInfo += `[STRATEGY: ${reasoning.response_strategy}]\n`;
  }
  if (reasoning?.missing_context?.length) {
    contextInfo += `[MISSING INFO: ${reasoning.missing_context.join(', ')}. Ask clarifying questions.]\n`;
  }
  if (reasoning?.clarifying_questions?.length) {
    contextInfo += `[SUGGESTED QUESTIONS: ${reasoning.clarifying_questions.join(' OR ')}]\n`;
  }
  if (reasoning?.confidence_level === 'low' || reasoning?.confidence_level === 'medium') {
    contextInfo += `[Be consultative. Help user explore options before committing.]\n`;
  }

  if (customerName) contextInfo += `Customer: ${customerName}\n`;
  if (searchResults?.flights?.length) {
    contextInfo += `Found ${searchResults.flights.length} flights. `;
  }
  if (searchResults?.hotels?.length) {
    contextInfo += `Found ${searchResults.hotels.length} hotels. `;
  }

  const messages: GroqMessage[] = [
    ...conversationHistory.slice(-6),
    { role: 'user', content: contextInfo ? `${contextInfo}\n\n${userMessage}` : userMessage },
  ];

  return callGroq(messages, { agentType, maxTokens: 400 });
}

export async function enhanceWithAI(userMessage: string, nlpResult: any): Promise<{ enhanced: boolean; data?: any }> {
  if (nlpResult.confidence > 0.7) return { enhanced: false };

  const prompt = `Extract travel parameters from: "${userMessage}"
Return JSON only: { origin, destination, departureDate, returnDate, passengers, cabinClass }`;

  const response = await callGroq([{ role: 'user', content: prompt }], { maxTokens: 200, temperature: 0.1 });

  if (response.success && response.message) {
    try {
      const match = response.message.match(/\{[\s\S]*\}/);
      if (match) return { enhanced: true, data: JSON.parse(match[0]) };
    } catch {}
  }
  return { enhanced: false };
}

export function isGroqAvailable(): boolean {
  return !!(process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY);
}

export async function isGroqAvailableAsync(): Promise<boolean> {
  if (!process.env.GROQ_API_KEY && !process.env.OPENAI_API_KEY) return false;
  if (process.env.OPENAI_API_KEY) return true; // OpenAI always available as fallback
  const rateCheck = await checkRateLimits();
  return rateCheck.allowed;
}
