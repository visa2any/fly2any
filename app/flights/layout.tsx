import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cheap Flights & Airline Tickets | Compare 500+ Airlines - Fly2Any',
  description: 'Search and compare cheap flights from 500+ airlines worldwide. Find the best deals on domestic and international flights with AI-powered price predictions. Book with confidence.',
  keywords: 'cheap flights, airline tickets, flight deals, compare flights, book flights online, international flights, domestic flights, last minute flights, flight search',
  openGraph: {
    title: 'Find Cheap Flights | Compare 500+ Airlines - Fly2Any',
    description: 'AI-powered flight search. Compare prices across 500+ airlines and find the best deals on flights worldwide.',
    type: 'website',
    url: 'https://www.fly2any.com/flights',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Cheap Flights | Fly2Any',
    description: 'Compare 500+ airlines and find the best flight deals with AI-powered search.',
  },
  alternates: {
    canonical: 'https://www.fly2any.com/flights',
  },
};

export default function FlightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
