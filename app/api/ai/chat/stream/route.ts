/**
 * AI Chat Streaming API Endpoint
 * Server-Sent Events (SSE) for real-time token-by-token responses
 *
 * Features:
 * - Real-time streaming via SSE
 * - Groq primary + OpenAI fallback
 * - Same authentication as regular chat
 * - Rate limiting preserved
 */

import { NextRequest } from 'next/server';
import { routeQuery, type SessionContext } from '@/lib/ai/smart-router';
import type { GroqMessage } from '@/lib/ai/groq-client';
import type { TeamType } from '@/lib/ai/consultant-handoff';
import { checkRateLimit, getClientIP } from '@/lib/security/rate-limiter';
import { AI_RATE_LIMITS } from '@/lib/security/rate-limit-config';
import { auth } from '@/lib/auth';
import crypto from 'crypto';

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
  maxTokens: number = 500
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
      model: 'llama-3.1-70b-versatile',
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
  maxTokens: number = 500
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

    // Build messages for streaming
    const messages: GroqMessage[] = [
      ...conversationHistory.slice(-6),
      { role: 'user', content: message },
    ];

    // Get system prompt based on team
    const BRAND_VOICE = `You are part of the Fly2Any AI Ecosystem — an ultra-premium travel platform.
Be trustworthy, precise, helpful, and conversion-oriented without being aggressive.
Never hallucinate. Keep responses concise and actionable. Respond conversationally.`;

    const systemPrompt = `${BRAND_VOICE}\n\nYou are ${routeResult.consultantName || 'a Travel Consultant'} at Fly2Any.\n${routeResult.response ? `Context: User asked about ${message}` : ''}`;

    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Send initial metadata
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'meta',
          team: routeResult.team,
          consultantName: routeResult.consultantName,
          consultantTitle: routeResult.consultantTitle,
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
