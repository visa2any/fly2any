import { Metadata } from 'next';
import { ReactNode } from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

export const metadata: Metadata = {
  title: 'Solo Travel Destinations 2025 | Best Places to Travel Alone - Fly2Any',
  description: 'Discover the best solo travel destinations for 2025. Safe places for solo travelers, budget tips, adventure spots & self-discovery journeys. Book cheap flights for solo trips!',
  keywords: 'solo travel destinations, solo travel, best places to travel alone, solo travel tips, safe solo travel, solo female travel, solo adventure travel, solo travel for introverts, solo travel spots, traveling alone',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  openGraph: {
    title: 'Solo Travel Destinations 2025 | Best Places to Travel Alone',
    description: 'Discover the best solo travel destinations. Safe, affordable, and inspiring places for solo travelers.',
    url: `${SITE_URL}/solo-travel`,
    siteName: 'Fly2Any',
    type: 'website',
    locale: 'en_US',
    images: [{ url: `${SITE_URL}/og/solo-travel.jpg`, width: 1200, height: 630, alt: 'Solo Travel Destinations - Fly2Any' }],
  },
  twitter: { card: 'summary_large_image', title: 'Solo Travel Destinations 2025 - Fly2Any', description: 'Best places to travel alone. Safe, inspiring solo travel spots worldwide.', images: [`${SITE_URL}/og/solo-travel.jpg`] },
  alternates: { canonical: `${SITE_URL}/solo-travel` },
};

const schemas = [
  { '@context': 'https://schema.org', '@type': 'WebPage', name: 'Solo Travel Destinations', description: 'Best solo travel destinations for 2025', url: `${SITE_URL}/solo-travel` },
  { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [
    { '@type': 'Question', name: 'What are the safest solo travel destinations?', acceptedAnswer: { '@type': 'Answer', text: 'Iceland, Japan, New Zealand, Portugal, and Singapore consistently rank as the safest destinations for solo travelers.' } },
    { '@type': 'Question', name: 'Is solo travel safe for women?', acceptedAnswer: { '@type': 'Answer', text: 'Many destinations are very safe for solo female travelers. Japan, Iceland, and Scandinavian countries are particularly recommended.' } },
    { '@type': 'Question', name: 'How much does solo travel cost?', acceptedAnswer: { '@type': 'Answer', text: 'Solo travel costs vary by destination. Budget travelers can explore Southeast Asia for $30-50/day, while Europe averages $80-150/day.' } },
  ]},
  { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Solo Travel', item: `${SITE_URL}/solo-travel` },
  ]},
];

export default function SoloTravelLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      {children}
    </>
  );
}
