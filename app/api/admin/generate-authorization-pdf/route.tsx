import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bookingStorage } from '@/lib/bookings/storage';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

/**
 * Credit Card Authorization PDF Generator
 *
 * Generates a comprehensive, ARC-compliant authorization document
 * for chargeback defense. Includes:
 * - Transaction summary
 * - Cardholder authorization statement
 * - Document images (Card Front, Card Back, Photo ID)
 * - Terms acceptance audit trail
 * - Digital signature
 */

// Register a clean font
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff2', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Inter',
    fontSize: 10,
    lineHeight: 1.5,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#0066cc',
  },
  logo: {
    fontSize: 24,
    fontWeight: 700,
    color: '#0066cc',
  },
  headerRight: {
    textAlign: 'right',
  },
  docTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1a1a1a',
    marginBottom: 4,
  },
  docId: {
    fontSize: 9,
    color: '#666666',
  },
  section: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#1e40af',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: 140,
    fontWeight: 600,
    color: '#475569',
  },
  value: {
    flex: 1,
    color: '#1a1a1a',
  },
  highlight: {
    backgroundColor: '#dbeafe',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  highlightText: {
    fontSize: 12,
    fontWeight: 700,
    color: '#1e40af',
    textAlign: 'center',
  },
  authStatement: {
    marginTop: 20,
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fef3c7',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  authTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#92400e',
    marginBottom: 10,
    textAlign: 'center',
  },
  authText: {
    fontSize: 9,
    color: '#78350f',
    lineHeight: 1.6,
    textAlign: 'justify',
  },
  imageContainer: {
    marginBottom: 12,
  },
  imageLabel: {
    fontSize: 9,
    fontWeight: 600,
    color: '#475569',
    marginBottom: 4,
  },
  docImage: {
    maxWidth: 250,
    maxHeight: 160,
    objectFit: 'contain',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
  },
  imagePlaceholder: {
    width: 250,
    height: 100,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#94a3b8',
    fontSize: 9,
  },
  signatureBox: {
    marginTop: 20,
    padding: 15,
    borderWidth: 2,
    borderColor: '#22c55e',
    borderRadius: 4,
    backgroundColor: '#f0fdf4',
  },
  signatureTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#166534',
    marginBottom: 10,
  },
  signature: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#1a1a1a',
    marginBottom: 4,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  signatureDate: {
    fontSize: 9,
    color: '#666666',
  },
  auditSection: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
  },
  auditTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: '#475569',
    marginBottom: 6,
  },
  auditRow: {
    flexDirection: 'row',
    marginBottom: 2,
    fontSize: 8,
  },
  auditLabel: {
    width: 100,
    color: '#64748b',
  },
  auditValue: {
    flex: 1,
    color: '#334155',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8',
  },
  pageNumber: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 4,
  },
  checkmark: {
    color: '#22c55e',
    fontWeight: 700,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});

interface AuthorizationData {
  bookingReference: string;
  cardholderName: string;
  cardLast4: string;
  cardBrand: string;
  expiryMonth: number;
  expiryYear: number;
  billingStreet: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
  billingCountry: string;
  email: string;
  phone: string;
  amount: number;
  currency: string;
  cardFrontImage?: string | null;
  cardBackImage?: string | null;
  idDocumentImage?: string | null;
  signatureTyped: string;
  signatureImage?: string | null;
  ackAuthorize: boolean;
  ackCardholder: boolean;
  ackNonRefundable: boolean;
  ackPassengerInfo: boolean;
  ackTerms: boolean;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
  verifiedAt?: Date | null;
  status: string;
  booking?: {
    route?: string;
    departureDate?: string;
    passengers?: any[];
  };
}

const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
};

const AuthorizationPDF = ({ data }: { data: AuthorizationData }) => (
  <Document>
    {/* Page 1: Authorization & Transaction Details */}
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>Fly2Any</Text>
          <Text style={{ fontSize: 8, color: '#666666' }}>Premium Flight Booking Services</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.docTitle}>CREDIT CARD AUTHORIZATION</Text>
          <Text style={styles.docId}>Document ID: AUTH-{data.bookingReference}</Text>
          <Text style={styles.docId}>Generated: {formatDate(new Date())}</Text>
        </View>
      </View>

      {/* Transaction Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transaction Summary</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Booking Reference:</Text>
          <Text style={styles.value}>{data.bookingReference}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Transaction Amount:</Text>
          <Text style={[styles.value, { fontWeight: 700 }]}>{formatCurrency(data.amount, data.currency)}</Text>
        </View>
        {data.booking?.route && (
          <View style={styles.row}>
            <Text style={styles.label}>Route:</Text>
            <Text style={styles.value}>{data.booking.route}</Text>
          </View>
        )}
        {data.booking?.departureDate && (
          <View style={styles.row}>
            <Text style={styles.label}>Travel Date:</Text>
            <Text style={styles.value}>{data.booking.departureDate}</Text>
          </View>
        )}
        <View style={styles.row}>
          <Text style={styles.label}>Authorization Date:</Text>
          <Text style={styles.value}>{formatDate(data.createdAt)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
          <Text style={[styles.value, { color: data.status === 'VERIFIED' ? '#16a34a' : '#ca8a04' }]}>
            {data.status}
          </Text>
        </View>
      </View>

      {/* Cardholder Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cardholder Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Cardholder Name:</Text>
          <Text style={styles.value}>{data.cardholderName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Card Number:</Text>
          <Text style={styles.value}>**** **** **** {data.cardLast4}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Card Brand:</Text>
          <Text style={styles.value}>{data.cardBrand.toUpperCase()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Expiry:</Text>
          <Text style={styles.value}>{String(data.expiryMonth).padStart(2, '0')}/{data.expiryYear}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{data.email}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{data.phone}</Text>
        </View>
      </View>

      {/* Billing Address */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Billing Address</Text>
        <Text style={styles.value}>{data.billingStreet}</Text>
        <Text style={styles.value}>{data.billingCity}, {data.billingState} {data.billingZip}</Text>
        <Text style={styles.value}>{data.billingCountry}</Text>
      </View>

      {/* Authorization Statement */}
      <View style={styles.authStatement}>
        <Text style={styles.authTitle}>CARDHOLDER AUTHORIZATION STATEMENT</Text>
        <Text style={styles.authText}>
          I, {data.cardholderName}, hereby authorize Fly2Any to charge my credit card ending in {data.cardLast4}
          for the amount of {formatCurrency(data.amount, data.currency)} for the purchase of airline ticket(s)
          as described above.
        </Text>
        <Text style={[styles.authText, { marginTop: 8 }]}>
          I confirm that I am the authorized cardholder and that all information provided is accurate.
          I understand that airline tickets are non-refundable and changes may incur additional fees
          as per the airline's policy.
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Fly2Any Travel Services • www.fly2any.com • support@fly2any.com
        </Text>
        <Text style={styles.pageNumber}>Page 1 of 3</Text>
      </View>
    </Page>

    {/* Page 2: Passengers & Terms Acknowledgement */}
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>Fly2Any</Text>
        <View style={styles.headerRight}>
          <Text style={styles.docTitle}>TERMS & ACKNOWLEDGEMENTS</Text>
          <Text style={styles.docId}>Ref: {data.bookingReference}</Text>
        </View>
      </View>

      {/* Passengers */}
      {data.booking?.passengers && data.booking.passengers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Passenger Information</Text>
          {data.booking.passengers.map((passenger: any, index: number) => (
            <View key={index} style={[styles.row, { marginBottom: 6 }]}>
              <Text style={styles.label}>Passenger {index + 1}:</Text>
              <Text style={styles.value}>
                {passenger.firstName} {passenger.lastName} ({passenger.type || 'Adult'})
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Terms Acknowledgement */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Terms & Conditions Acknowledgement</Text>

        <View style={styles.row}>
          <Text style={styles.checkmark}>{data.ackAuthorize ? '✓' : '○'} </Text>
          <Text style={[styles.value, { flex: 1 }]}>
            I authorize this charge to my credit card for the purchase of airline tickets.
          </Text>
        </View>

        <View style={[styles.row, { marginTop: 8 }]}>
          <Text style={styles.checkmark}>{data.ackCardholder ? '✓' : '○'} </Text>
          <Text style={[styles.value, { flex: 1 }]}>
            I confirm that I am the authorized cardholder for this credit card.
          </Text>
        </View>

        <View style={[styles.row, { marginTop: 8 }]}>
          <Text style={styles.checkmark}>{data.ackNonRefundable ? '✓' : '○'} </Text>
          <Text style={[styles.value, { flex: 1 }]}>
            I understand that airline tickets are typically non-refundable after purchase.
          </Text>
        </View>

        <View style={[styles.row, { marginTop: 8 }]}>
          <Text style={styles.checkmark}>{data.ackPassengerInfo ? '✓' : '○'} </Text>
          <Text style={[styles.value, { flex: 1 }]}>
            I confirm that all passenger information provided is accurate and matches travel documents.
          </Text>
        </View>

        <View style={[styles.row, { marginTop: 8 }]}>
          <Text style={styles.checkmark}>{data.ackTerms ? '✓' : '○'} </Text>
          <Text style={[styles.value, { flex: 1 }]}>
            I have read and agree to the Terms of Service and Privacy Policy.
          </Text>
        </View>
      </View>

      {/* Digital Signature */}
      <View style={styles.signatureBox}>
        <Text style={styles.signatureTitle}>DIGITAL SIGNATURE</Text>
        <Text style={styles.signature}>{data.signatureTyped}</Text>
        <Text style={styles.signatureDate}>
          Signed electronically on {formatDate(data.createdAt)}
        </Text>
      </View>

      {/* Audit Trail */}
      <View style={styles.auditSection}>
        <Text style={styles.auditTitle}>AUDIT TRAIL</Text>
        <View style={styles.auditRow}>
          <Text style={styles.auditLabel}>IP Address:</Text>
          <Text style={styles.auditValue}>{data.ipAddress || 'Not recorded'}</Text>
        </View>
        <View style={styles.auditRow}>
          <Text style={styles.auditLabel}>User Agent:</Text>
          <Text style={styles.auditValue}>{(data.userAgent || 'Not recorded').substring(0, 80)}</Text>
        </View>
        <View style={styles.auditRow}>
          <Text style={styles.auditLabel}>Submission Time:</Text>
          <Text style={styles.auditValue}>{formatDate(data.createdAt)}</Text>
        </View>
        {data.verifiedAt && (
          <View style={styles.auditRow}>
            <Text style={styles.auditLabel}>Verified At:</Text>
            <Text style={styles.auditValue}>{formatDate(data.verifiedAt)}</Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          This document serves as a legal record of authorization. Keep for your records.
        </Text>
        <Text style={styles.pageNumber}>Page 2 of 3</Text>
      </View>
    </Page>

    {/* Page 3: Verification Documents */}
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>Fly2Any</Text>
        <View style={styles.headerRight}>
          <Text style={styles.docTitle}>VERIFICATION DOCUMENTS</Text>
          <Text style={styles.docId}>Ref: {data.bookingReference}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Submitted Documents</Text>
        <Text style={{ fontSize: 9, color: '#64748b', marginBottom: 15 }}>
          The following documents were submitted by the cardholder for verification purposes.
        </Text>

        {/* Card Front */}
        <View style={styles.imageContainer}>
          <Text style={styles.imageLabel}>Credit Card - Front (Last 4 digits visible)</Text>
          {data.cardFrontImage ? (
            <Image src={data.cardFrontImage} style={styles.docImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>Not uploaded</Text>
            </View>
          )}
        </View>

        {/* Card Back */}
        <View style={styles.imageContainer}>
          <Text style={styles.imageLabel}>Credit Card - Back (Signature visible)</Text>
          {data.cardBackImage ? (
            <Image src={data.cardBackImage} style={styles.docImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>Not uploaded</Text>
            </View>
          )}
        </View>

        {/* Photo ID */}
        <View style={styles.imageContainer}>
          <Text style={styles.imageLabel}>Government-Issued Photo ID</Text>
          {data.idDocumentImage ? (
            <Image src={data.idDocumentImage} style={styles.docImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>Not uploaded</Text>
            </View>
          )}
        </View>
      </View>

      {/* Verification Statement */}
      <View style={[styles.section, { backgroundColor: '#ecfdf5', borderColor: '#22c55e' }]}>
        <Text style={[styles.sectionTitle, { color: '#166534' }]}>Verification Certification</Text>
        <Text style={{ fontSize: 9, color: '#166534', lineHeight: 1.6 }}>
          These documents have been submitted by the cardholder as proof of identity and card ownership.
          The cardholder has confirmed that they are the authorized user of the credit card and that all
          information provided is accurate and complete.
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          CONFIDENTIAL - This document contains sensitive personal information. Handle with care.
        </Text>
        <Text style={styles.pageNumber}>Page 3 of 3</Text>
      </View>
    </Page>
  </Document>
);

/**
 * GET /api/admin/generate-authorization-pdf?ref=XXX
 *
 * Generate PDF authorization document for a booking
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
        { status: 503 }
      );
    }

    // Get authorization data with booking info
    const authorization = await prisma.cardAuthorization.findUnique({
      where: { bookingReference },
    });

    if (!authorization) {
      return NextResponse.json(
        { error: 'Authorization not found' },
        { status: 404 }
      );
    }

    // Get booking info for additional context
    const booking = await bookingStorage.findByReferenceAsync(bookingReference);

    // Prepare data for PDF
    // Extract origin/destination from flight segments
    const segments = booking?.flight?.segments || [];
    const firstSegment = segments[0];
    const lastSegment = segments.length > 0 ? segments[segments.length - 1] : undefined;
    const origin = firstSegment?.departure?.iataCode || '';
    const destination = lastSegment?.arrival?.iataCode || '';
    const departureDate = firstSegment?.departure?.at || '';

    const pdfData: AuthorizationData = {
      ...authorization,
      booking: booking ? {
        route: origin && destination ? `${origin} → ${destination}` : '',
        departureDate: departureDate,
        passengers: booking.passengers || [],
      } : undefined,
    };

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      <AuthorizationPDF data={pdfData} />
    );

    // Return PDF (convert Buffer to Uint8Array for Response compatibility)
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Authorization-${bookingReference}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });

  } catch (error) {
    console.error('[GENERATE_PDF_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
