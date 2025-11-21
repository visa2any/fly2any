'use client';

/**
 * Interactive Airport Route Map Component
 *
 * Visualizes flight routes, alternative airports, and distances on an interactive map.
 *
 * INSTALLATION REQUIRED:
 * ```bash
 * npm install leaflet react-leaflet
 * npm install --save-dev @types/leaflet
 * ```
 *
 * Then add to next.config.js:
 * ```js
 * webpack: (config) => {
 *   config.externals = [...config.externals, { canvas: 'canvas' }];
 *   return config;
 * }
 * ```
 *
 * Features:
 * - OpenStreetMap tiles (100% FREE, no API key needed)
 * - Flight route visualization with curved paths
 * - Alternative airports within radius
 * - Distance/duration indicators
 * - Transport method markers
 * - Interactive popups with airport details
 * - Responsive design
 * - Dark mode support
 *
 * Powered by:
 * - Leaflet.js (open-source mapping library)
 * - OpenStreetMap (free map tiles)
 * - lib/data/airport-helpers.ts (distance calculations)
 * - lib/airports/alternative-airports-engine.ts (alternatives)
 *
 * @module AirportRouteMap
 */

import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Plane, Navigation, AlertCircle, Loader } from 'lucide-react';
import type { Airport } from '@/lib/data/airports-complete';

// Dynamically import Leaflet components (client-side only)
const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { ssr: false, loading: () => <MapLoadingPlaceholder /> }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then(mod => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then(mod => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then(mod => mod.Popup),
  { ssr: false }
);

const Polyline = dynamic(
  () => import('react-leaflet').then(mod => mod.Polyline),
  { ssr: false }
);

const Circle = dynamic(
  () => import('react-leaflet').then(mod => mod.Circle),
  { ssr: false }
);

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface AirportRouteMapProps {
  origin: Airport;
  destination: Airport;
  alternativeOrigins?: Airport[];
  alternativeDestinations?: Airport[];
  showRadius?: boolean; // Show 150km radius circle
  radiusKm?: number;
  height?: string;
  className?: string;
  theme?: 'light' | 'dark';
  lang?: 'en' | 'pt' | 'es';
}

interface MarkerData {
  airport: Airport;
  type: 'main-origin' | 'main-destination' | 'alt-origin' | 'alt-destination';
  distanceFromMain?: number;
}

// ============================================================================
// LOADING PLACEHOLDER
// ============================================================================

const MapLoadingPlaceholder: React.FC = () => (
  <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
    <div className="text-center">
      <Loader className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-3" />
      <p className="text-sm text-gray-600 dark:text-gray-400">Loading map...</p>
    </div>
  </div>
);

// ============================================================================
// TRANSLATIONS
// ============================================================================

const translations = {
  en: {
    mainRoute: 'Main Route',
    alternative: 'Alternative',
    distance: 'Distance',
    flightTime: 'Flight time',
    origin: 'Origin',
    destination: 'Destination',
    alternativesWithin: 'Alternatives within',
    mapNotAvailable: 'Map requires Leaflet library',
    installInstructions: 'Run: npm install leaflet react-leaflet',
  },
  pt: {
    mainRoute: 'Rota Principal',
    alternative: 'Alternativa',
    distance: 'Distância',
    flightTime: 'Tempo de voo',
    origin: 'Origem',
    destination: 'Destino',
    alternativesWithin: 'Alternativas dentro de',
    mapNotAvailable: 'Mapa requer biblioteca Leaflet',
    installInstructions: 'Execute: npm install leaflet react-leaflet',
  },
  es: {
    mainRoute: 'Ruta Principal',
    alternative: 'Alternativa',
    distance: 'Distancia',
    flightTime: 'Tiempo de vuelo',
    origin: 'Origen',
    destination: 'Destino',
    alternativesWithin: 'Alternativas dentro de',
    mapNotAvailable: 'El mapa requiere la biblioteca Leaflet',
    installInstructions: 'Ejecutar: npm install leaflet react-leaflet',
  }
};

// ============================================================================
// HELPERS
// ============================================================================

// Calculate center point between two coordinates
const calculateCenter = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): [number, number] => {
  return [(lat1 + lat2) / 2, (lon1 + lon2) / 2];
};

// Calculate zoom level based on distance
const calculateZoom = (distanceKm: number): number => {
  if (distanceKm < 500) return 6;
  if (distanceKm < 1500) return 5;
  if (distanceKm < 3000) return 4;
  if (distanceKm < 6000) return 3;
  return 2;
};

// Format duration
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AirportRouteMap: React.FC<AirportRouteMapProps> = ({
  origin,
  destination,
  alternativeOrigins = [],
  alternativeDestinations = [],
  showRadius = true,
  radiusKm = 150,
  height = '500px',
  className = '',
  theme = 'light',
  lang = 'en',
}) => {
  const t = translations[lang];
  const [isClient, setIsClient] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Check if running on client
  useEffect(() => {
    setIsClient(true);

    // Check if Leaflet is available
    const checkLeaflet = async () => {
      try {
        await import('leaflet');
        await import('react-leaflet');
        setLeafletLoaded(true);
      } catch (error) {
        console.warn('Leaflet not installed:', error);
        setLeafletLoaded(false);
      }
    };

    checkLeaflet();
  }, []);

  // Calculate distances and markers
  const mapData = useMemo(() => {
    const { calculateDistance } = require('@/lib/data/airport-helpers');

    const mainDistance = calculateDistance(
      origin.coordinates.lat,
      origin.coordinates.lon,
      destination.coordinates.lat,
      destination.coordinates.lon
    );

    const center = calculateCenter(
      origin.coordinates.lat,
      origin.coordinates.lon,
      destination.coordinates.lat,
      destination.coordinates.lon
    );

    const zoom = calculateZoom(mainDistance.distanceKm);

    // Estimate flight time (average 800 km/h)
    const flightTimeMinutes = Math.round((mainDistance.distanceKm / 800) * 60);

    // Build markers data
    const markers: MarkerData[] = [
      { airport: origin, type: 'main-origin' },
      { airport: destination, type: 'main-destination' },
    ];

    // Add alternative origins with distances
    alternativeOrigins.forEach(airport => {
      const dist = calculateDistance(
        origin.coordinates.lat,
        origin.coordinates.lon,
        airport.coordinates.lat,
        airport.coordinates.lon
      );
      markers.push({
        airport,
        type: 'alt-origin',
        distanceFromMain: dist.distanceKm,
      });
    });

    // Add alternative destinations with distances
    alternativeDestinations.forEach(airport => {
      const dist = calculateDistance(
        destination.coordinates.lat,
        destination.coordinates.lon,
        airport.coordinates.lat,
        airport.coordinates.lon
      );
      markers.push({
        airport,
        type: 'alt-destination',
        distanceFromMain: dist.distanceKm,
      });
    });

    return {
      mainDistance,
      center,
      zoom,
      flightTimeMinutes,
      markers,
    };
  }, [origin, destination, alternativeOrigins, alternativeDestinations]);

  // If not client-side or Leaflet not loaded, show fallback
  if (!isClient || !leafletLoaded) {
    return (
      <div
        className={`w-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center px-6">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {t.mapNotAvailable}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            {t.installInstructions}
          </p>
          <code className="text-xs bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded">
            npm install leaflet react-leaflet @types/leaflet
          </code>

          {/* Static Route Info */}
          <div className="mt-6 pt-6 border-t border-gray-300 dark:border-gray-700 text-left max-w-sm mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{origin.emoji}</span>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{origin.code}</div>
                  <div className="text-xs text-gray-500">{origin.city}</div>
                </div>
              </div>
              <Plane className="w-5 h-5 text-blue-600 transform rotate-45" />
              <div className="flex items-center gap-2">
                <span className="text-2xl">{destination.emoji}</span>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{destination.code}</div>
                  <div className="text-xs text-gray-500">{destination.city}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 mb-1">{t.distance}</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {mapData.mainDistance.distanceKm} km
                </div>
                <div className="text-xs text-gray-500">
                  {mapData.mainDistance.distanceMiles} mi
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 mb-1">{t.flightTime}</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {formatDuration(mapData.flightTimeMinutes)}
                </div>
                <div className="text-xs text-gray-500">~{Math.round(mapData.flightTimeMinutes)} min</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Map tile layers
  const tileUrl = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const tileAttribution = theme === 'dark'
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <div className={`w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 ${className}`} style={{ height }}>
      <MapContainer
        center={mapData.center as [number, number]}
        zoom={mapData.zoom}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution={tileAttribution}
          url={tileUrl}
        />

        {/* Main Route Line */}
        <Polyline
          positions={[
            [origin.coordinates.lat, origin.coordinates.lon],
            [destination.coordinates.lat, destination.coordinates.lon],
          ]}
          pathOptions={{
            color: '#0087FF',
            weight: 3,
            opacity: 0.8,
            dashArray: '10, 5',
          }}
        />

        {/* Radius circles around main airports */}
        {showRadius && (
          <>
            <Circle
              center={[origin.coordinates.lat, origin.coordinates.lon]}
              radius={radiusKm * 1000} // Convert to meters
              pathOptions={{
                color: '#10B981',
                weight: 1,
                opacity: 0.3,
                fillOpacity: 0.05,
              }}
            />
            <Circle
              center={[destination.coordinates.lat, destination.coordinates.lon]}
              radius={radiusKm * 1000}
              pathOptions={{
                color: '#F59E0B',
                weight: 1,
                opacity: 0.3,
                fillOpacity: 0.05,
              }}
            />
          </>
        )}

        {/* Airport Markers */}
        {mapData.markers.map((markerData, index) => {
          const { airport, type, distanceFromMain } = markerData;

          // Marker colors
          const markerColor =
            type === 'main-origin' ? '#10B981' :
            type === 'main-destination' ? '#F59E0B' :
            type === 'alt-origin' ? '#6EE7B7' :
            '#FCD34D';

          // Create custom icon (simplified for SSR compatibility)
          const icon = typeof window !== 'undefined' && (window as any).L ? {
            icon: (window as any).L.divIcon({
              className: 'custom-div-icon',
              html: `<div style="background-color: ${markerColor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })
          } : {};

          return (
            <Marker
              key={`${airport.code}-${index}`}
              position={[airport.coordinates.lat, airport.coordinates.lon]}
              {...icon}
            >
              <Popup>
                <div className="p-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{airport.emoji}</span>
                    <div>
                      <div className="font-bold text-gray-900">{airport.code}</div>
                      <div className="text-xs text-gray-600">{airport.city}, {airport.country}</div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-700">
                    <div className="font-semibold">{airport.name}</div>

                    {distanceFromMain && (
                      <div className="mt-2 text-xs text-gray-600">
                        {distanceFromMain.toFixed(1)} km from main airport
                      </div>
                    )}

                    {(type === 'main-origin' || type === 'main-destination') && (
                      <div className="mt-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          type === 'main-origin' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {type === 'main-origin' ? t.origin : t.destination}
                        </span>
                      </div>
                    )}

                    {(type === 'alt-origin' || type === 'alt-destination') && (
                      <div className="mt-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                          {t.alternative}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 text-xs z-[1000]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-gray-700 dark:text-gray-300">{t.origin}</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span className="text-gray-700 dark:text-gray-300">{t.destination}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-blue-600" style={{ borderTop: '2px dashed' }}></div>
          <span className="text-gray-700 dark:text-gray-300">{t.mainRoute}</span>
        </div>
      </div>
    </div>
  );
};

export default AirportRouteMap;
