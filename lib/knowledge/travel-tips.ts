/**
 * Travel Tips Knowledge Base
 * Practical advice for travelers
 */

export interface TravelTip {
  category: string;
  tips: string[];
}

export interface BookingTiming {
  type: string;
  bestTime: string;
  reasoning: string;
  exceptions?: string[];
}

// Packing Tips
export const PACKING_TIPS: TravelTip[] = [
  {
    category: "Carry-On Essentials",
    tips: [
      "Medications (in original containers with prescription)",
      "Passport, ID, and travel documents",
      "Phone, chargers, and adapters",
      "Change of clothes in case luggage is delayed",
      "Toiletries (under 3.4oz/100ml in clear bag)",
      "Valuables (jewelry, electronics)",
      "Important papers (copies of reservations, insurance)",
      "Snacks for flight",
      "Entertainment (book, tablet, headphones)",
      "Empty water bottle (fill after security)"
    ]
  },
  {
    category: "Checked Luggage",
    tips: [
      "Roll clothes instead of folding (saves space)",
      "Use packing cubes for organization",
      "Pack heavier items at bottom (near wheels)",
      "Wear bulkiest items on plane (shoes, jacket)",
      "Use laundry bags for dirty clothes",
      "Pack shoes in bags or shower caps",
      "Stuff socks inside shoes to save space",
      "Take photos of luggage contents for insurance claims",
      "Put contact info inside and outside bag",
      "Weigh bag at home to avoid overweight fees"
    ]
  },
  {
    category: "Clothing Strategy",
    tips: [
      "Choose versatile, mix-and-match pieces",
      "Stick to 2-3 color schemes",
      "Pack layers for temperature changes",
      "Bring 1-2 dressy outfits for nice dinners",
      "Comfortable walking shoes are essential",
      "Pack for 5-7 days even if longer trip (do laundry)",
      "Check weather forecast before packing",
      "Consider cultural dress codes",
      "Quick-dry fabrics for easy washing",
      "Compression bags for bulky items (jackets)"
    ]
  },
  {
    category: "Toiletries and Medicine",
    tips: [
      "3-1-1 rule: 3.4oz bottles in 1 quart bag, 1 bag per person",
      "Buy full-size items at destination if needed",
      "Bring prescription medications with extra days",
      "Pack medications in carry-on (never checked)",
      "Keep prescription labels on medications",
      "Bring basic first aid kit (band-aids, pain relievers)",
      "Consider travel-size laundry detergent",
      "Sunscreen and insect repellent for tropical destinations",
      "Hand sanitizer and wet wipes",
      "Contact lens supplies if needed"
    ]
  },
  {
    category: "Electronics",
    tips: [
      "Universal power adapter for international travel",
      "Portable charger/power bank (under 100Wh for carry-on)",
      "Extra charging cables (they break/get lost)",
      "Download maps, entertainment, documents offline",
      "Bring headphones with wire (Bluetooth may not work on planes)",
      "Camera and memory cards",
      "E-reader for books",
      "Cable organizer pouch",
      "Protect electronics in padded cases",
      "Take photos of serial numbers for insurance"
    ]
  },
  {
    category: "Documents and Money",
    tips: [
      "Passport valid for 6+ months",
      "Visa if required",
      "Driver's license or international driving permit",
      "Travel insurance documents",
      "Copies of all important documents (physical and digital)",
      "Credit cards (inform bank of travel plans)",
      "Small amount of local currency for arrival",
      "Emergency contact list",
      "Hotel reservations and confirmation numbers",
      "Travel itinerary shared with someone at home"
    ]
  }
];

// Airport Security Tips
export const AIRPORT_SECURITY_TIPS: TravelTip[] = [
  {
    category: "Before Security",
    tips: [
      "Check in online 24 hours before departure",
      "Arrive 2 hours early (domestic), 3 hours (international)",
      "Have ID and boarding pass ready",
      "Know your terminal and gate",
      "Print or download boarding pass",
      "Join TSA PreCheck or Global Entry for expedited screening",
      "Wear shoes that slip on/off easily",
      "Minimize jewelry and metal items"
    ]
  },
  {
    category: "At Security Checkpoint",
    tips: [
      "Place liquids (3-1-1 bag) in separate bin",
      "Remove laptop and large electronics from bag",
      "Take off shoes, belt, jacket (unless TSA PreCheck)",
      "Empty pockets completely",
      "Remove items from pockets before getting in line",
      "Place small items (phone, keys) in carry-on, not bins",
      "Don't joke about security - taken very seriously",
      "Follow TSA agent instructions",
      "Be patient and polite",
      "Collect all belongings before leaving screening area"
    ]
  },
  {
    category: "What You Can't Bring",
    tips: [
      "No liquids over 3.4oz in carry-on",
      "No sharp objects (knives, scissors over 4 inches)",
      "No firearms or weapons (even replicas)",
      "No explosive materials",
      "No lighters (limited exceptions)",
      "No tools over 7 inches",
      "Check TSA website for complete list",
      "When in doubt, pack it in checked luggage",
      "Declare any special items (medical equipment)",
      "Food is generally OK (avoid liquids/gels)"
    ]
  },
  {
    category: "International Security",
    tips: [
      "Have passport ready at multiple checkpoints",
      "Declare currency over $10,000 (US)",
      "Know customs regulations for food/plants",
      "Fill out customs forms honestly",
      "Have return ticket available if asked",
      "Know your accommodation address",
      "Additional security screening for some countries",
      "Be prepared for questions about trip purpose",
      "Keep receipts for expensive items purchased abroad",
      "Register with embassy for long trips"
    ]
  }
];

// Best Times to Book
export const BOOKING_TIMING: BookingTiming[] = [
  {
    type: "Domestic Flights (US)",
    bestTime: "1-3 months in advance",
    reasoning: "Sweet spot between early booking and last-minute pricing",
    exceptions: [
      "Holiday travel: Book 2-3 months ahead",
      "Summer vacation: Book 3-4 months ahead",
      "Last-minute weekend trips: Book Tuesday/Wednesday"
    ]
  },
  {
    type: "International Flights",
    bestTime: "2-8 months in advance",
    reasoning: "International fares fluctuate more; early booking locks in good rates",
    exceptions: [
      "Peak season (summer Europe): 4-6 months ahead",
      "Asia/Pacific: 3-5 months ahead",
      "South America: 2-4 months ahead",
      "Off-season: 2-3 months may suffice"
    ]
  },
  {
    type: "Hotels",
    bestTime: "1-4 weeks before arrival",
    reasoning: "Hotels adjust prices based on demand; booking window varies",
    exceptions: [
      "Major events/holidays: Book 2-3 months ahead",
      "Business hotels: Book close to arrival for weekend deals",
      "Resort properties: Book 1-2 months ahead",
      "Last-minute: Day-of or day-before for unsold inventory"
    ]
  },
  {
    type: "Car Rentals",
    bestTime: "2-4 weeks in advance",
    reasoning: "Prices rise as pickup date approaches",
    exceptions: [
      "Holiday periods: Book 1-2 months ahead",
      "International rentals: Book 4-6 weeks ahead",
      "Check again close to pickup - prices can drop"
    ]
  },
  {
    type: "Tours and Activities",
    bestTime: "1-2 months in advance",
    reasoning: "Ensures availability and sometimes early bird discounts",
    exceptions: [
      "Popular tours: Book as early as possible",
      "Last-minute deals on less popular tours",
      "Some activities allow same-day booking"
    ]
  }
];

export const BOOKING_BEST_PRACTICES = {
  daysOfWeek: {
    bestDayToBook: "Tuesday or Wednesday",
    reasoning: "Airlines often release sales on Monday evening",
    bestDayToFly: "Tuesday, Wednesday, or Saturday",
    worstDayToFly: "Friday and Sunday (most expensive)"
  },

  timeOfDay: {
    bestTime: "Early morning (5-7 AM) or red-eye flights",
    reasoning: "Less demand = lower prices, fewer delays",
    worstTime: "Mid-day and evening flights more expensive"
  },

  flexibility: {
    tip: "Be flexible with dates and times",
    strategy: [
      "Check prices for +/- 3 days from ideal date",
      "Consider nearby airports",
      "Red-eye flights often cheaper",
      "Avoid peak travel dates (holidays)",
      "Use fare calendars to see cheapest dates"
    ]
  },

  tools: [
    "Google Flights - price tracking and calendar view",
    "Skyscanner - comprehensive search across dates",
    "Kayak - price alerts and predictions",
    "Hopper - AI-powered price predictions",
    "ITA Matrix - flexible search options",
    "Scott's Cheap Flights - error fare alerts",
    "Going (formerly Scott's) - flight deal newsletter"
  ]
};

// Travel Insurance
export const TRAVEL_INSURANCE_INFO = {
  importance: "Highly recommended for international travel and expensive trips",

  whatItCovers: [
    "Trip cancellation/interruption",
    "Medical emergencies abroad",
    "Emergency evacuation",
    "Lost, stolen, or delayed baggage",
    "Flight delays and missed connections",
    "Accidental death and dismemberment",
    "24/7 travel assistance"
  ],

  whenTooBuy: [
    "Within 14-21 days of initial trip deposit for maximum coverage",
    "Before final payment for trip cancellation coverage",
    "Can buy anytime before departure (limited coverage)"
  ],

  cost: "Typically 4-10% of total trip cost",

  whoNeedsIt: [
    "International travelers",
    "Expensive trips ($3,000+)",
    "Non-refundable bookings",
    "Travelers with health concerns",
    "Adventure activities (skiing, diving)",
    "Trips to remote areas",
    "Cruises (highly recommended)"
  ],

  whatToCheck: [
    "Pre-existing medical condition coverage",
    "Cancel for any reason (CFAR) option",
    "Coverage limits for medical, baggage, etc.",
    "Deductibles",
    "Excluded activities or destinations",
    "COVID-19 coverage (check current policy)",
    "Read reviews of claim payment process"
  ],

  providers: [
    "World Nomads (popular with backpackers)",
    "Allianz Travel Insurance",
    "Travel Guard",
    "Travelex Insurance",
    "InsureMyTrip (comparison site)",
    "Squaremouth (comparison site)",
    "Credit card travel insurance (check coverage)"
  ],

  creditCardCoverage: {
    description: "Many premium credit cards include travel insurance",
    typical: [
      "Trip cancellation/interruption (if paid with card)",
      "Baggage delay/loss",
      "Car rental insurance",
      "Emergency assistance",
      "Usually secondary coverage (after other insurance)"
    ],
    limitations: [
      "May not cover pre-existing conditions",
      "Lower coverage limits",
      "Must pay for trip with that card",
      "Read fine print carefully"
    ]
  }
};

// Jet Lag Management
export const JET_LAG_TIPS: TravelTip[] = [
  {
    category: "Before Flight",
    tips: [
      "Gradually shift sleep schedule 2-3 days before departure",
      "Get good sleep leading up to trip",
      "Stay hydrated in days before flight",
      "Avoid alcohol and caffeine 24 hours before",
      "Exercise regularly before trip",
      "Book flights that arrive in evening (easier to sleep)"
    ]
  },
  {
    category: "During Flight",
    tips: [
      "Set watch to destination time zone immediately",
      "Sleep according to destination schedule",
      "Stay hydrated (drink water every hour)",
      "Avoid alcohol (dehydrates and affects sleep)",
      "Limit caffeine",
      "Walk around cabin every 1-2 hours",
      "Use eye mask and earplugs/noise-cancelling headphones",
      "Take melatonin 30 min before destination bedtime"
    ]
  },
  {
    category: "After Arrival",
    tips: [
      "Get sunlight exposure (helps reset circadian rhythm)",
      "Stay awake until local bedtime (no matter how tired)",
      "Exercise lightly (walk, stretch)",
      "Eat meals according to local time",
      "Avoid heavy meals before bed",
      "Stay hydrated",
      "Avoid napping (or limit to 20-30 min max)",
      "Take melatonin at local bedtime for 2-3 nights",
      "Be patient - takes about 1 day per time zone to adjust"
    ]
  },
  {
    category: "Direction Matters",
    tips: [
      "Eastward travel (to Europe) is harder - losing time",
      "Westward travel (to Asia from US) is easier - gaining time",
      "Arrive evening going east (sleep soon after arrival)",
      "Arrive morning going west (stay active all day)",
      "North-south travel has minimal jet lag"
    ]
  }
];

// General Travel Tips
export const GENERAL_TRAVEL_TIPS: TravelTip[] = [
  {
    category: "Money and Payments",
    tips: [
      "Notify banks of travel plans to avoid card blocks",
      "Carry 2-3 credit/debit cards (in case one doesn't work)",
      "Use credit cards with no foreign transaction fees",
      "Withdraw cash from ATMs for best exchange rates",
      "Avoid currency exchange at airports (poor rates)",
      "Keep some US dollars for emergencies (widely accepted)",
      "Use chip-and-PIN cards in Europe",
      "Split money between wallet and hidden location",
      "Make copies of card numbers (store separately)",
      "Consider travel money card for budget control"
    ]
  },
  {
    category: "Safety and Security",
    tips: [
      "Research destination safety before booking",
      "Register with embassy for long trips (STEP program for US)",
      "Keep copies of passport (physical and digital)",
      "Use hotel safe for valuables",
      "Be aware of common scams at destination",
      "Don't display expensive jewelry or electronics",
      "Use ATMs inside banks during day",
      "Avoid unlicensed taxis",
      "Keep room number private",
      "Trust your instincts - leave if uncomfortable"
    ]
  },
  {
    category: "Communication",
    tips: [
      "Download offline maps (Google Maps allows this)",
      "Get international phone plan or local SIM card",
      "Download translation app (Google Translate works offline)",
      "Learn basic phrases in local language",
      "Have hotel address in local language",
      "Save emergency numbers in phone",
      "WhatsApp for free international messaging (Wi-Fi)",
      "Screenshot important info (reservations, directions)",
      "Portable Wi-Fi hotspot for multiple devices",
      "Airport and hotel usually have free Wi-Fi"
    ]
  },
  {
    category: "Health",
    tips: [
      "Check vaccination requirements (yellow fever, etc.)",
      "Visit travel clinic 4-6 weeks before trip",
      "Bring prescription medications (extra supply)",
      "Pack basic first aid kit",
      "Get travel insurance with medical coverage",
      "Research hospitals near accommodation",
      "Drink bottled water in developing countries",
      "Wash hands frequently or use sanitizer",
      "Be cautious with street food (watch for crowds)",
      "Bring anti-diarrheal medication just in case"
    ]
  },
  {
    category: "Accommodation",
    tips: [
      "Read recent reviews (within 6 months)",
      "Check location on map (safety, convenience)",
      "Look for free cancellation when possible",
      "Take photos of room condition upon arrival",
      "Report problems immediately to front desk",
      "Ask about early check-in or late check-out",
      "Request room away from elevator/ice machine",
      "Higher floors are generally quieter and safer",
      "Use door locks and chain when in room",
      "Take hotel business card (for taxi drivers)"
    ]
  }
];

// Mistake to Avoid
export const COMMON_TRAVEL_MISTAKES = [
  "Not checking passport expiration (6-month rule)",
  "Forgetting to check visa requirements",
  "Overpacking (you can do laundry or buy items)",
  "Not making copies of important documents",
  "Exchanging money at airport (poor rates)",
  "Not notifying bank of travel plans",
  "Booking non-refundable tickets without flexibility",
  "Not getting travel insurance for expensive trips",
  "Arriving late to airport (2 hrs domestic, 3 hrs international)",
  "Not downloading offline maps and important info",
  "Wearing new shoes (break them in first)",
  "Overscheduling (leave time for spontaneity and rest)",
  "Not researching local customs and etiquette",
  "Relying solely on English (learn basic phrases)",
  "Not keeping emergency cash hidden",
  "Checking valuables in luggage",
  "Not staying hydrated on flights",
  "Booking separate tickets for connections (risky)",
  "Not reading cancellation policies carefully",
  "Ignoring travel advisories and warnings"
];

// Destination-Specific Tips
export const DESTINATION_TIPS = {
  Europe: [
    "Eurail pass for multiple countries",
    "Book museums and attractions in advance",
    "Visit shoulder season (May, September) for better weather and prices",
    "Pack layers - weather changes quickly",
    "Tipping not mandatory but appreciated (5-10%)",
    "Learn basic phrases in each language",
    "Be cautious of pickpockets in tourist areas",
    "Schengen visa allows 90 days in 180-day period"
  ],

  Asia: [
    "Bargaining common in markets (not stores)",
    "Remove shoes when entering homes and temples",
    "Dress modestly at religious sites",
    "Use right hand for eating and greeting (left considered unclean)",
    "Be cautious with street food (choose busy stalls)",
    "Drink bottled water only",
    "Vietnam and Thailand require visa or visa on arrival",
    "Respect for elders very important"
  ],

  LatinAmerica: [
    "Learn basic Spanish or Portuguese",
    "Use rideshare apps (Uber) for safety",
    "Avoid drinking tap water",
    "Yellow fever vaccination required for some countries",
    "Be cautious in certain areas (research safety)",
    "Bargaining common in markets",
    "Tipping 10% standard in restaurants",
    "Siesta time (2-5 PM) - many businesses close"
  ],

  Africa: [
    "Check vaccination requirements (yellow fever, malaria)",
    "Book safari tours in advance",
    "Respect wildlife - keep distance",
    "Drink bottled water only",
    "Be cautious with street food",
    "Visa on arrival available for many countries",
    "Bring USD for tips and small purchases",
    "Research safety for each region"
  ],

  MiddleEast: [
    "Dress modestly (cover shoulders and knees)",
    "Women may need to cover hair in some places",
    "Ramadan affects restaurant/business hours",
    "Alcohol restricted or prohibited in some countries",
    "Remove shoes in mosques and homes",
    "Right hand for eating and greeting",
    "Be respectful of local customs and religion",
    "Some countries have tourist-friendly policies (UAE, Jordan)"
  ]
};

export function getTipsByCategory(category: string): string[] {
  // Helper function to get tips by category
  const allTips = [
    ...PACKING_TIPS,
    ...AIRPORT_SECURITY_TIPS,
    ...JET_LAG_TIPS,
    ...GENERAL_TRAVEL_TIPS
  ];

  const categoryTips = allTips.find(
    t => t.category.toLowerCase() === category.toLowerCase()
  );

  return categoryTips?.tips || [];
}
