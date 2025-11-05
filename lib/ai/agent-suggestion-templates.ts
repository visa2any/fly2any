/**
 * AI Agent Suggestion Templates
 * Natural language templates for each consultant personality
 */

import type { SuggestionType } from './agent-suggestions';
import type { ConsultantProfile } from './consultant-profiles';

export interface SuggestionTemplate {
  intro?: string[];
  message: string[];
  action?: string[];
}

/**
 * Suggestion templates organized by consultant and suggestion type
 */
export const suggestionTemplates: Record<string, Record<SuggestionType, SuggestionTemplate>> = {
  'lisa-service': {
    'deal-alert': {
      intro: [
        "Oh sweetie! 🎉",
        "Guess what, hon?",
        "You're going to love this!",
        "I just found something amazing for you!"
      ],
      message: [
        "There's an incredible {discount}% off flash sale happening right now!",
        "I spotted a fantastic deal - {discount}% savings on these flights!",
        "This is perfect timing - there's a special promotion just for you!",
        "I found an amazing price drop - you could save ${amount}!"
      ],
      action: [
        "Let me show you the details, dear!",
        "Would you like me to grab this for you?",
        "Shall we take a look together?"
      ]
    },
    'cost-saving': {
      intro: [
        "Let me share a money-saving tip with you! 💰",
        "I have a wonderful idea to help you save, dear!",
        "Oh! I just thought of something that could save you money!"
      ],
      message: [
        "Shifting your dates by just {days} days could save you ${amount}!",
        "Flying on weekdays instead of weekends typically saves 15-20%!",
        "Booking a package deal could save you up to ${amount}!"
      ],
      action: [
        "Want me to show you those options, sweetie?",
        "Shall I pull up those dates for you?",
        "Would you like to see how much you'd save?"
      ]
    },
    'better-option': {
      intro: [
        "Oh! I found an even better option for you! ✨",
        "Wait, hon - you might want to see this!",
        "This is exciting - I found something perfect!"
      ],
      message: [
        "For just ${difference} more, you could get a direct flight!",
        "There's a {rating}-star airline for only {percent}% more!",
        "This option saves you {hours} hours of travel time!"
      ],
      action: [
        "Let me show you the comparison, dear!",
        "Want to take a peek at this one?",
        "Shall we compare these side by side?"
      ]
    },
    'time-saving': {
      intro: [
        "I found a way to save you some time!",
        "Oh sweetie, this could get you there faster!"
      ],
      message: [
        "This option gets you there {hours} hours earlier!",
        "You could skip the long layover with this flight!",
        "This route saves you valuable travel time!"
      ],
      action: [
        "Want to see the faster option?",
        "Shall I show you the details?"
      ]
    },
    'package-deal': {
      intro: [
        "I have a wonderful package deal idea for you!",
        "Let me tell you about a great bundle, dear!"
      ],
      message: [
        "Booking flight + hotel together saves {percent}% - that's ${amount}!",
        "I can put together a complete package and save you money!",
        "There's a lovely package deal that includes everything!"
      ],
      action: [
        "Would you like to see the package options?",
        "Want me to show you what's included?",
        "Shall I create a custom package for you?"
      ]
    },
    'upsell': {
      intro: [
        "Just a thought, sweetie...",
        "May I suggest something special?"
      ],
      message: [
        "For a bit more, you could enjoy {benefit}!",
        "Premium class is only {percent}% more and so worth it!",
        "Adding {service} would make your trip extra special!"
      ],
      action: [
        "Want to hear more about it?",
        "Shall I explain the benefits?",
        "Would you like to consider this upgrade?"
      ]
    },
    'alternative': {
      intro: [
        "I have some wonderful alternatives for you!",
        "Let me suggest some similar options, dear!"
      ],
      message: [
        "If you're flexible, {destinations} are beautiful and less crowded!",
        "These similar destinations might be perfect for you!",
        "{destination} is lovely this time of year!"
      ],
      action: [
        "Want to explore these options?",
        "Shall I tell you more about them?",
        "Would you like to see what's available?"
      ]
    },
    'insider-tip': {
      intro: [
        "Pro tip from me to you! 💡",
        "Let me share some insider knowledge, hon!",
        "I've learned something over the years..."
      ],
      message: [
        "Tuesday and Wednesday flights are usually {percent}% cheaper!",
        "Booking {weeks} weeks ahead gets you the best prices!",
        "Staying through Saturday night often unlocks better fares!",
        "Airlines release unsold seats at discounts 24-48 hours before departure!"
      ],
      action: [
        "Want me to adjust your search?",
        "Shall I show you those dates?",
        "Would you like me to set up price alerts?"
      ]
    },
    'urgency': {
      intro: [
        "Heads up, sweetie! ⚠️",
        "I need to tell you something important!",
        "Quick update, dear!"
      ],
      message: [
        "Only {seats} seats left at this price!",
        "This deal expires in {time}!",
        "Prices are trending upward - book soon to lock in the rate!",
        "This flash sale ends in {hours} hours!"
      ],
      action: [
        "Shall we secure this now?",
        "Want me to hold this for you?",
        "Should I proceed with booking?"
      ]
    },
    'personalized': {
      intro: [
        "Based on what I know about you...",
        "I remember you love...",
        "As a valued customer, hon..."
      ],
      message: [
        "You typically prefer {preference} - I found perfect options!",
        "This matches your usual travel style beautifully!",
        "Based on your last trip, you might love {destination}!",
        "As a returning customer, you get priority support! 🌟"
      ],
      action: [
        "Want to see what I found?",
        "Shall I show you the personalized options?",
        "Would you like my recommendations?"
      ]
    }
  },

  'sarah-flight': {
    'deal-alert': {
      intro: [
        "Great news! ✈️",
        "I spotted a fantastic deal!",
        "This just came up!"
      ],
      message: [
        "There's a {discount}% flash sale on this route!",
        "Prices just dropped ${amount} on these flights!",
        "Limited-time offer: {discount}% off!",
        "Flash sale alert - expires in {time}!"
      ],
      action: [
        "Want to see the details?",
        "Shall I show you this deal?",
        "Ready to grab this?"
      ]
    },
    'cost-saving': {
      intro: [
        "I can help you save money!",
        "Here's a cost-saving tip!",
        "Let me show you how to save!"
      ],
      message: [
        "Flexible dates could save you ${amount}!",
        "Weekday flights are {percent}% cheaper!",
        "Booking now locks in this low price!",
        "Shifting by {days} days saves ${amount}!"
      ],
      action: [
        "Want to see the cheaper options?",
        "Shall I adjust your search?",
        "Ready to compare?"
      ]
    },
    'better-option': {
      intro: [
        "I found a better routing!",
        "There's an upgraded option available!",
        "This might interest you!"
      ],
      message: [
        "Direct flight for only ${difference} more!",
        "Better airline for {percent}% more - worth it!",
        "Faster routing - saves {hours} hours!",
        "{airline} offers better service for similar price!"
      ],
      action: [
        "Want to compare?",
        "Shall I show you both options?",
        "Ready to see the details?"
      ]
    },
    'time-saving': {
      intro: [
        "I can get you there faster!",
        "Here's a quicker option!"
      ],
      message: [
        "This routing saves {hours} hours!",
        "Shorter layover - arrives {time} earlier!",
        "Direct flight gets you there {hours} hours faster!"
      ],
      action: [
        "Want to see it?",
        "Interested in the faster option?"
      ]
    },
    'package-deal': {
      intro: [
        "Consider a package deal!",
        "Bundle and save!"
      ],
      message: [
        "Flight + hotel = {percent}% savings!",
        "Package deals save ${amount} total!",
        "Bundle your trip and save!"
      ],
      action: [
        "Want to see packages?",
        "Shall I show bundle options?",
        "Ready to explore packages?"
      ]
    },
    'upsell': {
      intro: [
        "Consider upgrading!",
        "Premium option available!"
      ],
      message: [
        "Premium Economy only {percent}% more!",
        "Upgrade to {class} for ${difference}!",
        "Add {service} for complete peace of mind!"
      ],
      action: [
        "Want to see premium options?",
        "Interested in upgrading?",
        "Shall I show you the benefits?"
      ]
    },
    'alternative': {
      intro: [
        "Here are some alternatives!",
        "Consider these options!"
      ],
      message: [
        "{destinations} offer similar experiences!",
        "Alternative airports could save money!",
        "These destinations match your criteria!"
      ],
      action: [
        "Want to explore alternatives?",
        "Shall I show you options?",
        "Ready to compare?"
      ]
    },
    'insider-tip': {
      intro: [
        "Pro tip! 💡",
        "Flight booking insight!",
        "Industry secret!"
      ],
      message: [
        "Book {weeks} weeks out for best prices!",
        "Tue/Wed flights are {percent}% cheaper!",
        "Red-eye flights save money but arrive tired!",
        "Price monitoring shows upward trend!"
      ],
      action: [
        "Want me to adjust search?",
        "Shall I set price alerts?",
        "Ready to optimize timing?"
      ]
    },
    'urgency': {
      intro: [
        "Act fast! ⏰",
        "Limited availability!",
        "Time-sensitive!"
      ],
      message: [
        "Only {seats} seats at this price!",
        "Expires in {time}!",
        "Prices trending up - book now!",
        "Flash sale ends soon!"
      ],
      action: [
        "Ready to book?",
        "Shall I hold this?",
        "Want to secure it now?"
      ]
    },
    'personalized': {
      intro: [
        "Based on your profile...",
        "Matches your preferences!",
        "Perfect for your travel style!"
      ],
      message: [
        "Your preferred airline has availability!",
        "Matches your typical budget!",
        "Similar to your last successful trip!",
        "Aligns with your loyalty program!"
      ],
      action: [
        "Want to see it?",
        "Shall I show details?",
        "Ready to review?"
      ]
    }
  },

  'marcus-adventure': {
    'deal-alert': {
      intro: [
        "Amigo! Check this out! 🎉",
        "Whoa! Amazing deal alert!",
        "You're gonna love this, friend!"
      ],
      message: [
        "Insane {discount}% off flash sale - let's go!",
        "Prices just crashed ${amount} - score!",
        "Limited-time adventure deal - {discount}% off!",
        "Flash sale to {destination} - expires {time}!"
      ],
      action: [
        "Ready to jump on this?",
        "Want me to lock it in?",
        "Shall we grab it?"
      ]
    },
    'cost-saving': {
      intro: [
        "Let me help you save some cash!",
        "Money-saving hack coming up!",
        "Here's how we maximize your budget!"
      ],
      message: [
        "Flex those dates and save ${amount}!",
        "Weekday departure = {percent}% savings!",
        "Package deal saves ${amount} - more money for adventures!",
        "Shift {days} days, save ${amount} for activities!"
      ],
      action: [
        "Want to see the savings?",
        "Shall I show you how?",
        "Ready to optimize your budget?"
      ]
    },
    'better-option': {
      intro: [
        "Hold up - found something better!",
        "Check this upgrade out!",
        "This might be the winner!"
      ],
      message: [
        "Direct flight for ${difference} more - no waiting!",
        "Better airline, better experience - {percent}% more!",
        "Saves {hours} hours - more time for fun!",
        "Premium option - totally worth the upgrade!"
      ],
      action: [
        "Want to compare side by side?",
        "Shall I break it down?",
        "Ready to see why it's better?"
      ]
    },
    'time-saving': {
      intro: [
        "Get there faster, friend!",
        "Quick route alert!"
      ],
      message: [
        "Shaves off {hours} hours - maximize your time!",
        "Shorter layover = more adventure time!",
        "Direct flight gets you exploring {hours} hours earlier!"
      ],
      action: [
        "Want the fast track?",
        "Shall I show you?"
      ]
    },
    'package-deal': {
      intro: [
        "Bundle up and save, amigo!",
        "Package deal time!"
      ],
      message: [
        "Flight + hotel + activities = {percent}% off!",
        "Complete adventure package saves ${amount}!",
        "All-inclusive means more budget for fun!"
      ],
      action: [
        "Want to see the full package?",
        "Ready to bundle up?",
        "Shall I show what's included?"
      ]
    },
    'upsell': {
      intro: [
        "Level up your experience!",
        "Worth the upgrade, trust me!"
      ],
      message: [
        "Premium seat = arrive refreshed for adventure!",
        "Upgrade to {class} - you deserve it!",
        "Add {service} - adventure insurance!",
        "Extra comfort for only {percent}% more!"
      ],
      action: [
        "Want to treat yourself?",
        "Shall I show the upgrade?",
        "Ready to level up?"
      ]
    },
    'alternative': {
      intro: [
        "Similar vibes, different spot!",
        "Alternative adventures!"
      ],
      message: [
        "{destinations} have the same epic vibe!",
        "Less touristy, more authentic - check these!",
        "Off-the-beaten-path gems worth exploring!"
      ],
      action: [
        "Want to explore these?",
        "Shall I tell you about them?",
        "Ready for something different?"
      ]
    },
    'insider-tip': {
      intro: [
        "Pro traveler tip! 🌍",
        "From one adventurer to another!",
        "Here's what I learned!"
      ],
      message: [
        "Tuesday departures = cheaper + fewer crowds!",
        "Book {weeks} weeks out for sweet spot pricing!",
        "Shoulder season = best weather + prices!",
        "Local airport sometimes beats major hub!"
      ],
      action: [
        "Want me to optimize your search?",
        "Shall I adjust for this?",
        "Ready to use this hack?"
      ]
    },
    'urgency': {
      intro: [
        "Act now, amigo! ⚡",
        "Move fast on this!",
        "Don't miss out!"
      ],
      message: [
        "Only {seats} seats left - grab 'em!",
        "Deal expires in {time} - go go go!",
        "Prices climbing - book before it jumps!",
        "Flash sale ending - {hours} hours left!"
      ],
      action: [
        "Ready to book it?",
        "Shall I secure this?",
        "Want me to lock it in now?"
      ]
    },
    'personalized': {
      intro: [
        "Based on your style...",
        "You're an adventure seeker!",
        "Perfect for you, friend!"
      ],
      message: [
        "Matches your adventurous spirit!",
        "Similar to your epic {destination} trip!",
        "Your usual budget range - let's go!",
        "Adventure level: {level} - perfect match!"
      ],
      action: [
        "Want to see it?",
        "Ready to check it out?",
        "Shall I show you?"
      ]
    }
  },

  'emily-luxury': {
    'deal-alert': {
      intro: [
        "Exceptional opportunity! ✨",
        "A rare find for you!",
        "This is quite special!"
      ],
      message: [
        "Exclusive {discount}% savings on premium service!",
        "Limited availability - ${amount} value!",
        "Premier offering at {discount}% below standard!",
        "Luxury experience with exceptional savings!"
      ],
      action: [
        "Shall I provide the details?",
        "Would you like to review this?",
        "May I show you this opportunity?"
      ]
    },
    'cost-saving': {
      intro: [
        "Allow me to optimize your investment!",
        "Value enhancement opportunity!",
        "Intelligent planning yields savings!"
      ],
      message: [
        "Strategic date selection saves ${amount}!",
        "Premium value with {percent}% optimization!",
        "Refined timing ensures best rates!",
        "Elegant solution saves ${amount}!"
      ],
      action: [
        "Shall I present the alternatives?",
        "Would you like to explore this?",
        "May I show you the comparison?"
      ]
    },
    'better-option': {
      intro: [
        "A superior option has emerged!",
        "This exceeds the standard!",
        "Premium alternative available!"
      ],
      message: [
        "First-class service for modest premium!",
        "Enhanced experience - truly worth ${difference}!",
        "Superior comfort and service!",
        "Elevated travel for discerning guests!"
      ],
      action: [
        "Shall I elaborate?",
        "Would you like the comparison?",
        "May I present the details?"
      ]
    },
    'time-saving': {
      intro: [
        "Efficiency optimization available!",
        "Premium routing option!"
      ],
      message: [
        "Executive routing saves {hours} hours!",
        "Streamlined journey - arrives refreshed!",
        "Time is luxury - this saves both!"
      ],
      action: [
        "Shall I show you?",
        "Would you like details?"
      ]
    },
    'package-deal': {
      intro: [
        "Curated package available!",
        "Complete luxury experience!"
      ],
      message: [
        "Bespoke package with {percent}% value!",
        "Complete journey - flight, hotel, experiences!",
        "Seamless luxury from departure to return!"
      ],
      action: [
        "Shall I present the package?",
        "Would you like to review?",
        "May I detail the inclusions?"
      ]
    },
    'upsell': {
      intro: [
        "Enhanced experience available!",
        "Premium upgrade opportunity!"
      ],
      message: [
        "{class} class elevates your journey!",
        "Concierge service adds exceptional value!",
        "Premium amenities worth the investment!",
        "First-class treatment from start to finish!"
      ],
      action: [
        "Shall I describe the benefits?",
        "Would you like to explore this?",
        "May I present the upgrade?"
      ]
    },
    'alternative': {
      intro: [
        "Refined alternatives!",
        "Exclusive destinations!"
      ],
      message: [
        "{destinations} offer similar prestige!",
        "Less discovered, equally luxurious!",
        "Sophisticated alternatives worth considering!"
      ],
      action: [
        "Shall I elaborate?",
        "Would you like to explore these?",
        "May I provide details?"
      ]
    },
    'insider-tip': {
      intro: [
        "Privileged insight! 💎",
        "Expert guidance!",
        "Refined strategy!"
      ],
      message: [
        "Tuesday bookings often yield premium seats!",
        "Optimal booking window for luxury: {weeks} weeks!",
        "First-class availability peaks mid-week!",
        "Shoulder season: luxury at better value!"
      ],
      action: [
        "Shall I optimize accordingly?",
        "Would you like me to adjust?",
        "May I refine the search?"
      ]
    },
    'urgency': {
      intro: [
        "Immediate action recommended! ⌛",
        "Limited availability!",
        "Time-sensitive opportunity!"
      ],
      message: [
        "Only {seats} premium seats remaining!",
        "Exclusive offer expires {time}!",
        "Demand increasing - secure now!",
        "Limited-time luxury offering!"
      ],
      action: [
        "Shall I proceed?",
        "Would you like to secure this?",
        "May I reserve this for you?"
      ]
    },
    'personalized': {
      intro: [
        "Tailored to your preferences!",
        "Based on your refined taste!",
        "Perfect for your standards!"
      ],
      message: [
        "Matches your premium travel profile!",
        "Aligns with your previous selections!",
        "Curated specifically for you!",
        "As a valued client, this suits perfectly!"
      ],
      action: [
        "Shall I present this?",
        "Would you like to review?",
        "May I show you the details?"
      ]
    }
  },

  'alex-budget': {
    'deal-alert': {
      intro: [
        "Score! Found a steal! 🎯",
        "Deal hunter success!",
        "Budget win incoming!"
      ],
      message: [
        "Crazy {discount}% off - grab it!",
        "Price dropped ${amount} - jackpot!",
        "Flash sale: {discount}% savings!",
        "Killer deal expires in {time}!"
      ],
      action: [
        "Want me to grab it?",
        "Shall I lock this in?",
        "Ready to score this deal?"
      ]
    },
    'cost-saving': {
      intro: [
        "Let's maximize those savings!",
        "Budget hack alert!",
        "Here's how we save more!"
      ],
      message: [
        "Flex dates = save ${amount}!",
        "Weekday flights are {percent}% cheaper!",
        "Shift {days} days, save ${amount}!",
        "Budget airline option saves ${amount}!"
      ],
      action: [
        "Want to see the savings?",
        "Shall I show you how?",
        "Ready to save more?"
      ]
    },
    'better-option': {
      intro: [
        "Better deal spotted!",
        "Wait - this is better value!",
        "Found a sweet upgrade!"
      ],
      message: [
        "Direct for only ${difference} more!",
        "Better value - saves time + stress!",
        "{hours} hours saved for ${difference}!",
        "Worth the small upgrade - trust me!"
      ],
      action: [
        "Want to compare?",
        "Shall I break down the value?",
        "Ready to see both?"
      ]
    },
    'time-saving': {
      intro: [
        "Faster = better value!",
        "Quick route found!"
      ],
      message: [
        "Saves {hours} hours - worth it!",
        "Skip the long layover!",
        "Direct flight = less hassle!"
      ],
      action: [
        "Want the faster option?",
        "Shall I show you?"
      ]
    },
    'package-deal': {
      intro: [
        "Bundle and save big!",
        "Package deal = more value!"
      ],
      message: [
        "Flight + hotel = {percent}% off!",
        "Complete package saves ${amount}!",
        "Bundle beats separate booking!"
      ],
      action: [
        "Want to see packages?",
        "Shall I show you?",
        "Ready to bundle?"
      ]
    },
    'upsell': {
      intro: [
        "Small upgrade, big difference!",
        "Worth considering!"
      ],
      message: [
        "Extra legroom for just ${difference}!",
        "Checked bag included - saves later!",
        "Small premium = better experience!"
      ],
      action: [
        "Worth the upgrade?",
        "Want to see it?",
        "Shall I explain benefits?"
      ]
    },
    'alternative': {
      intro: [
        "Cheaper alternatives!",
        "Similar spots, better prices!"
      ],
      message: [
        "{destinations} cost {percent}% less!",
        "Nearby airport saves ${amount}!",
        "Off-season = same place, half price!"
      ],
      action: [
        "Want to explore these?",
        "Shall I show alternatives?",
        "Ready to compare?"
      ]
    },
    'insider-tip': {
      intro: [
        "Budget pro tip! 💰",
        "Money-saving secret!",
        "Here's the hack!"
      ],
      message: [
        "Book Tuesday for best prices!",
        "{weeks} weeks out = sweet spot!",
        "Incognito mode prevents price hikes!",
        "Early morning = cheapest fares!"
      ],
      action: [
        "Want me to optimize?",
        "Shall I adjust search?",
        "Ready to use this hack?"
      ]
    },
    'urgency': {
      intro: [
        "Move fast! ⚡",
        "Limited time!",
        "Act now!"
      ],
      message: [
        "Only {seats} seats at this price!",
        "Deal ends in {time}!",
        "Price going up - book now!",
        "Flash sale ending - {hours} hours!"
      ],
      action: [
        "Ready to book?",
        "Shall I grab it?",
        "Want to lock it in?"
      ]
    },
    'personalized': {
      intro: [
        "Based on your style!",
        "Matches your budget!",
        "Perfect for you!"
      ],
      message: [
        "Your usual budget range - ${amount}!",
        "Similar to your last trip!",
        "Matches your preferences!",
        "Budget-friendly like you like it!"
      ],
      action: [
        "Want to see it?",
        "Shall I show you?",
        "Ready to check it out?"
      ]
    }
  }
};

/**
 * Get random template from array
 */
function getRandomTemplate(templates: string[]): string {
  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Format suggestion with consultant's personality
 */
export function formatSuggestionMessage(
  suggestion: {
    type: SuggestionType;
    message: string;
    savingsAmount?: number;
    savingsPercentage?: number;
    expiresAt?: Date;
    metadata?: Record<string, any>;
  },
  consultant: ConsultantProfile
): string {
  const templates = suggestionTemplates[consultant.id];

  if (!templates || !templates[suggestion.type]) {
    // Fallback to original message
    return suggestion.message;
  }

  const template = templates[suggestion.type];

  // Build message with intro
  let message = '';

  if (template.intro) {
    message += getRandomTemplate(template.intro) + ' ';
  }

  // Use the original message (which has the actual data)
  message += suggestion.message;

  // Add action if appropriate
  if (template.action && Math.random() > 0.3) { // 70% chance to add action
    message += ' ' + getRandomTemplate(template.action);
  }

  return message;
}

/**
 * Get suggestion intro based on consultant
 */
export function getSuggestionIntro(
  suggestionType: SuggestionType,
  consultant: ConsultantProfile
): string {
  const templates = suggestionTemplates[consultant.id];

  if (!templates || !templates[suggestionType] || !templates[suggestionType].intro) {
    return '';
  }

  return getRandomTemplate(templates[suggestionType].intro);
}

/**
 * Get suggestion action based on consultant
 */
export function getSuggestionAction(
  suggestionType: SuggestionType,
  consultant: ConsultantProfile
): string {
  const templates = suggestionTemplates[consultant.id];

  if (!templates || !templates[suggestionType] || !templates[suggestionType].action) {
    return '';
  }

  return getRandomTemplate(templates[suggestionType].action);
}
