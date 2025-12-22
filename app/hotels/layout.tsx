import { Metadata } from 'next';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/schema-generators';

export const metadata: Metadata = {
  title: 'Hotel Deals & Accommodation | Book Best Rates - Fly2Any',
  description: 'Find the best hotel deals worldwide. Compare prices from top booking sites, read verified reviews, and save up to 60% on hotels, resorts, and vacation rentals.',
  keywords: 'hotel deals, cheap hotels, hotel booking, accommodation, best hotel rates, luxury hotels, budget hotels, resort deals, vacation rentals',
  openGraph: {
    title: 'Book Hotels at Best Rates | Fly2Any',
    description: 'Compare hotel prices from all major booking sites. Find deals on hotels, resorts, and vacation rentals worldwide.',
    type: 'website',
    url: 'https://www.fly2any.com/hotels',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hotel Deals | Fly2Any',
    description: 'Find the best hotel rates worldwide. Compare prices and save up to 60%.',
  },
  alternates: {
    canonical: 'https://www.fly2any.com/hotels',
  },
};

// FAQ data for featured snippets (AEO)
const hotelFAQs = [
  {
    question: 'What is the best website to book hotels?',
    answer: 'Fly2Any compares prices from 2+ million hotels across all major booking platforms. Our real-time price comparison ensures you get the best deal. We offer a best price guarantee and free cancellation on most bookings.',
  },
  {
    question: 'How can I find the cheapest hotel rates?',
    answer: 'Use Fly2Any to compare all booking sites at once. Book in advance for popular destinations. Be flexible with dates - midweek stays are often cheaper. Look for "Free Cancellation" options.',
  },
  {
    question: 'Is it cheaper to book hotels directly or through a comparison site?',
    answer: 'Comparison sites like Fly2Any often find better deals by searching multiple sources simultaneously. We compare prices from hotels direct, OTAs, and special deals to show you the lowest available price.',
  },
  {
    question: 'Can I cancel my hotel booking for free?',
    answer: 'Many hotels offer free cancellation up to 24-48 hours before check-in. Fly2Any clearly shows each property cancellation policy. Look for "Free Cancellation" badges when searching.',
  },
  {
    question: 'Does Fly2Any offer hotel price alerts?',
    answer: 'Yes, Fly2Any allows you to set price alerts for hotels. Get notified when prices drop for your saved properties so you can book at the best time.',
  },
];

// Breadcrumb schema
const breadcrumbs = [
  { name: 'Home', url: 'https://www.fly2any.com' },
  { name: 'Hotels', url: 'https://www.fly2any.com/hotels' },
];

export default function HotelsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StructuredData schema={[generateFAQSchema(hotelFAQs), generateBreadcrumbSchema(breadcrumbs)]} />
      {children}
    </>
  );
}
