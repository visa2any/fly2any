/**
 * World Cup 2026 Layout with Enhanced SEO
 * - Breadcrumb schema for all subpages
 * - SportsEvent meta for discoverability
 */

import { getBreadcrumbSchema } from '@/lib/seo/metadata';
import { StructuredData } from '@/components/seo/StructuredData';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

export default function WorldCup2026Layout({ children }: { children: React.ReactNode }) {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'World Cup 2026', url: `${SITE_URL}/world-cup-2026` },
  ]);

  // Organization info for event pages
  const organizerSchema = {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: 'FIFA',
    url: 'https://www.fifa.com',
    sameAs: [
      'https://twitter.com/FIFAWorldCup',
      'https://www.instagram.com/fifaworldcup/',
      'https://www.facebook.com/fifaworldcup',
    ],
  };

  return (
    <>
      <StructuredData schema={[breadcrumbSchema, organizerSchema]} />
      {children}
    </>
  );
}
