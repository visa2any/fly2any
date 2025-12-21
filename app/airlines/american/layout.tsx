import { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'American Airlines Flights 2025 | Book AA Tickets - Fly2Any',
  description: 'Book American Airlines flights to 350+ destinations. Compare AA tickets, Flagship First, AAdvantage deals. Best prices on aa.com flights with free cancellation.',
  keywords: 'american airlines, aa.com, american airlines flights, american airlines reservations, american airlines check in, american airlines login, aadvantage, aa flights, american airlines official site, book american airlines, aa airline',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  openGraph: { title: 'American Airlines Flights | Book AA - Fly2Any', description: 'World\'s Largest Airline. Compare prices on 350+ destinations.', type: 'website', url: 'https://www.fly2any.com/airlines/american', siteName: 'Fly2Any', images: [{ url: 'https://www.fly2any.com/og/american-flights.png', width: 1200, height: 630, alt: 'American Airlines' }] },
  twitter: { card: 'summary_large_image', title: 'American Airlines | Fly2Any', description: 'Book AA tickets to 350+ destinations.', site: '@fly2any' },
  alternates: { canonical: 'https://www.fly2any.com/airlines/american' },
};

export default function AmericanLayout({ children }: { children: React.ReactNode }) {
  const schemas = [
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.fly2any.com' }, { '@type': 'ListItem', position: 2, name: 'Airlines', item: 'https://www.fly2any.com/airlines' }, { '@type': 'ListItem', position: 3, name: 'American Airlines', item: 'https://www.fly2any.com/airlines/american' }] },
    { '@context': 'https://schema.org', '@type': 'Airline', name: 'American Airlines', alternateName: ['AA', 'American'], iataCode: 'AA', icaoCode: 'AAL', url: 'https://www.aa.com', logo: 'https://www.fly2any.com/airlines/american-logo.png', foundingDate: '1930', memberOf: { '@type': 'Organization', name: 'Oneworld Alliance' }, address: { '@type': 'PostalAddress', addressLocality: 'Fort Worth', addressRegion: 'TX', addressCountry: 'US' }, aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.4', reviewCount: '45892', bestRating: '5' } },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [{ '@type': 'Question', name: 'How do I book American Airlines flights?', acceptedAnswer: { '@type': 'Answer', text: 'Book on aa.com or compare prices on Fly2Any.' } }, { '@type': 'Question', name: 'What is AAdvantage?', acceptedAnswer: { '@type': 'Answer', text: 'AAdvantage is American\'s loyalty program to earn and redeem miles.' } }] },
    { '@context': 'https://schema.org', '@type': 'Product', name: 'American Airlines Flights', description: 'Book AA tickets to 350+ destinations', brand: { '@type': 'Brand', name: 'American Airlines' }, aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.4', reviewCount: '45892', bestRating: '5' } },
    { '@context': 'https://schema.org', '@type': 'Organization', name: 'American Airlines', url: 'https://www.aa.com', logo: 'https://logos-world.net/wp-content/uploads/2021/08/American-Airlines-Logo.png', contactPoint: { '@type': 'ContactPoint', telephone: '+1-800-433-7300', contactType: 'customer service', areaServed: 'US' } },
  ];

  return (
    <>
      {schemas.map((schema, i) => <Script key={i} id={`schema-${i}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}
      {children}
    </>
  );
}
