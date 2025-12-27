import { Metadata } from 'next';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateBreadcrumbSchema } from '@/lib/seo/schema-generators';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

export const metadata: Metadata = {
  title: 'Travel Blog - Fly2Any | Guides, Deals & Travel Inspiration',
  description:
    'Explore travel guides, exclusive deals, breaking news, and expert tips from the Fly2Any travel blog. Your source for travel inspiration and insider knowledge.',
  keywords: [
    'travel blog',
    'travel guides',
    'flight deals',
    'travel tips',
    'destination guides',
    'travel news',
    'vacation planning',
  ],
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: 'Fly2Any Travel Blog - Guides, Deals & Inspiration',
    description:
      'Discover amazing destinations, exclusive deals, and expert travel advice.',
    type: 'website',
    url: `${SITE_URL}/blog`,
  },
};

// Breadcrumb for navigation
const breadcrumbs = [
  { name: 'Home', url: SITE_URL },
  { name: 'Blog', url: `${SITE_URL}/blog` },
];

// Blog collection schema for AEO
const blogSchema = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  '@id': `${SITE_URL}/blog#blog`,
  name: 'Fly2Any Travel Blog',
  description: 'Expert travel guides, destination insights, flight deals, and travel tips from the Fly2Any team.',
  url: `${SITE_URL}/blog`,
  publisher: {
    '@type': 'Organization',
    '@id': `${SITE_URL}#organization`,
    name: 'Fly2Any',
    url: SITE_URL,
  },
  inLanguage: 'en-US',
  isPartOf: {
    '@type': 'WebSite',
    '@id': `${SITE_URL}#website`,
  },
};

// Speakable schema for voice search (Google Assistant, Alexa)
const speakableSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Fly2Any Travel Blog',
  url: `${SITE_URL}/blog`,
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', 'h2', '.blog-excerpt', '.article-summary'],
  },
};

/**
 * Blog Layout Component
 *
 * Wraps all blog pages with consistent layout and SEO metadata
 * The GlobalLayout (Header/Footer) is already applied at the root level
 */
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StructuredData schema={[generateBreadcrumbSchema(breadcrumbs), blogSchema, speakableSchema]} />
      {children}
    </>
  );
}
