import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'NYC to Tokyo Flights: Compare Prices from $680',
    description: 'Compare 500+ airlines flying New York to Tokyo. Best prices from $680, cheapest months revealed. Direct flights from 14h 10m. Book smart.',
    keywords: 'New York to Tokyo flights, NYC NRT flights, cheap flights to Tokyo, Tokyo flight deals, JAL, ANA, book NYC to Tokyo',
    openGraph: {
        title: 'NYC to Tokyo Flights: Compare Prices from $680',
        description: 'Compare 500+ airlines flying New York to Tokyo. Best prices from $680, cheapest months revealed. Direct flights from 14h 10m.',
        type: 'website',
    },
};

export default function NYCToTokyoLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
