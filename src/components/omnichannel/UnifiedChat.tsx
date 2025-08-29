'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ConversationWithDetails, Message } from '@/lib/omnichannel-api';
import ResponseTemplates from './ResponseTemplates';

interface UnifiedChatProps {
  conversationId: number;
  agentId?: number;
  onConversationUpdate?: (conversation: ConversationWithDetails) => void;
}

const UnifiedChat: React.FC<UnifiedChatProps> = ({ 
  conversationId, 
  agentId, 
  onConversationUpdate 
}) => {
  const [conversation, setConversation] = useState<ConversationWithDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId) {
      const fetchData = async (): Promise<void> => {
        await fetchConversation();
      };
      
      fetchData();
      
      // Polling para novas mensagens
      const interval = setInterval(fetchConversation, 5000);
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
        fetchConversation(); // Atualizar mensagens
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

  const handleTemplateSelect = (template: { content: string; category: string }) => {
    let content = template.content;
    
    // Substituir variáveis comuns
    if (conversation) {
      content = content.replace(/{nome}/g, conversation.customer.name || 'Cliente');
      content = content.replace(/{email}/g, conversation.customer.email || '');
      content = content.replace(/{telefone}/g, conversation.customer.phone || '');
    }
    
    // Adicionar protocolo se necessário
    if (template.category === 'support') {
      const protocol = `FLY${Date.now().toString().slice(-6)}`;
      content = content.replace(/{protocolo}/g, protocol);
    }
    
    setNewMessage(content);
    setShowTemplates(false);
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return '📱';
      case 'email': return '📧';
      case 'webchat': return '💬';
      case 'phone': return '📞';
      case 'instagram': return '📸';
      case 'facebook': return '👥';
      default: return '💬';
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Conversa não encontrada</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-lg">{getChannelIcon(conversation.channel)}</span>
            <div>
              <h3 className="font-semibold">
                {conversation.customer.name || conversation.customer.phone || 'Cliente'}
              </h3>
              <p className="text-sm text-gray-500">
                {conversation.customer.phone || conversation.customer.email}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {conversation.channel}
            </Badge>
            <Badge 
              variant={conversation.status === 'open' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {conversation.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const isNewDay = index === 0 || 
            formatDate(message.created_at) !== formatDate(messages[index - 1].created_at);
          
          return (
            <div key={message.id}>
              {isNewDay && (
                <div className="text-center my-4">
                  <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {formatDate(message.created_at)}
                  </span>
                </div>
              )}
              
              <div className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  message.direction === 'outbound' 
                    ? 'bg-blue-500 text-white ml-4' 
                    : 'bg-gray-100 text-gray-900 mr-4'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs opacity-70">
                      {message.sender_name || (message.direction === 'outbound' ? 'Agente' : 'Cliente')}
                    </span>
                    <span className="text-xs opacity-70">
                      {formatTime(message.created_at)}
                    </span>
                  </div>
                  {message.is_automated && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      Automático
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-center space-x-2 mb-3">
          <Button
            onClick={() => changeConversationStatus('open')}
            disabled={conversation.status === 'open'}
            variant="outline"
            size="sm"
          >
            Abrir
          </Button>
          <Button
            onClick={() => changeConversationStatus('pending')}
            disabled={conversation.status === 'pending'}
            variant="outline"
            size="sm"
          >
            Pendente
          </Button>
          <Button
            onClick={() => changeConversationStatus('resolved')}
            disabled={conversation.status === 'resolved'}
            variant="outline"
            size="sm"
          >
            Resolver
          </Button>
          <Button
            onClick={() => changeConversationStatus('closed')}
            disabled={conversation.status === 'closed'}
            variant="outline"
            size="sm"
          >
            Fechar
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setShowTemplates(!showTemplates)}
            variant="outline"
            size="sm"
            className="px-3"
          >
            📝
          </Button>
          <Textarea
            value={newMessage}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="flex-1 min-h-[40px] max-h-[100px] resize-none"
            disabled={conversation.status === 'closed'}
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending || conversation.status === 'closed'}
            className="px-4 py-2"
          >
            {sending ? '📤' : '📨'}
          </Button>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>
            {conversation.unread_count > 0 && `${conversation.unread_count} mensagem(ns) não lida(s)`}
          </span>
          <span>
            Última atividade: {conversation.updated_at ? formatTime(conversation.updated_at) : 'N/A'}
          </span>
        </div>
      </div>

      {/* Templates Panel */}
      {showTemplates && (
        <div className="border-t">
          <ResponseTemplates 
            onTemplateSelect={handleTemplateSelect}
            currentChannel={conversation.channel}
          />
        </div>
      )}
    </div>
  );
};

export default UnifiedChat;