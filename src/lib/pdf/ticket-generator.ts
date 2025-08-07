/**
 * 🎫 PDF TICKET GENERATION SYSTEM
 * Professional e-ticket generation with QR codes and boarding pass styling
 */

import jsPDF from 'jspdf';
import QRCode from 'qrcode';

export interface TicketData {
  bookingReference: string;
  passengerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  flightDetails: {
    outbound: {
      departure: {
        iataCode: string;
        airportName: string;
        city: string;
        date: string;
        time: string;
        terminal?: string;
        gate?: string;
      };
      arrival: {
        iataCode: string;
        airportName: string;
        city: string;
        date: string;
        time: string;
        terminal?: string;
      };
      airline: {
        name: string;
        code: string;
        logo?: string;
      };
      flightNumber: string;
      aircraft?: string;
      duration: string;
      seat?: string;
      cabin: string;
    };
    inbound?: any; // Same structure as outbound for return flights
  };
  pricing: {
    totalPrice: number;
    currency: string;
    breakdown?: {
      basePrice: number;
      taxes: number;
      fees: number;
    };
  };
  services?: {
    baggage?: string;
    meal?: string;
    seatSelection?: string;
    insurance?: boolean;
  };
  bookingDate: string;
  paymentStatus: string;
}

export class TicketGenerator {
  private doc: jsPDF;
  private readonly pageWidth = 210; // A4 width in mm
  private readonly pageHeight = 297; // A4 height in mm
  private readonly margin = 20;

  constructor() {
    this.doc = new jsPDF('portrait', 'mm', 'a4');
  }

  /**
   * Generate complete PDF ticket
   */
  async generateTicket(ticketData: TicketData): Promise<Buffer> {
    console.log('🎫 Generating PDF ticket for:', ticketData.bookingReference);

    try {
      // Set document properties
      this.doc.setProperties({
        title: `Flight Ticket - ${ticketData.bookingReference}`,
        subject: 'E-Ticket',
        author: 'Fly2Any',
        creator: 'Fly2Any Booking System'
      });

      // Generate ticket layout
      await this.generateHeader(ticketData);
      await this.generateBookingInfo(ticketData);
      await this.generateFlightInfo(ticketData);
      await this.generatePassengerInfo(ticketData);
      await this.generateQRCode(ticketData);
      await this.generateFooter(ticketData);

      // If return flight exists, add second page
      if (ticketData.flightDetails.inbound) {
        this.doc.addPage();
        await this.generateReturnFlight(ticketData);
      }

      // Convert to buffer
      const pdfBuffer = Buffer.from(this.doc.output('arraybuffer'));
      console.log('✅ PDF ticket generated successfully');
      
      return pdfBuffer;

    } catch (error) {
      console.error('❌ PDF generation error:', error);
      throw new Error('Failed to generate PDF ticket');
    }
  }

  /**
   * Generate ticket header with branding
   */
  private async generateHeader(ticketData: TicketData): Promise<void> {
    // Background header
    this.doc.setFillColor(59, 130, 246); // Blue
    this.doc.rect(0, 0, this.pageWidth, 40, 'F');

    // Company logo and name
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('✈️ Fly2Any', this.margin, 25);

    // E-Ticket label
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('ELECTRONIC TICKET', this.pageWidth - this.margin - 60, 25);

    // Booking reference (large)
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`Booking: ${ticketData.bookingReference}`, this.pageWidth - this.margin - 60, 35);
  }

  /**
   * Generate booking information section
   */
  private async generateBookingInfo(ticketData: TicketData): Promise<void> {
    let yPos = 60;

    // Section title
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('BOOKING INFORMATION', this.margin, yPos);

    yPos += 10;
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(this.margin, yPos, this.pageWidth - this.margin, yPos);

    yPos += 15;

    // Booking details
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    const bookingInfo = [
      ['Booking Reference:', ticketData.bookingReference],
      ['Booking Date:', new Date(ticketData.bookingDate).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      })],
      ['Payment Status:', ticketData.paymentStatus.toUpperCase()],
      ['Total Amount:', `${ticketData.pricing.currency} ${ticketData.pricing.totalPrice.toFixed(2)}`]
    ];

    bookingInfo.forEach(([label, value]) => {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(label, this.margin, yPos);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(value, this.margin + 50, yPos);
      yPos += 8;
    });
  }

  /**
   * Generate main flight information
   */
  private async generateFlightInfo(ticketData: TicketData): Promise<void> {
    let yPos = 140;
    const flight = ticketData.flightDetails.outbound;

    // Section title
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('OUTBOUND FLIGHT', this.margin, yPos);

    yPos += 10;
    this.doc.line(this.margin, yPos, this.pageWidth - this.margin, yPos);

    // Flight header with airline and flight number
    yPos += 15;
    this.doc.setFillColor(248, 250, 252);
    this.doc.rect(this.margin, yPos - 5, this.pageWidth - 2 * this.margin, 20, 'F');

    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`${flight.airline.name} - ${flight.flightNumber}`, this.margin + 5, yPos + 5);
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Aircraft: ${flight.aircraft || 'TBD'}`, this.margin + 5, yPos + 12);

    // Flight route (large)
    yPos += 30;
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    const routeText = `${flight.departure.iataCode} → ${flight.arrival.iataCode}`;
    const routeWidth = this.doc.getTextWidth(routeText);
    this.doc.text(routeText, (this.pageWidth - routeWidth) / 2, yPos);

    // Departure and arrival info side by side
    yPos += 20;
    const leftCol = this.margin;
    const rightCol = this.pageWidth / 2 + 10;

    // Departure
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('DEPARTURE', leftCol, yPos);
    
    yPos += 8;
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    const depInfo = [
      `${flight.departure.city} (${flight.departure.iataCode})`,
      flight.departure.airportName,
      `${flight.departure.date} at ${flight.departure.time}`,
      flight.departure.terminal ? `Terminal: ${flight.departure.terminal}` : '',
      flight.departure.gate ? `Gate: ${flight.departure.gate}` : 'Gate: TBD'
    ];

    depInfo.forEach(info => {
      if (info) {
        this.doc.text(info, leftCol, yPos);
        yPos += 6;
      }
    });

    // Arrival
    yPos = 188; // Reset to same level as departure
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('ARRIVAL', rightCol, yPos);
    
    yPos += 8;
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    const arrInfo = [
      `${flight.arrival.city} (${flight.arrival.iataCode})`,
      flight.arrival.airportName,
      `${flight.arrival.date} at ${flight.arrival.time}`,
      flight.arrival.terminal ? `Terminal: ${flight.arrival.terminal}` : '',
      `Duration: ${flight.duration}`
    ];

    arrInfo.forEach(info => {
      if (info) {
        this.doc.text(info, rightCol, yPos);
        yPos += 6;
      }
    });
  }

  /**
   * Generate passenger information
   */
  private async generatePassengerInfo(ticketData: TicketData): Promise<void> {
    let yPos = 250;

    // Section title
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('PASSENGER INFORMATION', this.margin, yPos);

    yPos += 10;
    this.doc.line(this.margin, yPos, this.pageWidth - this.margin, yPos);

    yPos += 15;

    // Passenger details
    this.doc.setFontSize(10);
    const passengerInfo = [
      ['Name:', `${ticketData.passengerInfo.firstName} ${ticketData.passengerInfo.lastName}`],
      ['Email:', ticketData.passengerInfo.email],
      ['Phone:', ticketData.passengerInfo.phone || 'Not provided'],
      ['Seat:', ticketData.flightDetails.outbound.seat || 'To be assigned'],
      ['Class:', ticketData.flightDetails.outbound.cabin]
    ];

    passengerInfo.forEach(([label, value]) => {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(label, this.margin, yPos);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(value, this.margin + 30, yPos);
      yPos += 8;
    });

    // Services if any
    if (ticketData.services) {
      yPos += 5;
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Additional Services:', this.margin, yPos);
      yPos += 8;

      this.doc.setFont('helvetica', 'normal');
      Object.entries(ticketData.services).forEach(([service, value]) => {
        if (value) {
          this.doc.text(`• ${service}: ${value === true ? 'Yes' : value}`, this.margin + 5, yPos);
          yPos += 6;
        }
      });
    }
  }

  /**
   * Generate QR code for digital verification
   */
  private async generateQRCode(ticketData: TicketData): Promise<void> {
    try {
      // QR Code data
      const qrData = JSON.stringify({
        ref: ticketData.bookingReference,
        passenger: `${ticketData.passengerInfo.firstName} ${ticketData.passengerInfo.lastName}`,
        flight: ticketData.flightDetails.outbound.flightNumber,
        departure: ticketData.flightDetails.outbound.departure.iataCode,
        arrival: ticketData.flightDetails.outbound.arrival.iataCode,
        date: ticketData.flightDetails.outbound.departure.date,
        time: ticketData.flightDetails.outbound.departure.time
      });

      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 100,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Position QR code on the right side
      const qrSize = 25;
      const qrX = this.pageWidth - this.margin - qrSize;
      const qrY = 60;

      // Add QR code to PDF
      this.doc.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

      // QR code label
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text('Scan for verification', qrX - 5, qrY + qrSize + 5);

    } catch (error) {
      console.error('❌ QR code generation error:', error);
      // Continue without QR code if generation fails
    }
  }

  /**
   * Generate footer with important information
   */
  private async generateFooter(ticketData: TicketData): Promise<void> {
    const footerY = this.pageHeight - 30;

    // Footer background
    this.doc.setFillColor(248, 250, 252);
    this.doc.rect(0, footerY - 5, this.pageWidth, 30, 'F');

    // Important notices
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(220, 38, 127); // Pink
    this.doc.text('IMPORTANT NOTICES:', this.margin, footerY + 5);

    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    const notices = [
      '• Please arrive at the airport at least 2 hours before domestic flights, 3 hours before international flights',
      '• Bring valid photo ID and this e-ticket for check-in',
      '• Check-in online 24 hours before departure to save time',
      '• Contact Fly2Any support: +1-888-FLY-2ANY or support@fly2any.com'
    ];

    let noticeY = footerY + 10;
    notices.forEach(notice => {
      this.doc.text(notice, this.margin, noticeY);
      noticeY += 4;
    });
  }

  /**
   * Generate return flight page (if applicable)
   */
  private async generateReturnFlight(ticketData: TicketData): Promise<void> {
    if (!ticketData.flightDetails.inbound) return;

    // Similar to outbound flight but for return
    await this.generateHeader(ticketData);
    
    let yPos = 60;
    const flight = ticketData.flightDetails.inbound;

    // Section title
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('RETURN FLIGHT', this.margin, yPos);

    // Rest of the implementation follows the same pattern as outbound flight
    // ... (implementing similar structure for return flight)
  }
}

/**
 * Main function to generate PDF ticket
 */
export async function generatePDFTicket(ticketData: TicketData): Promise<Buffer> {
  const generator = new TicketGenerator();
  return await generator.generateTicket(ticketData);
}

/**
 * Generate PDF ticket from booking data
 */
export async function generateTicketFromBooking(bookingData: any): Promise<Buffer> {
  const ticketData: TicketData = {
    bookingReference: bookingData.bookingReference,
    passengerInfo: {
      firstName: bookingData.passengerInfo.firstName || bookingData.passengerInfo.name?.firstName,
      lastName: bookingData.passengerInfo.lastName || bookingData.passengerInfo.name?.lastName,
      email: bookingData.passengerInfo.email,
      phone: bookingData.passengerInfo.phone
    },
    flightDetails: bookingData.flightDetails,
    pricing: bookingData.pricing,
    services: bookingData.services,
    bookingDate: bookingData.bookingDate,
    paymentStatus: bookingData.paymentStatus
  };

  return await generatePDFTicket(ticketData);
}