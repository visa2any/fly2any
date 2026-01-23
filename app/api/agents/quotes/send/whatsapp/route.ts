import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Validation schema
const WhatsAppRequestSchema = z.object({
  phone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number cannot exceed 15 digits")
    .transform(phone => phone.replace(/[\s\-\(\)]/g, '')) // Remove spaces, dashes, parentheses
    .transform(phone => {
      // Add + prefix if missing (assumes international format)
      if (!phone.startsWith('+')) {
        return `+${phone}`;
      }
      return phone;
    })
    .refine(
      phone => /^\+[1-9]\d{1,14}$/.test(phone),
      "Invalid phone number format. Must be in E.164 format (e.g., +1234567890)"
    ),
  message: z.string()
    .min(1, "Message cannot be empty")
    .max(1000, "Message cannot exceed 1000 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    const validated = WhatsAppRequestSchema.parse(body);

    // Generate WhatsApp URL
    const encodedMessage = encodeURIComponent(validated.message);
    const whatsappUrl = `https://wa.me/${validated.phone}?text=${encodedMessage}`;

    // In production, this would integrate with WhatsApp Business API
    // For now, return URL for client-side opening
    console.log("[WHATSAPP_SEND]", {
      phone: validated.phone,
      messageLength: validated.message.length,
      urlGenerated: true,
    });

    return NextResponse.json({
      success: true,
      whatsappUrl,
    });
  } catch (error) {
    console.error("[WHATSAPP_SEND_ERROR]", error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to generate WhatsApp URL",
      },
      { status: 500 }
    );
  }
}
