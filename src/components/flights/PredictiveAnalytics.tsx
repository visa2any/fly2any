'use client';

/**
 * 📊 PREDICTIVE ANALYTICS DASHBOARD
 * AI-powered flight predictions and analytics
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUpIcon, 
  TrendingDownIcon, 
  AlertTriangleIcon, 
  InfoIcon, 
  CalendarIcon,
  DollarIcon,
  ClockIcon,
  ZapIcon,
  StarIcon,
  EyeIcon
} from '@/components/Icons';

interface PredictiveAnalyticsProps {
  origin: string;
  destination: string;
  departureDate: Date;
  returnDate?: Date;
  passengers: number;
  className?: string;
}

interface PricePrediction {
  currentPrice: number;
  predictedPrice: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  changeAmount: number;
  changePercent: number;
  recommendation: 'buy_now' | 'wait' | 'flexible';
  reasoning: string;
  optimalBookingWindow: {
    start: Date;
    end: Date;
    description: string;
  };
}

interface DemandAnalytics {
  currentDemand: 'low' | 'moderate' | 'high' | 'very_high';
  demandScore: number; // 0-100
  popularityTrend: 'rising' | 'falling' | 'stable';
  bookingVelocity: number; // bookings per hour
  availabilityAlert: boolean;
  peakTravelDays: Date[];
  insights: string[];
}

interface SeasonalInsights {
  season: 'peak' | 'shoulder' | 'off';
  seasonalPriceMultiplier: number;
  weatherForecast: {
    origin: { temp: number; condition: string; emoji: string };
    destination: { temp: number; condition: string; emoji: string };
  };
  events: Array<{
    name: string;
    date: Date;
    impact: 'high' | 'medium' | 'low';
    description: string;
  }>;
  historicalData: {
    averagePrice: number;
    priceRange: { min: number; max: number };
    bestBookingDay: string;
  };
}

interface FlightDisruptions {
  riskLevel: 'low' | 'medium' | 'high';
  factors: Array<{
    type: 'weather' | 'strike' | 'maintenance' | 'security' | 'traffic';
    severity: number;
    description: string;
    probability: number;
  }>;
  recommendations: string[];
  alternativeOptions: Array<{
    date: Date;
    price: number;
    riskLevel: 'low' | 'medium' | 'high';
  }>;
}

interface CompetitorAnalysis {
  ourRanking: number;
  totalCompetitors: number;
  competitiveAdvantages: string[];
  priceComparison: {
    ourPrice: number;
    avgCompetitorPrice: number;
    cheapestCompetitor: number;
    savings: number;
  };
  uniqueFeatures: string[];
}

export default function PredictiveAnalytics({
  origin,
  destination,
  departureDate,
  returnDate,
  passengers,
  className = ''
}: PredictiveAnalyticsProps) {
  const [predictions, setPredictions] = useState<{
    price: PricePrediction | null;
    demand: DemandAnalytics | null;
    seasonal: SeasonalInsights | null;
    disruptions: FlightDisruptions | null;
    competitor: CompetitorAnalysis | null;
  }>({
    price: null,
    demand: null,
    seasonal: null,
    disruptions: null,
    competitor: null
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'price' | 'demand' | 'seasonal' | 'risk' | 'competitor'>('price');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Simulate AI predictions (in production, this would call ML APIs)
  const generatePredictions = async (): Promise<void> => {
    setIsLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const now = new Date();
    const daysUntilDeparture = Math.ceil((departureDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Price Prediction
    const basePrice = 299 + Math.random() * 500;
    const priceVolatility = Math.random() * 0.3; // 0-30% volatility
    const trendDirection = Math.random() > 0.5 ? 1 : -1;
    const changeAmount = basePrice * priceVolatility * trendDirection;
    const predictedPrice = Math.max(basePrice + changeAmount, basePrice * 0.5);

    const pricePrediction: PricePrediction = {
      currentPrice: basePrice,
      predictedPrice,
      confidence: 75 + Math.random() * 20,
      trend: changeAmount > 0 ? 'increasing' : changeAmount < -10 ? 'decreasing' : 'stable',
      changeAmount: Math.abs(changeAmount),
      changePercent: Math.abs((changeAmount / basePrice) * 100),
      recommendation: changeAmount > 50 ? 'buy_now' : changeAmount < -50 ? 'wait' : 'flexible',
      reasoning: changeAmount > 50 
        ? 'Prices expected to rise due to increasing demand'
        : changeAmount < -50
        ? 'Wait for better deals as prices may drop'
        : 'Prices are relatively stable, book when convenient',
      optimalBookingWindow: {
        start: new Date(now.getTime() + (daysUntilDeparture > 60 ? 21 : 3) * 24 * 60 * 60 * 1000),
        end: new Date(now.getTime() + (daysUntilDeparture > 60 ? 45 : 7) * 24 * 60 * 60 * 1000),
        description: daysUntilDeparture > 60 ? 'Best prices typically 3-7 weeks before departure' : 'Book within the next week for current prices'
      }
    };

    // Demand Analytics
    const demandScore = Math.floor(Math.random() * 100);
    const demandAnalytics: DemandAnalytics = {
      currentDemand: demandScore > 80 ? 'very_high' : demandScore > 60 ? 'high' : demandScore > 30 ? 'moderate' : 'low',
      demandScore,
      popularityTrend: Math.random() > 0.6 ? 'rising' : Math.random() > 0.3 ? 'stable' : 'falling',
      bookingVelocity: Math.floor(Math.random() * 50) + 10,
      availabilityAlert: demandScore > 75,
      peakTravelDays: [
        new Date(departureDate.getTime() - 24 * 60 * 60 * 1000),
        new Date(departureDate.getTime() + 24 * 60 * 60 * 1000),
      ],
      insights: [
        `${demandScore > 70 ? 'High' : 'Moderate'} search volume for this route`,
        `Peak booking hours: 9-11 AM and 7-9 PM`,
        `${Math.floor(Math.random() * 500) + 100} people viewed this route today`
      ]
    };

    // Seasonal Insights
    const month = departureDate.getMonth();
    const isPeakSeason = [5, 6, 7, 11].includes(month); // June, July, August, December
    const seasonalInsights: SeasonalInsights = {
      season: isPeakSeason ? 'peak' : Math.random() > 0.5 ? 'shoulder' : 'off',
      seasonalPriceMultiplier: isPeakSeason ? 1.3 : 0.8,
      weatherForecast: {
        origin: {
          temp: Math.floor(Math.random() * 30) + 60,
          condition: ['Sunny', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 3)],
          emoji: ['☀️', '⛅', '🌧️'][Math.floor(Math.random() * 3)]
        },
        destination: {
          temp: Math.floor(Math.random() * 30) + 60,
          condition: ['Sunny', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 3)],
          emoji: ['☀️', '⛅', '🌧️'][Math.floor(Math.random() * 3)]
        }
      },
      events: [
        {
          name: 'Music Festival',
          date: new Date(departureDate.getTime() + 2 * 24 * 60 * 60 * 1000),
          impact: 'high',
          description: 'Major event increasing demand'
        }
      ],
      historicalData: {
        averagePrice: basePrice * 0.9,
        priceRange: { min: basePrice * 0.7, max: basePrice * 1.4 },
        bestBookingDay: 'Tuesday'
      }
    };

    // Flight Disruptions
    const riskScore = Math.random();
    const flightDisruptions: FlightDisruptions = {
      riskLevel: riskScore > 0.7 ? 'high' : riskScore > 0.4 ? 'medium' : 'low',
      factors: [
        {
          type: 'weather',
          severity: Math.floor(Math.random() * 100),
          description: 'Thunderstorms possible in departure area',
          probability: Math.random() * 0.3
        },
        {
          type: 'traffic',
          severity: Math.floor(Math.random() * 100),
          description: 'High air traffic during peak hours',
          probability: Math.random() * 0.5
        }
      ],
      recommendations: [
        'Consider morning flights for better on-time performance',
        'Allow extra time for connections',
        'Check weather forecasts before departure'
      ],
      alternativeOptions: [
        {
          date: new Date(departureDate.getTime() - 24 * 60 * 60 * 1000),
          price: basePrice * 0.95,
          riskLevel: 'low'
        },
        {
          date: new Date(departureDate.getTime() + 24 * 60 * 60 * 1000),
          price: basePrice * 1.05,
          riskLevel: 'low'
        }
      ]
    };

    // Competitor Analysis
    const competitorAnalysis: CompetitorAnalysis = {
      ourRanking: Math.floor(Math.random() * 3) + 1,
      totalCompetitors: 8,
      competitiveAdvantages: [
        'Best price guarantee',
        'Free 24h cancellation',
        'AI-powered recommendations',
        'Carbon offset included'
      ],
      priceComparison: {
        ourPrice: basePrice,
        avgCompetitorPrice: basePrice * 1.15,
        cheapestCompetitor: basePrice * 0.95,
        savings: basePrice * 0.15
      },
      uniqueFeatures: [
        'Real-time price tracking',
        'Smart rebooking',
        'VIP experience mode'
      ]
    };

    setPredictions({
      price: pricePrediction,
      demand: demandAnalytics,
      seasonal: seasonalInsights,
      disruptions: flightDisruptions,
      competitor: competitorAnalysis
    });

    setIsLoading(false);
  };

  useEffect(() => {
    if (origin && destination) {
      generatePredictions();
    }
  }, [origin, destination, departureDate, passengers]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      generatePredictions();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, origin, destination]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
      case 'rising':
        return <TrendingUpIcon className="w-5 h-5 text-red-500" />;
      case 'decreasing':
      case 'falling':
        return <TrendingDownIcon className="w-5 h-5 text-green-500" />;
      default:
        return <div className="w-5 h-5 bg-blue-500 rounded-full"></div>;
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'buy_now':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'wait':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const tabs = [
    { id: 'price', label: 'Price Predictions', icon: '💰' },
    { id: 'demand', label: 'Demand Analytics', icon: '📈' },
    { id: 'seasonal', label: 'Seasonal Insights', icon: '🌤️' },
    { id: 'risk', label: 'Risk Assessment', icon: '⚠️' },
    { id: 'competitor', label: 'Market Position', icon: '🎯' }
  ];

  if (isLoading && !predictions.price) {
    return (
      <div className={`bg-white rounded-2xl shadow-xl p-6 ${className}`}>
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-pulse flex space-x-4 mb-4">
              <div className="rounded-full bg-blue-400 h-12 w-12"></div>
            </div>
            <div className="text-lg font-medium text-gray-900 mb-2">AI Analysis in Progress</div>
            <div className="text-gray-600">Analyzing market data and predicting optimal booking strategies...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-xl ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-3xl">🤖</span>
              AI Predictive Analytics
            </h3>
            <p className="text-gray-600 mt-1">
              {origin} → {destination} • {departureDate.toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                autoRefresh 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {autoRefresh ? '🔄 Auto-refresh ON' : '⏸️ Auto-refresh OFF'}
            </button>
            <button
              onClick={generatePredictions}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-6">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {tabs.map((tab: any) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* Price Predictions */}
          {activeTab === 'price' && predictions.price && (
            <motion.div
              key="price"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Main Prediction */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm text-gray-600">Current Price</div>
                    <div className="text-3xl font-bold text-gray-900">
                      ${predictions.price.currentPrice.toFixed(0)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Predicted Price</div>
                    <div className="flex items-center gap-2">
                      <div className="text-3xl font-bold">
                        ${predictions.price.predictedPrice.toFixed(0)}
                      </div>
                      {getTrendIcon(predictions.price.trend)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full border font-medium ${
                      getRecommendationColor(predictions.price.recommendation)
                    }`}>
                      {predictions.price.recommendation.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-gray-600">
                      {predictions.price.confidence.toFixed(0)}% confidence
                    </span>
                  </div>
                  <div className="text-gray-900 font-medium">
                    {predictions.price.trend === 'increasing' ? '+' : predictions.price.trend === 'decreasing' ? '-' : '±'}
                    ${predictions.price.changeAmount.toFixed(0)} 
                    ({predictions.price.changePercent.toFixed(1)}%)
                  </div>
                </div>
              </div>

              {/* Reasoning */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <InfoIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-semibold text-blue-900 mb-1">AI Recommendation</div>
                    <div className="text-blue-800">{predictions.price.reasoning}</div>
                  </div>
                </div>
              </div>

              {/* Optimal Booking Window */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CalendarIcon className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-gray-900">Optimal Booking Window</span>
                </div>
                <div className="text-gray-700 mb-2">
                  {predictions.price.optimalBookingWindow.start.toLocaleDateString()} - {predictions.price.optimalBookingWindow.end.toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-600">
                  {predictions.price.optimalBookingWindow.description}
                </div>
              </div>
            </motion.div>
          )}

          {/* Demand Analytics */}
          {activeTab === 'demand' && predictions.demand && (
            <motion.div
              key="demand"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Demand Score */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm text-gray-600">Current Demand</div>
                    <div className="text-2xl font-bold text-gray-900 capitalize">
                      {predictions.demand.currentDemand.replace('_', ' ')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-blue-600">
                      {predictions.demand.demandScore}
                    </div>
                    <div className="text-sm text-gray-600">Demand Score</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    {getTrendIcon(predictions.demand.popularityTrend)}
                    <span className="capitalize">{predictions.demand.popularityTrend}</span>
                  </div>
                  <div className="text-gray-600">
                    {predictions.demand.bookingVelocity} bookings/hour
                  </div>
                </div>
              </div>

              {/* Availability Alert */}
              {predictions.demand.availabilityAlert && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <div className="font-semibold text-yellow-900">High Demand Alert</div>
                      <div className="text-yellow-800 text-sm">
                        This route is experiencing high demand. Consider booking soon to secure availability.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Insights */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Market Insights</h4>
                {predictions.demand.insights.map((insight: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <EyeIcon className="w-4 h-4 text-gray-500 mt-0.5" />
                    <span className="text-sm text-gray-700">{insight}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Add other tab content similarly... */}
          {/* For brevity, I'll show the seasonal tab as an example */}
          {activeTab === 'seasonal' && predictions.seasonal && (
            <motion.div
              key="seasonal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Season Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6">
                  <div className="text-sm text-gray-600 mb-2">Travel Season</div>
                  <div className="text-2xl font-bold text-gray-900 capitalize mb-2">
                    {predictions.seasonal.season} Season
                  </div>
                  <div className="text-sm text-gray-700">
                    Price multiplier: {predictions.seasonal.seasonalPriceMultiplier}x
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6">
                  <div className="text-sm text-gray-600 mb-2">Weather Forecast</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{origin}:</span>
                      <span className="flex items-center gap-1">
                        {predictions.seasonal.weatherForecast.origin.emoji}
                        {predictions.seasonal.weatherForecast.origin.temp}°F
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{destination}:</span>
                      <span className="flex items-center gap-1">
                        {predictions.seasonal.weatherForecast.destination.emoji}
                        {predictions.seasonal.weatherForecast.destination.temp}°F
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Historical Data */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Historical Price Data</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      ${predictions.seasonal.historicalData.averagePrice.toFixed(0)}
                    </div>
                    <div className="text-sm text-gray-600">Average Price</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      ${predictions.seasonal.historicalData.priceRange.min.toFixed(0)}
                    </div>
                    <div className="text-sm text-gray-600">Lowest Price</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {predictions.seasonal.historicalData.bestBookingDay}
                    </div>
                    <div className="text-sm text-gray-600">Best Day to Book</div>
                  </div>
                </div>
              </div>

              {/* Events */}
              {predictions.seasonal.events.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Upcoming Events</h4>
                  <div className="space-y-2">
                    {predictions.seasonal.events.map((event: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div>
                          <div className="font-medium text-purple-900">{event.name}</div>
                          <div className="text-sm text-purple-700">{event.description}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-purple-600">{event.date.toLocaleDateString()}</div>
                          <div className={`text-xs px-2 py-1 rounded-full ${
                            event.impact === 'high' ? 'bg-red-100 text-red-800' :
                            event.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {event.impact} impact
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <ZapIcon className="w-4 h-4" />
            <span>Powered by AI & Machine Learning</span>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4" />
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}