export default function HotelCardSkeleton() {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Image Skeleton */}
        <div className="w-full sm:w-64 h-48 sm:h-auto bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />

        {/* Content Skeleton */}
        <div className="flex-1 p-4 space-y-3">
          {/* Title & Rating */}
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="h-6 w-3/4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
              <div className="h-4 w-1/2 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
            </div>
            <div className="h-8 w-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-lg animate-shimmer" />
          </div>

          {/* Amenities */}
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-full animate-shimmer" />
            <div className="h-6 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-full animate-shimmer" />
            <div className="h-6 w-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-full animate-shimmer" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="h-3 w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
            <div className="h-3 w-5/6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
          </div>

          {/* Price & Button */}
          <div className="flex items-end justify-between pt-2">
            <div className="space-y-1">
              <div className="h-3 w-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
              <div className="h-8 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
            </div>
            <div className="h-10 w-28 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-xl animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function MultipleHotelCardSkeletons({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <HotelCardSkeleton key={index} />
      ))}
    </div>
  );
}
