import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tours & Activities | Book Experiences Worldwide - Fly2Any',
  description: 'Discover and book amazing tours, attractions, and activities at your destination. Skip-the-line tickets, guided tours, and unique experiences with instant confirmation.',
  keywords: 'tours, activities, attractions, things to do, guided tours, skip the line, experiences, sightseeing, day trips, excursions',
  openGraph: {
    title: 'Book Tours & Activities | Fly2Any',
    description: 'Discover amazing experiences worldwide. Book tours, attractions, and activities with instant confirmation.',
    type: 'website',
    url: 'https://www.fly2any.com/activities',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tours & Activities | Fly2Any',
    description: 'Book amazing tours and activities at destinations worldwide.',
  },
  alternates: {
    canonical: 'https://www.fly2any.com/activities',
  },
};

export default function ActivitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
