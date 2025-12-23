import { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

export const metadata: Metadata = {
  title: 'Terms of Service | Fly2Any',
  description: 'Fly2Any terms of service. Read our terms and conditions for using our travel booking platform and services.',
  alternates: {
    canonical: `${SITE_URL}/terms`,
  },
  robots: 'index,follow',
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
