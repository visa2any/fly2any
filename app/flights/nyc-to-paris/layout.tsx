import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'NYC to Paris Flights: Compare Prices from $420',
    description: 'Compare 500+ airlines flying New York to Paris. Best prices from $420, cheapest months revealed. Direct flights from 7h 20m. Book smart.',
    keywords: 'New York to Paris flights, NYC CDG flights, cheap flights to Paris, Paris flight deals, Air France, book NYC to Paris',
    openGraph: {
        title: 'NYC to Paris Flights: Compare Prices from $420',
        description: 'Compare 500+ airlines flying New York to Paris. Best prices from $420, cheapest months revealed. Direct flights from 7h 20m.',
        type: 'website',
    },
};

export default function NYCToParisLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
