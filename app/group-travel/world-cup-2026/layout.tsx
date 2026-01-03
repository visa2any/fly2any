import { Metadata } from "next";
import { StructuredData } from "@/components/seo/StructuredData";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.fly2any.com";

export const metadata: Metadata = {
  title: "World Cup 2026 Group Travel - Plan with Friends | Fly2Any",
  description: "Plan your FIFA World Cup 2026 group trip. Coordinate flights, hotels & match tickets with friends. USA, Mexico & Canada venues. Group discounts available.",
  keywords: "world cup 2026 group trip, fifa 2026 group travel, world cup friends trip, world cup 2026 packages group",
  openGraph: {
    title: "World Cup 2026 Group Travel | Fly2Any",
    description: "Plan your World Cup 2026 trip with friends. Shared bookings, group discounts.",
    url: `${SITE_URL}/group-travel/world-cup-2026`,
  },
  alternates: { canonical: `${SITE_URL}/group-travel/world-cup-2026` },
};

export default function WC2026GroupLayout({ children }: { children: React.ReactNode }) {
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Group Travel", item: `${SITE_URL}/group-travel` },
        { "@type": "ListItem", position: 3, name: "World Cup 2026", item: `${SITE_URL}/group-travel/world-cup-2026` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Event",
      name: "FIFA World Cup 2026 - Group Travel Package",
      description: "Group travel packages for FIFA World Cup 2026",
      startDate: "2026-06-11",
      endDate: "2026-07-19",
      location: [
        { "@type": "Place", name: "United States" },
        { "@type": "Place", name: "Mexico" },
        { "@type": "Place", name: "Canada" },
      ],
      organizer: { "@type": "Organization", name: "FIFA" },
      offers: {
        "@type": "AggregateOffer",
        lowPrice: 1999,
        highPrice: 9999,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
    },
  ];

  return (
    <>
      {schemas.map((s, i) => <StructuredData key={i} schema={s} />)}
      {children}
    </>
  );
}
