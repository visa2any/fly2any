import { Metadata } from "next";
import { StructuredData } from "@/components/seo/StructuredData";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.fly2any.com";

export const metadata: Metadata = {
  title: "Travel Journeys - Curated Trip Packages | Fly2Any",
  description: "Discover AI-curated travel journeys: romantic getaways, family vacations, adventure travel, beach holidays & more. Flights, hotels & activities included.",
  keywords: "travel packages, vacation packages, romantic getaway, family vacation, adventure travel, beach holiday, all-inclusive trips",
  openGraph: {
    title: "Travel Journeys - Curated Trip Packages | Fly2Any",
    description: "Discover curated travel packages designed for every type of traveler.",
    url: `${SITE_URL}/journeys`,
    type: "website",
    images: [{ url: `${SITE_URL}/api/og?title=Travel%20Journeys`, width: 1200, height: 630 }],
  },
  alternates: { canonical: `${SITE_URL}/journeys` },
};

export default function JourneysLayout({ children }: { children: React.ReactNode }) {
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Journeys", item: `${SITE_URL}/journeys` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Travel Journeys",
      description: "Curated travel packages for every type of traveler",
      publisher: { "@type": "Organization", name: "Fly2Any", url: SITE_URL },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: 9,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Romantic Getaways", url: `${SITE_URL}/journeys/romantic-getaways` },
          { "@type": "ListItem", position: 2, name: "Family Vacations", url: `${SITE_URL}/journeys/family-vacations` },
          { "@type": "ListItem", position: 3, name: "Adventure Travel", url: `${SITE_URL}/journeys/adventure-travel` },
          { "@type": "ListItem", position: 4, name: "Business Travel", url: `${SITE_URL}/journeys/business-trips` },
          { "@type": "ListItem", position: 5, name: "Beach Holidays", url: `${SITE_URL}/journeys/beach-holidays` },
          { "@type": "ListItem", position: 6, name: "Cultural Exploration", url: `${SITE_URL}/journeys/cultural-exploration` },
          { "@type": "ListItem", position: 7, name: "Celebration Trips", url: `${SITE_URL}/journeys/celebrations` },
          { "@type": "ListItem", position: 8, name: "Bachelor & Bachelorette", url: `${SITE_URL}/journeys/bachelor-bachelorette` },
          { "@type": "ListItem", position: 9, name: "Family Reunions", url: `${SITE_URL}/journeys/family-reunion` },
        ],
      },
    },
  ];

  return (
    <>
      {schemas.map((schema, i) => <StructuredData key={i} schema={schema} />)}
      {children}
    </>
  );
}
