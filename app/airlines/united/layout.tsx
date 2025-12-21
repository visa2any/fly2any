import { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'United Airlines Flights 2025 | Book United Reservations - Fly2Any',
  description: 'Book United Airlines flights to 340+ destinations. Compare United reservations, Polaris business class, MileagePlus deals. Best prices on United booking.',
  keywords: 'united airlines, united airlines reservations, united airlines official site, united flights, united flight status, united airlines check in, united mileageplus, united polaris, united airlines customer service, book united flights, united airlines booking',
  authors: [{ name: 'Fly2Any' }],
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  openGraph: { title: 'United Airlines Flights | Book United - Fly2Any', description: 'Good Leads The Way. Compare prices on 340+ destinations.', type: 'website', url: 'https://www.fly2any.com/airlines/united', siteName: 'Fly2Any', images: [{ url: 'https://www.fly2any.com/og/united-flights.png', width: 1200, height: 630, alt: 'United Airlines' }] },
  twitter: { card: 'summary_large_image', title: 'United Flights | Fly2Any', description: 'Book United Airlines tickets to 340+ destinations.', site: '@fly2any' },
  alternates: { canonical: 'https://www.fly2any.com/airlines/united' },
};

export default function UnitedLayout({ children }: { children: React.ReactNode }) {
  const schemas = [
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.fly2any.com' }, { '@type': 'ListItem', position: 2, name: 'Airlines', item: 'https://www.fly2any.com/airlines' }, { '@type': 'ListItem', position: 3, name: 'United Airlines', item: 'https://www.fly2any.com/airlines/united' }] },
    { '@context': 'https://schema.org', '@type': 'Airline', name: 'United Airlines', alternateName: ['United', 'UA'], iataCode: 'UA', icaoCode: 'UAL', url: 'https://www.united.com', logo: 'https://www.fly2any.com/airlines/united-logo.png', sameAs: ['https://www.facebook.com/united', 'https://twitter.com/united'], foundingDate: '1926', memberOf: { '@type': 'Organization', name: 'Star Alliance' }, address: { '@type': 'PostalAddress', addressLocality: 'Chicago', addressRegion: 'IL', addressCountry: 'US' }, aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.5', reviewCount: '32145', bestRating: '5' } },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [{ '@type': 'Question', name: 'How do I book United Airlines flights?', acceptedAnswer: { '@type': 'Answer', text: 'Book on united.com or compare United prices on Fly2Any to find the best deals.' } }, { '@type': 'Question', name: 'What is United MileagePlus?', acceptedAnswer: { '@type': 'Answer', text: 'MileagePlus is United\'s loyalty program to earn and redeem miles.' } }, { '@type': 'Question', name: 'What is United Polaris?', acceptedAnswer: { '@type': 'Answer', text: 'Polaris is United\'s premium business class with lie-flat seats.' } }] },
    { '@context': 'https://schema.org', '@type': 'Product', name: 'United Airlines Flights', description: 'Book United airline tickets to 340+ destinations', brand: { '@type': 'Brand', name: 'United Airlines' }, aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.5', reviewCount: '32145', bestRating: '5' } },
    { '@context': 'https://schema.org', '@type': 'Organization', name: 'United Airlines', url: 'https://www.united.com', logo: 'https://logos-world.net/wp-content/uploads/2021/08/United-Airlines-Logo.png', contactPoint: { '@type': 'ContactPoint', telephone: '+1-800-864-8331', contactType: 'customer service', areaServed: 'US' } },
  ];

  return (
    <>
      {schemas.map((schema, i) => <Script key={i} id={`schema-${i}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}
      {children}
    </>
  );
}
