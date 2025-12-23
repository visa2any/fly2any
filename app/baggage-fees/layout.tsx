import { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

export const metadata: Metadata = {
  title: 'Airline Baggage Fees Guide 2025 | Fly2Any',
  description: 'Complete guide to airline baggage fees in 2025. Compare checked bag, carry-on, and oversized luggage fees for all major airlines.',
  alternates: {
    canonical: `${SITE_URL}/baggage-fees`,
  },
  openGraph: {
    title: 'Airline Baggage Fees Guide 2025 | Fly2Any',
    description: 'Compare baggage fees for all major airlines.',
    type: 'website',
    url: `${SITE_URL}/baggage-fees`,
  },
};

export default function BaggageFeesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
