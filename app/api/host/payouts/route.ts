import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PUT /api/host/payouts — Save payout method (auth required)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { bankName, accountHolder, accountNumber, routingCode } = body;

    if (!bankName || !accountHolder || !accountNumber) {
      return NextResponse.json(
        { success: false, error: 'Bank name, account holder, and account number are required' },
        { status: 400 }
      );
    }

    // Upsert PropertyOwner with payout details
    const owner = await prisma.propertyOwner.upsert({
      where: { userId: session.user.id },
      update: {
        payoutMethod: 'bank_transfer',
        payoutDetails: {
          bankName,
          accountHolder,
          // Store last 4 digits only for display, full number would go to a secure vault in production
          accountNumberLast4: accountNumber.slice(-4),
          routingCode: routingCode || null,
          updatedAt: new Date().toISOString(),
        },
      },
      create: {
        userId: session.user.id,
        businessType: 'individual',
        payoutMethod: 'bank_transfer',
        payoutDetails: {
          bankName,
          accountHolder,
          accountNumberLast4: accountNumber.slice(-4),
          routingCode: routingCode || null,
          updatedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        payoutMethod: owner.payoutMethod,
        bankName,
        accountHolder,
        accountNumberLast4: accountNumber.slice(-4),
      },
    });
  } catch (error: any) {
    console.error('Error saving payout method:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save payout method' },
      { status: 500 }
    );
  }
}

// GET /api/host/payouts — Get current payout settings (auth required)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const owner = await prisma.propertyOwner.findUnique({
      where: { userId: session.user.id },
      select: { payoutMethod: true, payoutDetails: true },
    });

    if (!owner || !owner.payoutMethod) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({
      success: true,
      data: {
        payoutMethod: owner.payoutMethod,
        ...(owner.payoutDetails as any || {}),
      },
    });
  } catch (error: any) {
    console.error('Error fetching payout method:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch payout method' },
      { status: 500 }
    );
  }
}
