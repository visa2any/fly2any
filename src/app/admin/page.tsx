'use client';

import React from 'react';

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
    value: 'R$ 2.450',
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
    <div className="space-y-4">
      {/* Welcome Section */}
      <div className="admin-card">
        <div className="admin-card-content">
          <h1 className="text-xl font-bold text-admin-text-primary mb-1">
            Dashboard
          </h1>
          <p className="text-sm text-admin-text-secondary">
            Performance em tempo real
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="admin-stats-grid">
        {statsData.map((stat, index) => (
          <div key={index} className="admin-stats-card group hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center text-2xl shadow-lg`}>
                {stat.icon}
              </div>
              <div className={`px-3 py-1 rounded-full ${stat.color} text-xs font-bold opacity-90`}>
                {stat.trend}
              </div>
            </div>
            <div className="admin-stats-value text-3xl font-bold mb-1 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {stat.value}
            </div>
            <div className="admin-stats-label text-gray-500 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Leads */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Leads Recentes</h2>
            <p className="admin-card-description">
              Últimos leads capturados pelo sistema
            </p>
          </div>
          <div className="admin-card-content">
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-2 rounded-lg bg-admin-bg-secondary/50">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-admin-text-primary">
                      {lead.name}
                    </div>
                    <div className="text-xs text-admin-text-secondary">
                      {lead.destination} • {lead.time}
                    </div>
                  </div>
                  <div className="ml-3">
                    <span className={`${getStatusBadge(lead.status)} text-xs px-2 py-1`}>
                      {lead.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-admin-border-color">
              <button className="bg-gradient-to-r from-gray-600 to-gray-700 text-white w-full py-2 rounded-lg hover:scale-105 transition-all duration-200 text-sm font-medium">
                Ver Todos os Leads
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Ações Rápidas</h2>
            <p className="admin-card-description">
              Acesso rápido às principais funcionalidades
            </p>
          </div>
          <div className="admin-card-content">
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white h-12 flex-col rounded-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border-0 font-medium">
                <span className="text-sm mb-0.5">📧</span>
                <span className="text-xs">Email</span>
              </button>
              <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white h-12 flex-col rounded-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border-0 font-medium">
                <span className="text-sm mb-0.5">📊</span>
                <span className="text-xs">Relatórios</span>
              </button>
              <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white h-12 flex-col rounded-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border-0 font-medium">
                <span className="text-sm mb-0.5">💬</span>
                <span className="text-xs">WhatsApp</span>
              </button>
              <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white h-12 flex-col rounded-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border-0 font-medium">
                <span className="text-sm mb-0.5">⚙️</span>
                <span className="text-xs">Config</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Performance dos Últimos 7 Dias</h2>
          <p className="admin-card-description">
            Gráfico de leads e conversões
          </p>
        </div>
        <div className="admin-card-content">
          <div className="h-48 bg-admin-bg-secondary/30 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl mb-2">📈</div>
              <div className="text-sm text-admin-text-secondary">
                Gráfico de performance
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}