'use client';

import { useState } from 'react';
import { Ticket, AlertTriangle, Info, X, ChevronDown, ChevronUp } from 'lucide-react';
import type { MixedCarrierFare, MixedFareWarning } from '@/lib/flights/mixed-carrier-combiner';
import { getWarningMessages } from '@/lib/flights/mixed-carrier-combiner';

interface SeparateTicketsBadgeProps {
  /** The mixed carrier fare details */
  mixedFare?: MixedCarrierFare;
  /** Show expanded warnings by default */
  showWarnings?: boolean;
  /** Language for translations */
  lang?: 'en' | 'pt' | 'es';
  /** Compact mode for inline display */
  compact?: boolean;
}

const translations = {
  en: {
    separateTickets: 'Separate Tickets',
    hackerFare: 'Hacker Fare',
    save: 'Save',
    off: 'off',
    outbound: 'Outbound',
    return: 'Return',
    importantInfo: 'Important Information',
    learnMore: 'Learn more',
    hideDetails: 'Hide details',
    twoTicketsWarning: 'This is 2 separate bookings',
    bookTogether: 'Book together but fly separately',
  },
  pt: {
    separateTickets: 'Bilhetes Separados',
    hackerFare: 'Tarifa Hacker',
    save: 'Economize',
    off: 'de desconto',
    outbound: 'Ida',
    return: 'Volta',
    importantInfo: 'Informação Importante',
    learnMore: 'Saiba mais',
    hideDetails: 'Ocultar detalhes',
    twoTicketsWarning: 'São 2 reservas separadas',
    bookTogether: 'Reserve junto, mas voe separadamente',
  },
  es: {
    separateTickets: 'Boletos Separados',
    hackerFare: 'Tarifa Hacker',
    save: 'Ahorra',
    off: 'de descuento',
    outbound: 'Ida',
    return: 'Vuelta',
    importantInfo: 'Información Importante',
    learnMore: 'Más información',
    hideDetails: 'Ocultar detalles',
    twoTicketsWarning: 'Son 2 reservas separadas',
    bookTogether: 'Reserva junto pero vuela por separado',
  },
};

export function SeparateTicketsBadge({
  mixedFare,
  showWarnings = false,
  lang = 'en',
  compact = false,
}: SeparateTicketsBadgeProps) {
  const [isExpanded, setIsExpanded] = useState(showWarnings);
  const t = translations[lang];

  // Compact inline badge (for flight card header)
  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-orange-100 to-amber-100 border border-orange-300 rounded-full text-orange-800 text-[10px] font-semibold">
        <Ticket className="w-3 h-3" />
        {t.separateTickets}
        {mixedFare?.savings && mixedFare.savings.percentage >= 5 && (
          <span className="ml-1 px-1 py-0.5 bg-green-500 text-white rounded text-[9px]">
            -{mixedFare.savings.percentage.toFixed(0)}%
          </span>
        )}
      </span>
    );
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-300 rounded-lg overflow-hidden">
      {/* Main Badge Header */}
      <div className="px-3 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-orange-500 rounded-full">
            <Ticket className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-orange-900">{t.separateTickets}</span>
              {mixedFare?.savings && mixedFare.savings.percentage >= 5 && (
                <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
                  {t.save} {mixedFare.savings.percentage.toFixed(0)}% ({mixedFare.combinedPrice.currency} {mixedFare.savings.amount.toFixed(0)} {t.off})
                </span>
              )}
            </div>
            <p className="text-xs text-orange-700">{t.bookTogether}</p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded-full hover:bg-orange-200 transition-colors"
          aria-label={isExpanded ? t.hideDetails : t.learnMore}
        >
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-orange-700" />
          ) : (
            <ChevronDown className="w-5 h-5 text-orange-700" />
          )}
        </button>
      </div>

      {/* Expanded Warnings */}
      {isExpanded && (
        <div className="px-3 py-2 border-t border-orange-200 bg-orange-50/50 space-y-2">
          {/* Ticket Breakdown */}
          {mixedFare && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-white rounded border border-orange-200">
                <div className="font-semibold text-gray-700 mb-1">{t.outbound}</div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-blue-600">
                    {mixedFare.airlines.outbound.join(', ')}
                  </span>
                  <span className="text-gray-500">
                    {mixedFare.combinedPrice.currency} {mixedFare.combinedPrice.outboundPrice.toFixed(0)}
                  </span>
                </div>
              </div>
              <div className="p-2 bg-white rounded border border-orange-200">
                <div className="font-semibold text-gray-700 mb-1">{t.return}</div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-purple-600">
                    {mixedFare.airlines.return.join(', ')}
                  </span>
                  <span className="text-gray-500">
                    {mixedFare.combinedPrice.currency} {mixedFare.combinedPrice.returnPrice.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Warnings */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1 text-orange-800 font-semibold text-xs">
              <AlertTriangle className="w-4 h-4" />
              {t.importantInfo}
            </div>
            <ul className="space-y-1 text-xs text-orange-900">
              {mixedFare?.warnings &&
                getWarningMessages(mixedFare.warnings, lang).map((message, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>{message}</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Inline warning banner for flight selection confirmation
 */
export function SeparateTicketsWarningBanner({
  mixedFare,
  lang = 'en',
  onDismiss,
}: {
  mixedFare: MixedCarrierFare;
  lang?: 'en' | 'pt' | 'es';
  onDismiss?: () => void;
}) {
  const t = translations[lang];

  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-bold text-amber-900">{t.twoTicketsWarning}</h3>
            <ul className="space-y-1 text-sm text-amber-800">
              {getWarningMessages(mixedFare.warnings, lang).slice(0, 3).map((message, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-amber-500">•</span>
                  <span>{message}</span>
                </li>
              ))}
            </ul>

            {/* Price Breakdown */}
            <div className="mt-3 p-2 bg-white rounded border border-amber-200 inline-flex items-center gap-4 text-sm">
              <div>
                <span className="text-gray-600">{t.outbound}:</span>{' '}
                <span className="font-bold">{mixedFare.airlines.outbound[0]}</span>{' '}
                <span className="text-gray-500">
                  {mixedFare.combinedPrice.currency} {mixedFare.combinedPrice.outboundPrice.toFixed(0)}
                </span>
              </div>
              <div className="text-gray-300">+</div>
              <div>
                <span className="text-gray-600">{t.return}:</span>{' '}
                <span className="font-bold">{mixedFare.airlines.return[0]}</span>{' '}
                <span className="text-gray-500">
                  {mixedFare.combinedPrice.currency} {mixedFare.combinedPrice.returnPrice.toFixed(0)}
                </span>
              </div>
              <div className="text-gray-300">=</div>
              <div className="font-bold text-lg text-amber-900">
                {mixedFare.combinedPrice.currency} {mixedFare.combinedPrice.total.toFixed(0)}
              </div>
            </div>
          </div>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 rounded-full hover:bg-amber-200 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5 text-amber-700" />
          </button>
        )}
      </div>
    </div>
  );
}

export default SeparateTicketsBadge;
