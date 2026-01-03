import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Become a Travel Agent - Net Pricing & B2B Tools | Fly2Any',
  description: 'Join Fly2Any as a travel agent. Access wholesale net pricing, set your own markup, and keep 100% of your profit. Professional tools for independent agents, agencies & tour operators.',
  keywords: [
    'become travel agent',
    'travel agent platform',
    'wholesale travel rates',
    'net pricing travel',
    'B2B travel platform',
    'travel agent tools',
    'independent travel agent',
    'start travel agency',
    'travel agent commission',
    'host agency alternative',
  ],
  openGraph: {
    title: 'Become a Travel Agent | Fly2Any B2B Platform',
    description: 'Net pricing. Your markup. 100% profit. Professional tools for travel professionals.',
    images: ['/og/become-agent.jpg'],
  },
};

export default function BecomeAgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
