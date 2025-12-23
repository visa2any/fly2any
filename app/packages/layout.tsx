import { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

export const metadata: Metadata = {
  title: 'Vacation Packages | Fly2Any - Flight + Hotel Deals',
  description: 'Book vacation packages with flights and hotels bundled together. Save on your next trip with exclusive package deals from Fly2Any.',
  alternates: {
    canonical: `${SITE_URL}/packages`,
  },
  openGraph: {
    title: 'Vacation Packages | Fly2Any',
    description: 'Bundled flight + hotel vacation packages.',
    type: 'website',
    url: `${SITE_URL}/packages`,
  },
};

export default function PackagesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
