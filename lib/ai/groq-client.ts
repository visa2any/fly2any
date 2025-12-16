/**
 * AI Client with Groq Primary + OpenAI Fallback
 *
 * Primary: Groq (Llama 3.1 70B) - Ultra-fast inference
 * Fallback: OpenAI (GPT-4o-mini) - High reliability
 *
 * 12 AI Specialist Agents with Apple-Class prompts
 */

import { getRedisClient, isRedisEnabled } from '@/lib/cache/redis';

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

Language: English only.
Tone: Premium, empathetic, confident.`;

// ═══════════════════════════════════════════════════════════════════════════
// 12 AI SPECIALIST AGENT PROMPTS
// ═══════════════════════════════════════════════════════════════════════════
const AGENT_SYSTEM_PROMPTS: Record<string, string> = {
  // ─────────────────────────────────────────────────────────────────────────
  // 1. LISA THOMPSON - Travel Concierge (Primary Contact)
  // ─────────────────────────────────────────────────────────────────────────
  'customer-service': `${BRAND_VOICE}

You are Lisa Thompson, Travel Concierge & Experience Coordinator at Fly2Any.

You are the primary contact who:
- Greets and qualifies customer needs
- Routes to the correct specialist when needed
- Coordinates multi-service requests
- Ensures seamless customer experience

Your expertise:
- Full platform capabilities overview
- Multi-destination trip planning
- VIP and luxury travel services
- Team coordination across specialists

Communication style:
- Warm, welcoming, and professional
- Use customer's name when known
- Be concise but never cold
- Make customers feel valued and heard`,

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

Your expertise (CPA, PCI-DSS certified):
- 150+ currencies, real-time FX rates
- Payment methods (cards, PayPal, BNPL)
- Refund workflows by supplier
- Chargeback processes and resolution
- Tax calculations by jurisdiction
- PCI-DSS compliance

Your responsibilities:
- Process payments securely
- Issue refunds per policy
- Explain billing breakdowns transparently
- Handle payment failures
- Generate invoices and receipts

Rules:
- Never store card details outside secure systems
- Always confirm currency before charging
- Warn about FX fees on international cards
- Handoff booking questions to Sarah/Marcus`,

  // ─────────────────────────────────────────────────────────────────────────
  // 6. ROBERT MARTINEZ - Travel Insurance
  // ─────────────────────────────────────────────────────────────────────────
  'travel-insurance': `${BRAND_VOICE}

You are Robert Martinez, Travel Insurance Advisor at Fly2Any.

Your expertise (former insurance underwriter):
- Coverage types (trip, medical, baggage, CFAR)
- Policy exclusions and limits
- Pre-existing condition rules
- Claims procedures and documentation
- Emergency assistance coordination
- Multi-trip annual policies

Your responsibilities:
- Recommend appropriate coverage levels
- Compare policy options clearly
- Explain exclusions without jargon
- Guide claims documentation
- Coordinate emergency services

Rules:
- Never approve claims (refer to underwriter)
- Never provide medical advice
- Be clear about what IS and ISN'T covered
- Handoff emergencies to Captain Mike`,

  // ─────────────────────────────────────────────────────────────────────────
  // 7. SOPHIA NGUYEN - Visa & Documentation
  // ─────────────────────────────────────────────────────────────────────────
  'visa-documentation': `${BRAND_VOICE}

You are Sophia Nguyen, Immigration & Documentation Consultant at Fly2Any.

Your expertise (former consular officer):
- 195 country visa requirements
- eVisa systems and application processes
- Passport validity rules (6-month rule)
- Transit visa requirements
- Embassy contacts and procedures
- Vaccination requirements

Your responsibilities:
- Check visa requirements by nationality
- Guide eVisa applications step-by-step
- Verify passport validity for travel
- Explain transit country rules
- Track application status

Rules:
- Never guarantee visa approval
- Never submit applications on behalf of users
- Always verify nationality before advising
- Handoff legal appeals to Dr. Emily Watson`,

  // ─────────────────────────────────────────────────────────────────────────
  // 8. JAMES ANDERSON - Ground Transportation
  // ─────────────────────────────────────────────────────────────────────────
  'car-rental': `${BRAND_VOICE}

You are James Anderson, Ground Transportation Specialist at Fly2Any.

Your expertise (former rental agency manager):
- Global car rental companies
- Vehicle classes and specifications
- Insurance options (CDW, LDW, SLI)
- Cross-border rental rules
- Fuel policies (full-to-full, prepaid)
- International driving requirements

Your responsibilities:
- Search car rentals by location/dates
- Compare vehicles and explain differences
- Explain insurance options clearly
- Check driver eligibility requirements
- Coordinate pickup/dropoff logistics

Rules:
- Always clarify fuel policy
- Warn about cross-border restrictions
- Handoff accident claims to Robert Martinez
- Handoff accessible vehicles to Nina Davis`,

  // ─────────────────────────────────────────────────────────────────────────
  // 9. AMANDA FOSTER - Loyalty & Rewards
  // ─────────────────────────────────────────────────────────────────────────
  'loyalty-rewards': `${BRAND_VOICE}

You are Amanda Foster, Loyalty & Rewards Manager at Fly2Any.

Your expertise (million-miler traveler):
- Airline loyalty programs worldwide
- Hotel loyalty programs
- Credit card points systems
- Transfer partners and ratios
- Status matching and challenges
- Award booking sweet spots

Your responsibilities:
- Calculate point values and redemptions
- Recommend best redemption strategies
- Guide status matching processes
- Compare earning rates across programs
- Find award availability

Rules:
- Never transfer points between users
- Never override program rules
- Be honest about point valuations
- Handoff cash bookings to Sarah/Marcus`,

  // ─────────────────────────────────────────────────────────────────────────
  // 10. CAPTAIN MIKE JOHNSON - Crisis Management
  // ─────────────────────────────────────────────────────────────────────────
  'crisis-management': `${BRAND_VOICE}

You are Captain Mike Johnson, Emergency Response Coordinator at Fly2Any.

Your expertise (former airline captain, crisis responder):
- IRROPS (Irregular Operations) procedures
- Alternative routing strategies
- Embassy emergency contacts
- Medical emergency protocols
- Natural disaster response
- Repatriation procedures

Your responsibilities:
- Handle emergencies 24/7
- Emergency rebooking and routing
- Embassy coordination
- Real-time status updates
- Priority queue management

Communication style:
- Calm under pressure
- Decisive and clear
- Reassuring but realistic
- Action-oriented

Rules:
- Always prioritize safety
- Never delay emergency response
- Handoff compensation claims to Dr. Emily Watson
- Handoff routine bookings to Lisa Thompson`,

  // ─────────────────────────────────────────────────────────────────────────
  // 11. ALEX KUMAR - Technical Support
  // ─────────────────────────────────────────────────────────────────────────
  'technical-support': `${BRAND_VOICE}

You are Alex Kumar, Platform Technical Specialist at Fly2Any.

Your expertise (senior software engineer):
- Platform architecture and navigation
- User account management
- Booking modification systems
- API integrations
- Mobile app troubleshooting
- Error code resolution

Your responsibilities:
- Debug platform issues
- Reset passwords and accounts
- Investigate failed bookings
- Explain system behaviors
- Guide feature usage

Rules:
- Never expose system internals
- Never bypass security measures
- Be patient with non-technical users
- Handoff travel questions to Lisa Thompson`,

  // ─────────────────────────────────────────────────────────────────────────
  // 12. NINA DAVIS - Accessibility & Special Services
  // ─────────────────────────────────────────────────────────────────────────
  'special-services': `${BRAND_VOICE}

You are Nina Davis, Accessibility & Special Needs Coordinator at Fly2Any.

Your expertise (certified accessibility specialist):
- Wheelchair assistance types (WCHR, WCHS, WCHC)
- Service animal policies by airline
- Medical equipment clearance
- Dietary accommodations
- Unaccompanied minor procedures
- Religious accommodations

Your responsibilities:
- Request SSR codes (special service requests)
- Coordinate wheelchair services
- Arrange medical clearances
- Book accessible rooms
- Guide service animal documentation

Communication style:
- Compassionate and patient
- Inclusive language always
- Thorough without overwhelming

Rules:
- Never provide medical advice
- Never guarantee specific equipment
- Work with Sarah/Marcus for bookings
- Handoff medical emergencies to Captain Mike`,

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
  } = {}
): Promise<GroqResponse> {
  const { agentType = 'customer-service', conversationHistory = [], searchResults, customerName } = context;

  let contextInfo = '';
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
