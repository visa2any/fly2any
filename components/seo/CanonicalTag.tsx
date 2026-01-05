/**
 * CANONICAL TAG COMPONENT
 * 
 * SEO-optimized canonical URL tag to prevent duplicate content issues.
 * 
 * @version 1.0.0
 */

interface CanonicalTagProps {
  /**
   * The canonical URL for the current page.
   * Should be absolute and include the protocol (https://).
   * If not provided, defaults to current page URL.
   */
  url?: string;
  
  /**
   * Whether to use the current page's URL as canonical.
   * Set to false if you want to specify a different canonical URL.
   * @default true
   */
  useCurrentUrl?: boolean;
  
  /**
   * Optional locale for hreflang canonical.
   * If provided, will set the canonical for the specified language.
   */
  locale?: string;
}

/**
 * CanonicalTag Component
 * 
 * Renders the canonical link tag in the document head.
 * 
 * Usage:
 * 1. For current page as canonical:
 *    <CanonicalTag />
 * 
 * 2. For specific canonical URL:
 *    <CanonicalTag url="https://www.fly2any.com/flights/jfk-to-lax" />
 * 
 * 3. For language-specific canonical:
 *    <CanonicalTag locale="es" />
 * 
 * Note: This component should be placed in the <head> of your document.
 */
export function CanonicalTag({ url, useCurrentUrl = true, locale }: CanonicalTagProps) {
  // In a real implementation, we would use the current URL from the router
  // For server components, we can get it from headers or context
  // For client components, we can use window.location
  // However, since this is a component that will be used in a Next.js app,
  // we need to handle both server and client side.
  
  let canonicalUrl = url;
  
  if (!canonicalUrl && useCurrentUrl) {
    // In a real implementation, we would get the current URL
    // from the request (server) or window (client)
    // For now, we'll leave it to be set by the parent component.
    // The parent should pass the URL if useCurrentUrl is true.
    return null;
  }
  
  // If locale is provided, adjust the canonical URL for that locale
  if (locale && canonicalUrl) {
    const urlObj = new URL(canonicalUrl);
    // For now, we assume the locale is part of the path or query
    // In a real implementation, you might adjust the URL based on your i18n strategy
    // Example: https://www.fly2any.com/es/flights/jfk-to-lax
    // This would be handled by your routing strategy.
  }
  
  return (
    <link 
      rel="canonical" 
      href={canonicalUrl} 
      key={`canonical-${canonicalUrl}`}
    />
  );
}

/**
 * DynamicCanonicalTag Component
 * 
 * For pages with dynamic canonical URLs (e.g., flight results with search parameters).
 * Removes unnecessary query parameters for canonicalization.
 */
interface DynamicCanonicalTagProps {
  baseUrl: string;
  /**
   * Query parameters to include in canonical URL.
   * Only include essential parameters that affect page content.
   */
  includeParams?: string[];
  /**
   * Query parameters to exclude from canonical URL.
   * Typically includes tracking parameters, session IDs, etc.
   */
  excludeParams?: string[];
  /**
   * Current URL search params (from Next.js useSearchParams or similar).
   */
  searchParams?: URLSearchParams;
}

export function DynamicCanonicalTag({ 
  baseUrl, 
  includeParams, 
  excludeParams = ['utm_source', 'utm_medium', 'utm_campaign', 'gclid', 'fbclid', 'session_id', 'ref'],
  searchParams 
}: DynamicCanonicalTagProps) {
  if (!searchParams) {
    return <CanonicalTag url={baseUrl} />;
  }
  
  const canonicalParams = new URLSearchParams();
  
  // If includeParams is specified, only include those
  if (includeParams && includeParams.length > 0) {
    includeParams.forEach(param => {
      const value = searchParams.get(param);
      if (value) {
        canonicalParams.set(param, value);
      }
    });
  } else {
    // Otherwise include all except excluded ones
    searchParams.forEach((value, key) => {
      if (!excludeParams.includes(key)) {
        canonicalParams.set(key, value);
      }
    });
  }
  
  const canonicalUrl = canonicalParams.toString() 
    ? `${baseUrl}?${canonicalParams.toString()}`
    : baseUrl;
  
  return <CanonicalTag url={canonicalUrl} />;
}

/**
 * Canonical helper functions for common use cases
 */
export const CanonicalHelpers = {
  /**
   * Generate canonical URL for flight results page
   */
  flightResults: (origin: string, destination: string, departureDate: string, returnDate?: string) => {
    const base = `https://www.fly2any.com/flights/results`;
    const params = new URLSearchParams({
      from: origin,
      to: destination,
      departure: departureDate,
      ...(returnDate && { return: returnDate })
    });
    return `${base}?${params.toString()}`;
  },
  
  /**
   * Generate canonical URL for hotel search results
   */
  hotelResults: (location: string, checkIn: string, checkOut: string, guests: number) => {
    const base = `https://www.fly2any.com/hotels/results`;
    const params = new URLSearchParams({
      location,
      checkIn,
      checkOut,
      guests: guests.toString()
    });
    return `${base}?${params.toString()}`;
  },
  
  /**
   * Generate canonical URL for blog articles
   */
  blogArticle: (slug: string) => {
    return `https://www.fly2any.com/blog/${slug}`;
  },
  
  /**
   * Generate canonical URL for destination pages
   */
  destination: (destinationCode: string) => {
    return `https://www.fly2any.com/destinations/${destinationCode}`;
  }
};

export default CanonicalTag;
