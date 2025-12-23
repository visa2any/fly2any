import { Metadata } from 'next';

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
  return <>{children}</>;
}
