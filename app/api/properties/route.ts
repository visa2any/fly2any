import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { handleApiError, ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';

export const dynamic = 'force-dynamic';

// GET /api/properties — List properties (public sees active only, owners see their own)
export async function GET(request: NextRequest) {
  return handleApiError(request, async () => {
    if (!prisma) {
      return NextResponse.json({ success: false, error: 'Database configuration missing' }, { status: 503 });
    }

    let session;
    try { session = await auth(); } catch { /* public access allowed */ }

    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId');
    const status = searchParams.get('status');
    const propertyType = searchParams.get('propertyType');
    const city = searchParams.get('city');
    const country = searchParams.get('country');
    const mine = searchParams.get('mine') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};

    if (mine && session?.user?.id) {
      where.owner = { userId: session.user.id };
      if (status) where.status = status;
    } else {
      where.status = 'active';
      if (ownerId) where.ownerId = ownerId;
    }

    if (propertyType) where.propertyType = propertyType;
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (country) where.country = { contains: country, mode: 'insensitive' };

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          owner: { select: { id: true, businessName: true, rating: true, superHost: true, profileImageUrl: true } },
          _count: { select: { rooms: true, images: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.property.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: properties,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  }, { category: ErrorCategory.DATABASE, severity: ErrorSeverity.HIGH });
}

// POST /api/properties — Create a new property
export async function POST(request: NextRequest) {
  return handleApiError(request, async () => {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();

    const slug = (body.name || 'property')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now().toString(36);

    const owner = await prisma.propertyOwner.upsert({
      where: { userId: session.user.id },
      update: {},
      create: { userId: session.user.id, businessType: 'individual' },
    });

    const property = await prisma.property.create({
      data: {
        ownerId: owner.id,
        name: body.name,
        slug,
        description: body.description || null,
        shortDescription: body.shortDescription || null,
        propertyType: body.propertyType || 'hotel',
        starRating: body.starRating || null,
        addressLine1: body.addressLine1,
        addressLine2: body.addressLine2 || null,
        city: body.city,
        state: body.state || null,
        country: body.country,
        countryCode: body.countryCode || null,
        postalCode: body.postalCode || null,
        latitude: body.latitude || 0,
        longitude: body.longitude || 0,
        neighborhood: body.neighborhood || null,
        amenities: body.amenities || [],
        highlights: body.highlights || [],
        languages: body.languages || [],
        accessibilityFeatures: body.accessibilityFeatures || [],
        checkInTime: body.checkInTime || '15:00',
        checkOutTime: body.checkOutTime || '11:00',
        checkInInstructions: body.checkInInstructions || null,
        cancellationPolicy: body.cancellationPolicy || 'flexible',
        cancellationDetails: body.cancellationDetails || undefined,
        houseRules: body.houseRules || [],
        petPolicy: body.petPolicy || null,
        smokingPolicy: body.smokingPolicy || null,
        childPolicy: body.childPolicy || null,
        minAge: body.minAge ?? null,
        basePricePerNight: body.basePricePerNight ?? null,
        currency: body.currency || 'USD',
        cleaningFee: body.cleaningFee ?? null,
        petFee: body.petFee ?? null,
        extraGuestFee: body.extraGuestFee ?? null,
        weekendPrice: body.weekendPrice ?? null,
        securityDeposit: body.securityDeposit ?? null,
        serviceFee: body.serviceFee ?? null,
        weeklyDiscount: body.weeklyDiscount ?? null,
        monthlyDiscount: body.monthlyDiscount ?? null,
        smartPricing: body.smartPricing ?? false,
        instantBooking: body.instantBooking ?? true,
        minStay: body.minStay || 1,
        maxGuests: body.maxGuests || 2,
        totalRooms: body.totalRooms || 1,
        totalBathrooms: body.totalBathrooms || 1,
        totalBedrooms: body.totalBedrooms || 1,
        totalBeds: body.totalBeds || 1,
        ecoFeatures: body.ecoFeatures || [],
        ecoCertifications: body.ecoCertifications || [],
        status: body.status || 'draft',
        buildingType: body.buildingType || null,
        totalFloors: body.totalFloors ?? null,
        propertyFloor: body.propertyFloor ?? null,
        hasElevator: body.hasElevator ?? false,
        rooms: {
          create: body.rooms?.map((room: any) => ({
            name: room.name,
            roomType: room.roomType,
            bedType: room.bedType,
            bedCount: room.bedCount,
            maxOccupancy: room.maxOccupancy,
            quantity: room.quantity,
            basePricePerNight: room.basePricePerNight,
            amenities: room.amenities,
          })) || [],
        },
        images: {
          create: body.images?.map((img: any) => ({
            url: img.url,
            caption: img.caption,
            category: img.category,
            isPrimary: img.isPrimary,
            aiTags: img.tags || [],
          })) || [],
        },
      },
      include: {
        owner: { select: { id: true, businessName: true } },
        rooms: true,
        images: true,
      },
    });

    return NextResponse.json({ success: true, data: property }, { status: 201 });
  }, { category: ErrorCategory.DATABASE, severity: ErrorSeverity.HIGH });
}
