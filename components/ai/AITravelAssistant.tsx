'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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
  Plane,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useVoiceOutput } from '@/hooks/useVoiceOutput';
import { useAIStream, type StreamMessage } from '@/lib/hooks/useAIStream';
import { VoiceMicButton, VoiceStatusIndicator } from './VoiceMicButton';
import { cn } from '@/lib/utils';
import { getConsultant, type TeamType, type ConsultantProfile } from '@/lib/ai/consultant-profiles';
import { getEngagementStage, buildAuthPrompt, type UserSession } from '@/lib/ai/auth-strategy';
import { FlightResultCard } from './FlightResultCard';
import { HotelResultCard } from './HotelResultCard';
import { ConsultantAvatar, UserAvatar } from './ConsultantAvatar';
import { ConsultantProfileModal } from './ConsultantProfileModal';
import { EnhancedTypingIndicator } from './EnhancedTypingIndicator';
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
// SALES CONVERSION ENGINE - State of the Art
import {
  analyzeCustomerBehavior,
  determineConversionStage,
  generateConversionResponse,
  identifyUpsellOpportunities,
  getHumanFiller,
  generateUrgencyMessage,
  generateCTA,
  getAdaptedTone,
  type CustomerBehaviorProfile,
  type ConversionStage,
  type UpsellOpportunity
} from '@/lib/ai/sales-conversion-engine';
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
import { ErrorBoundary } from '@/components/ErrorBoundary';
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

interface HotelSearchResult {
  id: string;
  name: string;
  rating: number;
  address: string;
  pricePerNight: number;
  totalPrice: number;
  currency: string;
  amenities: string[];
  distance: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  availability: string;
  image?: string;
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
  hotelResults?: HotelSearchResult[];
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
  const [isMobile, setIsMobile] = useState(false);
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

  // SALES CONVERSION: Customer behavior tracking
  const [customerBehavior, setCustomerBehavior] = useState<CustomerBehaviorProfile | null>(null);
  const [conversionStage, setConversionStage] = useState<ConversionStage>('awareness');
  const [upsellOpportunities, setUpsellOpportunities] = useState<UpsellOpportunity[]>([]);

  // CONVERSATION PERSISTENCE
  const [conversation, setConversation] = useState<ConversationState | null>(null);
  const [recoverableConversation, setRecoverableConversation] = useState<ConversationState | null>(null);
  const [showRecoveryBanner, setShowRecoveryBanner] = useState(false);

  // VOICE INPUT/OUTPUT INTEGRATION
  // Voice OFF by default - user must click speaker icon to enable
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceAutoSending, setVoiceAutoSending] = useState(false);
  const sendMessageRef = useRef<() => void>(() => {});

  const voiceInput = useVoiceInput({
    language: language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : 'en-US',
    onTranscript: (text) => {
      // Set transcript and auto-send after 800ms visual feedback
      setInputMessage(text);
      setVoiceAutoSending(true);
      setTimeout(() => {
        setVoiceAutoSending(false);
        sendMessageRef.current();
      }, 800);
    },
  });

  const voiceOutput = useVoiceOutput({
    language: language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : 'en-US',
    rate: 0.95,   // Slightly slower for natural sound
    pitch: 1.05,  // Slightly higher for friendlier tone
  });

  // AI STREAMING: Real-time token-by-token responses from Groq/OpenAI
  const aiStream = useAIStream();
  const [sessionToken, setSessionToken] = useState<string | null>(null);

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

  // Mobile detection for bottom positioning
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Listen for mobile bottom bar chat button clicks
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('openChatAssistant', handleOpen);
    return () => window.removeEventListener('openChatAssistant', handleOpen);
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

    // Auto-speak AI response if voice is enabled (skip widget-heavy responses)
    if (voiceEnabled && voiceOutput.isSupported && !additionalData?.flightResults && !additionalData?.hotelResults) {
      voiceOutput.speak(responseContent, 'DISCOVERY');
    }

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
        hotelResults: additionalData?.hotelResults,
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

  /**
   * Send AI query using real-time streaming from Groq/OpenAI
   * This replaces the template-based generateAIResponse for intelligent responses
   */
  const sendStreamingAIResponse = async (
    queryText: string,
    consultant: ReturnType<typeof getConsultant>,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
    previousTeam?: TeamType,
    intentType?: string
  ): Promise<string> => {
    // Build streaming message options
    const streamMessages: StreamMessage[] = conversationHistory.slice(-6).map(m => ({
      role: m.role,
      content: m.content,
    }));

    // Create a placeholder message for streaming content
    const streamingMessageId = `stream_${Date.now()}`;
    const streamingMessage: Message = {
      id: streamingMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      consultant: {
        id: consultant.id,
        name: consultant.name,
        title: consultant.title,
        avatar: consultant.avatar,
        team: consultant.team,
      },
    };

    // Add the streaming message placeholder
    setMessages(prev => [...prev, streamingMessage]);
    setCurrentTypingConsultant(consultant);
    setIsTyping(true);
    setTypingState({
      phase: 'typing',
      consultantName: consultant.name,
      message: '',
      contextMessage: `${consultant.name} is thinking...`,
    });

    try {
      const fullResponse = await aiStream.sendMessage(queryText, {
        conversationHistory: streamMessages,
        sessionToken: sessionToken || undefined,
        previousTeam,
        customerName: userSession.sessionId,
        onChunk: (chunk, fullText) => {
          // Update the streaming message in real-time
          setMessages(prev =>
            prev.map(m =>
              m.id === streamingMessageId
                ? { ...m, content: fullText }
                : m
            )
          );
        },
        onComplete: (fullText, metadata) => {
          // Update with final content and metadata
          setMessages(prev =>
            prev.map(m =>
              m.id === streamingMessageId
                ? {
                    ...m,
                    content: fullText,
                    consultant: metadata.consultantName
                      ? {
                          id: consultant.id,
                          name: metadata.consultantName,
                          title: metadata.consultantTitle || consultant.title,
                          avatar: consultant.avatar,
                          team: metadata.team || consultant.team,
                        }
                      : m.consultant,
                  }
                : m
            )
          );

          // Save to conversation persistence
          if (conversation) {
            const updatedConversation = addMessage(conversation, {
              role: 'assistant',
              content: fullText,
              consultant: {
                name: metadata.consultantName || consultant.name,
                team: metadata.team || consultant.team,
                emoji: consultant.avatar,
              },
            });
            setConversation(updatedConversation);
          }

          // Voice output for completed response
          if (voiceEnabled && voiceOutput.isSupported) {
            voiceOutput.speak(fullText, 'DISCOVERY');
          }
        },
        onError: (error) => {
          console.error('[AIStream] Error:', error);
          // Handle session token errors
          if (error.includes('Session required')) {
            // Try to get new token from error response
            fetchSessionToken();
          }
        },
      });

      // Track analytics
      analytics.trackMessage('assistant', {
        team: consultant.team,
        name: consultant.name,
      });

      return fullResponse;
    } catch (error: any) {
      console.error('[Streaming Error]', error);

      // Fallback to non-streaming response
      const fallbackResponse = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: queryText,
          conversationHistory: streamMessages,
          previousTeam,
          useAI: true,
          sessionToken,
        }),
      });

      if (fallbackResponse.ok) {
        const data = await fallbackResponse.json();
        const responseText = data.response || '';

        // Update session token if provided
        if (data.sessionToken) {
          setSessionToken(data.sessionToken);
        }

        // Update the streaming message with fallback content
        setMessages(prev =>
          prev.map(m =>
            m.id === streamingMessageId
              ? { ...m, content: responseText }
              : m
          )
        );

        // Voice output
        if (voiceEnabled && voiceOutput.isSupported && responseText) {
          voiceOutput.speak(responseText, 'DISCOVERY');
        }

        return responseText;
      }

      throw error;
    } finally {
      setIsTyping(false);
      setTypingState(null);
      setCurrentTypingConsultant(null);
    }
  };

  /**
   * Fetch initial session token for AI authentication
   */
  const fetchSessionToken = useCallback(async () => {
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'init' }),
      });

      const data = await response.json();
      if (data.sessionToken) {
        setSessionToken(data.sessionToken);
      }
    } catch (error) {
      console.error('[Session Token] Failed to fetch:', error);
    }
  }, []);

  // Fetch session token on mount
  useEffect(() => {
    if (!sessionToken) {
      fetchSessionToken();
    }
  }, [sessionToken, fetchSessionToken]);

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

    // SALES CONVERSION: Analyze customer behavior for conversion optimization
    const behaviorHistory = messages.map(m => ({
      role: m.role,
      content: m.content
    }));
    const newBehavior = analyzeCustomerBehavior(behaviorHistory, queryText);
    setCustomerBehavior(newBehavior);

    // Determine conversion stage based on search results and user intent
    const hasSearchResults = messages.some(m => m.flightResults || m.hotelResults);
    const hasSelectedOption = /\b(book|select|this one|choose|i'll take|sounds good)\b/i.test(queryText);
    const newStage = determineConversionStage(behaviorHistory, hasSearchResults, hasSelectedOption);
    setConversionStage(newStage);

    // Adapt tone based on customer behavior
    const adaptedTone = getAdaptedTone(newBehavior);

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
      // Previous consultant briefly announces transfer (template OK for this)
      const previousConsultant = getConsultant(previousTeam as TeamType);
      const transferMsg = language === 'en'
        ? `Let me connect you with ${consultant.name}, our ${consultant.title.toLowerCase()}...`
        : language === 'pt'
        ? `Deixe-me conectá-lo com ${consultant.name}, nosso especialista...`
        : `Permíteme conectarte con ${consultant.name}, nuestro especialista...`;

      await sendAIResponseWithTyping(
        transferMsg,
        previousConsultant,
        queryText,
        undefined,
        'service-request'
      );

      // Small delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 1200));

      // New consultant introduces themselves via AI streaming (NATURAL response)
      // The AI will generate a personalized introduction + response to user's query
      const handoffHistory = [
        ...messages.slice(-4).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user' as const, content: queryText }
      ];

      await sendStreamingAIResponse(
        queryText,
        consultant,
        handoffHistory,
        previousTeam,
        'handoff'
      );

      return; // AI handled the full response including introduction
    }

    const engagement = getEngagementStage(
      { ...userSession, conversationCount: newConversationCount },
      'ask-question'
    );

    // CHECK FOR FLIGHT/HOTEL QUERIES FIRST (before personal responses)
    // This ensures "Morning! Need a flight to Paris" prioritizes the flight search
    const isFlightQuery = detectFlightSearchIntent(queryText);
    const isHotelQuery = detectHotelSearchIntent(queryText);

    // HANDLE CONVERSATIONAL RESPONSES (greetings, small talk, etc.)
    // NOW USES REAL AI for human-like responses instead of templates
    if (analysis.requiresPersonalResponse && !analysis.isServiceRequest && !isFlightQuery && !isHotelQuery) {
      // Use REAL AI streaming for conversational responses
      // This ensures human-like, contextual responses instead of template-based ones
      const streamHistory = messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      try {
        const aiResponse = await sendStreamingAIResponse(
          queryText,
          consultant,
          streamHistory,
          getPreviousConsultantTeam(messages) as TeamType | undefined,
          analysis.intent
        );

        // Track conversation context with AI response
        conversationContext.addInteraction(analysis.intent, aiResponse, queryText);
      } catch (error) {
        // Fallback to template only if AI fails
        console.error('[AI Conversational] Failed, using fallback:', error);
        const fallbackResponse = getConversationalResponse(
          analysis,
          {
            name: consultant.name,
            personality: consultant.personality || 'friendly',
            emoji: '😊'
          },
          conversationContext
        );
        await sendAIResponseWithTyping(fallbackResponse, consultant, queryText, undefined, analysis.intent);
        conversationContext.addInteraction(analysis.intent, fallbackResponse, queryText);
      }

      return; // Exit early for conversational responses
    }

    if (isFlightQuery && consultantTeam === 'flight-operations') {
      const searchInitMessage = language === 'en'
        ? "I'll search for flights for you right away..."
        : language === 'pt'
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

          // SALES CONVERSION: Update upsell opportunities based on flight search
          const opportunities = identifyUpsellOpportunities(newBehavior, 'flight', data.searchParams);
          setUpsellOpportunities(opportunities);

          // Warm, natural response from Lisa with conversion optimization
          const tripType = data.searchParams?.returnDate ? 'round-trip' : 'one-way';
          const cabinClass = data.searchParams?.cabinClass || 'economy';
          const isBusinessClass = cabinClass === 'business' || cabinClass === 'first';

          // Get urgency message if applicable (ethical scarcity)
          const topFlight = data.flights[0];
          const urgencyMsg = generateUrgencyMessage(topFlight?.seatsAvailable);

          // SALES CONVERSION: Generate behavior-adapted response
          const conversionPrefix = generateConversionResponse(newStage, newBehavior, {
            agentName: consultant.name,
            serviceName: 'flights',
            destination: data.searchParams?.destination
          });

          // Build results message based on customer behavior
          let resultsContent = '';
          if (newBehavior.emotionalState === 'excited') {
            resultsContent = language === 'en'
              ? `How exciting! ✈️ I found ${data.flights.length} fantastic ${isBusinessClass ? cabinClass.charAt(0).toUpperCase() + cabinClass.slice(1) + ' Class' : ''} options for your ${tripType} journey!`
              : language === 'pt'
              ? `Que emocionante! ✈️ Encontrei ${data.flights.length} opções fantásticas ${isBusinessClass ? 'em ' + cabinClass : ''} para sua viagem!`
              : `¡Qué emocionante! ✈️ Encontré ${data.flights.length} opciones fantásticas ${isBusinessClass ? 'en ' + cabinClass : ''} para tu viaje!`;
          } else if (newBehavior.emotionalState === 'stressed' || newBehavior.urgency === 'immediate') {
            resultsContent = language === 'en'
              ? `Don't worry, I've got you covered! ✈️ Found ${data.flights.length} available ${isBusinessClass ? cabinClass.charAt(0).toUpperCase() + cabinClass.slice(1) + ' Class' : ''} options. Let me show you the best ones:`
              : language === 'pt'
              ? `Não se preocupe, estou aqui para ajudar! ✈️ Encontrei ${data.flights.length} opções disponíveis. Deixe-me mostrar as melhores:`
              : `¡No te preocupes, aquí estoy para ayudarte! ✈️ Encontré ${data.flights.length} opciones disponibles. Déjame mostrarte las mejores:`;
          } else if (newBehavior.budget === 'price_sensitive') {
            resultsContent = language === 'en'
              ? `Great news! ✈️ I found ${data.flights.length} excellent deals for your ${tripType} journey. These are the best value options I could find:`
              : language === 'pt'
              ? `Ótimas notícias! ✈️ Encontrei ${data.flights.length} ótimas ofertas para sua viagem. Estas são as melhores opções com melhor custo-benefício:`
              : `¡Buenas noticias! ✈️ Encontré ${data.flights.length} excelentes ofertas para tu viaje. Estas son las mejores opciones en relación calidad-precio:`;
          } else {
            resultsContent = language === 'en'
              ? `Wonderful! ✈️ I found ${data.flights.length} fantastic ${isBusinessClass ? cabinClass.charAt(0).toUpperCase() + cabinClass.slice(1) + ' Class' : ''} options for your ${tripType} journey! Let me show you the best ones:`
              : language === 'pt'
              ? `Maravilha! ✈️ Encontrei ${data.flights.length} opções fantásticas ${isBusinessClass ? 'em ' + cabinClass : ''} para sua viagem ${tripType === 'round-trip' ? 'ida e volta' : 'só ida'}!`
              : `¡Maravilloso! ✈️ Encontré ${data.flights.length} opciones fantásticas ${isBusinessClass ? 'en ' + cabinClass : ''} para tu viaje de ${tripType === 'round-trip' ? 'ida y vuelta' : 'solo ida'}!`;
          }

          // Generate behavior-adapted follow-up with urgency if applicable
          let followUpContent = '';
          if (urgencyMsg && newBehavior.urgency !== 'comparison_shopping') {
            followUpContent = language === 'en'
              ? `${urgencyMsg} Which one catches your eye? I can secure your booking right away!`
              : language === 'pt'
              ? `${urgencyMsg} Qual chamou sua atenção? Posso garantir sua reserva agora mesmo!`
              : `${urgencyMsg} ¿Cuál te llama la atención? ¡Puedo asegurar tu reserva ahora mismo!`;
          } else {
            // Use CTA based on conversion stage
            const cta = generateCTA(newStage, newBehavior);
            followUpContent = language === 'en'
              ? cta
              : language === 'pt'
              ? "Qual desses te agrada? Estou aqui para ajudar com a reserva ou ajustar a busca! 💕"
              : "¿Cuál de estos te gusta? ¡Estoy aquí para ayudarte con la reserva o ajustar la búsqueda! 💕";
          }

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

          // AI-generated "no results" response - sounds natural, not templated
          const noResultsHistory = [
            ...conversationHistoryForAI.slice(-4),
            { role: 'user' as const, content: queryText },
            { role: 'assistant' as const, content: `[SYSTEM: Flight search returned no results. Ask the user for more details about their trip - origin city, destination, or dates. Be helpful and conversational, don't sound like an error message.]` }
          ];

          try {
            await sendStreamingAIResponse(
              queryText,
              consultant,
              noResultsHistory,
              undefined,
              'no-results'
            );
          } catch {
            // Minimal fallback only if AI fails
            const errorContent = language === 'en'
              ? "I couldn't find flights for that route. What city are you flying from?"
              : language === 'pt'
              ? "Não encontrei voos para essa rota. De qual cidade você está saindo?"
              : "No encontré vuelos para esa ruta. ¿De qué ciudad sales?";
            await sendAIResponseWithTyping(errorContent, consultant, queryText, undefined, 'question');
          }
        }
      } catch (error) {
        console.error('Flight search error:', error);
        setIsSearchingFlights(false);
        setMessages(prev => prev.filter(m => !m.isSearching));

        // AI-generated error response - sounds natural
        const errorHistory = [
          ...conversationHistoryForAI.slice(-4),
          { role: 'user' as const, content: queryText },
          { role: 'assistant' as const, content: `[SYSTEM: There was a technical issue searching for flights. Apologize briefly, reassure the customer, and offer to try again or help another way. Be warm, not robotic.]` }
        ];

        try {
          await sendStreamingAIResponse(
            queryText,
            consultant,
            errorHistory,
            undefined,
            'error-recovery'
          );
        } catch {
          // Minimal fallback
          const errorContent = language === 'en'
            ? "Oops, hit a snag! Let me try that search again. 🔄"
            : language === 'pt'
            ? "Ops, tive um problema! Deixe-me tentar novamente. 🔄"
            : "¡Ups, hubo un problema! Déjame intentar de nuevo. 🔄";
          await sendAIResponseWithTyping(errorContent, consultant, queryText, undefined, 'service-request');
        }
      }
    }

    // HANDLE HOTEL SEARCH
    if (isHotelQuery && consultantTeam === 'hotel-accommodations') {
      const searchInitMessage = language === 'en'
        ? "Let me search for the perfect accommodations for you..."
        : language === 'pt'
        ? "Deixe-me procurar as acomodações perfeitas para você..."
        : "Déjame buscar el alojamiento perfecto para ti...";

      await sendAIResponseWithTyping(searchInitMessage, consultant, queryText, {
        isSearching: true
      }, 'hotel-search');

      try {
        const response = await fetch('/api/ai/search-hotels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: queryText, language })
        });

        const data = await response.json();

        if (data.success && data.hotels && data.hotels.length > 0) {
          setMessages(prev => prev.filter(m => !m.isSearching));

          // SALES CONVERSION: Update upsell opportunities for hotels
          const hotelOpportunities = identifyUpsellOpportunities(newBehavior, 'hotel', data.searchParams);
          setUpsellOpportunities(prev => [...prev, ...hotelOpportunities]);

          // Marcus's warm, hospitable response with conversion optimization
          const hotelCount = data.hotels.length;
          const nights = data.searchParams.checkOut && data.searchParams.checkIn
            ? Math.ceil((new Date(data.searchParams.checkOut).getTime() - new Date(data.searchParams.checkIn).getTime()) / (1000 * 60 * 60 * 24))
            : 0;

          // Get urgency message if applicable (ethical scarcity)
          const topHotel = data.hotels[0];
          const hotelUrgencyMsg = generateUrgencyMessage(undefined, topHotel?.roomsAvailable);

          // Build behavior-adapted results message
          let resultsContent = '';
          if (newBehavior.travelPurpose === 'romantic') {
            resultsContent = language === 'en'
              ? `How lovely! 🏨 I found ${hotelCount} perfect hotels in ${data.searchParams.city} for your romantic getaway! ` +
                `${nights} night${nights > 1 ? 's' : ''} of pure bliss awaits:`
              : language === 'pt'
              ? `Que lindo! 🏨 Encontrei ${hotelCount} hotéis perfeitos em ${data.searchParams.city} para sua escapada romântica! ` +
                `${nights} noite${nights > 1 ? 's' : ''} de pura felicidade espera por vocês:`
              : `¡Qué hermoso! 🏨 Encontré ${hotelCount} hoteles perfectos en ${data.searchParams.city} para tu escapada romántica! ` +
                `${nights} noche${nights > 1 ? 's' : ''} de pura felicidad te esperan:`;
          } else if (newBehavior.travelPurpose === 'family') {
            resultsContent = language === 'en'
              ? `Wonderful! 🏨 I found ${hotelCount} family-friendly hotels in ${data.searchParams.city}! ` +
                `Perfect for ${data.searchParams.guests} guests over ${nights} night${nights > 1 ? 's' : ''}:`
              : language === 'pt'
              ? `Maravilha! 🏨 Encontrei ${hotelCount} hotéis perfeitos para famílias em ${data.searchParams.city}! ` +
                `Ideal para ${data.searchParams.guests} hóspedes durante ${nights} noite${nights > 1 ? 's' : ''}:`
              : `¡Maravilloso! 🏨 Encontré ${hotelCount} hoteles familiares en ${data.searchParams.city}! ` +
                `Perfectos para ${data.searchParams.guests} huéspedes durante ${nights} noche${nights > 1 ? 's' : ''}:`;
          } else if (newBehavior.budget === 'price_sensitive') {
            resultsContent = language === 'en'
              ? `Great news! 🏨 I found ${hotelCount} excellent value hotels in ${data.searchParams.city}! ` +
                `Best deals for ${nights} night${nights > 1 ? 's' : ''} with ${data.searchParams.guests} guest${data.searchParams.guests > 1 ? 's' : ''}:`
              : language === 'pt'
              ? `Ótimas notícias! 🏨 Encontrei ${hotelCount} hotéis com ótimo custo-benefício em ${data.searchParams.city}! ` +
                `Melhores ofertas para ${nights} noite${nights > 1 ? 's' : ''}:`
              : `¡Buenas noticias! 🏨 Encontré ${hotelCount} hoteles con excelente relación calidad-precio en ${data.searchParams.city}! ` +
                `Mejores ofertas para ${nights} noche${nights > 1 ? 's' : ''}:`;
          } else if (newBehavior.budget === 'luxury') {
            resultsContent = language === 'en'
              ? `Exquisite! 🏨 I've curated ${hotelCount} premium hotels in ${data.searchParams.city} just for you! ` +
                `${nights} night${nights > 1 ? 's' : ''} of luxury await:`
              : language === 'pt'
              ? `Requintado! 🏨 Selecionei ${hotelCount} hotéis premium em ${data.searchParams.city} especialmente para você! ` +
                `${nights} noite${nights > 1 ? 's' : ''} de luxo aguardam:`
              : `¡Exquisito! 🏨 He seleccionado ${hotelCount} hoteles premium en ${data.searchParams.city} solo para ti! ` +
                `${nights} noche${nights > 1 ? 's' : ''} de lujo te esperan:`;
          } else {
            resultsContent = language === 'en'
              ? `Perfect! 🏨 I found ${hotelCount} wonderful hotels in ${data.searchParams.city}! ` +
                `${nights} night${nights > 1 ? 's' : ''} for ${data.searchParams.guests} guest${data.searchParams.guests > 1 ? 's' : ''}:`
              : language === 'pt'
              ? `Perfeito! 🏨 Encontrei ${hotelCount} hotéis maravilhosos em ${data.searchParams.city}! ` +
                `${nights} noite${nights > 1 ? 's' : ''} para ${data.searchParams.guests} hóspede${data.searchParams.guests > 1 ? 's' : ''}:`
              : `¡Perfecto! 🏨 Encontré ${hotelCount} hoteles maravillosos en ${data.searchParams.city}! ` +
                `${nights} noche${nights > 1 ? 's' : ''} para ${data.searchParams.guests} huésped${data.searchParams.guests > 1 ? 'es' : ''}:`;
          }

          // Generate behavior-adapted follow-up with urgency if applicable
          let followUpContent = '';
          if (hotelUrgencyMsg && newBehavior.urgency !== 'comparison_shopping') {
            followUpContent = language === 'en'
              ? `${hotelUrgencyMsg} Which one would you like to book? I can secure your room instantly!`
              : language === 'pt'
              ? `${hotelUrgencyMsg} Qual você gostaria de reservar? Posso garantir seu quarto instantaneamente!`
              : `${hotelUrgencyMsg} ¿Cuál te gustaría reservar? ¡Puedo asegurar tu habitación al instante!`;
          } else {
            const hotelCta = generateCTA(newStage, newBehavior);
            followUpContent = language === 'en'
              ? hotelCta
              : language === 'pt'
              ? "Qual desses te agrada? Posso ajudar com a reserva ou buscar outras opções! 🏨"
              : "¿Cuál te gusta más? ¡Puedo ayudarte con la reserva o buscar otras opciones! 🏨";
          }

          await sendMultipleAIResponses([
            {
              content: resultsContent,
              additionalData: { hotelResults: data.hotels.slice(0, 3) }
            },
            {
              content: followUpContent
            }
          ], consultant, queryText);
        } else {
          setMessages(prev => prev.filter(m => !m.isSearching));

          // AI-generated "no hotels found" response
          const noHotelsHistory = [
            ...conversationHistoryForAI.slice(-4),
            { role: 'user' as const, content: queryText },
            { role: 'assistant' as const, content: `[SYSTEM: Hotel search returned no results. Ask the user for more details - city, check-in/out dates, or number of guests. Be warm and helpful, like a concierge.]` }
          ];

          try {
            await sendStreamingAIResponse(
              queryText,
              consultant,
              noHotelsHistory,
              undefined,
              'no-results'
            );
          } catch {
            const errorContent = language === 'en'
              ? "Hmm, I couldn't find hotels for those dates. Which city are you looking for?"
              : language === 'pt'
              ? "Hmm, não encontrei hotéis para essas datas. Qual cidade você procura?"
              : "Hmm, no encontré hoteles para esas fechas. ¿Qué ciudad buscas?";
            await sendAIResponseWithTyping(errorContent, consultant, queryText, undefined, 'question');
          }
        }
      } catch (error) {
        console.error('Hotel search error:', error);
        setMessages(prev => prev.filter(m => !m.isSearching));

        // AI-generated error response
        const hotelErrorHistory = [
          ...conversationHistoryForAI.slice(-4),
          { role: 'user' as const, content: queryText },
          { role: 'assistant' as const, content: `[SYSTEM: Technical issue with hotel search. Apologize briefly, be warm, and offer to try again. Don't sound like an error message.]` }
        ];

        try {
          await sendStreamingAIResponse(
            queryText,
            consultant,
            hotelErrorHistory,
            undefined,
            'error-recovery'
          );
        } catch {
          const errorContent = language === 'en'
            ? "Had a small hiccup! Let me try that hotel search again. 🏨"
            : language === 'pt'
            ? "Tive um pequeno problema! Deixe-me tentar a busca novamente. 🏨"
            : "¡Tuve un pequeño problema! Déjame intentar la búsqueda de nuevo. 🏨";
          await sendAIResponseWithTyping(errorContent, consultant, queryText, undefined, 'service-request');
        }
      }
    }

    // HANDLE BOOKING STATUS QUERIES
    const isBookingQuery = detectBookingStatusIntent(queryText);
    const bookingRef = extractBookingReference(queryText);

    if (isBookingQuery || bookingRef) {
      const davidPark = getConsultant('payment-billing');

      // If no booking reference found, ask for it
      if (!bookingRef) {
        const askForRefMessage = language === 'en'
          ? "I'd be happy to check your booking status! 💳 Could you please provide your booking reference? It looks like FLY2A-XXXXXX (you can find it in your confirmation email)."
          : language === 'pt'
          ? "Ficarei feliz em verificar o status da sua reserva! 💳 Poderia me fornecer sua referência de reserva? Ela se parece com FLY2A-XXXXXX (você pode encontrá-la no seu e-mail de confirmação)."
          : "¡Estaré encantado de verificar el estado de tu reserva! 💳 ¿Podrías proporcionarme tu referencia de reserva? Se ve como FLY2A-XXXXXX (la puedes encontrar en tu correo de confirmación).";

        await sendAIResponseWithTyping(askForRefMessage, davidPark, queryText, undefined, 'booking-management');
        return;
      }

      // Look up the booking
      const lookupInitMessage = language === 'en'
        ? `Let me check the status of booking ${bookingRef} for you... 🔍`
        : language === 'pt'
        ? `Deixe-me verificar o status da reserva ${bookingRef} para você... 🔍`
        : `Déjame verificar el estado de la reserva ${bookingRef} para ti... 🔍`;

      await sendAIResponseWithTyping(lookupInitMessage, davidPark, queryText, {
        isSearching: true
      }, 'booking-management');

      try {
        const response = await fetch('/api/ai/booking-lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingReference: bookingRef })
        });

        const data = await response.json();
        setMessages(prev => prev.filter(m => !m.isSearching));

        if (data.success && data.booking) {
          const booking = data.booking;
          const summary = data.summary;

          // Build comprehensive status response
          let statusResponse = language === 'en'
            ? `${summary.headline}\n\n` +
              `${summary.details.join('\n')}\n\n`
            : language === 'pt'
            ? `${summary.headline}\n\n` +
              `${summary.details.join('\n')}\n\n`
            : `${summary.headline}\n\n` +
              `${summary.details.join('\n')}\n\n`;

          // Add ticketing info if available
          if (summary.ticketing && summary.ticketing.pnr) {
            statusResponse += language === 'en'
              ? `🎫 **E-Ticket Info:**\n` +
                `✈️ Airline PNR: **${summary.ticketing.pnr}**\n` +
                (summary.ticketing.etickets?.length > 0
                  ? `📄 E-Tickets: ${summary.ticketing.etickets.join(', ')}\n`
                  : '')
              : language === 'pt'
              ? `🎫 **Info do E-Ticket:**\n` +
                `✈️ PNR da Companhia: **${summary.ticketing.pnr}**\n` +
                (summary.ticketing.etickets?.length > 0
                  ? `📄 E-Tickets: ${summary.ticketing.etickets.join(', ')}\n`
                  : '')
              : `🎫 **Info del E-Ticket:**\n` +
                `✈️ PNR de la Aerolínea: **${summary.ticketing.pnr}**\n` +
                (summary.ticketing.etickets?.length > 0
                  ? `📄 E-Tickets: ${summary.ticketing.etickets.join(', ')}\n`
                  : '');
          }

          // Add next steps
          if (summary.nextSteps?.length > 0) {
            statusResponse += '\n' + (language === 'en' ? '📋 **Next Steps:**\n' : language === 'pt' ? '📋 **Próximos Passos:**\n' : '📋 **Próximos Pasos:**\n');
            statusResponse += summary.nextSteps.map((step: string) => `• ${step}`).join('\n');
          }

          await sendAIResponseWithTyping(statusResponse, davidPark, queryText, undefined, 'booking-management');

          // Follow-up offer
          const followUpMessage = language === 'en'
            ? "\nIs there anything else I can help you with regarding your booking? I can help with modifications, questions about payment, or anything else! 💳"
            : language === 'pt'
            ? "\nPosso ajudá-lo com algo mais sobre sua reserva? Posso ajudar com modificações, perguntas sobre pagamento ou qualquer outra coisa! 💳"
            : "\n¿Puedo ayudarte con algo más sobre tu reserva? ¡Puedo ayudar con modificaciones, preguntas sobre el pago o cualquier otra cosa! 💳";

          await new Promise(resolve => setTimeout(resolve, 1000));
          await sendAIResponseWithTyping(followUpMessage, davidPark, queryText, undefined, 'question');

        } else {
          // Booking not found
          const notFoundMessage = language === 'en'
            ? `I couldn't find a booking with reference **${bookingRef}**. 😔\n\n` +
              `Please double-check:\n` +
              `• The reference is correct (format: FLY2A-XXXXXX)\n` +
              `• You can find it in your confirmation email\n\n` +
              `Would you like me to search with a different reference, or can I help you with something else?`
            : language === 'pt'
            ? `Não consegui encontrar uma reserva com a referência **${bookingRef}**. 😔\n\n` +
              `Por favor, verifique:\n` +
              `• Se a referência está correta (formato: FLY2A-XXXXXX)\n` +
              `• Você pode encontrá-la no seu e-mail de confirmação\n\n` +
              `Gostaria que eu pesquisasse com outra referência, ou posso ajudá-lo com algo mais?`
            : `No pude encontrar una reserva con la referencia **${bookingRef}**. 😔\n\n` +
              `Por favor, verifica:\n` +
              `• Que la referencia sea correcta (formato: FLY2A-XXXXXX)\n` +
              `• La puedes encontrar en tu correo de confirmación\n\n` +
              `¿Te gustaría que busque con otra referencia, o puedo ayudarte con algo más?`;

          await sendAIResponseWithTyping(notFoundMessage, davidPark, queryText, undefined, 'booking-management');
        }
      } catch (error) {
        console.error('Booking lookup error:', error);
        setMessages(prev => prev.filter(m => !m.isSearching));

        const errorContent = language === 'en'
          ? "I encountered an error looking up your booking. Please try again or contact our support team."
          : language === 'pt'
          ? "Encontrei um erro ao pesquisar sua reserva. Tente novamente ou entre em contato com nossa equipe de suporte."
          : "Encontré un error al buscar tu reserva. Por favor, inténtalo de nuevo o contacta con nuestro equipo de soporte.";

        await sendAIResponseWithTyping(errorContent, davidPark, queryText, undefined, 'service-request');
      }

      return; // Exit after handling booking query
    }

    if (!isFlightQuery && !isHotelQuery) {
      // ALL OTHER QUERIES - Use REAL AI streaming
      // This ensures human-like, contextual responses instead of templates
      const conversationHistoryForAI = messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      let responseContent: string;

      try {
        responseContent = await sendStreamingAIResponse(
          queryText,
          consultant,
          conversationHistoryForAI,
          previousTeam as TeamType,
          analysis.intent
        );
      } catch (error) {
        // Fallback only if AI completely fails
        console.error('[AI General Query] Failed, using fallback:', error);
        responseContent = getConversationalResponse(
          analysis,
          {
            name: consultant.name,
            personality: consultant.personality || 'friendly',
            emoji: '😊'
          },
          conversationContext
        );
        await sendAIResponseWithTyping(responseContent, consultant, queryText, undefined, analysis.intent);
      }

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

  // Voice auto-send ref update
  useEffect(() => {
    sendMessageRef.current = handleSendMessage;
  }, [handleSendMessage]);

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
      <ErrorBoundary variant="inline" context="ai-chat-fab">
        <button
          onClick={() => setIsOpen(true)}
          className="hidden md:flex fixed bottom-6 right-6 z-[1500] w-16 h-16 bg-gradient-to-br from-fly2any-red to-[#C93028] hover:from-[#D63930] hover:to-[#B82820] text-white rounded-2xl shadow-[0_8px_32px_rgba(231,64,53,0.35),0_4px_12px_rgba(231,64,53,0.25)] items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:scale-105 hover:shadow-[0_12px_40px_rgba(231,64,53,0.4),0_6px_16px_rgba(231,64,53,0.3)] active:scale-95 group"
          aria-label="Open AI Travel Assistant"
        >
          <Bot className="w-7 h-7 group-hover:scale-110 transition-transform duration-200 drop-shadow-sm" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full animate-pulse shadow-[0_2px_8px_rgba(52,211,153,0.5)]" />
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-fly2any-yellow/90 rounded-lg flex items-center justify-center shadow-[0_2px_8px_rgba(247,201,40,0.4)] animate-bounce">
            <Sparkles className="w-3.5 h-3.5 text-neutral-900" />
          </div>
        </button>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary variant="section" context="ai-travel-assistant">
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
          className={`
            fixed z-[1500] transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]
            md:bottom-6 md:right-6 md:w-[400px] md:max-w-[calc(100vw-3rem)]
            max-md:top-0 max-md:left-0 max-md:right-0 max-md:w-full
            ${isMinimized
              ? 'h-16 md:h-16'
              : 'h-[600px] max-h-[calc(100vh-3rem)] md:h-[600px] md:max-h-[calc(100vh-3rem)] max-md:h-full'
            }
          `}
          style={isMobile ? {
            // Mobile: position above BottomTabBar (52px + safe area)
            bottom: 'calc(52px + env(safe-area-inset-bottom, 0px))'
          } : undefined}
        >
        {/* Chat Window - Apple Level 6 Ultra-Premium */}
        <div className="bg-white/98 dark:bg-neutral-900/98 backdrop-blur-2xl md:rounded-3xl max-md:rounded-none shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)] md:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25),0_8px_24px_-8px_rgba(0,0,0,0.15)] md:border md:border-neutral-200/40 dark:md:border-neutral-700/40 max-md:border-0 flex flex-col h-full overflow-hidden">
          {/* Header - Fly2Any Premium Red Gradient */}
          <div className="bg-gradient-to-r from-fly2any-red via-[#D63930] to-[#C93028] px-4 py-3.5 flex items-center justify-between shadow-[0_4px_12px_rgba(231,64,53,0.3)]">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                  <Bot className="w-6 h-6 text-white drop-shadow-sm" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-400 border-2 border-fly2any-red rounded-full shadow-[0_2px_8px_rgba(52,211,153,0.5)]" />
              </div>
              <div className="text-white">
                <h3 className="font-bold text-[15px] tracking-tight drop-shadow-sm">{t.title}</h3>
                <p className="text-[11px] text-white/80 font-medium">{t.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Voice Toggle Button */}
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={cn(
                  'w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200',
                  voiceEnabled
                    ? 'bg-white/20 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/15 hover:text-white/80'
                )}
                aria-label={voiceEnabled ? 'Disable voice' : 'Enable voice'}
                title={voiceEnabled ? 'Voice enabled' : 'Voice disabled'}
              >
                {voiceEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hidden md:flex w-9 h-9 items-center justify-center hover:bg-white/15 rounded-xl transition-all duration-200"
                aria-label={t.minimize}
              >
                <Minimize2 className="w-4 h-4 text-white/90" />
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  window.dispatchEvent(new CustomEvent('closeChatAssistant'));
                }}
                className="w-9 h-9 flex items-center justify-center hover:bg-white/15 rounded-xl transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] active:scale-90"
                aria-label={t.close}
              >
                <X className="w-4 h-4 text-white/90" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area - Apple Level 6 Ultra-Premium */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-neutral-50/90 via-white/50 to-neutral-50/90 dark:from-neutral-900/90 dark:via-neutral-800/50 dark:to-neutral-900/90">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-3 animate-[fade-in_0.3s_ease-out]',
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    {/* Professional Avatar with Premium Styling */}
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
                      <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-fly2any-red to-[#C93028] flex items-center justify-center flex-shrink-0 shadow-[0_2px_8px_rgba(231,64,53,0.25)]">
                        <Bot className="w-4 h-4 text-white drop-shadow-sm" />
                      </div>
                    )}

                    {/* Message Bubble - Apple Level 6 Premium */}
                    <div className="flex flex-col gap-1.5 max-w-[78%] md:max-w-[75%]">
                      {/* Consultant Name & Title with Premium Typography */}
                      {message.role === 'assistant' && message.consultant && (
                        <div className="flex items-center gap-2 px-1">
                          <p className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-200 tracking-tight">
                            {message.consultant.name}
                          </p>
                          <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">
                            {message.consultant.title}
                          </p>
                        </div>
                      )}

                      <div
                        className={cn(
                          'rounded-2xl px-4 py-3 transition-all duration-200',
                          message.role === 'user'
                            ? 'bg-gradient-to-br from-fly2any-red to-[#C93028] text-white shadow-[0_4px_16px_rgba(231,64,53,0.25),0_2px_4px_rgba(231,64,53,0.15)]'
                            : 'bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm text-neutral-800 dark:text-neutral-100 border border-neutral-200/60 dark:border-neutral-700/60 shadow-[0_2px_12px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)]'
                        )}
                      >
                        <p className="text-[14px] leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <p
                          className={cn(
                            'text-[10px] mt-2 font-medium',
                            message.role === 'user'
                              ? 'text-white/70'
                              : 'text-neutral-400 dark:text-neutral-500'
                          )}
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
                          className="w-full py-2.5 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm border border-fly2any-red/30 text-fly2any-red font-semibold rounded-xl hover:bg-fly2any-red hover:text-white hover:border-fly2any-red transition-all duration-200 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(231,64,53,0.2)]"
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
                      <div key={`hotels-${message.id}`} className="space-y-3 mt-2">
                        {message.hotelResults.map((hotel) => (
                          <HotelResultCard
                            key={hotel.id}
                            hotel={hotel}
                          />
                        ))}
                        <button
                          onClick={() => {
                            // Navigate to hotel search results page
                            const firstHotel = message.hotelResults?.[0];
                            if (firstHotel) {
                              const params = new URLSearchParams({
                                destination: firstHotel.address.split(',')[0] || 'City',
                                checkIn: firstHotel.checkIn,
                                checkOut: firstHotel.checkOut,
                                adults: firstHotel.guests.toString(),
                                rooms: firstHotel.rooms.toString(),
                              });
                              router.push(`/hotels/results?${params.toString()}`);
                            }
                          }}
                          className="w-full py-2.5 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm border border-fly2any-red/30 text-fly2any-red font-semibold rounded-xl hover:bg-fly2any-red hover:text-white hover:border-fly2any-red transition-all duration-200 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(231,64,53,0.2)]"
                        >
                          See More Hotels →
                        </button>
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

                {/* Enhanced Typing Indicator - Apple Level 6 */}
                {isTyping && currentTypingConsultant && typingState && (
                  <div className="flex gap-3 animate-[fade-in_0.3s_ease-out]">
                    <ConsultantAvatar
                      consultantId={currentTypingConsultant.id}
                      name={currentTypingConsultant.name}
                      size="sm"
                      showStatus={true}
                    />
                    <div className="flex flex-col gap-1.5 flex-1">
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 px-1 font-medium tracking-tight">
                        {currentTypingConsultant.name}
                      </p>
                      <div className="bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm border border-neutral-200/60 dark:border-neutral-700/60 rounded-2xl px-4 py-3 max-w-[280px] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-fly2any-red rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-fly2any-red/80 rounded-full animate-bounce [animation-delay:0.15s]" />
                            <div className="w-2 h-2 bg-fly2any-red/60 rounded-full animate-bounce [animation-delay:0.3s]" />
                          </div>
                          <span className="text-[13px] text-neutral-600 dark:text-neutral-300 font-medium">
                            {typingState.contextMessage || 'Typing...'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Flight Search Loading - Apple Level 6 */}
                {isSearchingFlights && (
                  <div className="flex gap-3 animate-[fade-in_0.3s_ease-out]">
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-fly2any-red to-[#C93028] flex items-center justify-center shadow-[0_2px_8px_rgba(231,64,53,0.25)]">
                      <Plane className="w-4 h-4 text-white animate-pulse drop-shadow-sm" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 px-1 font-medium tracking-tight">
                        Searching flights...
                      </p>
                      <div className="bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm border border-neutral-200/60 dark:border-neutral-700/60 rounded-2xl px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 border-2 border-fly2any-red border-t-transparent rounded-full animate-spin" />
                          <span className="text-[13px] text-neutral-600 dark:text-neutral-300 font-medium">Finding best options...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Auth Prompt - Apple Level 6 Premium */}
              {showAuthPrompt && !userSession.isAuthenticated && (
                <div className="mx-3 my-2 px-4 py-3 bg-gradient-to-r from-fly2any-red/5 via-fly2any-yellow/5 to-fly2any-red/5 dark:from-fly2any-red/10 dark:via-fly2any-yellow/10 dark:to-fly2any-red/10 border border-fly2any-red/20 dark:border-fly2any-red/30 rounded-2xl animate-[fade-in_0.3s_ease-out] backdrop-blur-sm shadow-[0_2px_8px_rgba(231,64,53,0.08)]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-fly2any-red to-[#C93028] flex items-center justify-center flex-shrink-0 shadow-[0_2px_6px_rgba(231,64,53,0.3)]">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                      </div>
                      <p className="text-[11px] text-neutral-700 dark:text-neutral-200 font-medium line-clamp-1">
                        {authPromptMessage}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => {
                          analytics.trackAuthPromptClicked('signup');
                          router.push('/auth/signup');
                          setShowAuthPrompt(false);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-b from-fly2any-red to-[#C93028] hover:from-[#D63930] hover:to-[#B82820] text-white text-[11px] font-semibold rounded-xl transition-all duration-200 shadow-[0_2px_8px_rgba(231,64,53,0.25)] hover:shadow-[0_4px_12px_rgba(231,64,53,0.35)]"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span className="hidden sm:inline">Sign Up</span>
                      </button>
                      <button
                        onClick={() => {
                          analytics.trackAuthPromptClicked('login');
                          router.push('/auth/signin');
                          setShowAuthPrompt(false);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 dark:bg-neutral-800/80 hover:bg-white dark:hover:bg-neutral-700 border border-fly2any-red/30 text-fly2any-red text-[11px] font-semibold rounded-xl transition-all duration-200"
                      >
                        <LogIn className="w-3 h-3" />
                        <span className="hidden sm:inline">Sign In</span>
                      </button>
                      <button
                        onClick={() => {
                          analytics.trackAuthPromptClicked('dismiss');
                          setShowAuthPrompt(false);
                        }}
                        className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                        title="Dismiss"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions - Apple Level 6 Premium Pills */}
              {messages.length === 1 && (
                <div className="px-4 py-3 bg-[#FAFAFA] dark:bg-[#1A1A1A] border-t border-neutral-200/60 dark:border-[#2B2B2B]">
                  <p className="text-[10px] font-semibold text-[#6B6B6B] dark:text-neutral-400 mb-2 uppercase tracking-wider">
                    {t.quickActions}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {t.quickQuestions.map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickQuestion(question)}
                        className="text-[12px] px-3.5 py-1.5 bg-white dark:bg-[#222222] hover:bg-fly2any-red/10 dark:hover:bg-fly2any-red/20 border border-neutral-200 dark:border-[#2B2B2B] hover:border-fly2any-red/50 text-[#1C1C1C] dark:text-neutral-100 hover:text-fly2any-red rounded-full transition-all duration-200 font-medium shadow-sm"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Support - Apple Level 6 Premium */}
              {messages.length >= 3 && (
              <div className="px-4 py-2.5 bg-[#F2F2F2] dark:bg-[#1A1A1A] border-t border-neutral-200/60 dark:border-[#2B2B2B] flex items-center justify-between animate-[fade-in_0.3s_ease-out]">
                <p className="text-[10px] text-[#6B6B6B] dark:text-neutral-400 font-medium">
                  {t.contactSupport}
                </p>
                <div className="flex gap-2">
                  <a
                    href="tel:+13322200838"
                    title="Call Us"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-b from-fly2any-red to-[#C93028] hover:from-[#D63930] hover:to-[#B82820] text-white text-[10px] font-semibold rounded-xl transition-all duration-200 shadow-[0_2px_6px_rgba(231,64,53,0.2)] hover:shadow-[0_3px_10px_rgba(231,64,53,0.3)]"
                  >
                    <Phone className="w-3 h-3" />
                    <span className="hidden sm:inline">{t.callUs}</span>
                  </a>
                  <a
                    href="mailto:support@fly2any.com"
                    title="Email Us"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-b from-fly2any-yellow to-[#E0B520] hover:from-[#F7C928] hover:to-[#D4AA18] text-neutral-900 text-[10px] font-semibold rounded-xl transition-all duration-200 shadow-[0_2px_6px_rgba(247,201,40,0.25)] hover:shadow-[0_3px_10px_rgba(247,201,40,0.35)]"
                  >
                    <Mail className="w-3 h-3" />
                    <span className="hidden sm:inline">{t.emailUs}</span>
                  </a>
                </div>
              </div>
              )}

              {/* Input Area - Apple Level 6 Ultra-Premium with Voice */}
              <div className="p-4 bg-white dark:bg-[#1A1A1A] border-t border-neutral-200 dark:border-[#222222] shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
                {/* Voice Status Indicator */}
                {(voiceInput.isListening || voiceOutput.isSpeaking) && (
                  <div className="flex justify-center mb-3">
                    <VoiceStatusIndicator
                      isListening={voiceInput.isListening}
                      isSpeaking={voiceOutput.isSpeaking}
                      language={voiceInput.language}
                    />
                  </div>
                )}
                <div className="flex gap-2.5 items-center">
                  {/* Voice Mic Button - Always visible if supported (independent from voice output) */}
                  {voiceInput.isSupported && (
                    <VoiceMicButton
                      isListening={voiceInput.isListening}
                      isSupported={voiceInput.isSupported}
                      isSpeaking={voiceOutput.isSpeaking}
                      error={voiceInput.error}
                      interimTranscript={voiceInput.interimTranscript}
                      audioLevel={voiceInput.audioLevel}
                      recordingDuration={voiceInput.recordingDuration}
                      onToggle={voiceInput.toggleListening}
                      onStopSpeaking={voiceOutput.stop}
                      size="md"
                      variant="default"
                    />
                  )}
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={voiceInput.isListening ? (language === 'pt' ? 'Ouvindo...' : language === 'es' ? 'Escuchando...' : 'Listening...') : t.placeholder}
                      className={cn(
                        'w-full px-4 py-3 border rounded-2xl text-[14px] text-[#1C1C1C] dark:text-white placeholder:text-[#9F9F9F] dark:placeholder:text-neutral-500 transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] bg-[#FAFAFA] dark:bg-[#1A1A1A]',
                        voiceAutoSending
                          ? 'border-[#27C56B] bg-[#27C56B]/5 ring-2 ring-[#27C56B]/30 animate-pulse'
                          : voiceInput.isListening
                          ? 'border-fly2any-red/60 bg-fly2any-red/5 dark:bg-fly2any-red/10 ring-2 ring-fly2any-red/20'
                          : 'border-[#E6E6E6] dark:border-[#2B2B2B] focus:border-fly2any-red focus:ring-4 focus:ring-fly2any-red/10 dark:focus:ring-fly2any-red/20'
                      )}
                      disabled={voiceAutoSending}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping || voiceAutoSending}
                    className={cn(
                      'w-12 h-12 rounded-2xl transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] flex items-center justify-center active:scale-90',
                      voiceAutoSending
                        ? 'bg-success cursor-wait shadow-[0_4px_16px_rgba(39,197,107,0.3)]'
                        : !inputMessage.trim() || isTyping
                        ? 'bg-neutral-200 dark:bg-neutral-700 cursor-not-allowed'
                        : 'bg-gradient-to-b from-fly2any-red to-[#C93028] hover:from-[#D63930] hover:to-[#B82820] shadow-[0_4px_16px_rgba(231,64,53,0.25)] hover:shadow-[0_6px_20px_rgba(231,64,53,0.35)]'
                    )}
                  >
                    {isTyping ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : voiceAutoSending ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <Send className={cn(
                        'w-5 h-5 transition-colors',
                        !inputMessage.trim() ? 'text-neutral-400 dark:text-neutral-500' : 'text-white drop-shadow-sm'
                      )} />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-[#6B6B6B] dark:text-neutral-500 mt-3 text-center flex items-center justify-center gap-1.5 font-medium">
                  <span className="inline-block w-1.5 h-1.5 bg-[#27C56B] rounded-full animate-pulse shadow-[0_0_6px_rgba(39,197,107,0.5)]"></span>
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
    </ErrorBoundary>
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
 * Detect if user is asking about booking status
 */
function detectBookingStatusIntent(userMessage: string): boolean {
  const msg = userMessage.toLowerCase();

  // Direct booking reference pattern (FLY2A-XXXXXX)
  const hasBookingRef = /fly2a-[a-z0-9]{6}/i.test(userMessage);
  if (hasBookingRef) return true;

  // Status inquiry keywords
  const statusKeywords = [
    'status', 'where is my', 'check my', 'track my',
    'booking status', 'reservation status', 'order status',
    'my booking', 'my reservation', 'my order',
    'what happened to', 'update on', 'any update'
  ];

  // Booking reference keywords
  const bookingKeywords = [
    'booking', 'reservation', 'confirmation', 'reference',
    'reserva', 'confirmación', 'referência'
  ];

  const hasStatusKeyword = statusKeywords.some(kw => msg.includes(kw));
  const hasBookingKeyword = bookingKeywords.some(kw => msg.includes(kw));

  return hasStatusKeyword || (hasBookingKeyword && msg.length < 100);
}

/**
 * Extract booking reference from user message
 */
function extractBookingReference(userMessage: string): string | null {
  // Match FLY2A-XXXXXX pattern
  const refMatch = userMessage.match(/fly2a-[a-z0-9]{6}/i);
  return refMatch ? refMatch[0].toUpperCase() : null;
}

/**
 * Extract flight dates from user message with comprehensive pattern matching
 * Handles: "from dec 20th until jan 5th", "on december 20", "dec 20 - jan 5", etc.
 */
function extractFlightDates(msg: string): { departureDate: string | null; returnDate: string | null } {
  const months: Record<string, number> = {
    january: 0, jan: 0, february: 1, feb: 1, march: 2, mar: 2,
    april: 3, apr: 3, may: 4, june: 5, jun: 5, july: 6, jul: 6,
    august: 7, aug: 7, september: 8, sep: 8, sept: 8,
    october: 9, oct: 9, november: 10, nov: 10, december: 11, dec: 11
  };

  const monthPattern = '(?:january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sep|sept|october|oct|november|nov|december|dec)';
  const dayPattern = '(\\d{1,2})(?:st|nd|rd|th)?';
  const yearPattern = '(?:,?\\s*(\\d{4}))?';

  // Helper to parse date and handle year rollover
  function parseDate(monthStr: string, dayStr: string, yearStr?: string, referenceDate?: Date): string | null {
    const month = months[monthStr.toLowerCase()];
    if (month === undefined) return null;

    const day = parseInt(dayStr);
    if (day < 1 || day > 31) return null;

    const now = new Date();
    let year = yearStr ? parseInt(yearStr) : now.getFullYear();

    // If date is in the past (or reference date is provided for return dates)
    const testDate = new Date(year, month, day);
    const compareDate = referenceDate || now;

    if (testDate < compareDate) {
      year++;
    }

    // Format as ISO date
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  let departureDate: string | null = null;
  let returnDate: string | null = null;

  // Pattern 1: "from [date] until/to/through [date]" or "[date] - [date]"
  const rangePatterns = [
    // "from dec 20th until jan 5th" or "from dec 20 to jan 5"
    new RegExp(`from\\s+${monthPattern}\\s+${dayPattern}${yearPattern}\\s+(?:until|to|through|till|-|–)\\s+${monthPattern}\\s+${dayPattern}${yearPattern}`, 'i'),
    // "dec 20th until jan 5th" or "dec 20 - jan 5"
    new RegExp(`${monthPattern}\\s+${dayPattern}${yearPattern}\\s+(?:until|to|through|till|thru|-|–)\\s+${monthPattern}\\s+${dayPattern}${yearPattern}`, 'i'),
    // "20th dec until 5th jan"
    new RegExp(`${dayPattern}\\s+${monthPattern}${yearPattern}\\s+(?:until|to|through|till|-|–)\\s+${dayPattern}\\s+${monthPattern}${yearPattern}`, 'i'),
  ];

  for (const pattern of rangePatterns) {
    const match = msg.match(pattern);
    if (match) {
      // Extract based on pattern structure
      if (pattern.source.startsWith('from')) {
        // "from month day year until month day year"
        const depMonth = match[1] || match[0].match(new RegExp(monthPattern, 'i'))?.[0];
        const depDay = match[2];
        const depYear = match[3];

        // Find the second date after "until/to/through"
        const afterKeyword = msg.substring(msg.search(/until|to|through|till|-|–/i)).toLowerCase();
        const secondDateMatch = afterKeyword.match(new RegExp(`(${monthPattern})\\s+${dayPattern}${yearPattern}`, 'i'));

        if (depMonth && depDay && secondDateMatch) {
          departureDate = parseDate(depMonth, depDay, depYear);
          const depDateObj = departureDate ? new Date(departureDate) : undefined;
          returnDate = parseDate(secondDateMatch[1], secondDateMatch[2], secondDateMatch[3], depDateObj);
        }
      }
      break;
    }
  }

  // If no range found, try single date patterns
  if (!departureDate) {
    const singlePatterns = [
      // "on december 20th" or "on dec 20"
      new RegExp(`(?:on|for|departing|leaving|flying)\\s+(${monthPattern})\\s+${dayPattern}${yearPattern}`, 'i'),
      // "december 20th" or "dec 20" (standalone)
      new RegExp(`\\b(${monthPattern})\\s+${dayPattern}${yearPattern}\\b`, 'i'),
      // "20th december"
      new RegExp(`\\b${dayPattern}\\s+(${monthPattern})${yearPattern}\\b`, 'i'),
      // MM/DD or MM/DD/YYYY
      /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/,
    ];

    for (const pattern of singlePatterns) {
      const match = msg.match(pattern);
      if (match) {
        if (pattern.source.includes('\\/')) {
          // MM/DD format
          const month = parseInt(match[1]) - 1;
          const day = parseInt(match[2]);
          const year = match[3] ? (match[3].length === 2 ? 2000 + parseInt(match[3]) : parseInt(match[3])) : new Date().getFullYear();
          if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
            departureDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          }
        } else if (pattern.source.startsWith('\\b\\d')) {
          // day month format
          departureDate = parseDate(match[2], match[1], match[3]);
        } else {
          // month day format
          departureDate = parseDate(match[1], match[2], match[3]);
        }
        break;
      }
    }
  }

  // If we have departure but no return, check for return date separately
  if (departureDate && !returnDate) {
    const returnPatterns = [
      // "returning on jan 5th" or "return jan 5"
      new RegExp(`(?:return(?:ing)?|back|coming back)\\s+(?:on\\s+)?(${monthPattern})\\s+${dayPattern}${yearPattern}`, 'i'),
      // "until jan 5th" (if not already matched as range)
      new RegExp(`(?:until|till|through|thru)\\s+(${monthPattern})\\s+${dayPattern}${yearPattern}`, 'i'),
    ];

    for (const pattern of returnPatterns) {
      const match = msg.match(pattern);
      if (match) {
        const depDateObj = new Date(departureDate);
        returnDate = parseDate(match[1], match[2], match[3], depDateObj);
        break;
      }
    }
  }

  return { departureDate, returnDate };
}

/**
 * Extract search context from user message for handoff
 * Parses key information (locations, dates, guests) to pass to new agent
 */
function extractSearchContext(userMessage: string, team: string): any {
  const msg = userMessage.toLowerCase();

  // Flight context extraction
  if (team === 'flight-operations') {
    // Common action words to exclude from destination
    const actionWords = ['book', 'find', 'search', 'get', 'buy', 'purchase', 'need', 'want', 'looking'];

    // Try to extract "from X to Y" pattern first (most reliable)
    const fromToMatch = msg.match(/from\s+([a-z\s]+?)\s+to\s+([a-z\s]+?)(?:\s+nonstop|\s+non-stop|\s+direct|\s+on\s+|\s+in\s+|\s+for\s+|\s*$)/i);

    let origin: string | undefined;
    let destination: string | undefined;

    if (fromToMatch) {
      origin = fromToMatch[1].trim();
      destination = fromToMatch[2].trim();
    } else {
      // Try separate patterns
      const fromMatch = msg.match(/from\s+([a-z\s]+?)(?:\s+to\s+|\s+on\s+|\s+in\s+|\s*$)/i);
      if (fromMatch) origin = fromMatch[1].trim();

      // Look for destination: "to [city]" but skip common action phrases like "to book"
      // Use a pattern that specifically looks for "to [city]" followed by context clues
      const toPatterns = [
        /\bto\s+([a-z]+(?:\s+[a-z]+)?)\s+(?:nonstop|non-stop|direct|for\s+\d|on\s+|in\s+\w+\s*\d)/i,  // "to tokyo for 2" or "to new york on march"
        /flights?\s+to\s+([a-z]+(?:\s+[a-z]+)?)/i,  // "flights to tokyo" or "flight to new york"
        /\bto\s+([a-z]+(?:\s+[a-z]+)?)\s*$/i,  // "to tokyo" at end of message
      ];

      for (const pattern of toPatterns) {
        const match = msg.match(pattern);
        if (match && match[1]) {
          const potentialDest = match[1].trim();
          // Verify it's not an action word
          if (!actionWords.includes(potentialDest.split(' ')[0])) {
            destination = potentialDest;
            break;
          }
        }
      }
    }

    // Clean destination (remove trailing modifiers)
    if (destination) {
      destination = destination.replace(/\s*(nonstop|non-stop|direct|business|economy|first class|flights?).*$/i, '').trim();
      // Final check: reject if it's just action words
      if (actionWords.includes(destination.split(' ')[0])) {
        destination = undefined;
      }
    }

    // Enhanced date extraction with comprehensive patterns
    const { departureDate, returnDate } = extractFlightDates(msg);

    // Try to extract passengers
    const passengersMatch = msg.match(/(\d+)\s+(?:passenger|person|people|traveler)/i);

    // Try to extract cabin class
    const hasBusinessClass = msg.includes('business') || msg.includes('first class');
    const hasEconomyClass = msg.includes('economy') || msg.includes('coach');

    const context: any = {};
    if (origin) context.origin = origin;
    if (destination) context.destination = destination;
    if (departureDate) context.departureDate = departureDate;
    if (returnDate) context.returnDate = returnDate;
    if (passengersMatch) context.passengers = parseInt(passengersMatch[1]);
    if (hasBusinessClass) context.cabinClass = 'business';
    else if (hasEconomyClass) context.cabinClass = 'economy';

    return Object.keys(context).length > 0 ? context : null;
  }

  // Hotel context extraction
  if (team === 'hotel-accommodations') {
    // Try to extract city
    const inMatch = msg.match(/(?:in|at|near)\s+([a-z\s]+?)(?:\s+from|\s+for|\s+on|\s*$)/i);

    // Try to extract dates
    const checkInMatch = msg.match(/(?:from|check\s*in|checkin)\s+([a-z]+\s+\d+|\d+\/\d+)/i);
    const checkOutMatch = msg.match(/(?:to|check\s*out|checkout|until)\s+([a-z]+\s+\d+|\d+\/\d+)/i);

    // Try to extract guests
    const guestsMatch = msg.match(/(\d+)\s+(?:guest|person|people)/i);
    const roomsMatch = msg.match(/(\d+)\s+room/i);

    const context: any = {};
    if (inMatch) context.city = inMatch[1].trim();
    if (checkInMatch) context.checkIn = checkInMatch[1].trim();
    if (checkOutMatch) context.checkOut = checkOutMatch[1].trim();
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

  // Booking status queries → David Park (Payment & Billing)
  if (msg.includes('booking') || msg.includes('reservation') || msg.includes('reserva') ||
      msg.includes('status') || msg.includes('where is my') || msg.includes('track') ||
      msg.includes('fly2a-') || /fly2a-[a-z0-9]{6}/i.test(userMessage)) {
    return 'payment-billing';
  }

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
