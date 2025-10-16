import { MultipleFlightCardSkeletons } from './FlightCardSkeleton';

export default function ResultsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Filters Sidebar Skeleton */}
        <aside className="lg:col-span-1 space-y-4">
          {/* Filter Header */}
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl shadow-lg p-6 border-2 border-gray-100">
            <div className="h-6 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer mb-4"></div>

            {/* Filter Sections */}
            {[1, 2, 3].map((section) => (
              <div key={section} className="mb-6 last:mb-0">
                <div className="h-5 w-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer mb-3"></div>
                <div className="space-y-2">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer"></div>
                      <div className="h-4 flex-1 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Price Range Filter Skeleton */}
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl shadow-lg p-6 border-2 border-gray-100">
            <div className="h-5 w-28 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer mb-4"></div>
            <div className="space-y-3">
              <div className="h-2 w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-full animate-shimmer"></div>
              <div className="flex justify-between">
                <div className="h-4 w-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer"></div>
                <div className="h-4 w-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer"></div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Results Area */}
        <main className="lg:col-span-3 space-y-6">
          {/* Search Summary Bar Skeleton */}
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl shadow-lg p-4 border-2 border-gray-100 animate-pulse">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <div className="h-6 w-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer"></div>
                <div className="h-4 w-64 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer"></div>
              </div>
              <div className="h-10 w-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-xl animate-shimmer"></div>
            </div>
          </div>

          {/* Sort Bar Skeleton */}
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl shadow-lg p-4 border-2 border-gray-100 animate-pulse">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="h-5 w-40 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer"></div>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-10 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-xl animate-shimmer"
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* Results Header Skeleton */}
          <div className="flex items-center justify-between mb-4">
            <div className="h-8 w-56 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer"></div>
          </div>

          {/* Flight Cards Skeleton */}
          <MultipleFlightCardSkeletons count={8} />
        </main>
      </div>
    </div>
  );
}
