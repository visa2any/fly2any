import { NextRequest, NextResponse } from 'next/server';
import { UnifiedAIAssistant } from '@/lib/chat/unified-ai-assistant';

// Initialize AI assistant (in production, this would be a singleton)
const aiAssistant = new UnifiedAIAssistant();

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 Chat Action API - Processing action...');
    
    const body = await request.json();
    const { sessionId, actionId, actionData, userId } = body;

    if (!sessionId || !actionId) {
      return NextResponse.json({
        success: false,
        error: 'Session ID and action ID are required'
      }, { status: 400 });
    }

    // Process action with AI assistant
    const response = await aiAssistant.handleAction(sessionId, actionId, actionData);

    if (!response) {
      return NextResponse.json({
        success: false,
        error: 'Session not found or action failed'
      }, { status: 404 });
    }

    console.log('✅ Chat action processed successfully');

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error in chat action API:', error);
    
    // Return fallback error response
    return NextResponse.json({
      id: `error_${Date.now()}`,
      type: 'assistant',
      content: '😔 Não consegui processar essa ação. Vou conectar você com um atendente para ajudar.',
      timestamp: new Date(),
      actions: [
        {
          id: 'human_support',
          type: 'transfer_human',
          label: 'Falar com atendente',
          data: { reason: 'action_error' },
          primary: true
        }
      ]
    });
  }
}