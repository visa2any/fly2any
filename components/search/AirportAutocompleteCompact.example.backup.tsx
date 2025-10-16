'use client';

import { useState } from 'react';
import { AirportAutocompleteCompact } from './AirportAutocompleteCompact';

/**
 * Example usage of AirportAutocompleteCompact
 *
 * This component is designed for inline search bars where space is limited.
 * Perfect for compact search forms, navigation bars, or filter panels.
 */
export function AirportAutocompleteCompactExample() {
  const [fromAirport, setFromAirport] = useState('');
  const [toAirport, setToAirport] = useState('');

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Compact Airport Autocomplete Example
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* From Airport */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              From
            </label>
            <AirportAutocompleteCompact
              placeholder="Departure city"
              value={fromAirport}
              onChange={(value, airport) => {
                setFromAirport(value);
                if (airport) {
                  console.log('Selected departure:', airport);
                }
              }}
            />
          </div>

          {/* To Airport */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              To
            </label>
            <AirportAutocompleteCompact
              placeholder="Arrival city"
              value={toAirport}
              onChange={(value, airport) => {
                setToAirport(value);
                if (airport) {
                  console.log('Selected arrival:', airport);
                }
              }}
            />
          </div>
        </div>

        {/* Display selected values */}
        {(fromAirport || toAirport) && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Selected Values:
            </h3>
            <div className="space-y-1 text-sm text-gray-600">
              {fromAirport && <div>From: {fromAirport}</div>}
              {toAirport && <div>To: {toAirport}</div>}
            </div>
          </div>
        )}
      </div>

      {/* Usage Example */}
      <div className="bg-gray-900 text-white rounded-2xl p-6">
        <h3 className="text-lg font-bold mb-3">Usage Example:</h3>
        <pre className="text-xs overflow-x-auto">
{`import { AirportAutocompleteCompact } from '@/components/search/AirportAutocompleteCompact';

function MySearchBar() {
  const [airport, setAirport] = useState('');

  return (
    <AirportAutocompleteCompact
      placeholder="Select airport"
      value={airport}
      onChange={(value, airport) => {
        setAirport(value);
        if (airport) {
          console.log('Selected:', airport.code);
        }
      }}
      className="w-64"
    />
  );
}`}
        </pre>
      </div>
    </div>
  );
}
