import { Metadata } from "next";
import { StructuredData } from "@/components/seo/StructuredData";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.fly2any.com";

export const metadata: Metadata = {
  title: "Plan My Trip - Free Travel Planning Assistance | Fly2Any",
  description: "Let our AI + travel experts plan your perfect trip. Custom itineraries, best prices, zero stress. Tell us your dream vacation and we'll handle everything.",
  keywords: "plan my trip, help me plan a trip, custom trip planner, travel planning service, vacation planner, trip planning assistance",
  openGraph: {
    title: "Plan My Trip - Free Travel Planning | Fly2Any",
    description: "Let us plan your perfect vacation. AI-powered + human expertise.",
    url: `${SITE_URL}/plan-my-trip`,
    type: "website",
  },
  alternates: { canonical: `${SITE_URL}/plan-my-trip` },
};

export default function PlanMyTripLayout({ children }: { children: React.ReactNode }) {
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Plan My Trip", item: `${SITE_URL}/plan-my-trip` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Trip Planning Service",
      description: "Personalized travel planning with AI and human experts",
      provider: { "@type": "TravelAgency", name: "Fly2Any", url: SITE_URL },
      serviceType: "Travel Planning",
      areaServed: { "@type": "Country", name: "United States" },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free trip planning consultation",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "Is trip planning free?", acceptedAnswer: { "@type": "Answer", text: "Yes, our trip planning service is completely free. You only pay for your bookings." } },
        { "@type": "Question", name: "How long does planning take?", acceptedAnswer: { "@type": "Answer", text: "Our AI generates initial itineraries in minutes. Custom expert planning takes 24-48 hours." } },
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
