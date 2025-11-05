'use client';

import { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  Bot,
  User,
  Loader2,
  Phone,
  Mail,
  Sparkles,
  LogIn,
  UserPlus,
  Plane
} from 'lucide-react';
import { getConsultant, type TeamType, type ConsultantProfile } from '@/lib/ai/consultant-profiles';
import { getEngagementStage, buildAuthPrompt, type UserSession } from '@/lib/ai/auth-strategy';
import { FlightResultCard } from './FlightResultCard';
import { ConsultantAvatar, UserAvatar } from './ConsultantAvatar';
import { ConsultantProfileModal } from './ConsultantProfileModal';
import { useRouter } from 'next/navigation';
import { useAIAnalytics } from '@/lib/hooks/useAIAnalytics';
import {
  calculateTypingDelay,
  calculateThinkingDelay,
  calculateMultiMessageDelay,
  detectMessageType,
  getTypingIndicatorText,
  type TypingState
} from '@/lib/utils/typing-simulation';
// CONVERSATIONAL INTELLIGENCE INTEGRATION
import {
  analyzeConversationIntent,
  getConversationalResponse,
  ConversationContext,
  type IntentType
} from '@/lib/ai/conversational-intelligence';
import {
  generateHandoffMessage,
  needsHandoff,
  getPreviousConsultantTeam,
  type TeamType as HandoffTeamType
} from '@/lib/ai/consultant-handoff';
// CONVERSATION PERSISTENCE
import {
  loadConversation,
  saveConversation,
  startConversation,
  addMessage,
  clearConversation,
  hasRecoverableConversation,
  shouldShowRecoveryPrompt,
  type ConversationState
} from '@/lib/ai/conversation-persistence';
import { ConversationRecoveryBanner } from './ConversationRecoveryBanner';
import { useConversationSync, useDatabaseSync } from '@/lib/hooks/useConversationSync';

interface FlightSearchResult {
  id: string;
  airline: string;
  flightNumber: string;
  departure: {
    airport: string;
    time: string;
    terminal?: string;
  };
  arrival: {
    airport: string;
    time: string;
    terminal?: string;
  };
  duration: string;
  stops: number;
  stopover?: string;
  price: {
    amount: string;
    currency: string;
  };
  cabinClass: string;
  seatsAvailable: number;
  baggage: {
    checked: string;
    cabin: string;
  };
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  consultant?: {
    id: string;
    name: string;
    title: string;
    avatar: string;
    team: TeamType;
  };
  flightResults?: FlightSearchResult[];
  isSearching?: boolean;
}

interface Props {
  language?: 'en' | 'pt' | 'es';
}

export function AITravelAssistant({ language = 'en' }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingState, setTypingState] = useState<TypingState | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [authPromptMessage, setAuthPromptMessage] = useState('');
  const [isSearchingFlights, setIsSearchingFlights] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState<ConsultantProfile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // User session tracking (simplified for now - will connect to real API later)
  const [userSession, setUserSession] = useState<UserSession>({
    sessionId: `session_${Date.now()}`,
    ipAddress: 'unknown', // Will be fetched from API
    isAuthenticated: false,
    conversationCount: 0,
    lastActivity: new Date(),
    createdAt: new Date()
  });

  // CONVERSATION CONTEXT TRACKING
  const [conversationContext] = useState(() => new ConversationContext());

  // CONVERSATION PERSISTENCE
  const [conversation, setConversation] = useState<ConversationState | null>(null);
  const [recoverableConversation, setRecoverableConversation] = useState<ConversationState | null>(null);
  const [showRecoveryBanner, setShowRecoveryBanner] = useState(false);

  // Analytics tracking
  const analytics = useAIAnalytics({
    sessionId: userSession.sessionId,
    userId: undefined, // TODO: Connect to real user auth
    isAuthenticated: userSession.isAuthenticated,
  });

  // CONVERSATION SYNC: Auto-migrate to database when user logs in
  const { isAuthenticated, userId } = useConversationSync();

  // CONVERSATION SYNC: Periodic sync to database for logged-in users
  useDatabaseSync(conversation, isAuthenticated);

  // Translations
  const translations = {
    en: {
      title: 'Travel Expert Assistant',
      subtitle: '12 Specialized Consultants • 24/7',
      placeholder: 'Ask me anything about your travel...',
      send: 'Send',
      close: 'Close',
      minimize: 'Minimize',
      welcome: 'Hello! 👋 I\'m your AI Travel Assistant. How can I help you today?',
      typing: 'is typing...',
      quickActions: 'Quick Actions:',
      quickQuestions: [
        'Flight from NYC to Dubai on Nov 15',
        '🏨 Best hotel deals',
        '📞 Contact support',
        '💳 Payment methods',
        '❓ FAQ & Help'
      ],
      contactSupport: 'Need human assistance?',
      callUs: 'Call Us',
      emailUs: 'Email Us',
      poweredBy: 'Expert Team • 24/7 Available',
      signIn: 'Sign In',
      signUp: 'Create Free Account',
      continueAsGuest: 'Continue as Guest'
    },
    pt: {
      title: 'Assistente de Especialistas',
      subtitle: '12 Consultores Especializados • 24/7',
      placeholder: 'Pergunte-me sobre sua viagem...',
      send: 'Enviar',
      close: 'Fechar',
      minimize: 'Minimizar',
      welcome: 'Olá! 👋 Sou seu Assistente de Viagem IA. Como posso ajudá-lo hoje?',
      typing: 'está digitando...',
      quickActions: 'Ações Rápidas:',
      quickQuestions: [
        'Voo de São Paulo para Lisboa em 15 nov',
        '🏨 Melhores ofertas de hotéis',
        '📞 Contatar suporte',
        '💳 Métodos de pagamento',
        '❓ FAQ & Ajuda'
      ],
      contactSupport: 'Precisa de assistência humana?',
      callUs: 'Ligar',
      emailUs: 'Email',
      poweredBy: 'Equipe de Especialistas • 24/7',
      signIn: 'Entrar',
      signUp: 'Criar Conta Grátis',
      continueAsGuest: 'Continuar como Convidado'
    },
    es: {
      title: 'Asistente de Expertos',
      subtitle: '12 Consultores Especializados • 24/7',
      placeholder: 'Pregúntame sobre tu viaje...',
      send: 'Enviar',
      close: 'Cerrar',
      minimize: 'Minimizar',
      welcome: '¡Hola! 👋 Soy tu Asistente de Viajes IA. ¿Cómo puedo ayudarte hoy?',
      typing: 'está escribiendo...',
      quickActions: 'Acciones Rápidas:',
      quickQuestions: [
        'Vuelo de Madrid a Nueva York el 15 nov',
        '🏨 Mejores ofertas de hoteles',
        '📞 Contactar soporte',
        '💳 Métodos de pago',
        '❓ FAQ & Ayuda'
      ],
      contactSupport: '¿Necesitas asistencia humana?',
      callUs: 'Llamar',
      emailUs: 'Email',
      poweredBy: 'Equipo de Expertos • 24/7',
      signIn: 'Iniciar Sesión',
      signUp: 'Crear Cuenta Gratis',
      continueAsGuest: 'Continuar como Invitado'
    }
  };

  const t = translations[language];

  // Initialize with welcome message from Lisa (Customer Service)
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const lisaConsultant = getConsultant('customer-service');
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: lisaConsultant.greeting[language],
          timestamp: new Date(),
          consultant: {
            id: lisaConsultant.id,
            name: lisaConsultant.name,
            title: lisaConsultant.title,
            avatar: lisaConsultant.avatar,
            team: lisaConsultant.team
          }
        }
      ]);
    }
  }, [isOpen, messages.length, language]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // CONVERSATION PERSISTENCE: Load or start conversation on mount
  useEffect(() => {
    const existingConversation = loadConversation();

    if (existingConversation && shouldShowRecoveryPrompt(existingConversation)) {
      // Show recovery banner for recent conversations
      setRecoverableConversation(existingConversation);
      setShowRecoveryBanner(true);

      // Start fresh conversation (user can resume if they want)
      const newConversation = startConversation(
        userSession.isAuthenticated ? userSession.sessionId : null
      );
      setConversation(newConversation);
    } else if (existingConversation) {
      // Auto-resume very recent conversations (< 1 minute old)
      setConversation(existingConversation);

      // Restore messages from conversation
      const restoredMessages = existingConversation.messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        consultant: msg.consultant ? {
          id: msg.consultant.name.toLowerCase().replace(/\s+/g, '-'),
          name: msg.consultant.name,
          title: getConsultant(msg.consultant.team as TeamType).title,
          avatar: getConsultant(msg.consultant.team as TeamType).avatar,
          team: msg.consultant.team as TeamType
        } : undefined,
        flightResults: msg.flightResults,
      }));
      setMessages(restoredMessages);
    } else {
      // Start new conversation
      const newConversation = startConversation(
        userSession.isAuthenticated ? userSession.sessionId : null
      );
      setConversation(newConversation);
    }
  }, []); // Only run once on mount

  /**
   * Send AI response with realistic human-like typing behavior
   */
  const sendAIResponseWithTyping = async (
    responseContent: string,
    consultant: ReturnType<typeof getConsultant>,
    userMessage: string,
    additionalData?: Partial<Message>
  ) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    const messageType = detectMessageType(responseContent);

    // Phase 1: Thinking
    const thinkingDelay = calculateThinkingDelay(userMessage, messageType);
    setTypingState({
      phase: 'thinking',
      consultantName: consultant.name
    });
    setIsTyping(true);

    await new Promise(resolve => {
      typingTimeoutRef.current = setTimeout(resolve, thinkingDelay);
    });

    // Phase 2: Typing
    const typingDelay = calculateTypingDelay(responseContent, messageType);
    setTypingState({
      phase: 'typing',
      consultantName: consultant.name,
      message: responseContent
    });

    await new Promise(resolve => {
      typingTimeoutRef.current = setTimeout(resolve, typingDelay);
    });

    // Phase 3: Display message
    const aiResponse: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: responseContent,
      timestamp: new Date(),
      consultant: {
        id: consultant.id,
        name: consultant.name,
        title: consultant.title,
        avatar: consultant.avatar,
        team: consultant.team
      },
      ...additionalData
    };

    setMessages(prev => [...prev, aiResponse]);
    setIsTyping(false);
    setTypingState(null);

    // Save assistant message to conversation persistence
    if (conversation) {
      const updatedConversation = addMessage(conversation, {
        role: 'assistant',
        content: responseContent,
        consultant: {
          name: consultant.name,
          team: consultant.team,
          emoji: consultant.avatar
        },
        flightResults: additionalData?.flightResults,
      });
      setConversation(updatedConversation);
    }

    analytics.trackMessage('assistant', {
      team: consultant.team,
      name: consultant.name,
    });

    return aiResponse;
  };

  /**
   * Send multiple AI responses in sequence
   */
  const sendMultipleAIResponses = async (
    responses: Array<{
      content: string;
      additionalData?: Partial<Message>;
    }>,
    consultant: ReturnType<typeof getConsultant>,
    userMessage: string
  ) => {
    for (let i = 0; i < responses.length; i++) {
      const { content, additionalData } = responses[i];

      if (i > 0) {
        const multiMessageDelay = calculateMultiMessageDelay(i, responses.length);
        await new Promise(resolve => {
          typingTimeoutRef.current = setTimeout(resolve, multiMessageDelay);
        });
      }

      await sendAIResponseWithTyping(content, consultant, userMessage, additionalData);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const queryText = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    // Save user message to conversation persistence
    if (conversation) {
      const updatedConversation = addMessage(conversation, {
        role: 'user',
        content: inputMessage
      });
      setConversation(updatedConversation);
    }

    analytics.trackMessage('user');

    const newConversationCount = userSession.conversationCount + 1;
    setUserSession(prev => ({
      ...prev,
      conversationCount: newConversationCount,
      lastActivity: new Date()
    }));

    // ANALYZE CONVERSATION INTENT FIRST
    const messageHistory = messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
      timestamp: m.timestamp.getTime()
    }));

    const analysis = analyzeConversationIntent(queryText, messageHistory);

    const consultantTeam = determineConsultantTeam(queryText);
    const consultant = getConsultant(consultantTeam);

    analytics.trackConsultantRouted({
      team: consultant.team,
      name: consultant.name,
    });

    // CHECK IF CONSULTANT HANDOFF IS NEEDED
    const previousTeam = getPreviousConsultantTeam(messages);
    const handoffNeeded = needsHandoff(previousTeam, consultantTeam as HandoffTeamType);

    if (handoffNeeded && previousTeam) {
      const handoff = generateHandoffMessage(
        previousTeam as HandoffTeamType,
        consultantTeam as HandoffTeamType,
        queryText,
        null // Will be populated after parsing
      );

      // Previous consultant announces transfer
      const previousConsultant = getConsultant(previousTeam as TeamType);
      await sendAIResponseWithTyping(
        handoff.transferAnnouncement,
        previousConsultant,
        queryText
      );

      // Small delay between consultants
      await new Promise(resolve => setTimeout(resolve, 1500));

      // New consultant introduces themselves
      await sendAIResponseWithTyping(
        handoff.introduction,
        consultant,
        queryText
      );
    }

    const engagement = getEngagementStage(
      { ...userSession, conversationCount: newConversationCount },
      'ask-question'
    );

    // HANDLE CONVERSATIONAL RESPONSES (greetings, small talk, etc.)
    if (analysis.requiresPersonalResponse && !analysis.isServiceRequest) {
      const naturalResponse = getConversationalResponse(
        analysis,
        {
          name: consultant.name,
          personality: consultant.personality || 'friendly',
          emoji: '😊'
        },
        conversationContext
      );

      await sendAIResponseWithTyping(naturalResponse, consultant, queryText);

      // Track conversation context
      conversationContext.addInteraction(analysis.intent, naturalResponse, queryText);

      return; // Exit early for conversational responses
    }

    const isFlightQuery = detectFlightSearchIntent(queryText);

    if (isFlightQuery && consultantTeam === 'flight-operations') {
      const searchInitMessage = language === 'en'
        ? "I'll search for flights for you right away..."
        : language === 'pt'
        ? "Vou pesquisar voos para você agora mesmo..."
        : "Buscaré vuelos para ti de inmediato...";

      await sendAIResponseWithTyping(searchInitMessage, consultant, queryText, {
        isSearching: true
      });

      setIsSearchingFlights(true);

      const searchStartTime = Date.now();
      try {
        const response = await fetch('/api/ai/search-flights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: queryText, language })
        });

        const data = await response.json();
        const searchDuration = Date.now() - searchStartTime;

        setIsSearchingFlights(false);

        analytics.trackFlightSearch({
          searchQuery: queryText,
          origin: data.origin,
          destination: data.destination,
          resultsCount: data.flights?.length || 0,
          searchDuration,
        });

        if (data.success && data.flights && data.flights.length > 0) {
          setMessages(prev => prev.filter(m => !m.isSearching));

          // Warm, natural response from Lisa
          const tripType = data.searchParams?.returnDate ? 'round-trip' : 'one-way';
          const cabinClass = data.searchParams?.cabinClass || 'economy';
          const isBusinessClass = cabinClass === 'business' || cabinClass === 'first';

          const resultsContent = language === 'en'
            ? `Oh wonderful, sweetie! ✈️ I found ${data.flights.length} fantastic ${isBusinessClass ? cabinClass.charAt(0).toUpperCase() + cabinClass.slice(1) + ' Class' : ''} options for your ${tripType} journey! Let me show you the best ones:`
            : language === 'pt'
            ? `Que maravilha, querido! ✈️ Encontrei ${data.flights.length} opções fantásticas ${isBusinessClass ? 'em ' + cabinClass : ''} para sua viagem ${tripType === 'round-trip' ? 'ida e volta' : 'só ida'}! Deixe-me mostrar as melhores:`
            : `¡Qué maravilloso, cariño! ✈️ Encontré ${data.flights.length} opciones fantásticas ${isBusinessClass ? 'en ' + cabinClass : ''} para tu viaje de ${tripType === 'round-trip' ? 'ida y vuelta' : 'solo ida'}! Déjame mostrarte las mejores:`;

          const followUpContent = language === 'en'
            ? "Which of these catches your eye, hon? I'm here to help you with the booking or we can adjust the search if you'd like! 💕"
            : language === 'pt'
            ? "Qual desses chamou sua atenção, querido? Estou aqui para ajudá-lo com a reserva ou podemos ajustar a busca se você quiser! 💕"
            : "¿Cuál de estos te llama la atención, cariño? ¡Estoy aquí para ayudarte con la reserva o podemos ajustar la búsqueda si quieres! 💕";

          await sendMultipleAIResponses([
            {
              content: resultsContent,
              additionalData: { flightResults: data.flights.slice(0, 3) }
            },
            {
              content: followUpContent
            }
          ], consultant, queryText);
        } else {
          setMessages(prev => prev.filter(m => !m.isSearching));

          const errorContent = language === 'en'
            ? "I couldn't find flights matching your criteria. Could you provide more details like the origin city, destination, and travel dates?"
            : language === 'pt'
            ? "Não consegui encontrar voos correspondentes aos seus critérios. Você poderia fornecer mais detalhes como cidade de origem, destino e datas de viagem?"
            : "No pude encontrar vuelos que coincidan con tus criterios. ¿Podrías proporcionar más detalles como la ciudad de origen, el destino y las fechas de viaje?";

          await sendAIResponseWithTyping(errorContent, consultant, queryText);
        }
      } catch (error) {
        console.error('Flight search error:', error);
        setIsSearchingFlights(false);
        setMessages(prev => prev.filter(m => !m.isSearching));

        const errorContent = language === 'en'
          ? "I encountered an error searching for flights. Please try again or contact support if the issue persists."
          : language === 'pt'
          ? "Encontrei um erro ao pesquisar voos. Tente novamente ou entre em contato com o suporte se o problema persistir."
          : "Encontré un error al buscar vuelos. Por favor, inténtalo de nuevo o contacta con soporte si el problema persiste.";

        await sendAIResponseWithTyping(errorContent, consultant, queryText);
      }
    }

    // HANDLE HOTEL SEARCH
    const isHotelQuery = detectHotelSearchIntent(queryText);

    if (isHotelQuery && consultantTeam === 'hotel-accommodations') {
      const searchInitMessage = language === 'en'
        ? "Let me search for the perfect accommodations for you..."
        : language === 'pt'
        ? "Deixe-me procurar as acomodações perfeitas para você..."
        : "Déjame buscar el alojamiento perfecto para ti...";

      await sendAIResponseWithTyping(searchInitMessage, consultant, queryText, {
        isSearching: true
      });

      try {
        const response = await fetch('/api/ai/search-hotels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: queryText, language })
        });

        const data = await response.json();

        if (data.success && data.hotels && data.hotels.length > 0) {
          setMessages(prev => prev.filter(m => !m.isSearching));

          // Marcus's warm, hospitable response
          const hotelCount = data.hotels.length;
          const nights = data.searchParams.checkOut && data.searchParams.checkIn
            ? Math.ceil((new Date(data.searchParams.checkOut).getTime() - new Date(data.searchParams.checkIn).getTime()) / (1000 * 60 * 60 * 24))
            : 0;

          const warmResponse = language === 'en'
            ? `¡Perfecto! I found ${hotelCount} wonderful options in ${data.searchParams.city} for you! 🏨\n\n` +
              `You'll be staying for ${nights} night${nights > 1 ? 's' : ''} (${data.searchParams.checkIn} to ${data.searchParams.checkOut}) ` +
              `with ${data.searchParams.guests} guest${data.searchParams.guests > 1 ? 's' : ''}. Let me show you the best choices:\n\n` +
              data.hotels.slice(0, 3).map((hotel: any, i: number) =>
                `${i + 1}. **${hotel.name}** ⭐ ${hotel.rating}/5\n` +
                `   📍 ${hotel.address}\n` +
                `   💰 $${hotel.pricePerNight}/night ($${hotel.totalPrice} total)\n` +
                `   ✨ ${hotel.amenities.slice(0, 3).join(', ')}`
              ).join('\n\n')
            : language === 'pt'
            ? `¡Perfeito! Encontrei ${hotelCount} opções maravilhosas em ${data.searchParams.city} para você! 🏨\n\n` +
              data.hotels.slice(0, 3).map((hotel: any, i: number) =>
                `${i + 1}. **${hotel.name}** ⭐ ${hotel.rating}/5\n` +
                `   📍 ${hotel.address}\n` +
                `   💰 $${hotel.pricePerNight}/noite ($${hotel.totalPrice} total)\n` +
                `   ✨ ${hotel.amenities.slice(0, 3).join(', ')}`
              ).join('\n\n')
            : `¡Perfecto! Encontré ${hotelCount} opciones maravillosas en ${data.searchParams.city} para ti! 🏨\n\n` +
              data.hotels.slice(0, 3).map((hotel: any, i: number) =>
                `${i + 1}. **${hotel.name}** ⭐ ${hotel.rating}/5\n` +
                `   📍 ${hotel.address}\n` +
                `   💰 $${hotel.pricePerNight}/noche ($${hotel.totalPrice} total)\n` +
                `   ✨ ${hotel.amenities.slice(0, 3).join(', ')}`
              ).join('\n\n');

          const followUpContent = language === 'en'
            ? "\n\nWhich one catches your eye? I can help you book any of these or search for different options if you'd like! 🏨"
            : language === 'pt'
            ? "\n\nQual desses te agrada? Posso ajudá-lo a reservar qualquer um deles ou procurar opções diferentes se desejar! 🏨"
            : "\n\n¿Cuál te gusta más? ¡Puedo ayudarte a reservar cualquiera de estos o buscar diferentes opciones si lo deseas! 🏨";

          await sendMultipleAIResponses([
            {
              content: warmResponse
            },
            {
              content: followUpContent
            }
          ], consultant, queryText);
        } else {
          setMessages(prev => prev.filter(m => !m.isSearching));

          const errorContent = language === 'en'
            ? "I couldn't find hotels matching your request. Could you provide the city, check-in date, check-out date, and number of guests?"
            : language === 'pt'
            ? "Não consegui encontrar hotéis correspondentes à sua solicitação. Você poderia fornecer a cidade, data de check-in, data de check-out e número de hóspedes?"
            : "No pude encontrar hoteles que coincidan con tu solicitud. ¿Podrías proporcionar la ciudad, fecha de entrada, fecha de salida y número de huéspedes?";

          await sendAIResponseWithTyping(errorContent, consultant, queryText);
        }
      } catch (error) {
        console.error('Hotel search error:', error);
        setMessages(prev => prev.filter(m => !m.isSearching));

        const errorContent = language === 'en'
          ? "I encountered an error searching for hotels. Please try again or contact support if the issue persists."
          : language === 'pt'
          ? "Encontrei um erro ao pesquisar hotéis. Tente novamente ou entre em contato com o suporte se o problema persistir."
          : "Encontré un error al buscar hoteles. Por favor, inténtalo de nuevo o contacta con soporte si el problema persiste.";

        await sendAIResponseWithTyping(errorContent, consultant, queryText);
      }
    } else if (!isFlightQuery && !isHotelQuery) {
      // SERVICE REQUEST OR GENERAL INQUIRY
      // Use conversational response if available, otherwise fall back to service response
      let responseContent: string;

      if (analysis.isServiceRequest) {
        // Service request - use conversational response which will be natural + helpful
        responseContent = getConversationalResponse(
          analysis,
          {
            name: consultant.name,
            personality: consultant.personality || 'friendly',
            emoji: '😊'
          },
          conversationContext
        );
      } else {
        // Use legacy response for complex queries
        responseContent = generateAIResponse(queryText, language, consultant);
      }

      await sendAIResponseWithTyping(responseContent, consultant, queryText);

      // Track conversation context
      conversationContext.addInteraction(
        analysis.isServiceRequest ? 'service-request' : 'question',
        responseContent,
        queryText
      );

      if (engagement.showAuthPrompt && engagement.promptMessage) {
        setAuthPromptMessage(engagement.promptMessage);
        setShowAuthPrompt(true);

        const stage = engagement.stage === 'anonymous'
          ? 'first_interaction'
          : engagement.stage === 'interested'
          ? 'search_performed'
          : engagement.stage === 'engaged'
          ? 'results_viewed'
          : 'pre_booking';
        analytics.trackAuthPromptShown(stage as any);
      }
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFlightSelect = (flightId: string) => {
    router.push(`/flights/results?flightId=${flightId}`);
  };

  const handleSeeMoreFlights = () => {
    router.push('/flights/results');
  };

  const handleAvatarClick = (consultant: { id: string; name: string; team: TeamType }) => {
    const fullConsultant = getConsultant(consultant.team);
    setSelectedConsultant(fullConsultant);
  };

  useEffect(() => {
    if (isOpen) {
      analytics.trackChatOpen();
    } else if (messages.length > 0) {
      analytics.trackChatClose();
    }
  }, [isOpen]);

  // RECOVERY BANNER HANDLERS
  const handleResumeConversation = () => {
    if (recoverableConversation) {
      // Restore the recoverable conversation
      setConversation(recoverableConversation);

      // Restore messages
      const restoredMessages = recoverableConversation.messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        consultant: msg.consultant ? {
          id: msg.consultant.name.toLowerCase().replace(/\s+/g, '-'),
          name: msg.consultant.name,
          title: getConsultant(msg.consultant.team as TeamType).title,
          avatar: getConsultant(msg.consultant.team as TeamType).avatar,
          team: msg.consultant.team as TeamType
        } : undefined,
        flightResults: msg.flightResults,
      }));
      setMessages(restoredMessages);

      // Hide banner and clear recoverable state
      setShowRecoveryBanner(false);
      setRecoverableConversation(null);
    }
  };

  const handleStartNewConversation = () => {
    if (conversation) {
      // Clear current conversation
      clearConversation();

      // Start fresh
      const newConversation = startConversation(
        userSession.isAuthenticated ? userSession.sessionId : null
      );
      setConversation(newConversation);
      setMessages([]);

      // Hide banner and clear recoverable state
      setShowRecoveryBanner(false);
      setRecoverableConversation(null);
    }
  };

  const handleDismissRecoveryBanner = () => {
    setShowRecoveryBanner(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[1500] w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 group"
        aria-label="Open AI Travel Assistant"
      >
        <Bot className="w-7 h-7 group-hover:rotate-12 transition-transform" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse" />
        <Sparkles className="absolute -top-2 -left-2 w-5 h-5 text-yellow-400 animate-pulse" />
      </button>
    );
  }

  return (
    <>
      {/* Conversation Recovery Banner */}
      {showRecoveryBanner && recoverableConversation && (
        <ConversationRecoveryBanner
          conversation={recoverableConversation}
          onResume={handleResumeConversation}
          onStartNew={handleStartNewConversation}
          onDismiss={handleDismissRecoveryBanner}
        />
      )}

      <div
        className={`fixed bottom-6 right-6 z-[1500] w-[400px] max-w-[calc(100vw-3rem)] transition-all duration-300 ${
          isMinimized ? 'h-16' : 'h-[600px] max-h-[calc(100vh-3rem)]'
        }`}
      >
        {/* Chat Window */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-primary-600 rounded-full" />
              </div>
              <div className="text-white">
                <h3 className="font-bold text-base">{t.title}</h3>
                <p className="text-xs text-primary-100">{t.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
                aria-label={t.minimize}
              >
                <Minimize2 className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
                aria-label={t.close}
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {/* Professional Avatar */}
                    {message.role === 'user' ? (
                      <UserAvatar size="sm" />
                    ) : message.consultant ? (
                      <ConsultantAvatar
                        consultantId={message.consultant.id}
                        name={message.consultant.name}
                        size="sm"
                        showStatus={true}
                        onClick={() => handleAvatarClick(message.consultant!)}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div className="flex flex-col gap-1 max-w-[75%]">
                      {/* Consultant Name & Title */}
                      {message.role === 'assistant' && message.consultant && (
                        <div className="flex items-center gap-2 px-1">
                          <p className="text-[11px] font-semibold text-gray-700">
                            {message.consultant.name}
                          </p>
                          <span className="text-[10px] text-gray-400">•</span>
                          <p className="text-[10px] text-gray-500">
                            {message.consultant.title}
                          </p>
                        </div>
                      )}

                      <div
                        className={`rounded-2xl px-4 py-2.5 ${
                          message.role === 'user'
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-900 border border-gray-200'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <p
                          className={`text-[10px] mt-1.5 ${
                            message.role === 'user' ? 'text-primary-100' : 'text-gray-400'
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Flight Results */}
                {messages.map((message) => {
                  if (message.flightResults && message.flightResults.length > 0) {
                    return (
                      <div key={`flights-${message.id}`} className="space-y-2 mt-2">
                        {message.flightResults.map((flight) => (
                          <FlightResultCard
                            key={flight.id}
                            flight={flight}
                            onSelect={handleFlightSelect}
                            compact={true}
                            onFlightSelected={(flightId, flightPrice) => {
                              analytics.trackFlightSelected(flightId, flightPrice);
                            }}
                          />
                        ))}
                        <button
                          onClick={handleSeeMoreFlights}
                          className="w-full py-2 bg-white border-2 border-primary-600 text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-all text-sm"
                        >
                          See More Flights →
                        </button>
                      </div>
                    );
                  }
                  return null;
                })}

                {/* Enhanced Typing Indicator */}
                {isTyping && typingState && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                      {typingState.phase === 'thinking' ? (
                        <Bot className="w-4 h-4 text-white animate-pulse" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] text-gray-500 px-1 font-medium">
                        {(typingState.phase === 'thinking' || typingState.phase === 'typing')
                          ? getTypingIndicatorText(typingState.phase, typingState.consultantName, language)
                          : t.typing}
                      </p>
                      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5">
                        {typingState.phase === 'thinking' ? (
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs text-gray-500">
                              {language === 'en' ? 'Reading...' : language === 'pt' ? 'Lendo...' : 'Leyendo...'}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Flight Search Loading */}
                {isSearchingFlights && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                      <Plane className="w-4 h-4 text-white animate-pulse" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] text-gray-500 px-1">
                        Searching flights...
                      </p>
                      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs text-gray-600">Finding best options...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Progressive Auth Prompt */}
              {showAuthPrompt && !userSession.isAuthenticated && (
                <div className="mx-4 my-3 p-4 bg-gradient-to-br from-primary-50 to-secondary-50 border-2 border-primary-200 rounded-xl animate-fadeIn">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 mb-3 whitespace-pre-line">
                        {authPromptMessage}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            analytics.trackAuthPromptClicked('signup');
                            setShowAuthPrompt(false);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-lg transition-colors"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>{t.signUp}</span>
                        </button>
                        <button
                          onClick={() => {
                            analytics.trackAuthPromptClicked('login');
                            setShowAuthPrompt(false);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 border-2 border-primary-600 text-primary-600 text-xs font-semibold rounded-lg transition-colors"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>{t.signIn}</span>
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        analytics.trackAuthPromptClicked('dismiss');
                        setShowAuthPrompt(false);
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              {messages.length === 1 && (
                <div className="px-4 py-3 bg-white border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 mb-2">
                    {t.quickActions}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {t.quickQuestions.map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickQuestion(question)}
                        className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Support Banner */}
              <div className="px-4 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
                <p className="text-[11px] text-gray-600 mb-2 text-center font-medium">
                  {t.contactSupport}
                </p>
                <div className="flex gap-2 justify-center">
                  <a
                    href="tel:+13322200838"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{t.callUs}</span>
                  </a>
                  <a
                    href="mailto:support@fly2any.com"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary-600 hover:bg-secondary-700 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    <Mail className="w-3 h-3" />
                    <span>{t.emailUs}</span>
                  </a>
                </div>
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={t.placeholder}
                    className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors text-sm"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white rounded-xl transition-colors flex items-center gap-2 font-semibold text-sm disabled:cursor-not-allowed"
                  >
                    {isTyping ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 text-center">
                  {t.poweredBy}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Consultant Profile Modal */}
      {selectedConsultant && (
        <ConsultantProfileModal
          consultant={selectedConsultant}
          isOpen={!!selectedConsultant}
          onClose={() => setSelectedConsultant(null)}
          language={language}
        />
      )}
    </>
  );
}

/**
 * Detect if the user message is requesting a flight search
 */
function detectFlightSearchIntent(userMessage: string): boolean {
  const msg = userMessage.toLowerCase();

  const flightKeywords = [
    'flight', 'flights', 'fly', 'voo', 'voos', 'vuelo', 'vuelos',
    'airline', 'airfare', 'ticket', 'tickets'
  ];

  const locationKeywords = [
    'from', 'to', 'de', 'para', 'desde', 'hasta',
    'nyc', 'dubai', 'london', 'paris', 'tokyo', 'miami', 'los angeles'
  ];

  const dateKeywords = [
    'on', 'in', 'november', 'december', 'january', 'february',
    'nov', 'dec', 'jan', 'feb', 'next week', 'next month',
    'tomorrow', 'today', 'weekend'
  ];

  const hasFlightKeyword = flightKeywords.some(keyword => msg.includes(keyword));
  const hasLocationKeyword = locationKeywords.some(keyword => msg.includes(keyword));
  const hasDateKeyword = dateKeywords.some(keyword => msg.includes(keyword));

  return hasFlightKeyword && (hasLocationKeyword || hasDateKeyword);
}

/**
 * Detect if user is requesting hotel search
 */
function detectHotelSearchIntent(userMessage: string): boolean {
  const msg = userMessage.toLowerCase();

  const hotelKeywords = [
    'hotel', 'hotels', 'accommodation', 'room', 'rooms',
    'stay', 'resort', 'place to stay'
  ];

  const locationKeywords = [
    'in', 'at', 'near', 'orlando', 'miami', 'new york', 'dubai',
    'london', 'paris', 'tokyo', 'los angeles', 'chicago', 'boston'
  ];

  const dateKeywords = [
    'from', 'to', 'check in', 'check out', 'checkin', 'checkout',
    'november', 'december', 'january', 'february', 'march',
    'nov', 'dec', 'jan', 'feb', 'mar', 'next week', 'next month'
  ];

  const hasHotelKeyword = hotelKeywords.some(keyword => msg.includes(keyword));
  const hasLocationKeyword = locationKeywords.some(keyword => msg.includes(keyword));
  const hasDateKeyword = dateKeywords.some(keyword => msg.includes(keyword));

  return hasHotelKeyword && (hasLocationKeyword || hasDateKeyword);
}

/**
 * Determine which consultant team should respond
 */
function determineConsultantTeam(userMessage: string): TeamType {
  const msg = userMessage.toLowerCase();

  if (msg.includes('flight') || msg.includes('voo') || msg.includes('vuelo') ||
      msg.includes('ticket') || msg.includes('airline') || msg.includes('airport')) {
    return 'flight-operations';
  }

  if (msg.includes('hotel') || msg.includes('accommodation') || msg.includes('stay') ||
      msg.includes('room') || msg.includes('resort')) {
    return 'hotel-accommodations';
  }

  if (msg.includes('payment') || msg.includes('pagamento') || msg.includes('pago') ||
      msg.includes('card') || msg.includes('refund') || msg.includes('charge')) {
    return 'payment-billing';
  }

  if (msg.includes('cancel') || msg.includes('cancelar') || msg.includes('rights') ||
      msg.includes('compensation') || msg.includes('refund') || msg.includes('policy')) {
    return 'legal-compliance';
  }

  if (msg.includes('insurance') || msg.includes('seguro') || msg.includes('coverage') ||
      msg.includes('claim')) {
    return 'travel-insurance';
  }

  if (msg.includes('visa') || msg.includes('visto') || msg.includes('passport') ||
      msg.includes('documento') || msg.includes('document')) {
    return 'visa-documentation';
  }

  if (msg.includes('car') || msg.includes('carro') || msg.includes('rental') ||
      msg.includes('aluguel') || msg.includes('drive')) {
    return 'car-rental';
  }

  if (msg.includes('points') || msg.includes('pontos') || msg.includes('loyalty') ||
      msg.includes('fidelidade') || msg.includes('reward') || msg.includes('miles')) {
    return 'loyalty-rewards';
  }

  if (msg.includes('technical') || msg.includes('técnico') || msg.includes('error') ||
      msg.includes('bug') || msg.includes('website') || msg.includes('app')) {
    return 'technical-support';
  }

  if (msg.includes('wheelchair') || msg.includes('disability') || msg.includes('special need') ||
      msg.includes('accessible') || msg.includes('diet') || msg.includes('child')) {
    return 'special-services';
  }

  if (msg.includes('emergency') || msg.includes('emergência') || msg.includes('urgente') ||
      msg.includes('urgent') || msg.includes('help') || msg.includes('lost')) {
    return 'crisis-management';
  }

  return 'customer-service';
}

/**
 * AI Response Generator
 */
function generateAIResponse(
  userMessage: string,
  language: 'en' | 'pt' | 'es',
  consultant: ReturnType<typeof getConsultant>
): string {
  const msg = userMessage.toLowerCase();

  if (msg.includes('flight') || msg.includes('voo') || msg.includes('vuelo')) {
    return language === 'en'
      ? 'I can help you find the best flights! Just tell me your departure city, destination, and travel dates. For example: "I need a flight from NYC to Dubai on November 15". I\'ll search for the best options for you!'
      : language === 'pt'
      ? 'Posso ajudá-lo a encontrar os melhores voos! Apenas me diga sua cidade de partida, destino e datas de viagem. Por exemplo: "Preciso de um voo de São Paulo para Lisboa em 15 de novembro". Vou pesquisar as melhores opções para você!'
      : '¡Puedo ayudarte a encontrar los mejores vuelos! Solo dime tu ciudad de salida, destino y fechas de viaje. Por ejemplo: "Necesito un vuelo de Madrid a Nueva York el 15 de noviembre". ¡Buscaré las mejores opciones para ti!';
  }

  if (msg.includes('hotel') || msg.includes('accommodation')) {
    return language === 'en'
      ? 'Looking for hotels? We have thousands of hotel options worldwide with great deals! You can filter by price, location, amenities, and ratings. What destination are you interested in?'
      : language === 'pt'
      ? 'Procurando hotéis? Temos milhares de opções de hotéis em todo o mundo com ótimas ofertas! Você pode filtrar por preço, localização, comodidades e classificações. Qual destino você está interessado?'
      : '¿Buscas hoteles? ¡Tenemos miles de opciones de hoteles en todo el mundo con grandes ofertas! Puedes filtrar por precio, ubicación, servicios y calificaciones. ¿Qué destino te interesa?';
  }

  if (msg.includes('payment') || msg.includes('pagamento') || msg.includes('pago')) {
    return language === 'en'
      ? 'We accept all major credit cards (Visa, Mastercard, Amex), PayPal, and bank transfers. All payments are secured with 256-bit SSL encryption. We also offer payment plans for bookings over $500. Is there a specific payment method you\'d like to use?'
      : language === 'pt'
      ? 'Aceitamos todos os principais cartões de crédito (Visa, Mastercard, Amex), PayPal e transferências bancárias. Todos os pagamentos são protegidos com criptografia SSL de 256 bits. Também oferecemos planos de pagamento para reservas acima de $500. Há um método de pagamento específico que você gostaria de usar?'
      : 'Aceptamos todas las principales tarjetas de crédito (Visa, Mastercard, Amex), PayPal y transferencias bancarias. Todos los pagos están asegurados con cifrado SSL de 256 bits. También ofrecemos planes de pago para reservas superiores a $500. ¿Hay un método de pago específico que te gustaría usar?';
  }

  if (msg.includes('cancel') || msg.includes('cancelar')) {
    return language === 'en'
      ? 'For cancellation policies, it depends on your booking type. Most flights offer free cancellation within 24 hours. Hotels vary by property. You can check your specific booking details in "My Bookings" or call us at 1-332-220-0838 for immediate assistance.'
      : language === 'pt'
      ? 'Para políticas de cancelamento, depende do tipo de reserva. A maioria dos voos oferece cancelamento gratuito em até 24 horas. Os hotéis variam de acordo com a propriedade. Você pode verificar os detalhes específicos da sua reserva em "Minhas Reservas" ou ligar para 1-332-220-0838 para assistência imediata.'
      : 'Para políticas de cancelación, depende del tipo de reserva. La mayoría de los vuelos ofrecen cancelación gratuita dentro de las 24 horas. Los hoteles varían según la propiedad. Puedes verificar los detalles específicos de tu reserva en "Mis Reservas" o llamar al 1-332-220-0838 para asistencia inmediata.';
  }

  if (msg.includes('support') || msg.includes('contact') || msg.includes('help') || msg.includes('suporte') || msg.includes('ayuda')) {
    return language === 'en'
      ? 'I\'m here to help 24/7! For immediate assistance, you can:\n\n📞 Call us: 1-332-220-0838\n📧 Email: support@fly2any.com\n\nOr continue chatting with me, and I\'ll do my best to assist you!'
      : language === 'pt'
      ? 'Estou aqui para ajudar 24/7! Para assistência imediata, você pode:\n\n📞 Ligar: 1-332-220-0838\n📧 Email: support@fly2any.com\n\nOu continue conversando comigo, e farei o meu melhor para ajudá-lo!'
      : '¡Estoy aquí para ayudar 24/7! Para asistencia inmediata, puedes:\n\n📞 Llamar: 1-332-220-0838\n📧 Email: support@fly2any.com\n\n¡O continúa chateando conmigo, y haré mi mejor esfuerzo para ayudarte!';
  }

  return language === 'en'
    ? 'I\'d be happy to help! I can assist you with:\n\n✈️ Finding and booking flights\n🏨 Hotel reservations\n🚗 Car rentals\n💳 Payment options\n📞 Customer support\n❓ General questions\n\nWhat would you like to know more about?'
    : language === 'pt'
    ? 'Ficarei feliz em ajudar! Posso ajudá-lo com:\n\n✈️ Encontrar e reservar voos\n🏨 Reservas de hotel\n🚗 Aluguel de carros\n💳 Opções de pagamento\n📞 Suporte ao cliente\n❓ Perguntas gerais\n\nSobre o que você gostaria de saber mais?'
    : '¡Estaré encantado de ayudar! Puedo ayudarte con:\n\n✈️ Encontrar y reservar vuelos\n🏨 Reservas de hotel\n🚗 Alquiler de autos\n💳 Opciones de pago\n📞 Soporte al cliente\n❓ Preguntas generales\n\n¿Sobre qué te gustaría saber más?';
}
