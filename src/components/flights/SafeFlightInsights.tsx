'use client';

/**
 * Safe Flight Insights Component
 * Optimized version with memory-safe calculations
 */

import React, { useMemo } from 'react';
import { ProcessedFlightOffer } from '@/types/flights';

interface SafeFlightInsightsProps {
  searchResults?: ProcessedFlightOffer[];
  searchData?: any;
  className?: string;
}

export default function SafeFlightInsights({
  searchResults = [],
  searchData,
  className = ''
}: SafeFlightInsightsProps) {
  
  // Safe calculations with proper memoization
  const safeStats = useMemo(() => {
    if (!searchResults?.length) {
      return {
        averagePrice: 0,
        totalFlights: 0,
        directFlights: 0,
        oneStopFlights: 0,
        multiStopFlights: 0,
        validPrices: []
      };
    }

    try {
      const validPrices = [];
      let directFlights = 0;
      let oneStopFlights = 0;
      
      for (const flight of searchResults) {
        // Price calculation
        if (flight?.totalPrice) {
          const price = parseFloat(flight.totalPrice.replace(/[^0-9.]/g, ''));
          if (!isNaN(price) && price > 0) {
            validPrices.push(price);
          }
        }
        
        // Flight stops calculation
        const stops = flight?.outbound?.stops;
        if (stops === 0) directFlights++;
        else if (stops === 1) oneStopFlights++;
      }

      const averagePrice = validPrices.length > 0 
        ? Math.round(validPrices.reduce((sum: any, price: any) => sum + price, 0) / validPrices.length)
        : 0;
      
      const multiStopFlights = Math.max(0, searchResults.length - directFlights - oneStopFlights);

      return {
        averagePrice,
        totalFlights: searchResults.length,
        directFlights,
        oneStopFlights,
        multiStopFlights,
        validPrices
      };
    } catch (error) {
      console.error('Safe stats calculation error:', error);
      return {
        averagePrice: 0,
        totalFlights: 0,
        directFlights: 0,
        oneStopFlights: 0,
        multiStopFlights: 0,
        validPrices: []
      };
    }
  }, [searchResults?.length]);

  const { averagePrice, totalFlights, directFlights, oneStopFlights, multiStopFlights } = safeStats;

  // Safe insights calculation
  const insights = useMemo(() => {
    if (!safeStats.validPrices.length) return [];
    
    try {
      const insights = [];
      const minPrice = Math.min(...safeStats.validPrices);
      
      if (minPrice < averagePrice * 0.8) {
        insights.push({
          type: 'good_deal',
          message: `Great deals available! Prices up to ${Math.round(((averagePrice - minPrice) / averagePrice) * 100)}% below average`,
          recommendation: 'Book soon - these deals don\'t last long!'
        });
      }

      return insights;
    } catch (error) {
      console.error('Insights calculation error:', error);
      return [];
    }
  }, [averagePrice, safeStats.validPrices.length]);

  if (totalFlights === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center">
          <div className="text-gray-400 text-4xl mb-2">📊</div>
          <p className="text-gray-600 text-sm">No flight data available for insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      
      {/* Flight Statistics */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            📈 <span>Flight Statistics</span>
          </h3>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">${averagePrice}</div>
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
              <span className="font-medium">{multiStopFlights}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Price Insights */}
      {insights.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              📊 <span>Price Insights</span>
            </h3>
          </div>
          <div className="p-4 space-y-4">
            {insights.map((insight: { type: string; message: string; recommendation: string }, index: number) => (
              <div key={index} className="p-3 rounded-lg border-l-4 bg-green-50 border-green-500">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <span className="text-green-600">📉</span>
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

      {/* Travel Tips */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            💡 <span>Travel Tips</span>
          </h3>
        </div>
        <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-lg">🔔</span>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">Set Price Alerts</h4>
                <p className="text-xs text-gray-600 mt-1">Get notified when prices drop for your route.</p>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-lg">📅</span>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">Flexible Dates Save Money</h4>
                <p className="text-xs text-gray-600 mt-1">Flying ±3 days from preferred date can save $100-300.</p>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-lg">🛡️</span>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">Consider Travel Insurance</h4>
                <p className="text-xs text-gray-600 mt-1">Protect your trip investment from unexpected changes.</p>
              </div>
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