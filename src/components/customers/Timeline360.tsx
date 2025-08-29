'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TimelineEvent {
  id: string;
  type: 'message' | 'booking' | 'payment' | 'call' | 'email' | 'note' | 'status_change';
  title: string;
  description: string;
  timestamp: Date;
  channel?: string;
  metadata?: Record<string, unknown>;
  agent?: string;
  value?: number;
  status?: string;
}

interface Customer360Data {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'prospect' | 'customer' | 'vip' | 'premium';
  totalInteractions: number;
  totalBookings: number;
  totalSpent: number;
  firstContact: Date;
  lastContact: Date;
  conversationCount: number;
  averageResponseTime: number;
  customerSatisfaction: number;
  preferredChannels: string[];
  timeline: TimelineEvent[];
}

interface Timeline360Props {
  customerId: number;
}

const Timeline360: React.FC<Timeline360Props> = ({ customerId }) => {
  const [customerData, setCustomerData] = useState<Customer360Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');

  const fetchCustomer360Data = async (): Promise<void> => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/customers/${customerId}/360`);
      const result = await response.json();
      
      if (result.success) {
        // Converter strings de data para objetos Date
        const data = result.data;
        data.firstContact = new Date(data.firstContact);
        data.lastContact = new Date(data.lastContact);
        data.timeline = data.timeline.map((event: TimelineEvent) => ({
          ...event,
          timestamp: new Date(event.timestamp)
        }));
        
        setCustomerData(data);
      } else {
        console.error('Error fetching customer 360 data:', result.error);
        
        // Fallback para dados mock em caso de erro
        const mockData: Customer360Data = {
          id: customerId,
          name: 'Cliente Mock',
          email: 'mock@email.com',
          phone: '+55 11 99999-9999',
          status: 'customer',
          totalInteractions: 5,
          totalBookings: 1,
          totalSpent: 5000,
          firstContact: new Date('2023-01-15'),
          lastContact: new Date('2024-01-20'),
          conversationCount: 2,
          averageResponseTime: 2.5,
          customerSatisfaction: 4.5,
          preferredChannels: ['whatsapp'],
          timeline: [
            {
              id: '1',
              type: 'message',
              title: 'Primeira mensagem via WhatsApp',
              description: 'Cliente iniciou conversa perguntando sobre pacotes',
              timestamp: new Date('2024-01-20T10:30:00'),
              channel: 'whatsapp',
              agent: 'Sistema'
            }
          ]
        };
        setCustomerData(mockData);
      }
    } catch (error) {
      console.error('Error fetching customer 360 data:', error);
      
      // Fallback para dados mock em caso de erro
      const mockData: Customer360Data = {
        id: customerId,
        name: 'Cliente Mock',
        email: 'mock@email.com',
        phone: '+55 11 99999-9999',
        status: 'customer',
        totalInteractions: 5,
        totalBookings: 1,
        totalSpent: 5000,
        firstContact: new Date('2023-01-15'),
        lastContact: new Date('2024-01-20'),
        conversationCount: 2,
        averageResponseTime: 2.5,
        customerSatisfaction: 4.5,
        preferredChannels: ['whatsapp'],
        timeline: [
          {
            id: '1',
            type: 'message',
            title: 'Primeira mensagem via WhatsApp',
            description: 'Cliente iniciou conversa perguntando sobre pacotes',
            timestamp: new Date('2024-01-20T10:30:00'),
            channel: 'whatsapp',
            agent: 'Sistema'
          }
        ]
      };
      setCustomerData(mockData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer360Data();
  }, [customerId]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'message': return '💬';
      case 'booking': return '✈️';
      case 'payment': return '💳';
      case 'call': return '📞';
      case 'email': return '📧';
      case 'note': return '📝';
      case 'status_change': return '⭐';
      default: return '📋';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'message': return 'bg-blue-100 border-blue-300';
      case 'booking': return 'bg-green-100 border-green-300';
      case 'payment': return 'bg-emerald-100 border-emerald-300';
      case 'call': return 'bg-purple-100 border-purple-300';
      case 'email': return 'bg-orange-100 border-orange-300';
      case 'note': return 'bg-gray-100 border-gray-300';
      case 'status_change': return 'bg-yellow-100 border-yellow-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return '📱';
      case 'email': return '📧';
      case 'phone': return '📞';
      case 'instagram': return '📸';
      case 'facebook': return '👥';
      case 'webchat': return '💬';
      default: return '🌐';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const filteredTimeline = customerData?.timeline.filter(event => {
    if (filter === 'all') return true;
    return event.type === filter;
  }) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!customerData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Cliente não encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com métricas 360 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {customerData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{customerData.name}</h2>
              <p className="text-gray-500">{customerData.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {customerData.status.toUpperCase()}
                </Badge>
                <span className="text-sm text-gray-500">
                  Cliente desde {formatDateTime(customerData.firstContact)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas 360 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{customerData.totalInteractions}</div>
            <div className="text-sm text-gray-600">Interações</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{customerData.totalBookings}</div>
            <div className="text-sm text-gray-600">Reservas</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(customerData.totalSpent)}</div>
            <div className="text-sm text-gray-600">Gasto Total</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{customerData.customerSatisfaction}/5</div>
            <div className="text-sm text-gray-600">Satisfação</div>
          </div>
        </div>

        {/* Canais preferidos */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Canais Preferidos</h3>
          <div className="flex space-x-2">
            {customerData.preferredChannels.map(channel => (
              <Badge key={channel} variant="secondary" className="text-xs">
                {getChannelIcon(channel)} {channel}
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="text-sm font-medium text-gray-700 mr-2">Filtrar por tipo:</label>
            <select 
              value={filter} 
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Todos</option>
              <option value="message">Mensagens</option>
              <option value="booking">Reservas</option>
              <option value="payment">Pagamentos</option>
              <option value="call">Ligações</option>
              <option value="email">Emails</option>
              <option value="note">Anotações</option>
              <option value="status_change">Mudanças de Status</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => setDateRange('today')}>
              Hoje
            </Button>
            <Button variant="outline" size="sm" onClick={() => setDateRange('week')}>
              Esta semana
            </Button>
            <Button variant="outline" size="sm" onClick={() => setDateRange('month')}>
              Este mês
            </Button>
            <Button variant="outline" size="sm" onClick={() => setDateRange('all')}>
              Todos
            </Button>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Histórico Completo ({filteredTimeline.length} eventos)</h3>
        
        <div className="space-y-4">
          {filteredTimeline.map((event, index) => (
            <div key={event.id} className="flex items-start space-x-4">
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${getEventColor(event.type)}`}>
                  <span className="text-lg">{getEventIcon(event.type)}</span>
                </div>
                {index < filteredTimeline.length - 1 && (
                  <div className="w-px h-16 bg-gray-200 mt-2"></div>
                )}
              </div>
              
              {/* Event content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    {event.channel && (
                      <Badge variant="outline" className="text-xs">
                        {getChannelIcon(event.channel)} {event.channel}
                      </Badge>
                    )}
                    {event.value && (
                      <Badge variant="secondary" className="text-xs">
                        {formatCurrency(event.value)}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDateTime(event.timestamp)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                
                {event.agent && (
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs text-gray-500">Por:</span>
                    <Badge variant="outline" className="text-xs">
                      {event.agent}
                    </Badge>
                  </div>
                )}
                
                {event.metadata && Object.keys(event.metadata).length > 0 && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                    {Object.entries(event.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600">{key}:</span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Timeline360;