import { Metadata } from 'next';
import { ReactNode } from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

export const metadata: Metadata = {
  title: 'Alaska Airlines Flights 2025 | Book Alaska Air Tickets - Fly2Any',
  description: 'Book Alaska Airlines flights at the best prices. Compare tickets, earn Mileage Plan miles, and fly to 120+ destinations. Award-winning service!',
  keywords: 'alaska airlines, alaska air, alaska airlines flights, alaska airlines reservations, mileage plan, alaska airlines tickets, as flights',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  openGraph: { title: 'Alaska Airlines Flights 2025 - Fly2Any', description: 'Book Alaska Airlines flights to 120+ destinations.', url: `${SITE_URL}/airlines/alaska`, siteName: 'Fly2Any', type: 'website', images: [{ url: `${SITE_URL}/og/alaska-airlines.jpg`, width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title: 'Alaska Airlines - Fly2Any', description: 'Book Alaska Air flights. Compare and save!' },
  alternates: { canonical: `${SITE_URL}/airlines/alaska` },
};

const schemas = [
  { '@context': 'https://schema.org', '@type': 'Airline', name: 'Alaska Airlines', iataCode: 'AS', memberOf: { '@type': 'Organization', name: 'Oneworld Alliance' }, aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.6', reviewCount: '28945', bestRating: '5' } },
  { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [
    { '@type': 'Question', name: 'Is Alaska Airlines part of an alliance?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, Alaska Airlines is a member of the Oneworld alliance, partnering with American Airlines, British Airways, and more.' } },
  ]},
  { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL }, { '@type': 'ListItem', position: 2, name: 'Airlines', item: `${SITE_URL}/airlines` }, { '@type': 'ListItem', position: 3, name: 'Alaska Airlines', item: `${SITE_URL}/airlines/alaska` }] },
];

export default function AlaskaLayout({ children }: { children: ReactNode }) {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />{children}</>;
}
