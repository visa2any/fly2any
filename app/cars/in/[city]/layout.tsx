import { Metadata } from "next";
import { StructuredData } from "@/components/seo/StructuredData";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.fly2any.com";

const CITY_SEO: Record<string, { title: string; airport: string; providers: string }> = {
  "new-york": { title: "New York City", airport: "JFK, LGA, EWR", providers: "Hertz, Enterprise, Avis, Budget" },
  "los-angeles": { title: "Los Angeles", airport: "LAX", providers: "Hertz, Enterprise, National, Alamo" },
  "miami": { title: "Miami", airport: "MIA, FLL", providers: "Enterprise, Hertz, Avis, Sixt" },
  "las-vegas": { title: "Las Vegas", airport: "LAS", providers: "Enterprise, Hertz, Budget, Dollar" },
  "chicago": { title: "Chicago", airport: "ORD, MDW", providers: "Enterprise, Hertz, Avis, National" },
  "san-francisco": { title: "San Francisco", airport: "SFO, OAK", providers: "Hertz, Enterprise, Avis, Budget" },
  "orlando": { title: "Orlando", airport: "MCO", providers: "Enterprise, Hertz, Alamo, National" },
  "denver": { title: "Denver", airport: "DEN", providers: "Enterprise, Hertz, National, Avis" },
  "seattle": { title: "Seattle", airport: "SEA", providers: "Enterprise, Hertz, Budget, Avis" },
  "dallas": { title: "Dallas", airport: "DFW, DAL", providers: "Enterprise, Hertz, National, Avis" },
  "atlanta": { title: "Atlanta", airport: "ATL", providers: "Enterprise, Hertz, Avis, Budget" },
  "boston": { title: "Boston", airport: "BOS", providers: "Enterprise, Hertz, Avis, National" },
};

export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const citySlug = params.city;
  const cityInfo = CITY_SEO[citySlug] || { title: citySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), airport: "", providers: "all major providers" };

  return {
    title: `Car Rental in ${cityInfo.title} - Compare from $25/day | Fly2Any`,
    description: `Compare car rental deals in ${cityInfo.title} (${cityInfo.airport}). Best rates from ${cityInfo.providers}. Free cancellation, no hidden fees. Book sedans, SUVs, and luxury cars.`,
    keywords: `car rental ${cityInfo.title}, ${cityInfo.title} car hire, rent a car ${cityInfo.title}, ${cityInfo.airport} car rental, cheap car rental ${cityInfo.title}`,
    openGraph: {
      title: `Car Rental in ${cityInfo.title} | Fly2Any`,
      description: `Compare car rental prices in ${cityInfo.title} from top providers. Best rates guaranteed.`,
      url: `${SITE_URL}/cars/in/${citySlug}`,
      type: "website",
      images: [{ url: `${SITE_URL}/api/og?title=Car Rental in ${encodeURIComponent(cityInfo.title)}`, width: 1200, height: 630 }],
    },
    alternates: {
      canonical: `${SITE_URL}/cars/in/${citySlug}`,
    },
  };
}

export default function CarsInCityLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { city: string };
}) {
  const citySlug = params.city;
  const cityInfo = CITY_SEO[citySlug] || { title: citySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), airport: "", providers: "all major providers" };

  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Car Rentals", item: `${SITE_URL}/cars` },
        { "@type": "ListItem", position: 3, name: `Car Rental in ${cityInfo.title}`, item: `${SITE_URL}/cars/in/${citySlug}` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: `Car Rental in ${cityInfo.title}`,
      description: `Compare car rental rates in ${cityInfo.title} from ${cityInfo.providers}`,
      brand: { "@type": "Brand", name: "Fly2Any" },
      offers: {
        "@type": "AggregateOffer",
        lowPrice: 25,
        highPrice: 199,
        priceCurrency: "USD",
        offerCount: 50,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: `How much does it cost to rent a car in ${cityInfo.title}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `Car rental in ${cityInfo.title} starts from $25/day for economy cars. SUVs range from $45-$90/day and luxury vehicles from $100-$200/day. Compare all providers on Fly2Any for the best rate.`,
          },
        },
        {
          "@type": "Question",
          name: `Where can I pick up a rental car in ${cityInfo.title}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `Rental cars are available at ${cityInfo.airport} airport${cityInfo.airport.includes(',') ? 's' : ''} and downtown locations. Airport pickup is most convenient — ${cityInfo.providers} all have counters at the terminal.`,
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
