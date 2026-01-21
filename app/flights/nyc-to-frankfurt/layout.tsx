import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'NYC to Frankfurt Flights: Compare Prices from $410',
    description: 'Compare 500+ airlines flying New York to Frankfurt. Best prices from $410, cheapest months revealed. Direct flights from 8h 15m. Book smart.',
    keywords: 'New York to Frankfurt flights, NYC FRA flights, cheap flights to Frankfurt, Frankfurt flight deals, Lufthansa, book NYC to Frankfurt',
    openGraph: {
        title: 'NYC to Frankfurt Flights: Compare Prices from $410',
        description: 'Compare 500+ airlines flying New York to Frankfurt. Best prices from $410, cheapest months revealed. Direct flights from 8h 15m.',
        type: 'website',
    },
};

export default function NYCToFrankfurtLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
