import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Airport Transfers & Private Transportation - Fly2Any',
  description: 'Book reliable airport transfers and private transportation worldwide. Compare prices for sedans, SUVs, and luxury vehicles. Meet & greet service with flight tracking.',
  keywords: 'airport transfer, private transfer, airport shuttle, taxi booking, airport pickup, hotel transfer, private driver, meet and greet',
  openGraph: {
    title: 'Book Airport Transfers | Fly2Any',
    description: 'Reliable airport transfers and private transportation worldwide. Compare prices and book instantly.',
    type: 'website',
    url: 'https://www.fly2any.com/transfers',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Airport Transfers | Fly2Any',
    description: 'Book reliable airport transfers with meet & greet service.',
  },
  alternates: {
    canonical: 'https://www.fly2any.com/transfers',
  },
};

export default function TransfersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
