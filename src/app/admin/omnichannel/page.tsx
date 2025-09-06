'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';

interface DashboardStats {
  totalConversations: number;
  activeConversations: number;
  pendingConversations: number;
  avgResponseTime: number;
  customerSatisfaction: number;
  channelBreakdown: Record<string, number>;
}

interface Conversation {
  id: number;
  customer: {
    name?: string;
    phone?: string;
    email?: string;
  };
  channel: string;
  status: string;
  priority: string;
  unread_count: number;
  last_message?: {
    content: string;
    created_at: Date;
  };
}

export default function OmnichannelPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalConversations: 0,
    activeConversations: 4,
    pendingConversations: 2,
    avgResponseTime: 2.5,
    customerSatisfaction: 4.8,
    channelBreakdown: {}
  });
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return '💬';
      case 'email': return '✉️';
      case 'webchat': return '🌐';
      case 'phone': return '📞';
      default: return '💬';
    }
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <style jsx={true}>{`
        .premium-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .premium-stat-card {
          color: white;
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .premium-stat-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
        }

        .premium-stat-card::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          pointer-events: none;
        }

        .stat-content {
          position: relative;
          z-index: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-info h3 {
          font-size: 14px;
          opacity: 0.9;
          margin: 0 0 8px 0;
          font-weight: 500;
        }

        .stat-info .value {
          font-size: 48px;
          font-weight: 800;
          margin: 0;
          text-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .stat-info .change {
          font-size: 12px;
          opacity: 0.8;
          margin: 8px 0 0 0;
          font-weight: 500;
        }

        .stat-icon {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          backdrop-filter: blur(10px);
        }

        .card-1 { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .card-2 { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
        .card-3 { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
        .card-4 { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }

        .main-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 32px;
        }

        .premium-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .card-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .card-header h3 {
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 8px 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .card-header p {
          font-size: 14px;
          opacity: 0.9;
          margin: 0;
          font-weight: 500;
        }

        .card-content {
          padding: 32px;
        }

        .empty-state {
          text-align: center;
          padding: 80px 40px;
          color: #64748b;
        }

        .empty-state .icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #1e293b;
        }

        .empty-state p {
          font-size: 14px;
          margin: 0;
        }

        .conversation-item {
          padding: 20px;
          margin: 8px;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          background: white;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .conversation-item:hover {
          background: #f8fafc;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }

        .conversation-item.selected {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .conversation-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .conversation-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .channel-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          color: white;
        }

        .conversation-item.selected .channel-avatar {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
        }

        .conversation-info {
          flex: 1;
        }

        .conversation-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .customer-name {
          font-weight: 700;
          font-size: 16px;
        }

        .priority-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 600;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .conversation-item.selected .priority-badge {
          background: rgba(255, 255, 255, 0.2);
        }

        .last-message {
          font-size: 14px;
          opacity: 0.7;
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 320px;
          font-weight: 500;
        }

        .conversation-right {
          text-align: right;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
          display: inline-block;
        }

        .status-open { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
        .status-pending { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
        .status-resolved { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); }
        .status-closed { background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); }

        .conversation-item.selected .status-badge {
          background: rgba(255, 255, 255, 0.2) !important;
        }

        .conversation-time {
          font-size: 12px;
          opacity: 0.6;
          margin: 0;
          font-weight: 500;
        }

        .unread-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: white;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
        }

        .refresh-btn {
          padding: 12px 20px;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .refresh-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>

      {/* Stats Premium Cards */}
      <div className="premium-stats-grid">
        <div className="premium-stat-card card-1">
          <div className="stat-content">
            <div className="stat-info">
              <h3>Conversas Ativas</h3>
              <p className="value">{stats.activeConversations}</p>
              <p className="change">+12% esta semana</p>
            </div>
            <div className="stat-icon">💬</div>
          </div>
        </div>

        <div className="premium-stat-card card-2">
          <div className="stat-content">
            <div className="stat-info">
              <h3>Pendentes</h3>
              <p className="value">{stats.pendingConversations}</p>
              <p className="change">-8% esta semana</p>
            </div>
            <div className="stat-icon">⏳</div>
          </div>
        </div>

        <div className="premium-stat-card card-3">
          <div className="stat-content">
            <div className="stat-info">
              <h3>Tempo Resposta</h3>
              <p className="value">1.8min</p>
              <p className="change">-15% esta semana</p>
            </div>
            <div className="stat-icon">⚡</div>
          </div>
        </div>

        <div className="premium-stat-card card-4">
          <div className="stat-content">
            <div className="stat-info">
              <h3>Satisfação</h3>
              <p className="value">4.9/5</p>
              <p className="change">+0.3 esta semana</p>
            </div>
            <div className="stat-icon">⭐</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-grid">
        {/* Conversations List */}
        <div className="premium-card">
          <div className="card-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3>📋 Conversas Ativas</h3>
                <p>{conversations.length} conversas em andamento</p>
              </div>
              <button className="refresh-btn">
                🔄 Atualizar
              </button>
            </div>
          </div>
          
          <div style={{ maxHeight: '600px', overflowY: 'auto', padding: '8px' }}>
            {conversations.length === 0 ? (
              <div className="empty-state">
                <div className="icon">💬</div>
                <h3>Nenhuma conversa ativa</h3>
                <p>As conversas aparecerão aqui quando chegarem</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`conversation-item ${selectedConversation?.id === conversation.id ? 'selected' : ''}`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="conversation-content">
                    <div className="conversation-left">
                      <div style={{ position: 'relative' }}>
                        <div className="channel-avatar">
                          {getChannelIcon(conversation.channel)}
                        </div>
                        {conversation.unread_count > 0 && (
                          <div className="unread-badge">
                            {conversation.unread_count}
                          </div>
                        )}
                      </div>
                      
                      <div className="conversation-info">
                        <div className="conversation-header">
                          <span className="customer-name">
                            {conversation.customer.name || conversation.customer.phone || 'Cliente'}
                          </span>
                          <span className="priority-badge">
                            {conversation.priority}
                          </span>
                        </div>
                        <p className="last-message">
                          {conversation.last_message?.content || 'Sem mensagens'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="conversation-right">
                      <div className={`status-badge status-${conversation.status}`}>
                        {conversation.status}
                      </div>
                      <p className="conversation-time">
                        {conversation.last_message ? formatTime(conversation.last_message.created_at) : ''}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Conversation Details */}
        <div className="premium-card">
          <div className="card-header">
            <div>
              <h3>👤 Detalhes da Conversa</h3>
              <p>Informações completas do cliente</p>
            </div>
          </div>
          
          <div className="card-content">
            {selectedConversation ? (
              <div>
                <h4>Cliente selecionado:</h4>
                <p>{selectedConversation.customer.name || 'Nome não informado'}</p>
                <p>{selectedConversation.customer.phone || selectedConversation.customer.email}</p>
              </div>
            ) : (
              <div className="empty-state">
                <div className="icon">💬</div>
                <h3>Selecione uma conversa</h3>
                <p>Escolha uma conversa da lista para ver os detalhes completos do cliente</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}