// Confidence-Driven Checkout Types

export interface CheckoutItem {
  id: string;
  type: "flight" | "hotel" | "car" | "activity" | "transfer" | "insurance";
  title: string;
  subtitle?: string;
  price: number;
  refundPolicy: RefundPolicy;
  details?: Record<string, string>;
}

export interface RefundPolicy {
  type: "refundable" | "non-refundable" | "partial" | "conditional";
  deadline?: string; // ISO date
  description: string;
}

export interface TravelerInfo {
  adults: number;
  children: number;
  infants: number;
}

export interface CheckoutState {
  items: CheckoutItem[];
  travelers: TravelerInfo;
  startDate: string;
  endDate: string;
  currency: string;
  agentName?: string;
  agentEmail?: string;
  isProcessing: boolean;
  error: string | null;
}

export interface PaymentMethod {
  id: string;
  type: "card" | "paypal" | "bank" | "affirm";
  label: string;
  icon: string;
  enabled: boolean;
}
