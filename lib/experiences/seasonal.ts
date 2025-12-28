/**
 * Seasonal Logic for Experience Categories
 * Filters weather-sensitive activities based on hemisphere and month
 */

export interface SeasonalConfig {
  activeMonths: number[];
  hemisphereAware: boolean;
  winterBadge?: string;
}

export const SEASONAL_CATEGORIES: Record<string, SeasonalConfig> = {
  'water-sports': {
    activeMonths: [4, 5, 6, 7, 8, 9, 10], // Apr-Oct Northern
    hemisphereAware: true,
    winterBadge: 'Best in Summer'
  },
  'adventure': {
    activeMonths: [3, 4, 5, 6, 7, 8, 9, 10, 11], // Mar-Nov
    hemisphereAware: true,
    winterBadge: 'Weather Dependent'
  },
  'air': {
    activeMonths: [3, 4, 5, 6, 7, 8, 9, 10], // Mar-Oct
    hemisphereAware: true,
    winterBadge: 'Seasonal'
  }
};

// Always available categories
export const YEAR_ROUND_CATEGORIES = [
  'museums', 'shows', 'food-wine', 'wellness', 'classes',
  'landmarks', 'walking-tours', 'private-tours', 'nightlife', 'photography'
];

// Indoor cruises always available
export const INDOOR_KEYWORDS = ['dinner cruise', 'indoor', 'covered', 'heated'];

export function isWinter(latitude: number): boolean {
  const month = new Date().getMonth() + 1;
  const isNorthern = latitude > 0;
  return isNorthern
    ? [12, 1, 2].includes(month)
    : [6, 7, 8].includes(month);
}

export function isCategoryAvailable(categoryId: string, latitude: number): boolean {
  if (YEAR_ROUND_CATEGORIES.includes(categoryId)) return true;

  const config = SEASONAL_CATEGORIES[categoryId];
  if (!config) return true;

  const month = new Date().getMonth() + 1;
  const isNorthern = latitude > 0;

  // Adjust months for Southern hemisphere
  let activeMonths = config.activeMonths;
  if (config.hemisphereAware && !isNorthern) {
    activeMonths = activeMonths.map(m => ((m + 5) % 12) + 1);
  }

  return activeMonths.includes(month);
}

export function getSeasonalBadge(categoryId: string, latitude: number): string | null {
  if (!isCategoryAvailable(categoryId, latitude)) {
    return SEASONAL_CATEGORIES[categoryId]?.winterBadge || null;
  }
  return null;
}
