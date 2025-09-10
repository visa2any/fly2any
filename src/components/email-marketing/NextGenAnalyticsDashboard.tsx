'use client';

/**
 * 📊 Next-Gen Analytics Dashboard (2025)
 * Real-time engagement heatmaps, cultural metrics, and predictive analytics
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  RadialLinearScale
} from 'chart.js';
import { Line, Bar, Doughnut, PolarArea, Radar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

interface AnalyticsData {
  realTimeMetrics: RealTimeMetrics;
  culturalInsights: CulturalInsights;
  engagementHeatmap: EngagementHeatmap;
  predictiveAnalytics: PredictiveAnalytics;
  revenueAttribution: RevenueAttribution;
  campaignPerformance: CampaignPerformance[];
  segmentAnalysis: SegmentAnalysis;
  deviceBreakdown: DeviceBreakdown;
  geographicDistribution: GeographicDistribution;
}

interface RealTimeMetrics {
  activeUsers: number;
  emailsInQueue: number;
  openRateLast24h: number;
  clickRateLast24h: number;
  conversionRateLast24h: number;
  revenueToday: number;
  campaignsActive: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

interface CulturalInsights {
  generationBreakdown: { generation: string; count: number; engagement: number }[];
  culturalEventImpact: { event: string; boost: number; reach: number }[];
  diasporaPerformance: { community: string; openRate: number; clickRate: number; ltv: number }[];
  languagePreferences: { language: string; percentage: number; performance: number }[];
}

interface EngagementHeatmap {
  timeSlots: { hour: number; day: string; engagement: number; opens: number; clicks: number }[];
  deviceEngagement: { device: string; timeSlots: number[] }[];
  geographicEngagement: { location: string; coordinates: [number, number]; engagement: number }[];
}

interface PredictiveAnalytics {
  churnRiskPrediction: { timeframe: string; predicted: number; actual?: number }[];
  lifetimeValuePrediction: { segment: string; predicted: number; confidence: number }[];
  travelIntentForecast: { month: string; score: number; factors: string[] }[];
  engagementTrends: { metric: string; trend: 'up' | 'down' | 'stable'; prediction: number }[];
}

interface RevenueAttribution {
  channelAttribution: { channel: string; revenue: number; percentage: number }[];
  campaignROI: { campaign: string; spent: number; revenue: number; roi: number }[];
  customerJourney: { stage: string; value: number; conversionRate: number }[];
}

interface CampaignPerformance {
  id: string;
  name: string;
  type: string;
  sent: number;
  opened: number;
  clicked: number;
  converted: number;
  revenue: number;
  culturalResonance: number;
  sentDate: string;
}

interface SegmentAnalysis {
  topPerformingSegments: { name: string; engagement: number; revenue: number; growth: number }[];
  segmentEvolution: { date: string; segments: { name: string; size: number }[] }[];
  aiSegmentSuggestions: { name: string; potentialValue: number; confidence: number }[];
}

interface DeviceBreakdown {
  devices: { device: string; users: number; engagement: number; revenue: number }[];
  trends: { date: string; mobile: number; desktop: number; tablet: number }[];
}

interface GeographicDistribution {
  countries: { country: string; users: number; revenue: number; growth: number }[];
  cities: { city: string; users: number; engagement: number; culturalScore: number }[];
}

const NextGenAnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'cultural' | 'predictive' | 'revenue'>('overview');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const websocketRef = useRef<WebSocket | null>(null);

  // Real-time data updates
  useEffect(() => {
    if (realTimeEnabled) {
      // Simulate WebSocket connection for real-time updates
      const interval = setInterval(() => {
        fetchRealTimeMetrics();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [realTimeEnabled]);

  // Fetch initial analytics data
  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Simulate fetching comprehensive analytics data
      const mockData: AnalyticsData = {
        realTimeMetrics: {
          activeUsers: 1247,
          emailsInQueue: 3821,
          openRateLast24h: 28.4,
          clickRateLast24h: 4.7,
          conversionRateLast24h: 2.1,
          revenueToday: 15847,
          campaignsActive: 7,
          systemHealth: 'healthy'
        },
        culturalInsights: {
          generationBreakdown: [
            { generation: 'Primeira', count: 12847, engagement: 34.2 },
            { generation: 'Segunda', count: 18392, engagement: 28.7 },
            { generation: 'Terceira', count: 7561, engagement: 22.1 }
          ],
          culturalEventImpact: [
            { event: 'Carnaval 2025', boost: 67.3, reach: 28491 },
            { event: 'Copa América', boost: 45.1, reach: 19284 },
            { event: 'Festa Junina', boost: 32.8, reach: 15672 }
          ],
          diasporaPerformance: [
            { community: 'Miami', openRate: 32.1, clickRate: 5.2, ltv: 8947 },
            { community: 'New York', openRate: 29.8, clickRate: 4.8, ltv: 9234 },
            { community: 'Boston', openRate: 35.2, clickRate: 6.1, ltv: 10582 },
            { community: 'Orlando', openRate: 28.4, clickRate: 4.3, ltv: 7621 },
            { community: 'Los Angeles', openRate: 26.7, clickRate: 4.1, ltv: 8193 }
          ],
          languagePreferences: [
            { language: 'Português', percentage: 67.2, performance: 31.4 },
            { language: 'Bilíngue', percentage: 28.1, performance: 25.8 },
            { language: 'English', percentage: 4.7, performance: 18.9 }
          ]
        },
        engagementHeatmap: {
          timeSlots: generateHeatmapData(),
          deviceEngagement: [
            { device: 'Mobile', timeSlots: Array.from({ length: 24 }, (_, i) => Math.random() * 100) },
            { device: 'Desktop', timeSlots: Array.from({ length: 24 }, (_, i) => Math.random() * 60) },
            { device: 'Tablet', timeSlots: Array.from({ length: 24 }, (_, i) => Math.random() * 30) }
          ],
          geographicEngagement: [
            { location: 'Miami', coordinates: [25.7617, -80.1918], engagement: 89.2 },
            { location: 'São Paulo', coordinates: [-23.5505, -46.6333], engagement: 95.1 },
            { location: 'New York', coordinates: [40.7128, -74.0060], engagement: 78.4 }
          ]
        },
        predictiveAnalytics: {
          churnRiskPrediction: [
            { timeframe: 'Janeiro', predicted: 8.2 },
            { timeframe: 'Fevereiro', predicted: 12.1 },
            { timeframe: 'Março', predicted: 15.3 },
            { timeframe: 'Abril', predicted: 9.7 }
          ],
          lifetimeValuePrediction: [
            { segment: 'Premium Travelers', predicted: 12847, confidence: 87.2 },
            { segment: 'Family Reconnectors', predicted: 8921, confidence: 79.4 },
            { segment: 'Cultural Ambassadors', predicted: 15234, confidence: 91.8 }
          ],
          travelIntentForecast: [
            { month: 'Jan', score: 72.1, factors: ['Reveillon', 'Férias'] },
            { month: 'Feb', score: 85.3, factors: ['Carnaval', 'Verão'] },
            { month: 'Mar', score: 68.7, factors: ['Outono', 'Escola'] }
          ],
          engagementTrends: [
            { metric: 'Open Rate', trend: 'up', prediction: 32.4 },
            { metric: 'Click Rate', trend: 'stable', prediction: 4.8 },
            { metric: 'Conversion Rate', trend: 'up', prediction: 2.3 }
          ]
        },
        revenueAttribution: {
          channelAttribution: [
            { channel: 'Email', revenue: 145820, percentage: 58.2 },
            { channel: 'WhatsApp', revenue: 62341, percentage: 24.9 },
            { channel: 'Instagram', revenue: 28490, percentage: 11.4 },
            { channel: 'SMS', revenue: 13749, percentage: 5.5 }
          ],
          campaignROI: [
            { campaign: 'Carnaval 2025', spent: 12000, revenue: 48500, roi: 304.2 },
            { campaign: 'Saudade Series', spent: 8500, revenue: 31200, roi: 267.1 },
            { campaign: 'Family Reunion', spent: 15000, revenue: 52800, roi: 252.0 }
          ],
          customerJourney: [
            { stage: 'Awareness', value: 100, conversionRate: 12.4 },
            { stage: 'Interest', value: 85, conversionRate: 28.7 },
            { stage: 'Consideration', value: 65, conversionRate: 45.2 },
            { stage: 'Purchase', value: 40, conversionRate: 68.9 }
          ]
        },
        campaignPerformance: [
          {
            id: '1',
            name: 'Carnaval Dreams 2025',
            type: 'Cultural Event',
            sent: 15420,
            opened: 4926,
            clicked: 738,
            converted: 156,
            revenue: 48500,
            culturalResonance: 89.2,
            sentDate: '2025-01-15'
          },
          {
            id: '2',
            name: 'Saudade do Brasil',
            type: 'Nostalgia',
            sent: 12834,
            opened: 4102,
            clicked: 615,
            converted: 129,
            revenue: 31200,
            culturalResonance: 94.7,
            sentDate: '2025-01-10'
          }
        ],
        segmentAnalysis: {
          topPerformingSegments: [
            { name: 'Cultural Ambassadors', engagement: 42.1, revenue: 15234, growth: 18.3 },
            { name: 'Premium Travelers', engagement: 38.7, revenue: 12847, growth: 12.7 },
            { name: 'Family Reconnectors', engagement: 35.2, revenue: 8921, growth: 24.1 }
          ],
          segmentEvolution: [],
          aiSegmentSuggestions: [
            { name: 'Festival Enthusiasts', potentialValue: 18492, confidence: 84.2 },
            { name: 'Business Travelers', potentialValue: 22847, confidence: 79.6 },
            { name: 'Heritage Seekers', potentialValue: 14923, confidence: 88.1 }
          ]
        },
        deviceBreakdown: {
          devices: [
            { device: 'Mobile', users: 28491, engagement: 32.1, revenue: 142850 },
            { device: 'Desktop', users: 11247, engagement: 28.4, revenue: 89420 },
            { device: 'Tablet', users: 3821, engagement: 24.7, revenue: 18130 }
          ],
          trends: []
        },
        geographicDistribution: {
          countries: [
            { country: 'Estados Unidos', users: 32847, revenue: 189420, growth: 15.2 },
            { country: 'Brasil', users: 8291, revenue: 42310, growth: 23.1 },
            { country: 'Canadá', users: 4192, revenue: 28470, growth: 8.7 }
          ],
          cities: [
            { city: 'Miami', users: 12847, engagement: 32.1, culturalScore: 95.2 },
            { city: 'New York', users: 9284, engagement: 29.8, culturalScore: 87.4 },
            { city: 'Boston', users: 6491, engagement: 35.2, culturalScore: 89.1 }
          ]
        }
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRealTimeMetrics = async () => {
    // Update only real-time metrics to avoid full re-render
    if (analyticsData) {
      setAnalyticsData(prev => prev ? {
        ...prev,
        realTimeMetrics: {
          ...prev.realTimeMetrics,
          activeUsers: prev.realTimeMetrics.activeUsers + Math.floor(Math.random() * 20 - 10),
          emailsInQueue: Math.max(0, prev.realTimeMetrics.emailsInQueue + Math.floor(Math.random() * 100 - 50)),
          revenueToday: prev.realTimeMetrics.revenueToday + Math.floor(Math.random() * 1000)
        }
      } : null);
    }
  };

  // Generate heatmap data
  function generateHeatmapData() {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const data = [];
    
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        // Simulate higher engagement during Brazilian peak hours
        let baseEngagement = Math.random() * 30;
        
        // Morning peak (7-9 AM)
        if (hour >= 7 && hour <= 9) baseEngagement += Math.random() * 40;
        
        // Evening peak (6-9 PM)
        if (hour >= 18 && hour <= 21) baseEngagement += Math.random() * 50;
        
        // Weekend boost
        if (day === 0 || day === 6) baseEngagement *= 1.2;
        
        data.push({
          hour,
          day: days[day],
          engagement: Math.min(100, baseEngagement),
          opens: Math.floor(baseEngagement * 10),
          clicks: Math.floor(baseEngagement * 1.5)
        });
      }
    }
    
    return data;
  }

  // Chart configurations
  const brazilianColors = {
    green: '#009739',
    yellow: '#FEDD00',
    blue: '#4169E1',
    gradient: 'linear-gradient(135deg, #009739 0%, #FEDD00 100%)'
  };

  const engagementTrendData = useMemo(() => ({
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [
      {
        label: 'Taxa de Abertura (%)',
        data: [28.4, 31.2, 29.8, 33.1, 35.4, 32.7],
        borderColor: brazilianColors.green,
        backgroundColor: brazilianColors.green + '20',
        tension: 0.4
      },
      {
        label: 'Taxa de Clique (%)',
        data: [4.2, 4.8, 4.5, 5.1, 5.7, 5.2],
        borderColor: brazilianColors.yellow,
        backgroundColor: brazilianColors.yellow + '20',
        tension: 0.4
      }
    ]
  }), []);

  const culturalInsightsData = useMemo(() => ({
    labels: analyticsData?.culturalInsights.generationBreakdown.map(g => g.generation) || [],
    datasets: [
      {
        label: 'Engajamento por Geração',
        data: analyticsData?.culturalInsights.generationBreakdown.map(g => g.engagement) || [],
        backgroundColor: [
          brazilianColors.green + 'CC',
          brazilianColors.yellow + 'CC',
          brazilianColors.blue + 'CC'
        ],
        borderColor: [
          brazilianColors.green,
          brazilianColors.yellow,
          brazilianColors.blue
        ],
        borderWidth: 2
      }
    ]
  }), [analyticsData]);

  const diasporaPerformanceData = useMemo(() => {
    if (!analyticsData) return { labels: [], datasets: [] };
    
    return {
      labels: analyticsData.culturalInsights.diasporaPerformance.map(d => d.community),
      datasets: [
        {
          label: 'Taxa de Abertura (%)',
          data: analyticsData.culturalInsights.diasporaPerformance.map(d => d.openRate),
          backgroundColor: brazilianColors.green + '80',
          borderColor: brazilianColors.green,
          borderWidth: 1
        },
        {
          label: 'Taxa de Clique (%)',
          data: analyticsData.culturalInsights.diasporaPerformance.map(d => d.clickRate),
          backgroundColor: brazilianColors.yellow + '80',
          borderColor: brazilianColors.yellow,
          borderWidth: 1
        }
      ]
    };
  }, [analyticsData]);

  const revenueAttributionData = useMemo(() => {
    if (!analyticsData) return { labels: [], datasets: [] };
    
    return {
      labels: analyticsData.revenueAttribution.channelAttribution.map(c => c.channel),
      datasets: [
        {
          label: 'Receita por Canal',
          data: analyticsData.revenueAttribution.channelAttribution.map(c => c.revenue),
          backgroundColor: [
            brazilianColors.green + 'CC',
            brazilianColors.yellow + 'CC',
            brazilianColors.blue + 'CC',
            '#FF6B6B' + 'CC'
          ],
          borderColor: [
            brazilianColors.green,
            brazilianColors.yellow,
            brazilianColors.blue,
            '#FF6B6B'
          ],
          borderWidth: 2
        }
      ]
    };
  }, [analyticsData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Carregando analytics avançados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-yellow-500 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">📊 Analytics Dashboard 2025</h1>
              <p className="text-green-100">Insights avançados da diáspora brasileira</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm">Tempo Real</span>
                <button
                  onClick={() => setRealTimeEnabled(!realTimeEnabled)}
                  className={`w-12 h-6 rounded-full transition-all ${
                    realTimeEnabled ? 'bg-white' : 'bg-green-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-green-600 rounded-full transition-all ${
                    realTimeEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`}></div>
                </button>
              </div>
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white"
              >
                <option value="24h">Últimas 24h</option>
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
              </select>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex space-x-1 bg-white/10 rounded-lg p-1">
            {[
              { key: 'overview', label: '📈 Visão Geral' },
              { key: 'cultural', label: '🇧🇷 Insights Culturais' },
              { key: 'predictive', label: '🔮 Preditiva' },
              { key: 'revenue', label: '💰 Receita' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveView(tab.key as any)}
                className={`px-4 py-2 rounded-md transition-all ${
                  activeView === tab.key 
                    ? 'bg-white text-green-600 shadow-md' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Real-Time Metrics Bar */}
      {analyticsData && (
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {analyticsData.realTimeMetrics.activeUsers.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Usuários Ativos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {analyticsData.realTimeMetrics.emailsInQueue.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Emails na Fila</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {analyticsData.realTimeMetrics.openRateLast24h}%
                </div>
                <div className="text-sm text-gray-600">Abertura 24h</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {analyticsData.realTimeMetrics.clickRateLast24h}%
                </div>
                <div className="text-sm text-gray-600">Clique 24h</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {analyticsData.realTimeMetrics.conversionRateLast24h}%
                </div>
                <div className="text-sm text-gray-600">Conversão 24h</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  R$ {analyticsData.realTimeMetrics.revenueToday.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Receita Hoje</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  analyticsData.realTimeMetrics.systemHealth === 'healthy' ? 'text-green-600' :
                  analyticsData.realTimeMetrics.systemHealth === 'warning' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {analyticsData.realTimeMetrics.systemHealth === 'healthy' ? '✅' :
                   analyticsData.realTimeMetrics.systemHealth === 'warning' ? '⚠️' : '❌'}
                </div>
                <div className="text-sm text-gray-600">Sistema</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Tab */}
        {activeView === 'overview' && (
          <div className="space-y-8">
            {/* Engagement Trends */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">📈 Tendências de Engajamento</h3>
              <div className="h-80">
                <Line 
                  data={engagementTrendData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      tooltip: {
                        mode: 'index',
                        intersect: false,
                      }
                    },
                    scales: {
                      x: {
                        display: true,
                        title: {
                          display: true,
                          text: 'Mês'
                        }
                      },
                      y: {
                        display: true,
                        title: {
                          display: true,
                          text: 'Taxa (%)'
                        }
                      }
                    },
                    interaction: {
                      mode: 'nearest',
                      axis: 'x',
                      intersect: false
                    }
                  }}
                />
              </div>
            </div>

            {/* Campaign Performance Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {analyticsData?.campaignPerformance.map(campaign => (
                <div key={campaign.id} className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-gray-800">{campaign.name}</h4>
                      <p className="text-sm text-gray-600">{campaign.type}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        R$ {campaign.revenue.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Receita</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {campaign.sent.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600">Enviados</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        {((campaign.opened / campaign.sent) * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-600">Abertura</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-600">
                        {((campaign.clicked / campaign.sent) * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-600">Clique</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">
                        {((campaign.converted / campaign.sent) * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-600">Conversão</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-100 to-yellow-100 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Ressonância Cultural</span>
                      <span className="text-sm font-bold text-green-700">{campaign.culturalResonance}%</span>
                    </div>
                    <div className="w-full bg-white rounded-full h-2 mt-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-yellow-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${campaign.culturalResonance}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Device & Geographic Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Device Breakdown */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">📱 Breakdown por Dispositivo</h3>
                <div className="space-y-4">
                  {analyticsData?.deviceBreakdown.devices.map(device => (
                    <div key={device.device} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">
                          {device.device === 'Mobile' ? '📱' : 
                           device.device === 'Desktop' ? '💻' : '📟'}
                        </div>
                        <div>
                          <div className="font-semibold">{device.device}</div>
                          <div className="text-sm text-gray-600">
                            {device.users.toLocaleString()} usuários
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          {device.engagement}%
                        </div>
                        <div className="text-sm text-gray-600">
                          R$ {(device.revenue / 1000).toFixed(0)}K
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Cities */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">🌍 Top Cidades da Diáspora</h3>
                <div className="space-y-4">
                  {analyticsData?.geographicDistribution.cities.map((city, index) => (
                    <div key={city.city} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold">{city.city}</div>
                          <div className="text-sm text-gray-600">
                            {city.users.toLocaleString()} usuários
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          {city.engagement}%
                        </div>
                        <div className="text-sm text-yellow-600">
                          Cultural: {city.culturalScore}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cultural Insights Tab */}
        {activeView === 'cultural' && analyticsData && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Generation Breakdown */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">👥 Engajamento por Geração</h3>
                <div className="h-64">
                  <Doughnut 
                    data={culturalInsightsData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom'
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Diaspora Performance */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">🌎 Performance da Diáspora</h3>
                <div className="h-64">
                  <Bar 
                    data={diasporaPerformanceData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top'
                        }
                      },
                      scales: {
                        x: {
                          title: {
                            display: true,
                            text: 'Comunidades'
                          }
                        },
                        y: {
                          title: {
                            display: true,
                            text: 'Taxa (%)'
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Cultural Events Impact */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">🎉 Impacto dos Eventos Culturais</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {analyticsData.culturalInsights.culturalEventImpact.map(event => (
                  <div key={event.event} className="bg-gradient-to-br from-green-50 to-yellow-50 rounded-xl p-6">
                    <div className="text-center mb-4">
                      <div className="text-3xl mb-2">
                        {event.event.includes('Carnaval') ? '🎭' :
                         event.event.includes('Copa') ? '⚽' : '🎪'}
                      </div>
                      <h4 className="font-bold text-gray-800">{event.event}</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Boost</span>
                        <span className="font-bold text-green-600">+{event.boost}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Alcance</span>
                        <span className="font-bold text-blue-600">{event.reach.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-yellow-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, event.boost)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Language Preferences */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">🗣️ Preferências de Idioma</h3>
              <div className="space-y-4">
                {analyticsData.culturalInsights.languagePreferences.map(lang => (
                  <div key={lang.language} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">
                        {lang.language === 'Português' ? '🇧🇷' :
                         lang.language === 'Bilíngue' ? '🌍' : '🇺🇸'}
                      </div>
                      <div>
                        <div className="font-semibold">{lang.language}</div>
                        <div className="text-sm text-gray-600">{lang.percentage}% dos usuários</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">{lang.performance}%</div>
                      <div className="text-sm text-gray-600">Performance</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Predictive Analytics Tab */}
        {activeView === 'predictive' && analyticsData && (
          <div className="space-y-8">
            {/* Churn Risk Prediction */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">⚠️ Previsão de Risco de Churn</h3>
              <div className="h-64">
                <Line 
                  data={{
                    labels: analyticsData.predictiveAnalytics.churnRiskPrediction.map(c => c.timeframe),
                    datasets: [{
                      label: 'Risco de Churn Previsto (%)',
                      data: analyticsData.predictiveAnalytics.churnRiskPrediction.map(c => c.predicted),
                      borderColor: '#EF4444',
                      backgroundColor: '#EF444420',
                      tension: 0.4,
                      fill: true
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top'
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Risco (%)'
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Lifetime Value Prediction */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">💎 Previsão de Valor de Vida (LTV)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {analyticsData.predictiveAnalytics.lifetimeValuePrediction.map(segment => (
                  <div key={segment.segment} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
                    <h4 className="font-bold text-gray-800 mb-4">{segment.segment}</h4>
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold text-blue-600">
                        R$ {(segment.predicted / 1000).toFixed(1)}K
                      </div>
                      <div className="text-sm text-gray-600">LTV Previsto</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Confiança</span>
                      <span className="text-sm font-bold text-green-600">{segment.confidence}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        style={{ width: `${segment.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Travel Intent Forecast */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">✈️ Previsão de Intenção de Viagem</h3>
              <div className="h-64">
                <Bar 
                  data={{
                    labels: analyticsData.predictiveAnalytics.travelIntentForecast.map(t => t.month),
                    datasets: [{
                      label: 'Score de Intenção',
                      data: analyticsData.predictiveAnalytics.travelIntentForecast.map(t => t.score),
                      backgroundColor: analyticsData.predictiveAnalytics.travelIntentForecast.map((_, index) => 
                        `rgba(0, 151, 57, ${0.3 + (index * 0.2)})`
                      ),
                      borderColor: brazilianColors.green,
                      borderWidth: 2
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                          display: true,
                          text: 'Score de Intenção'
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* AI Segment Suggestions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">🤖 Sugestões de Segmentos AI</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {analyticsData.segmentAnalysis.aiSegmentSuggestions.map(suggestion => (
                  <div key={suggestion.name} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-gray-800">{suggestion.name}</h4>
                        <div className="text-sm text-gray-600 mt-1">Segmento AI Sugerido</div>
                      </div>
                      <div className="text-2xl">🎯</div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Valor Potencial</span>
                        <span className="font-bold text-purple-600">
                          R$ {(suggestion.potentialValue / 1000).toFixed(0)}K
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Confiança</span>
                        <span className="font-bold text-green-600">{suggestion.confidence}%</span>
                      </div>
                      <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all">
                        Criar Segmento
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Revenue Attribution Tab */}
        {activeView === 'revenue' && analyticsData && (
          <div className="space-y-8">
            {/* Channel Attribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Atribuição por Canal</h3>
                <div className="h-64">
                  <Doughnut 
                    data={revenueAttributionData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom'
                        }
                      }
                    }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">💰 ROI das Campanhas</h3>
                <div className="space-y-4">
                  {analyticsData.revenueAttribution.campaignROI.map(campaign => (
                    <div key={campaign.campaign} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">{campaign.campaign}</h4>
                        <span className="text-lg font-bold text-green-600">
                          {campaign.roi.toFixed(0)}%
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Investido: </span>
                          <span className="font-medium">R$ {campaign.spent.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Receita: </span>
                          <span className="font-medium">R$ {campaign.revenue.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-yellow-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, campaign.roi / 3)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Customer Journey */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">🎯 Jornada do Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {analyticsData.revenueAttribution.customerJourney.map((stage, index) => (
                  <div key={stage.stage} className="text-center">
                    <div className="relative">
                      <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-white font-bold text-lg mb-4 ${
                        index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-yellow-500' :
                        index === 2 ? 'bg-orange-500' : 'bg-green-500'
                      }`}>
                        {stage.value}
                      </div>
                      {index < analyticsData.revenueAttribution.customerJourney.length - 1 && (
                        <div className="absolute top-10 left-full w-full h-0.5 bg-gray-300 hidden md:block"></div>
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">{stage.stage}</h4>
                    <p className="text-sm text-gray-600">
                      {stage.conversionRate}% conversão
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue Trends */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">📈 Tendências de Receita</h3>
              <div className="h-80">
                <Line 
                  data={{
                    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                    datasets: [
                      {
                        label: 'Receita Total (R$)',
                        data: [125000, 142000, 168000, 189000, 203000, 225000],
                        borderColor: brazilianColors.green,
                        backgroundColor: brazilianColors.green + '20',
                        yAxisID: 'y'
                      },
                      {
                        label: 'Receita por Usuário (R$)',
                        data: [85, 92, 98, 105, 112, 118],
                        borderColor: brazilianColors.yellow,
                        backgroundColor: brazilianColors.yellow + '20',
                        yAxisID: 'y1'
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top'
                      }
                    },
                    scales: {
                      x: {
                        display: true,
                        title: {
                          display: true,
                          text: 'Mês'
                        }
                      },
                      y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                          display: true,
                          text: 'Receita Total (R$)'
                        }
                      },
                      y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                          display: true,
                          text: 'Receita por Usuário (R$)'
                        },
                        grid: {
                          drawOnChartArea: false
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button for Real-Time Alerts */}
      {realTimeEnabled && (
        <div className="fixed bottom-6 right-6">
          <button className="bg-gradient-to-r from-green-500 to-yellow-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all animate-pulse">
            <span className="text-lg">🔴</span>
            <span className="ml-2 hidden md:inline">Live</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default NextGenAnalyticsDashboard;