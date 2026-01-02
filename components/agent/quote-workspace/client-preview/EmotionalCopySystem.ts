/**
 * Emotional Copy System for Client Preview
 * Premium, Inspirational, US-Market Language
 */

import type { ToneProfile, ProductType } from '../itinerary/ToneSystem';

// ============================================
// PRODUCT EMOTIONAL HEADLINES
// ============================================
export const productHeadlines: Record<ToneProfile, Record<ProductType, string[]>> = {
  luxury: {
    flight: [
      "Your journey begins in the clouds",
      "Where comfort meets the sky",
      "Elevated travel, elevated moments",
    ],
    hotel: [
      "Your sanctuary awaits",
      "Where dreams rest easy",
      "A residence designed for you",
    ],
    activity: [
      "An experience curated for distinction",
      "Moments that become memories",
      "Crafted exclusively for you",
    ],
    car: [
      "Freedom, refined",
      "Your journey, your pace",
      "Travel with intention",
    ],
    transfer: [
      "Arrive refreshed, worry-free",
      "Seamless from the first moment",
      "Your comfort, our priority",
    ],
    insurance: [
      "Peace of mind, elegantly assured",
      "Travel with complete confidence",
    ],
    custom: [
      "Something special, just for you",
    ],
  },
  family: {
    flight: [
      "The adventure takes flight!",
      "Up, up, and away — together",
      "Your family journey begins here",
    ],
    hotel: [
      "Your home away from home",
      "Where family memories are made",
      "Rest up for tomorrow's adventures",
    ],
    activity: [
      "Fun for everyone!",
      "Creating memories together",
      "Adventures the whole family will love",
    ],
    car: [
      "Room for the whole crew",
      "Road trip ready!",
      "Adventure on wheels",
    ],
    transfer: [
      "No stress, just excitement",
      "Straight to the fun",
      "Easy arrival for the family",
    ],
    insurance: [
      "Everyone's covered",
      "Worry-free family travel",
    ],
    custom: [
      "A special touch for your family",
    ],
  },
  adventure: {
    flight: [
      "The expedition begins",
      "Your gateway to the unknown",
      "Adventure awaits beyond the clouds",
    ],
    hotel: [
      "Base camp for exploration",
      "Rest between conquests",
      "Recharge for tomorrow's journey",
    ],
    activity: [
      "Challenge accepted",
      "This is what you came for",
      "Stories in the making",
    ],
    car: [
      "Go where the road takes you",
      "Your adventure vehicle",
      "Freedom to explore",
    ],
    transfer: [
      "Fast track to adventure",
      "No time to waste",
      "Straight to the action",
    ],
    insurance: [
      "Adventure covered",
      "Take risks with confidence",
    ],
    custom: [
      "Level up your adventure",
    ],
  },
  romantic: {
    flight: [
      "Love takes flight",
      "Just the two of you, above the world",
      "Your romantic escape begins",
    ],
    hotel: [
      "Your love nest awaits",
      "A retreat for two",
      "Where romance blossoms",
    ],
    activity: [
      "Moments made for two",
      "Creating memories together",
      "Romance in motion",
    ],
    car: [
      "Scenic drives, stolen glances",
      "Explore together",
      "Your couples escape vehicle",
    ],
    transfer: [
      "Arrive hand in hand",
      "Begin relaxed, together",
      "Romance from the start",
    ],
    insurance: [
      "Protecting what matters most",
      "Focus on each other",
    ],
    custom: [
      "A romantic surprise",
    ],
  },
  business: {
    flight: [
      "Travel that works for you",
      "Efficient, comfortable, reliable",
      "Optimized for your success",
    ],
    hotel: [
      "Rest meets productivity",
      "Your professional home base",
      "Work-ready, comfort-assured",
    ],
    activity: [
      "Strategic experiences",
      "Business with a view",
      "Networking opportunity",
    ],
    car: [
      "Mobility meets flexibility",
      "Professional travel, personal comfort",
      "Your schedule, your control",
    ],
    transfer: [
      "Punctual and professional",
      "Start meetings on time",
      "Efficient ground transit",
    ],
    insurance: [
      "Business continuity assured",
      "Professional coverage",
    ],
    custom: [
      "Tailored to your needs",
    ],
  },
};

// ============================================
// "WHY THIS WAS SELECTED" COPY
// ============================================
export const selectionReasons: Record<ProductType, string[]> = {
  flight: [
    "Selected for optimal timing and comfort",
    "Chosen for the best value and convenience",
    "Matches your preferred travel style",
    "Direct route for a smoother journey",
    "Highly rated by travelers like you",
  ],
  hotel: [
    "Handpicked for location and quality",
    "Exceptional guest reviews",
    "Perfect match for your travel style",
    "Amenities tailored to your needs",
    "Highly recommended by past travelers",
  ],
  activity: [
    "One of the most loved experiences in the area",
    "Perfectly fits your itinerary",
    "Highly rated by travelers like you",
    "A local favorite, curated for you",
    "Creates the perfect day",
  ],
  car: [
    "Right size for your group",
    "Reliable pickup and dropoff",
    "Great value for your journey",
    "Trusted rental partner",
  ],
  transfer: [
    "Stress-free arrival guaranteed",
    "Professional, punctual service",
    "Comfortable door-to-door transit",
    "Highly rated transfer service",
  ],
  insurance: [
    "Comprehensive coverage for peace of mind",
    "Trusted protection for your journey",
  ],
  custom: [
    "Added to enhance your experience",
  ],
};

// ============================================
// MICRO-EMOTIONAL COPY (Contextual)
// ============================================
export const microEmotionalCopy = {
  arrival: [
    "Picture yourself arriving…",
    "The moment you've been waiting for…",
    "Your journey begins here",
  ],
  morning: [
    "A perfect way to start your day",
    "Rise and shine to new experiences",
    "Morning magic awaits",
  ],
  afternoon: [
    "The heart of your adventure",
    "Afternoon possibilities unfold",
    "Perfect timing for discovery",
  ],
  evening: [
    "As the sun sets, memories are made",
    "Evening magic awaits",
    "Wind down with something special",
  ],
  departure: [
    "Farewell for now, memories forever",
    "Until next time…",
    "A beautiful ending to a beautiful journey",
  ],
  comfort: [
    "Designed for comfort and peace of mind",
    "Relax and enjoy every moment",
    "Your comfort is our priority",
  ],
  popular: [
    "One of the most loved experiences by travelers",
    "A favorite among visitors",
    "Highly recommended by guests",
  ],
  exclusive: [
    "Something special, just for you",
    "Curated with care",
    "A thoughtful addition to your journey",
  ],
};

// ============================================
// DAY CHAPTER TITLES
// ============================================
export const dayChapterTitles: Record<ToneProfile, {
  first: string[];
  middle: string[];
  last: string[];
}> = {
  luxury: {
    first: ["Your Journey Begins", "The Arrival", "Welcome to Refinement"],
    middle: ["A Day of Discovery", "Curated Moments", "Elevated Experiences"],
    last: ["A Graceful Farewell", "Until We Meet Again", "Memories to Treasure"],
  },
  family: {
    first: ["Let the Adventure Begin!", "The Fun Starts Here", "Family Time Starts Now"],
    middle: ["Adventure Day", "Explore Together", "Making Memories"],
    last: ["Heading Home Heroes", "What a Journey!", "Until Next Time"],
  },
  adventure: {
    first: ["The Expedition Begins", "Adventure Mode: ON", "Let's Do This"],
    middle: ["Into the Unknown", "Challenge Day", "Pushing Boundaries"],
    last: ["Mission Complete", "Another One for the Books", "Until Next Adventure"],
  },
  romantic: {
    first: ["Where Romance Begins", "Just the Two of Us", "Love Takes the Lead"],
    middle: ["Lost in Each Other", "A Day for Two", "Together is Everything"],
    last: ["Until Our Next Escape", "Love Travels Home", "Memories of Us"],
  },
  business: {
    first: ["Arrival & Setup", "Ready for Business", "Touchdown"],
    middle: ["Productive Day Ahead", "Opportunities Await", "Strategic Planning"],
    last: ["Mission Accomplished", "Successful Trip", "Onward"],
  },
};

// ============================================
// TRUST LAYER COPY
// ============================================
export const trustCopy = {
  booking: {
    headline: "Book with Confidence",
    points: [
      "Secure checkout with bank-level encryption",
      "No hidden fees — what you see is what you pay",
      "24/7 support throughout your journey",
    ],
  },
  flexibility: {
    headline: "Flexible & Protected",
    points: [
      "Free changes up to 24 hours before travel*",
      "Full refund on eligible cancellations",
      "Travel protection available",
    ],
    disclaimer: "*Subject to supplier policies",
  },
  support: {
    headline: "We're Here for You",
    points: [
      "Dedicated travel support team",
      "Real humans, real help",
      "Available before, during, and after your trip",
    ],
  },
};

// ============================================
// AGENT SIGNATURE TEMPLATES
// ============================================
export const agentSignatureTemplates = {
  standard: (agentName: string) => ({
    greeting: `Crafted with care by ${agentName}`,
    message: "I've personally selected each element of this journey to match your travel style. If you have any questions, I'm just a message away.",
    signoff: "Looking forward to making this trip perfect for you.",
  }),
  luxury: (agentName: string) => ({
    greeting: `Personally curated by ${agentName}`,
    message: "Every detail of this itinerary has been thoughtfully considered to ensure an exceptional experience. I'm here to refine any aspect to your preferences.",
    signoff: "At your service.",
  }),
  family: (agentName: string) => ({
    greeting: `Put together with love by ${agentName}`,
    message: "I've designed this trip with your whole family in mind — fun for the kids, relaxation for the parents. Let me know if you'd like any adjustments!",
    signoff: "Excited for your family adventure!",
  }),
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getProductHeadline(tone: ToneProfile, type: ProductType, seed: number = 0): string {
  const headlines = productHeadlines[tone][type];
  return headlines[seed % headlines.length];
}

export function getSelectionReason(type: ProductType, seed: number = 0): string {
  const reasons = selectionReasons[type];
  return reasons[seed % reasons.length];
}

export function getMicroCopy(context: keyof typeof microEmotionalCopy, seed: number = 0): string {
  const copies = microEmotionalCopy[context];
  return copies[seed % copies.length];
}

export function getDayChapterTitle(tone: ToneProfile, position: 'first' | 'middle' | 'last', seed: number = 0): string {
  const titles = dayChapterTitles[tone][position];
  return titles[seed % titles.length];
}

export function getAgentSignature(tone: ToneProfile, agentName: string) {
  if (tone === 'luxury') return agentSignatureTemplates.luxury(agentName);
  if (tone === 'family') return agentSignatureTemplates.family(agentName);
  return agentSignatureTemplates.standard(agentName);
}
