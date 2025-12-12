/**
 * IndexNow API Integration
 * Instant URL indexing for Bing, Yandex, Seznam, Naver
 *
 * @see https://www.indexnow.org/documentation
 */

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'fly2any-indexnow-key-2025';

// IndexNow endpoints (all share the same key)
const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow',
];

interface IndexNowResponse {
  success: boolean;
  endpoint: string;
  status?: number;
  error?: string;
}

interface IndexNowBatchResult {
  submitted: number;
  successful: number;
  failed: number;
  results: IndexNowResponse[];
}

/**
 * Submit a single URL to IndexNow
 */
export async function submitUrl(url: string): Promise<IndexNowResponse[]> {
  const fullUrl = url.startsWith('http') ? url : `${SITE_URL}${url}`;
  const results: IndexNowResponse[] = [];

  for (const endpoint of INDEXNOW_ENDPOINTS) {
    try {
      const params = new URLSearchParams({
        url: fullUrl,
        key: INDEXNOW_KEY,
      });

      const response = await fetch(`${endpoint}?${params}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      results.push({
        success: response.ok || response.status === 202,
        endpoint,
        status: response.status,
      });
    } catch (error) {
      results.push({
        success: false,
        endpoint,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}

/**
 * Submit multiple URLs to IndexNow (batch)
 * Max 10,000 URLs per request
 */
export async function submitUrls(urls: string[]): Promise<IndexNowBatchResult> {
  if (urls.length === 0) {
    return { submitted: 0, successful: 0, failed: 0, results: [] };
  }

  // Ensure full URLs
  const fullUrls = urls.map(url =>
    url.startsWith('http') ? url : `${SITE_URL}${url}`
  );

  // Split into batches of 10,000
  const batches = [];
  for (let i = 0; i < fullUrls.length; i += 10000) {
    batches.push(fullUrls.slice(i, i + 10000));
  }

  const allResults: IndexNowResponse[] = [];
  let successful = 0;
  let failed = 0;

  for (const batch of batches) {
    const body = {
      host: new URL(SITE_URL).host,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: batch,
    };

    for (const endpoint of INDEXNOW_ENDPOINTS) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        const isSuccess = response.ok || response.status === 202;
        allResults.push({
          success: isSuccess,
          endpoint,
          status: response.status,
        });

        if (isSuccess) successful++;
        else failed++;
      } catch (error) {
        allResults.push({
          success: false,
          endpoint,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        failed++;
      }
    }
  }

  return {
    submitted: fullUrls.length,
    successful,
    failed,
    results: allResults,
  };
}

/**
 * Submit new route page to IndexNow
 */
export async function submitRoutePage(origin: string, destination: string) {
  const slug = `/flights/${origin.toLowerCase()}-${destination.toLowerCase()}`;
  return submitUrl(slug);
}

/**
 * Submit new blog post to IndexNow
 */
export async function submitBlogPost(slug: string) {
  return submitUrl(`/blog/${slug}`);
}

/**
 * Submit sitemap URLs to IndexNow
 * Call this after generating new programmatic pages
 */
export async function submitSitemapUrls(type: 'routes' | 'destinations' | 'hotels' | 'blog') {
  const urlMaps: Record<string, () => string[]> = {
    routes: () => generateRouteUrls(1000),
    destinations: () => generateDestinationUrls(),
    hotels: () => generateHotelUrls(),
    blog: () => generateBlogUrls(),
  };

  const urls = urlMaps[type]?.() || [];
  return submitUrls(urls);
}

// Helper functions to generate URLs
function generateRouteUrls(count: number): string[] {
  // Top routes - these should come from your database
  const topRoutes = [
    'jfk-lax', 'lax-jfk', 'jfk-mia', 'mia-jfk', 'lax-sfo',
    'sfo-lax', 'ord-lax', 'lax-ord', 'jfk-ord', 'ord-jfk',
    'atl-jfk', 'jfk-atl', 'dfw-lax', 'lax-dfw', 'den-lax',
    'lax-den', 'sea-lax', 'lax-sea', 'bos-jfk', 'jfk-bos',
    // International
    'jfk-lhr', 'lhr-jfk', 'lax-cdg', 'cdg-lax', 'mia-gru',
    'jfk-nrt', 'lax-hnd', 'sfo-hkg', 'ord-fra', 'atl-cdg',
  ];

  return topRoutes.slice(0, count).map(route => `/flights/${route}`);
}

function generateDestinationUrls(): string[] {
  const destinations = [
    'new-york', 'los-angeles', 'miami', 'chicago', 'san-francisco',
    'london', 'paris', 'tokyo', 'rome', 'barcelona',
  ];
  return destinations.map(d => `/destinations/${d}`);
}

function generateHotelUrls(): string[] {
  const cities = [
    'new-york', 'los-angeles', 'miami', 'chicago', 'las-vegas',
  ];
  return cities.map(c => `/hotels/${c}`);
}

function generateBlogUrls(): string[] {
  // Should come from database
  return ['/blog'];
}

/**
 * Webhook handler for automatic IndexNow submission
 * Call this when new content is published
 */
export async function onContentPublished(
  type: 'route' | 'blog' | 'destination' | 'deal',
  slug: string
) {
  const urlMap: Record<string, string> = {
    route: `/flights/${slug}`,
    blog: `/blog/${slug}`,
    destination: `/destinations/${slug}`,
    deal: `/deals/${slug}`,
  };

  const url = urlMap[type];
  if (!url) return { success: false, error: 'Invalid content type' };

  const results = await submitUrl(url);

  // Log for monitoring
  console.log(`[IndexNow] Submitted ${type}: ${url}`, results);

  return { success: true, results };
}
