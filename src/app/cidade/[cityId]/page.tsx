/**
 * Default Portuguese route for Brazilian city pages
 * Redirects to /pt/cidade/[cityId] for consistency
 */

import { redirect } from 'next/navigation';

interface CityPageProps {
  params: Promise<{
    cityId: string;
  }>;
}

export default async function DefaultCityPage({ params }: CityPageProps) {
  const { cityId } = await params;
  // Redirect to Portuguese version as default
  redirect(`/pt/cidade/${cityId}`);
}