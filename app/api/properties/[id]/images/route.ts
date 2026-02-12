import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/properties/[id]/images — List images for a property (public)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const images = await prisma.propertyImage.findMany({
      where: { propertyId: params.id },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ success: true, data: images });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/properties/[id]/images — Upload image metadata (auth + ownership required)
// NOTE: For now this accepts pre-uploaded URLs (e.g. from a CDN or external storage).
// A full multipart file upload handler can be added later with S3/Cloudinary integration.
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    // Verify ownership
    const property = await prisma.property.findUnique({
      where: { id: params.id },
      include: { owner: { select: { userId: true } } },
    });
    if (!property) {
      return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 });
    }
    if (property.owner.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Support single or batch image creation
    const images = Array.isArray(body) ? body : [body];
    const created = [];

    for (const img of images) {
      if (!img.url) continue;
      const image = await prisma.propertyImage.create({
        data: {
          propertyId: params.id,
          url: img.url,
          thumbnailUrl: img.thumbnailUrl || null,
          caption: img.caption || null,
          category: img.category || 'general',
          aiTags: img.aiTags || [],
          isPrimary: img.isPrimary || false,
          sortOrder: img.sortOrder || 0,
        },
      });
      created.push(image);
    }

    // If any image was set as primary, update property coverImageUrl
    const primaryImage = created.find((img) => img.isPrimary);
    if (primaryImage) {
      await prisma.property.update({
        where: { id: params.id },
        data: { coverImageUrl: primaryImage.url },
      });
    }

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating image:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/properties/[id]/images — Delete an image (auth + ownership required)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    // Verify ownership
    const property = await prisma.property.findUnique({
      where: { id: params.id },
      include: { owner: { select: { userId: true } } },
    });
    if (!property) {
      return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 });
    }
    if (property.owner.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('imageId');
    if (!imageId) {
      return NextResponse.json({ success: false, error: 'imageId query parameter is required' }, { status: 400 });
    }

    await prisma.propertyImage.delete({ where: { id: imageId } });
    return NextResponse.json({ success: true, message: 'Image deleted' });
  } catch (error: any) {
    console.error('Error deleting image:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
