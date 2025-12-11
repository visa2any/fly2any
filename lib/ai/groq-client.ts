/**
 * Groq AI Client with Distributed Rate Limiting
 * Uses Llama 3.1 70B for blazing-fast inference
 * Free tier: 14,400 requests/day, 30 requests/minute
 *
 * ✅ Uses Upstash Redis for distributed rate limiting
 */

import { getRedisClient, isRedisEnabled } from '@/lib/cache/redis';

// Rate limiting configuration
const DAILY_LIMIT = 14400; // Free tier daily limit
const MINUTE_LIMIT = 30;   // Free tier requests per minute
const TOKENS_PER_MINUTE = 6000; // Free tier tokens per minute

// Redis keys
const REDIS_KEY_DAILY = 'groq:usage:daily';
const REDIS_KEY_MINUTE = 'groq:usage:minute';

// In-memory fallback (only used if Redis unavailable)
let memoryFallback = {
  count: 0,
  date: new Date().toDateString(),
  minuteCount: 0,
  minuteStart: Date.now(),
  tokensThisMinute: 0,
};

// System prompts for different agent personalities
const AGENT_SYSTEM_PROMPTS: Record<string, string> = {
  'customer-service': `You are Lisa Thompson, a warm and caring Customer Experience Manager at Fly2Any travel agency.
You speak with genuine warmth, using phrases like "sweetie" or "dear" naturally. You're empathetic, patient, and always try to make customers feel valued.
Keep responses concise but friendly. Focus on solving problems while making the customer feel heard.
Never use markdown formatting - respond conversationally as a real person would.`,

  'flight-operations': `You are Sarah Chen, a highly professional Senior Flight Operations Specialist at Fly2Any.
You're knowledgeable about airlines, routes, connections, and flight logistics. You speak with confidence and clarity.
Provide specific, actionable information about flights. Keep responses focused and professional.
Never use markdown formatting - respond conversationally as a real person would.`,

  'hotel-accommodations': `You are Marcus Rodriguez, a warm and hospitable Hotel & Accommodations Advisor at Fly2Any.
You have extensive knowledge of hotels worldwide and genuinely enjoy finding the perfect accommodation for guests.
You occasionally use Spanish expressions naturally. You're enthusiastic about great hotels and experiences.
Never use markdown formatting - respond conversationally as a real person would.`,

  'payment-billing': `You are David Park, a meticulous Payment & Billing Specialist at Fly2Any.
You handle financial matters with precision and care. You're trustworthy, clear about costs, and ensure customers understand their charges.
Keep explanations simple and transparent. Always prioritize security.
Never use markdown formatting - respond conversationally as a real person would.`,

  'default': `You are a friendly travel consultant at Fly2Any travel agency.
Help customers with their travel needs in a warm, professional manner.
Keep responses concise and helpful. Focus on solving their problem.
Never use markdown formatting - respond conversationally as a real person would.`
};

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqResponse {
  success: boolean;
  message?: string;
  error?: string;
  rateLimited?: boolean;
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

/**
 * Get today's date key for Redis
 */
function getTodayKey(): string {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

/**
 * Get current minute key for Redis
 */
function getMinuteKey(): string {
  const now = new Date();
  return `${now.getUTCHours()}:${now.getUTCMinutes()}`;
}

/**
 * Check if we're within rate limits (Redis-backed distributed)
 */
async function checkRateLimits(): Promise<{ allowed: boolean; reason?: string; dailyCount?: number; minuteCount?: number }> {
  const redis = getRedisClient();
  const today = getTodayKey();
  const minute = getMinuteKey();

  // Use Redis for distributed rate limiting
  if (redis && isRedisEnabled()) {
    try {
      const dailyKey = `${REDIS_KEY_DAILY}:${today}`;
      const minuteKey = `${REDIS_KEY_MINUTE}:${minute}`;

      // Atomic get for both counters
      const [rawDaily, rawMinute] = await Promise.all([
        redis.get<number>(dailyKey),
        redis.get<number>(minuteKey),
      ]);
      const dailyCount = rawDaily ?? 0;
      const minuteCount = rawMinute ?? 0;

      // Check daily limit
      if (dailyCount >= DAILY_LIMIT) {
        return {
          allowed: false,
          reason: `Daily limit reached (${DAILY_LIMIT} requests). Resets at midnight UTC.`,
          dailyCount,
          minuteCount,
        };
      }

      // Check minute limit
      if (minuteCount >= MINUTE_LIMIT) {
        return {
          allowed: false,
          reason: `Rate limit reached (${MINUTE_LIMIT}/min). Please wait a moment.`,
          dailyCount,
          minuteCount,
        };
      }

      return { allowed: true, dailyCount, minuteCount };
    } catch (error) {
      console.warn('[Groq] Redis check failed, using memory fallback:', error);
    }
  }

  // Memory fallback for local dev / Redis unavailable
  const now = Date.now();
  const todayStr = new Date().toDateString();

  if (memoryFallback.date !== todayStr) {
    memoryFallback = { count: 0, date: todayStr, minuteCount: 0, minuteStart: now, tokensThisMinute: 0 };
  }

  if (now - memoryFallback.minuteStart >= 60000) {
    memoryFallback.minuteCount = 0;
    memoryFallback.minuteStart = now;
    memoryFallback.tokensThisMinute = 0;
  }

  if (memoryFallback.count >= DAILY_LIMIT) {
    return { allowed: false, reason: `Daily limit reached (${DAILY_LIMIT}).` };
  }

  if (memoryFallback.minuteCount >= MINUTE_LIMIT) {
    return { allowed: false, reason: `Rate limit reached. Wait a moment.` };
  }

  return { allowed: true, dailyCount: memoryFallback.count, minuteCount: memoryFallback.minuteCount };
}

/**
 * Update usage counters after a successful request (Redis-backed)
 */
async function recordUsage(tokensUsed: number = 100): Promise<void> {
  const redis = getRedisClient();
  const today = getTodayKey();
  const minute = getMinuteKey();

  // Use Redis for distributed tracking
  if (redis && isRedisEnabled()) {
    try {
      const dailyKey = `${REDIS_KEY_DAILY}:${today}`;
      const minuteKey = `${REDIS_KEY_MINUTE}:${minute}`;

      // Atomic increments with appropriate TTLs
      await Promise.all([
        redis.incr(dailyKey).then(() => redis.expire(dailyKey, 86400)), // 24h TTL
        redis.incr(minuteKey).then(() => redis.expire(minuteKey, 120)), // 2min TTL
      ]);

      return;
    } catch (error) {
      console.warn('[Groq] Redis record failed, using memory fallback:', error);
    }
  }

  // Memory fallback
  memoryFallback.count++;
  memoryFallback.minuteCount++;
  memoryFallback.tokensThisMinute += tokensUsed;
}

/**
 * Get current usage statistics (Redis-backed)
 */
export async function getUsageStats(): Promise<GroqUsageStats> {
  const redis = getRedisClient();
  const today = getTodayKey();
  const minute = getMinuteKey();

  let dailyCount = 0;
  let minuteCount = 0;

  // Fetch from Redis if available
  if (redis && isRedisEnabled()) {
    try {
      const [daily, min] = await Promise.all([
        redis.get<number>(`${REDIS_KEY_DAILY}:${today}`),
        redis.get<number>(`${REDIS_KEY_MINUTE}:${minute}`),
      ]);
      dailyCount = daily || 0;
      minuteCount = min || 0;
    } catch (error) {
      console.warn('[Groq] Redis stats failed, using memory:', error);
      dailyCount = memoryFallback.count;
      minuteCount = memoryFallback.minuteCount;
    }
  } else {
    dailyCount = memoryFallback.count;
    minuteCount = memoryFallback.minuteCount;
  }

  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);

  return {
    dailyCount,
    dailyLimit: DAILY_LIMIT,
    dailyRemaining: Math.max(0, DAILY_LIMIT - dailyCount),
    minuteCount,
    minuteLimit: MINUTE_LIMIT,
    percentUsed: Math.round((dailyCount / DAILY_LIMIT) * 100),
    resetTime: tomorrow.toISOString(),
  };
}

/**
 * Call Groq API with rate limiting
 */
export async function callGroq(
  messages: GroqMessage[],
  options: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    agentType?: string;
  } = {}
): Promise<GroqResponse> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.warn('GROQ_API_KEY not configured');
    return {
      success: false,
      error: 'AI service not configured',
    };
  }

  // Check rate limits (async - Redis-backed)
  const rateCheck = await checkRateLimits();
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: rateCheck.reason,
      rateLimited: true,
      usage: {
        dailyRemaining: Math.max(0, DAILY_LIMIT - (rateCheck.dailyCount || 0)),
        minuteRemaining: Math.max(0, MINUTE_LIMIT - (rateCheck.minuteCount || 0)),
      },
    };
  }

  const {
    model = 'llama-3.1-70b-versatile', // Best quality free model
    maxTokens = 500, // Keep responses concise
    temperature = 0.7,
    agentType = 'default',
  } = options;

  // Add system prompt based on agent type
  const systemPrompt = AGENT_SYSTEM_PROMPTS[agentType] || AGENT_SYSTEM_PROMPTS['default'];
  const messagesWithSystem: GroqMessage[] = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: messagesWithSystem,
        max_tokens: maxTokens,
        temperature,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle rate limiting from Groq
      if (response.status === 429) {
        return {
          success: false,
          error: 'Rate limited by Groq. Please wait a moment.',
          rateLimited: true,
        };
      }

      return {
        success: false,
        error: errorData.error?.message || `API error: ${response.status}`,
      };
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content;
    const tokensUsed = data.usage?.total_tokens || 100;

    // Record successful usage (async - Redis-backed)
    await recordUsage(tokensUsed);

    // Get updated counts for response
    const newDailyCount = (rateCheck.dailyCount || 0) + 1;
    const newMinuteCount = (rateCheck.minuteCount || 0) + 1;

    return {
      success: true,
      message,
      usage: {
        dailyRemaining: Math.max(0, DAILY_LIMIT - newDailyCount),
        minuteRemaining: Math.max(0, MINUTE_LIMIT - newMinuteCount),
      },
    };
  } catch (error) {
    console.error('Groq API error:', error);
    return {
      success: false,
      error: 'Failed to connect to AI service',
    };
  }
}

/**
 * Generate a conversational response for travel queries
 */
export async function generateTravelResponse(
  userMessage: string,
  context: {
    agentType?: string;
    agentName?: string;
    conversationHistory?: GroqMessage[];
    searchResults?: any;
    customerName?: string;
  } = {}
): Promise<GroqResponse> {
  const {
    agentType = 'customer-service',
    agentName,
    conversationHistory = [],
    searchResults,
    customerName,
  } = context;

  // Build context-aware prompt
  let contextInfo = '';

  if (customerName) {
    contextInfo += `Customer name: ${customerName}\n`;
  }

  if (searchResults) {
    if (searchResults.flights?.length > 0) {
      contextInfo += `\nFound ${searchResults.flights.length} flights:\n`;
      searchResults.flights.slice(0, 3).forEach((flight: any, i: number) => {
        contextInfo += `${i + 1}. ${flight.airline} - $${flight.price} - ${flight.duration}\n`;
      });
    }
    if (searchResults.hotels?.length > 0) {
      contextInfo += `\nFound ${searchResults.hotels.length} hotels:\n`;
      searchResults.hotels.slice(0, 3).forEach((hotel: any, i: number) => {
        contextInfo += `${i + 1}. ${hotel.name} - $${hotel.price}/night - ${hotel.rating} stars\n`;
      });
    }
  }

  const messages: GroqMessage[] = [
    ...conversationHistory.slice(-6), // Keep last 6 messages for context
    {
      role: 'user',
      content: contextInfo
        ? `Context:\n${contextInfo}\n\nCustomer message: ${userMessage}`
        : userMessage,
    },
  ];

  return callGroq(messages, {
    agentType,
    maxTokens: 400, // Keep responses concise
    temperature: 0.7,
  });
}

/**
 * Enhance NLP-extracted data with AI understanding
 * Only called when NLP confidence is low
 */
export async function enhanceWithAI(
  userMessage: string,
  nlpResult: any
): Promise<{
  enhanced: boolean;
  data?: any;
  error?: string;
}> {
  // Only use AI if NLP confidence is low
  if (nlpResult.confidence > 0.7) {
    return { enhanced: false };
  }

  const prompt = `Extract travel search parameters from this message. Return ONLY a JSON object with these fields (use null for missing):
{
  "origin": "city or airport",
  "destination": "city or airport",
  "departureDate": "YYYY-MM-DD",
  "returnDate": "YYYY-MM-DD or null",
  "passengers": number,
  "cabinClass": "economy|business|first",
  "preferences": ["nonstop", "cheapest", etc]
}

Message: "${userMessage}"

JSON only, no explanation:`;

  const response = await callGroq(
    [{ role: 'user', content: prompt }],
    { maxTokens: 200, temperature: 0.1 } // Low temp for structured output
  );

  if (!response.success || !response.message) {
    return { enhanced: false, error: response.error };
  }

  try {
    // Extract JSON from response
    const jsonMatch = response.message.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return { enhanced: true, data: parsed };
    }
  } catch (e) {
    console.error('Failed to parse AI response:', e);
  }

  return { enhanced: false };
}

/**
 * Check if Groq is configured (sync - for quick checks)
 * Actual rate limiting is checked async during callGroq()
 */
export function isGroqAvailable(): boolean {
  return !!process.env.GROQ_API_KEY;
}

/**
 * Check if Groq is available AND within rate limits (async - accurate check)
 */
export async function isGroqAvailableAsync(): Promise<boolean> {
  if (!process.env.GROQ_API_KEY) return false;
  const rateCheck = await checkRateLimits();
  return rateCheck.allowed;
}
