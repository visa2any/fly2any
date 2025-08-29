/**
 * 🌎 NORTH AMERICA AIRPORT FEATURES COMPONENT
 * Displays North American travel features including US, Canada, and Mexico
 * Cross-border travel programs, loyalty benefits, and regional amenities
 */

'use client';

import React, { useState } from 'react';
import { NorthCentralAmericaAirport } from '@/lib/airports/north-central-america-airports-database';
import { 
  NORTH_AMERICA_SECURITY_PROGRAMS, 
  NORTH_AMERICA_AIRLINES,
  CROSS_BORDER_REQUIREMENTS 
} from '@/lib/data/north-america-travel-experience';

interface NorthAmericaAirportFeaturesProps {
  airport: NorthCentralAmericaAirport;
  className?: string;
  showDetailedInfo?: boolean;
}

export default function NorthAmericaAirportFeatures({ 
  airport, 
  className = '',
  showDetailedInfo = false 
}: NorthAmericaAirportFeaturesProps) {
  const [activeTab, setActiveTab] = useState<'security' | 'cross-border' | 'loyalty' | 'amenities'>('security');

  // Determine country flag and features
  const getCountryInfo = () => {
    switch (airport.country) {
      case 'United States':
        return { flag: '🇺🇸', currency: 'USD', programs: ['TSA PreCheck', 'Global Entry', 'CLEAR'] };
      case 'Canada':
        return { flag: '🇨🇦', currency: 'CAD', programs: ['NEXUS', 'CATSA+'] };
      case 'Mexico':
        return { flag: '🇲🇽', currency: 'MXN', programs: ['SENTRI'] };
      default:
        return { flag: '🌎', currency: 'USD', programs: [] };
    }
  };

  const countryInfo = getCountryInfo();

  // Available security programs at this airport
  const availablePrograms: string[] = [];
  if (airport.security?.tsaPrecheck) availablePrograms.push('TSA PreCheck');
  if (airport.security?.globalEntry) availablePrograms.push('Global Entry');
  if (airport.security?.clear) availablePrograms.push('CLEAR');
  if (airport.security?.nexus) availablePrograms.push('NEXUS');
  if (airport.security?.sentri) availablePrograms.push('SENTRI');
  if (airport.security?.catsa) availablePrograms.push('CATSA+');

  const tabs = [
    { id: 'security', label: 'Security Programs', icon: '🛡️' },
    { id: 'cross-border', label: 'Cross-Border', icon: '🌉' },
    { id: 'loyalty', label: 'Loyalty Programs', icon: '✈️' },
    { id: 'amenities', label: 'Amenities', icon: '🏨' }
  ];

  const renderSecurityPrograms = () => (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-900 mb-3 flex items-center">
          🛡️ Security Programs Available
        </h4>
        {availablePrograms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availablePrograms.map((program: any) => {
              const programData = NORTH_AMERICA_SECURITY_PROGRAMS[program.replace(' ', '_').toUpperCase()];
              return (
                <div key={program} className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-green-900">{program}</span>
                    {programData && (
                      <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded">
                        ${programData.cost} {programData.currency}
                      </span>
                    )}
                  </div>
                  {programData && (
                    <div className="text-sm text-green-700">
                      <div className="mb-2">{programData.description}</div>
                      <div className="text-xs text-green-600">
                        Valid {programData.validityYears} years • {programData.applicationTime}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-green-700 text-sm">
            Standard security screening available. Consider applying for expedited programs.
          </div>
        )}
      </div>

      {airport.security?.averageWaitTimes && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-3">⏱️ Security Wait Times</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">{airport.security.averageWaitTimes.standard}</div>
              <div className="text-sm text-blue-600">Standard (min)</div>
            </div>
            {airport.security.averageWaitTimes.expedited && (
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">{airport.security.averageWaitTimes.expedited}</div>
                <div className="text-sm text-green-600">Expedited (min)</div>
              </div>
            )}
            <div className="text-center">
              <div className="text-2xl font-bold text-red-700">{airport.security.averageWaitTimes.peak}</div>
              <div className="text-sm text-red-600">Peak Hours (min)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">{airport.security.averageWaitTimes.offPeak}</div>
              <div className="text-sm text-blue-600">Off-Peak (min)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCrossBorderFeatures = () => (
    <div className="space-y-4">
      {airport.crossBorderTravel && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
            🌉 Cross-Border Travel Features
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-purple-800 mb-2">Required Documents</h5>
              <div className="space-y-1">
                {airport.crossBorderTravel.documentsRequired.map((doc: any, idx: number) => (
                  <div key={idx} className="flex items-center space-x-2 text-sm text-purple-700">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h5 className="font-medium text-purple-800 mb-2">Expedited Programs</h5>
              <div className="space-y-1">
                {airport.crossBorderTravel.programs.map((program: any, idx: number) => (
                  <div key={idx} className="flex items-center space-x-2 text-sm text-purple-700">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    <span>{program}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {airport.crossBorderTravel.tips.length > 0 && (
            <div className="mt-4 pt-4 border-t border-purple-200">
              <h5 className="font-medium text-purple-800 mb-2">💡 Traveler Tips</h5>
              <div className="space-y-1">
                {airport.crossBorderTravel.tips.map((tip: any, idx: number) => (
                  <div key={idx} className="flex items-start space-x-2 text-sm text-purple-700">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2"></div>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cross-border route suggestions */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <h4 className="font-semibold text-indigo-900 mb-3">🛫 Popular Cross-Border Routes</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {airport.country === 'United States' && (
            <>
              <div>
                <h5 className="text-sm font-medium text-indigo-800 mb-2">🇨🇦 To Canada</h5>
                <div className="text-xs text-indigo-600 space-y-1">
                  <div>• Toronto (YYZ)</div>
                  <div>• Vancouver (YVR)</div>
                  <div>• Montreal (YUL)</div>
                </div>
              </div>
              <div>
                <h5 className="text-sm font-medium text-indigo-800 mb-2">🇲🇽 To Mexico</h5>
                <div className="text-xs text-indigo-600 space-y-1">
                  <div>• Mexico City (MEX)</div>
                  <div>• Cancun (CUN)</div>
                  <div>• Guadalajara (GDL)</div>
                </div>
              </div>
            </>
          )}
          {airport.country === 'Canada' && (
            <div>
              <h5 className="text-sm font-medium text-indigo-800 mb-2">🇺🇸 To United States</h5>
              <div className="text-xs text-indigo-600 space-y-1">
                <div>• New York (JFK)</div>
                <div>• Los Angeles (LAX)</div>
                <div>• Chicago (ORD)</div>
              </div>
            </div>
          )}
          {airport.country === 'Mexico' && (
            <div>
              <h5 className="text-sm font-medium text-indigo-800 mb-2">🇺🇸 To United States</h5>
              <div className="text-xs text-indigo-600 space-y-1">
                <div>• Los Angeles (LAX)</div>
                <div>• Dallas (DFW)</div>
                <div>• Miami (MIA)</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderLoyaltyPrograms = () => (
    <div className="space-y-4">
      {airport.loyaltyPrograms && airport.loyaltyPrograms.primaryAirlines.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-semibold text-amber-900 mb-3 flex items-center">
            ✈️ Major Loyalty Programs
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {airport.loyaltyPrograms.primaryAirlines.map((program: any, idx: number) => {
              const airlineData = NORTH_AMERICA_AIRLINES[program.airline];
              return (
                <div key={idx} className="bg-white rounded-lg p-4 border border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-amber-900">
                      {airlineData?.shortName || program.airline}
                    </span>
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                      {program.program}
                    </span>
                  </div>
                  <div className="text-xs text-amber-600 space-y-1">
                    {program.benefits.slice(0, 3).map((benefit: any, benefitIdx: number) => (
                      <div key={benefitIdx} className="flex items-center space-x-1">
                        <div className="w-1 h-1 bg-amber-400 rounded-full"></div>
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                  {program.loungeAccess && (
                    <div className="mt-2 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                      Lounge Access Included
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {airport.loyaltyPrograms?.creditCardBenefits && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-3">💳 Credit Card Benefits</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h5 className="text-sm font-medium text-green-800 mb-2">Free Checked Bags</h5>
              <div className="space-y-1">
                {airport.loyaltyPrograms.creditCardBenefits.freeCheckedBags?.slice(0, 3).map((card: any, idx: number) => (
                  <div key={idx} className="text-xs text-green-700 flex items-center space-x-1">
                    <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                    <span>{card}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h5 className="text-sm font-medium text-green-800 mb-2">Priority Boarding</h5>
              <div className="space-y-1">
                {airport.loyaltyPrograms.creditCardBenefits.priorityBoarding?.slice(0, 3).map((card: any, idx: number) => (
                  <div key={idx} className="text-xs text-green-700 flex items-center space-x-1">
                    <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                    <span>{card}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h5 className="text-sm font-medium text-green-800 mb-2">Lounge Access</h5>
              <div className="space-y-1">
                {airport.loyaltyPrograms.creditCardBenefits.loungeAccess?.slice(0, 3).map((card: any, idx: number) => (
                  <div key={idx} className="text-xs text-green-700 flex items-center space-x-1">
                    <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                    <span>{card}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAmenities = () => (
    <div className="space-y-4">
      {airport.regionalAmenities?.dining && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-semibold text-orange-900 mb-3">🍴 Dining Options</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-medium text-orange-800 mb-2">Local Specialties</h5>
              <div className="space-y-1">
                {airport.regionalAmenities.dining.localSpecialties.slice(0, 5).map((item: any, idx: number) => (
                  <div key={idx} className="text-xs text-orange-700 flex items-center space-x-1">
                    <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h5 className="text-sm font-medium text-orange-800 mb-2">Quick Options</h5>
              <div className="space-y-1">
                {airport.regionalAmenities.dining.fastFood.slice(0, 5).map((item: any, idx: number) => (
                  <div key={idx} className="text-xs text-orange-700 flex items-center space-x-1">
                    <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {airport.regionalAmenities?.services && (
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
          <h4 className="font-semibold text-cyan-900 mb-3">🛎️ Services Available</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {airport.regionalAmenities.services.currencyExchange && (
              <div className="flex items-center space-x-2 text-sm text-cyan-700">
                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                <span>Currency Exchange</span>
              </div>
            )}
            {airport.regionalAmenities.services.banking && (
              <div className="flex items-center space-x-2 text-sm text-cyan-700">
                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                <span>Banking/ATM</span>
              </div>
            )}
            {airport.regionalAmenities.services.medical && (
              <div className="flex items-center space-x-2 text-sm text-cyan-700">
                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                <span>Medical Services</span>
              </div>
            )}
            {airport.regionalAmenities.services.luggageStorage && (
              <div className="flex items-center space-x-2 text-sm text-cyan-700">
                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                <span>Luggage Storage</span>
              </div>
            )}
          </div>
        </div>
      )}

      {airport.regionalAmenities?.families && (
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
          <h4 className="font-semibold text-pink-900 mb-3">👨‍👩‍👧‍👦 Family Services</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {airport.regionalAmenities.families.playAreas && (
              <div className="flex items-center space-x-2 text-sm text-pink-700">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <span>Play Areas</span>
              </div>
            )}
            {airport.regionalAmenities.families.nursingRooms && (
              <div className="flex items-center space-x-2 text-sm text-pink-700">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <span>Nursing Rooms</span>
              </div>
            )}
            {airport.regionalAmenities.families.familyRestrooms && (
              <div className="flex items-center space-x-2 text-sm text-pink-700">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <span>Family Restrooms</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">{countryInfo.flag}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">North American Travel Features</h3>
            <p className="text-sm text-gray-500">{airport.name} • {airport.country}</p>
          </div>
        </div>
        {airport.isInternational && (
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
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
                ? 'border-blue-600 text-blue-600'
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
        {activeTab === 'security' && renderSecurityPrograms()}
        {activeTab === 'cross-border' && renderCrossBorderFeatures()}
        {activeTab === 'loyalty' && renderLoyaltyPrograms()}
        {activeTab === 'amenities' && renderAmenities()}
      </div>

      {/* Quick Summary */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
        <h5 className="font-semibold text-blue-900 mb-2">🌎 Regional Advantages</h5>
        <div className="text-sm text-blue-800 grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>• {availablePrograms.length} expedited security programs</div>
          <div>• Cross-border travel programs available</div>
          {airport.loyaltyPrograms && (
            <div>• {airport.loyaltyPrograms.primaryAirlines.length} major loyalty programs</div>
          )}
          <div>• Regional cuisine and amenities</div>
        </div>
      </div>
    </div>
  );
}