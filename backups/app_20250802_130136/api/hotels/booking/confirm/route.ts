/**
 * Hotel Booking Confirmation API Endpoint
 * POST /api/hotels/booking/confirm
 * 
 * Confirms a pre-booking and creates the final reservation
 * Integrates with existing lead system and sends notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { liteApiClient } from '@/lib/hotels/liteapi-client';
import { sendEmail } from '@/lib/email';
import type { BookingResponse, APIResponse, Guest, ContactInfo } from '@/types/hotels';

// Validation schemas
const guestSchema = z.object({
  title: z.enum(['Mr', 'Mrs', 'Ms', 'Miss', 'Dr', 'Prof']),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  isMainGuest: z.boolean().optional()
});

const contactSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number too short').max(20, 'Phone number too long'),
  whatsapp: z.string().optional()
});

const confirmBookingSchema = z.object({
  prebookId: z.string().min(1, 'Pre-booking ID is required'),
  guests: z.array(guestSchema).min(1, 'At least one guest is required'),
  contact: contactSchema,
  specialRequests: z.string().max(500).optional(),
  arrivalTime: z.string().optional(),
  marketingConsent: z.boolean().default(false),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: 'Terms and conditions must be accepted'
  })
});

/**
 * Format price with currency
 */
function formatPrice(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/**
 * Transform LiteAPI booking response
 */
function transformBookingResponse(liteApiResponse: any): BookingResponse {
  const data = liteApiResponse.data;
  
  return {
    bookingId: data.booking_id || data.id,
    bookingReference: data.booking_reference || data.reference || data.booking_id,
    status: data.status === 'confirmed' ? 'confirmed' : 
            data.status === 'pending' ? 'pending' : 'cancelled',
    hotel: {
      id: data.hotel?.id || '',
      name: data.hotel?.name || '',
      description: data.hotel?.description,
      starRating: data.hotel?.star_rating || 0,
      guestRating: data.hotel?.guest_rating,
      reviewCount: data.hotel?.review_count,
      location: {
        address: {
          street: data.hotel?.location?.address,
          city: data.hotel?.location?.city || '',
          state: data.hotel?.location?.state,
          country: data.hotel?.location?.country || '',
          postal_code: data.hotel?.location?.postal_code,
          // coordinates removido - não é usado no Address, apenas em location.coordinates
        },
        coordinates: data.hotel?.location?.coordinates || { latitude: 0, longitude: 0 },
        landmarks: data.hotel?.landmarks || []
      },
      chainName: data.hotel?.chain_name
    },
    rate: {
      roomType: {
        name: data.rate?.room_type?.name || 'Standard Room',
        amenities: (data.rate?.room_type?.amenities || []).map((amenity: any) => amenity.name || amenity)
      },
      boardType: data.rate?.board_type || 'room_only',
      isFreeCancellation: data.rate?.is_free_cancellation || false
    },
    guests: data.guests || [],
    checkIn: data.check_in || data.checkin || '',
    checkOut: data.check_out || data.checkout || '',
    nights: data.nights || 1,
    totalPrice: {
      amount: data.total_price?.amount || 0,
      currency: data.total_price?.currency || 'USD',
      formatted: formatPrice(data.total_price?.amount || 0, data.total_price?.currency || 'USD')
    },
    cancellationPolicy: {
      // deadline: data.cancellation_policy?.deadline || '', // removed - not in interface
      // penalty: data.cancellation_policy?.penalty || { amount: 0, currency: 'USD', formatted: 'Free' }, // Removed - not in cancellationPolicy interface
      description: data.cancellation_policy?.description || 'Please check hotel policy'
    },
    confirmationEmail: {
      sent: false,
      to: data.contact?.email || ''
    }
  };
}

/**
 * Create lead in existing system
 */
async function createHotelLead(
  bookingData: BookingResponse, 
  contactInfo: ContactInfo,
  marketingConsent: boolean
): Promise<number> {
  try {
    // Calculate lead priority based on booking value
    let priority: 'low' | 'medium' | 'high' = 'medium';
    if (bookingData.totalPrice && bookingData.totalPrice.amount > 2000) priority = 'high';
    else if (bookingData.totalPrice && bookingData.totalPrice.amount < 500) priority = 'low';

    // Create lead using existing leads table structure
    const leadData = {
      // Personal information
      nome: (bookingData.guests && bookingData.guests[0]?.firstName) || '',
      sobrenome: (bookingData.guests && bookingData.guests[0]?.lastName) || '',
      email: contactInfo.email,
      telefone: contactInfo.phone,
      whatsapp: contactInfo.whatsapp || contactInfo.phone,
      
      // Service information
      selectedServices: [{
        serviceType: 'hoteis',
        serviceSubtype: 'reservation',
        hotelId: bookingData.hotel?.id || '',
        hotelName: bookingData.hotel?.name || '',
        hotelLocation: `${bookingData.hotel?.location?.address?.city || ''}, ${bookingData.hotel?.location?.address?.country || ''}`,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        nights: bookingData.nights,
        guests: bookingData.guests?.length || 0,
        rooms: bookingData.rate?.roomType?.name || '',
        totalAmount: bookingData.totalPrice?.amount || 0,
        currency: bookingData.totalPrice?.currency || 'BRL',
        bookingReference: bookingData.bookingReference,
        rateType: bookingData.rate?.boardType || '',
        starRating: bookingData.hotel?.starRating || 0
      }],
      
      // Travel information
      origem: 'hotel-booking-liteapi',
      destino: `${bookingData.hotel?.location?.address?.city || ''}, ${bookingData.hotel?.location?.address?.country || ''}`,
      dataIda: bookingData.checkIn,
      dataVolta: bookingData.checkOut,
      tipoViagem: 'hotel-only',
      numeroPassageiros: bookingData.guests?.length || 0,
      
      // Detailed booking information
      observacoes: buildBookingNotes(bookingData),
      
      // Consents and marketing
      marketingConsent,
      whatsappConsent: !!contactInfo.whatsapp,
      newsletterConsent: marketingConsent,
      
      // Lead metadata
      leadSource: 'website-hotel-booking',
      leadMedium: 'organic',
      leadCampaign: 'hotel-liteapi',
      priority,
      status: 'novo',
      tags: generateLeadTags(bookingData)
    };

    // Insert into leads table
    const result = await sql`
      INSERT INTO leads (
        nome, email, telefone, whatsapp, 
        selected_services, origem, destino, 
        data_ida, data_volta, tipo_viagem,
        observacoes, marketing_consent, 
        lead_source, priority, status, tags,
        created_at
      ) VALUES (
        ${leadData.nome}, ${leadData.email}, ${leadData.telefone}, ${leadData.whatsapp},
        ${JSON.stringify(leadData.selectedServices)}, ${leadData.origem}, ${leadData.destino},
        ${leadData.dataIda}, ${leadData.dataVolta}, ${leadData.tipoViagem},
        ${leadData.observacoes}, ${leadData.marketingConsent},
        ${leadData.leadSource}, ${leadData.priority}, ${leadData.status}, ${JSON.stringify(leadData.tags)},
        NOW()
      ) RETURNING id
    `;

    return result.rows[0].id;
  } catch (error) {
    console.error('Failed to create hotel lead:', error);
    throw new Error('Failed to create lead record');
  }
}

/**
 * Store booking in hotel_bookings table
 */
async function storeHotelBooking(
  bookingData: BookingResponse,
  contactInfo: ContactInfo,
  leadId: number,
  specialRequests?: string
): Promise<number> {
  try {
    const result = await sql`
      INSERT INTO hotel_bookings (
        lead_id, liteapi_booking_id, hotel_id, hotel_name, hotel_location,
        booking_reference, check_in, check_out, guests, rooms, rate_details,
        total_amount, currency, status, cancellation_policy, special_requests,
        booking_data, created_at
      ) VALUES (
        ${leadId}, ${bookingData.bookingId}, ${bookingData.hotel?.id || ''}, ${bookingData.hotel?.name || ''},
        ${JSON.stringify(bookingData.hotel?.location || {})}, ${bookingData.bookingReference || ''},
        ${bookingData.checkIn || ''}, ${bookingData.checkOut || ''}, ${JSON.stringify(bookingData.guests || [])},
        ${JSON.stringify([bookingData.rate?.roomType || {}])}, ${JSON.stringify(bookingData.rate || {})},
        ${bookingData.totalPrice?.amount || 0}, ${bookingData.totalPrice?.currency || 'BRL'}, ${bookingData.status},
        ${JSON.stringify(bookingData.cancellationPolicy)}, ${specialRequests || ''},
        ${JSON.stringify(bookingData)}, NOW()
      ) RETURNING id
    `;

    return result.rows[0].id;
  } catch (error) {
    console.error('Failed to store hotel booking:', error);
    throw new Error('Failed to store booking record');
  }
}

/**
 * Build booking notes for lead
 */
function buildBookingNotes(bookingData: BookingResponse): string {
  const notes = [
    `🏨 RESERVA DE HOTEL - ${bookingData.hotel?.name || 'Hotel'}`,
    `📍 Local: ${bookingData.hotel?.location?.address?.street || ''} ${bookingData.hotel?.location?.address?.city || ''}, ${bookingData.hotel?.location?.address?.country || ''}`,
    bookingData.checkIn ? `📅 Check-in: ${new Date(bookingData.checkIn).toLocaleDateString('pt-BR')}` : '',
    bookingData.checkOut ? `📅 Check-out: ${new Date(bookingData.checkOut).toLocaleDateString('pt-BR')}` : '',
    `🛏️ Quarto: ${bookingData.rate?.roomType?.name || 'Quarto'}`,
    `🍽️ Regime: ${bookingData.rate?.boardType || 'Não especificado'}`,
    `👥 Hóspedes: ${bookingData.guests?.map(g => `${g.firstName} ${g.lastName}`).join(', ') || 'Não especificado'}`,
    `💰 Valor Total: ${bookingData.totalPrice?.formatted || 'Não especificado'}`,
    `📋 Referência: ${bookingData.bookingReference || 'Não especificado'}`,
    `⭐ Hotel: ${bookingData.hotel?.starRating || 0} estrelas`,
    bookingData.hotel?.guestRating ? `👍 Avaliação: ${bookingData.hotel.guestRating}/10` : '',
    `🔄 Cancelamento: ${bookingData.rate?.isFreeCancellation ? 'Grátis' : 'Pago'}`,
  ].filter(Boolean).join('\n');

  return notes;
}

/**
 * Generate tags for lead
 */
function generateLeadTags(bookingData: BookingResponse): string[] {
  const tags = ['hotel', 'liteapi', 'booking'];
  
  if (bookingData.totalPrice && bookingData.totalPrice.amount > 2000) tags.push('high-value');
  if (bookingData.hotel?.starRating && bookingData.hotel.starRating >= 5) tags.push('luxury');
  if (bookingData.hotel?.starRating && bookingData.hotel.starRating >= 4) tags.push('premium');
  if (bookingData.rate?.isFreeCancellation) tags.push('flexible');
  if (bookingData.hotel?.location?.address?.city?.toLowerCase().includes('são paulo')) tags.push('sao-paulo');
  if (bookingData.hotel?.location?.address?.city?.toLowerCase().includes('rio')) tags.push('rio-janeiro');
  if (bookingData.hotel?.chainName) tags.push('chain-hotel');
  
  return tags;
}

/**
 * Send booking confirmation emails
 */
async function sendBookingNotifications(
  bookingData: BookingResponse,
  contactInfo: ContactInfo,
  leadId: number
): Promise<void> {
  try {
    // Customer confirmation email
    const customerEmailData = {
      to: contactInfo.email,
      subject: `✅ Confirmação de Reserva - ${bookingData.hotel?.name || 'Hotel'}`,
      template: 'hotel-booking-confirmation-customer',
      html: `<p>Confirmação de reserva para ${bookingData.hotel?.name || 'Hotel'}</p>`,
      data: {
        customerName: `${bookingData.guests?.[0]?.firstName || ''} ${bookingData.guests?.[0]?.lastName || ''}`,
        hotelName: bookingData.hotel?.name || 'Hotel',
        hotelLocation: `${bookingData.hotel?.location?.address?.city || ''}, ${bookingData.hotel?.location?.address?.country || ''}`,
        checkIn: bookingData.checkIn ? new Date(bookingData.checkIn).toLocaleDateString('pt-BR') : 'Não especificado',
        checkOut: bookingData.checkOut ? new Date(bookingData.checkOut).toLocaleDateString('pt-BR') : 'Não especificado',
        nights: bookingData.nights || 0,
        roomType: bookingData.rate?.roomType?.name || 'Quarto',
        boardType: bookingData.rate?.boardType || 'Não especificado',
        totalAmount: bookingData.totalPrice?.formatted || 'Não especificado',
        bookingReference: bookingData.bookingReference || 'Não especificado',
        cancellationPolicy: bookingData.cancellationPolicy?.description || 'Consulte política do hotel',
        guests: bookingData.guests?.map(g => `${g.title} ${g.firstName} ${g.lastName}`).join(', ') || 'Não especificado',
        whatsappNumber: '5511951944717',
        supportEmail: 'hoteis@fly2any.com'
      }
    };

    await sendEmail(customerEmailData);

    // Team notification email
    const teamEmailData = {
      to: 'reservas@fly2any.com',
      subject: `🚨 NOVA RESERVA HOTEL - ${bookingData.hotel?.name || 'Hotel'} - ${bookingData.totalPrice?.formatted || 'Valor não especificado'}`,
      template: 'hotel-booking-notification-team',
      html: `<p>Nova reserva de hotel recebida: ${bookingData.hotel?.name || 'Hotel'}</p>`,
      data: {
        bookingReference: bookingData.bookingReference || 'Não especificado',
        hotelName: bookingData.hotel?.name || 'Hotel',
        hotelLocation: `${bookingData.hotel?.location?.address?.city || ''}, ${bookingData.hotel?.location?.address?.country || ''}`,
        checkIn: bookingData.checkIn ? new Date(bookingData.checkIn).toLocaleDateString('pt-BR') : 'Não especificado',
        checkOut: bookingData.checkOut ? new Date(bookingData.checkOut).toLocaleDateString('pt-BR') : 'Não especificado',
        totalAmount: bookingData.totalPrice?.formatted || 'Não especificado',
        customerName: `${bookingData.guests?.[0]?.firstName || ''} ${bookingData.guests?.[0]?.lastName || ''}`,
        customerEmail: contactInfo.email,
        customerPhone: contactInfo.phone,
        leadId: leadId,
        priority: (bookingData.totalPrice && bookingData.totalPrice.amount > 2000) ? 'HIGH' : 'NORMAL'
      }
    };

    await sendEmail(teamEmailData);

    console.log('Booking confirmation emails sent successfully');
  } catch (error) {
    console.error('Failed to send booking notifications:', error);
    // Don't throw - booking should still succeed even if emails fail
  }
}

/**
 * POST /api/hotels/booking/confirm
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    // Parse request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      return NextResponse.json({
        status: 'error',
        message: 'Invalid JSON in request body',
        data: null,
        metadata: {
          requestId,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime
        }
      } as APIResponse<null>, { status: 400 });
    }

    console.log(`[${requestId}] Booking confirmation request:`, {
      prebookId: requestBody.prebookId,
      guestCount: requestBody.guests?.length,
      email: requestBody.contact?.email
    });

    // Validate request data
    let validatedData;
    try {
      validatedData = confirmBookingSchema.parse(requestBody);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({
          status: 'error',
          message: 'Invalid request data',
          data: null,
          errors: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
          })),
          metadata: {
            requestId,
            timestamp: new Date().toISOString(),
            processingTime: Date.now() - startTime
          }
        } as APIResponse<null>, { status: 400 });
      }
      throw error;
    }

    // Confirm booking with LiteAPI
    console.log(`[${requestId}] Confirming booking with LiteAPI`);
    const liteApiResponse = await liteApiClient.confirmBooking(
      validatedData.prebookId,
      {
        guests: validatedData.guests,
        contact: validatedData.contact,
        specialRequests: validatedData.specialRequests
      }
    );

    if (!liteApiResponse || !liteApiResponse.data) {
      throw new Error('Invalid response from LiteAPI');
    }

    // Check if booking was successful
    if (!liteApiResponse.success || liteApiResponse.data.status === 'failed') {
      const errorMessage = liteApiResponse.data?.error || 
                          liteApiResponse.message || 
                          'Booking confirmation failed';
      
      return NextResponse.json({
        status: 'error',
        message: errorMessage,
        data: null,
        metadata: {
          requestId,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime
        }
      } as APIResponse<null>, { status: 409 });
    }

    // Transform response
    const bookingResponse = transformBookingResponse(liteApiResponse);

    // Create lead in existing system
    console.log(`[${requestId}] Creating lead record`);
    // Construct complete ContactInfo from contact and main guest data
    const mainGuest = validatedData.guests.find(g => g.isMainGuest) || validatedData.guests[0];
    const completeContactInfo: ContactInfo = {
      email: validatedData.contact.email,
      phone: validatedData.contact.phone,
      whatsapp: validatedData.contact.whatsapp,
      firstName: mainGuest.firstName,
      lastName: mainGuest.lastName
    };

    const leadId = await createHotelLead(
      bookingResponse, 
      completeContactInfo, 
      validatedData.marketingConsent
    );

    // Store booking in database
    console.log(`[${requestId}] Storing booking record`);
    const bookingId = await storeHotelBooking(
      bookingResponse,
      completeContactInfo,
      leadId,
      validatedData.specialRequests
    );

    // Send notifications (async)
    sendBookingNotifications(bookingResponse, completeContactInfo, leadId);

    // Update confirmation email status
    bookingResponse.confirmationEmail = {
      sent: true,
      to: validatedData.contact.email
    };

    const processingTime = Date.now() - startTime;
    console.log(`[${requestId}] Booking confirmed successfully: ${bookingResponse.bookingReference} in ${processingTime}ms`);

    const response: APIResponse<BookingResponse> = {
      status: 'success',
      data: bookingResponse,
      metadata: {
        requestId,
        timestamp: new Date().toISOString(),
        processingTime,
        // leadId, // removed - not allowed in metadata
        // bookingId // removed - not allowed in metadata
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`[${requestId}] Booking confirmation error:`, error);

    let errorMessage = 'Internal server error';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('LiteAPI Error')) {
        if (error.message.includes('prebook expired') || 
            error.message.includes('invalid prebook')) {
          errorMessage = 'Pre-booking has expired. Please search again.';
          statusCode = 410;
        } else if (error.message.includes('no availability')) {
          errorMessage = 'Room is no longer available. Please search again.';
          statusCode = 409;
        } else {
          errorMessage = 'Booking service temporarily unavailable';
          statusCode = 503;
        }
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Booking confirmation timeout';
        statusCode = 408;
      } else if (error.message.includes('lead record') || 
                error.message.includes('booking record')) {
        errorMessage = 'Database error - booking may have succeeded but records not saved';
        statusCode = 500;
      } else {
        errorMessage = error.message;
      }
    }

    const errorResponse: APIResponse<null> = {
      status: 'error',
      message: errorMessage,
      data: null,
      metadata: {
        requestId,
        timestamp: new Date().toISOString(),
        processingTime
      }
    };

    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

/**
 * OPTIONS /api/hotels/booking/confirm - CORS preflight
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}

// Export configuration
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;