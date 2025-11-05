/**
 * Hotel Knowledge Base
 * Comprehensive information about hotels, policies, and amenities
 */

export interface HotelPolicy {
  type: string;
  description: string;
  details: string[];
  exceptions?: string[];
}

export interface HotelChain {
  name: string;
  brands: string[];
  loyaltyProgram: string;
  benefits: string[];
  elite_tiers?: string[];
}

export interface Amenity {
  name: string;
  description: string;
  common_in: string[];
  cost?: string;
}

// Check-in/Check-out Policies
export const CHECKIN_POLICIES: HotelPolicy[] = [
  {
    type: "Standard Check-in Time",
    description: "Most hotels have check-in between 3:00 PM - 4:00 PM",
    details: [
      "Standard time: 3:00 PM or 4:00 PM",
      "Early check-in may be available for a fee or if you're a loyalty member",
      "Hotels may hold your luggage if you arrive early",
      "Call ahead if arriving after midnight"
    ],
    exceptions: [
      "Resort properties may have later check-in (4:00 PM)",
      "Budget hotels might allow earlier check-in (2:00 PM)"
    ]
  },
  {
    type: "Standard Check-out Time",
    description: "Most hotels require check-out by 11:00 AM - 12:00 PM",
    details: [
      "Standard time: 11:00 AM or 12:00 PM",
      "Late check-out may be available for fee or loyalty members",
      "Express check-out available via TV/app at many hotels",
      "Late check-out fees: $25-$75 or 50% of room rate"
    ],
    exceptions: [
      "Luxury hotels may offer 1:00 PM or 2:00 PM check-out",
      "Extended stay hotels may have later check-out times"
    ]
  },
  {
    type: "Early Check-in",
    description: "Options for checking in before standard time",
    details: [
      "Request at booking or call ahead",
      "Often free for elite loyalty members",
      "Guaranteed early check-in: $25-$100 fee",
      "Subject to availability - not always guaranteed",
      "More likely on weekdays than weekends"
    ]
  },
  {
    type: "Late Check-out",
    description: "Staying past standard check-out time",
    details: [
      "Request at check-in or through app",
      "Often complimentary for top-tier loyalty members",
      "Paid late check-out: $25-$75 or half-day rate",
      "Usually available until 2:00 PM or 4:00 PM",
      "Weekend availability more limited"
    ]
  }
];

// Cancellation Policies
export const HOTEL_CANCELLATION_POLICIES: HotelPolicy[] = [
  {
    type: "Standard Cancellation",
    description: "Free cancellation up to 24-48 hours before check-in",
    details: [
      "Most hotels: 24 hours before check-in",
      "Resort/peak season: 48-72 hours before",
      "Must cancel by deadline to avoid charges",
      "Cancellation via booking channel (website, phone, OTA)"
    ]
  },
  {
    type: "Non-Refundable Rates",
    description: "Discounted rates that cannot be cancelled",
    details: [
      "Typically 10-30% cheaper than flexible rates",
      "No refund if cancelled",
      "May still allow date changes with fee",
      "Common during peak seasons and events"
    ],
    exceptions: [
      "Some hotels offer partial refund (50%) if cancelled early",
      "Travel insurance may cover non-refundable bookings"
    ]
  },
  {
    type: "Peak Season/Event Cancellation",
    description: "Stricter policies during high-demand periods",
    details: [
      "May require 7-14 days notice",
      "Full payment often required at booking",
      "Penalty fees: 1-2 nights room rate",
      "Common during holidays, conferences, sporting events"
    ]
  },
  {
    type: "Group Bookings",
    description: "Special policies for 10+ rooms",
    details: [
      "Typically 30-60 days cancellation notice required",
      "Attrition clauses (minimum rooms must be used)",
      "Deposit may be non-refundable",
      "Individual room cancellations may have fees"
    ]
  }
];

// Hotel Star Rating System
export const STAR_RATING_SYSTEM = {
  "1-Star": {
    description: "Basic, budget accommodations",
    features: [
      "Clean, simple rooms",
      "Basic furnishings",
      "Shared or private bathroom",
      "Minimal amenities",
      "No frills service"
    ],
    examples: ["Hostels", "Motel 6", "Budget roadside inns"]
  },

  "2-Star": {
    description: "Economy hotels with essential amenities",
    features: [
      "Comfortable rooms",
      "Private bathroom",
      "TV and phone",
      "Basic continental breakfast",
      "Limited services"
    ],
    examples: ["Days Inn", "Super 8", "Red Roof Inn"]
  },

  "3-Star": {
    description: "Mid-range hotels with good amenities",
    features: [
      "Well-appointed rooms",
      "Quality furnishings",
      "Restaurant/bar on-site",
      "Fitness center",
      "Business services",
      "Room service (limited hours)"
    ],
    examples: ["Holiday Inn", "Best Western", "Courtyard by Marriott"]
  },

  "4-Star": {
    description: "Upscale hotels with enhanced services",
    features: [
      "Spacious, stylish rooms",
      "Premium bedding and amenities",
      "Multiple dining options",
      "Full-service spa/fitness",
      "Concierge services",
      "24-hour room service",
      "Valet parking",
      "High-end toiletries"
    ],
    examples: ["Marriott", "Hilton", "Westin", "Hyatt Regency"]
  },

  "5-Star": {
    description: "Luxury hotels with exceptional service",
    features: [
      "Opulent rooms and suites",
      "Personalized service",
      "Gourmet restaurants",
      "Luxury spa",
      "Butler service",
      "Premium amenities",
      "Exclusive experiences",
      "Impeccable attention to detail"
    ],
    examples: ["Ritz-Carlton", "Four Seasons", "St. Regis", "Mandarin Oriental"]
  }
};

// Common Hotel Amenities
export const HOTEL_AMENITIES: Amenity[] = [
  {
    name: "Wi-Fi",
    description: "Internet connectivity in rooms and public areas",
    common_in: ["All star levels"],
    cost: "Free in most hotels (3-star+), may have fee in luxury hotels for premium speeds"
  },
  {
    name: "Breakfast",
    description: "Morning meal service",
    common_in: ["2-star and above"],
    cost: "Often included in 2-3 star; may be extra in upscale hotels ($15-$40)"
  },
  {
    name: "Parking",
    description: "On-site vehicle parking",
    common_in: ["All levels"],
    cost: "Free in suburban/budget hotels; $20-$75/day in cities; valet $40-$100"
  },
  {
    name: "Fitness Center",
    description: "Gym with exercise equipment",
    common_in: ["3-star and above"],
    cost: "Usually complimentary"
  },
  {
    name: "Pool",
    description: "Swimming pool (indoor or outdoor)",
    common_in: ["2-star and above, resort properties"],
    cost: "Complimentary"
  },
  {
    name: "Spa",
    description: "Full-service spa with treatments",
    common_in: ["4-5 star, resort properties"],
    cost: "Treatments priced separately ($100-$500+)"
  },
  {
    name: "Business Center",
    description: "Computers, printers, meeting rooms",
    common_in: ["3-star and above"],
    cost: "Usually complimentary; meeting rooms may have fee"
  },
  {
    name: "Concierge",
    description: "Personalized assistance and recommendations",
    common_in: ["4-5 star"],
    cost: "Complimentary (tipping customary)"
  },
  {
    name: "Room Service",
    description: "In-room dining",
    common_in: ["3-star and above"],
    cost: "Menu prices + 18-25% service charge/delivery fee"
  },
  {
    name: "Minibar",
    description: "In-room refrigerator with snacks and drinks",
    common_in: ["3-star and above"],
    cost: "Items priced individually (premium pricing)"
  },
  {
    name: "Airport Shuttle",
    description: "Transportation to/from airport",
    common_in: ["Airport hotels, 2-3 star"],
    cost: "Often complimentary; some charge $10-$25"
  },
  {
    name: "Pet-Friendly",
    description: "Allows pets in rooms",
    common_in: ["Varies by property"],
    cost: "Typically $50-$150 per stay or per night"
  }
];

// Major Hotel Chains and Loyalty Programs
export const HOTEL_CHAINS: HotelChain[] = [
  {
    name: "Marriott International",
    brands: [
      "Ritz-Carlton",
      "St. Regis",
      "JW Marriott",
      "Luxury Collection",
      "W Hotels",
      "Marriott Hotels",
      "Sheraton",
      "Westin",
      "Renaissance",
      "Courtyard",
      "Residence Inn",
      "Fairfield Inn",
      "SpringHill Suites",
      "Aloft",
      "Moxy"
    ],
    loyaltyProgram: "Marriott Bonvoy",
    benefits: [
      "Free Wi-Fi for members",
      "Mobile check-in and key",
      "Free night awards",
      "Room upgrades (elite members)",
      "Late checkout",
      "Bonus points earning"
    ],
    elite_tiers: ["Silver (10 nights)", "Gold (25 nights)", "Platinum (50 nights)", "Titanium (75 nights)", "Ambassador (100 nights + $20k spend)"]
  },
  {
    name: "Hilton Worldwide",
    brands: [
      "Waldorf Astoria",
      "Conrad",
      "LXR",
      "Hilton Hotels",
      "Curio Collection",
      "DoubleTree",
      "Embassy Suites",
      "Hilton Garden Inn",
      "Hampton Inn",
      "Homewood Suites",
      "Home2 Suites",
      "Tru by Hilton"
    ],
    loyaltyProgram: "Hilton Honors",
    benefits: [
      "Free Wi-Fi for members",
      "Digital key",
      "Points and miles",
      "Complimentary breakfast (elite)",
      "Room upgrades",
      "Fifth night free on award stays"
    ],
    elite_tiers: ["Silver (10 nights)", "Gold (40 nights)", "Diamond (60 nights)"]
  },
  {
    name: "Hyatt Hotels",
    brands: [
      "Park Hyatt",
      "Miraval",
      "Grand Hyatt",
      "Hyatt Regency",
      "Hyatt",
      "Hyatt Place",
      "Hyatt House",
      "Caption by Hyatt",
      "Thompson Hotels"
    ],
    loyaltyProgram: "World of Hyatt",
    benefits: [
      "Free Wi-Fi",
      "Mobile check-in",
      "Confirmed suite upgrades (Globalist)",
      "Free breakfast (elite)",
      "Late checkout",
      "Milestone rewards"
    ],
    elite_tiers: ["Discoverist (10 nights)", "Explorist (30 nights)", "Globalist (60 nights)"]
  },
  {
    name: "IHG Hotels & Resorts",
    brands: [
      "InterContinental",
      "Kimpton",
      "Regent",
      "Six Senses",
      "Crowne Plaza",
      "Hotel Indigo",
      "Holiday Inn",
      "Holiday Inn Express",
      "Candlewood Suites",
      "Staybridge Suites"
    ],
    loyaltyProgram: "IHG One Rewards",
    benefits: [
      "Points never expire",
      "Mobile check-in",
      "Free Wi-Fi (elite)",
      "Room upgrades",
      "Late checkout",
      "Point pooling with family"
    ],
    elite_tiers: ["Silver (10 nights)", "Gold (40 nights)", "Platinum (70 nights)", "Diamond (120 nights)"]
  },
  {
    name: "Accor",
    brands: [
      "Raffles",
      "Fairmont",
      "Sofitel",
      "Pullman",
      "Swissôtel",
      "Novotel",
      "Mercure",
      "ibis",
      "ibis Styles",
      "ibis budget"
    ],
    loyaltyProgram: "ALL - Accor Live Limitless",
    benefits: [
      "Points and experiences",
      "Member rates",
      "Room upgrades",
      "Late checkout",
      "Welcome drinks",
      "Lifestyle rewards (beyond hotels)"
    ],
    elite_tiers: ["Classic", "Silver", "Gold", "Platinum", "Diamond"]
  }
];

// Hotel Booking Best Practices
export const HOTEL_BEST_PRACTICES = {
  booking: [
    "Book directly with hotel for best cancellation flexibility",
    "Compare prices: hotel website, OTAs (Booking.com, Expedia), and loyalty programs",
    "Check for AAA, AARP, military, or corporate discounts",
    "Book refundable rates unless you're 100% certain of dates",
    "Read reviews on multiple sites (TripAdvisor, Google, hotel site)",
    "Look for package deals (flight + hotel) for savings",
    "Book early for popular destinations (3-6 months ahead)",
    "Last-minute deals can work for flexible travel"
  ],

  checkin: [
    "Join loyalty program (free) before booking for benefits",
    "Request specific room (high floor, away from elevator, view) at booking",
    "Check in via app for potential room selection",
    "Ask about complimentary upgrades at check-in (politely)",
    "Confirm cancellation policy and any resort fees",
    "Take photos of room condition upon arrival",
    "Report any issues immediately"
  ],

  savings: [
    "Stay Sunday-Thursday for business hotels (cheaper)",
    "Stay Friday-Saturday for business district hotels",
    "Avoid peak seasons and major events",
    "Book longer stays for discounts (weekly rates)",
    "Use hotel credit cards for free nights and status",
    "Combine points + cash for better value",
    "Check for package deals and add-ons"
  ],

  fees: [
    "Watch for resort fees ($25-$50/night) - often mandatory",
    "Parking fees in cities can be $40-$75/day",
    "Early departure fees if you check out early",
    "Extra guest fees (more than 2 adults)",
    "Pet fees ($50-$150)",
    "Crib/rollaway bed fees",
    "Minibar and room service (high markup)"
  ]
};

// Common Hotel Terms
export const HOTEL_TERMS = {
  "Resort Fee": "Mandatory daily fee ($25-$50) covering amenities like Wi-Fi, pool, fitness center. Cannot be avoided even if you don't use amenities.",
  "Guarantee": "Hold a room with credit card. No-show results in one-night charge.",
  "No-Show Fee": "Charge (usually one night) if you don't check in or cancel.",
  "Blackout Dates": "Dates when rewards/points cannot be used (holidays, events).",
  "Run of House": "Hotel assigns any available room type.",
  "Continental Breakfast": "Light breakfast (pastries, cereal, juice, coffee).",
  "Full Breakfast": "Hot breakfast with eggs, meat, pancakes, etc.",
  "Turndown Service": "Evening service where bed is prepared and room tidied.",
  "Connecting Rooms": "Separate rooms with door connecting them.",
  "Adjoining Rooms": "Side-by-side rooms without connecting door.",
  "Suite": "Room with separate living area from bedroom.",
  "Junior Suite": "Larger room with sitting area (not fully separate).",
  "Kitchenette": "Small kitchen area with mini-fridge, microwave, sink.",
  "Full Kitchen": "Complete kitchen with stove, oven, full refrigerator, dishwasher.",
  "Double": "Room with two double/full beds.",
  "King": "Room with one king bed.",
  "Queen": "Room with one or two queen beds.",
  "Rollaway/Cot": "Extra temporary bed ($25-$50/night).",
  "Sofa Bed": "Couch that converts to bed.",
  "Upgrade": "Better room (higher floor, better view, suite) at no or reduced cost.",
  "Comp": "Complimentary (free) room or amenity."
};

export function getHotelChain(hotelName: string): HotelChain | null {
  for (const chain of HOTEL_CHAINS) {
    if (chain.brands.some(brand =>
      hotelName.toLowerCase().includes(brand.toLowerCase())
    )) {
      return chain;
    }
  }
  return null;
}

export function getAmenity(amenityName: string): Amenity | null {
  return HOTEL_AMENITIES.find(a =>
    a.name.toLowerCase() === amenityName.toLowerCase()
  ) || null;
}
