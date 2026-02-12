import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/properties/[id]/rooms — List rooms for a property
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rooms = await prisma.propertyRoom.findMany({
      where: { propertyId: params.id },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ success: true, data: rooms });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/properties/[id]/rooms — Add a room
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const room = await prisma.propertyRoom.create({
      data: {
        propertyId: params.id,
        name: body.name || 'Standard Room',
        description: body.description || null,
        roomType: body.roomType || 'standard',
        bedType: body.bedType || 'queen',
        bedCount: body.bedCount || 1,
        maxOccupancy: body.maxOccupancy || 2,
        maxAdults: body.maxAdults || 2,
        maxChildren: body.maxChildren || 0,
        roomSize: body.roomSize || null,
        viewType: body.viewType || null,
        amenities: body.amenities || [],
        bathroomType: body.bathroomType || 'private',
        basePricePerNight: body.basePricePerNight || 100,
        currency: body.currency || 'USD',
        quantity: body.quantity || 1,
        photos: body.photos || [],
        sortOrder: body.sortOrder || 0,
      },
    });
    return NextResponse.json({ success: true, data: room }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
