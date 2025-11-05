/**
 * AI Agent Action Messages
 *
 * Natural action announcements for each consultant personality.
 * Each consultant announces actions in their unique style.
 */

import { AgentActionType } from './agent-actions';

export interface ActionMessageSet {
  start: string[];
  progress: string[];
  success: string[];
  failure: string[];
}

export type ConsultantActionMessages = {
  [key in AgentActionType]?: ActionMessageSet;
};

/**
 * Action messages for Lisa - Service Agent
 * Warm, caring, uses endearments
 */
export const lisaServiceMessages: ConsultantActionMessages = {
  'search-flights': {
    start: [
      "Let me search for the best flights for you, sweetie! ✈️",
      "I'll find you the perfect flight options right away, hon! 💕",
      "Searching for your ideal flights now, dear! ✨",
      "Let me look for the best deals for you! 🔍",
    ],
    progress: [
      "Still searching for the best deals, sweetie... 🔍",
      "Comparing prices across airlines for you, hon...",
      "Almost there! Finding the perfect options... ✨",
      "Checking all the best routes, dear...",
    ],
    success: [
      "Perfect! I found some amazing options for you! 🎉",
      "Great news, sweetie! I found {count} excellent flights! ✨",
      "Wonderful! Here are your best flight options, hon! 💕",
      "Success! I found some fantastic deals for you! 🌟",
    ],
    failure: [
      "Oh no, sweetie, I'm having trouble finding flights right now. Let me try a different approach...",
      "I'm so sorry, hon! Let me search again with different options...",
      "Having a little difficulty, dear. Give me just a moment to try again... 💕",
    ],
  },
  'search-hotels': {
    start: [
      "Let me find the perfect hotel for you, dear! 🏨",
      "I'll search for the best hotels right away, sweetie! ✨",
      "Looking for amazing hotel options for you, hon! 💕",
    ],
    progress: [
      "Checking hotel availability, sweetie... 🏨",
      "Comparing prices and amenities for you...",
      "Finding the perfect place to stay...",
    ],
    success: [
      "Found some wonderful hotels for you, dear! 🏨",
      "Great news! I found {count} amazing hotels! ✨",
      "Perfect! Here are your best hotel options, hon! 💕",
    ],
    failure: [
      "Oh dear, having trouble with hotels. Let me try again for you, sweetie...",
    ],
  },
  'add-to-cart': {
    start: [
      "I'll add this to your cart for you, dear! 🛒",
      "Adding this to your cart right now, sweetie! 💕",
      "Let me save this for you, hon! ✨",
    ],
    progress: [],
    success: [
      "Done! I've added it to your cart! You can review it anytime, dear. 💕",
      "Perfect! It's in your cart now, sweetie! 🛒",
      "Added successfully, hon! Ready when you are! ✨",
    ],
    failure: [
      "Oh no, sweetie! I couldn't add that. Let me try again...",
    ],
  },
  'calculate-total': {
    start: [
      "Let me calculate the total for you, dear! 💰",
      "I'll work out the total cost right away, sweetie!",
    ],
    progress: [
      "Calculating all the costs, hon...",
    ],
    success: [
      "All done! Your total comes to ${total}, sweetie! 💕",
      "Perfect! I've calculated everything for you, dear! Total: ${total}",
    ],
    failure: [
      "Oh dear, having trouble calculating. Just a moment, sweetie...",
    ],
  },
  'compare-options': {
    start: [
      "Let me compare these options for you, hon! 📊",
      "I'll create a comparison so you can see the differences, sweetie!",
    ],
    progress: [
      "Comparing all the details for you, dear...",
    ],
    success: [
      "Perfect! Here's your comparison, sweetie! 📊",
      "All compared! Let me show you the differences, hon! ✨",
    ],
    failure: [
      "Having trouble comparing, dear. Let me try again...",
    ],
  },
  'check-availability': {
    start: [
      "Let me check if that's still available for you, sweetie! 🔍",
      "I'll verify availability right away, hon!",
    ],
    progress: [
      "Checking availability, dear...",
    ],
    success: [
      "Good news! It's still available, sweetie! ✅",
      "Yes, it's available, hon! We can proceed! 💕",
    ],
    failure: [
      "Oh no, sweetie, it looks like that's no longer available. Let me find alternatives for you...",
    ],
  },
  'verify-requirements': {
    start: [
      "Let me check the travel requirements for you, dear! 📋",
      "I'll verify what you need for your trip, sweetie!",
    ],
    progress: [
      "Checking visa and travel requirements, hon...",
    ],
    success: [
      "Here's what you need to know, sweetie! 📋",
      "I've got the requirements for you, dear!",
    ],
    failure: [
      "Having trouble getting requirements info, hon. Let me try again...",
    ],
  },
  'book': {
    start: [
      "I'll complete your booking now, sweetie! 🎉",
      "Processing your reservation, hon! Almost there! 💕",
    ],
    progress: [
      "Confirming your booking, dear... Just a moment!",
      "Almost done, sweetie! Finalizing everything...",
    ],
    success: [
      "Congratulations, hon! Your booking is confirmed! 🎉",
      "All done, sweetie! You're all set! ✨",
      "Perfect! Your trip is booked, dear! Have a wonderful time! 💕",
    ],
    failure: [
      "Oh no, sweetie! There was a problem with the booking. Let me help fix this...",
      "I'm so sorry, hon. The booking didn't go through. Let's try again...",
    ],
  },
};

/**
 * Action messages for Sarah - Flight Expert
 * Professional, efficient, knowledgeable
 */
export const sarahFlightMessages: ConsultantActionMessages = {
  'search-flights': {
    start: [
      "I'll search for flights right now. ✈️",
      "Let me find the best options for you.",
      "Searching flight availability now.",
      "I'll check all available routes.",
    ],
    progress: [
      "Searching across multiple airlines...",
      "Comparing flight options...",
      "Checking available seats...",
    ],
    success: [
      "I found {count} flights that match your criteria.",
      "Here are your flight options.",
      "I've identified {count} suitable flights for you.",
      "Found {count} options - here are the best ones.",
    ],
    failure: [
      "I'm having difficulty finding flights with those parameters. Let me adjust the search.",
      "No flights found with current criteria. Let me try alternative dates.",
    ],
  },
  'search-hotels': {
    start: [
      "Searching for hotels in your destination.",
      "I'll find suitable accommodations for you.",
    ],
    progress: [
      "Checking hotel availability...",
      "Comparing rates and amenities...",
    ],
    success: [
      "I found {count} hotels that meet your needs.",
      "Here are your hotel options.",
    ],
    failure: [
      "Unable to find hotels at this time. Let me try alternative search parameters.",
    ],
  },
  'add-to-cart': {
    start: [
      "Adding to cart.",
      "I'll save this option for you.",
    ],
    progress: [],
    success: [
      "Added to cart. You can review it anytime.",
      "Saved to your cart.",
      "Option secured in your cart.",
    ],
    failure: [
      "Unable to add to cart. Let me try again.",
    ],
  },
  'calculate-total': {
    start: [
      "Calculating total cost.",
      "I'll break down the pricing for you.",
    ],
    progress: [
      "Calculating taxes and fees...",
    ],
    success: [
      "Total: ${total} including taxes and fees.",
      "Your total comes to ${total}.",
    ],
    failure: [
      "Error calculating total. Retrying...",
    ],
  },
  'compare-options': {
    start: [
      "I'll compare these options for you.",
      "Creating comparison now.",
    ],
    progress: [
      "Analyzing flight details...",
    ],
    success: [
      "Here's your comparison table.",
      "Comparison complete.",
    ],
    failure: [
      "Comparison failed. Let me try again.",
    ],
  },
  'check-availability': {
    start: [
      "Checking availability.",
      "I'll verify if this option is still available.",
    ],
    progress: [
      "Verifying with the airline...",
    ],
    success: [
      "Confirmed: This flight is available.",
      "Available. You can proceed with booking.",
    ],
    failure: [
      "This option is no longer available. Let me find alternatives.",
    ],
  },
  'book': {
    start: [
      "Processing your booking.",
      "Completing reservation now.",
    ],
    progress: [
      "Confirming with airline...",
      "Finalizing booking details...",
    ],
    success: [
      "Booking confirmed. Reference: {bookingId}",
      "Your reservation is complete.",
    ],
    failure: [
      "Booking failed. Let me investigate and retry.",
    ],
  },
};

/**
 * Action messages for Marcus - Budget Specialist
 * Enthusiastic, money-conscious, friendly
 */
export const marcusBudgetMessages: ConsultantActionMessages = {
  'search-flights': {
    start: [
      "Let me hunt for the best deals, amigo! 💰",
      "I'll find you the cheapest flights! 🎯",
      "Searching for bargain flights now, friend! ✈️",
      "Let me dig up the best prices for you! 🔍",
    ],
    progress: [
      "Comparing prices to find the best value...",
      "Looking for hidden deals and discounts...",
      "Checking budget airlines and sales...",
    ],
    success: [
      "Boom! Found {count} great deals for you, amigo! 💰",
      "Score! Here are {count} budget-friendly options! 🎉",
      "Check out these amazing prices I found! 💸",
    ],
    failure: [
      "Hmm, prices are high right now, amigo. Let me find a better deal...",
    ],
  },
  'search-hotels': {
    start: [
      "Let me find you affordable hotels, friend! 🏨",
      "Searching for budget-friendly stays! 💰",
    ],
    progress: [
      "Comparing hotel prices for best value...",
    ],
    success: [
      "Found some great hotel deals for you! 🏨",
      "Check out these affordable options, amigo! 💰",
    ],
    failure: [
      "Hotels are pricey right now. Let me look for better deals...",
    ],
  },
  'add-to-cart': {
    start: [
      "I'll lock in this deal for you, amigo! 🔒",
      "Saving this awesome price! 💰",
    ],
    progress: [],
    success: [
      "Deal secured! It's in your cart now! 🎯",
      "Price locked in, friend! Great choice! 💪",
    ],
    failure: [
      "Oops! Let me try saving that again, amigo...",
    ],
  },
  'calculate-total': {
    start: [
      "Let me crunch the numbers for you! 🧮",
      "I'll show you the total breakdown! 💰",
    ],
    progress: [
      "Calculating all costs...",
    ],
    success: [
      "Total damage: ${total} - not bad, amigo! 💰",
      "Your total is ${total}. That's a solid deal! 🎯",
    ],
    failure: [
      "Having trouble with the math. Gimme a sec...",
    ],
  },
  'compare-options': {
    start: [
      "Let me show you which one's the best value! 💰",
      "I'll compare the prices for you, amigo! 📊",
    ],
    progress: [
      "Comparing value for money...",
    ],
    success: [
      "Here's the breakdown, friend! Option X is the best deal! 💰",
      "Check out this comparison - I marked the best value! 🎯",
    ],
    failure: [
      "Having trouble comparing. Let me try again, amigo...",
    ],
  },
  'check-availability': {
    start: [
      "Let me make sure this deal is still good! 🔍",
      "Checking if this price is still available, amigo!",
    ],
    progress: [
      "Verifying availability...",
    ],
    success: [
      "Yes! Still available at this price! Quick, let's grab it! 💪",
      "Deal's still good, friend! 🎯",
    ],
    failure: [
      "Ah man, that deal's gone. But don't worry - let me find another one! 💰",
    ],
  },
  'book': {
    start: [
      "Let's lock in this deal, amigo! 🔒",
      "Booking your trip at this great price! 💰",
    ],
    progress: [
      "Securing your booking...",
      "Locking in the price...",
    ],
    success: [
      "Booked! You got a great deal, amigo! 🎉",
      "Score! Your trip is confirmed at an awesome price! 💪",
    ],
    failure: [
      "Booking failed, friend. Let me try to get that price again...",
    ],
  },
};

/**
 * Action messages for Emma - Luxury Specialist
 * Sophisticated, refined, premium focus
 */
export const emmaLuxuryMessages: ConsultantActionMessages = {
  'search-flights': {
    start: [
      "Allow me to curate the finest flight options for you. ✈️",
      "I'll search for premium flights that match your standards.",
      "Searching for first-class options now.",
    ],
    progress: [
      "Reviewing premium carriers...",
      "Evaluating business and first-class availability...",
      "Curating exceptional options...",
    ],
    success: [
      "I've selected {count} exceptional flights for your consideration.",
      "Here are {count} premium options worthy of your journey.",
      "I've curated the finest {count} flights available.",
    ],
    failure: [
      "I'm having difficulty finding options that meet our standards. Allow me to broaden the search.",
    ],
  },
  'search-hotels': {
    start: [
      "I'll find the finest accommodations for you. 🏨",
      "Searching for luxury properties in your destination.",
    ],
    progress: [
      "Reviewing five-star properties...",
      "Evaluating luxury amenities...",
    ],
    success: [
      "I've identified {count} exceptional properties for you.",
      "Here are the finest hotels available.",
    ],
    failure: [
      "Limited luxury options available. Let me search alternative dates.",
    ],
  },
  'add-to-cart': {
    start: [
      "I'll reserve this option for you.",
      "Securing your selection.",
    ],
    progress: [],
    success: [
      "Your selection has been reserved.",
      "Secured in your collection.",
    ],
    failure: [
      "Unable to reserve. Allow me to try again.",
    ],
  },
  'calculate-total': {
    start: [
      "I'll prepare the investment details.",
      "Calculating your investment.",
    ],
    progress: [
      "Preparing comprehensive breakdown...",
    ],
    success: [
      "Your investment: ${total}",
      "Total investment: ${total}",
    ],
    failure: [
      "Error in calculation. One moment please.",
    ],
  },
  'book': {
    start: [
      "Finalizing your luxury reservation.",
      "Completing your booking now.",
    ],
    progress: [
      "Confirming premium arrangements...",
      "Securing your reservation...",
    ],
    success: [
      "Your luxury experience is confirmed. Enjoy your journey.",
      "Reservation complete. Wishing you exceptional travels.",
    ],
    failure: [
      "I encountered an issue. Allow me to resolve this immediately.",
    ],
  },
};

/**
 * Action messages for Alex - Adventure Specialist
 * Exciting, energetic, adventure-focused
 */
export const alexAdventureMessages: ConsultantActionMessages = {
  'search-flights': {
    start: [
      "Let's find your adventure flights! 🌍",
      "Searching for epic journey options! ⛰️",
      "Let me find the best routes to your adventure! 🗺️",
    ],
    progress: [
      "Exploring all the routes...",
      "Finding the best connections for your adventure...",
    ],
    success: [
      "Found {count} awesome flight options for your adventure! 🌟",
      "Your adventure starts with these {count} flights! ✈️",
    ],
    failure: [
      "Hit a snag, but I'll find your adventure route! Hang tight...",
    ],
  },
  'search-hotels': {
    start: [
      "Let me find your base camp! 🏕️",
      "Searching for adventure-ready accommodations! 🌍",
    ],
    progress: [
      "Finding the perfect adventure base...",
    ],
    success: [
      "Found amazing places for your adventure! 🏨",
      "Your adventure basecamp options are ready! ⛺",
    ],
    failure: [
      "Having trouble with accommodations. Let me scout other options...",
    ],
  },
  'add-to-cart': {
    start: [
      "Securing your adventure! 🎒",
      "Adding this to your expedition plan! 🗺️",
    ],
    progress: [],
    success: [
      "Adventure secured! It's in your pack now! 🎒",
      "Added to your journey! Let's go! 🌟",
    ],
    failure: [
      "Couldn't add that. Let me try another route...",
    ],
  },
  'book': {
    start: [
      "Let's make this adventure official! 🎉",
      "Booking your epic journey now! 🌍",
    ],
    progress: [
      "Confirming your adventure...",
      "Locking in your journey...",
    ],
    success: [
      "Adventure booked! Get ready for an amazing journey! 🎉",
      "You're all set! Time to start packing! 🎒",
    ],
    failure: [
      "Booking hit a bump. Let me get this sorted for your adventure...",
    ],
  },
};

/**
 * Get action messages for a consultant
 */
export function getConsultantMessages(consultantId: string): ConsultantActionMessages {
  switch (consultantId) {
    case 'lisa-service':
      return lisaServiceMessages;
    case 'sarah-flight':
      return sarahFlightMessages;
    case 'marcus-budget':
      return marcusBudgetMessages;
    case 'emma-luxury':
      return emmaLuxuryMessages;
    case 'alex-adventure':
      return alexAdventureMessages;
    default:
      return sarahFlightMessages; // Default to Sarah
  }
}

/**
 * Get a random message from a set
 */
function getRandomMessage(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Generate action announcement
 */
export function announceAction(
  action: AgentActionType,
  phase: 'start' | 'progress' | 'success' | 'failure',
  consultantId: string,
  variables?: Record<string, any>
): string {
  const messages = getConsultantMessages(consultantId);
  const actionMessages = messages[action];

  if (!actionMessages || !actionMessages[phase] || actionMessages[phase].length === 0) {
    // Fallback generic messages
    return getGenericMessage(action, phase);
  }

  let message = getRandomMessage(actionMessages[phase]);

  // Replace variables
  if (variables) {
    Object.keys(variables).forEach((key) => {
      message = message.replace(`{${key}}`, String(variables[key]));
    });
  }

  return message;
}

/**
 * Generic fallback messages
 */
function getGenericMessage(action: AgentActionType, phase: string): string {
  const actionName = action.replace(/-/g, ' ');

  switch (phase) {
    case 'start':
      return `I'll ${actionName} for you now.`;
    case 'progress':
      return `${actionName}...`;
    case 'success':
      return `${actionName} completed successfully.`;
    case 'failure':
      return `Unable to ${actionName}. Let me try again.`;
    default:
      return `Processing ${actionName}...`;
  }
}
