import { Metadata } from 'next';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/schema-generators';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

export const metadata: Metadata = {
  title: 'Vacation Packages | Fly2Any - Flight + Hotel Deals',
  description: 'Book vacation packages with flights and hotels bundled together. Save on your next trip with exclusive package deals from Fly2Any.',
  alternates: {
    canonical: `${SITE_URL}/packages`,
  },
  openGraph: {
    title: 'Vacation Packages | Fly2Any',
    description: 'Bundled flight + hotel vacation packages.',
    type: 'website',
    url: `${SITE_URL}/packages`,
  },
};

// Breadcrumbs for navigation
const breadcrumbs = [
  { name: 'Home', url: SITE_URL },
  { name: 'Vacation Packages', url: `${SITE_URL}/packages` },
];

// FAQ for AEO - Vacation Packages
const packagesFAQs = [
  {
    question: 'Are vacation packages cheaper than booking separately?',
    answer: 'Yes, bundling flights and hotels through Fly2Any typically saves 10-30% compared to booking separately. Airlines and hotels offer discounts on package deals that are not available on standalone bookings.',
  },
  {
    question: 'Can I customize my vacation package?',
    answer: 'Fly2Any allows you to choose your preferred flights, hotels, and travel dates. Mix and match options to create your perfect trip with transparent pricing on each component.',
  },
  {
    question: 'What is included in a vacation package?',
    answer: 'Fly2Any vacation packages include roundtrip flights and hotel accommodations. Some packages also include airport transfers, travel insurance, and activity options depending on the destination.',
  },
];

// Speakable for voice search
const speakableSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Vacation Packages',
  url: `${SITE_URL}/packages`,
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', '.package-title', '.package-price', '.package-destination'],
  },
};

export default function PackagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StructuredData schema={[
        generateBreadcrumbSchema(breadcrumbs),
        generateFAQSchema(packagesFAQs),
        speakableSchema,
      ]} />
      {children}
    </>
  );
}
