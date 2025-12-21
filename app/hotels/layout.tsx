import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hotel Deals & Accommodation | Book Best Rates - Fly2Any',
  description: 'Find the best hotel deals worldwide. Compare prices from top booking sites, read verified reviews, and save up to 60% on hotels, resorts, and vacation rentals.',
  keywords: 'hotel deals, cheap hotels, hotel booking, accommodation, best hotel rates, luxury hotels, budget hotels, resort deals, vacation rentals',
  openGraph: {
    title: 'Book Hotels at Best Rates | Fly2Any',
    description: 'Compare hotel prices from all major booking sites. Find deals on hotels, resorts, and vacation rentals worldwide.',
    type: 'website',
    url: 'https://www.fly2any.com/hotels',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hotel Deals | Fly2Any',
    description: 'Find the best hotel rates worldwide. Compare prices and save up to 60%.',
  },
  alternates: {
    canonical: 'https://www.fly2any.com/hotels',
  },
};

export default function HotelsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
