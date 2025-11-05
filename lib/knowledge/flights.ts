/**
 * Flight Knowledge Base
 * Comprehensive information about flights, airlines, baggage, and policies
 */

export interface BaggagePolicy {
  airline: string;
  cabinBaggage: string;
  checkedBaggage: {
    economy: string;
    premiumEconomy?: string;
    business: string;
    first?: string;
  };
  weight: {
    cabin: string;
    checked: string;
  };
  additionalFees?: string;
  specialItems?: string;
}

export interface FareClass {
  code: string;
  name: string;
  cabin: string;
  description: string;
  benefits: string[];
  changeFees?: string;
  cancellation?: string;
}

export interface AirlineAlliance {
  name: string;
  airlines: string[];
  benefits: string[];
}

// Baggage Policies by Major Airlines
export const BAGGAGE_POLICIES: BaggagePolicy[] = [
  {
    airline: "United Airlines",
    cabinBaggage: "1 personal item + 1 carry-on",
    checkedBaggage: {
      economy: "0 bags included (fee applies)",
      premiumEconomy: "1 bag included",
      business: "2 bags included",
      first: "3 bags included"
    },
    weight: {
      cabin: "Up to 22 lbs (10 kg) for personal item",
      checked: "Up to 50 lbs (23 kg) per bag"
    },
    additionalFees: "$35 for 1st bag, $45 for 2nd bag (domestic)",
    specialItems: "Sports equipment, musical instruments subject to additional fees"
  },
  {
    airline: "American Airlines",
    cabinBaggage: "1 personal item + 1 carry-on",
    checkedBaggage: {
      economy: "0 bags included (fee applies)",
      premiumEconomy: "1 bag included",
      business: "2 bags included",
      first: "3 bags included"
    },
    weight: {
      cabin: "Carry-on must fit in overhead bin",
      checked: "Up to 50 lbs (23 kg) per bag"
    },
    additionalFees: "$30 for 1st bag, $40 for 2nd bag (domestic)",
    specialItems: "Strollers, car seats, assistive devices free of charge"
  },
  {
    airline: "Delta Air Lines",
    cabinBaggage: "1 personal item + 1 carry-on",
    checkedBaggage: {
      economy: "0 bags included (fee applies)",
      premiumEconomy: "1 bag included",
      business: "2 bags included",
      first: "2 bags included"
    },
    weight: {
      cabin: "No weight limit for carry-on",
      checked: "Up to 50 lbs (23 kg) per bag"
    },
    additionalFees: "$30 for 1st bag, $40 for 2nd bag (domestic)",
    specialItems: "Golf bags, skis, and surfboards subject to fees"
  },
  {
    airline: "Lufthansa",
    cabinBaggage: "1 personal item + 1 carry-on",
    checkedBaggage: {
      economy: "1 bag included (long-haul), 0 bags (short-haul)",
      premiumEconomy: "2 bags included",
      business: "2 bags included",
      first: "3 bags included"
    },
    weight: {
      cabin: "Up to 8 kg total",
      checked: "Up to 23 kg per bag (Economy), 32 kg (Business/First)"
    },
    additionalFees: "Varies by route and booking class",
    specialItems: "Sports equipment accepted with advance notice"
  },
  {
    airline: "Emirates",
    cabinBaggage: "1 briefcase + 1 carry-on",
    checkedBaggage: {
      economy: "2 bags included (23 kg each)",
      business: "2 bags included (32 kg each)",
      first: "2 bags included (32 kg each)"
    },
    weight: {
      cabin: "Up to 7 kg",
      checked: "See above"
    },
    additionalFees: "Additional bags from $100-$300",
    specialItems: "Sports equipment policies vary by type"
  },
  {
    airline: "Ryanair",
    cabinBaggage: "1 small personal bag (free), 1 priority bag (fee)",
    checkedBaggage: {
      economy: "0 bags included (fee applies)",
      business: "N/A",
      first: "N/A"
    },
    weight: {
      cabin: "Up to 10 kg (priority bag)",
      checked: "Up to 20 kg per bag"
    },
    additionalFees: "From €12.99 per bag (online), €25+ at airport",
    specialItems: "Strict size requirements, fees apply for oversize items"
  }
];

// Fare Class Codes and Meanings
export const FARE_CLASSES: FareClass[] = [
  {
    code: "F",
    name: "First Class",
    cabin: "First",
    description: "Premium first class service",
    benefits: [
      "Lie-flat seats",
      "Premium dining",
      "Priority check-in and boarding",
      "Lounge access",
      "Extra baggage allowance",
      "Maximum flexibility"
    ],
    changeFees: "Usually free or minimal",
    cancellation: "Refundable with minimal penalty"
  },
  {
    code: "J",
    name: "Business Class",
    cabin: "Business",
    description: "Full-service business class",
    benefits: [
      "Lie-flat or angled seats",
      "Enhanced dining",
      "Priority services",
      "Lounge access",
      "Extra baggage",
      "Good flexibility"
    ],
    changeFees: "Low to moderate",
    cancellation: "Often refundable with fee"
  },
  {
    code: "C",
    name: "Business Class",
    cabin: "Business",
    description: "Standard business class",
    benefits: [
      "Premium seating",
      "Enhanced meal service",
      "Priority boarding",
      "Extra legroom"
    ],
    changeFees: "Moderate",
    cancellation: "May be refundable with fee"
  },
  {
    code: "W",
    name: "Premium Economy",
    cabin: "Premium Economy",
    description: "Enhanced economy service",
    benefits: [
      "Extra legroom",
      "Enhanced meals",
      "Priority boarding",
      "Extra baggage allowance",
      "Better entertainment"
    ],
    changeFees: "Moderate to high",
    cancellation: "Usually non-refundable"
  },
  {
    code: "Y",
    name: "Economy Class",
    cabin: "Economy",
    description: "Full-fare economy",
    benefits: [
      "Standard seating",
      "Meal service (long-haul)",
      "Basic baggage allowance",
      "Some flexibility"
    ],
    changeFees: "High",
    cancellation: "Usually non-refundable or high fee"
  },
  {
    code: "B",
    name: "Economy Class",
    cabin: "Economy",
    description: "Discounted economy",
    benefits: [
      "Standard seating",
      "Basic services",
      "Limited baggage"
    ],
    changeFees: "Very high",
    cancellation: "Non-refundable"
  },
  {
    code: "M",
    name: "Economy Class",
    cabin: "Economy",
    description: "Deep discount economy",
    benefits: [
      "Standard seating",
      "Minimal flexibility"
    ],
    changeFees: "Very high or prohibited",
    cancellation: "Non-refundable"
  }
];

// Airline Alliances
export const AIRLINE_ALLIANCES: AirlineAlliance[] = [
  {
    name: "Star Alliance",
    airlines: [
      "United Airlines",
      "Lufthansa",
      "Air Canada",
      "ANA (All Nippon Airways)",
      "Singapore Airlines",
      "Turkish Airlines",
      "Swiss International Air Lines",
      "Austrian Airlines",
      "Brussels Airlines",
      "Scandinavian Airlines (SAS)",
      "TAP Air Portugal",
      "Thai Airways",
      "Air China",
      "Asiana Airlines",
      "EVA Air",
      "LOT Polish Airlines",
      "Egyptair",
      "Ethiopian Airlines",
      "South African Airways",
      "Avianca"
    ],
    benefits: [
      "Earn and redeem miles across all member airlines",
      "Access to 1,000+ airport lounges worldwide",
      "Priority check-in and boarding",
      "Additional baggage allowance",
      "Seamless connections between member airlines",
      "Round-the-world tickets"
    ]
  },
  {
    name: "OneWorld",
    airlines: [
      "American Airlines",
      "British Airways",
      "Cathay Pacific",
      "Qantas",
      "Qatar Airways",
      "Japan Airlines",
      "Iberia",
      "Finnair",
      "Malaysia Airlines",
      "Royal Jordanian",
      "S7 Airlines",
      "SriLankan Airlines",
      "Alaska Airlines",
      "Royal Air Maroc"
    ],
    benefits: [
      "Earn and use miles across member airlines",
      "Access to 650+ premium lounges",
      "Priority services",
      "Extra baggage allowance for elite members",
      "Preferred seating",
      "Fast track security"
    ]
  },
  {
    name: "SkyTeam",
    airlines: [
      "Delta Air Lines",
      "Air France",
      "KLM",
      "Korean Air",
      "China Airlines",
      "China Eastern",
      "Aeromexico",
      "Aeroflot",
      "Alitalia",
      "Czech Airlines",
      "Kenya Airways",
      "Middle East Airlines",
      "Saudia",
      "TAROM",
      "Vietnam Airlines",
      "Xiamen Airlines",
      "Air Europa",
      "Garuda Indonesia",
      "China Southern"
    ],
    benefits: [
      "Miles can be earned and redeemed across partners",
      "Access to 750+ lounges in 170+ countries",
      "Priority check-in and boarding",
      "Extra baggage for elite members",
      "SkyPriority services",
      "Seamless global travel"
    ]
  }
];

// Common Flight Terms
export const FLIGHT_TERMS = {
  "Codeshare": "A flight operated by one airline but marketed by another. Example: United flight operated by Lufthansa.",
  "Layover": "A stop between flights where you remain in the airport. Can range from 30 minutes to several hours.",
  "Stopover": "A longer break in your journey (typically over 24 hours) in a connecting city.",
  "Red-eye": "An overnight flight that departs late at night and arrives early morning.",
  "Direct Flight": "A flight with the same flight number that may make stops but you don't change planes.",
  "Non-stop": "A flight that goes from origin to destination without any stops.",
  "Basic Economy": "A restricted fare class with no seat selection, no changes, and last boarding group.",
  "PNR": "Passenger Name Record - your unique booking reference code.",
  "E-ticket": "Electronic ticket stored in the airline's system, no physical ticket needed.",
  "Gate Check": "When carry-on bags must be checked at the gate due to space limitations.",
  "TSA PreCheck": "Expedited security screening program in the US (fee required).",
  "Global Entry": "Expedited customs clearance for international travelers (includes TSA PreCheck).",
  "Open Jaw": "A round-trip ticket where you fly into one city and return from another.",
  "Multi-city": "A ticket with multiple destinations in one booking.",
  "Standby": "Waiting for an available seat on a flight, typically after missing your original flight.",
  "Bump": "When you're denied boarding due to overbooking (may receive compensation).",
  "Upgrade": "Moving to a higher class of service (First, Business, Premium Economy).",
  "Miles/Points": "Loyalty program currency earned through flights and credit card spending.",
  "Blackout Dates": "Dates when award tickets cannot be redeemed.",
  "Award Ticket": "A flight booked using frequent flyer miles instead of money."
};

// Cancellation Policies
export const CANCELLATION_POLICIES = {
  general: "Cancellation policies vary by airline, fare type, and booking class. Always check your specific ticket rules.",

  refundable: {
    description: "Fully refundable tickets (usually First, Business, or full-fare Economy)",
    policy: "Can be cancelled for a full refund, though a small processing fee may apply",
    timeframe: "Usually up to departure time",
    process: "Contact airline or book through their website/app"
  },

  nonRefundable: {
    description: "Non-refundable tickets (most economy fares)",
    policy: "Cancellation results in forfeit of ticket value, though some airlines offer credit",
    credit: "May receive travel credit minus cancellation fee ($200-$500 typical)",
    timeframe: "Credit usually valid for 1 year from original booking",
    exceptions: "24-hour cancellation rule (see below)"
  },

  basicEconomy: {
    description: "Basic Economy fares (highly restricted)",
    policy: "No changes or cancellations allowed in most cases",
    exceptions: "Only refundable if cancelled within 24 hours of booking",
    alternative: "May be able to forfeit ticket and apply residual value to new booking"
  },

  hour24Rule: {
    description: "US DOT 24-hour cancellation rule",
    policy: "All US flights can be cancelled within 24 hours of booking for full refund",
    requirements: [
      "Booking must be made at least 7 days before departure",
      "Applies to flights to/from/within the US",
      "Both refundable and non-refundable tickets",
      "No fees or penalties"
    ]
  },

  covid: {
    description: "Many airlines introduced flexible policies during COVID-19",
    policy: "Check current airline policy as these change frequently",
    common: "Many airlines eliminated change fees for economy and above (not Basic Economy)"
  }
};

// Change Fees
export const CHANGE_FEES = {
  general: "Change fees vary by airline, route (domestic vs international), and fare class.",

  domestic: {
    economy: "$200-$300 (some airlines eliminated this)",
    premiumEconomy: "$75-$200",
    business: "$0-$100",
    first: "$0"
  },

  international: {
    economy: "$300-$500",
    premiumEconomy: "$200-$300",
    business: "$0-$200",
    first: "$0"
  },

  basicEconomy: "No changes allowed (or full fare forfeiture)",

  notes: [
    "Many major airlines (United, Delta, American) eliminated change fees for most fares (excluding Basic Economy)",
    "You still pay fare difference when changing to a more expensive flight",
    "Budget airlines (Ryanair, Spirit, Frontier) typically charge high change fees",
    "Changes made close to departure may incur higher fees",
    "Same-day changes usually have lower fees ($75-$150)"
  ],

  sameDay: {
    description: "Same-day flight changes",
    fee: "$75-$150 for confirmed change",
    standby: "Often free for elite members, $75 for others",
    availability: "Subject to seat availability"
  }
};

// Best Practices
export const FLIGHT_BEST_PRACTICES = {
  booking: [
    "Book 2-3 months in advance for domestic, 3-6 months for international",
    "Tuesday and Wednesday often have lower fares",
    "Use incognito mode to avoid price tracking cookies",
    "Compare prices across multiple booking sites",
    "Consider flying on off-peak days (Tuesday, Wednesday, Saturday)",
    "Red-eye flights are often cheaper",
    "Book directly with airline for easier changes/cancellations"
  ],

  checkin: [
    "Check in exactly 24 hours before departure for best seat selection",
    "Mobile boarding passes are convenient and eco-friendly",
    "Arrive 2 hours early for domestic, 3 hours for international",
    "Join TSA PreCheck/Global Entry for faster security",
    "Wear slip-on shoes for easier security screening"
  ],

  baggage: [
    "Weigh bags at home to avoid overweight fees",
    "Pack valuables, medications, and essentials in carry-on",
    "Take photo of checked baggage in case of loss",
    "Use luggage tags with contact information",
    "Know your airline's size restrictions",
    "Consider shipping luggage for long trips"
  ],

  connections: [
    "Allow 60-90 minutes for domestic connections",
    "Allow 2-3 hours for international connections",
    "Book all flights on one ticket for better protection",
    "Know your airport layout for tight connections",
    "Seat near front of plane for faster deplaning"
  ]
};

export function getBaggagePolicy(airline: string): BaggagePolicy | null {
  const policy = BAGGAGE_POLICIES.find(
    p => p.airline.toLowerCase() === airline.toLowerCase()
  );
  return policy || null;
}

export function getFareClass(code: string): FareClass | null {
  const fareClass = FARE_CLASSES.find(
    f => f.code.toUpperCase() === code.toUpperCase()
  );
  return fareClass || null;
}

export function getAirlineAlliance(airline: string): string | null {
  for (const alliance of AIRLINE_ALLIANCES) {
    if (alliance.airlines.some(a => a.toLowerCase().includes(airline.toLowerCase()))) {
      return alliance.name;
    }
  }
  return null;
}
