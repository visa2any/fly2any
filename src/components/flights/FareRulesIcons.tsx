'use client';

/**
 * 🎯 Fare Rules Icons Component
 * Exibe ícones intuitivos das regras tarifárias no card do voo
 * Localização: Entre detalhes do voo e badges de persuasão
 */

import React, { useState } from 'react';
import { 
  FareRules, 
  FareRulesIconsProps, 
  FareRuleTooltipData 
} from '@/types/flights';

interface TooltipProps {
  data: FareRuleTooltipData;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ data, children  }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const colorClasses = {
    green: 'bg-green-50 border-green-200 text-green-800',
    red: 'bg-red-50 border-red-200 text-red-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    gray: 'bg-gray-50 border-gray-200 text-gray-800'
  };

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className={`
            px-3 py-2 rounded-lg border shadow-lg max-w-xs text-sm font-medium
            ${colorClasses[data.color]}
          `}>
            <div className="font-semibold mb-1">{data.title}</div>
            <div className="text-xs opacity-90">{data.description}</div>
            {/* Seta do tooltip */}
            <div className={`
              absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 
              border-l-4 border-r-4 border-t-4 border-transparent 
              ${data.color === 'green' ? 'border-t-green-200' : 
                data.color === 'red' ? 'border-t-red-200' :
                data.color === 'yellow' ? 'border-t-yellow-200' :
                data.color === 'blue' ? 'border-t-blue-200' : 'border-t-gray-200'}
            `}></div>
          </div>
        </div>
      )}
    </div>
  );
};

const FareRulesIcons: React.FC<FareRulesIconsProps> = ({ fareRules, 
  onDetailsClick, 
  compact = false,
  showTooltips = true 
 }: FareRulesIconsProps) => {
  // Get first fare rule from array for display
  const fareRule = Array.isArray(fareRules) ? fareRules[0] : fareRules;
  
  // Generate tooltip data for each icon
  const getCarryOnTooltip = (): FareRuleTooltipData => ({
    icon: '🎒',
    title: fareRule?.baggage?.carryOn?.included ? 'Carry-on Included' : 'Carry-on Not Included',
    description: fareRule?.baggage?.carryOn?.included 
      ? `${fareRule.baggage.carryOn.weight}${fareRule.baggage.carryOn.weightUnit} • ${fareRule.baggage.carryOn.dimensions}`
      : fareRule?.baggage?.carryOn?.additionalCost 
        ? `Additional cost: ${fareRule.baggage.carryOn.additionalCost.formatted}`
        : 'Not included in this fare',
    status: fareRule?.baggage?.carryOn?.included ? 'included' : 'not-included',
    color: fareRule?.baggage?.carryOn?.included ? 'green' : 'red'
  });

  const getCheckedBagTooltip = (): FareRuleTooltipData => ({
    icon: '🧳',
    title: fareRule?.baggage?.checked.included ? 'Checked Bag Included' : 'Checked Bag Not Included',
    description: fareRule?.baggage?.checked.included 
      ? `${fareRule?.baggage?.checked.quantity}x ${fareRule?.baggage?.checked.weight}${fareRule?.baggage?.checked.weightUnit} bags included`
      : fareRule?.baggage?.checked.additionalCost 
        ? `Additional cost: ${fareRule?.baggage?.checked.additionalCost.formatted}`
        : 'Must purchase separately',
    status: fareRule?.baggage?.checked.included ? 'included' : 'not-included',
    color: fareRule?.baggage?.checked.included ? 'green' : 'red'
  });

  const getRefundTooltip = (): FareRuleTooltipData => ({
    icon: '💳',
    title: fareRule?.refundable ? 'Refundable' : 'Non-Refundable',
    description: fareRule?.refundable 
      ? fareRule?.refundFee 
        ? `Refundable with ${fareRule?.refundFee.formatted} fee`
        : 'Fully refundable'
      : fareRule?.flexibility === 'BASIC' 
        ? 'Non-refundable fare'
        : 'Partial refund may apply',
    status: fareRule?.refundable ? 'included' : fareRule?.flexibility !== 'BASIC' ? 'fee-applies' : 'not-included',
    color: fareRule?.refundable ? 'green' : fareRule?.flexibility !== 'BASIC' ? 'yellow' : 'red'
  });

  const getChangeTooltip = (): FareRuleTooltipData => ({
    icon: '📅',
    title: fareRule?.exchangeable ? 'Date Changes Allowed' : 'No Date Changes',
    description: fareRule?.exchangeable 
      ? fareRule?.changeFee 
        ? `Change fee: ${fareRule?.changeFee.formatted}`
        : 'Free date changes'
      : 'Date changes not permitted',
    status: fareRule?.exchangeable ? fareRule?.changeFee ? 'fee-applies' : 'included' : 'not-included',
    color: fareRule?.exchangeable ? fareRule?.changeFee ? 'yellow' : 'green' : 'red'
  });

  const getFlexibilityTooltip = (): FareRuleTooltipData => ({
    icon: '🔄',
    title: `${fareRule?.flexibility} Fare`,
    description: fareRule?.flexibility === 'PREMIUM' ? 'Maximum flexibility with minimal fees' :
                 fareRule?.flexibility === 'FLEXIBLE' ? 'Good flexibility with reasonable fees' :
                 fareRule?.flexibility === 'STANDARD' ? 'Standard flexibility with some fees' :
                 'Basic fare with limited flexibility',
    status: fareRule?.flexibility === 'PREMIUM' || fareRule?.flexibility === 'FLEXIBLE' ? 'included' : 
            fareRule?.flexibility === 'STANDARD' ? 'fee-applies' : 'not-included',
    color: fareRule?.flexibility === 'PREMIUM' || fareRule?.flexibility === 'FLEXIBLE' ? 'green' : 
           fareRule?.flexibility === 'STANDARD' ? 'yellow' : 'red'
  });

  const IconWrapper: React.FC<{ tooltip: FareRuleTooltipData; children: React.ReactNode }> = ({ tooltip, children }) => {
    if (showTooltips) {
      return <Tooltip data={tooltip}>{children}</Tooltip>;
    }
    return <>{children}</>;
  };

  const getIconColor = (color: string) => {
    const colorMap = {
      green: 'text-green-600',
      red: 'text-red-600', 
      yellow: 'text-yellow-600',
      blue: 'text-blue-600',
      gray: 'text-gray-600'
    };
    return colorMap[color as keyof typeof colorMap] || 'text-gray-600';
  };

  return (
    <div className={`
      flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg border border-gray-100
      ${compact ? 'py-2' : 'py-3'}
    `}>
      <div className="flex items-center gap-3">
        {/* Carry-on Icon */}
        <IconWrapper tooltip={getCarryOnTooltip()}>
          <span 
            className={`text-lg cursor-help transition-transform hover:scale-110 ${
              getIconColor(getCarryOnTooltip().color)
            }`}
            title={getCarryOnTooltip().title}
          >
            🎒
          </span>
        </IconWrapper>

        {/* Checked Bag Icon */}
        <IconWrapper tooltip={getCheckedBagTooltip()}>
          <span 
            className={`text-lg cursor-help transition-transform hover:scale-110 ${
              getIconColor(getCheckedBagTooltip().color)
            }`}
            title={getCheckedBagTooltip().title}
          >
            🧳
          </span>
        </IconWrapper>

        {/* Refundable Icon */}
        <IconWrapper tooltip={getRefundTooltip()}>
          <span 
            className={`text-lg cursor-help transition-transform hover:scale-110 ${
              getIconColor(getRefundTooltip().color)
            }`}
            title={getRefundTooltip().title}
          >
            💳
          </span>
        </IconWrapper>

        {/* Date Change Icon */}
        <IconWrapper tooltip={getChangeTooltip()}>
          <span 
            className={`text-lg cursor-help transition-transform hover:scale-110 ${
              getIconColor(getChangeTooltip().color)
            }`}
            title={getChangeTooltip().title}
          >
            📅
          </span>
        </IconWrapper>

        {/* Flexibility Icon (only if not compact) */}
        {!compact && (
          <IconWrapper tooltip={getFlexibilityTooltip()}>
            <span 
              className={`text-lg cursor-help transition-transform hover:scale-110 ${
                getIconColor(getFlexibilityTooltip().color)
              }`}
              title={getFlexibilityTooltip().title}
            >
              🔄
            </span>
          </IconWrapper>
        )}
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

export default FareRulesIcons;