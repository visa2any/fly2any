export function DashboardSkeleton() {
    return (
      <div className="animate-pulse space-y-8">
        {/* Welcome Skeleton */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
           <div className="space-y-2 w-full md:w-1/2">
              <div className="h-10 bg-neutral-200 rounded-lg w-1/3"></div>
              <div className="h-4 bg-neutral-200 rounded-lg w-2/3"></div>
           </div>
           <div className="h-12 w-48 bg-neutral-200 rounded-xl"></div>
        </div>
  
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-neutral-200 rounded-2xl"></div>
            ))}
        </div>
  
        {/* Listings List Skeleton */}
        <div className="space-y-4">
            <div className="h-8 bg-neutral-200 rounded-lg w-1/4 mb-6"></div>
            {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-neutral-200 rounded-2xl"></div>
            ))}
        </div>
      </div>
    );
  }
  
  export function StatsSkeleton() {
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-neutral-200 rounded-2xl"></div>
            ))}
        </div>
      );
  }
  
  export function ListSkeleton() {
      return (
        <div className="space-y-4 animate-pulse">
             {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-neutral-200 rounded-2xl border border-neutral-200"></div>
            ))}
        </div>
      );
  }
