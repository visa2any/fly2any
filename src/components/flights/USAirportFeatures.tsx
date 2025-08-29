/**
 * 🇺🇸 US AIRPORT FEATURES COMPONENT
 * Displays US-specific travel features, security programs, and amenities
 * Designed to compete with US-focused OTAs by highlighting traveler benefits
 */

'use client';

import React from 'react';
import { USAirport } from '@/lib/airports/us-airports-database';
import { US_SECURITY_PROGRAMS, US_AIRLINES } from '@/lib/data/us-travel-experience';

interface USAirportFeaturesProps {
  airport: USAirport;
  className?: string;
  showDetailedInfo?: boolean;
}

export default function USAirportFeatures({ 
  airport, 
  className = '',
  showDetailedInfo = false 
}: USAirportFeaturesProps) {
  const securityPrograms = [];
  if (airport.security?.tsaPrecheck) securityPrograms.push('TSA PreCheck');
  if (airport.security?.globalEntry) securityPrograms.push('Global Entry');
  if (airport.security?.clear) securityPrograms.push('CLEAR');

  const majorLoyaltyPrograms = airport.loyaltyPrograms?.primaryAirlines?.filter(
    program => ['AA', 'DL', 'UA', 'WN'].includes(program.airline)
  ) || [];

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-semibold">🇺🇸</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">US Traveler Benefits</h3>
            <p className="text-sm text-gray-500">{airport.name}</p>
          </div>
        </div>
        {airport.isInternational && (
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
            International Gateway
          </span>
        )}
      </div>

      <div className="space-y-6">
        {/* Security Programs */}
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-3 flex items-center">
            🛡️ Security Programs Available
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {securityPrograms.map((program: any) => (
              <div key={program} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-800">{program}</span>
              </div>
            ))}
          </div>
          {showDetailedInfo && (
            <div className="mt-3 pt-3 border-t border-green-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-green-700">Standard Wait:</span>
                  <span className="ml-2 text-green-600">{airport.security?.averageWaitTimes?.standard || 'N/A'} min</span>
                </div>
                <div>
                  <span className="font-medium text-green-700">PreCheck Wait:</span>
                  <span className="ml-2 text-green-600">{airport.security?.averageWaitTimes?.precheck || 'N/A'} min</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loyalty Programs */}
        {majorLoyaltyPrograms.length > 0 && (
          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
              ✈️ Major Loyalty Programs
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {majorLoyaltyPrograms.map((program: any) => {
                const airlineData = US_AIRLINES[program.airline];
                return (
                  <div key={program.airline} className="bg-white rounded-lg p-3 border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-purple-900">
                        {airlineData?.shortName || program.airline}
                      </span>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        {program.program}
                      </span>
                    </div>
                    <div className="text-xs text-purple-600 space-y-1">
                      {program.benefits.slice(0, 2).map((benefit: any, idx: number) => (
                        <div key={idx} className="flex items-center space-x-1">
                          <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Credit Card Benefits */}
        <div className="bg-amber-50 rounded-lg p-4">
          <h4 className="font-semibold text-amber-900 mb-3 flex items-center">
            💳 Credit Card Benefits Available
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h5 className="text-sm font-medium text-amber-800 mb-2">Free Checked Bags</h5>
              <div className="space-y-1">
                {airport.loyaltyPrograms?.creditCardBenefits?.freeCheckedBags?.slice(0, 3)?.map((card: any) => (
                  <div key={card} className="text-xs text-amber-700 flex items-center space-x-1">
                    <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
                    <span>{card}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h5 className="text-sm font-medium text-amber-800 mb-2">Priority Boarding</h5>
              <div className="space-y-1">
                {airport.loyaltyPrograms?.creditCardBenefits?.priorityBoarding?.slice(0, 3)?.map((card: any) => (
                  <div key={card} className="text-xs text-amber-700 flex items-center space-x-1">
                    <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
                    <span>{card}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h5 className="text-sm font-medium text-amber-800 mb-2">Lounge Access</h5>
              <div className="space-y-1">
                {airport.loyaltyPrograms?.creditCardBenefits?.loungeAccess?.slice(0, 3)?.map((card: any) => (
                  <div key={card} className="text-xs text-amber-700 flex items-center space-x-1">
                    <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
                    <span>{card}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Premium Lounges */}
        {(airport.usAmenities?.lounges?.creditCard?.length || 0) > 0 && (
          <div className="bg-indigo-50 rounded-lg p-4">
            <h4 className="font-semibold text-indigo-900 mb-3 flex items-center">
              🏛️ Premium Lounges
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {airport.usAmenities?.lounges?.creditCard?.map((lounge: any, idx: number) => (
                <div key={idx} className="bg-white rounded-lg p-3 border border-indigo-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-indigo-900 text-sm">{lounge.name}</span>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                      {lounge.terminal}
                    </span>
                  </div>
                  <div className="text-xs text-indigo-600">
                    Access: {lounge.cards.join(', ')}
                  </div>
                </div>
              ))}
              {airport.usAmenities?.lounges?.airline?.map((lounge: any, idx: number) => (
                <div key={`airline-${idx}`} className="bg-white rounded-lg p-3 border border-indigo-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-indigo-900 text-sm">{lounge.name}</span>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                      {lounge.terminal}
                    </span>
                  </div>
                  <div className="text-xs text-indigo-600">
                    {lounge.dayPass && `Day Pass: $${lounge.dayPass}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Domestic Travel Features */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
            🏠 Domestic Travel Benefits
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-blue-800">No Passport Required</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-blue-800">REAL ID Accepted</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-blue-800">Same-Day Changes</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-blue-800">Miles Earning</span>
            </div>
          </div>
          {showDetailedInfo && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="text-sm text-blue-700">
                <span className="font-medium">Popular Routes:</span>
                <span className="ml-2">{airport.domesticTravel?.frequentRoutes?.slice(0, 5)?.join(' • ') || 'N/A'}</span>
              </div>
            </div>
          )}
        </div>

        {/* International Features (if applicable) */}
        {airport.isInternational && airport.internationalTravel && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              🌍 International Travel Features
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {airport.internationalTravel.globalEntryKiosks && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Global Entry Kiosks</span>
                </div>
              )}
              {airport.internationalTravel.dutyFree && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Duty-Free Shopping</span>
                </div>
              )}
              {airport.internationalTravel.currencyExchange && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Currency Exchange</span>
                </div>
              )}
              {airport.internationalTravel.precheck.available && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Preclearance Available</span>
                </div>
              )}
            </div>
            {showDetailedInfo && airport.internationalTravel.precheck.countries.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Preclearance Countries:</span>
                  <span className="ml-2">{airport.internationalTravel.precheck.countries.join(', ')}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tech & Convenience */}
        <div className="bg-cyan-50 rounded-lg p-4">
          <h4 className="font-semibold text-cyan-900 mb-3 flex items-center">
            📱 Technology & Convenience
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {airport.usAmenities?.technology?.freeWifi && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                <span className="text-cyan-800">Free WiFi</span>
              </div>
            )}
            {airport.usAmenities?.technology?.chargingStations && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                <span className="text-cyan-800">Charging Stations</span>
              </div>
            )}
            {airport.usAmenities?.services?.petRelief && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                <span className="text-cyan-800">Pet Relief Areas</span>
              </div>
            )}
            {airport.usAmenities?.families?.playAreas && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                <span className="text-cyan-800">Kids Play Areas</span>
              </div>
            )}
          </div>
          {showDetailedInfo && (airport.usAmenities?.technology?.appBasedServices?.length || 0) > 0 && (
            <div className="mt-3 pt-3 border-t border-cyan-200">
              <div className="text-sm text-cyan-700">
                <span className="font-medium">App Features:</span>
                <span className="ml-2">{airport.usAmenities?.technology?.appBasedServices?.join(' • ') || 'N/A'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <h5 className="font-semibold text-blue-900 mb-2">💡 Traveler Tips</h5>
        <div className="text-sm text-blue-800 space-y-1">
          <div>• Arrive {(airport.security?.averageWaitTimes?.standard || 20) + 30} minutes early for domestic flights</div>
          <div>• Use mobile boarding passes to save time</div>
          {airport.security?.tsaPrecheck && (
            <div>• Consider TSA PreCheck for faster security ($78 for 5 years)</div>
          )}
          {airport.isInternational && (
            <div>• Global Entry includes TSA PreCheck for international travelers</div>
          )}
        </div>
      </div>
    </div>
  );
}