// ═══════════════════════════════════════════════════════════════════════════════
// RETENTION TRIGGERS - Lifecycle automation events
// All must feel helpful, not salesy
// ═══════════════════════════════════════════════════════════════════════════════

export type TriggerType =
  | "booking_confirmed"
  | "pre_trip_reminder"
  | "day_before_checkin"
  | "post_trip_feedback"
  | "re_engagement";

export interface RetentionTrigger {
  type: TriggerType;
  scheduledAt: Date | null; // null = immediate
  channel: "email" | "sms" | "push";
  template: string;
  metadata: Record<string, unknown>;
}

export interface BookingData {
  bookingId: string;
  clientEmail: string;
  clientName: string;
  destination: string;
  startDate: string;
  endDate: string;
  agentName?: string;
  agentEmail?: string;
  total: number;
  currency: string;
}

// Generate all retention triggers for a booking
export function generateRetentionTriggers(booking: BookingData): RetentionTrigger[] {
  const startDate = new Date(booking.startDate);
  const endDate = new Date(booking.endDate);

  const triggers: RetentionTrigger[] = [
    // 1. Immediate: Booking confirmation
    {
      type: "booking_confirmed",
      scheduledAt: null, // Immediate
      channel: "email",
      template: "booking-confirmation",
      metadata: {
        subject: `Your trip to ${booking.destination} is confirmed!`,
        bookingRef: booking.bookingId,
        ...booking,
      },
    },

    // 2. 7 days before: Pre-trip reminder
    {
      type: "pre_trip_reminder",
      scheduledAt: new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000),
      channel: "email",
      template: "pre-trip-reminder",
      metadata: {
        subject: `7 days until ${booking.destination} - Here's what you need`,
        daysUntilTrip: 7,
        ...booking,
      },
    },

    // 3. Day before: Travel check-in
    {
      type: "day_before_checkin",
      scheduledAt: new Date(startDate.getTime() - 1 * 24 * 60 * 60 * 1000),
      channel: "email",
      template: "day-before-checkin",
      metadata: {
        subject: `Ready for tomorrow? Your ${booking.destination} trip checklist`,
        ...booking,
      },
    },

    // 4. 2 days after return: Post-trip feedback
    {
      type: "post_trip_feedback",
      scheduledAt: new Date(endDate.getTime() + 2 * 24 * 60 * 60 * 1000),
      channel: "email",
      template: "post-trip-feedback",
      metadata: {
        subject: `How was ${booking.destination}? We'd love your feedback`,
        feedbackUrl: `/feedback/${booking.bookingId}`,
        ...booking,
      },
    },

    // 5. 60 days after: Soft re-engagement
    {
      type: "re_engagement",
      scheduledAt: new Date(endDate.getTime() + 60 * 24 * 60 * 60 * 1000),
      channel: "email",
      template: "soft-re-engagement",
      metadata: {
        subject: `Planning your next adventure?`,
        lastDestination: booking.destination,
        ...booking,
      },
    },
  ];

  // Filter out past dates
  const now = new Date();
  return triggers.filter(
    (t) => t.scheduledAt === null || t.scheduledAt > now
  );
}

// Email template content generators (for preview/testing)
export const EMAIL_TEMPLATES: Record<string, (data: BookingData) => { subject: string; preview: string }> = {
  "booking-confirmation": (data) => ({
    subject: `Your trip to ${data.destination} is confirmed!`,
    preview: `Thank you for booking with us, ${data.clientName}. Your trip is officially in progress.`,
  }),
  "pre-trip-reminder": (data) => ({
    subject: `7 days until ${data.destination} - Here's what you need`,
    preview: `Your adventure is almost here! Here's everything you need to know.`,
  }),
  "day-before-checkin": (data) => ({
    subject: `Ready for tomorrow? Your ${data.destination} trip checklist`,
    preview: `Just checking in before your big day. Have a wonderful trip!`,
  }),
  "post-trip-feedback": (data) => ({
    subject: `How was ${data.destination}? We'd love your feedback`,
    preview: `We hope you had an amazing time. Your feedback helps us improve.`,
  }),
  "soft-re-engagement": (data) => ({
    subject: `Planning your next adventure?`,
    preview: `It's been a while since ${data.destination}. Ready for another trip?`,
  }),
};

// Dispatch trigger to backend (mock implementation)
export async function dispatchTrigger(trigger: RetentionTrigger): Promise<{ success: boolean; triggerId: string }> {
  // In production: Call scheduling API (e.g., Resend, SendGrid, Customer.io)
  console.log("[Retention] Dispatching trigger:", trigger.type, trigger.scheduledAt || "immediate");

  return {
    success: true,
    triggerId: `TRG-${Date.now()}-${trigger.type}`,
  };
}

// Schedule all triggers for a booking
export async function scheduleBookingLifecycle(booking: BookingData): Promise<{
  scheduled: number;
  triggers: RetentionTrigger[];
}> {
  const triggers = generateRetentionTriggers(booking);

  for (const trigger of triggers) {
    await dispatchTrigger(trigger);
  }

  return {
    scheduled: triggers.length,
    triggers,
  };
}
