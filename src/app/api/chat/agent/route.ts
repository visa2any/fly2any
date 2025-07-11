import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

interface UserInfo {
  name?: string;
  email?: string;
  phone?: string;
}

interface ChatContext {
  page?: string;
  previousMessages?: ChatMessage[];
  userInfo?: UserInfo;
}

interface ChatMetadata {
  action?: string;
  data?: Record<string, unknown>;
}

interface ChatRequest {
  sessionId: string;
  message: string;
  metadata?: ChatMetadata;
  userInfo?: UserInfo;
  context?: ChatContext;
}

// Sistema de prompts para o agente AI
const AGENT_SYSTEM_PROMPT = `
Você é Ana, assistente virtual da Fly2Any, especializada em viagens entre Brasil e EUA.

## SOBRE A FLY2ANY:
- Especialista em voos Brasil-EUA há 10+ anos
- Atende brasileiros residentes nos Estados Unidos
- Serviços: voos, hotéis no Brasil, carros, seguro viagem, passeios
- Localizada em Miami, FL
- Atendimento 24h em português
- Cotação gratuita em até 2 horas
- 500+ clientes satisfeitos, 4.9/5 estrelas

## ROTAS PRINCIPAIS COM PREÇOS:
- Miami ↔ São Paulo: $650-900 (8h30 direto)
- New York ↔ Rio de Janeiro: $720-1100 (9h45 direto)
- Orlando ↔ São Paulo: $680-950 (9h20 direto)
- Los Angeles ↔ São Paulo: $1200-1500 (com conexão)
- Atlanta ↔ São Paulo: $800-1200 (com conexão)
- Houston ↔ São Paulo: $900-1300 (com conexão)

## COMPANHIAS PARCEIRAS:
- LATAM (voos diretos Brasil-EUA)
- American Airlines (hub Miami/Dallas)
- United Airlines (hub Houston/Newark)
- Delta Air Lines (hub Atlanta)
- Avianca, GOL, Azul (conexões)

## DESTINOS BRASILEIROS DETALHADOS:
- **São Paulo (GRU)**: Centro financeiro, hotéis centro/Paulista/Vila Madalena
- **Rio de Janeiro (GIG)**: Copacabana, Ipanema, Cristo Redentor, Pão de Açúcar
- **Salvador (SSA)**: Pelourinho histórico, praias, cultura baiana
- **Fortaleza (FOR)**: Praias paradisíacas, dunas, jangadas
- **Recife (REC)**: Marco Zero, Olinda, frevo, maracatu
- **Brasília (BSB)**: Capital federal, arquitetura moderna, Plano Piloto
- **Belo Horizonte (CNF)**: Pampulha, gastronomia mineira, Inhotim

## DOCUMENTAÇÃO E BAGAGEM:
- **Documentos**: Passaporte brasileiro válido (6+ meses) + visto americano
- **Vacinas**: COVID-19 conforme exigências atuais
- **Bagagem de mão**: 10kg, dimensões padrão IATA
- **Bagagem despachada**: 23kg econômica, 32kg executiva
- **Permitido**: Industrializados lacrados, chocolates, café
- **Proibido**: Perecíveis, carnes, queijos, plantas
- **Excesso**: $100-200 por bagagem extra

## SERVIÇOS DETALHADOS:
### HOTÉIS:
- **Econômicos**: $50-80/noite (3 estrelas, pousadas)
- **Executivos**: $80-150/noite (4 estrelas, localização premium)
- **Luxo**: $150+/noite (5 estrelas, resorts, vista mar)

### CARROS:
- **Econômico**: $25-35/dia (Gol, Onix, HB20)
- **Intermediário**: $35-50/dia (Corolla, Civic, Cruze)
- **SUV**: $50-80/dia (Compass, Tiguan, SW4)
- **Requisitos**: CNH internacional, cartão crédito, 21+ anos

### SEGUROS:
- **Básico**: $15-25/dia (médico $30K, bagagem $1K)
- **Completo**: $25-40/dia (médico $100K, bagagem $2K)
- **Premium**: $40-60/dia (médico $500K, cancelamento)

### PASSEIOS POPULARES:
- **Rio**: Cristo + Pão de Açúcar $80-120
- **São Paulo**: City Tour + Museus $60-100
- **Salvador**: Pelourinho + Mercado $50-80
- **Fortaleza**: Praias + Dunas $70-110

## FAQ INTEGRADA:
- **Cotação**: Gratuita em até 2 horas, sem compromisso
- **Pagamento**: Cartão até 12x, PIX, transferência
- **Cancelamento**: Conforme política da companhia
- **Grupos**: 10+ pessoas com desconto especial
- **Corporativo**: Soluções empresariais personalizadas
- **Atendimento**: 24h WhatsApp, escritório Seg-Sex 9h-18h EST

## DETECÇÃO DE INTENÇÕES:
- **Voos**: "passagem", "voo", "viagem", "voar"
- **Hotéis**: "hotel", "hospedagem", "ficar", "dormir"
- **Carros**: "carro", "aluguel", "dirigir", "veículo"
- **Seguros**: "seguro", "cobertura", "proteção", "saúde"
- **Documentos**: "passaporte", "visto", "documento", "CNH"
- **Bagagem**: "mala", "bagagem", "peso", "kg"
- **Emergência**: "urgente", "emergência", "cancelar", "problema"

## COMO RESPONDER:
1. Seja calorosa, prestativa e use emojis moderadamente
2. Para cotações, pergunte: origem, destino, datas, passageiros, classe
3. Ofereça informações específicas sobre destinos
4. Mencione sempre nossa cotação gratuita em 2h
5. Use linguagem brasileira natural
6. Personalize com base no contexto da conversa

## SITUAÇÕES PARA TRANSFERIR PARA HUMANO:
- Grupos de 10+ pessoas
- Viagens corporativas
- Problemas documentação/visto
- Cancelamentos urgentes
- Questões pagamento/estorno
- Emergências médicas
- Clientes VIP/retornantes
- Solicitação explícita

Responda como uma brasileira experiente em Miami que entende perfeitamente as necessidades dos brasileiros nos EUA.
`;

async function initializeChatTables() {
  try {
    // Chat sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100),
        status VARCHAR(20) DEFAULT 'active',
        user_name VARCHAR(100),
        user_email VARCHAR(100),
        user_phone VARCHAR(50),
        intent VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Chat messages table
    await sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(100) REFERENCES chat_sessions(id),
        content TEXT NOT NULL,
        sender VARCHAR(10) NOT NULL,
        message_type VARCHAR(20) DEFAULT 'text',
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Indexes for performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);
    `;

  } catch (error) {
    console.error('Error initializing chat tables:', error);
  }
}

async function saveMessage(sessionId: string, content: string, sender: 'user' | 'agent', messageType: string = 'text', metadata?: ChatMetadata) {
  try {
    await sql`
      INSERT INTO chat_messages (session_id, content, sender, message_type, metadata)
      VALUES (${sessionId}, ${content}, ${sender}, ${messageType}, ${JSON.stringify(metadata || {})})
    `;
  } catch (error) {
    console.error('Error saving message:', error);
  }
}

async function updateSession(sessionId: string, userInfo?: UserInfo, intent?: string) {
  try {
    await sql`
      INSERT INTO chat_sessions (id, user_name, user_email, user_phone, intent)
      VALUES (${sessionId}, ${userInfo?.name || null}, ${userInfo?.email || null}, ${userInfo?.phone || null}, ${intent || null})
      ON CONFLICT (id) 
      DO UPDATE SET 
        user_name = COALESCE(EXCLUDED.user_name, chat_sessions.user_name),
        user_email = COALESCE(EXCLUDED.user_email, chat_sessions.user_email),
        user_phone = COALESCE(EXCLUDED.user_phone, chat_sessions.user_phone),
        intent = COALESCE(EXCLUDED.intent, chat_sessions.intent),
        updated_at = CURRENT_TIMESTAMP
    `;
  } catch (error) {
    console.error('Error updating session:', error);
  }
}

async function generateAIResponse(userMessage: string, context: ChatContext): Promise<{content: string; type: string; metadata?: any; action?: string; data?: Record<string, unknown>}> {
  // Build context for AI
  const contextMessages = context.previousMessages ? 
    context.previousMessages.slice(-3).map((msg: ChatMessage) => 
      `${msg.sender === 'user' ? 'Cliente' : 'Ana'}: ${msg.content}`
    ).join('\n') : '';

  const userInfoContext = context.userInfo ? 
    `\nInformações do cliente: ${JSON.stringify(context.userInfo)}` : '';

  const pageContext = context.page ? 
    `\nPágina atual: ${context.page}` : '';

  // Set defaults if not provided
  const effectiveContext = {
    ...context,
    page: context.page || 'unknown',
    previousMessages: context.previousMessages || []
  };

  // Detect intent from message
  const intent = detectIntent(userMessage);
  
  // Generate response based on intent
  const response = await generateResponseByIntent(userMessage, intent, effectiveContext);

  return response;
}

function detectIntent(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('voo') || lowerMessage.includes('passagem') || lowerMessage.includes('viag')) {
    return 'flight_quote';
  }
  if (lowerMessage.includes('hotel') || lowerMessage.includes('hospeda')) {
    return 'hotel_quote';
  }
  if (lowerMessage.includes('carro') || lowerMessage.includes('aluguel')) {
    return 'car_rental';
  }
  if (lowerMessage.includes('seguro')) {
    return 'insurance_quote';
  }
  if (lowerMessage.includes('preço') || lowerMessage.includes('custo') || lowerMessage.includes('valor')) {
    return 'pricing_inquiry';
  }
  if (lowerMessage.includes('humano') || lowerMessage.includes('pessoa') || lowerMessage.includes('atendente')) {
    return 'human_transfer';
  }
  if (lowerMessage.includes('obrigad') || lowerMessage.includes('tchau') || lowerMessage.includes('até logo')) {
    return 'farewell';
  }
  
  return 'general_inquiry';
}

async function generateResponseByIntent(message: string, intent: string, context: ChatContext): Promise<{content: string; type: string; metadata?: any; action?: string; data?: Record<string, unknown>}> {
  const responses = {
    flight_quote: {
      content: '✈️ Perfeito! Vou te ajudar com a cotação de voos. Para encontrar as melhores opções, preciso de alguns detalhes:\n\n📍 Qual a origem e destino?\n📅 Quais as datas de ida e volta?\n👥 Quantos passageiros?\n💺 Prefere classe econômica ou executiva?\n\n🎯 Cotação gratuita em até 2 horas!',
      type: 'quick_reply',
      metadata: {
        buttons: [
          { text: '🇺🇸 ➡️ 🇧🇷 EUA para Brasil', action: 'quote_flight', data: { direction: 'usa_brazil' } },
          { text: '🇧🇷 ➡️ 🇺🇸 Brasil para EUA', action: 'quote_flight', data: { direction: 'brazil_usa' } },
          { text: '📝 Formulário Completo', action: 'redirect_quote', data: { type: 'voos' } }
        ]
      }
    },
    documentation_inquiry: {
      content: '📋 Documentação é fundamental! Para viajar Brasil-EUA você precisa:\n\n✅ **Obrigatórios:**\n• Passaporte brasileiro válido (6+ meses)\n• Visto americano válido (turista/negócios)\n• Comprovante de vacinação COVID-19 (se exigido)\n\n✅ **Recomendados:**\n• CNH internacional para dirigir\n• Seguro saúde/viagem\n• Comprovante de hospedagem',
      type: 'quick_reply',
      metadata: {
        buttons: [
          { text: '🛂 Sobre Vistos', action: 'visa_info' },
          { text: '🚗 CNH Internacional', action: 'license_info' },
          { text: '👨‍💼 Falar com Especialista', action: 'transfer_human' }
        ]
      }
    },
    baggage_inquiry: {
      content: '🧳 Informações sobre bagagem:\n\n✅ **Permitido:**\n• Bagagem de mão: 10kg\n• Bagagem despachada: 23kg (econômica), 32kg (executiva)\n• Produtos industrializados lacrados\n• Chocolates, café, doces\n\n❌ **Proibido:**\n• Perecíveis (frutas, verduras)\n• Carnes e derivados\n• Queijos e laticínios\n• Plantas e sementes\n\n💰 **Excesso:** $100-200 por bagagem extra',
      type: 'quick_reply',
      metadata: {
        buttons: [
          { text: '📦 Lista Completa', action: 'baggage_details' },
          { text: '✈️ Cotar Voo', action: 'quote_flight' },
          { text: '👨‍💼 Especialista', action: 'transfer_human' }
        ]
      }
    },
    urgent_inquiry: {
      content: '🚨 Entendo que é urgente! Estou aqui para ajudar:\n\n⚡ **Para emergências:**\n• Cancelamentos: Conforme política da companhia\n• Problemas de voo: Suporte 24h\n• Questões médicas: Assistência imediata\n\n📞 **Contato direto:**\n• WhatsApp: 24h disponível\n• Telefone: Seg-Sex 9h-18h EST',
      type: 'quick_reply',
      action: 'urgent_transfer',
      metadata: {
        buttons: [
          { text: '📱 WhatsApp Urgente', action: 'whatsapp_urgent' },
          { text: '📞 Ligar Agora', action: 'call_urgent' },
          { text: '👨‍💼 Especialista', action: 'transfer_human' }
        ]
      }
    },
    hotel_quote: {
      content: '🏨 Ótima escolha! Temos parcerias com os melhores hotéis em todo o Brasil. Em qual cidade você pretende se hospedar?\n\n🌟 Algumas opções populares:\n• São Paulo - Centro financeiro\n• Rio de Janeiro - Praias e pontos turísticos\n• Salvador - História e cultura\n• Fortaleza - Praias paradisíacas',
      type: 'quick_reply',
      metadata: {
        buttons: [
          { text: '🏙️ São Paulo', action: 'quote_hotel', data: { city: 'sao_paulo' } },
          { text: '🏖️ Rio de Janeiro', action: 'quote_hotel', data: { city: 'rio_janeiro' } },
          { text: '🌴 Outras Cidades', action: 'quote_hotel', data: { city: 'other' } },
          { text: '📝 Formulário Completo', action: 'redirect_quote', data: { type: 'hoteis' } }
        ]
      }
    },
    car_rental: {
      content: '🚗 Perfeito! Oferecemos aluguel de carros em todo o Brasil com as melhores locadoras:\n\n🏢 Parceiros: Localiza, Hertz, Avis, Budget\n📍 Retirada: Aeroportos e centros urbanos\n\nEm qual cidade você precisa do carro?',
      type: 'quick_reply',
      metadata: {
        buttons: [
          { text: '✈️ No Aeroporto', action: 'quote_car', data: { pickup: 'airport' } },
          { text: '🏙️ Centro da Cidade', action: 'quote_car', data: { pickup: 'downtown' } },
          { text: '📝 Formulário Completo', action: 'redirect_quote', data: { type: 'carros' } }
        ]
      }
    },
    insurance_quote: {
      content: '🛡️ Seguro viagem é essencial! Oferecemos cobertura completa para suas viagens:\n\n✅ Cobertura médica internacional\n✅ Seguro bagagem\n✅ Cancelamento de viagem\n✅ Assistência 24h\n\nPara onde você vai viajar?',
      type: 'quick_reply',
      metadata: {
        buttons: [
          { text: '🇧🇷 Brasil', action: 'quote_insurance', data: { destination: 'brazil' } },
          { text: '🌍 Europa', action: 'quote_insurance', data: { destination: 'europe' } },
          { text: '🌎 Mundial', action: 'quote_insurance', data: { destination: 'worldwide' } },
          { text: '📝 Formulário Completo', action: 'redirect_quote', data: { type: 'seguro' } }
        ]
      }
    },
    pricing_inquiry: {
      content: '💰 Nossos preços são sempre competitivos! Alguns exemplos de rotas populares:\n\n✈️ **Voos Brasil-EUA:**\n• Miami ↔ São Paulo: $650-900\n• NY ↔ Rio de Janeiro: $720-1100\n• Orlando ↔ São Paulo: $680-950\n\n🎯 **Garantimos:**\n• Cotação gratuita em 2h\n• Melhores preços do mercado\n• Atendimento especializado',
      type: 'quick_reply',
      metadata: {
        buttons: [
          { text: '✈️ Cotar Voo Específico', action: 'quote_flight' },
          { text: '📞 Falar com Especialista', action: 'transfer_human' },
          { text: '📱 WhatsApp', action: 'whatsapp' }
        ]
      }
    },
    human_transfer: {
      content: '👨‍💼 Claro! Vou conectar você com um de nossos especialistas. Eles têm mais de 10 anos de experiência ajudando brasileiros nos EUA.\n\n⏰ **Horário de Atendimento:**\n• Segunda a Sexta: 9h às 18h (EST)\n• Sábado: 9h às 14h (EST)\n• Emergências: 24h via WhatsApp',
      type: 'quick_reply',
      action: 'transfer_human',
      metadata: {
        buttons: [
          { text: '📞 Ligar Agora', action: 'call_now' },
          { text: '📱 WhatsApp', action: 'whatsapp' },
          { text: '📧 Email', action: 'email' }
        ]
      }
    },
    farewell: {
      content: '😊 Foi um prazer te ajudar! Lembre-se:\n\n🎯 Cotação sempre gratuita em até 2h\n📞 Atendimento 24h via WhatsApp\n✈️ Mais de 10 anos cuidando de brasileiros nos EUA\n\nAté logo e boa viagem! 🛫',
      type: 'text'
    },
    general_inquiry: {
      content: '😊 Olá! Sou a Ana da Fly2Any, sua especialista em viagens Brasil-EUA!\n\n🎯 **Posso te ajudar com:**\n• ✈️ Voos Brasil ↔ EUA\n• 🏨 Hotéis no Brasil\n• 🚗 Aluguel de carros\n• 🛡️ Seguro viagem\n• 🎒 Passeios e turismo\n\nComo posso te ajudar hoje?',
      type: 'quick_reply',
      metadata: {
        buttons: [
          { text: '✈️ Cotação de Voos', action: 'quote_flight' },
          { text: '🏨 Hotéis no Brasil', action: 'quote_hotel' },
          { text: '👨‍💼 Falar com Humano', action: 'transfer_human' }
        ]
      }
    }
  };

  return responses[intent as keyof typeof responses] || responses.general_inquiry;
}

export async function POST(request: NextRequest) {
  try {
    await initializeChatTables();
    
    const body: ChatRequest = await request.json();
    const { sessionId, message, metadata, userInfo, context } = body;

    // Save user message
    await saveMessage(sessionId, message, 'user');
    
    // Update session with user info if provided
    if (userInfo) {
      await updateSession(sessionId, userInfo);
    }

    // Handle special actions
    if (metadata?.action) {
      let response;
      
      switch (metadata.action) {
        case 'quote_flight':
        case 'quote_hotel':
        case 'quote_car':
        case 'quote_insurance':
          response = {
            content: `Perfeito! Vou te direcionar para o formulário de ${metadata.action.replace('quote_', '')}. Lá você pode preencher todos os detalhes e receber uma cotação personalizada em até 2 horas! 🎯`,
            type: 'quick_reply',
            action: 'redirect_quote',
            data: { type: metadata.action.replace('quote_', '') },
            metadata: {
              buttons: [
                { text: '📝 Ir para Formulário', action: 'redirect_quote', data: { type: metadata.action.replace('quote_', '') } },
                { text: '💬 Continuar Chat', action: 'continue_chat' }
              ]
            }
          };
          break;
          
        case 'transfer_human':
          response = {
            content: '👨‍💼 Transferindo você para um especialista humano. Por favor, deixe seu contato para que possamos retornar:',
            type: 'form',
            action: 'show_contact_form',
            metadata: {
              form: {
                type: 'contact',
                fields: [
                  { name: 'name', label: 'Nome Completo', type: 'text', required: true },
                  { name: 'email', label: 'Email', type: 'email', required: true },
                  { name: 'phone', label: 'Telefone/WhatsApp', type: 'tel', required: true }
                ]
              }
            }
          };
          break;
          
        default:
          response = await generateAIResponse(message, { ...context, userInfo });
      }
      
      // Save agent response
      await saveMessage(sessionId, response.content, 'agent', response.type, response.metadata);
      
      return NextResponse.json({
        success: true,
        response
      });
    }

    // Generate AI response
    const response = await generateAIResponse(message, { ...context, userInfo });
    
    // Save agent response
    await saveMessage(sessionId, response.content, 'agent', response.type, response.metadata);

    // Send to N8N webhook for analytics/automation
    try {
      await fetch(process.env.N8N_WEBHOOK_CHAT || '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'chat_interaction',
          sessionId,
          userMessage: message,
          agentResponse: response.content,
          intent: detectIntent(message),
          userInfo,
          timestamp: new Date().toISOString()
        })
      });
    } catch (webhookError) {
      console.warn('N8N webhook failed:', webhookError);
    }

    return NextResponse.json({
      success: true,
      response
    });

  } catch (error) {
    console.error('Chat agent error:', error);
    return NextResponse.json(
      { error: 'Erro interno do chat agent' },
      { status: 500 }
    );
  }
}
