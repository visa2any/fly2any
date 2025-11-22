/**
 * TripMatch Current User Profile API
 *
 * GET   /api/tripmatch/profiles/me - Get my profile
 * PATCH /api/tripmatch/profiles/me - Update my profile
 * POST  /api/tripmatch/profiles/me - Create/initialize my profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/tripmatch/auth-helpers';

/**
 * GET /api/tripmatch/profiles/me
 *
 * Get authenticated user's profile
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    // Get or create profile
    let profile = await prisma.tripMatchUserProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
      },
    });

    // Auto-create profile if it doesn't exist
    if (!profile) {
      profile = await prisma.tripMatchUserProfile.create({
        data: {
          userId,
          displayName: 'New Traveler', // Will be updated by user
          emailVerified: false,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              emailVerified: true,
              avatarUrl: true,
              createdAt: true,
            },
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: profile,
    });

  } catch (error: any) {
    console.error('❌ Error fetching profile:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch profile',
      message: error.message,
    }, { status: 500 });
  }
}

/**
 * PATCH /api/tripmatch/profiles/me
 *
 * Update authenticated user's profile
 */
export async function PATCH(request: NextRequest) {
  try {
    // Get authenticated user
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();

    // Validate allowed fields
    const allowedFields = [
      'displayName',
      'bio',
      'avatarUrl',
      'coverImageUrl',
      'travelStyle',
      'interests',
      'languagesSpoken',
      'ageRange',
      'gender',
      'locationCity',
      'locationCountry',
      'settings',
    ];

    // Filter out any fields not in allowedFields
    const updates: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No valid fields to update',
      }, { status: 400 });
    }

    // Update profile (or create if doesn't exist)
    const profile = await prisma.tripMatchUserProfile.upsert({
      where: { userId },
      update: updates,
      create: {
        userId,
        ...updates,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: profile,
      message: 'Profile updated successfully',
    });

  } catch (error: any) {
    console.error('❌ Error updating profile:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to update profile',
      message: error.message,
    }, { status: 500 });
  }
}

/**
 * POST /api/tripmatch/profiles/me
 *
 * Create/initialize profile (same as upsert in PATCH)
 */
export async function POST(request: NextRequest) {
  return PATCH(request);
}
