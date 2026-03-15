// app/about/layout.tsx
// Server layout for About page — injects Organization + AboutPage structured data
import type { Metadata } from 'next';

const SITE_URL = 'https://www.fly2any.com';

export const metadata: Metadata = {
  title: 'About Fly2Any — Our Story, Mission & Team',
  description: 'Fly2Any is a US-based travel platform comparing flights across 900+ airlines and 2M+ hotels worldwide. Learn about our mission, values, and the team behind the product.',
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: 'About Fly2Any — Our Story, Mission & Team',
    description: 'Learn about Fly2Any, our mission to make travel accessible, and the experienced team behind the platform.',
    url: `${SITE_URL}/about`,
    type: 'website',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'Fly2Any',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: 'US-based online travel agency specializing in worldwide flight search, hotel comparison, and travel booking across 900+ airlines.',
  foundingDate: '2024',
  areaServed: 'Worldwide',
  serviceType: 'Travel Agency',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    email: 'support@fly2any.com',
    availableLanguage: ['English', 'Spanish', 'Portuguese'],
  },
  sameAs: [
    `${SITE_URL}/team`,
    `${SITE_URL}/contact`,
  ],
};

const aboutPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${SITE_URL}/about#webpage`,
  url: `${SITE_URL}/about`,
  name: 'About Fly2Any',
  description: 'Learn about Fly2Any, our mission, values, and the experienced team behind the platform.',
  isPartOf: { '@id': `${SITE_URL}/#website` },
  about: { '@id': `${SITE_URL}/#organization` },
  dateModified: '2026-03-14',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'About', item: `${SITE_URL}/about` },
  ],
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
    </>
  );
}
