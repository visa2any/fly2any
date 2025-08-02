'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConversationWithDetails } from '@/lib/omnichannel-api';

interface DashboardStats {
  totalConversations: number;
  activeConversations: number;
  pendingConversations: number;
  avgResponseTime: number;
  customerSatisfaction: number;
  channelBreakdown: Record<string, number>;
}

interface ModernOmnichannelDashboardProps {
  agentId?: number;
}

const ModernOmnichannelDashboard: React.FC<ModernOmnichannelDashboardProps> = ({ agentId }) => {
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
      case 'whatsapp': return 'bg-green-500';
      case 'email': return 'bg-blue-500';
      case 'webchat': return 'bg-purple-500';
      case 'phone': return 'bg-gray-500';
      case 'instagram': return 'bg-pink-500';
      case 'facebook': return 'bg-blue-600';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'normal': return 'bg-blue-500 text-white';
      case 'low': return 'bg-gray-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Carregando Central Omnichannel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header Premium */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">🌐</span>
                </div>
                Central Omnichannel
              </h1>
              <p className="text-slate-600 mt-2">
                Centralize todas as conversas em um só lugar - WhatsApp, Email, Chat Web e mais
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Sistema Online</span>
              </div>
              <Button 
                variant="outline" 
                className="bg-white hover:bg-slate-50 border-slate-300"
              >
                ⚙️ Configurações
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Premium Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Conversas Ativas</p>
                    <p className="text-3xl font-bold mt-1">{stats.activeConversations}</p>
                    <p className="text-blue-100 text-xs mt-1">+12% esta semana</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center">
                    <span className="text-2xl">💬</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Pendentes</p>
                    <p className="text-3xl font-bold mt-1">{stats.pendingConversations}</p>
                    <p className="text-orange-100 text-xs mt-1">-8% esta semana</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center">
                    <span className="text-2xl">⏳</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Tempo de Resposta</p>
                    <p className="text-3xl font-bold mt-1">2.5min</p>
                    <p className="text-green-100 text-xs mt-1">-15% esta semana</p>
                  </div>
                  <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center">
                    <span className="text-2xl">⚡</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Satisfação</p>
                    <p className="text-3xl font-bold mt-1">4.8/5</p>
                    <p className="text-purple-100 text-xs mt-1">+0.2 esta semana</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-400 rounded-full flex items-center justify-center">
                    <span className="text-2xl">⭐</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Conversations List */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader className="border-b border-slate-100">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="text-blue-500">📋</span>
                    Conversas Ativas
                  </CardTitle>
                  <Button 
                    onClick={fetchConversations}
                    variant="outline"
                    size="sm"
                    className="bg-slate-50 hover:bg-slate-100"
                  >
                    <span className="mr-2">🔄</span>
                    Atualizar
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => handleConversationClick(conversation)}
                      className={`p-4 cursor-pointer transition-all duration-200 hover:bg-slate-50 ${
                        selectedConversation?.id === conversation.id 
                          ? 'bg-blue-50 border-l-4 border-blue-500' 
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getChannelColor(conversation.channel)}`}>
                              <span className="text-white text-lg">{getChannelIcon(conversation.channel)}</span>
                            </div>
                            {conversation.unread_count > 0 && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">{conversation.unread_count}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-slate-900">
                                {conversation.customer.name || conversation.customer.phone || 'Cliente'}
                              </span>
                              <Badge 
                                className={`text-xs ${getPriorityColor(conversation.priority)}`}
                              >
                                {conversation.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 truncate max-w-md">
                              {conversation.last_message?.content || 'Sem mensagens'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <Badge 
                            variant="outline"
                            className={`text-xs mb-2 ${getStatusColor(conversation.status)}`}
                          >
                            {conversation.status}
                          </Badge>
                          <p className="text-xs text-slate-500">
                            {conversation.last_message ? formatTime(conversation.last_message.created_at) : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conversation Details */}
          <div className="lg:col-span-1">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-purple-500">👤</span>
                  Detalhes da Conversa
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-6">
                {selectedConversation ? (
                  <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="font-semibold text-slate-900 mb-3">Cliente</h3>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="font-medium">Nome:</span> {selectedConversation.customer.name || 'Não informado'}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Contato:</span> {selectedConversation.customer.phone || selectedConversation.customer.email || 'Não informado'}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Localização:</span> {selectedConversation.customer.location || 'Não informado'}
                        </p>
                      </div>
                    </div>

                    {/* Channel Info */}
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="font-semibold text-slate-900 mb-3">Canal</h3>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getChannelColor(selectedConversation.channel)}`}>
                          <span className="text-white">{getChannelIcon(selectedConversation.channel)}</span>
                        </div>
                        <span className="text-sm font-medium capitalize">{selectedConversation.channel}</span>
                      </div>
                    </div>

                    {/* Status & Priority */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <h3 className="font-semibold text-slate-900 mb-2">Status</h3>
                        <Badge className={`${getStatusColor(selectedConversation.status)}`}>
                          {selectedConversation.status}
                        </Badge>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <h3 className="font-semibold text-slate-900 mb-2">Prioridade</h3>
                        <Badge className={`${getPriorityColor(selectedConversation.priority)}`}>
                          {selectedConversation.priority}
                        </Badge>
                      </div>
                    </div>

                    {/* Message Stats */}
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="font-semibold text-slate-900 mb-3">Estatísticas</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-600">Mensagens</p>
                          <p className="font-semibold">{selectedConversation.messages.length}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Não lidas</p>
                          <p className="font-semibold text-red-600">{selectedConversation.unread_count}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3"
                      onClick={() => {
                        window.open(`/admin/support/conversation/${selectedConversation.id}`, '_blank');
                      }}
                    >
                      <span className="mr-2">💬</span>
                      Abrir Conversa
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-slate-400 text-2xl">💬</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      Selecione uma conversa
                    </h3>
                    <p className="text-slate-500 text-sm">
                      Escolha uma conversa da lista para ver os detalhes completos
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernOmnichannelDashboard;