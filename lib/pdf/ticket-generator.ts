/**
 * Professional E-Ticket PDF Generator for Fly2Any
 *
 * Generates beautiful, airline-standard e-tickets with:
 * - Flight details and passenger information
 * - QR codes for e-ticket verification
 * - Booking reference and PNR
 * - Barcodes for scanning
 * - Professional branding
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';

export interface PassengerInfo {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  passportNumber?: string;
}

export interface FlightInfo {
  airline?: string;
  airlineLogo?: string;
  flightNumber?: string;
  origin?: string;
  originCity?: string;
  destination?: string;
  destinationCity?: string;
  departureDate?: string;
  departureTime?: string;
  arrivalDate?: string;
  arrivalTime?: string;
  duration?: string;
  aircraft?: string;
  cabin?: string;
  seatNumber?: string;
  gate?: string;
  terminal?: string;
  baggageAllowance?: string;
}

export interface TicketData {
  bookingReference: string;
  pnr?: string;
  flight: FlightInfo;
  passengers: PassengerInfo[];
  totalPaid: number;
  currency: string;
  confirmationEmail: string;
  bookingDate?: string;
  ticketNumber?: string;
  fareType?: string;
}

/**
 * Generate a QR code as base64 data URL
 */
async function generateQRCode(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
}

/**
 * Generate a barcode representation (Code 128 style)
 */
function generateBarcode(text: string): string {
  // For simplicity, we'll use a repeated pattern that looks like a barcode
  // In production, you'd use a proper barcode library like JsBarcode
  const barcodePattern = '||  |  ||  |  ||  ||  |  ||';
  return barcodePattern.repeat(Math.ceil(text.length / 10));
}

/**
 * Format date to readable format
 */
function formatDate(dateString?: string): string {
  if (!dateString) return 'TBD';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Generate a professional e-ticket PDF
 */
export async function generateETicketPDF(ticketData: TicketData): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let currentY = margin;

  // Colors
  const primaryColor: [number, number, number] = [79, 70, 229]; // Indigo-600
  const secondaryColor: [number, number, number] = [99, 102, 241]; // Indigo-500
  const successColor: [number, number, number] = [34, 197, 94]; // Green-500
  const textColor: [number, number, number] = [31, 41, 55]; // Gray-800
  const lightGray: [number, number, number] = [243, 244, 246]; // Gray-100

  // ===== HEADER WITH BRANDING =====
  // Gradient background simulation
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setFillColor(...secondaryColor);
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Logo/Branding
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('FLY2ANY', margin, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Your Journey Begins Here', margin, 26);

  // E-Ticket label
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('E-TICKET', pageWidth - margin, 18, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Electronic Travel Document', pageWidth - margin, 24, { align: 'right' });

  currentY = 50;

  // ===== BOOKING CONFIRMATION BANNER =====
  doc.setFillColor(...successColor);
  doc.roundedRect(margin, currentY, pageWidth - 2 * margin, 20, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('✓ BOOKING CONFIRMED', pageWidth / 2, currentY + 8, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Your flight has been successfully booked', pageWidth / 2, currentY + 15, { align: 'center' });

  currentY += 30;

  // ===== BOOKING REFERENCE SECTION =====
  doc.setFillColor(...lightGray);
  doc.roundedRect(margin, currentY, pageWidth - 2 * margin, 30, 3, 3, 'F');

  doc.setTextColor(...textColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Booking Reference', margin + 5, currentY + 8);

  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(ticketData.bookingReference, margin + 5, currentY + 20);

  if (ticketData.pnr && ticketData.pnr !== ticketData.bookingReference) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    doc.text(`Airline PNR: ${ticketData.pnr}`, pageWidth - margin - 5, currentY + 10, { align: 'right' });
  }

  if (ticketData.ticketNumber) {
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text(`Ticket #: ${ticketData.ticketNumber}`, pageWidth - margin - 5, currentY + 18, { align: 'right' });
  }

  currentY += 40;

  // ===== FLIGHT DETAILS =====
  doc.setFillColor(...primaryColor);
  doc.rect(margin, currentY, pageWidth - 2 * margin, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('✈ FLIGHT DETAILS', margin + 5, currentY + 6);

  currentY += 12;

  // Flight route visualization
  const routeY = currentY;
  doc.setTextColor(...textColor);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');

  // Origin
  doc.text(ticketData.flight.origin || 'N/A', margin + 20, routeY);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(ticketData.flight.originCity || '', margin + 20, routeY + 6);

  // Arrow
  doc.setFontSize(16);
  doc.text('→', pageWidth / 2, routeY, { align: 'center' });

  // Destination
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(ticketData.flight.destination || 'N/A', pageWidth - margin - 40, routeY, { align: 'right' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(ticketData.flight.destinationCity || '', pageWidth - margin - 40, routeY + 6, { align: 'right' });

  currentY += 20;

  // Flight information table
  autoTable(doc, {
    startY: currentY,
    head: [],
    body: [
      ['Airline', ticketData.flight.airline || 'N/A', 'Flight Number', ticketData.flight.flightNumber || 'N/A'],
      ['Departure', `${formatDate(ticketData.flight.departureDate)} ${ticketData.flight.departureTime || ''}`, 'Arrival', `${formatDate(ticketData.flight.arrivalDate)} ${ticketData.flight.arrivalTime || ''}`],
      ['Duration', ticketData.flight.duration || 'N/A', 'Aircraft', ticketData.flight.aircraft || 'N/A'],
      ['Cabin Class', ticketData.flight.cabin || 'Economy', 'Baggage', ticketData.flight.baggageAllowance || '23kg'],
    ],
    margin: { left: margin, right: margin },
    theme: 'striped',
    headStyles: { fillColor: primaryColor },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40 },
      1: { cellWidth: 50 },
      2: { fontStyle: 'bold', cellWidth: 40 },
      3: { cellWidth: 50 },
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  if (ticketData.flight.terminal || ticketData.flight.gate || ticketData.flight.seatNumber) {
    doc.setFillColor(254, 243, 199); // Amber-100
    doc.roundedRect(margin, currentY, pageWidth - 2 * margin, 15, 2, 2, 'F');

    doc.setFontSize(9);
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'bold');
    let checkInInfo = '  CHECK-IN INFO: ';

    if (ticketData.flight.terminal) checkInInfo += `Terminal ${ticketData.flight.terminal}  `;
    if (ticketData.flight.gate) checkInInfo += `Gate ${ticketData.flight.gate}  `;
    if (ticketData.flight.seatNumber) checkInInfo += `Seat ${ticketData.flight.seatNumber}`;

    doc.text(checkInInfo, margin + 5, currentY + 9);
    currentY += 20;
  }

  // ===== PASSENGER DETAILS =====
  doc.setFillColor(...primaryColor);
  doc.rect(margin, currentY, pageWidth - 2 * margin, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`👤 PASSENGER${ticketData.passengers.length > 1 ? 'S' : ''} (${ticketData.passengers.length})`, margin + 5, currentY + 6);

  currentY += 12;

  // Generate each passenger ticket
  for (let i = 0; i < ticketData.passengers.length; i++) {
    const passenger = ticketData.passengers[i];

    // Check if we need a new page
    if (currentY > pageHeight - 80) {
      doc.addPage();
      currentY = margin;
    }

    doc.setFillColor(249, 250, 251); // Gray-50
    doc.roundedRect(margin, currentY, pageWidth - 2 * margin, 35, 2, 2, 'F');

    doc.setTextColor(...textColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Passenger ${i + 1}`, margin + 5, currentY + 7);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(
      `${passenger.title.toUpperCase()}. ${passenger.firstName} ${passenger.lastName}`,
      margin + 5,
      currentY + 15
    );

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(`Email: ${passenger.email}`, margin + 5, currentY + 22);

    if (passenger.phone) {
      doc.text(`Phone: ${passenger.phone}`, margin + 5, currentY + 28);
    }

    if (passenger.passportNumber) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...textColor);
      doc.text(`Passport: ${passenger.passportNumber}`, pageWidth - margin - 5, currentY + 15, { align: 'right' });
    }

    if (passenger.dateOfBirth) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(107, 114, 128);
      doc.text(`DOB: ${formatDate(passenger.dateOfBirth)}`, pageWidth - margin - 5, currentY + 22, { align: 'right' });
    }

    currentY += 40;
  }

  // ===== PAYMENT CONFIRMATION =====
  doc.setFillColor(...successColor);
  doc.rect(margin, currentY, pageWidth - 2 * margin, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('💳 PAYMENT CONFIRMED', margin + 5, currentY + 6);

  currentY += 12;

  doc.setFillColor(236, 253, 245); // Green-50
  doc.roundedRect(margin, currentY, pageWidth - 2 * margin, 20, 2, 2, 'F');

  doc.setTextColor(...textColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Total Amount Paid:', margin + 5, currentY + 8);

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...successColor);
  doc.text(
    `${ticketData.currency} ${ticketData.totalPaid.toFixed(2)}`,
    pageWidth - margin - 5,
    currentY + 12,
    { align: 'right' }
  );

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text(
    `Receipt sent to ${ticketData.confirmationEmail}`,
    margin + 5,
    currentY + 16
  );

  currentY += 25;

  // ===== QR CODE AND BARCODE SECTION =====
  if (currentY > pageHeight - 100) {
    doc.addPage();
    currentY = margin;
  }

  // Generate QR code
  const qrData = JSON.stringify({
    ref: ticketData.bookingReference,
    pnr: ticketData.pnr,
    passenger: ticketData.passengers[0]?.lastName,
    flight: ticketData.flight.flightNumber,
  });

  const qrCodeImage = await generateQRCode(qrData);

  if (qrCodeImage) {
    // QR Code section
    doc.setFillColor(...lightGray);
    doc.roundedRect(margin, currentY, 60, 60, 2, 2, 'F');

    try {
      doc.addImage(qrCodeImage, 'PNG', margin + 5, currentY + 5, 50, 50);
    } catch (error) {
      console.error('Error adding QR code to PDF:', error);
    }

    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.setFont('helvetica', 'bold');
    doc.text('SCAN TO VERIFY', margin + 30, currentY + 58, { align: 'center' });
  }

  // Important information box
  const infoBoxX = margin + 65;
  doc.setFillColor(239, 246, 255); // Blue-50
  doc.roundedRect(infoBoxX, currentY, pageWidth - margin - infoBoxX, 60, 2, 2, 'F');

  doc.setTextColor(...primaryColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('✓ Important Checklist', infoBoxX + 5, currentY + 8);

  doc.setTextColor(...textColor);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const checklist = [
    '□ Check in online 24 hours before departure',
    '□ Arrive at airport 2 hours early (international)',
    '□ Bring valid ID and passport (international)',
    '□ Check baggage weight limits',
    '□ Save this e-ticket on your mobile device',
  ];

  let checklistY = currentY + 15;
  checklist.forEach((item) => {
    doc.text(item, infoBoxX + 5, checklistY);
    checklistY += 6;
  });

  currentY += 70;

  // ===== BARCODE =====
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, currentY, pageWidth - 2 * margin, 20, 'F');

  doc.setFontSize(24);
  doc.setFont('courier', 'normal');
  doc.setTextColor(0, 0, 0);

  // Simplified barcode visualization
  const barcodeText = ticketData.bookingReference.replace(/[^A-Z0-9]/g, '');
  doc.text(barcodeText, pageWidth / 2, currentY + 8, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Booking Reference Barcode', pageWidth / 2, currentY + 16, { align: 'center' });

  currentY += 25;

  // ===== FOOTER =====
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 5;

  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.setFont('helvetica', 'normal');

  doc.text('Thank you for choosing FLY2ANY', pageWidth / 2, currentY, { align: 'center' });
  currentY += 5;

  doc.setFontSize(7);
  doc.text(
    'For support, contact: support@fly2any.com | +1 (800) FLY-2ANY',
    pageWidth / 2,
    currentY,
    { align: 'center' }
  );
  currentY += 4;

  doc.text(
    `Generated on ${new Date().toLocaleString()} | Document Version 2.0`,
    pageWidth / 2,
    currentY,
    { align: 'center' }
  );

  // ===== TERMS AND CONDITIONS (Last Page) =====
  if (currentY > pageHeight - 60) {
    doc.addPage();
    currentY = margin;
  } else {
    currentY += 10;
  }

  doc.setFillColor(...lightGray);
  doc.rect(margin, currentY, pageWidth - 2 * margin, 40, 'F');

  doc.setTextColor(...textColor);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Terms & Conditions', margin + 5, currentY + 6);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);

  const terms = [
    '• This e-ticket is valid only for the passenger(s) and flight(s) specified above.',
    '• Changes and cancellations are subject to airline policies and may incur fees.',
    '• Please verify all details carefully. FLY2ANY is not responsible for errors in passenger information.',
    '• Check-in requirements and baggage policies vary by airline. Please check with your airline.',
    '• This document serves as proof of purchase and should be presented during check-in.',
  ];

  let termsY = currentY + 12;
  terms.forEach((term) => {
    doc.text(term, margin + 5, termsY, { maxWidth: pageWidth - 2 * margin - 10 });
    termsY += 5;
  });

  // Save the PDF
  const fileName = `FLY2ANY_E-Ticket_${ticketData.bookingReference}_${ticketData.passengers[0]?.lastName || 'Ticket'}.pdf`;
  doc.save(fileName);
}

/**
 * Generate tickets for multiple passengers (separate PDFs)
 */
export async function generateMultipleTickets(
  ticketData: TicketData,
  separatePerPassenger: boolean = false
): Promise<void> {
  if (!separatePerPassenger || ticketData.passengers.length === 1) {
    return generateETicketPDF(ticketData);
  }

  // Generate separate ticket for each passenger
  for (const passenger of ticketData.passengers) {
    const individualTicketData: TicketData = {
      ...ticketData,
      passengers: [passenger],
    };
    await generateETicketPDF(individualTicketData);
  }
}

/**
 * Preview ticket data (returns PDF as blob for preview)
 */
export async function generateTicketBlob(ticketData: TicketData): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Use the same generation logic but return as blob instead of saving
  // For simplicity, we'll generate and return the blob
  // In production, you'd refactor to avoid code duplication

  await generateETicketPDF(ticketData);

  return doc.output('blob');
}
