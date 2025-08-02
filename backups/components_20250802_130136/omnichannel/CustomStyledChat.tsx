'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ConversationWithDetails, Message } from '@/lib/omnichannel-api';

interface CustomStyledChatProps {
  conversationId: number;
  agentId?: number;
  onConversationUpdate?: (conversation: ConversationWithDetails) => void;
}

const CustomStyledChat: React.FC<CustomStyledChatProps> = ({ 
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
      const fetchData = async () => {
        await fetchConversation();
      };
      
      fetchData();
      
      const interval = setInterval(fetchConversation, 3000);
      return () => clearInterval(interval);
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversation = async () => {
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

  const sendMessage = async () => {
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
      default: return '💬';
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return '#25D366';
      case 'email': return '#1E40AF';
      case 'webchat': return '#7C3AED';
      case 'phone': return '#6B7280';
      default: return '#6B7280';
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
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <span style={{ marginLeft: '12px' }}>Carregando conversa...</span>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="admin-loading">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <p>Conversa não encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        .chat-container {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: var(--admin-bg-card);
          border-radius: var(--admin-border-radius-lg);
          box-shadow: var(--admin-shadow-lg);
          overflow: hidden;
        }
        
        .chat-header {
          background: linear-gradient(135deg, var(--color-slate-800), var(--color-slate-900));
          color: white;
          padding: 24px;
          border-bottom: 1px solid var(--admin-border-color);
        }
        
        .chat-header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .chat-header-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .channel-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        
        .customer-info h3 {
          margin: 0;
          font-size: var(--admin-font-size-lg);
          font-weight: 600;
        }
        
        .customer-info p {
          margin: 0;
          font-size: var(--admin-font-size-sm);
          opacity: 0.8;
        }
        
        .chat-badges {
          display: flex;
          gap: 8px;
        }
        
        .chat-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: var(--admin-font-size-xs);
          font-weight: 500;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          background: var(--color-slate-50);
          max-height: 500px;
        }
        
        .message-group {
          margin-bottom: 24px;
        }
        
        .date-separator {
          text-align: center;
          margin: 24px 0;
        }
        
        .date-separator span {
          background: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: var(--admin-font-size-xs);
          color: var(--admin-text-muted);
          box-shadow: var(--admin-shadow-sm);
          border: 1px solid var(--admin-border-color);
        }
        
        .message {
          display: flex;
          margin-bottom: 12px;
        }
        
        .message.outbound {
          justify-content: flex-end;
        }
        
        .message.inbound {
          justify-content: flex-start;
        }
        
        .message-content {
          max-width: 70%;
          padding: 16px;
          border-radius: 18px;
          box-shadow: var(--admin-shadow-sm);
          position: relative;
        }
        
        .message.outbound .message-content {
          background: linear-gradient(135deg, var(--color-blue-500), var(--color-blue-600));
          color: white;
          margin-left: 48px;
        }
        
        .message.inbound .message-content {
          background: white;
          color: var(--admin-text-primary);
          border: 1px solid var(--admin-border-color);
          margin-right: 48px;
        }
        
        .message-text {
          font-size: var(--admin-font-size-sm);
          line-height: 1.5;
          margin-bottom: 8px;
        }
        
        .message-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          font-size: var(--admin-font-size-xs);
        }
        
        .message.inbound .message-meta {
          border-top: 1px solid var(--admin-border-color);
          color: var(--admin-text-muted);
        }
        
        .message.outbound .message-meta {
          color: rgba(255, 255, 255, 0.8);
        }
        
        .automated-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
          margin-top: 8px;
        }
        
        .actions-bar {
          background: white;
          border-top: 1px solid var(--admin-border-color);
          padding: 16px;
        }
        
        .status-actions {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }
        
        .status-btn {
          padding: 8px 16px;
          border-radius: var(--admin-border-radius);
          font-size: var(--admin-font-size-xs);
          font-weight: 500;
          border: 1px solid var(--admin-border-color);
          background: white;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .status-btn:hover {
          background: var(--admin-bg-secondary);
        }
        
        .status-btn.active {
          background: var(--color-blue-500);
          color: white;
          border-color: var(--color-blue-500);
        }
        
        .status-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .message-input-area {
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }
        
        .message-input {
          flex: 1;
          min-height: 50px;
          max-height: 120px;
          padding: 12px 16px;
          border: 1px solid var(--admin-border-color);
          border-radius: var(--admin-border-radius);
          font-family: var(--admin-font-family);
          font-size: var(--admin-font-size-sm);
          color: var(--admin-text-primary);
          background: white;
          resize: none;
          transition: all 0.2s;
        }
        
        .message-input:focus {
          outline: none;
          border-color: var(--color-blue-500);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .send-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, var(--color-blue-500), var(--color-blue-600));
          color: white;
          border: none;
          border-radius: var(--admin-border-radius);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          min-height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .send-btn:hover {
          background: linear-gradient(135deg, var(--color-blue-600), var(--color-blue-700));
          transform: translateY(-1px);
        }
        
        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
        
        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .chat-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
          font-size: var(--admin-font-size-xs);
          color: var(--admin-text-muted);
        }
        
        .unread-indicator {
          color: var(--color-red-500);
          font-weight: 500;
        }
      `}</style>
      
      <div className="chat-container">
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-content">
            <div className="chat-header-info">
              <div 
                className="channel-icon"
                style={{ backgroundColor: getChannelColor(conversation.channel) }}
              >
                {getChannelIcon(conversation.channel)}
              </div>
              <div className="customer-info">
                <h3>{conversation.customer.name || conversation.customer.phone || 'Cliente'}</h3>
                <p>{conversation.customer.phone || conversation.customer.email}</p>
              </div>
            </div>
            
            <div className="chat-badges">
              <span className="chat-badge">
                {conversation.channel}
              </span>
              <span className="chat-badge">
                {conversation.status}
              </span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="messages-area">
          {messages.map((message, index) => {
            const isNewDay = index === 0 || 
              formatDate(message.created_at) !== formatDate(messages[index - 1].created_at);
            
            return (
              <div key={message.id} className="message-group">
                {isNewDay && (
                  <div className="date-separator">
                    <span>{formatDate(message.created_at)}</span>
                  </div>
                )}
                
                <div className={`message ${message.direction}`}>
                  <div className="message-content">
                    <div className="message-text">
                      {message.content}
                    </div>
                    <div className="message-meta">
                      <span>
                        {message.sender_name || (message.direction === 'outbound' ? 'Agente' : 'Cliente')}
                      </span>
                      <span>
                        {formatTime(message.created_at)}
                      </span>
                    </div>
                    {message.is_automated && (
                      <div className="automated-badge">
                        🤖 Automático
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Actions */}
        <div className="actions-bar">
          <div className="status-actions">
            <button
              className={`status-btn ${conversation.status === 'open' ? 'active' : ''}`}
              onClick={() => changeConversationStatus('open')}
              disabled={conversation.status === 'open'}
            >
              ✅ Abrir
            </button>
            <button
              className={`status-btn ${conversation.status === 'pending' ? 'active' : ''}`}
              onClick={() => changeConversationStatus('pending')}
              disabled={conversation.status === 'pending'}
            >
              ⏳ Pendente
            </button>
            <button
              className={`status-btn ${conversation.status === 'resolved' ? 'active' : ''}`}
              onClick={() => changeConversationStatus('resolved')}
              disabled={conversation.status === 'resolved'}
            >
              ✅ Resolver
            </button>
            <button
              className={`status-btn ${conversation.status === 'closed' ? 'active' : ''}`}
              onClick={() => changeConversationStatus('closed')}
              disabled={conversation.status === 'closed'}
            >
              🔒 Fechar
            </button>
          </div>
          
          <div className="message-input-area">
            <textarea
              className="message-input"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              disabled={conversation.status === 'closed'}
            />
            <button
              className="send-btn"
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending || conversation.status === 'closed'}
            >
              {sending ? (
                <div className="loading-spinner"></div>
              ) : (
                <span style={{ fontSize: '18px' }}>📨</span>
              )}
            </button>
          </div>
          
          <div className="chat-footer">
            <span>
              {conversation.unread_count > 0 && (
                <span className="unread-indicator">
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
    </>
  );
};

export default CustomStyledChat;