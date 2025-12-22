import { Metadata } from 'next';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/schema-generators';

export const metadata: Metadata = {
  title: 'Cheap Flights & Airline Tickets | Compare 900+ Airlines - Fly2Any',
  description: 'Search and compare cheap flights from 900+ airlines worldwide. Find the best deals on domestic and international flights with AI-powered price predictions. Book with confidence.',
  keywords: 'cheap flights, airline tickets, flight deals, compare flights, book flights online, international flights, domestic flights, last minute flights, flight search',
  openGraph: {
    title: 'Find Cheap Flights | Compare 900+ Airlines - Fly2Any',
    description: 'AI-powered flight search. Compare prices across 900+ airlines and find the best deals on flights worldwide.',
    type: 'website',
    url: 'https://www.fly2any.com/flights',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Cheap Flights | Fly2Any',
    description: 'Compare 900+ airlines and find the best flight deals with AI-powered search.',
  },
  alternates: {
    canonical: 'https://www.fly2any.com/flights',
  },
};

// FAQ data for featured snippets (AEO)
const flightFAQs = [
  {
    question: 'What is the best website to book cheap flights?',
    answer: 'Fly2Any compares prices from 900+ airlines and 500+ sources in real-time. Our AI-powered search finds the best deals with price alerts and flexible date options. We offer a best price guarantee and free cancellation on most bookings.',
  },
  {
    question: 'How do I find the cheapest flight?',
    answer: 'Use Fly2Any to compare all airlines at once. Book 2-3 months in advance for domestic flights, 4-6 months for international. Be flexible with dates using our price calendar. Set price alerts to get notified when prices drop.',
  },
  {
    question: 'When is the cheapest time to book flights?',
    answer: 'The best time to book domestic flights is 1-3 months in advance, and 2-8 months for international flights. Tuesday and Wednesday often have lower prices. Use Fly2Any price alerts to track fare changes.',
  },
  {
    question: 'Does Fly2Any charge booking fees?',
    answer: 'Fly2Any shows transparent pricing with no hidden fees. The price you see is the price you pay. We compare prices from airlines directly to ensure you get the best deal available.',
  },
  {
    question: 'Can I cancel my flight booking for free?',
    answer: 'Many airlines offer free cancellation within 24 hours of booking. Fly2Any clearly shows each fare cancellation policy before you book. Look for "Free Cancellation" badges when searching.',
  },
];

// Breadcrumb schema
const breadcrumbs = [
  { name: 'Home', url: 'https://www.fly2any.com' },
  { name: 'Flights', url: 'https://www.fly2any.com/flights' },
];

export default function FlightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StructuredData schema={[generateFAQSchema(flightFAQs), generateBreadcrumbSchema(breadcrumbs)]} />
      {children}
    </>
  );
}
