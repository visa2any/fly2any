import { Metadata } from 'next';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/schema-generators';

export const metadata: Metadata = {
  title: 'Tours & Activities | Book Experiences Worldwide - Fly2Any',
  description: 'Discover and book 50,000+ tours, attractions, and activities worldwide. Skip-the-line tickets, guided tours, and unique experiences with instant confirmation and free cancellation.',
  keywords: 'tours, activities, attractions, things to do, guided tours, skip the line, experiences, sightseeing, day trips, excursions, tickets, local experiences',
  openGraph: {
    title: 'Book Tours & Activities | Fly2Any',
    description: 'Discover amazing experiences worldwide. Book 50,000+ tours, attractions, and activities with instant confirmation.',
    type: 'website',
    url: 'https://www.fly2any.com/activities',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tours & Activities | Fly2Any',
    description: 'Book amazing tours and activities at destinations worldwide.',
  },
  alternates: {
    canonical: 'https://www.fly2any.com/activities',
  },
};

const activityFAQs = [
  {
    question: 'What types of activities can I book on Fly2Any?',
    answer: 'Fly2Any offers 50,000+ activities worldwide including guided tours, skip-the-line museum tickets, food tours, adventure sports, boat cruises, theme park tickets, cooking classes, wine tastings, and more. Browse by destination or category.',
  },
  {
    question: 'Can I cancel my activity booking for free?',
    answer: 'Most activities on Fly2Any offer free cancellation up to 24 hours before the scheduled time. Look for the "Free Cancellation" badge when browsing. Full refund is processed to your original payment method.',
  },
  {
    question: 'Do I need to print my activity tickets?',
    answer: 'Most activities accept mobile tickets — just show the confirmation on your phone. Some attractions may require printed vouchers, which is clearly stated on the booking page. You will receive your e-ticket instantly by email.',
  },
  {
    question: 'How do I find the best activities at my destination?',
    answer: 'Use Fly2Any to search by destination and filter by category, price, duration, and rating. Our curated recommendations highlight top-rated experiences based on traveler reviews and local expert picks.',
  },
  {
    question: 'Are skip-the-line tickets worth it?',
    answer: 'Yes, especially at popular attractions like the Louvre, Colosseum, or Statue of Liberty. Skip-the-line tickets on Fly2Any save you hours of waiting, often for just a small premium over regular admission.',
  },
];

const breadcrumbs = [
  { name: 'Home', url: 'https://www.fly2any.com' },
  { name: 'Activities', url: 'https://www.fly2any.com/activities' },
];

export default function ActivitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StructuredData schema={[generateFAQSchema(activityFAQs), generateBreadcrumbSchema(breadcrumbs)]} />
      {children}
    </>
  );
}
