'use client';

/**
 * Explore More Modal Component
 * Shows alternative destinations and similar routes
 */

import React, { useState, useEffect } from 'react';
import { 
  XIcon,
  MapIcon,
  FlightIcon,
  TrendingUpIcon,
  DollarIcon
} from '@/components/Icons';

interface ExploreMoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchData: {
    from: string;
    to: string;
    departure: string;
    return?: string | null;
    adults: number;
    class: string;
  };
  onNewSearch?: (newSearchData: any) => void;
}

interface AlternativeDestination {
  iataCode: string;
  city: string;
  country: string;
  priceFrom: number;
  currency: string;
  popularityScore: number;
  travelTime: string;
  description: string;
  imageUrl?: string;
}

export default function ExploreMoreModal({ 
  isOpen, 
  onClose, 
  searchData,
  onNewSearch 
}: ExploreMoreModalProps) {
  const [activeTab, setActiveTab] = useState<'destinations' | 'routes'>('destinations');
  const [alternatives, setAlternatives] = useState<AlternativeDestination[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAlternatives();
    }
  }, [isOpen, searchData]);

  const loadAlternatives = async () => {
    setIsLoading(true);
    
    // Mock data - in real implementation, fetch from API
    const mockAlternatives: AlternativeDestination[] = [
      {
        iataCode: 'MIA',
        city: 'Miami',
        country: 'United States',
        priceFrom: 850,
        currency: 'USD',
        popularityScore: 95,
        travelTime: '9h 30m',
        description: 'Beautiful beaches and vibrant nightlife',
        imageUrl: '/images/destinations/miami.jpg'
      },
      {
        iataCode: 'LAX',
        city: 'Los Angeles',
        country: 'United States', 
        priceFrom: 920,
        currency: 'USD',
        popularityScore: 92,
        travelTime: '11h 15m',
        description: 'Entertainment capital with perfect weather'
      },
      {
        iataCode: 'JFK',
        city: 'New York',
        country: 'United States',
        priceFrom: 780,
        currency: 'USD',
        popularityScore: 98,
        travelTime: '8h 45m',
        description: 'The city that never sleeps'
      }
    ];

    // Simulate API call
    setTimeout(() => {
      setAlternatives(mockAlternatives);
      setIsLoading(false);
    }, 1000);
  };

  const handleSelectDestination = (destination: AlternativeDestination) => {
    const newSearch = {
      ...searchData,
      to: destination.iataCode
    };
    onNewSearch?.(newSearch);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <MapIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Explore More Destinations</h2>
                <p className="text-white/90">From {searchData.from} • {searchData.departure}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('destinations')}
              className={`px-6 py-4 font-semibold transition-all ${
                activeTab === 'destinations'
                  ? 'border-b-2 border-purple-500 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🌍 Alternative Destinations
            </button>
            <button
              onClick={() => setActiveTab('routes')}
              className={`px-6 py-4 font-semibold transition-all ${
                activeTab === 'routes'
                  ? 'border-b-2 border-purple-500 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ✈️ Alternative Routes
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'destinations' && (
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-600">Finding amazing destinations...</span>
                </div>
              ) : (
                alternatives.map((destination, index) => (
                  <div
                    key={destination.iataCode}
                    className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 hover:border-purple-300"
                    onClick={() => handleSelectDestination(destination)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                          {destination.iataCode}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {destination.city}
                          </h3>
                          <p className="text-gray-600 mb-1">{destination.country}</p>
                          <p className="text-sm text-gray-500">{destination.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          ${destination.priceFrom}
                        </div>
                        <div className="text-sm text-gray-500">
                          {destination.travelTime}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs text-yellow-600">★</span>
                          <span className="text-xs text-gray-500">{destination.popularityScore}% popular</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'routes' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <FlightIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Alternative Routes</h3>
              <p className="text-gray-600 mb-4">Find different ways to reach your destination</p>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <p className="text-sm text-blue-800">
                  🚧 Coming Soon: Multi-stop routes and alternative connections
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              💡 Tip: Flexible dates can reveal even more affordable options
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}