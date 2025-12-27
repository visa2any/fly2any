import { Metadata } from 'next';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/schema-generators';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

export const metadata: Metadata = {
  title: 'Flight Deals & Travel Offers | Fly2Any',
  description: 'Discover exclusive flight deals and travel offers. Save on flights, hotels, and vacation packages with limited-time promotions from Fly2Any.',
  alternates: {
    canonical: `${SITE_URL}/deals`,
  },
  openGraph: {
    title: 'Flight Deals & Travel Offers | Fly2Any',
    description: 'Exclusive flight deals and travel offers.',
    type: 'website',
    url: `${SITE_URL}/deals`,
  },
};

// Breadcrumbs for navigation
const breadcrumbs = [
  { name: 'Home', url: SITE_URL },
  { name: 'Deals', url: `${SITE_URL}/deals` },
];

// FAQ for AEO - Travel Deals
const dealsFAQs = [
  {
    question: 'How do I find the best flight deals?',
    answer: 'Fly2Any aggregates deals from 500+ airlines in real-time. Set price alerts, use flexible dates, and book 2-3 months in advance for domestic flights. Our AI identifies price drops and notifies you instantly.',
  },
  {
    question: 'Are the flight deals on Fly2Any legitimate?',
    answer: 'Yes, all deals on Fly2Any are sourced directly from airlines and verified booking partners. Prices are updated in real-time and include all taxes and fees with no hidden costs.',
  },
  {
    question: 'How often are new deals added?',
    answer: 'We update deals continuously throughout the day. Sign up for price alerts to get notified of new deals for your preferred routes. Flash sales and error fares are posted immediately.',
  },
];

// Speakable for voice search
const speakableSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Flight Deals & Travel Offers',
  url: `${SITE_URL}/deals`,
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', '.deal-title', '.deal-price', '.deal-destination'],
  },
};

export default function DealsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StructuredData schema={[
        generateBreadcrumbSchema(breadcrumbs),
        generateFAQSchema(dealsFAQs),
        speakableSchema,
      ]} />
      {children}
    </>
  );
}
