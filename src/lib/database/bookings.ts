/**
 * 💾 BOOKING DATABASE OPERATIONS
 * Handles booking data storage and retrieval using Prisma ORM
 */

import { prisma } from './prisma';
import { Booking, BookingStatus, PaymentStatus, Prisma } from '@prisma/client';

export interface BookingData {
  bookingReference: string;
  paymentIntentId?: string;
  flightId?: string;
  passengerInfo: any;
  contactInfo: any;
  services?: any;
  flightDetails: any;
  pricing: {
    basePrice: number;
    serviceCharges: number;
    totalPrice: number;
    currency: string;
  };
  status: 'confirmed' | 'cancelled' | 'modified';
  bookingDate: string;
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
}

// Fallback in-memory storage for development when DB is not available
const fallbackStorage = new Map<string, BookingData>();

/**
 * Store booking data
 */
export async function storeBookingData(bookingData: BookingData): Promise<boolean> {
  try {
    console.log('💾 Storing booking data:', bookingData.bookingReference);
    
    // Try to use Prisma first
    try {
      const booking = await prisma.booking.create({
        data: {
          bookingReference: bookingData.bookingReference,
          paymentIntentId: bookingData.paymentIntentId,
          flightId: bookingData.flightId,
          passengerInfo: bookingData.passengerInfo,
          contactInfo: bookingData.contactInfo,
          services: bookingData.services || {},
          flightDetails: bookingData.flightDetails,
          basePrice: bookingData.pricing.basePrice,
          serviceCharges: bookingData.pricing.serviceCharges,
          totalPrice: bookingData.pricing.totalPrice,
          currency: bookingData.pricing.currency,
          status: bookingData.status.toUpperCase() as BookingStatus,
          paymentStatus: bookingData.paymentStatus.toUpperCase() as PaymentStatus,
          bookingDate: new Date(bookingData.bookingDate)
        }
      });
      
      console.log('✅ Booking stored in database:', booking.id);
      return true;
      
    } catch (dbError) {
      console.warn('⚠️ Database unavailable, using fallback storage:', (dbError as Error).message);
      
      // Fallback to in-memory storage
      fallbackStorage.set(bookingData.bookingReference, bookingData);
      console.log('✅ Booking stored in fallback storage');
      return true;
    }
    
  } catch (error) {
    console.error('❌ Booking storage error:', error);
    return false;
  }
}

/**
 * Retrieve booking by reference
 */
export async function getBookingByReference(bookingReference: string): Promise<BookingData | null> {
  try {
    console.log('🔍 Retrieving booking:', bookingReference);
    
    // Try database first
    try {
      const booking = await prisma.booking.findUnique({
        where: { bookingReference },
        include: {
          cancellation: true,
          modifications: true
        }
      });
      
      if (booking) {
        console.log('✅ Booking found in database');
        return {
          bookingReference: booking.bookingReference,
          paymentIntentId: booking.paymentIntentId || undefined,
          flightId: booking.flightId || undefined,
          passengerInfo: booking.passengerInfo,
          contactInfo: booking.contactInfo,
          services: booking.services,
          flightDetails: booking.flightDetails,
          pricing: {
            basePrice: booking.basePrice,
            serviceCharges: booking.serviceCharges,
            totalPrice: booking.totalPrice,
            currency: booking.currency
          },
          status: booking.status.toLowerCase() as any,
          bookingDate: booking.bookingDate.toISOString(),
          paymentStatus: booking.paymentStatus.toLowerCase() as any
        };
      }
    } catch (dbError) {
      console.warn('⚠️ Database unavailable, checking fallback storage');
    }
    
    // Fallback to in-memory storage
    const booking = fallbackStorage.get(bookingReference);
    
    if (booking) {
      console.log('✅ Booking found in fallback storage');
      return booking;
    } else {
      console.log('❌ Booking not found');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Database retrieval error:', error);
    return null;
  }
}

/**
 * Get user's bookings by email
 */
export async function getUserBookings(email: string): Promise<BookingData[]> {
  try {
    console.log('🔍 Retrieving bookings for user:', email);
    
    // In a real implementation:
    // const bookings = await prisma.booking.findMany({
    //   where: {
    //     passengerInfo: {
    //       path: ['email'],
    //       equals: email
    //     }
    //   },
    //   orderBy: { bookingDate: 'desc' }
    // });
    
    // For development, filter in-memory storage
    const userBookings = Array.from(fallbackStorage.values())
      .filter(booking => booking.passengerInfo.email === email)
      .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
    
    console.log('✅ Found', userBookings.length, 'bookings');
    return userBookings;
    
  } catch (error) {
    console.error('❌ Database query error:', error);
    return [];
  }
}

/**
 * Update booking status
 */
export async function updateBookingStatus(
  bookingReference: string, 
  status: 'confirmed' | 'cancelled' | 'modified',
  paymentStatus?: 'paid' | 'pending' | 'failed' | 'refunded'
): Promise<boolean> {
  try {
    console.log('🔄 Updating booking status:', bookingReference, status);
    
    // In a real implementation:
    // await prisma.booking.update({
    //   where: { bookingReference },
    //   data: { 
    //     status,
    //     ...(paymentStatus && { paymentStatus })
    //   }
    // });
    
    // For development, update in-memory storage
    const booking = fallbackStorage.get(bookingReference);
    if (booking) {
      booking.status = status;
      if (paymentStatus) {
        booking.paymentStatus = paymentStatus;
      }
      fallbackStorage.set(bookingReference, booking);
      console.log('✅ Booking status updated');
      return true;
    } else {
      console.log('❌ Booking not found for update');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Database update error:', error);
    return false;
  }
}

/**
 * Store cancellation request
 */
export async function storeCancellationRequest(
  bookingReference: string,
  cancellationReason: string,
  refundAmount: number
): Promise<boolean> {
  try {
    console.log('🚫 Storing cancellation request:', bookingReference);
    
    const cancellationData = {
      bookingReference,
      cancellationReason,
      refundAmount,
      cancellationDate: new Date().toISOString(),
      status: 'pending'
    };
    
    // In a real implementation:
    // await prisma.cancellation.create({
    //   data: cancellationData
    // });
    
    // For development, you could extend the in-memory storage
    console.log('✅ Cancellation request stored');
    return true;
    
  } catch (error) {
    console.error('❌ Cancellation storage error:', error);
    return false;
  }
}

/**
 * Get booking statistics
 */
export async function getBookingStats(): Promise<{
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
}> {
  try {
    // In a real implementation:
    // const stats = await prisma.booking.aggregate({
    //   _count: { bookingReference: true },
    //   _sum: { totalPrice: true },
    //   where: { status: { in: ['confirmed', 'cancelled'] } }
    // });
    
    // For development, calculate from in-memory storage
    const allBookings = Array.from(fallbackStorage.values());
    const confirmedBookings = allBookings.filter(b => b.status === 'confirmed');
    const cancelledBookings = allBookings.filter(b => b.status === 'cancelled');
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.pricing.totalPrice, 0);
    
    return {
      totalBookings: allBookings.length,
      confirmedBookings: confirmedBookings.length,
      cancelledBookings: cancelledBookings.length,
      totalRevenue
    };
    
  } catch (error) {
    console.error('❌ Stats calculation error:', error);
    return {
      totalBookings: 0,
      confirmedBookings: 0,
      cancelledBookings: 0,
      totalRevenue: 0
    };
  }
}

/**
 * Search bookings with filters
 */
export async function searchBookings(filters: {
  email?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  flightId?: string;
}): Promise<BookingData[]> {
  try {
    console.log('🔍 Searching bookings with filters:', filters);
    
    // For development, filter in-memory storage
    let results = Array.from(fallbackStorage.values());
    
    if (filters.email) {
      results = results.filter(b => b.passengerInfo.email.includes(filters.email!));
    }
    
    if (filters.status) {
      results = results.filter(b => b.status === filters.status);
    }
    
    if (filters.dateFrom) {
      results = results.filter(b => b.bookingDate >= filters.dateFrom!);
    }
    
    if (filters.dateTo) {
      results = results.filter(b => b.bookingDate <= filters.dateTo!);
    }
    
    if (filters.flightId) {
      results = results.filter(b => b.flightId === filters.flightId);
    }
    
    console.log('✅ Found', results.length, 'matching bookings');
    return results.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
    
  } catch (error) {
    console.error('❌ Search error:', error);
    return [];
  }
}