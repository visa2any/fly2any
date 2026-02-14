import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { callGroq } from '@/lib/ai/groq-client';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    // Allow unauthenticated for now or strictly enforce? 
    // Wizard usually requires auth. Let's enforce soft auth or check user session if needed.
    // For "Try it out" marketing flow, we might want it open, but for "Create", auth is better.
    // Keeping it protected as it consumes AI tokens.
    if (!session?.user) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // 1. Fetch HTML
    // Fake User-Agent to avoid immediate 403s from some sites, though real scraping usually needs proxies.
    // For MVP/Demo, simple fetch often works for many sites or generic pages.
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!res.ok) {
       return NextResponse.json({ error: 'Failed to fetch the URL' }, { status: 400 });
    }

    const html = await res.text();

    // 2. Clean HTML with Cheerio to reduce token usage
    const $ = cheerio.load(html);
    
    // Remove scripts, styles, svg, and excessively noisy elements
    $('script').remove();
    $('style').remove();
    $('svg').remove();
    $('iframe').remove();
    $('noscript').remove();
    $('.ad').remove();
    $('[aria-hidden="true"]').remove();

    // Extract mainly the body text and meta tags
    const metaTags = {
        title: $('meta[property="og:title"]').attr('content') || $('title').text(),
        description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content'),
        image: $('meta[property="og:image"]').attr('content'),
    };

    // Get a cleaner text dump (first 15k chars should be enough for AI context)
    let bodyText = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 15000);

    const prompt = `
    You are an AI Property Extraction Engine. Your job is to extract structured real estate/hospitality data from the provided raw HTML text.
    
    Target URL: ${url}
    
    DATA TO EXTRACT (Return JSON only):
    - name: Property Title (string)
    - description: detailed description (string)
    - propertyType: "hotel" | "apartment" | "villa" | "resort" | "boutique_hotel" | "bed_and_breakfast" (infer from context)
    - address: { city, country, full_address } (infer from context)
    - specs: { 
        bedrooms: number (default 1), 
        bathrooms: number (default 1),
        maxGuests: number (default 2),
        beds: number (default 1)
      }
    - price: { amount: number (per night estimation), currency: string }
    - amenities: string[] (list of top 10 detected amenities e.g., "Wifi", "Pool", "Kitchen")
    - images: string[] (find logic for image types if possible, otherwise use the OG image provided below)

    Context - Meta: ${JSON.stringify(metaTags)}
    Context - PageText: "${bodyText}"

    Output strict valid JSON. No markdown.
    `;

    // 3. Call AI
    const aiRes = await callGroq([
        { role: 'system', content: 'You are a precise data extractor. Output valid JSON only.' },
        { role: 'user', content: prompt }
    ], {
        model: 'llama-3.3-70b-versatile', 
        temperature: 0.1,
        maxTokens: 1024
    });

    if (!aiRes.success || !aiRes.message) {
        throw new Error("AI Processing Failed");
    }

    // 4. Parse & Return
    let jsonData;
    try {
        const cleanJson = aiRes.message.replace(/```json/g, '').replace(/```/g, '').trim();
        jsonData = JSON.parse(cleanJson);
    } catch (e) {
        console.error("JSON Parse Error", aiRes.message);
        return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    // Merge detected OG image if AI didn't find specific ones or to ensure high quality cover
    if (metaTags.image && (!jsonData.images || jsonData.images.length === 0)) {
        jsonData.images = [metaTags.image];
    }

    return NextResponse.json({
        success: true,
        data: jsonData
    });

  } catch (error: any) {
    console.error('Import Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
