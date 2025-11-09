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
import { HotelResultCard } from './HotelResultCard';
import { ConsultantAvatar, UserAvatar } from './ConsultantAvatar';
import { ConsultantProfileModal } from './ConsultantProfileModal';
import { EnhancedTypingIndicator } from './EnhancedTypingIndicator';
import { useRouter } from 'next/navigation';
import { useAIAnalytics } from '@/lib/hooks/useAIAnalytics';
import { extractDateFromQuery } from '@/lib/utils/date-parsing';
import {
  calculateTypingDelay,
  calculateThinkingDelay,
  calculateMultiMessageDelay,
  detectMessageType,
  getTypingIndicatorText,
  type TypingState
} from '@/lib/utils/typing-simulation';
import {
  getLoadingMessage,
  getTypicalStages,
  estimateProcessingTime,
} from '@/lib/ai/consultant-loading-messages';
// CONVERSATIONAL INTELLIGENCE INTEGRATION
import {
  analyzeConversationIntent,
  getConversationalResponse,
  getContextLoadingMessage,
  ConversationContext,
  type IntentType
} from '@/lib/ai/conversational-intelligence';
import {
  generateHandoffMessage,
  needsHandoff,
  getPreviousConsultantTeam,
  type TeamType as HandoffTeamType
} from '@/lib/ai/consultant-handoff';
import {
  detectLanguageFromMessage,
  detectLanguageSwitchIntent,
  getLanguageSwitchMessage
} from '@/lib/utils/language-detection';
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
// E2E BOOKING FLOW INTEGRATION
import { useBookingFlow } from '@/lib/hooks/useBookingFlow';
import { InlineFareSelector } from '@/components/booking/InlineFareSelector';
import { CompactSeatMap } from '@/components/booking/CompactSeatMap';
import { BaggageUpsellWidget } from '@/components/booking/BaggageUpsellWidget';
import { BookingSummaryCard } from '@/components/booking/BookingSummaryCard';
import { ProgressIndicator } from '@/components/booking/ProgressIndicator';
import { PassengerDetailsWidget, type PassengerInfo } from '@/components/booking/PassengerDetailsWidget';
import { PaymentWidget } from '@/components/booking/PaymentWidget';
import { BookingConfirmationWidget } from '@/components/booking/BookingConfirmationWidget';
import type { FlightOption, FareOption, SeatOption, BaggageOption } from '@/types/booking-flow';

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
  hotelResults?: any[]; // Hotel search results for display
  isSearching?: boolean;
  // NEW: E2E Booking Flow Widgets
  widget?: {
    type: 'fare_selector' | 'seat_map' | 'baggage_selector' | 'booking_summary' | 'progress' | 'passenger_details' | 'payment_form' | 'booking_confirmation';
    data: any;
  };
  bookingRef?: string; // References active booking ID
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
  const [currentTypingConsultant, setCurrentTypingConsultant] = useState<ConsultantProfile | null>(null);
  const [typingStage, setTypingStage] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // AUTO-DETECTED LANGUAGE STATE
  // This overrides the prop language when auto-detected from user messages
  const [detectedLanguage, setDetectedLanguage] = useState<'en' | 'pt' | 'es' | null>(null);

  // Use detected language if available, otherwise use prop language
  const activeLanguage = detectedLanguage || language;

  // Persist detected language to localStorage
  useEffect(() => {
    if (detectedLanguage) {
      localStorage.setItem('fly2any_chat_language', detectedLanguage);
    }
  }, [detectedLanguage]);

  // Load detected language from localStorage on mount
  useEffect(() => {
    const savedChatLanguage = localStorage.getItem('fly2any_chat_language');
    if (savedChatLanguage && ['en', 'pt', 'es'].includes(savedChatLanguage)) {
      setDetectedLanguage(savedChatLanguage as 'en' | 'pt' | 'es');
    }
  }, []);

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

  // E2E BOOKING FLOW: State management and API integration
  const bookingFlow = useBookingFlow();

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
        '✈️ Search flights',
        '🏨 Find hotels',
        '📞 Contact support',
        '💳 Payment options'
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

  const t = translations[activeLanguage];

  // Initialize with welcome message from Lisa (Customer Service)
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const lisaConsultant = getConsultant('customer-service');
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: lisaConsultant.greeting[activeLanguage],
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
  }, [isOpen, messages.length, activeLanguage]);

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
    additionalData?: Partial<Message>,
    intentType?: IntentType | string
  ) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    const messageType = detectMessageType(responseContent);

    // Calculate delays
    const thinkingDelay = calculateThinkingDelay(userMessage, messageType);
    const typingDelay = calculateTypingDelay(responseContent, messageType);
    const totalDelay = thinkingDelay + typingDelay;

    // BEST PRACTICE: Don't show indicator immediately
    // Wait 800ms before showing to avoid flash for quick responses
    const INDICATOR_DELAY = 800;

    // Phase 1: Brief pause (no indicator yet)
    await new Promise(resolve => setTimeout(resolve, Math.min(INDICATOR_DELAY, thinkingDelay)));

    // Only show indicator if response takes longer than the initial delay
    if (totalDelay > INDICATOR_DELAY) {
      // Set current consultant for EnhancedTypingIndicator
      setCurrentTypingConsultant(consultant);
      setTypingStage(0);
      setIsTyping(true);

      // Get stages for this consultant
      const stages = getTypicalStages(consultant.id);
      const remainingDelay = totalDelay - INDICATOR_DELAY;
      const stageDelay = remainingDelay / stages.length;

      // Phase 2: Thinking (if more time needed)
      if (thinkingDelay > INDICATOR_DELAY) {
        setTypingState({
          phase: 'thinking',
          consultantName: consultant.name,
          contextMessage: getContextLoadingMessage(intentType, consultant.name)
        });

        await new Promise(resolve => {
          typingTimeoutRef.current = setTimeout(resolve, thinkingDelay - INDICATOR_DELAY);
        });
      }

      // Phase 3: Typing with stage progression
      setTypingState({
        phase: 'typing',
        consultantName: consultant.name,
        message: responseContent,
        contextMessage: getContextLoadingMessage(intentType, consultant.name)
      });

      // Progress through stages
      const stageProgressInterval = setInterval(() => {
        setTypingStage(prev => {
          if (prev >= stages.length - 1) {
            clearInterval(stageProgressInterval);
            return prev;
          }
          return prev + 1;
        });
      }, stageDelay);

      await new Promise(resolve => {
        typingTimeoutRef.current = setTimeout(resolve, typingDelay);
      });

      clearInterval(stageProgressInterval);
    } else {
      // Quick response - just wait the remaining time without indicator
      await new Promise(resolve => {
        typingTimeoutRef.current = setTimeout(resolve, totalDelay - INDICATOR_DELAY);
      });
    }

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
    setCurrentTypingConsultant(null);
    setTypingStage(0);

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

    // AUTOMATIC LANGUAGE DETECTION
    // Get Lisa consultant for language switch messages
    const lisaConsultant = getConsultant('customer-service');

    // Determine the language to use for THIS message (don't rely on state that hasn't updated yet!)
    let currentLanguage: 'en' | 'pt' | 'es' = detectedLanguage || language;

    // Check if user is explicitly requesting a language switch
    const explicitLanguageSwitch = detectLanguageSwitchIntent(queryText);
    if (explicitLanguageSwitch && explicitLanguageSwitch !== currentLanguage) {
      setDetectedLanguage(explicitLanguageSwitch);
      currentLanguage = explicitLanguageSwitch; // Use the new language immediately!

      // Send confirmation message
      const confirmationMessage: Message = {
        id: `lang_switch_${Date.now()}`,
        role: 'assistant',
        content: getLanguageSwitchMessage(explicitLanguageSwitch),
        timestamp: new Date(),
        consultant: {
          id: lisaConsultant.id,
          name: lisaConsultant.name,
          title: lisaConsultant.title,
          avatar: lisaConsultant.avatar,
          team: lisaConsultant.team
        }
      };

      // Small delay before showing confirmation
      await new Promise(resolve => setTimeout(resolve, 800));
      setMessages(prev => [...prev, confirmationMessage]);
      setIsTyping(false);
      return; // Exit early - language switch confirmation is the only response needed
    }

    // Auto-detect language from message (if not already detected)
    if (!detectedLanguage) {
      const autoDetectedLang = detectLanguageFromMessage(queryText);
      if (autoDetectedLang !== currentLanguage) {
        setDetectedLanguage(autoDetectedLang);
        currentLanguage = autoDetectedLang; // Use the detected language immediately!

        // Only show confirmation if switching from default English
        if (language === 'en' && autoDetectedLang !== 'en') {
          const confirmationMessage: Message = {
            id: `lang_switch_${Date.now()}`,
            role: 'assistant',
            content: getLanguageSwitchMessage(autoDetectedLang),
            timestamp: new Date(),
            consultant: {
              id: lisaConsultant.id,
              name: lisaConsultant.name,
              title: lisaConsultant.title,
              avatar: lisaConsultant.avatar,
              team: lisaConsultant.team
            }
          };

          // Small delay before showing confirmation
          await new Promise(resolve => setTimeout(resolve, 800));
          setMessages(prev => [...prev, confirmationMessage]);

          // Brief pause before continuing with the actual response
          await new Promise(resolve => setTimeout(resolve, 600));
        }
      }
    }

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
      // Extract context from user message for handoff
      const contextParams = extractSearchContext(queryText, consultantTeam);

      const handoff = generateHandoffMessage(
        previousTeam as HandoffTeamType,
        consultantTeam as HandoffTeamType,
        queryText,
        contextParams // Pass extracted context
      );

      // Previous consultant announces transfer
      const previousConsultant = getConsultant(previousTeam as TeamType);
      await sendAIResponseWithTyping(
        handoff.transferAnnouncement,
        previousConsultant,
        queryText,
        undefined,
        'service-request'
      );

      // Small delay between consultants
      await new Promise(resolve => setTimeout(resolve, 1500));

      // New consultant introduces themselves with context
      await sendAIResponseWithTyping(
        handoff.introduction,
        consultant,
        queryText,
        undefined,
        'service-request'
      );

      // If context was understood, display confirmation
      if (handoff.context) {
        await new Promise(resolve => setTimeout(resolve, 800));
        await sendAIResponseWithTyping(
          handoff.context,
          consultant,
          queryText,
          undefined,
          'confirmation'
        );
      }
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
        conversationContext,
        currentLanguage
      );

      // CRITICAL: Pass the actual intent so typing indicator shows appropriate message
      // Example: "Hi" → greeting intent → shows "Typing a response..." not "Searching..."
      await sendAIResponseWithTyping(naturalResponse, consultant, queryText, undefined, analysis.intent);

      // Track conversation context
      conversationContext.addInteraction(analysis.intent, naturalResponse, queryText);

      return; // Exit early for conversational responses
    }

    const isFlightQuery = detectFlightSearchIntent(queryText);

    if (isFlightQuery && consultantTeam === 'flight-operations') {
      const searchInitMessage = currentLanguage === 'en'
        ? "I'll search for flights for you right away..."
        : currentLanguage === 'pt'
        ? "Vou pesquisar voos para você agora mesmo..."
        : "Buscaré vuelos para ti de inmediato...";

      await sendAIResponseWithTyping(searchInitMessage, consultant, queryText, {
        isSearching: true
      }, 'flight-search');

      setIsSearchingFlights(true);

      const searchStartTime = Date.now();
      try {
        const response = await fetch('/api/ai/search-flights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: queryText, currentLanguage })
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

          const resultsContent = currentLanguage === 'en'
            ? `Oh wonderful, sweetie! ✈️ I found ${data.flights.length} fantastic ${isBusinessClass ? cabinClass.charAt(0).toUpperCase() + cabinClass.slice(1) + ' Class' : ''} options for your ${tripType} journey! Let me show you the best ones:`
            : currentLanguage === 'pt'
            ? `Que maravilha, querido! ✈️ Encontrei ${data.flights.length} opções fantásticas ${isBusinessClass ? 'em ' + cabinClass : ''} para sua viagem ${tripType === 'round-trip' ? 'ida e volta' : 'só ida'}! Deixe-me mostrar as melhores:`
            : `¡Qué maravilloso, cariño! ✈️ Encontré ${data.flights.length} opciones fantásticas ${isBusinessClass ? 'en ' + cabinClass : ''} para tu viaje de ${tripType === 'round-trip' ? 'ida y vuelta' : 'solo ida'}! Déjame mostrarte las mejores:`;

          const followUpContent = currentLanguage === 'en'
            ? "Which of these catches your eye, hon? I'm here to help you with the booking or we can adjust the search if you'd like! 💕"
            : currentLanguage === 'pt'
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

          const errorContent = currentLanguage === 'en'
            ? "I couldn't find flights matching your criteria. Could you provide more details like the origin city, destination, and travel dates?"
            : currentLanguage === 'pt'
            ? "Não consegui encontrar voos correspondentes aos seus critérios. Você poderia fornecer mais detalhes como cidade de origem, destino e datas de viagem?"
            : "No pude encontrar vuelos que coincidan con tus criterios. ¿Podrías proporcionar más detalles como la ciudad de origen, el destino y las fechas de viaje?";

          await sendAIResponseWithTyping(errorContent, consultant, queryText, undefined, 'question');
        }
      } catch (error) {
        console.error('Flight search error:', error);
        setIsSearchingFlights(false);
        setMessages(prev => prev.filter(m => !m.isSearching));

        const errorContent = currentLanguage === 'en'
          ? "I encountered an error searching for flights. Please try again or contact support if the issue persists."
          : currentLanguage === 'pt'
          ? "Encontrei um erro ao pesquisar voos. Tente novamente ou entre em contato com o suporte se o problema persistir."
          : "Encontré un error al buscar vuelos. Por favor, inténtalo de nuevo o contacta con soporte si el problema persiste.";

        await sendAIResponseWithTyping(errorContent, consultant, queryText, undefined, 'service-request');
      }
    }

    // HANDLE HOTEL SEARCH
    const isHotelQuery = detectHotelSearchIntent(queryText);

    if (isHotelQuery && consultantTeam === 'hotel-accommodations') {
      const searchInitMessage = currentLanguage === 'en'
        ? "Let me search for the perfect accommodations for you..."
        : currentLanguage === 'pt'
        ? "Deixe-me procurar as acomodações perfeitas para você..."
        : "Déjame buscar el alojamiento perfecto para ti...";

      await sendAIResponseWithTyping(searchInitMessage, consultant, queryText, {
        isSearching: true
      }, 'hotel-search');

      try {
        const response = await fetch('/api/ai/search-hotels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: queryText, currentLanguage })
        });

        const data = await response.json();

        if (data.success && data.hotels && data.hotels.length > 0) {
          setMessages(prev => prev.filter(m => !m.isSearching));

          // Marcus's warm, hospitable response
          const hotelCount = data.hotels.length;
          const nights = data.searchParams.checkOut && data.searchParams.checkIn
            ? Math.ceil((new Date(data.searchParams.checkOut).getTime() - new Date(data.searchParams.checkIn).getTime()) / (1000 * 60 * 60 * 24))
            : 0;

          const warmResponse = currentLanguage === 'en'
            ? `¡Perfecto! I found ${hotelCount} wonderful options in ${data.searchParams.city} for you! 🏨\n\n` +
              `You'll be staying for ${nights} night${nights > 1 ? 's' : ''} (${data.searchParams.checkIn} to ${data.searchParams.checkOut}) ` +
              `with ${data.searchParams.guests} guest${data.searchParams.guests > 1 ? 's' : ''}. Let me show you the best choices:`
            : currentLanguage === 'pt'
            ? `¡Perfeito! Encontrei ${hotelCount} opções maravilhosas em ${data.searchParams.city} para você! 🏨\n\n` +
              `Você ficará por ${nights} noite${nights > 1 ? 's' : ''} (${data.searchParams.checkIn} até ${data.searchParams.checkOut}) ` +
              `com ${data.searchParams.guests} hóspede${data.searchParams.guests > 1 ? 's' : ''}. Deixe-me mostrar as melhores opções:`
            : `¡Perfecto! Encontré ${hotelCount} opciones maravillosas en ${data.searchParams.city} para ti! 🏨\n\n` +
              `Estarás alojado por ${nights} noche${nights > 1 ? 's' : ''} (${data.searchParams.checkIn} hasta ${data.searchParams.checkOut}) ` +
              `con ${data.searchParams.guests} huésped${data.searchParams.guests > 1 ? 'es' : ''}. Déjame mostrarte las mejores opciones:`;

          const followUpContent = currentLanguage === 'en'
            ? "Which one catches your eye? I can help you book any of these or search for different options if you'd like! 🏨"
            : currentLanguage === 'pt'
            ? "Qual desses te agrada? Posso ajudá-lo a reservar qualquer um deles ou procurar opções diferentes se desejar! 🏨"
            : "¿Cuál te gusta más? ¡Puedo ayudarte a reservar cualquiera de estos o buscar diferentes opciones si lo deseas! 🏨";

          await sendMultipleAIResponses([
            {
              content: warmResponse,
              additionalData: {
                hotelResults: data.hotels.slice(0, 3)
              }
            },
            {
              content: followUpContent
            }
          ], consultant, queryText);
        } else {
          setMessages(prev => prev.filter(m => !m.isSearching));

          const errorContent = currentLanguage === 'en'
            ? "I couldn't find hotels matching your request. Could you provide the city, check-in date, check-out date, and number of guests?"
            : currentLanguage === 'pt'
            ? "Não consegui encontrar hotéis correspondentes à sua solicitação. Você poderia fornecer a cidade, data de check-in, data de check-out e número de hóspedes?"
            : "No pude encontrar hoteles que coincidan con tu solicitud. ¿Podrías proporcionar la ciudad, fecha de entrada, fecha de salida y número de huéspedes?";

          await sendAIResponseWithTyping(errorContent, consultant, queryText, undefined, 'question');
        }
      } catch (error) {
        console.error('Hotel search error:', error);
        setMessages(prev => prev.filter(m => !m.isSearching));

        const errorContent = currentLanguage === 'en'
          ? "I encountered an error searching for hotels. Please try again or contact support if the issue persists."
          : currentLanguage === 'pt'
          ? "Encontrei um erro ao pesquisar hotéis. Tente novamente ou entre em contato com o suporte se o problema persistir."
          : "Encontré un error al buscar hoteles. Por favor, inténtalo de nuevo o contacta con soporte si el problema persiste.";

        await sendAIResponseWithTyping(errorContent, consultant, queryText, undefined, 'service-request');
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
          conversationContext,
          language
        );
      } else {
        // Use legacy response for complex queries
        responseContent = generateAIResponse(queryText, currentLanguage, consultant);
      }

      await sendAIResponseWithTyping(responseContent, consultant, queryText, undefined, analysis.intent);

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

  // ============================================================================
  // E2E BOOKING FLOW HANDLERS
  // ============================================================================

  /**
   * HANDLE BOOKING FLIGHT SELECT
   * User clicks a flight → Load fares → Show fare selector widget
   *
   * REPLACES the old handleFlightSelect that redirected to /flights/results
   */
  const handleFlightSelect = async (flightId: string) => {
    try {
      // Find the selected flight from messages
      let selectedFlight: FlightOption | null = null;

      for (const message of messages) {
        if (message.flightResults) {
          const flight = message.flightResults.find((f: any) => f.id === flightId);
          if (flight) {
            // Transform FlightSearchResult to FlightOption
            selectedFlight = {
              id: flight.id,
              offerId: flight.id, // Use ID as offerId for now
              airline: flight.airline,
              airlineLogo: '',
              flightNumber: flight.flightNumber,
              departure: {
                airport: flight.departure.airport,
                airportCode: flight.departure.airport.split(' ')[0] || 'JFK',
                time: flight.departure.time,
                terminal: flight.departure.terminal,
              },
              arrival: {
                airport: flight.arrival.airport,
                airportCode: flight.arrival.airport.split(' ')[0] || 'DXB',
                time: flight.arrival.time,
                terminal: flight.arrival.terminal,
              },
              duration: flight.duration,
              stops: flight.stops,
              stopDetails: flight.stopover || (flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop(s)`),
              price: parseFloat(flight.price.amount),
              currency: flight.price.currency,
              cabinClass: flight.cabinClass,
              availableSeats: flight.seatsAvailable,
            };
            break;
          }
        }
      }

      if (!selectedFlight) {
        console.error('Flight not found:', flightId);
        return;
      }

      console.log('✈️  User selected flight:', selectedFlight.airline, selectedFlight.flightNumber);

      // Create booking in state
      const bookingId = bookingFlow.createBooking(selectedFlight, {
        origin: selectedFlight.departure.airportCode,
        destination: selectedFlight.arrival.airportCode,
        departureDate: new Date().toISOString().split('T')[0],
        passengers: 1,
        class: 'economy',
      });

      // Show thinking/typing indicator
      const consultant = currentTypingConsultant || getConsultant('customer-service');
      setCurrentTypingConsultant(consultant);
      setIsTyping(true);
      setTypingState({
        phase: 'thinking',
        consultantName: consultant.name,
        contextMessage: 'Let me get you the best fare options...',
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Load fare options from API
      const fares = await bookingFlow.loadFareOptions(selectedFlight.offerId);

      if (fares.length === 0) {
        // Fallback: show error message
        const errorMsg: Message = {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: "I apologize, but I couldn't load the fare options. Please try selecting another flight.",
          consultant,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMsg]);
        setIsTyping(false);
        return;
      }

      // Send message with fare selector widget
      const fareMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: `Perfect choice! The **${selectedFlight.airline} ${selectedFlight.flightNumber}** from ${selectedFlight.departure.airportCode} to ${selectedFlight.arrival.airportCode} is available. Now, let's choose your fare class:`,
        consultant,
        timestamp: new Date(),
        widget: {
          type: 'fare_selector',
          data: { fares },
        },
        bookingRef: bookingId,
      };

      setMessages(prev => [...prev, fareMessage]);
      setIsTyping(false);
      bookingFlow.advanceStage('fare_selection');

      console.log('✅ Fare selector widget shown');
    } catch (error) {
      console.error('❌ Error in handleFlightSelect:', error);
      setIsTyping(false);
    }
  };

  /**
   * HANDLE FARE SELECT
   * User selects fare class → Load seat map → Show seat selection widget
   */
  const handleFareSelect = async (fareId: string) => {
    try {
      // Find fare from message widget data
      let selectedFare: FareOption | null = null;
      for (const message of messages) {
        if (message.widget?.type === 'fare_selector' && message.widget.data?.fares) {
          selectedFare = message.widget.data.fares.find((f: FareOption) => f.id === fareId);
          if (selectedFare) break;
        }
      }

      if (!selectedFare || !bookingFlow.activeBooking) {
        console.error('Fare not found or no active booking');
        return;
      }

      console.log('💺 User selected fare:', selectedFare.name, '$' + selectedFare.price);

      // Update booking state
      bookingFlow.updateFare(bookingFlow.activeBooking.id, selectedFare);

      // Show typing indicator
      const consultant = currentTypingConsultant || getConsultant('customer-service');
      setIsTyping(true);
      setTypingState({
        phase: 'thinking',
        consultantName: consultant.name,
        contextMessage: 'Loading seat map...',
      });

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Load seat map from API
      const seats = await bookingFlow.loadSeatMap(bookingFlow.activeBooking.selectedFlight!.offerId);

      // Send message with seat map widget
      const seatMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: `Great choice! You've selected the **${selectedFare.name}** fare. Would you like to choose your seat now, or skip this step?`,
        consultant,
        timestamp: new Date(),
        widget: {
          type: 'seat_map',
          data: { seats },
        },
        bookingRef: bookingFlow.activeBooking.id,
      };

      setMessages(prev => [...prev, seatMessage]);
      setIsTyping(false);
      bookingFlow.advanceStage('seat_selection');

      console.log('✅ Seat map widget shown');
    } catch (error) {
      console.error('❌ Error in handleFareSelect:', error);
      setIsTyping(false);
    }
  };

  /**
   * HANDLE SEAT SELECT
   * User selects seat → Load baggage options → Show baggage widget
   */
  const handleSeatSelect = async (seatNumber: string) => {
    try {
      // Find seat from message widget data
      let selectedSeat: SeatOption | null = null;
      for (const message of messages) {
        if (message.widget?.type === 'seat_map' && message.widget.data?.seats) {
          selectedSeat = message.widget.data.seats.find((s: SeatOption) => s.number === seatNumber);
          if (selectedSeat) break;
        }
      }

      if (!selectedSeat || !bookingFlow.activeBooking) {
        console.error('Seat not found or no active booking');
        return;
      }

      console.log('🪑 User selected seat:', seatNumber, '$' + selectedSeat.price);

      // Update booking state
      bookingFlow.updateSeat(bookingFlow.activeBooking.id, seatNumber, selectedSeat.price);

      // Load baggage options
      const baggage = await bookingFlow.loadBaggageOptions(bookingFlow.activeBooking.selectedFlight!.offerId);

      // Send message with baggage widget
      const consultant = currentTypingConsultant || getConsultant('customer-service');
      const baggageMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: `Perfect! Seat **${seatNumber}** is now reserved for you. Would you like to add checked baggage?`,
        consultant,
        timestamp: new Date(),
        widget: {
          type: 'baggage_selector',
          data: { baggage },
        },
        bookingRef: bookingFlow.activeBooking.id,
      };

      setMessages(prev => [...prev, baggageMessage]);
      bookingFlow.advanceStage('baggage_selection');

      console.log('✅ Baggage widget shown');
    } catch (error) {
      console.error('❌ Error in handleSeatSelect:', error);
    }
  };

  /**
   * HANDLE SKIP SEATS
   * User skips seat selection → Go to baggage
   */
  const handleSkipSeats = async () => {
    try {
      if (!bookingFlow.activeBooking) {
        console.error('No active booking');
        return;
      }

      console.log('➡️  User skipped seat selection');

      // Load baggage options
      const baggage = await bookingFlow.loadBaggageOptions(bookingFlow.activeBooking.selectedFlight!.offerId);

      // Send message with baggage widget
      const consultant = currentTypingConsultant || getConsultant('customer-service');
      const baggageMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: "No problem! Seats will be assigned at check-in. Would you like to add checked baggage?",
        consultant,
        timestamp: new Date(),
        widget: {
          type: 'baggage_selector',
          data: { baggage },
        },
        bookingRef: bookingFlow.activeBooking.id,
      };

      setMessages(prev => [...prev, baggageMessage]);
      bookingFlow.advanceStage('baggage_selection');

      console.log('✅ Baggage widget shown (seats skipped)');
    } catch (error) {
      console.error('❌ Error in handleSkipSeats:', error);
    }
  };

  /**
   * HANDLE BAGGAGE SELECT
   * User selects baggage → Show booking summary
   */
  const handleBaggageSelect = async (quantity: number, price: number) => {
    try {
      if (!bookingFlow.activeBooking) {
        console.error('No active booking');
        return;
      }

      console.log('🧳 User selected baggage:', quantity, 'bags, $' + price);

      // Update booking state
      bookingFlow.updateBaggage(bookingFlow.activeBooking.id, quantity, price);

      // Show booking summary
      const consultant = currentTypingConsultant || getConsultant('customer-service');
      const summaryMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: `Excellent! Here's your booking summary. Please review the details and total price:`,
        consultant,
        timestamp: new Date(),
        widget: {
          type: 'booking_summary',
          data: { booking: bookingFlow.activeBooking },
        },
        bookingRef: bookingFlow.activeBooking.id,
      };

      setMessages(prev => [...prev, summaryMessage]);
      bookingFlow.advanceStage('review');

      console.log('✅ Booking summary shown');
    } catch (error) {
      console.error('❌ Error in handleBaggageSelect:', error);
    }
  };

  /**
   * HANDLE CONFIRM BOOKING
   * User confirms booking summary → Show passenger details form
   */
  const handleConfirmBooking = async () => {
    try {
      if (!bookingFlow.activeBooking) {
        console.error('No active booking');
        return;
      }

      console.log('✅ User confirmed booking summary');

      // Show consultant typing indicator
      const consultant = currentTypingConsultant || getConsultant('customer-service');
      setCurrentTypingConsultant(consultant);
      setIsTyping(true);
      setTypingState({
        phase: 'thinking',
        consultantName: consultant.name,
        contextMessage: 'Preparing passenger details form...',
      });

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Determine if flight is international (requires passport info)
      const flightType: 'domestic' | 'international' = 'international'; // TODO: Detect from flight details

      // Show passenger details widget
      const passengerMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: `Perfect! Now I need some passenger details to complete your booking. Please fill in the information below:`,
        consultant,
        timestamp: new Date(),
        widget: {
          type: 'passenger_details',
          data: {
            passengerCount: bookingFlow.activeBooking.searchParams?.passengers || 1,
            flightType,
          },
        },
        bookingRef: bookingFlow.activeBooking.id,
      };

      setMessages(prev => [...prev, passengerMessage]);
      setIsTyping(false);
      setTypingState(null);
      bookingFlow.advanceStage('payment');

      console.log('✅ Passenger details widget shown');
    } catch (error) {
      console.error('❌ Error in handleConfirmBooking:', error);
      setIsTyping(false);
      setTypingState(null);
    }
  };

  /**
   * HANDLE PASSENGER SUBMIT
   * User submits passenger details → Create payment intent → Show payment form
   */
  const handlePassengerSubmit = async (passengers: PassengerInfo[]) => {
    try {
      if (!bookingFlow.activeBooking) {
        console.error('No active booking');
        return;
      }

      console.log('👥 User submitted passenger details:', passengers.length, 'passengers');

      // Show consultant typing indicator
      const consultant = currentTypingConsultant || getConsultant('customer-service');
      setCurrentTypingConsultant(consultant);
      setIsTyping(true);
      setTypingState({
        phase: 'thinking',
        consultantName: consultant.name,
        contextMessage: 'Setting up secure payment...',
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Call API to create payment intent
      const response = await fetch('/api/booking-flow/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingState: bookingFlow.activeBooking,
          passengers,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const paymentData = await response.json();

      // Show payment widget
      const paymentMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: `Excellent! Your details are saved. Now let's complete the payment securely:`,
        consultant,
        timestamp: new Date(),
        widget: {
          type: 'payment_form',
          data: {
            amount: bookingFlow.activeBooking.pricing.total,
            currency: bookingFlow.activeBooking.pricing.currency || 'USD',
            bookingReference: paymentData.bookingReference || bookingFlow.activeBooking.id,
            clientSecret: paymentData.paymentIntent.clientSecret,
            passengers,
            flight: {
              airline: bookingFlow.activeBooking.selectedFlight?.airline,
              flightNumber: bookingFlow.activeBooking.selectedFlight?.flightNumber,
              origin: bookingFlow.activeBooking.searchParams?.origin,
              destination: bookingFlow.activeBooking.searchParams?.destination,
            },
          },
        },
        bookingRef: bookingFlow.activeBooking.id,
      };

      setMessages(prev => [...prev, paymentMessage]);
      setIsTyping(false);
      setTypingState(null);
      bookingFlow.advanceStage('payment');

      console.log('✅ Payment widget shown');
    } catch (error) {
      console.error('❌ Error in handlePassengerSubmit:', error);
      setIsTyping(false);
      setTypingState(null);

      // Show error message
      const consultant = currentTypingConsultant || getConsultant('customer-service');
      const errorMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but there was an error setting up the payment. Please try again or contact support.',
        consultant,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  /**
   * HANDLE PAYMENT SUCCESS
   * Payment completed successfully → Show confirmation
   */
  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      if (!bookingFlow.activeBooking) {
        console.error('No active booking');
        return;
      }

      console.log('💳 Payment successful:', paymentIntentId);

      // Show consultant typing indicator
      const consultant = currentTypingConsultant || getConsultant('customer-service');
      setCurrentTypingConsultant(consultant);
      setIsTyping(true);
      setTypingState({
        phase: 'thinking',
        consultantName: consultant.name,
        contextMessage: 'Confirming your booking...',
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Call API to confirm booking
      const response = await fetch('/api/booking-flow/confirm-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: bookingFlow.activeBooking.id,
          paymentIntentId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to confirm booking');
      }

      const confirmationData = await response.json();

      // Get passenger info from previous message
      let passengers: PassengerInfo[] = [];
      for (const message of messages) {
        if (message.widget?.type === 'payment_form' && message.widget.data?.passengers) {
          passengers = message.widget.data.passengers;
          break;
        }
      }

      // Show confirmation widget
      const confirmationMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: `🎉 Congratulations! Your booking is confirmed. Here are your travel details:`,
        consultant,
        timestamp: new Date(),
        widget: {
          type: 'booking_confirmation',
          data: {
            bookingReference: confirmationData.booking?.bookingReference || bookingFlow.activeBooking.id,
            pnr: confirmationData.booking?.pnr || '',
            flight: {
              airline: bookingFlow.activeBooking.selectedFlight?.airline || '',
              flightNumber: bookingFlow.activeBooking.selectedFlight?.flightNumber || '',
              origin: bookingFlow.activeBooking.searchParams?.origin || '',
              destination: bookingFlow.activeBooking.searchParams?.destination || '',
              departureDate: bookingFlow.activeBooking.searchParams?.departureDate || '',
              departureTime: '', // Time info not stored in BookingState.selectedFlight
              arrivalTime: '', // Time info not stored in BookingState.selectedFlight
            },
            passengers,
            totalPaid: bookingFlow.activeBooking.pricing.total,
            currency: bookingFlow.activeBooking.pricing.currency || 'USD',
            confirmationEmail: passengers[0]?.email || '',
          },
        },
        bookingRef: bookingFlow.activeBooking.id,
      };

      setMessages(prev => [...prev, confirmationMessage]);
      setIsTyping(false);
      setTypingState(null);
      bookingFlow.advanceStage('confirmation');

      console.log('✅ Booking confirmation shown');
    } catch (error) {
      console.error('❌ Error in handlePaymentSuccess:', error);
      setIsTyping(false);
      setTypingState(null);

      // Show error message
      const consultant = currentTypingConsultant || getConsultant('customer-service');
      const errorMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: 'There was an error confirming your booking, but your payment was successful. Please contact support with your payment ID for assistance.',
        consultant,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  /**
   * HANDLE EDIT BOOKING
   * User wants to edit → Go back to previous step
   */
  const handleEditBooking = (editType: 'flight' | 'fare' | 'seat' | 'baggage') => {
    console.log('✏️  User wants to edit:', editType);
    // TODO: Implement edit flow - reload relevant widget
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

  // ============================================================================
  // WIDGET RENDERING
  // ============================================================================

  /**
   * Render booking flow widgets
   */
  const renderWidget = (message: Message) => {
    if (!message.widget) return null;

    const { type, data } = message.widget;

    switch (type) {
      case 'fare_selector':
        return (
          <InlineFareSelector
            fares={data.fares || []}
            onSelect={handleFareSelect}
          />
        );

      case 'seat_map':
        return (
          <CompactSeatMap
            seats={data.seats || []}
            onSelect={handleSeatSelect}
            onSkip={handleSkipSeats}
          />
        );

      case 'baggage_selector':
        return (
          <BaggageUpsellWidget
            options={data.baggage || []}
            onSelect={(quantity) => {
              const selectedBaggage = (data.baggage || []).find((b: BaggageOption) => b.quantity === quantity);
              const price = selectedBaggage?.price || 0;
              handleBaggageSelect(quantity, price);
            }}
          />
        );

      case 'booking_summary':
        return (
          <BookingSummaryCard
            booking={data.booking}
            onConfirm={handleConfirmBooking}
            onEdit={(section: 'flight' | 'fare' | 'baggage' | 'seats') => {
              handleEditBooking(section === 'seats' ? 'seat' : section);
            }}
          />
        );

      case 'progress':
        return (
          <ProgressIndicator progress={data.progress} />
        );

      case 'passenger_details':
        return (
          <PassengerDetailsWidget
            passengerCount={data.passengerCount || 1}
            flightType={data.flightType || 'international'}
            onSubmit={handlePassengerSubmit}
            isProcessing={false}
          />
        );

      case 'payment_form':
        return (
          <PaymentWidget
            amount={data.amount}
            currency={data.currency}
            bookingReference={data.bookingReference}
            clientSecret={data.clientSecret}
            passengers={data.passengers}
            flight={data.flight}
            onSuccess={handlePaymentSuccess}
            onError={(error) => {
              console.error('💳 Payment error:', error);
              const consultant = currentTypingConsultant || getConsultant('customer-service');
              const errorMessage: Message = {
                id: `msg_${Date.now()}`,
                role: 'assistant',
                content: `I'm sorry, there was an error processing your payment: ${error}. Please try again or contact support.`,
                consultant,
                timestamp: new Date(),
              };
              setMessages(prev => [...prev, errorMessage]);
            }}
          />
        );

      case 'booking_confirmation':
        return (
          <BookingConfirmationWidget
            bookingReference={data.bookingReference}
            pnr={data.pnr}
            flight={data.flight}
            passengers={data.passengers}
            totalPaid={data.totalPaid}
            currency={data.currency}
            confirmationEmail={data.confirmationEmail}
            onDownloadTicket={() => {
              console.log('📄 Download ticket requested');
              // TODO: Implement ticket download
            }}
            onViewBooking={() => {
              console.log('👁️  View booking requested');
              router.push('/account/bookings');
            }}
          />
        );

      default:
        return null;
    }
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

                {/* Hotel Results */}
                {messages.map((message) => {
                  if (message.hotelResults && message.hotelResults.length > 0) {
                    return (
                      <div key={`hotels-${message.id}`} className="space-y-2 mt-2">
                        {message.hotelResults.map((hotel) => (
                          <HotelResultCard
                            key={hotel.id}
                            hotel={hotel}
                            onSelect={(hotelId) => {
                              console.log('Hotel selected:', hotelId);
                              // TODO: Implement hotel booking flow
                            }}
                            compact={true}
                            onHotelSelected={(hotelId, totalPrice) => {
                              analytics.trackHotelSelected(hotelId, totalPrice);
                            }}
                          />
                        ))}
                      </div>
                    );
                  }
                  return null;
                })}

                {/* E2E Booking Flow Widgets */}
                {messages.map((message) => {
                  if (message.widget) {
                    return (
                      <div key={`widget-${message.id}`} className="mt-3">
                        {renderWidget(message)}
                      </div>
                    );
                  }
                  return null;
                })}

                {/* Enhanced Typing Indicator - Context-Aware */}
                {isTyping && currentTypingConsultant && typingState && (
                  <div className="flex gap-3 animate-fade-in">
                    <ConsultantAvatar
                      consultantId={currentTypingConsultant.id}
                      name={currentTypingConsultant.name}
                      size="sm"
                      showStatus={true}
                    />
                    <div className="flex flex-col gap-1 flex-1">
                      <p className="text-[10px] text-gray-500 px-1 font-medium">
                        {currentTypingConsultant.name}
                      </p>
                      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 max-w-[280px]">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" />
                            <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                            <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                          </div>
                          <span className="text-xs text-gray-600">
                            {typingState.contextMessage || 'Typing...'}
                          </span>
                        </div>
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

              {/* Ultra-Compact Auth Prompt - Redesigned for better UX */}
              {showAuthPrompt && !userSession.isAuthenticated && (
                <div className="mx-3 my-2 px-3 py-2 bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-300 rounded-lg animate-fadeIn">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <Sparkles className="w-4 h-4 text-primary-600 flex-shrink-0" />
                      <p className="text-[10px] text-gray-700 font-medium line-clamp-1">
                        {authPromptMessage}
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => {
                          analytics.trackAuthPromptClicked('signup');
                          router.push('/auth/signup');
                          setShowAuthPrompt(false);
                        }}
                        className="flex items-center gap-1 px-2 py-1 bg-primary-600 hover:bg-primary-700 text-white text-[10px] font-semibold rounded transition-colors"
                      >
                        <UserPlus className="w-2.5 h-2.5" />
                        <span className="hidden sm:inline">Sign Up</span>
                      </button>
                      <button
                        onClick={() => {
                          analytics.trackAuthPromptClicked('login');
                          router.push('/auth/signin');
                          setShowAuthPrompt(false);
                        }}
                        className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-gray-50 border border-primary-600 text-primary-600 text-[10px] font-semibold rounded transition-colors"
                      >
                        <LogIn className="w-2.5 h-2.5" />
                        <span className="hidden sm:inline">Sign In</span>
                      </button>
                      <button
                        onClick={() => {
                          analytics.trackAuthPromptClicked('dismiss');
                          setShowAuthPrompt(false);
                        }}
                        className="text-gray-400 hover:text-gray-600 transition-colors ml-1"
                        title="Dismiss"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions - Compact Horizontal Pills */}
              {messages.length === 1 && (
                <div className="px-3 py-2 bg-white border-t border-gray-100">
                  <p className="text-[10px] font-semibold text-gray-500 mb-1.5">
                    {t.quickActions}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {t.quickQuestions.map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickQuestion(question)}
                        className="text-[11px] px-2.5 py-1 bg-gray-50 hover:bg-primary-50 border border-gray-200 hover:border-primary-300 text-gray-700 hover:text-primary-700 rounded-full transition-colors"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Ultra-Compact Contact Support - Only show after 3+ messages */}
              {messages.length >= 3 && (
              <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between animate-fadeIn">
                <p className="text-[9px] text-gray-500 font-medium">
                  {t.contactSupport}
                </p>
                <div className="flex gap-1.5">
                  <a
                    href="tel:+13322200838"
                    title="Call Us"
                    className="flex items-center gap-1 px-2 py-1 bg-primary-600 hover:bg-primary-700 text-white text-[10px] font-semibold rounded transition-colors"
                  >
                    <Phone className="w-2.5 h-2.5" />
                    <span className="hidden sm:inline">{t.callUs}</span>
                  </a>
                  <a
                    href="mailto:support@fly2any.com"
                    title="Email Us"
                    className="flex items-center gap-1 px-2 py-1 bg-secondary-600 hover:bg-secondary-700 text-white text-[10px] font-semibold rounded transition-colors"
                  >
                    <Mail className="w-2.5 h-2.5" />
                    <span className="hidden sm:inline">{t.emailUs}</span>
                  </a>
                </div>
              </div>
              )}

              {/* Input Area - Enhanced Visual Prominence */}
              <div className="p-4 bg-white border-t-2 border-primary-100">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={t.placeholder}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all text-sm placeholder:text-gray-400 hover:border-gray-400"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    className="px-5 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-xl transition-all duration-200 flex items-center gap-2 font-semibold text-sm disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                  >
                    {isTyping ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-2.5 text-center flex items-center justify-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
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
 * Extract search context from user message for handoff
 * Parses key information (locations, dates, guests) to pass to new agent
 */
function extractSearchContext(userMessage: string, team: string): any {
  const msg = userMessage.toLowerCase();

  // Flight context extraction
  if (team === 'flight-operations') {
    // Try to extract origin and destination
    const fromMatch = msg.match(/from\s+([a-z\s]+?)(?:\s+to|\s+on|\s+in|\s*$)/i);
    const toMatch = msg.match(/to\s+([a-z\s]+?)(?:\s+on|\s+in|\s+from|\s*$)/i);

    // Try to extract dates using the robust date parser
    const departureDate = extractDateFromQuery(userMessage, 'departure');
    const returnDate = extractDateFromQuery(userMessage, 'return');

    // Try to extract passengers
    const passengersMatch = msg.match(/(\d+)\s+(?:passenger|person|people|traveler)/i);

    // Try to extract cabin class
    const hasBusinessClass = msg.includes('business') || msg.includes('first class');
    const hasEconomyClass = msg.includes('economy') || msg.includes('coach');

    const context: any = {};
    if (fromMatch) context.origin = fromMatch[1].trim();
    if (toMatch) context.destination = toMatch[1].trim();
    if (departureDate) context.departureDate = departureDate.isoDate; // Use ISO format
    if (returnDate) context.returnDate = returnDate.isoDate; // Use ISO format
    if (passengersMatch) context.passengers = parseInt(passengersMatch[1]);
    if (hasBusinessClass) context.cabinClass = 'business';
    else if (hasEconomyClass) context.cabinClass = 'economy';

    return Object.keys(context).length > 0 ? context : null;
  }

  // Hotel context extraction
  if (team === 'hotel-accommodations') {
    // Try to extract city
    const inMatch = msg.match(/(?:in|at|near)\s+([a-z\s]+?)(?:\s+from|\s+for|\s+on|\s*$)/i);

    // Try to extract dates using the robust date parser
    const checkIn = extractDateFromQuery(userMessage, 'checkin');
    const checkOut = extractDateFromQuery(userMessage, 'checkout');

    // Try to extract guests
    const guestsMatch = msg.match(/(\d+)\s+(?:guest|person|people)/i);
    const roomsMatch = msg.match(/(\d+)\s+room/i);

    const context: any = {};
    if (inMatch) context.city = inMatch[1].trim();
    if (checkIn) context.checkIn = checkIn.isoDate; // Use ISO format
    if (checkOut) context.checkOut = checkOut.isoDate; // Use ISO format
    if (guestsMatch) context.guests = parseInt(guestsMatch[1]);
    if (roomsMatch) context.rooms = parseInt(roomsMatch[1]);

    return Object.keys(context).length > 0 ? context : null;
  }

  return null;
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
