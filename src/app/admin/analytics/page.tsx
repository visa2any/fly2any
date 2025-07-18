'use client';

import React, { useState } from 'react';

const chartData = {
  leads: {
    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    values: [12, 19, 15, 25, 22, 18, 14]
  },
  conversions: {
    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    values: [2, 4, 3, 6, 5, 3, 2]
  },
  revenue: {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    values: [45000, 52000, 48000, 61000, 58000, 67000]
  }
};

const topDestinations = [
  { destination: 'Paris, França', leads: 45, conversions: 12, revenue: 89000 },
  { destination: 'Londres, Inglaterra', leads: 38, conversions: 9, revenue: 67000 },
  { destination: 'Dubai, Emirados Árabes', leads: 32, conversions: 8, revenue: 112000 },
  { destination: 'Tóquio, Japão', leads: 28, conversions: 7, revenue: 95000 },
  { destination: 'Nova York, EUA', leads: 25, conversions: 6, revenue: 78000 }
];

const sourceAnalytics = [
  { source: 'Site Orgânico', leads: 85, percentage: 35.4, conversions: 23 },
  { source: 'Google Ads', leads: 64, percentage: 26.7, conversions: 18 },
  { source: 'Instagram', leads: 45, percentage: 18.8, conversions: 12 },
  { source: 'WhatsApp', leads: 28, percentage: 11.7, conversions: 8 },
  { source: 'Facebook', leads: 18, percentage: 7.5, conversions: 4 }
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};

const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`;
};

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedChart, setSelectedChart] = useState('leads');

  const periodOptions = [
    { value: '7d', label: 'Últimos 7 dias' },
    { value: '30d', label: 'Últimos 30 dias' },
    { value: '90d', label: 'Últimos 90 dias' },
    { value: '1y', label: 'Último ano' }
  ];

  const chartOptions = [
    { value: 'leads', label: 'Leads por Dia' },
    { value: 'conversions', label: 'Conversões por Dia' },
    { value: 'revenue', label: 'Receita Mensal' }
  ];

  const renderChart = () => {
    const data = chartData[selectedChart as keyof typeof chartData];
    const maxValue = Math.max(...data.values);
    
    return (
      <div className="h-64 flex items-end justify-between gap-2 p-4">
        {data.values.map((value, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div 
              className="bg-admin-accent-primary rounded-t w-full min-h-4 transition-all duration-500"
              style={{ height: `${(value / maxValue) * 100}%` }}
            />
            <div className="text-xs text-admin-text-secondary mt-2 font-medium">
              {data.labels[index]}
            </div>
            <div className="text-xs text-admin-text-primary font-semibold">
              {selectedChart === 'revenue' ? formatCurrency(value) : value}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const totalStats = {
    leads: chartData.leads.values.reduce((a, b) => a + b, 0),
    conversions: chartData.conversions.values.reduce((a, b) => a + b, 0),
    revenue: chartData.revenue.values.reduce((a, b) => a + b, 0),
    conversionRate: ((chartData.conversions.values.reduce((a, b) => a + b, 0) / chartData.leads.values.reduce((a, b) => a + b, 0)) * 100)
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="admin-card">
        <div className="admin-card-content">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-admin-text-primary mb-1">
                Analytics & Relatórios
              </h1>
              <p className="text-sm text-admin-text-secondary">
                Performance e métricas detalhadas
              </p>
            </div>
            <div className="flex gap-2">
              <select 
                className="admin-input"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                {periodOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border-0 font-semibold flex items-center gap-2">
                <span className="text-lg">📊</span>
                Exportar Relatório
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="admin-stats-grid">
        <div className="admin-stats-card">
          <div className="admin-stats-value">{totalStats.leads}</div>
          <div className="admin-stats-label">Total de Leads</div>
          <div className="text-sm text-emerald-600 font-medium mt-2">
            +15% vs período anterior
          </div>
        </div>
        <div className="admin-stats-card">
          <div className="admin-stats-value">{totalStats.conversions}</div>
          <div className="admin-stats-label">Conversões</div>
          <div className="text-sm text-emerald-600 font-medium mt-2">
            +22% vs período anterior
          </div>
        </div>
        <div className="admin-stats-card">
          <div className="admin-stats-value">{formatPercentage(totalStats.conversionRate)}</div>
          <div className="admin-stats-label">Taxa de Conversão</div>
          <div className="text-sm text-emerald-600 font-medium mt-2">
            +3.2% vs período anterior
          </div>
        </div>
        <div className="admin-stats-card">
          <div className="admin-stats-value">{formatCurrency(totalStats.revenue)}</div>
          <div className="admin-stats-label">Receita Total</div>
          <div className="text-sm text-emerald-600 font-medium mt-2">
            +18% vs período anterior
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Performance Chart */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="admin-card-title">Gráfico de Performance</h2>
                <p className="admin-card-description">
                  Visualização de métricas ao longo do tempo
                </p>
              </div>
              <select 
                className="admin-input text-sm"
                value={selectedChart}
                onChange={(e) => setSelectedChart(e.target.value)}
              >
                {chartOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="admin-card-content">
            {renderChart()}
          </div>
        </div>

        {/* Top Destinations */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Destinos Mais Populares</h2>
            <p className="admin-card-description">
              Ranking dos destinos com melhor performance
            </p>
          </div>
          <div className="admin-card-content">
            <div className="space-y-4">
              {topDestinations.map((dest, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-admin-bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-admin-accent-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-admin-text-primary">
                        {dest.destination}
                      </div>
                      <div className="text-sm text-admin-text-secondary">
                        {dest.leads} leads • {dest.conversions} conversões
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-admin-text-primary">
                      {formatCurrency(dest.revenue)}
                    </div>
                    <div className="text-sm text-admin-text-secondary">
                      {formatPercentage((dest.conversions / dest.leads) * 100)} conv.
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Source Analytics */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Análise de Fontes de Tráfego</h2>
          <p className="admin-card-description">
            Performance detalhada por canal de aquisição
          </p>
        </div>
        <div className="admin-card-content">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-admin-border-color">
                  <th className="text-left py-3 px-2 text-admin-text-secondary font-medium">Fonte</th>
                  <th className="text-left py-3 px-2 text-admin-text-secondary font-medium">Leads</th>
                  <th className="text-left py-3 px-2 text-admin-text-secondary font-medium">% do Total</th>
                  <th className="text-left py-3 px-2 text-admin-text-secondary font-medium">Conversões</th>
                  <th className="text-left py-3 px-2 text-admin-text-secondary font-medium">Taxa Conv.</th>
                  <th className="text-left py-3 px-2 text-admin-text-secondary font-medium">Eficiência</th>
                </tr>
              </thead>
              <tbody>
                {sourceAnalytics.map((source, index) => (
                  <tr key={index} className="border-b border-admin-border-color hover:bg-admin-bg-secondary/30">
                    <td className="py-3 px-2">
                      <div className="font-medium text-admin-text-primary">{source.source}</div>
                    </td>
                    <td className="py-3 px-2 text-admin-text-primary font-semibold">
                      {source.leads}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-admin-bg-secondary rounded-full h-2">
                          <div 
                            className="bg-admin-accent-primary h-2 rounded-full"
                            style={{ width: `${source.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-admin-text-secondary min-w-12">
                          {formatPercentage(source.percentage)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-admin-text-primary font-semibold">
                      {source.conversions}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`admin-badge ${
                        (source.conversions / source.leads) > 0.2 
                          ? 'admin-badge-success' 
                          : (source.conversions / source.leads) > 0.1 
                          ? 'admin-badge-warning' 
                          : 'admin-badge-danger'
                      }`}>
                        {formatPercentage((source.conversions / source.leads) * 100)}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < Math.round((source.conversions / source.leads) * 20)
                                ? 'bg-emerald-500'
                                : 'bg-admin-bg-secondary'
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Receita por Categoria</h2>
            <p className="admin-card-description">
              Breakdown de receita por tipo de serviço
            </p>
          </div>
          <div className="admin-card-content">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-admin-text-primary">Pacotes Completos</span>
                <span className="font-semibold text-admin-text-primary">$245,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-admin-text-primary">Hospedagem</span>
                <span className="font-semibold text-admin-text-primary">$89,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-admin-text-primary">Passagens</span>
                <span className="font-semibold text-admin-text-primary">$156,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-admin-text-primary">Transfers</span>
                <span className="font-semibold text-admin-text-primary">$23,000</span>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Metas do Mês</h2>
            <p className="admin-card-description">
              Progresso em relação às metas estabelecidas
            </p>
          </div>
          <div className="admin-card-content">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-admin-text-primary">Leads (Meta: 200)</span>
                  <span className="font-semibold">168 / 200</span>
                </div>
                <div className="w-full bg-admin-bg-secondary rounded-full h-3">
                  <div className="bg-emerald-500 h-3 rounded-full" style={{ width: '84%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-admin-text-primary">Conversões (Meta: 50)</span>
                  <span className="font-semibold">45 / 50</span>
                </div>
                <div className="w-full bg-admin-bg-secondary rounded-full h-3">
                  <div className="bg-amber-500 h-3 rounded-full" style={{ width: '90%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-admin-text-primary">Revenue (Goal: $500k)</span>
                  <span className="font-semibold">$513k / $500k</span>
                </div>
                <div className="w-full bg-admin-bg-secondary rounded-full h-3">
                  <div className="bg-emerald-500 h-3 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}