/**
 * 🧳 CENTRAL AMERICA BAGGAGE POLICIES COMPONENT
 * Displays baggage policies for Central American airlines
 * Covers Copa, Avianca, TACA, and regional carriers
 */

'use client';

import React, { useState } from 'react';
import { CENTRAL_AMERICAN_AIRLINES } from '@/lib/data/central-america-travel-experience';

interface CentralAmericaBaggagePoliciesProps {
  airlines?: string[]; // IATA codes
  className?: string;
  compact?: boolean;
}

export default function CentralAmericaBaggagePolicies({ 
  airlines = ['AV', 'CM', 'TA'], 
  className = '',
  compact = false 
}: CentralAmericaBaggagePoliciesProps) {
  const [selectedAirline, setSelectedAirline] = useState<string>(airlines[0]);
  const [activeTab, setActiveTab] = useState<'carry-on' | 'checked' | 'fees'>('carry-on');

  const airlineData = CENTRAL_AMERICAN_AIRLINES[selectedAirline];
  
  if (!airlineData) return null;

  const tabs = [
    { id: 'carry-on', label: 'Carry-On', icon: '🎒' },
    { id: 'checked', label: 'Checked Bags', icon: '🧳' },
    { id: 'fees', label: 'Extra Fees', icon: '💰' }
  ];

  const getAirlineFlag = (airlineCode: string) => {
    const flags: Record<string, string> = {
      'AV': '🇨🇴', // Avianca (Colombian)
      'CM': '🇵🇦', // Copa (Panamanian)
      'TA': '🇸🇻', // TACA (Salvadoran)
      'GU': '🇬🇹'  // Aviategua (Guatemalan)
    };
    return flags[airlineCode] || '🌎';
  };

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
            <div className="text-xs text-green-600">Length x Width x Height (centimeters)</div>
          </div>
          <div>
            <div className="text-sm font-medium text-green-800 mb-2">Weight Limit</div>
            <div className="text-green-700 text-lg font-semibold">{airlineData.baggagePolicy.carryOn.weight}</div>
            <div className="text-xs text-green-600">Maximum weight allowed</div>
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
            <div className="text-sm font-medium text-blue-800 mb-2">Examples</div>
            <div className="text-sm text-blue-700 space-y-1">
              <div>• Small backpack</div>
              <div>• Purse or handbag</div>
              <div>• Laptop bag</div>
              <div>• Camera bag</div>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Travel Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-900 mb-3">🌎 Regional Travel Tips</h4>
        <div className="space-y-2 text-sm text-yellow-700">
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2"></div>
            <span>Central American airlines use metric measurements (cm, kg)</span>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2"></div>
            <span>Pack essentials in carry-on due to potential connection delays</span>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2"></div>
            <span>Consider climate - pack light, breathable clothing</span>
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

      {/* Special Considerations */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h4 className="font-semibold text-orange-900 mb-3">🌎 Regional Considerations</h4>
        <div className="space-y-2 text-sm text-orange-700">
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2"></div>
            <span>Baggage fees are typically lower than US/European carriers</span>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2"></div>
            <span>Weight limits may be strictly enforced at smaller airports</span>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2"></div>
            <span>Consider packing for variable climates (coast vs. mountains)</span>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2"></div>
            <span>Some airports may have limited baggage handling facilities</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderExtraFeesPolicy = () => (
    <div className="space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 className="font-semibold text-red-900 mb-4 flex items-center">
          💰 Additional Fees ({airlineData.currency})
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
                {airlineData.seatSelection.business.price > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-red-700">Business Class</span>
                    <span className="font-semibold">${airlineData.seatSelection.business.price}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-red-200">
              <h5 className="font-medium text-red-900 mb-3">Connectivity</h5>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-red-700">WiFi</span>
                  <span className="font-semibold">{airlineData.amenities.wifi.price}</span>
                </div>
                {airlineData.amenities.wifi.available && (
                  <div className="text-xs text-red-600">
                    {airlineData.amenities.wifi.speed} • {airlineData.amenities.entertainment.type}
                  </div>
                )}
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
                      {airlineData.amenities.food.complimentary.map((item: any, idx: number) => (
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
                      {airlineData.amenities.food.purchase.map((item: any, idx: number) => (
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
              <h5 className="font-medium text-red-900 mb-3">Changes & Cancellations</h5>
              <div className="text-sm text-red-700 space-y-1">
                {selectedAirline === 'CM' ? (
                  <>
                    <div>• Same day changes: $75-100</div>
                    <div>• Standard changes: $150-300</div>
                    <div>• Cancellation fees: $100-200</div>
                    <div>• 24hr free cancellation available</div>
                  </>
                ) : selectedAirline === 'AV' ? (
                  <>
                    <div>• Changes: $100-250 + fare difference</div>
                    <div>• Cancellations: $150-300</div>
                    <div>• LifeMiles members get discounts</div>
                  </>
                ) : (
                  <>
                    <div>• Changes: $50-150 + fare difference</div>
                    <div>• Cancellations: $75-200</div>
                    <div>• Fees vary by route and ticket type</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Comparison */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <h4 className="font-semibold text-indigo-900 mb-3">📊 Regional Airline Comparison</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-indigo-200">
                <th className="text-left p-2 font-medium text-indigo-800">Airline</th>
                <th className="text-left p-2 font-medium text-indigo-800">First Bag</th>
                <th className="text-left p-2 font-medium text-indigo-800">WiFi</th>
                <th className="text-left p-2 font-medium text-indigo-800">Loyalty Program</th>
              </tr>
            </thead>
            <tbody>
              {airlines.map((code: any) => {
                const airline = CENTRAL_AMERICAN_AIRLINES[code];
                if (!airline) return null;
                return (
                  <tr key={code} className="border-b border-indigo-100">
                    <td className="p-2 text-indigo-900 font-medium">
                      {getAirlineFlag(code)} {airline.shortName}
                    </td>
                    <td className="p-2 text-indigo-700">${airline.baggagePolicy.checked.first.price}</td>
                    <td className="p-2 text-indigo-700">{airline.amenities.wifi.price}</td>
                    <td className="p-2 text-indigo-700">
                      {airline.loyaltyProgram?.name || 'None'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">{getAirlineFlag(selectedAirline)}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Central American Baggage Policies</h3>
              <p className="text-sm text-gray-500">Regional airlines and carriers</p>
            </div>
          </div>
        </div>

        {/* Airline Selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {airlines.map((airlineCode: any) => {
            const airline = CENTRAL_AMERICAN_AIRLINES[airlineCode];
            if (!airline) return null;
            
            return (
              <button
                key={airlineCode}
                onClick={() => setSelectedAirline(airlineCode)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedAirline === airlineCode
                    ? 'bg-green-600 text-white'
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
                  ? 'border-green-600 text-green-600'
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

      {/* Regional Travel Tips */}
      <div className="p-6 pt-0">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
          <h5 className="font-semibold text-green-900 mb-2">🌎 Central American Travel Tips</h5>
          <div className="text-sm text-green-800 space-y-1">
            <div>• All measurements in metric system (cm, kg)</div>
            <div>• Pack for tropical climate - lightweight, breathable materials</div>
            <div>• Consider rainy season (May-November) when packing</div>
            <div>• Loyalty programs often offer good value for regional travel</div>
            <div>• Some routes may require connections through Panama City or San José</div>
          </div>
        </div>
      </div>
    </div>
  );
}