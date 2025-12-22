import { Metadata } from 'next';

// noindex for search result pages - infinite URL variations waste crawl budget
export const metadata: Metadata = {
  robots: 'noindex, follow',
  title: 'Activities Search Results | Fly2Any',
};

export default function ActivitiesResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
