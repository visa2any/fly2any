import { Metadata } from 'next';
import { ReactNode } from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

export const metadata: Metadata = {
  title: 'Frontier Airlines Flights 2025 | Cheap Frontier Tickets - Fly2Any',
  description: 'Book Frontier Airlines flights at ultra-low prices. Compare Frontier tickets to 100+ destinations. Save big with Discount Den and GoWild Pass!',
  keywords: 'frontier airlines, frontier flights, frontier airlines tickets, cheap frontier flights, frontier reservations, discount den, gowild pass, f9 flights',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  openGraph: { title: 'Frontier Airlines Flights 2025 - Fly2Any', description: 'Book cheap Frontier flights to 100+ destinations.', url: `${SITE_URL}/airlines/frontier`, siteName: 'Fly2Any', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'Frontier Airlines - Fly2Any', description: 'Book Frontier flights. Low fares done right!' },
  alternates: { canonical: `${SITE_URL}/airlines/frontier` },
};

const schemas = [
  { '@context': 'https://schema.org', '@type': 'Airline', name: 'Frontier Airlines', iataCode: 'F9', aggregateRating: { '@type': 'AggregateRating', ratingValue: '3.7', reviewCount: '21456', bestRating: '5' } },
  { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [{ '@type': 'Question', name: 'What is Frontier Discount Den?', acceptedAnswer: { '@type': 'Answer', text: 'Discount Den is Frontier\'s membership program ($59.99/year) offering exclusive low fares and deals.' } }] },
  { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL }, { '@type': 'ListItem', position: 2, name: 'Airlines', item: `${SITE_URL}/airlines` }, { '@type': 'ListItem', position: 3, name: 'Frontier Airlines', item: `${SITE_URL}/airlines/frontier` }] },
];

export default function FrontierLayout({ children }: { children: ReactNode }) {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />{children}</>;
}
