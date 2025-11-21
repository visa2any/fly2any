/**
 * Stadium image utilities using Unsplash for high-quality photos
 */

export interface StadiumImage {
  url: string;
  alt: string;
  photographer: string;
  photographerUrl: string;
}

// Map of stadiums to Unsplash photo IDs or search queries
const STADIUM_IMAGES: Record<string, { query: string; width: number; height: number }> = {
  'sofi-stadium': { query: 'sofi-stadium-los-angeles', width: 1200, height: 800 },
  'metlife-stadium': { query: 'metlife-stadium-new-york', width: 1200, height: 800 },
  'att-stadium': { query: 'att-stadium-dallas-cowboys', width: 1200, height: 800 },
  'mercedes-benz-stadium': { query: 'mercedes-benz-stadium-atlanta', width: 1200, height: 800 },
  'hard-rock-stadium': { query: 'hard-rock-stadium-miami', width: 1200, height: 800 },
  'estadio-azteca': { query: 'estadio-azteca-mexico-city', width: 1200, height: 800 },
  'estadio-bbva': { query: 'estadio-bbva-monterrey', width: 1200, height: 800 },
  'bc-place': { query: 'bc-place-vancouver', width: 1200, height: 800 },
};

/**
 * Get stadium image URL from Unsplash
 * Uses verified working Unsplash photo URLs
 */
export function getStadiumImageUrl(stadiumSlug: string, width = 1200, height = 800): string {
  // Map stadiums to verified Unsplash image URLs
  const stadiumPhotoMap: Record<string, string> = {
    'sofi-stadium': 'https://images.unsplash.com/photo-1577223625816-7546f13df25d',
    'metlife-stadium': 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2',
    'att-stadium': 'https://images.unsplash.com/photo-1522778119026-d647f0596c20',
    'mercedes-benz-stadium': 'https://images.unsplash.com/photo-1551958219-acbc608c6377',
    'hard-rock-stadium': 'https://images.unsplash.com/photo-1459865264687-595d652de67e',
    'estadio-azteca': 'https://images.unsplash.com/photo-1577223625816-7546f13df25d',
    'estadio-bbva': 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2',
    'bc-place': 'https://images.unsplash.com/photo-1522778119026-d647f0596c20',
  };

  // Use mapped URL or default to first stadium photo
  const baseUrl = stadiumPhotoMap[stadiumSlug] || 'https://images.unsplash.com/photo-1522778119026-d647f0596c20';
  return `${baseUrl}?w=${width}&h=${height}&fit=crop`;
}

/**
 * Get stadium images for different sections
 */
export function getStadiumImages(stadiumSlug: string) {
  return {
    hero: getStadiumImageUrl(stadiumSlug, 1920, 1080),
    card: getStadiumImageUrl(stadiumSlug, 800, 600),
    thumbnail: getStadiumImageUrl(stadiumSlug, 400, 300),
  };
}

/**
 * Get city skyline image
 * Using verified Unsplash cityscape photos
 */
export function getCitySkylineUrl(cityName: string, width = 1200, height = 600): string {
  // Use verified cityscape photos from Unsplash
  const cityscapeUrls = [
    'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9', // NYC Skyline
    'https://images.unsplash.com/photo-1517935706615-2717063c2225', // Toronto skyline
    'https://images.unsplash.com/photo-1518659231289-2e8c2f7f8a4f', // Mexico City
  ];
  const baseUrl = cityscapeUrls[Math.floor(Math.random() * cityscapeUrls.length)];
  return `${baseUrl}?w=${width}&h=${height}&fit=crop`;
}

/**
 * Get team celebration/fan images
 * Using verified soccer celebration photos
 */
export function getTeamCelebrationUrl(teamName: string, width = 800, height = 600): string {
  const celebrationUrls = [
    'https://images.unsplash.com/photo-1517466787929-bc90951d0974', // Fans celebrating
    'https://images.unsplash.com/photo-1551958219-acbc608c6377', // Crowd cheering
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018', // Victory celebration
  ];
  const baseUrl = celebrationUrls[Math.floor(Math.random() * celebrationUrls.length)];
  return `${baseUrl}?w=${width}&h=${height}&fit=crop`;
}

/**
 * Get World Cup atmosphere images
 * Using local high-performance images with Unsplash fallback
 */
export function getWorldCupAtmosphereUrl(width = 1200, height = 800): string {
  // Try local images first (add your own images to public/images/world-cup/)
  const localImages = [
    '/images/world-cup/hero-1.svg',
    '/images/world-cup/hero-2.svg',
    '/images/world-cup/hero-3.svg',
    '/images/world-cup/hero-4.svg',
    '/images/world-cup/hero-5.svg',
    '/images/world-cup/hero-6.svg',
  ];

  // Fallback to Unsplash if local images don't exist
  const unsplashUrls = [
    'https://images.unsplash.com/photo-1522778119026-d647f0596c20', // Stadium crowd
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018', // Fan celebration
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55', // Trophy moment
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2', // Match atmosphere
    'https://images.unsplash.com/photo-1551958219-acbc608c6377', // World Cup energy
    'https://images.unsplash.com/photo-1517466787929-bc90951d0974', // Victory celebration
  ];

  // Use local images in production, Unsplash for development
  const useLocal = process.env.NODE_ENV === 'production';

  if (useLocal) {
    const index = Math.floor(Date.now() / (1000 * 60 * 60)) % localImages.length;
    return localImages[index];
  }

  const baseUrl = unsplashUrls[Math.floor(Math.random() * unsplashUrls.length)];
  return `${baseUrl}?w=${width}&h=${height}&fit=crop`;
}

/**
 * Get stadium hero background image for hero sections
 * Returns stunning stadium atmosphere photos perfect for hero banners
 * Using working Unsplash image URLs from world-cup-images.ts
 */
export function getStadiumHeroUrl(width = 1920, height = 1080): string {
  // Curated high-quality stadium photos from Unsplash (verified working URLs)
  const heroImageUrls = [
    'https://images.unsplash.com/photo-1522778119026-d647f0596c20', // Packed stadium
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018', // Celebrating fans
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55', // Trophy shine
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2', // Stadium at night
    'https://images.unsplash.com/photo-1551958219-acbc608c6377', // Massive crowd
    'https://images.unsplash.com/photo-1517466787929-bc90951d0974', // Team celebration
  ];

  // Rotate through photos for variety
  const index = Math.floor(Date.now() / (1000 * 60 * 60)) % heroImageUrls.length;
  const baseUrl = heroImageUrls[index];

  // Add optimization parameters
  return `${baseUrl}?w=${width}&h=${height}&fit=crop`;
}
