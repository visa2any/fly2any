/**
 * AI Response Suggestions API
 * Provides intelligent response suggestions for customer service agents
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiConversationService, ConversationContext } from '@/lib/services/ai-conversation-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface SuggestResponseRequest {
  message: string;
  context?: {
    customerId?: string;
    conversationId?: string;
    channel?: string;
    customerProfile?: any;
  };
  intent?: string;
  options?: {
    includeTemplates?: boolean;
    maxSuggestions?: number;
    confidenceThreshold?: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: SuggestResponseRequest = await request.json();
    const { message, context, intent, options = {} } = body;
    
    if (!message) {
      return NextResponse.json({
        success: false,
        error: 'Message is required'
      }, { status: 400 });
    }

    // Build conversation context for AI analysis
    const conversationContext: ConversationContext = {
      customerId: context?.customerId || 'unknown',
      conversationId: context?.conversationId || 'unknown',
      channel: (context?.channel as any) || 'webchat',
      messages: [
        {
          id: Date.now().toString(),
          content: message,
          direction: 'inbound',
          timestamp: new Date().toISOString()
        }
      ],
      customerProfile: context?.customerProfile
    };

    // Get AI-powered response suggestions
    const suggestions = await aiConversationService.generateResponseSuggestions(
      message,
      conversationContext
    );

    // Add template-based suggestions if requested
    let allSuggestions = suggestions;
    if (options.includeTemplates) {
      const templateSuggestions = await getTemplateSuggestions(message, intent);
      allSuggestions = [...suggestions, ...templateSuggestions];
    }

    // Filter by confidence threshold
    const confidenceThreshold = options.confidenceThreshold || 0.5;
    const filteredSuggestions = allSuggestions.filter(
      s => s.confidence >= confidenceThreshold
    );

    // Limit number of suggestions
    const maxSuggestions = options.maxSuggestions || 5;
    const finalSuggestions = filteredSuggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, maxSuggestions);

    // Get additional insights if customer context is available
    let aiInsights = null;
    if (context?.customerId && context.customerId !== 'unknown') {
      try {
        const aiResponse = await aiConversationService.analyzeConversation(conversationContext);
        aiInsights = {
          sentiment: aiResponse.sentiment,
          intent: aiResponse.intent,
          nextActions: aiResponse.nextBestActions,
          customerInsights: aiResponse.customerInsights
        };
      } catch (error) {
        console.error('Error getting AI insights:', error);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        suggestions: finalSuggestions,
        insights: aiInsights,
        metadata: {
          originalMessage: message,
          analysisTime: new Date().toISOString(),
          suggestionsCount: finalSuggestions.length
        }
      }
    });

  } catch (error) {
    console.error('AI suggestion error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate response suggestions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Get template-based response suggestions based on message content and intent
 */
async function getTemplateSuggestions(message: string, detectedIntent?: string): Promise<Array<{
  text: string;
  type: string;
  confidence: number;
}>> {
  const templates = {
    // Flight booking templates
    flight_booking: [
      {
        text: "Perfeito! Para encontrar as melhores opções de voo, preciso saber: origem, destino e datas preferidas. Pode me passar essas informações? ✈️",
        confidence: 0.9
      },
      {
        text: "Ótimo! Temos várias opções de voo disponíveis. Vou preparar uma cotação personalizada com as melhores tarifas para você.",
        confidence: 0.85
      },
      {
        text: "Vou verificar a disponibilidade para suas datas. Prefere voo direto ou com conexão? E qual classe de viagem?",
        confidence: 0.8
      }
    ],

    // Hotel booking templates  
    hotel_booking: [
      {
        text: "Claro! Temos parcerias com os melhores hotéis. Me conte: qual destino, datas e quantas pessoas? Assim posso sugerir as melhores opções! 🏨",
        confidence: 0.9
      },
      {
        text: "Perfeito! Vou buscar hotéis que atendem seu perfil. Tem preferência por localização ou tipo de acomodação?",
        confidence: 0.85
      }
    ],

    // Package inquiry templates
    package_inquiry: [
      {
        text: "Nossos pacotes são personalizados! Para montar a viagem perfeita, preciso entender: destino, datas, número de pessoas e seu orçamento aproximado.",
        confidence: 0.9
      },
      {
        text: "Excelente! Nossos pacotes incluem voo + hotel + seguro viagem. Posso preparar opções dentro do seu orçamento. Qual seu destino dos sonhos?",
        confidence: 0.85
      }
    ],

    // Price inquiry templates
    price_inquiry: [
      {
        text: "Com prazer! Nossos preços são competitivos e personalizados. Para dar um orçamento preciso, preciso conhecer seu destino e datas. Vamos conversar?",
        confidence: 0.9
      },
      {
        text: "Claro! Trabalhamos com as melhores condições do mercado. Me passa os detalhes da viagem que preparo uma cotação especial para você! 💰",
        confidence: 0.85
      },
      {
        text: "Nossos preços começam em R$ 2.500 para destinos nacionais. Para internacional, varia conforme destino. Quer uma cotação personalizada?",
        confidence: 0.8
      }
    ],

    // Cancellation templates
    cancellation: [
      {
        text: "Entendo sua situação. Vou verificar as condições de cancelamento da sua reserva e te apresentar as melhores opções disponíveis.",
        confidence: 0.9
      },
      {
        text: "Sem problemas! Cada reserva tem suas próprias regras. Vou analisar seu caso e te dar todas as informações sobre cancelamento.",
        confidence: 0.85
      }
    ],

    // Complaint templates
    complaint: [
      {
        text: "Peço sinceras desculpas pelo inconveniente. Sua satisfação é nossa prioridade. Vou transferir você para nosso supervisor para resolver isso imediatamente. 🤝",
        confidence: 0.95
      },
      {
        text: "Lamento muito o ocorrido. Vamos resolver isso juntos! Pode me contar exatamente o que aconteceu para eu ajudar da melhor forma?",
        confidence: 0.9
      }
    ],

    // General greeting templates
    greeting: [
      {
        text: "Olá! Bem-vindo à Fly2Any! 😊 Sou especialista em viagens e estou aqui para tornar sua próxima viagem inesquecível. Como posso ajudar?",
        confidence: 0.8
      },
      {
        text: "Oi! Que bom ter você aqui! Estou pronto para ajudar a planejar sua próxima aventura. Qual destino está no seu coração?",
        confidence: 0.75
      }
    ],

    // Default templates for unknown intent
    general: [
      {
        text: "Entendi! Como posso ajudar você com sua próxima viagem? Estou aqui para tornar tudo mais fácil para você. 😊",
        confidence: 0.7
      },
      {
        text: "Perfeito! Conte-me mais detalhes sobre o que você está procurando para eu poder ajudar da melhor forma.",
        confidence: 0.65
      }
    ]
  };

  // Determine intent from message if not provided
  let intent = detectedIntent;
  if (!intent) {
    intent = detectIntentFromMessage(message);
  }

  // Get templates for the detected intent
  const intentTemplates = templates[intent as keyof typeof templates] || templates.general;
  
  return intentTemplates.map(template => ({
    text: template.text,
    type: 'template',
    confidence: template.confidence
  }));
}

/**
 * Simple intent detection based on keywords
 */
function detectIntentFromMessage(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Travel booking keywords
  if (/passagem|voo|voar|viajar|ticket|flight/i.test(message)) {
    return 'flight_booking';
  }
  
  if (/hotel|hospedagem|acomodação|quarto/i.test(message)) {
    return 'hotel_booking';
  }
  
  if (/pacote|combo|tudo incluso|all inclusive/i.test(message)) {
    return 'package_inquiry';
  }
  
  if (/preço|valor|custo|quanto|orçamento/i.test(message)) {
    return 'price_inquiry';
  }
  
  if (/cancelar|cancel|desistir|não quero mais/i.test(message)) {
    return 'cancellation';
  }
  
  if (/problema|reclamar|insatisfeito|ruim/i.test(message)) {
    return 'complaint';
  }
  
  if (/oi|olá|bom dia|boa tarde|boa noite|hello|hi/i.test(message)) {
    return 'greeting';
  }
  
  return 'general';
}

/**
 * GET endpoint for testing AI suggestions
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const testMessage = searchParams.get('message') || 'Olá, preciso de uma passagem para Paris';
  
  try {
    // Test the suggestion system
    const suggestions = await getTemplateSuggestions(testMessage);
    
    return NextResponse.json({
      success: true,
      testMessage,
      suggestions,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}