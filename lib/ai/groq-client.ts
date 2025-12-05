/**
 * Groq AI Client with Intelligent Rate Limiting
 * Uses Llama 3.1 70B for blazing-fast inference
 * Free tier: 14,400 requests/day, 30 requests/minute
 */

// Rate limiting configuration
const DAILY_LIMIT = 14400; // Free tier daily limit
const MINUTE_LIMIT = 30;   // Free tier requests per minute
const TOKENS_PER_MINUTE = 6000; // Free tier tokens per minute

// Usage tracking (in-memory, resets on server restart)
// In production, use Redis or database for persistence
let dailyUsage = {
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
 * Check if we're within rate limits
 */
function checkRateLimits(): { allowed: boolean; reason?: string } {
  const now = Date.now();
  const today = new Date().toDateString();

  // Reset daily counter if new day
  if (dailyUsage.date !== today) {
    dailyUsage = {
      count: 0,
      date: today,
      minuteCount: 0,
      minuteStart: now,
      tokensThisMinute: 0,
    };
  }

  // Reset minute counter if minute has passed
  if (now - dailyUsage.minuteStart >= 60000) {
    dailyUsage.minuteCount = 0;
    dailyUsage.minuteStart = now;
    dailyUsage.tokensThisMinute = 0;
  }

  // Check daily limit
  if (dailyUsage.count >= DAILY_LIMIT) {
    return {
      allowed: false,
      reason: `Daily limit reached (${DAILY_LIMIT} requests). Resets at midnight.`
    };
  }

  // Check minute limit
  if (dailyUsage.minuteCount >= MINUTE_LIMIT) {
    const waitTime = Math.ceil((60000 - (now - dailyUsage.minuteStart)) / 1000);
    return {
      allowed: false,
      reason: `Rate limit reached. Please wait ${waitTime} seconds.`
    };
  }

  return { allowed: true };
}

/**
 * Update usage counters after a successful request
 */
function recordUsage(tokensUsed: number = 100) {
  dailyUsage.count++;
  dailyUsage.minuteCount++;
  dailyUsage.tokensThisMinute += tokensUsed;
}

/**
 * Get current usage statistics
 */
export function getUsageStats(): GroqUsageStats {
  const today = new Date().toDateString();
  if (dailyUsage.date !== today) {
    dailyUsage.count = 0;
    dailyUsage.date = today;
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return {
    dailyCount: dailyUsage.count,
    dailyLimit: DAILY_LIMIT,
    dailyRemaining: Math.max(0, DAILY_LIMIT - dailyUsage.count),
    minuteCount: dailyUsage.minuteCount,
    minuteLimit: MINUTE_LIMIT,
    percentUsed: Math.round((dailyUsage.count / DAILY_LIMIT) * 100),
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

  // Check rate limits
  const rateCheck = checkRateLimits();
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: rateCheck.reason,
      rateLimited: true,
      usage: {
        dailyRemaining: Math.max(0, DAILY_LIMIT - dailyUsage.count),
        minuteRemaining: Math.max(0, MINUTE_LIMIT - dailyUsage.minuteCount),
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

    // Record successful usage
    recordUsage(tokensUsed);

    return {
      success: true,
      message,
      usage: {
        dailyRemaining: Math.max(0, DAILY_LIMIT - dailyUsage.count),
        minuteRemaining: Math.max(0, MINUTE_LIMIT - dailyUsage.minuteCount),
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
 * Check if Groq is available and within limits
 */
export function isGroqAvailable(): boolean {
  if (!process.env.GROQ_API_KEY) return false;
  const rateCheck = checkRateLimits();
  return rateCheck.allowed;
}
