export default function BookingFormSkeleton() {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-lg animate-shimmer" />
        <div className="h-4 w-64 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Row 1 - Two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
            <div className="h-12 w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-lg animate-shimmer" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
            <div className="h-12 w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-lg animate-shimmer" />
          </div>
        </div>

        {/* Row 2 - Full width */}
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
          <div className="h-12 w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-lg animate-shimmer" />
        </div>

        {/* Row 3 - Three columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="h-4 w-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
            <div className="h-12 w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-lg animate-shimmer" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
            <div className="h-12 w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-lg animate-shimmer" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
            <div className="h-12 w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-lg animate-shimmer" />
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="h-14 w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-xl animate-shimmer" />
    </div>
  );
}

export function PassengerFormSkeleton() {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200 p-5 space-y-4">
      {/* Passenger header */}
      <div className="flex items-center justify-between">
        <div className="h-6 w-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
        <div className="h-8 w-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-full animate-shimmer" />
      </div>

      {/* Form fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="h-4 w-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
          <div className="h-10 w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-lg animate-shimmer" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
          <div className="h-10 w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-lg animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
