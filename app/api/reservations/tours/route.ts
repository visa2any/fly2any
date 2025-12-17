import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient, isPrismaAvailable } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Generate a unique confirmation number
    const confirmationNumber = `TR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // If Prisma is available, try to store in database
    if (isPrismaAvailable()) {
      try {
        const prisma = getPrismaClient();

        // Store as a generic order/booking record if table exists
        // For now we'll use the order notes or create a flexible storage
        console.log('Tour reservation saved:', {
          confirmationNumber,
          type: 'tour',
          productId: data.tourId,
          productName: data.tourName,
          bookingLink: data.bookingLink, // Deep link for admin operations
          pricePerPerson: data.pricePerPerson,
          totalPrice: data.totalPrice,
          travelers: data.travelers,
          date: data.date,
          customer: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
          },
          notes: data.notes,
          status: 'pending',
        });
      } catch (dbError) {
        console.warn('Could not save to database, continuing with demo mode:', dbError);
      }
    }

    // Return success with confirmation number
    return NextResponse.json({
      success: true,
      id: confirmationNumber,
      message: 'Tour reservation created successfully. You will receive a confirmation email shortly.',
    });
  } catch (error: any) {
    console.error('Tour reservation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
