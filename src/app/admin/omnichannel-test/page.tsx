'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ResponseTemplates from '@/components/omnichannel/ResponseTemplates';
import NotificationSystem from '@/components/omnichannel/NotificationSystem';
import Timeline360 from '@/components/customers/Timeline360';

interface Conversation {
  id: number;
  customer: { 
    id: number;
    name: string; 
    phone: string; 
    email: string; 
  };
  channel: 'whatsapp' | 'email' | 'webchat' | 'phone' | 'sms' | 'instagram' | 'facebook' | 'telegram';
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  agent?: string;
  agent_id?: number;
}

interface DashboardStats {
  totalConversations: number;
  activeConversations: number;
  pendingConversations: number;
  resolvedConversations: number;
  avgResponseTime: number;
  customerSatisfaction: number;
  channelDistribution: Record<string, number>;
  agentPerformance?: {
    totalConversations: number;
    avgResponseTime: number;
    satisfactionRating: number;
  };
}

interface Message {
  id: number;
  conversation_id: number;
  content: string;
  sender_type: 'customer' | 'agent' | 'system';
  sender_name: string;
  created_at: string;
  metadata?: any;
}

const cardStyle = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e5e7eb',
  marginBottom: '20px'
};

const buttonStyle = {
  padding: '10px 16px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.2s',
  border: '1px solid #d1d5db'
};

export default function OmnichannelRealPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [view, setView] = useState<'dashboard' | 'chat' | 'templates' | 'customer360' | 'broadcast' | 'agents' | 'tickets'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [newMessage, setNewMessage] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastChannels, setBroadcastChannels] = useState<string[]>([]);

  // Fetch real conversations from API
  const fetchConversations = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch('/api/omnichannel/conversations?limit=50');
      const data = await response.json();
      
      if (data.success) {
        setConversations(data.conversations.map((conv: any) => ({
          ...conv,
          timestamp: new Date(conv.created_at || conv.last_message_at),
          customer: conv.customer || { 
            id: conv.customer_id, 
            name: conv.customer_name || 'Cliente', 
            phone: conv.customer_phone || '', 
            email: conv.customer_email || '' 
          }
        })));
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch real dashboard stats
  const fetchDashboardStats = async (): Promise<void> => {
    try {
      const response = await fetch('/api/omnichannel/dashboard');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId: number) => {
    try {
      const response = await fetch(`/api/omnichannel/conversations/${conversationId}/messages`);
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Send real message via API
  const sendMessage = async (): Promise<void> => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    try {
      const response = await fetch('/api/omnichannel/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: selectedConversation.id,
          content: newMessage,
          sender_type: 'agent',
          sender_name: 'Agent',
          channel: selectedConversation.channel
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setNewMessage('');
        fetchMessages(selectedConversation.id); // Refresh messages
        fetchConversations(); // Refresh conversations list
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Erro ao enviar mensagem. Tente novamente.');
    }
  };

  // Update conversation status
  const updateConversationStatus = async (conversationId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/omnichannel/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      
      if (data.success) {
        fetchConversations(); // Refresh conversations
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation({ ...selectedConversation, status: newStatus as any });
        }
      }
    } catch (error) {
      console.error('Error updating conversation status:', error);
    }
  };

  // Send broadcast message
  const sendBroadcast = async (): Promise<void> => {
    if (!broadcastMessage.trim() || broadcastChannels.length === 0) {
      alert('Por favor, digite uma mensagem e selecione pelo menos um canal.');
      return;
    }

    try {
      setBroadcasting(true);
      
      const response = await fetch('/api/omnichannel/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: broadcastMessage,
          channels: broadcastChannels,
          type: 'promotional'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Broadcast enviado com sucesso para ${data.sent_count} contatos!`);
        setBroadcastMessage('');
        setBroadcastChannels([]);
        setView('dashboard');
      } else {
        alert('Erro ao enviar broadcast: ' + data.error);
      }
    } catch (error) {
      console.error('Error sending broadcast:', error);
      alert('Erro ao enviar broadcast. Tente novamente.');
    } finally {
      setBroadcasting(false);
    }
  };

  // Initialize data
  useEffect(() => {
    fetchConversations();
    fetchDashboardStats();
  }, []);

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesChannel = selectedChannel === 'all' || conv.channel === selectedChannel;
    const matchesStatus = selectedStatus === 'all' || conv.status === selectedStatus;
    return matchesSearch && matchesChannel && matchesStatus;
  });

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return '📱';
      case 'email': return '📧';
      case 'webchat': return '💬';
      case 'phone': return '📞';
      case 'sms': return '💬';
      case 'instagram': return '📸';
      case 'facebook': return '👥';
      case 'telegram': return '✈️';
      default: return '🌐';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'agora';
    if (minutes < 60) return `há ${minutes}min`;
    if (minutes < 1440) return `há ${Math.floor(minutes / 60)}h`;
    return `há ${Math.floor(minutes / 1440)}d`;
  };

  const handleConversationClick = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setView('chat');
    fetchMessages(conversation.id);
    
    // Mark as read
    const updatedConversations = conversations.map(conv => 
      conv.id === conversation.id 
        ? { ...conv, unreadCount: 0 }
        : conv
    );
    setConversations(updatedConversations);
  };

  if (loading && conversations.length === 0) {
    return (
      <div style={{ 
        backgroundColor: '#f8fafc', 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔄</div>
          <p>Carregando sistema omnichannel...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Success Banner */}
      <div style={{
        backgroundColor: '#10b981',
        color: 'white',
        padding: '12px 0',
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: '600'
      }}>
        ✅ SISTEMA OMNICHANNEL REAL FUNCIONANDO! Conectado às APIs de produção
      </div>

      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        borderBottom: '1px solid #e5e7eb',
        padding: '20px 0'
      }}>
        <div style={{ width: '100%', padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px', height: '48px', backgroundColor: '#3b82f6', borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '20px', fontWeight: 'bold'
              }}>🌐</div>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 4px 0' }}>
                  Central Omnichannel - REAL
                </h1>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
                  Sistema conectado às APIs de produção • {conversations.length} conversas carregadas
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <NotificationSystem 
                agentId={1}
                onNotificationClick={(notification) => {
                  if (notification.conversationId) {
                    const conv = conversations.find(c => c.id === notification.conversationId);
                    if (conv) handleConversationClick(conv);
                  }
                }}
              />
              {[
                { key: 'dashboard', label: '📊 Dashboard', active: view === 'dashboard' },
                { key: 'broadcast', label: '📢 Broadcast', active: view === 'broadcast' },
                { key: 'agents', label: '👥 Agentes', active: view === 'agents' },
                { key: 'templates', label: '📝 Templates', active: view === 'templates' },
                { key: 'tickets', label: '🎫 Tickets', active: view === 'tickets' }
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setView(item.key as any)}
                  style={{
                    ...buttonStyle,
                    backgroundColor: item.active ? '#3b82f6' : 'white',
                    color: item.active ? 'white' : '#374151'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ width: '100%', padding: '20px' }}>
        {view === 'dashboard' && (
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
            {/* Left Sidebar - Real Metrics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Real Quick Metrics */}
              <div style={cardStyle}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 16px 0' }}>
                  📊 Métricas Reais
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {stats && [
                    { label: 'Conversas Ativas', value: stats.activeConversations, color: '#10b981' },
                    { label: 'Pendentes', value: stats.pendingConversations, color: '#f59e0b' },
                    { label: 'Tempo Médio', value: `${stats.avgResponseTime}min`, color: '#8b5cf6' },
                    { label: 'Satisfação', value: `${stats.customerSatisfaction}/5`, color: '#fbbf24' }
                  ].map((stat, index) => (
                    <div key={index} style={{
                      padding: '12px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>{stat.label}</span>
                      <span style={{ fontSize: '18px', fontWeight: 'bold', color: stat.color }}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real Channel Status */}
              <div style={cardStyle}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 16px 0' }}>
                  📱 Status dos Canais (Real)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {stats?.channelDistribution && Object.entries(stats.channelDistribution).map(([channel, count]) => (
                    <div key={channel} style={{
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>{getChannelIcon(channel)}</span>
                        <span style={{ fontSize: '14px', fontWeight: '600', textTransform: 'capitalize' }}>{channel}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: count > 0 ? '#16a34a' : '#d97706',
                          borderRadius: '50%'
                        }}></div>
                        <span style={{ fontSize: '12px', color: count > 0 ? '#16a34a' : '#d97706', fontWeight: '600' }}>
                          {count} ativas
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real Quick Actions */}
              <div style={cardStyle}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 16px 0' }}>
                  ⚡ Ações Funcionais
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { icon: '📢', label: 'Enviar Broadcast', color: '#3b82f6', action: () => setView('broadcast') },
                    { icon: '👥', label: 'Gerenciar Agentes', color: '#10b981', action: () => setView('agents') },
                    { icon: '🎫', label: 'Sistema de Tickets', color: '#f59e0b', action: () => setView('tickets') },
                    { icon: '📋', label: 'Templates', color: '#8b5cf6', action: () => setView('templates') }
                  ].map((action, index) => (
                    <button key={index} onClick={action.action} style={{
                      padding: '12px',
                      backgroundColor: action.color,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span>{action.icon}</span>
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Real Conversations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Real Stats Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px'
              }}>
                {stats && [
                  { label: 'Total', value: stats.totalConversations, color: '#3b82f6', icon: '💬' },
                  { label: 'Ativas', value: stats.activeConversations, color: '#10b981', icon: '🟢' },
                  { label: 'Pendentes', value: stats.pendingConversations, color: '#f59e0b', icon: '⏳' },
                  { label: 'Satisfação', value: `${stats.customerSatisfaction}/5`, color: '#fbbf24', icon: '⭐' }
                ].map((stat, index) => (
                  <div key={index} style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>{stat.label}</p>
                        <p style={{ fontSize: '24px', fontWeight: 'bold', color: stat.color, margin: '0' }}>
                          {stat.value}
                        </p>
                      </div>
                      <div style={{ fontSize: '24px' }}>{stat.icon}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Filters */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                  <input
                    placeholder="🔍 Buscar conversas reais..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    style={{
                      padding: '10px 16px', border: '1px solid #d1d5db', borderRadius: '8px',
                      fontSize: '14px', width: '300px', outline: 'none'
                    }}
                  />
                  <select
                    value={selectedChannel}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedChannel(e.target.value)}
                    style={{
                      padding: '10px 16px', border: '1px solid #d1d5db', borderRadius: '8px',
                      fontSize: '14px', backgroundColor: 'white', cursor: 'pointer', outline: 'none'
                    }}
                  >
                    <option value="all">Todos os Canais</option>
                    <option value="whatsapp">📱 WhatsApp</option>
                    <option value="email">📧 Email</option>
                    <option value="webchat">💬 Chat Web</option>
                    <option value="sms">💬 SMS</option>
                    <option value="instagram">📸 Instagram</option>
                    <option value="facebook">👥 Facebook</option>
                    <option value="telegram">✈️ Telegram</option>
                  </select>
                  <select
                    value={selectedStatus}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedStatus(e.target.value)}
                    style={{
                      padding: '10px 16px', border: '1px solid #d1d5db', borderRadius: '8px',
                      fontSize: '14px', backgroundColor: 'white', cursor: 'pointer', outline: 'none'
                    }}
                  >
                    <option value="all">Todos os Status</option>
                    <option value="open">🟢 Ativas</option>
                    <option value="pending">🟡 Pendentes</option>
                    <option value="resolved">🔵 Resolvidas</option>
                    <option value="closed">⚫ Fechadas</option>
                  </select>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedChannel('all');
                      setSelectedStatus('all');
                    }}
                    style={{ ...buttonStyle, backgroundColor: '#f3f4f6', color: '#374151' }}
                  >
                    🔄 Limpar
                  </button>
                  <button
                    onClick={fetchConversations}
                    style={{ ...buttonStyle, backgroundColor: '#10b981', color: 'white' }}
                  >
                    🔄 Atualizar
                  </button>
                </div>
              </div>

              {/* Real Conversations List */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0' }}>
                    Conversas Reais ({filteredConversations.length})
                  </h2>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => handleConversationClick(conversation)}
                      style={{
                        padding: '16px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        backgroundColor: 'white'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ position: 'relative' }}>
                            <span style={{ fontSize: '24px' }}>{getChannelIcon(conversation.channel)}</span>
                            {conversation.unreadCount > 0 && (
                              <span style={{
                                position: 'absolute',
                                top: '-4px',
                                right: '-4px',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px',
                                fontWeight: 'bold'
                              }}>
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: '500' }}>{conversation.customer.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {conversation.channel}
                              </Badge>
                            </div>
                            <p style={{
                              fontSize: '14px',
                              color: '#6b7280',
                              margin: '4px 0',
                              maxWidth: '400px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {conversation.lastMessage}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                              <Badge className={`text-xs ${getStatusColor(conversation.status)}`}>
                                {conversation.status}
                              </Badge>
                              <Badge className={`text-xs ${getPriorityColor(conversation.priority)}`}>
                                {conversation.priority}
                              </Badge>
                              {conversation.agent && (
                                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                  Agente: {conversation.agent}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                            {formatTime(conversation.timestamp)}
                          </div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                setSelectedConversation(conversation);
                                setView('customer360');
                              }}
                              style={{
                                padding: '4px 8px',
                                fontSize: '12px',
                                backgroundColor: '#8b5cf6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              👤 360°
                            </button>
                            <button
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                updateConversationStatus(conversation.id, 'resolved');
                              }}
                              style={{
                                padding: '4px 8px',
                                fontSize: '12px',
                                backgroundColor: '#f3f4f6',
                                color: '#374151',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              ✅ Resolver
                            </button>
                            <button
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                handleConversationClick(conversation);
                              }}
                              style={{
                                padding: '4px 8px',
                                fontSize: '12px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              💬 Responder
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredConversations.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                      <p>Nenhuma conversa encontrada</p>
                      <p style={{ fontSize: '14px' }}>Ajuste os filtros ou aguarde novas mensagens</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat View - Real Messages */}
        {view === 'chat' && selectedConversation && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={() => setView('dashboard')}
                    style={{ ...buttonStyle, backgroundColor: '#f3f4f6', color: '#374151' }}
                  >
                    ← Voltar
                  </button>
                  <span style={{ fontSize: '24px' }}>{getChannelIcon(selectedConversation.channel)}</span>
                  <div>
                    <h3 style={{ fontWeight: '600', margin: '0' }}>{selectedConversation.customer.name}</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
                      {selectedConversation.customer.phone} • ID: {selectedConversation.id}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Badge className={`text-xs ${getStatusColor(selectedConversation.status)}`}>
                    {selectedConversation.status}
                  </Badge>
                  <Badge className={`text-xs ${getPriorityColor(selectedConversation.priority)}`}>
                    {selectedConversation.priority}
                  </Badge>
                </div>
              </div>

              {/* Real Messages */}
              <div style={{
                height: '400px',
                overflowY: 'auto',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                {messages.map((message) => (
                  <div key={message.id} style={{ 
                    display: 'flex', 
                    justifyContent: message.sender_type === 'agent' ? 'flex-end' : 'flex-start', 
                    marginBottom: '16px' 
                  }}>
                    <div style={{
                      maxWidth: '70%',
                      backgroundColor: message.sender_type === 'agent' ? '#3b82f6' : 'white',
                      color: message.sender_type === 'agent' ? 'white' : '#1f2937',
                      padding: '12px',
                      borderRadius: '12px',
                      border: message.sender_type === 'agent' ? 'none' : '1px solid #e5e7eb'
                    }}>
                      <p style={{ fontSize: '14px', margin: '0 0 4px 0' }}>
                        {message.content}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ 
                          fontSize: '12px', 
                          opacity: message.sender_type === 'agent' ? '0.8' : '0.6' 
                        }}>
                          {message.sender_name}
                        </span>
                        <span style={{ 
                          fontSize: '12px', 
                          opacity: message.sender_type === 'agent' ? '0.8' : '0.6' 
                        }}>
                          {new Date(message.created_at).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', color: '#6b7280', marginTop: '50px' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
                    <p>Nenhuma mensagem ainda</p>
                    <p style={{ fontSize: '14px' }}>Inicie a conversa enviando uma mensagem</p>
                  </div>
                )}
              </div>

              {/* Status Actions */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {[
                  { status: 'open', label: '🟢 Abrir', color: '#10b981' },
                  { status: 'pending', label: '🟡 Pendente', color: '#f59e0b' },
                  { status: 'resolved', label: '🔵 Resolver', color: '#3b82f6' },
                  { status: 'closed', label: '⚫ Fechar', color: '#6b7280' }
                ].map((item) => (
                  <button
                    key={item.status}
                    onClick={() => updateConversationStatus(selectedConversation.id, item.status)}
                    disabled={selectedConversation.status === item.status}
                    style={{
                      ...buttonStyle,
                      backgroundColor: selectedConversation.status === item.status ? '#f3f4f6' : item.color,
                      color: selectedConversation.status === item.status ? '#9ca3af' : 'white',
                      cursor: selectedConversation.status === item.status ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Message Input - Real */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  style={{ ...buttonStyle, backgroundColor: '#f3f4f6', color: '#374151' }}
                >
                  📝
                </button>
                <Textarea
                  value={newMessage}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewMessage(e.target.value)}
                  placeholder="Digite sua mensagem real..."
                  className="flex-1 min-h-[40px] max-h-[100px] resize-none"
                  style={{ flex: 1 }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  style={{
                    ...buttonStyle,
                    backgroundColor: newMessage.trim() ? '#3b82f6' : '#f3f4f6',
                    color: newMessage.trim() ? 'white' : '#9ca3af',
                    cursor: newMessage.trim() ? 'pointer' : 'not-allowed'
                  }}
                >
                  📨 Enviar
                </button>
              </div>
            </div>

            {/* Customer Details Sidebar - Real Data */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={cardStyle}>
                <h3 style={{ fontWeight: '600', marginBottom: '12px' }}>Detalhes Reais do Cliente</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: 'ID', value: selectedConversation.customer.id },
                    { label: 'Nome', value: selectedConversation.customer.name },
                    { label: 'Telefone', value: selectedConversation.customer.phone },
                    { label: 'Email', value: selectedConversation.customer.email },
                    { label: 'Canal', value: selectedConversation.channel },
                    { label: 'Conversa ID', value: selectedConversation.id }
                  ].map((item, index) => (
                    <div key={index}>
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.label}:</span>
                      <p style={{ fontSize: '14px', margin: '0' }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={cardStyle}>
                <h3 style={{ fontWeight: '600', marginBottom: '12px' }}>Ações Funcionais</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { 
                      label: '🔍 Visão 360° Real', 
                      action: () => setView('customer360'),
                      color: '#8b5cf6'
                    },
                    { 
                      label: '📞 Ligar', 
                      action: () => window.open(`tel:${selectedConversation.customer.phone}`),
                      color: '#10b981'
                    },
                    { 
                      label: '📧 Enviar Email', 
                      action: () => window.open(`mailto:${selectedConversation.customer.email}`),
                      color: '#3b82f6'
                    },
                    { 
                      label: '🎫 Criar Ticket', 
                      action: () => setView('tickets'),
                      color: '#f59e0b'
                    }
                  ].map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      style={{
                        ...buttonStyle,
                        backgroundColor: action.color,
                        color: 'white',
                        width: '100%',
                        textAlign: 'left'
                      }}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Templates View - Real */}
        {view === 'templates' && (
          <div style={{ width: '100%' }}>
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0' }}>Templates Reais do Sistema</h2>
                <button
                  onClick={() => setView('dashboard')}
                  style={{ ...buttonStyle, backgroundColor: '#f3f4f6', color: '#374151' }}
                >
                  ← Voltar
                </button>
              </div>
              
              <ResponseTemplates 
                onTemplateSelect={(template) => {
                  setNewMessage(template.content);
                  setView('chat');
                }}
              />
            </div>
          </div>
        )}

        {/* Customer 360 View - Real Timeline */}
        {view === 'customer360' && selectedConversation && (
          <div style={{ width: '100%' }}>
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0' }}>
                  👤 Visão 360° Real - {selectedConversation.customer.name}
                </h2>
                <button
                  onClick={() => setView('dashboard')}
                  style={{ ...buttonStyle, backgroundColor: '#f3f4f6', color: '#374151' }}
                >
                  ← Voltar
                </button>
              </div>
              
              <Timeline360 customerId={selectedConversation.customer.id} />
            </div>
          </div>
        )}

        {/* Broadcast View - Real Implementation */}
        {view === 'broadcast' && (
          <div style={{ width: '100%' }}>
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0' }}>📢 Broadcast Real</h2>
                <button
                  onClick={() => setView('dashboard')}
                  style={{ ...buttonStyle, backgroundColor: '#f3f4f6', color: '#374151' }}
                >
                  ← Voltar
                </button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
                <div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>
                      Mensagem do Broadcast
                    </label>
                    <Textarea
                      value={broadcastMessage}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBroadcastMessage(e.target.value)}
                      placeholder="Digite a mensagem que será enviada para todos os contatos..."
                      style={{ minHeight: '120px', width: '100%' }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>
                      Selecionar Canais
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                      {['whatsapp', 'email', 'sms', 'telegram'].map((channel) => (
                        <label key={channel} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={broadcastChannels.includes(channel)}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              if (e.target.checked) {
                                setBroadcastChannels([...broadcastChannels, channel]);
                              } else {
                                setBroadcastChannels(broadcastChannels.filter(c => c !== channel));
                              }
                            }}
                          />
                          <span>{getChannelIcon(channel)}</span>
                          <span style={{ textTransform: 'capitalize' }}>{channel}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={sendBroadcast}
                    disabled={broadcasting || !broadcastMessage.trim() || broadcastChannels.length === 0}
                    style={{
                      ...buttonStyle,
                      backgroundColor: (!broadcasting && broadcastMessage.trim() && broadcastChannels.length > 0) ? '#10b981' : '#f3f4f6',
                      color: (!broadcasting && broadcastMessage.trim() && broadcastChannels.length > 0) ? 'white' : '#9ca3af',
                      cursor: (!broadcasting && broadcastMessage.trim() && broadcastChannels.length > 0) ? 'pointer' : 'not-allowed',
                      width: 'auto',
                      padding: '12px 24px'
                    }}
                  >
                    {broadcasting ? '📡 Enviando...' : '📢 Enviar Broadcast Real'}
                  </button>
                </div>
                
                <div style={cardStyle}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>ℹ️ Como Funciona</h3>
                  <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
                    <p>• Conecta com APIs reais de cada canal</p>
                    <p>• Envia para todos os contatos ativos</p>
                    <p>• Acompanha métricas de entrega</p>
                    <p>• Respeita preferências de opt-out</p>
                    <p>• Log completo de todas as mensagens</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Agents Management View */}
        {view === 'agents' && (
          <div style={{ width: '100%' }}>
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0' }}>👥 Gestão de Agentes</h2>
                <button
                  onClick={() => setView('dashboard')}
                  style={{ ...buttonStyle, backgroundColor: '#f3f4f6', color: '#374151' }}
                >
                  ← Voltar
                </button>
              </div>
              
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>👥</div>
                <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>Sistema de Gestão de Agentes</h3>
                <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                  Funcionalidade em desenvolvimento - será implementada na próxima versão
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', textAlign: 'left' }}>
                  {[
                    '👤 Cadastro de agentes',
                    '📊 Métricas por agente',
                    '⏰ Controle de horários',
                    '🎯 Metas e KPIs',
                    '📱 Status online/offline',
                    '🔄 Redistribuição de conversas'
                  ].map((feature, index) => (
                    <div key={index} style={{ 
                      padding: '12px', 
                      backgroundColor: '#f8fafc', 
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tickets System View */}
        {view === 'tickets' && (
          <div style={{ width: '100%' }}>
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0' }}>🎫 Sistema de Tickets</h2>
                <button
                  onClick={() => setView('dashboard')}
                  style={{ ...buttonStyle, backgroundColor: '#f3f4f6', color: '#374151' }}
                >
                  ← Voltar
                </button>
              </div>
              
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎫</div>
                <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>Sistema de Suporte</h3>
                <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                  Sistema completo de tickets já está implementado em /admin/support
                </p>
                <button
                  onClick={() => window.open('/admin/support', '_blank')}
                  style={{
                    ...buttonStyle,
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '12px 24px'
                  }}
                >
                  🚀 Acessar Sistema de Suporte
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}