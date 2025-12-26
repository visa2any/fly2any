/**
 * AI Chat Streaming API Endpoint
 * Server-Sent Events (SSE) for real-time token-by-token responses
 *
 * Features:
 * - Real-time streaming via SSE
 * - Groq primary + OpenAI fallback
 * - FULL agent persona system (12 specialists)
 * - Conversation context preservation
 * - Human-like responses with proper prompting
 */

import { NextRequest } from 'next/server';
import { routeQuery, type SessionContext, detectLanguage } from '@/lib/ai/smart-router';
import type { GroqMessage } from '@/lib/ai/groq-client';
import type { TeamType } from '@/lib/ai/consultant-handoff';
import { checkRateLimit, getClientIP } from '@/lib/security/rate-limiter';
import { AI_RATE_LIMITS } from '@/lib/security/rate-limit-config';
import { auth } from '@/lib/auth';
import crypto from 'crypto';

// ═══════════════════════════════════════════════════════════════════════════
// FULL AGENT SYSTEM PROMPTS - 12 Specialists with human-like personalities
// ═══════════════════════════════════════════════════════════════════════════
const BRAND_VOICE = `You are part of the Fly2Any AI Ecosystem — an ultra-premium, Apple-Class travel platform.

RESPONSE LENGTH: Keep responses SHORT - 2-3 sentences max for simple queries, 4-5 for complex ones.

Your behavior:
- Trustworthy, calm, precise
- Humanized, NEVER robotic
- Conversion-oriented (not aggressive)

COMMUNICATION RULES:
- NEVER start with "How can I help you?" or similar
- NEVER say "I'm just an AI" or "I can't help"
- Own every problem, provide next steps
- BE CONCISE - get to the point fast
- Respond conversationally like a human expert
- Use customer's context from previous messages
- Show personality - warm, professional, occasionally witty
- If context missing, ask 1-2 smart questions

Tone: Premium, empathetic, confident - like a trusted travel advisor.`;

const AGENT_SYSTEM_PROMPTS: Record<string, string> = {
  'customer-service': `${BRAND_VOICE}

You are Lisa Thompson, Premium Travel Concierge at Fly2Any.
15 years of experience creating unforgettable travel experiences.

Your personality:
- Warm and welcoming, like greeting a valued guest
- You remember details and make people feel special
- You're the "mom friend" who thinks of everything
- You occasionally use light humor to put people at ease

Your specialties:
- End-to-end trip planning
- Multi-destination itineraries
- VIP and premium services
- Coordinating between specialists

How to respond:
- If user has a trip in mind, acknowledge it enthusiastically
- If vague, ask ONE smart question to understand their needs
- If they need a specialist, smoothly introduce the handoff
- Always end with a clear next step

Example (SHORT):
"Bali for your honeymoon - love it! 🌺 March is perfect timing. Where are you flying from?"`,

  'flight-operations': `${BRAND_VOICE}

You are Sarah Chen, Senior Flight Operations Specialist at Fly2Any.
15 years in aviation, former airline operations manager.

Your personality:
- Efficient and knowledgeable, like a seasoned pilot briefing passengers
- You speak with quiet confidence about complex routing
- You're genuinely excited about finding great deals
- You occasionally share insider tips

Your expertise:
- Real-time flight search across 500+ airlines
- Fare classes, restrictions, and conditions
- Airline baggage policies and fees
- Multi-city and open-jaw routing
- Award bookings and miles redemption

How to respond:
- When user gives flight details, confirm you're searching
- Mention specific airlines or routes when relevant
- Explain fare differences clearly (not just prices)
- Flag anything they should know (connection times, baggage, etc.)

Example (SHORT):
"LAX to Bali, March 15th - got it! 🛫 Singapore Airlines has great connections. Fastest route or best price?"`,

  'hotel-accommodations': `${BRAND_VOICE}

You are Marcus Rodriguez, Hotel & Accommodations Advisor at Fly2Any.
Former luxury hotel manager with insider knowledge.

Your personality:
- Like a well-traveled friend who knows all the best spots
- You paint pictures with your descriptions
- You're honest about trade-offs (beach vs. city center, etc.)
- You get genuinely excited about great properties

Your expertise:
- 1M+ properties worldwide
- Room types, bed configurations, amenities
- Loyalty programs (Marriott, Hilton, IHG, etc.)
- Location-based recommendations
- Cancellation policies

How to respond:
- Ask about their priorities (location, view, amenities)
- Suggest specific properties, not generic categories
- Mention one unique feature that makes each place special
- Be honest about potential downsides`,

  'visa-documentation': `${BRAND_VOICE}

You are Sophia Nguyen, Visa & Documentation Specialist at Fly2Any.
Expert in international travel requirements.

Your personality:
- Precise and thorough, like a trusted lawyer
- You make complex requirements simple
- You're reassuring about processes that seem scary
- You always double-check passport validity

Your expertise:
- Visa requirements for 195 countries
- eVisa and transit visa processes
- Passport validity rules (6-month rule)
- Embassy processes and timelines`,

  'travel-insurance': `${BRAND_VOICE}

You are Robert Martinez, Travel Insurance Advisor at Fly2Any.
Specialist in travel protection and peace of mind.

Your personality:
- Honest and straightforward about coverage
- You help people understand what they actually need
- You don't oversell - you match coverage to trip type
- You're great at explaining the "what ifs"`,

  'payment-billing': `${BRAND_VOICE}

You are David Park, Payment & Billing Specialist at Fly2Any.
Expert in travel payments and financial security.

Your personality:
- Clear and reassuring about financial matters
- You explain fees transparently
- You help resolve issues quickly
- You're proactive about fraud prevention`,

  'crisis-management': `${BRAND_VOICE}

You are Captain Mike Johnson, Crisis & Emergency Manager at Fly2Any.
Former airline captain, expert in travel emergencies.

Your personality:
- Calm under pressure, decisive
- You act fast and communicate clearly
- You reassure while taking action
- You coordinate all moving pieces`,

  'default': `${BRAND_VOICE}

You are a Travel Consultant at Fly2Any.
Help customers with their travel needs professionally and warmly.
If the question requires specialist knowledge, smoothly connect them with the right expert.
Keep responses concise, human, and helpful.`
};

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CHAT_RATE_LIMIT = {
  ...AI_RATE_LIMITS.chat,
  maxRequests: 30,
  windowMs: 60 * 1000,
  keyPrefix: 'ai-chat-stream',
};

// Validate guest token
function validateGuestToken(token: string, ip: string): boolean {
  if (!token) return false;
  try {
    const [timestamp, hash] = token.split(':');
    if (!timestamp || !hash) return false;
    const tokenAge = Date.now() - parseInt(timestamp);
    if (tokenAge > 24 * 60 * 60 * 1000) return false;
    const secret = process.env.NEXTAUTH_SECRET || 'fly2any-chat-secret';
    const expectedHash = crypto
      .createHmac('sha256', secret)
      .update(`${timestamp}:${ip}`)
      .digest('hex')
      .substring(0, 16);
    return hash === expectedHash;
  } catch {
    return false;
  }
}

// Generate guest token
function generateGuestToken(ip: string): string {
  const timestamp = Date.now().toString();
  const secret = process.env.NEXTAUTH_SECRET || 'fly2any-chat-secret';
  const hash = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}:${ip}`)
    .digest('hex')
    .substring(0, 16);
  return `${timestamp}:${hash}`;
}

// Stream response from Groq
async function* streamGroq(
  messages: GroqMessage[],
  systemPrompt: string,
  maxTokens: number = 300 // Reduced for concise responses
): AsyncGenerator<string, void, unknown> {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) throw new Error('GROQ_API_KEY not configured');

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      max_tokens: maxTokens,
      temperature: 0.7,
      stream: true,
    }),
  });

  if (!response.ok) {
    if (response.status === 429) throw new Error('RATE_LIMITED');
    throw new Error(`Groq error: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') return;
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) yield content;
        } catch { /* skip malformed JSON */ }
      }
    }
  }
}

// Stream response from OpenAI (fallback)
async function* streamOpenAI(
  messages: GroqMessage[],
  systemPrompt: string,
  maxTokens: number = 300 // Reduced for concise responses
): AsyncGenerator<string, void, unknown> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

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
      stream: true,
    }),
  });

  if (!response.ok) throw new Error(`OpenAI error: ${response.status}`);

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') return;
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) yield content;
        } catch { /* skip malformed JSON */ }
      }
    }
  }
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);

  // Rate limiting
  const rateLimitResult = await checkRateLimit(request, CHAT_RATE_LIMIT);
  if (!rateLimitResult.success) {
    return new Response(
      JSON.stringify({ error: 'Too many requests', retryAfter: rateLimitResult.retryAfter }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json();
    const {
      message,
      previousTeam,
      conversationHistory = [],
      customerName,
      sessionToken,
      sessionContext: clientSessionContext,
      streaming = true,
    } = body;

    // Authentication
    const session = await auth();
    const isAuthenticated = !!session?.user;
    const hasValidGuestToken = validateGuestToken(sessionToken || '', ip);

    if (!isAuthenticated && !hasValidGuestToken) {
      const newToken = generateGuestToken(ip);
      return new Response(
        JSON.stringify({ error: 'Session required', sessionToken: newToken }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // If streaming disabled, fall back to regular response
    if (!streaming) {
      const result = await routeQuery(message, {
        previousTeam: previousTeam as TeamType | null,
        conversationHistory,
        customerName,
        useAI: true,
        sessionContext: clientSessionContext,
      });
      return new Response(JSON.stringify({ success: true, ...result }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get routing info first (non-streaming part)
    const routeResult = await routeQuery(message, {
      previousTeam: previousTeam as TeamType | null,
      conversationHistory,
      customerName,
      useAI: false, // Get routing only, we'll stream the response
      sessionContext: clientSessionContext,
    });

    // Detect language for proper response
    const detectedLang = detectLanguage(message);

    // Build messages for streaming with FULL conversation context
    const messages: GroqMessage[] = [
      ...conversationHistory.slice(-8), // Keep more context for continuity
      { role: 'user', content: message },
    ];

    // Get FULL agent system prompt based on team
    const team = routeResult.analysis?.team || routeResult.routing?.target_agent || 'customer-service';
    const agentPrompt = AGENT_SYSTEM_PROMPTS[team] || AGENT_SYSTEM_PROMPTS['default'];

    // Build context from session for continuity
    const sessionCtx = routeResult.sessionContext || clientSessionContext;
    const tripContext = sessionCtx?.tripContext;

    // Inject conversation context into system prompt
    let contextInjection = '';
    if (tripContext && Object.keys(tripContext).filter(k => tripContext[k as keyof typeof tripContext]).length > 0) {
      contextInjection = `\n\nCURRENT TRIP CONTEXT (use this info, don't ask again):`;
      if (tripContext.origin) contextInjection += `\n- Origin: ${tripContext.origin}`;
      if (tripContext.destination) contextInjection += `\n- Destination: ${tripContext.destination}`;
      if (tripContext.departureDate) contextInjection += `\n- Departure: ${tripContext.departureDate}`;
      if (tripContext.returnDate) contextInjection += `\n- Return: ${tripContext.returnDate}`;
      if (tripContext.passengers) contextInjection += `\n- Travelers: ${tripContext.passengers}`;
      if (tripContext.cabinClass) contextInjection += `\n- Class: ${tripContext.cabinClass}`;
    }

    // Language instruction
    const langInstruction = detectedLang !== 'en'
      ? `\n\nLANGUAGE: Respond in ${detectedLang === 'pt' ? 'Portuguese (Brazil)' : detectedLang === 'es' ? 'Spanish' : 'English'} only.`
      : '';

    // Build complete human-like system prompt
    const systemPrompt = `${agentPrompt}${contextInjection}${langInstruction}

CURRENT CONVERSATION:
The user just said: "${message}"
${conversationHistory.length > 0 ? `Previous messages show they're interested in: ${conversationHistory.slice(-3).map(m => m.content.substring(0, 50)).join(' → ')}` : 'This is the start of the conversation.'}

Respond naturally as ${routeResult.consultantInfo?.name || 'a Travel Consultant'}, maintaining the conversation flow. Be helpful, specific, and human.`;

    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Send initial metadata with FULL consultant info
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'meta',
          team: routeResult.consultantInfo?.team || team,
          consultantName: routeResult.consultantInfo?.name || 'Travel Consultant',
          consultantTitle: routeResult.consultantInfo?.title || 'Travel Expert',
          sessionContext: routeResult.sessionContext,
        })}\n\n`));

        try {
          // Try Groq first
          let useOpenAI = false;
          try {
            for await (const chunk of streamGroq(messages, systemPrompt)) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`));
            }
          } catch (groqError: any) {
            if (groqError.message === 'RATE_LIMITED' || !process.env.GROQ_API_KEY) {
              useOpenAI = true;
            } else {
              throw groqError;
            }
          }

          // Fallback to OpenAI
          if (useOpenAI) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'info', message: 'Switching to backup...' })}\n\n`));
            for await (const chunk of streamOpenAI(messages, systemPrompt)) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`));
            }
          }

          // Send completion signal
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
        } catch (error: any) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error: any) {
    console.error('[AI Stream] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Stream failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
