/**
 * 🧳 US BAGGAGE POLICIES COMPONENT
 * Displays detailed US airline baggage policies and fees
 * Helps users make informed decisions and avoid surprise fees
 */

'use client';

import React, { useState } from 'react';
import { US_AIRLINES, USAirlineDetails } from '@/lib/data/us-travel-experience';

interface USBaggagePoliciesProps {
  airlines?: string[]; // IATA codes
  className?: string;
  compact?: boolean;
}

export default function USBaggagePolicies({ 
  airlines = ['AA', 'DL', 'UA', 'WN'], 
  className = '',
  compact = false 
}: USBaggagePoliciesProps) {
  const [selectedAirline, setSelectedAirline] = useState<string>(airlines[0]);
  const [activeTab, setActiveTab] = useState<'carry-on' | 'checked' | 'fees'>('carry-on');

  const airlineData = US_AIRLINES[selectedAirline];
  
  if (!airlineData) return null;

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
            <div className="text-green-700 text-lg font-semibold">{airlineData.baggagePolicy.carryOn.size}"</div>
            <div className="text-xs text-green-600">Length x Width x Height</div>
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
            <div className="text-blue-700 text-lg font-semibold">{airlineData.baggagePolicy.personalItem.size}"</div>
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
          🧳 Checked Bag Fees
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

      {/* Free Bag Benefits */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="font-semibold text-amber-900 mb-3 flex items-center">
          🎁 Ways to Get Free Checked Bags
        </h4>
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
          💰 Additional Fees to Know
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
              <span className="text-white text-sm">🧳</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">US Airline Baggage Policies</h3>
              <p className="text-sm text-gray-500">Compare fees and restrictions</p>
            </div>
          </div>
        </div>

        {/* Airline Selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {airlines.map((airlineCode) => {
            const airline = US_AIRLINES[airlineCode];
            if (!airline) return null;
            
            return (
              <button
                key={airlineCode}
                onClick={() => setSelectedAirline(airlineCode)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedAirline === airlineCode
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {airline.shortName}
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

      {/* Money Saving Tips */}
      <div className="p-6 pt-0">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
          <h5 className="font-semibold text-green-900 mb-2">💡 Money-Saving Tips</h5>
          <div className="text-sm text-green-800 space-y-1">
            <div>• Pack light to avoid checked bag fees</div>
            <div>• Consider airline credit cards for free bags</div>
            <div>• Check bag fees online in advance for discounts</div>
            {selectedAirline === 'WN' && <div>• Southwest offers 2 free checked bags!</div>}
            <div>• Elite status can waive most baggage fees</div>
          </div>
        </div>
      </div>
    </div>
  );
}