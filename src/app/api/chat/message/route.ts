import { NextRequest, NextResponse } from 'next/server';
import { UnifiedAIAssistant } from '@/lib/chat/unified-ai-assistant';

// Initialize AI assistant (in production, this would be a singleton)
const aiAssistant = new UnifiedAIAssistant();

export async function POST(request: NextRequest) {
  try {
    console.log('💬 Chat Message API - Processing message...');
    
    const body = await request.json();
    const { sessionId, message, userId, metadata } = body;

    if (!sessionId || !message) {
      return NextResponse.json({
        success: false,
        error: 'Session ID and message are required'
      }, { status: 400 });
    }

    // Process message with AI assistant
    const response = await aiAssistant.processMessage(
      sessionId,
      message,
      userId,
      {
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        source: 'web',
        ...metadata
      }
    );

    console.log('✅ Chat response generated successfully');

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error in chat message API:', error);
    
    // Return fallback error response
    return NextResponse.json({
      id: `error_${Date.now()}`,
      type: 'assistant',
      content: '😔 Desculpe, ocorreu um erro temporário. Nossa equipe foi notificada e vamos resolver rapidamente. Enquanto isso, posso conectar você com um atendente humano?',
      timestamp: new Date(),
      actions: [
        {
          id: 'human_support',
          type: 'transfer_human',
          label: 'Falar com atendente',
          data: { reason: 'technical_error' },
          primary: true
        },
        {
          id: 'try_again',
          type: 'get_quote',
          label: 'Tentar novamente',
          data: {}
        }
      ]
    });
  }
}