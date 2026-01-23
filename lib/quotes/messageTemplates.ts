/**
 * Message Templates for Quote Delivery
 * 
 * Supports variable interpolation:
 * - {{clientName}} - Client's full name
 * - {{firstName}} - Client's first name
 * - {{destination}} - Trip destination
 * - {{total}} - Total price (formatted)
 * - {{perPerson}} - Per-person price (formatted)
 * - {{tripName}} - Trip name
 * - {{startDate}} - Trip start date
 * - {{endDate}} - Trip end date
 * - {{agentName}} - Agent's name
 * - {{quoteUrl}} - Public quote link
 */

export interface MessageTemplate {
  id: string;
  name: string;
  description: string;
  subject?: string;
  body: string;
  variables: TemplateVariable[];
}

export type TemplateVariable = 
  | "clientName" 
  | "firstName" 
  | "destination" 
  | "total" 
  | "perPerson"
  | "tripName"
  | "startDate"
  | "endDate"
  | "agentName"
  | "quoteUrl";

export const TEMPLATE_DEFINITIONS: Record<string, MessageTemplate> = {
  formal: {
    id: "formal",
    name: "Formal",
    description: "Professional business tone, suitable for corporate clients",
    subject: "{{tripName}} - Your Personalized Travel Quote",
    body: `Dear {{firstName}},

I'm pleased to present your personalized travel quote for {{tripName}} to {{destination}}.

**Trip Details:**
- Dates: {{startDate}} - {{endDate}}
- Total Investment: {{total}}
- Per Person: {{perPerson}}

This quote has been carefully curated based on your preferences and includes hand-selected accommodations, flights, and experiences tailored to your needs.

To view full itinerary, pricing breakdown, and to confirm your booking, please visit:

{{quoteUrl}}

**Next Steps:**
1. Review the detailed itinerary
2. Confirm your preferred options
3. Accept the quote to secure your booking

Should you have any questions or wish to make adjustments, please don't hesitate to reach out. I'm here to ensure this trip exceeds your expectations.

Looking forward to helping you create unforgettable memories.

Best regards,
{{agentName}}`,
    variables: ["firstName", "tripName", "destination", "startDate", "endDate", "total", "perPerson", "quoteUrl", "agentName"],
  },

  friendly: {
    id: "friendly",
    name: "Friendly",
    description: "Warm and personal tone, great for leisure travelers",
    subject: "Your dream trip to {{destination}} is ready! ✈️",
    body: `Hi {{firstName}}! 👋

I'm so excited to share your quote for {{tripName}} - this is going to be an amazing trip to {{destination}}! 🌟

**Here's what we've put together for you:**
- **Dates:** {{startDate}} - {{endDate}}
- **Total:** {{total}}
- **Per Person:** {{perPerson}}

I've hand-picked every detail to match what you're looking for - from flights and hotels to unique experiences you'll love!

**Click here to see everything:**
{{quoteUrl}}

Take your time to look through the itinerary. You can:
- View day-by-day plans
- See pricing breakdowns
- React to items you love (or suggest changes!)

Once you're ready, just hit "Confirm My Trip" and we'll get everything locked in for you.

Can't wait to hear what you think! Feel free to reach out with any questions.

Happy travels,
{{agentName}} 🌴`,
    variables: ["firstName", "tripName", "destination", "startDate", "endDate", "total", "perPerson", "quoteUrl", "agentName"],
  },

  minimal: {
    id: "minimal",
    name: "Minimal",
    description: "Concise and direct, get straight to the point",
    subject: "{{tripName}} - Quote Ready",
    body: `Hello {{clientName}},

Your travel quote for {{tripName}} is ready.

**Trip Summary:**
- Destination: {{destination}}
- Dates: {{startDate}} - {{endDate}}
- Total: {{total}}
- Per Person: {{perPerson}}

View full quote: {{quoteUrl}}

{{agentName}}`,
    variables: ["clientName", "tripName", "destination", "startDate", "endDate", "total", "perPerson", "quoteUrl", "agentName"],
  },
};

/**
 * Interpolate variables into template
 */
export function interpolateTemplate(
  template: string,
  variables: Partial<Record<TemplateVariable, string>>
): string {
  let result = template;
  
  for (const [key, value] of Object.entries(variables)) {
    const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(pattern, value || '');
  }
  
  return result;
}

/**
 * Prepare variables for interpolation
 */
export function prepareTemplateVariables(
  quote: {
    tripName: string;
    destination?: string;
    startDate?: string;
    endDate?: string;
    total: number;
    currency: string;
    viewToken: string;
  },
  client: {
    firstName: string;
    lastName: string;
  },
  agent: {
    name?: string;
    businessName?: string;
  },
  travelers: number
): Record<TemplateVariable, string> {
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: quote.currency || 'USD',
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (date?: string) => 
    date 
      ? new Date(date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        })
      : 'TBD';

  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

  return {
    clientName: `${client.firstName} ${client.lastName}`,
    firstName: client.firstName,
    destination: quote.destination || 'your destination',
    total: formatCurrency(quote.total),
    perPerson: formatCurrency(quote.total / travelers),
    tripName: quote.tripName,
    startDate: formatDate(quote.startDate),
    endDate: formatDate(quote.endDate),
    agentName: agent.name || agent.businessName || 'Your Travel Advisor',
    quoteUrl: `${baseUrl}/quote/${quote.viewToken}`,
  };
}

/**
 * Get all templates
 */
export function getAllTemplates(): MessageTemplate[] {
  return Object.values(TEMPLATE_DEFINITIONS);
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): MessageTemplate | undefined {
  return TEMPLATE_DEFINITIONS[id];
}
