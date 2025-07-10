'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  EyeIcon, 
  PhoneIcon,
  EnvelopeIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  event_name: string;
  event_count: number;
  total_value: number;
  avg_value: number;
  campaign_source: string;
  campaign_medium: string;
  event_date: string;
}

interface CampaignStats {
  total_events: number;
  total_conversions: number;
  total_value: number;
  avg_cpa: number;
  conversion_rate: number;
  top_sources: Array<{
    source: string;
    events: number;
    value: number;
  }>;
}

export default function CampaignDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedEvent, setSelectedEvent] = useState('all');

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        days: selectedPeriod,
        ...(selectedEvent !== 'all' && { event: selectedEvent })
      });

      const response = await fetch(`/api/analytics/track?${params}`);
      const data = await response.json();

      if (data.success) {
        setAnalyticsData(data.data);
        calculateStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, selectedEvent]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const calculateStats = (data: AnalyticsData[]) => {
    const totalEvents = data.reduce((sum, item) => sum + item.event_count, 0);
    const totalConversions = data
      .filter(item => ['form_submission', 'phone_click', 'whatsapp_click'].includes(item.event_name))
      .reduce((sum, item) => sum + item.event_count, 0);
    const totalValue = data.reduce((sum, item) => sum + (item.total_value || 0), 0);
    const avgCPA = totalConversions > 0 ? totalValue / totalConversions : 0;
    const conversionRate = totalEvents > 0 ? (totalConversions / totalEvents) * 100 : 0;

    // Top sources
    const sourceMap = new Map();
    data.forEach(item => {
      if (item.campaign_source) {
        const existing = sourceMap.get(item.campaign_source) || { events: 0, value: 0 };
        sourceMap.set(item.campaign_source, {
          events: existing.events + item.event_count,
          value: existing.value + (item.total_value || 0)
        });
      }
    });

    const topSources = Array.from(sourceMap.entries())
      .map(([source, data]) => ({ source, ...data }))
      .sort((a, b) => b.events - a.events)
      .slice(0, 5);

    setStats({
      total_events: totalEvents,
      total_conversions: totalConversions,
      total_value: totalValue,
      avg_cpa: avgCPA,
      conversion_rate: conversionRate,
      top_sources: topSources
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const getEventIcon = (eventName: string) => {
    switch (eventName) {
      case 'form_submission':
        return <EnvelopeIcon className="w-5 h-5" />;
      case 'phone_click':
        return <PhoneIcon className="w-5 h-5" />;
      case 'whatsapp_click':
        return <PhoneIcon className="w-5 h-5" />;
      case 'page_view':
        return <EyeIcon className="w-5 h-5" />;
      default:
        return <ChartBarIcon className="w-5 h-5" />;
    }
  };

  const getSourceColor = (source: string) => {
    const colors = {
      google: 'bg-blue-100 text-blue-800',
      facebook: 'bg-blue-100 text-blue-800',
      instagram: 'bg-pink-100 text-pink-800',
      bing: 'bg-orange-100 text-orange-800',
      linkedin: 'bg-blue-100 text-blue-800',
      organic: 'bg-green-100 text-green-800',
      direct: 'bg-gray-100 text-gray-800',
    };
    return colors[source as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados das campanhas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard de Campanhas</h1>
            <p className="mt-1 text-gray-600">Monitore o desempenho dos anúncios pagos em tempo real</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Período
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="7">Últimos 7 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="90">Últimos 90 dias</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Evento
              </label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">Todos os eventos</option>
                <option value="form_submission">Formulários</option>
                <option value="phone_click">Cliques no telefone</option>
                <option value="whatsapp_click">Cliques WhatsApp</option>
                <option value="page_view">Visualizações</option>
              </select>
            </div>

            <div className="flex-1"></div>
            
            <button
              onClick={fetchAnalyticsData}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Atualizar Dados
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <EyeIcon className="w-8 h-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Eventos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total_events.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <ArrowTrendingUpIcon className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Conversões</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total_conversions}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <CurrencyDollarIcon className="w-8 h-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Valor Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.total_value)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <ChartBarIcon className="w-8 h-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">CPA Médio</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.avg_cpa)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <ArrowTrendingUpIcon className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.conversion_rate.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Sources */}
          {stats && stats.top_sources.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Top Fontes de Tráfego
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {stats.top_sources.map((source, index) => (
                    <div key={source.source} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getSourceColor(source.source)}`}>
                          {source.source || 'Direto'}
                        </div>
                        <span className="ml-3 text-sm text-gray-600">
                          {source.events} eventos
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(source.value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recent Events */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Eventos Recentes
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analyticsData.slice(0, 10).map((event, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getEventIcon(event.event_name)}
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {event.event_name.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {event.campaign_source && `${event.campaign_source} • `}
                          {new Date(event.event_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {event.event_count}x
                      </p>
                      {event.total_value > 0 && (
                        <p className="text-xs text-gray-500">
                          {formatCurrency(event.total_value)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Performance Table */}
        <div className="mt-6 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Desempenho Detalhado
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Evento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fonte
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Eventos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analyticsData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getEventIcon(item.event_name)}
                        <span className="ml-2 text-sm text-gray-900">
                          {item.event_name.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.campaign_source && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSourceColor(item.campaign_source)}`}>
                          {item.campaign_source}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.campaign_medium || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.event_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.total_value ? formatCurrency(item.total_value) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.event_date).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
