'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AnalyticsData {
  period: string;
  generated_at: string;
  overview: {
    conversations: {
      total: number;
      open: number;
      pending: number;
      resolved: number;
      closed: number;
      avg_duration_hours: number;
      last_24h: number;
    };
    messages: {
      total: number;
      inbound: number;
      outbound: number;
      automated: number;
      avg_length: number;
      last_24h: number;
    };
    response_time: {
      avg_minutes: number;
      median_minutes: number;
      p95_minutes: number;
      under_5min_percentage: number;
      under_15min_percentage: number;
      total_responses: number;
    };
    conversion: {
      total_conversations: number;
      quote_requests: number;
      bookings_completed: number;
      qualified_leads: number;
      quote_conversion_rate: number;
      booking_conversion_rate: number;
      lead_qualification_rate: number;
    };
  };
  breakdowns: {
    by_channel: Array<{
      channel: string;
      conversations: number;
      resolved: number;
      resolution_rate: number;
      avg_duration_hours: number;
      unique_customers: number;
    }>;
    by_agent: Array<{
      agent_id: number;
      name: string;
      department: string;
      conversations: number;
      resolved: number;
      resolution_rate: number;
      messages: number;
      avg_duration_hours: number;
      current_load: number;
      max_capacity: number;
      capacity_utilization: number;
    }>;
    by_hour: Array<{
      hour: number;
      conversations: number;
      unique_customers: number;
    }>;
  };
  trends: {
    conversations: {
      current: number;
      previous: number;
      change_percentage: number;
    };
    resolution_rate: {
      current: number;
      previous: number;
      change_percentage: number;
    };
  };
}

interface AdvancedAnalyticsProps {
  agentId?: number;
}

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ agentId }) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');

  useEffect(() => {
    fetchAnalytics();
  }, [period, selectedChannel, selectedDepartment, agentId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        period,
        ...(agentId && { agent_id: agentId.toString() }),
        ...(selectedChannel && { channel: selectedChannel }),
        ...(selectedDepartment && { department: selectedDepartment })
      });

      const response = await fetch(`/api/omnichannel/analytics?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${Math.round(minutes)}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours}h ${remainingMinutes}min`;
  };

  const formatPercentage = (value: number): string => {
    return `${Math.round(value * 100) / 100}%`;
  };

  const getTrendIcon = (percentage: number) => {
    if (percentage > 5) return '📈';
    if (percentage < -5) return '📉';
    return '➡️';
  };

  const getTrendColor = (percentage: number) => {
    if (percentage > 5) return 'text-green-600';
    if (percentage < -5) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChannelIcon = (channel: string) => {
    const icons: Record<string, string> = {
      whatsapp: '💬',
      email: '✉️',
      phone: '📞',
      webchat: '🌐',
      instagram: '📸',
      facebook: '👥'
    };
    return icons[channel] || '📱';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Erro ao carregar analytics</p>
          <Button onClick={fetchAnalytics} className="mt-2">Tentar Novamente</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              📊 Analytics Avançado
            </span>
            <Badge variant="outline">
              Atualizado: {new Date(data.generated_at).toLocaleTimeString('pt-BR')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Último dia</SelectItem>
                <SelectItem value="7d">7 dias</SelectItem>
                <SelectItem value="30d">30 dias</SelectItem>
                <SelectItem value="90d">90 dias</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedChannel} onValueChange={setSelectedChannel}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Canal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os canais</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">SMS</SelectItem>
                <SelectItem value="webchat">Chat Web</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="sales">Vendas</SelectItem>
                <SelectItem value="support">Suporte</SelectItem>
                <SelectItem value="billing">Financeiro</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={fetchAnalytics} variant="outline">
              🔄 Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Conversas</p>
                <p className="text-2xl font-bold">{data.overview.conversations.total}</p>
                <div className={`flex items-center gap-1 text-sm ${getTrendColor(data.trends.conversations.change_percentage)}`}>
                  <span>{getTrendIcon(data.trends.conversations.change_percentage)}</span>
                  <span>{formatPercentage(data.trends.conversations.change_percentage)}</span>
                </div>
              </div>
              <div className="text-3xl">💬</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tempo de Resposta</p>
                <p className="text-2xl font-bold">{formatTime(data.overview.response_time.avg_minutes)}</p>
                <p className="text-sm text-gray-500">
                  Mediana: {formatTime(data.overview.response_time.median_minutes)}
                </p>
              </div>
              <div className="text-3xl">⚡</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa de Resolução</p>
                <p className="text-2xl font-bold">
                  {formatPercentage((data.overview.conversations.resolved / data.overview.conversations.total) * 100)}
                </p>
                <p className="text-sm text-gray-500">
                  {data.overview.conversations.resolved}/{data.overview.conversations.total} resolvidas
                </p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa de Conversão</p>
                <p className="text-2xl font-bold">
                  {formatPercentage(data.overview.conversion.booking_conversion_rate)}
                </p>
                <p className="text-sm text-gray-500">
                  {data.overview.conversion.bookings_completed} reservas
                </p>
              </div>
              <div className="text-3xl">🎯</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance por Canal */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Performance por Canal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.breakdowns.by_channel.map(channel => (
              <div key={channel.channel} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getChannelIcon(channel.channel)}</span>
                  <div>
                    <p className="font-medium capitalize">{channel.channel}</p>
                    <p className="text-sm text-gray-600">
                      {channel.conversations} conversas • {channel.unique_customers} clientes únicos
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">{formatPercentage(channel.resolution_rate)}</p>
                  <p className="text-sm text-gray-600">Taxa de resolução</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance dos Agentes */}
      <Card>
        <CardHeader>
          <CardTitle>👥 Performance dos Agentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Agente</th>
                  <th className="text-center p-2">Conversas</th>
                  <th className="text-center p-2">Taxa Resolução</th>
                  <th className="text-center p-2">Mensagens</th>
                  <th className="text-center p-2">Carga Atual</th>
                  <th className="text-center p-2">Utilização</th>
                </tr>
              </thead>
              <tbody>
                {data.breakdowns.by_agent.map(agent => (
                  <tr key={agent.agent_id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-sm text-gray-600">{agent.department}</p>
                      </div>
                    </td>
                    <td className="text-center p-2">{agent.conversations}</td>
                    <td className="text-center p-2">
                      <Badge variant={agent.resolution_rate > 80 ? 'default' : 'secondary'}>
                        {formatPercentage(agent.resolution_rate)}
                      </Badge>
                    </td>
                    <td className="text-center p-2">{agent.messages}</td>
                    <td className="text-center p-2">
                      {agent.current_load}/{agent.max_capacity}
                    </td>
                    <td className="text-center p-2">
                      <div className="flex items-center justify-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${agent.capacity_utilization > 80 ? 'bg-red-500' : agent.capacity_utilization > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${Math.min(agent.capacity_utilization, 100)}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm">{Math.round(agent.capacity_utilization)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Distribuição por Horário */}
      <Card>
        <CardHeader>
          <CardTitle>🕐 Distribuição por Horário</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-12 gap-2">
            {data.breakdowns.by_hour.map(({ hour, conversations }) => {
              const maxConversations = Math.max(...data.breakdowns.by_hour.map(h => h.conversations));
              const height = maxConversations > 0 ? (conversations / maxConversations) * 100 : 0;
              
              return (
                <div key={hour} className="text-center">
                  <div className="h-20 flex items-end justify-center">
                    <div 
                      className="w-6 bg-blue-500 rounded-t"
                      style={{ height: `${height}%` }}
                      title={`${hour}h: ${conversations} conversas`}
                    ></div>
                  </div>
                  <p className="text-xs mt-1">{hour}h</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Métricas de SLA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>⏱️ SLA de Resposta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Respostas em até 5min</span>
                <Badge variant={data.overview.response_time.under_5min_percentage > 80 ? 'default' : 'destructive'}>
                  {formatPercentage(data.overview.response_time.under_5min_percentage)}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Respostas em até 15min</span>
                <Badge variant={data.overview.response_time.under_15min_percentage > 90 ? 'default' : 'secondary'}>
                  {formatPercentage(data.overview.response_time.under_15min_percentage)}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>P95 (95% das respostas)</span>
                <span className="font-medium">{formatTime(data.overview.response_time.p95_minutes)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🎯 Conversões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Solicitações de Cotação</span>
                <Badge variant="outline">
                  {formatPercentage(data.overview.conversion.quote_conversion_rate)}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Reservas Completadas</span>
                <Badge variant="default">
                  {formatPercentage(data.overview.conversion.booking_conversion_rate)}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Leads Qualificados</span>
                <Badge variant="secondary">
                  {formatPercentage(data.overview.conversion.lead_qualification_rate)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;