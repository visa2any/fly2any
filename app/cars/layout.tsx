import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Car Rentals & Best Rates | Compare Top Providers - Fly2Any',
  description: 'Compare car rental prices from Hertz, Enterprise, Avis & more. Best deals on SUVs, sedans, luxury cars at airports worldwide. Free cancellation.',
  keywords: 'car rental, rent a car, cheap car hire, airport car rental, SUV rental, luxury car rental, car rental deals, Hertz, Enterprise, Avis',
  openGraph: {
    title: 'Compare Car Rental Deals | Fly2Any',
    description: 'Find the best car rental rates from top providers. Compare prices and book with free cancellation.',
    type: 'website',
    url: 'https://www.fly2any.com/cars',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Car Rental Deals | Fly2Any',
    description: 'Compare car rental prices from top providers and save.',
  },
  alternates: {
    canonical: 'https://www.fly2any.com/cars',
  },
};

export default function CarsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
