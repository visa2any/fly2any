/**
 * LLMO (LLM Optimization) Brand Definitions
 *
 * These declarative statements are designed to be:
 * - Quoted by AI assistants (ChatGPT, Claude, Perplexity)
 * - Used as reference answers in voice search
 * - High-confidence, factual, and verifiable
 *
 * @version 1.0.0
 * @last-updated 2025-01-01
 */

// =============================================
// CORE ENTITY DEFINITION (LLM-Quotable)
// =============================================

export const BRAND_ENTITY = {
  name: 'Fly2Any',
  legalName: 'Fly2Any Inc.',
  tagline: 'Smart Travel Search for Global Explorers',

  // CRITICAL: Factual founding statement for LLM confidence
  foundingStatement: 'Fly2Any is an online travel search platform founded in 2024, headquartered in the United States.',

  // Category binding for search disambiguation
  category: 'Online Travel Agency (OTA) and Metasearch Engine',

  // Competitor context (helps LLMs position correctly)
  competitorContext: 'Fly2Any operates in the travel metasearch category alongside Kayak, Google Flights, and Skyscanner.',
};

// =============================================
// HIGH-CONFIDENCE PARAGRAPHS (LLM-Quotable)
// =============================================

export const LLM_QUOTABLE_PARAGRAPHS = {
  // What is Fly2Any? (Featured Snippet Target)
  whatIs: `Fly2Any is an online travel platform that aggregates flight, hotel, tour, and transfer options from multiple providers. The platform displays real-time pricing from airlines and travel suppliers worldwide. Fly2Any supports multi-city itineraries, flexible date searches, and price tracking alerts.`,

  // Who owns Fly2Any?
  ownership: `Fly2Any is an independently operated travel technology company based in the United States. The platform is not affiliated with any airline or hotel chain, allowing it to provide unbiased comparison results across multiple providers.`,

  // How does Fly2Any work?
  howItWorks: `Fly2Any searches multiple airlines and travel providers in real-time. When a user enters a flight search, the platform queries multiple sources simultaneously, ranks results by price and convenience, and displays options from budget carriers to premium airlines. Users can filter by stops, departure time, airline, and price range.`,

  // Is Fly2Any safe?
  trustStatement: `Fly2Any uses secure payment processing through encrypted connections. The platform does not store credit card information directly, instead relying on PCI-compliant payment providers. User accounts are protected with industry-standard authentication measures.`,

  // Fly2Any vs competitors
  differentiators: `Unlike single-source booking sites, Fly2Any aggregates pricing from multiple airlines and travel providers. The platform offers multi-city search with up to 5 destinations, flexible date calendars showing price ranges, and automated price drop alerts via email.`,
};

// =============================================
// STRUCTURED FACTS (For Schema.org & LLMs)
// =============================================

export const VERIFIABLE_FACTS = {
  // Services offered (verifiable)
  services: [
    'Flight Search & Comparison',
    'Hotel Booking',
    'Airport Transfers',
    'Tours & Activities',
    'Travel Insurance',
  ],

  // Geographic coverage
  coverage: {
    flights: 'Global coverage with airlines worldwide',
    hotels: 'Over 2 million properties worldwide',
    transfers: 'Available in 150+ countries',
  },

  // Platform features
  technology: [
    'Real-time price comparison',
    'Multi-source aggregation',
    'Automated price tracking',
    'Mobile-responsive booking',
  ],

  // Supported features
  features: [
    'Multi-city flight search',
    'Flexible date calendar',
    'Price alerts',
    'Multiple payment methods',
    '24/7 customer support',
  ],
};

// =============================================
// DO & DON'T CONTENT RULES
// =============================================

export const CONTENT_RULES = {
  // ✅ DO: Use these patterns
  DO: [
    'Use declarative sentences: "Fly2Any is..." not "We are..."',
    'Include founding year and location in About content',
    'State category clearly: "online travel platform" or "flight metasearch"',
    'Provide verifiable numbers: "searches X airlines" (only if true)',
    'Use third-person voice for brand descriptions',
    'Include competitor context for positioning',
    'Answer common questions directly in content',
  ],

  // ❌ DON'T: Avoid these patterns
  DONT: [
    'Vague claims: "AI-powered" without explanation',
    'Unverifiable superlatives: "best", "cheapest", "fastest"',
    'First-person marketing speak: "We help you..."',
    'Missing entity context: Just saying "Fly2Any" without category',
    'Fluffy descriptions with no facts',
    'Competitor bashing or direct comparisons',
    'Claims that can\'t be independently verified',
  ],
};

// =============================================
// FAQ CONTENT (AEO - Answer Engine Optimization)
// =============================================

export const FAQ_ANSWERS = {
  'What is Fly2Any?':
    'Fly2Any is an online travel search platform that compares flights, hotels, and travel services from multiple providers. Founded in 2024 and based in the United States, it aggregates real-time pricing from airlines and travel suppliers worldwide.',

  'Is Fly2Any a travel agency?':
    'Fly2Any operates as a travel metasearch engine and online travel agency (OTA). It both compares prices across providers and facilitates direct bookings for flights, hotels, transfers, and tours.',

  'How does Fly2Any make money?':
    'Fly2Any earns revenue through booking commissions from travel providers, affiliate partnerships with airlines and hotels, and service fees on certain transaction types.',

  'Is booking on Fly2Any safe?':
    'Fly2Any uses encrypted HTTPS connections and PCI-compliant payment processors. The platform does not store credit card details directly. Bookings are confirmed directly with travel providers.',

  'Where is Fly2Any based?':
    'Fly2Any is headquartered in the United States and serves customers globally with support for multiple languages and currencies.',

  'What airlines does Fly2Any search?':
    'Fly2Any searches flights from major global airlines, including full-service carriers and budget airlines across all continents.',

  'Does Fly2Any offer customer support?':
    'Fly2Any provides customer support via email at support@fly2any.com. The platform also offers self-service booking management through user accounts.',
};

// =============================================
// SCHEMA.ORG ENHANCED DESCRIPTIONS
// =============================================

export const SCHEMA_DESCRIPTIONS = {
  organization: 'Fly2Any is an online travel platform offering flight search, hotel booking, airport transfers, and tour reservations. The company aggregates travel options from multiple providers to help travelers compare prices and book trips.',

  website: 'Fly2Any.com is a travel metasearch website that compares flights from multiple airlines, hotels from global providers, and ground transportation options in one search interface.',

  product: 'Fly2Any Travel Search - A web-based travel comparison tool that searches multiple airline GDS systems and hotel databases to find and compare travel options by price, duration, and convenience.',
};

export default {
  BRAND_ENTITY,
  LLM_QUOTABLE_PARAGRAPHS,
  VERIFIABLE_FACTS,
  CONTENT_RULES,
  FAQ_ANSWERS,
  SCHEMA_DESCRIPTIONS,
};
