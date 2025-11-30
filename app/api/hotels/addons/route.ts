// Add-ons API - Uber Vouchers and eSIM Integration
// Enables upselling travel add-ons during booking
import { NextRequest, NextResponse } from 'next/server';

const LITEAPI_BASE_URL = 'https://api.liteapi.travel/v3.0';
const LITEAPI_KEY = process.env.LITEAPI_PUBLIC_KEY || process.env.LITEAPI_SANDBOX_PUBLIC_KEY || '';

// Add-on types available
export interface UberVoucher {
  id: string;
  type: 'uber_voucher';
  name: string;
  description: string;
  amount: number;
  currency: string;
  price: number;
  savings?: string;
  popular?: boolean;
}

export interface ESIMPlan {
  id: string;
  type: 'esim';
  name: string;
  description: string;
  dataAmount: string;
  duration: string;
  coverage: string[];
  price: number;
  currency: string;
  popular?: boolean;
}

export type AddOn = UberVoucher | ESIMPlan;

// Pre-configured add-on options
const uberVouchers: UberVoucher[] = [
  {
    id: 'uber-10',
    type: 'uber_voucher',
    name: '$10 Uber Voucher',
    description: 'Perfect for short rides to attractions',
    amount: 10,
    currency: 'USD',
    price: 10,
  },
  {
    id: 'uber-25',
    type: 'uber_voucher',
    name: '$25 Uber Voucher',
    description: 'Great for airport transfers',
    amount: 25,
    currency: 'USD',
    price: 25,
    popular: true,
  },
  {
    id: 'uber-50',
    type: 'uber_voucher',
    name: '$50 Uber Voucher',
    description: 'Multiple rides covered',
    amount: 50,
    currency: 'USD',
    price: 47,
    savings: 'Save $3',
  },
  {
    id: 'uber-100',
    type: 'uber_voucher',
    name: '$100 Uber Voucher',
    description: 'Best value for frequent riders',
    amount: 100,
    currency: 'USD',
    price: 90,
    savings: 'Save $10',
    popular: true,
  },
];

const esimPlans: ESIMPlan[] = [
  {
    id: 'esim-1gb',
    type: 'esim',
    name: '1GB Data',
    description: 'Light usage - emails & messaging',
    dataAmount: '1GB',
    duration: '7 days',
    coverage: ['UAE', 'Saudi Arabia', 'Qatar', 'Bahrain', 'Kuwait', 'Oman'],
    price: 5,
    currency: 'USD',
  },
  {
    id: 'esim-3gb',
    type: 'esim',
    name: '3GB Data',
    description: 'Moderate usage - social media & maps',
    dataAmount: '3GB',
    duration: '15 days',
    coverage: ['UAE', 'Saudi Arabia', 'Qatar', 'Bahrain', 'Kuwait', 'Oman', 'Egypt', 'Jordan'],
    price: 12,
    currency: 'USD',
    popular: true,
  },
  {
    id: 'esim-5gb',
    type: 'esim',
    name: '5GB Data',
    description: 'Heavy usage - streaming & video calls',
    dataAmount: '5GB',
    duration: '30 days',
    coverage: ['Global - 100+ countries'],
    price: 20,
    currency: 'USD',
  },
  {
    id: 'esim-10gb',
    type: 'esim',
    name: '10GB Data',
    description: 'Unlimited-like experience',
    dataAmount: '10GB',
    duration: '30 days',
    coverage: ['Global - 100+ countries'],
    price: 35,
    currency: 'USD',
    popular: true,
  },
  {
    id: 'esim-20gb',
    type: 'esim',
    name: '20GB Data',
    description: 'Work remotely without limits',
    dataAmount: '20GB',
    duration: '30 days',
    coverage: ['Global - 100+ countries'],
    price: 55,
    currency: 'USD',
  },
];

// GET: Fetch available add-ons for a destination
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const destination = searchParams.get('destination');
  const countryCode = searchParams.get('countryCode');
  const category = searchParams.get('category'); // 'uber', 'esim', or 'all'

  try {
    let addons: AddOn[] = [];

    if (!category || category === 'all' || category === 'uber') {
      // Uber vouchers available globally
      addons.push(...uberVouchers);
    }

    if (!category || category === 'all' || category === 'esim') {
      // Filter eSIM plans by destination if country code provided
      let relevantPlans = esimPlans;

      if (countryCode) {
        // Prioritize plans that include the destination country
        relevantPlans = esimPlans.map(plan => ({
          ...plan,
          popular: plan.coverage.some(c =>
            c.toLowerCase().includes('global') ||
            c.toLowerCase().includes(countryCode.toLowerCase())
          ) ? true : plan.popular,
        }));
      }

      addons.push(...relevantPlans);
    }

    return NextResponse.json({
      success: true,
      data: {
        addons,
        categories: {
          uber: {
            name: 'Uber Vouchers',
            description: 'Pre-purchase Uber credits for your trip',
            icon: 'car',
          },
          esim: {
            name: 'eSIM Data Plans',
            description: 'Stay connected with international data',
            icon: 'smartphone',
          },
        },
        destination: destination || 'Global',
      },
    });
  } catch (error) {
    console.error('Add-ons API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch add-ons',
    }, { status: 500 });
  }
}

// POST: Attach add-ons to a booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, prebookId, addons } = body;

    if (!bookingId && !prebookId) {
      return NextResponse.json({
        success: false,
        error: 'Booking ID or Prebook ID is required',
      }, { status: 400 });
    }

    if (!addons || !Array.isArray(addons) || addons.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'At least one add-on is required',
      }, { status: 400 });
    }

    // Calculate total
    let totalAmount = 0;
    const processedAddons: Array<{
      id: string;
      type: string;
      name: string;
      price: number;
      currency: string;
    }> = [];

    for (const addonId of addons) {
      // Find the add-on
      const uberAddon = uberVouchers.find(v => v.id === addonId);
      const esimAddon = esimPlans.find(p => p.id === addonId);
      const addon = uberAddon || esimAddon;

      if (!addon) {
        return NextResponse.json({
          success: false,
          error: `Invalid add-on: ${addonId}`,
        }, { status: 400 });
      }

      totalAmount += addon.price;
      processedAddons.push({
        id: addon.id,
        type: addon.type,
        name: addon.name,
        price: addon.price,
        currency: addon.currency || 'USD',
      });
    }

    // Try to attach via LiteAPI if available
    // Note: LiteAPI add-ons endpoint is POST /bookings/{bookingId}/addons
    if (LITEAPI_KEY && bookingId) {
      try {
        const liteApiResponse = await fetch(
          `${LITEAPI_BASE_URL}/bookings/${bookingId}/addons`,
          {
            method: 'POST',
            headers: {
              'X-API-Key': LITEAPI_KEY,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              addons: processedAddons.map(a => ({
                type: a.type,
                id: a.id,
                amount: a.price,
              })),
            }),
          }
        );

        if (liteApiResponse.ok) {
          const liteApiData = await liteApiResponse.json();
          return NextResponse.json({
            success: true,
            data: {
              bookingId,
              addons: processedAddons,
              totalAmount,
              currency: 'USD',
              liteApiConfirmation: liteApiData.data,
            },
          });
        }
      } catch (liteApiError) {
        console.warn('LiteAPI add-ons endpoint not available, using local processing');
      }
    }

    // Local processing (fallback or prebook stage)
    return NextResponse.json({
      success: true,
      data: {
        bookingId: bookingId || null,
        prebookId: prebookId || null,
        addons: processedAddons,
        totalAmount,
        currency: 'USD',
        status: 'pending',
        message: 'Add-ons will be processed with your booking',
      },
    });

  } catch (error) {
    console.error('Add-ons POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to attach add-ons',
    }, { status: 500 });
  }
}
