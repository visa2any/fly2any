'use client';

/**
 * Unified Chat Widget for Fly2Any Platform
 * Complete chat interface for AI assistant with all platform capabilities
 */

import React, { useState, useEffect, useRef } from 'react';
import { XIcon, PlusIcon, CheckIcon, UserIcon } from '@/components/Icons';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  attachments?: ChatAttachment[];
  actions?: ChatAction[];
}

interface ChatAttachment {
  type: 'flight_offer' | 'hotel_offer' | 'booking_details' | 'price_comparison';
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

interface UnifiedChatWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
  userId?: string;
  initialMessage?: string;
  className?: string;
}

export default function UnifiedChatWidget({
  isOpen,
  onToggle,
  userId,
  initialMessage,
  className = ''
}: UnifiedChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize chat with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'assistant',
        content: `Hello! 👋 I'm the Fly2Any assistant. I can help you with:

✈️ **Search and book flights**
🏨 **Find hotels**  
📋 **Check your reservations**
💬 **Specialized support**
🎯 **Compare prices in real-time**

How can I help you today?`,
        timestamp: new Date(),
        actions: [
          {
            id: 'search_flights',
            type: 'get_quote',
            label: 'Search flights',
            data: { type: 'flight' },
            primary: true
          },
          {
            id: 'search_hotels',
            type: 'get_quote',
            label: 'Search hotels',
            data: { type: 'hotel' }
          },
          {
            id: 'check_booking',
            type: 'get_quote',
            label: 'My reservations',
            data: { type: 'booking_status' }
          },
          {
            id: 'get_help',
            type: 'get_quote',
            label: 'I need help',
            data: { type: 'support' }
          }
        ]
      };
      
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle initial message
  useEffect(() => {
    if (initialMessage && isOpen) {
      handleSendMessage(initialMessage);
    }
  }, [initialMessage, isOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setUnreadCount(0);
    }
  }, [isOpen]);

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputMessage.trim();
    if (!text) return;

    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    // Add user message
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Simulate API call to AI assistant
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          message: text,
          userId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const assistantMessage: ChatMessage = await response.json();
      
      // Simulate typing delay
      setTimeout(() => {
        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);
        setIsLoading(false);
        
        // Add to unread count if chat is closed
        if (!isOpen) {
          setUnreadCount(prev => prev + 1);
        }
      }, 1000 + Math.random() * 1000); // 1-2 seconds

    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        type: 'assistant',
        content: '😔 Desculpe, ocorreu um erro. Vou conectar você com um atendente humano.',
        timestamp: new Date(),
        actions: [
          {
            id: 'human_support',
            type: 'transfer_human',
            label: 'Falar com atendente',
            data: {},
            primary: true
          },
          {
            id: 'try_again',
            type: 'get_quote',
            label: 'Tentar novamente',
            data: {}
          }
        ]
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  const handleActionClick = async (action: ChatAction) => {
    console.log('Action clicked:', action);
    
    try {
      const response = await fetch('/api/chat/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          actionId: action.id,
          actionData: action.data,
          userId
        })
      });

      if (response.ok) {
        const assistantMessage: ChatMessage = await response.json();
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Action error:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.type === 'user';
    
    return (
      <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
          
          {/* Avatar */}
          <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
              isUser ? 'bg-blue-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'
            }`}>
              {isUser ? <UserIcon className="w-4 h-4" /> : '🤖'}
            </div>
            
            <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
              {/* Message bubble */}
              <div className={`px-4 py-3 rounded-2xl max-w-full ${
                isUser 
                  ? 'bg-blue-500 text-white rounded-br-md' 
                  : 'bg-gray-100 text-gray-900 rounded-bl-md'
              }`}>
                <div className="whitespace-pre-wrap break-words">{message.content}</div>
              </div>
              
              {/* Timestamp */}
              <div className="text-xs text-gray-500 mt-1 px-1">
                {message.timestamp.toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              
              {/* Actions */}
              {message.actions && message.actions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 max-w-full">
                  {message.actions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleActionClick(action)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                        action.primary
                          ? 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500'
                          : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-3 space-y-2 max-w-full">
                  {message.attachments.map((attachment, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      {renderAttachment(attachment)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAttachment = (attachment: ChatAttachment) => {
    switch (attachment.type) {
      case 'flight_offer':
        return renderFlightOffers(attachment.data);
      case 'hotel_offer':
        return renderHotelOffers(attachment.data);
      case 'booking_details':
        return renderBookingDetails(attachment.data);
      default:
        return <div className="text-gray-500">Anexo não suportado</div>;
    }
  };

  const renderFlightOffers = (flights: any[]) => (
    <div className="space-y-3">
      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
        ✈️ Melhores voos encontrados
      </h4>
      {flights.slice(0, 3).map((flight, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <div className="text-center">
                  <div className="font-bold">{flight.outbound.departure.time}</div>
                  <div className="text-sm text-gray-600">{flight.outbound.departure.iataCode}</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-sm text-gray-600">{flight.outbound.duration}</div>
                  <div className="text-xs text-gray-500">
                    {flight.outbound.stops === 0 ? 'Direto' : `${flight.outbound.stops} parada(s)`}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-bold">{flight.outbound.arrival.time}</div>
                  <div className="text-sm text-gray-600">{flight.outbound.arrival.iataCode}</div>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {flight.validatingAirlines[0]} • {flight.numberOfBookableSeats} seats available
              </div>
            </div>
            <div className="text-right ml-4">
              <div className="text-xl font-bold text-blue-600">{flight.totalPrice}</div>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View details
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderHotelOffers = (hotels: any[]) => (
    <div className="space-y-3">
      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
        🏨 Melhores hotéis encontrados
      </h4>
      {hotels.slice(0, 3).map((hotel, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h5 className="font-semibold text-gray-900">{hotel.name}</h5>
              <div className="text-sm text-gray-600 mt-1">
                {hotel.location} • ⭐ {hotel.rating}/5
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {hotel.amenities?.slice(0, 3).join(' • ')}
              </div>
            </div>
            <div className="text-right ml-4">
              <div className="text-xl font-bold text-green-600">{hotel.price}</div>
              <div className="text-sm text-gray-600">por noite</div>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-1">
                Ver detalhes
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderBookingDetails = (booking: any) => (
    <div className="space-y-3">
      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
        📋 Resumo da reserva
      </h4>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-semibold text-blue-900">
              {booking.origin} → {booking.destination}
            </div>
            <div className="text-sm text-blue-700 mt-1">
              {booking.departureDate} • {booking.passengers} passageiros
            </div>
            <div className="text-sm text-blue-700">
              {booking.airline} • Classe {booking.class}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-900">{booking.totalPrice}</div>
            <div className="text-sm text-blue-700">Total</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTypingIndicator = () => (
    <div className="flex justify-start mb-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm">
          🤖
        </div>
        <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );

  // Quick suggestions for common queries
  const quickSuggestions = [
    { text: 'Flights to Miami', icon: '✈️' },
    { text: 'Hotels in New York', icon: '🏨' },
    { text: 'Check my reservation', icon: '📋' },
    { text: 'Cancellation help', icon: '❓' }
  ];

  if (!isOpen) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <button
          onClick={onToggle}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 relative"
          aria-label="Abrir chat"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          
          {/* Unread indicator */}
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
          
          {/* Pulse animation for attention */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-ping opacity-20"></div>
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-96 h-[600px] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg">
              🤖
            </div>
            <div>
              <h3 className="font-semibold">Assistente Fly2Any</h3>
              <p className="text-sm opacity-90">Online • Resposta instantânea</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Fechar chat"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {messages.map(renderMessage)}
          {isTyping && renderTypingIndicator()}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick suggestions */}
        {messages.length <= 1 && (
          <div className="px-4 py-2 border-t border-gray-100">
            <div className="text-xs text-gray-500 mb-2">Sugestões rápidas:</div>
            <div className="grid grid-cols-2 gap-2">
              {quickSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(suggestion.text)}
                  className="text-left p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="mr-1">{suggestion.icon}</span>
                  {suggestion.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-end gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className="p-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-2xl transition-colors"
              aria-label="Enviar mensagem"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Powered by */}
          <div className="text-center mt-2">
            <p className="text-xs text-gray-500">
              Powered by Fly2Any AI • Disponível 24/7
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}