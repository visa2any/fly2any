import { Metadata } from 'next';
import { ReactNode } from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

export const metadata: Metadata = {
  title: 'Spirit Airlines Flights 2025 | Cheap Spirit Tickets - Fly2Any',
  description: 'Book Spirit Airlines flights at the lowest prices. Compare Spirit tickets, check baggage fees, and find deals to 90+ destinations. Save big on budget travel!',
  keywords: 'spirit airlines, spirit flights, spirit airlines tickets, cheap spirit flights, spirit airlines reservations, spirit airlines booking, spirit airlines deals, nk flights',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  openGraph: { title: 'Spirit Airlines Flights 2025 - Fly2Any', description: 'Book cheap Spirit Airlines flights to 90+ destinations.', url: `${SITE_URL}/airlines/spirit`, siteName: 'Fly2Any', type: 'website', images: [{ url: `${SITE_URL}/og/spirit-airlines.jpg`, width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title: 'Spirit Airlines Flights - Fly2Any', description: 'Book cheap Spirit flights. Compare prices and save!', images: [`${SITE_URL}/og/spirit-airlines.jpg`] },
  alternates: { canonical: `${SITE_URL}/airlines/spirit` },
};

const schemas = [
  { '@context': 'https://schema.org', '@type': 'Airline', name: 'Spirit Airlines', iataCode: 'NK', alternateName: 'Spirit', url: 'https://www.spirit.com', aggregateRating: { '@type': 'AggregateRating', ratingValue: '3.8', reviewCount: '34567', bestRating: '5' } },
  { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [
    { '@type': 'Question', name: 'Is Spirit Airlines safe?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, Spirit Airlines has an excellent safety record and is FAA-certified.' } },
    { '@type': 'Question', name: 'Does Spirit charge for carry-on bags?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, Spirit charges for carry-on bags. Only a personal item is free. Buy bags online for lower fees.' } },
  ]},
  { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL }, { '@type': 'ListItem', position: 2, name: 'Airlines', item: `${SITE_URL}/airlines` }, { '@type': 'ListItem', position: 3, name: 'Spirit Airlines', item: `${SITE_URL}/airlines/spirit` }] },
];

export default function SpiritLayout({ children }: { children: ReactNode }) {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />{children}</>;
}
