/**
 * Visa and Passport Knowledge Base
 * Comprehensive information about visa requirements, passport rules, and entry requirements
 */

export interface VisaRequirement {
  country: string;
  visaRequired: {
    [nationality: string]: 'visa-required' | 'visa-free' | 'visa-on-arrival' | 'eVisa';
  };
  maxStay?: string;
  passportValidity: string;
  notes?: string[];
}

export interface VisaType {
  type: string;
  description: string;
  duration: string;
  purpose: string[];
  requirements: string[];
}

export interface VisaWaiverProgram {
  name: string;
  countries: string[];
  eligibleNationalities: string[];
  maxStay: string;
  requirements: string[];
  restrictions: string[];
}

// Common Passport Validity Rules
export const PASSPORT_VALIDITY_RULES = {
  "6-Month Rule": {
    description: "Passport must be valid for at least 6 months beyond your planned departure date",
    countries: [
      "China", "Thailand", "Vietnam", "Indonesia", "Malaysia", "Philippines",
      "Singapore", "India", "Egypt", "Kenya", "Tanzania", "South Africa",
      "UAE", "Qatar", "Jordan", "Brazil", "Venezuela", "Peru"
    ],
    importance: "Very common rule - always check!",
    consequence: "Denied boarding if passport validity is insufficient"
  },

  "3-Month Rule": {
    description: "Passport must be valid for at least 3 months beyond your planned stay",
    countries: [
      "Most EU Schengen countries",
      "Switzerland",
      "Norway",
      "Iceland"
    ],
    note: "EU requires 3 months beyond intended departure from Schengen area"
  },

  "Valid for Duration": {
    description: "Passport only needs to be valid for the duration of your stay",
    countries: [
      "United States (for most nationalities)",
      "Canada",
      "Mexico",
      "United Kingdom",
      "Japan",
      "South Korea",
      "Australia",
      "New Zealand"
    ],
    note: "Still recommended to have 6 months validity for safety"
  },

  "Blank Pages": {
    description: "Many countries require blank visa pages",
    requirement: "Typically 1-2 blank pages, sometimes more",
    countries: "Most countries requiring visas",
    note: "Pages with stamps don't count as blank"
  }
};

// Popular Visa Waiver Programs
export const VISA_WAIVER_PROGRAMS: VisaWaiverProgram[] = [
  {
    name: "US Visa Waiver Program (VWP) / ESTA",
    countries: ["United States"],
    eligibleNationalities: [
      "Andorra", "Australia", "Austria", "Belgium", "Brunei", "Chile",
      "Croatia", "Czech Republic", "Denmark", "Estonia", "Finland", "France",
      "Germany", "Greece", "Hungary", "Iceland", "Ireland", "Italy", "Japan",
      "Latvia", "Liechtenstein", "Lithuania", "Luxembourg", "Malta", "Monaco",
      "Netherlands", "New Zealand", "Norway", "Poland", "Portugal", "San Marino",
      "Singapore", "Slovakia", "Slovenia", "South Korea", "Spain", "Sweden",
      "Switzerland", "Taiwan", "United Kingdom"
    ],
    maxStay: "90 days",
    requirements: [
      "Valid ESTA authorization (apply online, $21 fee)",
      "Valid passport (e-passport with chip preferred)",
      "Round-trip ticket",
      "Proof of sufficient funds",
      "No intent to work or study"
    ],
    restrictions: [
      "Cannot extend stay beyond 90 days",
      "Cannot change status to work visa",
      "Travel to certain countries may disqualify (Iran, Iraq, Syria, etc.)"
    ]
  },
  {
    name: "Schengen Visa Waiver",
    countries: [
      "26 European countries: Austria, Belgium, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Iceland, Italy, Latvia, Lithuania, Luxembourg, Malta, Netherlands, Norway, Poland, Portugal, Slovakia, Slovenia, Spain, Sweden, Switzerland, Liechtenstein"
    ],
    eligibleNationalities: [
      "US", "Canada", "Australia", "New Zealand", "Japan", "South Korea",
      "Singapore", "Brazil", "Argentina", "Chile", "Mexico", "Israel",
      "UK", "and 60+ other countries"
    ],
    maxStay: "90 days within any 180-day period",
    requirements: [
      "Valid passport (3 months beyond departure)",
      "Proof of accommodation",
      "Sufficient funds (€50-100/day)",
      "Return ticket",
      "Travel insurance (€30,000 minimum coverage)"
    ],
    restrictions: [
      "90 days in 180 days applies to entire Schengen area",
      "Cannot work without permit",
      "Overstaying results in bans"
    ]
  },
  {
    name: "UK Visa Waiver",
    countries: ["United Kingdom"],
    eligibleNationalities: [
      "US", "Canada", "Australia", "New Zealand", "Japan", "South Korea",
      "and many others (100+ countries)"
    ],
    maxStay: "6 months",
    requirements: [
      "Valid passport",
      "Proof of funds",
      "Accommodation details",
      "Return ticket"
    ],
    restrictions: [
      "Cannot work or study (short courses OK)",
      "Cannot access public funds",
      "May need visa if staying longer or working"
    ]
  },
  {
    name: "Canada eTA",
    countries: ["Canada"],
    eligibleNationalities: [
      "Same as US VWP countries (except US citizens don't need eTA)"
    ],
    maxStay: "6 months",
    requirements: [
      "Valid eTA (Electronic Travel Authorization, CAD $7)",
      "Valid passport",
      "Proof of funds",
      "Return ticket"
    ],
    restrictions: [
      "Cannot work or study long-term",
      "Multiple entries allowed for 5 years or until passport expires"
    ]
  },
  {
    name: "Japan Visa Waiver",
    countries: ["Japan"],
    eligibleNationalities: [
      "68 countries including US, UK, Canada, Australia, most EU countries"
    ],
    maxStay: "90 days (some countries: 15 or 30 days)",
    requirements: [
      "Valid passport",
      "Return ticket",
      "Proof of funds",
      "No work permitted"
    ],
    restrictions: [
      "Cannot extend beyond 90 days without visa",
      "Cannot work without work visa"
    ]
  }
];

// Common Visa Types
export const VISA_TYPES: VisaType[] = [
  {
    type: "Tourist Visa (B-2 in US)",
    description: "For tourism and leisure travel",
    duration: "Typically 3-6 months, sometimes up to 10 years (multiple entry)",
    purpose: ["Tourism", "Visiting friends/family", "Medical treatment", "Leisure"],
    requirements: [
      "Valid passport",
      "Completed visa application",
      "Passport photos",
      "Proof of ties to home country",
      "Financial evidence",
      "Travel itinerary",
      "Interview (country-dependent)"
    ]
  },
  {
    type: "Business Visa (B-1 in US)",
    description: "For business activities (not employment)",
    duration: "3-6 months, often multiple entry for 1-10 years",
    purpose: ["Business meetings", "Conferences", "Contract negotiations", "Consulting"],
    requirements: [
      "Valid passport",
      "Invitation letter from host company",
      "Business documentation",
      "Proof of employment",
      "Financial evidence",
      "Travel itinerary"
    ]
  },
  {
    type: "Student Visa (F-1 in US)",
    description: "For academic studies",
    duration: "Duration of study program + practical training period",
    purpose: ["University studies", "Language courses", "Vocational training"],
    requirements: [
      "Acceptance letter from educational institution",
      "Proof of financial support",
      "Evidence of ties to home country",
      "Academic records",
      "English proficiency proof",
      "SEVIS fee (US)"
    ]
  },
  {
    type: "Work Visa (H-1B in US)",
    description: "For employment in foreign country",
    duration: "Varies by country and job, typically 1-3 years renewable",
    purpose: ["Skilled employment", "Professional work", "Specialized knowledge"],
    requirements: [
      "Job offer from employer",
      "Labor certification (some countries)",
      "Qualifications/degrees",
      "Professional experience",
      "Employer sponsorship",
      "Proof of specialty occupation"
    ]
  },
  {
    type: "Transit Visa",
    description: "For passing through a country to reach final destination",
    duration: "24-96 hours typically",
    purpose: ["Connecting flights", "Changing airports"],
    requirements: [
      "Valid passport",
      "Confirmed onward ticket",
      "Visa for final destination (if required)",
      "Sometimes not required if staying airside"
    ]
  },
  {
    type: "eVisa",
    description: "Electronic visa obtained online",
    duration: "Varies by country, typically 30-90 days",
    purpose: ["Tourism", "Business", "Transit"],
    requirements: [
      "Online application",
      "Digital passport photo",
      "Payment by credit card",
      "Email for visa delivery",
      "Fast processing (hours to days)"
    ]
  }
];

// Visa Processing Times
export const VISA_PROCESSING_TIMES = {
  eVisa: {
    typical: "1-5 business days",
    rush: "Same day to 24 hours (extra fee)",
    countries: ["India", "Turkey", "Australia (ETA)", "Kenya", "Vietnam", "Egypt"]
  },

  visaOnArrival: {
    typical: "At airport upon arrival",
    time: "30 minutes to 2 hours",
    countries: ["Cambodia", "Laos", "Maldives", "Jordan", "Bahrain", "Comoros"],
    note: "Have exact cash amount ready (USD usually accepted)"
  },

  embassyVisa: {
    typical: "5-15 business days",
    rush: "2-5 business days (extra fee)",
    countries: ["Most countries requiring traditional visa application"],
    note: "Apply well in advance - can take weeks during peak season"
  },

  US_visa: {
    typical: "3-5 weeks (interview + processing)",
    rush: "Emergency appointments available in urgent cases",
    note: "Interview wait times vary by country and season - can be months"
  },

  Schengen_visa: {
    typical: "15 days (can take up to 30-60 days)",
    rush: "Can apply up to 6 months in advance",
    note: "Apply to consulate of main destination country"
  }
};

// Visa Requirements by Country (Popular Destinations)
export const VISA_REQUIREMENTS_COMMON: VisaRequirement[] = [
  {
    country: "United States",
    visaRequired: {
      "Most countries": "visa-required",
      "VWP countries": "visa-free",
    },
    maxStay: "90 days (VWP) or as per visa",
    passportValidity: "Valid for duration of stay (6 months recommended)",
    notes: [
      "ESTA required for VWP ($21)",
      "Visa interview required for B-1/B-2",
      "Processing: 3-5 weeks"
    ]
  },
  {
    country: "United Kingdom",
    visaRequired: {
      "US, Canada, Australia, EU, Japan": "visa-free",
      "Most other countries": "visa-required"
    },
    maxStay: "6 months (visa-free)",
    passportValidity: "Valid for duration of stay",
    notes: [
      "Standard Visitor visa for those requiring visa",
      "Processing: 3 weeks typically"
    ]
  },
  {
    country: "Schengen Area (Europe)",
    visaRequired: {
      "US, Canada, UK, Australia, Japan, etc.": "visa-free",
      "China, India, Russia, etc.": "visa-required"
    },
    maxStay: "90 days in any 180-day period",
    passportValidity: "3 months beyond intended departure",
    notes: [
      "Apply at consulate of main destination",
      "Travel insurance required (€30,000)",
      "Schengen Calculator tool to track days"
    ]
  },
  {
    country: "China",
    visaRequired: {
      "Most countries": "visa-required",
      "144-hour transit": "visa-free"
    },
    maxStay: "30-90 days depending on visa type",
    passportValidity: "6 months with 2 blank pages",
    notes: [
      "Tourist visa (L visa) most common",
      "144-hour visa-free transit in select cities",
      "Processing: 4-5 business days"
    ]
  },
  {
    country: "India",
    visaRequired: {
      "All countries": "visa-required",
    },
    maxStay: "30-90 days (eVisa)",
    passportValidity: "6 months with 2 blank pages",
    notes: [
      "eVisa available for most nationalities ($25-$100)",
      "Traditional visa at embassy for longer stays",
      "eVisa processing: 3-5 business days"
    ]
  },
  {
    country: "Australia",
    visaRequired: {
      "All countries": "visa-required",
    },
    maxStay: "3-12 months depending on visa",
    passportValidity: "Valid for duration of stay",
    notes: [
      "eVisitor (651) free for eligible European countries",
      "ETA ($20) for US, Canada, Japan, etc.",
      "Tourist visa (600) for others",
      "Processing: Instant to 24 hours (ETA)"
    ]
  },
  {
    country: "Japan",
    visaRequired: {
      "68 countries": "visa-free",
      "Others": "visa-required"
    },
    maxStay: "15-90 days depending on nationality",
    passportValidity: "Valid for duration of stay",
    notes: [
      "Visa-free for most developed countries",
      "Cannot work on tourist status"
    ]
  },
  {
    country: "Brazil",
    visaRequired: {
      "US, Canada, Australia, Japan": "visa-free",
      "Some countries": "visa-required"
    },
    maxStay: "90 days",
    passportValidity: "6 months",
    notes: [
      "Recent change - US citizens no longer need visa",
      "eVisa for some nationalities"
    ]
  },
  {
    country: "Turkey",
    visaRequired: {
      "Most countries": "eVisa",
      "Some EU countries": "visa-free"
    },
    maxStay: "90 days",
    passportValidity: "6 months",
    notes: [
      "eVisa simple online application ($50)",
      "Processing: Minutes",
      "Multiple entry allowed"
    ]
  },
  {
    country: "Thailand",
    visaRequired: {
      "Many countries": "visa-free",
      "Some": "visa-on-arrival"
    },
    maxStay: "30-60 days visa-free",
    passportValidity: "6 months",
    notes: [
      "60 days visa-free for many nationalities (recently extended)",
      "Can extend 30 days at immigration office",
      "Visa-on-arrival available for some countries"
    ]
  }
];

// Helpful Tips
export const VISA_TIPS = {
  before_applying: [
    "Check requirements 2-3 months before travel",
    "Ensure passport validity (6 months recommended)",
    "Have blank passport pages (2+ recommended)",
    "Gather all required documents",
    "Passport photos (check specific size requirements)",
    "Apply early - don't wait until last minute"
  ],

  application: [
    "Fill out forms completely and accurately",
    "Be honest - false info can result in ban",
    "Proof of ties to home country (job, property, family)",
    "Bank statements showing sufficient funds",
    "Travel itinerary and bookings (refundable)",
    "Travel insurance for Schengen and some countries",
    "Invitation letters if visiting friends/family"
  ],

  interview: [
    "Dress professionally",
    "Be honest and concise",
    "Have all documents organized",
    "Show strong ties to home country",
    "Explain purpose of trip clearly",
    "Don't volunteer unnecessary information"
  ],

  denial: [
    "You can usually reapply",
    "Address reason for denial in new application",
    "Provide additional documentation",
    "Consider consulting immigration lawyer",
    "Some countries allow appeals"
  ]
};

export function checkVisaRequirement(
  nationality: string,
  destination: string
): string {
  // This would ideally query a comprehensive database
  // For now, returns general guidance
  return "Please check official government sources for visa requirements. Requirements change frequently.";
}

export function getPassportValidityRequirement(destination: string): string {
  if (PASSPORT_VALIDITY_RULES["6-Month Rule"].countries.includes(destination)) {
    return "6 months beyond departure date";
  }
  if (PASSPORT_VALIDITY_RULES["3-Month Rule"].countries.includes(destination)) {
    return "3 months beyond departure from Schengen area";
  }
  return "Valid for duration of stay (6 months recommended)";
}
