'use client';

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Campaign,
  formatNumber,
  calculateRate,
  formatDateShort
} from '../../lib/email-marketing/utils';
import { emailMarketingAPI, AnalyticsData } from '../../lib/email-marketing/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AnalyticsDashboardProps {
  campaigns?: Campaign[];
  className?: string;
}

interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

const predefinedRanges: DateRange[] = [
  {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date(),
    label: 'Últimos 7 dias'
  },
  {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
    label: 'Últimos 30 dias'
  },
  {
    start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    end: new Date(),
    label: 'Últimos 90 dias'
  },
  {
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(),
    label: 'Este mês'
  },
  {
    start: new Date(new Date().getFullYear(), 0, 1),
    end: new Date(),
    label: 'Este ano'
  }
];

export default function AnalyticsDashboard({ 
  campaigns = [],
  className = "" 
}: AnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedRange, setSelectedRange] = useState<DateRange>(predefinedRanges[1]);
  const [loading, setLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'opens' | 'clicks' | 'delivery'>('opens');
  const [showComparison, setShowComparison] = useState(false);

  // Load analytics data
  useEffect(() => {
    loadAnalytics();
  }, [selectedRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await emailMarketingAPI.getAnalytics(selectedRange);
      if (response.success && response.data) {
        setAnalyticsData(response.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
    setLoading(false);
  };

  // Calculate performance metrics
  const performanceMetrics = useMemo(() => {
    if (campaigns.length === 0) return null;

    const totalSent = campaigns.reduce((sum, c) => sum + c.sent, 0);
    const totalOpens = campaigns.reduce((sum, c) => sum + c.opens, 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
    const totalBounces = campaigns.reduce((sum, c) => sum + (c.bounces || 0), 0);
    const totalUnsubscribes = campaigns.reduce((sum, c) => sum + (c.unsubscribes || 0), 0);
    const totalRevenue = campaigns.reduce((sum, c) => sum + (c.revenue || 0), 0);

    return {
      totalSent,
      totalOpens,
      totalClicks,
      totalBounces,
      totalUnsubscribes,
      totalRevenue,
      openRate: calculateRate(totalOpens, totalSent),
      clickRate: calculateRate(totalClicks, totalSent),
      clickToOpenRate: calculateRate(totalClicks, totalOpens),
      bounceRate: calculateRate(totalBounces, totalSent),
      unsubscribeRate: calculateRate(totalUnsubscribes, totalSent),
      avgRevenue: totalRevenue / campaigns.length
    };
  }, [campaigns]);

  // Chart configurations
  const performanceChartData = {
    labels: campaigns.slice(-7).map(c => formatDateShort(c.date)),
    datasets: [
      {
        label: 'Taxa de Abertura (%)',
        data: campaigns.slice(-7).map(c => parseFloat(calculateRate(c.opens, c.sent))),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Taxa de Clique (%)',
        data: campaigns.slice(-7).map(c => parseFloat(calculateRate(c.clicks, c.sent))),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const campaignComparisonData = {
    labels: campaigns.slice(-5).map(c => c.name.length > 20 ? c.name.substring(0, 20) + '...' : c.name),
    datasets: [
      {
        label: 'Enviados',
        data: campaigns.slice(-5).map(c => c.sent),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
      },
      {
        label: 'Aberturas',
        data: campaigns.slice(-5).map(c => c.opens),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1
      },
      {
        label: 'Cliques',
        data: campaigns.slice(-5).map(c => c.clicks),
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: 'rgb(245, 158, 11)',
        borderWidth: 1
      }
    ]
  };

  const engagementData = {
    labels: ['Aberturas', 'Cliques', 'Bounces', 'Unsubscribes'],
    datasets: [
      {
        data: [
          performanceMetrics?.totalOpens || 0,
          performanceMetrics?.totalClicks || 0,
          performanceMetrics?.totalBounces || 0,
          performanceMetrics?.totalUnsubscribes || 0
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 2
      }
    ]
  };

  const deviceData = analyticsData?.deviceStats && {
    labels: analyticsData.deviceStats.map(d => d.device),
    datasets: [
      {
        data: analyticsData.deviceStats.map(d => d.percentage),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(168, 85, 247, 0.8)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(168, 85, 247)'
        ],
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: false,
      },
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                📊 Analytics Dashboard 2.0
              </h2>
              <p className="text-gray-600">
                Análises avançadas com gráficos interativos e insights em tempo real
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={predefinedRanges.findIndex(r => r.label === selectedRange.label)}
                onChange={(e) => setSelectedRange(predefinedRanges[parseInt(e.target.value)])}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {predefinedRanges.map((range, index) => (
                  <option key={index} value={index}>
                    {range.label}
                  </option>
                ))}
              </select>
              
              <button
                onClick={() => setShowComparison(!showComparison)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  showComparison 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📈 Comparativo
              </button>
              
              <button
                onClick={loadAnalytics}
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? '🔄 Carregando...' : '🔄 Atualizar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Enviado</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatNumber(performanceMetrics?.totalSent || 0)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <span className="text-2xl">📧</span>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-green-600">↗ +12.5% vs mês anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa de Abertura</p>
              <p className="text-3xl font-bold text-gray-900">
                {performanceMetrics?.openRate || '0%'}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <span className="text-2xl">👀</span>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-green-600">↗ +3.2% vs mês anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa de Clique</p>
              <p className="text-3xl font-bold text-gray-900">
                {performanceMetrics?.clickRate || '0%'}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <span className="text-2xl">👆</span>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-red-600">↘ -1.8% vs mês anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
              <p className="text-3xl font-bold text-gray-900">
                ${formatNumber(performanceMetrics?.totalRevenue || 0)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <span className="text-2xl">💰</span>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-green-600">↗ +8.7% vs mês anterior</span>
          </div>
        </div>
      </div>

      {/* Performance Over Time */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">
              📈 Performance ao Longo do Tempo
            </h3>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSelectedMetric('opens')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  selectedMetric === 'opens' 
                    ? 'bg-white text-gray-900 shadow' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Aberturas
              </button>
              <button
                onClick={() => setSelectedMetric('clicks')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  selectedMetric === 'clicks' 
                    ? 'bg-white text-gray-900 shadow' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Cliques
              </button>
              <button
                onClick={() => setSelectedMetric('delivery')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  selectedMetric === 'delivery' 
                    ? 'bg-white text-gray-900 shadow' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Entrega
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="h-80">
            <Line data={performanceChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Campaign Comparison and Engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">
              🆚 Comparação de Campanhas
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              Performance das últimas 5 campanhas
            </p>
          </div>
          <div className="p-6">
            <div className="h-80">
              <Bar data={campaignComparisonData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">
              💫 Distribuição de Engajamento
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              Breakdown dos tipos de interação
            </p>
          </div>
          <div className="p-6">
            <div className="h-80">
              <Doughnut data={engagementData} options={doughnutOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Device Stats and Top Segments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">
              📱 Estatísticas por Dispositivo
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              Como seus contatos visualizam os emails
            </p>
          </div>
          <div className="p-6">
            {deviceData ? (
              <div className="h-80">
                <Doughnut data={deviceData} options={doughnutOptions} />
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-4">📱</div>
                  <p>Dados de dispositivo não disponíveis</p>
                  <p className="text-sm">Dados serão coletados das próximas campanhas</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">
              🎯 Top Segmentos por Performance
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              Segmentos com melhor taxa de abertura
            </p>
          </div>
          <div className="p-6">
            {analyticsData?.topSegments ? (
              <div className="space-y-4">
                {analyticsData.topSegments.map((segment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-900">{segment.name}</h4>
                      <p className="text-sm text-gray-600">
                        {formatNumber(segment.contacts)} contatos
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {segment.openRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-500">taxa de abertura</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-60 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-4">🎯</div>
                  <p>Dados de segmento não disponíveis</p>
                  <p className="text-sm">Crie segmentos para ver estatísticas detalhadas</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Metrics */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            🔬 Métricas Avançadas
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            Insights detalhados sobre o desempenho das campanhas
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {performanceMetrics?.clickToOpenRate || '0%'}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Taxa de Clique/Abertura
              </div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {performanceMetrics?.bounceRate || '0%'}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Taxa de Rejeição
              </div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {performanceMetrics?.unsubscribeRate || '0%'}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Taxa de Descadastro
              </div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                ${(performanceMetrics?.avgRevenue || 0).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Receita Média/Email
              </div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {campaigns.length}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Campanhas Enviadas
              </div>
            </div>
            
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">
                96.8%
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Score de Deliverabilidade
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}