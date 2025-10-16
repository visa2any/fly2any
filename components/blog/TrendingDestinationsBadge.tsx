'use client';

interface TrendingDestination {
  name: string;
  bookings24h: number;
  trend: 'up' | 'down' | 'hot';
}

interface TrendingDestinationsBadgeProps {
  destinations: TrendingDestination[];
  displayCount?: number;
  onDestinationClick?: (destination: string) => void;
}

export default function TrendingDestinationsBadge({
  destinations,
  displayCount = 5,
  onDestinationClick
}: TrendingDestinationsBadgeProps) {
  const displayedDestinations = destinations.slice(0, displayCount);

  const getTrendConfig = (trend: 'up' | 'down' | 'hot') => {
    switch (trend) {
      case 'hot':
        return {
          icon: '🔥',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          arrow: '',
        };
      case 'up':
        return {
          icon: '↗️',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          arrow: '↗️',
        };
      case 'down':
        return {
          icon: '→',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          arrow: '→',
        };
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-100 max-w-md">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
        <span className="text-2xl animate-flame-pulse">🔥</span>
        <h3 className="font-bold text-lg text-gray-800">TRENDING NOW</h3>
      </div>

      {/* Destinations list */}
      <div className="space-y-2">
        {displayedDestinations.map((destination, index) => {
          const config = getTrendConfig(destination.trend);

          return (
            <button
              key={destination.name}
              onClick={() => onDestinationClick?.(destination.name)}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-all hover:scale-102 hover:shadow-md ${config.bgColor} group`}
            >
              {/* Left side - Rank and destination */}
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-400 text-sm w-6">
                  #{index + 1}
                </span>
                <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {destination.name}
                </span>
              </div>

              {/* Right side - Trend info */}
              <div className={`flex items-center gap-2 ${config.color}`}>
                <span className={`text-xl ${destination.trend === 'hot' ? 'animate-flame-pulse' : ''}`}>
                  {config.icon}
                </span>
                <div className="text-right">
                  <p className="font-bold text-sm">
                    {destination.trend === 'up' && '+'}
                    {destination.bookings24h}
                  </p>
                  <p className="text-xs opacity-75">today</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-500">
          Updated in real-time based on user searches
        </p>
      </div>
    </div>
  );
}
