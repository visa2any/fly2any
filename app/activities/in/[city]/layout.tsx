import { Metadata } from "next";
import { StructuredData } from "@/components/seo/StructuredData";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.fly2any.com";

const CITY_SEO: Record<string, { title: string; activities: string }> = {
  "new-york": { title: "New York City", activities: "Broadway, Statue of Liberty, Central Park" },
  "los-angeles": { title: "Los Angeles", activities: "Hollywood, Universal Studios, beaches" },
  "miami": { title: "Miami", activities: "Everglades, Art Deco, water sports" },
  "las-vegas": { title: "Las Vegas", activities: "Grand Canyon, shows, nightlife" },
  "chicago": { title: "Chicago", activities: "architecture tours, food tours, lakefront" },
  "san-francisco": { title: "San Francisco", activities: "Alcatraz, Golden Gate, wine country" },
  "orlando": { title: "Orlando", activities: "Disney, Universal, theme parks" },
};

export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const citySlug = params.city;
  const cityInfo = CITY_SEO[citySlug] || { title: citySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), activities: "" };

  return {
    title: `Things to Do in ${cityInfo.title} - Tours & Activities | Fly2Any`,
    description: `Discover the best things to do in ${cityInfo.title}. Book tours, activities & experiences: ${cityInfo.activities}. Instant confirmation, free cancellation.`,
    keywords: `things to do ${cityInfo.title}, ${cityInfo.title} tours, ${cityInfo.title} activities, ${cityInfo.title} attractions, best experiences ${cityInfo.title}`,
    openGraph: {
      title: `Things to Do in ${cityInfo.title} | Fly2Any`,
      description: `Explore top tours and activities in ${cityInfo.title}. Book with instant confirmation.`,
      url: `${SITE_URL}/activities/in/${citySlug}`,
      type: "website",
      images: [{ url: `${SITE_URL}/api/og?title=Activities in ${encodeURIComponent(cityInfo.title)}`, width: 1200, height: 630 }],
    },
    alternates: { canonical: `${SITE_URL}/activities/in/${citySlug}` },
  };
}

export default function ActivitiesInCityLayout({ children, params }: { children: React.ReactNode; params: { city: string } }) {
  const citySlug = params.city;
  const cityInfo = CITY_SEO[citySlug] || { title: citySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), activities: "" };

  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Activities", item: `${SITE_URL}/activities` },
        { "@type": "ListItem", position: 3, name: `Things to Do in ${cityInfo.title}`, item: `${SITE_URL}/activities/in/${citySlug}` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "TouristDestination",
      name: cityInfo.title,
      description: `Explore tours and activities in ${cityInfo.title}`,
      touristType: ["Adventure travelers", "Cultural tourists", "Family travelers"],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: `What are the best things to do in ${cityInfo.title}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `Top activities in ${cityInfo.title} include ${cityInfo.activities}. Fly2Any offers 50,000+ bookable experiences with instant confirmation and free cancellation.`,
          },
        },
        {
          "@type": "Question",
          name: `How much do activities cost in ${cityInfo.title}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `Activity prices in ${cityInfo.title} range from $15 for walking tours to $150+ for premium experiences. Most popular activities are $30-$80 per person with free cancellation available.`,
          },
        },
      ],
    },
  ];

  return (
    <>
      {schemas.map((schema, i) => <StructuredData key={i} schema={schema} />)}
      {children}
    </>
  );
}
