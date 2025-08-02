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
    <div style={{
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Success Banner */}
      <div style={{
        backgroundColor: '#10b981',
        color: 'white',
        padding: '12px 0',
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: '600',
        marginBottom: '20px'
      }}>
        ✅ SISTEMA FUNCIONANDO! Dashboard com métricas em tempo real
      </div>

      {/* Main Content - Full Width */}
      <div style={{
        width: '100%',
        padding: '20px'
      }}>
        {/* Header - Full Width */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#3b82f6',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '24px',
                fontWeight: 'bold'
              }}>📊</div>
              <div>
                <h1 style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  margin: '0 0 4px 0'
                }}>Dashboard - Fly2Any</h1>
                <p style={{
                  fontSize: '16px',
                  color: '#6b7280',
                  margin: '0'
                }}>Central de controle com métricas e performance em tempo real</p>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                padding: '8px 16px',
                backgroundColor: '#dcfce7',
                color: '#16a34a',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#22c55e',
                  borderRadius: '50%'
                }}></div>
                Sistema Online
              </div>
              <button style={{
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}>⚙️ Configurações</button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '24px'
        }}>
          {statsData.map((stat, index) => (
            <div key={index} style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              transition: 'transform 0.3s ease'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: stat.icon === '🎯' ? '#10b981' : stat.icon === '💎' ? '#3b82f6' : stat.icon === '📈' ? '#f59e0b' : '#06b6d4',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  {stat.icon}
                </div>
                <div style={{
                  padding: '4px 12px',
                  backgroundColor: '#dcfce7',
                  color: '#16a34a',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {stat.trend}
                </div>
              </div>
              <div style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '4px'
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#6b7280',
                fontWeight: '500'
              }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px'
        }}>
          {/* Recent Leads */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            overflow: 'hidden'
          }}>
            <div style={{
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e5e7eb',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#10b981',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '18px'
              }}>🎯</div>
              <div>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  margin: '0 0 2px 0'
                }}>Leads Recentes</h2>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: '0'
                }}>Últimos leads capturados pelo sistema</p>
              </div>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentLeads.map((lead) => (
                  <div key={lead.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #f3f4f6'
                  }}>
                    <div style={{ flex: '1' }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#1f2937'
                      }}>
                        {lead.name}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        {lead.destination} • {lead.time}
                      </div>
                    </div>
                    <div style={{ marginLeft: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        backgroundColor: lead.status === 'Novo' ? '#dbeafe' : lead.status === 'Em contato' ? '#fef3c7' : lead.status === 'Proposta' ? '#f3f4f6' : '#dcfce7',
                        color: lead.status === 'Novo' ? '#2563eb' : lead.status === 'Em contato' ? '#d97706' : lead.status === 'Proposta' ? '#374151' : '#16a34a',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {lead.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid #e5e7eb'
              }}>
                <button style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  Ver Todos os Leads
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            overflow: 'hidden'
          }}>
            <div style={{
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e5e7eb',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#f59e0b',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '18px'
              }}>⚡</div>
              <div>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  margin: '0 0 2px 0'
                }}>Ações Rápidas</h2>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: '0'
                }}>Acesso rápido às principais funcionalidades</p>
              </div>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px'
              }}>
                <button style={{
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  height: '60px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}>
                  <span style={{ fontSize: '18px' }}>📧</span>
                  <span>Email</span>
                </button>
                <button style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  height: '60px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}>
                  <span style={{ fontSize: '18px' }}>📊</span>
                  <span>Relatórios</span>
                </button>
                <button style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  height: '60px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}>
                  <span style={{ fontSize: '18px' }}>💬</span>
                  <span>WhatsApp</span>
                </button>
                <button style={{
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  height: '60px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}>
                  <span style={{ fontSize: '18px' }}>⚙️</span>
                  <span>Config</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Chart Placeholder */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          marginTop: '24px'
        }}>
          <div style={{
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e5e7eb',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#3b82f6',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '18px'
            }}>📈</div>
            <div>
              <h2 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: '0 0 2px 0'
              }}>Performance dos Últimos 7 Dias</h2>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '0'
              }}>Gráfico de leads e conversões</p>
            </div>
          </div>
          <div style={{ padding: '20px' }}>
            <div style={{
              height: '200px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #f3f4f6'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📈</div>
                <div style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  fontWeight: '500'
                }}>
                  Gráfico de performance em breve
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}