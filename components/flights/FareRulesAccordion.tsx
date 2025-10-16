'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';
import { ParsedFareRules } from '@/lib/utils/fareRuleParsers';

/**
 * FareRulesAccordion - Expandable detailed fare rules display
 *
 * Purpose: Show ALL fare rules, restrictions, policies in plain language
 * Critical for DOT compliance - users must have access to complete terms
 *
 * Features:
 * - Progressive disclosure (expandable sections)
 * - Plain language explanations (no legal jargon)
 * - Visual severity indicators (red/yellow/green)
 * - Mobile-friendly accordion design
 */

interface FareRulesAccordionProps {
  fareRules: ParsedFareRules;
  fareClass: string; // e.g., "Basic Economy", "Economy Plus"
  ticketPrice: number;
  className?: string;
}

export default function FareRulesAccordion({
  fareRules,
  fareClass,
  ticketPrice,
  className = '',
}: FareRulesAccordionProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const isExpanded = (section: string) => expandedSections.includes(section);

  // Calculate what user would lose if they cancel (non-refundable)
  const cancellationCost = fareRules.refundable
    ? (fareRules.refundFee || 0)
    : ticketPrice;

  // Calculate what user pays to change flight
  const changeCost = fareRules.changeable
    ? (fareRules.changeFee || 0)
    : ticketPrice;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>

      {/* Header with fare class and overall status */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {fareClass} Fare Rules & Restrictions
        </h3>
        <div className="flex flex-wrap gap-2">
          {/* Refund status badge */}
          <StatusBadge
            included={fareRules.refundable}
            label={fareRules.refundable ? 'Refundable' : 'Non-refundable'}
          />
          {/* Change status badge */}
          <StatusBadge
            included={fareRules.changeable}
            label={fareRules.changeable ? 'Changes allowed' : 'No changes'}
          />
          {/* 24h cancellation badge (always yes per DOT) */}
          <StatusBadge
            included={true}
            label="24h free cancellation"
          />
        </div>
      </div>

      {/* Accordion sections */}
      <div className="divide-y divide-gray-200">

        {/* Refund Policy Section */}
        <AccordionSection
          title="Refund Policy"
          icon={fareRules.refundable ? <CheckCircle className="text-green-600" size={20} /> : <XCircle className="text-red-500" size={20} />}
          isExpanded={isExpanded('refund')}
          onToggle={() => toggleSection('refund')}
          severity={fareRules.refundable ? 'ok' : 'severe'}
        >
          <div className="space-y-3">
            <p className="text-gray-700">
              {fareRules.refundPolicy}
            </p>

            {!fareRules.refundable && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 font-semibold mb-2">
                  ⚠️ What this means for you:
                </p>
                <ul className="text-sm text-red-700 space-y-1 ml-4 list-disc">
                  <li>You get <strong>NO REFUND</strong> if you cancel after 24 hours</li>
                  <li>You will lose the entire <strong>${ticketPrice}</strong> ticket cost</li>
                  <li>Only exception: Free cancellation within first 24 hours (federal law)</li>
                </ul>
              </div>
            )}

            {fareRules.refundable && fareRules.refundFee && fareRules.refundFee > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800 font-semibold mb-2">
                  💰 Refund costs:
                </p>
                <ul className="text-sm text-yellow-700 space-y-1 ml-4 list-disc">
                  <li>Penalty fee: <strong>${fareRules.refundFee}</strong></li>
                  <li>You'll receive back: <strong>${ticketPrice - fareRules.refundFee}</strong></li>
                  <li>Processing time: 7-20 business days</li>
                </ul>
              </div>
            )}

            {fareRules.refundable && (!fareRules.refundFee || fareRules.refundFee === 0) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  ✅ <strong>Great news!</strong> This ticket is fully refundable with no penalty. You'll get back your full <strong>${ticketPrice}</strong> if you cancel.
                </p>
              </div>
            )}

            {/* 24-hour rule reminder */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <strong>Federal Protection:</strong> All tickets can be cancelled for a full refund within 24 hours of booking (U.S. Department of Transportation rule).
              </p>
            </div>
          </div>
        </AccordionSection>

        {/* Change Policy Section */}
        <AccordionSection
          title="Change & Rebooking Policy"
          icon={fareRules.changeable ? <CheckCircle className="text-green-600" size={20} /> : <XCircle className="text-red-500" size={20} />}
          isExpanded={isExpanded('change')}
          onToggle={() => toggleSection('change')}
          severity={fareRules.changeable ? 'ok' : 'severe'}
        >
          <div className="space-y-3">
            <p className="text-gray-700">
              {fareRules.changePolicy}
            </p>

            {!fareRules.changeable && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 font-semibold mb-2">
                  ⚠️ What this means for you:
                </p>
                <ul className="text-sm text-red-700 space-y-1 ml-4 list-disc">
                  <li>You <strong>CANNOT change</strong> your flight dates or times</li>
                  <li>To fly different dates, you must:
                    <ul className="ml-4 mt-1 list-circle">
                      <li>Cancel this ticket (lose ${ticketPrice})</li>
                      <li>Buy a new ticket at current prices (could be higher)</li>
                    </ul>
                  </li>
                  <li>Total cost to "change": <strong>Up to ${ticketPrice} + new ticket price</strong></li>
                </ul>
              </div>
            )}

            {fareRules.changeable && fareRules.changeFee && fareRules.changeFee > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800 font-semibold mb-2">
                  💰 Change costs:
                </p>
                <ul className="text-sm text-yellow-700 space-y-1 ml-4 list-disc">
                  <li>Change fee: <strong>${fareRules.changeFee}</strong></li>
                  <li>PLUS fare difference (if new flight is more expensive)</li>
                  <li>Example: If new flight is $50 more, you pay ${fareRules.changeFee + 50} total</li>
                </ul>
              </div>
            )}

            {fareRules.changeable && (!fareRules.changeFee || fareRules.changeFee === 0) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  ✅ <strong>Flexible!</strong> You can change your flight dates with no change fee. You'll only pay the difference if the new flight costs more.
                </p>
              </div>
            )}
          </div>
        </AccordionSection>

        {/* Cancellation Policy (24-hour rule) */}
        <AccordionSection
          title="24-Hour Free Cancellation"
          icon={<CheckCircle className="text-green-600" size={20} />}
          isExpanded={isExpanded('cancellation')}
          onToggle={() => toggleSection('cancellation')}
          severity="ok"
        >
          <div className="space-y-3">
            <p className="text-gray-700">
              {fareRules.cancellationPolicy}
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800 font-semibold mb-2">
                ✅ Your rights (U.S. Department of Transportation):
              </p>
              <ul className="text-sm text-green-700 space-y-1 ml-4 list-disc">
                <li>Cancel within <strong>24 hours</strong> of booking for a <strong>full refund</strong></li>
                <li>No questions asked, no penalty fees</li>
                <li>Applies to ALL flights departing from or arriving to the U.S.</li>
                <li>Refund processed within 7 business days</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <p className="text-xs text-blue-700">
                <strong>Important:</strong> Book must be made at least 7 days before departure to qualify for 24-hour cancellation.
              </p>
            </div>
          </div>
        </AccordionSection>

        {/* Restrictions & Other Rules */}
        {fareRules.restrictions && fareRules.restrictions.length > 0 && (
          <AccordionSection
            title="Additional Restrictions"
            icon={<Info className="text-gray-500" size={20} />}
            isExpanded={isExpanded('restrictions')}
            onToggle={() => toggleSection('restrictions')}
            severity="warning"
          >
            <div className="space-y-2">
              <p className="text-sm text-gray-600 mb-3">
                Please review these additional terms and restrictions that apply to your ticket:
              </p>
              <ul className="space-y-2">
                {fareRules.restrictions.map((restriction, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={16} />
                    <span>{restriction}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AccordionSection>
        )}

      </div>

      {/* Footer with helpful tip */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
        <p className="text-xs text-gray-600">
          💡 <strong>Tip:</strong> If you need flexibility, consider upgrading to a higher fare class with better refund and change policies.
        </p>
      </div>

    </div>
  );
}

/**
 * AccordionSection - Single expandable section
 */
interface AccordionSectionProps {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  severity: 'ok' | 'warning' | 'severe';
  children: React.ReactNode;
}

function AccordionSection({
  title,
  icon,
  isExpanded,
  onToggle,
  severity,
  children,
}: AccordionSectionProps) {
  // Border color based on severity
  const borderColorClass =
    severity === 'severe' ? 'border-l-red-500' :
    severity === 'warning' ? 'border-l-yellow-500' :
    'border-l-green-500';

  return (
    <div className={`border-l-4 ${borderColorClass}`}>
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-semibold text-gray-900">{title}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="text-gray-400" size={20} />
        ) : (
          <ChevronDown className="text-gray-400" size={20} />
        )}
      </button>

      {isExpanded && (
        <div className="px-6 pb-4">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * StatusBadge - Small badge for quick status display
 */
function StatusBadge({
  included,
  label,
}: {
  included: boolean;
  label: string;
}) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold
        ${included
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
        }
      `}
    >
      {included ? <CheckCircle size={12} /> : <XCircle size={12} />}
      {label}
    </span>
  );
}
