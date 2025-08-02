'use client';

import React from 'react';

export default function OmnichannelDirectPage() {
  return (
    <html lang="pt-BR">
      <head>
        <title>Central Omnichannel - Fly2Any</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style dangerouslySetInnerHTML={{
          __html: `
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body, html {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Inter', sans-serif;
              background: #f8fafc;
              min-height: 100vh;
              color: #0f172a;
              line-height: 1.5;
              -webkit-font-smoothing: antialiased;
            }
            
            .container {
              width: 100%;
              min-height: 100vh;
              background: #f8fafc;
            }
            
            .topbar {
              background: white;
              border-bottom: 1px solid #e2e8f0;
              padding: 0 24px;
              height: 70px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              position: sticky;
              top: 0;
              z-index: 100;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            }
            
            .brand {
              display: flex;
              align-items: center;
              gap: 12px;
            }
            
            .brand-logo {
              width: 40px;
              height: 40px;
              background: linear-gradient(135deg, #3b82f6, #1d4ed8);
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 18px;
              font-weight: 600;
            }
            
            .brand-text h1 {
              font-size: 20px;
              font-weight: 700;
              color: #0f172a;
              margin: 0;
            }
            
            .brand-text p {
              font-size: 13px;
              color: #64748b;
              margin: 0;
            }
            
            .topbar-actions {
              display: flex;
              align-items: center;
              gap: 12px;
            }
            
            .status-indicator {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 8px 12px;
              background: #f0fdf4;
              border: 1px solid #bbf7d0;
              border-radius: 8px;
              font-size: 13px;
              font-weight: 500;
              color: #15803d;
            }
            
            .status-dot {
              width: 6px;
              height: 6px;
              background: #22c55e;
              border-radius: 50%;
              animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
            
            .btn-secondary {
              padding: 8px 16px;
              background: #f1f5f9;
              color: #475569;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s;
              text-decoration: none;
              display: inline-flex;
              align-items: center;
              gap: 6px;
            }
            
            .btn-secondary:hover {
              background: #e2e8f0;
              border-color: #cbd5e1;
            }
            
            .main-layout {
              display: flex;
              min-height: calc(100vh - 70px);
            }
            
            .sidebar {
              width: 280px;
              background: white;
              border-right: 1px solid #e2e8f0;
              padding: 24px 0;
              overflow-y: auto;
            }
            
            .sidebar-section {
              padding: 0 24px 24px 24px;
            }
            
            .sidebar-section h3 {
              font-size: 14px;
              font-weight: 600;
              color: #374151;
              margin-bottom: 12px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            
            .metrics-grid {
              display: grid;
              gap: 12px;
            }
            
            .metric-card {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 16px;
              transition: all 0.2s;
            }
            
            .metric-card:hover {
              border-color: #cbd5e1;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .metric-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 8px;
            }
            
            .metric-icon {
              width: 36px;
              height: 36px;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
            }
            
            .metric-icon.blue { background: #dbeafe; color: #1d4ed8; }
            .metric-icon.green { background: #dcfce7; color: #16a34a; }
            .metric-icon.yellow { background: #fef3c7; color: #d97706; }
            .metric-icon.purple { background: #f3e8ff; color: #9333ea; }
            
            .metric-value {
              font-size: 24px;
              font-weight: 700;
              color: #0f172a;
              margin: 0;
            }
            
            .metric-label {
              font-size: 13px;
              color: #64748b;
              margin: 4px 0 0 0;
            }
            
            .metric-change {
              font-size: 12px;
              font-weight: 500;
              padding: 2px 6px;
              border-radius: 4px;
              margin-top: 8px;
              display: inline-block;
            }
            
            .metric-change.positive {
              background: #dcfce7;
              color: #16a34a;
            }
            
            .metric-change.negative {
              background: #fee2e2;
              color: #dc2626;
            }
            
            .content-area {
              flex: 1;
              display: flex;
              flex-direction: column;
            }
            
            .content-header {
              background: white;
              border-bottom: 1px solid #e2e8f0;
              padding: 20px 32px;
            }
            
            .content-header h2 {
              font-size: 24px;
              font-weight: 700;
              color: #0f172a;
              margin: 0 0 4px 0;
            }
            
            .content-header p {
              font-size: 15px;
              color: #64748b;
              margin: 0;
            }
            
            .content-main {
              flex: 1;
              padding: 32px;
              background: #f8fafc;
            }
            
            .conversations-section {
              background: white;
              border: 1px solid #e2e8f0;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            }
            
            .section-header {
              background: #f8fafc;
              border-bottom: 1px solid #e2e8f0;
              padding: 20px 24px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            
            .section-title {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            
            .section-title h3 {
              font-size: 18px;
              font-weight: 600;
              color: #0f172a;
              margin: 0;
            }
            
            .section-title .icon {
              font-size: 20px;
            }
            
            .btn-primary {
              padding: 8px 16px;
              background: #3b82f6;
              color: white;
              border: none;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s;
              display: flex;
              align-items: center;
              gap: 6px;
            }
            
            .btn-primary:hover {
              background: #2563eb;
              transform: translateY(-1px);
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
            }
            
            .conversations-list {
              max-height: 600px;
              overflow-y: auto;
            }
            
            .conversation-item {
              padding: 20px 24px;
              border-bottom: 1px solid #f1f5f9;
              cursor: pointer;
              transition: all 0.2s;
              display: flex;
              align-items: center;
              gap: 16px;
            }
            
            .conversation-item:hover {
              background: #f8fafc;
            }
            
            .conversation-item:last-child {
              border-bottom: none;
            }
            
            .conversation-avatar {
              width: 48px;
              height: 48px;
              border-radius: 12px;
              background: #f1f5f9;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 20px;
              position: relative;
              flex-shrink: 0;
            }
            
            .conversation-avatar.whatsapp { background: #dcfce7; color: #16a34a; }
            .conversation-avatar.email { background: #dbeafe; color: #2563eb; }
            .conversation-avatar.webchat { background: #f3e8ff; color: #9333ea; }
            
            .unread-badge {
              position: absolute;
              top: -4px;
              right: -4px;
              width: 18px;
              height: 18px;
              background: #ef4444;
              color: white;
              border-radius: 50%;
              font-size: 11px;
              font-weight: 600;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 2px solid white;
            }
            
            .conversation-content {
              flex: 1;
              min-width: 0;
            }
            
            .conversation-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 4px;
            }
            
            .customer-name {
              font-size: 16px;
              font-weight: 600;
              color: #0f172a;
              margin: 0;
            }
            
            .conversation-time {
              font-size: 12px;
              color: #94a3b8;
              white-space: nowrap;
            }
            
            .last-message {
              font-size: 14px;
              color: #64748b;
              margin: 0;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            
            .conversation-meta {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-top: 8px;
            }
            
            .status-badge {
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: 500;
              text-transform: uppercase;
              letter-spacing: 0.025em;
            }
            
            .status-badge.active { background: #dcfce7; color: #16a34a; }
            .status-badge.pending { background: #fef3c7; color: #d97706; }
            .status-badge.resolved { background: #dbeafe; color: #2563eb; }
            
            .priority-badge {
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: 500;
              text-transform: uppercase;
              background: #fee2e2;
              color: #dc2626;
            }
            
            .empty-state {
              padding: 80px 40px;
              text-align: center;
              color: #64748b;
            }
            
            .empty-state .icon {
              font-size: 48px;
              margin-bottom: 16px;
              opacity: 0.5;
            }
            
            .empty-state h3 {
              font-size: 18px;
              font-weight: 600;
              color: #374151;
              margin-bottom: 8px;
            }
            
            .empty-state p {
              font-size: 14px;
              margin: 0;
              max-width: 300px;
              margin: 0 auto;
            }
            
            @media (max-width: 1024px) {
              .main-layout {
                flex-direction: column;
              }
              
              .sidebar {
                width: 100%;
                border-right: none;
                border-bottom: 1px solid #e2e8f0;
              }
              
              .metrics-grid {
                grid-template-columns: repeat(2, 1fr);
              }
            }
            
            @media (max-width: 640px) {
              .topbar {
                padding: 0 16px;
              }
              
              .content-main {
                padding: 16px;
              }
              
              .sidebar-section {
                padding: 0 16px 16px 16px;
              }
              
              .metrics-grid {
                grid-template-columns: 1fr;
              }
              
              .conversation-item {
                padding: 16px;
              }
            }
          `
        }} />
      </head>
      <body>
        <div className="container">
          {/* Top Bar */}
          <div className="topbar">
            <div className="brand">
              <div className="brand-logo">F</div>
              <div className="brand-text">
                <h1>Central Omnichannel</h1>
                <p>Atendimento unificado</p>
              </div>
            </div>
            
            <div className="topbar-actions">
              <div className="status-indicator">
                <div className="status-dot"></div>
                Online
              </div>
              <a href="/admin" className="btn-secondary">
                ← Admin
              </a>
            </div>
          </div>

          <div className="main-layout">
            {/* Sidebar com Métricas */}
            <div className="sidebar">
              <div className="sidebar-section">
                <h3>Métricas em Tempo Real</h3>
                <div className="metrics-grid">
                  <div className="metric-card">
                    <div className="metric-header">
                      <div>
                        <p className="metric-value">12</p>
                        <p className="metric-label">Conversas Ativas</p>
                      </div>
                      <div className="metric-icon blue">💬</div>
                    </div>
                    <div className="metric-change positive">+18% hoje</div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-header">
                      <div>
                        <p className="metric-value">3</p>
                        <p className="metric-label">Pendentes</p>
                      </div>
                      <div className="metric-icon yellow">⏳</div>
                    </div>
                    <div className="metric-change negative">-25% hoje</div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-header">
                      <div>
                        <p className="metric-value">1.2min</p>
                        <p className="metric-label">Tempo Resposta</p>
                      </div>
                      <div className="metric-icon green">⚡</div>
                    </div>
                    <div className="metric-change positive">-30% hoje</div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-header">
                      <div>
                        <p className="metric-value">4.8/5</p>
                        <p className="metric-label">Satisfação</p>
                      </div>
                      <div className="metric-icon purple">⭐</div>
                    </div>
                    <div className="metric-change positive">+0.2 hoje</div>
                  </div>
                </div>
              </div>

              <div className="sidebar-section">
                <h3>Canais Ativos</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>📱</span>
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>WhatsApp</span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>8 ativas</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>📧</span>
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>Email</span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600' }}>2 ativas</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>💬</span>
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>Chat Web</span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#9333ea', fontWeight: '600' }}>2 ativas</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Área Principal */}
            <div className="content-area">
              <div className="content-header">
                <h2>Conversas em Andamento</h2>
                <p>Gerencie todas as conversas de diferentes canais em um só lugar</p>
              </div>

              <div className="content-main">
                <div className="conversations-section">
                  <div className="section-header">
                    <div className="section-title">
                      <span className="icon">📋</span>
                      <h3>Lista de Conversas</h3>
                    </div>
                    <button className="btn-primary">
                      🔄 Atualizar
                    </button>
                  </div>

                  <div className="conversations-list">
                    {/* Conversa 1 - WhatsApp */}
                    <div className="conversation-item">
                      <div className="conversation-avatar whatsapp">
                        📱
                        <div className="unread-badge">3</div>
                      </div>
                      <div className="conversation-content">
                        <div className="conversation-header">
                          <h4 className="customer-name">Maria Silva</h4>
                          <span className="conversation-time">há 2min</span>
                        </div>
                        <p className="last-message">Gostaria de saber sobre os voos para São Paulo...</p>
                        <div className="conversation-meta">
                          <span className="status-badge active">Ativa</span>
                          <span className="priority-badge">Alta</span>
                        </div>
                      </div>
                    </div>

                    {/* Conversa 2 - Email */}
                    <div className="conversation-item">
                      <div className="conversation-avatar email">
                        📧
                      </div>
                      <div className="conversation-content">
                        <div className="conversation-header">
                          <h4 className="customer-name">João Santos</h4>
                          <span className="conversation-time">há 15min</span>
                        </div>
                        <p className="last-message">Preciso alterar a data da minha viagem de volta...</p>
                        <div className="conversation-meta">
                          <span className="status-badge pending">Pendente</span>
                        </div>
                      </div>
                    </div>

                    {/* Conversa 3 - Chat Web */}
                    <div className="conversation-item">
                      <div className="conversation-avatar webchat">
                        💬
                        <div className="unread-badge">1</div>
                      </div>
                      <div className="conversation-content">
                        <div className="conversation-header">
                          <h4 className="customer-name">Ana Costa</h4>
                          <span className="conversation-time">há 1h</span>
                        </div>
                        <p className="last-message">Qual o melhor seguro viagem para o Brasil?</p>
                        <div className="conversation-meta">
                          <span className="status-badge active">Ativa</span>
                        </div>
                      </div>
                    </div>

                    {/* Conversa 4 - WhatsApp */}
                    <div className="conversation-item">
                      <div className="conversation-avatar whatsapp">
                        📱
                      </div>
                      <div className="conversation-content">
                        <div className="conversation-header">
                          <h4 className="customer-name">Carlos Pereira</h4>
                          <span className="conversation-time">há 2h</span>
                        </div>
                        <p className="last-message">Obrigado pelo excelente atendimento!</p>
                        <div className="conversation-meta">
                          <span className="status-badge resolved">Resolvida</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}