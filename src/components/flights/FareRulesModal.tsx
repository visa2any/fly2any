'use client';

/**
 * 🎯 Fare Rules Modal Component
 * Modal detalhado com todas as informações de regras tarifárias
 * Versão completa com todas as políticas e condições
 */

import React from 'react';
import { 
  FareRules, 
  FareRulesModalProps, 
  ProcessedFlightOffer 
} from '@/types/flights';
import { 
  XIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@/components/Icons';

const FareRulesModal: React.FC<FareRulesModalProps> = ({ 
  isOpen, 
  onClose, 
  fareRules, 
  flightOffer 
}) => {
  if (!isOpen) return null;

  // Get first fare rule from array for display
  const fareRule = Array.isArray(fareRules) ? fareRules[0] : fareRules;

  const StatusIcon: React.FC<{ status: 'included' | 'not-included' | 'fee-applies' | 'premium-only' }> = ({ status }) => {
    switch (status) {
      case 'included':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'fee-applies':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
      case 'premium-only':
        return <InformationCircleIcon className="w-5 h-5 text-blue-600" />;
      default:
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
    }
  };

  const formatFlexibility = (level: string) => {
    const levels = {
      'BASIC': { label: 'Basic', color: 'text-red-600', desc: 'Limited flexibility' },
      'STANDARD': { label: 'Standard', color: 'text-yellow-600', desc: 'Some flexibility with fees' },
      'FLEXIBLE': { label: 'Flexible', color: 'text-green-600', desc: 'Good flexibility' },
      'PREMIUM': { label: 'Premium', color: 'text-blue-600', desc: 'Maximum flexibility' }
    };
    return levels[level as keyof typeof levels] || levels.BASIC;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              ✈️ Fare Rules & Policies
            </h2>
            <p className="text-gray-600 text-sm">
              {flightOffer.outbound.departure.iataCode} → {flightOffer.outbound.arrival.iataCode} • {flightOffer.validatingAirlines[0]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          
          {/* Fare Overview */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">📋 Fare Overview</h3>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${formatFlexibility(fareRule?.flexibility || 'BASIC').color}`}>
                  {formatFlexibility(fareRule?.flexibility || 'BASIC').label}
                </span>
                <span className="text-xs text-gray-500">
                  {formatFlexibility(fareRule?.flexibility || 'BASIC').desc}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl mb-2">💰</div>
                <div className="text-sm font-medium text-gray-900">{fareRule?.fareType}</div>
                <div className="text-xs text-gray-600">Fare Type</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🎫</div>
                <div className="text-sm font-medium text-gray-900">{fareRule?.fareClass}</div>
                <div className="text-xs text-gray-600">Fare Class</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="text-sm font-medium text-gray-900">{fareRule?.dataSource}</div>
                <div className="text-xs text-gray-600">Data Source</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🕒</div>
                <div className="text-sm font-medium text-gray-900">
                  {new Date(fareRule?.lastUpdated || Date.now()).toLocaleDateString()}
                </div>
                <div className="text-xs text-gray-600">Last Updated</div>
              </div>
            </div>
          </div>

          {/* Baggage Rules */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              🧳 Baggage Allowances
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Carry-on */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <StatusIcon status={fareRule?.baggage?.carryOn.included ? 'included' : 'not-included'} />
                  <h4 className="font-semibold text-gray-900">🎒 Carry-on Baggage</h4>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Included:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {fareRule?.baggage?.carryOn.included ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Weight Limit:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {fareRule?.baggage?.carryOn.weight} {fareRule?.baggage?.carryOn.weightUnit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Dimensions:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {fareRule?.baggage?.carryOn.dimensions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Quantity:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {fareRule?.baggage?.carryOn.quantity}
                    </span>
                  </div>
                  {fareRule?.baggage?.carryOn.additionalCost && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Additional Cost:</span>
                      <span className="text-sm font-medium text-red-600">
                        {fareRule?.baggage?.carryOn.additionalCost.formatted}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Checked Bag */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <StatusIcon status={fareRule?.baggage?.checked.included ? 'included' : 'not-included'} />
                  <h4 className="font-semibold text-gray-900">🧳 Checked Baggage</h4>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Included:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {fareRule?.baggage?.checked.included ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Quantity:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {fareRule?.baggage?.checked.quantity}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Weight Limit:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {fareRule?.baggage?.checked.weight} {fareRule?.baggage?.checked.weightUnit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">First Bag Free:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {fareRule?.baggage?.checked.firstBagFree ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {fareRule?.baggage?.checked.additionalCost && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Additional Cost:</span>
                      <span className="text-sm font-medium text-red-600">
                        {fareRule?.baggage?.checked.additionalCost.formatted}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Special Baggage */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4">🎯 Special Baggage</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <StatusIcon status={fareRule?.baggage?.special?.sports ? 'included' : 'not-included'} />
                  <span className="text-sm text-gray-700">🏈 Sports Equipment</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusIcon status={fareRule?.baggage?.special?.pets ? 'included' : 'not-included'} />
                  <span className="text-sm text-gray-700">🐕 Pet Travel</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusIcon status={fareRule?.baggage?.special?.musical ? 'included' : 'not-included'} />
                  <span className="text-sm text-gray-700">🎸 Musical Instruments</span>
                </div>
              </div>
            </div>
          </div>

          {/* Flexibility & Changes */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              🔄 Flexibility & Changes
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Refunds */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <StatusIcon status={fareRule?.refundable ? 'included' : 'not-included'} />
                  <h4 className="font-semibold text-gray-900">💳 Refunds</h4>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="text-sm">
                    <span className="text-gray-600">Status: </span>
                    <span className={`font-medium ${fareRule?.refundable ? 'text-green-600' : 'text-red-600'}`}>
                      {fareRule?.refundable ? 'Refundable' : 'Non-refundable'}
                    </span>
                  </div>
                  {fareRule?.refundFee && (
                    <div className="text-sm">
                      <span className="text-gray-600">Fee: </span>
                      <span className="font-medium text-red-600">
                        {fareRule?.refundFee.formatted}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Date Changes */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <StatusIcon status={fareRule?.exchangeable ? fareRule?.changeFee ? 'fee-applies' : 'included' : 'not-included'} />
                  <h4 className="font-semibold text-gray-900">📅 Date Changes</h4>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="text-sm">
                    <span className="text-gray-600">Allowed: </span>
                    <span className={`font-medium ${fareRule?.exchangeable ? 'text-green-600' : 'text-red-600'}`}>
                      {fareRule?.exchangeable ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {fareRule?.changeFee && (
                    <div className="text-sm">
                      <span className="text-gray-600">Fee: </span>
                      <span className="font-medium text-yellow-600">
                        {fareRule?.changeFee.formatted}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Transfers */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <StatusIcon status={fareRule?.transferable ? 'included' : 'not-included'} />
                  <h4 className="font-semibold text-gray-900">👤 Transfers</h4>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="text-sm">
                    <span className="text-gray-600">Name Changes: </span>
                    <span className={`font-medium ${fareRule?.transferable ? 'text-green-600' : 'text-red-600'}`}>
                      {fareRule?.transferable ? 'Allowed' : 'Not allowed'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Services */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              ✨ Additional Services
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Seat Selection */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  💺 Seat Selection
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Allowed:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {fareRule?.policies?.seatSelection.allowed ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Cost:</span>
                    <span className={`text-sm font-medium ${
                      fareRule?.policies?.seatSelection.cost === 'FREE' ? 'text-green-600' : 
                      fareRule?.policies?.seatSelection.cost === 'PAID' ? 'text-yellow-600' : 'text-blue-600'
                    }`}>
                      {fareRule?.policies?.seatSelection.cost === 'FREE' ? 'Free' :
                       fareRule?.policies?.seatSelection.cost === 'PAID' ? 'Fee applies' : 'Premium only'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Advance Only:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {fareRule?.policies?.seatSelection.advanceOnly ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Check-in */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  ✅ Check-in Options
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Online:</span>
                    <StatusIcon status={fareRule?.policies?.checkin.online ? 'included' : 'not-included'} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Mobile:</span>
                    <StatusIcon status={fareRule?.policies?.checkin.mobile ? 'included' : 'not-included'} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Kiosk:</span>
                    <StatusIcon status={fareRule?.policies?.checkin.kiosk ? 'included' : 'not-included'} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Priority:</span>
                    <StatusIcon status={fareRule?.policies?.checkin.priority ? 'included' : 'not-included'} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <p className="text-sm text-gray-600 mb-4">
              ℹ️ These rules are provided by {fareRule?.dataSource} and are subject to airline terms and conditions.
              Always verify with the airline before making changes.
            </p>
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Close Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FareRulesModal;