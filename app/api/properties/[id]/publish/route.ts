import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/properties/[id]/publish — Publish a property (validate & go live)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const property = await prisma.property.findUnique({
      where: { id: params.id },
      include: { rooms: true, images: true },
    });

    if (!property) {
      return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 });
    }

    // Validation checks
    const errors: string[] = [];
    if (!property.name) errors.push('Property name is required');
    if (!property.addressLine1) errors.push('Address is required');
    if (!property.city) errors.push('City is required');
    if (!property.country) errors.push('Country is required');
    if (!property.basePricePerNight && property.rooms.length === 0) errors.push('At least one room with pricing is required');
    if (property.images.length === 0) errors.push('At least one photo is required');

    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Property is not ready to publish',
        validationErrors: errors,
      }, { status: 400 });
    }

    // Publish
    const updated = await prisma.property.update({
      where: { id: params.id },
      data: {
        status: 'active',
        publishedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error publishing property:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/properties/[id]/publish — Unpublish a property
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updated = await prisma.property.update({
      where: { id: params.id },
      data: { status: 'paused' },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error unpublishing property:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
