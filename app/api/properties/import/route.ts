
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // SIMULATED IMPORT LOGIC
    // In a real app, this would use a scraping service (e.g. Apify) or specific APIs
    
    // Check supported domains
    const isAirbnb = url.includes('airbnb.com');
    const isBooking = url.includes('booking.com');
    const isVrbo = url.includes('vrbo.com');

    if (!isAirbnb && !isBooking && !isVrbo) {
       return NextResponse.json({ 
        success: false, 
        message: 'Currently we only support importing from Airbnb, Booking.com, or VRBO.' 
      }, { status: 400 });
    }

    // Mock extraction based on URL keywords or random data for demo
    // We try to extract an ID or slug to make it look "real"
    const mockData = {
      name: "Imported Property Title (Simulated)",
      description: "This is a simulated import description. In production, this would be scraped from the external listing.",
      propertyType: isAirbnb ? "apartment" : "hotel",
      addressLine1: "123 Imported St",
      city: "San Francisco",
      country: "USA",
      basePricePerNight: 150,
      maxGuests: 4,
      amenities: ["wifi", "kitchen", "air_conditioning"],
      images: [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80"
      ] // Placeholder images
    };

    // Add specific details
    if (isAirbnb) {
      mockData.name = "Charming Airbnb Getaway";
      mockData.description = "Imported from Airbnb. A lovely place to stay.";
    } else if (isBooking) {
      mockData.name = "Booking.com Validated Stay";
      mockData.propertyType = "hotel";
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json({
      success: true,
      data: mockData
    });

  } catch (error) {
    console.error('Import failed:', error);
    return NextResponse.json({ error: 'Failed to import property' }, { status: 500 });
  }
}
