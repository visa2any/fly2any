/**
 * 🧳 CARIBBEAN BAGGAGE POLICIES COMPONENT
 * Displays baggage policies for Caribbean airlines and routes
 * Covers regional carriers, US airlines serving Caribbean, and inter-island flights
 */

'use client';

import React, { useState } from 'react';
import { CARIBBEAN_AIRLINES } from '@/lib/data/caribbean-travel-experience';

interface CaribbeanBaggagePoliciesProps {
  airlines?: string[]; // IATA codes
  routeType?: 'international' | 'inter-island' | 'all';
  className?: string;
  compact?: boolean;
}

export default function CaribbeanBaggagePolicies({ 
  airlines = ['BW', 'JY', 'B6', 'DL'], 
  routeType = 'all',
  className = '',
  compact = false 
}: CaribbeanBaggagePoliciesProps) {
  const [selectedAirline, setSelectedAirline] = useState<string>(airlines[0]);
  const [activeTab, setActiveTab] = useState<'carry-on' | 'checked' | 'island-tips'>('carry-on');

  const airlineData = CARIBBEAN_AIRLINES[selectedAirline];
  
  if (!airlineData) return null;

  const tabs = [
    { id: 'carry-on', label: 'Carry-On', icon: '🎒' },
    { id: 'checked', label: 'Checked Bags', icon: '🧳' },
    { id: 'island-tips', label: 'Island Tips', icon: '🏝️' }
  ];

  const getAirlineFlag = (airlineCode: string) => {
    const flags: Record<string, string> = {
      'BW': '🇹🇹', // Caribbean Airlines (Trinidad)
      'JY': '🏝️', // Intercaribbean (Turks & Caicos)
      'B6': '🇺🇸', // JetBlue (US)
      'DL': '🇺🇸', // Delta (US)
      'AA': '🇺🇸', // American (US)
      'UA': '🇺🇸'  // United (US)
    };
    return flags[airlineCode] || '🏝️';
  };

  const isUSCarrier = ['B6', 'DL', 'AA', 'UA'].includes(selectedAirline);
  const isRegionalCarrier = ['BW', 'JY'].includes(selectedAirline);

  const renderCarryOnPolicy = () => (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-900 mb-3 flex items-center">
          🎒 Carry-On Allowance
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-green-800 mb-2">Size Limit</div>
            <div className="text-green-700 text-lg font-semibold">{airlineData.baggagePolicy.carryOn.size}</div>
            <div className="text-xs text-green-600">
              {isUSCarrier ? 'US measurements (inches)' : 'Varies by carrier'}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-green-800 mb-2">Weight Limit</div>
            <div className="text-green-700 text-lg font-semibold">{airlineData.baggagePolicy.carryOn.weight}</div>
            <div className="text-xs text-green-600">
              {isUSCarrier ? 'US measurements (lbs)' : 'Check specific requirements'}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-sm font-medium text-green-800 mb-2">Restrictions</div>
          <div className="space-y-1">
            {airlineData.baggagePolicy.carryOn.restrictions.map((restriction: any, idx: number) => (
              <div key={idx} className="flex items-center space-x-2 text-sm text-green-700">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>{restriction}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
          👜 Personal Item
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-blue-800 mb-2">Size Limit</div>
            <div className="text-blue-700 text-lg font-semibold">{airlineData.baggagePolicy.personalItem.size}</div>
            <div className="text-xs text-blue-600">Must fit under seat in front of you</div>
          </div>
          <div>
            <div className="text-sm font-medium text-blue-800 mb-2">Beach Travel Essentials</div>
            <div className="text-sm text-blue-700 space-y-1">
              <div>• Sunscreen (reef-safe)</div>
              <div>• Sunglasses & hat</div>
              <div>• Beach cover-up</div>
              <div>• Waterproof phone case</div>
            </div>
          </div>
        </div>
      </div>

      {/* Special Caribbean Considerations */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-900 mb-3">🏝️ Caribbean Travel Packing Tips</h4>
        <div className="space-y-2 text-sm text-yellow-700">
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2"></div>
            <span>Pack reef-safe sunscreen - some islands ban harmful chemicals</span>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2"></div>
            <span>Bring light rain jacket during hurricane season (June-November)</span>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2"></div>
            <span>Pack insect repellent - mosquitoes active year-round</span>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2"></div>
            <span>Lightweight, breathable fabrics essential for tropical climate</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCheckedBagPolicy = () => (
    <div className="space-y-4">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-semibold text-purple-900 mb-4 flex items-center">
          🧳 Checked Bag Fees ({airlineData.currency})
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-purple-900">First Bag</span>
                <span className="text-2xl font-bold text-purple-700">${airlineData.baggagePolicy.checked.first.price}</span>
              </div>
              <div className="text-sm text-purple-600 space-y-1">
                <div>Up to {airlineData.baggagePolicy.checked.first.weight}</div>
                <div>Up to {airlineData.baggagePolicy.checked.first.size}</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-purple-900">Second Bag</span>
                <span className="text-2xl font-bold text-purple-700">${airlineData.baggagePolicy.checked.second.price}</span>
              </div>
              <div className="text-sm text-purple-600 space-y-1">
                <div>Up to {airlineData.baggagePolicy.checked.second.weight}</div>
                <div>Up to {airlineData.baggagePolicy.checked.second.size}</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-purple-900">Overweight</span>
                <span className="text-2xl font-bold text-red-600">+${airlineData.baggagePolicy.checked.overweight.fee}</span>
              </div>
              <div className="text-sm text-purple-600">
                {airlineData.baggagePolicy.checked.overweight.threshold}
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-purple-900">Oversize</span>
                <span className="text-2xl font-bold text-red-600">+${airlineData.baggagePolicy.checked.oversize.fee}</span>
              </div>
              <div className="text-sm text-purple-600">
                {airlineData.baggagePolicy.checked.oversize.threshold}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loyalty Program Benefits */}
      {airlineData.loyaltyProgram && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-semibold text-amber-900 mb-3 flex items-center">
            🎁 {airlineData.loyaltyProgram.name} Benefits
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-amber-800 mb-2">Elite Status Tiers</div>
              <div className="space-y-1">
                {airlineData.loyaltyProgram.tiers.map((tier: any) => (
                  <div key={tier} className="flex items-center space-x-2 text-sm text-amber-700">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                    <span>{tier}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-amber-800 mb-2">Member Benefits</div>
              <div className="space-y-1">
                {airlineData.loyaltyProgram.benefits.slice(0, 4).map((benefit: any) => (
                  <div key={benefit} className="flex items-center space-x-2 text-sm text-amber-700">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {airlineData.loyaltyProgram.creditCards.length > 0 && (
            <div className="mt-4 pt-4 border-t border-amber-200">
              <div className="text-sm font-medium text-amber-800 mb-2">Credit Cards Available</div>
              <div className="flex flex-wrap gap-2">
                {airlineData.loyaltyProgram.creditCards.map((card: any) => (
                  <span key={card} className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                    {card}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Inter-Island Flight Considerations */}
      {airlineData.operatesInterIsland && (
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
          <h4 className="font-semibold text-cyan-900 mb-3">🏝️ Inter-Island Flight Benefits</h4>
          <div className="space-y-2 text-sm text-cyan-700">
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2"></div>
              <span>Operates flights between multiple Caribbean islands</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2"></div>
              <span>Potentially lower baggage fees for regional routes</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2"></div>
              <span>Convenient for island hopping adventures</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2"></div>
              <span>Check for multi-island package deals</span>
            </div>
          </div>
        </div>
      )}

      {/* Caribbean-Specific Baggage Considerations */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h4 className="font-semibold text-orange-900 mb-3">🌴 Caribbean Baggage Tips</h4>
        <div className="space-y-2 text-sm text-orange-700">
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2"></div>
            <span>Pack beach/water gear in checked bags to avoid carry-on restrictions</span>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2"></div>
            <span>Bring empty water bottles - fill after security for hydration</span>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2"></div>
            <span>Consider packing extra clothes for potential weather delays</span>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2"></div>
            <span>Leave room for souvenirs - duty-free shopping is popular</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIslandTips = () => (
    <div className="space-y-4">
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <h4 className="font-semibold text-indigo-900 mb-4 flex items-center">
          🏝️ Island-Specific Packing Guide
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-indigo-200">
              <h5 className="font-medium text-indigo-900 mb-3">Essential Items</h5>
              <div className="space-y-2 text-sm text-indigo-700">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                  <span>Reef-safe sunscreen (SPF 30+)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                  <span>Wide-brimmed hat & UV sunglasses</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                  <span>Quick-dry swimwear (2-3 sets)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                  <span>Lightweight, breathable clothing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                  <span>Insect repellent (DEET-based)</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-indigo-200">
              <h5 className="font-medium text-indigo-900 mb-3">Weather Protection</h5>
              <div className="space-y-2 text-sm text-indigo-700">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                  <span>Light rain jacket (compact/foldable)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                  <span>Quick-dry shorts & shirts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                  <span>Sandals + water shoes</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-indigo-200">
              <h5 className="font-medium text-indigo-900 mb-3">Electronics & Safety</h5>
              <div className="space-y-2 text-sm text-indigo-700">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                  <span>Waterproof phone case/pouch</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                  <span>Portable charger/power bank</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                  <span>Universal power adapter</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                  <span>First aid kit basics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                  <span>Waterproof document holder</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-indigo-200">
              <h5 className="font-medium text-indigo-900 mb-3">Activities Gear</h5>
              <div className="space-y-2 text-sm text-indigo-700">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                  <span>Snorkel gear (optional - can rent)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                  <span>Beach towel (quick-dry)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                  <span>Waterproof camera/GoPro</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seasonal Packing Advice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-900 mb-3">🌦️ Seasonal Packing Advice</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-3 border border-yellow-200">
            <h5 className="font-medium text-yellow-800 mb-2">☀️ Dry Season (Dec-Apr)</h5>
            <div className="text-xs text-yellow-700 space-y-1">
              <div>• Perfect weather - minimal rain gear needed</div>
              <div>• Pack lighter fabrics and more swimwear</div>
              <div>• Higher sun exposure - extra sun protection</div>
              <div>• Peak season - pack nicer evening wear</div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-yellow-200">
            <h5 className="font-medium text-yellow-800 mb-2">🌤️ Shoulder Season (May, Nov)</h5>
            <div className="text-xs text-yellow-700 space-y-1">
              <div>• Some rain possible - pack light rain gear</div>
              <div>• Comfortable temperatures</div>
              <div>• Fewer crowds - casual clothing fine</div>
              <div>• Good balance of sunny/rainy days</div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-yellow-200">
            <h5 className="font-medium text-yellow-800 mb-2">🌀 Hurricane Season (Jun-Oct)</h5>
            <div className="text-xs text-yellow-700 space-y-1">
              <div>• Pack waterproof rain gear</div>
              <div>• Quick-dry everything essential</div>
              <div>• Extra clothes for potential delays</div>
              <div>• Still hot - prioritize breathable fabrics</div>
            </div>
          </div>
        </div>
      </div>

      {/* Money & Documents */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-900 mb-3">💰 Money & Documents</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-sm font-medium text-green-800 mb-2">What to Bring</h5>
            <div className="space-y-1 text-xs text-green-700">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                <span>USD cash (widely accepted)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                <span>Credit cards (Visa/Mastercard)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                <span>Passport (required for most islands)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                <span>Travel insurance documents</span>
              </div>
            </div>
          </div>
          <div>
            <h5 className="text-sm font-medium text-green-800 mb-2">US Territory Perks</h5>
            <div className="space-y-1 text-xs text-green-700">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                <span>No passport needed (PR, USVI)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                <span>No currency exchange</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                <span>US cell phone plans work</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                <span>TSA PreCheck/Global Entry valid</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Duty-Free Shopping */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-semibold text-purple-900 mb-3">🛍️ Duty-Free Shopping Tips</h4>
        <div className="space-y-2 text-sm text-purple-700">
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2"></div>
            <span>Caribbean is famous for duty-free shopping - leave extra space</span>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2"></div>
            <span>US Virgin Islands: $1,600 duty-free allowance (vs $800 elsewhere)</span>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2"></div>
            <span>Popular items: jewelry, perfume, alcohol, tobacco, watches</span>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2"></div>
            <span>Check customs regulations for your home country</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`bg-white rounded-xl border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">{getAirlineFlag(selectedAirline)}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Caribbean Baggage Policies</h3>
              <p className="text-sm text-gray-500">Island travel and regional carriers</p>
            </div>
          </div>
        </div>

        {/* Airline Selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {airlines.map((airlineCode: any) => {
            const airline = CARIBBEAN_AIRLINES[airlineCode];
            if (!airline) return null;
            
            return (
              <button
                key={airlineCode}
                onClick={() => setSelectedAirline(airlineCode)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedAirline === airlineCode
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{getAirlineFlag(airlineCode)}</span>
                <span>{airline.shortName}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab: any) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-cyan-600 text-cyan-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'carry-on' && renderCarryOnPolicy()}
        {activeTab === 'checked' && renderCheckedBagPolicy()}
        {activeTab === 'island-tips' && renderIslandTips()}
      </div>

      {/* Caribbean Travel Summary */}
      <div className="p-6 pt-0">
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-4 border border-cyan-200">
          <h5 className="font-semibold text-cyan-900 mb-2">🏝️ Caribbean Travel Summary</h5>
          <div className="text-sm text-cyan-800 space-y-1">
            <div>• Pack light, breathable clothing for tropical climate</div>
            <div>• Reef-safe sunscreen essential (some islands ban harmful chemicals)</div>
            <div>• Hurricane season (June-November) requires extra weather preparation</div>
            <div>• US territories offer convenience for American travelers</div>
            <div>• Duty-free shopping opportunities - leave room for souvenirs</div>
          </div>
        </div>
      </div>
    </div>
  );
}