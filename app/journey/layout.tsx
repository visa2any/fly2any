/**
 * Journey Layout
 * Fly2Any Travel Operating System
 */

import { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

export const metadata: Metadata = {
  title: 'Journey Builder | Fly2Any - Plan Your Complete Trip',
  description: 'Your entire trip, intelligently designed. Build your perfect journey with AI-powered travel planning.',
  alternates: {
    canonical: `${SITE_URL}/journey`,
  },
  openGraph: {
    title: 'Build My Journey | Fly2Any',
    description: 'Your entire trip, intelligently designed. Flights + Hotels + Experiences in one beautiful timeline.',
    url: `${SITE_URL}/journey`,
  },
};

export default function JourneyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
