// lib/pdf/pdf-service.ts
import React from "react";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import ReactPDF from "@react-pdf/renderer";
import QuotePDFTemplate from "./quote-pdf-template";

interface PDFOptions {
  quoteId: string;
  agentId: string;
}

interface PDFResult {
  buffer: Buffer;
  filename: string;
}

export async function generateQuotePDF(options: PDFOptions): Promise<PDFResult> {
  const { quoteId, agentId } = options;

  // Fetch quote with all necessary relations
  const quote = await prisma!.agentQuote.findFirst({
    where: { id: quoteId, agentId },
    include: {
      client: true,
      agent: {
        include: {
          user: true
        }
      }
    },
  });

  if (!quote) {
    throw new Error("Quote not found or access denied");
  }

  // Generate PDF using React PDF renderer
  const buffer = await ReactPDF.renderToBuffer(
    <QuotePDFTemplate quote={quote} />
  );

  return {
    buffer,
    filename: `Fly2Any-Quote-${quote.quoteNumber}.pdf`
  };
}

export function streamPDF(buffer: Buffer, filename: string) {
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
