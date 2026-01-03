import { Metadata } from "next";
import { StructuredData } from "@/components/seo/StructuredData";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.fly2any.com";

const THEME_SEO: Record<string, { title: string; desc: string; keywords: string }> = {
  "romantic-getaways": {
    title: "Romantic Getaways",
    desc: "Escape to Paris, Santorini, Maldives & Venice. Intimate couples packages with luxury hotels, fine dining & private experiences.",
    keywords: "romantic vacation, couples trip, honeymoon packages, romantic getaway deals",
  },
  "family-vacations": {
    title: "Family Vacations",
    desc: "Kid-friendly adventures in Orlando, San Diego, Hawaii & Cancun. Theme parks, beaches & activities for all ages.",
    keywords: "family vacation packages, kids travel, family-friendly resorts, Disney vacation",
  },
  "adventure-travel": {
    title: "Adventure Travel",
    desc: "Thrilling experiences in Costa Rica, New Zealand, Iceland & Peru. Hiking, zip-lining, bungee jumping & more.",
    keywords: "adventure travel, extreme sports vacation, hiking trips, adventure packages",
  },
  "business-trips": {
    title: "Business Travel",
    desc: "Efficient corporate travel to NYC, Chicago, San Francisco & Seattle. Premium hotels & seamless logistics.",
    keywords: "business travel, corporate trips, business class flights, executive hotels",
  },
  "beach-holidays": {
    title: "Beach Holidays",
    desc: "Sun & sand in Miami, Bahamas, Phuket & Bali. Beachfront resorts, water sports & total relaxation.",
    keywords: "beach vacation, tropical getaway, beach resort packages, caribbean vacation",
  },
  "cultural-exploration": {
    title: "Cultural Exploration",
    desc: "Discover Rome, Tokyo, Cairo & Barcelona. History, art, cuisine & authentic local experiences.",
    keywords: "cultural travel, history tours, museum trips, heritage travel packages",
  },
  "celebrations": {
    title: "Celebration Trips",
    desc: "Anniversary trips, birthday vacations, retirement getaways. Mark life's milestones with unforgettable travel experiences.",
    keywords: "anniversary trip ideas, birthday vacation, retirement travel, milestone celebration trip",
  },
  "bachelor-bachelorette": {
    title: "Bachelor & Bachelorette Trips",
    desc: "Las Vegas, Miami, Nashville party packages. VIP access, group accommodations & unforgettable pre-wedding celebrations.",
    keywords: "bachelor party trip, bachelorette party destination, vegas bachelor party, miami bachelorette",
  },
  "family-reunion": {
    title: "Family Reunion Vacations",
    desc: "Large group accommodations in Orlando, Lake Tahoe & beach destinations. Multi-generational activities for the whole family.",
    keywords: "family reunion vacation, large family trip, multi-generational travel, family reunion destination",
  },
};

export async function generateMetadata({ params }: { params: { theme: string } }): Promise<Metadata> {
  const theme = THEME_SEO[params.theme] || {
    title: params.theme.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
    desc: "Curated travel packages with flights, hotels & activities included.",
    keywords: "travel packages, vacation deals",
  };

  return {
    title: `${theme.title} - Travel Packages | Fly2Any`,
    description: theme.desc,
    keywords: theme.keywords,
    openGraph: {
      title: `${theme.title} | Fly2Any`,
      description: theme.desc,
      url: `${SITE_URL}/journeys/${params.theme}`,
      type: "website",
    },
    alternates: { canonical: `${SITE_URL}/journeys/${params.theme}` },
  };
}

export default function JourneyThemeLayout({ children, params }: { children: React.ReactNode; params: { theme: string } }) {
  const theme = THEME_SEO[params.theme] || { title: params.theme.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()), desc: "" };

  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Journeys", item: `${SITE_URL}/journeys` },
        { "@type": "ListItem", position: 3, name: theme.title, item: `${SITE_URL}/journeys/${params.theme}` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: `${theme.title} Packages`,
      description: theme.desc,
      brand: { "@type": "Brand", name: "Fly2Any" },
      offers: {
        "@type": "AggregateOffer",
        lowPrice: 899,
        highPrice: 4999,
        priceCurrency: "USD",
        offerCount: 10,
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
