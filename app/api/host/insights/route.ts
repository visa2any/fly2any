import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Get Owner & Owner's Properties
    const owner = await prisma.propertyOwner.findUnique({
      where: { userId: session.user.id },
      include: {
        properties: {
          select: {
            id: true,
            city: true,
            basePricePerNight: true,
            viewCount: true,
            bookingCount: true,
            status: true
          }
        }
      }
    });

    if (!owner || owner.properties.length === 0) {
        return NextResponse.json({ success: true, data: {
            marketOccupancy: 0,
            userOccupancy: 0,
            avgNightlyRate: 0,
            userNightlyRate: 0,
            conversionRate: 0,
            marketConversion: 0
        } });
    }

    // Filter active ones
    const activeProperties = owner.properties.filter(p => p.status === 'active');
    
    // Fallback if no active
    const propsToAnalyze = activeProperties.length > 0 ? activeProperties : owner.properties;

    // 2. Calculate User Averages
    const totalUserPrice = propsToAnalyze.reduce((sum, p) => sum + (p.basePricePerNight || 0), 0);
    const userNightlyRate = totalUserPrice / propsToAnalyze.length;

    const totalViews = propsToAnalyze.reduce((sum, p) => sum + p.viewCount, 0);
    const totalBookings = propsToAnalyze.reduce((sum, p) => sum + p.bookingCount, 0);
    
    const conversionRate = totalViews > 0 ? (totalBookings / totalViews) * 100 : 0;
    
    // Simplified occupancy: Bookings per month (assume 3 nights per booking avg against 30 days)
    // Formula: (Total Bookings * 3) / (Total Properties * 30 days past month) * 100
    // Real math would look at actual booked dates vs available dates, using simplified heuristic for dashboard speed here.
    const userOccupancyRaw = owner.properties.length > 0 ? ((totalBookings * 3) / (owner.properties.length * 30)) * 100 : 0;
    const userOccupancy = Math.min(Math.max(userOccupancyRaw, 0), 100);

    // 3. Find Market Data (Properties in same cities as user)
    const uniqueCities = Array.from(new Set(propsToAnalyze.map(p => p.city)));
    
    let marketAvgPrice = 0;
    let marketConversion = 0;
    let marketOccupancy = 0;

    if (uniqueCities.length > 0) {
        const marketProps = await prisma.property.findMany({
            where: {
                city: { in: uniqueCities },
                status: 'active',
                ownerId: { not: owner.id } // Don't include user's own properties in market avg
            },
            select: {
                basePricePerNight: true,
                viewCount: true,
                bookingCount: true,
            }
        });

        if (marketProps.length > 0) {
            const sumPrice = marketProps.reduce((sum, p) => sum + (p.basePricePerNight || 0), 0);
            marketAvgPrice = sumPrice / marketProps.length;

            const mTotalViews = marketProps.reduce((sum, p) => sum + p.viewCount, 0);
            const mTotalBookings = marketProps.reduce((sum, p) => sum + p.bookingCount, 0);
            
            marketConversion = mTotalViews > 0 ? (mTotalBookings / mTotalViews) * 100 : 0;
            
            const mOccupancyRaw = ((mTotalBookings * 3) / (marketProps.length * 30)) * 100;
            marketOccupancy = Math.min(Math.max(mOccupancyRaw, 0), 100);
        } else {
            // No competitors = market is identical to user
            marketAvgPrice = userNightlyRate;
            marketConversion = conversionRate;
            marketOccupancy = userOccupancy;
        }
    }

    // Format safe numbers
    return NextResponse.json({
      success: true,
      data: {
          marketOccupancy: Math.round(marketOccupancy),
          userOccupancy: Math.round(userOccupancy),
          avgNightlyRate: Math.round(marketAvgPrice),
          userNightlyRate: Math.round(userNightlyRate),
          conversionRate: Number(conversionRate.toFixed(1)),
          marketConversion: Number(marketConversion.toFixed(1)),
      }
    });

  } catch (error: any) {
    console.error('Insights API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
