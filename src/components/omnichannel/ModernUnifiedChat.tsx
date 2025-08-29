'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ConversationWithDetails, Message } from '@/lib/omnichannel-api';

interface ModernUnifiedChatProps {
  conversationId: number;
  agentId?: number;
  onConversationUpdate?: (conversation: ConversationWithDetails) => void;
}

const ModernUnifiedChat: React.FC<ModernUnifiedChatProps> = ({ 
  conversationId, 
  agentId, 
  onConversationUpdate 
}) => {
  const [conversation, setConversation] = useState<ConversationWithDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId) {
      const fetchData = async (): Promise<void> => {
        await fetchConversation();
      };
      
      fetchData();
      
      // Polling para novas mensagens
      const interval = setInterval(fetchConversation, 3000);
      return () => clearInterval(interval);
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversation = async (): Promise<void> => {
    try {
      const response = await fetch(`/api/omnichannel/conversations/${conversationId}`);
      const data = await response.json();
      
      if (data.success) {
        setConversation(data.conversation);
        setMessages(data.conversation.messages || []);
        
        if (onConversationUpdate) {
          onConversationUpdate(data.conversation);
        }
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (): Promise<void> => {
    if (!newMessage.trim() || !conversation || sending) return;

    setSending(true);
    try {
      const response = await fetch('/api/omnichannel/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          customer_id: conversation.customer.id,
          channel: conversation.channel,
          content: newMessage,
          agent_id: agentId,
          message_type: 'text'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setNewMessage('');
        fetchConversation();
      } else {
        console.error('Error sending message:', data.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const changeConversationStatus = async (status: string) => {
    try {
      const response = await fetch(`/api/omnichannel/conversations/${conversationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          agent_id: agentId
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        fetchConversation();
      }
    } catch (error) {
      console.error('Error updating conversation status:', error);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return '💬';
      case 'email': return '✉️';
      case 'webchat': return '🌐';
      case 'phone': return '📞';
      case 'instagram': return '📸';
      case 'facebook': return '👥';
      default: return '💬';
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return 'bg-green-500';
      case 'email': return 'bg-blue-500';
      case 'webchat': return 'bg-purple-500';
      case 'phone': return 'bg-gray-500';
      case 'instagram': return 'bg-pink-500';
      case 'facebook': return 'bg-blue-600';
      default: return 'bg-gray-500';
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Carregando conversa...</p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-slate-500 text-2xl">❌</span>
          </div>
          <p className="text-slate-600 font-medium">Conversa não encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header Premium */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getChannelColor(conversation.channel)}`}>
              <span className="text-white text-xl">{getChannelIcon(conversation.channel)}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {conversation.customer.name || conversation.customer.phone || 'Cliente'}
              </h3>
              <p className="text-slate-300 text-sm">
                {conversation.customer.phone || conversation.customer.email}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge 
              variant="outline"
              className="bg-white/10 text-white border-white/20"
            >
              {conversation.channel}
            </Badge>
            <Badge 
              variant={conversation.status === 'open' ? 'default' : 'secondary'}
              className={conversation.status === 'open' ? 'bg-green-500' : 'bg-gray-500'}
            >
              {conversation.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
        {messages.map((message, index) => {
          const isNewDay = index === 0 || 
            formatDate(message.created_at) !== formatDate(messages[index - 1].created_at);
          
          return (
            <div key={message.id}>
              {isNewDay && (
                <div className="text-center my-6">
                  <span className="text-xs text-slate-500 bg-white px-4 py-2 rounded-full shadow-sm border">
                    {formatDate(message.created_at)}
                  </span>
                </div>
              )}
              
              <div className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] ${message.direction === 'outbound' ? 'ml-12' : 'mr-12'}`}>
                  <div className={`p-4 rounded-2xl shadow-sm ${
                    message.direction === 'outbound' 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                      : 'bg-white text-slate-900 border border-slate-200'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/20">
                      <span className={`text-xs ${message.direction === 'outbound' ? 'text-blue-100' : 'text-slate-500'}`}>
                        {message.sender_name || (message.direction === 'outbound' ? 'Agente' : 'Cliente')}
                      </span>
                      <span className={`text-xs ${message.direction === 'outbound' ? 'text-blue-100' : 'text-slate-500'}`}>
                        {formatTime(message.created_at)}
                      </span>
                    </div>
                    {message.is_automated && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        🤖 Automático
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Actions Bar */}
      <div className="bg-white border-t border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Button
            onClick={() => changeConversationStatus('open')}
            disabled={conversation.status === 'open'}
            variant={conversation.status === 'open' ? 'default' : 'outline'}
            size="sm"
            className="text-xs"
          >
            ✅ Abrir
          </Button>
          <Button
            onClick={() => changeConversationStatus('pending')}
            disabled={conversation.status === 'pending'}
            variant={conversation.status === 'pending' ? 'default' : 'outline'}
            size="sm"
            className="text-xs"
          >
            ⏳ Pendente
          </Button>
          <Button
            onClick={() => changeConversationStatus('resolved')}
            disabled={conversation.status === 'resolved'}
            variant={conversation.status === 'resolved' ? 'default' : 'outline'}
            size="sm"
            className="text-xs"
          >
            ✅ Resolver
          </Button>
          <Button
            onClick={() => changeConversationStatus('closed')}
            disabled={conversation.status === 'closed'}
            variant={conversation.status === 'closed' ? 'default' : 'outline'}
            size="sm"
            className="text-xs"
          >
            🔒 Fechar
          </Button>
        </div>
        
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Textarea
              value={newMessage}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="min-h-[50px] max-h-[120px] resize-none border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              disabled={conversation.status === 'closed'}
            />
          </div>
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending || conversation.status === 'closed'}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 h-auto"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span className="text-lg">📨</span>
            )}
          </Button>
        </div>
        
        <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
          <span>
            {conversation.unread_count > 0 && (
              <span className="text-red-500 font-medium">
                {conversation.unread_count} mensagem(ns) não lida(s)
              </span>
            )}
          </span>
          <span>
            Última atividade: {conversation.updated_at ? formatTime(conversation.updated_at) : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ModernUnifiedChat;