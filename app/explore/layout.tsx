import { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

export const metadata: Metadata = {
  title: 'Explore Destinations | Fly2Any - Discover Your Next Trip',
  description: 'Explore trending destinations worldwide. Find flights, hotels, and travel inspiration for your next adventure. Discover amazing places with Fly2Any.',
  alternates: {
    canonical: `${SITE_URL}/explore`,
  },
  openGraph: {
    title: 'Explore Destinations | Fly2Any',
    description: 'Discover trending destinations and plan your perfect trip.',
    type: 'website',
    url: `${SITE_URL}/explore`,
  },
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
