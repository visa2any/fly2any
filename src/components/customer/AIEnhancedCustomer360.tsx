'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, DollarSign, MessageSquare, Phone, Mail, Users, TrendingUp, AlertTriangle, CheckCircle, Target, Zap, Heart, Brain, Star } from 'lucide-react';
import { aiConversationService, CustomerHealthScore } from '@/lib/services/ai-conversation-service';
import { leadScoringService, LeadScore } from '@/lib/services/lead-scoring-service';

interface Customer360Data {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  totalInteractions: number;
  totalBookings: number;
  totalSpent: number;
  firstContact: string;
  lastContact: string;
  conversationCount: number;
  averageResponseTime: number;
  customerSatisfaction: number;
  preferredChannels: string[];
  timeline: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: Date;
    channel?: string;
    agent?: string;
    value?: number;
    metadata?: any;
  }>;
}

interface AIEnhancedCustomer360Props {
  customerId: string;
  onActionTaken?: (action: string, data: any) => void;
}

export default function AIEnhancedCustomer360({ customerId, onActionTaken }: AIEnhancedCustomer360Props) {
  const [customer, setCustomer] = useState<Customer360Data | null>(null);
  const [healthScore, setHealthScore] = useState<CustomerHealthScore | null>(null);
  const [leadScore, setLeadScore] = useState<LeadScore | null>(null);
  const [aiInsights, setAIInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  const loadCustomerData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load customer 360 data
      const response = await fetch(`/api/customers/${customerId}/360`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        
        if (response.status === 404) {
          setError(`Cliente ${customerId} não encontrado. ${errorData.error || ''}`);
          setLoading(false);
          return;
        } else {
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
      }
      
      const customerData = await response.json();
      
      if (customerData.success && customerData.data) {
        setCustomer(customerData.data);
        
        // Load AI insights in parallel with error isolation
        try {
          await Promise.allSettled([
            loadCustomerHealth(customerId),
            loadLeadScore(customerData.data),
            loadAIInsights(customerData.data)
          ]);
        } catch (insightError) {
          console.error('Error loading AI insights:', insightError);
        }
      }
    } catch (error) {
      console.error('Error loading customer data:', error);
      setError(`Erro ao carregar dados do cliente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    if (customerId) {
      loadCustomerData();
    }
  }, [customerId, loadCustomerData]);

  const loadCustomerHealth = async (customerId: string) => {
    try {
      const health = await aiConversationService.calculateCustomerHealth(customerId);
      setHealthScore(health);
    } catch (error) {
      console.error('Error loading customer health:', error);
    }
  };

  const loadLeadScore = async (customerData: Customer360Data) => {
    try {
      // Convert customer data to lead scoring format
      const leadInput = {
        email: customerData.email,
        phone: customerData.phone,
        name: customerData.name,
        isReturningCustomer: customerData.totalBookings > 0,
        previousBookings: customerData.totalBookings,
        averageSpend: customerData.totalSpent / Math.max(1, customerData.totalBookings),
        source: 'existing_customer',
        createdAt: customerData.firstContact
      };
      
      const score = await leadScoringService.calculateLeadScore(leadInput);
      setLeadScore(score);
    } catch (error) {
      console.error('Error loading lead score:', error);
    }
  };

  const loadAIInsights = async (customerData: Customer360Data) => {
    try {
      // Simulate AI analysis of customer behavior
      const insights = {
        personalityProfile: detectPersonalityProfile(customerData),
        communicationPreferences: analyzeCommunicationPreferences(customerData),
        behaviorPatterns: identifyBehaviorPatterns(customerData),
        predictiveInsights: generatePredictiveInsights(customerData)
      };
      
      setAIInsights(insights);
    } catch (error) {
      console.error('Error loading AI insights:', error);
    }
  };

  const detectPersonalityProfile = (customer: Customer360Data) => {
    // AI-powered personality detection based on interaction patterns
    const responseTime = customer.averageResponseTime;
    const interactionStyle = customer.preferredChannels[0];
    
    let personality = 'Balanced';
    let traits: string[] = [];
    
    if (responseTime < 30) {
      personality = 'Fast Decision Maker';
      traits = ['Quick responses', 'Action-oriented', 'Direct communication'];
    } else if (responseTime > 120) {
      personality = 'Thoughtful Planner';
      traits = ['Considers options carefully', 'Detailed research', 'Values information'];
    }
    
    if (interactionStyle === 'whatsapp') {
      traits.push('Prefers informal communication');
    } else if (interactionStyle === 'email') {
      traits.push('Prefers formal communication');
    }
    
    return { type: personality, traits, confidence: 0.78 };
  };

  const analyzeCommunicationPreferences = (customer: Customer360Data) => {
    return {
      preferredChannel: customer.preferredChannels[0] || 'email',
      bestContactTime: customer.averageResponseTime < 60 ? 'Business hours' : 'Evening',
      communicationStyle: customer.preferredChannels.includes('whatsapp') ? 'Casual' : 'Professional',
      responseExpectation: customer.averageResponseTime < 30 ? 'Immediate' : 'Within hours'
    };
  };

  const identifyBehaviorPatterns = (customer: Customer360Data) => {
    return {
      bookingFrequency: customer.totalBookings > 3 ? 'Frequent traveler' : 'Occasional traveler',
      spendingPattern: customer.totalSpent / Math.max(1, customer.totalBookings) > 5000 ? 'Premium buyer' : 'Value conscious',
      loyaltyIndicators: [
        customer.totalBookings > 2 ? 'Repeat customer' : null,
        customer.customerSatisfaction > 4.5 ? 'Highly satisfied' : null,
        customer.conversationCount > 10 ? 'Engaged customer' : null
      ].filter(Boolean),
      riskFactors: [
        customer.customerSatisfaction < 3 ? 'Low satisfaction' : null,
        customer.averageResponseTime > 240 ? 'Slow engagement' : null
      ].filter(Boolean)
    };
  };

  const generatePredictiveInsights = (customer: Customer360Data) => {
    const daysSinceLastContact = Math.floor((new Date().getTime() - new Date(customer.lastContact).getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      nextBookingProbability: customer.totalBookings > 0 ? Math.min(95, 60 + (customer.totalBookings * 10)) : 30,
      churnRisk: daysSinceLastContact > 90 ? 'High' : daysSinceLastContact > 30 ? 'Medium' : 'Low',
      upsellOpportunities: [
        customer.totalSpent / Math.max(1, customer.totalBookings) < 3000 ? 'Premium packages' : null,
        !customer.preferredChannels.includes('whatsapp') ? 'WhatsApp notifications' : null,
        customer.totalBookings > 2 ? 'Loyalty program' : null
      ].filter(Boolean),
      recommendedActions: generateRecommendedActions(customer, daysSinceLastContact)
    };
  };

  const generateRecommendedActions = (customer: Customer360Data, daysSinceLastContact: number) => {
    const actions = [];
    
    if (daysSinceLastContact > 60) {
      actions.push({ action: 'Re-engagement campaign', priority: 'high', reason: 'Long time since last contact' });
    }
    
    if (customer.customerSatisfaction < 4) {
      actions.push({ action: 'Satisfaction survey', priority: 'medium', reason: 'Below average satisfaction' });
    }
    
    if (customer.totalBookings > 2 && !customer.status.includes('VIP')) {
      actions.push({ action: 'VIP upgrade offer', priority: 'medium', reason: 'Loyal customer eligible for upgrade' });
    }
    
    return actions;
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <AlertTriangle className="w-5 h-5 text-red-600" />;
  };

  const executeAction = async (action: string, data?: any) => {
    try {
      // Execute the recommended action
      onActionTaken?.(action, { customerId, ...data });
      
      // Refresh data after action
      await loadCustomerData();
    } catch (error) {
      console.error('Error executing action:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg">Analisando dados do cliente...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="text-red-500 text-lg font-medium">{error}</div>
        <button
          onClick={() => loadCustomerData()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">Cliente não encontrado</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Customer Header with AI Insights */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${customer.name}`} />
                <AvatarFallback className="text-xl font-bold bg-blue-600 text-white">
                  {customer.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
                  <Badge variant={customer.status === 'vip' ? 'default' : 'secondary'} className="text-sm">
                    {customer.status.toUpperCase()}
                  </Badge>
                  {aiInsights?.personalityProfile && (
                    <Badge variant="outline" className="text-sm bg-purple-50 border-purple-200">
                      <Brain className="w-3 h-3 mr-1" />
                      {aiInsights.personalityProfile.type}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    {customer.email}
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {customer.phone}
                  </div>
                </div>
              </div>
            </div>
            
            {/* AI Health Score */}
            {healthScore && (
              <div className="text-right space-y-2">
                <div className="flex items-center justify-end space-x-2">
                  {getHealthScoreIcon(healthScore.score)}
                  <span className={`text-2xl font-bold ${getHealthScoreColor(healthScore.score)}`}>
                    {healthScore.score}%
                  </span>
                </div>
                <div className="text-sm text-gray-600">Customer Health Score</div>
                <Badge variant={healthScore.risk === 'low' ? 'default' : healthScore.risk === 'medium' ? 'secondary' : 'destructive'}>
                  {healthScore.risk === 'low' ? 'Low Risk' : healthScore.risk === 'medium' ? 'Medium Risk' : 'High Risk'}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics with AI Enhancement */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(customer.totalSpent)}</p>
                {leadScore && (
                  <p className="text-xs text-green-600 mt-1">
                    Potencial: {formatCurrency(leadScore.predictions.estimatedValue)}
                  </p>
                )}
              </div>
              <DollarSign className="w-8 h-8 text-green-600 bg-green-100 p-1.5 rounded-full" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reservas</p>
                <p className="text-2xl font-bold text-gray-900">{customer.totalBookings}</p>
                {aiInsights?.predictiveInsights && (
                  <p className="text-xs text-blue-600 mt-1">
                    Próxima: {aiInsights.predictiveInsights.nextBookingProbability}% chance
                  </p>
                )}
              </div>
              <Calendar className="w-8 h-8 text-blue-600 bg-blue-100 p-1.5 rounded-full" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Satisfação</p>
                <p className="text-2xl font-bold text-gray-900">{customer?.customerSatisfaction?.toFixed(1) || '0.0'}</p>
                <div className="flex mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`w-3 h-3 ${star <= customer.customerSatisfaction ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
              </div>
              <Heart className="w-8 h-8 text-pink-600 bg-pink-100 p-1.5 rounded-full" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Engajamento</p>
                <p className="text-2xl font-bold text-gray-900">{customer.totalInteractions}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Resp: {customer?.averageResponseTime?.toFixed(0) || '0'}min
                </p>
              </div>
              <MessageSquare className="w-8 h-8 text-purple-600 bg-purple-100 p-1.5 rounded-full" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Tabs with AI Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-gray-100 rounded-lg p-1">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="ai-insights" className="flex items-center space-x-2">
            <Brain className="w-4 h-4" />
            <span>IA Insights</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Timeline</span>
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Saúde</span>
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Ações</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Profile */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Perfil do Cliente</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Primeiro Contato</label>
                    <p className="text-sm text-gray-900">{formatDate(customer.firstContact)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Último Contato</label>
                    <p className="text-sm text-gray-900">{formatDate(customer.lastContact)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Conversas</label>
                    <p className="text-sm text-gray-900">{customer.conversationCount}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Canal Preferido</label>
                    <p className="text-sm text-gray-900 capitalize">{customer?.preferredChannels?.[0] || 'N/A'}</p>
                  </div>
                </div>
                
                {aiInsights?.communicationPreferences && (
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Preferências de Comunicação (IA)</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Estilo:</span> {aiInsights.communicationPreferences.communicationStyle}</p>
                      <p><span className="font-medium">Melhor horário:</span> {aiInsights.communicationPreferences.bestContactTime}</p>
                      <p><span className="font-medium">Expectativa:</span> {aiInsights.communicationPreferences.responseExpectation}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lead Score Card */}
            {leadScore && (
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Score de Conversão</span>
                    <Badge variant={leadScore.grade === 'A' ? 'default' : leadScore.grade === 'B' ? 'secondary' : 'outline'}>
                      Nota {leadScore.grade}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{leadScore.totalScore}</div>
                    <div className="text-sm text-gray-500">Pontuação Total</div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Qualidade Contato</span>
                      <span className="text-sm font-medium">{leadScore.breakdown.contactQuality}/25</span>
                    </div>
                    <Progress value={(leadScore.breakdown.contactQuality / 25) * 100} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Intenção de Viagem</span>
                      <span className="text-sm font-medium">{leadScore.breakdown.travelIntent}/25</span>
                    </div>
                    <Progress value={(leadScore.breakdown.travelIntent / 25) * 100} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Fit Orçamentário</span>
                      <span className="text-sm font-medium">{leadScore.breakdown.budgetFit}/20</span>
                    </div>
                    <Progress value={(leadScore.breakdown.budgetFit / 20) * 100} className="h-2" />
                  </div>
                  
                  <div className="pt-4 border-t space-y-2 text-sm">
                    <p><span className="font-medium">Conversão:</span> {(leadScore.predictions.conversionProbability * 100).toFixed(0)}%</p>
                    <p><span className="font-medium">Valor estimado:</span> {formatCurrency(leadScore.predictions.estimatedValue)}</p>
                    <p><span className="font-medium">Tempo esperado:</span> {leadScore.predictions.timeToConversion} dias</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="ai-insights" className="mt-6">
          {aiInsights && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personality Profile */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <span>Perfil de Personalidade (IA)</span>
                    <Badge variant="outline" className="text-xs">
                      {(aiInsights.personalityProfile.confidence * 100).toFixed(0)}% confiança
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-700">
                      {aiInsights.personalityProfile.type}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Características identificadas:</h4>
                    <div className="flex flex-wrap gap-2">
                      {aiInsights.personalityProfile.traits.map((trait: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Behavior Patterns */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span>Padrões de Comportamento</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium">Frequência de reservas:</span>
                      <p className="text-sm text-gray-600">{aiInsights.behaviorPatterns.bookingFrequency}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Padrão de gastos:</span>
                      <p className="text-sm text-gray-600">{aiInsights.behaviorPatterns.spendingPattern}</p>
                    </div>
                  </div>
                  
                  {aiInsights.behaviorPatterns.loyaltyIndicators.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-green-600 mb-2">Indicadores de fidelidade:</h4>
                      <div className="flex flex-wrap gap-2">
                        {aiInsights.behaviorPatterns.loyaltyIndicators.map((indicator: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs border-green-200 text-green-700">
                            {indicator}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {aiInsights.behaviorPatterns.riskFactors.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-red-600 mb-2">Fatores de risco:</h4>
                      <div className="flex flex-wrap gap-2">
                        {aiInsights.behaviorPatterns.riskFactors.map((risk: string, index: number) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            {risk}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Predictive Insights */}
              <Card className="border-0 shadow-md lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    <span>Insights Preditivos</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {aiInsights.predictiveInsights.nextBookingProbability}%
                      </div>
                      <div className="text-sm text-blue-700">Probabilidade próxima reserva</div>
                    </div>
                    
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {aiInsights.predictiveInsights.churnRisk}
                      </div>
                      <div className="text-sm text-orange-700">Risco de churn</div>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {aiInsights.predictiveInsights.upsellOpportunities.length}
                      </div>
                      <div className="text-sm text-green-700">Oportunidades de upsell</div>
                    </div>
                  </div>
                  
                  {aiInsights.predictiveInsights.upsellOpportunities.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Oportunidades identificadas:</h4>
                      <div className="flex flex-wrap gap-2">
                        {aiInsights.predictiveInsights.upsellOpportunities.map((opportunity: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs border-green-200 text-green-700">
                            {opportunity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Timeline de Interações</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {customer.timeline.map((event, index) => (
                  <div key={event.id} className="flex items-start space-x-4 p-3 border-l-2 border-gray-100 hover:bg-gray-50 rounded-r-lg">
                    <div className="flex-shrink-0 mt-1">
                      {event.type === 'message' && <MessageSquare className="w-4 h-4 text-blue-600" />}
                      {event.type === 'booking' && <Calendar className="w-4 h-4 text-green-600" />}
                      {event.type === 'payment' && <DollarSign className="w-4 h-4 text-green-600" />}
                      {event.type === 'note' && <Users className="w-4 h-4 text-gray-600" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{event.title}</p>
                        <span className="text-xs text-gray-500">
                          {formatDate(event.timestamp.toString())}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      
                      <div className="flex items-center space-x-4 mt-2">
                        {event.channel && (
                          <Badge variant="outline" className="text-xs">
                            {event.channel}
                          </Badge>
                        )}
                        {event.value && (
                          <span className="text-xs font-medium text-green-600">
                            {formatCurrency(event.value)}
                          </span>
                        )}
                        {event.agent && (
                          <span className="text-xs text-gray-500">
                            {event.agent}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="mt-6">
          {healthScore && (
            <div className="space-y-6">
              {/* Health Score Overview */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5" />
                      <span>Score de Saúde do Cliente</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getHealthScoreIcon(healthScore.score)}
                      <span className={`text-2xl font-bold ${getHealthScoreColor(healthScore.score)}`}>
                        {healthScore.score}%
                      </span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Score Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {Object.entries(healthScore.factors).map(([factor, score]) => (
                      <div key={factor} className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-900">{score}%</div>
                        <div className="text-xs text-gray-600 capitalize">
                          {factor.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <Progress value={score} className="h-1 mt-2" />
                      </div>
                    ))}
                  </div>
                  
                  {/* Recommendations */}
                  {healthScore.recommendations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-3">Recomendações de Melhoria</h4>
                      <div className="space-y-2">
                        {healthScore.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start space-x-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="actions" className="mt-6">
          <div className="space-y-6">
            {/* Recommended Actions */}
            {healthScore?.nextActions && healthScore.nextActions.length > 0 && (
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    <span>Ações Recomendadas (IA)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {healthScore.nextActions.map((action, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{action.action}</div>
                        <div className="text-sm text-gray-600 mt-1">{action.reason}</div>
                        <div className="text-xs text-gray-500 mt-1">Timeline: {action.timeline}</div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => executeAction(action.action, action)}
                        className="ml-4"
                      >
                        Executar
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            
            {/* Predictive Actions */}
            {aiInsights?.predictiveInsights?.recommendedActions && (
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <span>Ações Preditivas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {aiInsights.predictiveInsights.recommendedActions.map((action: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{action.action}</div>
                        <div className="text-sm text-gray-600 mt-1">{action.reason}</div>
                        <Badge 
                          variant={action.priority === 'high' ? 'destructive' : action.priority === 'medium' ? 'secondary' : 'outline'}
                          className="mt-2"
                        >
                          {action.priority === 'high' ? 'Alta Prioridade' : action.priority === 'medium' ? 'Média Prioridade' : 'Baixa Prioridade'}
                        </Badge>
                      </div>
                      <Button 
                        size="sm" 
                        variant={action.priority === 'high' ? 'default' : 'outline'}
                        onClick={() => executeAction(action.action, action)}
                        className="ml-4"
                      >
                        Executar
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}