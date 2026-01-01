export const dynamic = 'force-dynamic';

// White-Label PDF Generation API
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const PdfOptionsSchema = z.object({
  // Branding
  includeLogo: z.boolean().default(true),
  customLogo: z.string().optional(),
  brandColor: z.string().optional(),
  headerText: z.string().optional(),
  footerText: z.string().optional(),
  // Content
  includeItinerary: z.boolean().default(true),
  includePricing: z.boolean().default(true),
  includeTerms: z.boolean().default(true),
  includePhotos: z.boolean().default(true),
  // Format
  paperSize: z.enum(["A4", "Letter"]).default("A4"),
  orientation: z.enum(["portrait", "landscape"]).default("portrait"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const agent = await prisma!.travelAgent.findUnique({
      where: { userId: session.user.id },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const quote = await prisma!.agentQuote.findFirst({
      where: { id, agentId: agent.id },
      include: { client: true },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    const body = await request.json();
    const options = PdfOptionsSchema.parse(body);

    // Build HTML content for PDF
    const logo = options.customLogo || agent.logo;
    const color = options.brandColor || agent.brandColor || "#E74035";
    const agentName = agent.firstName && agent.lastName
      ? `${agent.firstName} ${agent.lastName}`
      : agent.agencyName || "Travel Agent";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; line-height: 1.6; }
          .header { background: ${color}; color: white; padding: 40px; display: flex; justify-content: space-between; align-items: center; }
          .logo { max-height: 60px; max-width: 200px; }
          .header-text { text-align: right; }
          .header h1 { font-size: 28px; font-weight: 600; }
          .header p { opacity: 0.9; font-size: 14px; }
          .content { padding: 40px; }
          .trip-title { font-size: 32px; font-weight: 700; color: ${color}; margin-bottom: 8px; }
          .destination { font-size: 20px; color: #666; margin-bottom: 24px; }
          .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; }
          .meta-item { background: #f5f5f5; padding: 16px; border-radius: 8px; }
          .meta-label { font-size: 12px; color: #888; text-transform: uppercase; }
          .meta-value { font-size: 18px; font-weight: 600; color: #1a1a1a; }
          .section { margin-bottom: 32px; }
          .section-title { font-size: 20px; font-weight: 600; color: ${color}; border-bottom: 2px solid ${color}; padding-bottom: 8px; margin-bottom: 16px; }
          .item-card { background: #fafafa; border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
          .item-header { display: flex; justify-content: space-between; align-items: start; }
          .item-title { font-weight: 600; font-size: 16px; }
          .item-price { font-weight: 700; color: ${color}; }
          .item-details { color: #666; font-size: 14px; margin-top: 8px; }
          .pricing-box { background: #f8f8f8; border: 2px solid ${color}; border-radius: 12px; padding: 24px; }
          .pricing-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0; }
          .pricing-row:last-child { border-bottom: none; }
          .pricing-total { font-size: 24px; font-weight: 700; color: ${color}; }
          .terms { background: #fafafa; padding: 20px; border-radius: 8px; font-size: 12px; color: #666; }
          .footer { background: #f5f5f5; padding: 24px 40px; text-align: center; color: #888; font-size: 12px; margin-top: 40px; }
          .footer a { color: ${color}; }
          .client-info { background: linear-gradient(135deg, #f8f8f8, #fff); padding: 20px; border-radius: 8px; margin-bottom: 24px; }
        </style>
      </head>
      <body>
        <div class="header">
          ${logo && options.includeLogo ? `<img src="${logo}" alt="Logo" class="logo">` : `<span style="font-size: 24px; font-weight: 700;">${agentName}</span>`}
          <div class="header-text">
            ${options.headerText ? `<p>${options.headerText}</p>` : `<p>Quote #${quote.quoteNumber}</p>`}
            <p>${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        <div class="content">
          <div class="client-info">
            <p style="color: #888; font-size: 12px;">PREPARED FOR</p>
            <p style="font-size: 20px; font-weight: 600;">${quote.client.firstName} ${quote.client.lastName}</p>
            <p style="color: #666;">${quote.client.email}</p>
          </div>

          <h1 class="trip-title">${quote.tripName}</h1>
          <p class="destination">${quote.destination}</p>

          <div class="meta-grid">
            <div class="meta-item">
              <p class="meta-label">Departure</p>
              <p class="meta-value">${new Date(quote.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
            <div class="meta-item">
              <p class="meta-label">Return</p>
              <p class="meta-value">${new Date(quote.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
            <div class="meta-item">
              <p class="meta-label">Duration</p>
              <p class="meta-value">${quote.duration} Days</p>
            </div>
            <div class="meta-item">
              <p class="meta-label">Travelers</p>
              <p class="meta-value">${quote.travelers} ${quote.travelers === 1 ? 'Person' : 'People'}</p>
            </div>
          </div>

          ${options.includeItinerary ? `
            ${(quote.flights as any[])?.length > 0 ? `
              <div class="section">
                <h2 class="section-title">Flights</h2>
                ${(quote.flights as any[]).map((f: any) => `
                  <div class="item-card">
                    <div class="item-header">
                      <div>
                        <p class="item-title">${f.from} → ${f.to}</p>
                        <p class="item-details">${f.airline} ${f.flight} • ${f.date} at ${f.time}</p>
                      </div>
                      <span class="item-price">$${f.price?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            ${(quote.hotels as any[])?.length > 0 ? `
              <div class="section">
                <h2 class="section-title">Accommodations</h2>
                ${(quote.hotels as any[]).map((h: any) => `
                  <div class="item-card">
                    <div class="item-header">
                      <div>
                        <p class="item-title">${h.name}</p>
                        <p class="item-details">${h.roomType} • ${h.nights} nights • ${h.location}</p>
                      </div>
                      <span class="item-price">$${h.price?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            ${(quote.activities as any[])?.length > 0 ? `
              <div class="section">
                <h2 class="section-title">Activities & Experiences</h2>
                ${(quote.activities as any[]).map((a: any) => `
                  <div class="item-card">
                    <div class="item-header">
                      <div>
                        <p class="item-title">${a.name}</p>
                        <p class="item-details">${a.description || ''} ${a.date ? `• ${a.date}` : ''}</p>
                      </div>
                      <span class="item-price">$${a.price?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          ` : ''}

          ${options.includePricing ? `
            <div class="section">
              <h2 class="section-title">Investment Summary</h2>
              <div class="pricing-box">
                <div class="pricing-row">
                  <span>Subtotal</span>
                  <span>$${quote.subtotal.toLocaleString()}</span>
                </div>
                ${quote.taxes > 0 ? `<div class="pricing-row"><span>Taxes</span><span>$${quote.taxes.toLocaleString()}</span></div>` : ''}
                ${quote.fees > 0 ? `<div class="pricing-row"><span>Fees</span><span>$${quote.fees.toLocaleString()}</span></div>` : ''}
                ${quote.discount > 0 ? `<div class="pricing-row"><span>Discount</span><span style="color: #27C56B;">-$${quote.discount.toLocaleString()}</span></div>` : ''}
                <div class="pricing-row" style="margin-top: 12px; padding-top: 12px; border-top: 2px solid ${color};">
                  <span class="pricing-total">Total</span>
                  <span class="pricing-total">$${quote.total.toLocaleString()} ${quote.currency}</span>
                </div>
                <p style="text-align: center; color: #888; font-size: 14px; margin-top: 12px;">
                  $${Math.round(quote.total / quote.travelers).toLocaleString()} per person
                </p>
              </div>
            </div>
          ` : ''}

          ${quote.inclusions?.length > 0 ? `
            <div class="section">
              <h2 class="section-title">What's Included</h2>
              <ul style="list-style: none; padding: 0;">
                ${quote.inclusions.map(i => `<li style="padding: 8px 0; border-bottom: 1px solid #eee;">✓ ${i}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${options.includeTerms && quote.termsAndConditions ? `
            <div class="section">
              <h2 class="section-title">Terms & Conditions</h2>
              <div class="terms">${quote.termsAndConditions}</div>
            </div>
          ` : ''}
        </div>

        <div class="footer">
          ${options.footerText || `
            <p>Quote valid until ${new Date(quote.expiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            <p style="margin-top: 8px;">Contact: ${agent.email} | ${agent.phone || ''}</p>
          `}
        </div>
      </body>
      </html>
    `;

    // In production, use a PDF generation service like Puppeteer or PDFKit
    // For now, return the HTML that can be converted to PDF on client side
    return NextResponse.json({
      html: htmlContent,
      filename: `${quote.quoteNumber}-${quote.tripName.replace(/\s+/g, '-')}.pdf`,
      quote: {
        id: quote.id,
        quoteNumber: quote.quoteNumber,
        tripName: quote.tripName,
      },
    });

  } catch (error) {
    console.error("[WHITE_LABEL_PDF_ERROR]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
