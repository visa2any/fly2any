import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/properties/dashboard — Get host dashboard overview (auth required)
export async function GET(request: NextRequest) {
  try {
    // 1. Debug DB connection
    if (!prisma) {
      console.error('CRITICAL: Prisma client is NULL. Database configuration missing.');
      return NextResponse.json({ success: false, error: 'Database configuration missing' }, { status: 503 });
    }

    // 2. Auth check
    let session;
    try {
      session = await auth();
    } catch (e: any) {
      console.error('Auth check failed:', e);
      return NextResponse.json({ success: false, error: 'Authentication service failed: ' + e.message }, { status: 500 });
    }

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    // Helper to wrap Prisma calls in a strict timeout to prevent Vercel pool hangups
    const withTimeout = <T>(promise: Promise<T>, ms: number = 8000): Promise<T> => {
        let timeoutHandle: NodeJS.Timeout;
        const timeoutPromise = new Promise<T>((_, reject) => {
            timeoutHandle = setTimeout(() => reject(new Error('Database query timed out')), ms);
        });
        return Promise.race([
            promise.finally(() => clearTimeout(timeoutHandle)),
            timeoutPromise
        ]);
    };

    // 3. DB Query
    // Find or create PropertyOwner for this user
    let owner;
    try {
      owner = await withTimeout(prisma.propertyOwner.findUnique({
        where: { userId: session.user.id },
      }));
    } catch (e: any) {
      console.error('Prisma propertyOwner.findUnique failed:', e);
      return NextResponse.json({ success: false, error: 'Database error (Owner): ' + e.message }, { status: 500 });
    }

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
    let properties;
    try {
      properties = await withTimeout(prisma.property.findMany({
        where: { ownerId: owner.id },
        include: {
          images: { orderBy: { sortOrder: 'asc' }, take: 3 },
          _count: { select: { rooms: true, images: true } },
        },
        orderBy: { updatedAt: 'desc' },
      }));
    } catch (e: any) {
       console.error('Prisma property.findMany failed:', e);
       return NextResponse.json({ success: false, error: 'Database error (Properties): ' + e.message }, { status: 500 });
    }

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
          coverImageUrl: p.coverImageUrl || p.images.find((i: any) => i.isPrimary)?.url || p.images[0]?.url || null,
          roomCount: p._count.rooms,
          imageCount: p._count.images,
          publishedAt: p.publishedAt,
          updatedAt: p.updatedAt,
        })),
      },
    });
  } catch (error: any) {
    console.error('Dashboard fatal error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'An unexpected error occurred on the dashboard',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
