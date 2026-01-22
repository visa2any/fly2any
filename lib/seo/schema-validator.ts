/**
 * Schema Validation Tool for CI/CD Pipeline
 * 
 * Validates JSON-LD structured data against Schema.org requirements
 * and Google Rich Results Test criteria.
 * 
 * @version 1.0.0
 * @usage Integrate into CI/CD to catch schema errors before deployment
 */

// ============================================================================
// VALIDATION RULES
// ============================================================================

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  field: string;
  message: string;
  severity: 'critical' | 'high' | 'medium';
}

interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

// ============================================================================
// SCHEMA TYPE VALIDATION
// ============================================================================

const REQUIRED_SCHEMA_FIELDS: Record<string, string[]> = {
  Organization: ['@type', 'name', 'url'],
  WebSite: ['@type', 'url', 'name'],
  FAQPage: ['@type', 'mainEntity'],
  Flight: ['@type', 'flightNumber', 'airline', 'departureAirport', 'arrivalAirport'],
  TouristTrip: ['@type', 'name', 'provider', 'offers'],
  LodgingBusiness: ['@type', 'name', 'address', 'priceRange'],
  Event: ['@type', 'name', 'startDate', 'location'],
  Product: ['@type', 'name', 'offers'],
  Review: ['@type', 'itemReviewed', 'reviewRating'],
  BreadcrumbList: ['@type', 'itemListElement'],
  HowTo: ['@type', 'name', 'step'],
};

const OPTIONAL_SCHEMA_FIELDS: Record<string, string[]> = {
  Organization: ['logo', 'sameAs', 'contactPoint', 'address', 'foundingDate'],
  WebSite: ['description', 'potentialAction', 'publisher'],
  FAQPage: ['description'],
  Flight: ['departureTime', 'arrivalTime', 'offers'],
  TouristTrip: ['description', 'image', 'aggregateRating', 'touristType'],
  LodgingBusiness: ['image', 'aggregateRating', 'amenityFeature', 'checkinTime', 'checkoutTime'],
  Event: ['endDate', 'image', 'offers', 'description'],
  Product: ['description', 'image', 'aggregateRating', 'brand', 'sku'],
  Review: ['author', 'datePublished', 'reviewBody'],
  BreadcrumbList: ['name'],
  HowTo: ['description', 'image', 'totalTime', 'supply', 'tool', 'estimatedCost'],
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate a single schema object
 */
export function validateSchema(schema: any): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check if schema is an object
  if (!schema || typeof schema !== 'object') {
    return {
      valid: false,
      errors: [{ field: 'root', message: 'Schema must be an object', severity: 'critical' }],
      warnings: [],
    };
  }

  // Check @type is present
  if (!schema['@type']) {
    errors.push({
      field: '@type',
      message: 'Missing required @type field',
      severity: 'critical',
    });
  } else {
    // Validate required fields for this type
    const schemaType = schema['@type'];
    const requiredFields = REQUIRED_SCHEMA_FIELDS[schemaType] || [];
    
    for (const field of requiredFields) {
      if (!schema[field]) {
        errors.push({
          field,
          message: `Missing required field: ${field}`,
          severity: 'high',
        });
      }
    }

    // Warn about recommended optional fields
    const optionalFields = OPTIONAL_SCHEMA_FIELDS[schemaType] || [];
    for (const field of optionalFields) {
      if (!schema[field]) {
        warnings.push({
          field,
          message: `Recommended optional field missing: ${field}`,
          suggestion: `Consider adding ${field} for better SEO`,
        });
      }
    }
  }

  // Check @context if present
  if (schema['@context'] && typeof schema['@context'] !== 'string') {
    errors.push({
      field: '@context',
      message: '@context must be a string (URL)',
      severity: 'high',
    });
  }

  // Validate specific schema types
  if (schema['@type'] === 'FAQPage') {
    const faqErrors = validateFAQPage(schema);
    errors.push(...faqErrors);
  }

  if (schema['@type'] === 'TouristTrip') {
    const tripErrors = validateTouristTrip(schema);
    errors.push(...tripErrors);
  }

  if (schema['@type'] === 'LodgingBusiness') {
    const hotelErrors = validateLodgingBusiness(schema);
    errors.push(...hotelErrors);
  }

  if (schema['@type'] === 'Product' || schema['@type'] === 'Offer') {
    const priceErrors = validatePrice(schema);
    errors.push(...priceErrors);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate array of schemas
 */
export function validateSchemas(schemas: any[]): ValidationResult {
  const allErrors: ValidationError[] = [];
  const allWarnings: ValidationWarning[] = [];

  if (!Array.isArray(schemas)) {
    return {
      valid: false,
      errors: [{ field: 'root', message: 'Input must be an array of schemas', severity: 'critical' }],
      warnings: [],
    };
  }

  for (let i = 0; i < schemas.length; i++) {
    const result = validateSchema(schemas[i]);
    allErrors.push(...result.errors.map(e => ({ ...e, field: `[${i}].${e.field}` })));
    allWarnings.push(...result.warnings);
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}

// ============================================================================
// TYPE-SPECIFIC VALIDATORS
// ============================================================================

function validateFAQPage(schema: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!schema.mainEntity || !Array.isArray(schema.mainEntity)) {
    errors.push({
      field: 'mainEntity',
      message: 'FAQPage.mainEntity must be an array of Question objects',
      severity: 'critical',
    });
    return errors;
  }

  for (let i = 0; i < schema.mainEntity.length; i++) {
    const question = schema.mainEntity[i];
    if (!question.name) {
      errors.push({
        field: `mainEntity[${i}].name`,
        message: 'Question object missing required name field',
        severity: 'high',
      });
    }
    if (!question.acceptedAnswer) {
      errors.push({
        field: `mainEntity[${i}].acceptedAnswer`,
        message: 'Question object missing required acceptedAnswer field',
        severity: 'high',
      });
    }
    if (question.acceptedAnswer && !question.acceptedAnswer.text) {
      errors.push({
        field: `mainEntity[${i}].acceptedAnswer.text`,
        message: 'Answer object missing required text field',
        severity: 'high',
      });
    }
  }

  return errors;
}

function validateTouristTrip(schema: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!schema.provider || !schema.provider['@type']) {
    errors.push({
      field: 'provider.@type',
      message: 'TouristTrip provider must have @type',
      severity: 'high',
    });
  }

  if (schema.offers && !schema.offers.price) {
    errors.push({
      field: 'offers.price',
      message: 'Offer missing price field',
      severity: 'high',
    });
  }

  if (schema.offers && !schema.offers.priceCurrency) {
    errors.push({
      field: 'offers.priceCurrency',
      message: 'Offer missing priceCurrency field',
      severity: 'high',
    });
  }

  return errors;
}

function validateLodgingBusiness(schema: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!schema.address || !schema.address['@type']) {
    errors.push({
      field: 'address.@type',
      message: 'LodgingBusiness address must have @type',
      severity: 'high',
    });
  }

  if (schema.address && !schema.address.addressLocality) {
    errors.push({
      field: 'address.addressLocality',
      message: 'Address missing addressLocality (city)',
      severity: 'high',
    });
  }

  if (schema.address && !schema.address.addressCountry) {
    errors.push({
      field: 'address.addressCountry',
      message: 'Address missing addressCountry',
      severity: 'high',
    });
  }

  return errors;
}

function validatePrice(schema: any): ValidationError[] {
  const errors: ValidationError[] = [];
  const priceField = schema.price || (schema.offers && schema.offers[0]?.price);

  if (!priceField) {
    errors.push({
      field: 'price',
      message: 'Price field is missing',
      severity: 'high',
    });
    return errors;
  }

  if (typeof priceField !== 'number' || priceField < 0) {
    errors.push({
      field: 'price',
      message: 'Price must be a positive number',
      severity: 'critical',
    });
  }

  const currency = schema.priceCurrency || (schema.offers && schema.offers[0]?.priceCurrency);
  if (!currency || !/^[A-Z]{3}$/.test(currency)) {
    errors.push({
      field: 'priceCurrency',
      message: 'priceCurrency must be a valid 3-letter ISO 4217 code (e.g., USD, EUR)',
      severity: 'critical',
    });
  }

  if (schema.availability && typeof schema.availability !== 'string') {
    errors.push({
      field: 'availability',
      message: 'Availability must be a string URL',
      severity: 'medium',
    });
  }

  return errors;
}

// ============================================================================
// CI/CD UTILITY FUNCTIONS
// ============================================================================

/**
 * Format validation results for console output
 */
export function formatValidationResults(result: ValidationResult, schemaName: string): string {
  const lines: string[] = [];
  
  lines.push(`\n${'='.repeat(60)}`);
  lines.push(`SCHEMA VALIDATION: ${schemaName}`);
  lines.push('='.repeat(60));
  lines.push(`Status: ${result.valid ? '✅ VALID' : '❌ INVALID'}`);
  lines.push('');

  if (result.errors.length > 0) {
    lines.push(`\n❌ ERRORS (${result.errors.length}):\n`);
    for (const error of result.errors) {
      lines.push(`  [${error.severity.toUpperCase()}] ${error.field}`);
      lines.push(`    ${error.message}\n`);
    }
  }

  if (result.warnings.length > 0) {
    lines.push(`\n⚠️  WARNINGS (${result.warnings.length}):\n`);
    for (const warning of result.warnings) {
      lines.push(`  ${warning.field}`);
      lines.push(`    ${warning.message}`);
      if (warning.suggestion) {
        lines.push(`    💡 ${warning.suggestion}`);
      }
      lines.push('');
    }
  }

  if (result.valid) {
    lines.push('✅ All required fields present and properly formatted');
  }

  lines.push('='.repeat(60) + '\n');
  
  return lines.join('\n');
}

/**
 * Exit with error code for CI/CD
 */
export function exitWithValidationResult(result: ValidationResult, schemaName: string): void {
  console.log(formatValidationResults(result, schemaName));

  if (!result.valid) {
    process.exit(1); // Fail CI/CD pipeline
  }
}

// ============================================================================
// COMMON VALIDATION PATTERNS
// ============================================================================

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate ISO 8601 date format
 */
export function isValidDate(date: string): boolean {
  const iso8601Pattern = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?)?$/;
  return iso8601Pattern.test(date);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  validateSchema,
  validateSchemas,
  exitWithValidationResult,
  formatValidationResults,
  isValidUrl,
  isValidDate,
  isValidEmail,
};
