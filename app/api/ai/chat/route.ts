/**
 * AI Chat API Endpoint
 * Routes queries through smart NLP + Groq AI system
 */

import { NextRequest, NextResponse } from 'next/server';
import { routeQuery, generateConversationalResponse } from '@/lib/ai/smart-router';
import { getUsageStats, type GroqMessage } from '@/lib/ai/groq-client';
import type { TeamType } from '@/lib/ai/consultant-handoff';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      previousTeam,
      conversationHistory = [],
      customerName,
      useAI = true
    } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Route the query through smart router
    const result = await routeQuery(message, {
      previousTeam: previousTeam as TeamType | null,
      conversationHistory: conversationHistory as GroqMessage[],
      customerName,
      useAI
    });

    // Get current usage stats
    const usageStats = getUsageStats();

    return NextResponse.json({
      success: true,
      ...result,
      usage: {
        dailyRemaining: usageStats.dailyRemaining,
        percentUsed: usageStats.percentUsed
      }
    });
  } catch (error) {
    console.error('AI Chat API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', success: false },
      { status: 500 }
    );
  }
}

/**
 * GET - Returns current AI usage statistics
 */
export async function GET() {
  try {
    const stats = getUsageStats();

    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('AI Stats API Error:', error);
    return NextResponse.json(
      { error: 'Failed to get stats', success: false },
      { status: 500 }
    );
  }
}
