import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';

/**
 * PUT /api/payment-methods/[id]
 * Update a payment method (nickname and default status only for security)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const prisma = getPrismaClient();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Verify ownership
    const existingMethod = await prisma.paymentMethod.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!existingMethod) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      );
    }

    // If setting as default, unset other defaults first
    if (body.isDefault && !existingMethod.isDefault) {
      await prisma.paymentMethod.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Update (only nickname and default status for security)
    const method = await prisma.paymentMethod.update({
      where: { id: params.id },
      data: {
        nickname: body.nickname,
        isDefault: body.isDefault,
      },
    });

    return NextResponse.json({
      success: true,
      method,
      message: 'Payment method updated successfully',
    });
  } catch (error) {
    console.error('Error updating payment method:', error);
    return NextResponse.json(
      { error: 'Failed to update payment method' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/payment-methods/[id]
 * Delete a payment method
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const prisma = getPrismaClient();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify ownership and delete
    const deleted = await prisma.paymentMethod.deleteMany({
      where: { id: params.id, userId: user.id },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      );
    }

    // TODO: Also delete from Stripe if stripePaymentMethodId exists

    return NextResponse.json({
      success: true,
      message: 'Payment method deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    return NextResponse.json(
      { error: 'Failed to delete payment method' },
      { status: 500 }
    );
  }
}
