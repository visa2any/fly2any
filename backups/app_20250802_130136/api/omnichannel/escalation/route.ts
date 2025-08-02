import { NextRequest, NextResponse } from 'next/server';
import EscalationEngine from '@/lib/escalation-engine';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const conversationId = searchParams.get('conversationId');

    switch (action) {
      case 'check':
        // Executar verificação de escalação
        await EscalationEngine.runEscalationCheck();
        return NextResponse.json({ 
          success: true, 
          message: 'Escalation check completed' 
        });

      case 'stats':
        // Obter estatísticas de escalação
        const stats = await EscalationEngine.getEscalationStats();
        return NextResponse.json({ 
          success: true, 
          stats 
        });

      case 'evaluate':
        // Avaliar conversa específica
        if (!conversationId) {
          return NextResponse.json({ 
            success: false, 
            error: 'Conversation ID is required' 
          }, { status: 400 });
        }

        const events = await EscalationEngine.evaluateConversation(parseInt(conversationId));
        return NextResponse.json({ 
          success: true, 
          events 
        });

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in escalation API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, conversationId } = body;

    switch (action) {
      case 'manual_escalate':
        // Escalação manual
        if (!conversationId) {
          return NextResponse.json({ 
            success: false, 
            error: 'Conversation ID is required' 
          }, { status: 400 });
        }

        const events = await EscalationEngine.evaluateConversation(conversationId);
        return NextResponse.json({ 
          success: true, 
          events 
        });

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in escalation API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}