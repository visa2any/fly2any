import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const quoteId = params.id;

    // Fetch the quote to get booking details
    const quote = await prisma.agentQuote.findUnique({
      where: { id: quoteId },
      select: {
        id: true,
        status: true,
        flights: true,
        hotels: true,
        carRentals: true,
        activities: true,
        transfers: true,
      },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Transform quote items into bookings
    const bookings = [];

    // Add flights
    if (quote.flights && Array.isArray(quote.flights)) {
      quote.flights.forEach((flight: any, index: number) => {
        bookings.push({
          id: `flight-${quoteId}-${index}`,
          type: 'flight',
          name: `Flight ${flight.departure?.airport || 'Unknown'} → ${flight.arrival?.airport || 'Unknown'}`,
          status: quote.status === 'accepted' ? 'confirmed' : 'pending',
          confirmationCode: quote.status === 'accepted' ? `FL${Math.random().toString(36).substring(2, 8).toUpperCase()}` : undefined,
          details: `${flight.airline || 'Unknown Airline'} • ${flight.departure?.date || 'Date TBD'}`,
        });
      });
    }

    // Add hotels
    if (quote.hotels && Array.isArray(quote.hotels)) {
      quote.hotels.forEach((hotel: any, index: number) => {
        bookings.push({
          id: `hotel-${quoteId}-${index}`,
          type: 'hotel',
          name: hotel.name || `Hotel Booking ${index + 1}`,
          status: quote.status === 'accepted' ? 'confirmed' : 'pending',
          confirmationCode: quote.status === 'accepted' ? `HT${Math.random().toString(36).substring(2, 8).toUpperCase()}` : undefined,
          details: `${hotel.nights || 1} night${hotel.nights !== 1 ? 's' : ''} • Check-in: ${hotel.checkIn || 'TBD'}`,
        });
      });
    }

    // Add car rentals
    if (quote.carRentals && Array.isArray(quote.carRentals)) {
      quote.carRentals.forEach((car: any, index: number) => {
        bookings.push({
          id: `car-${quoteId}-${index}`,
          type: 'car',
          name: car.name || `Car Rental ${index + 1}`,
          status: quote.status === 'accepted' ? 'confirmed' : 'pending',
          confirmationCode: quote.status === 'accepted' ? `CR${Math.random().toString(36).substring(2, 8).toUpperCase()}` : undefined,
          details: `${car.days || 1} day${car.days !== 1 ? 's' : ''} • Pickup: ${car.pickupDate || 'TBD'}`,
        });
      });
    }

    // Add activities
    if (quote.activities && Array.isArray(quote.activities)) {
      quote.activities.forEach((activity: any, index: number) => {
        bookings.push({
          id: `activity-${quoteId}-${index}`,
          type: 'activity',
          name: activity.name || `Activity ${index + 1}`,
          status: quote.status === 'accepted' ? 'confirmed' : 'pending',
          confirmationCode: quote.status === 'accepted' ? `AC${Math.random().toString(36).substring(2, 8).toUpperCase()}` : undefined,
          details: `${activity.duration || 'Duration TBD'} • ${activity.date || 'Date TBD'}`,
        });
      });
    }

    // Add transfers
    if (quote.transfers && Array.isArray(quote.transfers)) {
      quote.transfers.forEach((transfer: any, index: number) => {
        bookings.push({
          id: `transfer-${quoteId}-${index}`,
          type: 'transfer',
          name: transfer.name || `Transfer ${index + 1}`,
          status: quote.status === 'accepted' ? 'confirmed' : 'pending',
          confirmationCode: quote.status === 'accepted' ? `TR${Math.random().toString(36).substring(2, 8).toUpperCase()}` : undefined,
          details: `${transfer.from || 'Location'} → ${transfer.to || 'Destination'}`,
        });
      });
    }

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
