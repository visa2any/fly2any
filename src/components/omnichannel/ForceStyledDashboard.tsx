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

interface ForceStyledDashboardProps {
  agentId?: number;
}

const ForceStyledDashboard: React.FC<ForceStyledDashboardProps> = ({ agentId }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithDetails | null>(null);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      await fetchDashboardData();
      await fetchConversations();
    };
    
    fetchData();
    
    const interval = setInterval(() => {
      fetchConversations();
    }, 10000);

    return () => clearInterval(interval);
  }, [agentId]);

  const fetchDashboardData = async (): Promise<void> => {
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

  const fetchConversations = async (): Promise<void> => {
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

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }}></div>
        <p style={{
          color: '#64748b',
          fontSize: '16px',
          fontWeight: '500'
        }}>
          Carregando Central Omnichannel...
        </p>
      </div>
    );
  }

  return (
    <>
      <style jsx={true}>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '0',
        margin: '0'
      }}>
        {/* Header Premium */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          padding: '24px'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                transform: 'rotate(-3deg)'
              }}>
                <span style={{ fontSize: '28px', filter: 'brightness(0) invert(1)' }}>🌐</span>
              </div>
              <div>
                <h1 style={{
                  fontSize: '32px',
                  fontWeight: '800',
                  color: '#1e293b',
                  margin: '0',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Central Omnichannel Premium
                </h1>
                <p style={{
                  fontSize: '16px',
                  color: '#64748b',
                  margin: '4px 0 0 0',
                  fontWeight: '500'
                }}>
                  Gerencie todas as conversas com design premium e funcionalidades avançadas
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '25px',
                color: 'white',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#34d399',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }}></div>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>Sistema Online</span>
              </div>
              <button style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(249, 115, 22, 0.3)',
                transition: 'all 0.3s ease',
                transform: 'translateY(0)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(249, 115, 22, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(249, 115, 22, 0.3)';
              }}>
                ⚙️ Configurações
              </button>
            </div>
          </div>
        </div>

        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '32px 24px'
        }}>
          {/* Stats Premium Cards */}
          {stats && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
              marginBottom: '32px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
                animation: 'slideUp 0.6s ease',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '200%',
                  height: '200%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }}></div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ 
                        fontSize: '14px', 
                        opacity: 0.9, 
                        margin: '0 0 8px 0',
                        fontWeight: '500'
                      }}>
                        Conversas Ativas
                      </p>
                      <p style={{ 
                        fontSize: '48px', 
                        fontWeight: '800', 
                        margin: '0',
                        textShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}>
                        {stats.activeConversations}
                      </p>
                      <p style={{ 
                        fontSize: '12px', 
                        opacity: 0.8, 
                        margin: '8px 0 0 0',
                        fontWeight: '500'
                      }}>
                        +12% esta semana
                      </p>
                    </div>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '32px',
                      backdropFilter: 'blur(10px)'
                    }}>
                      💬
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: '0 20px 40px rgba(245, 87, 108, 0.3)',
                animation: 'slideUp 0.6s ease 0.1s both',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '200%',
                  height: '200%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }}></div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ 
                        fontSize: '14px', 
                        opacity: 0.9, 
                        margin: '0 0 8px 0',
                        fontWeight: '500'
                      }}>
                        Pendentes
                      </p>
                      <p style={{ 
                        fontSize: '48px', 
                        fontWeight: '800', 
                        margin: '0',
                        textShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}>
                        {stats.pendingConversations}
                      </p>
                      <p style={{ 
                        fontSize: '12px', 
                        opacity: 0.8, 
                        margin: '8px 0 0 0',
                        fontWeight: '500'
                      }}>
                        -8% esta semana
                      </p>
                    </div>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '32px',
                      backdropFilter: 'blur(10px)'
                    }}>
                      ⏳
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: '0 20px 40px rgba(79, 172, 254, 0.3)',
                animation: 'slideUp 0.6s ease 0.2s both',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '200%',
                  height: '200%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }}></div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ 
                        fontSize: '14px', 
                        opacity: 0.9, 
                        margin: '0 0 8px 0',
                        fontWeight: '500'
                      }}>
                        Tempo Resposta
                      </p>
                      <p style={{ 
                        fontSize: '48px', 
                        fontWeight: '800', 
                        margin: '0',
                        textShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}>
                        1.8min
                      </p>
                      <p style={{ 
                        fontSize: '12px', 
                        opacity: 0.8, 
                        margin: '8px 0 0 0',
                        fontWeight: '500'
                      }}>
                        -15% esta semana
                      </p>
                    </div>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '32px',
                      backdropFilter: 'blur(10px)'
                    }}>
                      ⚡
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                color: '#1e293b',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: '0 20px 40px rgba(168, 237, 234, 0.3)',
                animation: 'slideUp 0.6s ease 0.3s both',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '200%',
                  height: '200%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }}></div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ 
                        fontSize: '14px', 
                        opacity: 0.7, 
                        margin: '0 0 8px 0',
                        fontWeight: '500'
                      }}>
                        Satisfação
                      </p>
                      <p style={{ 
                        fontSize: '48px', 
                        fontWeight: '800', 
                        margin: '0',
                        textShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}>
                        4.9/5
                      </p>
                      <p style={{ 
                        fontSize: '12px', 
                        opacity: 0.6, 
                        margin: '8px 0 0 0',
                        fontWeight: '500'
                      }}>
                        +0.3 esta semana
                      </p>
                    </div>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      background: 'rgba(255, 255, 255, 0.4)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '32px',
                      backdropFilter: 'blur(10px)'
                    }}>
                      ⭐
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '32px'
          }}>
            {/* Conversations List */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '24px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      margin: '0 0 8px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      📋 Conversas Ativas
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      opacity: 0.9,
                      margin: '0',
                      fontWeight: '500'
                    }}>
                      {conversations.length} conversas em andamento
                    </p>
                  </div>
                  <button 
                    onClick={fetchConversations}
                    style={{
                      padding: '12px 20px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    }}
                  >
                    🔄 Atualizar
                  </button>
                </div>
              </div>
              
              <div style={{ 
                maxHeight: '600px', 
                overflowY: 'auto',
                padding: '8px'
              }}>
                {conversations.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '80px 40px',
                    color: '#64748b'
                  }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>💬</div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                      Nenhuma conversa ativa
                    </h3>
                    <p style={{ fontSize: '14px' }}>
                      As conversas aparecerão aqui quando chegarem
                    </p>
                  </div>
                ) : (
                  conversations.map((conversation, index) => (
                    <div
                      key={conversation.id}
                      onClick={() => handleConversationClick(conversation)}
                      style={{
                        padding: '20px',
                        margin: '8px',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        background: selectedConversation?.id === conversation.id 
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                          : 'white',
                        color: selectedConversation?.id === conversation.id ? 'white' : '#1e293b',
                        boxShadow: selectedConversation?.id === conversation.id 
                          ? '0 8px 24px rgba(102, 126, 234, 0.4)' 
                          : '0 2px 8px rgba(0, 0, 0, 0.05)',
                        border: '1px solid',
                        borderColor: selectedConversation?.id === conversation.id 
                          ? 'rgba(255, 255, 255, 0.2)' 
                          : '#e2e8f0',
                        animation: `slideUp 0.6s ease ${index * 0.1}s both`
                      }}
                      onMouseEnter={(e) => {
                        if (selectedConversation?.id !== conversation.id) {
                          e.currentTarget.style.background = '#f8fafc';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedConversation?.id !== conversation.id) {
                          e.currentTarget.style.background = 'white';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ position: 'relative' }}>
                            <div style={{
                              width: '56px',
                              height: '56px',
                              borderRadius: '50%',
                              background: selectedConversation?.id === conversation.id 
                                ? 'rgba(255, 255, 255, 0.2)' 
                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '24px',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                              backdropFilter: 'blur(10px)'
                            }}>
                              <span style={{ 
                                filter: selectedConversation?.id === conversation.id 
                                  ? 'none' 
                                  : 'brightness(0) invert(1)' 
                              }}>
                                {getChannelIcon(conversation.channel)}
                              </span>
                            </div>
                            {conversation.unread_count > 0 && (
                              <div style={{
                                position: 'absolute',
                                top: '-4px',
                                right: '-4px',
                                width: '24px',
                                height: '24px',
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: '700',
                                color: 'white',
                                border: '2px solid white',
                                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
                              }}>
                                {conversation.unread_count}
                              </div>
                            )}
                          </div>
                          
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                              <span style={{ 
                                fontWeight: '700', 
                                fontSize: '16px'
                              }}>
                                {conversation.customer.name || conversation.customer.phone || 'Cliente'}
                              </span>
                              <span style={{
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '10px',
                                fontWeight: '600',
                                background: selectedConversation?.id === conversation.id 
                                  ? 'rgba(255, 255, 255, 0.2)' 
                                  : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                                color: selectedConversation?.id === conversation.id 
                                  ? 'white' 
                                  : 'white',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}>
                                {conversation.priority}
                              </span>
                            </div>
                            <p style={{ 
                              fontSize: '14px',
                              opacity: selectedConversation?.id === conversation.id ? 0.9 : 0.7,
                              margin: '0',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '320px',
                              fontWeight: '500'
                            }}>
                              {conversation.last_message?.content || 'Sem mensagens'}
                            </p>
                          </div>
                        </div>
                        
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ marginBottom: '8px' }}>
                            <span style={{
                              padding: '6px 12px',
                              borderRadius: '20px',
                              fontSize: '10px',
                              fontWeight: '600',
                              background: selectedConversation?.id === conversation.id 
                                ? 'rgba(255, 255, 255, 0.2)' 
                                : (() => {
                                  switch (conversation.status) {
                                    case 'open': return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                                    case 'pending': return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
                                    case 'resolved': return 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
                                    case 'closed': return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
                                    default: return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
                                  }
                                })(),
                              color: 'white',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              {conversation.status}
                            </span>
                          </div>
                          <p style={{ 
                            fontSize: '12px',
                            opacity: selectedConversation?.id === conversation.id ? 0.8 : 0.6,
                            margin: '0',
                            fontWeight: '500'
                          }}>
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
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                padding: '24px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  margin: '0 0 8px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  👤 Detalhes da Conversa
                </h3>
                <p style={{
                  fontSize: '14px',
                  opacity: 0.9,
                  margin: '0',
                  fontWeight: '500'
                }}>
                  Informações completas do cliente
                </p>
              </div>
              
              <div style={{ padding: '32px' }}>
                {selectedConversation ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Customer Info */}
                    <div style={{
                      padding: '20px',
                      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                    }}>
                      <h4 style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: '#1e293b',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        👤 Cliente
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '500' }}>
                          <strong style={{ color: '#374151' }}>Nome:</strong> 
                          <span style={{ color: '#6b7280', marginLeft: '8px' }}>
                            {selectedConversation.customer.name || 'Não informado'}
                          </span>
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '500' }}>
                          <strong style={{ color: '#374151' }}>Contato:</strong> 
                          <span style={{ color: '#6b7280', marginLeft: '8px' }}>
                            {selectedConversation.customer.phone || selectedConversation.customer.email}
                          </span>
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '500' }}>
                          <strong style={{ color: '#374151' }}>Localização:</strong> 
                          <span style={{ color: '#6b7280', marginLeft: '8px' }}>
                            {selectedConversation.customer.location || 'Não informado'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button 
                      onClick={() => {
                        window.open(`/admin/support/conversation/${selectedConversation.id}`, '_blank');
                      }}
                      style={{
                        width: '100%',
                        padding: '20px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '16px',
                        fontSize: '16px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                        transition: 'all 0.3s ease',
                        transform: 'translateY(0)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.4)';
                      }}
                    >
                      💬 Abrir Conversa Completa
                    </button>
                  </div>
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '80px 20px',
                    color: '#64748b'
                  }}>
                    <div style={{ 
                      fontSize: '80px',
                      marginBottom: '24px',
                      opacity: 0.7
                    }}>
                      💬
                    </div>
                    <h3 style={{ 
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#1e293b',
                      marginBottom: '12px'
                    }}>
                      Selecione uma conversa
                    </h3>
                    <p style={{ 
                      fontSize: '14px',
                      color: '#64748b',
                      margin: '0',
                      fontWeight: '500',
                      lineHeight: 1.6
                    }}>
                      Escolha uma conversa da lista para ver<br />
                      os detalhes completos do cliente
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForceStyledDashboard;