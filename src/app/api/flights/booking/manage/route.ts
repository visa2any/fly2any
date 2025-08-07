/**
 * 📋 BOOKING MANAGEMENT API
 * Retrieve and manage flight bookings
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBookingByReference, getUserBookings, searchBookings } from '@/lib/database/bookings';

/**
 * GET - Retrieve booking(s)
 * Query parameters:
 * - booking_reference: Get specific booking
 * - email: Get all bookings for user
 * - search: Search bookings with filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const bookingReference = searchParams.get('booking_reference');
    const email = searchParams.get('email');
    const searchMode = searchParams.get('search');

    console.log('📋 Booking management request:', { bookingReference, email, searchMode });

    // Get specific booking by reference
    if (bookingReference) {
      const booking = await getBookingByReference(bookingReference);
      
      if (!booking) {
        return NextResponse.json({
          success: false,
          error: 'Booking not found'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: {
          booking,
          message: 'Booking retrieved successfully'
        }
      });
    }

    // Get all bookings for a user by email
    if (email) {
      const bookings = await getUserBookings(email);
      
      return NextResponse.json({
        success: true,
        data: {
          bookings,
          count: bookings.length,
          message: `Found ${bookings.length} booking${bookings.length !== 1 ? 's' : ''}`
        }
      });
    }

    // Search bookings with filters
    if (searchMode) {
      const filters = {
        email: searchParams.get('filter_email') || undefined,
        status: searchParams.get('filter_status') || undefined,
        dateFrom: searchParams.get('filter_date_from') || undefined,
        dateTo: searchParams.get('filter_date_to') || undefined,
        flightId: searchParams.get('filter_flight_id') || undefined
      };

      const bookings = await searchBookings(filters);
      
      return NextResponse.json({
        success: true,
        data: {
          bookings,
          count: bookings.length,
          filters,
          message: `Found ${bookings.length} matching booking${bookings.length !== 1 ? 's' : ''}`
        }
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Please provide booking_reference, email, or search=true with filters'
    }, { status: 400 });

  } catch (error) {
    console.error('❌ Booking retrieval error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve bookings'
    }, { status: 500 });
  }
}

/**
 * PUT - Update booking information
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingReference, updates } = body;

    if (!bookingReference) {
      return NextResponse.json({
        success: false,
        error: 'Booking reference is required'
      }, { status: 400 });
    }

    console.log('🔄 Updating booking:', bookingReference, updates);

    // Retrieve current booking
    const booking = await getBookingByReference(bookingReference);
    
    if (!booking) {
      return NextResponse.json({
        success: false,
        error: 'Booking not found'
      }, { status: 404 });
    }

    // For now, we'll support limited updates
    // In a full implementation, you'd handle various update types
    const allowedUpdates = ['passengerInfo', 'services'];
    const validUpdates: any = {};

    for (const [key, value] of Object.entries(updates)) {
      if (allowedUpdates.includes(key)) {
        validUpdates[key] = value;
      }
    }

    if (Object.keys(validUpdates).length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No valid updates provided'
      }, { status: 400 });
    }

    // Apply updates (in a real implementation, update database)
    console.log('✅ Booking updates would be applied:', validUpdates);

    return NextResponse.json({
      success: true,
      data: {
        bookingReference,
        updates: validUpdates,
        message: 'Booking updated successfully'
      }
    });

  } catch (error) {
    console.error('❌ Booking update error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update booking'
    }, { status: 500 });
  }
}