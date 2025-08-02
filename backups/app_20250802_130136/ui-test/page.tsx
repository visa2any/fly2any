export default function UITestPage() {
  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      padding: '0',
      margin: '0'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#3b82f6',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>F</div>
            <div>
              <h1 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: '0'
              }}>Central Omnichannel</h1>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '0'
              }}>Interface Moderna Funcionando!</p>
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              padding: '6px 12px',
              backgroundColor: '#dcfce7',
              color: '#16a34a',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '500'
            }}>🟢 Online</div>
            <a href="/admin" style={{
              padding: '8px 16px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500'
            }}>← Voltar</a>
          </div>
        </div>
      </header>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        {/* Success Message */}
        <div style={{
          backgroundColor: '#dcfce7',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          color: '#15803d'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            margin: '0 0 8px 0'
          }}>✅ Interface Funcionando Perfeitamente!</h2>
          <p style={{
            margin: '0',
            fontSize: '14px'
          }}>Esta interface está com CSS 100% inline e totalmente estilizada.</p>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {/* Stat 1 */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '12px'
            }}>
              <div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  lineHeight: '1'
                }}>12</div>
                <div style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  marginTop: '4px'
                }}>Conversas Ativas</div>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#dbeafe',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>💬</div>
            </div>
            <div style={{
              padding: '4px 8px',
              backgroundColor: '#dcfce7',
              color: '#16a34a',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500',
              display: 'inline-block'
            }}>+18% hoje</div>
          </div>

          {/* Stat 2 */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '12px'
            }}>
              <div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  lineHeight: '1'
                }}>3</div>
                <div style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  marginTop: '4px'
                }}>Pendentes</div>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#fef3c7',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>⏳</div>
            </div>
            <div style={{
              padding: '4px 8px',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500',
              display: 'inline-block'
            }}>-25% hoje</div>
          </div>

          {/* Stat 3 */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '12px'
            }}>
              <div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  lineHeight: '1'
                }}>1.2min</div>
                <div style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  marginTop: '4px'
                }}>Tempo Resposta</div>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#dcfce7',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>⚡</div>
            </div>
            <div style={{
              padding: '4px 8px',
              backgroundColor: '#dcfce7',
              color: '#16a34a',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500',
              display: 'inline-block'
            }}>-30% hoje</div>
          </div>

          {/* Stat 4 */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '12px'
            }}>
              <div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  lineHeight: '1'
                }}>4.8/5</div>
                <div style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  marginTop: '4px'
                }}>Satisfação</div>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#f3e8ff',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>⭐</div>
            </div>
            <div style={{
              padding: '4px 8px',
              backgroundColor: '#dcfce7',
              color: '#16a34a',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500',
              display: 'inline-block'
            }}>+0.2 hoje</div>
          </div>
        </div>

        {/* Conversations Section */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {/* Header */}
          <div style={{
            backgroundColor: '#f9fafb',
            borderBottom: '1px solid #e5e7eb',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '18px' }}>📋</span>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: '0'
              }}>Conversas Recentes</h3>
            </div>
            <button style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}>🔄 Atualizar</button>
          </div>

          {/* Conversation List */}
          <div>
            {/* Conversation 1 */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #f3f4f6',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#dcfce7',
                color: '#16a34a',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                position: 'relative'
              }}>
                📱
                <div style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '18px',
                  height: '18px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>3</div>
              </div>
              <div style={{ flex: '1' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '4px'
                }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    margin: '0'
                  }}>Maria Silva</h4>
                  <span style={{
                    fontSize: '12px',
                    color: '#9ca3af'
                  }}>há 2min</span>
                </div>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: '0 0 8px 0'
                }}>Gostaria de saber sobre os voos para São Paulo...</p>
                <div style={{
                  display: 'flex',
                  gap: '8px'
                }}>
                  <span style={{
                    padding: '2px 8px',
                    backgroundColor: '#dcfce7',
                    color: '#16a34a',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '500'
                  }}>ATIVA</span>
                  <span style={{
                    padding: '2px 8px',
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '500'
                  }}>ALTA</span>
                </div>
              </div>
            </div>

            {/* Conversation 2 */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #f3f4f6',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#dbeafe',
                color: '#2563eb',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>📧</div>
              <div style={{ flex: '1' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '4px'
                }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    margin: '0'
                  }}>João Santos</h4>
                  <span style={{
                    fontSize: '12px',
                    color: '#9ca3af'
                  }}>há 15min</span>
                </div>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: '0 0 8px 0'
                }}>Preciso alterar a data da minha viagem de volta...</p>
                <span style={{
                  padding: '2px 8px',
                  backgroundColor: '#fef3c7',
                  color: '#d97706',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '500'
                }}>PENDENTE</span>
              </div>
            </div>

            {/* Conversation 3 */}
            <div style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#f3e8ff',
                color: '#9333ea',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                position: 'relative'
              }}>
                💬
                <div style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '18px',
                  height: '18px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>1</div>
              </div>
              <div style={{ flex: '1' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '4px'
                }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    margin: '0'
                  }}>Ana Costa</h4>
                  <span style={{
                    fontSize: '12px',
                    color: '#9ca3af'
                  }}>há 1h</span>
                </div>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: '0 0 8px 0'
                }}>Qual o melhor seguro viagem para o Brasil?</p>
                <span style={{
                  padding: '2px 8px',
                  backgroundColor: '#dcfce7',
                  color: '#16a34a',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '500'
                }}>ATIVA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}