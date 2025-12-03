/**
 * Guest Management API for Loyalty Program
 * POST - Create a new guest in LiteAPI loyalty program
 * GET - Get current user's guest profile (linked via liteApiGuestId)
 */
import { NextRequest, NextResponse } from 'next/server';
import { liteAPI } from '@/lib/api/liteapi';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export const runtime = 'nodejs';

// POST /api/loyalty/guest - Create or link guest to user account
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();
    const { email, firstName, lastName, phone } = body;

    // Validate required fields
    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: 'Email, firstName, and lastName are required' },
        { status: 400 }
      );
    }

    // Create guest in LiteAPI
    const guest = await liteAPI.createGuest({
      email,
      firstName,
      lastName,
      phone,
    });

    // If user is logged in, link the guest to their account
    if (session?.user?.id && prisma) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { liteApiGuestId: guest.id },
      });
    }

    return NextResponse.json({
      success: true,
      data: guest,
      message: 'Guest created successfully',
    });
  } catch (error: any) {
    console.error('Error creating guest:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create guest' },
      { status: 500 }
    );
  }
}

// GET /api/loyalty/guest - Get current user's guest profile
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!prisma) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Get user's liteApiGuestId
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { liteApiGuestId: true, email: true, name: true },
    });

    if (!user?.liteApiGuestId) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No loyalty guest linked to this account',
      });
    }

    // Fetch guest from LiteAPI
    const guest = await liteAPI.getGuest(user.liteApiGuestId);

    return NextResponse.json({
      success: true,
      data: guest,
    });
  } catch (error: any) {
    console.error('Error fetching guest:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch guest' },
      { status: 500 }
    );
  }
}
