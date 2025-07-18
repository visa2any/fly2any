import { AnalyticsData, CampaignStats } from '@/types';

export const calculateStats = (data: AnalyticsData[]): CampaignStats => {
  const totalEvents = data.reduce((sum, item) => sum + item.event_count, 0);
  const totalConversions = data
    .filter(item => ['form_submission', 'phone_click', 'whatsapp_click'].includes(item.event_name))
    .reduce((sum, item) => sum + item.event_count, 0);
  const totalValue = data.reduce((sum, item) => sum + (item.total_value || 0), 0);
  const avgCPA = totalConversions > 0 ? totalValue / totalConversions : 0;
  const conversionRate = totalEvents > 0 ? (totalConversions / totalEvents) * 100 : 0;

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

  return {
    total_events: totalEvents,
    total_conversions: totalConversions,
    total_value: totalValue,
    avg_cpa: avgCPA,
    conversion_rate: conversionRate,
    top_sources: topSources
  };
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};

export const getSourceColor = (source: string): string => {
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

export const formatEventName = (eventName: string): string => {
  const eventNames = {
    form_submission: 'Formulário',
    phone_click: 'Clique no Telefone',
    whatsapp_click: 'Clique no WhatsApp',
    page_view: 'Visualização',
  };
  return eventNames[eventName as keyof typeof eventNames] || eventName.replace('_', ' ');
};