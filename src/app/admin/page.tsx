'use client';

import React from 'react';
import EmailMonitoringWidget from '@/components/admin/EmailMonitoringWidget';
import EmailMetricsWidget from '@/components/admin/EmailMetricsWidget';

const statsData = [
  {
    label: 'Leads Hoje',
    value: '47',
    trend: '+12%',
    color: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white',
    icon: '🎯'
  },
  {
    label: 'Conversões',
    value: '8',
    trend: '+25%',
    color: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white',
    icon: '💎'
  },
  {
    label: 'Taxa Conversão',
    value: '17%',
    trend: '+3%',
    color: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white',
    icon: '📈'
  },
  {
    label: 'Ticket Médio',
    value: '$2,450',
    trend: '+8%',
    color: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white',
    icon: '💰'
  }
];

const recentLeads = [
  {
    id: 1,
    name: 'Maria Silva',
    email: 'maria@email.com',
    destination: 'Paris',
    status: 'Novo',
    time: '5 min atrás'
  },
  {
    id: 2,
    name: 'João Santos',
    email: 'joao@email.com',
    destination: 'Londres',
    status: 'Em contato',
    time: '12 min atrás'
  },
  {
    id: 3,
    name: 'Ana Costa',
    email: 'ana@email.com',
    destination: 'Dubai',
    status: 'Proposta',
    time: '25 min atrás'
  },
  {
    id: 4,
    name: 'Pedro Lima',
    email: 'pedro@email.com',
    destination: 'Japão',
    status: 'Convertido',
    time: '1h atrás'
  }
];

const getStatusBadge = (status: string) => {
  const badges = {
    'Novo': 'admin-badge admin-badge-info',
    'Em contato': 'admin-badge admin-badge-warning',
    'Proposta': 'admin-badge admin-badge-neutral',
    'Convertido': 'admin-badge admin-badge-success'
  };
  return badges[status as keyof typeof badges] || 'admin-badge admin-badge-neutral';
};

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Success Banner */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-4 text-center shadow-lg">
        <div className="flex items-center justify-center gap-3">
          <span className="text-xl">✅</span>
          <span className="font-semibold">SISTEMA FUNCIONANDO!</span>
          <span className="hidden sm:inline">Dashboard com métricas em tempo real</span>
        </div>
      </div>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl">
              📊
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard - Fly2Any</h1>
              <p className="text-gray-600">Central de controle com métricas e performance em tempo real</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Sistema Online
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm font-medium">
              ⚙️ Configurações
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                stat.icon === '🎯' ? 'bg-emerald-100' : 
                stat.icon === '💎' ? 'bg-blue-100' : 
                stat.icon === '📈' ? 'bg-amber-100' : 'bg-cyan-100'
              }`}>
                {stat.icon}
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-lg text-xs font-semibold">
                {stat.trend}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-gray-600 font-medium">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Email Monitoring Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <EmailMonitoringWidget />
        <EmailMetricsWidget />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
                🎯
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Leads Recentes</h2>
                <p className="text-sm text-gray-600">Últimos leads capturados pelo sistema</p>
              </div>
            </div>
          </div>
          <div className="p-5">
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">
                      {lead.name}
                    </div>
                    <div className="text-xs text-gray-600">
                      {lead.destination} • {lead.time}
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-md ${
                    lead.status === 'Novo' ? 'bg-blue-100 text-blue-800' :
                    lead.status === 'Em contato' ? 'bg-amber-100 text-amber-800' :
                    lead.status === 'Proposta' ? 'bg-gray-100 text-gray-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {lead.status}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium">
                Ver Todos os Leads
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-white">
                ⚡
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Ações Rápidas</h2>
                <p className="text-sm text-gray-600">Acesso rápido às principais funcionalidades</p>
              </div>
            </div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => window.open('/admin/email-marketing/v2', '_blank')}
                className="flex flex-col items-center justify-center h-16 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 gap-1"
              >
                <span className="text-lg">📧</span>
                <span className="text-sm font-medium">Email Pro</span>
              </button>
              <button className="flex flex-col items-center justify-center h-16 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 gap-1">
                <span className="text-lg">📊</span>
                <span className="text-sm font-medium">Relatórios</span>
              </button>
              <button className="flex flex-col items-center justify-center h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 gap-1">
                <span className="text-lg">💬</span>
                <span className="text-sm font-medium">WhatsApp</span>
              </button>
              <button className="flex flex-col items-center justify-center h-16 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 gap-1">
                <span className="text-lg">⚙️</span>
                <span className="text-sm font-medium">Config</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
              📈
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Performance dos Últimos 7 Dias</h2>
              <p className="text-sm text-gray-600">Gráfico de leads e conversões</p>
            </div>
          </div>
        </div>
        <div className="p-8">
          <div className="h-48 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-3">📈</div>
              <div className="text-sm text-gray-600 font-medium">
                Gráfico de performance em breve
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}