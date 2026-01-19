import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'NYC to London Flights: Best Deals & Prices 2024',
    description: 'Find cheap flights from New York to London. Compare 500+ airlines. Best time to book, prices, airlines & insider tips. Save up to 40% today!',
    keywords: 'New York to London flights, NYC LHR flights, cheap flights to London, London flight deals, British Airways, book NYC to London',
    openGraph: {
        title: 'NYC to London Flights: Best Deals & Prices 2024',
        description: 'Find cheap flights from New York to London. Compare 500+ airlines. Best time to book, prices, airlines & insider tips.',
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
