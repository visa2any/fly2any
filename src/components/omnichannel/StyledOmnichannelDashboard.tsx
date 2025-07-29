'use client';

import React, { useState, useEffect } from 'react';
import { ConversationWithDetails } from '@/lib/omnichannel-api';

interface DashboardStats {
  totalConversations: number;
  activeConversations: number;
  pendingConversations: number;
  avgResponseTime: number;
  customerSatisfaction: number;
  channelBreakdown: Record<string, number>;
}

interface StyledOmnichannelDashboardProps {
  agentId?: number;
}

const StyledOmnichannelDashboard: React.FC<StyledOmnichannelDashboardProps> = ({ agentId }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithDetails | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      await fetchDashboardData();
      await fetchConversations();
    };
    
    fetchData();
    
    // Polling para atualizações em tempo real
    const interval = setInterval(() => {
      fetchConversations();
    }, 10000);

    return () => clearInterval(interval);
  }, [agentId]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`/api/omnichannel/dashboard${agentId ? `?agent_id=${agentId}` : ''}`);
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch(`/api/omnichannel/conversations${agentId ? `?agent_id=${agentId}` : ''}`);
      const data = await response.json();
      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationClick = async (conversation: ConversationWithDetails) => {
    try {
      const response = await fetch(`/api/omnichannel/conversations/${conversation.id}`);
      const data = await response.json();
      if (data.success) {
        setSelectedConversation(data.conversation);
      }
    } catch (error) {
      console.error('Error fetching conversation details:', error);
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
      case 'whatsapp': return '#25D366';
      case 'email': return '#1E40AF';
      case 'webchat': return '#7C3AED';
      case 'phone': return '#6B7280';
      case 'instagram': return '#E4405F';
      case 'facebook': return '#1877F2';
      default: return '#6B7280';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'admin-badge admin-badge-danger';
      case 'high': return 'admin-badge admin-badge-warning';
      case 'normal': return 'admin-badge admin-badge-info';
      case 'low': return 'admin-badge admin-badge-neutral';
      default: return 'admin-badge admin-badge-info';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return 'admin-badge admin-badge-success';
      case 'pending': return 'admin-badge admin-badge-warning';
      case 'resolved': return 'admin-badge admin-badge-info';
      case 'closed': return 'admin-badge admin-badge-neutral';
      default: return 'admin-badge admin-badge-neutral';
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <span style={{ marginLeft: '12px', color: 'var(--admin-text-secondary)' }}>
          Carregando Central Omnichannel...
        </span>
      </div>
    );
  }

  return (
    <div className="admin-app">
      <div className="admin-main">
        {/* Header Customizado */}
        <div className="admin-header">
          <div className="admin-breadcrumb">
            <div className="admin-logo">
              <span>🌐</span>
            </div>
            <div style={{ marginLeft: '16px' }}>
              <h1 style={{ 
                fontSize: 'var(--admin-font-size-2xl)', 
                fontWeight: '700',
                color: 'var(--admin-text-primary)',
                margin: 0
              }}>
                Central Omnichannel
              </h1>
              <p style={{ 
                fontSize: 'var(--admin-font-size-sm)', 
                color: 'var(--admin-text-secondary)',
                margin: 0
              }}>
                Centralize todas as conversas em um só lugar
              </p>
            </div>
          </div>
          
          <div className="admin-header-actions">
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: 'var(--color-emerald-50)',
              borderRadius: 'var(--admin-border-radius)',
              border: '1px solid var(--color-emerald-200)'
            }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                backgroundColor: 'var(--color-emerald-500)', 
                borderRadius: '50%',
                animation: 'pulse 2s infinite'
              }}></div>
              <span style={{ 
                fontSize: 'var(--admin-font-size-sm)', 
                fontWeight: '500',
                color: 'var(--color-emerald-700)'
              }}>
                Sistema Online
              </span>
            </div>
            <button className="admin-btn admin-btn-secondary">
              ⚙️ Configurações
            </button>
          </div>
        </div>

        <div className="admin-content">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="admin-stats-card">
                <div className="admin-stats-value" style={{ color: 'var(--color-blue-600)' }}>
                  {stats.activeConversations}
                </div>
                <div className="admin-stats-label">
                  💬 Conversas Ativas
                </div>
                <div style={{ 
                  fontSize: 'var(--admin-font-size-xs)', 
                  color: 'var(--color-emerald-600)',
                  marginTop: '4px'
                }}>
                  +12% esta semana
                </div>
              </div>

              <div className="admin-stats-card">
                <div className="admin-stats-value" style={{ color: 'var(--color-orange-600)' }}>
                  {stats.pendingConversations}
                </div>
                <div className="admin-stats-label">
                  ⏳ Pendentes
                </div>
                <div style={{ 
                  fontSize: 'var(--admin-font-size-xs)', 
                  color: 'var(--color-orange-600)',
                  marginTop: '4px'
                }}>
                  -8% esta semana
                </div>
              </div>

              <div className="admin-stats-card">
                <div className="admin-stats-value" style={{ color: 'var(--color-emerald-600)' }}>
                  2.5min
                </div>
                <div className="admin-stats-label">
                  ⚡ Tempo Resposta
                </div>
                <div style={{ 
                  fontSize: 'var(--admin-font-size-xs)', 
                  color: 'var(--color-emerald-600)',
                  marginTop: '4px'
                }}>
                  -15% esta semana
                </div>
              </div>

              <div className="admin-stats-card">
                <div className="admin-stats-value" style={{ color: 'var(--color-purple-600)' }}>
                  4.8/5
                </div>
                <div className="admin-stats-label">
                  ⭐ Satisfação
                </div>
                <div style={{ 
                  fontSize: 'var(--admin-font-size-xs)', 
                  color: 'var(--color-purple-600)',
                  marginTop: '4px'
                }}>
                  +0.2 esta semana
                </div>
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '2fr 1fr', 
            gap: '24px',
            marginTop: '24px'
          }}>
            {/* Conversations List */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200-title">
                      📋 Conversas Ativas
                    </div>
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200-description">
                      {conversations.length} conversas em andamento
                    </div>
                  </div>
                  <button 
                    className="admin-btn admin-btn-secondary"
                    onClick={fetchConversations}
                    style={{ fontSize: 'var(--admin-font-size-xs)' }}
                  >
                    🔄 Atualizar
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg border border-gray-200-content" style={{ padding: 0 }}>
                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => handleConversationClick(conversation)}
                      style={{
                        padding: '16px',
                        borderBottom: '1px solid var(--admin-border-color)',
                        cursor: 'pointer',
                        transition: 'all var(--admin-transition)',
                        backgroundColor: selectedConversation?.id === conversation.id 
                          ? 'var(--color-blue-50)' 
                          : 'transparent',
                        borderLeft: selectedConversation?.id === conversation.id 
                          ? '4px solid var(--color-blue-500)' 
                          : '4px solid transparent'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedConversation?.id !== conversation.id) {
                          e.currentTarget.style.backgroundColor = 'var(--admin-bg-secondary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedConversation?.id !== conversation.id) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ position: 'relative' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              backgroundColor: getChannelColor(conversation.channel),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 'var(--admin-font-size-lg)',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                            }}>
                              <span style={{ filter: 'brightness(0) invert(1)' }}>
                                {getChannelIcon(conversation.channel)}
                              </span>
                            </div>
                            {conversation.unread_count > 0 && (
                              <div style={{
                                position: 'absolute',
                                top: '-4px',
                                right: '-4px',
                                width: '20px',
                                height: '20px',
                                backgroundColor: 'var(--color-red-500)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px',
                                fontWeight: '600',
                                color: 'white',
                                border: '2px solid white'
                              }}>
                                {conversation.unread_count}
                              </div>
                            )}
                          </div>
                          
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{ 
                                fontWeight: '600', 
                                color: 'var(--admin-text-primary)',
                                fontSize: 'var(--admin-font-size-sm)'
                              }}>
                                {conversation.customer.name || conversation.customer.phone || 'Cliente'}
                              </span>
                              <span className={getPriorityBadge(conversation.priority)}>
                                {conversation.priority}
                              </span>
                            </div>
                            <p style={{ 
                              fontSize: 'var(--admin-font-size-xs)',
                              color: 'var(--admin-text-secondary)',
                              margin: 0,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '300px'
                            }}>
                              {conversation.last_message?.content || 'Sem mensagens'}
                            </p>
                          </div>
                        </div>
                        
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ marginBottom: '4px' }}>
                            <span className={getStatusBadge(conversation.status)}>
                              {conversation.status}
                            </span>
                          </div>
                          <p style={{ 
                            fontSize: 'var(--admin-font-size-xs)',
                            color: 'var(--admin-text-muted)',
                            margin: 0
                          }}>
                            {conversation.last_message ? formatTime(conversation.last_message.created_at) : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Conversation Details */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200-header">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200-title">
                  👤 Detalhes da Conversa
                </div>
                <div className="bg-white rounded-xl shadow-lg border border-gray-200-description">
                  Informações completas do cliente
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg border border-gray-200-content">
                {selectedConversation ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Customer Info */}
                    <div style={{ 
                      padding: '16px',
                      backgroundColor: 'var(--admin-bg-secondary)',
                      borderRadius: 'var(--admin-border-radius)',
                      border: '1px solid var(--admin-border-color)'
                    }}>
                      <h4 style={{ 
                        fontSize: 'var(--admin-font-size-sm)',
                        fontWeight: '600',
                        color: 'var(--admin-text-primary)',
                        marginBottom: '12px'
                      }}>
                        Cliente
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: 'var(--admin-font-size-xs)' }}>
                          <strong>Nome:</strong> {selectedConversation.customer.name || 'Não informado'}
                        </div>
                        <div style={{ fontSize: 'var(--admin-font-size-xs)' }}>
                          <strong>Contato:</strong> {selectedConversation.customer.phone || selectedConversation.customer.email}
                        </div>
                        <div style={{ fontSize: 'var(--admin-font-size-xs)' }}>
                          <strong>Localização:</strong> {selectedConversation.customer.location || 'Não informado'}
                        </div>
                      </div>
                    </div>

                    {/* Channel Info */}
                    <div style={{ 
                      padding: '16px',
                      backgroundColor: 'var(--admin-bg-secondary)',
                      borderRadius: 'var(--admin-border-radius)',
                      border: '1px solid var(--admin-border-color)'
                    }}>
                      <h4 style={{ 
                        fontSize: 'var(--admin-font-size-sm)',
                        fontWeight: '600',
                        color: 'var(--admin-text-primary)',
                        marginBottom: '12px'
                      }}>
                        Canal
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: getChannelColor(selectedConversation.channel),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span style={{ filter: 'brightness(0) invert(1)' }}>
                            {getChannelIcon(selectedConversation.channel)}
                          </span>
                        </div>
                        <span style={{ 
                          fontSize: 'var(--admin-font-size-sm)',
                          fontWeight: '500',
                          textTransform: 'capitalize'
                        }}>
                          {selectedConversation.channel}
                        </span>
                      </div>
                    </div>

                    {/* Status & Priority */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '12px'
                    }}>
                      <div style={{ 
                        padding: '16px',
                        backgroundColor: 'var(--admin-bg-secondary)',
                        borderRadius: 'var(--admin-border-radius)',
                        border: '1px solid var(--admin-border-color)'
                      }}>
                        <h4 style={{ 
                          fontSize: 'var(--admin-font-size-sm)',
                          fontWeight: '600',
                          color: 'var(--admin-text-primary)',
                          marginBottom: '8px'
                        }}>
                          Status
                        </h4>
                        <span className={getStatusBadge(selectedConversation.status)}>
                          {selectedConversation.status}
                        </span>
                      </div>
                      <div style={{ 
                        padding: '16px',
                        backgroundColor: 'var(--admin-bg-secondary)',
                        borderRadius: 'var(--admin-border-radius)',
                        border: '1px solid var(--admin-border-color)'
                      }}>
                        <h4 style={{ 
                          fontSize: 'var(--admin-font-size-sm)',
                          fontWeight: '600',
                          color: 'var(--admin-text-primary)',
                          marginBottom: '8px'
                        }}>
                          Prioridade
                        </h4>
                        <span className={getPriorityBadge(selectedConversation.priority)}>
                          {selectedConversation.priority}
                        </span>
                      </div>
                    </div>

                    {/* Message Stats */}
                    <div style={{ 
                      padding: '16px',
                      backgroundColor: 'var(--admin-bg-secondary)',
                      borderRadius: 'var(--admin-border-radius)',
                      border: '1px solid var(--admin-border-color)'
                    }}>
                      <h4 style={{ 
                        fontSize: 'var(--admin-font-size-sm)',
                        fontWeight: '600',
                        color: 'var(--admin-text-primary)',
                        marginBottom: '12px'
                      }}>
                        Estatísticas
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <div style={{ 
                            fontSize: 'var(--admin-font-size-xs)',
                            color: 'var(--admin-text-secondary)'
                          }}>
                            Mensagens
                          </div>
                          <div style={{ 
                            fontSize: 'var(--admin-font-size-sm)',
                            fontWeight: '600',
                            color: 'var(--admin-text-primary)'
                          }}>
                            {selectedConversation.messages.length}
                          </div>
                        </div>
                        <div>
                          <div style={{ 
                            fontSize: 'var(--admin-font-size-xs)',
                            color: 'var(--admin-text-secondary)'
                          }}>
                            Não lidas
                          </div>
                          <div style={{ 
                            fontSize: 'var(--admin-font-size-sm)',
                            fontWeight: '600',
                            color: 'var(--color-red-600)'
                          }}>
                            {selectedConversation.unread_count}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button 
                      className="admin-btn admin-btn-primary"
                      onClick={() => {
                        window.open(`/admin/support/conversation/${selectedConversation.id}`, '_blank');
                      }}
                      style={{ width: '100%', padding: '16px' }}
                    >
                      💬 Abrir Conversa
                    </button>
                  </div>
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px 20px',
                    color: 'var(--admin-text-secondary)'
                  }}>
                    <div style={{ 
                      fontSize: '48px',
                      marginBottom: '16px'
                    }}>
                      💬
                    </div>
                    <h3 style={{ 
                      fontSize: 'var(--admin-font-size-lg)',
                      fontWeight: '600',
                      color: 'var(--admin-text-primary)',
                      marginBottom: '8px'
                    }}>
                      Selecione uma conversa
                    </h3>
                    <p style={{ 
                      fontSize: 'var(--admin-font-size-sm)',
                      color: 'var(--admin-text-secondary)',
                      margin: 0
                    }}>
                      Escolha uma conversa da lista para ver os detalhes
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyledOmnichannelDashboard;