/**
 * 🌎 AMERICAS TRAVEL EXPERIENCE DASHBOARD
 * Unified dashboard for comprehensive Americas travel features
 * Covers North America, Central America, South America, and Caribbean
 */

'use client';

import React, { useState } from 'react';
import { NorthCentralAmericaAirport } from '@/lib/airports/north-central-america-airports-database';

// Import all regional components
import USAirportFeatures from './USAirportFeatures';
import NorthAmericaAirportFeatures from './NorthAmericaAirportFeatures';
import CentralAmericaAirportFeatures from './CentralAmericaAirportFeatures';
import CaribbeanAirportFeatures from './CaribbeanAirportFeatures';

// Import baggage policy components
import USBaggagePolicies from './USBaggagePolicies';
import NorthAmericaBaggagePolicies from './NorthAmericaBaggagePolicies';
import CentralAmericaBaggagePolicies from './CentralAmericaBaggagePolicies';
import CaribbeanBaggagePolicies from './CaribbeanBaggagePolicies';

interface AmericasTravelDashboardProps {
  airport: NorthCentralAmericaAirport;
  className?: string;
  defaultView?: 'overview' | 'airport-features' | 'baggage' | 'regional-guide';
}

export default function AmericasTravelDashboard({ 
  airport, 
  className = '',
  defaultView = 'overview'
}: AmericasTravelDashboardProps) {
  const [activeView, setActiveView] = useState(defaultView);

  // Determine region and appropriate components
  const getRegionInfo = () => {
    const country = airport.country;
    
    if (country === 'United States') {
      return {
        region: 'United States',
        flag: '🇺🇸',
        color: 'blue',
        features: 'TSA PreCheck, Global Entry, CLEAR',
        description: 'Advanced security programs and extensive domestic network'
      };
    } else if (country === 'Canada') {
      return {
        region: 'Canada',
        flag: '🇨🇦',
        color: 'red',
        features: 'NEXUS, CATSA+, Aeroplan',
        description: 'Cross-border programs and metric measurements'
      };
    } else if (country === 'Mexico') {
      return {
        region: 'Mexico',
        flag: '🇲🇽',
        color: 'green',
        features: 'SENTRI, USD currency, Regional hubs',
        description: 'North American integration with regional connectivity'
      };
    } else if (['Guatemala', 'Belize', 'El Salvador', 'Honduras', 'Nicaragua', 'Costa Rica', 'Panama'].includes(country)) {
      return {
        region: 'Central America',
        flag: '🌎',
        color: 'emerald',
        features: 'CA-4 Agreement, Eco-tourism, Regional airlines',
        description: 'Multi-country agreements and adventure travel'
      };
    } else if (['Puerto Rico', 'Jamaica', 'Cuba', 'Dominican Republic', 'Haiti', 'Trinidad and Tobago', 'Barbados', 'Bahamas', 'Aruba', 'Curaçao', 'Saint Lucia', 'Martinique', 'Guadeloupe', 'Antigua and Barbuda', 'Saint Kitts and Nevis', 'Dominica', 'Saint Vincent and the Grenadines', 'Grenada'].includes(country)) {
      return {
        region: 'Caribbean',
        flag: '🏝️',
        color: 'cyan',
        features: 'Island paradise, Duty-free, Tropical climate',
        description: 'Island-specific travel requirements and seasonal considerations'
      };
    } else {
      return {
        region: 'Americas',
        flag: '🌎',
        color: 'indigo',
        features: 'Regional connectivity',
        description: 'Comprehensive Americas coverage'
      };
    }
  };

  const regionInfo = getRegionInfo();

  const views = [
    { id: 'overview', label: 'Overview', icon: '🌎' },
    { id: 'airport-features', label: 'Airport Features', icon: '✈️' },
    { id: 'baggage', label: 'Baggage Policies', icon: '🧳' },
    { id: 'regional-guide', label: 'Regional Guide', icon: '📋' }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Region Header */}
      <div className={`bg-${regionInfo.color}-50 border border-${regionInfo.color}-200 rounded-lg p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 bg-${regionInfo.color}-600 rounded-xl flex items-center justify-center`}>
              <span className="text-white text-2xl">{regionInfo.flag}</span>
            </div>
            <div>
              <h2 className={`text-2xl font-bold text-${regionInfo.color}-900`}>{regionInfo.region}</h2>
              <p className={`text-${regionInfo.color}-700`}>{airport.name} • {airport.city}</p>
            </div>
          </div>
          {airport.isInternational && (
            <span className={`px-4 py-2 bg-${regionInfo.color}-100 text-${regionInfo.color}-800 text-sm font-medium rounded-full`}>
              International Gateway
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className={`font-semibold text-${regionInfo.color}-900 mb-2`}>Key Features</h3>
            <p className={`text-${regionInfo.color}-700 text-sm`}>{regionInfo.features}</p>
          </div>
          <div>
            <h3 className={`font-semibold text-${regionInfo.color}-900 mb-2`}>Travel Benefits</h3>
            <p className={`text-${regionInfo.color}-700 text-sm`}>{regionInfo.description}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{airport.passengerCount}M</div>
          <div className="text-sm text-gray-600">Annual Passengers</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{airport.airlines?.length || 'Multiple'}</div>
          <div className="text-sm text-gray-600">Airlines Operating</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{airport.terminals}</div>
          <div className="text-sm text-gray-600">Terminals</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{airport.runways}</div>
          <div className="text-sm text-gray-600">Runways</div>
        </div>
      </div>

      {/* Popular Destinations */}
      {airport.popularDestinations && airport.popularDestinations.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Routes</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {airport.popularDestinations.slice(0, 12).map((destination: any) => (
              <div key={destination} className={`text-center p-3 bg-${regionInfo.color}-50 rounded-lg border border-${regionInfo.color}-200`}>
                <div className={`font-semibold text-${regionInfo.color}-900`}>{destination}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ground Transport */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ground Transportation</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {airport.groundTransport.map((transport: any) => (
            <div key={transport} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <span className="text-xl">
                {transport === 'metro' && '🚇'}
                {transport === 'train' && '🚆'}
                {transport === 'bus' && '🚌'}
                {transport === 'taxi' && '🚕'}
                {transport === 'rideshare' && '📱'}
                {transport === 'rental_car' && '🚗'}
              </span>
              <span className="text-sm font-medium text-gray-700 capitalize">
                {transport.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Available Amenities */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Airport Amenities</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {airport.amenities.map((amenity: any) => (
            <div key={amenity} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <span className="text-xl">
                {amenity === 'wifi' && '📶'}
                {amenity === 'lounges' && '🏛️'}
                {amenity === 'shopping' && '🛍️'}
                {amenity === 'dining' && '🍽️'}
                {amenity === 'hotels' && '🏨'}
                {amenity === 'spa' && '💆'}
                {amenity === 'conference' && '💼'}
              </span>
              <span className="text-sm font-medium text-gray-700 capitalize">{amenity}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAirportFeatures = () => {
    // Render appropriate regional component based on country
    const country = airport.country;
    
    if (country === 'United States') {
      return <USAirportFeatures airport={airport as any} showDetailedInfo={true} />;
    } else if (['Canada', 'Mexico'].includes(country)) {
      return <NorthAmericaAirportFeatures airport={airport} showDetailedInfo={true} />;
    } else if (['Guatemala', 'Belize', 'El Salvador', 'Honduras', 'Nicaragua', 'Costa Rica', 'Panama'].includes(country)) {
      return <CentralAmericaAirportFeatures airport={airport} showDetailedInfo={true} />;
    } else if (['Puerto Rico', 'Jamaica', 'Cuba', 'Dominican Republic', 'Haiti', 'Trinidad and Tobago', 'Barbados', 'Bahamas', 'Aruba', 'Curaçao', 'Saint Lucia', 'Martinique', 'Guadeloupe', 'Antigua and Barbuda', 'Saint Kitts and Nevis', 'Dominica', 'Saint Vincent and the Grenadines', 'Grenada'].includes(country)) {
      return <CaribbeanAirportFeatures airport={airport} showDetailedInfo={true} />;
    } else {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Regional Features Coming Soon</h3>
          <p className="text-gray-600">Comprehensive travel features for this region are being developed.</p>
        </div>
      );
    }
  };

  const renderBaggagePolicies = () => {
    const country = airport.country;
    
    if (country === 'United States') {
      return <USBaggagePolicies airlines={airport.airlines?.slice(0, 4)} />;
    } else if (['Canada', 'Mexico'].includes(country)) {
      return <NorthAmericaBaggagePolicies airlines={airport.airlines?.slice(0, 4)} />;
    } else if (['Guatemala', 'Belize', 'El Salvador', 'Honduras', 'Nicaragua', 'Costa Rica', 'Panama'].includes(country)) {
      return <CentralAmericaBaggagePolicies airlines={airport.airlines?.slice(0, 4)} />;
    } else if (['Puerto Rico', 'Jamaica', 'Cuba', 'Dominican Republic', 'Haiti', 'Trinidad and Tobago', 'Barbados', 'Bahamas', 'Aruba', 'Curaçao', 'Saint Lucia', 'Martinique', 'Guadeloupe', 'Antigua and Barbuda', 'Saint Kitts and Nevis', 'Dominica', 'Saint Vincent and the Grenadines', 'Grenada'].includes(country)) {
      return <CaribbeanBaggagePolicies airlines={airport.airlines?.slice(0, 4)} />;
    } else {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Baggage Policies Coming Soon</h3>
          <p className="text-gray-600">Regional baggage policy information is being developed.</p>
        </div>
      );
    }
  };

  const renderRegionalGuide = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">📍 {regionInfo.region} Travel Guide</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">🗺️ Regional Highlights</h4>
            <div className="space-y-2 text-sm text-gray-700">
              {regionInfo.region === 'United States' && (
                <>
                  <div>• TSA PreCheck and Global Entry for faster security</div>
                  <div>• Extensive domestic flight network</div>
                  <div>• Major loyalty programs with excellent benefits</div>
                  <div>• Advanced airport facilities and technology</div>
                </>
              )}
              {regionInfo.region === 'Canada' && (
                <>
                  <div>• NEXUS program for US-Canada border crossing</div>
                  <div>• Metric measurements and CAD currency</div>
                  <div>• Excellent connectivity to major US cities</div>
                  <div>• Air Canada Aeroplan program benefits</div>
                </>
              )}
              {regionInfo.region === 'Mexico' && (
                <>
                  <div>• SENTRI program for US-Mexico border crossing</div>
                  <div>• USD widely accepted in tourist areas</div>
                  <div>• Copa Airlines and Aeromexico hubs</div>
                  <div>• Strong North American flight connections</div>
                </>
              )}
              {regionInfo.region === 'Central America' && (
                <>
                  <div>• CA-4 Agreement for multi-country travel</div>
                  <div>• Eco-tourism and adventure travel destination</div>
                  <div>• Panama City hub for regional connections</div>
                  <div>• Spanish language and USD acceptance</div>
                </>
              )}
              {regionInfo.region === 'Caribbean' && (
                <>
                  <div>• US territories require no passport for Americans</div>
                  <div>• Hurricane season considerations (June-November)</div>
                  <div>• Duty-free shopping opportunities</div>
                  <div>• Inter-island flight connections available</div>
                </>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">💡 Travel Tips</h4>
            <div className="space-y-2 text-sm text-gray-700">
              {regionInfo.region === 'United States' && (
                <>
                  <div>• Apply for TSA PreCheck for $78 (5 years)</div>
                  <div>• Use airline credit cards for free checked bags</div>
                  <div>• Book domestic flights 1-3 months in advance</div>
                  <div>• Consider regional hubs for better connections</div>
                </>
              )}
              {regionInfo.region === 'Canada' && (
                <>
                  <div>• NEXUS costs $50 and includes Global Entry</div>
                  <div>• Pack for variable weather conditions</div>
                  <div>• Canadian credit cards offer good travel benefits</div>
                  <div>• Metric system used for measurements</div>
                </>
              )}
              {regionInfo.region === 'Mexico' && (
                <>
                  <div>• Carry passport for international flights</div>
                  <div>• Tourist tax usually included in ticket price</div>
                  <div>• Consider travel insurance for activities</div>
                  <div>• Learn basic Spanish phrases</div>
                </>
              )}
              {regionInfo.region === 'Central America' && (
                <>
                  <div>• Single visa covers CA-4 countries (90 days)</div>
                  <div>• Pack for both rainy and dry seasons</div>
                  <div>• Carry proof of onward travel</div>
                  <div>• Yellow fever vaccine may be required</div>
                </>
              )}
              {regionInfo.region === 'Caribbean' && (
                <>
                  <div>• Hurricane season affects pricing and weather</div>
                  <div>• Pack reef-safe sunscreen (some islands ban others)</div>
                  <div>• US territories use USD and English</div>
                  <div>• Consider all-inclusive packages for value</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h4 className="font-semibold text-red-900 mb-3">🚨 Emergency Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-red-800">
          <div>
            <div className="font-medium mb-1">Emergency Services</div>
            <div>Police/Fire/Medical: 911 (US/Canada), varies by country</div>
          </div>
          <div>
            <div className="font-medium mb-1">Embassy Assistance</div>
            <div>Contact your country's embassy for citizen services</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`bg-gray-50 rounded-xl border border-gray-200 ${className}`}>
      {/* Dashboard Header */}
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className={`w-10 h-10 bg-${regionInfo.color}-600 rounded-lg flex items-center justify-center`}>
              <span className="text-white text-xl">{regionInfo.flag}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Americas Travel Dashboard</h1>
              <p className="text-gray-600">{airport.name} • {regionInfo.region}</p>
            </div>
          </div>
        </div>

        {/* View Navigation */}
        <div className="flex border-b border-gray-200">
          {views.map((view: any) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id as any)}
              className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeView === view.id
                  ? `border-${regionInfo.color}-600 text-${regionInfo.color}-600`
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{view.icon}</span>
              <span>{view.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* View Content */}
      <div className="p-6">
        {activeView === 'overview' && renderOverview()}
        {activeView === 'airport-features' && renderAirportFeatures()}
        {activeView === 'baggage' && renderBaggagePolicies()}
        {activeView === 'regional-guide' && renderRegionalGuide()}
      </div>

      {/* Footer */}
      <div className={`p-4 bg-${regionInfo.color}-50 rounded-b-xl border-t border-${regionInfo.color}-200`}>
        <div className="text-center text-sm text-gray-600">
          <div className="font-medium">🌎 Comprehensive Americas Travel Coverage</div>
          <div>North America • Central America • South America • Caribbean</div>
        </div>
      </div>
    </div>
  );
}