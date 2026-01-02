"use client";

import { motion } from "framer-motion";
import { CreditCard, Wallet, Building2, Clock } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// PAYMENT METHOD SELECTOR - Clear options, not overwhelming
// ═══════════════════════════════════════════════════════════════════════════════

const PAYMENT_METHODS = [
  {
    id: "card",
    label: "Credit / Debit Card",
    description: "Visa, Mastercard, Amex",
    icon: CreditCard,
    enabled: true,
  },
  {
    id: "paypal",
    label: "PayPal",
    description: "Fast and secure checkout",
    icon: Wallet,
    enabled: true,
  },
  {
    id: "bank",
    label: "Bank Transfer",
    description: "Direct ACH transfer",
    icon: Building2,
    enabled: false, // Coming soon
  },
  {
    id: "affirm",
    label: "Pay Later",
    description: "Split into payments",
    icon: Clock,
    enabled: false, // Coming soon
  },
];

interface PaymentMethodSelectorProps {
  selected: string;
  onSelect: (id: string) => void;
}

export default function PaymentMethodSelector({
  selected,
  onSelect,
}: PaymentMethodSelectorProps) {
  const enabledMethods = PAYMENT_METHODS.filter((m) => m.enabled);
  const disabledMethods = PAYMENT_METHODS.filter((m) => !m.enabled);

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-900">Payment Method</h3>
      </div>

      <div className="p-4 space-y-2">
        {/* Enabled methods */}
        {enabledMethods.map((method) => {
          const isSelected = selected === method.id;
          return (
            <motion.button
              key={method.id}
              onClick={() => onSelect(method.id)}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                isSelected
                  ? "border-gray-900 bg-gray-50"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isSelected ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
              }`}>
                <method.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <p className={`text-sm font-semibold ${isSelected ? "text-gray-900" : "text-gray-700"}`}>
                  {method.label}
                </p>
                <p className="text-xs text-gray-500">{method.description}</p>
              </div>
              {/* Radio indicator */}
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                isSelected ? "border-gray-900" : "border-gray-300"
              }`}>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-3 h-3 rounded-full bg-gray-900"
                  />
                )}
              </div>
            </motion.button>
          );
        })}

        {/* Coming soon methods */}
        {disabledMethods.length > 0 && (
          <div className="pt-2 border-t border-gray-100 mt-3">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Coming Soon</p>
            <div className="flex gap-2">
              {disabledMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 rounded-lg opacity-50"
                >
                  <method.icon className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500">{method.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
