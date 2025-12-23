import { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

export const metadata: Metadata = {
  title: 'Travel Guide | Fly2Any - Expert Tips & Destination Guides',
  description: 'Comprehensive travel guides with expert tips, destination insights, and travel planning advice. Make the most of your trips with Fly2Any travel guides.',
  alternates: {
    canonical: `${SITE_URL}/travel-guide`,
  },
  openGraph: {
    title: 'Travel Guide | Fly2Any',
    description: 'Expert travel tips and destination guides.',
    type: 'website',
    url: `${SITE_URL}/travel-guide`,
  },
};

export default function TravelGuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
