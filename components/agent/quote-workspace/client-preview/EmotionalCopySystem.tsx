"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// EMOTIONAL COPY SYSTEM - US Market Travel Copywriting Engine
// Trust • Desire • Confidence
// ═══════════════════════════════════════════════════════════════════════════════

export type ProductType = "flight" | "hotel" | "activity" | "car" | "transfer" | "insurance";
export type ToneVariant = "luxury" | "family" | "adventure" | "romantic" | "business";

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT COPY TEMPLATES - Conversion-optimized micro-copy
// ═══════════════════════════════════════════════════════════════════════════════

interface ProductCopy {
  headline: string[];      // Primary hook (2-4 words)
  subline: string[];       // Supporting benefit
  cta: string[];           // Action prompt
  trustBadge: string[];    // Social proof micro-copy
}

const flightCopy: Record<ToneVariant, ProductCopy> = {
  luxury: {
    headline: ["Arrive in Style", "Premium Journey", "First-Class Comfort"],
    subline: ["Seamless connections, exceptional service", "Your journey begins the moment you board", "Travel elevated"],
    cta: ["Secure Your Seat", "Reserve Now"],
    trustBadge: ["Verified fare • Full flexibility", "Premium class confirmed"],
  },
  family: {
    headline: ["Fly Together", "Safe & Sound", "Adventure Awaits"],
    subline: ["Family-friendly timing, stress-free connections", "Everyone arrives happy", "The fun starts at takeoff"],
    cta: ["Book Family Seats", "Lock In Fare"],
    trustBadge: ["Family boarding priority", "Kid-friendly flight times"],
  },
  adventure: {
    headline: ["Take Off", "Your Journey Begins", "Sky's the Limit"],
    subline: ["Direct route to your next adventure", "Less waiting, more exploring", "Efficient connections, more time there"],
    cta: ["Grab This Flight", "Go Now"],
    trustBadge: ["Best route selected", "Optimal timing"],
  },
  romantic: {
    headline: ["Escape Together", "Your Getaway Starts Here", "Journey as One"],
    subline: ["Side by side, destination ahead", "Romance in the clouds", "Every mile brings you closer"],
    cta: ["Book for Two", "Reserve Your Escape"],
    trustBadge: ["Seats together confirmed", "Romantic timing"],
  },
  business: {
    headline: ["Efficient Travel", "Time Optimized", "Direct & Productive"],
    subline: ["Maximize your schedule", "On time, every time", "Business-class efficiency"],
    cta: ["Confirm Booking", "Secure Flight"],
    trustBadge: ["Flexible fare", "Priority boarding"],
  },
};

const hotelCopy: Record<ToneVariant, ProductCopy> = {
  luxury: {
    headline: ["Refined Rest", "Your Sanctuary", "Pure Elegance"],
    subline: ["Where every detail exceeds expectations", "Wake up inspired", "Luxury in every moment"],
    cta: ["Reserve Suite", "Book Your Stay"],
    trustBadge: ["5-star verified", "Premium amenities included"],
  },
  family: {
    headline: ["Home Away", "Room for Everyone", "Family Comfort"],
    subline: ["Space to spread out, memories to make", "Rest well, play hard", "Everyone sleeps soundly"],
    cta: ["Book Family Room", "Reserve Now"],
    trustBadge: ["Family-friendly certified", "Kids stay free"],
  },
  adventure: {
    headline: ["Base Camp", "Rest & Recharge", "Your Launchpad"],
    subline: ["Recover today, explore tomorrow", "Perfect location for your adventures", "Prime spot, great access"],
    cta: ["Claim Your Room", "Book Base"],
    trustBadge: ["Adventure-ready location", "Early check-out available"],
  },
  romantic: {
    headline: ["Private Retreat", "Just You Two", "Intimate Escape"],
    subline: ["Romance-ready accommodations", "Your private paradise awaits", "Designed for connection"],
    cta: ["Book Romance Package", "Reserve Retreat"],
    trustBadge: ["Couples' favorite", "Romance amenities included"],
  },
  business: {
    headline: ["Work & Rest", "Productive Stay", "Business Ready"],
    subline: ["Everything you need, nothing you don't", "Efficient comfort", "Focus-friendly environment"],
    cta: ["Book Business Room", "Confirm Stay"],
    trustBadge: ["Business center access", "High-speed WiFi"],
  },
};

const activityCopy: Record<ToneVariant, ProductCopy> = {
  luxury: {
    headline: ["Exclusive Access", "Curated Moments", "VIP Experience"],
    subline: ["Reserved for the discerning traveler", "Beyond ordinary", "Memories worth treasuring"],
    cta: ["Reserve Experience", "Book VIP Access"],
    trustBadge: ["Private tour available", "Skip-the-line included"],
  },
  family: {
    headline: ["Fun for All", "Make Memories", "Together Time"],
    subline: ["Smiles guaranteed", "Adventures the whole family will love", "Stories to tell for years"],
    cta: ["Book Family Fun", "Reserve Spots"],
    trustBadge: ["All ages welcome", "Family discount applied"],
  },
  adventure: {
    headline: ["Thrill Awaits", "Unforgettable", "Live Fully"],
    subline: ["This is why you came", "Push your boundaries", "Experience over everything"],
    cta: ["Book Adventure", "Secure Your Spot"],
    trustBadge: ["Highly rated adventure", "Expert guides"],
  },
  romantic: {
    headline: ["Shared Wonder", "Moments Together", "Romance Unlocked"],
    subline: ["Create your story", "Side by side discoveries", "Connection through experience"],
    cta: ["Book for Two", "Reserve Romance"],
    trustBadge: ["Couples' top pick", "Intimate setting"],
  },
  business: {
    headline: ["Cultural Insight", "Local Expertise", "Efficient Exploration"],
    subline: ["Maximize your free time", "Curated highlights", "See more in less time"],
    cta: ["Book Experience", "Reserve Now"],
    trustBadge: ["Time-efficient tour", "Business traveler favorite"],
  },
};

const carCopy: Record<ToneVariant, ProductCopy> = {
  luxury: {
    headline: ["Drive Premium", "Your Chariot", "Refined Ride"],
    subline: ["Arrival makes an impression", "Comfort at every turn", "Travel your way"],
    cta: ["Reserve Vehicle", "Book Premium"],
    trustBadge: ["Luxury class confirmed", "Full insurance included"],
  },
  family: {
    headline: ["Room to Roam", "Family Wheels", "Go Anywhere"],
    subline: ["Space for everyone and everything", "Road trip ready", "Freedom to explore together"],
    cta: ["Book Family Car", "Reserve SUV"],
    trustBadge: ["Child seats available", "Unlimited mileage"],
  },
  adventure: {
    headline: ["Freedom Wheels", "Open Road", "Your Adventure Vehicle"],
    subline: ["Go where you want, when you want", "No limits, no schedule", "The road is yours"],
    cta: ["Grab Keys", "Book Freedom"],
    trustBadge: ["Adventure-ready", "24/7 roadside support"],
  },
  romantic: {
    headline: ["Scenic Drives", "Just You Two", "Road Romance"],
    subline: ["Destination: wherever together", "Convertible moments", "Your pace, your path"],
    cta: ["Book Getaway Car", "Reserve Ride"],
    trustBadge: ["Couples' upgrade available", "GPS included"],
  },
  business: {
    headline: ["Reliable Transit", "Professional Mobility", "On Schedule"],
    subline: ["Point A to B, efficiently", "Professional appearance", "Dependable transportation"],
    cta: ["Reserve Vehicle", "Confirm Car"],
    trustBadge: ["Business class", "Express pickup"],
  },
};

const transferCopy: Record<ToneVariant, ProductCopy> = {
  luxury: {
    headline: ["VIP Arrival", "Premium Transfer", "Executive Service"],
    subline: ["First impressions, perfected", "Door to door excellence", "No waiting, just arriving"],
    cta: ["Book Transfer", "Reserve Service"],
    trustBadge: ["Meet & greet included", "Luxury vehicle"],
  },
  family: {
    headline: ["Easy Arrival", "Stress-Free Start", "Welcome Ride"],
    subline: ["From plane to hotel, handled", "Start relaxed", "Everyone comfortable"],
    cta: ["Book Family Transfer", "Reserve Pickup"],
    trustBadge: ["Child seats ready", "Flight tracking"],
  },
  adventure: {
    headline: ["Quick Start", "Hit the Ground", "Fast Track"],
    subline: ["Less transit, more adventure", "Efficient connection", "Straight to the action"],
    cta: ["Book Transfer", "Get Moving"],
    trustBadge: ["On-time guarantee", "Direct route"],
  },
  romantic: {
    headline: ["Smooth Arrival", "Romance Begins", "Private Welcome"],
    subline: ["Your escape starts curbside", "Arrive together, stress-free", "Begin in style"],
    cta: ["Book Private Transfer", "Reserve"],
    trustBadge: ["Private vehicle", "Champagne optional"],
  },
  business: {
    headline: ["Reliable Transfer", "Professional Pickup", "Efficient Transit"],
    subline: ["Maximize your time", "Punctual and professional", "Seamless connection"],
    cta: ["Confirm Transfer", "Book Now"],
    trustBadge: ["Business traveler verified", "Expense receipt"],
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// COPY RETRIEVAL API
// ═══════════════════════════════════════════════════════════════════════════════

const copyBank: Record<ProductType, Record<ToneVariant, ProductCopy>> = {
  flight: flightCopy,
  hotel: hotelCopy,
  activity: activityCopy,
  car: carCopy,
  transfer: transferCopy,
  insurance: hotelCopy, // Fallback to neutral comfort copy
};

/** Get copy for product + tone, with seeded selection for consistency */
export function getProductCopy(
  product: ProductType,
  tone: ToneVariant,
  seed: number = 0
): { headline: string; subline: string; cta: string; trustBadge: string } {
  const copy = copyBank[product]?.[tone] || copyBank.hotel.family;
  const pick = (arr: string[]) => arr[seed % arr.length];

  return {
    headline: pick(copy.headline),
    subline: pick(copy.subline),
    cta: pick(copy.cta),
    trustBadge: pick(copy.trustBadge),
  };
}

/** Get random copy (for variety in lists) */
export function getRandomProductCopy(product: ProductType, tone: ToneVariant) {
  return getProductCopy(product, tone, Math.floor(Math.random() * 100));
}

// ═══════════════════════════════════════════════════════════════════════════════
// TONE AUTO-DETECTION - Based on trip characteristics
// ═══════════════════════════════════════════════════════════════════════════════

interface TripProfile {
  hasKids?: boolean;
  travelers?: number;
  hotelStars?: number;
  destination?: string;
  tripLength?: number;
  activities?: string[];
}

const luxuryDestinations = ["paris", "monaco", "dubai", "maldives", "bora bora", "santorini", "st. barts", "aspen"];
const adventureDestinations = ["costa rica", "iceland", "new zealand", "patagonia", "alaska", "safari", "galapagos"];
const romanticDestinations = ["venice", "hawaii", "bali", "tahiti", "florence", "amalfi", "napa"];

export function detectToneFromTrip(profile: TripProfile): ToneVariant {
  const dest = profile.destination?.toLowerCase() || "";

  // Family detection (highest priority)
  if (profile.hasKids || (profile.travelers && profile.travelers >= 4)) {
    return "family";
  }

  // Romantic detection (2 travelers, romantic destinations)
  if (profile.travelers === 2 && romanticDestinations.some(d => dest.includes(d))) {
    return "romantic";
  }

  // Luxury detection (5-star hotels, luxury destinations)
  if (profile.hotelStars && profile.hotelStars >= 5) {
    return "luxury";
  }
  if (luxuryDestinations.some(d => dest.includes(d))) {
    return "luxury";
  }

  // Adventure detection
  if (adventureDestinations.some(d => dest.includes(d))) {
    return "adventure";
  }
  if (profile.activities?.some(a => /adventure|hike|dive|surf|climb|kayak|zip/i.test(a))) {
    return "adventure";
  }

  // Default: family-friendly neutral tone
  return "family";
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONVERSION MICROCOPY - CTAs, urgency, trust signals
// ═══════════════════════════════════════════════════════════════════════════════

export const urgencyPhrases: Record<ToneVariant, string[]> = {
  luxury: ["Limited availability", "Exclusive rate", "Premium allocation"],
  family: ["Popular dates", "Book early for best selection", "Family-favorite"],
  adventure: ["Spots filling fast", "Peak season approaching", "Adventure awaits"],
  romantic: ["Most requested dates", "Couples' favorite", "Don't miss this"],
  business: ["Corporate rate available", "Flexible cancellation", "Business verified"],
};

export const trustSignals: Record<ToneVariant, string[]> = {
  luxury: ["Handpicked selection", "Concierge-verified", "Premium guarantee"],
  family: ["Family-tested", "Safe & verified", "Trusted by thousands"],
  adventure: ["Expert-curated", "Adventure-tested", "Highly rated"],
  romantic: ["Romance-approved", "Couples' choice", "Loved by travelers"],
  business: ["Business-verified", "Expense-ready", "Corporate approved"],
};

export function getUrgencyPhrase(tone: ToneVariant, seed = 0): string {
  const phrases = urgencyPhrases[tone];
  return phrases[seed % phrases.length];
}

export function getTrustSignal(tone: ToneVariant, seed = 0): string {
  const signals = trustSignals[tone];
  return signals[seed % signals.length];
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION HEADERS - For client preview sections
// ═══════════════════════════════════════════════════════════════════════════════

export const sectionHeaders: Record<ProductType, Record<ToneVariant, { title: string; subtitle: string }>> = {
  flight: {
    luxury: { title: "Your Flight", subtitle: "Premium passage secured" },
    family: { title: "Your Flights", subtitle: "Everyone's journey, sorted" },
    adventure: { title: "Your Flight", subtitle: "Adventure transportation" },
    romantic: { title: "Your Flight", subtitle: "Journey together" },
    business: { title: "Flight Details", subtitle: "Travel confirmed" },
  },
  hotel: {
    luxury: { title: "Your Accommodation", subtitle: "Where luxury meets rest" },
    family: { title: "Your Hotel", subtitle: "Home base secured" },
    adventure: { title: "Your Stay", subtitle: "Rest between adventures" },
    romantic: { title: "Your Retreat", subtitle: "Your private escape" },
    business: { title: "Accommodation", subtitle: "Comfortable & convenient" },
  },
  activity: {
    luxury: { title: "Curated Experiences", subtitle: "Exclusive moments await" },
    family: { title: "Family Fun", subtitle: "Memories in the making" },
    adventure: { title: "Your Adventures", subtitle: "The experiences that matter" },
    romantic: { title: "Shared Experiences", subtitle: "Together moments" },
    business: { title: "Experiences", subtitle: "Maximize your visit" },
  },
  car: {
    luxury: { title: "Your Vehicle", subtitle: "Travel in style" },
    family: { title: "Your Rental Car", subtitle: "Freedom to explore" },
    adventure: { title: "Your Wheels", subtitle: "Go anywhere" },
    romantic: { title: "Your Getaway Car", subtitle: "The open road awaits" },
    business: { title: "Ground Transport", subtitle: "Reliable mobility" },
  },
  transfer: {
    luxury: { title: "Private Transfer", subtitle: "Door-to-door excellence" },
    family: { title: "Airport Transfer", subtitle: "Easy arrival & departure" },
    adventure: { title: "Transfer", subtitle: "Quick connection" },
    romantic: { title: "Private Transfer", subtitle: "Arrive in style" },
    business: { title: "Transfer Service", subtitle: "Efficient connection" },
  },
  insurance: {
    luxury: { title: "Travel Protection", subtitle: "Peace of mind included" },
    family: { title: "Trip Protection", subtitle: "Family covered" },
    adventure: { title: "Adventure Insurance", subtitle: "Protected exploration" },
    romantic: { title: "Trip Insurance", subtitle: "Worry-free escape" },
    business: { title: "Travel Insurance", subtitle: "Business trip covered" },
  },
};

export function getSectionHeader(product: ProductType, tone: ToneVariant) {
  return sectionHeaders[product]?.[tone] || sectionHeaders[product]?.family;
}
