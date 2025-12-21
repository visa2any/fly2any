import { Metadata } from 'next';
import { ReactNode } from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

export const metadata: Metadata = {
  title: 'Travel Insurance 2025 | Compare & Buy Travel Insurance - Fly2Any',
  description: 'Compare travel insurance from top providers like Allianz, World Nomads & Travel Guard. Get instant quotes for trip cancellation, medical emergency & baggage coverage. Save up to 35%!',
  keywords: 'travel insurance, best travel insurance, cheap travel insurance, international travel insurance, travel medical insurance, trip cancellation insurance, travel insurance comparison, travel insurance quotes, travel insurance cost, travel insurance for international travel, travel insurance usa, buy travel insurance online',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Travel Insurance 2025 | Compare & Buy Travel Insurance - Fly2Any',
    description: 'Compare travel insurance from 25+ top providers. Get instant quotes and save up to 35% on trip protection.',
    url: `${SITE_URL}/travel-insurance`,
    siteName: 'Fly2Any',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: `${SITE_URL}/og/travel-insurance.jpg`,
        width: 1200,
        height: 630,
        alt: 'Travel Insurance Comparison - Fly2Any',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Travel Insurance 2025 | Compare & Save - Fly2Any',
    description: 'Compare travel insurance from 25+ providers. Trip cancellation, medical emergency, baggage coverage. Save 35%!',
    images: [`${SITE_URL}/og/travel-insurance.jpg`],
  },
  alternates: {
    canonical: `${SITE_URL}/travel-insurance`,
  },
};

// Structured Data for SEO
const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Travel Insurance',
  description: 'Compare and buy travel insurance from top providers. Coverage includes trip cancellation, medical emergencies, baggage loss, and more.',
  brand: {
    '@type': 'Brand',
    name: 'Fly2Any',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '15420',
    bestRating: '5',
    worstRating: '1',
  },
  offers: {
    '@type': 'AggregateOffer',
    lowPrice: '25',
    highPrice: '500',
    priceCurrency: 'USD',
    offerCount: '25',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Do I really need travel insurance?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Travel insurance protects your financial investment and provides emergency assistance abroad. It's especially important for international trips, expensive vacations, or if you have non-refundable bookings.",
      },
    },
    {
      '@type': 'Question',
      name: 'What does travel insurance typically cover?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most policies cover trip cancellation/interruption, medical emergencies, emergency evacuation, baggage loss/delay, and travel delays. Coverage varies by plan and provider.',
      },
    },
    {
      '@type': 'Question',
      name: 'When should I buy travel insurance?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Buy travel insurance as soon as you book your trip. Many policies offer "cancel for any reason" coverage only if purchased within 14-21 days of your initial trip deposit.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does travel insurance cover COVID-19?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most major providers now cover COVID-19 related cancellations and medical expenses. Always check the specific policy terms before purchasing.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much does travel insurance cost?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Travel insurance typically costs 4-10% of your total trip cost. Factors include trip length, destination, age, and coverage level. Compare quotes to find the best value.',
      },
    },
  ],
};

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Travel Insurance Comparison',
  provider: {
    '@type': 'Organization',
    name: 'Fly2Any',
    url: SITE_URL,
  },
  serviceType: 'Insurance Comparison',
  areaServed: {
    '@type': 'Country',
    name: 'United States',
  },
  description: 'Compare travel insurance quotes from 25+ top providers including Allianz, World Nomads, Travel Guard, and AIG.',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: SITE_URL,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Travel Insurance',
      item: `${SITE_URL}/travel-insurance`,
    },
  ],
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Fly2Any',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  sameAs: [
    'https://twitter.com/fly2any',
    'https://facebook.com/fly2any',
    'https://instagram.com/fly2any',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-800-FLY-2ANY',
    contactType: 'customer service',
    availableLanguage: ['English', 'Spanish'],
  },
};

export default function TravelInsuranceLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            productSchema,
            faqSchema,
            serviceSchema,
            breadcrumbSchema,
            organizationSchema,
          ]),
        }}
      />
      {children}
    </>
  );
}
