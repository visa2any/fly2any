import { getTranslations } from 'next-intl/server';
import FlightsClient from './FlightsClient';

export async function generateMetadata() {
  const t = await getTranslations('FlightsPage');

  return {
    title: t('metaTitle') || 'Find Cheap Flights & Airline Tickets | Fly2Any',
    description: t('metaDescription') || 'Compare flight prices from 500+ airlines. Find the best deals on airline tickets, track price drops, and book your perfect flight with Fly2Any.',
    alternates: {
      canonical: '/flights',
    },
    openGraph: {
      title: 'Find Cheap Flights & Airline Tickets | Fly2Any',
      description: 'Compare flight prices from 500+ airlines. Find the best deals on airline tickets, track price drops, and book your perfect flight with Fly2Any.',
      url: '/flights',
    },
  };
}

export default function FlightsPage() {
  return <FlightsClient />;
}
