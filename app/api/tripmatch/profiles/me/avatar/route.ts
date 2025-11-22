/**
 * TripMatch Avatar Upload API
 *
 * POST /api/tripmatch/profiles/me/avatar - Upload profile avatar
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/tripmatch/auth-helpers';

/**
 * POST /api/tripmatch/profiles/me/avatar
 *
 * Upload avatar image
 *
 * For MVP, accepts base64 image data or URL
 * TODO: Integrate with Cloudinary/Uploadthing for production
 */
export async function POST(request: NextRequest) {
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
    const { avatarUrl, imageData } = body;

    if (!avatarUrl && !imageData) {
      return NextResponse.json({
        success: false,
        error: 'Either avatarUrl or imageData is required',
      }, { status: 400 });
    }

    let finalAvatarUrl = avatarUrl;

    // If imageData provided, upload to cloud storage
    if (imageData) {
      // TODO: Implement Cloudinary upload
      // For now, using placeholder
      // const cloudinaryResult = await uploadToCloudinary(imageData);
      // finalAvatarUrl = cloudinaryResult.secure_url;

      // Temporary: Return error asking for URL
      return NextResponse.json({
        success: false,
        error: 'Image upload not yet implemented. Please provide avatarUrl instead.',
        message: 'Use Cloudinary or Imgbb to upload your image first, then provide the URL.',
      }, { status: 501 });
    }

    // Update profile with new avatar URL
    const profile = await prisma.tripMatchUserProfile.upsert({
      where: { userId },
      update: {
        avatarUrl: finalAvatarUrl,
      },
      create: {
        userId,
        avatarUrl: finalAvatarUrl,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        avatarUrl: profile.avatarUrl,
      },
      message: 'Avatar updated successfully',
    });

  } catch (error: any) {
    console.error('❌ Error uploading avatar:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to upload avatar',
      message: error.message,
    }, { status: 500 });
  }
}
