import { NextRequest, NextResponse } from 'next/server';
import OmnichannelAPI from '@/lib/omnichannel-api';

// GET /api/omnichannel/conversations/[id] - Detalhes de uma conversa
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const conversationId = parseInt(id);
    
    if (isNaN(conversationId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid conversation ID'
      }, { status: 400 });
    }

    const conversation = await OmnichannelAPI.getConversationWithDetails(conversationId);
    
    if (!conversation) {
      return NextResponse.json({
        success: false,
        error: 'Conversation not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      conversation
    });

  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT /api/omnichannel/conversations/[id] - Atualizar conversa
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const conversationId = parseInt(id);
    const body = await request.json();
    const { status, priority, assigned_agent_id, tags, agent_id } = body;

    if (isNaN(conversationId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid conversation ID'
      }, { status: 400 });
    }

    let updatedConversation;

    if (status) {
      updatedConversation = await OmnichannelAPI.updateConversationStatus(
        conversationId,
        status,
        agent_id
      );
    }

    // Adicionar outras atualizações conforme necessário
    // Como priority, assigned_agent_id, tags, etc.

    return NextResponse.json({
      success: true,
      conversation: updatedConversation
    });

  } catch (error) {
    console.error('Error updating conversation:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}