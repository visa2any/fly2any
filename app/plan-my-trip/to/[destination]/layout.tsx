import { Metadata } from "next";
import { StructuredData } from "@/components/seo/StructuredData";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.fly2any.com";

const DEST_SEO: Record<string, { name: string; desc: string; type: string }> = {
  "italy": { name: "Italy", desc: "Rome, Venice, Florence, Amalfi Coast", type: "Country" },
  "france": { name: "France", desc: "Paris, Nice, Provence, French Riviera", type: "Country" },
  "spain": { name: "Spain", desc: "Barcelona, Madrid, Seville, Ibiza", type: "Country" },
  "greece": { name: "Greece", desc: "Santorini, Athens, Mykonos, Crete", type: "Country" },
  "japan": { name: "Japan", desc: "Tokyo, Kyoto, Osaka, Mount Fuji", type: "Country" },
  "mexico": { name: "Mexico", desc: "Cancun, Mexico City, Cabo, Tulum", type: "Country" },
  "hawaii": { name: "Hawaii", desc: "Maui, Oahu, Big Island, Kauai", type: "AdministrativeArea" },
  "caribbean": { name: "Caribbean", desc: "Bahamas, Jamaica, Aruba, St. Lucia", type: "Place" },
  "europe": { name: "Europe", desc: "Multi-country itineraries across Europe", type: "Continent" },
  "asia": { name: "Asia", desc: "Thailand, Vietnam, Bali, Singapore", type: "Continent" },
};

export async function generateMetadata({ params }: { params: { destination: string } }): Promise<Metadata> {
  const dest = DEST_SEO[params.destination] || { name: params.destination.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()), desc: "", type: "Place" };
  return {
    title: `Plan a Trip to ${dest.name} - Custom Itinerary | Fly2Any`,
    description: `Let us plan your perfect ${dest.name} vacation. ${dest.desc}. Custom itineraries, best hotels, flights & activities included.`,
    keywords: `plan trip to ${dest.name.toLowerCase()}, ${dest.name.toLowerCase()} vacation planner, ${dest.name.toLowerCase()} itinerary, ${dest.name.toLowerCase()} travel planning`,
    openGraph: {
      title: `Plan a Trip to ${dest.name} | Fly2Any`,
      description: `Custom ${dest.name} trip planning with AI + expert assistance.`,
      url: `${SITE_URL}/plan-my-trip/to/${params.destination}`,
    },
    alternates: { canonical: `${SITE_URL}/plan-my-trip/to/${params.destination}` },
  };
}

export default function PlanTripToLayout({ children, params }: { children: React.ReactNode; params: { destination: string } }) {
  const dest = DEST_SEO[params.destination] || { name: params.destination.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()), type: "Place" };
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Plan My Trip", item: `${SITE_URL}/plan-my-trip` },
        { "@type": "ListItem", position: 3, name: dest.name, item: `${SITE_URL}/plan-my-trip/to/${params.destination}` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "TravelAction",
      name: `Plan Trip to ${dest.name}`,
      description: `Custom trip planning service for ${dest.name}`,
      toLocation: { "@type": dest.type, name: dest.name },
      agent: { "@type": "TravelAgency", name: "Fly2Any", url: SITE_URL },
    },
  ];

  return (
    <>
      {schemas.map((s, i) => <StructuredData key={i} schema={s} />)}
      {children}
    </>
  );
}
