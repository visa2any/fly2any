import { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Delta Air Lines Flights 2025 | Book Delta Airlines Tickets - Fly2Any',
  description: 'Book Delta Air Lines flights to 300+ destinations. Compare Delta airlines tickets, Delta One, SkyMiles deals. Best prices on Delta booking with free cancellation.',
  keywords: 'delta air lines, delta airlines, delta flights, delta airlines official site, delta flight status, delta skymiles, delta vacations, delta check in, delta airlines flights, delta booking, delta one, delta comfort plus, fly delta, delta airlines customer service',
  authors: [{ name: 'Fly2Any' }],
  creator: 'Fly2Any',
  publisher: 'Fly2Any',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  openGraph: {
    title: 'Delta Air Lines Flights | Book Delta Airlines - Fly2Any',
    description: 'Keep Climbing with Delta. Compare prices on 300+ destinations. Delta One, Comfort+ & Main Cabin deals.',
    type: 'website',
    url: 'https://www.fly2any.com/airlines/delta',
    siteName: 'Fly2Any',
    locale: 'en_US',
    images: [{ url: 'https://www.fly2any.com/og/delta-flights.png', width: 1200, height: 630, alt: 'Delta Air Lines Flights' }],
  },
  twitter: { card: 'summary_large_image', title: 'Delta Flights | Fly2Any', description: 'Book Delta Air Lines tickets. Compare prices on 300+ destinations.', site: '@fly2any', images: ['https://www.fly2any.com/og/delta-flights.png'] },
  alternates: { canonical: 'https://www.fly2any.com/airlines/delta' },
};

export default function DeltaLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.fly2any.com' },
      { '@type': 'ListItem', position: 2, name: 'Airlines', item: 'https://www.fly2any.com/airlines' },
      { '@type': 'ListItem', position: 3, name: 'Delta Air Lines', item: 'https://www.fly2any.com/airlines/delta' },
    ],
  };

  const airlineSchema = {
    '@context': 'https://schema.org',
    '@type': 'Airline',
    name: 'Delta Air Lines',
    alternateName: ['Delta Airlines', 'Delta'],
    iataCode: 'DL',
    icaoCode: 'DAL',
    url: 'https://www.delta.com',
    logo: 'https://www.fly2any.com/airlines/delta-logo.png',
    sameAs: ['https://www.facebook.com/delta', 'https://twitter.com/delta', 'https://www.instagram.com/delta'],
    foundingDate: '1929',
    memberOf: { '@type': 'Organization', name: 'SkyTeam Alliance' },
    parentOrganization: { '@type': 'Organization', name: 'Delta Air Lines, Inc.' },
    address: { '@type': 'PostalAddress', addressLocality: 'Atlanta', addressRegion: 'GA', addressCountry: 'US' },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.7', reviewCount: '28547', bestRating: '5' },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'How do I book Delta flights?', acceptedAnswer: { '@type': 'Answer', text: 'Book on delta.com or compare Delta prices on Fly2Any to find the best deals from multiple sources.' } },
      { '@type': 'Question', name: 'What is Delta SkyMiles?', acceptedAnswer: { '@type': 'Answer', text: 'SkyMiles is Delta\'s loyalty program. Earn miles on flights, credit cards, and partners. Redeem for flights, upgrades, and more.' } },
      { '@type': 'Question', name: 'What is Delta One?', acceptedAnswer: { '@type': 'Answer', text: 'Delta One is the premium business class on long-haul flights, featuring lie-flat seats, premium dining, and exclusive amenities.' } },
      { '@type': 'Question', name: 'Does Delta have free Wi-Fi?', acceptedAnswer: { '@type': 'Answer', text: 'Delta offers free messaging on most flights. Full Wi-Fi is available for purchase or free for certain SkyMiles members.' } },
      { '@type': 'Question', name: 'What is Delta Comfort+?', acceptedAnswer: { '@type': 'Answer', text: 'Comfort+ offers up to 4" extra legroom, dedicated overhead bins, priority boarding, and complimentary drinks.' } },
    ],
  };

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Delta Air Lines Flights',
    description: 'Book Delta airline tickets to 300+ destinations worldwide',
    brand: { '@type': 'Brand', name: 'Delta Air Lines' },
    offers: { '@type': 'AggregateOffer', priceCurrency: 'USD', availability: 'https://schema.org/InStock', url: 'https://www.fly2any.com/airlines/delta' },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.7', reviewCount: '28547', bestRating: '5' },
  };

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Delta Air Lines',
    url: 'https://www.delta.com',
    logo: 'https://logos-world.net/wp-content/uploads/2021/08/Delta-Air-Lines-Logo.png',
    contactPoint: { '@type': 'ContactPoint', telephone: '+1-800-221-1212', contactType: 'customer service', areaServed: 'US', availableLanguage: 'English' },
  };

  return (
    <>
      <Script id="breadcrumb-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Script id="airline-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(airlineSchema) }} />
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Script id="product-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <Script id="org-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      {children}
    </>
  );
}
