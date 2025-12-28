import { Metadata } from 'next';
import ExperiencesPageClient from './ExperiencesPageClient';

export const metadata: Metadata = {
  title: 'Experiences & Activities | Fly2Any',
  description: 'Discover unforgettable experiences worldwide. Book cruises, shows, food tours, adventures, and more from 45+ trusted providers.',
  openGraph: {
    title: 'Experiences & Activities | Fly2Any',
    description: 'Discover unforgettable experiences worldwide. Book cruises, shows, food tours, adventures, and more.',
    images: ['/og-experiences.jpg'],
  },
};

export default function ExperiencesPage() {
  return <ExperiencesPageClient />;
}
