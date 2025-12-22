import { Metadata } from 'next';

// noindex for search result pages - infinite URL variations waste crawl budget
export const metadata: Metadata = {
  robots: 'noindex, follow',
  title: 'Transfers Search Results | Fly2Any',
};

export default function TransfersResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
