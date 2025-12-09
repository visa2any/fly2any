'use client';

/**
 * Ultra-compact mobile flight card skeleton
 * Matches FlightCardMobile dimensions for seamless loading experience
 * Uses Tailwind's built-in animate-pulse for simplicity
 */
export default function FlightCardMobileSkeleton() {
  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 mb-3 animate-pulse">
      {/* HEADER - Airline + Actions */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100">
        {/* Left: Airline info */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-6 h-6 bg-gray-300 rounded-full flex-shrink-0" />
          <div className="h-4 w-24 bg-gray-300 rounded" />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <div className="w-9 h-9 bg-gray-300 rounded-full" />
          <div className="h-6 w-16 bg-gray-300 rounded-full" />
          <div className="w-9 h-9 bg-gray-300 rounded-full" />
        </div>
      </div>

      {/* OUTBOUND ROUTE */}
      <div className="px-3 py-2 border-b border-gray-100">
        <div className="flex items-center justify-between mb-1">
          <div className="h-3 w-12 bg-gray-300 rounded" />
          <div className="h-3 w-16 bg-gray-300 rounded" />
        </div>
        <div className="flex items-center">
          {/* Departure */}
          <div className="flex-shrink-0 space-y-1">
            <div className="h-5 w-12 bg-gray-300 rounded" />
            <div className="h-3 w-8 bg-gray-300 rounded" />
          </div>

          {/* Flight Path */}
          <div className="flex-1 mx-2">
            <div className="relative h-px bg-gray-300">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gray-300 rounded-full" />
            </div>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <div className="h-3 w-12 bg-gray-300 rounded" />
              <div className="h-3 w-12 bg-gray-300 rounded" />
            </div>
          </div>

          {/* Arrival */}
          <div className="flex-shrink-0 space-y-1 text-right">
            <div className="h-5 w-12 bg-gray-300 rounded" />
            <div className="h-3 w-8 bg-gray-300 rounded ml-auto" />
          </div>
        </div>
      </div>

      {/* RETURN ROUTE - Conditional like in FlightCardMobile */}
      <div className="px-3 py-2 border-b border-gray-100">
        <div className="flex items-center justify-between mb-1">
          <div className="h-3 w-12 bg-gray-300 rounded" />
          <div className="h-3 w-16 bg-gray-300 rounded" />
        </div>
        <div className="flex items-center">
          {/* Departure */}
          <div className="flex-shrink-0 space-y-1">
            <div className="h-5 w-12 bg-gray-300 rounded" />
            <div className="h-3 w-8 bg-gray-300 rounded" />
          </div>

          {/* Flight Path */}
          <div className="flex-1 mx-2">
            <div className="relative h-px bg-gray-300">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gray-300 rounded-full" />
            </div>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <div className="h-3 w-12 bg-gray-300 rounded" />
              <div className="h-3 w-12 bg-gray-300 rounded" />
            </div>
          </div>

          {/* Arrival */}
          <div className="flex-shrink-0 space-y-1 text-right">
            <div className="h-5 w-12 bg-gray-300 rounded" />
            <div className="h-3 w-8 bg-gray-300 rounded ml-auto" />
          </div>
        </div>
      </div>

      {/* PRICE + CTA FOOTER */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border-t border-gray-100">
        {/* Price */}
        <div className="space-y-1">
          <div className="h-6 w-20 bg-gray-300 rounded" />
          <div className="h-2 w-24 bg-gray-300 rounded" />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <div className="h-7 w-16 bg-gray-300 rounded" />
          <div className="h-7 w-20 bg-gray-300 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function MultipleFlightCardMobileSkeletons({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <FlightCardMobileSkeleton key={index} />
      ))}
    </div>
  );
}
