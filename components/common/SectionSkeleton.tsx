/**
 * Section Skeleton Loader Component
 *
 * Provides skeleton loading states for dynamically imported homepage sections
 * Optimized for performance with CSS animations instead of JS
 */

interface SectionSkeletonProps {
  type?: 'small' | 'large' | 'grid' | 'deals' | 'tripmatch';
  className?: string;
}

export function SectionSkeleton({ type = 'large', className = '' }: SectionSkeletonProps) {
  const heights = {
    small: 'h-48',
    large: 'h-96',
    grid: 'h-[32rem]',
    deals: 'h-[28rem]',
    tripmatch: 'h-64',
  };

  return (
    <div
      className={`w-full ${heights[type]} ${className}`}
      role="status"
      aria-label="Loading content"
    >
      <div className="w-full h-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse rounded-2xl">
        <div className="p-8 space-y-4">
          {/* Title skeleton */}
          <div className="h-8 bg-gray-300/70 rounded-lg w-1/3 animate-pulse"></div>

          {/* Subtitle skeleton */}
          <div className="h-4 bg-gray-300/70 rounded w-2/3 animate-pulse"></div>

          {/* Content grid skeleton */}
          {type === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-300/70 rounded-xl animate-pulse"></div>
              ))}
            </div>
          )}

          {/* Content blocks skeleton */}
          {(type === 'large' || type === 'deals') && (
            <div className="space-y-3 mt-8">
              <div className="h-4 bg-gray-300/70 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-300/70 rounded w-5/6 animate-pulse"></div>
              <div className="h-4 bg-gray-300/70 rounded w-4/6 animate-pulse"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Compact skeleton for smaller sections
 */
export function CompactSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`h-24 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse rounded-lg ${className}`}>
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-300/70 rounded w-1/2"></div>
        <div className="h-3 bg-gray-300/70 rounded w-3/4"></div>
      </div>
    </div>
  );
}
