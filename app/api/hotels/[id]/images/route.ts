import { NextRequest, NextResponse } from 'next/server';
import { liteAPI } from '@/lib/api/liteapi';

/**
 * GET /api/hotels/[id]/images
 *
 * Fetch all images for a specific hotel
 * Uses LiteAPI's /data/hotel endpoint which returns full hotelImages array
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hotelId = params.id;

    if (!hotelId) {
      return NextResponse.json(
        { success: false, error: 'Hotel ID is required' },
        { status: 400 }
      );
    }

    console.log(`📸 Fetching images for hotel: ${hotelId}`);

    // Use the liteAPI method to get hotel images
    const images = await liteAPI.getHotelImages(hotelId);

    if (images.length === 0) {
      return NextResponse.json(
        { success: true, data: [], message: 'No images found for this hotel' },
        { status: 200 }
      );
    }

    console.log(`✅ Found ${images.length} images for hotel ${hotelId}`);

    return NextResponse.json({
      success: true,
      data: images,
      meta: {
        hotelId,
        count: images.length,
      },
    }, {
      headers: {
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      }
    });

  } catch (error: any) {
    console.error('❌ Error fetching hotel images:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch hotel images',
      },
      { status: 500 }
    );
  }
}
