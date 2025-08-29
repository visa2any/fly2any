/**
 * AI-Enhanced Flight Search Component
 * Integrates all AI systems into a seamless user experience
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SparklesIcon, 
  ChartBarIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  LightBulbIcon,
  UserIcon,
  ChatBubbleLeftEllipsisIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

import { unifiedAIOrchestrator } from '@/lib/ai/unified-ai-orchestrator';
import FlightSearchForm from '@/components/flights/FlightSearchForm';
import FlightResultsList from '@/components/flights/FlightResultsList';
import ConversationalSearchInterface from './ConversationalSearchInterface';
import { ProcessedFlightOffer, FlightSearchParams, FlightSearchFormData } from '@/types/flights';

interface AIEnhancedFlightSearchProps {
  onFlightSelect?: (flight: ProcessedFlightOffer) => void;
  className?: string;
  userId?: string;
  enableConversationalMode?: boolean;
  enableAutomation?: boolean;
}

interface AIInsight {
  type: 'price_forecast' | 'best_time' | 'alternative_route' | 'personalized_tip' | 'automation_suggestion';
  title: string;
  content: string;
  confidence: number;
  actionable: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
  icon: React.ComponentType<any>;
  priority: 'low' | 'medium' | 'high';
}

interface SearchState {
  mode: 'traditional' | 'conversational' | 'ai_assisted';
  loading: boolean;
  flights: ProcessedFlightOffer[];
  insights: AIInsight[];
  automationSuggestions: any[];
  priceForecasts: any;
  personalizedRecommendations: any[];
  sessionId: string;
  searchHistory: FlightSearchParams[];
  aiProcessingTime: number;
}

export default function AIEnhancedFlightSearch({
  onFlightSelect,
  className = '',
  userId,
  enableConversationalMode = true,
  enableAutomation = true
}: AIEnhancedFlightSearchProps) {
  const [searchState, setSearchState] = useState<SearchState>({
    mode: 'traditional',
    loading: false,
    flights: [],
    insights: [],
    automationSuggestions: [],
    priceForecasts: null,
    personalizedRecommendations: [],
    sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    searchHistory: [],
    aiProcessingTime: 0
  });

  const [showInsights, setShowInsights] = useState(true);
  const [autoModeEnabled, setAutoModeEnabled] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSearchRef = useRef<FlightSearchParams | null>(null);

  // Initialize AI systems and load user profile
  useEffect(() => {
    if (userId) {
      initializeUserSession();
    }
  }, [userId]);

  const initializeUserSession = async (): Promise<void> => {
    try {
      // Initialize session with AI orchestrator
      await unifiedAIOrchestrator.orchestrateAIResponse(
        searchState.sessionId,
        { type: 'initialize_session', userId },
        { userId }
      );

      // Load proactive recommendations
      if (userId) {
        const proactiveRecommendations = await unifiedAIOrchestrator.generateProactiveRecommendations(
          userId,
          'general'
        );
        
        setSearchState((prev: any) => ({
          ...prev,
          insights: transformToInsights(proactiveRecommendations.recommendations)
        }));
      }
    } catch (error) {
      console.error('Failed to initialize AI session:', error);
    }
  }

  const handleTraditionalSearch = useCallback(async (searchFormData: FlightSearchFormData) => {
    // Convert FlightSearchFormData to FlightSearchParams
    const searchParams: FlightSearchParams = {
      originLocationCode: searchFormData.origin?.iataCode || '',
      destinationLocationCode: searchFormData.destination?.iataCode || '',
      departureDate: searchFormData.departureDate.toISOString().split('T')[0],
      returnDate: searchFormData.returnDate?.toISOString().split('T')[0],
      adults: searchFormData.passengers.adults,
      children: searchFormData.passengers.children,
      infants: searchFormData.passengers.infants,
      travelClass: searchFormData.travelClass,
      nonStop: searchFormData.preferences.nonStop,
      maxPrice: searchFormData.preferences.maxPrice,
      currencyCode: 'BRL'
    };
    setSearchState((prev: any) => ({ ...prev, loading: true }));
    setAiProcessing(true);

    try {
      const startTime = Date.now();

      // Orchestrate AI-enhanced flight search
      const searchResult = await unifiedAIOrchestrator.orchestrateFlightSearch(
        searchParams,
        searchState.sessionId,
        { userId }
      );

      const processingTime = Date.now() - startTime;

      // Transform results into insights
      const insights = generateSearchInsights(searchResult, searchParams);

      setSearchState((prev: any) => ({
        ...prev,
        flights: searchResult.flights || [],
        insights: insights,
        automationSuggestions: searchResult.automationSuggestions || [],
        priceForecasts: searchResult.priceForecasts,
        personalizedRecommendations: searchResult.recommendations || [],
        searchHistory: [...prev.searchHistory, searchParams],
        aiProcessingTime: processingTime,
        loading: false
      }));

      // Auto-enable AI mode if user has high automation trust
      if (searchResult.automationSuggestions?.some((s: any) => s.confidence > 0.8)) {
        setAutoModeEnabled(true);
      }

    } catch (error) {
      console.error('AI-enhanced search failed:', error);
      setSearchState((prev: any) => ({ ...prev, loading: false }));
    } finally {
      setAiProcessing(false);
    }
  }, [searchState.sessionId, userId]);

  const handleConversationalSearch = useCallback(async (query: string) => {
    setAiProcessing(true);

    try {
      const response = await unifiedAIOrchestrator.orchestrateAIResponse(
        searchState.sessionId,
        { type: 'natural_language', message: query },
        { userId }
      );

      // If response includes flight suggestions, update state
      if (response.response.flightSuggestions?.length > 0) {
        setSearchState((prev: any) => ({
          ...prev,
          flights: response.response.flightSuggestions,
          insights: transformToInsights(response.response.personalizedInsights || [])
        }));
      }

    } catch (error) {
      console.error('Conversational search failed:', error);
    } finally {
      setAiProcessing(false);
    }
  }, [searchState.sessionId, userId]);

  const handleAutomationSuggestion = useCallback(async (suggestion: any) => {
    if (!enableAutomation) return;

    setAiProcessing(true);

    try {
      // Execute automation suggestion through orchestrator
      const result = await unifiedAIOrchestrator.orchestrateAIResponse(
        searchState.sessionId,
        { 
          type: 'automation_action', 
          action: suggestion.action,
          data: suggestion.data 
        },
        { userId }
      );

      // Update state based on automation result
      if (result.automationOpportunities?.length > 0) {
        setSearchState((prev: any) => ({
          ...prev,
          automationSuggestions: result.automationOpportunities
        }));
      }

    } catch (error) {
      console.error('Automation execution failed:', error);
    } finally {
      setAiProcessing(false);
    }
  }, [searchState.sessionId, userId, enableAutomation]);

  const generateSearchInsights = (
    searchResult: any,
    searchParams: FlightSearchParams
  ): AIInsight[] => {
    const insights: AIInsight[] = [];

    // Price forecast insights
    if (searchResult.priceForecasts) {
      insights.push({
        type: 'price_forecast',
        title: 'Price Prediction',
        content: `Prices expected to ${searchResult.priceForecasts.recommendation === 'BUY_NOW' ? 'rise' : 'fall'} by ${Math.abs(searchResult.priceForecasts.predictedPrices.nextWeek - searchResult.priceForecasts.currentPrice)}% next week`,
        confidence: searchResult.priceForecasts.confidence,
        actionable: true,
        action: {
          label: searchResult.priceForecasts.recommendation === 'BUY_NOW' ? 'Book Now' : 'Set Price Alert',
          handler: () => console.log('Price action')
        },
        icon: ChartBarIcon,
        priority: 'high'
      });
    }

    // Personalized recommendations
    if (searchResult.recommendations?.length > 0) {
      insights.push({
        type: 'personalized_tip',
        title: 'Personalized Recommendation',
        content: `Based on your travel history, you might prefer ${searchResult.recommendations[0].type} options`,
        confidence: 0.8,
        actionable: true,
        action: {
          label: 'Apply Preference',
          handler: () => console.log('Apply preference')
        },
        icon: UserIcon,
        priority: 'medium'
      });
    }

    // Alternative routes
    if (searchResult.alternativeOptions?.length > 0) {
      insights.push({
        type: 'alternative_route',
        title: 'Alternative Options',
        content: `Consider flying via ${searchResult.alternativeOptions[0].suggestion} to save up to $${searchResult.alternativeOptions[0].potentialSavings}`,
        confidence: 0.7,
        actionable: true,
        action: {
          label: 'Explore Alternatives',
          handler: () => console.log('Show alternatives')
        },
        icon: LightBulbIcon,
        priority: 'medium'
      });
    }

    // Automation suggestions
    if (searchResult.automationSuggestions?.confidence > 0.7) {
      insights.push({
        type: 'automation_suggestion',
        title: 'Smart Booking Available',
        content: `AI can complete this booking in ${searchResult.automationSuggestions.timeframe} with ${Math.round(searchResult.automationSuggestions.confidence * 100)}% confidence`,
        confidence: searchResult.automationSuggestions.confidence,
        actionable: true,
        action: {
          label: 'Enable Auto-Booking',
          handler: () => handleAutomationSuggestion(searchResult.automationSuggestions)
        },
        icon: BoltIcon,
        priority: 'high'
      });
    }

    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const transformToInsights = (recommendations: any[]): AIInsight[] => {
    return recommendations.map(rec => ({
      type: 'personalized_tip',
      title: rec.title || 'AI Recommendation',
      content: rec.description || rec.content,
      confidence: rec.confidence || 0.8,
      actionable: rec.actionable || false,
      icon: LightBulbIcon,
      priority: rec.priority || 'medium'
    }));
  };

  const renderModeToggle = () => (
    <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
      <button
        onClick={() => setSearchState((prev: any) => ({ ...prev, mode: 'traditional' }))}
        className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          searchState.mode === 'traditional'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <ClockIcon className="w-4 h-4 mr-2" />
        Traditional Search
      </button>
      
      {enableConversationalMode && (
        <button
          onClick={() => setSearchState((prev: any) => ({ ...prev, mode: 'conversational' }))}
          className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            searchState.mode === 'conversational'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ChatBubbleLeftEllipsisIcon className="w-4 h-4 mr-2" />
          AI Assistant
        </button>
      )}
      
      <button
        onClick={() => setSearchState((prev: any) => ({ ...prev, mode: 'ai_assisted' }))}
        className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          searchState.mode === 'ai_assisted'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <SparklesIcon className="w-4 h-4 mr-2" />
        AI Assisted
      </button>
    </div>
  );

  const renderAIInsights = () => (
    <AnimatePresence>
      {showInsights && searchState.insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <SparklesIcon className="w-5 h-5 mr-2 text-purple-500" />
              AI Insights
            </h3>
            <button
              onClick={() => setShowInsights(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchState.insights.slice(0, 6).map((insight, index) => {
              const IconComponent = insight.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white rounded-lg border p-4 hover:shadow-md transition-shadow ${
                    insight.priority === 'high' ? 'border-orange-200 bg-orange-50' :
                    insight.priority === 'medium' ? 'border-blue-200 bg-blue-50' :
                    'border-gray-200'
                  }`}
                >
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                      insight.priority === 'high' ? 'bg-orange-100' :
                      insight.priority === 'medium' ? 'bg-blue-100' :
                      'bg-gray-100'
                    }`}>
                      <IconComponent className={`w-4 h-4 ${
                        insight.priority === 'high' ? 'text-orange-600' :
                        insight.priority === 'medium' ? 'text-blue-600' :
                        'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{insight.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{insight.content}</p>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="text-xs text-gray-500">
                          {Math.round(insight.confidence * 100)}% confident
                        </div>
                        {insight.actionable && insight.action && (
                          <button
                            onClick={insight.action.handler}
                            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                          >
                            {insight.action.label}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderAIProcessingIndicator = () => (
    <AnimatePresence>
      {aiProcessing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed top-4 right-4 bg-purple-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center"
        >
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
          AI Processing...
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderPerformanceMetrics = () => (
    searchState.aiProcessingTime > 0 && (
      <div className="text-xs text-gray-500 mb-4 flex items-center">
        <SparklesIcon className="w-3 h-3 mr-1" />
        AI processing: {searchState.aiProcessingTime}ms
        {searchState.flights.length > 0 && (
          <span className="ml-4">
            Found {searchState.flights.length} flights with AI enhancement
          </span>
        )}
      </div>
    
  ));

  return (
    <div className={`ai-enhanced-flight-search ${className}`}>
      {renderAIProcessingIndicator()}
      
      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Mode Toggle */}
        {renderModeToggle()}
        
        {/* AI Insights */}
        {renderAIInsights()}
        
        {/* Search Interface */}
        {searchState.mode === 'conversational' ? (
          <ConversationalSearchInterface
            onFlightSelect={onFlightSelect}
            onSearchUpdate={(data: any) => {
              if (data.hasResults) {
                setSearchState((prev: any) => ({
                  ...prev,
                  flights: data.flights || []
                }));
              }
            }}
            userId={userId}
            className="h-96"
          />
        ) : (
          <>
            <FlightSearchForm
              onSearch={handleTraditionalSearch}
              isLoading={searchState.loading}
              className="mb-6"
            />
            
            {/* Performance Metrics */}
            {renderPerformanceMetrics()}
            
            {/* Flight Results */}
            {searchState.flights.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    AI-Enhanced Results ({searchState.flights.length})
                  </h3>
                  {autoModeEnabled && (
                    <div className="flex items-center text-sm text-green-600">
                      <BoltIcon className="w-4 h-4 mr-1" />
                      Auto-booking enabled
                    </div>
                  )}
                </div>
                
                <FlightResultsList
                  offers={searchState.flights}
                  onOfferSelect={onFlightSelect || (() => {})}
                  showAdvancedInsights={true}
                />
              </div>
            )}
          </>
        )}
        
        {/* Automation Panel */}
        {enableAutomation && searchState.automationSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200"
          >
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <BoltIcon className="w-4 h-4 mr-2 text-purple-500" />
              Smart Automation Available
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              AI can help automate parts of your booking process for faster, more efficient travel planning.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setAutoModeEnabled(true)}
                className="text-sm bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600 transition-colors"
              >
                Enable Automation
              </button>
              <button className="text-sm text-gray-500 hover:text-gray-700">
                Learn More
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}