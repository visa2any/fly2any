import { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

export const metadata: Metadata = {
  title: 'Flight Deals & Travel Offers | Fly2Any',
  description: 'Discover exclusive flight deals and travel offers. Save on flights, hotels, and vacation packages with limited-time promotions from Fly2Any.',
  alternates: {
    canonical: `${SITE_URL}/deals`,
  },
  openGraph: {
    title: 'Flight Deals & Travel Offers | Fly2Any',
    description: 'Exclusive flight deals and travel offers.',
    type: 'website',
    url: `${SITE_URL}/deals`,
  },
};

export default function DealsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
