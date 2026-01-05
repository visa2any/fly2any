import React from 'react';
import { Calendar, Edit, Clock, TrendingUp } from 'lucide-react';

export interface ContentFreshnessProps {
  /** Initial publication date (ISO string or Date) */
  publishedDate: string | Date;
  /** Last updated date (ISO string or Date) - optional, defaults to publishedDate */
  lastUpdated?: string | Date;
  /** Estimated reading time in minutes */
  readingTime?: number;
  /** Number of views or engagement metrics */
  viewCount?: number;
  /** Display mode: 'simple' (text only), 'badge', 'detailed' */
  variant?: 'simple' | 'badge' | 'detailed';
  /** Additional className for styling */
  className?: string;
  /** Whether to show structured data meta tags (invisible) */
  showStructuredData?: boolean;
}

/**
 * ContentFreshness Component
 * 
 * Displays content freshness signals for SEO and user trust:
 * - Publication date (required)
 * - Last updated date (optional)
 * - Reading time (optional)
 * - View/engagement metrics (optional)
 * 
 * Uses Schema.org `datePublished` and `dateModified` for structured data.
 */
export default function ContentFreshness({
  publishedDate,
  lastUpdated,
  readingTime,
  viewCount,
  variant = 'simple',
  className = '',
  showStructuredData = true,
}: ContentFreshnessProps) {
  // Parse dates
  const pubDate = new Date(publishedDate);
  const modDate = lastUpdated ? new Date(lastUpdated) : pubDate;
  
  // Determine if content has been updated
  const hasUpdate = lastUpdated && modDate.getTime() > pubDate.getTime();
  
  // Format date strings for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const pubDateStr = formatDate(pubDate);
  const modDateStr = formatDate(modDate);
  
  // Structured data for JSON-LD
  const structuredData = showStructuredData ? {
    '@type': 'Article',
    'datePublished': pubDate.toISOString(),
    'dateModified': modDate.toISOString(),
    ...(readingTime && { 'timeRequired': `PT${readingTime}M` }),
  } : null;

  // Simple variant (text only)
  if (variant === 'simple') {
    return (
      <>
        <div className={`text-sm text-gray-600 ${className}`}>
          {hasUpdate ? (
            <span>Updated on {modDateStr}</span>
          ) : (
            <span>Published on {pubDateStr}</span>
          )}
          {readingTime && (
            <span className="ml-4">
              <Clock className="inline w-3 h-3 mr-1" />
              {readingTime} min read
            </span>
          )}
        </div>
        
        {/* Invisible structured data */}
        {structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(structuredData),
            }}
          />
        )}
      </>
    );
  }

  // Badge variant (compact, suitable for cards)
  if (variant === 'badge') {
    return (
      <>
        <div className={`flex flex-wrap items-center gap-2 text-xs ${className}`}>
          <span className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
            <Calendar className="w-3 h-3" />
            {pubDateStr}
          </span>
          
          {hasUpdate && (
            <span className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full">
              <Edit className="w-3 h-3" />
              Updated
            </span>
          )}
          
          {readingTime && (
            <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
              <Clock className="w-3 h-3" />
              {readingTime} min
            </span>
          )}
          
          {viewCount && (
            <span className="flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-full">
              <TrendingUp className="w-3 h-3" />
              {viewCount.toLocaleString()} views
            </span>
          )}
        </div>
        
        {/* Invisible structured data */}
        {structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(structuredData),
            }}
          />
        )}
      </>
    );
  }

  // Detailed variant (full featured)
  return (
    <>
      <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Publication Date */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Published</div>
              <div className="font-semibold text-gray-900">{pubDateStr}</div>
            </div>
          </div>

          {/* Last Updated (if different) */}
          {hasUpdate && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Edit className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Last Updated</div>
                <div className="font-semibold text-gray-900">{modDateStr}</div>
              </div>
            </div>
          )}

          {/* Reading Time */}
          {readingTime && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Reading Time</div>
                <div className="font-semibold text-gray-900">{readingTime} minutes</div>
              </div>
            </div>
          )}

          {/* View Count */}
          {viewCount && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Views</div>
                <div className="font-semibold text-gray-900">{viewCount.toLocaleString()}</div>
              </div>
            </div>
          )}
        </div>

        {/* Freshness Indicator Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Content Freshness</span>
            <span>{hasUpdate ? 'Recently Updated' : 'Fresh Content'}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                hasUpdate
                  ? 'bg-green-500' // Recently updated
                  : 'bg-blue-500' // Fresh content
              }`}
              style={{
                width: hasUpdate ? '100%' : '85%',
              }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {hasUpdate
              ? `This content was updated ${calculateTimeAgo(modDate)}.`
              : `This content was published ${calculateTimeAgo(pubDate)}.`}
          </div>
        </div>
      </div>
      
      {/* Invisible structured data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              ...structuredData,
            }),
          }}
        />
      )}
    </>
  );
}

/**
 * Calculate human-readable time ago string
 */
function calculateTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

/**
 * ContentFreshnessSkeleton Component
 * Loading skeleton for ContentFreshness
 */
export function ContentFreshnessSkeleton({ variant = 'simple' }: { variant?: 'simple' | 'badge' | 'detailed' }) {
  if (variant === 'simple') {
    return (
      <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
    );
  }

  if (variant === 'badge') {
    return (
      <div className="flex gap-2">
        <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse" />
        <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse" />
            <div className="space-y-2">
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
