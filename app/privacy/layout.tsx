import { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

export const metadata: Metadata = {
  title: 'Privacy Policy | Fly2Any',
  description: 'Fly2Any privacy policy. Learn how we collect, use, and protect your personal information when you use our travel booking platform.',
  alternates: {
    canonical: `${SITE_URL}/privacy`,
  },
  robots: 'index,follow',
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
