'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Carregando sistema de email marketing...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📧 Email Marketing Unificado</h1>
            <p className="text-gray-600 mt-1">Dashboard completo com métricas em tempo real</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
            >
              <Activity className="w-4 h-4 mr-2" />
              Auto Refresh {autoRefresh ? 'ON' : 'OFF'}
            </Button>
            <Button variant="outline" size="sm" onClick={refreshData} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Campanha
            </Button>
          </div>
        </div>

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contatos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contactStats?.total.toLocaleString() || '0'}</div>
              <p className="text-xs text-muted-foreground">
                {contactStats?.byStatus?.ativo || 0} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Campanhas Ativas</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {campaigns.filter(c => c.status === 'sending').length}
              </div>
              <p className="text-xs text-muted-foreground">
                {campaigns.length} total
              </p>
            </CardContent>
          </Card>

          {realTimeMetrics && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Abertura</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getPerformanceColor(realTimeMetrics.openRate, 'open')}`}>
                    {realTimeMetrics.openRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {realTimeMetrics.opened} aberturas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Clique</CardTitle>
                  <MousePointer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getPerformanceColor(realTimeMetrics.clickRate, 'click')}`}>
                    {realTimeMetrics.clickRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {realTimeMetrics.clicked} cliques
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Conteúdo Principal */}
        <Tabs defaultValue="campaigns" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
            <TabsTrigger value="realtime">Tempo Real</TabsTrigger>
            <TabsTrigger value="health">Saúde</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="contacts">Contatos</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Tab Campanhas */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Lista de Campanhas */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Campanhas Recentes</CardTitle>
                  <CardDescription>Últimas campanhas de email marketing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {campaigns.map((campaign) => (
                      <div 
                        key={campaign.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${ 
                          selectedCampaign?.id === campaign.id 
                            ? 'border-blue-300 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => {
                          setSelectedCampaign(campaign);
                          loadCampaignMetrics(campaign.id);
                        }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-sm">{campaign.name}</h4>
                          <Badge className={getStatusColor(campaign.status)}>
                            {campaign.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{campaign.subject}</p>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{campaign.total_recipients} destinatários</span>
                          <span>{new Date(campaign.created_at).toLocaleDateString()}</span>
                        </div>
                        {campaign.total_sent > 0 && (
                          <div className="mt-2 text-xs text-gray-600">
                            📊 {campaign.total_sent} enviados • {campaign.total_opened} abertos • {campaign.total_clicked} cliques
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Detalhes da Campanha Selecionada */}
              {selectedCampaign && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{selectedCampaign.name}</CardTitle>
                    <CardDescription>Detalhes da campanha selecionada</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Status</label>
                        <div className="mt-1">
                          <Badge className={getStatusColor(selectedCampaign.status)}>
                            {selectedCampaign.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700">Assunto</label>
                        <p className="text-sm text-gray-600 mt-1">{selectedCampaign.subject}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="text-lg font-bold text-blue-600">{selectedCampaign.total_sent}</div>
                          <div className="text-xs text-blue-600">Enviados</div>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="text-lg font-bold text-green-600">{selectedCampaign.total_delivered}</div>
                          <div className="text-xs text-green-600">Entregues</div>
                        </div>
                      </div>
                      
                      {selectedCampaign.status === 'sending' && (
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Pause className="w-4 h-4 mr-2" />
                            Pausar
                          </Button>
                        </div>
                      )}
                      
                      {selectedCampaign.status === 'paused' && (
                        <div className="flex space-x-2">
                          <Button size="sm" className="flex-1">
                            <Play className="w-4 h-4 mr-2" />
                            Retomar
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Tab Tempo Real */}
          <TabsContent value="realtime" className="space-y-6">
            {realTimeMetrics && selectedCampaign ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Métricas em Tempo Real */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      📊 Métricas em Tempo Real
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        Atualizado há {Math.floor((Date.now() - new Date(realTimeMetrics.lastUpdate).getTime()) / 1000)}s
                      </Badge>
                    </CardTitle>
                    <CardDescription>Campanha: {selectedCampaign.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{realTimeMetrics.totalSent}</div>
                        <div className="text-sm text-blue-600">Total Enviados</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{realTimeMetrics.delivered}</div>
                        <div className="text-sm text-green-600">Entregues</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{realTimeMetrics.opened}</div>
                        <div className="text-sm text-purple-600">Abertos</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{realTimeMetrics.clicked}</div>
                        <div className="text-sm text-orange-600">Cliques</div>
                      </div>
                    </div>
                    
                    <div className="mt-6 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Taxa de Abertura</span>
                        <span className={`font-bold ${getPerformanceColor(realTimeMetrics.openRate, 'open')}`}>
                          {realTimeMetrics.openRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Taxa de Clique</span>
                        <span className={`font-bold ${getPerformanceColor(realTimeMetrics.clickRate, 'click')}`}>
                          {realTimeMetrics.clickRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Taxa de Rejeição</span>
                        <span className={`font-bold ${getPerformanceColor(realTimeMetrics.bounceRate, 'bounce')}`}>
                          {realTimeMetrics.bounceRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Status da Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle>🎯 Status da Performance</CardTitle>
                    <CardDescription>Análise automática da campanha</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className={`p-4 rounded-lg border-l-4 ${
                        realTimeMetrics.summary.status === 'excellent' ? 'border-l-green-500 bg-green-50' :
                        realTimeMetrics.summary.status === 'good' ? 'border-l-blue-500 bg-blue-50' :
                        'border-l-yellow-500 bg-yellow-50'
                      }`}>
                        <div className="font-semibold">
                          {realTimeMetrics.summary.status === 'excellent' ? '🎉 Excelente Performance' :
                           realTimeMetrics.summary.status === 'good' ? '👍 Boa Performance' :
                           '⚠️ Performance Problemática'}
                        </div>
                        <div className="text-sm mt-1">
                          Taxa de sucesso: {realTimeMetrics.summary.successRate}% • 
                          Engajamento: {realTimeMetrics.summary.engagementRate}%
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Emails Processados:</span>
                          <span className="font-medium">{realTimeMetrics.summary.totalEmails}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taxa de Entrega:</span>
                          <span className="font-medium">{realTimeMetrics.summary.successRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Engajamento Total:</span>
                          <span className="font-medium">{realTimeMetrics.summary.engagementRate}%</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                        💡 <strong>Dica:</strong> 
                        {realTimeMetrics.openRate < 15 ? ' Considere melhorar o assunto do email.' :
                         realTimeMetrics.clickRate < 2 ? ' Tente adicionar call-to-actions mais atraentes.' :
                         ' Continue com essa estratégia, está funcionando bem!'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Selecione uma Campanha</h3>
                  <p className="text-gray-500">Escolha uma campanha na aba "Campanhas" para ver métricas em tempo real</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab Saúde da Campanha */}
          <TabsContent value="health" className="space-y-6">
            {campaignHealth && selectedCampaign ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Score de Saúde */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        {campaignHealth.status === 'healthy' ? <Heart className="w-5 h-5 text-green-500 mr-2" /> :
                         campaignHealth.status === 'warning' ? <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" /> :
                         <AlertCircle className="w-5 h-5 text-red-500 mr-2" />}
                        Saúde da Campanha
                      </span>
                      <Badge variant={campaignHealth.status === 'healthy' ? 'default' : 
                                    campaignHealth.status === 'warning' ? 'secondary' : 'destructive'}>
                        {campaignHealth.status.toUpperCase()}
                      </Badge>
                    </CardTitle>
                    <CardDescription>Score de saúde e diagnósticos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Score Visual */}
                      <div className="text-center">
                        <div className={`text-4xl font-bold ${
                          campaignHealth.score >= 75 ? 'text-green-600' :
                          campaignHealth.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {campaignHealth.score}/100
                        </div>
                        <div className="text-sm text-gray-500 mt-1">Score de Saúde</div>
                      </div>
                      
                      {/* Barra de Progress */}
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-300 ${
                            campaignHealth.score >= 75 ? 'bg-green-500' :
                            campaignHealth.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${campaignHealth.score}%` }}
                        />
                      </div>
                      
                      {/* Issues */}
                      {campaignHealth.issues.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-red-600 mb-2 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Problemas Identificados
                          </h4>
                          <ul className="space-y-1">
                            {campaignHealth.issues.map((issue, index) => (
                              <li key={index} className="text-sm text-red-600 flex items-start">
                                <span className="w-1 h-1 bg-red-600 rounded-full mt-2 mr-2 flex-shrink-0" />
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Recommendations */}
                      {campaignHealth.recommendations.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-blue-600 mb-2 flex items-center">
                            <Target className="w-4 h-4 mr-2" />
                            Recomendações
                          </h4>
                          <ul className="space-y-1">
                            {campaignHealth.recommendations.map((rec, index) => (
                              <li key={index} className="text-sm text-blue-600 flex items-start">
                                <span className="w-1 h-1 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Tendências */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Tendências de Performance
                    </CardTitle>
                    <CardDescription>Comparação com campanha anterior</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Taxa de Abertura */}
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">Taxa de Abertura</div>
                          <div className="text-sm text-gray-600">
                            {campaignHealth.trends.openRate.current.toFixed(1)}% 
                            <span className="text-gray-400 ml-2">
                              (anterior: {campaignHealth.trends.openRate.previous.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {campaignHealth.trends.openRate.trend === 'up' ? 
                            <TrendingUp className="w-5 h-5 text-green-500" /> :
                            campaignHealth.trends.openRate.trend === 'down' ? 
                            <TrendingDown className="w-5 h-5 text-red-500" /> :
                            <div className="w-5 h-5 text-gray-400">→</div>
                          }
                        </div>
                      </div>

                      {/* Taxa de Clique */}
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">Taxa de Clique</div>
                          <div className="text-sm text-gray-600">
                            {campaignHealth.trends.clickRate.current.toFixed(1)}% 
                            <span className="text-gray-400 ml-2">
                              (anterior: {campaignHealth.trends.clickRate.previous.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {campaignHealth.trends.clickRate.trend === 'up' ? 
                            <TrendingUp className="w-5 h-5 text-green-500" /> :
                            campaignHealth.trends.clickRate.trend === 'down' ? 
                            <TrendingDown className="w-5 h-5 text-red-500" /> :
                            <div className="w-5 h-5 text-gray-400">→</div>
                          }
                        </div>
                      </div>

                      {/* Taxa de Bounce */}
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">Taxa de Bounce</div>
                          <div className="text-sm text-gray-600">
                            {campaignHealth.trends.bounceRate.current.toFixed(1)}% 
                            <span className="text-gray-400 ml-2">
                              (anterior: {campaignHealth.trends.bounceRate.previous.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {campaignHealth.trends.bounceRate.trend === 'down' ? 
                            <TrendingUp className="w-5 h-5 text-green-500" /> :
                            campaignHealth.trends.bounceRate.trend === 'up' ? 
                            <TrendingDown className="w-5 h-5 text-red-500" /> :
                            <div className="w-5 h-5 text-gray-400">→</div>
                          }
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Selecione uma Campanha</h3>
                  <p className="text-gray-500">Escolha uma campanha para ver análise de saúde e diagnósticos</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Outras Tabs - Placeholder por enquanto */}
          <TabsContent value="templates">
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Templates</h3>
                <p className="text-gray-500">Funcionalidade em desenvolvimento</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts">
            <Card>
              <CardContent className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Gestão de Contatos</h3>
                <p className="text-gray-500">Funcionalidade em desenvolvimento</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardContent className="text-center py-12">
                <TrendingUp className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Analytics Avançados</h3>
                <p className="text-gray-500">Funcionalidade em desenvolvimento</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}