import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/properties — List properties (optionally filtered by owner, status, etc.)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId');
    const status = searchParams.get('status');
    const propertyType = searchParams.get('propertyType');
    const city = searchParams.get('city');
    const country = searchParams.get('country');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};
    if (ownerId) where.ownerId = ownerId;
    if (status) where.status = status;
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
  } catch (error: any) {
    console.error('Error fetching properties:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch properties' }, { status: 500 });
  }
}

// POST /api/properties — Create a new property
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Generate slug from name
    const slug = (body.name || 'property')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now().toString(36);

    // Ensure owner exists or create one
    // In production, this would use session auth to get the userId
    let ownerId = body.ownerId;
    if (!ownerId && body.userId) {
      const owner = await prisma.propertyOwner.upsert({
        where: { userId: body.userId },
        update: {},
        create: { userId: body.userId, businessType: 'individual' },
      });
      ownerId = owner.id;
    }

    // If no auth context, create a temporary owner for demo purposes
    if (!ownerId) {
      // In production, return 401. For now, we'll persist as draft
      return NextResponse.json({
        success: true,
        data: { message: 'Property data received. Sign in to save your listing.', draft: body },
      }, { status: 200 });
    }

    const property = await prisma.property.create({
      data: {
        ownerId,
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
        cancellationPolicy: body.cancellationPolicy || 'flexible',
        houseRules: body.houseRules || [],
        petPolicy: body.petPolicy || null,
        smokingPolicy: body.smokingPolicy || null,
        basePricePerNight: body.basePricePerNight || null,
        currency: body.currency || 'USD',
        cleaningFee: body.cleaningFee || null,
        serviceFee: body.serviceFee || null,
        weeklyDiscount: body.weeklyDiscount || null,
        monthlyDiscount: body.monthlyDiscount || null,
        instantBooking: body.instantBooking ?? true,
        minStay: body.minStay || 1,
        maxGuests: body.maxGuests || 2,
        totalRooms: body.totalRooms || 1,
        totalBathrooms: body.totalBathrooms || 1,
        totalBedrooms: body.totalBedrooms || 1,
        totalBeds: body.totalBeds || 1,
        ecoFeatures: body.ecoFeatures || [],
        status: body.status || 'draft',
      },
      include: {
        owner: { select: { id: true, businessName: true } },
      },
    });

    return NextResponse.json({ success: true, data: property }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating property:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to create property' }, { status: 500 });
  }
}
