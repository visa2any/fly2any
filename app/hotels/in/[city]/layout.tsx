import { Metadata } from "next";
import { StructuredData } from "@/components/seo/StructuredData";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.fly2any.com";

// City metadata for SEO
const CITY_SEO: Record<string, { title: string; desc: string }> = {
  "new-york": { title: "New York City", desc: "Manhattan, Times Square, Central Park" },
  "los-angeles": { title: "Los Angeles", desc: "Hollywood, Beverly Hills, Santa Monica" },
  "miami": { title: "Miami", desc: "South Beach, Brickell, Wynwood" },
  "las-vegas": { title: "Las Vegas", desc: "The Strip, Downtown, Fremont Street" },
  "chicago": { title: "Chicago", desc: "Magnificent Mile, Loop, River North" },
  "san-francisco": { title: "San Francisco", desc: "Union Square, Fisherman's Wharf" },
  "orlando": { title: "Orlando", desc: "Disney, Universal, International Drive" },
  "seattle": { title: "Seattle", desc: "Pike Place, Capitol Hill, Waterfront" },
  "boston": { title: "Boston", desc: "Back Bay, Seaport, Beacon Hill" },
  "denver": { title: "Denver", desc: "LoDo, Cherry Creek, RiNo" },
};

export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const citySlug = params.city;
  const cityInfo = CITY_SEO[citySlug] || { title: citySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), desc: "" };

  return {
    title: `Hotels in ${cityInfo.title} - Best Deals from $99 | Fly2Any`,
    description: `Compare ${cityInfo.title} hotel deals. Find cheap hotels near ${cityInfo.desc}. Book with free cancellation and best price guarantee.`,
    keywords: `${cityInfo.title} hotels, cheap hotels ${cityInfo.title}, best hotels ${cityInfo.title}, ${cityInfo.title} hotel deals, where to stay ${cityInfo.title}`,
    openGraph: {
      title: `Hotels in ${cityInfo.title} - Best Deals | Fly2Any`,
      description: `Find the best hotel deals in ${cityInfo.title}. Compare prices from 100+ booking sites.`,
      url: `${SITE_URL}/hotels/in/${citySlug}`,
      type: "website",
      images: [{ url: `${SITE_URL}/api/og?title=Hotels in ${encodeURIComponent(cityInfo.title)}`, width: 1200, height: 630 }],
    },
    alternates: {
      canonical: `${SITE_URL}/hotels/in/${citySlug}`,
    },
  };
}

export default function HotelsInCityLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { city: string };
}) {
  const citySlug = params.city;
  const cityInfo = CITY_SEO[citySlug] || { title: citySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), desc: "" };

  // Schema.org structured data
  const schemas = [
    // Breadcrumb
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Hotels", item: `${SITE_URL}/hotels` },
        { "@type": "ListItem", position: 3, name: `Hotels in ${cityInfo.title}`, item: `${SITE_URL}/hotels/in/${citySlug}` },
      ],
    },
    // Product (Hotel Search)
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: `Hotels in ${cityInfo.title}`,
      description: `Find and compare hotel deals in ${cityInfo.title}`,
      brand: { "@type": "Brand", name: "Fly2Any" },
      offers: {
        "@type": "AggregateOffer",
        lowPrice: 99,
        highPrice: 599,
        priceCurrency: "USD",
        offerCount: 100,
      },
    },
    // FAQ
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: `What is the best area to stay in ${cityInfo.title}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `The best area depends on your preferences. Downtown offers convenience, while beachfront or historic districts provide unique experiences.`,
          },
        },
        {
          "@type": "Question",
          name: `How much do hotels cost in ${cityInfo.title}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `Hotel prices in ${cityInfo.title} range from $99/night for budget options to $500+ for luxury resorts.`,
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
