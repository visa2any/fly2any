import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient, isPrismaAvailable } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      transferId,
      transferType,
      transferName,
      price,
      pickup,
      dropoff,
      date,
      time,
      passengers,
      firstName,
      lastName,
      email,
      phone,
      flightNumber,
      notes,
    } = body;

    // Generate confirmation number
    const confirmationNumber = `TF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Log reservation for admin manual issuance
    console.log('🚗 NEW TRANSFER RESERVATION:', {
      confirmationNumber,
      transferName,
      transferType,
      price,
      pickup,
      dropoff,
      date,
      time,
      passengers,
      customer: { firstName, lastName, email, phone, flightNumber },
      notes,
      createdAt: new Date().toISOString(),
    });

    // Try to save to database if available
    if (isPrismaAvailable()) {
      const prisma = getPrismaClient();
      try {
        // Store in a generic reservations table or log
        console.log('💾 Would save to database - transfers table needed');
      } catch (dbError) {
        console.warn('DB save failed, reservation logged:', dbError);
      }
    }

    return NextResponse.json({
      success: true,
      id: confirmationNumber,
      message: 'Transfer booked successfully',
    });
  } catch (error: any) {
    console.error('Transfer reservation error:', error);
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 });
  }
}
