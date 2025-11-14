import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';

/**
 * PUT /api/travelers/[id]
 * Update a frequent traveler
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

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

    // Verify ownership
    const existingTraveler = await prisma.frequentTraveler.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!existingTraveler) {
      return NextResponse.json(
        { error: 'Traveler not found' },
        { status: 404 }
      );
    }

    // If setting as default, unset other defaults first
    if (body.isDefault && !existingTraveler.isDefault) {
      await prisma.frequentTraveler.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Update traveler
    const traveler = await prisma.frequentTraveler.update({
      where: { id: params.id },
      data: {
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
        isDefault: body.isDefault,
      },
    });

    return NextResponse.json({
      success: true,
      traveler,
      message: 'Traveler updated successfully',
    });
  } catch (error) {
    console.error('Error updating traveler:', error);
    return NextResponse.json(
      { error: 'Failed to update traveler' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/travelers/[id]
 * Delete a frequent traveler
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

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

    // Verify ownership and delete
    const deleted = await prisma.frequentTraveler.deleteMany({
      where: { id: params.id, userId: user.id },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: 'Traveler not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Traveler deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting traveler:', error);
    return NextResponse.json(
      { error: 'Failed to delete traveler' },
      { status: 500 }
    );
  }
}
