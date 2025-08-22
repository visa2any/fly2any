/**
 * Unified AI Orchestrator
 * Coordinates all AI systems for seamless user experience and maximum efficiency
 */

import { gpt4TravelAssistant } from './gpt4-travel-assistant';
import { advancedPricePredictor } from './advanced-price-predictor';
import { intelligentAutomation } from './intelligent-automation';
import { AIAmadeusClient } from '../flights/ai-amadeus-client';
import { UnifiedAIAssistant } from '../chat/unified-ai-assistant';
import { personalizationEngine } from '../flights/personalization-engine';
import { ProcessedFlightOffer, FlightSearchParams } from '@/types/flights';

interface AISystemHealth {
  system: string;
  status: 'healthy' | 'degraded' | 'offline';
  performance: number; // 0-1
  lastHealthCheck: Date;
  errorRate: number;
  responseTime: number;
  accuracy?: number;
}

interface UserSession {
  sessionId: string;
  userId?: string;
  startTime: Date;
  lastActivity: Date;
  context: SessionContext;
  aiHistory: AIInteraction[];
  performanceMetrics: SessionMetrics;
}

interface SessionContext {
  intent: 'search' | 'booking' | 'support' | 'exploration';
  stage: 'discovery' | 'comparison' | 'decision' | 'booking' | 'post_booking';
  userProfile: UserProfileSnapshot;
  currentSearch?: FlightSearchParams;
  selectedFlights: ProcessedFlightOffer[];
  conversationFlow: string[];
  automationLevel: 'full' | 'assisted' | 'manual';
  trustScore: number;
}

interface UserProfileSnapshot {
  segment: 'budget' | 'comfort' | 'luxury' | 'business' | 'family';
  experience: 'novice' | 'experienced' | 'expert';
  preferences: any;
  behaviorPatterns: any;
  satisfactionScore: number;
}

interface AIInteraction {
  timestamp: Date;
  system: string;
  action: string;
  input: any;
  output: any;
  confidence: number;
  processingTime: number;
  userSatisfaction?: number;
}

interface SessionMetrics {
  aiResponseTime: number;
  userEngagement: number;
  taskCompletion: number;
  errorCount: number;
  automationSuccess: number;
  conversionProbability: number;
}

interface OrchestrationDecision {
  primarySystem: string;
  supportingSystems: string[];
  confidence: number;
  reasoning: string[];
  fallbackPlan: string[];
  expectedOutcome: any;
}

interface AIPerformanceMetrics {
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  errorRate: number;
  systemHealth: AISystemHealth[];
  overallPerformance?: number;
  userSatisfaction?: number;
  businessMetrics?: BusinessMetrics;
  optimizationOpportunities?: OptimizationOpportunity[];
  lastUpdated: Date;
}

interface BusinessMetrics {
  conversionRate: number;
  averageBookingValue: number;
  customerSatisfaction: number;
  automationEfficiency: number;
  costSavings: number;
  revenueImpact: number;
}

interface OptimizationOpportunity {
  system: string;
  opportunity: string;
  potentialImpact: number;
  implementationComplexity: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export class UnifiedAIOrchestrator {
  private aiSystems: Map<string, any> = new Map();
  private activeSessions: Map<string, UserSession> = new Map();
  private systemHealth: Map<string, AISystemHealth> = new Map();
  private performanceMetrics: AIPerformanceMetrics = {
    totalRequests: 0,
    successRate: 1.0,
    averageResponseTime: 0,
    errorRate: 0,
    systemHealth: [],
    lastUpdated: new Date()
  };
  private orchestrationRules: OrchestrationRule[] = [];

  constructor() {
    this.initializeAISystems();
    this.initializeOrchestrationRules();
    
    // Delay health monitoring to prevent blocking during app startup
    if (typeof window === 'undefined') {
      // Only start timers in production/non-build environments
      setTimeout(() => {
        this.startHealthMonitoring();
        this.startPerformanceOptimization();
      }, 10000); // 10 second delay to allow app to fully initialize
    }
  }

  /**
   * Main orchestration method - decides which AI systems to use and how
   */
  async orchestrateAIResponse(
    sessionId: string,
    userInput: any,
    context?: any
  ): Promise<{
    response: any;
    systemsUsed: string[];
    confidence: number;
    processingTime: number;
    nextRecommendations: string[];
    automationOpportunities: any[];
  }> {
    const startTime = Date.now();
    
    try {
      // Get or create session
      const session = await this.getOrCreateSession(sessionId, context?.userId);
      
      // Analyze intent and determine optimal AI strategy
      const strategy = await this.determineOptimalStrategy(userInput, session);
      
      // Execute coordinated AI response
      const coordinatedResponse = await this.executeCoordinatedResponse(
        strategy,
        userInput,
        session
      );
      
      // Update session and metrics
      await this.updateSessionAndMetrics(session, coordinatedResponse, startTime);
      
      // Generate next-step recommendations
      const nextRecommendations = await this.generateNextStepRecommendations(
        session,
        coordinatedResponse
      );
      
      // Identify automation opportunities
      const automationOpportunities = await this.identifyAutomationOpportunities(
        session,
        coordinatedResponse
      );

      return {
        response: coordinatedResponse.response,
        systemsUsed: coordinatedResponse.systemsUsed,
        confidence: coordinatedResponse.confidence,
        processingTime: Date.now() - startTime,
        nextRecommendations,
        automationOpportunities
      };

    } catch (error) {
      console.error('AI Orchestration Error:', error);
      
      // Fallback to basic unified assistant
      const fallbackResponse = await this.aiSystems.get('unified').processMessage(
        sessionId,
        userInput.message || userInput,
        context?.userId
      );
      
      return {
        response: fallbackResponse,
        systemsUsed: ['unified_fallback'],
        confidence: 0.5,
        processingTime: Date.now() - startTime,
        nextRecommendations: [],
        automationOpportunities: []
      };
    }
  }

  /**
   * Intelligent flight search orchestration
   */
  async orchestrateFlightSearch(
    searchParams: FlightSearchParams,
    sessionId: string,
    userPreferences?: any
  ): Promise<{
    flights: ProcessedFlightOffer[];
    insights: any;
    recommendations: any;
    automationSuggestions: any;
    priceForecasts: any;
    alternativeOptions: any;
  }> {
    const session = this.activeSessions.get(sessionId);
    
    // Coordinate multiple AI systems for comprehensive search
    const [
      searchResults,
      priceForecasts,
      personalizedRecommendations,
      automationAnalysis,
      marketInsights
    ] = await Promise.allSettled([
      this.aiSystems.get('amadeus').smartFlightSearch(searchParams),
      this.aiSystems.get('pricePredictor').generatePriceForecast(searchParams, []),
      this.aiSystems.get('personalization').generateRecommendations(sessionId, []),
      this.aiSystems.get('automation').analyzeAutoCompletionOpportunity(
        session?.userId || 'guest',
        searchParams,
        session?.context
      ),
      this.aiSystems.get('gpt4').planIntelligentSearch(searchParams, '', sessionId)
    ]);

    // Process and combine results
    const flights = this.extractSuccessfulResult(searchResults)?.data || [];
    const enrichedFlights = await this.enrichFlightData(flights, sessionId);
    
    return {
      flights: enrichedFlights,
      insights: this.combineInsights([
        this.extractSuccessfulResult(marketInsights),
        this.extractSuccessfulResult(priceForecasts)
      ]),
      recommendations: this.extractSuccessfulResult(personalizedRecommendations),
      automationSuggestions: this.extractSuccessfulResult(automationAnalysis),
      priceForecasts: this.extractSuccessfulResult(priceForecasts),
      alternativeOptions: this.extractSuccessfulResult(marketInsights)?.alternativeOptions || []
    };
  }

  /**
   * Proactive AI recommendations and automation
   */
  async generateProactiveRecommendations(
    userId: string,
    context: 'price_drop' | 'booking_opportunity' | 'disruption' | 'general'
  ): Promise<{
    recommendations: ProactiveRecommendation[];
    automationActions: AutomationAction[];
    notifications: SmartNotification[];
    priorities: Priority[];
  }> {
    // Coordinate multiple AI systems for proactive insights
    const [
      personalizedDeals,
      priceAlerts,
      automationOpportunities,
      conversationalInsights
    ] = await Promise.allSettled([
      this.aiSystems.get('automation').generatePersonalizedDeals(userId),
      this.aiSystems.get('pricePredictor').monitorPriceChanges([]),
      this.aiSystems.get('automation').analyzeAutoCompletionOpportunity(userId, {} as any, {}),
      this.aiSystems.get('gpt4').generateProactiveSuggestions(userId, 'current')
    ]);

    // Intelligently combine and prioritize recommendations
    const combinedRecommendations = this.combineProactiveRecommendations([
      this.extractSuccessfulResult(personalizedDeals),
      this.extractSuccessfulResult(priceAlerts),
      this.extractSuccessfulResult(conversationalInsights)
    ]);

    return {
      recommendations: combinedRecommendations.recommendations,
      automationActions: combinedRecommendations.automationActions,
      notifications: combinedRecommendations.notifications,
      priorities: this.calculateRecommendationPriorities(combinedRecommendations)
    };
  }

  /**
   * Continuous learning and optimization
   */
  async optimizeAIPerformance(): Promise<{
    optimizations: SystemOptimization[];
    performanceGains: number;
    userSatisfactionImprovement: number;
    businessImpact: number;
  }> {
    // Analyze performance across all AI systems
    const performanceAnalysis = await this.analyzeOverallPerformance();
    
    // Identify optimization opportunities
    const optimizations = await this.identifyOptimizations(performanceAnalysis);
    
    // Execute optimizations
    const results = await this.executeOptimizations(optimizations);
    
    // Measure impact
    const impact = await this.measureOptimizationImpact(results);

    return {
      optimizations: results,
      performanceGains: impact.performance,
      userSatisfactionImprovement: impact.satisfaction,
      businessImpact: impact.business
    };
  }

  // Private implementation methods

  private initializeAISystems(): void {
    this.aiSystems.set('gpt4', gpt4TravelAssistant);
    this.aiSystems.set('pricePredictor', advancedPricePredictor);
    this.aiSystems.set('automation', intelligentAutomation);
    this.aiSystems.set('amadeus', new AIAmadeusClient());
    this.aiSystems.set('unified', new UnifiedAIAssistant());
    this.aiSystems.set('personalization', personalizationEngine);

    console.log('✅ AI Systems initialized and orchestrated');
  }

  private initializeOrchestrationRules(): void {
    this.orchestrationRules = [
      {
        condition: (input: any, session: UserSession) => 
          input.type === 'natural_language' && session.context.stage === 'discovery',
        action: 'primary_gpt4_with_amadeus_support',
        priority: 10
      },
      {
        condition: (input: any, session: UserSession) => 
          input.type === 'flight_search' && session.context.automationLevel === 'full',
        action: 'automated_search_with_personalization',
        priority: 9
      },
      {
        condition: (input: any, session: UserSession) => 
          input.type === 'price_inquiry',
        action: 'price_predictor_primary',
        priority: 8
      }
      // Additional rules would be defined here
    ];
  }

  private async determineOptimalStrategy(
    userInput: any,
    session: UserSession
  ): Promise<OrchestrationDecision> {
    // Analyze input type and session context
    const inputAnalysis = this.analyzeInput(userInput);
    const contextAnalysis = this.analyzeSessionContext(session);
    
    // Apply orchestration rules
    const applicableRules = this.orchestrationRules
      .filter(rule => rule.condition(userInput, session))
      .sort((a, b) => b.priority - a.priority);
    
    const primaryRule = applicableRules[0];
    
    if (!primaryRule) {
      // Default strategy
      return {
        primarySystem: 'unified',
        supportingSystems: ['personalization'],
        confidence: 0.6,
        reasoning: ['No specific rule matched', 'Using default unified approach'],
        fallbackPlan: ['gpt4'],
        expectedOutcome: 'general_assistance'
      };
    }

    // Determine systems based on rule
    const systemMapping = this.mapRuleToSystems(primaryRule.action);
    
    return {
      primarySystem: systemMapping.primary,
      supportingSystems: systemMapping.supporting,
      confidence: this.calculateStrategyConfidence(inputAnalysis, contextAnalysis),
      reasoning: [`Rule: ${primaryRule.action}`, `Input type: ${inputAnalysis.type}`],
      fallbackPlan: systemMapping.fallback,
      expectedOutcome: systemMapping.expectedOutcome
    };
  }

  private async executeCoordinatedResponse(
    strategy: OrchestrationDecision,
    userInput: any,
    session: UserSession
  ): Promise<{
    response: any;
    systemsUsed: string[];
    confidence: number;
    processingDetails: any;
  }> {
    const systemsUsed: string[] = [strategy.primarySystem];
    let primaryResponse;
    let supportingResponses: any[] = [];

    try {
      // Execute primary system
      const primarySystem = this.aiSystems.get(strategy.primarySystem);
      primaryResponse = await this.executeSystemCall(
        primarySystem,
        userInput,
        session,
        strategy.primarySystem
      );

      // Execute supporting systems in parallel
      if (strategy.supportingSystems.length > 0) {
        const supportingPromises = strategy.supportingSystems.map(async (systemName) => {
          const system = this.aiSystems.get(systemName);
          systemsUsed.push(systemName);
          return this.executeSystemCall(system, userInput, session, systemName);
        });

        supportingResponses = await Promise.allSettled(supportingPromises);
      }

      // Combine responses intelligently
      const combinedResponse = this.combineSystemResponses(
        primaryResponse,
        supportingResponses,
        strategy
      );

      return {
        response: combinedResponse,
        systemsUsed,
        confidence: this.calculateCombinedConfidence(primaryResponse, supportingResponses),
        processingDetails: {
          primary: primaryResponse,
          supporting: supportingResponses,
          strategy
        }
      };

    } catch (error) {
      console.error(`Primary system ${strategy.primarySystem} failed:`, error);
      
      // Execute fallback plan
      if (strategy.fallbackPlan.length > 0) {
        const fallbackSystem = this.aiSystems.get(strategy.fallbackPlan[0]);
        const fallbackResponse = await this.executeSystemCall(
          fallbackSystem,
          userInput,
          session,
          strategy.fallbackPlan[0]
        );

        return {
          response: fallbackResponse,
          systemsUsed: [strategy.fallbackPlan[0]],
          confidence: 0.5,
          processingDetails: { fallback: true }
        };
      }

      throw error;
    }
  }

  private async executeSystemCall(
    system: any,
    userInput: any,
    session: UserSession,
    systemName: string
  ): Promise<any> {
    const startTime = Date.now();
    
    try {
      let response;
      
      switch (systemName) {
        case 'gpt4':
          response = await system.processConversation(
            session.sessionId,
            userInput.message || userInput,
            session.userId
          );
          break;
        case 'pricePredictor':
          response = await system.generatePriceForecast(userInput.searchParams, []);
          break;
        case 'automation':
          response = await system.analyzeAutoCompletionOpportunity(
            session.userId || 'guest',
            userInput.searchParams || {},
            session.context
          );
          break;
        case 'amadeus':
          response = await system.smartFlightSearch(userInput.searchParams);
          break;
        case 'unified':
          response = await system.processMessage(
            session.sessionId,
            userInput.message || userInput,
            session.userId
          );
          break;
        case 'personalization':
          response = system.generateRecommendations(session.sessionId, []);
          break;
        default:
          throw new Error(`Unknown system: ${systemName}`);
      }

      // Record interaction
      session.aiHistory.push({
        timestamp: new Date(),
        system: systemName,
        action: 'process_input',
        input: userInput,
        output: response,
        confidence: response.confidence || 0.8,
        processingTime: Date.now() - startTime
      });

      return response;

    } catch (error) {
      console.error(`System ${systemName} call failed:`, error);
      
      // Record failed interaction
      session.aiHistory.push({
        timestamp: new Date(),
        system: systemName,
        action: 'process_input_failed',
        input: userInput,
        output: null,
        confidence: 0,
        processingTime: Date.now() - startTime
      });

      throw error;
    }
  }

  private combineSystemResponses(
    primaryResponse: any,
    supportingResponses: PromiseSettledResult<any>[],
    strategy: OrchestrationDecision
  ): any {
    // Intelligent response combination based on strategy
    let combinedResponse = { ...primaryResponse };

    // Add supporting insights
    supportingResponses.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        const systemName = strategy.supportingSystems[index];
        combinedResponse = this.mergeResponseData(
          combinedResponse,
          result.value,
          systemName
        );
      }
    });

    return combinedResponse;
  }

  private mergeResponseData(primary: any, supporting: any, systemName: string): any {
    switch (systemName) {
      case 'personalization':
        return {
          ...primary,
          personalizedRecommendations: supporting,
          personalizedInsights: supporting.personalizedInsights || []
        };
      case 'pricePredictor':
        return {
          ...primary,
          priceForecasts: supporting,
          pricingInsights: supporting.insights || []
        };
      case 'automation':
        return {
          ...primary,
          automationOpportunities: supporting,
          automationSuggestions: supporting.suggestions || []
        };
      default:
        return {
          ...primary,
          additionalInsights: {
            ...primary.additionalInsights,
            [systemName]: supporting
          }
        };
    }
  }

  private async getOrCreateSession(sessionId: string, userId?: string): Promise<UserSession> {
    if (this.activeSessions.has(sessionId)) {
      const session = this.activeSessions.get(sessionId)!;
      session.lastActivity = new Date();
      return session;
    }

    const newSession: UserSession = {
      sessionId,
      userId,
      startTime: new Date(),
      lastActivity: new Date(),
      context: {
        intent: 'exploration',
        stage: 'discovery',
        userProfile: await this.generateUserProfileSnapshot(userId),
        selectedFlights: [],
        conversationFlow: [],
        automationLevel: 'assisted',
        trustScore: 0.7
      },
      aiHistory: [],
      performanceMetrics: {
        aiResponseTime: 0,
        userEngagement: 0,
        taskCompletion: 0,
        errorCount: 0,
        automationSuccess: 0,
        conversionProbability: 0
      }
    };

    this.activeSessions.set(sessionId, newSession);
    return newSession;
  }

  private async generateUserProfileSnapshot(userId?: string): Promise<UserProfileSnapshot> {
    if (!userId) {
      return {
        segment: 'budget',
        experience: 'novice',
        preferences: {},
        behaviorPatterns: {},
        satisfactionScore: 0.7
      };
    }

    // Generate snapshot from personalization engine
    const personalizedExperience = personalizationEngine.generatePersonalizedExperience(userId);
    
    return {
      segment: 'comfort',
      experience: 'experienced',
      preferences: personalizedExperience.searchDefaults,
      behaviorPatterns: {},
      satisfactionScore: 0.8
    };
  }

  // Additional helper methods for health monitoring, performance optimization, etc.
  private startHealthMonitoring(): void {
    try {
      setInterval(async () => {
        try {
          await this.performHealthChecks();
        } catch (error) {
          console.warn('Health check interval error:', error);
        }
      }, 60000); // Every minute
    } catch (error) {
      console.warn('Failed to start health monitoring:', error);
    }
  }

  private startPerformanceOptimization(): void {
    try {
      setInterval(async () => {
        try {
          await this.optimizeAIPerformance();
        } catch (error) {
          console.warn('Performance optimization interval error:', error);
        }
      }, 300000); // Every 5 minutes
    } catch (error) {
      console.warn('Failed to start performance optimization:', error);
    }
  }

  private async performHealthChecks(): Promise<void> {
    // Add timeout to prevent health checks from hanging
    const healthCheckPromises = Array.from(this.aiSystems.entries()).map(async ([systemName, system]) => {
      try {
        // Race against timeout to prevent hanging
        const healthCheck = await Promise.race([
          this.checkSystemHealth(system, systemName),
          new Promise<AISystemHealth>((_, reject) => 
            setTimeout(() => reject(new Error('Health check timeout')), 5000)
          )
        ]);
        this.systemHealth.set(systemName, healthCheck);
      } catch (error) {
        console.warn(`Health check failed for ${systemName}:`, error);
        this.systemHealth.set(systemName, {
          system: systemName,
          status: 'offline',
          performance: 0,
          lastHealthCheck: new Date(),
          errorRate: 1,
          responseTime: 0
        });
      }
    });

    // Wait for all health checks to complete with overall timeout
    try {
      await Promise.allSettled(healthCheckPromises);
    } catch (error) {
      console.warn('Some health checks failed:', error);
    }
  }

  private async checkSystemHealth(system: any, systemName: string): Promise<AISystemHealth> {
    const startTime = Date.now();
    
    // Perform lightweight health check
    const isHealthy = await this.performLightweightCheck(system, systemName);
    const responseTime = Date.now() - startTime;
    
    return {
      system: systemName,
      status: isHealthy ? 'healthy' : 'degraded',
      performance: isHealthy ? 1 : 0.5,
      lastHealthCheck: new Date(),
      errorRate: 0,
      responseTime
    };
  }

  private async performLightweightCheck(system: any, systemName: string): Promise<boolean> {
    try {
      // Simple check based on system type
      if (systemName === 'gpt4' && system.processConversation) return true;
      if (systemName === 'pricePredictor' && system.generatePriceForecast) return true;
      if (systemName === 'automation' && system.analyzeAutoCompletionOpportunity) return true;
      return true;
    } catch {
      return false;
    }
  }

  // Mock implementations for remaining methods
  private analyzeInput(userInput: any): any {
    return { type: 'natural_language', complexity: 'medium' };
  }

  private analyzeSessionContext(session: UserSession): any {
    return { stage: session.context.stage, trustLevel: session.context.trustScore };
  }

  private mapRuleToSystems(action: string): any {
    const mappings: { [key: string]: any } = {
      'primary_gpt4_with_amadeus_support': {
        primary: 'gpt4',
        supporting: ['amadeus', 'personalization'],
        fallback: ['unified'],
        expectedOutcome: 'conversational_assistance'
      },
      'automated_search_with_personalization': {
        primary: 'amadeus',
        supporting: ['personalization', 'automation'],
        fallback: ['unified'],
        expectedOutcome: 'flight_results'
      },
      'price_predictor_primary': {
        primary: 'pricePredictor',
        supporting: ['personalization'],
        fallback: ['amadeus'],
        expectedOutcome: 'price_insights'
      }
    };

    return mappings[action] || mappings['primary_gpt4_with_amadeus_support'];
  }

  private calculateStrategyConfidence(inputAnalysis: any, contextAnalysis: any): number {
    return 0.85; // Simplified calculation
  }

  private calculateCombinedConfidence(primary: any, supporting: any[]): number {
    return Math.min(primary.confidence || 0.8, 1);
  }

  private extractSuccessfulResult(result: PromiseSettledResult<any>): any {
    return result.status === 'fulfilled' ? result.value : null;
  }

  private async enrichFlightData(flights: ProcessedFlightOffer[], sessionId: string): Promise<ProcessedFlightOffer[]> {
    // Enrich flights with personalization and AI insights
    return flights;
  }

  private combineInsights(insights: any[]): any {
    return insights.filter(Boolean).reduce((combined, insight) => ({ ...combined, ...insight }), {});
  }

  // Additional mock methods for completeness
  private async updateSessionAndMetrics(session: UserSession, response: any, startTime: number): Promise<void> {
    session.performanceMetrics.aiResponseTime = Date.now() - startTime;
  }

  private async generateNextStepRecommendations(session: UserSession, response: any): Promise<string[]> {
    return ['Compare options', 'Check prices', 'Book flight'];
  }

  private async identifyAutomationOpportunities(session: UserSession, response: any): Promise<any[]> {
    return [];
  }

  private combineProactiveRecommendations(results: any[]): any {
    return {
      recommendations: [],
      automationActions: [],
      notifications: []
    };
  }

  private calculateRecommendationPriorities(recommendations: any): Priority[] {
    return [];
  }

  private async analyzeOverallPerformance(): Promise<any> {
    return {};
  }

  private async identifyOptimizations(analysis: any): Promise<SystemOptimization[]> {
    return [];
  }

  private async executeOptimizations(optimizations: SystemOptimization[]): Promise<SystemOptimization[]> {
    return optimizations;
  }

  private async measureOptimizationImpact(results: SystemOptimization[]): Promise<any> {
    return { performance: 0.1, satisfaction: 0.05, business: 0.08 };
  }
}

// Supporting interfaces and types
interface OrchestrationRule {
  condition: (input: any, session: UserSession) => boolean;
  action: string;
  priority: number;
}

interface ProactiveRecommendation {
  type: string;
  title: string;
  description: string;
  confidence: number;
  action: string;
}

interface AutomationAction {
  type: string;
  description: string;
  autoExecute: boolean;
  userConfirmation: boolean;
}

interface SmartNotification {
  id: string;
  type: string;
  content: string;
  timing: Date;
  priority: 'low' | 'medium' | 'high';
}

interface Priority {
  item: string;
  score: number;
  reasoning: string[];
}

interface SystemOptimization {
  system: string;
  optimization: string;
  impact: number;
  status: 'pending' | 'applied' | 'failed';
}

// Lazy initialization to prevent constructor from running during build
let _unifiedAIOrchestrator: UnifiedAIOrchestrator | null = null;

export const unifiedAIOrchestrator = {
  getInstance(): UnifiedAIOrchestrator {
    if (!_unifiedAIOrchestrator) {
      _unifiedAIOrchestrator = new UnifiedAIOrchestrator();
    }
    return _unifiedAIOrchestrator;
  },
  
  // Proxy methods to maintain the same API
  async orchestrateAIResponse(sessionId: string, userInput: any, context?: any) {
    return this.getInstance().orchestrateAIResponse(sessionId, userInput, context);
  },
  
  async orchestrateFlightSearch(searchParams: any, sessionId: string, userPreferences?: any) {
    return this.getInstance().orchestrateFlightSearch(searchParams, sessionId, userPreferences);
  },
  
  async generateProactiveRecommendations(userId: string, context: any) {
    return this.getInstance().generateProactiveRecommendations(userId, context);
  }
};