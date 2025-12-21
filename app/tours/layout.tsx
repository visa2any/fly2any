import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guided Tours & Day Trips | Book Local Experiences - Fly2Any',
  description: 'Explore destinations with expert-led guided tours and day trips. Walking tours, food tours, cultural experiences, and adventure activities. Book with free cancellation.',
  keywords: 'guided tours, day trips, walking tours, food tours, cultural tours, adventure tours, local experiences, sightseeing tours, group tours',
  openGraph: {
    title: 'Book Guided Tours | Fly2Any',
    description: 'Expert-led guided tours and day trips worldwide. Walking tours, food tours, and unique local experiences.',
    type: 'website',
    url: 'https://www.fly2any.com/tours',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guided Tours | Fly2Any',
    description: 'Book expert-led tours and unique local experiences.',
  },
  alternates: {
    canonical: 'https://www.fly2any.com/tours',
  },
};

export default function ToursLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
