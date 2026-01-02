// Confidence-Driven Checkout System
// "Everything is clear. I'm ready."

// Pre-Payment Components
export { default as ClientCheckout } from "./ClientCheckout";
export { default as TripSummaryCard } from "./TripSummaryCard";
export { default as ConfidenceLayer, SecurityBadges } from "./ConfidenceLayer";
export { default as PolicyTransparency, PolicyBadge } from "./PolicyTransparency";
export { default as WhatHappensNext } from "./WhatHappensNext";
export { default as CheckoutCTA } from "./CheckoutCTA";
export { default as PaymentMethodSelector } from "./PaymentMethodSelector";

// Post-Payment Components
// "Everything is taken care of."
export { default as PostPaymentSuccess } from "./PostPaymentSuccess";
export { default as SuccessMoment, SuccessBadge } from "./SuccessMoment";
export { default as ReassuranceBlock } from "./ReassuranceBlock";
export { default as PostPaymentTimeline } from "./PostPaymentTimeline";
export { default as AgentPresence } from "./AgentPresence";
export { default as TripGlance } from "./TripGlance";

// Retention System
export {
  generateRetentionTriggers,
  scheduleBookingLifecycle,
  dispatchTrigger,
  EMAIL_TEMPLATES,
  type RetentionTrigger,
  type TriggerType,
  type BookingData,
} from "./RetentionTriggers";

// Types
export type {
  CheckoutItem,
  CheckoutState,
  RefundPolicy,
  TravelerInfo,
  PaymentMethod,
} from "./types";
