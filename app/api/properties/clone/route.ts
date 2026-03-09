import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { handleApiError, ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';

export async function POST(request: NextRequest) {
  return handleApiError(request, async () => {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { propertyId } = body;

    if (!propertyId) {
      return NextResponse.json(
        { success: false, error: 'propertyId is required' },
        { status: 400 }
      );
    }

    // Fetch the original property with rooms and images
    const original = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        owner: { select: { id: true, userId: true } },
        rooms: true,
        images: true,
      },
    });

    if (!original) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (original.owner.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Generate unique slug
    const slug =
      (original.name + ' copy')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') +
      '-' +
      Date.now().toString(36);

    // Clone the property with all related data
    const cloned = await prisma.property.create({
      data: {
        ownerId: original.ownerId,
        name: `${original.name} (Copy)`,
        slug,
        description: original.description,
        shortDescription: original.shortDescription,
        propertyType: original.propertyType,
        starRating: original.starRating,
        addressLine1: original.addressLine1,
        addressLine2: original.addressLine2,
        city: original.city,
        state: original.state,
        country: original.country,
        countryCode: original.countryCode,
        postalCode: original.postalCode,
        latitude: original.latitude,
        longitude: original.longitude,
        neighborhood: original.neighborhood,
        phone: original.phone,
        email: original.email,
        website: original.website,
        amenities: original.amenities,
        highlights: original.highlights,
        languages: original.languages,
        accessibilityFeatures: original.accessibilityFeatures,
        checkInTime: original.checkInTime,
        checkOutTime: original.checkOutTime,
        checkInInstructions: original.checkInInstructions,
        cancellationPolicy: original.cancellationPolicy,
        cancellationDetails: original.cancellationDetails ?? undefined,
        houseRules: original.houseRules,
        petPolicy: original.petPolicy,
        smokingPolicy: original.smokingPolicy,
        childPolicy: original.childPolicy,
        minAge: original.minAge,
        basePricePerNight: original.basePricePerNight,
        currency: original.currency,
        cleaningFee: original.cleaningFee,
        serviceFee: original.serviceFee,
        securityDeposit: original.securityDeposit,
        taxRate: original.taxRate,
        weeklyDiscount: original.weeklyDiscount,
        monthlyDiscount: original.monthlyDiscount,
        instantBooking: original.instantBooking,
        minStay: original.minStay,
        maxStay: original.maxStay,
        maxGuests: original.maxGuests,
        totalRooms: original.totalRooms,
        totalBathrooms: original.totalBathrooms,
        totalBedrooms: original.totalBedrooms,
        totalBeds: original.totalBeds,
        ecoFeatures: original.ecoFeatures,
        ecoCertifications: original.ecoCertifications,
        extraGuestFee: original.extraGuestFee,
        petFee: original.petFee,
        smartPricing: original.smartPricing,
        weekendPrice: original.weekendPrice,
        buildingType: original.buildingType,
        totalFloors: original.totalFloors,
        propertyFloor: original.propertyFloor,
        hasElevator: original.hasElevator,
        // Reset stats & status for the clone
        status: 'draft',
        viewCount: 0,
        bookingCount: 0,
        reviewCount: 0,
        avgRating: 0,
        coverImageUrl: original.coverImageUrl,
        // Clone rooms
        rooms: {
          create: original.rooms.map((room) => ({
            name: room.name,
            roomType: room.roomType,
            bedType: room.bedType,
            bedCount: room.bedCount,
            maxOccupancy: room.maxOccupancy,
            quantity: room.quantity,
            basePricePerNight: room.basePricePerNight,
            amenities: room.amenities,
            sortOrder: room.sortOrder,
            isActive: room.isActive,
          })),
        },
        // Clone images
        images: {
          create: original.images.map((img) => ({
            url: img.url,
            caption: img.caption,
            category: img.category,
            isPrimary: img.isPrimary,
            sortOrder: img.sortOrder,
            aiTags: img.aiTags,
          })),
        },
      },
      include: {
        owner: { select: { id: true, businessName: true } },
        rooms: true,
        images: true,
      },
    });

    return NextResponse.json({ success: true, data: cloned }, { status: 201 });
  }, { category: ErrorCategory.DATABASE, severity: ErrorSeverity.HIGH });
}
