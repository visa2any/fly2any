import { NextRequest, NextResponse } from 'next/server';

interface FinalizeBookingRequest {
  transactionId: string;
  paymentMethod: 'USER_PAYMENT' | 'ACC_CREDIT_CARD' | 'WALLET';
  paymentDetails?: {
    cardLast4?: string;
    paymentProvider?: string;
  };
  guestDetails?: {
    guests: Array<{
      title: string;
      firstName: string;
      lastName: string;
      isMainGuest?: boolean;
    }>;
    contact: {
      email: string;
      phone: string;
    };
    specialRequests?: string;
  };
}

interface LiteAPIBookingResponse {
  success: boolean;
  data?: {
    bookingReference: string;
    status: string;
    hotel: {
      id: string;
      name: string;
    };
    checkIn: string;
    checkOut: string;
    totalPrice: {
      amount: number;
      currency: string;
      formatted: string;
    };
    guests: Array<{
      name: string;
      type: 'adult' | 'child';
    }>;
    confirmationEmail?: string;
  };
  error?: string;
}

/**
 * Finaliza uma reserva de hotel após o pagamento
 * POST /api/hotels/booking/finalize
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const requestId = crypto.randomUUID();
    console.log(`[${requestId}] Booking finalization request`);

    const body: FinalizeBookingRequest = await request.json();
    const { transactionId, paymentMethod, paymentDetails, guestDetails } = body;

    // Validação básica
    if (!transactionId) {
      return NextResponse.json({
        success: false,
        error: 'Transaction ID é obrigatório'
      }, { status: 400 });
    }

    if (!paymentMethod) {
      return NextResponse.json({
        success: false,
        error: 'Método de pagamento é obrigatório'
      }, { status: 400 });
    }

    console.log(`[${requestId}] Finalizing booking:`, {
      transactionId,
      paymentMethod,
      hasGuestDetails: !!guestDetails
    });

    // Para demo, simular diferentes comportamentos baseados no transactionId
    if (transactionId.startsWith('demo_')) {
      // Simulação de booking demo
      const mockBooking = {
        bookingReference: `FLY2ANY-${Date.now().toString().slice(-6)}`,
        status: 'confirmed',
        hotel: {
          id: 'demo-copacabana-palace',
          name: 'Copacabana Palace'
        },
        checkIn: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        checkOut: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        totalPrice: {
          amount: 850,
          currency: 'BRL',
          formatted: 'R$ 850,00'
        },
        guests: [
          { name: 'João Silva', type: 'adult' as const },
          { name: 'Maria Silva', type: 'adult' as const }
        ],
        confirmationEmail: guestDetails?.contact.email || 'guest@example.com'
      };

      console.log(`[${requestId}] Demo booking confirmed:`, mockBooking.bookingReference);

      return NextResponse.json({
        success: true,
        data: mockBooking
      });
    }

    // Para hotéis reais, fazer requisição à LiteAPI
    const liteApiUrl = process.env.NODE_ENV === 'production' 
      ? 'https://api.liteapi.travel/v3.0'
      : 'https://api.liteapi.travel/v3.0'; // Sandbox também usa a mesma URL

    const apiKey = process.env.NODE_ENV === 'production'
      ? process.env.LITEAPI_LIVE_KEY
      : process.env.LITEAPI_SANDBOX_KEY;

    if (!apiKey) {
      console.error(`[${requestId}] LiteAPI key not configured`);
      return NextResponse.json({
        success: false,
        error: 'Configuração de API não encontrada'
      }, { status: 500 });
    }

    // Preparar dados para LiteAPI
    const bookingPayload: any = {
      transactionId,
      method: paymentMethod
    };

    // Adicionar detalhes dos hóspedes se fornecidos
    if (guestDetails) {
      bookingPayload.guests = guestDetails.guests.map(guest => ({
        title: guest.title,
        firstName: guest.firstName,
        lastName: guest.lastName,
        isMainGuest: guest.isMainGuest || false
      }));

      bookingPayload.contact = guestDetails.contact;

      if (guestDetails.specialRequests) {
        bookingPayload.specialRequests = guestDetails.specialRequests;
      }
    }

    console.log(`[${requestId}] Making LiteAPI booking request`);

    const response = await fetch(`${liteApiUrl}/hotels/book`, {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingPayload)
    });

    const responseText = await response.text();
    console.log(`[${requestId}] LiteAPI response status:`, response.status);

    if (!response.ok) {
      console.error(`[${requestId}] LiteAPI booking failed:`, {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      });

      let errorMessage = 'Erro ao finalizar reserva';
      
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // Keep default error message
      }

      return NextResponse.json({
        success: false,
        error: errorMessage
      }, { status: response.status });
    }

    const result = JSON.parse(responseText);
    console.log(`[${requestId}] Booking successful:`, result.data?.bookingReference);

    // Transformar resposta da LiteAPI para formato padrão
    const bookingResponse: LiteAPIBookingResponse = {
      success: true,
      data: {
        bookingReference: result.data.bookingReference,
        status: result.data.status,
        hotel: {
          id: result.data.hotel.id,
          name: result.data.hotel.name
        },
        checkIn: result.data.checkIn,
        checkOut: result.data.checkOut,
        totalPrice: {
          amount: result.data.totalPrice.amount,
          currency: result.data.totalPrice.currency,
          formatted: result.data.totalPrice.formatted
        },
        guests: result.data.guests || [],
        confirmationEmail: result.data.confirmationEmail
      }
    };

    return NextResponse.json(bookingResponse);

  } catch (error: any) {
    console.error('Booking finalization error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    }, { status: 500 });
  }
}

/**
 * Endpoint para verificar status de uma reserva
 * GET /api/hotels/booking/finalize?bookingReference=ABC123
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const bookingReference = url.searchParams.get('bookingReference');

    if (!bookingReference) {
      return NextResponse.json({
        success: false,
        error: 'Booking reference é obrigatório'
      }, { status: 400 });
    }

    // Para demo bookings
    if (bookingReference.startsWith('FLY2ANY-')) {
      return NextResponse.json({
        success: true,
        data: {
          bookingReference,
          status: 'confirmed',
          hotel: {
            id: 'demo-hotel',
            name: 'Demo Hotel'
          },
          checkIn: new Date().toISOString().split('T')[0],
          checkOut: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          totalPrice: {
            amount: 850,
            currency: 'BRL',
            formatted: 'R$ 850,00'
          },
          guests: []
        }
      });
    }

    // Para bookings reais, consultar LiteAPI
    const liteApiUrl = process.env.NODE_ENV === 'production' 
      ? 'https://api.liteapi.travel/v3.0'
      : 'https://api.liteapi.travel/v3.0';

    const apiKey = process.env.NODE_ENV === 'production'
      ? process.env.LITEAPI_LIVE_KEY
      : process.env.LITEAPI_SANDBOX_KEY;

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'Configuração de API não encontrada'
      }, { status: 500 });
    }

    const response = await fetch(`${liteApiUrl}/hotels/booking/${bookingReference}`, {
      headers: {
        'X-API-Key': apiKey,
      }
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: 'Reserva não encontrada'
      }, { status: 404 });
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error: any) {
    console.error('Booking status check error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    }, { status: 500 });
  }
}