import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for updating wishlist item
const updateWishlistSchema = z.object({
  notes: z.string().optional(),
  targetPrice: z.number().optional(),
  notifyOnDrop: z.boolean().optional(),
});

// GET /api/wishlist/[id] - Get single wishlist item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const wishlistItem = await prisma.wishlistItem.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!wishlistItem) {
      return NextResponse.json(
        { error: 'Wishlist item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      item: wishlistItem,
    });
  } catch (error) {
    console.error('Error fetching wishlist item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wishlist item' },
      { status: 500 }
    );
  }
}

// PATCH /api/wishlist/[id] - Update wishlist item
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const validatedData = updateWishlistSchema.parse(body);

    // Verify ownership and update
    const existingItem = await prisma.wishlistItem.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Wishlist item not found' },
        { status: 404 }
      );
    }

    const updatedItem = await prisma.wishlistItem.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json({
      success: true,
      item: updatedItem,
      message: 'Wishlist item updated',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating wishlist item:', error);
    return NextResponse.json(
      { error: 'Failed to update wishlist item' },
      { status: 500 }
    );
  }
}

// DELETE /api/wishlist/[id] - Delete wishlist item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify ownership and delete
    const deletedItem = await prisma.wishlistItem.deleteMany({
      where: {
        id: params.id,
        userId: user.id,
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
      message: 'Wishlist item deleted',
    });
  } catch (error) {
    console.error('Error deleting wishlist item:', error);
    return NextResponse.json(
      { error: 'Failed to delete wishlist item' },
      { status: 500 }
    );
  }
}
