
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate supported domains
    const isAirbnb = url.includes('airbnb');
    const isBooking = url.includes('booking.com');
    const isVrbo = url.includes('vrbo.com');

    if (!isAirbnb && !isBooking && !isVrbo) {
       return NextResponse.json({ 
        success: false, 
        message: 'Currently we only support importing from Airbnb, Booking.com, or VRBO.' 
      }, { status: 400 });
    }

    let scrapedData: any = {};

    try {
        // Fetch the HTML content
        const response = await fetch(url, {
            headers: {
                // Mimic a real browser to avoid immediate 403s
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            next: { revalidate: 3600 } // Cache results for 1 hour
        });
        
        if (response.ok) {
            const html = await response.text();
            
            // Helper to extract meta content
            const getMetaContent = (pattern: RegExp) => {
                const match = html.match(pattern);
                return match ? match[1] : null; // return captured group
            };

            // Extract OpenGraph tags
            // Note: Different sites might use 'property' or 'name' attributes
            const ogTitle = getMetaContent(/<meta\s+property="og:title"\s+content="([^"]*)"/i) || 
                            getMetaContent(/<meta\s+name="title"\s+content="([^"]*)"/i);
            
            const ogDesc = getMetaContent(/<meta\s+property="og:description"\s+content="([^"]*)"/i) || 
                           getMetaContent(/<meta\s+name="description"\s+content="([^"]*)"/i);
                           
            const ogImage = getMetaContent(/<meta\s+property="og:image"\s+content="([^"]*)"/i);

            // Clean up title (remove site name if present)
            // e.g. "Beautiful Apt - Apartments for Rent - Airbnb" -> "Beautiful Apt"
            let cleanName = ogTitle || '';
            if (cleanName) {
                cleanName = cleanName.split(' - ')[0]; // Remove suffixes
                cleanName = cleanName.split(' | ')[0];
            }

            scrapedData = {
                name: cleanName || "Imported Property",
                description: ogDesc || "",
                image: ogImage || null
            };
        } else {
            console.error('Fetch failed:', response.status);
        }
    } catch (e) {
        console.error('Scraping error:', e);
    }

    // Fallback ID extraction
    let fallbackName = isAirbnb ? "New Airbnb Listing" : "New Property Listing";
    if (!scrapedData.name) {
        const airbnbId = url.match(/\/rooms\/(\d+)/)?.[1];
        if (airbnbId) fallbackName = `Airbnb Listing #${airbnbId}`;
        
        const bookingId = url.match(/\/hotel\/[a-z]{2}\/([^.?]+)/)?.[1];
        if (bookingId) fallbackName = `Booking.com: ${bookingId.replace(/-/g, ' ')}`;
    }

    // fallback / default values
    const finalData = {
      name: scrapedData.name || fallbackName,
      description: scrapedData.description || "Description not available. Please add details manually.",
      propertyType: isAirbnb ? "apartment" : "hotel",
      addressLine1: "",
      city: "",
      country: "",
      basePricePerNight: 0, 
      maxGuests: 2,
      amenities: [],
      images: scrapedData.image ? [scrapedData.image] : [
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80" // Generic fallback
      ]
    };

    return NextResponse.json({
      success: true,
      data: finalData
    });

  } catch (error) {
    console.error('Import failed:', error);
    return NextResponse.json({ error: 'Failed to import property' }, { status: 500 });
  }
}
