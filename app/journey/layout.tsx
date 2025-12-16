/**
 * Journey Layout
 * Fly2Any Travel Operating System
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Journey | Fly2Any',
  description: 'Your entire trip, intelligently designed. Build your perfect journey with AI-powered travel planning.',
  openGraph: {
    title: 'Build My Journey | Fly2Any',
    description: 'Your entire trip, intelligently designed. Flights + Hotels + Experiences in one beautiful timeline.',
  },
};

export default function JourneyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
