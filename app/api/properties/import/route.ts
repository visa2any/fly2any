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

    // 2. Clean HTML and Extract Structured Data
    const $ = cheerio.load(html);
    
    // Extract JSON-LD (Rich Snippets) - The Gold Mine for Real Estate
    let jsonLdData: any = {};
    $('script[type="application/ld+json"]').each((_, el) => {
        try {
            const data = JSON.parse($(el).html() || '{}');
            // Look for relevant schema types
            if (['Hotel', 'LodgingBusiness', 'Resort', 'BedAndBreakfast', 'VacationRental', 'RealEstateListing', 'Product'].includes(data['@type'])) {
                jsonLdData = { ...jsonLdData, ...data };
            }
            // Sometimes it's an array of graphs
            if (Array.isArray(data)) {
                 data.forEach(item => {
                    if (item['@type'] && ['Hotel', 'LodgingBusiness', 'VR'].some(t => item['@type'].includes(t))) {
                        jsonLdData = { ...jsonLdData, ...item };
                    }
                 });
            }
        } catch (e) { /* ignore parse errors */ }
    });

    // Extract High-Res Images
    const extractedImages: string[] = [];
    
    // 1. Check OG Image
    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage) extractedImages.push(ogImage);

    // 2. Check JSON-LD images
    if (jsonLdData.image) {
        if (Array.isArray(jsonLdData.image)) {
            jsonLdData.image.forEach((img: any) => {
                if (typeof img === 'string') extractedImages.push(img);
                else if (img.url) extractedImages.push(img.url);
            });
        } else if (typeof jsonLdData.image === 'string') {
            extractedImages.push(jsonLdData.image);
        } else if (jsonLdData.image.url) {
            extractedImages.push(jsonLdData.image.url);
        }
    }

    // 3. Scrape img tags (filter for size to avoid icons) - simplified approach
    $('img').each((_, el) => {
        const src = $(el).attr('src') || $(el).attr('data-src');
        if (src && src.startsWith('http') && !src.includes('profile') && !src.includes('icon') && !src.includes('logo')) {
            // Rough heuristic: ignore obvious tiny images if possible, but hard to know dimensions without loading
            if (!extractedImages.includes(src)) extractedImages.push(src);
        }
    });

    // Limit images to top 10 unique
    const uniqueImages = Array.from(new Set(extractedImages)).slice(0, 10);


    // Remove scripts, style, etc for text processing
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
    };

    // 3. FAST PATH: Attempt to map JSON-LD directly
    const fastPathData = mapJsonLdToProperty(jsonLdData, metaTags, uniqueImages);
    
    // If we have at least a Name and Description, return immediately (Fast Path)
    if (fastPathData && fastPathData.name && fastPathData.description && fastPathData.description.length > 10) {
        console.log("🚀 FAST PATH: Successfully mapped JSON-LD data. Bypassing AI.");
        return NextResponse.json({
            success: true,
            data: fastPathData,
            source: 'fast-path'
        });
    }

    console.log("⚠️ FAST PATH FAILED: Insufficient structured data. Falling back to AI...");

    // Get a cleaner text dump (first 10k chars is enough for AI context)
    let bodyText = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 10000);

    const prompt = `
    You are an AI Property Extraction Engine. Your job is to extract structured real estate/hospitality data from the provided raw HTML text and JSON-LD structured data.
    
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
    
    CONTEXT:
    1. JSON-LD Structured Data (HIGH CONFIDENCE): ${JSON.stringify(jsonLdData).substring(0, 5000)}
    2. Meta Tags: ${JSON.stringify(metaTags)}
    3. Page Text (Lower Confidence): "${bodyText}"

    Output strict valid JSON. No markdown.
    `;

    // 4. Call AI Fallback
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
        
        // Attach the scraped images to the AI result
        jsonData.images = uniqueImages;

    } catch (e) {
        console.error("JSON Parse Error", aiRes.message);
        return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
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

function mapJsonLdToProperty(jsonLd: any, meta: any, images: string[]): any | null {
    if (!jsonLd || Object.keys(jsonLd).length === 0) return null;

    // Prioritize specific types
    // Sometimes JSON-LD is an array or graph, we simplified it to a flat object in the loop above or used `Object.assign`.
    
    // Fallback logic for Name/Desc from Meta if JSON-LD is partial
    const name = jsonLd.name || meta.title;
    const description = jsonLd.description || meta.description;

    if (!name && !description) return null;

    // Extract Address
    let address = { city: 'Unknown', country: 'Unknown', full_address: '' };
    if (jsonLd.address) {
        if (typeof jsonLd.address === 'string') {
             address.full_address = jsonLd.address;
        } else {
             address.city = jsonLd.address.addressLocality || '';
             address.country = jsonLd.address.addressCountry || '';
             // Try to build full string
             address.full_address = [
                jsonLd.address.streetAddress, 
                jsonLd.address.addressLocality, 
                jsonLd.address.addressRegion, 
                jsonLd.address.postalCode, 
                jsonLd.address.addressCountry
             ].filter(Boolean).join(', ');
        }
    }

    // Extract Price
    let price = { amount: 0, currency: 'USD' };
    if (jsonLd.priceRange) {
        // e.g. "$50 - $100" -> take lowest or average? Let's take simplistic approach
        const match = jsonLd.priceRange.match(/\d+/);
        if (match) price.amount = parseInt(match[0]);
    } else if (jsonLd.price) {
        price.amount = Number(jsonLd.price) || 0;
        price.currency = jsonLd.priceCurrency || 'USD';
    } else if (jsonLd.offers) {
        const offer = Array.isArray(jsonLd.offers) ? jsonLd.offers[0] : jsonLd.offers;
        if (offer) {
             price.amount = Number(offer.price) || 0;
             price.currency = offer.priceCurrency || 'USD';
        }
    }

    // Extract Amenities
    let amenities: string[] = [];
    if (jsonLd.amenityFeature) {
        const features = Array.isArray(jsonLd.amenityFeature) ? jsonLd.amenityFeature : [jsonLd.amenityFeature];
        amenities = features.map((f: any) => typeof f === 'string' ? f : f.name).filter(Boolean).slice(0, 10);
    }

    // Specs
    const specs = {
        bedrooms: Number(jsonLd.numberOfRooms) || Number(jsonLd.numberOfBedrooms) || 1,
        bathrooms: Number(jsonLd.numberOfBathroomsTotal) || 1,
        maxGuests: Number(jsonLd.occupancy?.value) || 2,
        beds: Number(jsonLd.numberOfBeds) || 1
    };

    return {
        name: name?.trim(),
        description: description?.trim(),
        propertyType: 'hotel', // Default, hard to infer specific mapping without complex logic
        address,
        specs,
        price,
        amenities,
        images: images // Use the images we extracted earlier
    };
}
