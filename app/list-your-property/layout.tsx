import { Metadata } from 'next';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/schema-generators';

export const metadata: Metadata = {
  title: 'List Your Property | Earn More with AI-Powered Hosting - Fly2Any',
  description: 'List your hotel, apartment, villa, or vacation rental on Fly2Any. AI-optimized descriptions, smart pricing, and instant access to 500,000+ travelers in 180+ countries. Free to list.',
  keywords: 'list property, become a host, rent my property, vacation rental listing, hotel listing, earn money from property, property management, Fly2Any host',
  openGraph: {
    title: 'List Your Property on Fly2Any | Start Earning Today',
    description: 'AI-powered listing platform for hosts. List in under 5 minutes, reach travelers worldwide, and maximize your revenue with smart pricing.',
    type: 'website',
    url: 'https://www.fly2any.com/list-your-property',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'List Your Property | Fly2Any',
    description: 'AI-powered hosting platform. List free, earn more, reach 180+ countries.',
  },
  alternates: {
    canonical: 'https://www.fly2any.com/list-your-property',
  },
};

const hostFAQs = [
  {
    question: 'How much does it cost to list my property on Fly2Any?',
    answer: 'Listing your property on Fly2Any is completely free. We only charge a 15% commission on confirmed bookings, which is competitive with industry standards.',
  },
  {
    question: 'How long does it take to list my property?',
    answer: 'Our AI-powered listing wizard takes under 5 minutes. The AI helps write descriptions, suggest pricing, and auto-tag your photos for maximum visibility.',
  },
  {
    question: 'What types of properties can I list?',
    answer: 'You can list hotels, apartments, villas, resorts, hostels, guesthouses, B&Bs, lodges, motels, boutique hotels, and vacation rentals.',
  },
  {
    question: 'How does the AI pricing suggestion work?',
    answer: 'Our ML algorithms analyze market demand, seasonality, local events, and competitor pricing to suggest optimal nightly rates that maximize both occupancy and revenue.',
  },
  {
    question: 'Can I manage my calendar and prevent double bookings?',
    answer: 'Yes! Fly2Any offers built-in calendar management with iCal sync support. Your availability is automatically synchronized across all connected platforms.',
  },
];

const breadcrumbs = [
  { name: 'Home', url: 'https://www.fly2any.com' },
  { name: 'List Your Property', url: 'https://www.fly2any.com/list-your-property' },
];

export default function ListYourPropertyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StructuredData schema={[generateFAQSchema(hostFAQs), generateBreadcrumbSchema(breadcrumbs)]} />
      {children}
    </>
  );
}
