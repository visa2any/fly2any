import { Metadata } from 'next';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/schema-generators';

export const metadata: Metadata = {
  title: 'Airport Transfers & Private Transportation - Fly2Any',
  description: 'Book reliable airport transfers and private transportation at 300+ airports worldwide. Compare sedans, SUVs, and luxury vehicles. Meet & greet service with real-time flight tracking.',
  keywords: 'airport transfer, private transfer, airport shuttle, taxi booking, airport pickup, hotel transfer, private driver, meet and greet, airport transportation',
  openGraph: {
    title: 'Book Airport Transfers | Fly2Any',
    description: 'Reliable airport transfers and private transportation at 300+ airports worldwide. Compare prices and book instantly.',
    type: 'website',
    url: 'https://www.fly2any.com/transfers',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Airport Transfers | Fly2Any',
    description: 'Book reliable airport transfers with meet & greet service.',
  },
  alternates: {
    canonical: 'https://www.fly2any.com/transfers',
  },
};

const transferFAQs = [
  {
    question: 'How do airport transfers work on Fly2Any?',
    answer: 'Book your transfer online, provide your flight details, and a driver meets you at arrivals with a name sign. Fly2Any tracks your flight in real-time so the driver adjusts for delays. No surge pricing — the price you see is the price you pay.',
  },
  {
    question: 'Is a private airport transfer cheaper than a taxi?',
    answer: 'Often yes. Fly2Any pre-books at fixed rates — no meters, no surge pricing. Compare sedans, minivans, and luxury vehicles from multiple providers to find the best rate. Prices are typically 10-30% less than airport taxi queues.',
  },
  {
    question: 'Can I cancel my airport transfer for free?',
    answer: 'Most transfers on Fly2Any offer free cancellation up to 24 hours before pickup. Look for the "Free Cancellation" badge when booking. Full refund is processed to your original payment method.',
  },
  {
    question: 'What vehicle types are available for airport transfers?',
    answer: 'Fly2Any offers sedans (1-3 passengers), SUVs (1-5 passengers), minivans (1-7 passengers), and luxury vehicles (Mercedes, BMW). Group transfers with buses are available for 8+ passengers at select airports.',
  },
  {
    question: 'What happens if my flight is delayed?',
    answer: 'Fly2Any monitors your flight in real-time. If your flight is delayed, we automatically adjust the pickup time at no extra charge. Your driver will be waiting when you land, regardless of delays.',
  },
];

const breadcrumbs = [
  { name: 'Home', url: 'https://www.fly2any.com' },
  { name: 'Transfers', url: 'https://www.fly2any.com/transfers' },
];

export default function TransfersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StructuredData schema={[generateFAQSchema(transferFAQs), generateBreadcrumbSchema(breadcrumbs)]} />
      {children}
    </>
  );
}
