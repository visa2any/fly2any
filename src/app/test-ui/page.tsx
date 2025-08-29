import React from 'react';
'use client';

export default function TestUIPage() {
  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      margin: 0,
      padding: 0
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '20px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '20px',
              fontWeight: '600'
            }}>F</div>
            <div>
              <h1 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#0f172a',
                margin: 0
              }}>Central Omnichannel</h1>
              <p style={{
                fontSize: '14px',
                color: '#64748b',
                margin: 0
              }}>Atendimento unificado</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '500',
              color: '#15803d'
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                background: '#22c55e',
                borderRadius: '50%'
              }}></div>
              Online
            </div>
            <a href="/admin" style={{
              padding: '8px 16px',
              background: '#f1f5f9',
              color: '#475569',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>← Admin</a>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 88px)' }}>
        {/* Sidebar */}
        <div style={{
          width: '300px',
          backgroundColor: 'white',
          borderRight: '1px solid #e2e8f0',
          padding: '24px 0',
          overflowY: 'auto'
        }}>
          {/* Métricas */}
          <div style={{ padding: '0 24px 24px 24px' }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>Métricas em Tempo Real</h3>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              {/* Métrica 1 */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '20px',
                transition: 'all 0.2s'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <p style={{
                      fontSize: '28px',
                      fontWeight: '700',
                      color: '#0f172a',
                      margin: 0,
                      lineHeight: '1'
                    }}>12</p>
                    <p style={{
                      fontSize: '14px',
                      color: '#64748b',
                      margin: '4px 0 0 0'
                    }}>Conversas Ativas</p>
                  </div>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: '#dbeafe',
                    color: '#1d4ed8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                  }}>💬</div>
                </div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: '#dcfce7',
                  color: '#16a34a',
                  display: 'inline-block'
                }}>+18% hoje</div>
              </div>

              {/* Métrica 2 */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <p style={{
                      fontSize: '28px',
                      fontWeight: '700',
                      color: '#0f172a',
                      margin: 0,
                      lineHeight: '1'
                    }}>3</p>
                    <p style={{
                      fontSize: '14px',
                      color: '#64748b',
                      margin: '4px 0 0 0'
                    }}>Pendentes</p>
                  </div>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: '#fef3c7',
                    color: '#d97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                  }}>⏳</div>
                </div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: '#fee2e2',
                  color: '#dc2626',
                  display: 'inline-block'
                }}>-25% hoje</div>
              </div>

              {/* Métrica 3 */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <p style={{
                      fontSize: '28px',
                      fontWeight: '700',
                      color: '#0f172a',
                      margin: 0,
                      lineHeight: '1'
                    }}>1.2min</p>
                    <p style={{
                      fontSize: '14px',
                      color: '#64748b',
                      margin: '4px 0 0 0'
                    }}>Tempo Resposta</p>
                  </div>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: '#dcfce7',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                  }}>⚡</div>
                </div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: '#dcfce7',
                  color: '#16a34a',
                  display: 'inline-block'
                }}>-30% hoje</div>
              </div>

              {/* Métrica 4 */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <p style={{
                      fontSize: '28px',
                      fontWeight: '700',
                      color: '#0f172a',
                      margin: 0,
                      lineHeight: '1'
                    }}>4.8/5</p>
                    <p style={{
                      fontSize: '14px',
                      color: '#64748b',
                      margin: '4px 0 0 0'
                    }}>Satisfação</p>
                  </div>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: '#f3e8ff',
                    color: '#9333ea',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                  }}>⭐</div>
                </div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: '#dcfce7',
                  color: '#16a34a',
                  display: 'inline-block'
                }}>+0.2 hoje</div>
              </div>
            </div>
          </div>

          {/* Canais */}
          <div style={{ padding: '0 24px' }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>Canais Ativos</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                background: '#f8fafc',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>📱</span>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>WhatsApp</span>
                </div>
                <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>8 ativas</span>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                background: '#f8fafc',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>📧</span>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>Email</span>
                </div>
                <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600' }}>2 ativas</span>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                background: '#f8fafc',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>💬</span>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>Chat Web</span>
                </div>
                <span style={{ fontSize: '12px', color: '#9333ea', fontWeight: '600' }}>2 ativas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Content Header */}
          <div style={{
            backgroundColor: 'white',
            borderBottom: '1px solid #e2e8f0',
            padding: '24px 32px'
          }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#0f172a',
              margin: '0 0 4px 0'
            }}>Conversas em Andamento</h2>
            <p style={{
              fontSize: '16px',
              color: '#64748b',
              margin: 0
            }}>Gerencie todas as conversas de diferentes canais em um só lugar</p>
          </div>

          {/* Main Content */}
          <div style={{ flex: 1, padding: '32px', background: '#f8fafc' }}>
            <div style={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              {/* Section Header */}
              <div style={{
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                padding: '20px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>📋</span>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#0f172a',
                    margin: 0
                  }}>Lista de Conversas</h3>
                </div>
                <button style={{
                  padding: '10px 18px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>🔄 Atualizar</button>
              </div>

              {/* Conversations List */}
              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {/* Conversa 1 */}
                <div style={{
                  padding: '24px',
                  borderBottom: '1px solid #f1f5f9',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'all 0.2s'
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    background: '#dcfce7',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    position: 'relative',
                    flexShrink: 0
                  }}>
                    📱
                    <div style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      width: '20px',
                      height: '20px',
                      background: '#ef4444',
                      color: 'white',
                      borderRadius: '50%',
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid white'
                    }}>3</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '6px'
                    }}>
                      <h4 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#0f172a',
                        margin: 0
                      }}>Maria Silva</h4>
                      <span style={{
                        fontSize: '13px',
                        color: '#94a3b8',
                        whiteSpace: 'nowrap'
                      }}>há 2min</span>
                    </div>
                    <p style={{
                      fontSize: '15px',
                      color: '#64748b',
                      margin: '0 0 10px 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>Gostaria de saber sobre os voos para São Paulo...</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        background: '#dcfce7',
                        color: '#16a34a'
                      }}>Ativa</span>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        background: '#fee2e2',
                        color: '#dc2626'
                      }}>Alta</span>
                    </div>
                  </div>
                </div>

                {/* Conversa 2 */}
                <div style={{
                  padding: '24px',
                  borderBottom: '1px solid #f1f5f9',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    background: '#dbeafe',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    flexShrink: 0
                  }}>📧</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '6px'
                    }}>
                      <h4 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#0f172a',
                        margin: 0
                      }}>João Santos</h4>
                      <span style={{
                        fontSize: '13px',
                        color: '#94a3b8'
                      }}>há 15min</span>
                    </div>
                    <p style={{
                      fontSize: '15px',
                      color: '#64748b',
                      margin: '0 0 10px 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>Preciso alterar a data da minha viagem de volta...</p>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      background: '#fef3c7',
                      color: '#d97706'
                    }}>Pendente</span>
                  </div>
                </div>

                {/* Conversa 3 */}
                <div style={{
                  padding: '24px',
                  borderBottom: '1px solid #f1f5f9',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    background: '#f3e8ff',
                    color: '#9333ea',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    position: 'relative',
                    flexShrink: 0
                  }}>
                    💬
                    <div style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      width: '20px',
                      height: '20px',
                      background: '#ef4444',
                      color: 'white',
                      borderRadius: '50%',
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid white'
                    }}>1</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '6px'
                    }}>
                      <h4 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#0f172a',
                        margin: 0
                      }}>Ana Costa</h4>
                      <span style={{
                        fontSize: '13px',
                        color: '#94a3b8'
                      }}>há 1h</span>
                    </div>
                    <p style={{
                      fontSize: '15px',
                      color: '#64748b',
                      margin: '0 0 10px 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>Qual o melhor seguro viagem para o Brasil?</p>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      background: '#dcfce7',
                      color: '#16a34a'
                    }}>Ativa</span>
                  </div>
                </div>

                {/* Conversa 4 */}
                <div style={{
                  padding: '24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    background: '#dcfce7',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    flexShrink: 0
                  }}>📱</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '6px'
                    }}>
                      <h4 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#0f172a',
                        margin: 0
                      }}>Carlos Pereira</h4>
                      <span style={{
                        fontSize: '13px',
                        color: '#94a3b8'
                      }}>há 2h</span>
                    </div>
                    <p style={{
                      fontSize: '15px',
                      color: '#64748b',
                      margin: '0 0 10px 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>Obrigado pelo excelente atendimento!</p>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      background: '#dbeafe',
                      color: '#2563eb'
                    }}>Resolvida</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}