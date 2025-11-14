import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';

/**
 * GET /api/documents
 * Fetch all travel documents for the authenticated user
 */
export async function GET(request: NextRequest) {
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

    const documents = await prisma.travelDocument.findMany({
      where: { userId: user.id },
      orderBy: [
        { expirationDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      success: true,
      documents,
      total: documents.length,
    });
  } catch (error) {
    console.error('Error fetching travel documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch travel documents' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/documents
 * Create a new travel document
 */
export async function POST(request: NextRequest) {
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

    // Basic validation
    if (!body.type || !body.documentNumber || !body.issuingCountry || !body.firstName || !body.lastName || !body.expirationDate) {
      return NextResponse.json(
        { error: 'Missing required document information' },
        { status: 400 }
      );
    }

    // Check for duplicate document number
    const existingDoc = await prisma.travelDocument.findFirst({
      where: {
        userId: user.id,
        type: body.type,
        documentNumber: body.documentNumber,
      },
    });

    if (existingDoc) {
      return NextResponse.json(
        { error: 'A document with this number already exists' },
        { status: 409 }
      );
    }

    const document = await prisma.travelDocument.create({
      data: {
        userId: user.id,
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
        isVerified: false,
        notes: body.notes || null,
      },
    });

    return NextResponse.json({
      success: true,
      document,
      message: 'Travel document added successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating travel document:', error);
    return NextResponse.json(
      { error: 'Failed to create travel document' },
      { status: 500 }
    );
  }
}
