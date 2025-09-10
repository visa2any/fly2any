/**
 * Spanish version of Brazilian city pages
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
  const cityData = CityLandingGenerator.generateCityPage(cityId, 'es');
  
  if (!cityData) {
    return {
      title: 'Ciudad No Encontrada - Fly2Any',
      description: 'La página de ciudad solicitada no fue encontrada.'
    };
  }

  return cityData.metadata;
}

export default async function SpanishCityPage({ params }: CityPageProps) {
  const { cityId } = await params;
  // Pass through to the main component with Spanish language
  return CityPageComponent({ params: Promise.resolve({ cityId, lang: 'es' as const }) });
}