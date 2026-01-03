/**
 * Bing Webmaster Content Submission API
 * POST /api/seo/bing-content
 *
 * Submits page content directly to Bing for faster indexing
 */

import { NextRequest, NextResponse } from "next/server";

const BING_API_KEY = process.env.BING_WEBMASTER_API_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.fly2any.com";

async function fetchPageContent(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { "User-Agent": "Fly2Any-BingSubmit/1.0" },
  });

  const html = await response.text();
  const headers = [
    `HTTP/1.1 ${response.status} ${response.statusText}`,
    `Content-Type: ${response.headers.get("content-type") || "text/html"}`,
    `Content-Length: ${html.length}`,
    "",
    html,
  ].join("\r\n");

  return Buffer.from(headers).toString("base64");
}

async function submitContentToBing(
  pageUrl: string,
  httpMessage: string
): Promise<{ success: boolean; error?: string }> {
  if (!BING_API_KEY) {
    return { success: false, error: "BING_WEBMASTER_API_KEY not configured" };
  }

  try {
    const response = await fetch(
      `https://ssl.bing.com/webmaster/api.svc/json/SubmitContent?apikey=${BING_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          siteUrl: SITE_URL,
          url: pageUrl,
          httpMessage,
          structuredData: "",
          dynamicServing: "0",
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
  const authHeader = request.headers.get("authorization");
  const adminKey = process.env.ADMIN_API_KEY;

  if (adminKey && authHeader !== `Bearer ${adminKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { urls } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: "urls array required" }, { status: 400 });
    }

    const results: { url: string; success: boolean; error?: string }[] = [];

    for (const path of urls) {
      const fullUrl = path.startsWith("http") ? path : `${SITE_URL}${path}`;

      try {
        const httpMessage = await fetchPageContent(fullUrl);
        const result = await submitContentToBing(fullUrl, httpMessage);
        results.push({ url: fullUrl, ...result });

        // Rate limit: small delay between submissions
        await new Promise(r => setTimeout(r, 1000));
      } catch (error) {
        results.push({ url: fullUrl, success: false, error: String(error) });
      }
    }

    return NextResponse.json({
      success: results.every(r => r.success),
      submitted: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "/api/seo/bing-content",
    method: "POST",
    description: "Submit page content to Bing for instant indexing",
    usage: {
      body: '{ "urls": ["/plan-my-trip", "/journeys"] }',
      note: "Fetches each page and submits HTML content to Bing",
    },
    requiresEnv: ["BING_WEBMASTER_API_KEY"],
  });
}
