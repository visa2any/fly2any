'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Mail, 
  Users, 
  TrendingUp, 
  Eye,
  MousePointer,
  AlertTriangle,
  RefreshCw,
  Send,
  FileText,
  BarChart3,
  Settings,
  Plus,
  Play,
  Pause,
  Clock,
  Heart,
  AlertCircle,
  CheckCircle,
  TrendingDown,
  Zap,
  Target,
  Shield
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: string;
  created_at: string;
  total_recipients: number;
  total_sent: number;
  total_delivered: number;
  total_opened: number;
  total_clicked: number;
  total_bounced: number;
}

interface RealTimeMetrics {
  campaignId: string;
  totalSent: number;
  delivered: number;
  bounced: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  lastUpdate: string;
  summary: {
    totalEmails: number;
    successRate: string;
    engagementRate: string;
    status: string;
  };
}

interface ContactStats {
  total: number;
  bySegment: Record<string, number>;
  byStatus: Record<string, number>;
}

interface CampaignHealth {
  status: 'healthy' | 'warning' | 'critical';
  score: number;
  issues: string[];
  recommendations: string[];
  trends: {
    openRate: { current: number; previous: number; trend: 'up' | 'down' | 'stable' };
    clickRate: { current: number; previous: number; trend: 'up' | 'down' | 'stable' };
    bounceRate: { current: number; previous: number; trend: 'up' | 'down' | 'stable' };
  };
}

export default function UnifiedEmailMarketingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics | null>(null);
  const [contactStats, setContactStats] = useState<ContactStats | null>(null);
  const [campaignHealth, setCampaignHealth] = useState<CampaignHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeTab, setActiveTab] = useState('campaigns');

  useEffect(() => {
    loadInitialData();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        refreshData();
      }, 10000); // Refresh a cada 10 segundos
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadCampaigns(),
        loadContactStats()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCampaigns = async () => {
    try {
      const response = await fetch('/api/email-marketing?action=campaigns');
      const data = await response.json();
      
      if (data.success) {
        setCampaigns(data.data.campaigns || []);
        
        // Selecionar campanha mais recente se nenhuma selecionada
        if (!selectedCampaign && data.data.campaigns?.length > 0) {
          const latest = data.data.campaigns[0];
          setSelectedCampaign(latest);
          loadCampaignMetrics(latest.id);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar campanhas:', error);
    }
  };

  const loadContactStats = async () => {
    try {
      const response = await fetch('/api/email-marketing?action=contacts&limit=1');
      const data = await response.json();
      
      if (data.success) {
        setContactStats({
          total: data.data?.total || 0,
          bySegment: data.data?.stats?.bySegmento || {},
          byStatus: data.data?.stats?.byStatus || {}
        });
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas de contatos:', error);
    }
  };

  const loadCampaignMetrics = async (campaignId: string) => {
    try {
      const [metricsResponse, healthResponse] = await Promise.all([
        fetch(`/api/email-marketing/metrics?campaign_id=${campaignId}&action=realtime`),
        fetch(`/api/email-marketing/health?campaign_id=${campaignId}`)
      ]);
      
      const metricsData = await metricsResponse.json();
      const healthData = await healthResponse.json();
      
      if (metricsData.success) {
        setRealTimeMetrics(metricsData.data);
      }
      
      if (healthData.success) {
        setCampaignHealth(healthData.data);
      }
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadCampaigns(),
        selectedCampaign ? loadCampaignMetrics(selectedCampaign.id) : Promise.resolve()
      ]);
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sending': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceColor = (rate: number, type: 'open' | 'click' | 'bounce') => {
    if (type === 'bounce') {
      return rate < 2 ? 'text-green-600' : rate < 5 ? 'text-yellow-600' : 'text-red-600';
    }
    if (type === 'open') {
      return rate > 25 ? 'text-green-600' : rate > 15 ? 'text-yellow-600' : 'text-red-600';
    }
    // click
    return rate > 5 ? 'text-green-600' : rate > 2 ? 'text-yellow-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <span>Carregando sistema de email marketing...</span>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        
        {/* Header */}
        <div className="admin-header-section">
          <div>
            <h1 className="admin-page-title">📧 Email Marketing Unificado</h1>
            <p className="admin-page-subtitle">Dashboard completo com métricas em tempo real</p>
          </div>
          <div className="admin-header-actions">
            <button
              className={`admin-btn admin-btn-outline admin-btn-sm ${autoRefresh ? 'admin-btn-success' : ''}`}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <Activity className="w-4 h-4" />
              Auto Refresh {autoRefresh ? 'ON' : 'OFF'}
            </button>
            <button 
              className="admin-btn admin-btn-outline admin-btn-sm" 
              onClick={refreshData} 
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'admin-spinner' : ''}`} />
              Atualizar
            </button>
            <button className="admin-btn admin-btn-primary admin-btn-sm">
              <Plus className="w-4 h-4" />
              Nova Campanha
            </button>
          </div>
        </div>

        {/* Estatísticas Gerais */}
        <div className="admin-grid admin-grid-4">
          <div className="admin-stats-card">
            <div className="admin-stats-header">
              <span className="admin-stats-title">Total Contatos</span>
              <Users className="admin-stats-icon" />
            </div>
            <div className="admin-stats-value">{contactStats?.total.toLocaleString() || '0'}</div>
            <div className="admin-stats-label">
              {contactStats?.byStatus?.ativo || 0} ativos
            </div>
          </div>

          <div className="admin-stats-card">
            <div className="admin-stats-header">
              <span className="admin-stats-title">Campanhas Ativas</span>
              <Send className="admin-stats-icon" />
            </div>
            <div className="admin-stats-value">
              {campaigns.filter(c => c.status === 'sending').length}
            </div>
            <div className="admin-stats-label">
              {campaigns.length} total
            </div>
          </div>

          {realTimeMetrics && (
            <>
              <div className="admin-stats-card">
                <div className="admin-stats-header">
                  <span className="admin-stats-title">Taxa de Abertura</span>
                  <Eye className="admin-stats-icon" />
                </div>
                <div className={`admin-stats-value ${getPerformanceColor(realTimeMetrics.openRate, 'open')}`}>
                  {realTimeMetrics.openRate.toFixed(1)}%
                </div>
                <div className="admin-stats-label">
                  {realTimeMetrics.opened} aberturas
                </div>
              </div>

              <div className="admin-stats-card">
                <div className="admin-stats-header">
                  <span className="admin-stats-title">Taxa de Clique</span>
                  <MousePointer className="admin-stats-icon" />
                </div>
                <div className={`admin-stats-value ${getPerformanceColor(realTimeMetrics.clickRate, 'click')}`}>
                  {realTimeMetrics.clickRate.toFixed(1)}%
                </div>
                <div className="admin-stats-label">
                  {realTimeMetrics.clicked} cliques
                </div>
              </div>
            </>
          )}
        </div>

        {/* Conteúdo Principal */}
        <div className="admin-tabs">
          <div className="admin-tabs-list">
            <button 
              className={`admin-tab-trigger ${activeTab === 'campaigns' ? 'active' : ''}`}
              onClick={() => setActiveTab('campaigns')}
            >
              Campanhas
            </button>
            <button 
              className={`admin-tab-trigger ${activeTab === 'realtime' ? 'active' : ''}`}
              onClick={() => setActiveTab('realtime')}
            >
              Tempo Real
            </button>
            <button 
              className={`admin-tab-trigger ${activeTab === 'health' ? 'active' : ''}`}
              onClick={() => setActiveTab('health')}
            >
              Saúde
            </button>
            <button 
              className={`admin-tab-trigger ${activeTab === 'templates' ? 'active' : ''}`}
              onClick={() => setActiveTab('templates')}
            >
              Templates
            </button>
            <button 
              className={`admin-tab-trigger ${activeTab === 'contacts' ? 'active' : ''}`}
              onClick={() => setActiveTab('contacts')}
            >
              Contatos
            </button>
            <button 
              className={`admin-tab-trigger ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button>
          </div>

          {/* Tab Campanhas */}
          {activeTab === 'campaigns' && (
            <div className="admin-tab-content">
              <div className="admin-grid admin-grid-3">
                
                {/* Lista de Campanhas */}
                <div className="admin-card" style={{ gridColumn: 'span 2' }}>
                  <div className="admin-card-header">
                    <div>
                      <h3 className="admin-card-title">Campanhas Recentes</h3>
                      <p className="admin-card-description">Últimas campanhas de email marketing</p>
                    </div>
                  </div>
                  <div className="admin-card-content">
                    <div className="admin-gap-4 admin-overflow-y-auto" style={{ maxHeight: '400px' }}>
                      {campaigns.map((campaign) => (
                        <div 
                          key={campaign.id}
                          className={`admin-p-4 admin-border admin-rounded-lg admin-cursor-pointer admin-transition ${
                            selectedCampaign?.id === campaign.id 
                              ? 'admin-border admin-bg-blue-50' 
                              : 'admin-border'
                          }`}
                          onClick={() => {
                            setSelectedCampaign(campaign);
                            loadCampaignMetrics(campaign.id);
                          }}
                          style={{ marginBottom: '16px' }}
                        >
                          <div className="admin-flex admin-flex-between admin-mb-2">
                            <h4 className="admin-font-semibold admin-text-sm">{campaign.name}</h4>
                            <span className={`admin-badge admin-status-${campaign.status}`}>
                              {campaign.status}
                            </span>
                          </div>
                          <p className="admin-text-sm admin-text-gray-600 admin-mb-2">{campaign.subject}</p>
                          <div className="admin-flex admin-flex-between admin-text-xs admin-text-gray-500">
                            <span>{campaign.total_recipients} destinatários</span>
                            <span>{new Date(campaign.created_at).toLocaleDateString()}</span>
                          </div>
                          {campaign.total_sent > 0 && (
                            <div className="admin-mt-2 admin-text-xs admin-text-gray-600">
                              📊 {campaign.total_sent} enviados • {campaign.total_opened} abertos • {campaign.total_clicked} cliques
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Detalhes da Campanha Selecionada */}
                {selectedCampaign && (
                  <div className="admin-card">
                    <div className="admin-card-header">
                      <div>
                        <h3 className="admin-card-title">{selectedCampaign.name}</h3>
                        <p className="admin-card-description">Detalhes da campanha selecionada</p>
                      </div>
                    </div>
                    <div className="admin-card-content">
                      <div className="admin-gap-4">
                        <div className="admin-field-group">
                          <label className="admin-label">Status</label>
                          <span className={`admin-badge admin-status-${selectedCampaign.status}`}>
                            {selectedCampaign.status}
                          </span>
                        </div>
                        
                        <div className="admin-field-group">
                          <label className="admin-label">Assunto</label>
                          <p className="admin-text-sm admin-text-gray-600">{selectedCampaign.subject}</p>
                        </div>
                        
                        <div className="admin-grid admin-grid-2 admin-gap-4 admin-text-center">
                          <div className="admin-p-3 admin-bg-gray-50 admin-rounded-lg">
                            <div className="admin-text-lg admin-font-bold admin-text-blue-600">{selectedCampaign.total_sent}</div>
                            <div className="admin-text-xs admin-text-blue-600">Enviados</div>
                          </div>
                          <div className="admin-p-3 admin-bg-gray-50 admin-rounded-lg">
                            <div className="admin-text-lg admin-font-bold admin-text-green-600">{selectedCampaign.total_delivered}</div>
                            <div className="admin-text-xs admin-text-green-600">Entregues</div>
                          </div>
                        </div>
                        
                        {selectedCampaign.status === 'sending' && (
                          <div className="admin-flex admin-gap-2">
                            <button className="admin-btn admin-btn-outline admin-btn-sm admin-w-full">
                              <Pause className="w-4 h-4" />
                              Pausar
                            </button>
                          </div>
                        )}
                        
                        {selectedCampaign.status === 'paused' && (
                          <div className="admin-flex admin-gap-2">
                            <button className="admin-btn admin-btn-primary admin-btn-sm admin-w-full">
                              <Play className="w-4 h-4" />
                              Retomar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab Tempo Real */}
          {activeTab === 'realtime' && (
            <div className="admin-tab-content">
              {realTimeMetrics && selectedCampaign ? (
                <div className="admin-grid admin-grid-2">
                  
                  {/* Métricas em Tempo Real */}
                  <div className="admin-card">
                    <div className="admin-card-header">
                      <div>
                        <h3 className="admin-card-title admin-flex admin-flex-between">
                          📊 Métricas em Tempo Real
                          <span className="admin-badge admin-badge-neutral">
                            <Clock className="w-3 h-3" />
                            Atualizado há {Math.floor((Date.now() - new Date(realTimeMetrics.lastUpdate).getTime()) / 1000)}s
                          </span>
                        </h3>
                        <p className="admin-card-description">Campanha: {selectedCampaign.name}</p>
                      </div>
                    </div>
                    <div className="admin-card-content">
                      <div className="admin-grid admin-grid-2 admin-gap-4">
                        <div className="admin-text-center admin-p-4 admin-bg-gray-50 admin-rounded-lg">
                          <div className="admin-text-2xl admin-font-bold" style={{color: '#3b82f6'}}>{realTimeMetrics.totalSent}</div>
                          <div className="admin-text-sm" style={{color: '#3b82f6'}}>Total Enviados</div>
                        </div>
                        <div className="admin-text-center admin-p-4 admin-bg-gray-50 admin-rounded-lg">
                          <div className="admin-text-2xl admin-font-bold" style={{color: '#10b981'}}>{realTimeMetrics.delivered}</div>
                          <div className="admin-text-sm" style={{color: '#10b981'}}>Entregues</div>
                        </div>
                        <div className="admin-text-center admin-p-4 admin-bg-gray-50 admin-rounded-lg">
                          <div className="admin-text-2xl admin-font-bold" style={{color: '#8b5cf6'}}>{realTimeMetrics.opened}</div>
                          <div className="admin-text-sm" style={{color: '#8b5cf6'}}>Abertos</div>
                        </div>
                        <div className="admin-text-center admin-p-4 admin-bg-gray-50 admin-rounded-lg">
                          <div className="admin-text-2xl admin-font-bold" style={{color: '#f59e0b'}}>{realTimeMetrics.clicked}</div>
                          <div className="admin-text-sm" style={{color: '#f59e0b'}}>Cliques</div>
                        </div>
                      </div>
                      
                      <div className="admin-mt-6" style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                        <div className="admin-flex admin-flex-between">
                          <span className="admin-text-sm admin-font-medium">Taxa de Abertura</span>
                          <span className={`admin-font-bold ${getPerformanceColor(realTimeMetrics.openRate, 'open')}`}>
                            {realTimeMetrics.openRate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="admin-flex admin-flex-between">
                          <span className="admin-text-sm admin-font-medium">Taxa de Clique</span>
                          <span className={`admin-font-bold ${getPerformanceColor(realTimeMetrics.clickRate, 'click')}`}>
                            {realTimeMetrics.clickRate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="admin-flex admin-flex-between">
                          <span className="admin-text-sm admin-font-medium">Taxa de Rejeição</span>
                          <span className={`admin-font-bold ${getPerformanceColor(realTimeMetrics.bounceRate, 'bounce')}`}>
                            {realTimeMetrics.bounceRate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status da Performance */}
                  <div className="admin-card">
                    <div className="admin-card-header">
                      <div>
                        <h3 className="admin-card-title">🎯 Status da Performance</h3>
                        <p className="admin-card-description">Análise automática da campanha</p>
                      </div>
                    </div>
                    <div className="admin-card-content">
                      <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                        <div className={`admin-p-4 admin-rounded-lg ${
                          realTimeMetrics.summary.status === 'excellent' ? 'admin-alert-success' :
                          realTimeMetrics.summary.status === 'good' ? 'admin-alert-info' :
                          'admin-alert-warning'
                        }`}>
                          <div className="admin-font-semibold">
                            {realTimeMetrics.summary.status === 'excellent' ? '🎉 Excelente Performance' :
                             realTimeMetrics.summary.status === 'good' ? '👍 Boa Performance' :
                             '⚠️ Performance Problemática'}
                          </div>
                          <div className="admin-text-sm admin-mt-1">
                            Taxa de sucesso: {realTimeMetrics.summary.successRate}% • 
                            Engajamento: {realTimeMetrics.summary.engagementRate}%
                          </div>
                        </div>
                        
                        <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}} className="admin-text-sm">
                          <div className="admin-flex admin-flex-between">
                            <span>Emails Processados:</span>
                            <span className="admin-font-medium">{realTimeMetrics.summary.totalEmails}</span>
                          </div>
                          <div className="admin-flex admin-flex-between">
                            <span>Taxa de Entrega:</span>
                            <span className="admin-font-medium">{realTimeMetrics.summary.successRate}%</span>
                          </div>
                          <div className="admin-flex admin-flex-between">
                            <span>Engajamento Total:</span>
                            <span className="admin-font-medium">{realTimeMetrics.summary.engagementRate}%</span>
                          </div>
                        </div>
                        
                        <div className="admin-mt-4 admin-p-3 admin-bg-gray-100 admin-rounded-lg admin-text-xs admin-text-gray-600">
                          💡 <strong>Dica:</strong> 
                          {realTimeMetrics.openRate < 15 ? ' Considere melhorar o assunto do email.' :
                           realTimeMetrics.clickRate < 2 ? ' Tente adicionar call-to-actions mais atraentes.' :
                           ' Continue com essa estratégia, está funcionando bem!'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="admin-card">
                  <div className="admin-card-content admin-text-center" style={{padding: '48px 24px'}}>
                    <BarChart3 className="w-12 h-12 admin-text-gray-500" style={{margin: '0 auto 16px'}} />
                    <h3 className="admin-text-lg admin-font-semibold admin-text-gray-600 admin-mb-2">Selecione uma Campanha</h3>
                    <p className="admin-text-gray-500">Escolha uma campanha na aba "Campanhas" para ver métricas em tempo real</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Outras Tabs - Placeholder simples */}
          {activeTab === 'health' && (
            <div className="admin-tab-content">
              <div className="admin-card">
                <div className="admin-card-content admin-text-center" style={{padding: '48px 24px'}}>
                  <Shield className="w-12 h-12 admin-text-gray-500" style={{margin: '0 auto 16px'}} />
                  <h3 className="admin-text-lg admin-font-semibold admin-text-gray-600 admin-mb-2">Análise de Saúde</h3>
                  <p className="admin-text-gray-500">Funcionalidade em desenvolvimento</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="admin-tab-content">
              <div className="admin-card">
                <div className="admin-card-content admin-text-center" style={{padding: '48px 24px'}}>
                  <FileText className="w-12 h-12 admin-text-gray-500" style={{margin: '0 auto 16px'}} />
                  <h3 className="admin-text-lg admin-font-semibold admin-text-gray-600 admin-mb-2">Templates</h3>
                  <p className="admin-text-gray-500">Funcionalidade em desenvolvimento</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="admin-tab-content">
              <div className="admin-card">
                <div className="admin-card-content admin-text-center" style={{padding: '48px 24px'}}>
                  <Users className="w-12 h-12 admin-text-gray-500" style={{margin: '0 auto 16px'}} />
                  <h3 className="admin-text-lg admin-font-semibold admin-text-gray-600 admin-mb-2">Gestão de Contatos</h3>
                  <p className="admin-text-gray-500">Funcionalidade em desenvolvimento</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="admin-tab-content">
              <div className="admin-card">
                <div className="admin-card-content admin-text-center" style={{padding: '48px 24px'}}>
                  <TrendingUp className="w-12 h-12 admin-text-gray-500" style={{margin: '0 auto 16px'}} />
                  <h3 className="admin-text-lg admin-font-semibold admin-text-gray-600 admin-mb-2">Analytics Avançados</h3>
                  <p className="admin-text-gray-500">Funcionalidade em desenvolvimento</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}