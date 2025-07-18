import { NextRequest, NextResponse } from 'next/server';
import { SmartAutomationEngine } from '@/lib/smart-automation';
import OmnichannelAPI from '@/lib/omnichannel-api';

// POST /api/omnichannel/intent - Detectar intent e processar automação
export async function POST(request: NextRequest) {
  try {
    const { message, conversationId, customerId, channel } = await request.json();

    if (!message || !conversationId) {
      return NextResponse.json({
        success: false,
        error: 'Message and conversationId are required'
      }, { status: 400 });
    }

    // Buscar contexto do cliente
    const customerContext = customerId ? await getCustomerContext(customerId) : undefined;

    // Detectar intent da mensagem
    const intentResult = SmartAutomationEngine.detectIntent(message, customerContext);

    console.log('🧠 Intent detection result:', {
      intent: intentResult.intent?.name,
      confidence: intentResult.confidence,
      entities: intentResult.extracted_entities
    });

    // Verificar se deve escalar para humano
    const shouldEscalate = intentResult.intent ? 
      SmartAutomationEngine.shouldEscalateToHuman(intentResult.intent, intentResult.confidence, customerContext) : 
      true;

    let autoResponseSent = false;
    let conversationUpdated = false;

    // Enviar resposta automática se aplicável
    if (intentResult.suggested_response && !shouldEscalate && intentResult.confidence > 0.7) {
      try {
        await OmnichannelAPI.createMessage({
          conversation_id: conversationId,
          customer_id: customerId,
          channel,
          direction: 'outbound',
          content: intentResult.suggested_response,
          is_automated: true,
          template_id: intentResult.intent?.id,
          metadata: {
            intent_detection: {
              intent_id: intentResult.intent?.id,
              confidence: intentResult.confidence,
              entities: intentResult.extracted_entities,
              auto_generated: true
            }
          }
        });

        autoResponseSent = true;
        console.log('✅ Auto-response sent for intent:', intentResult.intent?.name);
      } catch (error) {
        console.error('Error sending auto-response:', error);
      }
    }

    // Atualizar conversa com informações do intent
    if (intentResult.intent) {
      try {
        // Atualizar tags e prioridade da conversa
        const conversation = await OmnichannelAPI.getConversationWithDetails(conversationId);
        if (conversation) {
          const updatedTags = [...(conversation.tags || [])];
          
          // Adicionar tag do intent se não existir
          const intentTag = `intent:${intentResult.intent.id}`;
          if (!updatedTags.includes(intentTag)) {
            updatedTags.push(intentTag);
          }

          // Adicionar categoria como tag
          const categoryTag = `category:${intentResult.intent.category}`;
          if (!updatedTags.includes(categoryTag)) {
            updatedTags.push(categoryTag);
          }

          // Atualizar prioridade se necessário
          if (intentResult.intent.priority === 'urgent' && conversation.priority !== 'urgent') {
            conversationUpdated = true;
          }

          // Log da atividade
          await OmnichannelAPI.logActivity(
            conversationId,
            0, // Sistema
            'intent_detected',
            `Intent detectado: ${intentResult.intent.name} (${Math.round(intentResult.confidence * 100)}% confiança)`,
            {
              intent_id: intentResult.intent.id,
              confidence: intentResult.confidence,
              entities: intentResult.extracted_entities,
              auto_response_sent: autoResponseSent,
              escalated: shouldEscalate
            }
          );
        }
      } catch (error) {
        console.error('Error updating conversation with intent:', error);
      }
    }

    // Notificar agentes se necessário escalar
    if (shouldEscalate) {
      await notifyAgentsForEscalation(conversationId, intentResult, customerContext);
    }

    return NextResponse.json({
      success: true,
      intent_detection: {
        intent: intentResult.intent ? {
          id: intentResult.intent.id,
          name: intentResult.intent.name,
          category: intentResult.intent.category,
          priority: intentResult.intent.priority
        } : null,
        confidence: intentResult.confidence,
        entities: intentResult.extracted_entities,
        routing_recommendation: intentResult.routing_recommendation
      },
      automation: {
        auto_response_sent: autoResponseSent,
        should_escalate: shouldEscalate,
        conversation_updated: conversationUpdated
      }
    });

  } catch (error) {
    console.error('Error processing intent detection:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET /api/omnichannel/intent - Listar intents disponíveis
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let intents;
    if (category) {
      intents = SmartAutomationEngine.getIntentsByCategory(category as any);
    } else {
      intents = SmartAutomationEngine.getAllIntents();
    }

    // Remover informações sensíveis para o frontend
    const publicIntents = intents.map(intent => ({
      id: intent.id,
      name: intent.name,
      description: intent.description,
      category: intent.category,
      priority: intent.priority,
      keywords: intent.keywords.slice(0, 5), // Mostrar apenas algumas keywords
      confidence_threshold: intent.confidence_threshold
    }));

    return NextResponse.json({
      success: true,
      intents: publicIntents,
      total: intents.length,
      categories: ['sales', 'support', 'billing', 'general']
    });

  } catch (error) {
    console.error('Error fetching intents:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Função para buscar contexto do cliente
async function getCustomerContext(customerId: number) {
  try {
    const customer = await OmnichannelAPI.getCustomerById(customerId);
    if (!customer) return undefined;

    // Buscar histórico de conversas do cliente
    const conversationHistory: Array<{
      channel: string;
      last_message: string;
      resolved: boolean;
      satisfaction?: number;
    }> = []; // TODO: Implementar busca do histórico real

    return {
      id: customer.id,
      type: customer.customer_type,
      previous_purchases: customer.customer_type !== 'prospect',
      last_interaction_date: customer.last_contact_at,
      preferred_language: customer.language,
      timezone: customer.timezone,
      conversation_history: conversationHistory
    };
  } catch (error) {
    console.error('Error fetching customer context:', error);
    return undefined;
  }
}

// Função para notificar agentes sobre escalação
async function notifyAgentsForEscalation(conversationId: number, intentResult: any, customerContext: any) {
  try {
    const notification = {
      type: 'conversation_escalated',
      conversationId,
      priority: intentResult.intent?.priority || 'normal',
      metadata: {
        intent: intentResult.intent?.name,
        confidence: intentResult.confidence,
        customer_type: customerContext?.type,
        reason: 'Intent detection triggered escalation',
        routing_recommendation: intentResult.routing_recommendation,
        timestamp: new Date().toISOString()
      }
    };

    // Enviar notificação via WebSocket
    await fetch('/api/omnichannel/ws', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notification)
    });

    console.log('🔔 Escalation notification sent for conversation:', conversationId);
  } catch (error) {
    console.error('Error sending escalation notification:', error);
  }
}

// PUT /api/omnichannel/intent - Atualizar intent (para administradores)
export async function PUT(request: NextRequest) {
  try {
    const { intentId, updates } = await request.json();

    if (!intentId || !updates) {
      return NextResponse.json({
        success: false,
        error: 'Intent ID and updates are required'
      }, { status: 400 });
    }

    const success = SmartAutomationEngine.updateIntent(intentId, updates);

    if (!success) {
      return NextResponse.json({
        success: false,
        error: 'Intent not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Intent updated successfully'
    });

  } catch (error) {
    console.error('Error updating intent:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}