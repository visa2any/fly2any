/**
 * Hotel Vouchers API Endpoint
 * GET/POST /api/hotels/vouchers
 * 
 * Manages vouchers and promotional codes based on LiteAPI structure
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Voucher creation schema
const createVoucherSchema = z.object({
  code: z.string().min(3).max(20),
  type: z.enum(['percentage', 'fixed', 'nights']),
  value: z.number().positive(),
  description: z.string().min(5),
  validFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  validUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  maxUses: z.number().positive().optional(),
  minBookingValue: z.number().positive().optional(),
  applicableHotels: z.array(z.string()).optional(),
  applicableDestinations: z.array(z.string()).optional(),
  guestTierRequired: z.enum(['Bronze', 'Silver', 'Gold', 'Platinum']).optional()
});

// Generate mock voucher data
function generateVoucherData() {
  return [
    {
      id: 'voucher-001',
      code: 'SUMMER2024',
      type: 'percentage',
      value: 15,
      description: 'Desconto de 15% para reservas de verão',
      status: 'active',
      createdAt: '2024-06-01',
      validFrom: '2024-06-01',
      validUntil: '2024-09-30',
      maxUses: 1000,
      currentUses: 247,
      minBookingValue: 500,
      currency: 'BRL',
      applicableHotels: ['real-hotel-1', 'real-hotel-2'],
      applicableDestinations: ['Rio de Janeiro', 'São Paulo'],
      guestTierRequired: null,
      restrictions: {
        minimumNights: 2,
        blackoutDates: ['2024-07-15', '2024-08-15'],
        weekendOnly: false,
        firstTimeOnly: false
      },
      usage: {
        totalRedemptions: 247,
        totalDiscount: 18750.50,
        averageBookingValue: 850.25,
        topDestinations: [
          { destination: 'Rio de Janeiro', uses: 145 },
          { destination: 'São Paulo', uses: 102 }
        ]
      }
    },
    {
      id: 'voucher-002',
      code: 'GOLD50',
      type: 'fixed',
      value: 50,
      description: 'R$ 50 de desconto para membros Gold+',
      status: 'active',
      createdAt: '2024-05-15',
      validFrom: '2024-05-15',
      validUntil: '2024-12-31',
      maxUses: 500,
      currentUses: 89,
      minBookingValue: 300,
      currency: 'BRL',
      applicableHotels: null, // All hotels
      applicableDestinations: null, // All destinations
      guestTierRequired: 'Gold',
      restrictions: {
        minimumNights: 1,
        blackoutDates: [],
        weekendOnly: false,
        firstTimeOnly: false
      },
      usage: {
        totalRedemptions: 89,
        totalDiscount: 4450.00,
        averageBookingValue: 675.30,
        topDestinations: [
          { destination: 'Salvador', uses: 34 },
          { destination: 'Fortaleza', uses: 28 },
          { destination: 'Fernando de Noronha', uses: 27 }
        ]
      }
    },
    {
      id: 'voucher-003',
      code: 'WELCOME10',
      type: 'percentage',
      value: 10,
      description: 'Desconto de boas-vindas para novos clientes',
      status: 'active',
      createdAt: '2024-01-01',
      validFrom: '2024-01-01',
      validUntil: '2024-12-31',
      maxUses: 2000,
      currentUses: 1456,
      minBookingValue: 200,
      currency: 'BRL',
      applicableHotels: null,
      applicableDestinations: null,
      guestTierRequired: null,
      restrictions: {
        minimumNights: 1,
        blackoutDates: [],
        weekendOnly: false,
        firstTimeOnly: true
      },
      usage: {
        totalRedemptions: 1456,
        totalDiscount: 32180.75,
        averageBookingValue: 420.15,
        topDestinations: [
          { destination: 'São Paulo', uses: 412 },
          { destination: 'Rio de Janeiro', uses: 389 },
          { destination: 'Salvador', uses: 267 },
          { destination: 'Fortaleza', uses: 234 },
          { destination: 'Fernando de Noronha', uses: 154 }
        ]
      }
    },
    {
      id: 'voucher-004',
      code: 'WEEKEND20',
      type: 'percentage',
      value: 20,
      description: 'Desconto especial para finais de semana',
      status: 'paused',
      createdAt: '2024-03-01',
      validFrom: '2024-03-01',
      validUntil: '2024-11-30',
      maxUses: 800,
      currentUses: 345,
      minBookingValue: 400,
      currency: 'BRL',
      applicableHotels: ['real-hotel-3', 'real-hotel-4', 'real-hotel-5'],
      applicableDestinations: null,
      guestTierRequired: null,
      restrictions: {
        minimumNights: 2,
        blackoutDates: ['2024-07-01', '2024-09-07'],
        weekendOnly: true,
        firstTimeOnly: false
      },
      usage: {
        totalRedemptions: 345,
        totalDiscount: 28750.25,
        averageBookingValue: 718.85,
        topDestinations: [
          { destination: 'Fernando de Noronha', uses: 156 },
          { destination: 'Salvador', uses: 98 },
          { destination: 'São Paulo', uses: 91 }
        ]
      }
    },
    {
      id: 'voucher-005',
      code: 'NIGHTS3',
      type: 'nights',
      value: 1,
      description: 'Pague 3 noites, durma 4',
      status: 'expired',
      createdAt: '2024-02-01',
      validFrom: '2024-02-01',
      validUntil: '2024-05-31',
      maxUses: 300,
      currentUses: 178,
      minBookingValue: 800,
      currency: 'BRL',
      applicableHotels: ['real-hotel-1', 'real-hotel-6'],
      applicableDestinations: ['Rio de Janeiro'],
      guestTierRequired: 'Silver',
      restrictions: {
        minimumNights: 3,
        blackoutDates: ['2024-04-21', '2024-05-01'],
        weekendOnly: false,
        firstTimeOnly: false
      },
      usage: {
        totalRedemptions: 178,
        totalDiscount: 45670.50,
        averageBookingValue: 1285.45,
        topDestinations: [
          { destination: 'Rio de Janeiro', uses: 178 }
        ]
      }
    }
  ];
}

// Validate voucher code
function validateVoucher(voucher: any, bookingValue: number, destination?: string, guestTier?: string): {
  valid: boolean;
  reason?: string;
  discount?: number;
} {
  const now = new Date();
  const validFrom = new Date(voucher.validFrom);
  const validUntil = new Date(voucher.validUntil);
  
  // Check status
  if (voucher.status !== 'active') {
    return { valid: false, reason: 'Voucher não está ativo' };
  }
  
  // Check date range
  if (now < validFrom || now > validUntil) {
    return { valid: false, reason: 'Voucher fora do período de validade' };
  }
  
  // Check usage limit
  if (voucher.maxUses && voucher.currentUses >= voucher.maxUses) {
    return { valid: false, reason: 'Limite de uso do voucher atingido' };
  }
  
  // Check minimum booking value
  if (voucher.minBookingValue && bookingValue < voucher.minBookingValue) {
    return { valid: false, reason: `Valor mínimo da reserva: R$ ${voucher.minBookingValue}` };
  }
  
  // Check destination restriction
  if (voucher.applicableDestinations && destination && 
      !voucher.applicableDestinations.includes(destination)) {
    return { valid: false, reason: 'Voucher não aplicável para este destino' };
  }
  
  // Check guest tier requirement
  if (voucher.guestTierRequired && (!guestTier || 
      ['Bronze', 'Silver', 'Gold', 'Platinum'].indexOf(guestTier) < 
      ['Bronze', 'Silver', 'Gold', 'Platinum'].indexOf(voucher.guestTierRequired))) {
    return { valid: false, reason: `Requer nível ${voucher.guestTierRequired} ou superior` };
  }
  
  // Calculate discount
  let discount = 0;
  if (voucher.type === 'percentage') {
    discount = (bookingValue * voucher.value) / 100;
  } else if (voucher.type === 'fixed') {
    discount = voucher.value;
  } else if (voucher.type === 'nights') {
    // For nights type, discount is calculated as free nights value
    discount = (bookingValue / (voucher.restrictions.minimumNights + voucher.value)) * voucher.value;
  }
  
  return { valid: true, discount: Math.round(discount * 100) / 100 };
}

/**
 * GET /api/hotels/vouchers
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');
    const search = url.searchParams.get('search');
    const validate = url.searchParams.get('validate');
    const bookingValue = parseFloat(url.searchParams.get('bookingValue') || '0');
    const destination = url.searchParams.get('destination');
    const guestTier = url.searchParams.get('guestTier');
    
    let vouchers = generateVoucherData();
    
    // If validating a specific voucher
    if (validate) {
      const voucher = vouchers.find(v => v.code === validate.toUpperCase());
      if (!voucher) {
        return NextResponse.json({
          status: 'error',
          message: 'Voucher não encontrado',
          data: null
        }, { status: 404 });
      }
      
      const validation = validateVoucher(voucher, bookingValue, destination || undefined, guestTier || undefined);
      
      return NextResponse.json({
        status: 'success',
        data: {
          voucher,
          validation
        }
      });
    }
    
    // Filter vouchers
    if (status) {
      vouchers = vouchers.filter(v => v.status === status);
    }
    
    if (type) {
      vouchers = vouchers.filter(v => v.type === type);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      vouchers = vouchers.filter(v => 
        v.code.toLowerCase().includes(searchLower) ||
        v.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Calculate summary statistics
    const allVouchers = generateVoucherData();
    const summary = {
      totalVouchers: allVouchers.length,
      activeVouchers: allVouchers.filter(v => v.status === 'active').length,
      totalRedemptions: allVouchers.reduce((sum, v) => sum + v.usage.totalRedemptions, 0),
      totalDiscountGiven: allVouchers.reduce((sum, v) => sum + v.usage.totalDiscount, 0),
      typeDistribution: {
        percentage: allVouchers.filter(v => v.type === 'percentage').length,
        fixed: allVouchers.filter(v => v.type === 'fixed').length,
        nights: allVouchers.filter(v => v.type === 'nights').length
      }
    };

    return NextResponse.json({
      status: 'success',
      data: {
        vouchers,
        summary
      },
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'LiteAPI-compatible'
      }
    });

  } catch (error) {
    console.error('Vouchers GET error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Failed to fetch vouchers',
      data: null
    }, { status: 500 });
  }
}

/**
 * POST /api/hotels/vouchers
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    // Validate request data
    const validatedData = createVoucherSchema.parse(body);
    
    // Check if voucher code already exists
    const existingVouchers = generateVoucherData();
    if (existingVouchers.some(v => v.code === validatedData.code.toUpperCase())) {
      return NextResponse.json({
        status: 'error',
        message: 'Código do voucher já existe',
        data: null
      }, { status: 409 });
    }
    
    // Create new voucher
    const newVoucher = {
      id: `voucher-${Date.now()}`,
      ...validatedData,
      code: validatedData.code.toUpperCase(),
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      currentUses: 0,
      currency: 'BRL',
      restrictions: {
        minimumNights: 1,
        blackoutDates: [],
        weekendOnly: false,
        firstTimeOnly: false
      },
      usage: {
        totalRedemptions: 0,
        totalDiscount: 0,
        averageBookingValue: 0,
        topDestinations: []
      }
    };

    return NextResponse.json({
      status: 'success',
      data: {
        voucher: newVoucher,
        message: 'Voucher criado com sucesso'
      },
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'LiteAPI-compatible'
      }
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        status: 'error',
        message: 'Dados inválidos',
        errors: error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      }, { status: 400 });
    }
    
    console.error('Vouchers POST error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Failed to create voucher',
      data: null
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';