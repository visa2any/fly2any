/**
 * 🧳 NORTH AMERICA BAGGAGE POLICIES COMPONENT
 * Displays baggage policies for US, Canadian, and Mexican airlines
 * Handles different currencies and measurement systems
 */

'use client';

import React, { useState } from 'react';
import { 
  NORTH_AMERICA_AIRLINES, 
  CANADIAN_AIRLINES, 
  MEXICAN_AIRLINES 
} from '@/lib/data/north-america-travel-experience';

interface NorthAmericaBaggagePoliciesProps {
  airlines?: string[]; // IATA codes
  country?: 'US' | 'CA' | 'MX' | 'all';
  className?: string;
  compact?: boolean;
}

export default function NorthAmericaBaggagePolicies({ 
  airlines, 
  country = 'all',
  className = '',
  compact = false 
}: NorthAmericaBaggagePoliciesProps) {
  // Filter airlines based on country
  const getAirlinesByCountry = () => {
    switch (country) {
      case 'US':
        return ['AA', 'DL', 'UA', 'WN'];
      case 'CA':
        return ['AC', 'WS'];
      case 'MX':
        return ['AM', 'Y4'];
      default:
        return airlines || ['AA', 'DL', 'AC', 'WS', 'AM', 'Y4'];
    }
  };

  const [selectedAirline, setSelectedAirline] = useState<string>(getAirlinesByCountry()[0]);
  const [activeTab, setActiveTab] = useState<'carry-on' | 'checked' | 'fees'>('carry-on');

  const airlineData = NORTH_AMERICA_AIRLINES[selectedAirline];
  
  if (!airlineData) return null;

  // Determine currency and measurement system
  const getCurrencyInfo = () => {
    if (['AC', 'WS'].includes(selectedAirline)) {
      return { currency: 'CAD', system: 'metric', flag: '🇨🇦' };
    } else if (['AM', 'Y4'].includes(selectedAirline)) {
      return { currency: 'USD/MXN', system: 'metric', flag: '🇲🇽' };
    } else {
      return { currency: 'USD', system: 'imperial', flag: '🇺🇸' };
    }
  };

  const currencyInfo = getCurrencyInfo();

  const tabs = [
    { id: 'carry-on', label: 'Carry-On', icon: '🎒' },
    { id: 'checked', label: 'Checked Bags', icon: '🧳' },
    { id: 'fees', label: 'Extra Fees', icon: '💰' }
  ];

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
              {currencyInfo.system === 'metric' ? 'Length x Width x Height (cm)' : 'Length x Width x Height (inches)'}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-green-800 mb-2">Weight Limit</div>
            <div className="text-green-700 text-lg font-semibold">{airlineData.baggagePolicy.carryOn.weight}</div>
            <div className="text-xs text-green-600">Maximum weight allowed</div>
          </div>
        </div>
        
        {/* Special case for Volaris (no free carry-on) */}
        {selectedAirline === 'Y4' && (
          <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-red-600">⚠️</span>
              <span className="text-sm font-medium text-red-800">Ultra Low Cost Model</span>
            </div>
            <div className="text-sm text-red-700 mt-1">
              Carry-on bags require additional fee. Only personal item is included.
            </div>
          </div>
        )}

        <div className="mt-4">
          <div className="text-sm font-medium text-green-800 mb-2">Restrictions</div>
          <div className="space-y-1">
            {airlineData.baggagePolicy.carryOn.restrictions.map((restriction, idx) => (
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
            <div className="text-sm font-medium text-blue-800 mb-2">Examples</div>
            <div className="text-sm text-blue-700 space-y-1">
              <div>• Small backpack</div>
              <div>• Purse or handbag</div>
              <div>• Laptop bag</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCheckedBagPolicy = () => (
    <div className="space-y-4">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-semibold text-purple-900 mb-4 flex items-center">
          🧳 Checked Bag Fees ({currencyInfo.currency})
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-purple-900">First Bag</span>
                <span className="text-2xl font-bold text-purple-700">
                  {selectedAirline === 'WN' && airlineData.baggagePolicy.checked.first.price === 0 ? 
                    'FREE' : 
                    `$${airlineData.baggagePolicy.checked.first.price}`
                  }
                </span>
              </div>
              <div className="text-sm text-purple-600 space-y-1">
                <div>Up to {airlineData.baggagePolicy.checked.first.weight}</div>
                <div>Up to {airlineData.baggagePolicy.checked.first.size}</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-purple-900">Second Bag</span>
                <span className="text-2xl font-bold text-purple-700">
                  {selectedAirline === 'WN' && airlineData.baggagePolicy.checked.second.price === 0 ? 
                    'FREE' : 
                    `$${airlineData.baggagePolicy.checked.second.price}`
                  }
                </span>
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

      {/* Free Bag Benefits */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="font-semibold text-amber-900 mb-3 flex items-center">
          🎁 Ways to Get Free Checked Bags
        </h4>
        
        {/* Southwest special case */}
        {selectedAirline === 'WN' && (
          <div className="mb-4 p-3 bg-green-100 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✨</span>
              <span className="text-sm font-medium text-green-800">Southwest Special: 2 Free Bags Always!</span>
            </div>
            <div className="text-sm text-green-700 mt-1">
              Southwest includes 2 free checked bags for all passengers, no elite status required.
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-amber-800 mb-2">Elite Status</div>
            <div className="space-y-1">
              {airlineData.loyaltyProgram.tiers.slice(0, 3).map((tier) => (
                <div key={tier} className="flex items-center space-x-2 text-sm text-amber-700">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                  <span>{tier}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-amber-800 mb-2">Credit Cards</div>
            <div className="space-y-1">
              {airlineData.loyaltyProgram.creditCards.map((card) => (
                <div key={card} className="flex items-center space-x-2 text-sm text-amber-700">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                  <span>{card}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderExtraFeesPolicy = () => (
    <div className="space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 className="font-semibold text-red-900 mb-4 flex items-center">
          💰 Additional Fees ({currencyInfo.currency})
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-red-200">
              <h5 className="font-medium text-red-900 mb-3">Seat Selection</h5>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-red-700">Standard Seat</span>
                  <span className="font-semibold">${airlineData.seatSelection.basic.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-700">Preferred Seat</span>
                  <span className="font-semibold">${airlineData.seatSelection.preferred.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-700">Exit Row</span>
                  <span className="font-semibold">${airlineData.seatSelection.exit.price}</span>
                </div>
                {('business' in airlineData.seatSelection) && airlineData.seatSelection.business && airlineData.seatSelection.business.price > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-red-700">Business Class</span>
                    <span className="font-semibold">${airlineData.seatSelection.business.price}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-red-200">
              <h5 className="font-medium text-red-900 mb-3">WiFi & Entertainment</h5>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-red-700">WiFi</span>
                  <span className="font-semibold">{airlineData.amenities.wifi.price}</span>
                </div>
                <div className="text-xs text-red-600 mt-1">
                  {airlineData.amenities.wifi.speed} • {airlineData.amenities.entertainment.type}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-red-200">
              <h5 className="font-medium text-red-900 mb-3">Food & Beverages</h5>
              <div className="space-y-2">
                {airlineData.amenities.food.complimentary.length > 0 && (
                  <>
                    <div className="text-sm text-red-700 mb-2">
                      <span className="font-medium">Complimentary:</span>
                    </div>
                    <div className="text-xs text-red-600 space-y-1">
                      {airlineData.amenities.food.complimentary.map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {airlineData.amenities.food.purchase.length > 0 && (
                  <>
                    <div className="text-sm text-red-700 mt-3 mb-1">
                      <span className="font-medium">For Purchase:</span>
                    </div>
                    <div className="text-xs text-red-600 space-y-1">
                      {airlineData.amenities.food.purchase.map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-red-200">
              <h5 className="font-medium text-red-900 mb-3">Change & Cancel</h5>
              <div className="text-sm text-red-700 space-y-1">
                {selectedAirline === 'WN' ? (
                  <>
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                      <span>No change fees</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                      <span>No cancel fees</span>
                    </div>
                  </>
                ) : selectedAirline === 'Y4' ? (
                  <>
                    <div>• Changes: $25-50 + fare difference</div>
                    <div>• Cancellation: $25-50 fee</div>
                    <div>• 24hr free cancellation</div>
                  </>
                ) : (
                  <>
                    <div>• Same day changes: $75-150</div>
                    <div>• Standard changes: $200-500</div>
                    <div>• Cancellation fees apply</div>
                  </>
                )}
              </div>
            </div>
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
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">{currencyInfo.flag}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">North American Baggage Policies</h3>
              <p className="text-sm text-gray-500">US • Canada • Mexico airlines</p>
            </div>
          </div>
        </div>

        {/* Airline Selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {getAirlinesByCountry().map((airlineCode) => {
            const airline = NORTH_AMERICA_AIRLINES[airlineCode];
            if (!airline) return null;
            
            const countryFlag = ['AC', 'WS'].includes(airlineCode) ? '🇨🇦' : 
                              ['AM', 'Y4'].includes(airlineCode) ? '🇲🇽' : '🇺🇸';
            
            return (
              <button
                key={airlineCode}
                onClick={() => setSelectedAirline(airlineCode)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedAirline === airlineCode
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{countryFlag}</span>
                <span>{airline.shortName}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600'
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
        {activeTab === 'fees' && renderExtraFeesPolicy()}
      </div>

      {/* Regional Tips */}
      <div className="p-6 pt-0">
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-blue-200">
          <h5 className="font-semibold text-blue-900 mb-2">🌎 Regional Travel Tips</h5>
          <div className="text-sm text-blue-800 space-y-1">
            {currencyInfo.system === 'metric' && (
              <div>• Canadian/Mexican airlines use metric measurements (cm, kg)</div>
            )}
            <div>• Check currency - CAD for Canadian carriers, USD/MXN for Mexican</div>
            <div>• Cross-border flights may have different restrictions</div>
            {selectedAirline === 'WS' && <div>• WestJet offers competitive pricing within Canada</div>}
            {selectedAirline === 'AC' && <div>• Air Canada Aeroplan offers excellent North American coverage</div>}
            {selectedAirline === 'Y4' && <div>• Volaris: Pack light for ultra-low-cost travel</div>}
          </div>
        </div>
      </div>
    </div>
  );
}