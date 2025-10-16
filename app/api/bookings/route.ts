import { NextRequest, NextResponse } from 'next/server';
import { bookingStorage, calculateRefund, canModifyBooking } from '@/lib/bookings/storage';
import type { Booking, BookingStatus, BookingSearchParams, APIResponse, CancellationResult } from '@/lib/bookings/types';

/**
 * GET /api/bookings
 * Search and retrieve bookings with filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Build search parameters
    const searchFilters: BookingSearchParams = {};

    // Handle status filter
    const status = searchParams.get('status');
    if (status && status !== 'all') {
      searchFilters.status = status as BookingStatus;
    }

    // Handle search query (email or booking reference)
    const search = searchParams.get('search');
    if (search) {
      // Check if it's an email or booking reference
      if (search.includes('@')) {
        searchFilters.email = search;
      } else {
        searchFilters.bookingReference = search;
      }
    }

    // Handle email filter
    const email = searchParams.get('email');
    if (email) {
      searchFilters.email = email;
    }

    // Handle userId filter
    const userId = searchParams.get('userId');
    if (userId) {
      searchFilters.userId = userId;
    }

    // Handle date range filters
    const dateFrom = searchParams.get('dateFrom');
    if (dateFrom) {
      searchFilters.dateFrom = dateFrom;
    }

    const dateTo = searchParams.get('dateTo');
    if (dateTo) {
      searchFilters.dateTo = dateTo;
    }

    // Handle pagination
    const limit = searchParams.get('limit');
    if (limit) {
      searchFilters.limit = parseInt(limit, 10);
    }

    const offset = searchParams.get('offset');
    if (offset) {
      searchFilters.offset = parseInt(offset, 10);
    }

    // Retrieve bookings from storage
    const bookings = await bookingStorage.search(searchFilters);
    const total = await bookingStorage.count(searchFilters);

    // Return successful response
    const response: APIResponse<{ bookings: Booking[]; total: number }> = {
      success: true,
      data: {
        bookings,
        total,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    console.error('GET /api/bookings error:', error);

    const errorResponse: APIResponse<null> = {
      success: false,
      error: {
        message: 'Failed to fetch bookings',
        code: 'FETCH_ERROR',
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * POST /api/bookings
 * Create a new booking
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flight, passengers, seats, payment, contactInfo, userId, specialRequests, notes, refundPolicy } = body;

    // Validate required fields
    const validationErrors: Array<{ field: string; message: string; code: string }> = [];

    if (!flight) {
      validationErrors.push({ field: 'flight', message: 'Flight information is required', code: 'MISSING_FLIGHT' });
    }

    if (!passengers || !Array.isArray(passengers) || passengers.length === 0) {
      validationErrors.push({ field: 'passengers', message: 'At least one passenger is required', code: 'MISSING_PASSENGERS' });
    }

    if (!contactInfo || !contactInfo.email || !contactInfo.phone) {
      validationErrors.push({ field: 'contactInfo', message: 'Contact email and phone are required', code: 'MISSING_CONTACT' });
    }

    if (!payment || !payment.method || !payment.amount || !payment.currency) {
      validationErrors.push({ field: 'payment', message: 'Payment information is required', code: 'MISSING_PAYMENT' });
    }

    // If there are validation errors, return them
    if (validationErrors.length > 0) {
      const errorResponse: APIResponse<null> = {
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: validationErrors,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactInfo.email)) {
      const errorResponse: APIResponse<null> = {
        success: false,
        error: {
          message: 'Invalid email format',
          code: 'INVALID_EMAIL',
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Create booking using storage layer
    const bookingData = {
      status: 'confirmed' as BookingStatus,
      userId,
      contactInfo,
      flight,
      passengers,
      seats: seats || [],
      payment: {
        ...payment,
        status: 'paid' as const,
        paidAt: new Date().toISOString(),
      },
      specialRequests,
      notes,
      refundPolicy,
    };

    const newBooking = await bookingStorage.create(bookingData);

    // In production, this would also:
    // 1. Process payment via Stripe/PayPal
    // 2. Create booking in Amadeus
    // 3. Send confirmation email
    // 4. Generate e-tickets

    // Return success response
    const response: APIResponse<{ booking: Booking }> = {
      success: true,
      data: {
        booking: newBooking,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error: any) {
    console.error('POST /api/bookings error:', error);

    const errorResponse: APIResponse<null> = {
      success: false,
      error: {
        message: error.message || 'Failed to create booking',
        code: 'CREATE_ERROR',
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * DELETE /api/bookings
 * Cancel a booking and process refund
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('id');
    const reason = searchParams.get('reason') || 'Customer request';

    // Validate booking ID
    if (!bookingId) {
      const errorResponse: APIResponse<null> = {
        success: false,
        error: {
          message: 'Booking ID is required',
          code: 'MISSING_BOOKING_ID',
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Retrieve the booking
    const booking = await bookingStorage.findById(bookingId);

    if (!booking) {
      const errorResponse: APIResponse<null> = {
        success: false,
        error: {
          message: 'Booking not found',
          code: 'BOOKING_NOT_FOUND',
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Check if booking can be modified
    const modificationCheck = canModifyBooking(booking);
    if (!modificationCheck.allowed) {
      const errorResponse: APIResponse<null> = {
        success: false,
        error: {
          message: modificationCheck.reason || 'Booking cannot be cancelled',
          code: 'CANCELLATION_NOT_ALLOWED',
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Calculate refund
    const { refundAmount, cancellationFee } = calculateRefund(booking);

    // Cancel the booking
    const cancelledBooking = await bookingStorage.cancel(bookingId, reason);

    if (!cancelledBooking) {
      const errorResponse: APIResponse<null> = {
        success: false,
        error: {
          message: 'Failed to cancel booking',
          code: 'CANCELLATION_FAILED',
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // Prepare cancellation result
    const cancellationResult: CancellationResult = {
      success: true,
      bookingReference: booking.bookingReference,
      refundAmount,
      refundStatus: refundAmount > 0 ? 'pending' : 'refunded',
      message: refundAmount > 0
        ? `Booking cancelled successfully. Refund of ${refundAmount} ${booking.payment.currency} will be processed within 5-7 business days.`
        : 'Booking cancelled. No refund available due to cancellation policy.',
      cancellationFee: cancellationFee > 0 ? cancellationFee : undefined,
    };

    // Return success response
    const response: APIResponse<CancellationResult> = {
      success: true,
      data: cancellationResult,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    console.error('DELETE /api/bookings error:', error);

    const errorResponse: APIResponse<null> = {
      success: false,
      error: {
        message: error.message || 'Failed to cancel booking',
        code: 'CANCELLATION_ERROR',
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
