'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, Clock, ArrowLeft } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Initialize with welcome message
    setMessages([
      {
        id: '1',
        type: 'bot',
        content: '👋 Olá! Sou seu assistente de viagens da Fly2Any. Como posso te ajudar hoje?',
        timestamp: new Date()
      }
    ]);
  }, []);

  const sendMessage = async (): Promise<void> => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: getBotResponse(inputMessage),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    if (input.includes('preço') || input.includes('valor') || input.includes('custo')) {
      return '💰 Os preços variam conforme disponibilidade. Posso te ajudar a encontrar as melhores ofertas! Que destino você tem em mente?';
    }

    if (input.includes('voo') || input.includes('passagem') || input.includes('flight')) {
      return '✈️ Perfeito! Temos as melhores ofertas de voos para o Brasil. Para onde você gostaria de viajar? Miami, São Paulo, Rio de Janeiro, Nova York?';
    }

    if (input.includes('hotel') || input.includes('hospedagem')) {
      return '🏨 Temos uma seleção incrível de hotéis! Em qual cidade você está pensando em se hospedar? Posso sugerir opções com ótimo custo-benefício.';
    }

    if (input.includes('cancelar') || input.includes('cancelamento')) {
      return '🔄 A maioria dos nossos serviços oferece cancelamento flexível. Posso verificar as condições específicas da sua reserva ou cotação.';
    }

    if (input.includes('obrigad') || input.includes('valeu') || input.includes('thanks')) {
      return '😊 Por nada! Estou aqui sempre que precisar. A Fly2Any está aqui para tornar sua viagem inesquecível! ✈️';
    }

    return '🤖 Entendi! Estou aqui para ajudar com voos, hotéis, passeios, seguros e tudo relacionado a viagens. O que mais posso esclarecer?';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.close()}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
              title="Fechar Chat"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Bot size={20} />
            </div>
            <div>
              <h1 className="font-bold text-lg">Fly2Any Assistente</h1>
              <p className="text-sm opacity-90">Especialista em Viagens</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
            <span className="text-sm">Online</span>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto w-full">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="flex items-start gap-2 max-w-xs sm:max-w-md">
              {message.type === 'bot' && (
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot size={16} className="text-white" />
                </div>
              )}

              <div
                className={`p-4 rounded-2xl shadow-md ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white rounded-br-md'
                    : 'bg-white text-gray-900 rounded-bl-md border'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Clock size={10} className="opacity-60" />
                  <span className="text-xs opacity-60">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>

              {message.type === 'user' && (
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <User size={16} className="text-white" />
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-white text-gray-900 p-4 rounded-2xl rounded-bl-md border shadow-md">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem... (Enter para enviar)"
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full p-3 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
              title="Enviar mensagem"
            >
              <Send size={20} />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              '✈️ Consultar voos',
              '🏨 Buscar hotéis',
              '🎒 Pacotes de viagem',
              '💰 Melhores preços'
            ].map((quickAction) => (
              <button
                key={quickAction}
                onClick={() => setInputMessage(quickAction)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors border"
              >
                {quickAction}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}