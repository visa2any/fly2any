/**
 * Schema Validation and Testing Utilities
 * Tools for validating and testing schema markup implementations
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  richSnippetEligible: boolean;
  schemaType: string;
}

export interface SchemaTestingUrls {
  googleRichResultsTest: string;
  googleSchemaMarkupValidator: string;
  schemaOrgValidator: string;
  microsoftRichMarkupTester: string;
}

export class SchemaValidator {
  /**
   * Generate validation URLs for testing schema markup
   */
  static generateValidationUrls(pageUrl: string): SchemaTestingUrls {
    const encodedUrl = encodeURIComponent(pageUrl);
    
    return {
      googleRichResultsTest: `https://search.google.com/test/rich-results?url=${encodedUrl}`,
      googleSchemaMarkupValidator: `https://validator.schema.org/#url=${encodedUrl}`,
      schemaOrgValidator: `https://validator.schema.org/`,
      microsoftRichMarkupTester: `https://www.bing.com/toolbox/markup-validator?url=${encodedUrl}`
    };
  }

  /**
   * Schema validation checklist for manual review
   */
  static getValidationChecklist(): Record<string, string[]> {
    return {
      "Required Properties": [
        "All schema types have required properties",
        "@context is set to https://schema.org",
        "@type is correctly specified", 
        "Name/headline is present and descriptive",
        "URL is canonical and working",
        "Description is meaningful and accurate"
      ],
      "TravelAgency Schema": [
        "Business name is correct and consistent",
        "Address information is complete and accurate",
        "Contact information includes phone/email",
        "Service area covers target markets",
        "Operating hours are specified",
        "Accepted payment methods listed",
        "Aggregate rating has valid values",
        "Reviews include author and rating"
      ],
      "FlightReservation Schema": [
        "Reservation number is unique",
        "Passenger name matches booking",
        "Flight details are complete (airline, flight number, times)",
        "Airport codes are valid IATA codes",
        "Departure/arrival times in ISO 8601 format",
        "Price information includes currency",
        "Booking agent information present"
      ],
      "Product Schema (Travel Packages)": [
        "Product name is descriptive",
        "Offer includes price and currency", 
        "Availability status is accurate",
        "Images are high-quality and relevant",
        "Reviews and ratings are authentic",
        "Brand information is consistent",
        "Category reflects product type"
      ],
      "Article Schema (Travel Guides)": [
        "Headline under 110 characters for optimal display",
        "Author information is complete",
        "Publisher details match organization",
        "Published/modified dates in ISO format",
        "Images include alt text and proper dimensions",
        "Word count and reading time estimated",
        "Keywords relevant to content"
      ],
      "Event Schema": [
        "Event name is descriptive and appealing",
        "Start date/time in correct timezone",
        "Location includes complete address",
        "Organizer information is accurate",
        "Ticket information (if applicable) complete",
        "Event status reflects current situation",
        "Performer details for entertainment events"
      ],
      "FAQ Schema": [
        "Questions are commonly asked by users",
        "Answers are comprehensive and helpful",
        "Language matches target audience",
        "Questions formatted as actual questions",
        "Answers provide value beyond yes/no"
      ]
    };
  }

  /**
   * Common schema markup errors and fixes
   */
  static getCommonErrorsFixes(): Record<string, { error: string; fix: string; priority: 'High' | 'Medium' | 'Low' }[]> {
    return {
      "Syntax Errors": [
        {
          error: "Missing or incorrect @context",
          fix: "Always use '@context': 'https://schema.org'",
          priority: "High"
        },
        {
          error: "Invalid JSON-LD syntax",
          fix: "Validate JSON structure with online JSON validators",
          priority: "High"
        },
        {
          error: "Mismatched quotes in JSON",
          fix: "Use consistent double quotes for all properties and values",
          priority: "High"
        }
      ],
      "Required Properties": [
        {
          error: "Missing required 'name' property",
          fix: "Add descriptive name for all entities",
          priority: "High"
        },
        {
          error: "Missing 'url' property",
          fix: "Include canonical URL for all pages and entities",
          priority: "High"
        },
        {
          error: "Invalid date format",
          fix: "Use ISO 8601 format: YYYY-MM-DDTHH:MM:SS±HH:MM",
          priority: "Medium"
        }
      ],
      "Business Information": [
        {
          error: "Incomplete address information",
          fix: "Include streetAddress, addressLocality, addressRegion, postalCode, addressCountry",
          priority: "Medium"
        },
        {
          error: "Missing contact information",
          fix: "Add telephone, email, or contactPoint with proper formatting",
          priority: "Medium"
        },
        {
          error: "Invalid geographic coordinates",
          fix: "Verify latitude/longitude values are within valid ranges",
          priority: "Low"
        }
      ],
      "Rich Snippets": [
        {
          error: "Reviews without proper rating scale",
          fix: "Use consistent rating scale (1-5) with bestRating and worstRating",
          priority: "Medium"
        },
        {
          error: "Price without currency specification",
          fix: "Always include priceCurrency with ISO 4217 currency codes",
          priority: "High"
        },
        {
          error: "Images missing or low quality",
          fix: "Use high-resolution images (1200x630 minimum) with descriptive alt text",
          priority: "Medium"
        }
      ]
    };
  }

  /**
   * Performance metrics for schema markup
   */
  static getPerformanceMetrics(): Record<string, { metric: string; target: string; measurement: string }[]> {
    return {
      "Rich Snippet Performance": [
        {
          metric: "Rich snippet appearance rate",
          target: ">80% for eligible pages",
          measurement: "Google Search Console Rich Results report"
        },
        {
          metric: "Click-through rate improvement",
          target: "15-30% increase vs non-rich snippets",
          measurement: "GSC Performance report comparison"
        },
        {
          metric: "Schema validation score",
          target: "100% pass rate",
          measurement: "Google Rich Results Test"
        }
      ],
      "Content Discovery": [
        {
          metric: "New page indexing speed",
          target: "<24 hours for priority pages",
          measurement: "GSC URL Inspection tool"
        },
        {
          metric: "Knowledge panel appearance",
          target: "Active for brand searches",
          measurement: "Manual brand search monitoring"
        },
        {
          metric: "Related searches enhancement",
          target: "Relevant queries show related content",
          measurement: "Search result analysis"
        }
      ]
    };
  }

  /**
   * Testing procedures for different schema types
   */
  static getTestingProcedures(): Record<string, string[]> {
    return {
      "Pre-Deployment Testing": [
        "Validate JSON-LD syntax using online validators",
        "Test schema with Google Rich Results Test",
        "Verify all required properties are present",
        "Check for syntax errors and warnings",
        "Confirm URLs are accessible and canonical",
        "Validate date formats and time zones",
        "Test on mobile and desktop user agents"
      ],
      "Post-Deployment Monitoring": [
        "Monitor Google Search Console for structured data errors",
        "Track rich snippet appearance rates",
        "Monitor click-through rate changes",
        "Check for new warnings or errors weekly",
        "Verify schema appears correctly in search results",
        "Test page loading speed with schema markup",
        "Monitor Core Web Vitals impact"
      ],
      "Ongoing Maintenance": [
        "Update event dates and availability regularly",
        "Refresh product pricing and availability",
        "Update business hours and contact information",
        "Add new reviews and ratings periodically",
        "Update article publication dates when modified",
        "Verify external links in schema remain active",
        "Check competitor schema implementations for improvements"
      ]
    };
  }

  /**
   * Generate testing plan for Fly2Any schema implementation
   */
  static generateFly2AnyTestingPlan(): Record<string, string[]> {
    return {
      "Priority 1: Core Business Schema": [
        "Test homepage TravelAgency schema with all contact details",
        "Verify Organization schema includes complete business information",
        "Check ServiceArea covers all target Brazilian communities",
        "Validate opening hours and contact points",
        "Test WebSite schema with search functionality"
      ],
      "Priority 2: Product and Service Schema": [
        "Test FlightReservation schema with Miami-São Paulo example",
        "Validate Product schema for Brazil travel packages",
        "Check hotel and car rental offer schemas",
        "Test travel insurance product schemas",
        "Verify pricing and availability accuracy"
      ],
      "Priority 3: Content Schema": [
        "Test Article schema for Brazil travel guides",
        "Validate FAQ schema for common travel questions",
        "Check HowTo schema for booking process pages",
        "Test Event schema for Brazilian cultural events",
        "Verify TravelGuide schema for destination pages"
      ],
      "Priority 4: Local and Community Schema": [
        "Test LocalBusiness schema for Brazilian community targeting",
        "Validate neighborhood-specific landing page schemas",
        "Check ServiceArea for each Brazilian community",
        "Test PeopleAudience schemas for demographic targeting",
        "Verify community-specific FAQ schemas"
      ]
    };
  }

  /**
   * Schema markup best practices for travel industry
   */
  static getTravelIndustryBestPractices(): Record<string, string[]> {
    return {
      "Flight and Travel Reservations": [
        "Always include IATA airport codes for flights",
        "Use proper timezone formats for all dates/times",
        "Include aircraft type when available",
        "Add seat class information (economy, business, first)",
        "Include baggage allowance details",
        "Add cancellation and change policies"
      ],
      "Travel Packages and Products": [
        "Use high-quality destination images (minimum 1200px width)",
        "Include detailed itinerary information",
        "Specify what's included vs excluded clearly",
        "Add seasonal availability and pricing",
        "Include group size limitations",
        "Add difficulty level for adventure tours"
      ],
      "Destination and Cultural Content": [
        "Include accurate geographic coordinates",
        "Add local weather and best visiting times",
        "Include cultural sensitivity information",
        "Add language requirements and local customs",
        "Include visa and travel requirement details",
        "Add health and safety recommendations"
      ],
      "Reviews and Ratings": [
        "Use authentic customer reviews only",
        "Include reviewer location and travel date",
        "Add context about reviewer experience level",
        "Include photos from actual customers",
        "Respond to reviews when appropriate",
        "Update aggregate ratings regularly"
      ]
    };
  }
}

/**
 * Automated testing utilities
 */
export class SchemaTestingUtils {
  /**
   * Generate test URLs for Fly2Any pages
   */
  static getFly2AnyTestUrls(): Record<string, string> {
    return {
      homepage: "https://fly2any.com",
      flightsPage: "https://fly2any.com/flights", 
      brazilTravelGuide: "https://fly2any.com/en/brazil-travel-guide",
      howItWorks: "https://fly2any.com/como-funciona",
      rioGuide: "https://fly2any.com/travel-guides/rio-de-janeiro",
      saoGuide: "https://fly2any.com/travel-guides/sao-paulo",
      carnivalPackage: "https://fly2any.com/packages/brazil-carnival-rio",
      miamiSaoPauloFlights: "https://fly2any.com/voos-miami-sao-paulo"
    };
  }

  /**
   * Generate validation report template
   */
  static generateValidationReport(pageUrl: string, schemaTypes: string[]): object {
    return {
      pageUrl,
      testDate: new Date().toISOString(),
      schemaTypes,
      validationResults: {
        googleRichResults: { status: 'pending', errors: [], warnings: [] },
        schemaOrgValidator: { status: 'pending', errors: [], warnings: [] },
        syntaxValidation: { status: 'pending', errors: [], warnings: [] }
      },
      richSnippetEligibility: schemaTypes.map(type => ({
        schemaType: type,
        eligible: false,
        requirements: []
      })),
      recommendations: [],
      nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
    };
  }
}

/**
 * Rich snippet eligibility requirements by schema type
 */
export const RICH_SNIPPET_REQUIREMENTS = {
  Organization: [
    "Name, logo, and contact information",
    "Address for local businesses",
    "Social media links",
    "Reviews and ratings (recommended)"
  ],
  Article: [
    "Headline under 110 characters",
    "Author information",
    "Publisher details with logo",
    "Published date",
    "Featured image (1200x675 minimum)"
  ],
  Product: [
    "Product name and description",
    "Price and currency",
    "Availability status", 
    "Product images",
    "Reviews and ratings (recommended)"
  ],
  Event: [
    "Event name and description",
    "Start date and time",
    "Location with address",
    "Ticket information (if applicable)"
  ],
  FlightReservation: [
    "Reservation number",
    "Flight details (airline, flight number)",
    "Passenger information",
    "Departure and arrival airports",
    "Flight times"
  ]
} as const;