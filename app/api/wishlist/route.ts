import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for wishlist item
const createWishlistSchema = z.object({
  flightData: z.object({
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
    // Allow additional flight data fields
  }).passthrough(),
  notes: z.string().optional(),
  targetPrice: z.number().optional(),
  notifyOnDrop: z.boolean().default(true),
});

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

    // Get wishlist items
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      items: wishlistItems,
      count: wishlistItems.length,
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

    // Create wishlist item
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId: user.id,
        flightData: validatedData.flightData,
        notes: validatedData.notes,
        targetPrice: validatedData.targetPrice,
        notifyOnDrop: validatedData.notifyOnDrop,
      },
    });

    return NextResponse.json({
      success: true,
      item: wishlistItem,
      message: 'Flight added to wishlist',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
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

// DELETE /api/wishlist - Remove item from wishlist (by flight ID)
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

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
    const flightId = searchParams.get('flightId');

    if (!flightId) {
      return NextResponse.json(
        { error: 'Flight ID is required' },
        { status: 400 }
      );
    }

    // Find and delete the wishlist item
    const deletedItem = await prisma.wishlistItem.deleteMany({
      where: {
        userId: user.id,
        flightData: {
          path: ['id'],
          equals: flightId,
        },
      },
    });

    if (deletedItem.count === 0) {
      return NextResponse.json(
        { error: 'Wishlist item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Flight removed from wishlist',
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to remove item from wishlist' },
      { status: 500 }
    );
  }
}
