import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { getPrismaClient } from '@/lib/prisma';

/**
 * GET /api/travelers
 * Fetch all frequent travelers for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const prisma = getPrismaClient();

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch travelers
    const travelers = await prisma.frequentTraveler.findMany({
      where: { userId: user.id },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      success: true,
      travelers,
      total: travelers.length,
    });
  } catch (error) {
    console.error('Error fetching travelers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch travelers' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/travelers
 * Create a new frequent traveler
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const prisma = getPrismaClient();

    // Get user
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

    // If setting as default, unset other defaults first
    if (body.isDefault) {
      await prisma.frequentTraveler.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Create traveler
    const traveler = await prisma.frequentTraveler.create({
      data: {
        userId: user.id,
        relationship: body.relationship,
        title: body.title,
        firstName: body.firstName,
        middleName: body.middleName,
        lastName: body.lastName,
        dateOfBirth: new Date(body.dateOfBirth),
        gender: body.gender,
        nationality: body.nationality,
        passportNumber: body.passportNumber,
        passportExpiry: body.passportExpiry ? new Date(body.passportExpiry) : null,
        passportCountry: body.passportCountry,
        knownTravelerNumber: body.knownTravelerNumber,
        redressNumber: body.redressNumber,
        email: body.email,
        phone: body.phone,
        seatPreference: body.seatPreference,
        mealPreference: body.mealPreference,
        specialNeeds: body.specialNeeds,
        isDefault: body.isDefault || false,
      },
    });

    return NextResponse.json({
      success: true,
      traveler,
      message: 'Traveler created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating traveler:', error);
    return NextResponse.json(
      { error: 'Failed to create traveler' },
      { status: 500 }
    );
  }
}
