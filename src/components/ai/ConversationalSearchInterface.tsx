/**
 * Conversational Search Interface with GPT-4 Integration
 * Revolutionary natural language flight search that understands context and intent
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MicrophoneIcon, 
  PaperAirplaneIcon, 
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { gpt4TravelAssistant } from '@/lib/ai/gpt4-travel-assistant';
import { ProcessedFlightOffer } from '@/types/flights';
import FlightResultsList from '@/components/flights/FlightResultsList';

interface ConversationMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  suggestions?: FlightSuggestion[];
  quickActions?: QuickAction[];
  attachments?: MessageAttachment[];
  confidence?: number;
}

interface FlightSuggestion {
  flight: ProcessedFlightOffer;
  reason: string;
  confidence: number;
  highlights: string[];
}

interface QuickAction {
  id: string;
  label: string;
  action: string;
  icon?: React.ComponentType<any>;
  data?: any;
}

interface MessageAttachment {
  type: 'flight_comparison' | 'price_chart' | 'route_map' | 'weather_info';
  data: any;
  title: string;
}

interface ConversationalSearchProps {
  onFlightSelect?: (flight: ProcessedFlightOffer) => void;
  onSearchUpdate?: (searchParams: any) => void;
  className?: string;
  userId?: string;
}

const SUGGESTED_PROMPTS = [
  {
    text: "Find me a cheap flight to Europe next month",
    icon: CurrencyDollarIcon,
    category: "Budget Travel"
  },
  {
    text: "I need a business trip to New York this Friday",
    icon: ClockIcon,
    category: "Business"
  },
  {
    text: "Plan a family vacation to Disney World",
    icon: MapPinIcon,
    category: "Family"
  },
  {
    text: "Show me flexible dates for the best prices",
    icon: CalendarDaysIcon,
    category: "Flexible"
  }
];

export default function ConversationalSearchInterface({
  onFlightSelect,
  onSearchUpdate,
  className = '',
  userId
}: ConversationalSearchProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your AI travel assistant. I can help you find flights, plan trips, and get the best deals. Just tell me what you're looking for in natural language - like 'I need a cheap flight to Paris next week' or 'Find me business class to Tokyo with flexible dates'.",
      timestamp: new Date(),
      quickActions: [
        { id: 'budget', label: 'Find Budget Flights', action: 'budget_search', icon: CurrencyDollarIcon },
        { id: 'flexible', label: 'Flexible Dates', action: 'flexible_search', icon: CalendarDaysIcon },
        { id: 'business', label: 'Business Travel', action: 'business_search', icon: ClockIcon },
        { id: 'family', label: 'Family Trip', action: 'family_search', icon: MapPinIcon }
      ]
    }
  ]);
  
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognition = useRef<any | null>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-US';

      recognition.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCurrentInput(transcript);
        setIsListening(false);
      };

      recognition.current.onerror = () => {
        setIsListening(false);
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = useCallback(async (message?: string) => {
    const messageToSend = message || currentInput.trim();
    if (!messageToSend || isLoading) return;

    const userMessage: ConversationMessage = {
      id: `msg_${Date.now()}`,
      type: 'user',
      content: messageToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsLoading(true);

    try {
      // Process with GPT-4 Travel Assistant
      const response = await gpt4TravelAssistant.processConversation(
        sessionId,
        messageToSend,
        userId
      );

      const assistantMessage: ConversationMessage = {
        id: `msg_${Date.now()}_ai`,
        type: 'assistant',
        content: response.conversationalResponse,
        timestamp: new Date(),
        confidence: response.confidence,
        suggestions: response.flightSuggestions.map(flight => ({
          flight,
          reason: 'AI-recommended based on your preferences',
          confidence: 0.8,
          highlights: ['Best Value', 'Popular Choice']
        })),
        quickActions: generateQuickActions(response),
        attachments: generateAttachments(response)
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update search parameters if applicable
      if (response.flightSuggestions.length > 0 && onSearchUpdate) {
        onSearchUpdate({
          hasResults: true,
          flights: response.flightSuggestions
        });
      }

    } catch (error) {
      console.error('Conversation error:', error);
      
      const errorMessage: ConversationMessage = {
        id: `msg_${Date.now()}_error`,
        type: 'assistant',
        content: "I'm sorry, I encountered an issue processing your request. Let me try a different approach or you can rephrase your question.",
        timestamp: new Date(),
        quickActions: [
          { id: 'retry', label: 'Try Again', action: 'retry' },
          { id: 'human', label: 'Talk to Human', action: 'human_support' }
        ]
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [currentInput, isLoading, sessionId, userId, onSearchUpdate]);

  const handleVoiceSearch = useCallback(() => {
    if (!recognition.current) {
      alert('Voice search is not supported in your browser');
      return;
    }

    if (isListening) {
      recognition.current.stop();
      setIsListening(false);
    } else {
      recognition.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  const handleQuickAction = useCallback(async (action: string, data?: any) => {
    const actionMessages: { [key: string]: string } = {
      budget_search: "Show me the cheapest flights available",
      flexible_search: "I have flexible dates, find me the best deals",
      business_search: "I need flights for a business trip",
      family_search: "Help me plan a family vacation",
      retry: currentInput || "Please try my last request again"
    };

    const message = actionMessages[action];
    if (message) {
      await handleSendMessage(message);
    }
  }, [handleSendMessage, currentInput]);

  const handleSuggestedPrompt = useCallback(async (prompt: string) => {
    await handleSendMessage(prompt);
  }, [handleSendMessage]);

  const generateQuickActions = (response: any): QuickAction[] => {
    const actions: QuickAction[] = [];

    if (response.flightSuggestions?.length > 0) {
      actions.push(
        { id: 'view_all', label: 'View All Flights', action: 'view_flights' },
        { id: 'refine', label: 'Refine Search', action: 'refine_search' }
      );
    }

    if (response.nextSteps?.length > 0) {
      response.nextSteps.slice(0, 2).forEach((step: string, index: number) => {
        actions.push({
          id: `step_${index}`,
          label: step,
          action: 'execute_step',
          data: { step }
        });
      });
    }

    return actions;
  };

  const generateAttachments = (response: any): MessageAttachment[] => {
    const attachments: MessageAttachment[] = [];

    if (response.flightSuggestions?.length > 3) {
      attachments.push({
        type: 'flight_comparison',
        data: { flights: response.flightSuggestions.slice(0, 3) },
        title: 'Top Flight Recommendations'
      });
    }

    return attachments;
  };

  const renderMessage = (message: ConversationMessage) => (
    <motion.div
      key={message.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-6`}
    >
      <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
        {/* Avatar */}
        <div className={`flex items-center mb-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            message.type === 'user' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
          }`}>
            {message.type === 'user' ? (
              <span className="text-sm font-medium">You</span>
            ) : (
              <SparklesIcon className="w-4 h-4" />
            )}
          </div>
          {message.confidence && (
            <div className="ml-2 text-xs text-gray-500">
              {Math.round(message.confidence * 100)}% confident
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className={`rounded-2xl px-4 py-3 ${
          message.type === 'user'
            ? 'bg-blue-500 text-white'
            : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
        }`}>
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Flight Suggestions */}
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Recommended Flights</h4>
            <div className="space-y-2">
              {message.suggestions.slice(0, 3).map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onFlightSelect?.(suggestion.flight)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900">
                        {suggestion.flight.outbound.departure.iataCode} → {suggestion.flight.outbound.arrival.iataCode}
                      </div>
                      <div className="text-sm text-gray-600">
                        {suggestion.flight.outbound.departure.time} - {suggestion.flight.outbound.arrival.time}
                      </div>
                      <div className="text-xs text-blue-600 mt-1">{suggestion.reason}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-gray-900">{suggestion.flight.totalPrice}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {suggestion.highlights.map((highlight, idx) => (
                          <span key={idx} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {message.quickActions && message.quickActions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.action, action.data)}
                  className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                >
                  {IconComponent && <IconComponent className="w-4 h-4 mr-1" />}
                  {action.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-4">
            {message.attachments.map((attachment, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <h5 className="font-medium text-gray-900 mb-2">{attachment.title}</h5>
                {attachment.type === 'flight_comparison' && onFlightSelect && (
                  <FlightResultsList 
                    offers={attachment.data.flights || []} 
                    onOfferSelect={onFlightSelect}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-3">
              <h2 className="text-lg font-semibold text-gray-900">AI Travel Assistant</h2>
              <p className="text-sm text-gray-500">Powered by GPT-4 + Amadeus AI</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 1 && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Try these suggestions:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SUGGESTED_PROMPTS.map((prompt, index) => {
                const IconComponent = prompt.icon;
                return (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleSuggestedPrompt(prompt.text)}
                    className="text-left p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center mb-2">
                      <IconComponent className="w-5 h-5 text-blue-500 mr-2" />
                      <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                        {prompt.category}
                      </span>
                    </div>
                    <p className="text-gray-700">{prompt.text}</p>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {messages.map(renderMessage)}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start mb-6"
          >
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500 ml-2">AI is thinking...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me anything about flights... (e.g., 'Find me a cheap flight to Paris next week')"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>
          
          <button
            onClick={handleVoiceSearch}
            className={`p-3 rounded-xl transition-colors ${
              isListening 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
            disabled={isLoading}
          >
            <MicrophoneIcon className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => handleSendMessage()}
            disabled={!currentInput.trim() || isLoading}
            className="p-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-xl transition-colors"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Voice indicator */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 text-center"
            >
              <div className="inline-flex items-center space-x-2 text-red-500">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm">Listening...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}