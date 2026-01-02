// ═══════════════════════════════════════════════════════════════════════════════
// RETENTION TRIGGERS - Lifecycle automations for long-term loyalty
// All feel helpful, not salesy
// ═══════════════════════════════════════════════════════════════════════════════

export type RetentionEvent =
  | "payment_success"
  | "booking_confirmed"
  | "pre_trip_7_days"
  | "pre_trip_1_day"
  | "trip_start"
  | "trip_end"
  | "post_trip_feedback"
  | "re_engagement_30_days";

export interface RetentionTrigger {
  event: RetentionEvent;
  delay: string; // human readable
  delayMs: number;
  action: "email" | "sms" | "push" | "in_app";
  template: string;
  subject?: string;
  body?: string;
}

export const RETENTION_TRIGGERS: RetentionTrigger[] = [
  // Immediate - Confirmation
  {
    event: "payment_success",
    delay: "Immediate",
    delayMs: 0,
    action: "email",
    template: "booking_confirmation",
    subject: "Your trip is confirmed! ✈️",
    body: "Everything is set. Here's what to expect next...",
  },
  // 7 days before - Pre-trip reminder
  {
    event: "pre_trip_7_days",
    delay: "7 days before trip",
    delayMs: -7 * 24 * 60 * 60 * 1000,
    action: "email",
    template: "pre_trip_countdown",
    subject: "One week until your adventure! 🌍",
    body: "Here's everything you need to know before you go...",
  },
  // Day before - Travel check-in
  {
    event: "pre_trip_1_day",
    delay: "1 day before trip",
    delayMs: -24 * 60 * 60 * 1000,
    action: "email",
    template: "day_before_checkin",
    subject: "Tomorrow's the day! Quick checklist inside",
    body: "Final reminders to make sure you're ready...",
  },
  // Trip start - Bon voyage
  {
    event: "trip_start",
    delay: "Trip start day",
    delayMs: 0,
    action: "push",
    template: "bon_voyage",
    subject: "Have an amazing trip! 🎉",
    body: "We're here if you need anything during your travels.",
  },
  // Trip end - Welcome back
  {
    event: "trip_end",
    delay: "Trip end day",
    delayMs: 0,
    action: "email",
    template: "welcome_back",
    subject: "Welcome back! How was your trip?",
    body: "We hope you had an incredible experience...",
  },
  // 2 days after - Feedback request
  {
    event: "post_trip_feedback",
    delay: "2 days after trip",
    delayMs: 2 * 24 * 60 * 60 * 1000,
    action: "email",
    template: "feedback_request",
    subject: "We'd love your thoughts (takes 2 min)",
    body: "Your feedback helps us serve you better next time...",
  },
  // 30 days later - Soft re-engagement
  {
    event: "re_engagement_30_days",
    delay: "30 days after trip",
    delayMs: 30 * 24 * 60 * 60 * 1000,
    action: "email",
    template: "next_adventure",
    subject: "Ready for your next adventure?",
    body: "As a valued traveler, here are some inspiration ideas...",
  },
];

// Schedule retention events for a booking
export function scheduleRetentionEvents(
  bookingId: string,
  tripStartDate: Date,
  tripEndDate: Date,
  userEmail: string
): { event: RetentionEvent; scheduledAt: Date }[] {
  const now = new Date();
  const scheduled: { event: RetentionEvent; scheduledAt: Date }[] = [];

  RETENTION_TRIGGERS.forEach((trigger) => {
    let scheduledAt: Date;

    switch (trigger.event) {
      case "payment_success":
        scheduledAt = now;
        break;
      case "pre_trip_7_days":
        scheduledAt = new Date(tripStartDate.getTime() + trigger.delayMs);
        break;
      case "pre_trip_1_day":
        scheduledAt = new Date(tripStartDate.getTime() + trigger.delayMs);
        break;
      case "trip_start":
        scheduledAt = tripStartDate;
        break;
      case "trip_end":
        scheduledAt = tripEndDate;
        break;
      case "post_trip_feedback":
        scheduledAt = new Date(tripEndDate.getTime() + trigger.delayMs);
        break;
      case "re_engagement_30_days":
        scheduledAt = new Date(tripEndDate.getTime() + trigger.delayMs);
        break;
      default:
        scheduledAt = now;
    }

    // Only schedule future events (except immediate)
    if (trigger.event === "payment_success" || scheduledAt >= now) {
      scheduled.push({ event: trigger.event, scheduledAt });
    }
  });

  // In production, this would call an API to schedule actual jobs
  console.log(`[Retention] Scheduled ${scheduled.length} events for booking ${bookingId}`);

  return scheduled;
}

// Get email content for a trigger
export function getRetentionEmailContent(
  event: RetentionEvent,
  data: {
    customerName: string;
    destination: string;
    tripDates: string;
    agentName?: string;
    bookingId: string;
  }
): { subject: string; body: string } {
  const trigger = RETENTION_TRIGGERS.find((t) => t.event === event);
  if (!trigger) return { subject: "", body: "" };

  // Personalize content
  let subject = trigger.subject || "";
  let body = trigger.body || "";

  subject = subject.replace("{destination}", data.destination);
  body = body.replace("{customerName}", data.customerName);
  body = body.replace("{destination}", data.destination);
  body = body.replace("{tripDates}", data.tripDates);
  body = body.replace("{agentName}", data.agentName || "Your Travel Expert");

  return { subject, body };
}
