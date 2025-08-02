/**
 * Hotel Loyalty Guests API Endpoint
 * GET /api/hotels/loyalty/guests
 * 
 * Returns guest loyalty information based on LiteAPI structure
 */

import { NextRequest, NextResponse } from 'next/server';

// Generate mock guest loyalty data
function generateGuestData() {
  const guests = [
    {
      id: 'guest-001',
      personalInfo: {
        firstName: 'Maria',
        lastName: 'Silva',
        email: 'maria.silva@email.com',
        phone: '+55 11 98765-4321',
        dateOfBirth: '1985-03-15',
        nationality: 'BR',
        preferredLanguage: 'pt-BR'
      },
      loyaltyProgram: {
        membershipId: 'FLY2ANY001',
        tier: 'Gold',
        status: 'active',
        joinDate: '2022-05-20',
        totalPoints: 12450,
        availablePoints: 8200,
        nextTierPoints: 2550, // Points needed for next tier
        nextTier: 'Platinum',
        lifetime: {
          totalBookings: 18,
          totalSpent: 15680.50,
          totalNights: 42
        }
      },
      preferences: {
        roomType: 'superior',
        bedType: 'king',
        floor: 'high',
        smoking: false,
        earlyCheckIn: true,
        lateCheckOut: true,
        newspaper: 'folha',
        amenities: ['wifi', 'gym', 'spa']
      },
      lastBooking: {
        hotelId: 'real-hotel-1',
        hotelName: 'Hotel Copacabana Palace',
        checkIn: '2024-06-15',
        checkOut: '2024-06-18',
        totalAmount: 2550.00,
        pointsEarned: 255
      },
      emergencyContact: {
        name: 'João Silva',
        relationship: 'spouse',
        phone: '+55 11 98765-1234'
      }
    },
    {
      id: 'guest-002',
      personalInfo: {
        firstName: 'Carlos',
        lastName: 'Santos',
        email: 'carlos.santos@email.com',
        phone: '+55 21 99876-5432',
        dateOfBirth: '1978-11-22',
        nationality: 'BR',
        preferredLanguage: 'pt-BR'
      },
      loyaltyProgram: {
        membershipId: 'FLY2ANY002',
        tier: 'Platinum',
        status: 'active',
        joinDate: '2021-02-10',
        totalPoints: 28750,
        availablePoints: 15300,
        nextTierPoints: 0, // Already at highest tier
        nextTier: null,
        lifetime: {
          totalBookings: 35,
          totalSpent: 32450.75,
          totalNights: 89
        }
      },
      preferences: {
        roomType: 'suite',
        bedType: 'king',
        floor: 'high',
        smoking: false,
        earlyCheckIn: true,
        lateCheckOut: true,
        newspaper: 'estadao',
        amenities: ['wifi', 'gym', 'spa', 'concierge']
      },
      lastBooking: {
        hotelId: 'real-hotel-2',
        hotelName: 'Hotel Fasano São Paulo',
        checkIn: '2024-07-01',
        checkOut: '2024-07-05',
        totalAmount: 4200.00,
        pointsEarned: 630
      },
      emergencyContact: {
        name: 'Ana Santos',
        relationship: 'spouse',
        phone: '+55 21 99876-1234'
      }
    },
    {
      id: 'guest-003',
      personalInfo: {
        firstName: 'Ana',
        lastName: 'Costa',
        email: 'ana.costa@email.com',
        phone: '+55 85 97654-3210',
        dateOfBirth: '1992-07-08',
        nationality: 'BR',
        preferredLanguage: 'pt-BR'
      },
      loyaltyProgram: {
        membershipId: 'FLY2ANY003',
        tier: 'Silver',
        status: 'active',
        joinDate: '2023-01-15',
        totalPoints: 4250,
        availablePoints: 3100,
        nextTierPoints: 5750, // Points needed for Gold
        nextTier: 'Gold',
        lifetime: {
          totalBookings: 8,
          totalSpent: 6320.25,
          totalNights: 18
        }
      },
      preferences: {
        roomType: 'standard',
        bedType: 'queen',
        floor: 'any',
        smoking: false,
        earlyCheckIn: false,
        lateCheckOut: false,
        newspaper: null,
        amenities: ['wifi', 'pool']
      },
      lastBooking: {
        hotelId: 'real-hotel-5',
        hotelName: 'Pousada Maravilha',
        checkIn: '2024-05-20',
        checkOut: '2024-05-25',
        totalAmount: 1950.00,
        pointsEarned: 195
      },
      emergencyContact: {
        name: 'Pedro Costa',
        relationship: 'father',
        phone: '+55 85 97654-1111'
      }
    }
  ];
  
  return guests;
}

// Loyalty tier benefits
const tierBenefits = {
  Bronze: {
    pointsMultiplier: 1.0,
    earlyCheckIn: false,
    lateCheckOut: false,
    roomUpgrade: false,
    freeWifi: true,
    concierge: false,
    breakfastDiscount: 0
  },
  Silver: {
    pointsMultiplier: 1.2,
    earlyCheckIn: true,
    lateCheckOut: false,
    roomUpgrade: false,
    freeWifi: true,
    concierge: false,
    breakfastDiscount: 10
  },
  Gold: {
    pointsMultiplier: 1.5,
    earlyCheckIn: true,
    lateCheckOut: true,
    roomUpgrade: true,
    freeWifi: true,
    concierge: true,
    breakfastDiscount: 20
  },
  Platinum: {
    pointsMultiplier: 2.0,
    earlyCheckIn: true,
    lateCheckOut: true,
    roomUpgrade: true,
    freeWifi: true,
    concierge: true,
    breakfastDiscount: 50
  }
};

/**
 * GET /api/hotels/loyalty/guests
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const tier = url.searchParams.get('tier');
    const status = url.searchParams.get('status');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0');
    
    let guests = generateGuestData();
    
    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      guests = guests.filter(guest => 
        guest.personalInfo.firstName.toLowerCase().includes(searchLower) ||
        guest.personalInfo.lastName.toLowerCase().includes(searchLower) ||
        guest.personalInfo.email.toLowerCase().includes(searchLower) ||
        guest.loyaltyProgram.membershipId.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by tier
    if (tier) {
      guests = guests.filter(guest => 
        guest.loyaltyProgram.tier.toLowerCase() === tier.toLowerCase()
      );
    }
    
    // Filter by status
    if (status) {
      guests = guests.filter(guest => 
        guest.loyaltyProgram.status === status.toLowerCase()
      );
    }
    
    // Apply pagination
    const totalGuests = guests.length;
    guests = guests.slice(offset, offset + limit);
    
    // Calculate summary statistics
    const allGuests = generateGuestData();
    const summary = {
      totalGuests: allGuests.length,
      totalActiveGuests: allGuests.filter(g => g.loyaltyProgram.status === 'active').length,
      totalPoints: allGuests.reduce((sum, g) => sum + g.loyaltyProgram.totalPoints, 0),
      totalLifetimeValue: allGuests.reduce((sum, g) => sum + g.loyaltyProgram.lifetime.totalSpent, 0),
      tierDistribution: {
        Bronze: allGuests.filter(g => g.loyaltyProgram.tier === 'Bronze').length,
        Silver: allGuests.filter(g => g.loyaltyProgram.tier === 'Silver').length,
        Gold: allGuests.filter(g => g.loyaltyProgram.tier === 'Gold').length,
        Platinum: allGuests.filter(g => g.loyaltyProgram.tier === 'Platinum').length
      },
      averageBookingsPerGuest: allGuests.reduce((sum, g) => sum + g.loyaltyProgram.lifetime.totalBookings, 0) / allGuests.length
    };

    return NextResponse.json({
      status: 'success',
      data: {
        guests,
        summary,
        tierBenefits,
        pagination: {
          total: totalGuests,
          offset,
          limit,
          hasMore: offset + limit < totalGuests
        }
      },
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'LiteAPI-compatible',
        searchQuery: search || null
      }
    });

  } catch (error) {
    console.error('Loyalty guests error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Failed to fetch loyalty guests',
      data: null
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';