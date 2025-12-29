'use client';

import { Info } from 'lucide-react';

/**
 * DOT COMPLIANCE: 14 CFR 399.85 Baggage Fee Disclosure
 *
 * US Department of Transportation requires that any advertiser of air fares
 * must "prominently disclose" on the first screen that baggage fees may apply.
 *
 * This component ensures compliance by displaying the required disclaimer
 * on the flight search results page BEFORE users see individual fare quotes.
 *
 * Regulation Reference: https://www.ecfr.gov/current/title-14/chapter-II/subchapter-A/part-399/subpart-E/section-399.85
 *
 * Penalty for Non-Compliance: Up to $27,500 per violation
 */

interface BaggageFeeDisclaimerProps {
  /** Language for translated content */
  lang?: 'en' | 'pt' | 'es';
  /** Optional custom styling */
  className?: string;
}

const content = {
  en: {
    disclaimer: 'Baggage fees may apply and vary by airline.',
    additionalInfo: 'Checked bag allowances and fees differ by fare class and route. See individual flight details for specific baggage policies.',
  },
  pt: {
    disclaimer: 'Taxas de bagagem podem ser aplicadas e variam por companhia aérea.',
    additionalInfo: 'Franquias e taxas de bagagem despachada diferem por classe tarifária e rota. Consulte os detalhes individuais do voo para políticas específicas.',
  },
  es: {
    disclaimer: 'Se pueden aplicar tarifas de equipaje y varían según la aerolínea.',
    additionalInfo: 'Las franquicias y tarifas de equipaje facturado difieren según la clase tarifaria y la ruta. Consulte los detalles individuales del vuelo para conocer las políticas específicas.',
  },
};

export default function BaggageFeeDisclaimer({
  lang = 'en',
  className = '',
}: BaggageFeeDisclaimerProps) {
  const t = content[lang];

  return (
    <div
      className={`
        mb-4 p-3
        bg-blue-50 border border-blue-200 rounded-lg
        hover:bg-blue-100 hover:border-blue-300 transition-colors
        ${className}
      `}
      role="status"
      aria-live="polite"
      data-compliance="dot-399-85"
    >
      <div className="flex items-start gap-2">
        {/* Info Icon */}
        <Info
          size={16}
          className="flex-shrink-0 text-blue-600 mt-0.5"
          aria-hidden="true"
        />

        {/* Disclaimer Text */}
        <div className="flex-1">
          <p className="text-sm font-semibold text-blue-900">
            {t.disclaimer}
                      </p>

          {/* Additional Context (Optional - can be hidden on mobile) */}
          <p className="hidden sm:block mt-1 text-xs text-blue-700">
            {t.additionalInfo}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * IMPLEMENTATION NOTES FOR DEVELOPERS:
 *
 * 1. PLACEMENT: This component MUST appear on the FIRST SCREEN where flight
 *    fares are displayed. Placing it below the fold or requiring scrolling
 *    violates DOT regulations.
 *
 * 2. VISIBILITY: The disclaimer must be "prominent and conspicuous". The blue
 *    background and info icon ensure it stands out from regular content.
 *
 * 3. TIMING: Show this BEFORE individual flight results, not after user
 *    expands flight details.
 *
 * 4. CONTENT: The text "Baggage fees may apply" or similar language is
 *    specifically required by 14 CFR 399.85(b).
 *
 * 5. LINK: Providing a link to detailed baggage information is recommended
 *    but not strictly required by the regulation.
 *
 * 6. DO NOT REMOVE: Removing or hiding this component will make the platform
 *    non-compliant with US DOT regulations and subject to civil penalties.
 *
 * CORRECT USAGE:
 * ```tsx
 * <BaggageFeeDisclaimer lang="en" />
 * <FlightResults flights={flights} />
 * ```
 *
 * INCORRECT USAGE (VIOLATION):
 * ```tsx
 * <FlightResults flights={flights} />
 * <BaggageFeeDisclaimer lang="en" />  ❌ Too late!
 * ```
 */
