import { Metadata } from "next";
import { StructuredData } from "@/components/seo/StructuredData";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.fly2any.com";

const CITY_SEO: Record<string, { title: string; airport: string; code: string }> = {
  "new-york": { title: "New York City", airport: "JFK, LaGuardia & Newark", code: "JFK/LGA/EWR" },
  "los-angeles": { title: "Los Angeles", airport: "LAX Airport", code: "LAX" },
  "miami": { title: "Miami", airport: "Miami International", code: "MIA" },
  "las-vegas": { title: "Las Vegas", airport: "Harry Reid International", code: "LAS" },
  "chicago": { title: "Chicago", airport: "O'Hare & Midway", code: "ORD/MDW" },
  "san-francisco": { title: "San Francisco", airport: "SFO Airport", code: "SFO" },
  "orlando": { title: "Orlando", airport: "Orlando International", code: "MCO" },
  "london": { title: "London", airport: "Heathrow, Gatwick & Stansted", code: "LHR/LGW/STN" },
  "paris": { title: "Paris", airport: "Charles de Gaulle & Orly", code: "CDG/ORY" },
  "dubai": { title: "Dubai", airport: "Dubai International", code: "DXB" },
  "cancun": { title: "Cancun", airport: "Cancun International", code: "CUN" },
  "rome": { title: "Rome", airport: "Fiumicino & Ciampino", code: "FCO/CIA" },
  "bangkok": { title: "Bangkok", airport: "Suvarnabhumi & Don Mueang", code: "BKK/DMK" },
  "istanbul": { title: "Istanbul", airport: "Istanbul Airport", code: "IST" },
};

export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const citySlug = params.city;
  const cityInfo = CITY_SEO[citySlug] || { title: citySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), airport: "", code: "" };

  return {
    title: `${cityInfo.title} Airport Transfer - Private Pickup from $35 | Fly2Any`,
    description: `Book private airport transfers in ${cityInfo.title} (${cityInfo.code}). Meet & greet service, flight tracking, fixed prices. Sedans, SUVs, and luxury vehicles. Free cancellation.`,
    keywords: `${cityInfo.title} airport transfer, ${cityInfo.code} pickup, ${cityInfo.title} private transfer, airport shuttle ${cityInfo.title}, ${cityInfo.title} taxi, airport transportation ${cityInfo.title}`,
    openGraph: {
      title: `${cityInfo.title} Airport Transfer | Fly2Any`,
      description: `Book reliable airport transfers in ${cityInfo.title}. Fixed prices, meet & greet, flight tracking.`,
      url: `${SITE_URL}/transfers/at/${citySlug}`,
      type: "website",
      images: [{ url: `${SITE_URL}/api/og?title=Airport Transfer ${encodeURIComponent(cityInfo.title)}`, width: 1200, height: 630 }],
    },
    alternates: {
      canonical: `${SITE_URL}/transfers/at/${citySlug}`,
    },
  };
}

export default function TransfersAtCityLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { city: string };
}) {
  const citySlug = params.city;
  const cityInfo = CITY_SEO[citySlug] || { title: citySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), airport: "", code: "" };

  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Transfers", item: `${SITE_URL}/transfers` },
        { "@type": "ListItem", position: 3, name: `${cityInfo.title} Airport Transfer`, item: `${SITE_URL}/transfers/at/${citySlug}` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "TaxiService",
      name: `${cityInfo.title} Airport Transfer Service`,
      description: `Private airport transfer service at ${cityInfo.airport} in ${cityInfo.title}`,
      provider: { "@type": "TravelAgency", name: "Fly2Any", url: SITE_URL },
      areaServed: { "@type": "City", name: cityInfo.title },
      offers: {
        "@type": "AggregateOffer",
        lowPrice: 35,
        highPrice: 250,
        priceCurrency: "USD",
        offerCount: 20,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: `How much is an airport transfer in ${cityInfo.title}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `Airport transfers in ${cityInfo.title} start from $35 for a sedan. SUVs are $55-$80 and luxury vehicles from $100. All prices are fixed — no surge pricing or hidden fees.`,
          },
        },
        {
          "@type": "Question",
          name: `How do I book an airport transfer from ${cityInfo.code}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `Book on Fly2Any by entering your flight number, pickup airport (${cityInfo.code}), and hotel address. We track your flight in real-time and a driver meets you at arrivals with a name sign.`,
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
