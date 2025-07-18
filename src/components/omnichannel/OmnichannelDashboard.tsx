'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConversationWithDetails } from '@/lib/omnichannel-api';
import NotificationSystem from './NotificationSystem';

interface DashboardStats {
  totalConversations: number;
  activeConversations: number;
  pendingConversations: number;
  avgResponseTime: number;
  customerSatisfaction: number;
  channelBreakdown: Record<string, number>;
}

interface OmnichannelDashboardProps {
  agentId?: number;
}

const OmnichannelDashboard: React.FC<OmnichannelDashboardProps> = ({ agentId }) => {
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
    }, 10000); // Atualiza a cada 10 segundos

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
      case 'whatsapp': return '📱';
      case 'email': return '📧';
      case 'webchat': return '💬';
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
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-blue-500';
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Central de Comunicação</h1>
        <div className="flex items-center space-x-3">
          <Badge variant="secondary">
            {conversations.length} conversas ativas
          </Badge>
          <Badge variant="outline">
            {conversations.filter(c => c.unread_count > 0).length} não lidas
          </Badge>
          <NotificationSystem 
            agentId={agentId} 
            onNotificationClick={(notification) => {
              if (notification.conversationId) {
                const conversation = conversations.find(c => c.id === notification.conversationId);
                if (conversation) {
                  handleConversationClick(conversation);
                }
              }
            }}
          />
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversas Ativas</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeConversations}</p>
              </div>
              <div className="text-2xl">💬</div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingConversations}</p>
              </div>
              <div className="text-2xl">⏳</div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalConversations}</p>
              </div>
              <div className="text-2xl">📊</div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Canais</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Object.keys(stats.channelBreakdown).length}
                </p>
              </div>
              <div className="text-2xl">🌐</div>
            </div>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-2">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Conversas</h2>
              <Button 
                onClick={fetchConversations}
                variant="outline"
                size="sm"
              >
                🔄 Atualizar
              </Button>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => handleConversationClick(conversation)}
                  className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation?.id === conversation.id ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getChannelColor(conversation.channel)}`}></div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{getChannelIcon(conversation.channel)}</span>
                          <span className="font-medium text-sm">
                            {conversation.customer.name || conversation.customer.phone || 'Cliente'}
                          </span>
                          {conversation.unread_count > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {conversation.last_message?.content.slice(0, 50) || 'Sem mensagens'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getPriorityColor(conversation.priority)}`}
                        >
                          {conversation.priority}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {conversation.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {conversation.last_message ? formatTime(conversation.last_message.created_at) : ''}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Conversation Details */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Detalhes da Conversa</h2>
            
            {selectedConversation ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-gray-700">Cliente</h3>
                  <p className="text-sm">
                    {selectedConversation.customer.name || 'Sem nome'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedConversation.customer.phone || selectedConversation.customer.email}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-sm text-gray-700">Canal</h3>
                  <div className="flex items-center space-x-2">
                    <span>{getChannelIcon(selectedConversation.channel)}</span>
                    <span className="text-sm capitalize">{selectedConversation.channel}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-sm text-gray-700">Status</h3>
                  <Badge variant="outline" className="text-xs">
                    {selectedConversation.status}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-medium text-sm text-gray-700">Prioridade</h3>
                  <Badge className={`text-xs ${getPriorityColor(selectedConversation.priority)}`}>
                    {selectedConversation.priority}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-medium text-sm text-gray-700">Mensagens</h3>
                  <p className="text-sm">{selectedConversation.messages.length} mensagens</p>
                  <p className="text-xs text-gray-500">
                    {selectedConversation.unread_count} não lidas
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <Button 
                    className="w-full"
                    onClick={() => {
                      // Abrir conversa para atendimento
                      window.open(`/admin/support/conversation/${selectedConversation.id}`, '_blank');
                    }}
                  >
                    Abrir Conversa
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Selecione uma conversa para ver os detalhes
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OmnichannelDashboard;