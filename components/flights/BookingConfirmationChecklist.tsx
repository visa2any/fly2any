'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle, Info, Lock } from 'lucide-react';
import { ParsedFareRules } from '@/lib/utils/fareRuleParsers';

/**
 * BookingConfirmationChecklist - Final confirmation before booking
 *
 * Purpose: Ensure user understands ALL restrictions before purchase
 * CRITICAL for legal compliance - prevents post-booking complaints
 *
 * User must explicitly acknowledge:
 * - Baggage restrictions (Basic Economy = no bags)
 * - Refund policy (non-refundable = lose entire cost)
 * - Change policy (no changes = must rebuy)
 * - Total price with all fees
 *
 * DOT Compliance: Requires informed consent before purchase
 */

export interface BookingConfirmation {
  flightDetails: {
    route: string; // "JFK → LAX"
    date: string;
    fareClass: string;
    airline: string;
  };

  pricing: {
    baseFare: number;
    taxes: number;
    fees: number;
    total: number;
    currency: string;
  };

  baggage: {
    carryOnIncluded: boolean;
    checkedBagsIncluded: number;
    additionalBagFee?: number;
  };

  fareRules: ParsedFareRules;
}

interface BookingConfirmationChecklistProps {
  confirmation: BookingConfirmation;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export default function BookingConfirmationChecklist({
  confirmation,
  onConfirm,
  onCancel,
  isProcessing = false,
}: BookingConfirmationChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleCheckItem = (itemId: string) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const isChecked = (itemId: string) => checkedItems.has(itemId);

  // Determine required acknowledgements based on restrictions
  const requiredAcknowledgements: string[] = [];

  // Baggage restrictions
  if (!confirmation.baggage.carryOnIncluded) {
    requiredAcknowledgements.push('no-carryon');
  }
  if (confirmation.baggage.checkedBagsIncluded === 0) {
    requiredAcknowledgements.push('no-checked');
  }

  // Refund restrictions
  if (!confirmation.fareRules.refundable) {
    requiredAcknowledgements.push('non-refundable');
  }

  // Change restrictions
  if (!confirmation.fareRules.changeable) {
    requiredAcknowledgements.push('no-changes');
  }

  // Price acknowledgement (always required)
  requiredAcknowledgements.push('total-price');

  // Check if all required items are acknowledged
  const allAcknowledged = requiredAcknowledgements.every(id => isChecked(id));

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg max-w-2xl mx-auto">

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-5 rounded-t-xl">
        <div className="flex items-center gap-3">
          <Lock size={24} />
          <div>
            <h2 className="text-xl font-bold">Confirm Your Booking</h2>
            <p className="text-blue-100 text-sm">Please review and acknowledge the following before booking</p>
          </div>
        </div>
      </div>

      {/* Flight summary */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Flight:</span>
            <span className="font-semibold text-gray-900 ml-2">{confirmation.flightDetails.route}</span>
          </div>
          <div>
            <span className="text-gray-600">Date:</span>
            <span className="font-semibold text-gray-900 ml-2">{confirmation.flightDetails.date}</span>
          </div>
          <div>
            <span className="text-gray-600">Airline:</span>
            <span className="font-semibold text-gray-900 ml-2">{confirmation.flightDetails.airline}</span>
          </div>
          <div>
            <span className="text-gray-600">Fare Class:</span>
            <span className="font-semibold text-gray-900 ml-2">{confirmation.flightDetails.fareClass}</span>
          </div>
        </div>
      </div>

      {/* Important restrictions - user must acknowledge */}
      <div className="px-6 py-6 space-y-4">

        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="text-orange-600 flex-shrink-0 mt-1" size={20} />
          <p className="text-sm text-gray-700">
            <strong className="text-gray-900">Important:</strong> Please review and check each box below to confirm you understand the restrictions for this fare.
          </p>
        </div>

        {/* Baggage restrictions */}
        {!confirmation.baggage.carryOnIncluded && (
          <ChecklistItem
            id="no-carryon"
            checked={isChecked('no-carryon')}
            onToggle={toggleCheckItem}
            severity="severe"
            title="No carry-on bag allowed"
            description={`This Basic Economy fare does NOT include a carry-on bag. You can only bring 1 small personal item (purse, laptop bag). Carry-on bags cost $${confirmation.baggage.additionalBagFee || 35} at the gate.`}
          />
        )}

        {confirmation.baggage.checkedBagsIncluded === 0 && (
          <ChecklistItem
            id="no-checked"
            checked={isChecked('no-checked')}
            onToggle={toggleCheckItem}
            severity="severe"
            title="No checked baggage included"
            description={`Checked bags are NOT included. First bag costs $${confirmation.baggage.additionalBagFee || 35}. If you need to check a bag, consider upgrading your fare.`}
          />
        )}

        {/* Refund restrictions */}
        {!confirmation.fareRules.refundable && (
          <ChecklistItem
            id="non-refundable"
            checked={isChecked('non-refundable')}
            onToggle={toggleCheckItem}
            severity="severe"
            title="Non-refundable ticket"
            description={`If you cancel this ticket, you will NOT receive a refund. You will lose the entire $${confirmation.pricing.total} cost. Only exception: free cancellation within 24 hours of booking.`}
          />
        )}

        {/* Change restrictions */}
        {!confirmation.fareRules.changeable && (
          <ChecklistItem
            id="no-changes"
            checked={isChecked('no-changes')}
            onToggle={toggleCheckItem}
            severity="severe"
            title="No changes allowed"
            description="You CANNOT change your flight dates or times. To fly different dates, you must cancel (lose $) and buy a new ticket at current prices."
          />
        )}

        {/* Price breakdown */}
        <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
          <h4 className="font-semibold text-gray-900 mb-3">Price Breakdown</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Base Fare:</span>
              <span className="font-medium text-gray-900">${confirmation.pricing.baseFare.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Taxes & Fees:</span>
              <span className="font-medium text-gray-900">${confirmation.pricing.taxes.toFixed(2)}</span>
            </div>
            {confirmation.pricing.fees > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-700">Additional Fees:</span>
                <span className="font-medium text-gray-900">${confirmation.pricing.fees.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-gray-300 pt-2 flex justify-between text-base">
              <span className="font-bold text-gray-900">Total Price:</span>
              <span className="font-bold text-gray-900">${confirmation.pricing.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <ChecklistItem
          id="total-price"
          checked={isChecked('total-price')}
          onToggle={toggleCheckItem}
          severity="ok"
          title={`I confirm the total price of $${confirmation.pricing.total.toFixed(2)}`}
          description="This is the complete price including all taxes, fees, and charges. No additional charges will be added at checkout."
        />

        {/* 24-hour cancellation reminder */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
            <div className="text-sm text-green-800">
              <strong>Your Protection:</strong> You can cancel this booking within 24 hours for a full refund (U.S. DOT requirement). After 24 hours, the restrictions above apply.
            </div>
          </div>
        </div>

      </div>

      {/* Action buttons */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-5 rounded-b-xl flex justify-between items-center">
        <button
          onClick={onCancel}
          disabled={isProcessing}
          className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Cancel
        </button>

        <div className="flex items-center gap-4">
          {!allAcknowledged && (
            <p className="text-sm text-gray-600">
              Check all boxes to continue
            </p>
          )}
          <button
            onClick={onConfirm}
            disabled={!allAcknowledged || isProcessing}
            className={`
              px-8 py-3 rounded-lg font-bold text-white transition flex items-center gap-2
              ${allAcknowledged && !isProcessing
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                <Lock size={18} />
                Confirm & Book Now
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}

/**
 * ChecklistItem - Single item user must acknowledge
 */
interface ChecklistItemProps {
  id: string;
  checked: boolean;
  onToggle: (id: string) => void;
  severity: 'severe' | 'warning' | 'ok';
  title: string;
  description: string;
}

function ChecklistItem({
  id,
  checked,
  onToggle,
  severity,
  title,
  description,
}: ChecklistItemProps) {
  // Color scheme based on severity
  const bgColor = severity === 'severe' ? 'bg-red-50' :
                  severity === 'warning' ? 'bg-yellow-50' :
                  'bg-green-50';

  const borderColor = severity === 'severe' ? 'border-red-200' :
                      severity === 'warning' ? 'border-yellow-200' :
                      'border-green-200';

  const iconColor = severity === 'severe' ? 'text-red-600' :
                    severity === 'warning' ? 'text-yellow-600' :
                    'text-green-600';

  const textColor = severity === 'severe' ? 'text-red-900' :
                    severity === 'warning' ? 'text-yellow-900' :
                    'text-green-900';

  const descColor = severity === 'severe' ? 'text-red-700' :
                    severity === 'warning' ? 'text-yellow-700' :
                    'text-green-700';

  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-4`}>
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onToggle(id)}
          className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
        <div className="flex-1">
          <div className="flex items-start gap-2">
            {severity === 'severe' && <AlertTriangle className={iconColor} size={18} />}
            {severity === 'warning' && <Info className={iconColor} size={18} />}
            {severity === 'ok' && <CheckCircle className={iconColor} size={18} />}
            <h4 className={`font-semibold ${textColor}`}>{title}</h4>
          </div>
          <p className={`text-sm ${descColor} mt-1`}>
            {description}
          </p>
        </div>
      </label>
    </div>
  );
}
