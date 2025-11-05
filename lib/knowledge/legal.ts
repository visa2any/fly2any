/**
 * Legal Knowledge Base
 * Travel regulations, passenger rights, and compensation rules
 */

export interface CompensationRule {
  regulation: string;
  region: string;
  description: string;
  eligibility: string[];
  amounts: CompensationAmount[];
  exclusions: string[];
  howToClaim: string[];
}

export interface CompensationAmount {
  distance: string;
  delay: string;
  amount: string;
}

export interface PassengerRight {
  right: string;
  description: string;
  applies_to: string[];
  details: string[];
}

// EU Regulation 261/2004 - Flight Compensation
export const EU261_COMPENSATION: CompensationRule = {
  regulation: "EU Regulation 261/2004",
  region: "European Union",
  description: "Passengers are entitled to compensation for flight delays, cancellations, and denied boarding on flights departing from EU airports or arriving at EU airports on EU carriers.",

  eligibility: [
    "Flight departed from EU airport (any airline)",
    "Flight arrived at EU airport on EU carrier",
    "Delay of 3+ hours at final destination",
    "Cancellation with less than 14 days notice",
    "Denied boarding due to overbooking",
    "Missed connection causing 3+ hour delay"
  ],

  amounts: [
    {
      distance: "Under 1,500 km",
      delay: "3+ hours",
      amount: "€250"
    },
    {
      distance: "1,500-3,500 km (within EU) or all flights within EU",
      delay: "3+ hours",
      amount: "€400"
    },
    {
      distance: "Over 3,500 km (outside EU)",
      delay: "3-4 hours",
      amount: "€300"
    },
    {
      distance: "Over 3,500 km (outside EU)",
      delay: "4+ hours",
      amount: "€600"
    }
  ],

  exclusions: [
    "Extraordinary circumstances (severe weather, political unrest, security risks)",
    "You arrived 3+ hours late but less than 3 hours delay (re-routed)",
    "You were informed 14+ days before departure",
    "Alternative flight offered within specific time windows",
    "You didn't show up for original flight",
    "You traveled with invalid documents"
  ],

  howToClaim: [
    "Contact airline's customer service or claims department",
    "Provide booking reference, flight details, and delay evidence",
    "Airline has up to 6 weeks to respond (varies by country)",
    "If denied, escalate to National Enforcement Body (NEB)",
    "Use claim services like AirHelp or ClaimCompass (take 25-35% commission)",
    "Small claims court as last resort",
    "Keep all documentation: boarding passes, receipts, communication"
  ]
};

// Additional EU261 Rights
export const EU261_ADDITIONAL_RIGHTS = {
  care: {
    description: "Right to care while waiting",
    rights: [
      "2+ hour delay: Meals and refreshments",
      "3+ hour delay: Hotel accommodation if overnight delay",
      "Transportation between airport and hotel",
      "Two phone calls, emails, or faxes"
    ]
  },

  reimbursement: {
    description: "Right to reimbursement or re-routing",
    options: [
      "Full refund of ticket within 7 days (for cancelled portion)",
      "Return flight to first point of departure (if applicable)",
      "Re-routing to final destination at earliest opportunity",
      "Re-routing at later date at passenger's convenience"
    ]
  },

  downgrade: {
    description: "Compensation for involuntary downgrade",
    amounts: [
      "Under 1,500 km: 30% of ticket price",
      "1,500-3,500 km: 50% of ticket price",
      "Over 3,500 km: 75% of ticket price"
    ]
  }
};

// US DOT Regulations
export const US_DOT_REGULATIONS: CompensationRule = {
  regulation: "US DOT Denied Boarding Compensation",
  region: "United States",
  description: "Passengers may be entitled to compensation for involuntary denied boarding (bumping) on US flights.",

  eligibility: [
    "Domestic or international flight departing from US",
    "Involuntarily denied boarding due to overbooking",
    "Had confirmed reservation",
    "Checked in on time",
    "Arrived at gate on time"
  ],

  amounts: [
    {
      distance: "Any distance",
      delay: "1-2 hours domestic (1-4 hours international)",
      amount: "200% of one-way fare (max $775)"
    },
    {
      distance: "Any distance",
      delay: "Over 2 hours domestic (over 4 hours international)",
      amount: "400% of one-way fare (max $1,550)"
    }
  ],

  exclusions: [
    "Aircraft change for safety/operational reasons",
    "Flights on aircraft with 30 or fewer seats",
    "Passenger didn't comply with check-in deadline",
    "Passenger safety or health concerns",
    "Passenger not in possession of required travel documents"
  ],

  howToClaim: [
    "Airline must ask for volunteers before bumping",
    "Involuntary bump compensation paid on the spot (check or cash)",
    "Must receive written notice of rights",
    "Keep all documentation",
    "File complaint with DOT if airline doesn't comply"
  ]
};

// US DOT Additional Rules
export const US_DOT_ADDITIONAL_RULES = {
  tarmacDelay: {
    description: "3-hour tarmac delay rule (domestic) / 4-hour (international)",
    rights: [
      "Airline must allow deplaning after 3 hours (domestic) or 4 hours (international)",
      "Exceptions only for safety, security, or ATC",
      "Must provide food and water after 2 hours",
      "Must provide working lavatories",
      "Medical attention if needed",
      "Fines up to $27,500 per passenger for violations"
    ]
  },

  refunds: {
    description: "Right to refund for cancelled/significantly changed flights",
    rights: [
      "Full refund if flight cancelled by airline",
      "Refund for significantly changed flights",
      "Refund must be given within 7 days (credit card) or 20 days (cash)",
      "Refund includes ticket price and any optional fees",
      "Applies to non-refundable tickets if airline cancels"
    ]
  },

  hour24Rule: {
    description: "24-hour cancellation rule",
    rights: [
      "Cancel any flight within 24 hours of booking for full refund",
      "Applies if booking made 7+ days before departure",
      "No penalties or fees",
      "Applies to all US flights"
    ]
  },

  baggage: {
    description: "Baggage liability and compensation",
    rights: [
      "Domestic: Up to $3,800 per passenger for lost/damaged bags",
      "International: Up to ~$1,780 per passenger (Montreal Convention)",
      "Report lost bags immediately",
      "Delayed bag compensation varies by airline"
    ]
  }
};

// Montreal Convention
export const MONTREAL_CONVENTION = {
  description: "International treaty governing airline liability for international travel",
  region: "International flights (120+ countries)",

  liability: {
    death_injury: {
      description: "Airline liability for passenger death or injury",
      amount: "Up to ~$175,000 per passenger (strict liability)",
      unlimited: "Unlimited if airline negligence proven",
      notes: "Amounts adjusted for inflation periodically"
    },

    baggage: {
      description: "Liability for lost, damaged, or delayed baggage",
      amount: "~$1,780 per passenger",
      claim_deadline: "21 days for damaged baggage, 21 days for delayed baggage",
      notes: "Declare higher value at check-in for additional coverage (fee applies)"
    },

    delay: {
      description: "Compensation for flight delays",
      amount: "~$5,900 per passenger",
      notes: "Must prove actual damages (accommodation, meals, etc.)",
      defense: "Airline not liable if took all reasonable measures"
    }
  },

  claims: [
    "File written claim with airline",
    "Baggage damage: Within 7 days of receipt",
    "Baggage delay: Within 21 days of receipt",
    "Keep all receipts for expenses",
    "May need to pursue in court if airline denies claim"
  ]
};

// Consumer Rights by Country/Region
export const CONSUMER_RIGHTS = {
  UK: {
    regulation: "UK Regulation 261/2004 (retained EU law)",
    description: "Similar to EU261, applies to flights from UK or to UK on UK carriers",
    notes: "Maintained EU261 protections post-Brexit",
    enforcement: "UK Civil Aviation Authority (CAA)"
  },

  Canada: {
    regulation: "Air Passenger Protection Regulations (APPR)",
    description: "Compensation for delays, cancellations, lost baggage, and denied boarding",
    amounts: {
      delay: "$125-$1,000 depending on delay length and airline size",
      deniedBoarding: "$900-$2,400",
      lostBaggage: "$2,100 maximum"
    },
    enforcement: "Canadian Transportation Agency (CTA)"
  },

  Brazil: {
    regulation: "ANAC Resolution 400/2016",
    description: "Passenger rights for delays, cancellations, and overbooking",
    rights: [
      "1+ hour delay: Communication (phone, internet)",
      "2+ hour delay: Meals",
      "4+ hour delay: Accommodation if needed",
      "Denied boarding: Compensation or alternative flight + meals"
    ],
    enforcement: "ANAC (National Civil Aviation Agency)"
  },

  Australia: {
    regulation: "Australian Consumer Law",
    description: "General consumer protections, no specific flight compensation amounts",
    rights: [
      "Refund for services not provided",
      "Compensation for significant delays caused by airline",
      "Airline's terms and conditions also apply",
      "No standardized compensation amounts"
    ],
    enforcement: "Australian Competition and Consumer Commission (ACCC)"
  },

  Turkey: {
    regulation: "SHY Passenger Rights",
    description: "Similar to EU261 for flights from/to Turkey",
    amounts: "€250-€600 based on distance and delay",
    enforcement: "Turkish Civil Aviation Authority"
  }
};

// Refund Eligibility
export const REFUND_ELIGIBILITY = {
  entitled: {
    description: "When you're entitled to a refund",
    scenarios: [
      "Airline cancelled your flight",
      "Significant schedule change (varies by airline, typically 2+ hours)",
      "Flight delayed causing you to miss important event (case-by-case)",
      "Denied boarding involuntarily",
      "Cancelled within 24 hours of booking (US DOT rule)",
      "Death or serious illness (yours or immediate family) with documentation",
      "Airline refused to transport you (safety/health, but your documents valid)"
    ]
  },

  notEntitled: {
    description: "When you're typically NOT entitled to refund",
    scenarios: [
      "You missed your flight (overslept, traffic, etc.)",
      "You chose not to travel",
      "Non-refundable ticket and you cancelled",
      "You had invalid travel documents (visa, passport)",
      "Extraordinary circumstances (weather, ATC strike, etc.)",
      "You violated airline policies"
    ]
  },

  process: {
    steps: [
      "Contact airline immediately",
      "Reference applicable regulation (EU261, DOT, etc.)",
      "Provide documentation (booking ref, receipts, etc.)",
      "Request refund in writing (email with paper trail)",
      "Allow processing time (7-20 business days typically)",
      "Escalate to regulatory body if denied unfairly",
      "Credit card chargeback as last resort (within 60-120 days)",
      "Consider legal action for large amounts"
    ]
  }
};

// Passenger Rights Summary
export const PASSENGER_RIGHTS: PassengerRight[] = [
  {
    right: "Right to Compensation",
    description: "Monetary compensation for delays, cancellations, and denied boarding",
    applies_to: ["EU flights (EU261)", "US flights (DOT)", "Canadian flights (APPR)"],
    details: [
      "Amount varies by regulation and circumstances",
      "Must meet specific criteria (delay length, notice, etc.)",
      "Extraordinary circumstances may exempt airline",
      "File claim with airline, then regulator if needed"
    ]
  },
  {
    right: "Right to Care",
    description: "Meals, refreshments, and accommodation during delays",
    applies_to: ["EU flights", "Many international flights"],
    details: [
      "Depends on delay length",
      "Hotel if overnight delay required",
      "Transportation to/from hotel",
      "Communication (phone calls, emails)"
    ]
  },
  {
    right: "Right to Refund",
    description: "Money back if flight cancelled or significantly changed",
    applies_to: ["All flights when airline cancels"],
    details: [
      "Full refund of unused ticket portion",
      "Refund within 7-20 days depending on region",
      "Includes taxes and fees",
      "Option to choose re-routing instead"
    ]
  },
  {
    right: "Right to Information",
    description: "Clear information about your rights",
    applies_to: ["EU flights", "US flights", "Most regulated flights"],
    details: [
      "Airline must inform you of delay/cancellation reasons",
      "Written notice of your rights",
      "Contact information for claims",
      "Information must be accessible"
    ]
  },
  {
    right: "Right to Assistance for Disabilities",
    description: "Special assistance for passengers with reduced mobility",
    applies_to: ["All commercial flights in most countries"],
    details: [
      "Free assistance at airport and on aircraft",
      "Must notify airline in advance (48 hours recommended)",
      "Wheelchairs, boarding assistance, etc.",
      "Cannot charge extra fees for assistance"
    ]
  }
];

export function getCompensationAmount(
  regulation: 'EU261' | 'DOT',
  distance: number,
  delayHours: number
): string {
  if (regulation === 'EU261') {
    if (distance < 1500 && delayHours >= 3) return "€250";
    if (distance >= 1500 && distance <= 3500 && delayHours >= 3) return "€400";
    if (distance > 3500 && delayHours >= 3 && delayHours < 4) return "€300";
    if (distance > 3500 && delayHours >= 4) return "€600";
  } else if (regulation === 'DOT') {
    // DOT is for denied boarding, uses delay at final destination
    if (delayHours >= 1 && delayHours < 2) return "200% of one-way fare (max $775)";
    if (delayHours >= 2) return "400% of one-way fare (max $1,550)";
  }

  return "Not eligible for compensation";
}

export function isEligibleEU261(
  departureCountry: string,
  arrivalCountry: string,
  airlineCountry: string,
  delayHours: number
): boolean {
  const euCountries = [
    'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic',
    'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary',
    'Iceland', 'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta',
    'Netherlands', 'Norway', 'Poland', 'Portugal', 'Romania', 'Slovakia',
    'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'United Kingdom'
  ];

  const isDepartureEU = euCountries.includes(departureCountry);
  const isArrivalEU = euCountries.includes(arrivalCountry);
  const isAirlineEU = euCountries.includes(airlineCountry);

  // Eligible if: departing from EU OR (arriving in EU AND EU airline)
  const routeEligible = isDepartureEU || (isArrivalEU && isAirlineEU);

  // Must have 3+ hour delay
  return routeEligible && delayHours >= 3;
}
