import { Metadata } from 'next';

// noindex for search result pages - infinite URL variations waste crawl budget
export const metadata: Metadata = {
  robots: 'noindex, follow',
  title: 'Tours Search Results | Fly2Any',
};

export default function ToursResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
