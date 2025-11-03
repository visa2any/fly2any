'use client';

interface PriceCalendarLegendProps {
  minPrice: number | null;
  maxPrice: number | null;
  averagePrice: number | null;
  currency?: string;
  coverage?: number; // Percentage of dates with prices
}

export function PriceCalendarLegend({
  minPrice,
  maxPrice,
  averagePrice,
  currency = 'USD',
  coverage = 0,
}: PriceCalendarLegendProps) {
  return (
    <div className="space-y-3">
      {/* Price range legend */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-100 border-2 border-green-400 rounded" />
            <span className="text-gray-600">Lowest</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-yellow-50 border-2 border-yellow-300 rounded" />
            <span className="text-gray-600">Average</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-red-100 border-2 border-red-400 rounded" />
            <span className="text-gray-600">Highest</span>
          </div>
        </div>

        {/* Cheapest indicator */}
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-[8px] font-bold">
            ✓
          </div>
          <span className="text-gray-600">Best deal</span>
        </div>
      </div>

      {/* Price statistics */}
      {minPrice !== null && maxPrice !== null && (
        <div className="flex items-center justify-between gap-4 text-xs bg-gray-50 rounded-lg p-2">
          <div className="flex-1">
            <div className="text-gray-500 text-[10px] uppercase tracking-wide mb-0.5">Lowest</div>
            <div className="font-bold text-green-700">${minPrice.toFixed(0)}</div>
          </div>
          {averagePrice !== null && (
            <div className="flex-1 text-center">
              <div className="text-gray-500 text-[10px] uppercase tracking-wide mb-0.5">Average</div>
              <div className="font-bold text-gray-700">${averagePrice.toFixed(0)}</div>
            </div>
          )}
          <div className="flex-1 text-right">
            <div className="text-gray-500 text-[10px] uppercase tracking-wide mb-0.5">Highest</div>
            <div className="font-bold text-red-700">${maxPrice.toFixed(0)}</div>
          </div>
        </div>
      )}

      {/* Coverage indicator */}
      {coverage > 0 && coverage < 100 && (
        <div className="flex items-center gap-2 text-[10px] text-gray-500 bg-blue-50 rounded px-2 py-1">
          <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>
            {coverage < 30
              ? 'Limited price data. Perform searches to see more prices.'
              : `${coverage.toFixed(0)}% of dates have price data from recent searches`
            }
          </span>
        </div>
      )}

      {/* No data message */}
      {coverage === 0 && (
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>
            No price data available. Search for flights to populate the calendar with prices.
          </span>
        </div>
      )}
    </div>
  );
}
