'use client';
export const dynamic = 'force-dynamic';

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

interface Template {
  id: string;
  name: string;
  description: string;
  type: 'promotional' | 'newsletter' | 'transactional';
  subject: string;
  html: string;
  created_at?: string;
}

interface Contact {
  id: string;
  nome?: string;
  name?: string;
  email: string;
  segmento?: string;
  segment?: string;
  status: 'ativo' | 'inativo';
  created_at?: string;
}

interface Analytics {
  averageOpenRate: number;
  averageClickRate: number;
  conversionRate: number;
  averageROI: number;
  totalCampaigns: number;
  totalContacts: number;
  segmentAnalysis?: any[];
  topCampaigns?: any[];
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
  const [templates, setTemplates] = useState<Template[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    loadInitialData();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        refreshData();
      }, 10000); // Refresh a cada 10 segundos
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadInitialData = async (): Promise<void> => {
    setLoading(true);
    try {
      await Promise.all([
        loadCampaigns(),
        loadContactStats(),
        loadTemplates(),
        loadContacts(),
        loadAnalytics()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCampaigns = async (): Promise<void> => {
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

  const loadContactStats = async (): Promise<void> => {
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

  const loadTemplates = async (): Promise<void> => {
    try {
      const response = await fetch('/api/email-templates?action=list');
      const data = await response.json();
      
      if (data.success) {
        setTemplates(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    }
  };

  const loadContacts = async (): Promise<void> => {
    try {
      const response = await fetch('/api/email-marketing?action=contacts&limit=50');
      const data = await response.json();
      
      if (data.success) {
        setContacts(data.data?.contacts || []);
      }
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
    }
  };

  const loadAnalytics = async (): Promise<void> => {
    try {
      const response = await fetch('/api/email-marketing/analytics');
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    }
  };

  const refreshData = async (): Promise<void> => {
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
        <div className="h-16 bg-white/95 backdrop-blur-lg border-b border-slate-200 flex items-center justify-between px-6-section">
          <div>
            <h1 className="admin-page-title">📧 Email Marketing Unificado</h1>
            <p className="admin-page-subtitle">Dashboard completo com métricas em tempo real</p>
          </div>
          <div className="h-16 bg-white/95 backdrop-blur-lg border-b border-slate-200 flex items-center justify-between px-6-actions">
            <button
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200-outline inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200-sm ${autoRefresh ? 'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200-success' : ''}`}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <Activity className="w-4 h-4" />
              Auto Refresh {autoRefresh ? 'ON' : 'OFF'}
            </button>
            <button 
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200-outline inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200-sm" 
              onClick={refreshData} 
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'admin-spinner' : ''}`} />
              Atualizar
            </button>
            <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200-sm">
              <Plus className="w-4 h-4" />
              Nova Campanha
            </button>
          </div>
        </div>

        {/* Estatísticas Gerais */}
        <div className="admin-grid admin-grid-4">
          <div className="glass-card rounded-xl p-6 text-center shadow-lg shadow-gray-200/50">
            <div className="admin-stats-header">
              <span className="admin-stats-title">Total Contatos</span>
              <Users className="admin-stats-icon" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">{contactStats?.total.toLocaleString() || '0'}</div>
            <div className="text-sm font-medium text-slate-600">
              {contactStats?.byStatus?.ativo || 0} ativos
            </div>
          </div>

          <div className="glass-card rounded-xl p-6 text-center shadow-lg shadow-gray-200/50">
            <div className="admin-stats-header">
              <span className="admin-stats-title">Campanhas Ativas</span>
              <Send className="admin-stats-icon" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">
              {campaigns.filter(c => c.status === 'sending').length}
            </div>
            <div className="text-sm font-medium text-slate-600">
              {campaigns.length} total
            </div>
          </div>

          {realTimeMetrics && (
            <>
              <div className="glass-card rounded-xl p-6 text-center shadow-lg shadow-gray-200/50">
                <div className="admin-stats-header">
                  <span className="admin-stats-title">Taxa de Abertura</span>
                  <Eye className="admin-stats-icon" />
                </div>
                <div className={`text-3xl font-bold text-slate-900 mb-2 ${getPerformanceColor(realTimeMetrics.openRate, 'open')}`}>
                  {realTimeMetrics.openRate.toFixed(1)}%
                </div>
                <div className="text-sm font-medium text-slate-600">
                  {realTimeMetrics.opened} aberturas
                </div>
              </div>

              <div className="glass-card rounded-xl p-6 text-center shadow-lg shadow-gray-200/50">
                <div className="admin-stats-header">
                  <span className="admin-stats-title">Taxa de Clique</span>
                  <MousePointer className="admin-stats-icon" />
                </div>
                <div className={`text-3xl font-bold text-slate-900 mb-2 ${getPerformanceColor(realTimeMetrics.clickRate, 'click')}`}>
                  {realTimeMetrics.clickRate.toFixed(1)}%
                </div>
                <div className="text-sm font-medium text-slate-600">
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
                <div className="bg-white rounded-xl shadow-lg border border-gray-200" style={{ gridColumn: 'span 2' }}>
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200-header">
                    <div>
                      <h3 className="bg-white rounded-xl shadow-lg border border-gray-200-title">Campanhas Recentes</h3>
                      <p className="bg-white rounded-xl shadow-lg border border-gray-200-description">Últimas campanhas de email marketing</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200-content">
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
                            <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full admin-status-${campaign.status}`}>
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
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200-header">
                      <div>
                        <h3 className="bg-white rounded-xl shadow-lg border border-gray-200-title">{selectedCampaign.name}</h3>
                        <p className="bg-white rounded-xl shadow-lg border border-gray-200-description">Detalhes da campanha selecionada</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200-content">
                      <div className="admin-gap-4">
                        <div className="admin-field-group">
                          <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full admin-status-${selectedCampaign.status}`}>
                            {selectedCampaign.status}
                          </span>
                        </div>
                        
                        <div className="admin-field-group">
                          <label className="block text-sm font-medium text-slate-700 mb-2">Assunto</label>
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
                            <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200-outline inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200-sm admin-w-full">
                              <Pause className="w-4 h-4" />
                              Pausar
                            </button>
                          </div>
                        )}
                        
                        {selectedCampaign.status === 'paused' && (
                          <div className="admin-flex admin-gap-2">
                            <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200-sm admin-w-full">
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
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200-header">
                      <div>
                        <h3 className="bg-white rounded-xl shadow-lg border border-gray-200-title admin-flex admin-flex-between">
                          📊 Métricas em Tempo Real
                          <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full inline-flex items-center px-3 py-1 text-xs font-medium rounded-full-neutral">
                            <Clock className="w-3 h-3" />
                            Atualizado há {Math.floor((Date.now() - new Date(realTimeMetrics.lastUpdate).getTime()) / 1000)}s
                          </span>
                        </h3>
                        <p className="bg-white rounded-xl shadow-lg border border-gray-200-description">Campanha: {selectedCampaign.name}</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200-content">
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
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200-header">
                      <div>
                        <h3 className="bg-white rounded-xl shadow-lg border border-gray-200-title">🎯 Status da Performance</h3>
                        <p className="bg-white rounded-xl shadow-lg border border-gray-200-description">Análise automática da campanha</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200-content">
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
                <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200-content admin-text-center" style={{padding: '48px 24px'}}>
                    <BarChart3 className="w-12 h-12 admin-text-gray-500" style={{margin: '0 auto 16px'}} />
                    <h3 className="admin-text-lg admin-font-semibold admin-text-gray-600 admin-mb-2">Selecione uma Campanha</h3>
                    <p className="admin-text-gray-500">Escolha uma campanha na aba "Campanhas" para ver métricas em tempo real</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Aba Saúde da Campanha */}
          {activeTab === 'health' && (
            <div className="admin-tab-content">
              {campaignHealth && selectedCampaign ? (
                <div className="admin-grid admin-grid-1">
                  
                  {/* Header da seção */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200-header">
                      <div className="admin-flex admin-flex-between">
                        <div>
                          <h3 className="bg-white rounded-xl shadow-lg border border-gray-200-title">🏥 Análise de Saúde da Campanha</h3>
                          <p className="bg-white rounded-xl shadow-lg border border-gray-200-description">Campanha: {selectedCampaign.name}</p>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                          campaignHealth.status === 'healthy' ? 'inline-flex items-center px-3 py-1 text-xs font-medium rounded-full-success' : 
                          campaignHealth.status === 'warning' ? 'inline-flex items-center px-3 py-1 text-xs font-medium rounded-full-warning' : 'inline-flex items-center px-3 py-1 text-xs font-medium rounded-full-danger'
                        }`}>
                          {campaignHealth.status === 'healthy' ? '🟢 Saudável' :
                           campaignHealth.status === 'warning' ? '🟡 Atenção' : '🔴 Crítico'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="admin-grid admin-grid-2">
                    {/* Score de Saúde */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                      <div className="bg-white rounded-xl shadow-lg border border-gray-200-header">
                        <h3 className="bg-white rounded-xl shadow-lg border border-gray-200-title">
                          {campaignHealth.status === 'healthy' ? <Heart className="w-5 h-5 admin-text-green-500" /> :
                           campaignHealth.status === 'warning' ? <AlertTriangle className="w-5 h-5 admin-text-yellow-500" /> :
                           <AlertCircle className="w-5 h-5 admin-text-red-500" />}
                          Score de Saúde
                        </h3>
                      </div>
                      <div className="bg-white rounded-xl shadow-lg border border-gray-200-content">
                        <div className="admin-text-center admin-mb-6">
                          <div className={`admin-text-6xl admin-font-bold admin-mb-2 ${
                            campaignHealth.score >= 75 ? 'admin-text-green-600' :
                            campaignHealth.score >= 50 ? 'admin-text-yellow-600' : 'admin-text-red-600'
                          }`}>
                            {campaignHealth.score}
                          </div>
                          <div className="admin-text-sm admin-text-gray-500">de 100 pontos</div>
                        </div>
                        
                        {/* Barra de Progresso */}
                        <div className="admin-w-full admin-bg-gray-100 admin-rounded-full" style={{height: '12px'}}>
                          <div 
                            className={`admin-rounded-full admin-transition ${
                              campaignHealth.score >= 75 ? 'admin-bg-green-500' :
                              campaignHealth.score >= 50 ? 'admin-bg-yellow-500' : 'admin-bg-red-500'
                            }`}
                            style={{ 
                              width: `${campaignHealth.score}%`, 
                              height: '12px',
                              background: campaignHealth.score >= 75 ? 
                                'linear-gradient(90deg, #10b981, #34d399)' :
                                campaignHealth.score >= 50 ? 
                                'linear-gradient(90deg, #f59e0b, #fbbf24)' : 
                                'linear-gradient(90deg, #ef4444, #f87171)'
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Tendências */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                      <div className="bg-white rounded-xl shadow-lg border border-gray-200-header">
                        <h3 className="bg-white rounded-xl shadow-lg border border-gray-200-title">
                          <TrendingUp className="w-5 h-5" />
                          Tendências vs Campanha Anterior
                        </h3>
                      </div>
                      <div className="bg-white rounded-xl shadow-lg border border-gray-200-content">
                        <div className="admin-grid admin-grid-1" style={{gap: '12px'}}>
                          {/* Taxa de Abertura */}
                          <div className="admin-flex admin-flex-between admin-p-3 admin-bg-gray-50 admin-rounded-lg">
                            <div>
                              <div className="admin-font-medium">Taxa de Abertura</div>
                              <div className="admin-text-sm admin-text-gray-600">
                                {campaignHealth.trends.openRate.current.toFixed(1)}% 
                                <span className="admin-text-gray-400 admin-ml-2">
                                  (anterior: {campaignHealth.trends.openRate.previous.toFixed(1)}%)
                                </span>
                              </div>
                            </div>
                            <div className="admin-flex admin-flex-center">
                              {campaignHealth.trends.openRate.trend === 'up' ? 
                                <TrendingUp className="w-5 h-5 admin-text-green-500" /> :
                                campaignHealth.trends.openRate.trend === 'down' ? 
                                <TrendingDown className="w-5 h-5 admin-text-red-500" /> :
                                <div className="w-5 h-5 admin-text-gray-400">→</div>
                              }
                            </div>
                          </div>

                          {/* Taxa de Clique */}
                          <div className="admin-flex admin-flex-between admin-p-3 admin-bg-gray-50 admin-rounded-lg">
                            <div>
                              <div className="admin-font-medium">Taxa de Clique</div>
                              <div className="admin-text-sm admin-text-gray-600">
                                {campaignHealth.trends.clickRate.current.toFixed(1)}% 
                                <span className="admin-text-gray-400 admin-ml-2">
                                  (anterior: {campaignHealth.trends.clickRate.previous.toFixed(1)}%)
                                </span>
                              </div>
                            </div>
                            <div className="admin-flex admin-flex-center">
                              {campaignHealth.trends.clickRate.trend === 'up' ? 
                                <TrendingUp className="w-5 h-5 admin-text-green-500" /> :
                                campaignHealth.trends.clickRate.trend === 'down' ? 
                                <TrendingDown className="w-5 h-5 admin-text-red-500" /> :
                                <div className="w-5 h-5 admin-text-gray-400">→</div>
                              }
                            </div>
                          </div>

                          {/* Taxa de Bounce */}
                          <div className="admin-flex admin-flex-between admin-p-3 admin-bg-gray-50 admin-rounded-lg">
                            <div>
                              <div className="admin-font-medium">Taxa de Bounce</div>
                              <div className="admin-text-sm admin-text-gray-600">
                                {campaignHealth.trends.bounceRate.current.toFixed(1)}% 
                                <span className="admin-text-gray-400 admin-ml-2">
                                  (anterior: {campaignHealth.trends.bounceRate.previous.toFixed(1)}%)
                                </span>
                              </div>
                            </div>
                            <div className="admin-flex admin-flex-center">
                              {campaignHealth.trends.bounceRate.trend === 'down' ? 
                                <TrendingUp className="w-5 h-5 admin-text-green-500" /> :
                                campaignHealth.trends.bounceRate.trend === 'up' ? 
                                <TrendingDown className="w-5 h-5 admin-text-red-500" /> :
                                <div className="w-5 h-5 admin-text-gray-400">→</div>
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Problemas e Recomendações */}
                  <div className="admin-grid admin-grid-2">
                    {/* Problemas Identificados */}
                    {campaignHealth.issues.length > 0 && (
                      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200-header">
                          <h3 className="bg-white rounded-xl shadow-lg border border-gray-200-title admin-text-red-600">
                            <AlertCircle className="w-5 h-5" />
                            Problemas Identificados
                          </h3>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200-content">
                          <div className="admin-grid admin-grid-1" style={{gap: '8px'}}>
                            {campaignHealth.issues.map((issue, index) => (
                              <div key={index} className="admin-flex admin-p-3 admin-bg-red-50 admin-rounded-lg admin-border" style={{borderColor: '#fecaca'}}>
                                <span className="w-2 h-2 admin-bg-red-600 admin-rounded-full admin-mt-2 admin-mr-3 admin-flex-shrink-0" />
                                <span className="admin-text-sm admin-text-red-700">{issue}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Recomendações */}
                    {campaignHealth.recommendations.length > 0 && (
                      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200-header">
                          <h3 className="bg-white rounded-xl shadow-lg border border-gray-200-title admin-text-blue-600">
                            <Target className="w-5 h-5" />
                            Recomendações
                          </h3>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200-content">
                          <div className="admin-grid admin-grid-1" style={{gap: '8px'}}>
                            {campaignHealth.recommendations.map((rec, index) => (
                              <div key={index} className="admin-flex admin-p-3 admin-bg-blue-50 admin-rounded-lg admin-border" style={{borderColor: '#bfdbfe'}}>
                                <span className="w-2 h-2 admin-bg-blue-600 admin-rounded-full admin-mt-2 admin-mr-3 admin-flex-shrink-0" />
                                <span className="admin-text-sm admin-text-blue-700">{rec}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Resumo Executivo */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200-header">
                      <h3 className="bg-white rounded-xl shadow-lg border border-gray-200-title">📋 Resumo Executivo</h3>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200-content">
                      <div className="admin-grid admin-grid-3">
                        <div className="admin-text-center admin-p-4 admin-bg-gray-50 admin-rounded-lg">
                          <div className="admin-text-2xl admin-font-bold" style={{color: '#10b981'}}>
                            {((campaignHealth.trends.openRate.current / campaignHealth.trends.openRate.previous - 1) * 100).toFixed(1)}%
                          </div>
                          <div className="admin-text-sm admin-text-gray-600">Variação Abertura</div>
                        </div>
                        <div className="admin-text-center admin-p-4 admin-bg-gray-50 admin-rounded-lg">
                          <div className="admin-text-2xl admin-font-bold" style={{color: '#3b82f6'}}>
                            {((campaignHealth.trends.clickRate.current / campaignHealth.trends.clickRate.previous - 1) * 100).toFixed(1)}%
                          </div>
                          <div className="admin-text-sm admin-text-gray-600">Variação Clique</div>
                        </div>
                        <div className="admin-text-center admin-p-4 admin-bg-gray-50 admin-rounded-lg">
                          <div className="admin-text-2xl admin-font-bold" style={{color: '#8b5cf6'}}>
                            {campaignHealth.score >= 75 ? 'Ótima' : campaignHealth.score >= 50 ? 'Boa' : 'Ruim'}
                          </div>
                          <div className="admin-text-sm admin-text-gray-600">Classificação Geral</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200-content admin-text-center" style={{padding: '48px 24px'}}>
                    <Shield className="w-12 h-12 admin-text-gray-400" style={{margin: '0 auto 16px'}} />
                    <h3 className="admin-text-lg admin-font-semibold admin-text-gray-600 admin-mb-2">Selecione uma Campanha</h3>
                    <p className="admin-text-gray-500">Escolha uma campanha na aba "Campanhas" para ver análise de saúde detalhada</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="admin-tab-content">
              <div className="admin-grid admin-grid-1">
                
                {/* Header da seção */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200-header">
                    <div className="admin-flex admin-flex-between">
                      <div>
                        <h3 className="bg-white rounded-xl shadow-lg border border-gray-200-title">📧 Templates de Email</h3>
                        <p className="bg-white rounded-xl shadow-lg border border-gray-200-description">Gerencie seus templates de email marketing</p>
                      </div>
                      <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200-sm">
                        <Plus className="w-4 h-4" />
                        Novo Template
                      </button>
                    </div>
                  </div>
                </div>

                {/* Grid de Templates */}
                <div className="admin-grid admin-grid-2">
                  {templates.length > 0 ? templates.map((template, index) => (
                    <div key={template.id || index} className="bg-white rounded-xl shadow-lg border border-gray-200">
                      <div className="bg-white rounded-xl shadow-lg border border-gray-200-header">
                        <div className="admin-flex admin-flex-between">
                          <div>
                            <h4 className="bg-white rounded-xl shadow-lg border border-gray-200-title admin-text-lg">{template.name}</h4>
                            <p className="bg-white rounded-xl shadow-lg border border-gray-200-description">{template.description}</p>
                          </div>
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full inline-flex items-center px-3 py-1 text-xs font-medium rounded-full-${template.type === 'promotional' ? 'info' : template.type === 'newsletter' ? 'success' : 'warning'}`}>
                            {template.type}
                          </span>
                        </div>
                      </div>
                      <div className="bg-white rounded-xl shadow-lg border border-gray-200-content">
                        <div className="admin-mb-4">
                          <div className="admin-text-sm admin-text-gray-600 admin-mb-2">
                            <strong>Assunto:</strong> {template.subject}
                          </div>
                          <div className="admin-text-xs admin-text-gray-500" 
                               style={{height: '60px', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                            {template.html ? template.html.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : 'Sem conteúdo'}
                          </div>
                        </div>
                        
                        <div className="admin-flex admin-gap-2">
                          <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200-outline inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200-sm admin-flex-1">
                            <Eye className="w-4 h-4" />
                            Visualizar
                          </button>
                          <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200-sm admin-flex-1">
                            <Send className="w-4 h-4" />
                            Usar Template
                          </button>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200" style={{gridColumn: 'span 2'}}>
                      <div className="bg-white rounded-xl shadow-lg border border-gray-200-content admin-text-center" style={{padding: '48px 24px'}}>
                        <FileText className="w-12 h-12 admin-text-gray-400" style={{margin: '0 auto 16px'}} />
                        <h3 className="admin-text-lg admin-font-semibold admin-text-gray-600 admin-mb-2">Nenhum Template Encontrado</h3>
                        <p className="admin-text-gray-500 admin-mb-4">Crie seu primeiro template de email marketing</p>
                        <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200-primary">
                          <Plus className="w-4 h-4" />
                          Criar Primeiro Template
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Estatísticas dos Templates */}
                {templates.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200-header">
                      <h3 className="bg-white rounded-xl shadow-lg border border-gray-200-title">📊 Estatísticas dos Templates</h3>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200-content">
                      <div className="admin-grid admin-grid-3">
                        <div className="admin-text-center admin-p-4 admin-bg-gray-50 admin-rounded-lg">
                          <div className="admin-text-2xl admin-font-bold" style={{color: '#3b82f6'}}>{templates.length}</div>
                          <div className="admin-text-sm admin-text-gray-600">Total Templates</div>
                        </div>
                        <div className="admin-text-center admin-p-4 admin-bg-gray-50 admin-rounded-lg">
                          <div className="admin-text-2xl admin-font-bold" style={{color: '#10b981'}}>
                            {templates.filter(t => t.type === 'promotional').length}
                          </div>
                          <div className="admin-text-sm admin-text-gray-600">Promocionais</div>
                        </div>
                        <div className="admin-text-center admin-p-4 admin-bg-gray-50 admin-rounded-lg">
                          <div className="admin-text-2xl admin-font-bold" style={{color: '#8b5cf6'}}>
                            {templates.filter(t => t.type === 'newsletter').length}
                          </div>
                          <div className="admin-text-sm admin-text-gray-600">Newsletters</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="admin-tab-content">
              <div className="admin-grid admin-grid-1">
                
                {/* Header da seção */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200-header">
                    <div className="admin-flex admin-flex-between">
                      <div>
                        <h3 className="bg-white rounded-xl shadow-lg border border-gray-200-title">👥 Gestão de Contatos</h3>
                        <p className="bg-white rounded-xl shadow-lg border border-gray-200-description">Gerencie sua base de contatos para email marketing</p>
                      </div>
                      <div className="admin-flex admin-gap-2">
                        <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200-outline inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200-sm">
                          <FileText className="w-4 h-4" />
                          Importar CSV
                        </button>
                        <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200-sm">
                          <Plus className="w-4 h-4" />
                          Novo Contato
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estatísticas dos Contatos */}
                <div className="admin-grid admin-grid-4">
                  <div className="glass-card rounded-xl p-6 text-center shadow-lg shadow-gray-200/50">
                    <div className="admin-stats-header">
                      <span className="admin-stats-title">Total Contatos</span>
                      <Users className="admin-stats-icon" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-2">{contactStats?.total?.toLocaleString() || '0'}</div>
                    <div className="text-sm font-medium text-slate-600">Contatos cadastrados</div>
                  </div>
                  
                  <div className="glass-card rounded-xl p-6 text-center shadow-lg shadow-gray-200/50">
                    <div className="admin-stats-header">
                      <span className="admin-stats-title">Ativos</span>
                      <CheckCircle className="admin-stats-icon" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-2" style={{color: '#10b981'}}>
                      {contactStats?.byStatus?.ativo || 0}
                    </div>
                    <div className="text-sm font-medium text-slate-600">Recebem emails</div>
                  </div>
                  
                  <div className="glass-card rounded-xl p-6 text-center shadow-lg shadow-gray-200/50">
                    <div className="admin-stats-header">
                      <span className="admin-stats-title">Inativos</span>
                      <AlertCircle className="admin-stats-icon" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-2" style={{color: '#f59e0b'}}>
                      {contactStats?.byStatus?.inativo || 0}
                    </div>
                    <div className="text-sm font-medium text-slate-600">Não recebem</div>
                  </div>
                  
                  <div className="glass-card rounded-xl p-6 text-center shadow-lg shadow-gray-200/50">
                    <div className="admin-stats-header">
                      <span className="admin-stats-title">Segmentos</span>
                      <Target className="admin-stats-icon" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-2" style={{color: '#8b5cf6'}}>
                      {Object.keys(contactStats?.bySegment || {}).length}
                    </div>
                    <div className="text-sm font-medium text-slate-600">Diferentes segmentos</div>
                  </div>
                </div>

                {/* Lista de Contatos */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200-header">
                    <div className="admin-flex admin-flex-between">
                      <h3 className="bg-white rounded-xl shadow-lg border border-gray-200-title">📋 Lista de Contatos</h3>
                      <div className="admin-flex admin-gap-2">
                        <input 
                          type="text" 
                          placeholder="Buscar contatos..." 
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                          style={{width: '200px'}}
                        />
                        <select className="admin-select" style={{width: '150px'}}>
                          <option value="">Todos segmentos</option>
                          {Object.keys(contactStats?.bySegment || {}).map(segment => (
                            <option key={segment} value={segment}>{segment}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200-content">
                    {contacts.length > 0 ? (
                      <div className="admin-table-container">
                        <table className="admin-table">
                          <thead className="admin-table-header">
                            <tr>
                              <th>Nome</th>
                              <th>Email</th>
                              <th>Segmento</th>
                              <th>Status</th>
                              <th>Data Cadastro</th>
                              <th>Ações</th>
                            </tr>
                          </thead>
                          <tbody className="admin-table-body">
                            {contacts.slice(0, 10).map((contact, index) => (
                              <tr key={contact.id || index}>
                                <td>{contact.nome || contact.name || 'Sem nome'}</td>
                                <td>{contact.email}</td>
                                <td>
                                  <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full inline-flex items-center px-3 py-1 text-xs font-medium rounded-full-info">
                                    {contact.segmento || contact.segment || 'Geral'}
                                  </span>
                                </td>
                                <td>
                                  <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${contact.status === 'ativo' ? 'inline-flex items-center px-3 py-1 text-xs font-medium rounded-full-success' : 'inline-flex items-center px-3 py-1 text-xs font-medium rounded-full-warning'}`}>
                                    {contact.status || 'ativo'}
                                  </span>
                                </td>
                                <td className="admin-text-xs">
                                  {contact.created_at ? new Date(contact.created_at).toLocaleDateString() : 'N/A'}
                                </td>
                                <td>
                                  <div className="admin-flex admin-gap-1">
                                    <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200-outline inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200-sm" style={{padding: '4px 8px'}}>
                                      <Eye className="w-3 h-3" />
                                    </button>
                                    <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200-sm" style={{padding: '4px 8px'}}>
                                      <Mail className="w-3 h-3" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="admin-text-center" style={{padding: '48px 24px'}}>
                        <Users className="w-12 h-12 admin-text-gray-400" style={{margin: '0 auto 16px'}} />
                        <h3 className="admin-text-lg admin-font-semibold admin-text-gray-600 admin-mb-2">Nenhum Contato Encontrado</h3>
                        <p className="admin-text-gray-500 admin-mb-4">Importe contatos ou adicione manualmente</p>
                        <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200-primary">
                          <Plus className="w-4 h-4" />
                          Adicionar Primeiro Contato
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Segmentação */}
                {Object.keys(contactStats?.bySegment || {}).length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200-header">
                      <h3 className="bg-white rounded-xl shadow-lg border border-gray-200-title">🎯 Segmentação de Contatos</h3>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200-content">
                      <div className="admin-grid admin-grid-3">
                        {Object.entries(contactStats?.bySegment || {}).map(([segment, count]) => (
                          <div key={segment} className="admin-text-center admin-p-4 admin-bg-gray-50 admin-rounded-lg">
                            <div className="admin-text-xl admin-font-bold" style={{color: '#6366f1'}}>{count}</div>
                            <div className="admin-text-sm admin-text-gray-600 admin-font-medium">{segment}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="admin-tab-content">
              <div className="admin-grid admin-grid-1">
                
                {/* Header da seção */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200-header">
                    <div className="admin-flex admin-flex-between">
                      <div>
                        <h3 className="bg-white rounded-xl shadow-lg border border-gray-200-title">📊 Analytics Avançados</h3>
                        <p className="bg-white rounded-xl shadow-lg border border-gray-200-description">Análise detalhada de performance das campanhas</p>
                      </div>
                      <div className="admin-flex admin-gap-2">
                        <select className="admin-select">
                          <option value="7">Últimos 7 dias</option>
                          <option value="30">Últimos 30 dias</option>
                          <option value="90">Últimos 90 dias</option>
                        </select>
                        <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200-outline inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200-sm">
                          <FileText className="w-4 h-4" />
                          Exportar Relatório
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Métricas Principais */}
                <div className="admin-grid admin-grid-4">
                  <div className="glass-card rounded-xl p-6 text-center shadow-lg shadow-gray-200/50">
                    <div className="admin-stats-header">
                      <span className="admin-stats-title">Taxa Média Abertura</span>
                      <Eye className="admin-stats-icon" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-2" style={{color: '#10b981'}}>
                      {analytics?.averageOpenRate ? `${analytics.averageOpenRate.toFixed(1)}%` : '24.3%'}
                    </div>
                    <div className="text-sm font-medium text-slate-600">+2.1% vs mês anterior</div>
                  </div>
                  
                  <div className="glass-card rounded-xl p-6 text-center shadow-lg shadow-gray-200/50">
                    <div className="admin-stats-header">
                      <span className="admin-stats-title">Taxa Média Clique</span>
                      <MousePointer className="admin-stats-icon" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-2" style={{color: '#3b82f6'}}>
                      {analytics?.averageClickRate ? `${analytics.averageClickRate.toFixed(1)}%` : '3.8%'}
                    </div>
                    <div className="text-sm font-medium text-slate-600">+0.5% vs mês anterior</div>
                  </div>
                  
                  <div className="glass-card rounded-xl p-6 text-center shadow-lg shadow-gray-200/50">
                    <div className="admin-stats-header">
                      <span className="admin-stats-title">Taxa Conversão</span>
                      <TrendingUp className="admin-stats-icon" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-2" style={{color: '#8b5cf6'}}>
                      {analytics?.conversionRate ? `${analytics.conversionRate.toFixed(1)}%` : '2.1%'}
                    </div>
                    <div className="text-sm font-medium text-slate-600">+0.3% vs mês anterior</div>
                  </div>
                  
                  <div className="glass-card rounded-xl p-6 text-center shadow-lg shadow-gray-200/50">
                    <div className="admin-stats-header">
                      <span className="admin-stats-title">ROI Médio</span>
                      <Zap className="admin-stats-icon" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-2" style={{color: '#f59e0b'}}>
                      {analytics?.averageROI ? `${analytics.averageROI.toFixed(0)}%` : '340%'}
                    </div>
                    <div className="text-sm font-medium text-slate-600">+15% vs mês anterior</div>
                  </div>
                </div>

                {/* Performance por Segmento */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200-header">
                    <h3 className="bg-white rounded-xl shadow-lg border border-gray-200-title">🎯 Performance por Segmento</h3>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200-content">
                    <div className="admin-table-container">
                      <table className="admin-table">
                        <thead className="admin-table-header">
                          <tr>
                            <th>Segmento</th>
                            <th>Campanhas</th>
                            <th>Taxa Abertura</th>
                            <th>Taxa Clique</th>
                            <th>Conversões</th>
                            <th>ROI</th>
                          </tr>
                        </thead>
                        <tbody className="admin-table-body">
                          <tr>
                            <td><span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full inline-flex items-center px-3 py-1 text-xs font-medium rounded-full-success">Premium</span></td>
                            <td>15</td>
                            <td><span style={{color: '#10b981', fontWeight: '600'}}>28.5%</span></td>
                            <td><span style={{color: '#3b82f6', fontWeight: '600'}}>4.2%</span></td>
                            <td>89</td>
                            <td><span style={{color: '#f59e0b', fontWeight: '600'}}>420%</span></td>
                          </tr>
                          <tr>
                            <td><span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full inline-flex items-center px-3 py-1 text-xs font-medium rounded-full-info">Regular</span></td>
                            <td>28</td>
                            <td><span style={{color: '#10b981', fontWeight: '600'}}>22.1%</span></td>
                            <td><span style={{color: '#3b82f6', fontWeight: '600'}}>3.4%</span></td>
                            <td>156</td>
                            <td><span style={{color: '#f59e0b', fontWeight: '600'}}>285%</span></td>
                          </tr>
                          <tr>
                            <td><span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full inline-flex items-center px-3 py-1 text-xs font-medium rounded-full-warning">Novos</span></td>
                            <td>22</td>
                            <td><span style={{color: '#10b981', fontWeight: '600'}}>19.8%</span></td>
                            <td><span style={{color: '#3b82f6', fontWeight: '600'}}>2.9%</span></td>
                            <td>67</td>
                            <td><span style={{color: '#f59e0b', fontWeight: '600'}}>210%</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Gráficos de Performance */}
                <div className="admin-grid admin-grid-2">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200-header">
                      <h3 className="bg-white rounded-xl shadow-lg border border-gray-200-title">📈 Evolução das Métricas</h3>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200-content">
                      <div className="admin-text-center" style={{padding: '40px 20px'}}>
                        <BarChart3 className="w-16 h-16 admin-text-gray-400" style={{margin: '0 auto 16px'}} />
                        <p className="admin-text-gray-500">Gráfico de evolução das métricas</p>
                        <p className="admin-text-xs admin-text-gray-400">Em desenvolvimento</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200-header">
                      <h3 className="bg-white rounded-xl shadow-lg border border-gray-200-title">⏰ Melhor Horário para Envio</h3>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200-content">
                      <div className="admin-grid admin-grid-1" style={{gap: '12px'}}>
                        <div className="admin-flex admin-flex-between admin-p-3 admin-bg-gray-50 admin-rounded-lg">
                          <span className="admin-font-medium">Terça-feira</span>
                          <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full inline-flex items-center px-3 py-1 text-xs font-medium rounded-full-success">Melhor dia</span>
                        </div>
                        <div className="admin-flex admin-flex-between admin-p-3 admin-bg-gray-50 admin-rounded-lg">
                          <span className="admin-font-medium">10:00 - 11:00</span>
                          <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full inline-flex items-center px-3 py-1 text-xs font-medium rounded-full-info">Melhor horário</span>
                        </div>
                        <div className="admin-flex admin-flex-between admin-p-3 admin-bg-gray-50 admin-rounded-lg">
                          <span className="admin-font-medium">Taxa de abertura</span>
                          <span className="admin-font-bold" style={{color: '#10b981'}}>31.2%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comparativo de Campanhas */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200-header">
                    <h3 className="bg-white rounded-xl shadow-lg border border-gray-200-title">🏆 Top 5 Campanhas do Mês</h3>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200-content">
                    <div className="admin-grid admin-grid-1" style={{gap: '12px'}}>
                      {[
                        { name: 'Black Friday 2024', openRate: 45.2, clickRate: 8.1, conversions: 234 },
                        { name: 'Newsletter Semanal #48', openRate: 32.7, clickRate: 5.4, conversions: 89 },
                        { name: 'Promoção Fim de Ano', openRate: 29.8, clickRate: 4.9, conversions: 156 },
                        { name: 'Reativação de Clientes', openRate: 26.3, clickRate: 4.2, conversions: 67 },
                        { name: 'Lançamento Produto X', openRate: 24.1, clickRate: 3.8, conversions: 45 }
                      ].map((campaign, index) => (
                        <div key={index} className="admin-flex admin-flex-between admin-p-4 admin-border admin-rounded-lg">
                          <div className="admin-flex admin-flex-col">
                            <span className="admin-font-semibold">{campaign.name}</span>
                            <span className="admin-text-xs admin-text-gray-500">{campaign.conversions} conversões</span>
                          </div>
                          <div className="admin-flex admin-gap-4">
                            <div className="admin-text-center">
                              <div className="admin-text-sm admin-font-bold" style={{color: '#10b981'}}>
                                {campaign.openRate}%
                              </div>
                              <div className="admin-text-xs admin-text-gray-500">Abertura</div>
                            </div>
                            <div className="admin-text-center">
                              <div className="admin-text-sm admin-font-bold" style={{color: '#3b82f6'}}>
                                {campaign.clickRate}%
                              </div>
                              <div className="admin-text-xs admin-text-gray-500">Clique</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}