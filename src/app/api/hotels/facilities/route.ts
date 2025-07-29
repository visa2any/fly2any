/**
 * Hotel Facilities API Endpoint
 * GET /api/hotels/facilities
 * 
 * Returns available hotel facilities based on LiteAPI structure
 */

import { NextRequest, NextResponse } from 'next/server';

// Hotel facilities based on LiteAPI documentation
const hotelFacilities = [
  {
    id: 'wifi',
    name: 'Wi-Fi Gratuito',
    category: 'connectivity',
    icon: 'wifi',
    description: 'Internet sem fio gratuita em todo o hotel'
  },
  {
    id: 'pool',
    name: 'Piscina',
    category: 'recreation',
    icon: 'waves',
    description: 'Piscina para relaxamento e lazer'
  },
  {
    id: 'spa',
    name: 'Spa',
    category: 'wellness',
    icon: 'heart',
    description: 'Serviços de spa e bem-estar'
  },
  {
    id: 'gym',
    name: 'Academia',
    category: 'fitness',
    icon: 'dumbbell',
    description: 'Centro de fitness equipado'
  },
  {
    id: 'restaurant',
    name: 'Restaurante',
    category: 'dining',
    icon: 'utensils',
    description: 'Opções gastronômicas no local'
  },
  {
    id: 'parking',
    name: 'Estacionamento',
    category: 'transport',
    icon: 'car',
    description: 'Estacionamento disponível'
  },
  {
    id: 'pet_friendly',
    name: 'Pet Friendly',
    category: 'services',
    icon: 'heart',
    description: 'Aceita animais de estimação'
  },
  {
    id: 'business_center',
    name: 'Centro de Negócios',
    category: 'business',
    icon: 'briefcase',
    description: 'Instalações para negócios'
  },
  {
    id: 'laundry',
    name: 'Lavanderia',
    category: 'services',
    icon: 'shirt',
    description: 'Serviços de lavanderia'
  },
  {
    id: 'room_service',
    name: 'Serviço de Quarto',
    category: 'services',
    icon: 'room-service',
    description: 'Serviço de quarto 24h'
  }
];

/**
 * GET /api/hotels/facilities
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    
    let filteredFacilities = hotelFacilities;
    
    if (category) {
      filteredFacilities = hotelFacilities.filter(facility => 
        facility.category === category
      );
    }

    return NextResponse.json({
      status: 'success',
      data: {
        facilities: filteredFacilities,
        totalCount: filteredFacilities.length,
        categories: [...new Set(hotelFacilities.map(f => f.category))]
      },
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'LiteAPI-compatible'
      }
    });

  } catch (error) {
    console.error('Hotel facilities error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Failed to fetch hotel facilities',
      data: null
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';