'use client';
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import ModernOmnichannelDashboard from '@/components/omnichannel/ModernOmnichannelDashboard';
import ModernUnifiedChat from '@/components/omnichannel/ModernUnifiedChat';
import { ConversationWithDetails } from '@/lib/omnichannel-api';

export default function ModernOmnichannelPage() {
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithDetails | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleConversationSelect = (conversation: ConversationWithDetails) => {
    setSelectedConversation(conversation);
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Premium Header */}
      <div className="bg-white shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl">🌐</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Central Omnichannel Premium
                </h1>
                <p className="text-slate-600 mt-1">
                  Gerencie todas as conversas com design moderno e funcionalidades avançadas
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Online</span>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Versão Premium
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Overview Cards */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs font-medium">Canais Ativos</p>
                  <p className="text-2xl font-bold mt-1">5</p>
                </div>
                <div className="text-xl">🌐</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs font-medium">Resposta Média</p>
                  <p className="text-2xl font-bold mt-1">1.8min</p>
                </div>
                <div className="text-xl">⚡</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs font-medium">Satisfação</p>
                  <p className="text-2xl font-bold mt-1">4.9/5</p>
                </div>
                <div className="text-xl">⭐</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-xs font-medium">Automação</p>
                  <p className="text-2xl font-bold mt-1">90%</p>
                </div>
                <div className="text-xl">🤖</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-xs font-medium">Resolução</p>
                  <p className="text-2xl font-bold mt-1">95%</p>
                </div>
                <div className="text-xl">✅</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Premium Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm border border-slate-200">
            <TabsTrigger 
              value="dashboard" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
            >
              <span className="mr-2">📊</span>
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="chat"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
            >
              <span className="mr-2">💬</span>
              Atendimento
            </TabsTrigger>
            <TabsTrigger 
              value="analytics"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <span className="mr-2">📈</span>
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="settings"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white"
            >
              <span className="mr-2">⚙️</span>
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6 mt-6">
            <ModernOmnichannelDashboard />
          </TabsContent>

          <TabsContent value="chat" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Conversation List */}
              <div className="lg:col-span-1">
                <Card className="bg-white shadow-lg border-0 h-[700px]">
                  <CardHeader className="border-b border-slate-100">
                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <span className="text-blue-500">📋</span>
                      Conversas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-[600px] overflow-y-auto">
                      <ModernOmnichannelDashboard />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Chat Area */}
              <div className="lg:col-span-3">
                <div className="h-[700px]">
                  {selectedConversation ? (
                    <ModernUnifiedChat
                      conversationId={selectedConversation.id}
                      agentId={1}
                      onConversationUpdate={setSelectedConversation}
                    />
                  ) : (
                    <Card className="bg-white shadow-lg border-0 h-full">
                      <CardContent className="h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-white text-4xl">💬</span>
                          </div>
                          <h3 className="text-2xl font-bold text-slate-900 mb-3">
                            Selecione uma conversa
                          </h3>
                          <p className="text-slate-500 text-lg">
                            Escolha uma conversa da lista para começar o atendimento
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="text-blue-500">📊</span>
                    Métricas por Canal
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-lg">💬</span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900">WhatsApp</span>
                          <p className="text-sm text-slate-600">Canal principal</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">156</div>
                        <div className="text-sm text-slate-500">65% do total</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-lg">✉️</span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900">Email</span>
                          <p className="text-sm text-slate-600">Suporte técnico</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">42</div>
                        <div className="text-sm text-slate-500">18% do total</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-lg">🌐</span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900">Chat Web</span>
                          <p className="text-sm text-slate-600">Site principal</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-600">28</div>
                        <div className="text-sm text-slate-500">12% do total</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="text-green-500">⚡</span>
                    Performance do Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <span className="font-medium text-slate-900">Tempo médio de resposta</span>
                      <span className="text-lg font-bold text-green-600">1.8 min</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <span className="font-medium text-slate-900">Taxa de resolução</span>
                      <span className="text-lg font-bold text-blue-600">95%</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                      <span className="font-medium text-slate-900">Satisfação do cliente</span>
                      <span className="text-lg font-bold text-purple-600">4.9/5</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                      <span className="font-medium text-slate-900">Conversas por agente</span>
                      <span className="text-lg font-bold text-orange-600">22/dia</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="text-blue-500">🔗</span>
                    Status dos Canais
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white">💬</span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900">WhatsApp</span>
                          <p className="text-sm text-green-600">Conectado e funcionando</p>
                        </div>
                      </div>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white">✉️</span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900">Email</span>
                          <p className="text-sm text-blue-600">Sincronizado</p>
                        </div>
                      </div>
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white">🌐</span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900">Chat Web</span>
                          <p className="text-sm text-purple-600">Online</p>
                        </div>
                      </div>
                      <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="text-purple-500">🤖</span>
                    Automações Ativas
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <span className="font-medium text-slate-900">Resposta automática</span>
                        <p className="text-sm text-slate-600">Mensagens de boas-vindas</p>
                      </div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <span className="font-medium text-slate-900">Distribuição automática</span>
                        <p className="text-sm text-slate-600">Roteamento inteligente</p>
                      </div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                      <div>
                        <span className="font-medium text-slate-900">Escalation automática</span>
                        <p className="text-sm text-slate-600">Para casos urgentes</p>
                      </div>
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
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