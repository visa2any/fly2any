import { Metadata } from "next";
import { StructuredData } from "@/components/seo/StructuredData";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.fly2any.com";

export const metadata: Metadata = {
  title: "Group Travel Planner - Plan Trips With Friends & Family | Fly2Any",
  description: "Plan group trips made easy. Bachelor parties, family reunions, friends getaways. Coordinate bookings, share itineraries, and split payments effortlessly.",
  keywords: "group trip planner, group travel booking, plan trip with friends, family reunion vacation, bachelor party trip, group vacation deals",
  openGraph: {
    title: "Group Travel Planner | Fly2Any",
    description: "Plan group trips with friends & family. Shared itineraries, easy coordination.",
    url: `${SITE_URL}/group-travel`,
    type: "website",
  },
  alternates: { canonical: `${SITE_URL}/group-travel` },
};

export default function GroupTravelLayout({ children }: { children: React.ReactNode }) {
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Group Travel", item: `${SITE_URL}/group-travel` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Group Travel Planning",
      description: "Coordinate group trips with shared itineraries and easy booking",
      provider: { "@type": "TravelAgency", name: "Fly2Any", url: SITE_URL },
      serviceType: "Group Travel Coordination",
      offers: { "@type": "Offer", description: "Group discounts available for 10+ travelers" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "How many people for a group discount?", acceptedAnswer: { "@type": "Answer", text: "Groups of 10+ travelers qualify for special group rates on flights and hotels." } },
        { "@type": "Question", name: "Can everyone book separately?", acceptedAnswer: { "@type": "Answer", text: "Yes! Share your trip link and everyone can book their own flights/hotels while staying coordinated." } },
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
