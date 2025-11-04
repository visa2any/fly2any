export default function SearchBarSkeleton() {
  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* From */}
        <div className="space-y-2">
          <div className="h-4 w-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
          <div className="h-12 w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-lg animate-shimmer" />
        </div>

        {/* To */}
        <div className="space-y-2">
          <div className="h-4 w-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
          <div className="h-12 w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-lg animate-shimmer" />
        </div>

        {/* Departure */}
        <div className="space-y-2">
          <div className="h-4 w-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
          <div className="h-12 w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-lg animate-shimmer" />
        </div>

        {/* Return */}
        <div className="space-y-2">
          <div className="h-4 w-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
          <div className="h-12 w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-lg animate-shimmer" />
        </div>

        {/* Search Button */}
        <div className="flex items-end">
          <div className="h-12 w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-xl animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

export function CompactSearchBarSkeleton() {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="h-6 w-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-full animate-shimmer" />
        <div className="flex-1 space-y-1">
          <div className="h-4 w-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
          <div className="h-3 w-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
        </div>
        <div className="h-8 w-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-lg animate-shimmer" />
      </div>
    </div>
  );
}
