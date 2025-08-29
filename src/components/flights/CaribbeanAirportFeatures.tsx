/**
 * 🏝️ CARIBBEAN AIRPORT FEATURES COMPONENT
 * Displays Caribbean travel features including island-specific requirements, airlines, and amenities
 * Covers all major Caribbean islands, territories, and dependencies
 */

'use client';

import React, { useState } from 'react';
import { NorthCentralAmericaAirport } from '@/lib/airports/north-central-america-airports-database';
import { 
  CARIBBEAN_AIRLINES,
  CARIBBEAN_VISA_REQUIREMENTS,
  CARIBBEAN_TRAVEL_PATTERNS,
  CARIBBEAN_ISLAND_FEATURES 
} from '@/lib/data/caribbean-travel-experience';

interface CaribbeanAirportFeaturesProps {
  airport: NorthCentralAmericaAirport;
  className?: string;
  showDetailedInfo?: boolean;
}

export default function CaribbeanAirportFeatures({ 
  airport, 
  className = '',
  showDetailedInfo = false 
}: CaribbeanAirportFeaturesProps) {
  const [activeTab, setActiveTab] = useState<'entry' | 'airlines' | 'island' | 'travel'>('entry');

  // Get island-specific information
  const getIslandInfo = () => {
    const islandFlags: Record<string, string> = {
      'Puerto Rico': '🇵🇷',
      'Jamaica': '🇯🇲',
      'Cuba': '🇨🇺',
      'Dominican Republic': '🇩🇴',
      'Haiti': '🇭🇹',
      'Trinidad and Tobago': '🇹🇹',
      'Barbados': '🇧🇧',
      'Bahamas': '🇧🇸',
      'Aruba': '🇦🇼',
      'Curaçao': '🇨🇼',
      'Saint Lucia': '🇱🇨',
      'Martinique': '🇲🇶',
      'Guadeloupe': '🇬🇵',
      'Antigua and Barbuda': '🇦🇬',
      'Saint Kitts and Nevis': '🇰🇳',
      'Dominica': '🇩🇲',
      'Saint Vincent and the Grenadines': '🇻🇨',
      'Grenada': '🇬🇩'
    };
    
    const isUSTerritory = ['Puerto Rico'].includes(airport.country);
    const isUKTerritory = ['British Virgin Islands', 'Cayman Islands', 'Turks and Caicos'].includes(airport.country);
    
    return {
      flag: islandFlags[airport.country] || '🏝️',
      isUSTerritory,
      isUKTerritory,
      countryCode: airport.countryCode
    };
  };

  const islandInfo = getIslandInfo();
  const visaInfo = CARIBBEAN_VISA_REQUIREMENTS[airport.countryCode];

  const tabs = [
    { id: 'entry', label: 'Entry Requirements', icon: '📋' },
    { id: 'airlines', label: 'Airlines & Routes', icon: '✈️' },
    { id: 'island', label: 'Island Features', icon: '🏝️' },
    { id: 'travel', label: 'Travel Tips', icon: '🧳' }
  ];

  const renderEntryRequirements = () => (
    <div className="space-y-4">
      {visaInfo && (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
              📋 Visa Requirements
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-blue-900">🇺🇸 US Citizens</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    visaInfo.visaPolicy.usaCitizens.required 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {visaInfo.visaPolicy.usaCitizens.required ? 'Visa Required' : 'No Visa'}
                  </span>
                </div>
                <div className="text-sm text-blue-700">
                  Stay: {visaInfo.visaPolicy.usaCitizens.duration || 'Check requirements'}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-blue-900">🇨🇦 Canadian Citizens</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    visaInfo.visaPolicy.canadaCitizens.required 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {visaInfo.visaPolicy.canadaCitizens.required ? 'Visa Required' : 'No Visa'}
                  </span>
                </div>
                <div className="text-sm text-blue-700">
                  Stay: {visaInfo.visaPolicy.canadaCitizens.duration || 'Check requirements'}
                </div>
              </div>
            </div>
          </div>

          {/* US Territory Special Features */}
          {islandInfo.isUSTerritory && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-3">🇺🇸 US Territory Benefits</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-green-800 mb-2">For US Citizens</h5>
                  <div className="space-y-1">
                    {visaInfo.specialFeatures.map((feature: any, idx: number) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm text-green-700">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-green-800 mb-2">Accepted Documents</h5>
                  <div className="space-y-1">
                    {visaInfo.entryRequirements.enhancedDL && (
                      <div className="flex items-center space-x-2 text-sm text-green-700">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span>Enhanced Driver's License</span>
                      </div>
                    )}
                    {visaInfo.entryRequirements.passportCard && (
                      <div className="flex items-center space-x-2 text-sm text-green-700">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span>US Passport Card</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-sm text-green-700">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span>Standard Driver's License (some routes)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-3">📄 Entry Documents</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-medium text-purple-800 mb-2">Required Documents</h5>
                <div className="space-y-1">
                  {visaInfo.entryRequirements.passport && (
                    <div className="flex items-center space-x-2 text-sm text-purple-700">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                      <span>Passport (valid {visaInfo.entryRequirements.passportValidity})</span>
                    </div>
                  )}
                  {visaInfo.entryRequirements.onwardTicket && (
                    <div className="flex items-center space-x-2 text-sm text-purple-700">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                      <span>Return/onward ticket</span>
                    </div>
                  )}
                  {visaInfo.entryRequirements.accommodationProof && (
                    <div className="flex items-center space-x-2 text-sm text-purple-700">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                      <span>Accommodation confirmation</span>
                    </div>
                  )}
                  {visaInfo.entryRequirements.minFunds && (
                    <div className="flex items-center space-x-2 text-sm text-purple-700">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                      <span>Proof of funds (${visaInfo.entryRequirements.minFunds}/day)</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-purple-800 mb-2">Currency & Language</h5>
                <div className="space-y-2">
                  <div className="bg-white rounded p-2 border border-purple-200">
                    <div className="text-sm font-medium text-purple-700">Currency</div>
                    <div className="text-xs text-purple-600">{visaInfo.currency}</div>
                  </div>
                  <div className="bg-white rounded p-2 border border-purple-200">
                    <div className="text-sm font-medium text-purple-700">Languages</div>
                    <div className="text-xs text-purple-600">{visaInfo.language.join(', ')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderAirlinesAndRoutes = () => (
    <div className="space-y-4">
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h4 className="font-semibold text-orange-900 mb-3 flex items-center">
          ✈️ Airlines Serving {airport.city}
        </h4>
        
        {airport.airlines && airport.airlines.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {airport.airlines.map((airlineCode: any) => {
              const airlineData = CARIBBEAN_AIRLINES[airlineCode];
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
                        Base: {airlineData.country} • {airlineData.currency}
                      </div>
                      {airlineData.loyaltyProgram && (
                        <div className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                          {airlineData.loyaltyProgram.name} program
                        </div>
                      )}
                      {airlineData.operatesInterIsland && (
                        <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mt-1">
                          Inter-island flights available
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
            Multiple international and regional airlines serve this airport, including major US carriers.
          </div>
        )}
      </div>

      {/* Popular Routes */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <h4 className="font-semibold text-indigo-900 mb-3">🗺️ Popular Routes</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h5 className="text-sm font-medium text-indigo-800 mb-2">From USA</h5>
            <div className="space-y-1">
              {CARIBBEAN_TRAVEL_PATTERNS.popularRoutes.fromUSA.slice(0, 4).map((route: any, idx: number) => (
                <div key={idx} className="text-xs text-indigo-700 flex items-center space-x-1">
                  <div className="w-1 h-1 bg-indigo-500 rounded-full"></div>
                  <span>{route}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h5 className="text-sm font-medium text-indigo-800 mb-2">From Canada</h5>
            <div className="space-y-1">
              {CARIBBEAN_TRAVEL_PATTERNS.popularRoutes.fromCanada.map((route: any, idx: number) => (
                <div key={idx} className="text-xs text-indigo-700 flex items-center space-x-1">
                  <div className="w-1 h-1 bg-indigo-500 rounded-full"></div>
                  <span>{route}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h5 className="text-sm font-medium text-indigo-800 mb-2">Inter-Island</h5>
            <div className="space-y-1">
              {CARIBBEAN_TRAVEL_PATTERNS.popularRoutes.interIsland.slice(0, 4).map((route: any, idx: number) => (
                <div key={idx} className="text-xs text-indigo-700 flex items-center space-x-1">
                  <div className="w-1 h-1 bg-indigo-500 rounded-full"></div>
                  <span>{route}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hub Airport Benefits */}
      {['SJU', 'NAS', 'BGI'].includes(airport.iataCode) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-3">🌟 Regional Hub Benefits</h4>
          <div className="space-y-2">
            {airport.iataCode === 'SJU' && (
              <>
                <div className="flex items-center space-x-2 text-sm text-green-700">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Primary Caribbean gateway - extensive US mainland connections</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-green-700">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>US territory benefits - no customs/immigration for US citizens</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-green-700">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>TSA PreCheck and Global Entry accepted</span>
                </div>
              </>
            )}
            {airport.iataCode === 'NAS' && (
              <>
                <div className="flex items-center space-x-2 text-sm text-green-700">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Closest Caribbean destination to US mainland (50 miles from Florida)</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-green-700">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>English-speaking with familiar procedures</span>
                </div>
              </>
            )}
            {airport.iataCode === 'BGI' && (
              <>
                <div className="flex items-center space-x-2 text-sm text-green-700">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Eastern Caribbean hub with excellent European connections</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-green-700">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Modern facilities and reliable operations</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderIslandFeatures = () => (
    <div className="space-y-4">
      <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
        <h4 className="font-semibold text-cyan-900 mb-3">🏝️ Island Characteristics</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-sm font-medium text-cyan-800 mb-2">Transportation</h5>
            <div className="space-y-1">
              {CARIBBEAN_ISLAND_FEATURES.transportation.publicTransit.map((info: any, idx: number) => (
                <div key={idx} className="text-xs text-cyan-700 flex items-center space-x-1">
                  <div className="w-1 h-1 bg-cyan-500 rounded-full"></div>
                  <span>{info}</span>
                </div>
              ))}
              {CARIBBEAN_ISLAND_FEATURES.transportation.specialConsiderations.map((info: any, idx: number) => (
                <div key={idx} className="text-xs text-cyan-700 flex items-center space-x-1">
                  <div className="w-1 h-1 bg-cyan-500 rounded-full"></div>
                  <span>{info}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h5 className="text-sm font-medium text-cyan-800 mb-2">Accessibility</h5>
            <div className="space-y-1">
              {CARIBBEAN_ISLAND_FEATURES.accessibility.wheelchairFriendly.includes(airport.iataCode) ? (
                <div className="text-xs text-green-700 flex items-center space-x-1">
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                  <span>Wheelchair accessible facilities</span>
                </div>
              ) : (
                <div className="text-xs text-orange-700 flex items-center space-x-1">
                  <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                  <span>Limited accessibility - check with airport</span>
                </div>
              )}
              {CARIBBEAN_ISLAND_FEATURES.accessibility.considerations.map((info: any, idx: number) => (
                <div key={idx} className="text-xs text-cyan-700 flex items-center space-x-1">
                  <div className="w-1 h-1 bg-cyan-500 rounded-full"></div>
                  <span>{info}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-900 mb-3">🌦️ Seasonal Considerations</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-3 border border-yellow-200">
            <h5 className="font-medium text-yellow-800 mb-2">
              ☀️ Peak Season ({CARIBBEAN_TRAVEL_PATTERNS.seasonalPatterns.peakSeason.months})
            </h5>
            <div className="text-xs text-yellow-700 space-y-1">
              <div>• {CARIBBEAN_TRAVEL_PATTERNS.seasonalPatterns.peakSeason.description}</div>
              <div>• {CARIBBEAN_TRAVEL_PATTERNS.seasonalPatterns.peakSeason.pricing}</div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-yellow-200">
            <h5 className="font-medium text-yellow-800 mb-2">
              🌤️ Shoulder ({CARIBBEAN_TRAVEL_PATTERNS.seasonalPatterns.shoulderSeason.months})
            </h5>
            <div className="text-xs text-yellow-700 space-y-1">
              <div>• {CARIBBEAN_TRAVEL_PATTERNS.seasonalPatterns.shoulderSeason.description}</div>
              <div>• {CARIBBEAN_TRAVEL_PATTERNS.seasonalPatterns.shoulderSeason.pricing}</div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-yellow-200">
            <h5 className="font-medium text-yellow-800 mb-2">
              🌀 Hurricane Season ({CARIBBEAN_TRAVEL_PATTERNS.seasonalPatterns.lowSeason.months})
            </h5>
            <div className="text-xs text-yellow-700 space-y-1">
              <div>• {CARIBBEAN_TRAVEL_PATTERNS.seasonalPatterns.lowSeason.description}</div>
              <div>• {CARIBBEAN_TRAVEL_PATTERNS.seasonalPatterns.lowSeason.pricing}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cultural Information */}
      <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
        <h4 className="font-semibold text-pink-900 mb-3">🎭 Cultural Features</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h5 className="text-sm font-medium text-pink-800 mb-2">Languages</h5>
            <div className="space-y-1">
              {CARIBBEAN_ISLAND_FEATURES.cultural.languages.map((lang: any, idx: number) => (
                <div key={idx} className="text-xs text-pink-700 flex items-center space-x-1">
                  <div className="w-1 h-1 bg-pink-500 rounded-full"></div>
                  <span>{lang}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h5 className="text-sm font-medium text-pink-800 mb-2">Currency Tips</h5>
            <div className="space-y-1">
              {CARIBBEAN_ISLAND_FEATURES.cultural.currencies.map((tip: any, idx: number) => (
                <div key={idx} className="text-xs text-pink-700 flex items-center space-x-1">
                  <div className="w-1 h-1 bg-pink-500 rounded-full"></div>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h5 className="text-sm font-medium text-pink-800 mb-2">Local Etiquette</h5>
            <div className="space-y-1">
              {CARIBBEAN_ISLAND_FEATURES.cultural.etiquette.map((tip: any, idx: number) => (
                <div key={idx} className="text-xs text-pink-700 flex items-center space-x-1">
                  <div className="w-1 h-1 bg-pink-500 rounded-full"></div>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTravelTips = () => (
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-3">🧳 Packing & Preparation</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-sm font-medium text-blue-800 mb-2">What to Pack</h5>
            <div className="space-y-1 text-xs text-blue-700">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                <span>Lightweight, breathable clothing</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                <span>Sun protection (SPF 30+, hat, sunglasses)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                <span>Reef-safe sunscreen</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                <span>Rain jacket (hurricane season)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                <span>Insect repellent</span>
              </div>
            </div>
          </div>
          <div>
            <h5 className="text-sm font-medium text-blue-800 mb-2">Health & Safety</h5>
            <div className="space-y-1 text-xs text-blue-700">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                <span>Drink bottled/filtered water</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                <span>Travel insurance recommended</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                <span>Know hurricane season risks (June-Nov)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                <span>Check current health advisories</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-900 mb-3">💰 Money & Costs</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-sm font-medium text-green-800 mb-2">Budget Tips</h5>
            <div className="space-y-1 text-xs text-green-700">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                <span>All-inclusive resorts often best value</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                <span>Negotiate taxi fares in advance</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                <span>Hurricane season = lower prices</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                <span>Local markets cheaper than tourist areas</span>
              </div>
            </div>
          </div>
          <div>
            <h5 className="text-sm font-medium text-green-800 mb-2">Payment Methods</h5>
            <div className="space-y-1 text-xs text-green-700">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                <span>USD widely accepted in tourist areas</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                <span>Credit cards at major establishments</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                <span>Carry small bills for tips/local vendors</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                <span>ATMs available at major locations</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cruise Integration */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <h4 className="font-semibold text-indigo-900 mb-3">🚢 Cruise & Multi-Island Options</h4>
        <div className="space-y-2 text-sm text-indigo-700">
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2"></div>
            <span>Many islands are popular cruise ports - consider fly & cruise packages</span>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2"></div>
            <span>Inter-island flights available for island hopping</span>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2"></div>
            <span>Ferry connections between some neighboring islands</span>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2"></div>
            <span>Consider staying extra days pre/post cruise</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">{islandInfo.flag}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Caribbean Island Guide</h3>
            <p className="text-sm text-gray-500">
              {airport.name} • {airport.country}
              {islandInfo.isUSTerritory && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">US Territory</span>}
            </p>
          </div>
        </div>
        {airport.isInternational && (
          <span className="px-3 py-1 bg-cyan-100 text-cyan-800 text-xs font-medium rounded-full">
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
                ? 'border-cyan-600 text-cyan-600'
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
        {activeTab === 'entry' && renderEntryRequirements()}
        {activeTab === 'airlines' && renderAirlinesAndRoutes()}
        {activeTab === 'island' && renderIslandFeatures()}
        {activeTab === 'travel' && renderTravelTips()}
      </div>

      {/* Quick Summary */}
      <div className="mt-6 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
        <h5 className="font-semibold text-cyan-900 mb-2">🏝️ Island Quick Facts</h5>
        <div className="text-sm text-cyan-800 grid grid-cols-1 md:grid-cols-2 gap-2">
          {visaInfo && (
            <>
              <div>• Currency: {visaInfo.currency}</div>
              <div>• Languages: {visaInfo.language.join(', ')}</div>
              <div>• Stay duration: {visaInfo.stayDuration.tourist}</div>
              <div>• Best season: December - April (dry season)</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}