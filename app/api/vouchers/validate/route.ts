/**
 * Voucher/Promo Code Validation API
 * POST - Validate and calculate discount for a voucher code
 * Checks both local PromoCode database and LiteAPI vouchers
 */
import { NextRequest, NextResponse } from 'next/server';
import { liteAPI } from '@/lib/api/liteapi';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();
    const { code, totalAmount, currency = 'USD', productType = 'hotel', hotelId } = body;

    if (!code) {
      return NextResponse.json({
        success: true,
        data: { valid: false, error: 'Voucher code is required' },
      });
    }

    // First check our local promo codes
    if (prisma) {
      const localPromo = await prisma.promoCode.findUnique({
        where: { code: code.toUpperCase() },
      });

      if (localPromo) {
        const now = new Date();

        // Validation checks
        if (!localPromo.isActive) {
          return NextResponse.json({
            success: true,
            data: { valid: false, error: 'This promo code is no longer active' },
          });
        }

        // Check account requirement
        if (localPromo.requiresAccount && !session?.user?.id) {
          return NextResponse.json({
            success: true,
            data: { valid: false, error: 'You must create an account to use this promo code' },
          });
        }

        // Check PWA app requirement
        if (localPromo.requiresPWAApp && !session?.user?.id) {
          return NextResponse.json({
            success: true,
            data: { valid: false, error: 'This offer is only available on the Fly2Any app. Download it now!' },
          });
        }

        if (now < localPromo.validFrom) {
          return NextResponse.json({
            success: true,
            data: { valid: false, error: 'This promo code is not yet valid' },
          });
        }

        if (now > localPromo.validUntil) {
          return NextResponse.json({
            success: true,
            data: { valid: false, error: 'This promo code has expired' },
          });
        }

        if (localPromo.usageLimit && localPromo.usageCount >= localPromo.usageLimit) {
          return NextResponse.json({
            success: true,
            data: { valid: false, error: 'This promo code has reached its usage limit' },
          });
        }

        if (totalAmount && localPromo.minSpend && totalAmount < localPromo.minSpend) {
          return NextResponse.json({
            success: true,
            data: {
              valid: false,
              error: `Minimum spend of $${localPromo.minSpend} required`,
            },
          });
        }

        // Check product type
        if (
          productType &&
          localPromo.applicableProducts.length > 0 &&
          !localPromo.applicableProducts.includes('all') &&
          !localPromo.applicableProducts.includes(productType)
        ) {
          return NextResponse.json({
            success: true,
            data: {
              valid: false,
              error: `Not valid for ${productType} bookings`,
            },
          });
        }

        // Check new users only
        if (localPromo.newUsersOnly && session?.user?.id) {
          const userBookings = await prisma.voucherRedemption.count({
            where: { userId: session.user.id },
          });
          if (userBookings > 0) {
            return NextResponse.json({
              success: true,
              data: { valid: false, error: 'Only valid for new customers' },
            });
          }
        }

        // Check per-user limit
        if (session?.user?.id) {
          const userUsage = await prisma.voucherRedemption.count({
            where: {
              userId: session.user.id,
              voucherCode: code.toUpperCase(),
            },
          });
          if (userUsage >= localPromo.perUserLimit) {
            return NextResponse.json({
              success: true,
              data: { valid: false, error: 'You have already used this promo code' },
            });
          }
        }

        // Calculate discount
        let discountAmount = 0;
        if (totalAmount) {
          if (localPromo.type === 'percentage') {
            discountAmount = (totalAmount * localPromo.value) / 100;
          } else if (localPromo.type === 'fixed') {
            discountAmount = localPromo.value;
          }

          // Apply max discount cap
          if (localPromo.maxDiscount && discountAmount > localPromo.maxDiscount) {
            discountAmount = localPromo.maxDiscount;
          }

          // Ensure discount doesn't exceed total
          if (discountAmount > totalAmount) {
            discountAmount = totalAmount;
          }
        }

        return NextResponse.json({
          success: true,
          data: {
            valid: true,
            voucher: {
              code: localPromo.code,
              type: localPromo.type,
              value: localPromo.value,
              description: localPromo.description || `${localPromo.type === 'percentage' ? `${localPromo.value}% off` : `$${localPromo.value} off`}`,
            },
            discountAmount: Math.round(discountAmount * 100) / 100,
            finalAmount: totalAmount ? Math.round((totalAmount - discountAmount) * 100) / 100 : undefined,
            currency: localPromo.currency,
            source: 'local',
          },
        });
      }
    }

    // If not found locally, try LiteAPI (for hotel vouchers)
    try {
      const result = await liteAPI.validateVoucher({
        code,
        totalAmount: totalAmount || 0,
        currency,
        hotelId,
        guestId: session?.user?.id,
      });

      if (result.valid) {
        return NextResponse.json({
          success: true,
          data: { ...result, source: 'liteapi' },
        });
      }
    } catch (e: any) {
      // LiteAPI voucher not found, continue
    }

    // Voucher not found anywhere
    return NextResponse.json({
      success: true,
      data: { valid: false, error: 'Invalid promo code' },
    });
  } catch (error: any) {
    console.error('Error validating voucher:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to validate voucher' },
      { status: 500 }
    );
  }
}
