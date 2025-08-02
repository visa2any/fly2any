/**
 * Demo Hotel Data
 * Dados centralizados para hotéis de demonstração
 */

import type { Hotel } from '@/types/hotels';

export const demoHotels: Record<string, Hotel> = {
  'demo-1': {
    id: 'demo-1',
    name: 'Hotel Copacabana Palace',
    description: 'Luxuoso hotel à beira da praia de Copacabana com vista deslumbrante para o mar. Um ícone da hospitalidade carioca desde 1923, oferecendo elegância atemporal e serviços excepcionais.',
    starRating: 5,
    guestRating: 9.2,
    reviewCount: 1547,
    location: {
      address: {
        street: 'Avenida Atlântica, 1702',
        city: 'Rio de Janeiro',
        state: 'RJ',
        country: 'Brasil',
        postal_code: '22021-001'
      },
      coordinates: { latitude: -22.9681, longitude: -43.1802 },
      landmarks: [
        { name: 'Praia de Copacabana', distance: 0, unit: 'km', type: 'beach' },
        { name: 'Cristo Redentor', distance: 8.5, unit: 'km', type: 'attraction' },
        { name: 'Pão de Açúcar', distance: 3.2, unit: 'km', type: 'attraction' },
        { name: 'Aeroporto Santos Dumont', distance: 7.8, unit: 'km', type: 'airport' }
      ]
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', description: 'Vista da fachada do hotel', isMain: true },
      { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', description: 'Suite presidencial' },
      { url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800', description: 'Piscina' }
    ],
    amenities: [
      { id: 'wifi', name: 'Wi-Fi Gratuito', category: 'connectivity', isFree: true },
      { id: 'pool', name: 'Piscina', category: 'recreation', isFree: true },
      { id: 'spa', name: 'Spa', category: 'services', isFree: false },
      { id: 'restaurant', name: 'Restaurante', category: 'food', isFree: false },
      { id: 'gym', name: 'Academia', category: 'recreation', isFree: true }
    ],
    lowestRate: { amount: 850, currency: 'BRL', formatted: 'R$ 850,00' },
    rates: [
      {
        id: 'rate-1',
        rateId: 'standard-1',
        roomType: {
          id: 'standard',
          name: 'Quarto Standard',
          description: 'Quarto confortável com vista para a cidade',
          maxOccupancy: 2,
          amenities: ['Wi-Fi Grátis', 'Ar Condicionado', 'TV LED', 'Minibar']
        },
        boardType: 'breakfast', // LiteAPI format: BB = Bed & Breakfast
        boardName: 'Café da manhã incluído',
        price: { amount: 850, currency: 'BRL', formatted: 'R$ 850,00' },
        totalPrice: { amount: 850, currency: 'BRL', formatted: 'R$ 850,00' },
        retailRate: 850,
        suggestedSellingPrice: 950,
        currency: 'BRL',
        isRefundable: true,
        isFreeCancellation: true,
        refundableTag: 'RFN', // LiteAPI format
        maxOccupancy: 2,
        adultCount: 2,
        childCount: 0,
        availableRooms: 3,
        occupancyNumber: 1,
        supplier: 'LiteAPI Direct',
        taxes: [
          {
            name: 'Taxa de Serviço',
            description: 'Taxa de serviço',
            amount: 50,
            currency: 'BRL'
          },
          {
            name: 'Taxa de Turismo',
            description: 'Taxa de turismo',
            amount: 15,
            currency: 'BRL'
          }
        ],
        fees: [
          {
            description: 'Taxa de resort',
            amount: 25
          }
        ],
        cancelPolicyInfos: [
          {
            cancelTime: '2024-07-28T23:59:59',
            amount: 0,
            description: 'Cancelamento gratuito até 24h antes do check-in'
          }
        ],
        paymentOptions: [{ type: 'pay_now', description: 'Pagamento no ato' }]
      },
      {
        id: 'rate-1b',
        rateId: 'superior-1',
        roomType: {
          id: 'superior',
          name: 'Quarto Superior Vista Mar',
          description: 'Quarto espaçoso com vista deslumbrante para o mar',
          maxOccupancy: 3,
          amenities: ['Wi-Fi Grátis', 'Ar Condicionado', 'TV LED', 'Minibar', 'Varanda', 'Roupão']
        },
        boardType: 'breakfast',
        boardName: 'Café da manhã incluído',
        price: { amount: 1250, currency: 'BRL', formatted: 'R$ 1.250,00' },
        totalPrice: { amount: 1250, currency: 'BRL', formatted: 'R$ 1.250,00' },
        retailRate: 1250,
        suggestedSellingPrice: 1400,
        currency: 'BRL',
        isRefundable: true,
        isFreeCancellation: true,
        refundableTag: 'RFN',
        maxOccupancy: 3,
        adultCount: 2,
        childCount: 1,
        availableRooms: 2,
        occupancyNumber: 2,
        supplier: 'LiteAPI Direct',
        taxes: [
          {
            name: 'Taxa de Serviço',
            description: 'Taxa de serviço',
            amount: 75,
            currency: 'BRL'
          }
        ],
        fees: [
          {
            description: 'Taxa de resort',
            amount: 35
          }
        ],
        cancelPolicyInfos: [
          {
            cancelTime: '2024-07-28T23:59:59',
            amount: 0,
            description: 'Cancelamento gratuito até 24h antes do check-in'
          }
        ],
        paymentOptions: [{ type: 'pay_now', description: 'Pagamento no ato' }]
      },
      {
        id: 'rate-1c',
        rateId: 'presidential-1',
        roomType: {
          id: 'presidential',
          name: 'Suíte Presidencial',
          description: 'Suíte luxuosa com vista panorâmica e serviços exclusivos',
          maxOccupancy: 4,
          amenities: ['Wi-Fi Grátis', 'Ar Condicionado', 'TV LED', 'Minibar', 'Varanda', 'Roupão', 'Jacuzzi', 'Mordomo', 'Sala de Estar']
        },
        boardType: 'all_inclusive', // All Inclusive
        boardName: 'Tudo incluído',
        price: { amount: 3500, currency: 'BRL', formatted: 'R$ 3.500,00' },
        originalPrice: { amount: 4200, currency: 'BRL', formatted: 'R$ 4.200,00' },
        discountPercentage: 17,
        totalPrice: { amount: 3500, currency: 'BRL', formatted: 'R$ 3.500,00' },
        retailRate: 3500,
        suggestedSellingPrice: 4200,
        currency: 'BRL',
        isRefundable: false,
        isFreeCancellation: false,
        refundableTag: 'NRFN', // Non-refundable
        maxOccupancy: 4,
        adultCount: 4,
        childCount: 0,
        availableRooms: 1,
        occupancyNumber: 3,
        supplier: 'LiteAPI Premium',
        taxes: [
          {
            name: 'Taxa de Serviço Premium',
            description: 'Taxa de serviço premium',
            amount: 200,
            currency: 'BRL'
          },
          {
            name: 'Taxa de Turismo',
            description: 'Taxa de turismo',
            amount: 30,
            currency: 'BRL'
          }
        ],
        fees: [
          {
            description: 'Taxa de resort premium',
            amount: 150
          }
        ],
        cancelPolicyInfos: [
          {
            cancelTime: '2024-07-25T23:59:59',
            amount: 1750, // 50% do valor
            description: 'Cancelamento até 72h: perda de 50%'
          },
          {
            cancelTime: '2024-07-28T23:59:59',
            amount: 3500, // 100% do valor
            description: 'Cancelamento após 72h: não reembolsável'
          }
        ],
        paymentOptions: [{ type: 'pay_now', description: 'Pagamento no ato' }]
      }
    ],
    chainName: 'Belmond',
    sustainability: { level: 4, certifications: ['Green Key'] },
    policies: { checkIn: '15:00', checkOut: '11:00' },
    contact: {
      phone: '+55 21 2548-7070',
      email: 'reservas@copacabanapalace.com.br',
      website: 'https://www.belmond.com/hotels/south-america/brazil/rio-de-janeiro/belmond-copacabana-palace'
    },
    highlights: [
      'Vista para a praia de Copacabana',
      'Piscina olimpica histórica',
      'Restaurante Michelin',
      'Spa de classe mundial',
      'Localização privilegiada'
    ]
  },

  'demo-2': {
    id: 'demo-2',
    name: 'Hotel Fasano São Paulo',
    description: 'Hotel boutique no coração de São Paulo com design sofisticado e serviços personalizados.',
    starRating: 5,
    guestRating: 9.0,
    reviewCount: 892,
    location: {
      address: {
        street: 'Rua Vitório Fasano, 88',
        city: 'São Paulo',
        state: 'SP',
        country: 'Brasil',
        postal_code: '01414-020'
      },
      coordinates: { latitude: -23.5618, longitude: -46.6565 },
      landmarks: [
        { name: 'Shopping Cidade Jardim', distance: 500, unit: 'km', type: 'attraction' },
        { name: 'Parque Ibirapuera', distance: 2.5, unit: 'km', type: 'attraction' },
        { name: 'Aeroporto Congonhas', distance: 8, unit: 'km', type: 'airport' }
      ]
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800', description: 'Lobby elegante do hotel', isMain: true }
    ],
    amenities: [
      { id: 'wifi', name: 'Wi-Fi Gratuito', category: 'connectivity', isFree: true },
      { id: 'restaurant', name: 'Restaurante', category: 'food', isFree: false },
      { id: 'gym', name: 'Academia', category: 'recreation', isFree: true },
      { id: 'business', name: 'Centro de Negócios', category: 'business', isFree: true }
    ],
    lowestRate: { amount: 980, currency: 'BRL', formatted: 'R$ 980,00' },
    rates: [
      {
        id: 'rate-2a',
        rateId: 'standard-2',
        roomType: {
          id: 'standard',
          name: 'Quarto Standard Executivo',
          description: 'Quarto moderno com design elegante e localização privilegiada',
          maxOccupancy: 2,
          amenities: ['Wi-Fi Grátis', 'Ar Condicionado', 'TV Smart', 'Cofre', 'Nespresso']
        },
        boardType: 'room_only',
        price: { amount: 980, currency: 'BRL', formatted: 'R$ 980,00' },
        totalPrice: { amount: 980, currency: 'BRL', formatted: 'R$ 980,00' },
        currency: 'BRL',
        isRefundable: true,
        isFreeCancellation: true,
        maxOccupancy: 2,
        availableRooms: 4,
        taxes: [],
        paymentOptions: [{ type: 'pay_now', description: 'Pagamento no ato' }]
      }
    ],
    chainName: 'Fasano',
    policies: { checkIn: '15:00', checkOut: '12:00' }
  },

  'demo-3': {
    id: 'demo-3',
    name: 'Emiliano Rio',
    description: 'Hotel moderno em Copacabana com design contemporâneo e vista para o mar.',
    starRating: 5,
    guestRating: 8.8,
    reviewCount: 1205,
    location: {
      address: {
        street: 'Avenida Atlântica, 3804',
        city: 'Rio de Janeiro',
        state: 'RJ',
        country: 'Brasil',
        postal_code: '22070-001'
      },
      coordinates: { latitude: -22.9794, longitude: -43.1886 },
      landmarks: [
        { name: 'Praia de Copacabana', distance: 0, unit: 'km', type: 'beach' },
        { name: 'Fort de Copacabana', distance: 800, unit: 'km', type: 'attraction' }
      ]
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', description: 'Suite com vista para o mar', isMain: true }
    ],
    amenities: [
      { id: 'wifi', name: 'Wi-Fi Gratuito', category: 'connectivity', isFree: true },
      { id: 'pool', name: 'Piscina na Cobertura', category: 'recreation', isFree: true },
      { id: 'spa', name: 'Spa', category: 'services', isFree: false },
      { id: 'restaurant', name: 'Restaurante Gourmet', category: 'food', isFree: false }
    ],
    lowestRate: { amount: 980, currency: 'BRL', formatted: 'R$ 980,00' },
    rates: [
      {
        id: 'rate-3',
        rateId: 'superior-1',
        roomType: {
          id: 'superior',
          name: 'Quarto Superior',
          description: 'Quarto com vista parcial para o mar',
          maxOccupancy: 2,
          amenities: ['Wi-Fi Grátis', 'Ar Condicionado', 'TV LED', 'Minibar', 'Vista Mar']
        },
        boardType: 'breakfast',
        price: { amount: 980, currency: 'BRL', formatted: 'R$ 980,00' },
        totalPrice: { amount: 980, currency: 'BRL', formatted: 'R$ 980,00' },
        currency: 'BRL',
        isRefundable: true,
        isFreeCancellation: true,
        maxOccupancy: 2,
        availableRooms: 2,
        discountPercentage: 15,
        taxes: [],
        paymentOptions: [{ type: 'pay_now', description: 'Pagamento no ato' }]
      }
    ],
    chainName: 'Emiliano',
    policies: { checkIn: '15:00', checkOut: '11:00' }
  },

  'demo-4': {
    id: 'demo-4',
    name: 'Grand Hyatt São Paulo',
    description: 'Hotel internacional no centro financeiro de São Paulo com padrão internacional de excelência.',
    starRating: 5,
    guestRating: 8.6,
    reviewCount: 2103,
    location: {
      address: {
        street: 'Avenida das Nações Unidas, 13301',
        city: 'São Paulo',
        state: 'SP',
        country: 'Brasil',
        postal_code: '04578-000'
      },
      coordinates: { latitude: -23.6284, longitude: -46.7138 },
      landmarks: [
        { name: 'Shopping Vila Olímpia', distance: 800, unit: 'km', type: 'attraction' },
        { name: 'Centro Empresarial', distance: 200, unit: 'km', type: 'city_center' },
        { name: 'Aeroporto Congonhas', distance: 12, unit: 'km', type: 'airport' }
      ]
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', description: 'Quarto executivo', isMain: true }
    ],
    amenities: [
      { id: 'wifi', name: 'Wi-Fi Gratuito', category: 'connectivity', isFree: true },
      { id: 'gym', name: 'Academia 24h', category: 'recreation', isFree: true },
      { id: 'business', name: 'Centro de Convenções', category: 'business', isFree: false },
      { id: 'parking', name: 'Estacionamento', category: 'transportation', isFree: false }
    ],
    lowestRate: { amount: 650, currency: 'BRL', formatted: 'R$ 650,00' },
    rates: [
      {
        id: 'rate-4',
        rateId: 'business-1',
        roomType: {
          id: 'business',
          name: 'Quarto Executivo',
          description: 'Quarto com acesso ao lounge executivo',
          maxOccupancy: 2,
          amenities: ['Wi-Fi Grátis', 'Ar Condicionado', 'TV Smart', 'Cofre', 'Lounge Executivo']
        },
        boardType: 'room_only',
        price: { amount: 650, currency: 'BRL', formatted: 'R$ 650,00' },
        totalPrice: { amount: 650, currency: 'BRL', formatted: 'R$ 650,00' },
        currency: 'BRL',
        isRefundable: true,
        isFreeCancellation: true,
        maxOccupancy: 2,
        availableRooms: 8,
        taxes: [],
        paymentOptions: [{ type: 'pay_now', description: 'Pagamento no ato' }]
      }
    ],
    chainName: 'Hyatt',
    policies: { checkIn: '15:00', checkOut: '12:00' }
  },

  'demo-5': {
    id: 'demo-5',
    name: 'Pousada Maravilha',
    description: 'Pousada charmosa em Fernando de Noronha com vista paradisíaca e experiência única.',
    starRating: 4,
    guestRating: 9.4,
    reviewCount: 578,
    location: {
      address: {
        street: 'Estrada da Sueste, s/n',
        city: 'Fernando de Noronha',
        state: 'PE',
        country: 'Brasil',
        postal_code: '53990-000'
      },
      coordinates: { latitude: -3.8536, longitude: -32.4297 },
      landmarks: [
        { name: 'Praia do Sancho', distance: 2, unit: 'km', type: 'beach' },
        { name: 'Mirante dos Golfinhos', distance: 1.5, unit: 'km', type: 'attraction' }
      ]
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', description: 'Vista do mar da varanda', isMain: true }
    ],
    amenities: [
      { id: 'wifi', name: 'Wi-Fi Gratuito', category: 'connectivity', isFree: true },
      { id: 'pool', name: 'Piscina Infinita', category: 'recreation', isFree: true },
      { id: 'restaurant', name: 'Restaurante Vista Mar', category: 'food', isFree: false }
    ],
    lowestRate: { amount: 1850, currency: 'BRL', formatted: 'R$ 1.850,00' },
    rates: [
      {
        id: 'rate-5',
        rateId: 'bangalo-1',
        roomType: {
          id: 'bangalo',
          name: 'Bangalô Vista Mar',
          description: 'Bangalô exclusivo com vista para o mar',
          maxOccupancy: 3,
          amenities: ['Wi-Fi Grátis', 'Ar Condicionado', 'TV LED', 'Varanda Privativa', 'Vista Mar', 'Cozinha']
        },
        boardType: 'half_board',
        price: { amount: 1850, currency: 'BRL', formatted: 'R$ 1.850,00' },
        totalPrice: { amount: 1850, currency: 'BRL', formatted: 'R$ 1.850,00' },
        currency: 'BRL',
        isRefundable: false,
        isFreeCancellation: false,
        maxOccupancy: 3,
        availableRooms: 1,
        taxes: [],
        paymentOptions: [{ type: 'pay_now', description: 'Pagamento no ato' }]
      }
    ],
    sustainability: { level: 5, certifications: ['LEED Gold', 'Green Key'] },
    policies: { checkIn: '15:00', checkOut: '11:00' }
  },

  'demo-6': {
    id: 'demo-6',
    name: 'JW Marriott Hotel Rio de Janeiro',
    description: 'Hotel de luxo em Copacabana com serviços de primeira classe e vista magnífica.',
    starRating: 5,
    guestRating: 8.9,
    reviewCount: 1876,
    location: {
      address: {
        street: 'Avenida Atlântica, 2600',
        city: 'Rio de Janeiro',
        state: 'RJ',
        country: 'Brasil',
        postal_code: '22041-001'
      },
      coordinates: { latitude: -22.9711, longitude: -43.1822 },
      landmarks: [
        { name: 'Praia de Copacabana', distance: 0, unit: 'km', type: 'beach' },
        { name: 'Estação Cardeal Arcoverde', distance: 300, unit: 'km', type: 'metro' }
      ]
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', description: 'Lobby luxuoso do hotel', isMain: true }
    ],
    amenities: [
      { id: 'wifi', name: 'Wi-Fi Gratuito', category: 'connectivity', isFree: true },
      { id: 'pool', name: 'Piscina na Cobertura', category: 'recreation', isFree: true },
      { id: 'spa', name: 'Spa Completo', category: 'services', isFree: false },
      { id: 'business', name: 'Centro de Negócios', category: 'business', isFree: true },
      { id: 'restaurant', name: 'Múltiplos Restaurantes', category: 'food', isFree: false }
    ],
    lowestRate: { amount: 780, currency: 'BRL', formatted: 'R$ 780,00' },
    rates: [
      {
        id: 'rate-6',
        rateId: 'ocean-1',
        roomType: {
          id: 'ocean',
          name: 'Quarto Vista Mar',
          description: 'Quarto com vista panorâmica para o oceano',
          maxOccupancy: 2,
          amenities: ['Wi-Fi Grátis', 'Ar Condicionado', 'TV LED', 'Minibar', 'Vista Mar', 'Varanda']
        },
        boardType: 'breakfast',
        price: { amount: 780, currency: 'BRL', formatted: 'R$ 780,00' },
        totalPrice: { amount: 780, currency: 'BRL', formatted: 'R$ 780,00' },
        currency: 'BRL',
        isRefundable: true,
        isFreeCancellation: true,
        maxOccupancy: 2,
        availableRooms: 6,
        discountPercentage: 10,
        taxes: [],
        paymentOptions: [{ type: 'pay_now', description: 'Pagamento no ato' }]
      }
    ],
    chainName: 'Marriott',
    policies: { checkIn: '15:00', checkOut: '12:00' }
  }
};

// Alias para novos IDs realistas
const realisticHotels: Record<string, Hotel> = {
  'real-hotel-1': demoHotels['demo-1'],
  'real-hotel-2': demoHotels['demo-2'], 
  'real-hotel-3': demoHotels['demo-3'],
  'real-hotel-4': demoHotels['demo-4'],
  'real-hotel-5': demoHotels['demo-5'],
  'real-hotel-6': demoHotels['demo-6']
};

export async function getMockHotelData(hotelId: string): Promise<Hotel | null> {
  // Simular delay da API
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Buscar primeiro nos dados realistas, depois nos demos
  let hotel = realisticHotels[hotelId] || demoHotels[hotelId];
  
  // Se encontrou, atualizar o ID para o solicitado
  if (hotel) {
    hotel = { ...hotel, id: hotelId };
  }
  
  return hotel || null;
}