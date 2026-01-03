/**
 * Bing Webmaster URL Submission API
 * POST /api/seo/bing-submit
 *
 * Submits URLs to Bing for indexing
 */

import { NextRequest, NextResponse } from "next/server";

const BING_API_KEY = process.env.BING_WEBMASTER_API_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.fly2any.com";

// All new SEO pages to submit
const SEO_PAGES = [
  // Core pages
  "/plan-my-trip",
  "/multi-city",
  "/group-travel",
  "/journeys",
  // Journey themes
  "/journeys/romantic-getaways",
  "/journeys/family-vacations",
  "/journeys/adventure-travel",
  "/journeys/business-trips",
  "/journeys/beach-holidays",
  "/journeys/cultural-exploration",
  "/journeys/celebrations",
  "/journeys/bachelor-bachelorette",
  "/journeys/family-reunion",
  // Plan my trip destinations
  "/plan-my-trip/to/italy",
  "/plan-my-trip/to/france",
  "/plan-my-trip/to/spain",
  "/plan-my-trip/to/greece",
  "/plan-my-trip/to/japan",
  "/plan-my-trip/to/mexico",
  "/plan-my-trip/to/hawaii",
  "/plan-my-trip/to/caribbean",
  "/plan-my-trip/to/europe",
  "/plan-my-trip/to/asia",
  // Group travel
  "/group-travel/world-cup-2026",
  // Hotels in cities
  "/hotels/in/new-york",
  "/hotels/in/los-angeles",
  "/hotels/in/miami",
  "/hotels/in/las-vegas",
  "/hotels/in/chicago",
  "/hotels/in/san-francisco",
  "/hotels/in/orlando",
  "/hotels/in/seattle",
  "/hotels/in/boston",
  "/hotels/in/denver",
  // Activities in cities
  "/activities/in/new-york",
  "/activities/in/los-angeles",
  "/activities/in/miami",
  "/activities/in/las-vegas",
  "/activities/in/chicago",
  "/activities/in/san-francisco",
  "/activities/in/orlando",
];

async function submitToBing(urls: string[]): Promise<{ success: boolean; error?: string }> {
  if (!BING_API_KEY) {
    return { success: false, error: "BING_WEBMASTER_API_KEY not configured" };
  }

  const urlList = urls.map(path => `${SITE_URL}${path}`);

  try {
    const response = await fetch(
      `https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey=${BING_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          siteUrl: SITE_URL,
          urlList,
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return { success: false, error: `Bing API error: ${response.status} - ${text}` };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: `Request failed: ${error}` };
  }
}

export async function POST(request: NextRequest) {
  // Check for admin auth (simple API key check)
  const authHeader = request.headers.get("authorization");
  const adminKey = process.env.ADMIN_API_KEY;

  if (adminKey && authHeader !== `Bearer ${adminKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const urls = body.urls || SEO_PAGES;

    // Bing allows max 10,000 URLs per day, 100 per batch
    const batchSize = 100;
    const results: { batch: number; success: boolean; error?: string }[] = [];

    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      const result = await submitToBing(batch);
      results.push({ batch: Math.floor(i / batchSize) + 1, ...result });

      // Small delay between batches
      if (i + batchSize < urls.length) {
        await new Promise(r => setTimeout(r, 500));
      }
    }

    const allSuccess = results.every(r => r.success);

    return NextResponse.json({
      success: allSuccess,
      submitted: urls.length,
      batches: results,
      urls: urls.map((p: string) => `${SITE_URL}${p}`),
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "/api/seo/bing-submit",
    method: "POST",
    description: "Submit URLs to Bing Webmaster for indexing",
    defaultUrls: SEO_PAGES.length,
    usage: {
      submitAll: "POST /api/seo/bing-submit (submits all SEO pages)",
      submitCustom: "POST /api/seo/bing-submit with body { urls: ['/path1', '/path2'] }",
    },
    requiresEnv: ["BING_WEBMASTER_API_KEY"],
  });
}
