'use client';

/**
 * 🎯 Simple Fare Rules Component (Fallback)
 * Versão simplificada para garantir que sempre apareça algo
 */

import React from 'react';

interface SimpleFareRulesProps {
  flightId: string;
  airline: string;
  onDetailsClick: () => void;
}

const FareRulesSimple: React.FC<SimpleFareRulesProps> = ({ flightId, 
  airline, 
  onDetailsClick 
 }: SimpleFareRulesProps) => {
  // Lógica simples baseada na companhia aérea
  const getAirlineRules = (airline: string) => {
    if (airline.includes('LATAM')) {
      return {
        carryOn: { included: true, color: 'text-green-600' },
        checked: { included: false, color: 'text-red-600' },
        refund: { partial: true, color: 'text-yellow-600' },
        change: { withFee: true, color: 'text-orange-600' },
        flexibility: { level: 'standard', color: 'text-blue-600' }
      };
    } else if (airline.includes('GOL')) {
      return {
        carryOn: { included: false, color: 'text-red-600' },
        checked: { included: false, color: 'text-red-600' },
        refund: { partial: false, color: 'text-red-600' },
        change: { withFee: false, color: 'text-red-600' },
        flexibility: { level: 'basic', color: 'text-red-600' }
      };
    } else {
      // Default case
      return {
        carryOn: { included: true, color: 'text-green-600' },
        checked: { included: false, color: 'text-yellow-600' },
        refund: { partial: true, color: 'text-yellow-600' },
        change: { withFee: true, color: 'text-orange-600' },
        flexibility: { level: 'standard', color: 'text-blue-600' }
      };
    }
  };

  const rules = getAirlineRules(airline);

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg border border-gray-100">
      <div className="flex items-center gap-3">
        {/* Carry-on */}
        <span 
          className={`text-lg cursor-help transition-transform hover:scale-110 ${rules.carryOn.color}`}
          title={rules.carryOn.included ? "Carry-on included" : "Carry-on not included"}
        >
          🎒
        </span>

        {/* Checked bag */}
        <span 
          className={`text-lg cursor-help transition-transform hover:scale-110 ${rules.checked.color}`}
          title={rules.checked.included ? "Checked bag included" : "Checked bag not included"}
        >
          🧳
        </span>

        {/* Refund */}
        <span 
          className={`text-lg cursor-help transition-transform hover:scale-110 ${rules.refund.color}`}
          title={rules.refund.partial ? "Partially refundable" : "Non-refundable"}
        >
          💳
        </span>

        {/* Changes */}
        <span 
          className={`text-lg cursor-help transition-transform hover:scale-110 ${rules.change.color}`}
          title={rules.change.withFee ? "Date change with fee" : "No date changes"}
        >
          📅
        </span>

        {/* Flexibility */}
        <span 
          className={`text-lg cursor-help transition-transform hover:scale-110 ${rules.flexibility.color}`}
          title={`${rules.flexibility.level} flexibility`}
        >
          🔄
        </span>
      </div>

      {/* Details Button */}
      <button
        onClick={onDetailsClick}
        className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-all duration-200 font-medium"
      >
        <span className="text-base">ℹ️</span>
        <span>Details</span>
      </button>
    </div>
  );
};

export default FareRulesSimple;