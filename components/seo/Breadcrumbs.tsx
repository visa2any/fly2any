/**
 * BREADCRUMB NAVIGATION COMPONENT
 *
 * SEO-optimized breadcrumb navigation with:
 * - BreadcrumbList schema markup
 * - Accessibility (ARIA labels)
 * - Mobile responsive
 * - Customizable styling
 *
 * @version 1.0.0
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getBreadcrumbSchema } from '@/lib/seo/metadata';
import { StructuredData } from './StructuredData';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
  separator?: 'chevron' | 'slash' | 'arrow';
}

/**
 * Breadcrumbs Component
 *
 * Usage:
 * <Breadcrumbs items={[
 *   { name: 'Flights', url: '/flights' },
 *   { name: 'JFK to LAX', url: '/flights/jfk-to-lax' }
 * ]} />
 *
 * Or use auto-generated from URL path:
 * <Breadcrumbs />
 */
export function Breadcrumbs({
  items,
  className = '',
  showHome = true,
  separator = 'chevron',
}: BreadcrumbsProps) {
  const pathname = usePathname();

  // Auto-generate breadcrumbs from pathname if not provided
  const breadcrumbItems = items || generateBreadcrumbsFromPath(pathname);

  // Add home to the beginning if not already present
  const allItems = showHome && breadcrumbItems[0]?.url !== '/'
    ? [{ name: 'Home', url: '/' }, ...breadcrumbItems]
    : breadcrumbItems;

  // Generate schema markup
  const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';
  const schemaItems = allItems.map(item => ({
    name: item.name,
    url: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
  }));

  const schema = getBreadcrumbSchema(schemaItems);

  // Separator component
  const Separator = () => {
    switch (separator) {
      case 'slash':
        return <span className="mx-2 text-gray-400">/</span>;
      case 'arrow':
        return <span className="mx-2 text-gray-400">→</span>;
      case 'chevron':
      default:
        return <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />;
    }
  };

  return (
    <>
      {/* Schema Markup */}
      <StructuredData schema={schema} />

      {/* Visual Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center text-sm ${className}`}
      >
        <ol className="flex items-center flex-wrap gap-1">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;

            return (
              <li key={index} className="flex items-center">
                {index > 0 && <Separator />}

                {isLast ? (
                  <span
                    className="text-gray-600 font-medium"
                    aria-current="page"
                  >
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.url}
                    className="text-blue-600 hover:text-blue-700 hover:underline transition-colors flex items-center gap-1"
                  >
                    {index === 0 && showHome && (
                      <Home className="w-4 h-4" />
                    )}
                    <span>{item.name}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

/**
 * Auto-generate breadcrumbs from URL pathname
 */
function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  if (!pathname || pathname === '/') return [];

  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  let currentPath = '';
  for (const segment of paths) {
    currentPath += `/${segment}`;

    // Convert URL segment to readable name
    const name = segment
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    breadcrumbs.push({
      name,
      url: currentPath,
    });
  }

  return breadcrumbs;
}

/**
 * Compact breadcrumb variant for mobile
 */
export function CompactBreadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const pathname = usePathname();
  const breadcrumbItems = items || generateBreadcrumbsFromPath(pathname);

  if (breadcrumbItems.length === 0) return null;

  const lastItem = breadcrumbItems[breadcrumbItems.length - 1];
  const secondLastItem = breadcrumbItems[breadcrumbItems.length - 2];

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-sm ${className}`}>
      {secondLastItem && (
        <>
          <Link
            href={secondLastItem.url}
            className="text-blue-600 hover:text-blue-700 flex items-center"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            <span>{secondLastItem.name}</span>
          </Link>
          <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
        </>
      )}
      <span className="text-gray-600 font-medium">{lastItem.name}</span>
    </nav>
  );
}

/**
 * Breadcrumb variants for different styles
 */
export const BreadcrumbVariants = {
  Default: Breadcrumbs,
  Compact: CompactBreadcrumbs,
};

export default Breadcrumbs;
