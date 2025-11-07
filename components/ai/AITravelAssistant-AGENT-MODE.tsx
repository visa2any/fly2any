'use client';

/**
 * AI TRAVEL ASSISTANT - FULL AGENT MODE
 *
 * This is the complete agent-powered version with:
 * - Conversation Flow System (Team 1): Guides conversation naturally
 * - Proactive Suggestions (Team 2): Anticipates needs and suggests options
 * - Autonomous Actions (Team 3): Takes actions on behalf of user
 *
 * AGENT BEHAVIOR:
 * - Asks questions to gather information
 * - Autonomously searches when ready
 * - Provides proactive suggestions
 * - Announces actions before taking them
 * - Handles failures gracefully
 */

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
  Plane,
  AlertCircle,
  CheckCircle,
  Clock
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
import {
  analyzeConversationIntent,
  getConversationalResponse,
  ConversationContext,
  type IntentType
} from '@/lib/ai/conversational-intelligence';

// AGENT SYSTEM IMPORTS
import {
  ConversationFlow,
  ConversationStage,
  CollectedInfo,
  initializeConversationFlow,
  updateConversationFlow,
  canProceedToSearch,
  getMissingInfo,
  getProgressPercentage,
  generateCollectedInfoSummary
} from '@/lib/ai/agent-conversation-flow';

import {
  generateSuggestions,
  Suggestion,
  SuggestionContext
} from '@/lib/ai/agent-suggestions';

import {
  AgentAction,
  ActionPlan,
  planActions,
  getNextAction,
  updateActionStatus,
  updatePlan,
  isPlanComplete,
  getPlanProgress
} from '@/lib/ai/agent-actions';

import {
  ActionExecutor
} from '@/lib/ai/agent-action-executor';

import {
  getRandomQuestion,
  getTimeBasedGreeting,
  getFollowUpFor,
  discoveryQuestions,
  guidingQuestions,
  reassuranceStatements
} from '@/lib/ai/agent-question-bank';

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

  // AGENT STATE
  const [conversationFlow, setConversationFlow] = useState<ConversationFlow>(
    initializeConversationFlow()
  );
  const [currentActionPlan, setCurrentActionPlan] = useState<ActionPlan | null>(null);
  const [currentAction, setCurrentAction] = useState<AgentAction | null>(null);
  const [activeSuggestions, setActiveSuggestions] = useState<Suggestion[]>([]);
  const [extractedInfo, setExtractedInfo] = useState<Partial<CollectedInfo>>({});
  const [actionExecutor] = useState(() => new ActionExecutor({ baseUrl: '' }));

  // User session tracking
  const [userSession, setUserSession] = useState<UserSession>({
    sessionId: `session_${Date.now()}`,
    ipAddress: 'unknown',
    isAuthenticated: false,
    conversationCount: 0,
    lastActivity: new Date(),
    createdAt: new Date()
  });

  const [conversationContext] = useState(() => new ConversationContext());

  // Analytics tracking
  const analytics = useAIAnalytics({
    sessionId: userSession.sessionId,
    userId: undefined,
    isAuthenticated: userSession.isAuthenticated,
  });

  // Translations
  const translations = {
    en: {
      title: 'AI Travel Agent',
      subtitle: 'Autonomous Travel Assistant',
      placeholder: 'Tell me about your trip...',
      send: 'Send',
      close: 'Close',
      minimize: 'Minimize',
      typing: 'is typing...',
      quickActions: 'Quick Actions:',
      quickQuestions: [
        'Plan a vacation',
        'Find cheap flights',
        'Book a hotel',
        'Help with booking',
      ],
      contactSupport: 'Need human assistance?',
      callUs: 'Call Us',
      emailUs: 'Email Us',
      poweredBy: 'AI-Powered Agent • 24/7',
      signIn: 'Sign In',
      signUp: 'Create Free Account',
      continueAsGuest: 'Continue as Guest'
    },
    pt: {
      title: 'Agente de Viagem IA',
      subtitle: 'Assistente Autônomo',
      placeholder: 'Conte-me sobre sua viagem...',
      send: 'Enviar',
      close: 'Fechar',
      minimize: 'Minimizar',
      typing: 'está digitando...',
      quickActions: 'Ações Rápidas:',
      quickQuestions: [
        'Planejar férias',
        'Encontrar voos baratos',
        'Reservar hotel',
        'Ajuda com reserva',
      ],
      contactSupport: 'Precisa de assistência humana?',
      callUs: 'Ligar',
      emailUs: 'Email',
      poweredBy: 'Agente IA • 24/7',
      signIn: 'Entrar',
      signUp: 'Criar Conta Grátis',
      continueAsGuest: 'Continuar como Convidado'
    },
    es: {
      title: 'Agente de Viajes IA',
      subtitle: 'Asistente Autónomo',
      placeholder: 'Cuéntame sobre tu viaje...',
      send: 'Enviar',
      close: 'Cerrar',
      minimize: 'Minimizar',
      typing: 'está escribiendo...',
      quickActions: 'Acciones Rápidas:',
      quickQuestions: [
        'Planear vacaciones',
        'Encontrar vuelos baratos',
        'Reservar hotel',
        'Ayuda con reserva',
      ],
      contactSupport: '¿Necesitas asistencia humana?',
      callUs: 'Llamar',
      emailUs: 'Email',
      poweredBy: 'Agente IA • 24/7',
      signIn: 'Iniciar Sesión',
      signUp: 'Crear Cuenta Gratis',
      continueAsGuest: 'Continuar como Invitado'
    }
  };

  const t = translations[language];

  // Initialize with agent greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const lisaConsultant = getConsultant('customer-service');

      // AGENT MODE: Proactive greeting with time-based personalization
      const greeting = getTimeBasedGreeting();

      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: greeting,
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

      // Initialize conversation flow
      setConversationFlow(initializeConversationFlow());
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
   * AGENT MODE: Extract information from user message using comprehensive NLP parser
   */
  const extractInformationFromMessage = (message: string): Partial<CollectedInfo> => {
    // Use the comprehensive travel request parser
    const { parseTravelRequest, extractPassengers, extractPreferences } = require('@/lib/ai/travel-request-parser');
    const parsed = parseTravelRequest(message);

    const extracted: Partial<CollectedInfo> = {};
    const lowerMsg = message.toLowerCase();

    // Extract service type
    if (lowerMsg.includes('flight') || lowerMsg.includes('fly')) {
      extracted.serviceType = 'flight';
    } else if (lowerMsg.includes('hotel') || lowerMsg.includes('stay')) {
      extracted.serviceType = 'hotel';
    } else if (lowerMsg.includes('package') || lowerMsg.includes('vacation package')) {
      extracted.serviceType = 'package';
    }

    // Extract trip type
    if (lowerMsg.includes('vacation') || lowerMsg.includes('holiday')) {
      extracted.tripType = 'vacation';
    } else if (lowerMsg.includes('business') || lowerMsg.includes('work')) {
      extracted.tripType = 'business';
    } else if (lowerMsg.includes('family')) {
      extracted.tripType = 'family';
    } else if (lowerMsg.includes('romantic') || lowerMsg.includes('honeymoon')) {
      extracted.tripType = 'romantic';
    }

    // Use parsed results from comprehensive parser
    if (parsed.origin && parsed.confidence.origin > 0.5) {
      extracted.origin = parsed.origin;
    }

    if (parsed.destination && parsed.confidence.destination > 0.5) {
      extracted.destination = parsed.destination;
    }

    // Extract dates with comprehensive parser
    if (parsed.departureDate || parsed.returnDate) {
      extracted.dates = {
        departure: parsed.departureDate || '',
        return: parsed.returnDate,
        flexible: false,
      };
    }

    // Extract passengers
    if (parsed.passengers) {
      extracted.travelers = parsed.passengers;
    }

    // Extract preferences
    if (parsed.preferences) {
      extracted.preferences = {
        directFlights: parsed.preferences.directFlights,
        specialRequirements: [],
      };

      // Add bag requirement to special requirements
      if (parsed.preferences.includeBags) {
        extracted.preferences.specialRequirements?.push('checked baggage included');
      }
    }

    // Extract budget level
    if (parsed.preferences?.cabinClass) {
      extracted.budget = parsed.preferences.cabinClass === 'first' ? 'luxury' :
                        parsed.preferences.cabinClass === 'business' ? 'premium' :
                        'economy';
    } else if (lowerMsg.includes('cheap') || lowerMsg.includes('budget')) {
      extracted.budget = 'economy';
    } else if (lowerMsg.includes('luxury')) {
      extracted.budget = 'luxury';
    }

    return extracted;
  };

  /**
   * AGENT MODE: Main message handler with full agent logic
   */
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

    analytics.trackMessage('user');

    const newConversationCount = userSession.conversationCount + 1;
    setUserSession(prev => ({
      ...prev,
      conversationCount: newConversationCount,
      lastActivity: new Date()
    }));

    // AGENT MODE: Extract information from user message
    const newInfo = extractInformationFromMessage(queryText);
    setExtractedInfo(prev => ({ ...prev, ...newInfo }));

    // AGENT MODE: Update conversation flow
    const updatedFlow = updateConversationFlow(
      conversationFlow,
      queryText,
      newInfo
    );
    setConversationFlow(updatedFlow);

    // Determine consultant
    const consultantTeam = determineConsultantTeam(queryText);
    const consultant = getConsultant(consultantTeam);

    analytics.trackConsultantRouted({
      team: consultant.team,
      name: consultant.name,
    });

    // AGENT MODE: Determine what to do next based on flow
    if (updatedFlow.suggestedAction === 'search' && canProceedToSearch(updatedFlow)) {
      // ENOUGH INFO - TAKE ACTION!
      await executeAgentSearch(updatedFlow, consultant, queryText);
    } else if (updatedFlow.suggestedAction === 'guide') {
      // GUIDE USER TO DECISION
      const guidanceMessage = getGuidanceMessage(updatedFlow, consultant);
      await sendAIResponseWithTyping(guidanceMessage, consultant, queryText);
    } else if (updatedFlow.suggestedAction === 'clarify') {
      // NEEDS CLARIFICATION
      const clarificationMessage = "I want to make sure I understand correctly. Could you provide a bit more detail?";
      await sendAIResponseWithTyping(clarificationMessage, consultant, queryText);
    } else {
      // ASK NEXT QUESTION
      await askNextQuestion(updatedFlow, consultant, queryText);
    }

    // AGENT MODE: Generate proactive suggestions
    const suggestionContext: SuggestionContext = {
      searchParams: {
        origin: updatedFlow.collectedInfo.origin,
        destination: updatedFlow.collectedInfo.destination,
        departureDate: updatedFlow.collectedInfo.dates?.departure,
        returnDate: updatedFlow.collectedInfo.dates?.return,
      },
      conversationHistory: messages.map(m => ({
        role: m.role === 'user' ? 'user' as const : 'agent' as const,
        content: m.content,
        timestamp: m.timestamp
      })),
      currentDate: new Date(),
      sessionData: {
        stage: updatedFlow.currentStage === 'searching' ? 'search' : 'results'
      }
    };

    const suggestions = generateSuggestions(suggestionContext);
    if (suggestions.length > 0) {
      setActiveSuggestions(suggestions.slice(0, 2)); // Max 2 at a time
    }
  };

  /**
   * AGENT MODE: Ask next question based on conversation flow
   */
  const askNextQuestion = async (
    flow: ConversationFlow,
    consultant: ReturnType<typeof getConsultant>,
    userMessage: string
  ) => {
    const missingInfo = getMissingInfo(flow);

    if (missingInfo.length === 0) {
      // All info collected - ready to search
      const readyMessage = "Perfect! I have all the information I need. Let me search for the best options for you right now!";
      await sendAIResponseWithTyping(readyMessage, consultant, userMessage);
      return;
    }

    // Get next question from question bank
    const nextField = missingInfo[0];
    let question: string;

    switch (nextField) {
      case 'serviceType':
        question = getRandomQuestion(discoveryQuestions.tripType);
        break;
      case 'destination':
        question = getRandomQuestion(discoveryQuestions.destination);
        break;
      case 'origin':
        question = getRandomQuestion(discoveryQuestions.origin);
        break;
      case 'dates':
        question = getRandomQuestion(discoveryQuestions.dates);
        break;
      case 'travelers':
        question = getRandomQuestion(discoveryQuestions.travelers);
        break;
      case 'budget':
        question = getRandomQuestion(discoveryQuestions.budget);
        break;
      default:
        question = "What else can you tell me about your trip?";
    }

    // Add follow-up if we just collected something
    const lastCollectedKeys = Object.keys(extractedInfo);
    if (lastCollectedKeys.length > 0) {
      const lastCollected = lastCollectedKeys[lastCollectedKeys.length - 1];
      const followUp = getFollowUpFor(lastCollected, flow.collectedInfo);
      if (followUp) {
        question = followUp;
      }
    }

    await sendAIResponseWithTyping(question, consultant, userMessage);
  };

  /**
   * AGENT MODE: Execute autonomous search
   */
  const executeAgentSearch = async (
    flow: ConversationFlow,
    consultant: ReturnType<typeof getConsultant>,
    userMessage: string
  ) => {
    // ANNOUNCE ACTION
    const announcement = `Perfect! Let me search for flights from ${flow.collectedInfo.origin || 'your city'} to ${flow.collectedInfo.destination} right now! ✈️`;
    await sendAIResponseWithTyping(announcement, consultant, userMessage);

    // CREATE ACTION
    const plan = planActions(`find flights from ${flow.collectedInfo.origin} to ${flow.collectedInfo.destination}`, {
      sessionId: userSession.sessionId,
    });

    setCurrentActionPlan(plan);

    const firstAction = getNextAction(plan);
    if (!firstAction) return;

    setCurrentAction(firstAction);
    setIsSearchingFlights(true);

    // EXECUTE SEARCH
    try {
      const searchStartTime = Date.now();

      const response = await fetch('/api/ai/search-flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userMessage,
          origin: flow.collectedInfo.origin,
          destination: flow.collectedInfo.destination,
          language
        })
      });

      const data = await response.json();
      const searchDuration = Date.now() - searchStartTime;

      setIsSearchingFlights(false);

      analytics.trackFlightSearch({
        searchQuery: userMessage,
        origin: data.origin,
        destination: data.destination,
        resultsCount: data.flights?.length || 0,
        searchDuration,
      });

      if (data.success && data.flights && data.flights.length > 0) {
        // SUCCESS - PRESENT RESULTS WITH GUIDANCE
        const updatedAction = updateActionStatus(firstAction, 'completed', data.flights);
        setCurrentAction(updatedAction);

        await presentResultsWithGuidance(data.flights, flow, consultant, userMessage);
      } else {
        // NO RESULTS - AGENT HANDLES GRACEFULLY
        const updatedAction = updateActionStatus(firstAction, 'failed', undefined, 'No results found');
        setCurrentAction(updatedAction);

        const noResultsMessage = "Hmm, I'm not finding exact matches for those dates. Would you like me to check nearby dates or alternative airports? I can often find better deals that way!";
        await sendAIResponseWithTyping(noResultsMessage, consultant, userMessage);
      }
    } catch (error) {
      // ERROR - AGENT HANDLES FAILURE
      setIsSearchingFlights(false);
      if (currentAction) {
        const updatedAction = updateActionStatus(currentAction, 'failed', undefined, 'Search failed');
        setCurrentAction(updatedAction);
      }

      const errorMessage = "I'm having trouble searching right now. Let me try a different approach - would you like me to check alternative dates or airports?";
      await sendAIResponseWithTyping(errorMessage, consultant, userMessage);
    } finally {
      setCurrentAction(null);
    }
  };

  /**
   * AGENT MODE: Present results with guidance
   */
  const presentResultsWithGuidance = async (
    flights: any[],
    flow: ConversationFlow,
    consultant: ReturnType<typeof getConsultant>,
    userMessage: string
  ) => {
    const resultsMessage = `Great news! I found ${flights.length} excellent options for you! 🎉\n\nLet me show you the top 3:`;

    const cheapest = flights.reduce((min, f) =>
      parseFloat(f.price?.amount || '9999') < parseFloat(min.price?.amount || '9999') ? f : min
    );

    const guidanceMessage = `💡 Quick tip: Option ${flights.indexOf(cheapest) + 1} is the best value - great price and good times!\n\nWhich option works best for you? Or would you like me to narrow down the choices?`;

    await sendMultipleAIResponses([
      {
        content: resultsMessage,
        additionalData: { flightResults: flights.slice(0, 3) }
      },
      {
        content: guidanceMessage
      }
    ], consultant, userMessage);
  };

  /**
   * Get guidance message based on flow
   */
  const getGuidanceMessage = (
    flow: ConversationFlow,
    consultant: ReturnType<typeof getConsultant>
  ): string => {
    if (flow.context.optionsPresented) {
      return "Based on what you told me, I recommend option 2 - it's the best balance of price and convenience. Would you like me to add it to your cart?";
    }
    return "Let me help you choose the best option. What's most important to you - price, travel time, or comfort?";
  };

  /**
   * Handle suggestion action
   */
  const handleSuggestionAction = async (suggestion: Suggestion) => {
    // Mark suggestion as used
    setActiveSuggestions(prev => prev.filter(s => s.id !== suggestion.id));

    // Handle different actions
    if (suggestion.action?.type === 'show-flexible-dates') {
      setInputMessage("Show me flexible dates");
      inputRef.current?.focus();
    } else if (suggestion.action?.type === 'compare-options') {
      setInputMessage("Compare these options");
      inputRef.current?.focus();
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
              {/* Agent Progress Bar */}
              {conversationFlow.currentStage !== 'greeting' && (
                <div className="px-4 pt-3 pb-2 bg-gray-50 border-b">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-600">
                      Gathering trip details
                    </span>
                    <span className="text-xs text-gray-500">
                      {getProgressPercentage(conversationFlow)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-primary-600 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${getProgressPercentage(conversationFlow)}%` }}
                    />
                  </div>
                  {conversationFlow.collectedInfo.destination && (
                    <p className="text-xs text-gray-500 mt-1">
                      {generateCollectedInfoSummary(conversationFlow.collectedInfo)}
                    </p>
                  )}
                </div>
              )}

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
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

                    <div className="flex flex-col gap-1 max-w-[75%]">
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

                {/* Proactive Suggestions */}
                {activeSuggestions.length > 0 && (
                  <div className="space-y-2">
                    {activeSuggestions.map((suggestion, i) => (
                      <div key={i} className="bg-amber-50 border border-amber-200 rounded-lg p-3 animate-fadeIn">
                        <div className="flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm text-amber-900">
                              {suggestion.message}
                            </p>
                            {suggestion.action && (
                              <button
                                onClick={() => handleSuggestionAction(suggestion)}
                                className="mt-2 text-xs text-amber-700 hover:text-amber-900 font-medium"
                              >
                                {suggestion.action.label} →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Agent Action in Progress */}
                {currentAction && currentAction.status === 'executing' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          {currentAction.description}
                        </p>
                        <p className="text-xs text-blue-600">
                          Comparing prices across airlines...
                        </p>
                      </div>
                    </div>
                  </div>
                )}

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
                              {language === 'en' ? 'Thinking...' : language === 'pt' ? 'Pensando...' : 'Pensando...'}
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
 * Determine which consultant team should respond
 */
function determineConsultantTeam(userMessage: string): TeamType {
  const msg = userMessage.toLowerCase();

  if (msg.includes('flight') || msg.includes('fly') || msg.includes('ticket') || msg.includes('airline') || msg.includes('airport')) {
    return 'flight-operations';
  }

  if (msg.includes('hotel') || msg.includes('accommodation') || msg.includes('stay') ||
      msg.includes('room') || msg.includes('resort')) {
    return 'hotel-accommodations';
  }

  if (msg.includes('payment') || msg.includes('card') || msg.includes('refund') || msg.includes('charge')) {
    return 'payment-billing';
  }

  if (msg.includes('cancel') || msg.includes('rights') ||
      msg.includes('compensation') || msg.includes('refund') || msg.includes('policy')) {
    return 'legal-compliance';
  }

  if (msg.includes('insurance') || msg.includes('coverage') ||
      msg.includes('claim')) {
    return 'travel-insurance';
  }

  if (msg.includes('visa') || msg.includes('passport') ||
      msg.includes('document')) {
    return 'visa-documentation';
  }

  if (msg.includes('car') || msg.includes('rental') ||
      msg.includes('drive')) {
    return 'car-rental';
  }

  if (msg.includes('points') || msg.includes('loyalty') ||
      msg.includes('reward') || msg.includes('miles')) {
    return 'loyalty-rewards';
  }

  if (msg.includes('technical') || msg.includes('error') ||
      msg.includes('bug') || msg.includes('website') || msg.includes('app')) {
    return 'technical-support';
  }

  if (msg.includes('wheelchair') || msg.includes('disability') || msg.includes('special need') ||
      msg.includes('accessible') || msg.includes('diet') || msg.includes('child')) {
    return 'special-services';
  }

  if (msg.includes('emergency') || msg.includes('urgent') || msg.includes('help') || msg.includes('lost')) {
    return 'crisis-management';
  }

  return 'customer-service';
}
