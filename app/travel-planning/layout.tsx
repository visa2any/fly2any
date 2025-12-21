import { Metadata } from 'next';
import { ReactNode } from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

export const metadata: Metadata = {
  title: 'Travel Planning 2025 | Plan Your Perfect Trip - Fly2Any',
  description: 'Complete travel planning guide. Plan your trip with itinerary tips, packing checklists, budget tools, and booking strategies. Start planning your dream vacation today!',
  keywords: 'travel planning, trip planning, vacation planning, travel itinerary, travel budget, how to plan a trip, travel checklist, trip planner, vacation planner, travel tips, travel guide',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  openGraph: {
    title: 'Travel Planning 2025 | Plan Your Perfect Trip',
    description: 'Complete guide to planning your dream vacation. Itineraries, budgets, packing lists & more.',
    url: `${SITE_URL}/travel-planning`,
    siteName: 'Fly2Any',
    type: 'website',
    locale: 'en_US',
    images: [{ url: `${SITE_URL}/og/travel-planning.jpg`, width: 1200, height: 630, alt: 'Travel Planning Guide - Fly2Any' }],
  },
  twitter: { card: 'summary_large_image', title: 'Travel Planning Guide 2025 - Fly2Any', description: 'Plan your perfect trip with our complete guide.', images: [`${SITE_URL}/og/travel-planning.jpg`] },
  alternates: { canonical: `${SITE_URL}/travel-planning` },
};

const schemas = [
  { '@context': 'https://schema.org', '@type': 'WebPage', name: 'Travel Planning Guide', description: 'Complete travel planning guide for 2025', url: `${SITE_URL}/travel-planning` },
  { '@context': 'https://schema.org', '@type': 'HowTo', name: 'How to Plan a Trip', description: 'Step-by-step guide to planning your perfect trip', step: [
    { '@type': 'HowToStep', name: 'Choose Destination', text: 'Research and choose your travel destination' },
    { '@type': 'HowToStep', name: 'Set Budget', text: 'Determine your travel budget and savings plan' },
    { '@type': 'HowToStep', name: 'Book Flights', text: 'Compare and book flights at the best prices' },
    { '@type': 'HowToStep', name: 'Book Accommodation', text: 'Reserve hotels, hostels, or vacation rentals' },
    { '@type': 'HowToStep', name: 'Plan Activities', text: 'Research and book tours and activities' },
    { '@type': 'HowToStep', name: 'Pack Smart', text: 'Use packing lists to prepare efficiently' },
  ]},
  { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [
    { '@type': 'Question', name: 'How far in advance should I plan a trip?', acceptedAnswer: { '@type': 'Answer', text: 'Start planning 3-6 months ahead for international trips, 1-3 months for domestic trips.' } },
    { '@type': 'Question', name: 'How do I create a travel budget?', acceptedAnswer: { '@type': 'Answer', text: 'Calculate flights, accommodation, food (estimate $50-100/day), activities, transport, and add 10-15% buffer.' } },
  ]},
  { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Travel Planning', item: `${SITE_URL}/travel-planning` },
  ]},
];

export default function TravelPlanningLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      {children}
    </>
  );
}
