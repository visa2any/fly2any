'use client';

import React, { useState } from 'react';
import StyledOmnichannelDashboard from '@/components/omnichannel/StyledOmnichannelDashboard';
import CustomStyledChat from '@/components/omnichannel/CustomStyledChat';
import { ConversationWithDetails } from '@/lib/omnichannel-api';

export default function StyledOmnichannelPage() {
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithDetails | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleConversationSelect = (conversation: ConversationWithDetails) => {
    setSelectedConversation(conversation);
    setActiveTab('chat');
  };

  return (
    <>
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .admin-stats-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 25px rgba(0, 0, 0, 0.15);
        }
        
        .admin-stats-card {
          transition: all 0.3s ease;
        }
        
        .admin-btn:hover {
          transform: translateY(-1px);
        }
        
        .admin-btn {
          transition: all 0.3s ease;
        }
        
        .bg-white rounded-xl shadow-lg border border-gray-200 {
          transition: all 0.3s ease;
        }
        
        .bg-white rounded-xl shadow-lg border border-gray-200:hover {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
        
        /* Scroll personalizado */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: var(--admin-bg-secondary);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: var(--admin-border-color);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: var(--admin-text-muted);
        }
        
        .tab-nav {
          display: flex;
          background: white;
          border-radius: var(--admin-border-radius-lg);
          box-shadow: var(--admin-shadow-sm);
          margin-bottom: 24px;
          overflow: hidden;
        }
        
        .tab-button {
          flex: 1;
          padding: 16px 24px;
          background: white;
          border: none;
          color: var(--admin-text-secondary);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          border-bottom: 3px solid transparent;
        }
        
        .tab-button:hover {
          background: var(--admin-bg-secondary);
          color: var(--admin-text-primary);
        }
        
        .tab-button.active {
          background: linear-gradient(135deg, var(--color-blue-500), var(--color-blue-600));
          color: white;
          border-bottom-color: var(--color-blue-700);
        }
        
        .chat-layout {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 24px;
          height: 700px;
        }
        
        .chat-sidebar {
          background: white;
          border-radius: var(--admin-border-radius-lg);
          box-shadow: var(--admin-shadow-sm);
          overflow: hidden;
        }
      `}</style>
      
      <div className="admin-app">
        <div className="admin-main">
          <div className="admin-content">
            {/* Navigation Tabs */}
            <div className="tab-nav">
              <button
                className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                📊 Dashboard
              </button>
              <button
                className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
                onClick={() => setActiveTab('chat')}
              >
                💬 Atendimento
              </button>
              <button
                className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => setActiveTab('analytics')}
              >
                📈 Analytics
              </button>
              <button
                className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                ⚙️ Configurações
              </button>
            </div>

            {/* Content */}
            {activeTab === 'dashboard' && (
              <StyledOmnichannelDashboard />
            )}

            {activeTab === 'chat' && (
              <div className="chat-layout">
                <div className="chat-sidebar">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200-header">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200-title">
                      📋 Conversas Ativas
                    </div>
                  </div>
                  <div style={{ height: '620px', overflow: 'auto' }}>
                    <StyledOmnichannelDashboard />
                  </div>
                </div>
                
                <div>
                  {selectedConversation ? (
                    <CustomStyledChat
                      conversationId={selectedConversation.id}
                      agentId={1}
                      onConversationUpdate={setSelectedConversation}
                    />
                  ) : (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200" style={{ height: '700px' }}>
                      <div className="bg-white rounded-xl shadow-lg border border-gray-200-content" style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        height: '100%',
                        textAlign: 'center'
                      }}>
                        <div>
                          <div style={{ fontSize: '64px', marginBottom: '24px' }}>💬</div>
                          <h3 style={{ 
                            fontSize: 'var(--admin-font-size-xl)',
                            fontWeight: '600',
                            color: 'var(--admin-text-primary)',
                            marginBottom: '12px'
                          }}>
                            Selecione uma conversa
                          </h3>
                          <p style={{ 
                            color: 'var(--admin-text-secondary)',
                            fontSize: 'var(--admin-font-size-lg)'
                          }}>
                            Escolha uma conversa da lista para começar o atendimento
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200-header">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200-title">📊 Métricas por Canal</div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200-content">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ padding: '16px', backgroundColor: 'var(--color-green-50)', borderRadius: 'var(--admin-border-radius)', border: '1px solid var(--color-green-200)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', backgroundColor: '#25D366', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ filter: 'brightness(0) invert(1)', fontSize: '18px' }}>💬</span>
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', fontSize: 'var(--admin-font-size-sm)' }}>WhatsApp</div>
                              <div style={{ fontSize: 'var(--admin-font-size-xs)', color: 'var(--admin-text-secondary)' }}>Canal principal</div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 'var(--admin-font-size-lg)', fontWeight: '700', color: 'var(--color-green-600)' }}>156</div>
                            <div style={{ fontSize: 'var(--admin-font-size-xs)', color: 'var(--admin-text-secondary)' }}>65% do total</div>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ padding: '16px', backgroundColor: 'var(--color-blue-50)', borderRadius: 'var(--admin-border-radius)', border: '1px solid var(--color-blue-200)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', backgroundColor: '#1E40AF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ filter: 'brightness(0) invert(1)', fontSize: '18px' }}>✉️</span>
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', fontSize: 'var(--admin-font-size-sm)' }}>Email</div>
                              <div style={{ fontSize: 'var(--admin-font-size-xs)', color: 'var(--admin-text-secondary)' }}>Suporte técnico</div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 'var(--admin-font-size-lg)', fontWeight: '700', color: 'var(--color-blue-600)' }}>42</div>
                            <div style={{ fontSize: 'var(--admin-font-size-xs)', color: 'var(--admin-text-secondary)' }}>18% do total</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200-header">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200-title">⚡ Performance do Time</div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200-content">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ padding: '16px', backgroundColor: 'var(--color-green-50)', borderRadius: 'var(--admin-border-radius)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: '500' }}>Tempo médio de resposta</span>
                          <span style={{ fontSize: 'var(--admin-font-size-lg)', fontWeight: '700', color: 'var(--color-green-600)' }}>1.8 min</span>
                        </div>
                      </div>
                      <div style={{ padding: '16px', backgroundColor: 'var(--color-blue-50)', borderRadius: 'var(--admin-border-radius)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: '500' }}>Taxa de resolução</span>
                          <span style={{ fontSize: 'var(--admin-font-size-lg)', fontWeight: '700', color: 'var(--color-blue-600)' }}>95%</span>
                        </div>
                      </div>
                      <div style={{ padding: '16px', backgroundColor: 'var(--color-purple-50)', borderRadius: 'var(--admin-border-radius)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: '500' }}>Satisfação do cliente</span>
                          <span style={{ fontSize: 'var(--admin-font-size-lg)', fontWeight: '700', color: 'var(--color-purple-600)' }}>4.9/5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200-header">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200-title">🔗 Status dos Canais</div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200-content">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ padding: '16px', backgroundColor: 'var(--color-green-50)', borderRadius: 'var(--admin-border-radius)', border: '1px solid var(--color-green-200)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', backgroundColor: '#25D366', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ filter: 'brightness(0) invert(1)' }}>💬</span>
                            </div>
                            <div>
                              <div style={{ fontWeight: '600' }}>WhatsApp</div>
                              <div style={{ fontSize: 'var(--admin-font-size-xs)', color: 'var(--color-green-600)' }}>Conectado e funcionando</div>
                            </div>
                          </div>
                          <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--color-green-500)', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
                        </div>
                      </div>
                      
                      <div style={{ padding: '16px', backgroundColor: 'var(--color-blue-50)', borderRadius: 'var(--admin-border-radius)', border: '1px solid var(--color-blue-200)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', backgroundColor: '#1E40AF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ filter: 'brightness(0) invert(1)' }}>✉️</span>
                            </div>
                            <div>
                              <div style={{ fontWeight: '600' }}>Email</div>
                              <div style={{ fontSize: 'var(--admin-font-size-xs)', color: 'var(--color-blue-600)' }}>Sincronizado</div>
                            </div>
                          </div>
                          <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--color-blue-500)', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200-header">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200-title">🤖 Automações Ativas</div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200-content">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ padding: '16px', backgroundColor: 'var(--color-green-50)', borderRadius: 'var(--admin-border-radius)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: '500' }}>Resposta automática</div>
                            <div style={{ fontSize: 'var(--admin-font-size-xs)', color: 'var(--admin-text-secondary)' }}>Mensagens de boas-vindas</div>
                          </div>
                          <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--color-green-500)', borderRadius: '50%' }}></div>
                        </div>
                      </div>
                      <div style={{ padding: '16px', backgroundColor: 'var(--color-green-50)', borderRadius: 'var(--admin-border-radius)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: '500' }}>Distribuição automática</div>
                            <div style={{ fontSize: 'var(--admin-font-size-xs)', color: 'var(--admin-text-secondary)' }}>Roteamento inteligente</div>
                          </div>
                          <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--color-green-500)', borderRadius: '50%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}