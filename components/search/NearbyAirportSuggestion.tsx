'use client';

interface Airport {
  code: string;
  name: string;
  distance: string;
  savings: number;
}

interface Props {
  currentAirport: string;
  nearbyAirports: Airport[];
  onSelect: (airport: Airport) => void;
}

export function NearbyAirportSuggestion({ currentAirport, nearbyAirports, onSelect }: Props) {
  if (nearbyAirports.length === 0) return null;

  const bestSaving = nearbyAirports.reduce((max, airport) =>
    airport.savings > max.savings ? airport : max
  , nearbyAirports[0]);

  return (
    <div className="bg-gradient-to-r from-secondary-50 to-primary-50 p-4 rounded-2xl border-2 border-secondary-200">
      <div className="flex items-start gap-3">
        <div className="text-2xl">💡</div>
        <div className="flex-1">
          <div className="font-bold text-gray-900 mb-2">
            Save ${bestSaving.savings} by flying from a nearby airport
          </div>

          <div className="space-y-2">
            {nearbyAirports.map((airport) => (
              <button
                key={airport.code}
                type="button"
                onClick={() => onSelect(airport)}
                className="w-full p-3 bg-white rounded-xl hover:shadow-lg transition-all flex items-center justify-between group"
              >
                <div className="text-left">
                  <div className="font-semibold text-gray-900">
                    {airport.code} - {airport.name}
                  </div>
                  <div className="text-xs text-gray-500">{airport.distance} away</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-lg font-bold text-success">-${airport.savings}</div>
                    <div className="text-xs text-gray-500">cheaper</div>
                  </div>
                  <svg className="w-5 h-5 text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
