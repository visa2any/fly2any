import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/properties/dashboard — Get host dashboard overview (auth required)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    // Find or create PropertyOwner for this user
    const owner = await prisma.propertyOwner.findUnique({
      where: { userId: session.user.id },
    });

    if (!owner) {
      // No owner profile yet — return empty dashboard
      return NextResponse.json({
        success: true,
        data: {
          overview: {
            totalProperties: 0, activeProperties: 0, draftProperties: 0,
            totalViews: 0, totalBookings: 0, avgRating: 0, estimatedMonthlyRevenue: 0,
          },
          properties: [],
        },
      });
    }

    // Get properties for this owner
    const properties = await prisma.property.findMany({
      where: { ownerId: owner.id },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        _count: { select: { rooms: true, images: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const activeCount = properties.filter(p => p.status === 'active').length;
    const totalViews = properties.reduce((sum, p) => sum + p.viewCount, 0);
    const totalBookings = properties.reduce((sum, p) => sum + p.bookingCount, 0);
    const ratedProperties = properties.filter(p => p.avgRating > 0);
    const avgRating = ratedProperties.length > 0
      ? properties.reduce((sum, p) => sum + p.avgRating, 0) / ratedProperties.length
      : 0;

    // Estimated monthly revenue (simplified)
    const estimatedMonthly = properties
      .filter(p => p.status === 'active' && p.basePricePerNight)
      .reduce((sum, p) => sum + (p.basePricePerNight || 0) * 30 * 0.75, 0); // 75% occupancy estimate

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalProperties: properties.length,
          activeProperties: activeCount,
          draftProperties: properties.filter(p => p.status === 'draft').length,
          totalViews,
          totalBookings,
          avgRating: Math.round(avgRating * 10) / 10,
          estimatedMonthlyRevenue: Math.round(estimatedMonthly),
        },
        properties: properties.map(p => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          propertyType: p.propertyType,
          city: p.city,
          country: p.country,
          status: p.status,
          basePricePerNight: p.basePricePerNight,
          currency: p.currency,
          viewCount: p.viewCount,
          bookingCount: p.bookingCount,
          avgRating: p.avgRating,
          reviewCount: p.reviewCount,
          coverImageUrl: p.coverImageUrl || (p.images[0]?.url ?? null),
          roomCount: p._count.rooms,
          imageCount: p._count.images,
          publishedAt: p.publishedAt,
          updatedAt: p.updatedAt,
        })),
      },
    });
  } catch (error: any) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
