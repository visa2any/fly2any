'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  MessageSquare, Send, Bot, Brain, Zap, Clock, Star, Phone, Mail, 
  MessageCircle, AlertCircle, TrendingUp, Target, RefreshCw, Sparkles,
  ThumbsUp, ThumbsDown, Copy, MoreHorizontal, Users, Tag, Calendar,
  Search, Filter, SortDesc, Volume2, Mic, MicOff, Settings
} from 'lucide-react';
import { ConversationWithDetails } from '@/lib/omnichannel-api';
import { aiConversationService, AIResponse, ConversationContext } from '@/lib/services/ai-conversation-service';

interface SmartConversationInboxProps {
  agentId?: number;
  onConversationSelect?: (conversation: ConversationWithDetails) => void;
}

interface ConversationMessage {
  id: string;
  content: string;
  direction: 'inbound' | 'outbound';
  timestamp: string;
  sender?: string;
  is_automated?: boolean;
  metadata?: any;
}

interface AIAssistantState {
  isAnalyzing: boolean;
  suggestions: Array<{
    text: string;
    type: string;
    confidence: number;
    intent: string;
  }>;
  insights: {
    sentiment: string;
    urgency: string;
    intent: string;
    buyingSignals: string[];
    nextActions: string[];
  };
  customerContext: {
    healthScore: number;
    loyaltyLevel: string;
    riskFactors: string[];
  };
}

export default function SmartConversationInbox({ agentId, onConversationSelect }: SmartConversationInboxProps) {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithDetails | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [aiAssistant, setAIAssistant] = useState<AIAssistantState>({
    isAnalyzing: false,
    suggestions: [],
    insights: {
      sentiment: 'neutral',
      urgency: 'medium',
      intent: 'general',
      buyingSignals: [],
      nextActions: []
    },
    customerContext: {
      healthScore: 0,
      loyaltyLevel: 'new',
      riskFactors: []
    }
  });
  
  const [filters, setFilters] = useState({
    channel: 'all',
    status: 'active',
    priority: 'all',
    searchTerm: ''
  });
  
  const [aiSettings, setAISettings] = useState({
    autoSuggestions: true,
    realTimeAnalysis: true,
    sentimentTracking: true,
    responseTemplates: true
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadConversations();
    
    // Real-time updates every 10 seconds
    const interval = setInterval(loadConversations, 10000);
    return () => clearInterval(interval);
  }, [agentId, filters]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      loadAIInsights(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      let url = `/api/omnichannel/conversations?status=${filters.status}&limit=50`;
      if (agentId) url += `&agent_id=${agentId}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        let filteredConversations = data.conversations;
        
        // Apply filters
        if (filters.channel !== 'all') {
          filteredConversations = filteredConversations.filter(
            (conv: ConversationWithDetails) => conv.channel === filters.channel
          );
        }
        
        if (filters.priority !== 'all') {
          filteredConversations = filteredConversations.filter(
            (conv: ConversationWithDetails) => conv.priority === filters.priority
          );
        }
        
        if (filters.searchTerm) {
          filteredConversations = filteredConversations.filter(
            (conv: ConversationWithDetails) => 
              conv.customer.name?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
              conv.subject?.toLowerCase().includes(filters.searchTerm.toLowerCase())
          );
        }
        
        setConversations(filteredConversations);
        
        // Auto-select first conversation if none selected
        if (!selectedConversation && filteredConversations.length > 0) {
          handleConversationSelect(filteredConversations[0]);
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: number) => {
    try {
      const response = await fetch(`/api/omnichannel/conversations/${conversationId}/messages`);
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Helper function to map API customer_type to loyalty level
  const mapCustomerTypeToLoyaltyLevel = (customerType: string | undefined): 'new' | 'returning' | 'vip' => {
    if (!customerType) return 'new';
    
    switch (customerType.toLowerCase()) {
      case 'vip':
        return 'vip';
      case 'customer':
        return 'returning';
      case 'prospect':
      default:
        return 'new';
    }
  };

  const loadAIInsights = async (conversation: ConversationWithDetails) => {
    if (!aiSettings.realTimeAnalysis) return;
    
    try {
      setAIAssistant(prev => ({ ...prev, isAnalyzing: true }));
      
      // Map customer type to loyalty level for AI analysis
      const mappedLoyaltyLevel = mapCustomerTypeToLoyaltyLevel(conversation.customer?.customer_type);
      
      // Build conversation context for AI analysis
      const context: ConversationContext = {
        customerId: conversation.customer_id.toString(),
        conversationId: conversation.id.toString(),
        channel: conversation.channel,
        messages: conversation.messages?.map(m => ({
          id: m.id.toString(),
          content: m.content,
          direction: m.direction,
          timestamp: m.created_at.toString(),
          sender: m.sender_name
        })) || [],
        customerProfile: {
          name: conversation.customer?.name || 'Unknown Customer',
          email: conversation.customer?.email || undefined,
          phone: conversation.customer?.phone || undefined,
          totalBookings: 0, // This would come from customer 360 data
          loyaltyLevel: mappedLoyaltyLevel,
          averageSpend: 0,
          preferredDestinations: []
        }
      };

      const aiResponse = await aiConversationService.analyzeConversation(context);
      const healthScore = await aiConversationService.calculateCustomerHealth(conversation.customer_id.toString());
      
      setAIAssistant(prev => ({
        ...prev,
        isAnalyzing: false,
        suggestions: aiResponse.suggestions,
        insights: {
          sentiment: aiResponse.sentiment.label,
          urgency: aiResponse.sentiment.urgency,
          intent: aiResponse.intent.primary,
          buyingSignals: aiResponse.customerInsights.buyingSignals,
          nextActions: aiResponse.nextBestActions.map(action => action.action)
        },
        customerContext: {
          healthScore: healthScore.score,
          loyaltyLevel: mappedLoyaltyLevel,
          riskFactors: healthScore.recommendations
        }
      }));
    } catch (error) {
      console.error('Error loading AI insights:', error);
      setAIAssistant(prev => ({ ...prev, isAnalyzing: false }));
    }
  };

  const handleConversationSelect = (conversation: ConversationWithDetails) => {
    setSelectedConversation(conversation);
    onConversationSelect?.(conversation);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    try {
      const response = await fetch(`/api/omnichannel/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage,
          direction: 'outbound',
          agent_id: agentId
        })
      });
      
      if (response.ok) {
        setNewMessage('');
        await loadMessages(selectedConversation.id);
        
        // Trigger AI analysis of new conversation state
        if (aiSettings.realTimeAnalysis) {
          await loadAIInsights(selectedConversation);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleUseSuggestion = (suggestion: any) => {
    setNewMessage(suggestion.text);
    messageInputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return '💬';
      case 'email': return '✉️';
      case 'webchat': return '🌐';
      case 'phone': return '📞';
      case 'instagram': return '📸';
      case 'facebook': return '👥';
      default: return '💬';
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return 'bg-green-100 text-green-800 border-green-200';
      case 'email': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'webchat': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'phone': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'instagram': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'facebook': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <ThumbsUp className="w-4 h-4 text-green-600" />;
      case 'negative': return <ThumbsDown className="w-4 h-4 text-red-600" />;
      default: return <MessageCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatTime = (timestamp: string | Date | undefined) => {
    if (!timestamp) return '---';
    
    try {
      return new Date(timestamp).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.warn('Invalid timestamp for formatTime:', timestamp);
      return '---';
    }
  };

  const formatDate = (timestamp: string | Date | undefined) => {
    if (!timestamp) return '---';
    
    try {
      return new Date(timestamp).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit'
      });
    } catch (error) {
      console.warn('Invalid timestamp for formatDate:', timestamp);
      return '---';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg">Carregando conversas...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Conversation List */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Conversas</h2>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" onClick={loadConversations}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Search and Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar conversas..."
                className="pl-10"
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              />
            </div>
            
            <div className="flex space-x-2">
              <select 
                className="text-sm border rounded px-2 py-1 bg-white"
                value={filters.channel}
                onChange={(e) => setFilters(prev => ({ ...prev, channel: e.target.value }))}
              >
                <option value="all">Todos canais</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
                <option value="webchat">Chat Web</option>
                <option value="phone">Telefone</option>
              </select>
              
              <select 
                className="text-sm border rounded px-2 py-1 bg-white"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="active">Ativas</option>
                <option value="pending">Pendentes</option>
                <option value="all">Todas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedConversation?.id === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
              onClick={() => handleConversationSelect(conversation)}
            >
              <div className="flex items-start space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${conversation.customer?.name || 'unknown'}`} />
                  <AvatarFallback className="bg-gray-200">
                    {conversation.customer?.name?.split(' ').map(n => n[0]).join('') || '?'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {conversation.customer?.name || 'Cliente Anônimo'}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {conversation.last_message ? formatTime(conversation.last_message.created_at) : ''}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="outline" className={`text-xs ${getChannelColor(conversation.channel)}`}>
                      {getChannelIcon(conversation.channel)} {conversation.channel}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${getPriorityColor(conversation.priority)}`}>
                      {conversation.priority}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 truncate">
                    {conversation.last_message?.content || 'Nova conversa'}
                  </p>
                  
                  {conversation.unread_count > 0 && (
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {conversation.customer?.email || conversation.customer?.phone || 'Sem contato'}
                      </span>
                      <Badge variant="destructive" className="text-xs">
                        {conversation.unread_count || 0}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedConversation.customer?.name || 'unknown'}`} />
                    <AvatarFallback className="bg-gray-200">
                      {selectedConversation.customer?.name?.split(' ').map(n => n[0]).join('') || '?'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedConversation.customer?.name || 'Cliente Anônimo'}
                    </h2>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{selectedConversation.customer?.email || selectedConversation.customer?.phone || 'Sem contato'}</span>
                      <span>•</span>
                      <Badge variant="outline" className={`text-xs ${getChannelColor(selectedConversation.channel)}`}>
                        {getChannelIcon(selectedConversation.channel)} {selectedConversation.channel}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {aiAssistant.customerContext.healthScore > 0 && (
                    <Badge variant="outline" className="text-xs">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Score: {aiAssistant.customerContext.healthScore}%
                    </Badge>
                  )}
                  <Button size="sm" variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Ver Cliente 360
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 flex">
              {/* Chat Messages */}
              <div className="flex-1 flex flex-col bg-gray-50">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.direction === 'outbound'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-xs ${
                            message.direction === 'outbound' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatTime(message.timestamp)}
                          </span>
                          {message.is_automated && (
                            <Bot className={`w-3 h-3 ${
                              message.direction === 'outbound' ? 'text-blue-200' : 'text-gray-400'
                            }`} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* AI Suggestions Bar */}
                {aiSettings.autoSuggestions && aiAssistant.suggestions.length > 0 && (
                  <div className="bg-yellow-50 border-t border-yellow-200 p-3">
                    <div className="flex items-center mb-2">
                      <Sparkles className="w-4 h-4 text-yellow-600 mr-2" />
                      <span className="text-sm font-medium text-yellow-800">Sugestões da IA</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {aiAssistant.suggestions.slice(0, 3).map((suggestion, index) => (
                        <Button
                          key={index}
                          size="sm"
                          variant="outline"
                          className="text-xs border-yellow-300 hover:bg-yellow-100"
                          onClick={() => handleUseSuggestion(suggestion)}
                        >
                          <span className="truncate max-w-xs">{suggestion.text}</span>
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {Math.round(suggestion.confidence * 100)}%
                          </Badge>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message Input */}
                <div className="bg-white border-t border-gray-200 p-4">
                  <div className="flex items-end space-x-2">
                    <div className="flex-1">
                      <Textarea
                        ref={messageInputRef}
                        placeholder="Digite sua mensagem..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="resize-none"
                        rows={2}
                      />
                    </div>
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="px-4 py-2"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* AI Assistant Sidebar */}
              <div className="w-80 bg-white border-l border-gray-200">
                <Tabs defaultValue="insights" className="h-full flex flex-col">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-100 m-2">
                    <TabsTrigger value="insights" className="text-sm">
                      <Brain className="w-4 h-4 mr-1" />
                      Insights
                    </TabsTrigger>
                    <TabsTrigger value="customer" className="text-sm">
                      <Users className="w-4 h-4 mr-1" />
                      Cliente
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="insights" className="flex-1 p-4 space-y-4 overflow-y-auto">
                    {/* Real-time Analysis */}
                    <Card className="border-0 shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center">
                          <Brain className="w-4 h-4 mr-2 text-purple-600" />
                          Análise em Tempo Real
                          {aiAssistant.isAnalyzing && (
                            <div className="ml-2 animate-spin rounded-full h-3 w-3 border-b border-purple-600"></div>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="flex items-center justify-center mb-1">
                              {getSentimentIcon(aiAssistant.insights.sentiment)}
                            </div>
                            <div className="font-medium">{aiAssistant.insights.sentiment}</div>
                            <div className="text-gray-500">Sentimento</div>
                          </div>
                          
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="flex items-center justify-center mb-1">
                              <AlertCircle className={`w-4 h-4 ${
                                aiAssistant.insights.urgency === 'high' ? 'text-red-600' :
                                aiAssistant.insights.urgency === 'medium' ? 'text-yellow-600' : 'text-green-600'
                              }`} />
                            </div>
                            <div className="font-medium">{aiAssistant.insights.urgency}</div>
                            <div className="text-gray-500">Urgência</div>
                          </div>
                        </div>

                        <div>
                          <div className="text-xs font-medium text-gray-500 mb-1">Intenção detectada</div>
                          <Badge variant="outline" className="text-xs">
                            <Target className="w-3 h-3 mr-1" />
                            {aiAssistant.insights.intent}
                          </Badge>
                        </div>

                        {aiAssistant.insights.buyingSignals.length > 0 && (
                          <div>
                            <div className="text-xs font-medium text-green-600 mb-2">Sinais de Compra</div>
                            <div className="flex flex-wrap gap-1">
                              {aiAssistant.insights.buyingSignals.map((signal, index) => (
                                <Badge key={index} variant="outline" className="text-xs border-green-200 text-green-700">
                                  {signal}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Next Actions */}
                    {aiAssistant.insights.nextActions.length > 0 && (
                      <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center">
                            <Zap className="w-4 h-4 mr-2 text-yellow-600" />
                            Próximas Ações
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {aiAssistant.insights.nextActions.slice(0, 3).map((action, index) => (
                              <div key={index} className="text-xs p-2 bg-yellow-50 rounded border border-yellow-200">
                                <div className="font-medium text-yellow-800">{action}</div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Response Templates */}
                    {aiSettings.responseTemplates && (
                      <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center">
                            <MessageSquare className="w-4 h-4 mr-2 text-blue-600" />
                            Respostas Rápidas
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {[
                              "Obrigado pelo contato! Vou verificar as melhores opções para sua viagem.",
                              "Perfeito! Vou preparar uma cotação personalizada para você.",
                              "Entendi sua necessidade. Posso agendar uma ligação para discutir os detalhes?"
                            ].map((template, index) => (
                              <Button
                                key={index}
                                size="sm"
                                variant="outline"
                                className="w-full text-left text-xs h-auto p-2 whitespace-normal"
                                onClick={() => setNewMessage(template)}
                              >
                                {template}
                              </Button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="customer" className="flex-1 p-4 space-y-4 overflow-y-auto">
                    {/* Customer Health */}
                    <Card className="border-0 shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center">
                          <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                          Saúde do Cliente
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            {aiAssistant.customerContext.healthScore}%
                          </div>
                          <Progress 
                            value={aiAssistant.customerContext.healthScore} 
                            className="h-2 mt-2"
                          />
                        </div>
                        
                        <div className="text-xs">
                          <div className="font-medium text-gray-500 mb-1">Nível de fidelidade</div>
                          <Badge variant="outline" className="text-xs">
                            {aiAssistant.customerContext.loyaltyLevel}
                          </Badge>
                        </div>

                        {aiAssistant.customerContext.riskFactors.length > 0 && (
                          <div>
                            <div className="text-xs font-medium text-red-600 mb-1">Fatores de Risco</div>
                            <div className="space-y-1">
                              {aiAssistant.customerContext.riskFactors.slice(0, 2).map((risk, index) => (
                                <div key={index} className="text-xs text-red-700 bg-red-50 p-1 rounded">
                                  {risk}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="border-0 shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center">
                          <Zap className="w-4 h-4 mr-2 text-blue-600" />
                          Ações Rápidas
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button size="sm" variant="outline" className="w-full text-xs">
                          <Phone className="w-3 h-3 mr-2" />
                          Ligar para cliente
                        </Button>
                        <Button size="sm" variant="outline" className="w-full text-xs">
                          <Mail className="w-3 h-3 mr-2" />
                          Enviar email
                        </Button>
                        <Button size="sm" variant="outline" className="w-full text-xs">
                          <Calendar className="w-3 h-3 mr-2" />
                          Agendar follow-up
                        </Button>
                        <Button size="sm" variant="outline" className="w-full text-xs">
                          <Tag className="w-3 h-3 mr-2" />
                          Adicionar tags
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </>
        ) : (
          /* No Conversation Selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Selecione uma conversa
              </h3>
              <p className="text-gray-500">
                Escolha uma conversa da lista para começar a responder
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}