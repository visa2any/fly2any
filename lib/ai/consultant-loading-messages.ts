/**
 * Consultant-Specific Loading Messages
 * Each consultant has personality-driven messages for different stages
 */

export interface LoadingMessage {
  stage: string;
  messages: string[];
  encouragement?: string[];
}

export interface ConsultantLoadingMessages {
  consultantId: string;
  name: string;
  emoji: string;
  messages: {
    analyzing: string[];
    searching: string[];
    processing: string[];
    comparing: string[];
    finalizing: string[];
    longWait?: string[]; // If taking > 10 seconds
    veryLongWait?: string[]; // If taking > 20 seconds
  };
}

export const consultantLoadingMessages: Record<string, ConsultantLoadingMessages> = {
  'sarah-flight': {
    consultantId: 'sarah-flight',
    name: 'Sarah Chen',
    emoji: '✈️',
    messages: {
      analyzing: [
        "Analyzing your travel preferences...",
        "Understanding your flight requirements...",
        "Checking your dates and preferences...",
      ],
      searching: [
        "Searching through thousands of flight options...",
        "Scanning 500+ airlines for the best routes...",
        "Finding the perfect flight combinations...",
        "Checking real-time availability...",
      ],
      processing: [
        "Processing flight data...",
        "Calculating optimal connections...",
        "Evaluating route efficiency...",
      ],
      comparing: [
        "Comparing prices across airlines...",
        "Finding the best value for you...",
        "Checking for better deals...",
        "Ranking options by value and comfort...",
      ],
      finalizing: [
        "Finalizing your best flight options...",
        "Preparing your personalized results...",
        "Almost ready to show you amazing deals...",
      ],
      longWait: [
        "Still searching... I'm being thorough to find you the absolute best options!",
        "Thank you for your patience! I'm comparing thousands of combinations to save you money.",
        "Almost there! I'm making sure I haven't missed any great deals for you.",
      ],
      veryLongWait: [
        "I appreciate your patience! Complex searches take a moment, but it's worth it.",
        "Still working hard! Sometimes the best deals take a little longer to find.",
      ],
    },
  },

  'marcus-hotels': {
    consultantId: 'marcus-hotels',
    name: 'Marcus Rodriguez',
    emoji: '🏨',
    messages: {
      analyzing: [
        "Reviewing your hotel preferences...",
        "Understanding your accommodation needs...",
        "Checking your location and dates...",
      ],
      searching: [
        "Searching thousands of hotels...",
        "Exploring properties in your area...",
        "Finding the perfect stays for you...",
        "Checking real-time availability...",
      ],
      processing: [
        "Processing hotel data...",
        "Evaluating amenities and locations...",
        "Calculating distances to attractions...",
      ],
      comparing: [
        "Comparing hotel prices and reviews...",
        "Finding the best value properties...",
        "Checking for exclusive deals...",
        "Ranking by quality and price...",
      ],
      finalizing: [
        "Preparing your top hotel recommendations...",
        "Finalizing your perfect stays...",
        "Almost ready with amazing options...",
      ],
      longWait: [
        "Being thorough to find you the perfect hotel with the best amenities!",
        "Taking my time to ensure you get the best value and comfort.",
      ],
      veryLongWait: [
        "Quality takes time! I'm ensuring every option meets your standards.",
      ],
    },
  },

  'lisa-service': {
    consultantId: 'lisa-service',
    name: 'Lisa Martinez',
    emoji: '🌟',
    messages: {
      analyzing: [
        "Understanding your request...",
        "Reviewing your booking details...",
        "Looking into this for you...",
      ],
      searching: [
        "Searching our system...",
        "Finding your reservation...",
        "Checking all records...",
        "Looking up your booking...",
      ],
      processing: [
        "Processing your request...",
        "Gathering information...",
        "Verifying details...",
      ],
      comparing: [
        "Reviewing available options...",
        "Checking what we can do for you...",
        "Exploring solutions...",
      ],
      finalizing: [
        "Preparing my response...",
        "Getting everything ready for you...",
        "Almost there!",
      ],
      longWait: [
        "Thank you for your patience! I want to make sure I have all the details right.",
        "I'm being extra careful to help you properly.",
      ],
      veryLongWait: [
        "I really appreciate you waiting! Your satisfaction is worth the extra moment.",
      ],
    },
  },

  'emily-legal': {
    consultantId: 'emily-legal',
    name: 'Emily Watson',
    emoji: '⚖️',
    messages: {
      analyzing: [
        "Reviewing your legal inquiry...",
        "Analyzing travel regulations...",
        "Checking applicable policies...",
      ],
      searching: [
        "Researching relevant policies...",
        "Checking terms and conditions...",
        "Finding applicable regulations...",
      ],
      processing: [
        "Processing legal requirements...",
        "Reviewing compliance details...",
        "Verifying policy information...",
      ],
      comparing: [
        "Comparing policy options...",
        "Evaluating coverage levels...",
        "Reviewing terms carefully...",
      ],
      finalizing: [
        "Preparing legal summary...",
        "Finalizing policy recommendations...",
        "Getting your answer ready...",
      ],
      longWait: [
        "Legal matters require precision - I'm being thorough to give you accurate information.",
      ],
      veryLongWait: [
        "Accuracy is paramount in legal matters. Thank you for your patience!",
      ],
    },
  },

  'sophia-visa': {
    consultantId: 'sophia-visa',
    name: 'Sophia Patel',
    emoji: '📋',
    messages: {
      analyzing: [
        "Checking your destination requirements...",
        "Reviewing visa regulations...",
        "Understanding your travel documentation needs...",
      ],
      searching: [
        "Searching visa requirements database...",
        "Checking latest entry regulations...",
        "Finding document requirements...",
      ],
      processing: [
        "Processing immigration requirements...",
        "Verifying document validity periods...",
        "Checking multiple sources for accuracy...",
      ],
      comparing: [
        "Comparing visa options...",
        "Evaluating processing times...",
        "Checking alternative entry methods...",
      ],
      finalizing: [
        "Preparing your visa requirements checklist...",
        "Finalizing documentation guide...",
        "Almost ready with complete information...",
      ],
      longWait: [
        "Visa requirements change frequently - I'm verifying the latest information for you.",
        "Being extra thorough with immigration requirements to ensure accuracy.",
      ],
      veryLongWait: [
        "Travel documentation is complex - I'm ensuring you have all the right information!",
      ],
    },
  },

  'amanda-loyalty': {
    consultantId: 'amanda-loyalty',
    name: 'Amanda Foster',
    emoji: '🎁',
    messages: {
      analyzing: [
        "Checking your loyalty account...",
        "Reviewing your points balance...",
        "Understanding your rewards inquiry...",
      ],
      searching: [
        "Searching loyalty programs...",
        "Finding best redemption options...",
        "Checking point values...",
      ],
      processing: [
        "Processing rewards data...",
        "Calculating point values...",
        "Evaluating redemption options...",
      ],
      comparing: [
        "Comparing redemption values...",
        "Finding best use of points...",
        "Checking for bonus opportunities...",
      ],
      finalizing: [
        "Preparing rewards recommendations...",
        "Finalizing point strategies...",
        "Getting your personalized loyalty plan...",
      ],
      longWait: [
        "Making sure I find you the absolute best value for your points!",
      ],
      veryLongWait: [
        "Maximizing your rewards takes careful analysis - you'll love the results!",
      ],
    },
  },

  'nina-special': {
    consultantId: 'nina-special',
    name: 'Nina Rodriguez',
    emoji: '♿',
    messages: {
      analyzing: [
        "Understanding your accessibility needs...",
        "Reviewing special assistance requirements...",
        "Checking your specific needs...",
      ],
      searching: [
        "Finding appropriate accommodations...",
        "Checking accessibility features...",
        "Searching for suitable options...",
      ],
      processing: [
        "Processing special requests...",
        "Verifying accessibility information...",
        "Coordinating special services...",
      ],
      comparing: [
        "Comparing accessibility options...",
        "Evaluating service levels...",
        "Checking facility standards...",
      ],
      finalizing: [
        "Preparing accessibility plan...",
        "Finalizing special arrangements...",
        "Getting everything set up for you...",
      ],
      longWait: [
        "I'm being extra careful to ensure all your needs are properly accommodated.",
        "Your comfort and safety are worth the extra time to get this right!",
      ],
      veryLongWait: [
        "Special assistance requires detailed coordination - I'm making sure everything is perfect for you.",
      ],
    },
  },

  'james-cars': {
    consultantId: 'james-cars',
    name: 'James Wilson',
    emoji: '🚗',
    messages: {
      analyzing: [
        "Checking your car rental needs...",
        "Understanding your vehicle preferences...",
        "Reviewing your rental requirements...",
      ],
      searching: [
        "Searching rental car options...",
        "Finding available vehicles...",
        "Checking local car rental agencies...",
      ],
      processing: [
        "Processing vehicle availability...",
        "Checking rental rates...",
        "Verifying car features...",
      ],
      comparing: [
        "Comparing rental prices...",
        "Finding best vehicle value...",
        "Checking for upgrades and deals...",
      ],
      finalizing: [
        "Preparing car rental options...",
        "Finalizing vehicle recommendations...",
        "Getting your perfect rental ready...",
      ],
      longWait: [
        "Making sure I find you the right vehicle at the best price!",
      ],
      veryLongWait: [
        "Finding the perfect car takes a moment - but it's worth it!",
      ],
    },
  },

  'captain-crisis': {
    consultantId: 'captain-crisis',
    name: 'Captain Mike Thompson',
    emoji: '🚨',
    messages: {
      analyzing: [
        "Assessing your situation...",
        "Understanding the urgency...",
        "Prioritizing your emergency...",
      ],
      searching: [
        "Finding immediate solutions...",
        "Checking emergency options...",
        "Searching for fastest resolutions...",
      ],
      processing: [
        "Processing emergency request...",
        "Coordinating urgent assistance...",
        "Activating emergency protocols...",
      ],
      comparing: [
        "Evaluating emergency options...",
        "Finding quickest resolution...",
        "Checking all available solutions...",
      ],
      finalizing: [
        "Preparing emergency plan...",
        "Finalizing urgent assistance...",
        "Getting immediate help ready...",
      ],
      longWait: [
        "I understand this is urgent - I'm working as fast as possible!",
      ],
      veryLongWait: [
        "Emergency situations require careful coordination - help is on the way!",
      ],
    },
  },
};

/**
 * Get random message for a consultant and stage
 */
export function getLoadingMessage(
  consultantId: string,
  stage: keyof ConsultantLoadingMessages['messages'],
  elapsedTime?: number
): string {
  const consultant = consultantLoadingMessages[consultantId];
  if (!consultant) {
    return "Working on your request...";
  }

  // Check for long wait messages
  if (elapsedTime && elapsedTime > 20 && consultant.messages.veryLongWait) {
    const messages = consultant.messages.veryLongWait;
    return messages[Math.floor(Math.random() * messages.length)];
  }

  if (elapsedTime && elapsedTime > 10 && consultant.messages.longWait) {
    const messages = consultant.messages.longWait;
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Get stage-specific message
  const messages = consultant.messages[stage];
  if (!messages || messages.length === 0) {
    return "Processing...";
  }

  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get typical stages for a consultant
 */
export function getTypicalStages(consultantId: string) {
  // Common stages for most consultants
  const commonStages = [
    { id: 'analyzing', label: 'Analyzing your request' },
    { id: 'searching', label: 'Searching options' },
    { id: 'comparing', label: 'Comparing results' },
    { id: 'finalizing', label: 'Preparing recommendations' },
  ];

  // Customize for specific consultants
  if (consultantId === 'sarah-flight') {
    return [
      { id: 'analyzing', label: 'Analyzing travel preferences' },
      { id: 'searching', label: 'Searching 500+ airlines' },
      { id: 'processing', label: 'Calculating optimal routes' },
      { id: 'comparing', label: 'Comparing prices' },
      { id: 'finalizing', label: 'Ranking best options' },
    ];
  }

  if (consultantId === 'marcus-hotels') {
    return [
      { id: 'analyzing', label: 'Understanding accommodation needs' },
      { id: 'searching', label: 'Exploring hotels' },
      { id: 'comparing', label: 'Comparing value & amenities' },
      { id: 'finalizing', label: 'Selecting top recommendations' },
    ];
  }

  if (consultantId === 'captain-crisis') {
    return [
      { id: 'analyzing', label: 'Assessing situation' },
      { id: 'processing', label: 'Activating emergency protocols' },
      { id: 'finalizing', label: 'Preparing immediate assistance' },
    ];
  }

  return commonStages;
}

/**
 * Estimate processing time based on query type
 */
export function estimateProcessingTime(queryType: string, consultantId: string): number {
  const timeEstimates: Record<string, number> = {
    // Flight searches
    'flight-search': 8,
    'flight-multi-city': 12,
    'flight-flexible-dates': 15,

    // Hotel searches
    'hotel-search': 6,
    'hotel-with-amenities': 8,

    // General queries
    'booking-status': 3,
    'question-answer': 2,
    'recommendation': 5,
    'emergency': 4,

    // Complex operations
    'loyalty-calculation': 6,
    'visa-requirements': 7,
    'special-assistance': 5,

    // Default
    'default': 5,
  };

  return timeEstimates[queryType] || timeEstimates['default'];
}
