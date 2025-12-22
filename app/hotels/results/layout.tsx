import { Metadata } from 'next';

// noindex for search result pages - infinite URL variations waste crawl budget
export const metadata: Metadata = {
  robots: 'noindex, follow',
  title: 'Hotel Search Results | Fly2Any',
};

export default function HotelResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
