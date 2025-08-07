/**
 * 🔍 REAL-TIME BOOKING VALIDATION
 * Comprehensive validation system for booking flow
 */

import { prisma } from '@/lib/database/prisma';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number; // 0-100 validation confidence score
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationWarning {
  field: string;
  code: string;
  message: string;
  suggestion?: string;
}

export interface BookingValidationData {
  flightOffers: any[];
  passengers: any[];
  contactInfo: any;
  payment: any;
  services?: any;
}

export class BookingValidator {
  private validationRules: ValidationRule[] = [];

  constructor() {
    this.initializeRules();
  }

  /**
   * Validate complete booking data
   */
  async validateBooking(data: BookingValidationData): Promise<ValidationResult> {
    console.log('🔍 Starting real-time booking validation');

    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let score = 100;

    try {
      // Run all validation rules
      for (const rule of this.validationRules) {
        try {
          const result = await rule.validate(data);
          
          if (!result.isValid) {
            errors.push(...result.errors);
            warnings.push(...result.warnings);
            score -= result.penaltyPoints || 10;
          }
        } catch (ruleError) {
          console.error(`❌ Validation rule error [${rule.name}]:`, ruleError);
          errors.push({
            field: 'system',
            code: 'VALIDATION_RULE_ERROR',
            message: `Validation rule "${rule.name}" failed`,
            severity: 'warning'
          });
          score -= 5;
        }
      }

      // Real-time flight availability check
      const availabilityResult = await this.validateFlightAvailability(data.flightOffers);
      if (!availabilityResult.isValid) {
        errors.push(...availabilityResult.errors);
        score -= 20;
      }

      // Duplicate booking check
      const duplicateResult = await this.checkDuplicateBooking(data);
      if (!duplicateResult.isValid) {
        warnings.push(...duplicateResult.warnings);
        score -= 5;
      }

      // Payment fraud detection
      const fraudResult = await this.detectPaymentFraud(data.payment, data.contactInfo);
      if (!fraudResult.isValid) {
        errors.push(...fraudResult.errors);
        score -= 30;
      }

      // Passenger verification
      const passengerResult = await this.validatePassengers(data.passengers);
      if (!passengerResult.isValid) {
        errors.push(...passengerResult.errors);
        warnings.push(...passengerResult.warnings);
        score -= 15;
      }

      score = Math.max(0, Math.min(100, score)); // Clamp between 0-100

      const result: ValidationResult = {
        isValid: errors.filter(e => e.severity === 'error').length === 0,
        errors,
        warnings,
        score
      };

      console.log(`✅ Validation complete - Score: ${score}/100, Errors: ${errors.length}, Warnings: ${warnings.length}`);
      
      return result;

    } catch (error) {
      console.error('❌ Booking validation failed:', error);
      
      return {
        isValid: false,
        errors: [{
          field: 'system',
          code: 'VALIDATION_SYSTEM_ERROR',
          message: 'Booking validation system encountered an error',
          severity: 'error'
        }],
        warnings: [],
        score: 0
      };
    }
  }

  /**
   * Initialize validation rules
   */
  private initializeRules(): void {
    this.validationRules = [
      new PassengerValidationRule(),
      new ContactValidationRule(),
      new PaymentValidationRule(),
      new FlightDataValidationRule(),
      new BusinessRulesValidationRule()
    ];
  }

  /**
   * Validate flight availability in real-time
   */
  private async validateFlightAvailability(flightOffers: any[]): Promise<ValidationResult> {
    try {
      // In a real implementation, this would check with the airline/GDS
      // For now, simulate availability checking
      
      const errors: ValidationError[] = [];
      
      for (const offer of flightOffers) {
        // Simulate random availability issues (5% chance)
        if (Math.random() < 0.05) {
          errors.push({
            field: 'flightOffers',
            code: 'FLIGHT_NOT_AVAILABLE',
            message: `Flight ${offer.itineraries?.[0]?.segments?.[0]?.carrierCode || 'N/A'} is no longer available`,
            severity: 'error'
          });
        }

        // Check if price has changed (10% chance)
        if (Math.random() < 0.1) {
          errors.push({
            field: 'pricing',
            code: 'PRICE_CHANGED',
            message: 'Flight price has changed since selection. Please refresh and try again.',
            severity: 'error'
          });
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings: [],
        score: errors.length === 0 ? 100 : 50
      };

    } catch (error) {
      console.error('❌ Flight availability check failed:', error);
      return {
        isValid: false,
        errors: [{
          field: 'flightOffers',
          code: 'AVAILABILITY_CHECK_FAILED',
          message: 'Unable to verify flight availability',
          severity: 'warning'
        }],
        warnings: [],
        score: 80
      };
    }
  }

  /**
   * Check for duplicate bookings
   */
  private async checkDuplicateBooking(data: BookingValidationData): Promise<ValidationResult> {
    try {
      // Check for recent bookings with same passenger and flight details
      const recentBookings = await prisma.booking.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          },
          // In a real implementation, you'd check passenger name and flight details
        },
        take: 10
      });

      const warnings: ValidationWarning[] = [];

      // Simple duplicate detection (would be more sophisticated in production)
      if (recentBookings.length > 0) {
        // Check if passenger email already has booking in last hour
        const duplicateCheck = recentBookings.find((booking: any) => {
          const passengerInfo = booking.passengerInfo as any;
          return passengerInfo?.email === data.contactInfo.email ||
                 passengerInfo?.emailAddress === data.contactInfo.emailAddress;
        });

        if (duplicateCheck) {
          warnings.push({
            field: 'booking',
            code: 'POSSIBLE_DUPLICATE',
            message: 'A similar booking was recently made with this email address',
            suggestion: 'Please verify this is not a duplicate booking'
          });
        }
      }

      return {
        isValid: true,
        errors: [],
        warnings,
        score: warnings.length > 0 ? 90 : 100
      };

    } catch (error) {
      console.warn('⚠️ Duplicate booking check failed:', error);
      return {
        isValid: true,
        errors: [],
        warnings: [],
        score: 95
      };
    }
  }

  /**
   * Detect payment fraud indicators
   */
  private async detectPaymentFraud(payment: any, contact: any): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
      // Basic fraud indicators
      const fraudIndicators = [];

      // Email validation
      if (contact.email || contact.emailAddress) {
        const email = contact.email || contact.emailAddress;
        
        // Check for disposable email domains
        const disposableDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com'];
        const emailDomain = email.split('@')[1]?.toLowerCase();
        
        if (disposableDomains.includes(emailDomain)) {
          fraudIndicators.push('Disposable email address detected');
        }

        // Check for suspicious email patterns
        if (email.includes('+') && email.split('+')[1].includes('test')) {
          fraudIndicators.push('Test email pattern detected');
        }
      }

      // Phone validation
      if (contact.phone?.number || contact.phones?.[0]?.number) {
        const phoneNumber = contact.phone?.number || contact.phones?.[0]?.number;
        
        // Check for obviously fake numbers
        if (/^(\d)\1{9,}$/.test(phoneNumber.replace(/\D/g, ''))) {
          fraudIndicators.push('Suspicious phone number pattern');
        }
      }

      // Payment validation
      if (payment.cardNumber) {
        // Basic card number validation (already done in booking-utils)
        // Additional fraud checks would go here
      }

      // Rate limiting check - too many attempts
      // In production, you'd check against a rate limiting service
      
      if (fraudIndicators.length > 0) {
        errors.push({
          field: 'payment',
          code: 'FRAUD_INDICATORS_DETECTED',
          message: `Potential fraud indicators detected: ${fraudIndicators.join(', ')}`,
          severity: 'error'
        });
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        score: errors.length === 0 ? 100 : 30
      };

    } catch (error) {
      console.error('❌ Fraud detection failed:', error);
      return {
        isValid: true, // Don't block booking on fraud detection errors
        errors: [],
        warnings: [{
          field: 'payment',
          code: 'FRAUD_CHECK_FAILED',
          message: 'Unable to complete fraud verification',
          suggestion: 'Manual review may be required'
        }],
        score: 85
      };
    }
  }

  /**
   * Validate passenger data
   */
  private async validatePassengers(passengers: any[]): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    for (const [index, passenger] of passengers.entries()) {
      const passengerPrefix = `passenger[${index}]`;

      // Name validation
      if (!passenger.firstName || passenger.firstName.length < 2) {
        errors.push({
          field: `${passengerPrefix}.firstName`,
          code: 'INVALID_FIRST_NAME',
          message: `Passenger ${index + 1}: First name must be at least 2 characters`,
          severity: 'error'
        });
      }

      if (!passenger.lastName || passenger.lastName.length < 2) {
        errors.push({
          field: `${passengerPrefix}.lastName`,
          code: 'INVALID_LAST_NAME',
          message: `Passenger ${index + 1}: Last name must be at least 2 characters`,
          severity: 'error'
        });
      }

      // Date of birth validation
      if (!passenger.dateOfBirth) {
        errors.push({
          field: `${passengerPrefix}.dateOfBirth`,
          code: 'MISSING_DATE_OF_BIRTH',
          message: `Passenger ${index + 1}: Date of birth is required`,
          severity: 'error'
        });
      } else {
        const birthDate = new Date(passenger.dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();

        if (age < 0 || age > 120) {
          errors.push({
            field: `${passengerPrefix}.dateOfBirth`,
            code: 'INVALID_DATE_OF_BIRTH',
            message: `Passenger ${index + 1}: Invalid date of birth`,
            severity: 'error'
          });
        }

        // Warning for very young passengers without adult
        if (age < 2 && passengers.length === 1) {
          warnings.push({
            field: `${passengerPrefix}.dateOfBirth`,
            code: 'INFANT_WITHOUT_ADULT',
            message: `Passenger ${index + 1}: Infant passengers typically require an accompanying adult`,
            suggestion: 'Verify passenger age and travel arrangements'
          });
        }
      }

      // Document validation
      if (passenger.document || passenger.documents?.[0]) {
        const document = passenger.document || passenger.documents[0];
        
        if (!document.number || document.number.length < 5) {
          errors.push({
            field: `${passengerPrefix}.document.number`,
            code: 'INVALID_DOCUMENT_NUMBER',
            message: `Passenger ${index + 1}: Document number is invalid`,
            severity: 'error'
          });
        }

        if (document.expiryDate) {
          const expiryDate = new Date(document.expiryDate);
          const sixMonthsFromNow = new Date();
          sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

          if (expiryDate < sixMonthsFromNow) {
            warnings.push({
              field: `${passengerPrefix}.document.expiryDate`,
              code: 'DOCUMENT_EXPIRES_SOON',
              message: `Passenger ${index + 1}: Document expires within 6 months`,
              suggestion: 'Many countries require passport validity of 6+ months'
            });
          }
        }
      }
    }

    return {
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
      warnings,
      score: errors.length === 0 ? (warnings.length === 0 ? 100 : 90) : 70
    };
  }
}

// Validation Rule Interface
abstract class ValidationRule {
  abstract name: string;
  abstract validate(data: BookingValidationData): Promise<{
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    penaltyPoints?: number;
  }>;
}

// Individual Validation Rules
class PassengerValidationRule extends ValidationRule {
  name = 'PassengerValidation';

  async validate(data: BookingValidationData) {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!data.passengers || data.passengers.length === 0) {
      errors.push({
        field: 'passengers',
        code: 'NO_PASSENGERS',
        message: 'At least one passenger is required',
        severity: 'error'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      penaltyPoints: errors.length * 20
    };
  }
}

class ContactValidationRule extends ValidationRule {
  name = 'ContactValidation';

  async validate(data: BookingValidationData) {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const email = data.contactInfo?.email || data.contactInfo?.emailAddress;
    const phone = data.contactInfo?.phone?.number || data.contactInfo?.phones?.[0]?.number;

    if (!email) {
      errors.push({
        field: 'contactInfo.email',
        code: 'MISSING_EMAIL',
        message: 'Email address is required',
        severity: 'error'
      });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push({
        field: 'contactInfo.email',
        code: 'INVALID_EMAIL',
        message: 'Please enter a valid email address',
        severity: 'error'
      });
    }

    if (!phone) {
      errors.push({
        field: 'contactInfo.phone',
        code: 'MISSING_PHONE',
        message: 'Phone number is required',
        severity: 'error'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      penaltyPoints: errors.length * 15
    };
  }
}

class PaymentValidationRule extends ValidationRule {
  name = 'PaymentValidation';

  async validate(data: BookingValidationData) {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!data.payment) {
      errors.push({
        field: 'payment',
        code: 'MISSING_PAYMENT_INFO',
        message: 'Payment information is required',
        severity: 'error'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      penaltyPoints: errors.length * 25
    };
  }
}

class FlightDataValidationRule extends ValidationRule {
  name = 'FlightDataValidation';

  async validate(data: BookingValidationData) {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!data.flightOffers || data.flightOffers.length === 0) {
      errors.push({
        field: 'flightOffers',
        code: 'NO_FLIGHT_SELECTED',
        message: 'Please select a flight to continue',
        severity: 'error'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      penaltyPoints: errors.length * 30
    };
  }
}

class BusinessRulesValidationRule extends ValidationRule {
  name = 'BusinessRulesValidation';

  async validate(data: BookingValidationData) {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Business rule: Maximum 9 passengers per booking
    if (data.passengers && data.passengers.length > 9) {
      errors.push({
        field: 'passengers',
        code: 'TOO_MANY_PASSENGERS',
        message: 'Maximum 9 passengers allowed per booking',
        severity: 'error'
      });
    }

    // Business rule: At least one adult for infant passengers
    const adults = data.passengers?.filter(p => {
      const birthDate = new Date(p.dateOfBirth);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      return age >= 18;
    }).length || 0;

    const infants = data.passengers?.filter(p => {
      const birthDate = new Date(p.dateOfBirth);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      return age < 2;
    }).length || 0;

    if (infants > adults) {
      errors.push({
        field: 'passengers',
        code: 'INSUFFICIENT_ADULTS',
        message: 'Each infant must be accompanied by an adult',
        severity: 'error'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      penaltyPoints: errors.length * 20
    };
  }
}

// Export singleton instance
export const bookingValidator = new BookingValidator();