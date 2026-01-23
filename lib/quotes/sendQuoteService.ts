/**
 * Quote Sending Service
 * 
 * Handles sending quotes via email and WhatsApp
 */

export interface SendEmailParams {
  quoteId: string;
  to: string;
  subject: string;
  message: string;
}

export interface SendWhatsAppParams {
  phone: string;
  message: string;
}

export interface SendWhatsAppResult {
  success: boolean;
  error?: string;
  whatsappUrl?: string;
}

/**
 * Send quote via email
 */
export async function sendQuoteEmail(params: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/agents/quotes/${params.quoteId}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel: "email",
        to: params.to,
        subject: params.subject,
        message: params.message,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to send email");
    }

    return { success: true };
  } catch (error) {
    console.error("Email sending failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

/**
 * Send quote via WhatsApp
 */
export async function sendQuoteWhatsApp(params: SendWhatsAppParams): Promise<SendWhatsAppResult> {
  try {
    const response = await fetch(`/api/agents/quotes/send/whatsapp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: params.phone,
        message: params.message,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to send WhatsApp");
    }

    // Open WhatsApp in new tab if URL provided
    if (data.whatsappUrl && typeof window !== "undefined") {
      window.open(data.whatsappUrl, "_blank", "noopener,noreferrer");
    }

    return { 
      success: true,
      whatsappUrl: data.whatsappUrl 
    };
  } catch (error) {
    console.error("WhatsApp sending failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send WhatsApp",
    };
  }
}
