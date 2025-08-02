'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  UserIcon,
  SparklesIcon,
  PhoneIcon,
  AtSymbolIcon,
  DocumentTextIcon,
  StarIcon,
  GlobeAltIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import LeadCaptureSimple from './LeadCaptureSimple';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  type?: 'text' | 'quick_reply' | 'form' | 'transfer';
  metadata?: {
    buttons?: Array<{
      text: string;
      action: string;
      data?: any;
    }>;
    form?: {
      type: 'contact' | 'quote';
      fields: Array<{
        name: string;
        label: string;
        type: string;
        required?: boolean;
      }>;
    };
  };
}

interface ChatSession {
  id: string;
  userId: string;
  status: 'active' | 'waiting' | 'closed';
  messages: Message[];
  metadata: {
    userInfo?: {
      name?: string;
      email?: string;
      phone?: string;
    };
    intent?: string;
    transferReason?: string;
  };
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    content: '🛫 Olá! Eu sou a Ana, especialista em viagens da Fly2Any. Como posso ajudar você hoje?',
    sender: 'agent',
    timestamp: new Date(),
    type: 'quick_reply',
    metadata: {
      buttons: [
        { text: '✈️ Voos', action: 'quote_flight', data: { type: 'flight' } },
        { text: '🏨 Hotéis', action: 'quote_hotel', data: { type: 'hotel' } },
        { text: '🚗 Aluguel de Carros', action: 'quote_car', data: { type: 'car' } },
        { text: '🎯 Passeios', action: 'quote_tours', data: { type: 'tours' } },
        { text: '🛡️ Seguro Viagem', action: 'quote_insurance', data: { type: 'insurance' } },
        { text: '📋 Outros', action: 'other_services', data: { type: 'other' } }
      ]
    }
  }
];

export default function ChatAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [userInfo, setUserInfo] = useState<{ name?: string; email?: string; phone?: string }>({});
  const [showContactForm, setShowContactForm] = useState(false);
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [chatMode, setChatMode] = useState<'basic' | 'premium'>('premium');
  const [language, setLanguage] = useState<'pt' | 'en' | 'es'>('pt');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [chatHistory, setChatHistory] = useState<Message[][]>([]);
  const [currentConversation, setCurrentConversation] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (content: string, metadata?: any) => {
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      content,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    try {
      // Send to AI API
      const response = await fetch('/api/chat/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          message: content,
          metadata,
          userInfo,
          context: {
            page: window.location.pathname,
            previousMessages: messages.slice(-5) // Last 5 messages for context
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const agentMessage: Message = {
          id: `agent_${Date.now()}`,
          content: data.response.content,
          sender: 'agent',
          timestamp: new Date(),
          type: data.response.type || 'text',
          metadata: data.response.metadata
        };

        setMessages(prev => [...prev, agentMessage]);

        // Handle special actions
        if (data.response.action) {
          handleAgentAction(data.response.action, data.response.data);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        content: 'Desculpe, houve um problema. Você pode tentar novamente ou falar com um de nossos especialistas.',
        sender: 'agent',
        timestamp: new Date(),
        type: 'quick_reply',
        metadata: {
          buttons: [
            { text: '📞 Ligar Agora', action: 'call_now' },
            { text: '📱 WhatsApp', action: 'whatsapp' }
          ]
        }
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickReply = (button: { text: string; action: string; data?: any }) => {
    sendMessage(button.text, { action: button.action, data: button.data });
  };

  const handleAgentAction = (action: string, data?: any) => {
    switch (action) {
      case 'show_contact_form':
        setShowContactForm(true);
        break;
      case 'show_lead_capture':
        setShowLeadCapture(true);
        break;
      case 'redirect_quote':
        window.location.href = `/cotacao/${data.type}`;
        break;
      case 'transfer_human':
        handleTransferToHuman();
        break;
      case 'call_now':
        window.open('tel:+551151944717');
        break;
      case 'whatsapp':
        window.open('https://wa.me/551151944717?text=Olá, vim do site da Fly2Any e gostaria de falar com um atendente sobre cotações de viagem.');
        break;
      case 'change_language':
        setLanguage(data.language);
        break;
      case 'toggle_mode':
        setChatMode(prev => prev === 'basic' ? 'premium' : 'basic');
        break;
      case 'new_conversation':
        startNewConversation();
        break;
      case 'save_conversation':
        saveCurrentConversation();
        break;
    }
  };

  const handleTransferToHuman = async () => {
    try {
      // Create support ticket
      await fetch('/api/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          userInfo,
          messages: messages.slice(-10), // Last 10 messages
          source: 'chat_agent',
          priority: 'normal',
          department: 'sales'
        })
      });

      // Send notification via N8N webhook
      await fetch('/api/webhooks/n8n/new-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'human_transfer',
          sessionId,
          userInfo,
          timestamp: new Date().toISOString()
        })
      });

      const transferMessage: Message = {
        id: `transfer_${Date.now()}`,
        content: '👨‍💼 Transferindo você para um especialista humano. Em instantes alguém da nossa equipe entrará em contato!',
        sender: 'agent',
        timestamp: new Date(),
        type: 'quick_reply',
        metadata: {
          buttons: [
            { text: '📞 Prefiro Ligação', action: 'call_now' },
            { text: '📱 Prefiro WhatsApp', action: 'whatsapp' }
          ]
        }
      };
      
      setMessages(prev => [...prev, transferMessage]);
    } catch (error) {
      console.error('Transfer error:', error);
    }
  };

  const handleContactFormSubmit = async (formData: { name: string; email: string; phone: string }) => {
    setUserInfo(formData);
    setShowContactForm(false);
    
    // Send user info to agent
    sendMessage(`Meus dados: ${formData.name}, ${formData.email}, ${formData.phone}`, {
      action: 'update_user_info',
      data: formData
    });
  };

  const startNewConversation = () => {
    // Save current conversation
    if (messages.length > 1) {
      setChatHistory(prev => [...prev, messages]);
    }
    
    // Start new conversation
    setMessages(INITIAL_MESSAGES);
    setCurrentConversation(prev => prev + 1);
  };

  const saveCurrentConversation = () => {
    if (messages.length > 1) {
      setChatHistory(prev => [...prev, messages]);
      
      // Save to localStorage
      localStorage.setItem(`chat_history_${sessionId}`, JSON.stringify(chatHistory));
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (!isMinimized) {
      setUnreadCount(0);
    }
  };

  const getLanguageText = (key: string) => {
    const texts = {
      pt: {
        title: 'Ana - Especialista Fly2Any',
        subtitle: 'Online agora',
        placeholder: 'Digite sua mensagem...',
        send: 'Enviar',
        minimize: 'Minimizar',
        newConversation: 'Nova Conversa',
        saveConversation: 'Salvar Conversa',
        changeLanguage: 'Idioma',
        chatMode: 'Modo Chat'
      },
      en: {
        title: 'Ana - Travel Specialist',
        subtitle: 'Online now',
        placeholder: 'Type your message...',
        send: 'Send',
        minimize: 'Minimize',
        newConversation: 'New Conversation',
        saveConversation: 'Save Conversation',
        changeLanguage: 'Language',
        chatMode: 'Chat Mode'
      },
      es: {
        title: 'Ana - Asistente Fly2Any',
        subtitle: 'En línea ahora',
        placeholder: 'Escribe tu mensaje...',
        send: 'Enviar',
        minimize: 'Minimizar',
        newConversation: 'Nueva Conversación',
        saveConversation: 'Guardar Conversación',
        changeLanguage: 'Idioma',
        chatMode: 'Modo Chat'
      }
    };
    return (texts as any)[language][key] || (texts as any).pt[key];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentMessage.trim()) {
      sendMessage(currentMessage.trim());
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[70] p-5 rounded-full shadow-xl transition-all duration-300 transform hover:scale-110 ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600 w-16 h-16' 
            : chatMode === 'premium' 
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-20 h-20' 
              : 'bg-blue-600 hover:bg-blue-700 w-18 h-18'
        } text-white relative group`}
      >
        {isOpen ? (
          <XMarkIcon className="w-8 h-8" />
        ) : (
          <ChatBubbleLeftRightIcon className="w-8 h-8" />
        )}
        
        {!isOpen && (
          <>
            {/* Premium Badge */}
            {chatMode === 'premium' && (
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                <StarIcon className="w-2 h-2 text-yellow-800" />
              </div>
            )}
            
            {/* Online Indicator */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            
            {/* Unread Messages */}
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold">{unreadCount}</span>
              </div>
            )}
          </>
        )}
        
        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            {chatMode === 'premium' ? '🌟 Chat Premium' : '💬 Chat de Atendimento'}
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div 
          className={`fixed bottom-24 right-6 w-[450px] bg-white rounded-xl shadow-2xl border-2 border-gray-200 flex flex-col z-[60] transition-all duration-300 ${
            isMinimized ? 'h-20' : 'h-[700px]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{getLanguageText('title')}</h3>
                <p className="text-sm text-blue-100 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  {getLanguageText('subtitle')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Premium Features */}
              {chatMode === 'premium' && (
                <>
                  {/* Language Selector */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        const languages = ['pt', 'en', 'es'];
                        const currentIndex = languages.indexOf(language);
                        const nextIndex = (currentIndex + 1) % languages.length;
                        setLanguage(languages[nextIndex] as 'pt' | 'en' | 'es');
                      }}
                      className="text-blue-200 hover:text-white p-1 rounded"
                      title={getLanguageText('changeLanguage')}
                    >
                      <GlobeAltIcon className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* New Conversation */}
                  <button
                    onClick={startNewConversation}
                    className="text-blue-200 hover:text-white p-1 rounded"
                    title={getLanguageText('newConversation')}
                  >
                    <DocumentTextIcon className="w-4 h-4" />
                  </button>
                  
                  {/* Save Conversation */}
                  <button
                    onClick={saveCurrentConversation}
                    className="text-blue-200 hover:text-white p-1 rounded"
                    title={getLanguageText('saveConversation')}
                  >
                    <StarIcon className="w-4 h-4" />
                  </button>
                  
                  {/* Notifications */}
                  {unreadCount > 0 && (
                    <div className="relative">
                      <BellIcon className="w-4 h-4 text-yellow-300" />
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    </div>
                  )}
                </>
              )}
              
              {/* Minimize/Maximize */}
              <button
                onClick={toggleMinimize}
                className="text-blue-200 hover:text-white p-1 rounded"
                title={getLanguageText('minimize')}
              >
                {isMinimized ? (
                  <div className="w-4 h-4 border-2 border-current" />
                ) : (
                  <div className="w-4 h-4 border-2 border-current border-b-0" />
                )}
              </button>
              
              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                className="text-blue-200 hover:text-white p-1 rounded"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-800 shadow-sm border'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-blue-200' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>

                  {/* Quick Reply Buttons */}
                  {message.type === 'quick_reply' && message.metadata?.buttons && (
                    <div className="mt-3 space-y-2">
                      {message.metadata.buttons.map((button, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickReply(button)}
                          className="block w-full text-left p-2 text-sm bg-blue-50 hover:bg-blue-100 rounded border text-blue-700 transition-colors"
                        >
                          {button.text}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 p-3 rounded-lg shadow-sm border">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input */}
          {!isMinimized && (
            <div className="p-4 border-t bg-white rounded-b-lg">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder={getLanguageText('placeholder')}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!currentMessage.trim() || isTyping}
                  className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg"
                  title={getLanguageText('send')}
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </form>
              
              {/* Premium Quick Actions */}
              {chatMode === 'premium' && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowLeadCapture(true)}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-xs hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-md font-medium"
                  >
                    🎯 Cotação Completa
                  </button>
                  <button
                    onClick={() => handleAgentAction('transfer_human')}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-xs hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 shadow-md font-medium"
                  >
                    👨‍💼 Falar com Humano
                  </button>
                  <button
                    onClick={() => handleAgentAction('whatsapp')}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full text-xs hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 shadow-md font-medium"
                  >
                    📱 WhatsApp
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-semibold mb-4">Seus Dados para Contato</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleContactFormSubmit({
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                phone: formData.get('phone') as string
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone/WhatsApp
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="flex-1 p-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Continuar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lead Capture Modal */}
      <LeadCaptureSimple
        isOpen={showLeadCapture}
        onClose={() => setShowLeadCapture(false)}
        context="chat"
      />
    </>
  );
}