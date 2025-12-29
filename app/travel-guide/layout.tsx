import { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

export const metadata: Metadata = {
  title: 'Travel Guide | Visa, Currency, Safety & Culture Tips | Fly2Any',
  description: 'Expert travel guides for Paris, Tokyo, Dubai, London & New York. Get essential tips on visa requirements, currency, safety, local culture, and transportation. Plan your perfect trip with Fly2Any.',
  keywords: [
    'travel guide', 'travel tips', 'visa requirements', 'travel safety',
    'Paris travel guide', 'Tokyo travel guide', 'Dubai travel guide',
    'London travel tips', 'New York travel', 'currency exchange',
    'cultural etiquette', 'transportation guide', 'travel planning'
  ],
  alternates: {
    canonical: `${SITE_URL}/travel-guide`,
  },
  openGraph: {
    title: 'Travel Guide | Expert Tips for Your Next Adventure | Fly2Any',
    description: 'Comprehensive travel guides with visa info, currency tips, safety advice, and cultural insights for top destinations worldwide.',
    type: 'website',
    url: `${SITE_URL}/travel-guide`,
    images: [
      {
        url: `${SITE_URL}/og/travel-guide.jpg`,
        width: 1200,
        height: 630,
        alt: 'Fly2Any Travel Guide - Expert Tips for Global Destinations',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Travel Guide | Fly2Any',
    description: 'Expert travel tips for visa, currency, safety & culture. Plan your perfect trip.',
  },
};

export default function TravelGuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
