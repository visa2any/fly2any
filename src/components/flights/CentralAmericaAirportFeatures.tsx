/**
 * 🌎 CENTRAL AMERICA AIRPORT FEATURES COMPONENT  
 * Displays Central American travel features including visa requirements, airlines, and regional info
 * Covers Guatemala, Belize, El Salvador, Honduras, Nicaragua, Costa Rica, and Panama
 */

'use client';

import React, { useState } from 'react';
import { NorthCentralAmericaAirport } from '@/lib/airports/north-central-america-airports-database';
import { 
  CENTRAL_AMERICAN_AIRLINES,
  CENTRAL_AMERICA_VISA_REQUIREMENTS,
  CENTRAL_AMERICA_TRAVEL_PATTERNS 
} from '@/lib/data/central-america-travel-experience';

interface CentralAmericaAirportFeaturesProps {
  airport: NorthCentralAmericaAirport;
  className?: string;
  showDetailedInfo?: boolean;
}

export default function CentralAmericaAirportFeatures({ 
  airport, 
  className = '',
  showDetailedInfo = false 
}: CentralAmericaAirportFeaturesProps) {
  const [activeTab, setActiveTab] = useState<'visa' | 'airlines' | 'travel' | 'tips'>('visa');

  // Get country-specific information
  const getCountryInfo = () => {
    const countryFlags: Record<string, string> = {
      'Guatemala': '🇬🇹',
      'Belize': '🇧🇿', 
      'El Salvador': '🇸🇻',
      'Honduras': '🇭🇳',
      'Nicaragua': '🇳🇮',
      'Costa Rica': '🇨🇷',
      'Panama': '🇵🇦',
      'Cuba': '🇨🇺',
      'Jamaica': '🇯🇲',
      'Dominican Republic': '🇩🇴',
      'Puerto Rico': '🇵🇷'
    };
    
    return {
      flag: countryFlags[airport.country] || '🌎',
      countryCode: airport.countryCode
    };
  };

  const countryInfo = getCountryInfo();
  const visaInfo = CENTRAL_AMERICA_VISA_REQUIREMENTS[airport.countryCode];

  const tabs = [
    { id: 'visa', label: 'Visa & Entry', icon: '📋' },
    { id: 'airlines', label: 'Airlines', icon: '✈️' },
    { id: 'travel', label: 'Travel Info', icon: '🗺️' },
    { id: 'tips', label: 'Local Tips', icon: '💡' }
  ];

  const renderVisaAndEntry = () => (
    <div className="space-y-4">
      {visaInfo && (
        <>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-3 flex items-center">
              📋 Visa Requirements
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-green-900">🇺🇸 US Citizens</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    visaInfo.visaPolicy.usaCitizens.required 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {visaInfo.visaPolicy.usaCitizens.required ? 'Visa Required' : 'No Visa'}
                  </span>
                </div>
                <div className="text-sm text-green-700">
                  Stay: {visaInfo.visaPolicy.usaCitizens.duration || 'Check requirements'}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-green-900">🇨🇦 Canadian Citizens</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    visaInfo.visaPolicy.canadaCitizens.required 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {visaInfo.visaPolicy.canadaCitizens.required ? 'Visa Required' : 'No Visa'}
                  </span>
                </div>
                <div className="text-sm text-green-700">
                  Stay: {visaInfo.visaPolicy.canadaCitizens.duration || 'Check requirements'}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-green-900">🇪🇺 EU Citizens</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    visaInfo.visaPolicy.euCitizens.required 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {visaInfo.visaPolicy.euCitizens.required ? 'Visa Required' : 'No Visa'}
                  </span>
                </div>
                <div className="text-sm text-green-700">
                  Stay: {visaInfo.visaPolicy.euCitizens.duration || 'Check requirements'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">📄 Entry Requirements</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-medium text-blue-800 mb-2">Required Documents</h5>
                <div className="space-y-1">
                  {visaInfo.entryRequirements.passport && (
                    <div className="flex items-center space-x-2 text-sm text-blue-700">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>Passport (valid {visaInfo.entryRequirements.passportValidity})</span>
                    </div>
                  )}
                  {visaInfo.entryRequirements.onwardTicket && (
                    <div className="flex items-center space-x-2 text-sm text-blue-700">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>Onward/return ticket</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-sm text-blue-700">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>Proof of funds (${visaInfo.entryRequirements.minFunds}/day minimum)</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-blue-800 mb-2">Health Requirements</h5>
                <div className="space-y-1">
                  {visaInfo.entryRequirements.yellowFever && (
                    <div className="flex items-center space-x-2 text-sm text-blue-700">
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                      <span>Yellow fever vaccination (if from endemic area)</span>
                    </div>
                  )}
                  {visaInfo.entryRequirements.covid19 && (
                    <div className="flex items-center space-x-2 text-sm text-blue-700">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      <span>COVID-19 requirements (check current status)</span>
                    </div>
                  )}
                  {!visaInfo.entryRequirements.yellowFever && !visaInfo.entryRequirements.covid19 && (
                    <div className="flex items-center space-x-2 text-sm text-green-700">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span>No special health requirements</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-3">💰 Currency & Costs</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-purple-800 mb-2">Local Currency</div>
                <div className="text-lg font-semibold text-purple-700">{visaInfo.currency}</div>
                <div className="text-xs text-purple-600 mt-1">
                  {airport.country === 'El Salvador' || airport.country === 'Panama' ? 
                    'USD widely accepted' : 'USD accepted in tourist areas'}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-purple-800 mb-2">Languages</div>
                <div className="text-sm text-purple-700">
                  {visaInfo.language.join(', ')}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderAirlines = () => (
    <div className="space-y-4">
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h4 className="font-semibold text-orange-900 mb-3 flex items-center">
          ✈️ Airlines Operating at {airport.city}
        </h4>
        
        {airport.airlines && airport.airlines.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {airport.airlines.map((airlineCode: any) => {
              const airlineData = CENTRAL_AMERICAN_AIRLINES[airlineCode];
              return (
                <div key={airlineCode} className="bg-white rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-orange-900">
                      {airlineData?.shortName || `${airlineCode} Airlines`}
                    </span>
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                      {airlineCode}
                    </span>
                  </div>
                  {airlineData && (
                    <>
                      <div className="text-xs text-orange-600 mb-2">
                        {airlineData.country} • {airlineData.currency}
                      </div>
                      {airlineData.loyaltyProgram && (
                        <div className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                          {airlineData.loyaltyProgram.name} program available
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-orange-700 text-sm">
            Multiple international and regional airlines serve this airport.
          </div>
        )}
      </div>

      {/* Regional Hub Information */}
      {['PTY', 'SJO', 'SAL'].includes(airport.iataCode) && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h4 className="font-semibold text-indigo-900 mb-3">🌟 Regional Hub Benefits</h4>
          <div className="space-y-2">
            {airport.iataCode === 'PTY' && (
              <>
                <div className="flex items-center space-x-2 text-sm text-indigo-700">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                  <span>Copa Airlines hub - extensive connections throughout Americas</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-indigo-700">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                  <span>ConnectMiles loyalty program benefits</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-indigo-700">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                  <span>Modern facilities with Copa Club lounges</span>
                </div>
              </>
            )}
            {airport.iataCode === 'SJO' && (
              <>
                <div className="flex items-center space-x-2 text-sm text-indigo-700">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                  <span>Major gateway for eco-tourism and adventure travel</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-indigo-700">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                  <span>Multiple North American and European connections</span>
                </div>
              </>
            )}
            {airport.iataCode === 'SAL' && (
              <>
                <div className="flex items-center space-x-2 text-sm text-indigo-700">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                  <span>Avianca regional hub with LifeMiles benefits</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-indigo-700">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                  <span>Strategic location for Central American connections</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderTravelInfo = () => (
    <div className="space-y-4">
      <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
        <h4 className="font-semibold text-cyan-900 mb-3">🗺️ Popular Routes</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-sm font-medium text-cyan-800 mb-2">From North America</h5>
            <div className="space-y-1">
              {CENTRAL_AMERICA_TRAVEL_PATTERNS.popularRoutes.fromUSA.slice(0, 3).map((route: any, idx: number) => (
                <div key={idx} className="text-xs text-cyan-700 flex items-center space-x-1">
                  <div className="w-1 h-1 bg-cyan-500 rounded-full"></div>
                  <span>{route}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h5 className="text-sm font-medium text-cyan-800 mb-2">Regional Routes</h5>
            <div className="space-y-1">
              {CENTRAL_AMERICA_TRAVEL_PATTERNS.popularRoutes.regional.slice(0, 3).map((route: any, idx: number) => (
                <div key={idx} className="text-xs text-cyan-700 flex items-center space-x-1">
                  <div className="w-1 h-1 bg-cyan-500 rounded-full"></div>
                  <span>{route}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-900 mb-3">🌦️ Best Time to Visit</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-3 border border-yellow-200">
            <h5 className="font-medium text-yellow-800 mb-2">
              ☀️ Dry Season ({CENTRAL_AMERICA_TRAVEL_PATTERNS.seasonalPatterns.drySeason.months})
            </h5>
            <div className="text-sm text-yellow-700 space-y-1">
              <div>• {CENTRAL_AMERICA_TRAVEL_PATTERNS.seasonalPatterns.drySeason.description}</div>
              <div>• {CENTRAL_AMERICA_TRAVEL_PATTERNS.seasonalPatterns.drySeason.pricing}</div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-yellow-200">
            <h5 className="font-medium text-yellow-800 mb-2">
              🌧️ Rainy Season ({CENTRAL_AMERICA_TRAVEL_PATTERNS.seasonalPatterns.rainySeason.months})
            </h5>
            <div className="text-sm text-yellow-700 space-y-1">
              <div>• {CENTRAL_AMERICA_TRAVEL_PATTERNS.seasonalPatterns.rainySeason.description}</div>
              <div>• {CENTRAL_AMERICA_TRAVEL_PATTERNS.seasonalPatterns.rainySeason.pricing}</div>
            </div>
          </div>
        </div>
      </div>

      {/* CA-4 Agreement Information */}
      {['Guatemala', 'El Salvador', 'Honduras', 'Nicaragua'].includes(airport.country) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-3">🤝 CA-4 Agreement Benefits</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-green-700">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>Free movement between Guatemala, El Salvador, Honduras, and Nicaragua</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-green-700">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>90-day combined stay across all four countries</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-green-700">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>Single entry covers all participating countries</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderLocalTips = () => (
    <div className="space-y-4">
      {visaInfo && visaInfo.tips.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-semibold text-amber-900 mb-3 flex items-center">
            💡 Local Travel Tips
          </h4>
          <div className="space-y-2">
            {visaInfo.tips.map((tip: any, idx: number) => (
              <div key={idx} className="flex items-start space-x-2 text-sm text-amber-700">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2"></div>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 className="font-semibold text-red-900 mb-3">⚠️ Important Reminders</h4>
        <div className="space-y-2">
          <div className="flex items-start space-x-2 text-sm text-red-700">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2"></div>
            <span>Always check current entry requirements before travel</span>
          </div>
          <div className="flex items-start space-x-2 text-sm text-red-700">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2"></div>
            <span>Carry copies of important documents</span>
          </div>
          <div className="flex items-start space-x-2 text-sm text-red-700">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2"></div>
            <span>Have proof of accommodation and return flight</span>
          </div>
          <div className="flex items-start space-x-2 text-sm text-red-700">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2"></div>
            <span>Check if departure taxes are included in your ticket</span>
          </div>
        </div>
      </div>

      {/* Safety and Health Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-3">🏥 Health & Safety</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-sm font-medium text-blue-800 mb-2">Health Precautions</h5>
            <div className="space-y-1">
              <div className="text-xs text-blue-700">• Drink bottled or purified water</div>
              <div className="text-xs text-blue-700">• Use insect repellent (dengue/malaria areas)</div>
              <div className="text-xs text-blue-700">• Consider travel insurance</div>
            </div>
          </div>
          <div>
            <h5 className="text-sm font-medium text-blue-800 mb-2">Safety Tips</h5>
            <div className="space-y-1">
              <div className="text-xs text-blue-700">• Use registered taxis or ride-sharing</div>
              <div className="text-xs text-blue-700">• Avoid displaying expensive items</div>
              <div className="text-xs text-blue-700">• Stay in well-reviewed accommodations</div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">📞 Emergency Information</h4>
        <div className="text-sm text-gray-700 space-y-1">
          <div>• Police: 911 (most countries) or local emergency number</div>
          <div>• Medical: Local hospital or clinic</div>
          <div>• Embassy: Contact your country's embassy for assistance</div>
          <div>• Tourist Police: Available in major tourist areas</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">{countryInfo.flag}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Central American Travel Guide</h3>
            <p className="text-sm text-gray-500">{airport.name} • {airport.country}</p>
          </div>
        </div>
        {airport.isInternational && (
          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            International Gateway
          </span>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
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

      {/* Tab Content */}
      <div>
        {activeTab === 'visa' && renderVisaAndEntry()}
        {activeTab === 'airlines' && renderAirlines()}
        {activeTab === 'travel' && renderTravelInfo()}
        {activeTab === 'tips' && renderLocalTips()}
      </div>

      {/* Quick Summary */}
      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
        <h5 className="font-semibold text-green-900 mb-2">🌎 Quick Summary</h5>
        <div className="text-sm text-green-800 grid grid-cols-1 md:grid-cols-2 gap-2">
          {visaInfo && (
            <>
              <div>• Currency: {visaInfo.currency}</div>
              <div>• Languages: {visaInfo.language.join(', ')}</div>
              <div>• Tourist stay: {visaInfo.stayDuration.tourist}</div>
              <div>• Entry requirements: {visaInfo.entryRequirements.passport ? 'Passport required' : 'Check documents'}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}