import { Metadata } from "next";
import { StructuredData } from "@/components/seo/StructuredData";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.fly2any.com";

export const metadata: Metadata = {
  title: "Multi-City Trip Planner - Plan Multiple Destinations | Fly2Any",
  description: "Plan multi-city trips with ease. Visit multiple destinations in one trip with optimized routes, flights, and hotels. Europe, Asia, USA multi-stop itineraries.",
  keywords: "multi city trip planner, multiple destination vacation, multi stop flight, round trip multiple cities, multi city itinerary",
  openGraph: {
    title: "Multi-City Trip Planner | Fly2Any",
    description: "Plan trips to multiple cities with optimized routes and best prices.",
    url: `${SITE_URL}/multi-city`,
    type: "website",
  },
  alternates: { canonical: `${SITE_URL}/multi-city` },
};

export default function MultiCityLayout({ children }: { children: React.ReactNode }) {
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Multi-City Planner", item: `${SITE_URL}/multi-city` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Multi-City Trip Planner",
      description: "Plan multi-destination trips with optimized routing",
      applicationCategory: "TravelApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "How do I book a multi-city flight?", acceptedAnswer: { "@type": "Answer", text: "Add your destinations in order, we'll find the best route and price for all legs combined." } },
        { "@type": "Question", name: "Is multi-city cheaper than round trip?", acceptedAnswer: { "@type": "Answer", text: "Often yes! Multi-city routing can save 20-40% vs booking separate round trips." } },
      ],
    },
  ];

  return (
    <>
      {schemas.map((s, i) => <StructuredData key={i} schema={s} />)}
      {children}
    </>
  );
}
