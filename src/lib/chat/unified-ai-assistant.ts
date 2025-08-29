/**
 * Unified AI Assistant for Fly2Any Platform
 * Complete intelligent support system for flights, hotels, and all platform services
 */

import { EnhancedAmadeusClient } from '../flights/enhanced-amadeus-client';
import { ProcessedFlightOffer, FlightSearchParams } from '@/types/flights';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: any;
  attachments?: ChatAttachment[];
  actions?: ChatAction[];
}

interface ChatAttachment {
  type: 'flight_offer' | 'hotel_offer' | 'booking_details' | 'price_comparison' | 'document';
  data: any;
  displayComponent: string;
}

interface ChatAction {
  id: string;
  type: 'book_flight' | 'book_hotel' | 'get_quote' | 'schedule_callback' | 'transfer_human';
  label: string;
  data: any;
  primary?: boolean;
}

interface ChatSession {
  id: string;
  userId?: string;
  context: ChatContext;
  messages: ChatMessage[];
  status: 'active' | 'waiting' | 'resolved' | 'transferred';
  startTime: Date;
  lastActivity: Date;
  metadata: SessionMetadata;
}

interface ChatContext {
  intent: ChatIntent | null;
  entities: ChatEntity[];
  userProfile?: UserProfile;
  currentSearch?: any;
  bookingInProgress?: any;
  conversationFlow: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

interface ChatIntent {
  name: string;
  confidence: number;
  category: 'booking' | 'search' | 'support' | 'information' | 'complaint';
  subcategory?: string;
}

interface ChatEntity {
  type: 'location' | 'date' | 'person_count' | 'airline' | 'hotel' | 'booking_id' | 'price';
  value: string;
  normalized: any;
  confidence: number;
}

interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  preferredLanguage: string;
  bookingHistory: any[];
  preferences: any;
  loyaltyStatus: any;
}

interface SessionMetadata {
  source: 'web' | 'mobile' | 'whatsapp' | 'email';
  device: string;
  location?: string;
  referrer?: string;
  customerValue: 'low' | 'medium' | 'high' | 'vip';
}

interface AIResponse {
  message: string;
  confidence: number;
  actions: ChatAction[];
  attachments: ChatAttachment[];
  shouldEscalate: boolean;
  nextSteps: string[];
}

export class UnifiedAIAssistant {
  private amadeusClient: EnhancedAmadeusClient;
  private activeSessions: Map<string, ChatSession> = new Map();
  private knowledgeBase: KnowledgeBase;
  private nlpEngine: NLPEngine;

  constructor() {
    this.amadeusClient = new EnhancedAmadeusClient();
    this.knowledgeBase = new KnowledgeBase();
    this.nlpEngine = new NLPEngine();
    this.initializeAssistant();
  }

  /**
   * Process incoming message and generate intelligent response
   */
  async processMessage(
    sessionId: string,
    userMessage: string,
    userId?: string,
    metadata?: any
  ): Promise<ChatMessage> {
    console.log('🤖 Processing message:', userMessage);

    let session = this.activeSessions.get(sessionId);
    if (!session) {
      session = this.createNewSession(sessionId, userId, metadata);
    }

    // Add user message to session
    const userChatMessage: ChatMessage = {
      id: this.generateMessageId(),
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    session.messages.push(userChatMessage);

    // Update context with NLP analysis
    await this.updateContext(session, userMessage);

    // Generate AI response
    const aiResponse = await this.generateResponse(session, userMessage);

    // Create assistant message
    const assistantMessage: ChatMessage = {
      id: this.generateMessageId(),
      type: 'assistant',
      content: aiResponse.message,
      timestamp: new Date(),
      attachments: aiResponse.attachments,
      actions: aiResponse.actions
    };

    session.messages.push(assistantMessage);
    session.lastActivity = new Date();

    // Check if escalation is needed
    if (aiResponse.shouldEscalate) {
      await this.escalateToHuman(session);
    }

    return assistantMessage;
  }

  /**
   * Generate intelligent response based on context and intent
   */
  private async generateResponse(session: ChatSession, userMessage: string): Promise<AIResponse> {
    const context = session.context;
    const intent = context.intent;

    if (!intent) {
      return this.generateGreetingResponse(session);
    }

    switch (intent.category) {
      case 'search':
        return this.handleSearchIntent(session, intent);
      case 'booking':
        return this.handleBookingIntent(session, intent);
      case 'support':
        return this.handleSupportIntent(session, intent);
      case 'information':
        return this.handleInformationIntent(session, intent);
      case 'complaint':
        return this.handleComplaintIntent(session, intent);
      default:
        return this.generateFallbackResponse(session);
    }
  }

  /**
   * Handle flight/hotel search requests
   */
  private async handleSearchIntent(session: ChatSession, intent: ChatIntent): Promise<AIResponse> {
    const entities = session.context.entities;
    const searchType = this.determineSearchType(entities, intent);

    if (searchType === 'flight') {
      return this.handleFlightSearch(session, entities);
    } else if (searchType === 'hotel') {
      return this.handleHotelSearch(session, entities);
    } else {
      return {
        message: 'Posso ajudar você a encontrar voos ✈️ ou hotéis 🏨. O que você está procurando?',
        confidence: 0.9,
        actions: [
          {
            id: 'search_flights',
            type: 'get_quote',
            label: 'Buscar Voos',
            data: { type: 'flight' },
            primary: true
          },
          {
            id: 'search_hotels',
            type: 'get_quote',
            label: 'Buscar Hotéis',
            data: { type: 'hotel' }
          }
        ],
        attachments: [],
        shouldEscalate: false,
        nextSteps: ['Escolha o tipo de busca', 'Informe destino e datas']
      };
    }
  }

  /**
   * Handle flight search specifically
   */
  private async handleFlightSearch(session: ChatSession, entities: ChatEntity[]): Promise<AIResponse> {
    const searchParams = this.extractFlightSearchParams(entities);
    
    if (!this.isCompleteFlightSearch(searchParams)) {
      return this.requestMissingFlightInfo(searchParams);
    }

    try {
      // Perform flight search with properly typed parameters
      const completeSearchParams: FlightSearchParams = {
        originLocationCode: searchParams.originLocationCode!,
        destinationLocationCode: searchParams.destinationLocationCode!,
        departureDate: searchParams.departureDate!,
        adults: searchParams.adults || 1,
        returnDate: searchParams.returnDate,
        children: searchParams.children,
        infants: searchParams.infants,
        travelClass: searchParams.travelClass,
        oneWay: !searchParams.returnDate,
        nonStop: searchParams.nonStop,
        maxPrice: searchParams.maxPrice,
        max: searchParams.max,
        currencyCode: searchParams.currencyCode || 'BRL'
      };
      
      const searchResult = await this.amadeusClient.smartFlightSearch(completeSearchParams);
      
      if (searchResult.success && searchResult.data && searchResult.data.length > 0) {
        const topFlights = searchResult.data.slice(0, 3);
        
        return {
          message: `🎉 Encontrei ${searchResult.data.length} voos para você! Aqui estão as melhores opções:`,
          confidence: 0.95,
          actions: [
            {
              id: 'view_all_flights',
              type: 'get_quote',
              label: `Ver todos os ${searchResult.data.length} voos`,
              data: { searchParams },
              primary: true
            },
            {
              id: 'refine_search',
              type: 'get_quote',
              label: 'Refinar busca',
              data: { searchParams }
            }
          ],
          attachments: [
            {
              type: 'flight_offer',
              data: topFlights,
              displayComponent: 'FlightOffersList'
            }
          ],
          shouldEscalate: false,
          nextSteps: ['Escolher voo', 'Ver mais opções', 'Fazer reserva']
        };
      } else {
        return {
          message: '😔 Não encontrei voos para essas datas. Que tal tentar datas alternativas ou outros aeroportos próximos?',
          confidence: 0.8,
          actions: [
            {
              id: 'flexible_dates',
              type: 'get_quote',
              label: 'Datas flexíveis',
              data: { searchParams }
            },
            {
              id: 'alternative_airports',
              type: 'get_quote',
              label: 'Aeroportos alternativos',
              data: { searchParams }
            }
          ],
          attachments: [],
          shouldEscalate: false,
          nextSteps: ['Tentar datas flexíveis', 'Buscar aeroportos próximos']
        };
      }
    } catch (error) {
      console.error('Error in flight search:', error);
      return this.generateErrorResponse('Ops! Ocorreu um erro na busca. Vou conectar você com um especialista.');
    }
  }

  /**
   * Handle booking requests
   */
  private async handleBookingIntent(session: ChatSession, intent: ChatIntent): Promise<AIResponse> {
    const userProfile = session.context.userProfile;
    
    if (!userProfile?.email) {
      return {
        message: 'Para fazer uma reserva, preciso de alguns dados seus. Qual seu email?',
        confidence: 0.9,
        actions: [],
        attachments: [],
        shouldEscalate: false,
        nextSteps: ['Coletar dados pessoais', 'Processar pagamento']
      };
    }

    // Check if there's a flight/hotel selected for booking
    const selectedOffer = session.context.currentSearch;
    if (!selectedOffer) {
      return {
        message: 'Vamos fazer sua reserva! Primeiro, preciso saber qual voo ou hotel você escolheu. Pode me mostrar?',
        confidence: 0.8,
        actions: [
          {
            id: 'search_again',
            type: 'get_quote',
            label: 'Buscar voos/hotéis',
            data: {},
            primary: true
          }
        ],
        attachments: [],
        shouldEscalate: false,
        nextSteps: ['Escolher oferta', 'Coletar dados', 'Processar pagamento']
      };
    }

    return {
      message: `✈️ Perfeito! Vou iniciar sua reserva. O valor total é ${selectedOffer.totalPrice}. Confirma?`,
      confidence: 0.95,
      actions: [
        {
          id: 'confirm_booking',
          type: 'book_flight',
          label: `Confirmar reserva - ${selectedOffer.totalPrice}`,
          data: selectedOffer,
          primary: true
        },
        {
          id: 'modify_booking',
          type: 'get_quote',
          label: 'Modificar detalhes',
          data: selectedOffer
        }
      ],
      attachments: [
        {
          type: 'booking_details',
          data: selectedOffer,
          displayComponent: 'BookingSummary'
        }
      ],
      shouldEscalate: false,
      nextSteps: ['Confirmar reserva', 'Processar pagamento', 'Enviar confirmação']
    };
  }

  /**
   * Handle support requests
   */
  private async handleSupportIntent(session: ChatSession, intent: ChatIntent): Promise<AIResponse> {
    const subcategory = intent.subcategory;

    switch (subcategory) {
      case 'booking_status':
        return this.handleBookingStatusQuery(session);
      case 'cancellation':
        return this.handleCancellationRequest(session);
      case 'change_booking':
        return this.handleBookingChangeRequest(session);
      case 'refund':
        return this.handleRefundRequest(session);
      case 'technical_issue':
        return this.handleTechnicalIssue(session);
      default:
        return {
          message: 'Estou aqui para ajudar! Pode me contar qual problema você está enfrentando?',
          confidence: 0.8,
          actions: [
            {
              id: 'booking_issues',
              type: 'get_quote',
              label: 'Problemas com reserva',
              data: { type: 'booking_issue' }
            },
            {
              id: 'payment_issues',
              type: 'get_quote',
              label: 'Problemas de pagamento',
              data: { type: 'payment_issue' }
            },
            {
              id: 'technical_help',
              type: 'get_quote',
              label: 'Ajuda técnica',
              data: { type: 'technical' }
            },
            {
              id: 'human_support',
              type: 'transfer_human',
              label: 'Falar com atendente',
              data: {}
            }
          ],
          attachments: [],
          shouldEscalate: false,
          nextSteps: ['Identificar problema específico', 'Oferecer solução']
        };
    }
  }

  /**
   * Handle information requests
   */
  private async handleInformationIntent(session: ChatSession, intent: ChatIntent): Promise<AIResponse> {
    const query = session.messages[session.messages.length - 1].content.toLowerCase();
    const knowledgeResult = await this.knowledgeBase.search(query);

    if (knowledgeResult.found && knowledgeResult.answer && knowledgeResult.confidence !== undefined) {
      return {
        message: knowledgeResult.answer,
        confidence: knowledgeResult.confidence,
        actions: [
          {
            id: 'more_info',
            type: 'get_quote',
            label: 'Mais informações',
            data: { topic: knowledgeResult.topic }
          }
        ],
        attachments: [],
        shouldEscalate: false,
        nextSteps: ['Fornecer informações adicionais se necessário']
      };
    }

    return {
      message: 'Deixe me buscar essa informação para você... 🔍',
      confidence: 0.6,
      actions: [
        {
          id: 'search_knowledge',
          type: 'get_quote',
          label: 'Buscar resposta',
          data: { query }
        },
        {
          id: 'human_support',
          type: 'transfer_human',
          label: 'Falar com especialista',
          data: {}
        }
      ],
      attachments: [],
      shouldEscalate: true,
      nextSteps: ['Buscar informação', 'Escalar para humano se necessário']
    };
  }

  /**
   * Handle complaints
   */
  private async handleComplaintIntent(session: ChatSession, intent: ChatIntent): Promise<AIResponse> {
    // Mark session as high priority
    session.context.urgency = 'high';
    session.context.sentiment = 'negative';

    return {
      message: 'Sinto muito pelo problema que você está enfrentando. 😔 Vou priorizar sua solicitação e conectar você com um especialista imediatamente.',
      confidence: 0.9,
      actions: [
        {
          id: 'priority_human',
          type: 'transfer_human',
          label: 'Falar com supervisor',
          data: { priority: 'high' },
          primary: true
        },
        {
          id: 'document_complaint',
          type: 'get_quote',
          label: 'Registrar reclamação',
          data: { type: 'complaint' }
        }
      ],
      attachments: [],
      shouldEscalate: true,
      nextSteps: ['Transferir para humano', 'Documentar reclamação', 'Acompanhar resolução']
    };
  }

  /**
   * Create new chat session
   */
  private createNewSession(sessionId: string, userId?: string, metadata?: any): ChatSession {
    const session: ChatSession = {
      id: sessionId,
      userId,
      context: {
        intent: null,
        entities: [],
        userProfile: userId ? this.loadUserProfile(userId) : undefined,
        conversationFlow: [],
        sentiment: 'neutral',
        urgency: 'low'
      },
      messages: [],
      status: 'active',
      startTime: new Date(),
      lastActivity: new Date(),
      metadata: {
        source: 'web',
        device: 'unknown',
        customerValue: 'medium',
        ...metadata
      }
    };

    this.activeSessions.set(sessionId, session);
    return session;
  }

  /**
   * Update conversation context with NLP analysis
   */
  private async updateContext(session: ChatSession, userMessage: string): Promise<void> {
    const nlpResult = await this.nlpEngine.analyze(userMessage, session.context);
    
    session.context.intent = nlpResult.intent;
    session.context.entities = [...session.context.entities, ...nlpResult.entities];
    session.context.sentiment = nlpResult.sentiment;
    session.context.conversationFlow.push(nlpResult.intent?.name || 'unknown');
  }

  /**
   * Initialize assistant with knowledge base and capabilities
   */
  private initializeAssistant(): void {
    console.log('🤖 Initializing Fly2Any AI Assistant...');
    
    // Initialize knowledge base
    this.knowledgeBase.load();
    
    // Start session cleanup
    setInterval(() => {
      this.cleanupInactiveSessions();
    }, 300000); // 5 minutes

    console.log('✅ AI Assistant ready for service');
  }

  /**
   * Generate greeting response for new conversations
   */
  private generateGreetingResponse(session: ChatSession): AIResponse {
    const userProfile = session.context.userProfile;
    const greeting = userProfile?.name 
      ? `Olá ${userProfile.name}! 👋`
      : 'Olá! 👋';

    return {
      message: `${greeting} Sou o assistente da Fly2Any. Posso ajudar você com:\n\n✈️ Buscar e reservar voos\n🏨 Encontrar hotéis\n📋 Consultar suas reservas\n💬 Suporte especializado\n\nComo posso ajudar hoje?`,
      confidence: 1.0,
      actions: [
        {
          id: 'search_flights',
          type: 'get_quote',
          label: 'Buscar voos',
          data: { type: 'flight' },
          primary: true
        },
        {
          id: 'search_hotels',
          type: 'get_quote',
          label: 'Buscar hotéis',
          data: { type: 'hotel' }
        },
        {
          id: 'check_booking',
          type: 'get_quote',
          label: 'Minhas reservas',
          data: { type: 'booking_status' }
        },
        {
          id: 'get_help',
          type: 'get_quote',
          label: 'Preciso de ajuda',
          data: { type: 'support' }
        }
      ],
      attachments: [],
      shouldEscalate: false,
      nextSteps: ['Aguardar escolha do usuário']
    };
  }

  /**
   * Generate fallback response for unclear intents
   */
  private generateFallbackResponse(session: ChatSession): AIResponse {
    return {
      message: 'Desculpe, não entendi muito bem. 🤔 Pode reformular sua pergunta? Ou escolha uma das opções abaixo:',
      confidence: 0.3,
      actions: [
        {
          id: 'search_flights',
          type: 'get_quote',
          label: 'Buscar voos',
          data: { type: 'flight' }
        },
        {
          id: 'search_hotels',
          type: 'get_quote',
          label: 'Buscar hotéis',
          data: { type: 'hotel' }
        },
        {
          id: 'human_support',
          type: 'transfer_human',
          label: 'Falar com atendente',
          data: {}
        }
      ],
      attachments: [],
      shouldEscalate: false,
      nextSteps: ['Aguardar clarificação do usuário']
    };
  }

  /**
   * Generate error response
   */
  private generateErrorResponse(message: string): AIResponse {
    return {
      message,
      confidence: 0.9,
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
      ],
      attachments: [],
      shouldEscalate: true,
      nextSteps: ['Transferir para suporte humano']
    };
  }

  /**
   * Helper methods for specific functionalities
   */
  private determineSearchType(entities: ChatEntity[], intent: ChatIntent): 'flight' | 'hotel' | 'unknown' {
    const hasFlightKeywords = entities.some(e => e.type === 'airline') || 
                             intent.subcategory === 'flight';
    const hasHotelKeywords = entities.some(e => e.type === 'hotel') || 
                            intent.subcategory === 'hotel';

    if (hasFlightKeywords) return 'flight';
    if (hasHotelKeywords) return 'hotel';
    return 'unknown';
  }

  private extractFlightSearchParams(entities: ChatEntity[]): Partial<FlightSearchParams> {
    const params: Partial<FlightSearchParams> = {};
    
    entities.forEach(entity => {
      switch (entity.type) {
        case 'location':
          if (!params.originLocationCode) {
            params.originLocationCode = entity.normalized;
          } else {
            params.destinationLocationCode = entity.normalized;
          }
          break;
        case 'date':
          if (!params.departureDate) {
            params.departureDate = entity.normalized;
          } else {
            params.returnDate = entity.normalized;
          }
          break;
        case 'person_count':
          params.adults = entity.normalized;
          break;
      }
    });

    return params;
  }

  private isCompleteFlightSearch(params: Partial<FlightSearchParams>): boolean {
    return !!(params.originLocationCode && 
              params.destinationLocationCode && 
              params.departureDate && 
              params.adults);
  }

  private requestMissingFlightInfo(params: Partial<FlightSearchParams>): AIResponse {
    const missing = [];
    
    if (!params.originLocationCode) missing.push('origem');
    if (!params.destinationLocationCode) missing.push('destino');
    if (!params.departureDate) missing.push('data de ida');
    if (!params.adults) missing.push('número de passageiros');

    return {
      message: `Para buscar voos, preciso de mais algumas informações:\n\n${missing.map((item: any) => `• ${item}`).join('\n')}\n\nPode me informar?`,
      confidence: 0.9,
      actions: [],
      attachments: [],
      shouldEscalate: false,
      nextSteps: [`Coletar: ${missing.join(', ')}`]
    };
  }

  private async handleBookingStatusQuery(session: ChatSession): Promise<AIResponse> {
    return {
      message: 'Para consultar sua reserva, preciso do código de confirmação ou seu email. Qual você tem?',
      confidence: 0.9,
      actions: [
        {
          id: 'enter_booking_code',
          type: 'get_quote',
          label: 'Informar código',
          data: { type: 'booking_code' }
        },
        {
          id: 'enter_email',
          type: 'get_quote',
          label: 'Usar meu email',
          data: { type: 'email_lookup' }
        }
      ],
      attachments: [],
      shouldEscalate: false,
      nextSteps: ['Coletar identificação', 'Buscar reserva']
    };
  }

  private async handleCancellationRequest(session: ChatSession): Promise<AIResponse> {
    return {
      message: 'Entendo que você quer cancelar uma reserva. Para isso, preciso verificar as políticas de cancelamento. Qual o código da sua reserva?',
      confidence: 0.9,
      actions: [
        {
          id: 'check_policies',
          type: 'get_quote',
          label: 'Ver políticas de cancelamento',
          data: { type: 'cancellation_policy' }
        },
        {
          id: 'proceed_cancellation',
          type: 'get_quote',
          label: 'Prosseguir com cancelamento',
          data: { type: 'cancel_booking' }
        }
      ],
      attachments: [],
      shouldEscalate: false,
      nextSteps: ['Verificar políticas', 'Processar cancelamento']
    };
  }

  private async handleBookingChangeRequest(session: ChatSession): Promise<AIResponse> {
    return {
      message: 'Vou ajudar você a alterar sua reserva. Que tipo de mudança você precisa fazer?',
      confidence: 0.9,
      actions: [
        {
          id: 'change_dates',
          type: 'get_quote',
          label: 'Alterar datas',
          data: { type: 'change_dates' }
        },
        {
          id: 'change_passengers',
          type: 'get_quote',
          label: 'Alterar passageiros',
          data: { type: 'change_passengers' }
        },
        {
          id: 'upgrade_class',
          type: 'get_quote',
          label: 'Upgrade de classe',
          data: { type: 'upgrade' }
        }
      ],
      attachments: [],
      shouldEscalate: false,
      nextSteps: ['Identificar tipo de mudança', 'Verificar disponibilidade']
    };
  }

  private async handleRefundRequest(session: ChatSession): Promise<AIResponse> {
    return {
      message: 'Vou verificar se sua reserva é elegível para reembolso. Preciso do código de confirmação para consultar as condições.',
      confidence: 0.9,
      actions: [
        {
          id: 'check_refund_eligibility',
          type: 'get_quote',
          label: 'Verificar elegibilidade',
          data: { type: 'refund_check' }
        },
        {
          id: 'request_refund',
          type: 'get_quote',
          label: 'Solicitar reembolso',
          data: { type: 'request_refund' }
        }
      ],
      attachments: [],
      shouldEscalate: false,
      nextSteps: ['Verificar elegibilidade', 'Processar reembolso']
    };
  }

  private async handleTechnicalIssue(session: ChatSession): Promise<AIResponse> {
    return {
      message: 'Que problema técnico você está enfrentando? Posso tentar ajudar ou conectar você com nossa equipe técnica.',
      confidence: 0.8,
      actions: [
        {
          id: 'website_issue',
          type: 'get_quote',
          label: 'Problema no site',
          data: { type: 'website_issue' }
        },
        {
          id: 'payment_issue',
          type: 'get_quote',
          label: 'Problema de pagamento',
          data: { type: 'payment_issue' }
        },
        {
          id: 'app_issue',
          type: 'get_quote',
          label: 'Problema no app',
          data: { type: 'app_issue' }
        },
        {
          id: 'technical_support',
          type: 'transfer_human',
          label: 'Suporte técnico',
          data: { department: 'technical' }
        }
      ],
      attachments: [],
      shouldEscalate: false,
      nextSteps: ['Identificar problema específico', 'Oferecer solução ou escalar']
    };
  }

  private async escalateToHuman(session: ChatSession): Promise<void> {
    session.status = 'transferred';
    console.log(`🔄 Escalating session ${session.id} to human support`);
    
    // In a real implementation, this would integrate with your support system
    // Examples: Zendesk, Intercom, custom support dashboard
  }

  private loadUserProfile(userId: string): UserProfile | undefined {
    // In a real implementation, load from database
    return {
      id: userId,
      name: 'Usuário',
      preferredLanguage: 'pt-BR',
      bookingHistory: [],
      preferences: {},
      loyaltyStatus: {}
    };
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private cleanupInactiveSessions(): void {
    const now = Date.now();
    const timeout = 30 * 60 * 1000; // 30 minutes

    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (now - session.lastActivity.getTime() > timeout) {
        this.activeSessions.delete(sessionId);
        console.log(`🧹 Cleaned up inactive session: ${sessionId}`);
      }
    }
  }

  /**
   * Public methods for external integration
   */
  
  async getSession(sessionId: string): Promise<ChatSession | null> {
    return this.activeSessions.get(sessionId) || null;
  }

  async updateUserProfile(sessionId: string, profileData: Partial<UserProfile>): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.context.userProfile = { ...session.context.userProfile, ...profileData } as UserProfile;
    }
  }

  async handleAction(sessionId: string, actionId: string, actionData: any): Promise<ChatMessage | null> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return null;

    // Process the action and return response
    const response = await this.processAction(session, actionId, actionData);
    
    const assistantMessage: ChatMessage = {
      id: this.generateMessageId(),
      type: 'assistant',
      content: response.message,
      timestamp: new Date(),
      attachments: response.attachments,
      actions: response.actions
    };

    session.messages.push(assistantMessage);
    return assistantMessage;
  }

  private async processAction(session: ChatSession, actionId: string, actionData: any): Promise<AIResponse> {
    switch (actionId) {
      case 'search_flights':
        return this.handleFlightSearch(session, []);
      case 'search_hotels':
        return this.handleHotelSearch(session, []);
      case 'confirm_booking':
        return this.processBookingConfirmation(session, actionData);
      case 'transfer_human':
        await this.escalateToHuman(session);
        return {
          message: 'Transferindo você para um atendente humano. Por favor, aguarde...',
          confidence: 1.0,
          actions: [],
          attachments: [],
          shouldEscalate: true,
          nextSteps: ['Aguardar atendente humano']
        };
      default:
        return this.generateFallbackResponse(session);
    }
  }

  private async handleHotelSearch(session: ChatSession, entities: ChatEntity[]): Promise<AIResponse> {
    return {
      message: 'A busca de hotéis está sendo implementada. Por enquanto, posso ajudar com voos. Que tal buscarmos um voo?',
      confidence: 0.7,
      actions: [
        {
          id: 'search_flights',
          type: 'get_quote',
          label: 'Buscar voos',
          data: { type: 'flight' },
          primary: true
        }
      ],
      attachments: [],
      shouldEscalate: false,
      nextSteps: ['Implementar busca de hotéis']
    };
  }

  private async processBookingConfirmation(session: ChatSession, bookingData: any): Promise<AIResponse> {
    return {
      message: '✅ Reserva confirmada com sucesso! Você receberá a confirmação por email em alguns minutos.',
      confidence: 1.0,
      actions: [
        {
          id: 'view_booking_details',
          type: 'get_quote',
          label: 'Ver detalhes da reserva',
          data: bookingData
        },
        {
          id: 'new_search',
          type: 'get_quote',
          label: 'Nova busca',
          data: {}
        }
      ],
      attachments: [],
      shouldEscalate: false,
      nextSteps: ['Enviar confirmação por email', 'Aguardar nova solicitação']
    };
  }
}

/**
 * Simple Knowledge Base for FAQ and information
 */
class KnowledgeBase {
  private knowledge: Map<string, any> = new Map();

  load(): void {
    this.knowledge.set('baggage', {
      answer: 'Nossa política de bagagem varia por companhia aérea. Geralmente: bagagem de mão até 10kg é gratuita, bagagem despachada tem custo adicional.',
      confidence: 0.9,
      topic: 'baggage'
    });

    this.knowledge.set('cancellation', {
      answer: 'Você pode cancelar sua reserva até 24h após a compra sem custo. Após esse período, podem ser aplicadas taxas conforme a política da companhia aérea.',
      confidence: 0.9,
      topic: 'cancellation'
    });

    // Add more knowledge base entries...
  }

  async search(query: string): Promise<{ found: boolean; answer?: string; confidence?: number; topic?: string }> {
    const lowercaseQuery = query.toLowerCase();
    
    for (const [key, value] of this.knowledge.entries()) {
      if (lowercaseQuery.includes(key)) {
        return {
          found: true,
          answer: value.answer,
          confidence: value.confidence,
          topic: value.topic
        };
      }
    }

    return { found: false };
  }
}

/**
 * Simple NLP Engine for intent recognition
 */
class NLPEngine {
  async analyze(message: string, context: ChatContext): Promise<{
    intent: ChatIntent | null;
    entities: ChatEntity[];
    sentiment: 'positive' | 'neutral' | 'negative';
  }> {
    const lowercaseMessage = message.toLowerCase();
    
    // Simple intent recognition
    let intent: ChatIntent | null = null;
    
    if (this.containsAny(lowercaseMessage, ['buscar', 'procurar', 'encontrar', 'voo', 'hotel'])) {
      intent = {
        name: 'search',
        confidence: 0.8,
        category: 'search',
        subcategory: this.containsAny(lowercaseMessage, ['voo', 'passagem']) ? 'flight' : 
                     this.containsAny(lowercaseMessage, ['hotel', 'hospedagem']) ? 'hotel' : undefined
      };
    } else if (this.containsAny(lowercaseMessage, ['reservar', 'comprar', 'booking'])) {
      intent = {
        name: 'book',
        confidence: 0.8,
        category: 'booking'
      };
    } else if (this.containsAny(lowercaseMessage, ['cancelar', 'problema', 'ajuda', 'suporte'])) {
      intent = {
        name: 'support',
        confidence: 0.7,
        category: 'support',
        subcategory: this.containsAny(lowercaseMessage, ['cancelar']) ? 'cancellation' : 'general'
      };
    }

    // Simple entity extraction
    const entities: ChatEntity[] = [];
    
    // Extract potential locations (simplified)
    const locationPattern = /(gru|gig|bsb|ssa|for|rec|mia|lax|jfk|lhr)/gi;
    const locationMatches = message.match(locationPattern);
    if (locationMatches) {
      locationMatches.forEach(match => {
        entities.push({
          type: 'location',
          value: match,
          normalized: match.toUpperCase(),
          confidence: 0.9
        });
      });
    }

    // Simple sentiment analysis
    const sentiment = this.containsAny(lowercaseMessage, ['problema', 'ruim', 'cancelar', 'reclamar']) ? 'negative' :
                     this.containsAny(lowercaseMessage, ['obrigado', 'ótimo', 'excelente', 'perfeito']) ? 'positive' : 'neutral';

    return { intent, entities, sentiment };
  }

  private containsAny(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }
}