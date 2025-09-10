/**
 * English version of Brazilian city pages
 * Uses the same component as the main multilingual route
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CityLandingGenerator from '@/lib/seo/city-landing-generator';
import { brazilianDiaspora } from '@/lib/data/brazilian-diaspora';

// Import the main city page component
import CityPageComponent from '@/app/[lang]/cidade/[cityId]/page';

interface CityPageProps {
  params: Promise<{
    cityId: string;
  }>;
}

// Generate static params for all cities
export async function generateStaticParams() {
  return brazilianDiaspora.map(city => ({
    cityId: city.id
  }));
}

// Generate metadata for each city page
export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { cityId } = await params;
  const cityData = CityLandingGenerator.generateCityPage(cityId, 'en');
  
  if (!cityData) {
    return {
      title: 'City Not Found - Fly2Any',
      description: 'The requested city page was not found.'
    };
  }

  return cityData.metadata;
}

export default async function EnglishCityPage({ params }: CityPageProps) {
  const { cityId } = await params;
  // Pass through to the main component with English language
  return CityPageComponent({ params: Promise.resolve({ cityId, lang: 'en' as const }) });
}