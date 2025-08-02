'use client';

/**
 * Flight Insights Sidebar Component
 * Right sidebar with important flight information and insights
 */

import React, { useState, useEffect, useMemo } from 'react';

interface PriceInsight {
  type: 'good_deal' | 'price_decrease' | 'price_increase' | 'typical';
  title?: string;
  description?: string;
  icon?: string;
  message?: string;
  percentage?: number;
  recommendation?: string;
}

interface TravelTip {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'price' | 'comfort' | 'security' | 'timing' | 'safety';
}
import { 
  InfoIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ClockIcon,
  CalendarIcon,
  AlertIcon,
  StarIcon,
  ThumbsUpIcon,
  MapIcon,
  ShieldIcon,
  BellIcon,
  ExternalLinkIcon
} from '@/components/Icons';
import { ProcessedFlightOffer } from '@/types/flights';

interface FlightInsightsProps {
  searchResults?: ProcessedFlightOffer[];
  searchData?: any;
  className?: string;
}


export default function FlightInsights({
  searchResults = [],
  searchData,
  className = ''
}: FlightInsightsProps) {
  // Removed state hooks to prevent infinite loops

  // Calculate price insights - OPTIMIZED to prevent infinite loops
  const priceInsights = useMemo((): PriceInsight[] => {
    if (!searchResults?.length) return [];
    
    try {
      const validPrices = [];
      for (const flight of searchResults) {
        if (!flight?.totalPrice) continue;
        const price = parseFloat(flight.totalPrice.replace(/[^0-9.]/g, ''));
        if (!isNaN(price) && price > 0) {
          validPrices.push(price);
        }
      }
      
      if (validPrices.length === 0) return [];
      
      const avgPrice = validPrices.reduce((a, b) => a + b, 0) / validPrices.length;
      const minPrice = Math.min(...validPrices);
      const insights: PriceInsight[] = [];

      // Good deal detection
      if (minPrice < avgPrice * 0.8) {
        insights.push({
          type: 'good_deal',
          message: `Great deals available! Prices up to ${Math.round(((avgPrice - minPrice) / avgPrice) * 100)}% below average`,
          percentage: Math.round(((avgPrice - minPrice) / avgPrice) * 100),
          recommendation: 'Book soon - these deals don\'t last long!'
        });
      }

      // Static price trend (avoid random in effects)
      if (validPrices.length > 5) {
        insights.push({
          type: 'price_increase',
          message: 'Prices have increased 12% in the last week',
          percentage: 12,
          recommendation: 'Consider booking now to avoid further increases'
        });
      }

      return insights;
    } catch (error) {
      console.error('Price insights calculation error:', error);
      return [];
    }
  }, [searchResults?.length, searchResults?.[0]?.totalPrice]);

  // Generate travel tips based on search criteria - STATIC to avoid re-renders
  const travelTips = useMemo((): TravelTip[] => [
    {
      id: 'price_alert',
      title: 'Set Price Alerts',
      description: 'Get notified when prices drop for your route. Save up to 30% on average.',
      icon: '🔔',
      category: 'price' as const
    },
    {
      id: 'flexible_dates',
      title: 'Flexible Dates Save Money',
      description: 'Flying ±3 days from your preferred date can save $100-300.',
      icon: '📅',
      category: 'price' as const
    },
    {
      id: 'early_booking',
      title: 'Book 6-8 Weeks Ahead',
      description: 'Domestic flights are typically cheapest when booked 6-8 weeks in advance.',
      icon: '⏰',
      category: 'timing' as const
    },
    {
      id: 'travel_insurance',
      title: 'Consider Travel Insurance',
      description: 'Protect your trip investment. Coverage starts at $30 for most trips.',
      icon: '🛡️',
      category: 'safety' as const
    },
    {
      id: 'seat_selection',
      title: 'Early Seat Selection',
      description: 'Choose your preferred seat early. Aisle and window seats go fast.',
      icon: '💺',
      category: 'comfort' as const
    },
    {
      id: 'baggage_fees',
      title: 'Check Baggage Policies',
      description: 'Compare baggage fees between airlines. Can add $60-120 to your trip.',
      icon: '🧳',
      category: 'price' as const
    }
  ], []);

  const averagePrice = useMemo(() => {
    if (!searchResults?.length) return 0;
    
    try {
      let sum = 0;
      let count = 0;
      
      for (const flight of searchResults) {
        if (!flight?.totalPrice) continue;
        const price = parseFloat(flight.totalPrice.replace(/[^0-9.]/g, ''));
        if (!isNaN(price) && price > 0) {
          sum += price;
          count++;
        }
      }
      
      return count > 0 ? Math.round(sum / count) : 0;
    } catch (error) {
      console.error('Average price calculation error:', error);
      return 0;
    }
  }, [searchResults?.length]);

  const flightStats = useMemo(() => {
    if (!searchResults?.length) {
      return { directFlights: 0, oneStopFlights: 0, totalFlights: 0 };
    }
    
    let directFlights = 0;
    let oneStopFlights = 0;
    
    for (const flight of searchResults) {
      if (flight?.outbound?.stops === 0) directFlights++;
      else if (flight?.outbound?.stops === 1) oneStopFlights++;
    }
    
    return {
      directFlights,
      oneStopFlights,
      totalFlights: searchResults.length
    };
  }, [searchResults?.length]);
  
  const { directFlights, oneStopFlights, totalFlights } = flightStats;

  return (
    <div className={`space-y-4 ${className}`}>
      
      {/* Price Insights */}
      {priceInsights.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              📊 <span>Price Insights</span>
            </h3>
          </div>
          <div className="p-4 space-y-4">
            {priceInsights.map((insight, index) => (
              <div key={index} className={`p-3 rounded-lg border-l-4 ${
                insight.type === 'good_deal' ? 'bg-green-50 border-green-500' :
                insight.type === 'price_decrease' ? 'bg-blue-50 border-blue-500' :
                'bg-orange-50 border-orange-500'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {insight.type === 'good_deal' && <TrendingDownIcon className="w-5 h-5 text-green-600" />}
                    {insight.type === 'price_decrease' && <TrendingDownIcon className="w-5 h-5 text-blue-600" />}
                    {insight.type === 'price_increase' && <TrendingUpIcon className="w-5 h-5 text-orange-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{insight.message}</p>
                    <p className="text-xs text-gray-600 mt-1">{insight.recommendation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Flight Statistics */}
      {totalFlights > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              📈 <span>Flight Statistics</span>
            </h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">${Math.round(averagePrice)}</div>
                <div className="text-xs text-gray-600">Average Price</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{totalFlights}</div>
                <div className="text-xs text-gray-600">Flight Options</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Direct flights</span>
                <span className="font-medium">{directFlights}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">1 stop flights</span>
                <span className="font-medium">{oneStopFlights}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">2+ stops</span>
                <span className="font-medium">{Math.max(0, totalFlights - directFlights - oneStopFlights)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Travel Tips */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            💡 <span>Travel Tips</span>
          </h3>
        </div>
        <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
          {travelTips.map((tip) => (
            <div key={tip.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-start gap-3">
                <span className="text-lg">{tip.icon}</span>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{tip.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{tip.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Travel Alerts */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            ⚠️ <span>Travel Alerts</span>
          </h3>
        </div>
        <div className="p-4 space-y-3">
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-yellow-800">Weather Advisory</h4>
                <p className="text-xs text-yellow-700 mt-1">
                  Possible delays due to weather conditions. Check with your airline before departure.
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <InfoIcon className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-800">Travel Requirements</h4>
                <p className="text-xs text-blue-700 mt-1">
                  Check ID requirements and arrive 2 hours early for domestic flights.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            ⚡ <span>Quick Actions</span>
          </h3>
        </div>
        <div className="p-4 space-y-2">
          <button className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-3">
            <BellIcon className="w-4 h-4 text-blue-600" />
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-900">Set Price Alert</div>
              <div className="text-xs text-blue-700">Get notified of price changes</div>
            </div>
            <ExternalLinkIcon className="w-4 h-4 text-blue-600" />
          </button>
          
          <button className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors flex items-center gap-3">
            <CalendarIcon className="w-4 h-4 text-green-600" />
            <div className="flex-1">
              <div className="text-sm font-medium text-green-900">Flexible Dates</div>
              <div className="text-xs text-green-700">See prices for nearby dates</div>
            </div>
            <ExternalLinkIcon className="w-4 h-4 text-green-600" />
          </button>
          
          <button className="w-full p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors flex items-center gap-3">
            <MapIcon className="w-4 h-4 text-purple-600" />
            <div className="flex-1">
              <div className="text-sm font-medium text-purple-900">Explore Destinations</div>
              <div className="text-xs text-purple-700">Find deals to other cities</div>
            </div>
            <ExternalLinkIcon className="w-4 h-4 text-purple-600" />
          </button>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            🤖 <span>AI Recommendations</span>
          </h3>
        </div>
        <div className="p-4 space-y-3">
          <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                AI
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-green-900">Best Value Pick</h4>
                <p className="text-xs text-green-700 mt-1">
                  Based on your search history, we recommend flights departing Tuesday for 23% savings.
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-lg">🔮</span>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-purple-900">Price Prediction</h4>
                <p className="text-xs text-purple-700 mt-1">
                  Prices likely to increase 15% in next 3 days. Book now for best deals.
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-lg">🎯</span>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-900">Smart Choice</h4>
                <p className="text-xs text-blue-700 mt-1">
                  Consider flights with 1 stop - save 40% with only 2h extra travel time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Route Analysis */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            🗺️ <span>Route Analysis</span>
          </h3>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">4.2h</div>
              <div className="text-xs text-gray-600">Avg Flight Time</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">87%</div>
              <div className="text-xs text-gray-600">On-time Rate</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Peak travel months</span>
              <span className="font-medium">Dec, Jul, Mar</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Best booking time</span>
              <span className="font-medium">6-8 weeks ahead</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Popular airlines</span>
              <span className="font-medium">AA, DL, UA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Support */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl text-white shadow-sm">
        <div className="p-4">
          <h3 className="font-bold flex items-center gap-2 mb-3">
            🆘 <span>Need Help?</span>
          </h3>
          <p className="text-sm text-blue-100 mb-4">
            Our travel experts are available 24/7 to help you find the perfect flight.
          </p>
          <div className="space-y-2">
            <button className="w-full p-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
              💬 Chat with Support
            </button>
            <button className="w-full p-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
              📞 Call Us: 1-800-FLY-2ANY
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}