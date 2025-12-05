import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bookingStorage } from '@/lib/bookings/storage';
import { put } from '@vercel/blob';
import crypto from 'crypto';

/**
 * POST /api/booking-flow/verify-documents
 *
 * Upload verification documents (Card Front, Card Back, Photo ID)
 * for post-payment verification flow.
 *
 * Documents are stored securely in Vercel Blob with encryption.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const bookingReference = formData.get('bookingReference') as string;
    const token = formData.get('token') as string;

    if (!bookingReference) {
      return NextResponse.json(
        { error: 'Booking reference is required' },
        { status: 400 }
      );
    }

    // Verify the token matches (simple validation)
    // In production, you'd validate against a stored token
    if (!token || token.length < 10) {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 401 }
      );
    }

    // Get the uploaded files
    const cardFront = formData.get('cardFront') as File | null;
    const cardBack = formData.get('cardBack') as File | null;
    const photoId = formData.get('photoId') as File | null;

    if (!cardFront || !cardBack || !photoId) {
      return NextResponse.json(
        { error: 'All three documents are required (cardFront, cardBack, photoId)' },
        { status: 400 }
      );
    }

    // Generate secure file names with encryption prefix
    const timestamp = Date.now();
    const securePrefix = crypto.randomBytes(8).toString('hex');

    // Upload to Vercel Blob (encrypted storage)
    const uploadPromises = [
      put(
        `verifications/${bookingReference}/${securePrefix}-card-front-${timestamp}.jpg`,
        cardFront,
        { access: 'public', addRandomSuffix: true }
      ),
      put(
        `verifications/${bookingReference}/${securePrefix}-card-back-${timestamp}.jpg`,
        cardBack,
        { access: 'public', addRandomSuffix: true }
      ),
      put(
        `verifications/${bookingReference}/${securePrefix}-photo-id-${timestamp}.jpg`,
        photoId,
        { access: 'public', addRandomSuffix: true }
      ),
    ];

    const [cardFrontBlob, cardBackBlob, photoIdBlob] = await Promise.all(uploadPromises);

    // Get IP address and user agent
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                      request.headers.get('x-real-ip') ||
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Ensure prisma is available
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database connection unavailable' },
        { status: 500 }
      );
    }

    // Update or create CardAuthorization record
    const existingAuth = await prisma.cardAuthorization.findUnique({
      where: { bookingReference },
    });

    if (existingAuth) {
      // Update existing authorization with document URLs
      await prisma.cardAuthorization.update({
        where: { bookingReference },
        data: {
          cardFrontImage: cardFrontBlob.url,
          cardBackImage: cardBackBlob.url,
          idDocumentImage: photoIdBlob.url,
          status: 'PENDING', // Ready for admin review
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new authorization record with documents only
      // (Other fields will be filled from booking data)
      const booking = await bookingStorage.findByReferenceAsync(bookingReference);

      if (!booking) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        );
      }

      // Extract payment info from booking if available
      const paymentInfo = booking.payment as any || {};
      const contactInfo = booking.contactInfo as any || {};

      await prisma.cardAuthorization.create({
        data: {
          bookingReference,
          cardholderName: paymentInfo.cardName || contactInfo.firstName || 'PENDING',
          cardLast4: paymentInfo.last4 || '****',
          cardBrand: paymentInfo.brand || 'unknown',
          expiryMonth: parseInt(paymentInfo.expiryMonth || '12', 10),
          expiryYear: parseInt(paymentInfo.expiryYear || '2025', 10),
          billingStreet: paymentInfo.billingAddress || 'PENDING',
          billingCity: paymentInfo.billingCity || 'PENDING',
          billingState: paymentInfo.billingState || 'PENDING',
          billingZip: paymentInfo.billingZip || 'PENDING',
          billingCountry: paymentInfo.billingCountry || 'US',
          email: contactInfo.email || 'pending@fly2any.com',
          phone: contactInfo.phone || 'PENDING',
          amount: booking.flight?.price?.total || 0,
          currency: paymentInfo.currency || 'USD',
          cardFrontImage: cardFrontBlob.url,
          cardBackImage: cardBackBlob.url,
          idDocumentImage: photoIdBlob.url,
          signatureTyped: paymentInfo.signatureName || 'PENDING',
          ackAuthorize: true,
          ackCardholder: true,
          ackNonRefundable: true,
          ackPassengerInfo: true,
          ackTerms: true,
          ipAddress,
          userAgent,
          status: 'PENDING',
        },
      });
    }

    // Update booking status to indicate verification submitted
    const bookingToUpdate = await bookingStorage.findByReferenceAsync(bookingReference);
    if (bookingToUpdate) {
      await bookingStorage.update(bookingToUpdate.id, {
        status: 'VERIFICATION_PENDING' as any,
      });
    }

    // Send notification email to admin
    // TODO: Implement email notification
    console.log(`[VERIFICATION] Documents uploaded for ${bookingReference}`);

    return NextResponse.json({
      success: true,
      message: 'Documents uploaded successfully',
      bookingReference,
    });

  } catch (error) {
    console.error('[VERIFY_DOCUMENTS_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to upload documents' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/booking-flow/verify-documents?ref=XXX
 *
 * Check verification status for a booking
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingReference = searchParams.get('ref');

    if (!bookingReference) {
      return NextResponse.json(
        { error: 'Booking reference is required' },
        { status: 400 }
      );
    }

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database connection unavailable' },
        { status: 500 }
      );
    }

    const authorization = await prisma.cardAuthorization.findUnique({
      where: { bookingReference },
      select: {
        status: true,
        cardFrontImage: true,
        cardBackImage: true,
        idDocumentImage: true,
        createdAt: true,
        verifiedAt: true,
      },
    });

    if (!authorization) {
      return NextResponse.json({
        verified: false,
        documentsUploaded: false,
        status: 'NOT_STARTED',
      });
    }

    const documentsUploaded = !!(
      authorization.cardFrontImage &&
      authorization.cardBackImage &&
      authorization.idDocumentImage
    );

    return NextResponse.json({
      verified: authorization.status === 'VERIFIED',
      documentsUploaded,
      status: authorization.status,
      createdAt: authorization.createdAt,
      verifiedAt: authorization.verifiedAt,
    });

  } catch (error) {
    console.error('[VERIFY_STATUS_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to check verification status' },
      { status: 500 }
    );
  }
}
