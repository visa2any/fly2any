'use client';

import { useState, useEffect } from 'react';
import {
  Sparkles, ChevronDown, ChevronUp, CreditCard, Clock, ShieldCheck,
  Calendar, CheckCircle2, Percent, TrendingUp, Zap, BadgeCheck,
  ArrowRight, Info
} from 'lucide-react';

interface BNPLPromotionProps {
  totalAmount: number;
  currency: string;
  /** Minimum amount to show BNPL promotion (default: 50) */
  minAmount?: number;
  /** Number of installments (default: 4) */
  installments?: number;
  /** Show expanded by default */
  defaultExpanded?: boolean;
  /** Compact mode for sidebar */
  compact?: boolean;
  /** Callback when BNPL info is clicked */
  onLearnMore?: () => void;
}

// BNPL Provider configurations
const BNPL_PROVIDERS = [
  {
    id: 'klarna',
    name: 'Klarna',
    logo: 'K',
    color: 'pink',
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-700',
    borderColor: 'border-pink-200',
    gradientFrom: 'from-pink-500',
    gradientTo: 'to-pink-600',
    tagline: 'Pay in 4. No interest.',
    description: 'Split your purchase into 4 interest-free payments',
    features: ['Instant decision', 'No fees when you pay on time', 'Soft credit check'],
    schedule: 'biweekly', // Every 2 weeks
  },
  {
    id: 'afterpay',
    name: 'Afterpay',
    logo: 'A',
    color: 'teal',
    bgColor: 'bg-teal-100',
    textColor: 'text-teal-700',
    borderColor: 'border-teal-200',
    gradientFrom: 'from-teal-500',
    gradientTo: 'to-teal-600',
    tagline: 'Buy now. Pay later.',
    description: 'Pay in 4 installments, every 2 weeks',
    features: ['Always 0% interest', 'No impact on credit score', 'Instant approval'],
    schedule: 'biweekly',
  },
  {
    id: 'affirm',
    name: 'Affirm',
    logo: 'a',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-blue-600',
    tagline: 'Pay your way.',
    description: 'Choose monthly payments that fit your budget',
    features: ['0% APR available', 'No hidden fees', 'Pay early, save more'],
    schedule: 'monthly',
  },
];

/**
 * Enhanced BNPL (Buy Now Pay Later) Promotion Component
 *
 * Premium component showing BNPL options with:
 * - Interactive payment timeline visualization
 * - Provider-specific information
 * - Animated savings calculator
 * - Trust badges and benefits
 */
export function BNPLPromotion({
  totalAmount,
  currency,
  minAmount = 50,
  installments = 4,
  defaultExpanded = false,
  compact = false,
  onLearnMore,
}: BNPLPromotionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [animatedAmount, setAnimatedAmount] = useState(0);
  const [showTimeline, setShowTimeline] = useState(false);

  // Animate the installment amount on mount
  useEffect(() => {
    const targetAmount = totalAmount / installments;
    const duration = 800;
    const steps = 30;
    const increment = targetAmount / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetAmount) {
        setAnimatedAmount(targetAmount);
        clearInterval(timer);
      } else {
        setAnimatedAmount(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [totalAmount, installments]);

  // Show timeline animation after component loads
  useEffect(() => {
    const timer = setTimeout(() => setShowTimeline(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Don't show if total is below minimum
  if (totalAmount < minAmount) {
    return null;
  }

  // Calculate installment amount
  const installmentAmount = totalAmount / installments;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Get payment dates
  const getPaymentDates = (schedule: 'biweekly' | 'monthly') => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < installments; i++) {
      const date = new Date(today);
      if (schedule === 'biweekly') {
        date.setDate(date.getDate() + (i * 14));
      } else {
        date.setMonth(date.getMonth() + i);
      }
      dates.push(date);
    }
    return dates;
  };

  // Format date
  const formatDate = (date: Date) => {
    if (date.toDateString() === new Date().toDateString()) {
      return 'Today';
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Compact version for sidebar
  if (compact) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-purple-900">
              Pay in {installments} interest-free payments
            </p>
            <p className="text-xs text-purple-700">
              {formatCurrency(installmentAmount)}/payment with Affirm, Afterpay or Klarna
            </p>
          </div>
        </div>

        {/* Mini Benefits */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" /> Instant confirmation
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
            <ShieldCheck className="w-3 h-3" /> No hidden fees
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
            <Zap className="w-3 h-3" /> 24/7 support
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-violet-50 border border-purple-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Main Banner - Always Visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-purple-100/30 transition-all duration-300"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-indigo-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <Percent className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <p className="text-base font-bold text-purple-900">
                Pay in {installments} interest-free payments
              </p>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                <Zap className="w-3 h-3" /> 0% APR
              </span>
            </div>
            <p className="text-sm text-purple-700 mt-0.5">
              <span className="font-semibold text-purple-900">
                {formatCurrency(animatedAmount)}
              </span>
              /payment • Klarna, Afterpay, or Affirm
            </p>
          </div>
        </div>
        <div className={`text-purple-600 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-6 h-6" />
        </div>
      </button>

      {/* Expanded Details */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${expanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-5 pb-5 pt-2 border-t border-purple-200/50">

          {/* Provider Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            {BNPL_PROVIDERS.map((provider) => (
              <button
                key={provider.id}
                onClick={() => setSelectedProvider(selectedProvider === provider.id ? null : provider.id)}
                className={`relative bg-white rounded-xl p-4 border-2 transition-all duration-300 hover:shadow-md text-left ${
                  selectedProvider === provider.id
                    ? `${provider.borderColor} shadow-md ring-2 ring-${provider.color}-200`
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                {selectedProvider === provider.id && (
                  <div className={`absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br ${provider.gradientFrom} ${provider.gradientTo} rounded-full flex items-center justify-center shadow-sm`}>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 ${provider.bgColor} rounded-lg flex items-center justify-center`}>
                    <span className={`${provider.textColor} font-bold text-lg`}>{provider.logo}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">{provider.name}</span>
                    <p className="text-[10px] text-gray-500">{provider.tagline}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600">{provider.description}</p>

                {/* Provider-specific details when selected */}
                {selectedProvider === provider.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100 animate-fadeIn">
                    <ul className="space-y-1.5">
                      {provider.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                          <CheckCircle2 className={`w-3.5 h-3.5 ${provider.textColor}`} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Interactive Payment Timeline */}
          <div className="bg-white rounded-xl p-4 border border-purple-100 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <p className="text-sm font-semibold text-gray-800">Your Payment Schedule</p>
              </div>
              <span className="text-xs text-gray-500">Every 2 weeks</span>
            </div>

            {/* Timeline Visualization */}
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-5 left-0 right-0 h-1 bg-gray-100 rounded-full">
                <div
                  className={`h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-1000 ${showTimeline ? 'w-1/4' : 'w-0'}`}
                />
              </div>

              {/* Payment Points */}
              <div className="grid grid-cols-4 gap-2 relative">
                {getPaymentDates('biweekly').map((date, i) => (
                  <div
                    key={i}
                    className={`text-center transition-all duration-500 ${showTimeline ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{ transitionDelay: `${i * 150}ms` }}
                  >
                    {/* Circle indicator */}
                    <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                      i === 0
                        ? 'bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-200 scale-110'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {i === 0 ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-semibold">{i + 1}</span>
                      )}
                    </div>

                    {/* Amount */}
                    <p className={`text-sm font-bold ${i === 0 ? 'text-purple-900' : 'text-gray-700'}`}>
                      {formatCurrency(installmentAmount)}
                    </p>

                    {/* Date */}
                    <p className={`text-xs ${i === 0 ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>
                      {formatDate(date)}
                    </p>

                    {/* First payment badge */}
                    {i === 0 && (
                      <span className="inline-block mt-1 text-[10px] font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-500 px-2 py-0.5 rounded-full">
                        Due at checkout
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trust & Benefits Section */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-white rounded-lg p-3 border border-purple-100 text-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Percent className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-xs font-semibold text-gray-800">0% Interest</p>
              <p className="text-[10px] text-gray-500">Always</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-purple-100 text-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Zap className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-xs font-semibold text-gray-800">Instant</p>
              <p className="text-[10px] text-gray-500">Approval</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-purple-100 text-center">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-xs font-semibold text-gray-800">No Hidden</p>
              <p className="text-[10px] text-gray-500">Fees</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-purple-100 text-center">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <BadgeCheck className="w-4 h-4 text-orange-600" />
              </div>
              <p className="text-xs font-semibold text-gray-800">Soft Credit</p>
              <p className="text-[10px] text-gray-500">Check Only</p>
            </div>
          </div>

          {/* How it works */}
          <div className="bg-gradient-to-r from-purple-100/50 to-indigo-100/50 rounded-xl p-4">
            <p className="text-xs font-semibold text-purple-900 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" />
              How Buy Now, Pay Later Works
            </p>
            <div className="flex items-center gap-3 text-xs text-purple-700">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 font-bold text-[10px]">1</span>
                <span>Select BNPL at checkout</span>
              </div>
              <ArrowRight className="w-4 h-4 text-purple-400" />
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 font-bold text-[10px]">2</span>
                <span>Get instant approval</span>
              </div>
              <ArrowRight className="w-4 h-4 text-purple-400" />
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 font-bold text-[10px]">3</span>
                <span>Pay over time</span>
              </div>
            </div>
          </div>

          {/* Legal note */}
          <p className="mt-4 text-[10px] text-purple-500 text-center">
            Subject to eligibility. Terms apply. See provider for details.
          </p>
        </div>
      </div>
    </div>
  );
}

export default BNPLPromotion;
