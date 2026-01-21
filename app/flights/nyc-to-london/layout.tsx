import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'NYC to London Flights: Compare Prices from $380',
    description: 'Compare 500+ airlines flying New York to London. Best prices from $380, cheapest months revealed. Direct flights from 6h 55m. Book smart.',
    keywords: 'New York to London flights, NYC LHR flights, cheap flights to London, London flight deals, British Airways, book NYC to London',
    openGraph: {
        title: 'NYC to London Flights: Compare Prices from $380',
        description: 'Compare 500+ airlines flying New York to London. Best prices from $380, cheapest months revealed. Direct flights from 6h 55m.',
        type: 'website',
    },
};

export default function NYCToLondonLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
