import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Helper: verify authenticated user owns this property
async function verifyOwnership(propertyId: string, userId: string) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: { owner: { select: { userId: true } } },
  });
  if (!property) return { error: 'Property not found', status: 404 };
  if (property.owner.userId !== userId) return { error: 'Forbidden', status: 403 };
  return { property };
}

// GET /api/properties/[id] — Get single property with full details (public)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const property = await prisma.property.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: {
            id: true, businessName: true, bio: true, profileImageUrl: true,
            rating: true, reviewCount: true, superHost: true, responseRate: true,
            avgResponseTime: true, totalProperties: true,
          },
        },
        rooms: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
        images: { orderBy: { sortOrder: 'asc' } },
        availability: { where: { endDate: { gte: new Date() } }, orderBy: { startDate: 'asc' } },
      },
    });

    if (!property) {
      return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 });
    }

    // Increment view count
    await prisma.property.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true, data: property });
  } catch (error: any) {
    console.error('Error fetching property:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/properties/[id] — Update property (auth + ownership required)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const ownership = await verifyOwnership(params.id, session.user.id);
    if ('error' in ownership) {
      return NextResponse.json({ success: false, error: ownership.error }, { status: ownership.status });
    }

    const body = await request.json();

    const property = await prisma.property.update({
      where: { id: params.id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.propertyType !== undefined && { propertyType: body.propertyType }),
        ...(body.starRating !== undefined && { starRating: body.starRating }),
        ...(body.addressLine1 !== undefined && { addressLine1: body.addressLine1 }),
        ...(body.city !== undefined && { city: body.city }),
        ...(body.country !== undefined && { country: body.country }),
        ...(body.amenities !== undefined && { amenities: body.amenities }),
        ...(body.checkInTime !== undefined && { checkInTime: body.checkInTime }),
        ...(body.checkOutTime !== undefined && { checkOutTime: body.checkOutTime }),
        ...(body.cancellationPolicy !== undefined && { cancellationPolicy: body.cancellationPolicy }),
        ...(body.houseRules !== undefined && { houseRules: body.houseRules }),
        ...(body.basePricePerNight !== undefined && { basePricePerNight: body.basePricePerNight }),
        ...(body.cleaningFee !== undefined && { cleaningFee: body.cleaningFee }),
        ...(body.petFee !== undefined && { petFee: body.petFee }),
        ...(body.extraGuestFee !== undefined && { extraGuestFee: body.extraGuestFee }),
        ...(body.weekendPrice !== undefined && { weekendPrice: body.weekendPrice }),
        ...(body.securityDeposit !== undefined && { securityDeposit: body.securityDeposit }),
        ...(body.weeklyDiscount !== undefined && { weeklyDiscount: body.weeklyDiscount }),
        ...(body.monthlyDiscount !== undefined && { monthlyDiscount: body.monthlyDiscount }),
        ...(body.instantBooking !== undefined && { instantBooking: body.instantBooking }),
        ...(body.minStay !== undefined && { minStay: body.minStay }),
        ...(body.maxGuests !== undefined && { maxGuests: body.maxGuests }),
        ...(body.ecoFeatures !== undefined && { ecoFeatures: body.ecoFeatures }),
        ...(body.status !== undefined && { status: body.status }),
      },
    });

    return NextResponse.json({ success: true, data: property });
  } catch (error: any) {
    console.error('Error updating property:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/properties/[id] — Delete property (auth + ownership required)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const ownership = await verifyOwnership(params.id, session.user.id);
    if ('error' in ownership) {
      return NextResponse.json({ success: false, error: ownership.error }, { status: ownership.status });
    }

    await prisma.property.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: 'Property deleted' });
  } catch (error: any) {
    console.error('Error deleting property:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

