import { renderToBuffer } from '@react-pdf/renderer';
import { ItineraryTemplate } from './ItineraryTemplate';
import { prisma } from '@/lib/prisma';
import React from 'react';

interface GeneratePDFOptions {
  quoteId: string;
  agentId: string;
}

interface PDFResult {
  buffer: Buffer;
  filename: string;
  contentType: string;
}

/**
 * Generate PDF itinerary from quote data
 */
export async function generateQuotePDF(options: GeneratePDFOptions): Promise<PDFResult> {
  const { quoteId, agentId } = options;

  // Fetch quote with all relations
  const quote = await prisma!.agentQuote.findFirst({
    where: {
      id: quoteId,
      agentId: agentId, // Ensure agent owns this quote
    },
    include: {
      client: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      agent: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          company: true,
        },
      },
    },
  });

  if (!quote) {
    throw new Error('Quote not found or access denied');
  }

  // Prepare data for template
  const data = {
    quote: {
      tripName: quote.tripName,
      destination: quote.destination,
      startDate: quote.startDate.toISOString(),
      endDate: quote.endDate.toISOString(),
      duration: quote.duration,
      travelers: quote.travelers,
      adults: quote.adults,
      children: quote.children,
      infants: quote.infants,
      flights: quote.flights as any,
      hotels: quote.hotels as any,
      activities: quote.activities as any,
      transfers: quote.transfers as any,
      carRentals: quote.carRentals as any,
      insurance: quote.insurance as any,
      customItems: quote.customItems as any,
      flightsCost: quote.flightsCost,
      hotelsCost: quote.hotelsCost,
      activitiesCost: quote.activitiesCost,
      transfersCost: quote.transfersCost,
      carRentalsCost: quote.carRentalsCost,
      insuranceCost: quote.insuranceCost,
      customItemsCost: quote.customItemsCost,
      subtotal: quote.subtotal,
      agentMarkup: quote.agentMarkup,
      agentMarkupPercent: quote.agentMarkupPercent,
      taxes: quote.taxes,
      fees: quote.fees,
      discount: quote.discount,
      total: quote.total,
      currency: quote.currency,
      notes: quote.notes,
      quoteNumber: quote.quoteNumber,
      createdAt: quote.createdAt.toISOString(),
      expiresAt: quote.expiresAt.toISOString(),
    },
    client: {
      firstName: quote.client.firstName,
      lastName: quote.client.lastName,
      email: quote.client.email,
      phone: quote.client.phone,
    },
    agent: {
      firstName: quote.agent.firstName,
      lastName: quote.agent.lastName,
      email: quote.agent.email,
      phone: quote.agent.phone,
      company: quote.agent.company,
    },
  };

  // Generate PDF
  const pdfDocument = React.createElement(ItineraryTemplate, { data } as any);
  const buffer = await renderToBuffer(pdfDocument as any);

  // Generate filename
  const filename = `Itinerary-${quote.tripName.replace(/[^a-zA-Z0-9]/g, '-')}-${quote.quoteNumber}.pdf`;

  return {
    buffer,
    filename,
    contentType: 'application/pdf',
  };
}

/**
 * Generate PDF and send via email
 */
export async function sendQuotePDFEmail(options: GeneratePDFOptions & { emailService: any }): Promise<void> {
  const { quoteId, agentId, emailService } = options;

  // Generate PDF
  const pdfResult = await generateQuotePDF({ quoteId, agentId });

  // Fetch quote for email details
  const quote = await prisma!.agentQuote.findFirst({
    where: { id: quoteId, agentId },
    include: {
      client: true,
      agent: true,
    },
  });

  if (!quote) {
    throw new Error('Quote not found');
  }

  // Send email with PDF attachment
  await emailService.send({
    to: quote.client.email,
    subject: `Your Travel Itinerary: ${quote.tripName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">Your Travel Itinerary is Ready!</h2>

        <p>Dear ${quote.client.firstName},</p>

        <p>Please find attached your personalized travel itinerary for <strong>${quote.tripName}</strong>.</p>

        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1F2937;">Trip Summary</h3>
          <ul style="color: #4B5563; line-height: 1.8;">
            <li><strong>Destination:</strong> ${quote.destination}</li>
            <li><strong>Dates:</strong> ${new Date(quote.startDate).toLocaleDateString()} - ${new Date(quote.endDate).toLocaleDateString()}</li>
            <li><strong>Duration:</strong> ${quote.duration} ${quote.duration === 1 ? 'Day' : 'Days'}</li>
            <li><strong>Travelers:</strong> ${quote.travelers}</li>
            <li><strong>Total Price:</strong> ${quote.currency} ${quote.total.toLocaleString()}</li>
          </ul>
        </div>

        ${quote.notes ? `
          <div style="background-color: #FEF3C7; padding: 15px; border-left: 4px solid #F59E0B; margin: 20px 0;">
            <p style="margin: 0; color: #92400E;"><strong>Note from your travel agent:</strong></p>
            <p style="margin: 10px 0 0 0; color: #78350F;">${quote.notes}</p>
          </div>
        ` : ''}

        <p>If you have any questions or would like to proceed with booking, please don't hesitate to contact me.</p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
          <p style="margin: 5px 0; color: #6B7280;"><strong>${quote.agent.firstName} ${quote.agent.lastName}</strong></p>
          ${quote.agent.company ? `<p style="margin: 5px 0; color: #6B7280;">${quote.agent.company}</p>` : ''}
          <p style="margin: 5px 0; color: #6B7280;">Email: ${quote.agent.email}</p>
          ${quote.agent.phone ? `<p style="margin: 5px 0; color: #6B7280;">Phone: ${quote.agent.phone}</p>` : ''}
        </div>

        <p style="margin-top: 30px; font-size: 12px; color: #9CA3AF; text-align: center;">
          This itinerary is valid until ${new Date(quote.expiresAt).toLocaleDateString()}
        </p>
      </div>
    `,
    attachments: [
      {
        filename: pdfResult.filename,
        content: pdfResult.buffer,
        contentType: pdfResult.contentType,
      },
    ],
  });
}

/**
 * Stream PDF for download
 */
export function streamPDF(buffer: Buffer, filename: string): Response {
  return new Response(buffer as any, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length.toString(),
    },
  });
}
