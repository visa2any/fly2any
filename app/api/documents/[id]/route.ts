import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';

/**
 * PUT /api/documents/[id]
 * Update a travel document
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
    const existingDocument = await prisma.travelDocument.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Travel document not found' },
        { status: 404 }
      );
    }

    // Check for duplicate document number (excluding current document)
    if (body.documentNumber) {
      const duplicateDoc = await prisma.travelDocument.findFirst({
        where: {
          userId: user.id,
          type: body.type || existingDocument.type,
          documentNumber: body.documentNumber,
          id: { not: params.id },
        },
      });

      if (duplicateDoc) {
        return NextResponse.json(
          { error: 'A document with this number already exists' },
          { status: 409 }
        );
      }
    }

    // Update document
    const document = await prisma.travelDocument.update({
      where: { id: params.id },
      data: {
        type: body.type,
        documentNumber: body.documentNumber,
        issuingCountry: body.issuingCountry,
        firstName: body.firstName,
        lastName: body.lastName,
        middleName: body.middleName || null,
        issuedDate: body.issuedDate ? new Date(body.issuedDate) : null,
        expirationDate: new Date(body.expirationDate),
        frontImageUrl: body.frontImageUrl || null,
        backImageUrl: body.backImageUrl || null,
        visaType: body.visaType || null,
        destinationCountry: body.destinationCountry || null,
        notes: body.notes || null,
      },
    });

    return NextResponse.json({
      success: true,
      document,
      message: 'Travel document updated successfully',
    });
  } catch (error) {
    console.error('Error updating travel document:', error);
    return NextResponse.json(
      { error: 'Failed to update travel document' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/documents/[id]
 * Delete a travel document
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
    const deleted = await prisma.travelDocument.deleteMany({
      where: { id: params.id, userId: user.id },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: 'Travel document not found' },
        { status: 404 }
      );
    }

    // TODO: Delete associated image files from cloud storage if they exist

    return NextResponse.json({
      success: true,
      message: 'Travel document deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting travel document:', error);
    return NextResponse.json(
      { error: 'Failed to delete travel document' },
      { status: 500 }
    );
  }
}
