/**
 * GPT-4 Travel Assistant Integration
 * Combines OpenAI GPT-4 with existing AI infrastructure for superior travel planning
 */

import { OpenAI } from 'openai';
import { AIAmadeusClient } from '../flights/ai-amadeus-client';
import { UnifiedAIAssistant } from '../chat/unified-ai-assistant';
import { personalizationEngine } from '../flights/personalization-engine';
import { ProcessedFlightOffer, FlightSearchParams } from '@/types/flights';

interface GPT4TravelContext {
  userPreferences: UserTravelProfile;
  currentSearch?: FlightSearchParams;
  conversationHistory: ConversationMessage[];
  bookingHistory: BookingRecord[];
  seasonalInsights: SeasonalData;
  marketTrends: MarketTrendData;
}

interface UserTravelProfile {
  id: string;
  travelStyle: 'luxury' | 'budget' | 'business' | 'adventure' | 'family';
  preferredDestinations: string[];
  budgetRange: { min: number; max: number; currency: string };
  travelFrequency: 'occasional' | 'frequent' | 'very_frequent';
  specialRequirements: string[];
  loyaltyPrograms: LoyaltyProgram[];
  pastSatisfactionRatings: number[];
}

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: any;
  attachments?: any[];
}

interface BookingRecord {
  flightDetails: ProcessedFlightOffer;
  bookingDate: Date;
  actualPrice: number;
  satisfaction: number;
  purpose: 'business' | 'leisure' | 'emergency';
}

interface SeasonalData {
  destination: string;
  month: number;
  priceIndex: number;
  weatherScore: number;
  crowdLevel: 'low' | 'medium' | 'high';
  events: string[];
}

interface MarketTrendData {
  priceDirection: 'rising' | 'falling' | 'stable';
  demandLevel: number;
  fuelPriceImpact: number;
  seasonalAdjustment: number;
}

interface LoyaltyProgram {
  airline: string;
  status: string;
  benefits: string[];
}

interface TravelRecommendation {
  type: 'destination' | 'timing' | 'route' | 'service' | 'budget';
  title: string;
  description: string;
  reasoning: string[];
  confidence: number;
  potentialSavings?: number;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface GPT4TravelResponse {
  conversationalResponse: string;
  structuredRecommendations: TravelRecommendation[];
  flightSuggestions: ProcessedFlightOffer[];
  nextSteps: string[];
  confidence: number;
  followUpQuestions: string[];
  personalizedInsights: string[];
}

export class GPT4TravelAssistant {
  private openai: OpenAI;
  private amadeusClient: AIAmadeusClient;
  private unifiedAssistant: UnifiedAIAssistant;
  private conversationCache: Map<string, GPT4TravelContext> = new Map();

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 30000,
    });
    this.amadeusClient = new AIAmadeusClient();
    this.unifiedAssistant = new UnifiedAIAssistant();
  }

  /**
   * Main conversation handler with GPT-4 integration
   */
  async processConversation(
    sessionId: string,
    userMessage: string,
    userId?: string
  ): Promise<GPT4TravelResponse> {
    try {
      const context = await this.getOrCreateContext(sessionId, userId);
      
      // Add user message to conversation history
      context.conversationHistory.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      });

      // Analyze intent and extract travel entities
      const travelIntent = await this.analyzeTravelIntent(userMessage, context);
      
      // Generate GPT-4 response with travel expertise
      const gpt4Response = await this.generateTravelResponse(userMessage, context, travelIntent);
      
      // Enhance with existing AI systems
      const enhancedResponse = await this.enhanceWithExistingAI(gpt4Response, context);
      
      // Update context
      context.conversationHistory.push({
        role: 'assistant',
        content: enhancedResponse.conversationalResponse,
        timestamp: new Date(),
        metadata: { confidence: enhancedResponse.confidence }
      });
      
      this.conversationCache.set(sessionId, context);
      
      return enhancedResponse;

    } catch (error) {
      console.error('GPT-4 Travel Assistant Error:', error);
      
      // Fallback to existing unified assistant
      const fallbackResponse = await this.unifiedAssistant.processMessage(
        sessionId,
        userMessage,
        userId
      );
      
      return this.convertToGPT4Format(fallbackResponse);
    }
  }

  /**
   * Generate intelligent flight search with GPT-4 planning
   */
  async planIntelligentSearch(
    searchParams: Partial<FlightSearchParams>,
    userMessage: string,
    sessionId: string
  ): Promise<{
    optimizedSearchParams: FlightSearchParams[];
    searchStrategy: string;
    alternativeOptions: any[];
    budgetInsights: string[];
    timingRecommendations: string[];
  }> {
    const context = this.conversationCache.get(sessionId);
    
    const prompt = this.buildSearchPlanningPrompt(searchParams, userMessage, context);
    
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert travel advisor with access to real-time flight data and market insights. Your goal is to create the most effective search strategy for finding the best flights based on user preferences, budget, and travel patterns.

          You have access to:
          - User's historical travel preferences and booking patterns
          - Real-time price trends and market data  
          - Seasonal insights and destination information
          - Amadeus AI predictions and choice probability data
          
          Provide detailed search optimization recommendations including:
          - Multiple search parameter variations to maximize options
          - Alternative dates, airports, and routes
          - Budget optimization strategies
          - Timing recommendations based on market trends`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500,
      functions: [
        {
          name: "optimize_flight_search",
          description: "Generate optimized search parameters and strategy",
          parameters: {
            type: "object",
            properties: {
              searchVariations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    params: { type: "object" },
                    reason: { type: "string" },
                    priority: { type: "number" }
                  }
                }
              },
              strategy: { type: "string" },
              alternativeOptions: { type: "array" },
              budgetInsights: { type: "array", items: { type: "string" } },
              timingRecommendations: { type: "array", items: { type: "string" } }
            }
          }
        }
      ],
      function_call: { name: "optimize_flight_search" }
    });

    const functionCall = completion.choices[0].message.function_call;
    if (functionCall?.arguments) {
      const result = JSON.parse(functionCall.arguments);
      
      return {
        optimizedSearchParams: result.searchVariations?.map((v: any) => v.params) || [],
        searchStrategy: result.strategy || 'Standard search strategy',
        alternativeOptions: result.alternativeOptions || [],
        budgetInsights: result.budgetInsights || [],
        timingRecommendations: result.timingRecommendations || []
      };
    }

    // Fallback to basic optimization
    return this.basicSearchOptimization(searchParams);
  }

  /**
   * Real-time flight analysis with GPT-4 insights
   */
  async analyzeFlightOptions(
    flights: ProcessedFlightOffer[],
    sessionId: string,
    userCriteria?: string
  ): Promise<{
    topRecommendations: ProcessedFlightOffer[];
    detailedAnalysis: string;
    comparisonInsights: string[];
    hiddenGems: ProcessedFlightOffer[];
    budgetAlternatives: ProcessedFlightOffer[];
    premiumUpgrades: ProcessedFlightOffer[];
  }> {
    const context = this.conversationCache.get(sessionId);
    const userProfile = context?.userPreferences;

    // Use existing recommendation engine
    const recommendations = await this.amadeusClient.getChoicePredictions(flights);
    const personalizedRanking = personalizationEngine.rankFlights(sessionId, flights);

    const analysisPrompt = this.buildFlightAnalysisPrompt(
      flights,
      userProfile,
      userCriteria,
      recommendations
    );

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert flight advisor with access to advanced AI predictions and user behavior data. Analyze flight options and provide personalized recommendations that combine price, convenience, quality, and user preferences.

          You have access to:
          - AI-powered choice predictions and probability scores
          - User's personalized travel profile and preferences  
          - Historical booking patterns and satisfaction ratings
          - Real-time price analysis and market positioning
          - Airline quality metrics and service comparisons

          Provide comprehensive analysis including:
          - Top personalized recommendations with detailed reasoning
          - Hidden gems that offer exceptional value
          - Budget alternatives without compromising experience
          - Premium upgrade options with ROI analysis`
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      temperature: 0.2,
      max_tokens: 2000
    });

    const analysis = completion.choices[0].message.content || '';

    // Combine GPT-4 insights with existing AI recommendations
    return {
      topRecommendations: personalizedRanking.slice(0, 3),
      detailedAnalysis: analysis,
      comparisonInsights: this.extractComparisonInsights(analysis),
      hiddenGems: this.findHiddenGems(flights, recommendations),
      budgetAlternatives: this.findBudgetAlternatives(flights),
      premiumUpgrades: this.findPremiumUpgrades(flights)
    };
  }

  /**
   * Proactive travel recommendations with market insights
   */
  async generateProactiveSuggestions(
    userId: string,
    seasonality: 'current' | 'upcoming'
  ): Promise<{
    destinationSuggestions: TravelRecommendation[];
    pricingInsights: string[];
    timingRecommendations: string[];
    personalizedDeals: any[];
    trendAnalysis: string;
  }> {
    const userProfile = await this.getUserProfile(userId);
    const marketData = await this.getMarketTrends();
    const seasonalData = await this.getSeasonalInsights(seasonality);

    const prompt = `Based on user profile and market analysis, generate proactive travel recommendations:

    User Profile:
    - Travel Style: ${userProfile.travelStyle}
    - Budget Range: ${userProfile.budgetRange.min}-${userProfile.budgetRange.max} ${userProfile.budgetRange.currency}
    - Past Destinations: ${userProfile.preferredDestinations.join(', ')}
    - Travel Frequency: ${userProfile.travelFrequency}
    - Satisfaction History: Average ${userProfile.pastSatisfactionRatings.reduce((a, b) => a + b, 0) / userProfile.pastSatisfactionRatings.length}/5

    Market Insights:
    - Price Direction: ${marketData.priceDirection}
    - Demand Level: ${marketData.demandLevel}
    - Seasonal Adjustment: ${marketData.seasonalAdjustment}

    Generate personalized recommendations for ${seasonality} travel.`;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a proactive travel advisor that identifies opportunities and trends before users even search. Use market data, seasonal patterns, and user behavior to suggest optimal travel plans.

          Focus on:
          - Destinations matching user's style and budget
          - Optimal timing based on price trends and seasonality
          - Emerging destinations with great value
          - Personalized deals based on loyalty programs
          - Seasonal events and experiences`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 1800
    });

    const suggestions = completion.choices[0].message.content || '';
    
    return {
      destinationSuggestions: this.parseDestinationSuggestions(suggestions),
      pricingInsights: this.extractPricingInsights(suggestions),
      timingRecommendations: this.extractTimingRecommendations(suggestions),
      personalizedDeals: await this.findPersonalizedDeals(userProfile),
      trendAnalysis: suggestions
    };
  }

  // Helper methods for context management and data processing

  private async getOrCreateContext(sessionId: string, userId?: string): Promise<GPT4TravelContext> {
    if (this.conversationCache.has(sessionId)) {
      return this.conversationCache.get(sessionId)!;
    }

    const userProfile = userId ? await this.getUserProfile(userId) : this.createGuestProfile();
    const context: GPT4TravelContext = {
      userPreferences: userProfile,
      conversationHistory: [],
      bookingHistory: [],
      seasonalInsights: await this.getSeasonalInsights('current'),
      marketTrends: await this.getMarketTrends()
    };

    this.conversationCache.set(sessionId, context);
    return context;
  }

  private async analyzeTravelIntent(message: string, context: GPT4TravelContext) {
    // Enhanced intent analysis with travel-specific patterns
    const travelKeywords = {
      search: ['flight', 'trip', 'travel', 'vacation', 'book', 'find'],
      budget: ['cheap', 'budget', 'affordable', 'deal', 'save', 'cost'],
      luxury: ['premium', 'business', 'first class', 'luxury', 'comfort'],
      flexible: ['flexible', 'anytime', 'whenever', 'open dates'],
      specific: ['specific', 'exact', 'must', 'need', 'required']
    };

    const intent = {
      primary: 'general',
      confidence: 0.7,
      entities: this.extractTravelEntities(message),
      urgency: 'medium',
      budget_conscious: this.containsKeywords(message, travelKeywords.budget),
      luxury_preference: this.containsKeywords(message, travelKeywords.luxury),
      date_flexible: this.containsKeywords(message, travelKeywords.flexible)
    };

    return intent;
  }

  private async generateTravelResponse(
    message: string,
    context: GPT4TravelContext,
    intent: any
  ): Promise<GPT4TravelResponse> {
    const systemPrompt = this.buildSystemPrompt(context, intent);
    
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...context.conversationHistory.slice(-10), // Last 10 messages for context
        { role: "user", content: message }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    const response = completion.choices[0].message.content || '';
    
    return {
      conversationalResponse: response,
      structuredRecommendations: this.extractRecommendations(response),
      flightSuggestions: [],
      nextSteps: this.extractNextSteps(response),
      confidence: 0.9,
      followUpQuestions: this.generateFollowUpQuestions(intent),
      personalizedInsights: this.generatePersonalizedInsights(context)
    };
  }

  private async enhanceWithExistingAI(
    gpt4Response: GPT4TravelResponse,
    context: GPT4TravelContext
  ): Promise<GPT4TravelResponse> {
    // Enhance GPT-4 response with existing AI capabilities
    
    if (context.currentSearch) {
      // Get flight suggestions from existing AI systems
      const flightResults = await this.amadeusClient.smartFlightSearch(context.currentSearch);
      if (flightResults.success && flightResults.data) {
        gpt4Response.flightSuggestions = flightResults.data.slice(0, 5);
        
        // Get AI predictions for these flights
        const predictions = await this.amadeusClient.getChoicePredictions(flightResults.data);
        
        // Enhance recommendations with AI insights
        gpt4Response.structuredRecommendations.push(...this.generateAIInsightRecommendations(predictions));
      }
    }

    return gpt4Response;
  }

  private buildSystemPrompt(context: GPT4TravelContext, intent: any): string {
    return `You are an expert travel advisor with access to advanced AI systems and real-time market data. You're helping users plan exceptional travel experiences while optimizing for their preferences, budget, and circumstances.

    User Profile:
    - Travel Style: ${context.userPreferences.travelStyle}
    - Budget Range: ${context.userPreferences.budgetRange.min}-${context.userPreferences.budgetRange.max} ${context.userPreferences.budgetRange.currency}
    - Travel Frequency: ${context.userPreferences.travelFrequency}
    - Preferred Destinations: ${context.userPreferences.preferredDestinations.join(', ') || 'Not specified'}

    Current Market Context:
    - Price Trends: ${context.marketTrends.priceDirection}
    - Demand Level: ${context.marketTrends.demandLevel}
    - Fuel Impact: ${context.marketTrends.fuelPriceImpact}

    Your responses should be:
    - Personalized to the user's profile and preferences
    - Informed by real-time market data and trends
    - Practical with actionable recommendations
    - Conversational yet professional
    - Optimized for value while considering user's budget and style

    Always consider:
    - Seasonal pricing and demand patterns
    - Alternative airports and flexible dates for savings
    - Loyalty program benefits and upgrades
    - Hidden fees and total cost of travel
    - User's past satisfaction patterns`;
  }

  private buildSearchPlanningPrompt(
    searchParams: Partial<FlightSearchParams>,
    userMessage: string,
    context?: GPT4TravelContext
  ): string {
    return `Plan an intelligent flight search strategy:

    User Request: "${userMessage}"
    
    Current Search Parameters:
    ${JSON.stringify(searchParams, null, 2)}
    
    User Context:
    ${context ? `
    - Travel Style: ${context.userPreferences.travelStyle}
    - Budget: ${context.userPreferences.budgetRange.min}-${context.userPreferences.budgetRange.max}
    - Past Destinations: ${context.userPreferences.preferredDestinations.join(', ')}
    ` : 'Limited context available'}
    
    Generate multiple search variations to maximize finding the best options, including:
    - Date flexibility options (+/- 1-3 days)
    - Alternative airports within reasonable distance
    - Different routing options (direct vs. connections)
    - Class upgrades if budget allows
    - Seasonal timing optimization`;
  }

  private buildFlightAnalysisPrompt(
    flights: ProcessedFlightOffer[],
    userProfile?: UserTravelProfile,
    userCriteria?: string,
    predictions?: any[]
  ): string {
    const flightSummary = flights.slice(0, 10).map((flight, index) => `
    Flight ${index + 1}:
    - Price: ${flight.totalPrice}
    - Duration: ${flight.totalDuration}
    - Stops: ${flight.outbound.stops}
    - Airline: ${flight.validatingAirlines.join(', ')}
    - Departure: ${flight.outbound.departure.time}
    - AI Choice Probability: ${predictions?.[index]?.choiceProbability || 'N/A'}
    `).join('\n');

    return `Analyze these flight options for personalized recommendations:

    ${flightSummary}
    
    User Profile:
    ${userProfile ? `
    - Travel Style: ${userProfile.travelStyle}
    - Budget Range: ${userProfile.budgetRange.min}-${userProfile.budgetRange.max}
    - Travel Frequency: ${userProfile.travelFrequency}
    ` : 'Guest user'}
    
    User Criteria: "${userCriteria || 'Best overall value'}"
    
    Provide detailed analysis focusing on:
    - Best value propositions
    - Convenience vs. cost trade-offs
    - Hidden gems with unexpected benefits
    - Premium options worth the upgrade
    - Budget alternatives that don't compromise experience`;
  }

  // Utility methods for data extraction and processing

  private extractTravelEntities(message: string) {
    // Enhanced entity extraction for travel-specific terms
    const entities = {
      destinations: this.extractDestinations(message),
      dates: this.extractDates(message),
      budget: this.extractBudget(message),
      passengers: this.extractPassengers(message),
      preferences: this.extractPreferences(message)
    };
    return entities;
  }

  private containsKeywords(message: string, keywords: string[]): boolean {
    return keywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private extractRecommendations(response: string): TravelRecommendation[] {
    // Parse structured recommendations from GPT-4 response
    // Implementation would use regex or NLP to extract recommendation patterns
    return [];
  }

  private extractNextSteps(response: string): string[] {
    // Extract actionable next steps from response
    return [];
  }

  private generateFollowUpQuestions(intent: any): string[] {
    const baseQuestions = [
      "Would you like me to search for flights with these preferences?",
      "Are your travel dates flexible?",
      "Do you have any airline preferences?",
      "Would you consider alternative airports?"
    ];
    
    return baseQuestions.slice(0, 2); // Return top 2 relevant questions
  }

  private generatePersonalizedInsights(context: GPT4TravelContext): string[] {
    return [
      `Based on your ${context.userPreferences.travelStyle} travel style`,
      `Considering your budget range of ${context.userPreferences.budgetRange.min}-${context.userPreferences.budgetRange.max}`,
      `Market trends suggest ${context.marketTrends.priceDirection} prices`
    ];
  }

  private convertToGPT4Format(fallbackResponse: any): GPT4TravelResponse {
    return {
      conversationalResponse: fallbackResponse.content,
      structuredRecommendations: [],
      flightSuggestions: [],
      nextSteps: [],
      confidence: 0.7,
      followUpQuestions: [],
      personalizedInsights: []
    };
  }

  // Additional helper methods would continue here...
  
  private async getUserProfile(userId: string): Promise<UserTravelProfile> {
    // Implementation to load user profile from database
    return {
      id: userId,
      travelStyle: 'business',
      preferredDestinations: [],
      budgetRange: { min: 300, max: 2000, currency: 'USD' },
      travelFrequency: 'frequent',
      specialRequirements: [],
      loyaltyPrograms: [],
      pastSatisfactionRatings: [4, 5, 4, 3, 5]
    };
  }

  private createGuestProfile(): UserTravelProfile {
    return {
      id: 'guest',
      travelStyle: 'budget',
      preferredDestinations: [],
      budgetRange: { min: 200, max: 1000, currency: 'USD' },
      travelFrequency: 'occasional',
      specialRequirements: [],
      loyaltyPrograms: [],
      pastSatisfactionRatings: [4]
    };
  }

  private async getSeasonalInsights(period: 'current' | 'upcoming'): Promise<SeasonalData> {
    // Implementation to get seasonal data
    return {
      destination: 'general',
      month: new Date().getMonth(),
      priceIndex: 1.0,
      weatherScore: 0.8,
      crowdLevel: 'medium',
      events: []
    };
  }

  private async getMarketTrends(): Promise<MarketTrendData> {
    // Implementation to get market trend data
    return {
      priceDirection: 'stable',
      demandLevel: 0.7,
      fuelPriceImpact: 0.1,
      seasonalAdjustment: 1.0
    };
  }

  private basicSearchOptimization(searchParams: Partial<FlightSearchParams>) {
    return {
      optimizedSearchParams: [searchParams as FlightSearchParams],
      searchStrategy: 'Basic search optimization',
      alternativeOptions: [],
      budgetInsights: [],
      timingRecommendations: []
    };
  }

  private extractComparisonInsights(analysis: string): string[] {
    // Extract key comparison points from analysis
    return [];
  }

  private findHiddenGems(flights: ProcessedFlightOffer[], recommendations: any[]): ProcessedFlightOffer[] {
    // Find flights with high value but lower visibility
    return flights.slice(0, 2);
  }

  private findBudgetAlternatives(flights: ProcessedFlightOffer[]): ProcessedFlightOffer[] {
    // Find most budget-friendly options
    return flights.sort((a, b) => 
      parseFloat(a.totalPrice.replace(/\D/g, '')) - parseFloat(b.totalPrice.replace(/\D/g, ''))
    ).slice(0, 3);
  }

  private findPremiumUpgrades(flights: ProcessedFlightOffer[]): ProcessedFlightOffer[] {
    // Find premium class options
    return flights.filter(f => 
      f.outbound.segments.some(s => s.cabin === 'BUSINESS' || s.cabin === 'FIRST')
    ).slice(0, 2);
  }

  private generateAIInsightRecommendations(predictions: any[]): TravelRecommendation[] {
    return predictions.map(pred => ({
      type: 'route' as const,
      title: `High Choice Probability Flight`,
      description: `This flight has a ${(pred.choiceProbability * 100).toFixed(0)}% choice probability`,
      reasoning: pred.reasons || [],
      confidence: pred.confidence === 'HIGH' ? 0.9 : pred.confidence === 'MEDIUM' ? 0.7 : 0.5,
      actionable: true,
      priority: pred.confidence === 'HIGH' ? 'high' as const : 'medium' as const
    }));
  }

  // Entity extraction helper methods
  private extractDestinations(message: string): string[] {
    // Implementation for destination extraction
    return [];
  }

  private extractDates(message: string): string[] {
    // Implementation for date extraction
    return [];
  }

  private extractBudget(message: string): number | null {
    // Implementation for budget extraction
    return null;
  }

  private extractPassengers(message: string): { adults: number; children: number; infants: number } {
    // Implementation for passenger extraction
    return { adults: 1, children: 0, infants: 0 };
  }

  private extractPreferences(message: string): string[] {
    // Implementation for preference extraction
    return [];
  }

  private parseDestinationSuggestions(suggestions: string): TravelRecommendation[] {
    // Parse destination suggestions from GPT-4 response
    return [];
  }

  private extractPricingInsights(suggestions: string): string[] {
    // Extract pricing insights from response
    return [];
  }

  private extractTimingRecommendations(suggestions: string): string[] {
    // Extract timing recommendations from response
    return [];
  }

  private async findPersonalizedDeals(userProfile: UserTravelProfile): Promise<any[]> {
    // Find deals based on user profile
    return [];
  }
}

// Export singleton instance
// Lazy initialization to prevent constructor from running during build
let _gpt4TravelAssistant: GPT4TravelAssistant | null = null;

export const gpt4TravelAssistant = {
  getInstance(): GPT4TravelAssistant {
    if (!_gpt4TravelAssistant) {
      _gpt4TravelAssistant = new GPT4TravelAssistant();
    }
    return _gpt4TravelAssistant;
  },
  
  // Proxy methods to maintain the same API
  async processConversation(sessionId: string, userMessage: string, userId?: string) {
    return this.getInstance().processConversation(sessionId, userMessage, userId);
  },
  
  async planIntelligentSearch(searchParams: any, context: string, sessionId: string) {
    return this.getInstance().planIntelligentSearch(searchParams, context, sessionId);
  },
  
  async generateProactiveSuggestions(userId: string, context: 'current' | 'upcoming') {
    return this.getInstance().generateProactiveSuggestions(userId, context);
  }
};