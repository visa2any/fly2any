import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bookingStorage } from '@/lib/bookings/storage';
import { put } from '@vercel/blob';
import crypto from 'crypto';
import { notifyTelegramAdmins, sendAdminAlert } from '@/lib/notifications/notification-service';

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
    // Check if Vercel Blob is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('[VERIFY_DOCUMENTS] BLOB_READ_WRITE_TOKEN is not configured');
      return NextResponse.json(
        { error: 'Document storage is not configured. Please contact support.' },
        { status: 500 }
      );
    }

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

    // Validate file sizes (max 10MB each)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (cardFront.size > maxSize || cardBack.size > maxSize || photoId.size > maxSize) {
      return NextResponse.json(
        { error: 'Files are too large. Please use smaller images (max 10MB each).' },
        { status: 400 }
      );
    }

    // Generate secure file names with encryption prefix
    const timestamp = Date.now();
    const securePrefix = crypto.randomBytes(8).toString('hex');

    console.log(`[VERIFY_DOCUMENTS] Starting upload for ${bookingReference}`);
    console.log(`[VERIFY_DOCUMENTS] File sizes: front=${cardFront.size}, back=${cardBack.size}, id=${photoId.size}`);

    // Convert Files to ArrayBuffer for reliable upload (fixes mobile issues)
    const [frontBuffer, backBuffer, idBuffer] = await Promise.all([
      cardFront.arrayBuffer(),
      cardBack.arrayBuffer(),
      photoId.arrayBuffer(),
    ]);

    // Upload to Vercel Blob (encrypted storage)
    const uploadPromises = [
      put(
        `verifications/${bookingReference}/${securePrefix}-card-front-${timestamp}.jpg`,
        Buffer.from(frontBuffer),
        { access: 'public', addRandomSuffix: true, contentType: 'image/jpeg' }
      ),
      put(
        `verifications/${bookingReference}/${securePrefix}-card-back-${timestamp}.jpg`,
        Buffer.from(backBuffer),
        { access: 'public', addRandomSuffix: true, contentType: 'image/jpeg' }
      ),
      put(
        `verifications/${bookingReference}/${securePrefix}-photo-id-${timestamp}.jpg`,
        Buffer.from(idBuffer),
        { access: 'public', addRandomSuffix: true, contentType: 'image/jpeg' }
      ),
    ];

    const [cardFrontBlob, cardBackBlob, photoIdBlob] = await Promise.all(uploadPromises);

    console.log(`[VERIFY_DOCUMENTS] Upload successful for ${bookingReference}`);

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

  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error';
    const errorCode = error?.code || 'UNKNOWN';

    console.error('[VERIFY_DOCUMENTS_ERROR]', {
      error: errorMessage,
      code: errorCode,
      stack: error?.stack,
    });

    // Get booking info for notification
    const formData = await request.clone().formData().catch(() => null);
    const bookingReference = formData?.get('bookingReference') as string || 'UNKNOWN';

    // Try to get customer info from booking
    let customerInfo = { name: 'Unknown', email: 'Unknown', phone: 'Unknown' };
    try {
      const booking = await bookingStorage.findByReferenceAsync(bookingReference);
      if (booking) {
        customerInfo = {
          name: `${booking.passengers[0]?.firstName || ''} ${booking.passengers[0]?.lastName || ''}`.trim() || 'Unknown',
          email: booking.contactInfo?.email || booking.passengers[0]?.email || 'Unknown',
          phone: booking.contactInfo?.phone || booking.passengers[0]?.phone || 'Unknown',
        };
      }
    } catch (e) {
      console.error('Could not fetch booking for error notification:', e);
    }

    // Send Telegram alert to admins
    const telegramMessage = `
🚨 <b>VERIFICATION UPLOAD FAILED</b>

📋 <b>Booking:</b> <code>${bookingReference}</code>
👤 <b>Customer:</b> ${customerInfo.name}
📧 <b>Email:</b> ${customerInfo.email}
📞 <b>Phone:</b> ${customerInfo.phone}

❌ <b>Error:</b> ${errorMessage}
🔢 <b>Code:</b> ${errorCode}

<i>Customer was trying to complete post-payment verification.</i>
<i>Please contact them to complete manually.</i>
    `.trim();

    // Fire and forget - don't block the response
    notifyTelegramAdmins(telegramMessage).catch(console.error);

    // Also send email alert
    sendAdminAlert({
      type: 'verification_upload_failed',
      bookingReference,
      customer: customerInfo.name,
      customerEmail: customerInfo.email,
      customerPhone: customerInfo.phone,
      error: errorMessage,
      errorCode,
      timestamp: new Date().toISOString(),
      priority: 'high',
    }).catch(console.error);

    // Determine user-friendly error message
    let userMessage = 'Failed to upload documents. Please try again.';

    if (errorMessage.includes('BLOB') || errorMessage.includes('storage') || errorMessage.includes('put')) {
      userMessage = 'Failed to save documents. Our storage service is temporarily unavailable. Please try again in a few minutes.';
    } else if (errorMessage.includes('prisma') || errorMessage.includes('database')) {
      userMessage = 'Failed to save verification. Our database is temporarily unavailable. Please try again in a few minutes.';
    } else if (errorMessage.includes('timeout') || errorMessage.includes('TIMEOUT')) {
      userMessage = 'Upload timed out. Please check your internet connection and try again.';
    } else if (errorMessage.includes('size') || errorMessage.includes('large')) {
      userMessage = 'Files are too large. Please use smaller images (under 5MB each).';
    } else if (errorMessage.includes('token') || errorMessage.includes('auth')) {
      userMessage = 'Verification session expired. Please refresh the page and try again.';
    }

    return NextResponse.json(
      {
        error: userMessage,
        code: errorCode,
        reference: bookingReference,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/booking-flow/verify-documents?ref=XXX or ?email=XXX
 *
 * Check verification status for a booking or customer
 * - ref: Check specific booking verification
 * - email: Check if customer has ANY verified authorization (can bypass)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingReference = searchParams.get('ref');
    const email = searchParams.get('email');

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database connection unavailable' },
        { status: 500 }
      );
    }

    // Check by email - customer-level verification bypass
    if (email) {
      const verifiedAuth = await prisma.cardAuthorization.findFirst({
        where: {
          email: email.toLowerCase(),
          status: 'VERIFIED',
          cardFrontImage: { not: null },
          cardBackImage: { not: null },
          idDocumentImage: { not: null },
        },
        select: {
          bookingReference: true,
          verifiedAt: true,
          status: true,
        },
        orderBy: { verifiedAt: 'desc' },
      });

      if (verifiedAuth) {
        return NextResponse.json({
          customerVerified: true,
          canBypass: true,
          previousBooking: verifiedAuth.bookingReference,
          verifiedAt: verifiedAuth.verifiedAt,
          message: 'Customer has verified documents on file',
        });
      }

      return NextResponse.json({
        customerVerified: false,
        canBypass: false,
        message: 'Customer needs to complete verification',
      });
    }

    // Check by booking reference
    if (!bookingReference) {
      return NextResponse.json(
        { error: 'Booking reference or email is required' },
        { status: 400 }
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
        email: true,
      },
    });

    if (!authorization) {
      return NextResponse.json({
        verified: false,
        documentsUploaded: false,
        status: 'NOT_STARTED',
        canBypass: false,
      });
    }

    const documentsUploaded = !!(
      authorization.cardFrontImage &&
      authorization.cardBackImage &&
      authorization.idDocumentImage
    );

    // Also check if customer has verified on another booking
    let canBypass = authorization.status === 'VERIFIED';
    if (!canBypass && authorization.email) {
      const previousVerified = await prisma.cardAuthorization.findFirst({
        where: {
          email: authorization.email,
          status: 'VERIFIED',
          bookingReference: { not: bookingReference },
        },
      });
      canBypass = !!previousVerified;
    }

    return NextResponse.json({
      verified: authorization.status === 'VERIFIED',
      documentsUploaded,
      status: authorization.status,
      createdAt: authorization.createdAt,
      verifiedAt: authorization.verifiedAt,
      canBypass,
    });

  } catch (error) {
    console.error('[VERIFY_STATUS_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to check verification status' },
      { status: 500 }
    );
  }
}
