import { Metadata } from 'next';

// 🇺🇸 US MARKET SEO METADATA - OPTIMIZED FOR GOOGLE RANKINGS
export const metadata: Metadata = {
  title: 'Cheap Flights & Flight Deals - Best Prices Guaranteed | Fly2Any',
  description: 'Find the cheapest flights with our AI-powered search. Compare 500+ airlines, get instant results, and save up to 60% on domestic and international flights. Book with confidence.',
  keywords: 'cheap flights, flight deals, best flight prices, airline tickets, domestic flights, international flights, flight search, compare flights, flight booking',
  openGraph: {
    title: 'Cheap Flights & Flight Deals - Best Prices Guaranteed',
    description: 'Find the cheapest flights with our AI-powered search. Save up to 60% on flights.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Fly2Any'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cheap Flights & Flight Deals - Best Prices Guaranteed',
    description: 'Find the cheapest flights with our AI-powered search. Save up to 60% on flights.'
  },
  alternates: {
    canonical: 'https://fly2any.com/flights'
  }
};

export default function FlightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}