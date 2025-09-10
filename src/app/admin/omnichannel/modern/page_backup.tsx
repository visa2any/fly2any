'use client';

import React, { useState, Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ConversationWithDetails } from '@/lib/omnichannel-api';
import { 
  BarChart3, 
  MessageSquare, 
  TrendingUp, 
  Settings, 
  Activity,
  Users,
  Clock,
  Star,
  Zap,
  CheckCircle2,
  ClipboardList,
  Mail,
  Globe,
  Link,
  Bot,
  Brain,
  History
} from 'lucide-react';

// Dynamic imports to prevent SSR issues 
const ModernOmnichannelDashboard = React.lazy(() => import('@/components/omnichannel/ModernOmnichannelDashboard'));
const ModernUnifiedChat = React.lazy(() => import('@/components/omnichannel/ModernUnifiedChat'));
const AIEnhancedCustomer360 = React.lazy(() => import('@/components/customer/AIEnhancedCustomer360'));
const Timeline360 = React.lazy(() => import('@/components/customers/Timeline360'));
const ConversationsList = React.lazy(() => import('@/components/omnichannel/ConversationsList'));

const LoadingComponent = () => (
  <div className="flex items-center justify-center p-8">
    <div className="relative">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      <div className="absolute inset-0 w-10 h-10 border-2 border-primary/40 rounded-full animate-pulse"></div>
    </div>
  </div>
);

export default function ModernOmnichannelPage() {
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithDetails | null>(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('1'); // Default customer for demo

  const handleConversationSelect = (conversation: ConversationWithDetails) => {
    setSelectedConversation(conversation);
    setActiveTab('chat');
  };

  return (
    <div className="w-full bg-background">
      {/* Modern Overview Cards */}
      <div className="container py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card hover:scale-[1.02]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Active Channels</p>
                  <p className="text-2xl font-bold tracking-tight">5</p>
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <TrendingUp className="h-3 w-3" />
                    <span>+12% vs last week</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card hover:scale-[1.02]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Avg Response</p>
                  <p className="text-2xl font-bold tracking-tight">1.8min</p>
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <TrendingUp className="h-3 w-3" />
                    <span>15% faster</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                  <Clock className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card hover:scale-[1.02]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Satisfaction</p>
                  <p className="text-2xl font-bold tracking-tight">4.9/5</p>
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <Star className="h-3 w-3 fill-current" />
                    <span>Excellent</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                  <Star className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card hover:scale-[1.02]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Automation</p>
                  <p className="text-2xl font-bold tracking-tight">90%</p>
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <Zap className="h-3 w-3" />
                    <span>AI-powered</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-lg bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
                  <Zap className="h-6 w-6 text-violet-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card hover:scale-[1.02]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Resolution Rate</p>
                  <p className="text-2xl font-bold tracking-tight">95%</p>
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Target: 90%</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modern Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 h-12 p-1 bg-muted rounded-lg border">
            <TabsTrigger 
              value="chat"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-200 font-medium"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Support</span>
              <span className="sm:hidden">Chat</span>
            </TabsTrigger>
            <TabsTrigger 
              value="analytics"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-200 font-medium"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger 
              value="settings"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-200 font-medium"
            >
              <Settings className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Settings</span>
              <span className="sm:hidden">Config</span>
            </TabsTrigger>
            <TabsTrigger 
              value="customer360"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-200 font-medium"
            >
              <Brain className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Customer 360</span>
              <span className="sm:hidden">C360</span>
            </TabsTrigger>
            <TabsTrigger 
              value="timeline"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-200 font-medium"
            >
              <History className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">X-ray Timeline</span>
              <span className="sm:hidden">Timeline</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-4 w-full">
            <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Conversations List */}
              <div className="lg:col-span-1 w-full">
                <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card h-full w-full">
                  <CardContent className="p-4">
                    <Suspense fallback={<LoadingComponent />}>
                      <ConversationsList 
                        onConversationSelect={handleConversationSelect}
                        selectedConversationId={selectedConversation?.id?.toString()}
                      />
                    </Suspense>
                    <div className="space-y-1 p-2">
                        <div 
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors border border-transparent hover:border-border/50"
                          onClick={() => setSelectedConversation({ id: 1, customer_name: 'João Silva', status: 'open' } as any)}
                        >
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                              JS
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm truncate">João Silva</h4>
                              <span className="text-xs text-muted-foreground">2m</span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">Preciso de ajuda com meu pedido...</p>
                          </div>
                        </div>
                        
                        <div 
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors border border-transparent hover:border-border/50"
                          onClick={() => setSelectedConversation({ id: 2, customer_name: 'Maria Santos', status: 'open' } as any)}
                        >
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                              MS
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-yellow-500 rounded-full border-2 border-background"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm truncate">Maria Santos</h4>
                              <span className="text-xs text-muted-foreground">5m</span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">Quando vai chegar minha encomenda?</p>
                          </div>
                        </div>
                        
                        <div 
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors border border-transparent hover:border-border/50"
                          onClick={() => setSelectedConversation({ id: 3, customer_name: 'Pedro Costa', status: 'pending' } as any)}
                        >
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                              PC
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-orange-500 rounded-full border-2 border-background"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm truncate">Pedro Costa</h4>
                              <span className="text-xs text-muted-foreground">12m</span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">Problema com o pagamento</p>
                          </div>
                        </div>
                        
                        <div 
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors border border-transparent hover:border-border/50"
                          onClick={() => setSelectedConversation({ id: 4, customer_name: 'Ana Lima', status: 'resolved' } as any)}
                        >
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                              AL
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gray-400 rounded-full border-2 border-background"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm truncate text-muted-foreground">Ana Lima</h4>
                              <span className="text-xs text-muted-foreground">1h</span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">Obrigada pelo atendimento!</p>
                          </div>
                        </div>
                        
                        <div 
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors border border-transparent hover:border-border/50"
                          onClick={() => setSelectedConversation({ id: 5, customer_name: 'Carlos Mendes', status: 'open' } as any)}
                        >
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                              CM
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm truncate">Carlos Mendes</h4>
                              <span className="text-xs text-muted-foreground">15m</span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">Gostaria de trocar o produto</p>
                          </div>
                        </div>
                      </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Chat Area - Full width */}
              <div className="lg:col-span-3 w-full">
                <div className="h-[calc(100vh-160px)] w-full">
                  {selectedConversation ? (
                    <Suspense fallback={<LoadingComponent />}>
                      <ModernUnifiedChat
                        conversationId={selectedConversation.id}
                        agentId={1}
                        onConversationUpdate={setSelectedConversation}
                      />
                    </Suspense>
                  ) : (
                    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card h-full w-full">
                      <CardContent className="h-full flex items-center justify-center p-8">
                        <div className="text-center space-y-6">
                          <div className="relative">
                            <div className="w-24 h-24 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-2xl shadow-lg shadow-primary/25 flex items-center justify-center mx-auto">
                              <MessageSquare className="h-12 w-12 text-primary-foreground" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <h3 className="text-2xl font-bold tracking-tight">
                              Selecione uma conversa para atendimento
                            </h3>
                            <p className="text-muted-foreground text-lg max-w-md mx-auto">
                              Escolha uma conversa da lista para começar o atendimento especializado
                            </p>
                          </div>
                          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span>Sistema online e pronto para atendimento</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-4 w-full">
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card hover:scale-[1.01]">
                <CardHeader className="border-b border-border/50 p-4">
                  <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                    </div>
                    <span>Métricas por Canal</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="group/item flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-50/50 rounded-xl border border-green-200/50 hover:border-green-300/50 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg shadow-green-500/25 flex items-center justify-center group-hover/item:scale-105 transition-transform">
                          <MessageSquare className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <span className="font-semibold text-foreground">WhatsApp</span>
                          <p className="text-sm text-muted-foreground">Canal principal</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">156</div>
                        <div className="text-sm text-muted-foreground">65% do total</div>
                      </div>
                    </div>
                    
                    <div className="group/item flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-50/50 rounded-xl border border-blue-200/50 hover:border-blue-300/50 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center group-hover/item:scale-105 transition-transform">
                          <Mail className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <span className="font-semibold text-foreground">Email</span>
                          <p className="text-sm text-muted-foreground">Suporte técnico</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">42</div>
                        <div className="text-sm text-muted-foreground">18% do total</div>
                      </div>
                    </div>
                    
                    <div className="group/item flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-50/50 rounded-xl border border-purple-200/50 hover:border-purple-300/50 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/25 flex items-center justify-center group-hover/item:scale-105 transition-transform">
                          <Globe className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <span className="font-semibold text-foreground">Chat Web</span>
                          <p className="text-sm text-muted-foreground">Site principal</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-600">28</div>
                        <div className="text-sm text-muted-foreground">12% do total</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card hover:scale-[1.01]">
                <CardHeader className="border-b border-border/50 p-4">
                  <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                      <Zap className="h-5 w-5 text-green-600" />
                    </div>
                    <span>Performance do Time</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="group/metric flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-50/30 rounded-xl border border-green-200/50 hover:border-green-300/50 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-sm flex items-center justify-center group-hover/metric:scale-105 transition-transform">
                          <Clock className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-semibold text-foreground">Tempo médio de resposta</span>
                      </div>
                      <span className="text-lg font-bold text-green-600">1.8 min</span>
                    </div>
                    <div className="group/metric flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-50/30 rounded-xl border border-blue-200/50 hover:border-blue-300/50 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm flex items-center justify-center group-hover/metric:scale-105 transition-transform">
                          <CheckCircle2 className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-semibold text-foreground">Taxa de resolução</span>
                      </div>
                      <span className="text-lg font-bold text-blue-600">95%</span>
                    </div>
                    <div className="group/metric flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-50/30 rounded-xl border border-purple-200/50 hover:border-purple-300/50 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-sm flex items-center justify-center group-hover/metric:scale-105 transition-transform">
                          <Star className="h-5 w-5 text-white fill-current" />
                        </div>
                        <span className="font-semibold text-foreground">Satisfação do cliente</span>
                      </div>
                      <span className="text-lg font-bold text-purple-600">4.9/5</span>
                    </div>
                    <div className="group/metric flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-50/30 rounded-xl border border-orange-200/50 hover:border-orange-300/50 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-sm flex items-center justify-center group-hover/metric:scale-105 transition-transform">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-semibold text-foreground">Conversas por agente</span>
                      </div>
                      <span className="text-lg font-bold text-orange-600">22/dia</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-4 w-full">
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card hover:scale-[1.01]">
                <CardHeader className="border-b border-border/50 p-4">
                  <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                      <Link className="h-5 w-5 text-blue-600" />
                    </div>
                    <span>Status dos Canais</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="group/status flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-50/30 rounded-xl border border-green-200/50 hover:border-green-300/50 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg shadow-green-500/25 flex items-center justify-center group-hover/status:scale-105 transition-transform">
                          <MessageSquare className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <span className="font-semibold text-foreground">WhatsApp</span>
                          <p className="text-sm text-green-600 font-medium">Conectado e funcionando</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
                        <span className="text-xs font-medium text-green-600">Online</span>
                      </div>
                    </div>
                    
                    <div className="group/status flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-50/30 rounded-xl border border-blue-200/50 hover:border-blue-300/50 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center group-hover/status:scale-105 transition-transform">
                          <Mail className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <span className="font-semibold text-foreground">Email</span>
                          <p className="text-sm text-blue-600 font-medium">Sincronizado</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-sm"></div>
                        <span className="text-xs font-medium text-blue-600">Ativo</span>
                      </div>
                    </div>
                    
                    <div className="group/status flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-50/30 rounded-xl border border-purple-200/50 hover:border-purple-300/50 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/25 flex items-center justify-center group-hover/status:scale-105 transition-transform">
                          <Globe className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <span className="font-semibold text-foreground">Chat Web</span>
                          <p className="text-sm text-purple-600 font-medium">Online</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse shadow-sm"></div>
                        <span className="text-xs font-medium text-purple-600">Conectado</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card hover:scale-[1.01]">
                <CardHeader className="border-b border-border/50 p-4">
                  <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                      <Bot className="h-5 w-5 text-purple-600" />
                    </div>
                    <span>Automações Ativas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="group/automation flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-50/30 rounded-xl border border-green-200/50 hover:border-green-300/50 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-sm flex items-center justify-center group-hover/automation:scale-105 transition-transform">
                          <MessageSquare className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <span className="font-semibold text-foreground">Resposta automática</span>
                          <p className="text-sm text-muted-foreground">Mensagens de boas-vindas</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                        <span className="text-xs font-medium text-green-600">Ativo</span>
                      </div>
                    </div>
                    <div className="group/automation flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-50/30 rounded-xl border border-blue-200/50 hover:border-blue-300/50 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm flex items-center justify-center group-hover/automation:scale-105 transition-transform">
                          <Activity className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <span className="font-semibold text-foreground">Distribuição automática</span>
                          <p className="text-sm text-muted-foreground">Roteamento inteligente</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div>
                        <span className="text-xs font-medium text-blue-600">Ativo</span>
                      </div>
                    </div>
                    <div className="group/automation flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-50/30 rounded-xl border border-orange-200/50 hover:border-orange-300/50 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-sm flex items-center justify-center group-hover/automation:scale-105 transition-transform">
                          <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <span className="font-semibold text-foreground">Escalation automática</span>
                          <p className="text-sm text-muted-foreground">Para casos urgentes</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full shadow-sm"></div>
                        <span className="text-xs font-medium text-orange-600">Ativo</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="customer360" className="mt-4 w-full">
            <Suspense fallback={<LoadingComponent />}>
              <AIEnhancedCustomer360 
                customerId={selectedCustomerId}
                onActionTaken={(action, data) => {
                  console.log('Customer 360 Action:', action, data);
                }}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="timeline" className="mt-4 w-full">
            <Suspense fallback={<LoadingComponent />}>
              <Timeline360 
                customerId={parseInt(selectedCustomerId)}
              />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}