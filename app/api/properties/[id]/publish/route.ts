import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { handleApiError, ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';

// Helper: verify authenticated user owns this property
async function verifyOwnership(propertyId: string, userId: string) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: { owner: { select: { userId: true } } },
  });
  if (!property) return { error: 'Property not found', status: 404 };
  if (property.owner.userId !== userId) return { error: 'Forbidden', status: 403 };
  return { property };
}

// POST /api/properties/[id]/publish — Publish a property (validate & go live)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiError(request, async () => {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const ownership = await verifyOwnership(params.id, session.user.id);
    if ('error' in ownership) {
      return NextResponse.json({ success: false, error: ownership.error }, { status: ownership.status });
    }

    const property = await prisma.property.findUnique({
      where: { id: params.id },
      include: { rooms: true, images: true },
    });

    if (!property) {
      return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 });
    }

    const errors: string[] = [];
    if (!property.name) errors.push('Property name is required');
    if (!property.addressLine1) errors.push('Address is required');
    if (!property.city) errors.push('City is required');
    if (!property.country) errors.push('Country is required');
    if (!property.basePricePerNight && property.rooms.length === 0) errors.push('At least one room with pricing is required');

    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Property is not ready to publish',
        validationErrors: errors,
      }, { status: 400 });
    }

    const updated = await prisma.property.update({
      where: { id: params.id },
      data: { status: 'active', publishedAt: new Date() },
    });

    return NextResponse.json({ success: true, data: updated });
  }, { category: ErrorCategory.DATABASE, severity: ErrorSeverity.HIGH });
}

// DELETE /api/properties/[id]/publish — Unpublish a property
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiError(request, async () => {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const ownership = await verifyOwnership(params.id, session.user.id);
    if ('error' in ownership) {
      return NextResponse.json({ success: false, error: ownership.error }, { status: ownership.status });
    }

    const updated = await prisma.property.update({
      where: { id: params.id },
      data: { status: 'paused' },
    });

    return NextResponse.json({ success: true, data: updated });
  }, { category: ErrorCategory.DATABASE, severity: ErrorSeverity.NORMAL });
}
