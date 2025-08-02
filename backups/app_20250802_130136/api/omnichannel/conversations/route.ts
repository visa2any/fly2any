import { NextRequest, NextResponse } from 'next/server';
import OmnichannelAPI from '@/lib/omnichannel-api';

// GET /api/omnichannel/conversations - Lista conversas ativas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agent_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status') || 'active';

    let conversations;
    
    if (status === 'active') {
      conversations = await OmnichannelAPI.getActiveConversations(
        agentId ? parseInt(agentId) : undefined,
        limit
      );
    } else {
      // Implementar outros filtros de status
      conversations = await OmnichannelAPI.getActiveConversations(
        agentId ? parseInt(agentId) : undefined,
        limit
      );
    }

    return NextResponse.json({
      success: true,
      conversations,
      total: conversations.length
    });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/omnichannel/conversations - Criar nova conversa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_id, channel, subject, priority, department, tags } = body;

    if (!customer_id || !channel) {
      return NextResponse.json({
        success: false,
        error: 'customer_id and channel are required'
      }, { status: 400 });
    }

    const conversation = await OmnichannelAPI.createConversation({
      customer_id,
      channel,
      subject,
      priority,
      department,
      tags
    });

    return NextResponse.json({
      success: true,
      conversation
    });

  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}