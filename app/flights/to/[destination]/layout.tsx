import { Metadata } from 'next';
import Script from 'next/script';

// Destination metadata for SEO
const destinationMeta: Record<string, {
  title: string;
  description: string;
  keywords: string;
  h1: string;
  faqSchema: { question: string; answer: string }[];
}> = {
  hawaii: {
    title: 'Cheap Flights to Hawaii 2025 | Compare & Save Up to 60% - Fly2Any',
    description: 'Find cheap flights to Hawaii from major US cities. Compare 500+ airlines for Honolulu, Maui, and Kona flights. Best deals with free cancellation. Book now!',
    keywords: 'cheap flights to hawaii, hawaii flights, honolulu flights, maui flights, hawaii airfare deals, cheap hawaii tickets, flights to hawaii 2025, best time to fly to hawaii, hawaii vacation packages',
    h1: 'Cheap Flights to Hawaii',
    faqSchema: [
      { question: 'When is the cheapest time to fly to Hawaii?', answer: 'The cheapest flights to Hawaii are typically found in late January through early March, and mid-September through mid-December (excluding holidays).' },
      { question: 'How long is the flight to Hawaii?', answer: 'Flight times vary by origin: 5-6 hours from West Coast cities, 8-11 hours from the East Coast.' },
      { question: 'Which Hawaiian island should I visit?', answer: 'Oahu for city life and history, Maui for beaches and sunsets, Big Island for volcanoes, Kauai for nature and hiking.' },
    ],
  },
  florida: {
    title: 'Cheap Flights to Florida 2025 | Miami, Orlando from $99 - Fly2Any',
    description: 'Book cheap flights to Florida from $99. Compare Miami, Orlando, Tampa flights from 500+ airlines. Free cancellation on select fares. Search now!',
    keywords: 'cheap flights to florida, florida flights, miami flights, orlando flights, tampa flights, florida airfare, cheap florida tickets, disney world flights, south beach flights',
    h1: 'Cheap Flights to Florida',
    faqSchema: [
      { question: 'Which Florida airport is cheapest to fly into?', answer: 'Fort Lauderdale (FLL) and Tampa (TPA) often have lower fares than Miami or Orlando due to budget carrier competition.' },
      { question: 'When should I avoid flying to Florida?', answer: 'Peak season (December-April), spring break weeks, and major holidays typically have the highest fares.' },
      { question: 'Is it cheaper to fly to Miami or Orlando?', answer: 'Orlando often has more competitive fares due to theme park demand driving more flight options.' },
    ],
  },
  'las-vegas': {
    title: 'Cheap Flights to Las Vegas 2025 | Vegas Deals from $79 - Fly2Any',
    description: 'Score cheap flights to Las Vegas from $79. Compare 500+ airlines for the best Vegas deals. Weekend getaways & vacation packages. Book now!',
    keywords: 'cheap flights to las vegas, vegas flights, las vegas airfare, cheap vegas tickets, LAS flights, vegas weekend deals, las vegas vacation, sin city flights',
    h1: 'Cheap Flights to Las Vegas',
    faqSchema: [
      { question: 'What day is cheapest to fly to Las Vegas?', answer: 'Tuesdays and Wednesdays typically offer the lowest fares to Vegas. Avoid Friday departures and Sunday returns.' },
      { question: 'How far ahead should I book Vegas flights?', answer: 'Book 3-6 weeks ahead for best prices on domestic flights. Last-minute deals can appear but aren\'t reliable.' },
      { question: 'Are there budget airlines to Las Vegas?', answer: 'Yes! Spirit, Frontier, and Allegiant offer budget fares to Vegas from many US cities.' },
    ],
  },
  mexico: {
    title: 'Cheap Flights to Mexico 2025 | Cancun, Mexico City - Fly2Any',
    description: 'Find cheap flights to Mexico from $149. Best deals on Cancun, Mexico City, Puerto Vallarta. Compare 500+ airlines. Book with free cancellation!',
    keywords: 'cheap flights to mexico, cancun flights, mexico city flights, cheap mexico airfare, mexico vacation deals, all inclusive mexico, playa del carmen flights, cabo flights',
    h1: 'Cheap Flights to Mexico',
    faqSchema: [
      { question: 'Do I need a visa to fly to Mexico?', answer: 'US citizens don\'t need a visa for tourist stays up to 180 days. You\'ll need a valid passport.' },
      { question: 'Is it cheaper to fly to Cancun or Mexico City?', answer: 'Cancun often has more competitive pricing due to resort competition, especially from East Coast cities.' },
      { question: 'What\'s the best month for cheap Mexico flights?', answer: 'September and October offer the lowest prices, though it\'s rainy season in many areas.' },
    ],
  },
  india: {
    title: 'Cheap Flights to India 2025 | Delhi, Mumbai Deals - Fly2Any',
    description: 'Book cheap flights to India from $499. Compare airlines for Delhi, Mumbai, Bangalore flights. Best international airfare with flexible booking!',
    keywords: 'cheap flights to india, india flights, delhi flights, mumbai flights, india airfare deals, international flights to india, bangalore flights, chennai flights',
    h1: 'Cheap Flights to India',
    faqSchema: [
      { question: 'Which is the cheapest airport to fly into India?', answer: 'Delhi (DEL) and Mumbai (BOM) have the most competition and often the best prices. Chennai can be cheaper from some origins.' },
      { question: 'How early should I book India flights?', answer: 'Book 2-4 months ahead for best prices. Holiday periods like Diwali require booking 4-6 months ahead.' },
      { question: 'What airlines fly direct to India from the US?', answer: 'Air India and United offer nonstop flights from select US cities to Delhi and Mumbai.' },
    ],
  },
  bali: {
    title: 'Cheap Flights to Bali 2025 | Indonesia Deals from $699 - Fly2Any',
    description: 'Find cheap flights to Bali from $699. Compare Singapore Airlines, Emirates, Qatar Airways. Best routes to Denpasar with flexible cancellation!',
    keywords: 'cheap flights to bali, bali flights, denpasar flights, indonesia flights, bali airfare, bali vacation, ubud flights, seminyak flights',
    h1: 'Cheap Flights to Bali',
    faqSchema: [
      { question: 'What\'s the cheapest route to fly to Bali?', answer: 'Routes through Singapore, Kuala Lumpur, or Hong Kong often offer the best prices from the US.' },
      { question: 'How long is the flight to Bali?', answer: 'Total travel time from the US is typically 20-24 hours with one connection.' },
      { question: 'Do I need a visa for Bali?', answer: 'US citizens can get a 30-day visa on arrival for $35 USD, extendable once for another 30 days.' },
    ],
  },
  brazil: {
    title: 'Cheap Flights to Brazil 2025 | Rio, Sao Paulo from $449 - Fly2Any',
    description: 'Book cheap flights to Brazil from $449. Best deals on Rio de Janeiro, Sao Paulo flights. No visa required! Compare 500+ airlines now.',
    keywords: 'cheap flights to brazil, brazil flights, rio flights, sao paulo flights, brazil airfare, rio de janeiro flights, south america flights, carnival brazil',
    h1: 'Cheap Flights to Brazil',
    faqSchema: [
      { question: 'Do Americans need a visa for Brazil?', answer: 'No! As of 2024, US citizens can visit Brazil visa-free for up to 90 days.' },
      { question: 'Which is cheaper to fly into - Rio or Sao Paulo?', answer: 'Sao Paulo (GRU) typically has more flight options and competitive pricing as Brazil\'s main hub.' },
      { question: 'When is the cheapest time to visit Brazil?', answer: 'March-May and August-October offer lower prices, avoiding Carnival and peak summer holidays.' },
    ],
  },
};

type Params = Promise<{ destination: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { destination } = await params;
  const meta = destinationMeta[destination];

  if (!meta) {
    return {
      title: 'Cheap Flights - Compare & Book | Fly2Any',
      description: 'Find cheap flights to destinations worldwide. Compare 500+ airlines and book with confidence.',
    };
  }

  const canonicalUrl = `https://www.fly2any.com/flights/to/${destination}`;

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    authors: [{ name: 'Fly2Any' }],
    creator: 'Fly2Any',
    publisher: 'Fly2Any',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'website',
      url: canonicalUrl,
      siteName: 'Fly2Any',
      locale: 'en_US',
      images: [
        {
          url: `https://www.fly2any.com/og/flights-to-${destination}.png`,
          width: 1200,
          height: 630,
          alt: meta.h1,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      site: '@fly2any',
      creator: '@fly2any',
      images: [`https://www.fly2any.com/og/flights-to-${destination}.png`],
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en-US': canonicalUrl,
      },
    },
    other: {
      'msapplication-TileColor': '#E74035',
      'theme-color': '#E74035',
    },
  };
}

export default async function DestinationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { destination } = await params;
  const meta = destinationMeta[destination];

  // Generate JSON-LD structured data
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.fly2any.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Flights',
        item: 'https://www.fly2any.com/flights',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: meta?.h1 || `Flights to ${destination}`,
        item: `https://www.fly2any.com/flights/to/${destination}`,
      },
    ],
  };

  const faqSchema = meta
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: meta.faqSchema.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      }
    : null;

  const productSchema = meta
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: meta.h1,
        description: meta.description,
        brand: {
          '@type': 'Brand',
          name: 'Fly2Any',
        },
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: `https://www.fly2any.com/flights/to/${destination}`,
          seller: {
            '@type': 'Organization',
            name: 'Fly2Any',
          },
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          reviewCount: '2847',
          bestRating: '5',
          worstRating: '1',
        },
      }
    : null;

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: meta?.title || `Cheap Flights to ${destination}`,
    description: meta?.description || 'Compare and book cheap flights',
    url: `https://www.fly2any.com/flights/to/${destination}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Fly2Any',
      url: 'https://www.fly2any.com',
    },
    about: {
      '@type': 'Thing',
      name: meta?.h1 || `Flights to ${destination}`,
    },
    mainEntity: {
      '@type': 'TravelAction',
      name: `Book flights to ${destination}`,
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', 'h2', '.prose'],
    },
  };

  return (
    <>
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <Script
          id="faq-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      {productSchema && (
        <Script
          id="product-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      <Script
        id="webpage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      {children}
    </>
  );
}
