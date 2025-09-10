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
      <div className="container py-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card hover:scale-[1.02]">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
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
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
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
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Satisfaction</p>
                  <p className="text-2xl font-bold tracking-tight">4.9/5</p>
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <Star className="h-3 w-3 fill-current" />
                    <span>Excellent rating</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card hover:scale-[1.02]">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Active Contacts</p>
                  <p className="text-2xl font-bold tracking-tight">247</p>
                  <div className="flex items-center gap-1 text-xs text-blue-600">
                    <Users className="h-3 w-3" />
                    <span>+23 this week</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-lg bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card hover:scale-[1.02]">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Automation</p>
                  <p className="text-2xl font-bold tracking-tight">87%</p>
                  <div className="flex items-center gap-1 text-xs text-purple-600">
                    <Zap className="h-3 w-3" />
                    <span>Smart responses</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                  <Bot className="h-6 w-6 text-purple-600" />
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
                <Suspense fallback={<LoadingComponent />}>
                  <ConversationsList 
                    onConversationSelect={handleConversationSelect}
                    selectedConversationId={selectedConversation?.id?.toString()}
                  />
                </Suspense>
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
            <Suspense fallback={<LoadingComponent />}>
              <ModernOmnichannelDashboard />
            </Suspense>
          </TabsContent>

          <TabsContent value="settings" className="mt-4 w-full">
            <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card">
              <CardHeader className="border-b border-border/50 p-6">
                <CardTitle className="text-2xl font-bold flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                    <Settings className="h-6 w-6 text-blue-600" />
                  </div>
                  <span>System Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="text-center py-12">
                  <Settings className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Settings Panel</h3>
                  <p className="text-muted-foreground">Advanced system configuration coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customer360" className="mt-4 w-full">
            <Suspense fallback={<LoadingComponent />}>
              <AIEnhancedCustomer360 
                customerId={selectedCustomerId}
                onActionTaken={(action, data) => console.log('Action taken:', action, data)}
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