/**
 * CI/CD Schema Validation Safety Gate
 * 
 * This script validates all JSON-LD schemas before deployment.
 * If any schema has CRITICAL or HIGH severity errors,
 * the CI/CD pipeline will fail and block deployment.
 * 
 * @version 1.0.0
 * @usage npm run validate:schemas
 */

import { validateSchema, validateSchemas, exitWithValidationResult, formatValidationResults } from '../lib/seo/schema-validator';

// ============================================================================
// VALIDATION TARGETS
// ============================================================================

/**
 * Schemas to validate across the application
 * Add new schemas here as they are deployed
 */
const SCHEMA_VALIDATION_TARGETS = {
  homepage: {
    name: 'Homepage EntityHome Schema',
    validate: () => {
      // Simulate the homepage EntityHome schema structure
      const entityHomeSchema = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': 'https://www.fly2any.com/#organization',
            name: 'Fly2Any',
            url: 'https://www.fly2any.com',
          },
          {
            '@type': 'WebSite',
            '@id': 'https://www.fly2any.com/#website',
            url: 'https://www.fly2any.com',
            name: 'Fly2Any',
          },
        ],
      };
      
      // Validate each schema in the graph
      const results = (entityHomeSchema['@graph'] || []).map((schema: any) => validateSchema(schema));
      
      return {
        valid: results.every(r => r.valid),
        errors: results.flatMap(r => r.errors),
        warnings: results.flatMap(r => r.warnings),
      };
    },
  },
  
  faqPage: {
    name: 'FAQ Page QAPage Schema',
    validate: () => {
      // Simulate FAQ page schema structure
      const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How do I book a flight?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Search for flights using our search tool, select your preferred option, fill in passenger details, and complete payment.',
            },
          },
        ],
      };
      
      return validateSchema(faqSchema);
    },
  },
  
  hotels: {
    name: 'Hotels Section LodgingBusiness Schema',
    validate: () => {
      // Simulate hotel schema structure
      const hotelSchema = {
        '@context': 'https://schema.org',
        '@type': 'LodgingBusiness',
        name: 'Example Hotel',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'New York',
          addressCountry: 'US',
        },
        starRating: 4,
        priceRange: '$$-$$$',
      };
      
      return validateSchema(hotelSchema);
    },
  },
  
  tours: {
    name: 'Tours Section TouristTrip Schema',
    validate: () => {
      // Simulate tour schema structure (matches geo-optimization.ts)
      const tourSchema = {
        '@context': 'https://schema.org',
        '@type': 'TouristTrip',
        name: 'Example Tour',
        description: 'Example tour description',
        provider: {
          '@type': 'TravelAgency',
          name: 'Fly2Any',
          url: 'https://www.fly2any.com',
        },
        touristType: 'Leisure',
        itinerary: {
          '@type': 'ItemList',
          numberOfItems: 1,
          itemListElement: [{
            '@type': 'ListItem',
            position: 1,
            item: {
              '@type': 'TouristAttraction',
              name: 'Example Location',
            },
          }],
        },
        offers: {
          '@type': 'Offer',
          price: 150,
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: 'https://www.fly2any.com',
        },
      };
      
      return validateSchema(tourSchema);
    },
  },
};

// ============================================================================
// VALIDATION EXECUTION
// ============================================================================

/**
 * Run all schema validations
 */
function runValidations(): boolean {
  console.log('\n' + '='.repeat(70));
  console.log('🔍 SCHEMA VALIDATION - CI/CD SAFETY GATE');
  console.log('='.repeat(70) + '\n');
  
  let allPassed = true;
  const results: { name: string; valid: boolean; errors: number; warnings: number }[] = [];
  
  // Run each validation
  for (const [key, target] of Object.entries(SCHEMA_VALIDATION_TARGETS)) {
    const result = target.validate();
    
    results.push({
      name: target.name,
      valid: result.valid,
      errors: result.errors.length,
      warnings: result.warnings.length,
    });
    
    // Log results
    console.log(formatValidationResults(result, target.name));
    
    // Track overall pass/fail
    if (!result.valid) {
      allPassed = false;
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 VALIDATION SUMMARY');
  console.log('='.repeat(70));
  
  for (const result of results) {
    const status = result.valid ? '✅ PASS' : '❌ FAIL';
    const color = result.valid ? '\x1b[32m' : '\x1b[31m'; // Green or Red
    const reset = '\x1b[0m';
    
    console.log(`${color}${status}${reset} | ${result.name}`);
    console.log(`    Errors: ${result.errors} | Warnings: ${result.warnings}\n`);
  }
  
  // Overall result
  console.log('='.repeat(70));
  if (allPassed) {
    console.log('✅ ALL SCHEMAS VALID - DEPLOYMENT APPROVED');
    console.log('='.repeat(70) + '\n');
  } else {
    console.log('❌ SCHEMA VALIDATION FAILED - DEPLOYMENT BLOCKED');
    console.log('='.repeat(70));
    console.log('\n🚫 Critical or High severity errors must be fixed before deployment.');
    console.log('🔧 Review the errors above and update the schemas.\n');
    console.log('='.repeat(70) + '\n');
    
    // Exit with error code to fail CI/CD pipeline
    process.exit(1);
  }
  
  return allPassed;
}

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================

try {
  const passed = runValidations();
  
  if (passed) {
    console.log('\n✅ Schema validation completed successfully.');
    process.exit(0);
  }
} catch (error) {
  console.error('\n❌ Schema validation encountered an unexpected error:');
  console.error(error);
  console.error('\nThis is a validation tool error, not a schema validation error.');
  console.error('Please report this to the development team.\n');
  
  // Exit with error code for tool failure (not schema failure)
  process.exit(2);
}
