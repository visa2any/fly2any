import { Metadata } from 'next';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/schema-generators';

export const metadata: Metadata = {
  title: 'Guided Tours & Day Trips | Book Local Experiences - Fly2Any',
  description: 'Explore destinations with expert-led guided tours and day trips. Walking tours, food tours, cultural experiences, and adventure activities. Book with free cancellation.',
  keywords: 'guided tours, day trips, walking tours, food tours, cultural tours, adventure tours, local experiences, sightseeing tours, group tours',
  openGraph: {
    title: 'Book Guided Tours | Fly2Any',
    description: 'Expert-led guided tours and day trips worldwide. Walking tours, food tours, and unique local experiences.',
    type: 'website',
    url: 'https://www.fly2any.com/tours',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guided Tours | Fly2Any',
    description: 'Book expert-led tours and unique local experiences.',
  },
  alternates: {
    canonical: 'https://www.fly2any.com/tours',
  },
};

const tourFAQs = [
  {
    question: 'What types of guided tours does Fly2Any offer?',
    answer: 'Fly2Any offers 50,000+ tours worldwide including walking tours, food tours, cultural experiences, adventure activities, day trips, multi-day excursions, and private guided tours. Browse by destination, duration, or interest.',
  },
  {
    question: 'Are guided tours worth booking in advance?',
    answer: 'Yes. Popular tours sell out quickly, especially during peak season. Booking in advance through Fly2Any guarantees your spot, often at better prices. Most tours offer free cancellation up to 24 hours before the experience.',
  },
  {
    question: 'How far in advance should I book a tour?',
    answer: 'For popular destinations like Paris, Rome, or Tokyo, book 2-4 weeks ahead during peak season. Off-season trips can often be booked a few days before. Fly2Any shows real-time availability so you always know what is open.',
  },
  {
    question: 'What is typically included in a guided tour?',
    answer: 'Most guided tours include a professional local guide, skip-the-line entrance tickets where applicable, transportation between stops, and sometimes meals or tastings. Each tour listing on Fly2Any clearly shows what is included.',
  },
  {
    question: 'Can I cancel my tour booking for free?',
    answer: 'Most tours on Fly2Any offer free cancellation up to 24 hours before the scheduled start time. Look for the "Free Cancellation" badge when browsing. Full refund is processed to your original payment method.',
  },
];

const breadcrumbs = [
  { name: 'Home', url: 'https://www.fly2any.com' },
  { name: 'Tours', url: 'https://www.fly2any.com/tours' },
];

export default function ToursLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StructuredData schema={[generateFAQSchema(tourFAQs), generateBreadcrumbSchema(breadcrumbs)]} />
      {children}
    </>
  );
}
