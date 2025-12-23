/**
 * NoFlightsAvailable Component
 *
 * Displays when a route has no current inventory.
 * Prevents soft 404 by showing valuable alternative content.
 * Does NOT include Offer schema - only BreadcrumbList and FAQ.
 */

import Link from 'next/link';
import { Plane, MapPin, Calendar, Bell, ArrowRight } from 'lucide-react';

interface NoFlightsAvailableProps {
  origin: string;
  destination: string;
  originName: string;
  destinationName: string;
  alternativeRoutes?: Array<{
    origin: string;
    destination: string;
    label: string;
  }>;
}

export function NoFlightsAvailable({
  origin,
  destination,
  originName,
  destinationName,
  alternativeRoutes,
}: NoFlightsAvailableProps) {
  // Generate default alternatives if not provided
  const alternatives = alternativeRoutes || [
    { origin: destination, destination: origin, label: 'Return flight' },
    { origin: 'JFK', destination, label: `New York to ${destination}` },
    { origin: 'LAX', destination, label: `Los Angeles to ${destination}` },
    { origin, destination: 'MIA', label: `${origin} to Miami` },
  ];

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-200">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 bg-amber-100 rounded-xl">
          <Plane className="w-8 h-8 text-amber-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            No Direct Flights Currently Available
          </h2>
          <p className="text-gray-600 mt-1">
            {originName} ({origin}) → {destinationName} ({destination})
          </p>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-white rounded-xl p-6 mb-6">
        <p className="text-gray-700 leading-relaxed">
          We're currently unable to find direct flights on this route. This could be due to:
        </p>
        <ul className="mt-3 space-y-2 text-gray-600">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-400 rounded-full" />
            Seasonal route availability
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-400 rounded-full" />
            Limited airline inventory for selected dates
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-400 rounded-full" />
            Route temporarily suspended
          </li>
        </ul>
      </div>

      {/* CTA: Search Different Dates */}
      <div className="bg-blue-600 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center gap-3 mb-3">
          <Calendar className="w-6 h-6" />
          <h3 className="text-xl font-semibold">Try Different Dates</h3>
        </div>
        <p className="text-blue-100 mb-4">
          Flight availability changes daily. Search with flexible dates to find options.
        </p>
        <Link
          href={`/flights?origin=${origin}&destination=${destination}`}
          className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
        >
          Search {origin} → {destination}
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

      {/* Alternative Routes */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Alternative Routes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {alternatives.slice(0, 4).map((route, idx) => (
            <Link
              key={idx}
              href={`/flights/${route.origin.toLowerCase()}-to-${route.destination.toLowerCase()}`}
              className="flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div>
                <span className="font-semibold text-gray-900">
                  {route.origin} → {route.destination}
                </span>
                <p className="text-sm text-gray-500">{route.label}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </Link>
          ))}
        </div>
      </div>

      {/* Price Alert CTA */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Bell className="w-6 h-6" />
          <h3 className="text-xl font-semibold">Get Price Alerts</h3>
        </div>
        <p className="text-purple-100 mb-4">
          Be notified when flights become available on this route.
        </p>
        <Link
          href={`/account/alerts?route=${origin}-${destination}`}
          className="inline-flex items-center gap-2 bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
        >
          Set Up Alert
          <Bell className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}

export default NoFlightsAvailable;
