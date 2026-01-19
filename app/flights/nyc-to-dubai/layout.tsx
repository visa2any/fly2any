import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Flights from New York to Dubai: Best Prices & Deals 2024',
    description: 'Find cheap flights from NYC to Dubai. Compare prices from 500+ airlines. Best time to book, cheapest months, airlines, duration & insider tips. Save up to 40% today!',
    keywords: 'New York to Dubai flights, NYC DXB flights, cheap flights to Dubai, Dubai flight deals, Emirates flights, book NYC to Dubai',
    openGraph: {
        title: 'Flights from New York to Dubai: Best Prices & Deals 2024',
        description: 'Find cheap flights from NYC to Dubai. Compare prices from 500+ airlines. Best time to book, cheapest months, airlines, duration & insider tips.',
        type: 'website',
    },
};

export default function NYCToDubaiLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
