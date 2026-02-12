import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/properties/dashboard — Get host dashboard overview
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId');

    if (!ownerId) {
      return NextResponse.json({ success: false, error: 'ownerId is required' }, { status: 400 });
    }

    // Get properties for this owner
    const properties = await prisma.property.findMany({
      where: { ownerId },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        _count: { select: { rooms: true, images: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const activeCount = properties.filter(p => p.status === 'active').length;
    const totalViews = properties.reduce((sum, p) => sum + p.viewCount, 0);
    const totalBookings = properties.reduce((sum, p) => sum + p.bookingCount, 0);
    const avgRating = properties.length > 0
      ? properties.reduce((sum, p) => sum + p.avgRating, 0) / properties.filter(p => p.avgRating > 0).length || 0
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
          coverImageUrl: p.coverImageUrl || p.images[0]?.url || null,
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
