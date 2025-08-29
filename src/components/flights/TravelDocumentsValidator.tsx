'use client';

/**
 * 📋 TRAVEL DOCUMENTS VALIDATOR
 * Comprehensive travel document validation system
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, AlertTriangleIcon, XIcon, InfoIcon, ClockIcon } from '@/components/Icons';

interface TravelDocumentsValidatorProps {
  origin: string; // IATA code
  destination: string; // IATA code
  departureDate: Date;
  nationality: string; // ISO country code
  onValidationComplete: (requirements: DocumentRequirements) => void;
  className?: string;
}

interface DocumentRequirement {
  type: 'passport' | 'visa' | 'vaccination' | 'covid' | 'transit' | 'special';
  name: string;
  required: boolean;
  description: string;
  validity?: string; // How long document must be valid
  processingTime?: string;
  cost?: string;
  link?: string;
  status: 'valid' | 'warning' | 'required' | 'unknown';
  details?: string[];
}

interface DocumentRequirements {
  destination: string;
  requirements: DocumentRequirement[];
  warnings: string[];
  recommendations: string[];
  lastUpdated: Date;
}

interface VisaRequirement {
  country: string;
  nationality: string;
  requirement: 'none' | 'visa_required' | 'visa_on_arrival' | 'eta' | 'visa_free';
  maxStay?: number; // days
  notes?: string;
}

interface VaccinationRequirement {
  country: string;
  vaccination: string;
  required: boolean;
  recommended: boolean;
  notes?: string;
}

// Mock database - in production this would come from APIs like IATA Travel Requirements API
const VISA_REQUIREMENTS: VisaRequirement[] = [
  // US Citizens
  { country: 'BR', nationality: 'US', requirement: 'none', maxStay: 90 },
  { country: 'GB', nationality: 'US', requirement: 'none', maxStay: 90 },
  { country: 'FR', nationality: 'US', requirement: 'none', maxStay: 90 },
  { country: 'DE', nationality: 'US', requirement: 'none', maxStay: 90 },
  { country: 'JP', nationality: 'US', requirement: 'none', maxStay: 90 },
  { country: 'CN', nationality: 'US', requirement: 'visa_required', notes: 'Tourist visa required' },
  { country: 'IN', nationality: 'US', requirement: 'eta', notes: 'e-Visa available online' },
  { country: 'RU', nationality: 'US', requirement: 'visa_required', notes: 'Tourist visa required' },
  { country: 'EG', nationality: 'US', requirement: 'visa_on_arrival', maxStay: 30 },
  
  // Brazilian Citizens
  { country: 'US', nationality: 'BR', requirement: 'visa_required', notes: 'B1/B2 tourist visa required' },
  { country: 'GB', nationality: 'BR', requirement: 'none', maxStay: 90 },
  { country: 'FR', nationality: 'BR', requirement: 'none', maxStay: 90 },
  { country: 'DE', nationality: 'BR', requirement: 'none', maxStay: 90 },
  { country: 'JP', nationality: 'BR', requirement: 'none', maxStay: 90 },
  { country: 'CN', nationality: 'BR', requirement: 'visa_required', notes: 'Tourist visa required' },
];

const VACCINATION_REQUIREMENTS: VaccinationRequirement[] = [
  { country: 'BR', vaccination: 'Yellow Fever', required: false, recommended: true, notes: 'Recommended for certain regions' },
  { country: 'ZA', vaccination: 'Yellow Fever', required: true, recommended: true, notes: 'Required if arriving from endemic areas' },
  { country: 'TH', vaccination: 'Hepatitis A', required: false, recommended: true },
  { country: 'IN', vaccination: 'Typhoid', required: false, recommended: true },
  { country: 'PE', vaccination: 'Yellow Fever', required: true, recommended: true, notes: 'Required for jungle areas' },
];

const COUNTRY_MAPPING: Record<string, string> = {
  // Major airports to countries
  'JFK': 'US', 'LAX': 'US', 'MIA': 'US', 'ORD': 'US', 'DFW': 'US', 'ATL': 'US',
  'GRU': 'BR', 'GIG': 'BR', 'BSB': 'BR', 'CGH': 'BR',
  'LHR': 'GB', 'LGW': 'GB', 'STN': 'GB',
  'CDG': 'FR', 'ORY': 'FR',
  'FRA': 'DE', 'MUC': 'DE',
  'NRT': 'JP', 'HND': 'JP',
  'PEK': 'CN', 'PVG': 'CN',
  'DEL': 'IN', 'BOM': 'IN',
  'SVO': 'RU', 'DME': 'RU',
  'CAI': 'EG',
  'JNB': 'ZA',
  'BKK': 'TH',
  'LIM': 'PE'
};

export default function TravelDocumentsValidator({
  origin,
  destination,
  departureDate,
  nationality,
  onValidationComplete,
  className = ''
}: TravelDocumentsValidatorProps) {
  const [requirements, setRequirements] = useState<DocumentRequirements | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCountryFromAirport = (iataCode: string): string => {
    return COUNTRY_MAPPING[iataCode] || 'UNKNOWN';
  };

  const validateDocuments = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const destinationCountry = getCountryFromAirport(destination);
      const originCountry = getCountryFromAirport(origin);

      if (destinationCountry === 'UNKNOWN') {
        throw new Error('Destination country not recognized');
      }

      const documentRequirements: DocumentRequirement[] = [];
      const warnings: string[] = [];
      const recommendations: string[] = [];

      // 1. Passport Requirements (always required for international travel)
      if (originCountry !== destinationCountry) {
        const passportValidityMonths = getPassportValidityRequirement(destinationCountry);
        documentRequirements.push({
          type: 'passport',
          name: 'Valid Passport',
          required: true,
          description: `Passport must be valid for at least ${passportValidityMonths} months from departure date`,
          validity: `${passportValidityMonths} months`,
          status: 'required',
          details: [
            'Passport must be machine-readable',
            'Must have at least 2 blank pages',
            'Should not be damaged or altered'
          ]
        });
      }

      // 2. Visa Requirements
      const visaReq = VISA_REQUIREMENTS.find(
        req => req.country === destinationCountry && req.nationality === nationality
      );

      if (visaReq) {
        switch (visaReq.requirement) {
          case 'visa_required':
            documentRequirements.push({
              type: 'visa',
              name: 'Tourist Visa',
              required: true,
              description: visaReq.notes || 'Tourist visa required before travel',
              processingTime: '7-30 business days',
              cost: '$50-200',
              status: 'required',
              link: `https://embassy-finder.com/visa/${destinationCountry}`
            });
            break;
          case 'eta':
            documentRequirements.push({
              type: 'visa',
              name: 'Electronic Travel Authorization',
              required: true,
              description: visaReq.notes || 'Electronic travel authorization required',
              processingTime: '1-3 business days',
              cost: '$10-50',
              status: 'required',
              link: `https://eta.gov/${destinationCountry}`
            });
            break;
          case 'visa_on_arrival':
            documentRequirements.push({
              type: 'visa',
              name: 'Visa on Arrival',
              required: true,
              description: `Visa available at airport upon arrival. Maximum stay: ${visaReq.maxStay} days`,
              cost: '$25-100',
              status: 'warning',
              details: [
                'Bring passport photos',
                'Have proof of onward travel',
                'Carry sufficient cash for visa fee'
              ]
            });
            break;
          case 'none':
            if (visaReq.maxStay) {
              recommendations.push(`Visa-free entry for up to ${visaReq.maxStay} days. Ensure your return ticket is within this period.`);
            }
            break;
        }
      }

      // 3. Vaccination Requirements
      const vaccinations = VACCINATION_REQUIREMENTS.filter(
        req => req.country === destinationCountry
      );

      vaccinations.forEach(vacc => {
        if (vacc.required) {
          documentRequirements.push({
            type: 'vaccination',
            name: `${vacc.vaccination} Vaccination`,
            required: true,
            description: vacc.notes || `${vacc.vaccination} vaccination required`,
            validity: 'Valid for 10 years',
            status: 'required',
            details: [
              'Must be administered at least 10 days before travel',
              'Carry vaccination certificate',
              'Available at travel clinics'
            ]
          });
        } else if (vacc.recommended) {
          documentRequirements.push({
            type: 'vaccination',
            name: `${vacc.vaccination} Vaccination`,
            required: false,
            description: vacc.notes || `${vacc.vaccination} vaccination recommended`,
            status: 'warning'
          });
        }
      });

      // 4. COVID-19 Requirements (example)
      if (new Date().getFullYear() >= 2023) {
        documentRequirements.push({
          type: 'covid',
          name: 'COVID-19 Requirements',
          required: false,
          description: 'Check latest COVID-19 entry requirements',
          status: 'warning',
          details: [
            'Requirements change frequently',
            'May include vaccination proof or testing',
            'Check official government sources'
          ],
          link: `https://travel.state.gov/covid/${destinationCountry}`
        });
      }

      // 5. Special Requirements
      if (destinationCountry === 'CN') {
        documentRequirements.push({
          type: 'special',
          name: 'Travel Registration',
          required: true,
          description: 'Register with local authorities within 24 hours of arrival',
          status: 'warning'
        });
      }

      // 6. Transit Requirements
      if (isTransitRequired(origin, destination)) {
        warnings.push('This route may require transit visas. Check requirements for connection airports.');
      }

      // 7. Currency and Customs
      recommendations.push('Check customs regulations and currency restrictions for your destination.');
      recommendations.push('Consider travel insurance for international trips.');

      const result: DocumentRequirements = {
        destination: destinationCountry,
        requirements: documentRequirements,
        warnings,
        recommendations,
        lastUpdated: new Date()
      };

      setRequirements(result);
      onValidationComplete(result);

    } catch (error) {
      console.error('Error validating travel documents:', error);
      setError(error instanceof Error ? error.message : 'Validation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getPassportValidityRequirement = (country: string): number => {
    // Most countries require 6 months validity
    const sixMonthCountries = ['TH', 'IN', 'CN', 'BR'];
    const threeMonthCountries = ['GB', 'FR', 'DE'];
    
    if (sixMonthCountries.includes(country)) return 6;
    if (threeMonthCountries.includes(country)) return 3;
    return 6; // Default to 6 months
  };

  const isTransitRequired = (origin: string, destination: string): boolean => {
    // Simple logic - in reality this would be more complex
    const originCountry = getCountryFromAirport(origin);
    const destCountry = getCountryFromAirport(destination);
    
    // If flying between different continents, transit is likely
    const continents = {
      US: 'NA', BR: 'SA', GB: 'EU', FR: 'EU', DE: 'EU',
      CN: 'AS', JP: 'AS', IN: 'AS', TH: 'AS'
    };
    
    return continents[originCountry as keyof typeof continents] !== 
           continents[destCountry as keyof typeof continents];
  };

  useEffect(() => {
    if (origin && destination && nationality) {
      validateDocuments();
    }
  }, [origin, destination, nationality, departureDate]);

  const getStatusIcon = (status: DocumentRequirement['status']) => {
    switch (status) {
      case 'valid':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'required':
        return <XIcon className="w-5 h-5 text-red-500" />;
      default:
        return <InfoIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: DocumentRequirement['status']) => {
    switch (status) {
      case 'valid':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'required':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600">Checking travel requirements...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center text-red-600 mb-4">
          <XIcon className="w-5 h-5 mr-2" />
          <span className="font-semibold">Validation Error</span>
        </div>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={validateDocuments}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!requirements) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <InfoIcon className="w-8 h-8 mx-auto mb-2" />
          <p>Enter travel details to check document requirements</p>
        </div>
      </div>
    );
  }

  const requiredDocs = requirements.requirements.filter(req => req.required);
  const recommendedDocs = requirements.requirements.filter(req => !req.required);

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span className="text-2xl">📋</span>
          Travel Document Requirements
        </h3>
        <div className="text-sm text-gray-500 flex items-center gap-1">
          <ClockIcon className="w-4 h-4" />
          Updated {requirements.lastUpdated.toLocaleDateString()}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-3">
          <InfoIcon className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <div className="font-semibold text-blue-900">Travel Summary</div>
            <div className="text-sm text-blue-800">
              {origin} → {destination} • {departureDate.toLocaleDateString()}
            </div>
            <div className="text-sm text-blue-700 mt-1">
              {requiredDocs.length} required documents • {recommendedDocs.length} recommendations
            </div>
          </div>
        </div>
      </div>

      {/* Required Documents */}
      {requiredDocs.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <XIcon className="w-4 h-4 text-red-500" />
            Required Documents
          </h4>
          <div className="space-y-3">
            {requiredDocs.map((doc: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`border rounded-lg p-4 ${getStatusColor(doc.status)}`}
              >
                <div className="flex items-start gap-3">
                  {getStatusIcon(doc.status)}
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{doc.name}</div>
                    <div className="text-sm text-gray-700 mt-1">{doc.description}</div>
                    
                    {doc.details && (
                      <ul className="text-sm text-gray-600 mt-2 space-y-1">
                        {doc.details.map((detail: any, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-gray-400 mt-1">•</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="flex flex-wrap gap-4 mt-3 text-sm">
                      {doc.validity && (
                        <div className="text-gray-600">
                          <span className="font-medium">Validity:</span> {doc.validity}
                        </div>
                      )}
                      {doc.processingTime && (
                        <div className="text-gray-600">
                          <span className="font-medium">Processing:</span> {doc.processingTime}
                        </div>
                      )}
                      {doc.cost && (
                        <div className="text-gray-600">
                          <span className="font-medium">Cost:</span> {doc.cost}
                        </div>
                      )}
                    </div>

                    {doc.link && (
                      <a
                        href={doc.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Apply Online →
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Documents */}
      {recommendedDocs.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertTriangleIcon className="w-4 h-4 text-yellow-500" />
            Recommended
          </h4>
          <div className="space-y-3">
            {recommendedDocs.map((doc: any, index: number) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${getStatusColor(doc.status)}`}
              >
                <div className="flex items-start gap-3">
                  {getStatusIcon(doc.status)}
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{doc.name}</div>
                    <div className="text-sm text-gray-700 mt-1">{doc.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {requirements.warnings.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertTriangleIcon className="w-4 h-4 text-yellow-500" />
            Important Notices
          </h4>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <ul className="space-y-2">
              {requirements.warnings.map((warning: any, index: number) => (
                <li key={index} className="flex items-start gap-2 text-sm text-yellow-800">
                  <span className="text-yellow-600 mt-1">⚠️</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {requirements.recommendations.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <InfoIcon className="w-4 h-4 text-blue-500" />
            Travel Tips
          </h4>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <ul className="space-y-2">
              {requirements.recommendations.map((rec: any, index: number) => (
                <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
                  <span className="text-blue-600 mt-1">💡</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
        <div className="font-medium mb-1">⚠️ Important Disclaimer</div>
        <p>
          Travel requirements change frequently. Always verify current requirements with official government sources, 
          embassies, or consulates before traveling. This information is for guidance only and Fly2any is not 
          responsible for any issues arising from outdated or incorrect information.
        </p>
      </div>
    </div>
  );
}