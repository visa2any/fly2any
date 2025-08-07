/**
 * API Route: /api/hotels/booking
 * Gerenciamento de reservas de hotéis
 */

import { NextRequest, NextResponse } from 'next/server';
import { liteApiClient } from '@/lib/hotels/liteapi-client';
import type { BookingRequest, Guest } from '@/types/hotels';
import { z } from 'zod';

// Schema de validação para guest info
const guestInfoSchema = z.object({
  title: z.enum(['mr', 'mrs', 'ms', 'miss', 'dr']),
  first_name: z.string().min(2).max(50),
  last_name: z.string().min(2).max(50),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  nationality: z.string().length(2).optional(),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  passport: z.object({
    number: z.string().min(5).max(20),
    expiry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    country: z.string().length(2)
  }).optional()
});

// Schema de validação para dados da reserva
const bookingRequestSchema = z.object({
  rate_id: z.string().min(1),
  
  rooms: z.array(z.object({
    guests: z.array(guestInfoSchema).min(1),
    special_requests: z.string().max(500).optional()
  })).min(1).max(5),
  
  contact: z.object({
    email: z.string().email(),
    phone: z.string().min(8).max(20),
    first_name: z.string().min(2).max(50),
    last_name: z.string().min(2).max(50)
  }),
  
  payment: z.object({
    method: z.enum(['credit_card', 'bank_transfer', 'pay_later']),
    card: z.object({
      number: z.string().regex(/^\d{12,19}$/),
      expiry_month: z.number().min(1).max(12),
      expiry_year: z.number().min(new Date().getFullYear()),
      cvv: z.string().regex(/^\d{3,4}$/),
      holder_name: z.string().min(2).max(100)
    }).optional()
  }),
  
  special_requests: z.string().max(1000).optional(),
  internal_reference: z.string().max(100).optional(),
  marketing_consent: z.boolean().optional()
});

// Schema para buscar detalhes de reserva
const bookingQuerySchema = z.object({
  booking_id: z.string().min(1)
});

// Schema para cancelamento
const cancellationSchema = z.object({
  booking_id: z.string().min(1),
  reason: z.string().max(500).optional()
});

/**
 * POST - Criar nova reserva
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar dados da reserva
    const validation = bookingRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Dados de reserva inválidos',
          details: validation.error.issues
        },
        { status: 400 }
      );
    }
    
    const bookingData = validation.data;
    
    // Validações específicas de negócio
    
    // Verificar se cartão é obrigatório para pagamento com cartão
    if (bookingData.payment.method === 'credit_card' && !bookingData.payment.card) {
      return NextResponse.json(
        { error: 'Dados do cartão são obrigatórios para pagamento com cartão' },
        { status: 400 }
      );
    }
    
    // Verificar se pelo menos um adulto por quarto
    for (const room of bookingData.rooms) {
      const adults = room.guests.filter(guest => {
        if (!guest.date_of_birth) return true; // Assume adulto se não informado
        const age = calculateAge(guest.date_of_birth);
        return age >= 18;
      });
      
      if (adults.length === 0) {
        return NextResponse.json(
          { error: 'Pelo menos um adulto é obrigatório por quarto' },
          { status: 400 }
        );
      }
    }
    
    // Sanitizar dados do cartão para log (se aplicável)
    const logData = {
      ...bookingData,
      payment: {
        ...bookingData.payment,
        card: bookingData.payment.card ? {
          ...bookingData.payment.card,
          number: `****${bookingData.payment.card.number.slice(-4)}`,
          cvv: '***'
        } : undefined
      }
    };
    
    console.log('Iniciando reserva:', JSON.stringify(logData, null, 2));
    
    // Fazer reserva via LiteAPI (prebook first, then confirm)
    const client = liteApiClient;
    
    // First, prebook the hotel to get prebookId
    const prebookResult = await client.prebookHotel(bookingData.rate_id);
    if (!prebookResult || !prebookResult.data) {
      throw new Error('Failed to prebook hotel');
    }
    
    // Then confirm the booking
    const confirmData = {
      guests: bookingData.rooms[0].guests.map(guest => ({
        title: guest.title,
        firstName: guest.first_name,
        lastName: guest.last_name,
        isMainGuest: guest === bookingData.rooms[0].guests[0]
      })),
      contact: {
        email: bookingData.rooms[0].guests[0].email || '',
        phone: bookingData.rooms[0].guests[0].phone || ''
      },
      specialRequests: bookingData.rooms[0].special_requests
    };
    
    const bookingResult = await client.confirmBooking(prebookResult.data.prebook_id, confirmData);
    
    // Enriquecer resultado da reserva
    const enrichedBooking = {
      ...bookingResult.data,
      
      // Adicionar informações calculadas
      booking_summary: generateBookingSummary(bookingResult.data),
      
      // Status timeline
      status_timeline: generateStatusTimeline(bookingResult.data),
      
      // Próximas ações
      next_actions: generateNextActions(bookingResult.data),
      
      // Informações para o hóspede
      guest_instructions: generateGuestInstructions(bookingResult.data),
      
      // Metadados
      metadata: {
        booking_source: 'fly2any',
        created_via: 'api',
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      }
    };
    
    // Log de sucesso (sem dados sensíveis)
    console.log(`Reserva criada com sucesso: ${enrichedBooking.booking_id}`);
    
    return NextResponse.json({
      success: true,
      data: enrichedBooking,
      metadata: {
        booking_id: enrichedBooking.booking_id,
        confirmation_number: enrichedBooking.confirmation_number,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error: any) {
    console.error('Erro ao criar reserva:', error);
    
    // Tratamento específico de erros
    if (error.message?.includes('Rate no longer available')) {
      return NextResponse.json(
        { error: 'Esta tarifa não está mais disponível. Por favor, faça uma nova busca.' },
        { status: 409 }
      );
    }
    
    if (error.message?.includes('Payment declined')) {
      return NextResponse.json(
        { error: 'Pagamento recusado. Verifique os dados do cartão.' },
        { status: 402 }
      );
    }
    
    if (error.message?.includes('Invalid guest data')) {
      return NextResponse.json(
        { error: 'Dados dos hóspedes inválidos. Verifique as informações fornecidas.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Erro ao processar reserva',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Buscar detalhes de uma reserva
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('booking_id');
    
    if (!bookingId) {
      return NextResponse.json(
        { error: 'ID da reserva é obrigatório' },
        { status: 400 }
      );
    }
    
    const validation = bookingQuerySchema.safeParse({ booking_id: bookingId });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'ID da reserva inválido' },
        { status: 400 }
      );
    }
    
    const client = liteApiClient;
    const bookingDetails = await client.getBooking(bookingId);
    
    // Enriquecer detalhes da reserva
    const enrichedDetails = {
      ...bookingDetails,
      
      // Status atual detalhado
      status_details: getStatusDetails(bookingDetails.data?.status || 'unknown'),
      
      // Tempo restante para ações
      time_sensitive_actions: getTimeSensitiveActions(bookingDetails),
      
      // Informações úteis
      helpful_info: getHelpfulInfo(bookingDetails),
      
      // Modificações disponíveis
      available_modifications: getAvailableModifications(bookingDetails)
    };
    
    return NextResponse.json({
      success: true,
      data: enrichedDetails,
      metadata: {
        booking_id: bookingId,
        last_updated: new Date().toISOString()
      }
    });
    
  } catch (error: any) {
    console.error('Erro ao buscar detalhes da reserva:', error);
    
    if (error.message?.includes('HTTP 404')) {
      return NextResponse.json(
        { error: 'Reserva não encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Erro ao buscar detalhes da reserva',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Cancelar reserva
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validation = cancellationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Dados de cancelamento inválidos',
          details: validation.error.issues
        },
        { status: 400 }
      );
    }
    
    const { booking_id, reason } = validation.data;
    
    const client = liteApiClient;
    const cancellationResult = await client.cancelBooking(booking_id, reason);
    
    return NextResponse.json({
      success: true,
      data: cancellationResult,
      metadata: {
        booking_id,
        cancelled_at: new Date().toISOString(),
        reason: reason || 'Não especificado'
      }
    });
    
  } catch (error: any) {
    console.error('Erro ao cancelar reserva:', error);
    
    if (error.message?.includes('Cannot cancel')) {
      return NextResponse.json(
        { error: 'Esta reserva não pode ser cancelada. Verifique a política de cancelamento.' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Erro ao cancelar reserva',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// ============ FUNÇÕES AUXILIARES ============

function calculateAge(dateOfBirth: string): number {
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

function generateBookingSummary(booking: any) {
  const checkinDate = new Date(booking.checkin);
  const checkoutDate = new Date(booking.checkout);
  
  return {
    hotel_name: booking.hotel?.name,
    dates: {
      checkin: checkinDate.toLocaleDateString('pt-BR'),
      checkout: checkoutDate.toLocaleDateString('pt-BR'),
      nights: booking.nights
    },
    guests: {
      total: booking.rooms?.reduce((sum: number, room: any) => sum + room.guests.length, 0),
      rooms: booking.rooms?.length
    },
    total_amount_formatted: new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: booking.currency
    }).format(booking.total_amount)
  };
}

function generateStatusTimeline(booking: any) {
  const timeline = [
    {
      status: 'created',
      timestamp: booking.created_at,
      description: 'Reserva criada',
      completed: true
    }
  ];
  
  if (booking.status === 'confirmed') {
    timeline.push({
      status: 'confirmed',
      timestamp: booking.created_at,
      description: 'Reserva confirmada',
      completed: true
    });
  }
  
  // Adicionar eventos futuros
  const checkinDate = new Date(booking.checkin);
  const checkoutDate = new Date(booking.checkout);
  
  timeline.push({
    status: 'checkin',
    timestamp: checkinDate.toISOString(),
    description: 'Check-in',
    completed: false
  });
  
  timeline.push({
    status: 'checkout',
    timestamp: checkoutDate.toISOString(),
    description: 'Check-out',
    completed: false
  });
  
  return timeline;
}

function generateNextActions(booking: any) {
  const actions = [];
  const now = new Date();
  const checkinDate = new Date(booking.checkin);
  const daysUntilCheckin = Math.ceil((checkinDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilCheckin > 7) {
    actions.push({
      action: 'review_booking',
      priority: 'low',
      description: 'Revisar detalhes da reserva',
      deadline: null
    });
  } else if (daysUntilCheckin > 1) {
    actions.push({
      action: 'prepare_travel',
      priority: 'medium',
      description: 'Preparar documentos e bagagem',
      deadline: new Date(checkinDate.getTime() - 24 * 60 * 60 * 1000).toISOString()
    });
  } else {
    actions.push({
      action: 'check_in_info',
      priority: 'high',
      description: 'Verificar informações de check-in',
      deadline: checkinDate.toISOString()
    });
  }
  
  return actions;
}

function generateGuestInstructions(booking: any) {
  return {
    checkin: {
      time: booking.hotel?.policies?.checkin?.from || '15:00',
      location: booking.hotel?.address,
      requirements: ['Documento de identidade', 'Cartão de crédito para caução'],
      contact: booking.hotel?.contact?.phone
    },
    
    checkout: {
      time: booking.hotel?.policies?.checkout?.until || '11:00',
      process: 'Entregue a chave na recepção'
    },
    
    cancellation: booking.cancellation_deadline ? {
      deadline: new Date(booking.cancellation_deadline).toLocaleDateString('pt-BR'),
      policy: 'Cancelamento gratuito até a data limite'
    } : null,
    
    important_notes: [
      'Mantenha o voucher/confirmação sempre com você',
      'Chegue no horário de check-in para evitar problemas',
      'Em caso de dúvidas, entre em contato conosco'
    ]
  };
}

function getStatusDetails(status: string) {
  const statusMap = {
    'confirmed': {
      label: 'Confirmada',
      description: 'Sua reserva foi confirmada com sucesso',
      color: 'green',
      icon: 'check-circle'
    },
    'pending': {
      label: 'Pendente',
      description: 'Aguardando confirmação do hotel',
      color: 'yellow',
      icon: 'clock'
    },
    'cancelled': {
      label: 'Cancelada',
      description: 'Esta reserva foi cancelada',
      color: 'red',
      icon: 'x-circle'
    },
    'completed': {
      label: 'Concluída',
      description: 'Estadia concluída',
      color: 'blue',
      icon: 'check'
    }
  };
  
  return statusMap[status as keyof typeof statusMap] || {
    label: 'Status desconhecido',
    description: '',
    color: 'gray',
    icon: 'help-circle'
  };
}

function getTimeSensitiveActions(booking: any) {
  const actions = [];
  const now = new Date();
  
  if (booking.cancellation_deadline) {
    const deadline = new Date(booking.cancellation_deadline);
    if (deadline > now) {
      actions.push({
        type: 'cancellation',
        deadline: deadline.toISOString(),
        description: 'Cancelamento gratuito disponível',
        urgency: deadline.getTime() - now.getTime() < 24 * 60 * 60 * 1000 ? 'high' : 'medium'
      });
    }
  }
  
  return actions;
}

function getHelpfulInfo(booking: any) {
  return {
    weather: `Verifique a previsão do tempo para ${booking.hotel?.city}`,
    transport: 'Organize transporte do aeroporto para o hotel',
    local_info: 'Pesquise atrações e restaurantes próximos',
    documents: 'Verifique se documentos estão válidos'
  };
}

function getAvailableModifications(booking: any) {
  const modifications = [];
  
  if (booking.status === 'confirmed') {
    modifications.push('cancel');
    
    // Verificar se pode modificar datas
    const checkinDate = new Date(booking.checkin);
    const now = new Date();
    
    if (checkinDate.getTime() - now.getTime() > 7 * 24 * 60 * 60 * 1000) {
      modifications.push('modify_dates');
    }
  }
  
  return modifications;
}