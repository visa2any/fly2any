import { Metadata } from 'next';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateBreadcrumbSchema } from '@/lib/seo/schema-generators';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

export const metadata: Metadata = {
  title: 'Join Fly2Any Affiliate Program - Earn Up to 35% Commission',
  description: 'Join Fly2Any travel affiliate program. Earn 15-35% commission on flights, hotels, tours & activities. Free to join, 30-day cookie window, $50 min payout. Top affiliates earn $45K/month. Perfect for travel bloggers & influencers.',
  keywords: [
    'travel affiliate program',
    'best travel affiliate program',
    'flight affiliate program',
    'hotel affiliate program',
    'earn travel commissions',
    'travel blogger income',
    'travel influencer program',
    'affiliate marketing travel',
    'high paying travel affiliate',
    'travel referral program',
    'vacation affiliate program',
    'tour affiliate program',
    'travel content monetization',
    'travel partner program',
  ],
  openGraph: {
    title: 'Join Fly2Any Affiliate Program | Earn Up to 35% Commission',
    description: 'Earn 15-35% commission on travel bookings. Free to join. 30-day cookie. $50 min payout. Top affiliates earn $45K/month. Perfect for travel creators.',
    type: 'website',
    url: `${SITE_URL}/affiliate`,
    images: [{ url: '/og/affiliate-program.jpg', width: 1200, height: 630, alt: 'Fly2Any Affiliate Program' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Join Fly2Any Affiliate Program - Earn Up to 35%',
    description: 'Free to join. Earn 15-35% commission on travel bookings. 30-day cookie window. Top affiliates earn $45K/month.',
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
