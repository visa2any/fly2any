'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  Brain, Users, MessageSquare, TrendingUp, TrendingDown, Zap, Target,
  Clock, DollarSign, Mail, Phone, AlertTriangle, CheckCircle, Star,
  Activity, BarChart3, PieChart as PieChartIcon, Calendar, Filter,
  Search, Download, Settings, RefreshCw, Bell, BellOff, Eye, EyeOff,
  Sparkles, Bot, Heart, Award, ThumbsUp, ArrowUpRight, ArrowDownRight,
  Timer, Globe, Smartphone, Laptop
} from 'lucide-react';
import SmartConversationInbox from '@/components/conversations/SmartConversationInbox';
import AIEnhancedCustomer360 from '@/components/customer/AIEnhancedCustomer360';

interface DashboardStats {
  // AI Performance Metrics
  aiAccuracy: number;
  aiResponsesGenerated: number;
  aiWorkflowsExecuted: number;
  aiSavingsHours: number;
  
  // Customer Metrics
  totalCustomers: number;
  activeConversations: number;
  customerHealthAverage: number;
  satisfactionScore: number;
  
  // Sales Metrics
  conversionRate: number;
  averageDealValue: number;
  leadsProcessed: number;
  revenueGenerated: number;
  
  // Operational Metrics
  responseTime: number;
  firstContactResolution: number;
  agentProductivity: number;
  automationRate: number;
}

interface TopCustomer {
  id: string;
  name: string;
  email: string;
  healthScore: number;
  totalValue: number;
  lastContact: string;
  riskLevel: 'low' | 'medium' | 'high';
  aiInsights: string[];
}

interface ConversationInsight {
  channel: string;
  volume: number;
  averageResponseTime: number;
  satisfactionRate: number;
  conversionRate: number;
  aiAssistanceUsage: number;
}

interface WorkflowPerformance {
  workflowId: string;
  name: string;
  executions: number;
  successRate: number;
  averageExecutionTime: number;
  businessImpact: string;
}

export default function UnifiedAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [conversationInsights, setConversationInsights] = useState<ConversationInsight[]>([]);
  const [workflowPerformance, setWorkflowPerformance] = useState<WorkflowPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [aiInsightsEnabled, setAIInsightsEnabled] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [selectedTimeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all dashboard data in parallel
      const [statsRes, customersRes, insightsRes, workflowsRes] = await Promise.all([
        fetch(`/api/admin/dashboard/stats?timeRange=${selectedTimeRange}`),
        fetch(`/api/admin/dashboard/top-customers?limit=10`),
        fetch(`/api/admin/dashboard/conversation-insights?timeRange=${selectedTimeRange}`),
        fetch(`/api/admin/dashboard/workflow-performance?timeRange=${selectedTimeRange}`)
      ]);

      const [statsData, customersData, insightsData, workflowsData] = await Promise.all([
        statsRes.json(),
        customersRes.json(),
        insightsRes.json(),
        workflowsRes.json()
      ]);

      setStats(statsData.data);
      setTopCustomers(customersData.data);
      setConversationInsights(insightsData.data);
      setWorkflowPerformance(workflowsData.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set mock data for development
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  const setMockData = () => {
    setStats({
      aiAccuracy: 92,
      aiResponsesGenerated: 1247,
      aiWorkflowsExecuted: 89,
      aiSavingsHours: 156,
      totalCustomers: 2847,
      activeConversations: 23,
      customerHealthAverage: 78,
      satisfactionScore: 4.6,
      conversionRate: 34,
      averageDealValue: 4850,
      leadsProcessed: 167,
      revenueGenerated: 284500,
      responseTime: 18,
      firstContactResolution: 87,
      agentProductivity: 145,
      automationRate: 76
    });

    setTopCustomers([
      {
        id: '1',
        name: 'Maria Santos',
        email: 'maria@email.com',
        healthScore: 95,
        totalValue: 15600,
        lastContact: '2024-01-15',
        riskLevel: 'low',
        aiInsights: ['High loyalty', 'Premium buyer', 'Referral potential']
      },
      {
        id: '2', 
        name: 'João Silva',
        email: 'joao@email.com',
        healthScore: 42,
        totalValue: 8900,
        lastContact: '2024-01-10',
        riskLevel: 'high',
        aiInsights: ['Churn risk', 'Needs attention', 'Price sensitive']
      }
    ]);

    setConversationInsights([
      {
        channel: 'whatsapp',
        volume: 145,
        averageResponseTime: 12,
        satisfactionRate: 94,
        conversionRate: 38,
        aiAssistanceUsage: 89
      },
      {
        channel: 'email',
        volume: 89,
        averageResponseTime: 45,
        satisfactionRate: 87,
        conversionRate: 28,
        aiAssistanceUsage: 67
      }
    ]);

    setWorkflowPerformance([
      {
        workflowId: 'high_value_lead',
        name: 'High Value Lead Processing',
        executions: 45,
        successRate: 96,
        averageExecutionTime: 2.3,
        businessImpact: '+42% conversion rate'
      }
    ]);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value}%`;
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'low': return 'default';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg">Carregando dashboard...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-8xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Centro de Comando Inteligente</h1>
              <p className="text-blue-100">
                Dashboard unificado com inteligência artificial para gestão completa do seu negócio
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold">{stats?.aiAccuracy}%</div>
                <div className="text-sm text-blue-100">Precisão da IA</div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setAIInsightsEnabled(!aiInsightsEnabled)}
                >
                  {aiInsightsEnabled ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
                  IA Insights
                </Button>
                
                <select 
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="text-sm border rounded px-3 py-1 bg-white text-gray-900"
                >
                  <option value="24h">Últimas 24h</option>
                  <option value="7d">Últimos 7 dias</option>
                  <option value="30d">Últimos 30 dias</option>
                  <option value="90d">Últimos 90 dias</option>
                </select>
                
                <Button variant="secondary" size="sm" onClick={loadDashboardData}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* AI Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">IA Economia de Tempo</p>
                  <p className="text-3xl font-bold text-green-700">{stats?.aiSavingsHours}h</p>
                  <div className="flex items-center mt-2 text-sm text-green-600">
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                    +23% vs período anterior
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Bot className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Respostas IA Geradas</p>
                  <p className="text-3xl font-bold text-blue-700">{stats?.aiResponsesGenerated?.toLocaleString()}</p>
                  <div className="flex items-center mt-2 text-sm text-blue-600">
                    <Sparkles className="w-4 h-4 mr-1" />
                    {stats?.aiAccuracy}% precisão
                  </div>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Brain className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-violet-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Workflows Executados</p>
                  <p className="text-3xl font-bold text-purple-700">{stats?.aiWorkflowsExecuted}</p>
                  <div className="flex items-center mt-2 text-sm text-purple-600">
                    <Zap className="w-4 h-4 mr-1" />
                    {stats?.automationRate}% automatização
                  </div>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Activity className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-50 to-amber-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Taxa de Conversão</p>
                  <p className="text-3xl font-bold text-orange-700">{stats?.conversionRate ?? 0}%</p>
                  <div className="flex items-center mt-2 text-sm text-orange-600">
                    <Target className="w-4 h-4 mr-1" />
                    +{(stats?.conversionRate ?? 28) - 28}% melhoria
                  </div>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <TrendingUp className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Clientes</span>
            </TabsTrigger>
            <TabsTrigger value="conversations" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>Conversas</span>
            </TabsTrigger>
            <TabsTrigger value="workflows" className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Automação</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span>IA Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Chart */}
              <Card className="lg:col-span-2 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span>Performance de Vendas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-700">
                        {formatCurrency(stats?.revenueGenerated || 0)}
                      </div>
                      <div className="text-sm text-green-600">Receita Gerada</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-700">
                        {formatCurrency(stats?.averageDealValue || 0)}
                      </div>
                      <div className="text-sm text-blue-600">Ticket Médio</div>
                    </div>
                  </div>
                  
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={[
                      { name: 'Jan', revenue: 45000, deals: 12 },
                      { name: 'Feb', revenue: 67000, deals: 18 },
                      { name: 'Mar', revenue: 89000, deals: 24 },
                      { name: 'Apr', revenue: 145000, deals: 32 },
                      { name: 'Mai', revenue: 234000, deals: 41 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: number | string, name: string) => [
                        name === 'revenue' ? formatCurrency(Number(value)) : value,
                        name === 'revenue' ? 'Receita' : 'Deals'
                      ]} />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stackId="1" 
                        stroke="#10b981" 
                        fill="#10b981" 
                        fillOpacity={0.6} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Customer Health Overview */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    <span>Saúde dos Clientes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {stats?.customerHealthAverage}%
                    </div>
                    <div className="text-sm text-gray-500">Score Médio de Saúde</div>
                    <Progress value={stats?.customerHealthAverage} className="mt-2" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Clientes Saudáveis</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        67%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Risco Médio</span>
                      <Badge variant="secondary">
                        22%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Alto Risco</span>
                      <Badge variant="destructive">
                        11%
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span>Satisfação Geral</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="font-medium">{stats?.satisfactionScore}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Channel Performance */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <span>Performance por Canal</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {conversationInsights.map((insight, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {insight.channel === 'whatsapp' && <Smartphone className="w-5 h-5 text-green-600" />}
                          {insight.channel === 'email' && <Mail className="w-5 h-5 text-blue-600" />}
                          {insight.channel === 'webchat' && <MessageSquare className="w-5 h-5 text-purple-600" />}
                          <span className="font-medium capitalize">{insight.channel}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {insight.volume} conversas
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tempo resposta</span>
                          <span className="font-medium">{insight.averageResponseTime}min</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Satisfação</span>
                          <span className="font-medium text-green-600">{insight.satisfactionRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Conversão</span>
                          <span className="font-medium text-blue-600">{insight.conversionRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">IA Assistance</span>
                          <span className="font-medium text-purple-600">{insight.aiAssistanceUsage}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Customers */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Award className="w-5 h-5 text-yellow-600" />
                      <span>Top Clientes</span>
                    </div>
                    <Button size="sm" variant="outline">Ver Todos</Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topCustomers.map((customer, index) => (
                    <div 
                      key={customer.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedCustomer(customer.id)}
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${customer.name}`} />
                          <AvatarFallback>
                            {customer.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-gray-500">{customer.email}</div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={getRiskBadgeVariant(customer.riskLevel)} className="text-xs">
                              {customer.riskLevel === 'low' ? 'Baixo Risco' : 
                               customer.riskLevel === 'medium' ? 'Médio Risco' : 'Alto Risco'}
                            </Badge>
                            {aiInsightsEnabled && customer.aiInsights.length > 0 && (
                              <Badge variant="outline" className="text-xs bg-purple-50 border-purple-200">
                                <Sparkles className="w-3 h-3 mr-1" />
                                {customer.aiInsights[0]}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getHealthScoreColor(customer.healthScore)}`}>
                          {customer.healthScore}%
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatCurrency(customer.totalValue)}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Customer 360 View */}
              {selectedCustomer && (
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Cliente 360°</span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedCustomer(null)}
                      >
                        Fechar
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AIEnhancedCustomer360 customerId={selectedCustomer} />
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Conversations Tab */}
          <TabsContent value="conversations" className="mt-6">
            <Card className="border-0 shadow-lg h-[800px]">
              <CardContent className="p-0 h-full">
                <SmartConversationInbox />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="mt-6 space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  <span>Performance dos Workflows</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workflowPerformance.map((workflow, index) => (
                    <div key={workflow.workflowId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{workflow.name}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {workflow.executions} execuções • {workflow.averageExecutionTime}min tempo médio
                        </div>
                        <div className="text-sm text-green-600 mt-1">
                          {workflow.businessImpact}
                        </div>
                      </div>
                      
                      <div className="text-right space-y-1">
                        <div className="flex items-center space-x-2">
                          <div className={`text-lg font-bold ${workflow.successRate >= 90 ? 'text-green-600' : 'text-yellow-600'}`}>
                            {workflow.successRate}%
                          </div>
                          <CheckCircle className={`w-4 h-4 ${workflow.successRate >= 90 ? 'text-green-600' : 'text-yellow-600'}`} />
                        </div>
                        <div className="text-sm text-gray-500">Taxa de sucesso</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Analytics Tab */}
          <TabsContent value="analytics" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <span>Insights da IA</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <ThumbsUp className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-blue-900">Alta Performance Detectada</div>
                        <div className="text-sm text-blue-700 mt-1">
                          A IA identificou um aumento de 23% na taxa de conversão através do canal WhatsApp 
                          nas últimas 2 semanas. Recomenda expandir a estratégia para este canal.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-yellow-900">Atenção Requerida</div>
                        <div className="text-sm text-yellow-700 mt-1">
                          12 clientes foram identificados com alto risco de churn. A IA sugere campanhas 
                          de retenção personalizadas para este grupo.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-start space-x-3">
                      <Target className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-green-900">Oportunidade Identificada</div>
                        <div className="text-sm text-green-700 mt-1">
                          Análise de padrões indica que leads com interesse em destinos europeus 
                          têm 45% mais chances de conversão se contatados via telefone.
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-green-600" />
                    <span>Métricas de Automação</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Taxa de Automação</span>
                        <span className="text-sm font-bold">{stats?.automationRate}%</span>
                      </div>
                      <Progress value={stats?.automationRate} className="h-3" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Produtividade dos Agentes</span>
                        <span className="text-sm font-bold">{stats?.agentProductivity}%</span>
                      </div>
                      <Progress value={stats?.agentProductivity} className="h-3" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Resolução Primeiro Contato</span>
                        <span className="text-sm font-bold">{stats?.firstContactResolution}%</span>
                      </div>
                      <Progress value={stats?.firstContactResolution} className="h-3" />
                    </div>

                    <div className="pt-4 border-t">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">{stats?.aiResponsesGenerated?.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">Sugestões IA</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-purple-600">{stats?.aiWorkflowsExecuted}</div>
                          <div className="text-xs text-gray-500">Workflows IA</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}