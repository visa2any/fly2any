"use client";

/**
 * ToneSystem - Apple-class emotional copy system for travel quotes
 *
 * Provides tone-aware copy generation for the client preview experience.
 * Each tone profile has distinct emotional vocabulary and messaging style.
 */

export type ToneProfile = "luxury" | "family" | "adventure" | "business" | "romantic";
export type ProductType = "flight" | "hotel" | "car" | "activity" | "transfer" | "insurance" | "custom";
export type DayMood = "arrival" | "departure" | "free" | "explore" | "celebration" | "relax";

// Tone-specific emotional vocabulary
const toneVocabulary: Record<ToneProfile, {
  adjectives: string[];
  verbs: string[];
  nouns: string[];
  closings: string[];
}> = {
  luxury: {
    adjectives: ["exquisite", "curated", "refined", "elevated", "exceptional", "impeccable"],
    verbs: ["indulge", "savor", "experience", "discover", "embrace"],
    nouns: ["elegance", "sophistication", "refinement", "excellence", "luxury"],
    closings: ["An experience crafted for distinction.", "Where every detail matters.", "Excellence awaits."],
  },
  family: {
    adjectives: ["magical", "exciting", "memorable", "fun-filled", "joyful", "wonderful"],
    verbs: ["explore", "discover", "play", "enjoy", "create"],
    nouns: ["memories", "adventures", "moments", "smiles", "joy"],
    closings: ["Moments you'll treasure forever.", "Where memories are made.", "Adventure awaits the whole family."],
  },
  adventure: {
    adjectives: ["thrilling", "epic", "bold", "unforgettable", "breathtaking", "wild"],
    verbs: ["conquer", "explore", "chase", "discover", "unleash"],
    nouns: ["adventure", "journey", "expedition", "quest", "discovery"],
    closings: ["The adventure of a lifetime awaits.", "Where stories begin.", "Your next chapter starts here."],
  },
  business: {
    adjectives: ["seamless", "efficient", "comfortable", "productive", "convenient", "reliable"],
    verbs: ["optimize", "streamline", "maximize", "ensure", "deliver"],
    nouns: ["efficiency", "comfort", "convenience", "productivity", "success"],
    closings: ["Travel that works as hard as you do.", "Efficiency meets comfort.", "Success-ready travel."],
  },
  romantic: {
    adjectives: ["enchanting", "intimate", "magical", "dreamy", "captivating", "romantic"],
    verbs: ["cherish", "celebrate", "embrace", "discover", "savor"],
    nouns: ["romance", "moments", "memories", "magic", "love"],
    closings: ["Where love stories unfold.", "Moments to cherish together.", "Romance awaits."],
  },
};

// Day one-liners by mood and tone
const dayOneLiners: Record<ToneProfile, Record<DayMood, string[]>> = {
  luxury: {
    arrival: [
      "Your journey to refinement begins.",
      "Step into a world of elegance.",
      "Where exceptional experiences await.",
    ],
    departure: [
      "A graceful farewell to paradise.",
      "Departing with cherished moments.",
      "Until we meet again in style.",
    ],
    free: [
      "A day to savor at your leisure.",
      "Time unfolds at your own pace.",
      "Freedom to indulge your desires.",
    ],
    explore: [
      "Discover hidden gems curated just for you.",
      "Exploration elevated to an art form.",
      "Where every discovery delights.",
    ],
    celebration: [
      "A day of extraordinary moments.",
      "Celebrating life's finest pleasures.",
      "Where magic meets magnificence.",
    ],
    relax: [
      "Serenity awaits your arrival.",
      "Unwind in absolute tranquility.",
      "Where peace meets perfection.",
    ],
  },
  family: {
    arrival: [
      "The adventure begins for the whole crew!",
      "Your family adventure starts here!",
      "Time to make memories together.",
    ],
    departure: [
      "Heading home with hearts full of memories.",
      "What an amazing journey it's been!",
      "Until the next family adventure!",
    ],
    free: [
      "A day for spontaneous fun!",
      "Free time means family time.",
      "What will you discover together?",
    ],
    explore: [
      "Adventure awaits around every corner!",
      "Let's explore together!",
      "Discovery mode: activated!",
    ],
    celebration: [
      "Time to celebrate together!",
      "Making magical family memories.",
      "A day you'll always remember!",
    ],
    relax: [
      "Recharge for tomorrow's adventures.",
      "Family pool day? We think yes!",
      "Rest up, explorers!",
    ],
  },
  adventure: {
    arrival: [
      "The expedition begins now.",
      "Adventure mode: engaged.",
      "Your next conquest awaits.",
    ],
    departure: [
      "Another adventure in the books.",
      "The journey continues...",
      "Legends don't stay in one place.",
    ],
    free: [
      "Plot your next move.",
      "Uncharted territory awaits.",
      "What will you discover?",
    ],
    explore: [
      "Time to push boundaries.",
      "The trail calls your name.",
      "Adventure has no limits.",
    ],
    celebration: [
      "Victory looks good on you.",
      "Conquests worth celebrating.",
      "Epic moments await.",
    ],
    relax: [
      "Even adventurers need rest.",
      "Recharge for the next challenge.",
      "Tomorrow: back to epic.",
    ],
  },
  business: {
    arrival: [
      "Touchdown. Time to execute.",
      "Your productive journey begins.",
      "Ready to make things happen.",
    ],
    departure: [
      "Mission accomplished.",
      "Objectives met. Heading home.",
      "Another successful trip.",
    ],
    free: [
      "Time to recharge and prepare.",
      "A moment to strategize.",
      "Efficiency meets downtime.",
    ],
    explore: [
      "Site visits and opportunities.",
      "Business with a view.",
      "Where deals get done.",
    ],
    celebration: [
      "Success worth celebrating.",
      "When hard work pays off.",
      "Achievement unlocked.",
    ],
    relax: [
      "Balance is key to success.",
      "Recharge for peak performance.",
      "Tomorrow's success starts tonight.",
    ],
  },
  romantic: {
    arrival: [
      "Your love story continues here.",
      "Romance awaits you both.",
      "Where magic begins for two.",
    ],
    departure: [
      "Leaving with hearts full of love.",
      "Until our next escape together.",
      "The adventure continues at home.",
    ],
    free: [
      "A day to get lost together.",
      "No plans, just us.",
      "Time stands still for two.",
    ],
    explore: [
      "Discover wonder together.",
      "Hand in hand, heart to heart.",
      "Every moment, a shared treasure.",
    ],
    celebration: [
      "Celebrating your love story.",
      "Moments that sparkle forever.",
      "Love deserves celebration.",
    ],
    relax: [
      "Unwind in each other's arms.",
      "Peace, quiet, and you.",
      "Together is the best place to be.",
    ],
  },
};

// Product-specific emotional copy by tone
const productCopy: Record<ToneProfile, Record<ProductType, {
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
}>> = {
  luxury: {
    flight: {
      title: "Your Sky-High Journey",
      subtitle: "Elevated travel awaits",
      description: "A carefully curated flight experience designed for discerning travelers.",
      highlights: ["Premium comfort", "Seamless service", "Refined experience"],
    },
    hotel: {
      title: "Your Sanctuary Awaits",
      subtitle: "Where elegance meets comfort",
      description: "An exceptional residence selected for its impeccable standards and refined atmosphere.",
      highlights: ["Curated luxury", "Impeccable service", "Exclusive amenities"],
    },
    car: {
      title: "Your Personal Chariot",
      subtitle: "Freedom with distinction",
      description: "A premium vehicle selected to complement your journey in style.",
      highlights: ["Effortless mobility", "Premium comfort", "Refined travel"],
    },
    activity: {
      title: "Curated Experience",
      subtitle: "Moments of distinction",
      description: "A handpicked experience designed to create lasting impressions.",
      highlights: ["Exclusive access", "Personalized attention", "Unforgettable moments"],
    },
    transfer: {
      title: "Seamless Arrival",
      subtitle: "Effortless transitions",
      description: "Your personal transfer ensures you arrive relaxed and refreshed.",
      highlights: ["Personal driver", "Door-to-door service", "No waiting"],
    },
    insurance: {
      title: "Peace of Mind",
      subtitle: "Protection with confidence",
      description: "Comprehensive coverage so you can focus on the experience.",
      highlights: ["Complete coverage", "24/7 support", "Total peace of mind"],
    },
    custom: {
      title: "Special Addition",
      subtitle: "Personalized touch",
      description: "A custom element added to enhance your experience.",
      highlights: ["Tailored to you", "Unique addition", "Personal touch"],
    },
  },
  family: {
    flight: {
      title: "Up, Up and Away!",
      subtitle: "The family adventure takes flight",
      description: "Your journey to fun starts in the sky! Get ready for an amazing trip.",
      highlights: ["Comfortable seats", "Entertainment for all", "Family-friendly"],
    },
    hotel: {
      title: "Your Home Base",
      subtitle: "Where the fun begins and ends",
      description: "A family-friendly haven with everything you need for an amazing stay.",
      highlights: ["Space for everyone", "Kid-friendly", "Great location"],
    },
    car: {
      title: "The Family Cruiser",
      subtitle: "Road trips made easy",
      description: "Room for the whole crew and all the gear. Adventure awaits!",
      highlights: ["Plenty of space", "Easy to drive", "Adventure-ready"],
    },
    activity: {
      title: "Family Fun Time!",
      subtitle: "Memories in the making",
      description: "An exciting experience the whole family will love and remember forever.",
      highlights: ["Fun for all ages", "Photo opportunities", "Lasting memories"],
    },
    transfer: {
      title: "Easy Arrival",
      subtitle: "No stress, just excitement",
      description: "Skip the hassle and head straight to the fun!",
      highlights: ["No waiting", "Room for everyone", "Stress-free"],
    },
    insurance: {
      title: "Family Protection",
      subtitle: "Travel worry-free",
      description: "Coverage for the whole family, so you can focus on the fun.",
      highlights: ["Everyone covered", "Peace of mind", "Just in case"],
    },
    custom: {
      title: "Special Touch",
      subtitle: "Something extra for the family",
      description: "A personalized addition to make your trip even more special.",
      highlights: ["Just for you", "Extra special", "Family bonus"],
    },
  },
  adventure: {
    flight: {
      title: "Liftoff to Adventure",
      subtitle: "The expedition begins",
      description: "Your gateway to the unknown. The adventure starts the moment you board.",
      highlights: ["Non-stop action", "Strategic timing", "Adventure-ready"],
    },
    hotel: {
      title: "Base Camp",
      subtitle: "Rest between conquests",
      description: "Your strategic headquarters for daily adventures and epic explorations.",
      highlights: ["Perfect location", "Gear storage", "Recovery station"],
    },
    car: {
      title: "Your Adventure Rig",
      subtitle: "Freedom to explore",
      description: "Go where the road takes you. Or don't take a road at all.",
      highlights: ["Off-road capable", "Total freedom", "Unlimited exploration"],
    },
    activity: {
      title: "Epic Experience",
      subtitle: "Challenge accepted",
      description: "An adventure that will test your limits and reward your courage.",
      highlights: ["Adrenaline rush", "Bucket list worthy", "Epic stories"],
    },
    transfer: {
      title: "Strategic Transport",
      subtitle: "Efficiency to the trailhead",
      description: "Get to your adventure faster. No time to waste.",
      highlights: ["Quick transit", "Direct route", "Time to adventure"],
    },
    insurance: {
      title: "Adventure Coverage",
      subtitle: "Take risks, stay protected",
      description: "Push your limits knowing you're covered no matter what.",
      highlights: ["Adventure sports covered", "Emergency evac", "Go bold"],
    },
    custom: {
      title: "Gear Up",
      subtitle: "Special equipment or experience",
      description: "A custom addition to elevate your adventure to legendary status.",
      highlights: ["Next level", "Custom gear", "Adventure upgrade"],
    },
  },
  business: {
    flight: {
      title: "Your Flight",
      subtitle: "Strategic travel timing",
      description: "Optimized scheduling to maximize your productive hours.",
      highlights: ["Time-efficient", "Comfortable", "Reliable"],
    },
    hotel: {
      title: "Your Accommodation",
      subtitle: "Rest and productivity",
      description: "A strategically located property with business essentials.",
      highlights: ["Central location", "Business center", "Fast WiFi"],
    },
    car: {
      title: "Your Rental Vehicle",
      subtitle: "Mobility and flexibility",
      description: "Reliable transportation for site visits and meetings.",
      highlights: ["GPS included", "Flexible schedule", "Professional image"],
    },
    activity: {
      title: "Business Experience",
      subtitle: "Strategic networking",
      description: "An opportunity for team building or client entertainment.",
      highlights: ["Professional", "Memorable", "Strategic"],
    },
    transfer: {
      title: "Ground Transfer",
      subtitle: "Efficient transit",
      description: "Reliable transportation between key locations.",
      highlights: ["On-time", "Professional", "Stress-free"],
    },
    insurance: {
      title: "Travel Protection",
      subtitle: "Business continuity",
      description: "Coverage to ensure your business trip proceeds smoothly.",
      highlights: ["Trip protection", "Medical coverage", "Business ready"],
    },
    custom: {
      title: "Additional Service",
      subtitle: "Business enhancement",
      description: "A custom addition to support your business objectives.",
      highlights: ["Professional", "Efficient", "Value-add"],
    },
  },
  romantic: {
    flight: {
      title: "Your Journey Together",
      subtitle: "Love takes flight",
      description: "The beginning of a beautiful escape, just the two of you.",
      highlights: ["Side by side", "Romantic timing", "Special moments"],
    },
    hotel: {
      title: "Your Love Nest",
      subtitle: "A sanctuary for two",
      description: "An enchanting retreat designed for romance and connection.",
      highlights: ["Intimate setting", "Romantic ambiance", "Private retreat"],
    },
    car: {
      title: "Your Couples Getaway Car",
      subtitle: "Freedom for two",
      description: "Explore hidden gems and scenic routes together.",
      highlights: ["Scenic drives", "Spontaneous stops", "Private moments"],
    },
    activity: {
      title: "Romantic Experience",
      subtitle: "Moments to treasure",
      description: "A special experience designed to bring you closer together.",
      highlights: ["Couple-focused", "Memorable", "Instagram-worthy"],
    },
    transfer: {
      title: "VIP Arrival",
      subtitle: "Romance from the start",
      description: "Arrive refreshed and ready for romance.",
      highlights: ["Private transfer", "No hassle", "Begin relaxed"],
    },
    insurance: {
      title: "Peace of Mind",
      subtitle: "Focus on each other",
      description: "Protection so you can focus on what matters most: each other.",
      highlights: ["Couples coverage", "Worry-free", "Just in case"],
    },
    custom: {
      title: "Romantic Touch",
      subtitle: "Something special",
      description: "A personalized addition to make your trip unforgettable.",
      highlights: ["Just for you two", "Special surprise", "Love note"],
    },
  },
};

// Export utility functions
export function getToneVocabulary(tone: ToneProfile) {
  return toneVocabulary[tone];
}

export function getDayOneLiner(tone: ToneProfile, mood: DayMood): string {
  const options = dayOneLiners[tone][mood];
  return options[Math.floor(Math.random() * options.length)];
}

export function getDayOneLinerSeeded(tone: ToneProfile, mood: DayMood, seed: number): string {
  const options = dayOneLiners[tone][mood];
  return options[seed % options.length];
}

export function getProductCopy(tone: ToneProfile, product: ProductType) {
  return productCopy[tone][product];
}

export function getClosingMessage(tone: ToneProfile): string {
  const options = toneVocabulary[tone].closings;
  return options[Math.floor(Math.random() * options.length)];
}

export function getClosingMessageSeeded(tone: ToneProfile, seed: number): string {
  const options = toneVocabulary[tone].closings;
  return options[seed % options.length];
}

// Detect tone from trip characteristics (heuristic)
export function detectTone(tripData: {
  destination?: string;
  travelers?: number;
  hasKids?: boolean;
  hotelStars?: number;
  activities?: string[];
}): ToneProfile {
  const { travelers = 1, hasKids = false, hotelStars = 3, activities = [] } = tripData;

  // Family detection
  if (hasKids || travelers >= 4) {
    return "family";
  }

  // Adventure detection
  const adventureKeywords = ["hiking", "diving", "snorkel", "zip", "adventure", "tour", "excursion", "safari"];
  if (activities.some(a => adventureKeywords.some(k => a.toLowerCase().includes(k)))) {
    return "adventure";
  }

  // Luxury detection
  if (hotelStars >= 5) {
    return "luxury";
  }

  // Romantic detection (couples)
  if (travelers === 2 && !hasKids) {
    return "romantic";
  }

  // Default to adventure for solo travelers
  if (travelers === 1) {
    return "adventure";
  }

  return "family"; // Default
}

// Time-based greeting
export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// Trip duration description
export function getTripDurationCopy(days: number, tone: ToneProfile): string {
  if (days === 1) {
    return tone === "luxury"
      ? "A curated day experience"
      : tone === "adventure"
        ? "A day of epic proportions"
        : "A perfect day awaits";
  }
  if (days <= 3) {
    return tone === "luxury"
      ? `A refined ${days}-day retreat`
      : tone === "adventure"
        ? `${days} days of pure adventure`
        : `${days} days of wonderful memories`;
  }
  if (days <= 7) {
    return tone === "luxury"
      ? `A week of exceptional experiences`
      : tone === "adventure"
        ? `A week to conquer new horizons`
        : `A week the family will never forget`;
  }
  return tone === "luxury"
    ? `An extended journey of discovery`
    : tone === "adventure"
      ? `An extended expedition awaits`
      : `An unforgettable extended adventure`;
}
