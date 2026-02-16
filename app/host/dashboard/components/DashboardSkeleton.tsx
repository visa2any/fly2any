export function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Welcome */}
      <div className="space-y-2 mb-8">
        <div className="h-8 bg-neutral-200 rounded-lg w-1/3" />
        <div className="h-4 bg-neutral-200 rounded-lg w-1/2" />
      </div>

      {/* Quick Actions */}
      <div className="h-16 bg-neutral-200 rounded-3xl" />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-neutral-200 rounded-3xl" />
        ))}
      </div>

      {/* Today Activity */}
      <div className="h-40 bg-neutral-200 rounded-3xl" />

      {/* Two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-48 bg-neutral-200 rounded-3xl" />
        <div className="h-48 bg-neutral-200 rounded-3xl" />
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-32 bg-neutral-200 rounded-3xl" />
      ))}
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-48 bg-neutral-200 rounded-2xl border border-neutral-200" />
      ))}
    </div>
  );
}
