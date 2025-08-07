/**
 * 🧪 US AIRPORTS TEST PAGE
 * Demo page to test the comprehensive US airport search functionality
 * Remove this file after testing is complete
 */

'use client';

import React, { useState } from 'react';
import USAirportAutocomplete from '@/components/ui/us-airport-autocomplete';
import { AirportSearchResult } from '@/hooks/useUSAirportSearch';
import { US_MAJOR_HUBS, POPULAR_US_ROUTES } from '@/lib/airports/us-airports-database';

export default function TestAirportsPage() {
  const [origin, setOrigin] = useState<AirportSearchResult | null>(null);
  const [destination, setDestination] = useState<AirportSearchResult | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🇺🇸 US Airport Search Demo
            </h1>
            <p className="text-gray-600">
              Test the comprehensive US airport database with instant search results
            </p>
          </div>

          {/* Airport Search Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <USAirportAutocomplete
                label="Origin Airport"
                placeholder="Search origin airport..."
                value={origin}
                onChange={setOrigin}
                showPopularOnFocus={true}
                maxResults={8}
                required
              />
            </div>
            
            <div>
              <USAirportAutocomplete
                label="Destination Airport"
                placeholder="Search destination airport..."
                value={destination}
                onChange={setDestination}
                showPopularOnFocus={true}
                maxResults={8}
                required
              />
            </div>
          </div>

          {/* Selected Airports Info */}
          {(origin || destination) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Selected Route</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {origin && (
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Origin</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Airport:</span> {origin.name}</p>
                      <p><span className="font-medium">City:</span> {origin.city}, {origin.stateCode}</p>
                      <p><span className="font-medium">Code:</span> {origin.iataCode}</p>
                      <p><span className="font-medium">Category:</span> {origin.category?.replace('_', ' ').toUpperCase()}</p>
                      {origin.timezone && (
                        <p><span className="font-medium">Timezone:</span> {origin.timezone}</p>
                      )}
                    </div>
                  </div>
                )}
                
                {destination && (
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Destination</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Airport:</span> {destination.name}</p>
                      <p><span className="font-medium">City:</span> {destination.city}, {destination.stateCode}</p>
                      <p><span className="font-medium">Code:</span> {destination.iataCode}</p>
                      <p><span className="font-medium">Category:</span> {destination.category?.replace('_', ' ').toUpperCase()}</p>
                      {destination.timezone && (
                        <p><span className="font-medium">Timezone:</span> {destination.timezone}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {origin && destination && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800">
                    <span className="font-medium">Route:</span> {origin.city} ({origin.iataCode}) → {destination.city} ({destination.iataCode})
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    {origin.isUSAirport && destination.isUSAirport ? '🇺🇸 Domestic US Route' : '🌍 International Route'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Major Hubs</h3>
              <p className="text-3xl font-bold">{US_MAJOR_HUBS.length}</p>
              <p className="text-blue-100">Primary airports</p>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Popular Routes</h3>
              <p className="text-3xl font-bold">{POPULAR_US_ROUTES.length}</p>
              <p className="text-green-100">City pairs</p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Search Speed</h3>
              <p className="text-3xl font-bold">&lt;50ms</p>
              <p className="text-purple-100">Instant results</p>
            </div>
          </div>

          {/* Major Hubs Preview */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Major US Airport Hubs</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {US_MAJOR_HUBS.slice(0, 8).map(airport => (
                <div key={airport.iataCode} className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {airport.iataCode}
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {airport.city}
                  </div>
                  <div className="text-xs text-gray-600">
                    {airport.stateCode}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {airport.passengerCount}M pax/year
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Routes Preview */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Popular US Routes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {POPULAR_US_ROUTES.slice(0, 6).map((route, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {route.from}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="font-mono text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {route.to}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {route.popularity}%
                      </div>
                      <div className="text-xs text-gray-500">popularity</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    {route.route}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">Test Instructions</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Try searching for: "LAX", "New York", "Chicago", "Miami"</li>
              <li>• Test typos: "Los Angelos", "Chicao", "Bosten"</li>
              <li>• Try partial matches: "Los", "San", "Atl"</li>
              <li>• Focus on empty input to see popular airports</li>
              <li>• Use keyboard navigation (arrows, enter, escape)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}