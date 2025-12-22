import { Metadata } from 'next';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/schema-generators';

export const metadata: Metadata = {
  title: 'Car Rentals & Best Rates | Compare Top Providers - Fly2Any',
  description: 'Compare car rental prices from Hertz, Enterprise, Avis & more. Best deals on SUVs, sedans, luxury cars at airports worldwide. Free cancellation.',
  keywords: 'car rental, rent a car, cheap car hire, airport car rental, SUV rental, luxury car rental, car rental deals, Hertz, Enterprise, Avis',
  openGraph: {
    title: 'Compare Car Rental Deals | Fly2Any',
    description: 'Find the best car rental rates from top providers. Compare prices and book with free cancellation.',
    type: 'website',
    url: 'https://www.fly2any.com/cars',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Car Rental Deals | Fly2Any',
    description: 'Compare car rental prices from top providers and save.',
  },
  alternates: {
    canonical: 'https://www.fly2any.com/cars',
  },
};

// FAQ data for featured snippets (AEO)
const carFAQs = [
  {
    question: 'What is the best website to compare car rental prices?',
    answer: 'Fly2Any compares car rental prices from all major providers including Hertz, Enterprise, Avis, Budget, and National. Our real-time comparison ensures you get the best available rate with transparent pricing.',
  },
  {
    question: 'How do I get the cheapest car rental?',
    answer: 'Book in advance through Fly2Any to compare all providers at once. Consider picking up at non-airport locations for lower prices. Be flexible with car categories - compact cars are often much cheaper.',
  },
  {
    question: 'What do I need to rent a car?',
    answer: 'You typically need a valid driver license (held for at least 1 year), a credit card in your name for the security deposit, and to be at least 21 years old. International travelers may need an International Driving Permit.',
  },
  {
    question: 'Is car rental insurance necessary?',
    answer: 'Basic liability is usually included, but CDW/LDW coverage is recommended. Check if your credit card or existing auto insurance provides rental coverage. Fly2Any shows insurance options clearly before you book.',
  },
  {
    question: 'Can I cancel my car rental for free?',
    answer: 'Most car rentals on Fly2Any offer free cancellation up to 48 hours before pickup. Look for "Free Cancellation" badges when searching. Always check the specific cancellation policy before booking.',
  },
];

// Breadcrumb schema
const breadcrumbs = [
  { name: 'Home', url: 'https://www.fly2any.com' },
  { name: 'Car Rentals', url: 'https://www.fly2any.com/cars' },
];

export default function CarsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StructuredData schema={[generateFAQSchema(carFAQs), generateBreadcrumbSchema(breadcrumbs)]} />
      {children}
    </>
  );
}
