// lib/pdf/pdf-service.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface PDFOptions { quoteId: string; agentId: string; }
interface PDFResult { buffer: Buffer; filename: string; }

export async function generateQuotePDF(options: PDFOptions): Promise<PDFResult> {
  const { quoteId, agentId } = options;
  const quote = await prisma!.agentQuote.findFirst({
    where: { id: quoteId, agentId },
    include: { client: true, agent: { include: { user: true } } },
  });
  if (!quote) throw new Error("Quote not found or access denied");
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:sans-serif;padding:40px;max-width:800px;margin:0 auto}.header{border-bottom:3px solid #E74035;padding-bottom:20px;margin-bottom:30px}.logo{font-size:28px;font-weight:800;color:#E74035}.section{margin-bottom:30px}.section-title{font-size:18px;font-weight:700;color:#E74035;margin-bottom:15px}.item{background:#fafafa;padding:15px;border-radius:6px;margin-bottom:12px}.total{font-size:24px;font-weight:700;color:#E74035;margin-top:20px}</style></head><body><div class="header"><div class="logo">Fly2Any</div><p>Quote #${quote.quoteNumber}</p></div><div class="section"><h2 class="section-title">Client</h2><p>${quote.client.firstName} ${quote.client.lastName}<br>${quote.client.email}</p></div><div class="section"><h2 class="section-title">Trip</h2><div class="item"><strong>${quote.tripName}</strong><br>${quote.destination}<br>${new Date(quote.startDate).toLocaleDateString()} - ${new Date(quote.endDate).toLocaleDateString()}</div></div><div class="total">Total: $${quote.total.toFixed(0)} USD</div><p style="margin-top:30px;text-align:center;color:#666">Valid until ${new Date(quote.expiresAt).toLocaleDateString()}</p></body></html>`;
  const buffer = Buffer.from(html);
  return { buffer, filename: `Quote-${quote.quoteNumber}.pdf` };
}

export function streamPDF(buffer: Buffer, filename: string) {
  return new NextResponse(buffer, {
    headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${filename}"` },
  });
}
