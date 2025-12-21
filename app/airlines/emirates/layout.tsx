import { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Emirates Flights 2025 | Book Emirates Airlines Tickets - Fly2Any',
  description: 'Book Emirates flights to 150+ destinations. Compare Emirates airline tickets, business class, premium economy deals. Best prices on Emirates booking with free cancellation.',
  keywords: 'emirates airlines, emirates flights, fly emirates, emirates booking, emirates flight booking, emirates business class, emirates premium economy, emirates skywards, emirates airline tickets, emirates airways, dubai flights, emirates check in',
  authors: [{ name: 'Fly2Any' }],
  creator: 'Fly2Any',
  publisher: 'Fly2Any',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  openGraph: {
    title: 'Emirates Flights | Book Emirates Airlines - Fly2Any',
    description: 'Fly Better with Emirates. Compare prices on 150+ destinations. Business class, premium economy & economy deals.',
    type: 'website',
    url: 'https://www.fly2any.com/airlines/emirates',
    siteName: 'Fly2Any',
    locale: 'en_US',
    images: [{ url: 'https://www.fly2any.com/og/emirates-flights.png', width: 1200, height: 630, alt: 'Emirates Flights' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Emirates Flights | Fly2Any',
    description: 'Book Emirates airline tickets. Compare prices on 150+ destinations.',
    site: '@fly2any',
    images: ['https://www.fly2any.com/og/emirates-flights.png'],
  },
  alternates: { canonical: 'https://www.fly2any.com/airlines/emirates' },
};

export default function EmiratesLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.fly2any.com' },
      { '@type': 'ListItem', position: 2, name: 'Airlines', item: 'https://www.fly2any.com/airlines' },
      { '@type': 'ListItem', position: 3, name: 'Emirates', item: 'https://www.fly2any.com/airlines/emirates' },
    ],
  };

  const airlineSchema = {
    '@context': 'https://schema.org',
    '@type': 'Airline',
    name: 'Emirates',
    alternateName: 'Emirates Airlines',
    iataCode: 'EK',
    url: 'https://www.emirates.com',
    logo: 'https://www.fly2any.com/airlines/emirates-logo.png',
    sameAs: ['https://www.facebook.com/Emirates', 'https://twitter.com/emirates', 'https://www.instagram.com/emirates'],
    foundingDate: '1985',
    parentOrganization: { '@type': 'Organization', name: 'The Emirates Group' },
    address: { '@type': 'PostalAddress', addressLocality: 'Dubai', addressCountry: 'AE' },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '12847', bestRating: '5' },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'How do I book Emirates flights?', acceptedAnswer: { '@type': 'Answer', text: 'Book directly on Emirates.com or compare prices on Fly2Any to find the best Emirates deals from multiple sources.' } },
      { '@type': 'Question', name: 'What is Emirates Skywards?', acceptedAnswer: { '@type': 'Answer', text: 'Emirates Skywards is the frequent flyer program. Earn miles on Emirates and partner airlines, redeem for flights, upgrades, and experiences.' } },
      { '@type': 'Question', name: 'Does Emirates have Premium Economy?', acceptedAnswer: { '@type': 'Answer', text: 'Yes! Emirates Premium Economy launched in 2022, offering extra legroom, larger screens, premium dining, and enhanced service.' } },
      { '@type': 'Question', name: 'What is the Emirates A380 experience?', acceptedAnswer: { '@type': 'Answer', text: 'The A380 features onboard showers in First Class, a bar lounge for First & Business, and the quietest cabin in the sky.' } },
      { '@type': 'Question', name: 'How much baggage is allowed on Emirates?', acceptedAnswer: { '@type': 'Answer', text: 'Economy: 30kg, Business: 40kg, First: 50kg. Plus carry-on allowance. Skywards members get bonus allowance.' } },
    ],
  };

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Emirates Flights',
    description: 'Book Emirates airline tickets to 150+ destinations worldwide',
    brand: { '@type': 'Brand', name: 'Emirates' },
    offers: { '@type': 'AggregateOffer', priceCurrency: 'USD', availability: 'https://schema.org/InStock', url: 'https://www.fly2any.com/airlines/emirates' },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '12847', bestRating: '5' },
  };

  return (
    <>
      <Script id="breadcrumb-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Script id="airline-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(airlineSchema) }} />
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Script id="product-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      {children}
    </>
  );
}
