// Confidence-Driven Checkout System
// "Everything is clear. I'm ready."

export { default as ClientCheckout } from "./ClientCheckout";
export { default as TripSummaryCard } from "./TripSummaryCard";
export { default as ConfidenceLayer, SecurityBadges } from "./ConfidenceLayer";
export { default as PolicyTransparency, PolicyBadge } from "./PolicyTransparency";
export { default as WhatHappensNext } from "./WhatHappensNext";
export { default as CheckoutCTA } from "./CheckoutCTA";
export { default as PaymentMethodSelector } from "./PaymentMethodSelector";

export type {
  CheckoutItem,
  CheckoutState,
  RefundPolicy,
  TravelerInfo,
  PaymentMethod,
} from "./types";
