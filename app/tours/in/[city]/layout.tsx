import { Metadata } from "next";
import { StructuredData } from "@/components/seo/StructuredData";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.fly2any.com";

const CITY_SEO: Record<string, { title: string; tours: string }> = {
  "new-york": { title: "New York City", tours: "Statue of Liberty, Broadway, Central Park, Brooklyn Bridge" },
  "los-angeles": { title: "Los Angeles", tours: "Hollywood, Universal Studios, Santa Monica, Getty Museum" },
  "miami": { title: "Miami", tours: "Everglades, Art Deco, Key West, South Beach" },
  "las-vegas": { title: "Las Vegas", tours: "Grand Canyon, Hoover Dam, Red Rock Canyon, helicopter rides" },
  "chicago": { title: "Chicago", tours: "architecture boat tours, food tours, Millennium Park" },
  "san-francisco": { title: "San Francisco", tours: "Alcatraz, Golden Gate, Napa Valley wine country" },
  "orlando": { title: "Orlando", tours: "Disney, Universal, Kennedy Space Center, airboat tours" },
  "paris": { title: "Paris", tours: "Eiffel Tower, Louvre, Versailles, Seine River cruises" },
  "rome": { title: "Rome", tours: "Colosseum, Vatican, Sistine Chapel, Roman Forum" },
  "london": { title: "London", tours: "Tower of London, Buckingham Palace, Stonehenge, Thames" },
  "barcelona": { title: "Barcelona", tours: "Sagrada Familia, Park Guell, Gothic Quarter, Montserrat" },
  "tokyo": { title: "Tokyo", tours: "Senso-ji, Shibuya, Mount Fuji day trips, Tsukiji Market" },
  "cancun": { title: "Cancun", tours: "Chichen Itza, snorkeling, cenotes, Isla Mujeres" },
  "dubai": { title: "Dubai", tours: "desert safari, Burj Khalifa, dhow cruise, Abu Dhabi day trip" },
};

export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const citySlug = params.city;
  const cityInfo = CITY_SEO[citySlug] || { title: citySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), tours: "" };

  return {
    title: `Best Tours in ${cityInfo.title} 2026 - Book Guided Experiences | Fly2Any`,
    description: `Discover the best tours in ${cityInfo.title}: ${cityInfo.tours}. Book guided tours with free cancellation and instant confirmation. 50,000+ experiences worldwide.`,
    keywords: `${cityInfo.title} tours, guided tours ${cityInfo.title}, best tours ${cityInfo.title}, things to do ${cityInfo.title}, ${cityInfo.title} day trips, ${cityInfo.title} sightseeing`,
    openGraph: {
      title: `Best Tours in ${cityInfo.title} | Fly2Any`,
      description: `Explore top-rated guided tours in ${cityInfo.title}. Book with instant confirmation and free cancellation.`,
      url: `${SITE_URL}/tours/in/${citySlug}`,
      type: "website",
      images: [{ url: `${SITE_URL}/api/og?title=Tours in ${encodeURIComponent(cityInfo.title)}`, width: 1200, height: 630 }],
    },
    alternates: {
      canonical: `${SITE_URL}/tours/in/${citySlug}`,
    },
  };
}

export default function ToursInCityLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { city: string };
}) {
  const citySlug = params.city;
  const cityInfo = CITY_SEO[citySlug] || { title: citySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), tours: "" };

  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Tours", item: `${SITE_URL}/tours` },
        { "@type": "ListItem", position: 3, name: `Tours in ${cityInfo.title}`, item: `${SITE_URL}/tours/in/${citySlug}` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "TouristDestination",
      name: cityInfo.title,
      description: `Guided tours and day trips in ${cityInfo.title}`,
      touristType: ["Cultural tourists", "Adventure travelers", "Family travelers", "Solo travelers"],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: `What are the best tours in ${cityInfo.title}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `Top tours in ${cityInfo.title} include ${cityInfo.tours}. Fly2Any offers guided tours, day trips, food tours, and skip-the-line experiences with free cancellation.`,
          },
        },
        {
          "@type": "Question",
          name: `How much do tours cost in ${cityInfo.title}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `Tour prices in ${cityInfo.title} range from $25 for walking tours to $200+ for premium experiences like helicopter rides or private guided tours. Most popular tours are $40-$100 per person.`,
          },
        },
      ],
    },
  ];

  return (
    <>
      {schemas.map((schema, i) => (
        <StructuredData key={i} schema={schema} />
      ))}
      {children}
    </>
  );
}
