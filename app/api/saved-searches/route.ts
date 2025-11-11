import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for saved search
const SavedSearchSchema = z.object({
  name: z.string().min(1).max(100),
  origin: z.string().min(3).max(3),
  destination: z.string().min(3).max(3),
  departDate: z.string(),
  returnDate: z.string().optional(),
  adults: z.number().int().min(1).max(9).default(1),
  children: z.number().int().min(0).max(9).default(0),
  infants: z.number().int().min(0).max(9).default(0),
  cabinClass: z.enum(['economy', 'premium_economy', 'business', 'first']).default('economy'),
  filters: z.record(z.string(), z.any()).optional(),
});

/**
 * GET /api/saved-searches
 * Get all saved searches for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const prisma = getPrismaClient();

    const savedSearches = await prisma.savedSearch.findMany({
      where: { userId: session.user.id },
      orderBy: { lastSearched: 'desc' },
    });

    return NextResponse.json({ searches: savedSearches });
  } catch (error) {
    console.error('[Saved Searches] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved searches' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/saved-searches
 * Create a new saved search
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const prisma = getPrismaClient();

    const body = await request.json();

    // Validate request body
    const validatedData = SavedSearchSchema.parse(body);

    // Check if user already has a saved search with this exact route and dates
    const existingSearch = await prisma.savedSearch.findFirst({
      where: {
        userId: session.user.id,
        origin: validatedData.origin,
        destination: validatedData.destination,
        departDate: validatedData.departDate,
        returnDate: validatedData.returnDate || null,
      },
    });

    if (existingSearch) {
      // Update existing search
      const updated = await prisma.savedSearch.update({
        where: { id: existingSearch.id },
        data: {
          searchCount: { increment: 1 },
          lastSearched: new Date(),
          name: validatedData.name,
          filters: (validatedData.filters || existingSearch.filters) as any,
        },
      });

      return NextResponse.json({ search: updated, updated: true });
    }

    // Create new saved search
    const savedSearch = await prisma.savedSearch.create({
      data: {
        userId: session.user.id,
        ...validatedData,
        filters: validatedData.filters as any,
      },
    });

    return NextResponse.json({ search: savedSearch, created: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.format() },
        { status: 400 }
      );
    }

    console.error('[Saved Searches] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create saved search' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/saved-searches?id=[searchId]
 * Delete a saved search
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const prisma = getPrismaClient();

    const { searchParams } = new URL(request.url);
    const searchId = searchParams.get('id');

    if (!searchId) {
      return NextResponse.json(
        { error: 'Search ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const search = await prisma.savedSearch.findUnique({
      where: { id: searchId },
    });

    if (!search) {
      return NextResponse.json(
        { error: 'Saved search not found' },
        { status: 404 }
      );
    }

    if (search.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Delete the search
    await prisma.savedSearch.delete({
      where: { id: searchId },
    });

    return NextResponse.json({ success: true, deleted: true });
  } catch (error) {
    console.error('[Saved Searches] DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete saved search' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/saved-searches?id=[searchId]
 * Update a saved search
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const prisma = getPrismaClient();

    const { searchParams } = new URL(request.url);
    const searchId = searchParams.get('id');

    if (!searchId) {
      return NextResponse.json(
        { error: 'Search ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Verify ownership
    const search = await prisma.savedSearch.findUnique({
      where: { id: searchId },
    });

    if (!search) {
      return NextResponse.json(
        { error: 'Saved search not found' },
        { status: 404 }
      );
    }

    if (search.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Update the search
    const updated = await prisma.savedSearch.update({
      where: { id: searchId },
      data: {
        name: body.name || search.name,
        filters: body.filters !== undefined ? body.filters : search.filters,
      },
    });

    return NextResponse.json({ search: updated, updated: true });
  } catch (error) {
    console.error('[Saved Searches] PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update saved search' },
      { status: 500 }
    );
  }
}
