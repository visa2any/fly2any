/**
 * AI Conversation Intelligence Service
 * Provides intelligent conversation analysis, response suggestions, and customer insights
 */

export interface ConversationContext {
  customerId: string;
  conversationId: string;
  channel: 'whatsapp' | 'email' | 'webchat' | 'phone' | 'instagram' | 'facebook';
  messages: Array<{
    id: string;
    content: string;
    direction: 'inbound' | 'outbound';
    timestamp: string;
    sender?: string;
  }>;
  customerProfile?: {
    name?: string;
    email?: string;
    phone?: string;
    totalBookings: number;
    lastBookingDate?: string;
    preferredDestinations: string[];
    averageSpend: number;
    loyaltyLevel: 'new' | 'returning' | 'vip';
  };
}

export interface AIResponse {
  suggestions: Array<{
    text: string;
    type: 'quick_reply' | 'detailed_response' | 'action';
    confidence: number;
    intent: string;
  }>;
  intent: {
    primary: string;
    confidence: number;
    entities: Array<{
      type: 'destination' | 'date' | 'budget' | 'travelers' | 'service';
      value: string;
      confidence: number;
    }>;
  };
  sentiment: {
    score: number; // -1 to 1
    label: 'negative' | 'neutral' | 'positive';
    urgency: 'low' | 'medium' | 'high' | 'critical';
  };
  nextBestActions: Array<{
    action: string;
    description: string;
    priority: number;
  }>;
  customerInsights: {
    buyingSignals: string[];
    riskFactors: string[];
    personalizedOffers: string[];
  };
}

export interface CustomerHealthScore {
  score: number; // 0-100
  factors: {
    engagement: number;
    satisfaction: number;
    responseTime: number;
    issueResolution: number;
    loyaltyIndicators: number;
  };
  risk: 'low' | 'medium' | 'high';
  recommendations: string[];
  nextActions: Array<{
    action: string;
    reason: string;
    timeline: string;
  }>;
}

class AIConversationService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.baseUrl = 'https://api.openai.com/v1';
  }

  /**
   * Analyze conversation and provide AI-powered insights
   */
  async analyzeConversation(context: ConversationContext): Promise<AIResponse> {
    try {
      const lastMessage = context.messages[context.messages.length - 1];
      const conversationHistory = context.messages.slice(-5); // Last 5 messages for context

      // Build context-aware prompt
      const prompt = this.buildAnalysisPrompt(context, lastMessage, conversationHistory);

      const response = await this.callOpenAI({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt()
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 800
      });

      return this.parseAIResponse(response.choices[0].message.content, context);
    } catch (error) {
      console.error('AI analysis error:', error);
      return this.getFallbackResponse(context);
    }
  }

  /**
   * Calculate customer health score with AI insights
   */
  async calculateCustomerHealth(customerId: string): Promise<CustomerHealthScore> {
    try {
      // Get customer data
      const customerData = await this.getCustomerAnalytics(customerId);
      
      // Calculate base scores
      const factors = {
        engagement: this.calculateEngagementScore(customerData),
        satisfaction: this.calculateSatisfactionScore(customerData),
        responseTime: this.calculateResponseTimeScore(customerData),
        issueResolution: this.calculateResolutionScore(customerData),
        loyaltyIndicators: this.calculateLoyaltyScore(customerData)
      };

      // Weighted overall score
      const score = Math.round(
        factors.engagement * 0.25 +
        factors.satisfaction * 0.30 +
        factors.responseTime * 0.15 +
        factors.issueResolution * 0.20 +
        factors.loyaltyIndicators * 0.10
      );

      const risk = score >= 80 ? 'low' : score >= 60 ? 'medium' : 'high';

      return {
        score,
        factors,
        risk,
        recommendations: this.generateHealthRecommendations(score, factors),
        nextActions: this.generateNextActions(score, factors, customerData)
      };
    } catch (error) {
      console.error('Customer health calculation error:', error);
      throw error;
    }
  }

  /**
   * Detect customer intent from message content
   */
  async detectIntent(message: string, context?: Partial<ConversationContext>): Promise<{
    intent: string;
    confidence: number;
    entities: Array<{ type: string; value: string; confidence: number }>;
  }> {
    // Travel-specific intent patterns
    const intentPatterns = {
      flight_booking: /passagem|voo|voar|viajar|ticket|flight/i,
      hotel_booking: /hotel|hospedagem|acomodação|quarto/i,
      package_inquiry: /pacote|combo|tudo incluso|all inclusive/i,
      price_inquiry: /preço|valor|custo|quanto|orçamento/i,
      cancellation: /cancelar|cancel|desistir|não quero mais/i,
      modification: /alterar|mudar|trocar|modificar/i,
      complaint: /problema|reclamar|insatisfeito|ruim/i,
      praise: /obrigad|excellent|ótimo|perfeito|amei/i
    };

    let detectedIntent = 'general_inquiry';
    let confidence = 0.3;

    for (const [intent, pattern] of Object.entries(intentPatterns)) {
      if (pattern.test(message)) {
        detectedIntent = intent;
        confidence = 0.8;
        break;
      }
    }

    // Extract entities (destinations, dates, numbers)
    const entities = this.extractEntities(message);

    return {
      intent: detectedIntent,
      confidence,
      entities
    };
  }

  /**
   * Generate personalized response suggestions
   */
  async generateResponseSuggestions(
    message: string,
    context: ConversationContext
  ): Promise<Array<{ text: string; type: string; confidence: number }>> {
    const intent = await this.detectIntent(message, context);
    const suggestions = [];

    switch (intent.intent) {
      case 'flight_booking':
        suggestions.push(
          {
            text: `Ótimo! Para encontrar as melhores opções de voo para ${context.customerProfile?.name || 'você'}, preciso saber: origem, destino e datas preferidas. Pode me passar essas informações? ✈️`,
            type: 'detailed_response',
            confidence: 0.9
          },
          {
            text: 'Já tenho algumas ofertas especiais! 🎯',
            type: 'quick_reply',
            confidence: 0.8
          }
        );
        break;

      case 'price_inquiry':
        suggestions.push(
          {
            text: `Com base no seu perfil, posso oferecer excelentes condições! Nossos pacotes começam em R$ 2.500 e temos opções personalizadas. Quer que eu prepare uma cotação específica para você?`,
            type: 'detailed_response',
            confidence: 0.9
          },
          {
            text: 'Vou preparar uma cotação personalizada! 💰',
            type: 'quick_reply',
            confidence: 0.8
          }
        );
        break;

      case 'complaint':
        suggestions.push(
          {
            text: `Peço desculpas pelo inconveniente, ${context.customerProfile?.name || ''}. Sua satisfação é nossa prioridade. Vou transferir você para nosso supervisor para resolver isso imediatamente. 🤝`,
            type: 'detailed_response',
            confidence: 0.95
          },
          {
            text: 'Vou resolver isso agora mesmo! 🛠️',
            type: 'quick_reply',
            confidence: 0.9
          }
        );
        break;

      default:
        suggestions.push(
          {
            text: 'Entendi! Como posso ajudar você com sua próxima viagem? 😊',
            type: 'detailed_response',
            confidence: 0.7
          }
        );
    }

    return suggestions;
  }

  private buildAnalysisPrompt(
    context: ConversationContext,
    lastMessage: any,
    history: any[]
  ): string {
    return `
Analyze this travel agency conversation:

Customer Profile:
- Name: ${context.customerProfile?.name || 'Unknown'}
- Loyalty Level: ${context.customerProfile?.loyaltyLevel || 'new'}
- Previous Bookings: ${context.customerProfile?.totalBookings || 0}
- Average Spend: R$ ${context.customerProfile?.averageSpend || 'Unknown'}

Recent Messages:
${history.map(m => `${m.direction}: ${m.content}`).join('\n')}

Latest Message: "${lastMessage.content}"

Provide analysis in JSON format:
{
  "intent": {"primary": "intent_name", "confidence": 0.8},
  "sentiment": {"score": 0.5, "label": "positive", "urgency": "medium"},
  "buying_signals": ["signal1", "signal2"],
  "next_actions": [{"action": "action_name", "priority": 1}],
  "response_suggestions": ["suggestion1", "suggestion2"]
}
`;
  }

  private getSystemPrompt(): string {
    return `
You are an AI assistant for Fly2Any, a premium travel agency specializing in personalized travel experiences. 

Your role:
- Analyze customer conversations for intent, sentiment, and buying signals
- Provide intelligent response suggestions that are warm, professional, and sales-focused
- Identify upselling opportunities and customer needs
- Detect urgency and escalation requirements
- Maintain the brand voice: friendly, expert, solution-oriented

Focus on:
- Travel industry context (flights, hotels, packages, destinations)
- Brazilian Portuguese cultural nuances
- Personalization based on customer history
- Revenue optimization through intelligent recommendations
`;
  }

  private parseAIResponse(content: string, context: ConversationContext): AIResponse {
    try {
      const parsed = JSON.parse(content);
      
      return {
        suggestions: parsed.response_suggestions?.map((text: string, index: number) => ({
          text,
          type: 'detailed_response',
          confidence: 0.8 - (index * 0.1),
          intent: parsed.intent?.primary || 'general'
        })) || [],
        
        intent: {
          primary: parsed.intent?.primary || 'general_inquiry',
          confidence: parsed.intent?.confidence || 0.5,
          entities: this.extractEntities(context.messages[context.messages.length - 1].content) as Array<{
            type: 'destination' | 'date' | 'budget' | 'travelers' | 'service';
            value: string;
            confidence: number;
          }>
        },
        
        sentiment: {
          score: parsed.sentiment?.score || 0,
          label: parsed.sentiment?.label || 'neutral',
          urgency: parsed.sentiment?.urgency || 'medium'
        },
        
        nextBestActions: parsed.next_actions?.map((action: any) => ({
          action: action.action,
          description: this.getActionDescription(action.action),
          priority: action.priority || 1
        })) || [],
        
        customerInsights: {
          buyingSignals: parsed.buying_signals || [],
          riskFactors: [],
          personalizedOffers: this.generatePersonalizedOffers(context)
        }
      };
    } catch (error) {
      return this.getFallbackResponse(context);
    }
  }

  private getFallbackResponse(context: ConversationContext): AIResponse {
    const lastMessage = context.messages[context.messages.length - 1];
    
    return {
      suggestions: [
        {
          text: 'Entendi! Como posso ajudar você com sua próxima viagem?',
          type: 'detailed_response',
          confidence: 0.6,
          intent: 'general'
        }
      ],
      intent: {
        primary: 'general_inquiry',
        confidence: 0.5,
        entities: []
      },
      sentiment: {
        score: 0,
        label: 'neutral',
        urgency: 'medium'
      },
      nextBestActions: [
        {
          action: 'gather_requirements',
          description: 'Collect travel requirements from customer',
          priority: 1
        }
      ],
      customerInsights: {
        buyingSignals: [],
        riskFactors: [],
        personalizedOffers: []
      }
    };
  }

  private extractEntities(text: string): Array<{ type: 'destination' | 'date' | 'budget' | 'travelers' | 'service'; value: string; confidence: number }> {
    const entities: Array<{ type: 'destination' | 'date' | 'budget' | 'travelers' | 'service'; value: string; confidence: number }> = [];
    
    // Destination patterns
    const destinationPattern = /(paris|londres|nova york|europa|eua|japão|miami|lisboa|madrid)/gi;
    const destinations = text.match(destinationPattern);
    if (destinations) {
      destinations.forEach(dest => {
        entities.push({ type: 'destination' as const, value: dest, confidence: 0.8 });
      });
    }

    // Date patterns
    const datePattern = /(\d{1,2}\/\d{1,2}|\d{1,2} de [a-z]+|próxim[oa]|janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)/gi;
    const dates = text.match(datePattern);
    if (dates) {
      dates.forEach(date => {
        entities.push({ type: 'date' as const, value: date, confidence: 0.7 });
      });
    }

    // Budget patterns
    const budgetPattern = /r?\$?\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/gi;
    const budgets = text.match(budgetPattern);
    if (budgets) {
      budgets.forEach(budget => {
        entities.push({ type: 'budget' as const, value: budget, confidence: 0.8 });
      });
    }

    return entities;
  }

  private calculateEngagementScore(customerData: any): number {
    // Implementation for engagement scoring
    const recentInteractions = customerData.interactions?.length || 0;
    const responseRate = customerData.responseRate || 0;
    const sessionDuration = customerData.avgSessionDuration || 0;
    
    return Math.min(100, (recentInteractions * 20) + (responseRate * 50) + (sessionDuration / 60 * 30));
  }

  private calculateSatisfactionScore(customerData: any): number {
    // Implementation for satisfaction scoring
    return customerData.satisfactionScore || 75;
  }

  private calculateResponseTimeScore(customerData: any): number {
    // Implementation for response time scoring
    const avgResponseTime = customerData.avgResponseTime || 30; // minutes
    return Math.max(0, 100 - (avgResponseTime * 2));
  }

  private calculateResolutionScore(customerData: any): number {
    // Implementation for resolution scoring
    const resolvedIssues = customerData.resolvedIssues || 0;
    const totalIssues = customerData.totalIssues || 1;
    return (resolvedIssues / totalIssues) * 100;
  }

  private calculateLoyaltyScore(customerData: any): number {
    // Implementation for loyalty scoring
    const bookings = customerData.totalBookings || 0;
    const tenure = customerData.tenureMonths || 1;
    return Math.min(100, (bookings * 25) + (tenure * 2));
  }

  private generateHealthRecommendations(score: number, factors: any): string[] {
    const recommendations = [];
    
    if (score < 60) {
      recommendations.push('Schedule proactive outreach to prevent churn');
      recommendations.push('Offer personalized discount or loyalty bonus');
    }
    
    if (factors.engagement < 50) {
      recommendations.push('Increase engagement through targeted content');
    }
    
    if (factors.satisfaction < 70) {
      recommendations.push('Follow up on recent interactions for feedback');
    }

    return recommendations;
  }

  private generateNextActions(score: number, factors: any, customerData: any): Array<{
    action: string;
    reason: string;
    timeline: string;
  }> {
    const actions = [];
    
    if (score < 60) {
      actions.push({
        action: 'Schedule retention call',
        reason: 'Customer health score indicates high churn risk',
        timeline: 'Within 24 hours'
      });
    }
    
    if (customerData.daysSinceLastContact > 30) {
      actions.push({
        action: 'Send re-engagement campaign',
        reason: 'Customer has been inactive for over 30 days',
        timeline: 'Within 3 days'
      });
    }

    return actions;
  }

  private getActionDescription(action: string): string {
    const descriptions: Record<string, string> = {
      gather_requirements: 'Collect detailed travel requirements from customer',
      send_quote: 'Prepare and send personalized travel quote',
      schedule_call: 'Schedule phone consultation with travel specialist',
      send_brochure: 'Send destination-specific travel brochure',
      escalate_to_supervisor: 'Transfer to senior agent or supervisor',
      offer_upgrade: 'Present premium package upgrade options'
    };
    
    return descriptions[action] || 'Perform customer service action';
  }

  private generatePersonalizedOffers(context: ConversationContext): string[] {
    const offers = [];
    const profile = context.customerProfile;
    
    if (profile?.loyaltyLevel === 'vip') {
      offers.push('Exclusive VIP lounge access upgrade');
      offers.push('Complimentary room upgrade at partner hotels');
    }
    
    if (profile?.totalBookings && profile.totalBookings > 2) {
      offers.push('Loyal customer 15% discount on next booking');
    }
    
    if (profile?.preferredDestinations?.includes('Europa')) {
      offers.push('European travel package with insider experiences');
    }

    return offers;
  }

  private async callOpenAI(params: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    return response.json();
  }

  private async getCustomerAnalytics(customerId: string): Promise<any> {
    // This would integrate with your existing customer data
    const response = await fetch(`/api/customers/${customerId}/360`);
    const data = await response.json();
    
    return {
      interactions: data.data?.timeline || [],
      responseRate: 0.8, // Calculate from actual data
      avgSessionDuration: 300, // seconds
      avgResponseTime: 25, // minutes
      satisfactionScore: 85,
      resolvedIssues: data.data?.totalInteractions || 0,
      totalIssues: data.data?.totalInteractions || 1,
      totalBookings: data.data?.totalBookings || 0,
      tenureMonths: 12, // Calculate from customer creation date
      daysSinceLastContact: 5 // Calculate from last interaction
    };
  }
}

export const aiConversationService = new AIConversationService();
export default aiConversationService;