import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for flight data
const flightDataSchema = z.object({
  id: z.string(),
  origin: z.string(),
  destination: z.string(),
  departureDate: z.string(),
  returnDate: z.string().optional(),
  price: z.number(),
  currency: z.string(),
  airline: z.string().optional(),
  duration: z.string().optional(),
  stops: z.number().optional(),
}).passthrough();

// Validation schema for hotel data
const hotelDataSchema = z.object({
  id: z.string(),
  hotelId: z.string(),
  name: z.string(),
  location: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  checkIn: z.string(),
  checkOut: z.string(),
  price: z.number(),
  currency: z.string(),
  image: z.string().optional(),
  rating: z.number().optional(),
  stars: z.number().optional(),
  roomType: z.string().optional(),
}).passthrough();

// Validation schema for generic product data (cars, activities)
const productDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  currency: z.string(),
  date: z.string().optional(),
  location: z.string().optional(),
  image: z.string().optional(),
}).passthrough();

// Unified validation schema for wishlist item (supports multiple product types)
const createWishlistSchema = z.object({
  productType: z.enum(['flight', 'hotel', 'car', 'activity']).default('flight'),
  productId: z.string().optional(), // External product ID (hotel ID, etc.)
  flightData: flightDataSchema.optional(),
  hotelData: hotelDataSchema.optional(),
  productData: productDataSchema.optional(),
  notes: z.string().optional(),
  targetPrice: z.number().optional(),
  notifyOnDrop: z.boolean().default(true),
}).refine(
  (data) => {
    // Ensure at least one product data is provided based on productType
    if (data.productType === 'flight') return !!data.flightData;
    if (data.productType === 'hotel') return !!data.hotelData;
    return !!data.productData; // For car and activity
  },
  { message: 'Product data is required for the specified product type' }
);

// GET /api/wishlist - Get all wishlist items for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const prisma = getPrismaClient();

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check for productType filter
    const { searchParams } = new URL(request.url);
    const productType = searchParams.get('productType');

    // Get wishlist items (optionally filtered by productType)
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: {
        userId: user.id,
        ...(productType && { productType }),
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group items by product type for summary
    const summary = {
      flights: wishlistItems.filter(i => i.productType === 'flight').length,
      hotels: wishlistItems.filter(i => i.productType === 'hotel').length,
      cars: wishlistItems.filter(i => i.productType === 'car').length,
      activities: wishlistItems.filter(i => i.productType === 'activity').length,
    };

    return NextResponse.json({
      success: true,
      items: wishlistItems,
      count: wishlistItems.length,
      summary,
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wishlist items' },
      { status: 500 }
    );
  }
}

// POST /api/wishlist - Add item to wishlist
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const prisma = getPrismaClient();

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = createWishlistSchema.parse(body);

    // Check if item already exists (prevent duplicates)
    const existingItem = await prisma.wishlistItem.findFirst({
      where: {
        userId: user.id,
        productType: validatedData.productType,
        ...(validatedData.productId && { productId: validatedData.productId }),
      },
    });

    if (existingItem) {
      return NextResponse.json({
        success: true,
        item: existingItem,
        message: 'Item already in wishlist',
        alreadyExists: true,
      });
    }

    // Create wishlist item with appropriate data based on product type
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId: user.id,
        productType: validatedData.productType,
        productId: validatedData.productId,
        flightData: validatedData.flightData as any,
        hotelData: validatedData.hotelData as any,
        productData: validatedData.productData as any,
        notes: validatedData.notes,
        targetPrice: validatedData.targetPrice,
        notifyOnDrop: validatedData.notifyOnDrop,
      },
    });

    const productTypeLabels: Record<string, string> = {
      flight: 'Flight',
      hotel: 'Hotel',
      car: 'Car rental',
      activity: 'Activity',
    };

    return NextResponse.json({
      success: true,
      item: wishlistItem,
      message: `${productTypeLabels[validatedData.productType]} added to wishlist`,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.format() },
        { status: 400 }
      );
    }

    console.error('Error adding to wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to add item to wishlist' },
      { status: 500 }
    );
  }
}

// DELETE /api/wishlist - Remove item from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const prisma = getPrismaClient();

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('id'); // Direct wishlist item ID
    const flightId = searchParams.get('flightId'); // Legacy: flight ID
    const productId = searchParams.get('productId'); // Product ID (hotel, car, etc.)
    const productType = searchParams.get('productType');

    if (!itemId && !flightId && !productId) {
      return NextResponse.json(
        { error: 'Item ID, Flight ID, or Product ID is required' },
        { status: 400 }
      );
    }

    let deletedCount = 0;

    // Delete by direct wishlist item ID (preferred)
    if (itemId) {
      const deleted = await prisma.wishlistItem.deleteMany({
        where: {
          id: itemId,
          userId: user.id,
        },
      });
      deletedCount = deleted.count;
    }
    // Delete by product ID
    else if (productId) {
      const deleted = await prisma.wishlistItem.deleteMany({
        where: {
          userId: user.id,
          productId,
          ...(productType && { productType }),
        },
      });
      deletedCount = deleted.count;
    }
    // Legacy: Delete by flight ID (search in flightData JSON)
    else if (flightId) {
      const deleted = await prisma.wishlistItem.deleteMany({
        where: {
          userId: user.id,
          productType: 'flight',
          flightData: {
            path: ['id'],
            equals: flightId,
          },
        },
      });
      deletedCount = deleted.count;
    }

    if (deletedCount === 0) {
      return NextResponse.json(
        { error: 'Wishlist item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Item removed from wishlist',
      deletedCount,
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to remove item from wishlist' },
      { status: 500 }
    );
  }
}
