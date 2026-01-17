import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Become a Travel Agent with Fly2Any - Net Pricing & B2B Tools',
  description: 'Start your travel agent business with Fly2Any. Get wholesale net pricing on flights, hotels & tours. Set your markup, keep 100% profit. Free to join. Trusted by 1,200+ agents earning up to $200K/month.',
  keywords: [
    'become travel agent',
    'how to become a travel agent',
    'start travel agency',
    'travel agent platform',
    'wholesale travel rates',
    'net pricing travel',
    'B2B travel platform',
    'travel agent tools',
    'independent travel agent',
    'travel agent commission',
    'host agency alternative',
    'travel agent signup',
    'join as travel agent',
    'work from home travel agent',
    'online travel agent business',
  ],
  openGraph: {
    title: 'Become a Travel Agent with Fly2Any | B2B Platform',
    description: 'Net pricing, your markup, 100% profit. Professional B2B tools for travel agents. Free to join. Earn up to $200K/month.',
    images: ['/og/become-agent.jpg'],
    type: 'website',
    url: 'https://www.fly2any.com/become-agent',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Become a Travel Agent with Fly2Any',
    description: 'Net pricing. Your markup. 100% profit. Join 1,200+ travel professionals.',
  },
  alternates: {
    canonical: 'https://www.fly2any.com/become-agent',
  },
};

export default function BecomeAgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
