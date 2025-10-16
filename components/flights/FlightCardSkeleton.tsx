export default function FlightCardSkeleton() {
  return (
    <div className="bg-white/40 backdrop-blur-sm rounded-2xl shadow-lg p-6 border-2 border-gray-100 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Flight Info Skeleton */}
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            {/* Departure Time & Airport */}
            <div className="text-center space-y-2">
              <div className="h-9 w-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-lg animate-shimmer"></div>
              <div className="h-4 w-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded mx-auto animate-shimmer"></div>
            </div>

            {/* Flight Path */}
            <div className="flex-1 flex flex-col items-center">
              <div className="h-3 w-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded mb-1 animate-shimmer"></div>
              <div className="w-full h-px bg-gray-200 relative">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                  <div className="w-5 h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-full animate-shimmer"></div>
                </div>
              </div>
              <div className="h-3 w-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded mt-1 animate-shimmer"></div>
            </div>

            {/* Arrival Time & Airport */}
            <div className="text-center space-y-2">
              <div className="h-9 w-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-lg animate-shimmer"></div>
              <div className="h-4 w-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded mx-auto animate-shimmer"></div>
            </div>
          </div>

          {/* Tags Skeleton */}
          <div className="flex flex-wrap gap-2">
            <div className="h-6 w-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-full animate-shimmer"></div>
            <div className="h-6 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-full animate-shimmer"></div>
          </div>
        </div>

        {/* Price and Action Skeleton */}
        <div className="md:w-48 text-center md:text-right space-y-3">
          <div className="h-10 w-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-lg mx-auto md:ml-auto animate-shimmer"></div>
          <div className="h-4 w-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded mx-auto md:ml-auto animate-shimmer"></div>
          <div className="h-12 w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-xl animate-shimmer"></div>
        </div>
      </div>
    </div>
  );
}

export function MultipleFlightCardSkeletons({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <FlightCardSkeleton key={index} />
      ))}
    </div>
  );
}
