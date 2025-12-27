import { Metadata } from 'next';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateBreadcrumbSchema } from '@/lib/seo/schema-generators';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

export const metadata: Metadata = {
  title: 'Travel Affiliate Program | Earn Commissions - Fly2Any Partners',
  description: 'Join the Fly2Any affiliate program and earn competitive commissions on travel bookings. Access marketing tools, real-time tracking, and dedicated partner support.',
  keywords: 'travel affiliate program, earn travel commissions, flight affiliate, hotel affiliate, travel partner program, travel referral program',
  openGraph: {
    title: 'Fly2Any Affiliate Program | Earn Travel Commissions',
    description: 'Partner with Fly2Any and earn competitive commissions on flight and hotel bookings. Real-time tracking, marketing tools, and dedicated support.',
    type: 'website',
    url: `${SITE_URL}/affiliate`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fly2Any Affiliate Program',
    description: 'Earn commissions on travel bookings. Join our partner program today.',
  },
  alternates: {
    canonical: `${SITE_URL}/affiliate`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const breadcrumbs = [
  { name: 'Home', url: SITE_URL },
  { name: 'Affiliate Program', url: `${SITE_URL}/affiliate` },
];

export default function AffiliateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StructuredData schema={[generateBreadcrumbSchema(breadcrumbs)]} />
      {children}
    </>
  );
}
