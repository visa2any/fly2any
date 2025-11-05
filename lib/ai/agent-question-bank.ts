/**
 * Agent Question Bank
 * Database of questions and responses for natural conversation flow
 */

import { TripType, BudgetLevel, ServiceType, CollectedInfo } from './agent-conversation-flow';

export const greetings = [
  "Hi there! 👋 I'm your personal travel agent. Are you planning a trip today?",
  "Hello! 😊 Welcome to Fly2Any! I'd love to help you find the perfect flight or hotel. What brings you here today?",
  "Hey! Great to see you! Are you ready to plan an amazing trip?",
  "Welcome! ✈️ I'm here to help you book your next adventure. What can I do for you?",
];

export const serviceTypeQuestions = [
  "Are you looking for a flight, hotel, or a complete package deal?",
  "What can I help you with today - flights, hotels, or both?",
  "Would you like to book a flight, reserve a hotel, or get a package deal?",
  "Let me know what you need: flight tickets, hotel booking, or a complete travel package?",
];

export const discoveryQuestions = {
  tripType: [
    "Are you planning a vacation, business trip, or visiting family?",
    "What's the occasion for your trip - leisure, work, or something else?",
    "Is this for fun, business, or a family visit?",
    "Tell me about your trip! Is it for vacation, work, or family?",
  ],
  destination: [
    "Where would you like to go?",
    "What's your dream destination?",
    "Any particular place you're thinking of visiting?",
    "Where are you headed?",
    "What destination did you have in mind?",
  ],
  origin: [
    "Where will you be flying from?",
    "What city are you departing from?",
    "Which airport is closest to you?",
    "Where's your starting point?",
  ],
  dates: [
    "When are you planning to travel?",
    "Do you have specific dates in mind?",
    "What dates work best for you?",
    "When would you like to depart?",
    "When are you thinking of going?",
  ],
  returnDate: [
    "And when would you like to return?",
    "What's your return date?",
    "How long are you planning to stay?",
    "When will you be coming back?",
  ],
  travelers: [
    "How many people will be traveling?",
    "Who's traveling with you?",
    "Is it just you, or will others be joining?",
    "How many passengers?",
  ],
  budget: [
    "What's your budget range - economy, premium, or luxury?",
    "Are you looking for budget-friendly options or premium comfort?",
    "What's your preferred price range?",
    "Would you prefer economy, business, or first class?",
  ],
};

export const followUpQuestions = {
  afterServiceType: {
    flight: [
      "Perfect! Let's find you a great flight. Where would you like to go?",
      "Excellent choice! What's your destination?",
      "Great! Where are you flying to?",
    ],
    hotel: [
      "Wonderful! I'll help you find the perfect hotel. What's your destination?",
      "Perfect! Where are you looking to stay?",
      "Great choice! Which city are you visiting?",
    ],
    package: [
      "Smart choice! Package deals can save you money. Where are you thinking of going?",
      "Excellent! Let's create a perfect package for you. What's your destination?",
      "Great! Packages are fantastic value. Where would you like to go?",
    ],
  },

  afterTripType: (tripType: TripType) => {
    const responses: Record<TripType, string[]> = {
      vacation: [
        "Exciting! A vacation sounds wonderful. Where would you like to go?",
        "Perfect! Time to relax and explore. What's your destination?",
        "Fantastic! Let's plan an amazing vacation. Where are you headed?",
      ],
      business: [
        "I understand. Let me find you the most convenient options. Where's your business trip taking you?",
        "Of course! I'll focus on efficiency and comfort. What's your destination?",
        "Got it! Business travel made easy. Where do you need to be?",
      ],
      family: [
        "How lovely! Family time is precious. Where would you like to take your family?",
        "Wonderful! Family trips create the best memories. What's your destination?",
        "That's great! Where are you planning this family adventure?",
      ],
      romantic: [
        "How romantic! I'll help you plan something special. Where would you like to go?",
        "Perfect! Let's create a memorable romantic getaway. What's your destination?",
        "Lovely! Where would you like to escape to together?",
      ],
      adventure: [
        "Amazing! An adventure awaits! Where's your spirit of adventure taking you?",
        "Exciting! Let's plan an epic adventure. What's your destination?",
        "Fantastic! Adventure travel is the best. Where are you headed?",
      ],
      solo: [
        "Great! Solo travel can be so enriching. Where would you like to explore?",
        "Perfect! Solo adventures are amazing. What's your destination?",
        "Wonderful! Where is your solo journey taking you?",
      ],
    };
    return responses[tripType] || ["Great! Where would you like to go?"];
  },

  afterDestination: (destination: string) => [
    `${destination} is an amazing choice! Where will you be flying from?`,
    `Perfect! ${destination} is beautiful. Which city are you departing from?`,
    `Great pick! ${destination} awaits. Where's your departure city?`,
    `Excellent! ${destination} it is. Where will you be leaving from?`,
  ],

  afterOrigin: (origin: string, destination: string) => [
    `Great! ${origin} to ${destination}. When would you like to depart?`,
    `Perfect! When are you planning to fly from ${origin}?`,
    `Got it! ${origin} to ${destination}. What dates work for you?`,
  ],

  afterDates: [
    "Perfect! How many people will be traveling?",
    "Great! And who's traveling with you?",
    "Got it! How many passengers?",
    "Excellent! Is it just you, or are others coming along?",
  ],

  afterTravelers: (count: number) => {
    if (count === 1) {
      return [
        "Just you - perfect! What's your preferred budget range?",
        "Solo traveler! What's your budget looking like?",
        "Got it! Are you looking for economy, premium, or luxury options?",
      ];
    } else {
      return [
        `${count} travelers - great! What's your budget range for the group?`,
        `Perfect! For ${count} people, what budget are you working with?`,
        `Got it! For your group of ${count}, are you looking for economy, premium, or luxury?`,
      ];
    }
  },

  afterBudget: [
    "Excellent! Let me search for the best options for you.",
    "Perfect! I'll find you the best deals in that range. One moment...",
    "Great! Searching for the perfect options now...",
    "Got it! Let me pull up the best choices for you...",
  ],
};

export const clarifyingQuestions = {
  vagueDestination: [
    "I'd love to help you find the perfect destination! Are you looking for beaches, cities, or mountains?",
    "What kind of experience are you looking for - relaxation, adventure, or culture?",
    "Do you prefer warm tropical destinations or cooler climates?",
    "Are you thinking domestic or international travel?",
  ],

  uncertainDates: [
    "No worries! Are you flexible with dates, or do you have a general timeframe in mind?",
    "Would you like to see a calendar of prices to help you choose the best dates?",
    "Do you have a specific month in mind, or are you open to suggestions?",
    "Are you looking to travel soon, or planning ahead?",
  ],

  uncertainBudget: [
    "That's okay! To give you the best options, would you prefer the most affordable choices or more comfortable options?",
    "Are you looking to save money, or is comfort more important?",
    "Would you like to see a range of options from budget to premium?",
  ],

  needsMoreContext: [
    "I want to make sure I find you the perfect options. Can you tell me a bit more about what you're looking for?",
    "To help you better, could you share more details about your ideal trip?",
    "Let me understand your needs better. What's most important to you for this trip?",
  ],

  multipleOptions: [
    "I see a few possibilities! Did you mean {option1} or {option2}?",
    "Just to clarify - are you thinking of {option1}, or were you referring to {option2}?",
    "Let me make sure I understand correctly. Is it {option1} or {option2}?",
  ],
};

export const proactiveQuestions = {
  whenUserIsStuck: [
    "Take your time! If you're not sure, I can suggest some popular destinations based on what you're looking for.",
    "No rush! Would you like me to recommend some options?",
    "I'm here to help! Would you like some suggestions to get started?",
  ],

  whenBudgetConcerns: [
    "I understand budget is important! Would you like to see the most affordable options first?",
    "Let's find you the best value! I can show you budget-friendly options that don't compromise on quality.",
    "Great news - I can find you amazing deals! Would you like to see what's available in your price range?",
  ],

  whenTooManyOptions: [
    "I found several great options! Would you like me to recommend the top 3 based on your preferences?",
    "There are quite a few choices! Let me highlight the best ones for you.",
    "I have some excellent results! Shall I show you my top recommendations?",
  ],

  whenNoResults: [
    "Hmm, I'm not finding exact matches for those specific dates. Would you like to see nearby dates with better prices?",
    "Let me help you find alternatives. Are you flexible with your travel dates?",
    "I want to get you the best deal. Can we try slightly different dates or a nearby airport?",
  ],

  upsellingOpportunities: [
    "For just $50 more, you could get a direct flight that saves 4 hours. Interested?",
    "I notice there's a premium option with extra legroom and priority boarding. Would you like to see it?",
    "Would you like to add travel insurance for peace of mind? It's only $35 for your whole trip.",
  ],
};

export const guidingQuestions = {
  presentingOptions: [
    "I found {count} great options for you! Let me walk you through the best ones.",
    "Here are {count} flights that match your needs. Let me highlight the key differences.",
    "I've got {count} excellent choices! Each has its own advantages - let me explain.",
  ],

  recommendingOption: (position: number, reason: string) => [
    `I'd recommend Option ${position} because ${reason}. What do you think?`,
    `My top pick is Option ${position} - ${reason}. Does that work for you?`,
    `Based on what you told me, Option ${position} seems perfect: ${reason}. Shall we go with that?`,
  ],

  comparingOptions: [
    "Let me compare these for you. Option 1 is fastest, but Option 2 is $100 cheaper. Which matters more to you?",
    "Here's the tradeoff: this one saves time, that one saves money. What's your priority?",
    "Both are great choices! This one has better times, that one is more affordable. Your preference?",
  ],

  confirmingChoice: [
    "Excellent choice! Shall I proceed with booking this option?",
    "Perfect! Would you like to continue to booking?",
    "Great decision! Ready to book this flight?",
    "That's a solid choice! Shall we move forward with the booking?",
  ],
};

export const bookingQuestions = {
  collectingPassengerInfo: [
    "Great! I'll need some passenger details to complete the booking. Let's start with the first traveler.",
    "Perfect! Let me collect the passenger information. What's the first traveler's full name?",
    "Excellent! To book this, I need the passenger names as they appear on ID. First passenger?",
  ],

  collectingContactInfo: [
    "And what's the best email address for booking confirmation?",
    "What email should I send the confirmation to?",
    "Where should I send your booking details?",
  ],

  collectingPayment: [
    "Now for payment. We accept all major credit cards. Ready to proceed?",
    "Last step! Let's process the payment securely.",
    "Almost done! Just need payment information to confirm your booking.",
  ],

  confirmingBooking: [
    "Perfect! Let me confirm all the details before we finalize...",
    "Great! Here's a summary of your booking. Please review and confirm.",
    "Almost there! Please verify these details are correct...",
  ],
};

export const reassuranceStatements = [
  "Don't worry, I'm here to help you every step of the way!",
  "Take your time - there's no rush. I'll help you find the perfect option.",
  "No problem at all! Let's figure this out together.",
  "That's totally fine! I'm here to make this easy for you.",
];

export const urgencyStatements = [
  "Just so you know, prices for these dates are currently {trend} - booking soon could save you money!",
  "I'm seeing {count} other people looking at flights to {destination} right now - these deals may not last long.",
  "Great timing! There are only {count} seats left at this price.",
  "This is a popular route - I'd recommend booking soon to secure this rate.",
];

export const valueStatements = [
  "This option gives you the best value - great price AND convenient times!",
  "I love this option for you - it's {amount} cheaper than average and has excellent reviews!",
  "This is actually {percent}% below the usual price for this route - a real deal!",
  "For your dates, this is the sweet spot of price and convenience.",
];

/**
 * Get a random question from a category
 */
export function getRandomQuestion(questions: string[]): string {
  return questions[Math.floor(Math.random() * questions.length)];
}

/**
 * Get a personalized greeting based on time of day
 */
export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning! ☀️ Ready to plan an amazing trip?";
  } else if (hour < 17) {
    return "Good afternoon! 👋 Let's find you the perfect flight or hotel!";
  } else {
    return "Good evening! 🌙 Planning your next adventure?";
  }
}

/**
 * Get appropriate follow-up based on what was just collected
 */
export function getFollowUpFor(
  fieldName: string,
  collectedInfo: CollectedInfo
): string {
  switch (fieldName) {
    case 'serviceType':
      if (collectedInfo.serviceType && collectedInfo.serviceType !== 'undecided') {
        return getRandomQuestion(
          followUpQuestions.afterServiceType[collectedInfo.serviceType]
        );
      }
      break;

    case 'tripType':
      if (collectedInfo.tripType) {
        return getRandomQuestion(followUpQuestions.afterTripType(collectedInfo.tripType));
      }
      break;

    case 'destination':
      if (collectedInfo.destination) {
        return getRandomQuestion(followUpQuestions.afterDestination(collectedInfo.destination));
      }
      break;

    case 'origin':
      if (collectedInfo.origin && collectedInfo.destination) {
        return getRandomQuestion(
          followUpQuestions.afterOrigin(collectedInfo.origin, collectedInfo.destination)
        );
      }
      break;

    case 'dates':
      return getRandomQuestion(followUpQuestions.afterDates);

    case 'travelers':
      if (collectedInfo.travelers?.adults) {
        return getRandomQuestion(
          followUpQuestions.afterTravelers(collectedInfo.travelers.adults)
        );
      }
      break;

    case 'budget':
      return getRandomQuestion(followUpQuestions.afterBudget);
  }

  return "Great! What else can you tell me about your trip?";
}

/**
 * Get a clarifying question when user input is vague
 */
export function getClarifyingQuestion(context: string): string {
  switch (context) {
    case 'destination':
      return getRandomQuestion(clarifyingQuestions.vagueDestination);
    case 'dates':
      return getRandomQuestion(clarifyingQuestions.uncertainDates);
    case 'budget':
      return getRandomQuestion(clarifyingQuestions.uncertainBudget);
    default:
      return getRandomQuestion(clarifyingQuestions.needsMoreContext);
  }
}

/**
 * Get a proactive suggestion based on context
 */
export function getProactiveSuggestion(context: string): string {
  switch (context) {
    case 'stuck':
      return getRandomQuestion(proactiveQuestions.whenUserIsStuck);
    case 'budget_concerns':
      return getRandomQuestion(proactiveQuestions.whenBudgetConcerns);
    case 'too_many_options':
      return getRandomQuestion(proactiveQuestions.whenTooManyOptions);
    case 'no_results':
      return getRandomQuestion(proactiveQuestions.whenNoResults);
    default:
      return getRandomQuestion(reassuranceStatements);
  }
}
