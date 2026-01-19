import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'NYC to Paris Flights: Best Deals & Prices 2024',
    description: 'Find cheap flights from New York to Paris. Compare 500+ airlines. Best time to book, prices, airlines & insider tips. Save up to 40% today!',
    keywords: 'New York to Paris flights, NYC CDG flights, cheap flights to Paris, Paris flight deals, Air France, book NYC to Paris',
    openGraph: {
        title: 'NYC to Paris Flights: Best Deals & Prices 2024',
        description: 'Find cheap flights from New York to Paris. Compare 500+ airlines. Best time to book, prices, airlines & insider tips.',
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
