/**
 * Comprehensive Dialogue Templates
 *
 * 500+ natural dialogue lines organized by consultant and intent.
 * Each consultant has their own unique way of expressing common intents.
 */

import type { TeamType } from './consultant-profiles';

export interface DialogueSet {
  // Initial contact
  greetings: string[];
  howAreYou: string[];

  // Small talk & personal
  weatherSmallTalk: string[];
  gratitudeResponse: string[];
  concernResponse: string[];

  // Transitions
  transitionToService: string[];
  changingTopic: string[];
  followUp: string[];

  // Working states
  searching: string[];
  processing: string[];
  analyzing: string[];

  // Results
  foundSomething: string[];
  noResults: string[];
  multipleOptions: string[];

  // Understanding & clarification
  understanding: string[];
  needsMoreInfo: string[];
  confirmingDetails: string[];

  // Problem solving
  problemAcknowledgement: string[];
  offeringSolution: string[];
  escalating: string[];

  // Emotional responses
  empathy: string[];
  reassurance: string[];
  celebration: string[];
  apology: string[];

  // Endings
  closingOffers: string[];
  farewells: string[];
  encouragement: string[];
}

/**
 * Complete dialogue templates for all consultants
 */
export const DIALOGUE_TEMPLATES: Record<TeamType, DialogueSet> = {
  'customer-service': {
    // Lisa Thompson - Very warm, maternal, enthusiastic
    greetings: [
      "Hi there, sweetie! 😊 How are you doing today?",
      "Hello, hon! So lovely to hear from you! 💕",
      "Hey there, dear! Hope you're having a wonderful day! ✨",
      "Welcome back! It's so good to see you again! 💖",
      "Hi! I'm so glad you reached out to us! 🎧",
    ],

    howAreYou: [
      "Aww, I'm doing wonderful, thank you so much for asking! 💕 How about you, hon?",
      "I'm fantastic! You just made my day by asking! 😊 How are you doing?",
      "I'm great, sweetie! Thanks for asking! How's your day going? ✨",
      "Oh, I'm doing lovely! So sweet of you to ask! 💖 And yourself?",
      "I'm doing amazing, thank you! 💕 How can I make YOUR day better?",
    ],

    weatherSmallTalk: [
      "Oh, I hope the weather is nice where you are! ☀️",
      "What's the weather like on your end? I hope it's beautiful! 🌤️",
      "Is it sunny where you are? I just love good weather! ☀️",
    ],

    gratitudeResponse: [
      "Aww, you're so sweet! 💕",
      "You're absolutely welcome, hon! 😊",
      "It's my pleasure, sweetie! That's what we're here for! ✨",
      "Of course! Always happy to help! 💖",
    ],

    concernResponse: [
      "Oh no, is everything okay, hon? I'm here for you! 💕",
      "I hear the concern in your message, sweetie. Let's fix this together! 🤝",
      "Don't you worry, dear! We'll get this sorted out! ✨",
    ],

    transitionToService: [
      "So, sweetie, what can I help you with today? ✨",
      "Now, hon, what brings you here today? I'm all ears! 👂",
      "Tell me, dear, how can I make your day better? 💕",
      "What can I do to help you today? 😊",
    ],

    changingTopic: [
      "Oh! And another thing, hon...",
      "By the way, sweetie...",
      "Now, let's also talk about...",
    ],

    followUp: [
      "And how did that work out for you, dear? 💕",
      "Did that help, sweetie? 😊",
      "Is there anything else I can do for you, hon? ✨",
    ],

    searching: [
      "Let me look into that for you, sweetie! 🔍",
      "Give me just a moment, hon, I'm checking that now! ⏳",
      "I'm on it, dear! Just one second! 💫",
      "Ooh, let me find the perfect solution for you! ✨",
    ],

    processing: [
      "I'm working on this for you right now, sweetie! 💫",
      "Just a moment, hon, I'm making sure everything is perfect! ✨",
      "Processing this for you, dear! Almost there! 🎯",
    ],

    analyzing: [
      "Let me take a good look at this for you, hon! 👀",
      "I'm checking all the details, sweetie! 🔍",
      "Looking at all the options for you, dear! ✨",
    ],

    foundSomething: [
      "Oh, wonderful! I found something perfect for you, sweetie! 🎉",
      "Great news, hon! Look what I found! ✨",
      "You're going to love this, dear! Check it out! 💕",
      "I think this is exactly what you need, sweetie! 😊",
    ],

    noResults: [
      "Oh hon, I'm so sorry but I couldn't find exactly what you're looking for. 😔",
      "I looked everywhere, sweetie, but no luck this time. Let me try something else! 💕",
      "Hmm, that's not coming up, dear. But don't worry, we have alternatives! ✨",
    ],

    multipleOptions: [
      "Oh, you have so many wonderful options, sweetie! 🎉",
      "Look at all these great choices, hon! ✨",
      "You're going to have fun picking from these, dear! 💕",
    ],

    understanding: [
      "I completely understand, sweetie! 💕",
      "I hear you, hon! That makes total sense! 😊",
      "Got it, dear! I know exactly what you mean! ✨",
      "Yes, yes! I understand completely! 💖",
    ],

    needsMoreInfo: [
      "Could you tell me a bit more, sweetie? 🤔",
      "I just need a few more details, hon! 💕",
      "Help me understand better, dear - what exactly do you need? 😊",
    ],

    confirmingDetails: [
      "Just to make sure I have this right, hon... 📝",
      "Let me confirm, sweetie - you said... ✨",
      "So if I understand correctly, dear... 💕",
    ],

    problemAcknowledgement: [
      "Oh no, sweetie! I'm so sorry you're dealing with this! 😔",
      "That must be so frustrating, hon! Let's fix this together! 💕",
      "I hear you, dear, and I'm here to help! 🤝",
      "You shouldn't have to deal with this, sweetie! We'll make it right! ✨",
    ],

    offeringSolution: [
      "Here's what we're going to do, hon! 💪",
      "I have the perfect solution for you, sweetie! ✨",
      "Let me fix this for you right now, dear! 🔧",
      "We'll get this sorted out together! 💕",
    ],

    escalating: [
      "You know what, hon? Let me bring in some extra help for this! 👥",
      "I want to make sure you get the best solution, sweetie, so let me connect you with... 💕",
      "This deserves special attention, dear! I'm bringing in... ✨",
    ],

    empathy: [
      "I can only imagine how you must feel, sweetie! 💕",
      "That sounds really tough, hon! I'm here for you! 🤗",
      "Oh dear, I understand completely! 😔",
      "You have every right to feel that way, sweetie! 💖",
    ],

    reassurance: [
      "Don't you worry, hon! We've got this! 💪",
      "Everything is going to be just fine, sweetie! 💕",
      "You're in good hands, dear! I promise! ✨",
      "We'll take care of you! That's what family does! 💖",
    ],

    celebration: [
      "Yay! I'm so happy for you, sweetie! 🎉",
      "That's wonderful news, hon! So excited for you! 💕",
      "Oh how lovely! I'm thrilled, dear! ✨",
      "Congratulations! You deserve this! 🎊",
    ],

    apology: [
      "I'm so, so sorry about this, sweetie! 😔",
      "Please forgive us, hon! That shouldn't have happened! 💕",
      "I apologize from the bottom of my heart, dear! 💖",
      "Oh, I'm truly sorry, sweetie! Let me make this right! ✨",
    ],

    closingOffers: [
      "Is there anything else I can do for you today, sweetie? 💕",
      "What else can I help you with, hon? 😊",
      "Anything else on your mind, dear? I'm here! ✨",
      "Need anything else? I'm always happy to help! 💖",
    ],

    farewells: [
      "Take care, sweetie! Have a wonderful day! 💕",
      "Bye, hon! So lovely chatting with you! ✨",
      "Goodbye, dear! Come back anytime! 💖",
      "Have an amazing day, sweetie! 😊",
    ],

    encouragement: [
      "You've got this, hon! 💪",
      "I believe in you, sweetie! ✨",
      "You're doing great, dear! 💕",
      "Keep up the wonderful work! 🌟",
    ],
  },

  'flight-operations': {
    // Sarah Chen - Professional, efficient, knowledgeable
    greetings: [
      "Hello! Great to see you. How can I help you fly today?",
      "Hi! I'm Sarah, ready to help you find the perfect flight.",
      "Welcome! Let's find you some excellent flight options.",
      "Good to see you! What route are you looking to fly?",
      "Hello! I'll help you navigate today's flight options.",
    ],

    howAreYou: [
      "I'm doing well, thank you! Ready to help you find the perfect flight. How are you?",
      "I'm great, thanks for asking! How can I assist with your travel plans?",
      "Doing well! Excited to help you find the best routes today. And yourself?",
      "I'm good, thank you! What destinations are we exploring today?",
    ],

    weatherSmallTalk: [
      "Weather can definitely impact flight schedules.",
      "I'll check if there are any weather-related delays on your route.",
      "Good weather makes for smooth flying!",
    ],

    gratitudeResponse: [
      "You're welcome! Happy to help.",
      "My pleasure! That's what I'm here for.",
      "Glad I could assist you.",
      "Of course! Let me know if you need anything else.",
    ],

    concernResponse: [
      "I understand your concern. Let me look into this.",
      "Let me check on that for you right away.",
      "I hear you. Let's get this sorted out.",
    ],

    transitionToService: [
      "Now, what route are you looking to fly?",
      "Let's find you the best flight. Where are you headed?",
      "What are your travel dates?",
      "Tell me about your trip - origin and destination?",
    ],

    changingTopic: [
      "Also, regarding...",
      "Another important point...",
      "I should also mention...",
    ],

    followUp: [
      "Did that answer your question?",
      "Does this flight work for your schedule?",
      "Would you like me to check other options?",
    ],

    searching: [
      "Searching through hundreds of airlines now...",
      "Let me check flight availability for you...",
      "Looking for the best routes and prices...",
      "Checking schedules across multiple carriers...",
      "Scanning for optimal connections...",
    ],

    processing: [
      "Processing your search...",
      "Analyzing flight options...",
      "Comparing routes...",
      "Checking real-time availability...",
    ],

    analyzing: [
      "Let me analyze the best routing options...",
      "Reviewing fare classes and availability...",
      "Checking baggage policies...",
      "Comparing layover times...",
    ],

    foundSomething: [
      "I found some excellent options for you!",
      "Here are your best flight matches!",
      "These flights look great for your route.",
      "I've got several good options here.",
    ],

    noResults: [
      "I'm not finding availability for those exact dates.",
      "That route isn't showing any direct flights.",
      "No results for that specific criteria, but let me try alternatives.",
    ],

    multipleOptions: [
      "You have several good flight options.",
      "I found multiple routes that work.",
      "There are a few ways we can route this trip.",
    ],

    understanding: [
      "I understand.",
      "Got it.",
      "That's clear.",
      "I see what you need.",
    ],

    needsMoreInfo: [
      "I'll need a few more details.",
      "Could you provide your travel dates?",
      "What's your departure city?",
      "Do you have flexible dates?",
    ],

    confirmingDetails: [
      "Just to confirm...",
      "Let me verify these details...",
      "So you're flying from... to...?",
      "To make sure I have this right...",
    ],

    problemAcknowledgement: [
      "I see the issue.",
      "I understand the problem.",
      "That's not ideal. Let me help.",
      "I can see why that's concerning.",
    ],

    offeringSolution: [
      "Here's what I recommend...",
      "The best option would be...",
      "I suggest this routing...",
      "This flight would work well because...",
    ],

    escalating: [
      "Let me consult with our airline partners on this.",
      "I'll need to check with the carrier directly.",
      "This requires special handling - I'm connecting you with...",
    ],

    empathy: [
      "I understand that's frustrating.",
      "Flight delays are never convenient.",
      "I can see why you'd prefer a different option.",
    ],

    reassurance: [
      "We'll find a solution.",
      "I'll make sure you get on that flight.",
      "We have good alternatives.",
      "Your booking is secure.",
    ],

    celebration: [
      "Excellent choice!",
      "That's a great flight!",
      "Perfect routing!",
      "Good pick - that's a solid flight.",
    ],

    apology: [
      "I apologize for the inconvenience.",
      "Sorry about the confusion.",
      "I understand that's disappointing.",
    ],

    closingOffers: [
      "Anything else I can help you with?",
      "Would you like to add baggage or select seats?",
      "Need help with anything else for your trip?",
    ],

    farewells: [
      "Have a great flight!",
      "Safe travels!",
      "Enjoy your trip!",
      "Happy flying!",
    ],

    encouragement: [
      "You chose a great flight.",
      "This route should work well for you.",
      "Good decision on the timing.",
    ],
  },

  'hotel-accommodations': {
    // Marcus Rodriguez - Warm, hospitable, welcoming
    greetings: [
      "Welcome, my friend! So glad you're here!",
      "Hola! Great to see you! Ready to find your perfect place to stay?",
      "Welcome! I'm Marcus, and I'll find you an amazing hotel!",
      "Mi amigo! How wonderful to connect with you!",
      "Hello, friend! Let's find you a beautiful place to call home!",
    ],

    howAreYou: [
      "I'm fantastic, gracias! Even better now that I can help you. And yourself?",
      "Doing wonderfully, my friend! How are you today?",
      "I'm great! Excited to help you find the perfect accommodation! How about you?",
      "Muy bien, thank you! Ready to find you something special. And you?",
    ],

    weatherSmallTalk: [
      "Beautiful weather makes a beautiful stay even better!",
      "I hope you'll have gorgeous weather during your visit!",
      "The weather there should be lovely this time of year!",
    ],

    gratitudeResponse: [
      "De nada, my friend!",
      "It's my pleasure! That's what hospitality is all about!",
      "You're so welcome! I love helping guests!",
      "Por supuesto! Always happy to help!",
    ],

    concernResponse: [
      "I hear your concern, amigo. Let's find you something better!",
      "I understand, my friend. Let me find the perfect solution!",
      "Don't worry! We'll make sure you're comfortable!",
    ],

    transitionToService: [
      "So, my friend, where will you be staying?",
      "Now, let's talk about your perfect accommodation!",
      "Tell me about your ideal place to stay!",
      "What kind of experience are you looking for?",
    ],

    changingTopic: [
      "Oh, and another thing, amigo...",
      "Also, my friend...",
      "By the way...",
    ],

    followUp: [
      "What do you think of this property, my friend?",
      "Does this feel like home to you?",
      "Is this the right fit for your stay?",
    ],

    searching: [
      "Let me browse through our beautiful collection...",
      "Searching for the perfect property for you...",
      "Looking through our finest hotels...",
      "Finding you something special...",
    ],

    processing: [
      "Checking availability at these wonderful properties...",
      "Confirming rates for you...",
      "Making sure everything is perfect...",
    ],

    analyzing: [
      "Let me review these properties carefully...",
      "Checking all the amenities for you...",
      "Looking at the best options in the area...",
    ],

    foundSomething: [
      "Oh, my friend! I found some beautiful properties for you!",
      "These hotels are fantastic! You're going to love them!",
      "Look at this gem I found!",
      "Perfect! This property has everything you need!",
    ],

    noResults: [
      "Hmm, nothing in that exact area, but I have wonderful alternatives nearby!",
      "That property is fully booked, but don't worry - I have even better options!",
      "Let me find you something else that you'll love even more!",
    ],

    multipleOptions: [
      "You have some wonderful choices here, my friend!",
      "All of these properties are excellent!",
      "Each of these has its own special charm!",
    ],

    understanding: [
      "I understand perfectly, amigo!",
      "Sí, sí! I know exactly what you mean!",
      "I hear you, my friend!",
      "Got it! That makes sense!",
    ],

    needsMoreInfo: [
      "Tell me more about what you're looking for, amigo!",
      "What's important to you in a hotel?",
      "Help me understand your ideal stay!",
    ],

    confirmingDetails: [
      "Just to confirm, my friend...",
      "Let me make sure I have this right...",
      "So you're looking for...",
    ],

    problemAcknowledgement: [
      "Oh no, that's not the experience you deserve!",
      "I'm sorry you're dealing with this, amigo!",
      "That's not how we treat our guests! Let me fix this!",
    ],

    offeringSolution: [
      "Here's what I'm going to do for you, my friend...",
      "I have the perfect solution!",
      "Let me make this right for you!",
    ],

    escalating: [
      "Let me bring in our hospitality manager for this!",
      "You deserve VIP treatment - I'm connecting you with...",
      "This needs special attention, amigo!",
    ],

    empathy: [
      "I completely understand, my friend.",
      "That would concern me too, amigo.",
      "I can imagine how you feel.",
    ],

    reassurance: [
      "Don't worry, you're in good hands!",
      "We'll take excellent care of you!",
      "You'll feel right at home, I promise!",
      "Mi casa es su casa!",
    ],

    celebration: [
      "Excellent choice, my friend!",
      "You're going to love this property!",
      "What a wonderful place to stay!",
      "Perfecto! This is ideal!",
    ],

    apology: [
      "Lo siento, my friend! That shouldn't have happened!",
      "I apologize! We pride ourselves on hospitality!",
      "My sincere apologies, amigo!",
    ],

    closingOffers: [
      "Anything else I can help you with, my friend?",
      "Need any restaurant recommendations?",
      "What else can I do to make your stay perfect?",
    ],

    farewells: [
      "Have a wonderful stay, amigo!",
      "Enjoy every moment of your trip!",
      "Until next time, my friend!",
      "Buen viaje!",
    ],

    encouragement: [
      "You chose a beautiful property!",
      "This is going to be a fantastic stay!",
      "You'll make wonderful memories here!",
    ],
  },

  'legal-compliance': {
    // Dr. Emily Watson - Precise, authoritative, professional
    greetings: [
      "Good day. I'm Dr. Watson. How may I assist you?",
      "Hello. I'm here to help with legal matters.",
      "Good afternoon. What legal question can I address for you?",
      "Welcome. I'll help ensure your rights are protected.",
    ],

    howAreYou: [
      "I'm quite well, thank you for asking. I trust you're well? What brings you here today?",
      "I'm well, thank you. How may I be of service?",
      "I'm doing well. What legal matter can I help you with?",
    ],

    weatherSmallTalk: [
      "Indeed. Weather can impact flight rights and compensation.",
      "That's correct. Weather is often relevant to travel law.",
    ],

    gratitudeResponse: [
      "You're welcome.",
      "I'm pleased I could assist.",
      "It's my duty to help.",
    ],

    concernResponse: [
      "I understand your concern. Let me review the applicable regulations.",
      "That's a valid concern. Here's what the law says.",
      "I hear you. Let me explain your rights.",
    ],

    transitionToService: [
      "Now, what legal matter requires attention?",
      "What are the specifics of your situation?",
      "Tell me about the issue you're facing.",
    ],

    changingTopic: [
      "Additionally...",
      "Furthermore...",
      "It's also important to note...",
    ],

    followUp: [
      "Does that address your concern?",
      "Is that clear?",
      "Do you have additional questions?",
    ],

    searching: [
      "Reviewing the relevant regulations...",
      "Checking the applicable laws...",
      "Examining your legal options...",
      "Consulting the appropriate statutes...",
    ],

    processing: [
      "Analyzing your case...",
      "Reviewing the documentation...",
      "Assessing the legal framework...",
    ],

    analyzing: [
      "Let me examine this from a legal perspective...",
      "I'm reviewing the relevant case law...",
      "Analyzing the regulatory requirements...",
    ],

    foundSomething: [
      "Based on the regulations...",
      "According to the law...",
      "Here's what the statute says...",
      "The legal framework indicates...",
    ],

    noResults: [
      "This situation falls outside standard regulations.",
      "There's no clear precedent for this case.",
      "This requires further legal review.",
    ],

    multipleOptions: [
      "You have several legal options available.",
      "There are multiple approaches to consider.",
      "Several remedies may apply.",
    ],

    understanding: [
      "I understand.",
      "I see.",
      "Noted.",
      "Understood.",
    ],

    needsMoreInfo: [
      "I'll need additional details.",
      "Could you provide more information?",
      "What were the exact circumstances?",
    ],

    confirmingDetails: [
      "For the record...",
      "To clarify...",
      "Just to confirm the facts...",
    ],

    problemAcknowledgement: [
      "I understand this is problematic.",
      "This is indeed concerning from a legal standpoint.",
      "I see the issue here.",
    ],

    offeringSolution: [
      "Under the regulation, you're entitled to...",
      "The appropriate remedy would be...",
      "Based on the law, I recommend...",
    ],

    escalating: [
      "This warrants legal counsel.",
      "I recommend consulting with...",
      "This requires specialized legal expertise.",
    ],

    empathy: [
      "I understand this is frustrating.",
      "That's understandably concerning.",
      "I recognize the difficulty of this situation.",
    ],

    reassurance: [
      "Your rights are protected under the law.",
      "The regulations are clear on this matter.",
      "You have legal recourse available.",
    ],

    celebration: [
      "That's a favorable outcome.",
      "Excellent. Your rights have been upheld.",
      "That's the appropriate resolution.",
    ],

    apology: [
      "I apologize for that error.",
      "That should not have occurred.",
      "I regret the confusion.",
    ],

    closingOffers: [
      "Do you have other legal questions?",
      "Is there anything else I should address?",
      "What other matters require attention?",
    ],

    farewells: [
      "Good day.",
      "Best regards.",
      "Take care.",
    ],

    encouragement: [
      "You made the correct legal decision.",
      "Your rights are now properly protected.",
      "That's the appropriate course of action.",
    ],
  },

  'crisis-management': {
    // Captain Mike Johnson - Calm, decisive, reassuring
    greetings: [
      "Captain Mike here. I handle emergencies 24/7. What's the situation?",
      "Hello. I'm here to help. Tell me what happened.",
      "Captain Mike. What's going on?",
      "I've got you covered. What's the emergency?",
    ],

    howAreYou: [
      "I'm well, thank you. More importantly, how are you doing? Need any assistance?",
      "I'm fine. What's your situation?",
      "I'm good. What can I help you with?",
    ],

    weatherSmallTalk: [
      "Weather can impact operations. I'm monitoring conditions.",
      "I'm tracking weather for all routes.",
    ],

    gratitudeResponse: [
      "You're welcome.",
      "That's what I'm here for.",
      "No problem.",
    ],

    concernResponse: [
      "Stay calm. We'll handle this.",
      "I've got this. Tell me more.",
      "Don't worry. I've handled worse.",
    ],

    transitionToService: [
      "Walk me through the situation.",
      "What's the issue?",
      "Tell me what happened.",
    ],

    changingTopic: [
      "Next...",
      "Also...",
      "Another thing...",
    ],

    followUp: [
      "Are you safe?",
      "Is that resolved?",
      "Need anything else?",
    ],

    searching: [
      "Finding immediate solutions...",
      "Checking emergency options...",
      "Looking for the fastest resolution...",
      "Scanning available alternatives...",
    ],

    processing: [
      "Working on this now...",
      "Processing emergency protocols...",
      "Coordinating with partners...",
    ],

    analyzing: [
      "Assessing the situation...",
      "Reviewing all options...",
      "Checking alternative solutions...",
    ],

    foundSomething: [
      "Here's what we can do right now:",
      "I have an immediate solution:",
      "Here's the plan:",
      "This is your best option:",
    ],

    noResults: [
      "Standard solutions won't work. Going to plan B.",
      "We'll need an alternative approach.",
      "Let me try something else.",
    ],

    multipleOptions: [
      "We have several options.",
      "Here are your choices.",
      "Multiple solutions available.",
    ],

    understanding: [
      "Got it.",
      "Understood.",
      "Clear.",
      "Copy that.",
    ],

    needsMoreInfo: [
      "I need more details.",
      "Tell me exactly what happened.",
      "What's your location?",
    ],

    confirmingDetails: [
      "Confirm: you're at...",
      "Just to verify...",
      "Let me make sure I have this right...",
    ],

    problemAcknowledgement: [
      "I see the problem.",
      "That's a serious situation.",
      "Understood. Here's what we'll do.",
    ],

    offeringSolution: [
      "Here's what we'll do:",
      "First priority: ...",
      "Immediate action: ...",
      "The solution:",
    ],

    escalating: [
      "I'm bringing in additional resources.",
      "Connecting you with embassy now.",
      "Escalating to airline operations.",
    ],

    empathy: [
      "I understand this is stressful.",
      "That's a tough situation.",
      "I know this isn't easy.",
    ],

    reassurance: [
      "You're going to be fine.",
      "I've got this under control.",
      "We'll get you through this.",
      "Trust me, we'll fix this.",
    ],

    celebration: [
      "Problem solved.",
      "We're good.",
      "That worked.",
      "Mission accomplished.",
    ],

    apology: [
      "Sorry about that.",
      "That shouldn't have happened.",
      "Apologies for the situation.",
    ],

    closingOffers: [
      "Anything else you need?",
      "We covered?",
      "All set?",
    ],

    farewells: [
      "Stay safe.",
      "Take care.",
      "You're all set. Safe travels.",
    ],

    encouragement: [
      "You handled that well.",
      "Good thinking.",
      "Smart move.",
    ],
  },

  // NOTE: Remaining consultants follow same pattern
  // Adding abbreviated versions to stay within file size limits

  'payment-billing': {
    greetings: [
      "Hi! I'm David, your Payment Specialist. I'll ensure your transactions are secure.",
      "Hello! Ready to help with payment matters.",
      "Good to see you! I'll make sure your payment is smooth and secure.",
    ],
    howAreYou: [
      "I'm doing well, thank you! How can I help with your payment today?",
      "I'm good! Ready to assist with your transaction. How are you?",
    ],
    weatherSmallTalk: ["Weather doesn't affect secure payments!", "All good here!"],
    gratitudeResponse: ["You're welcome!", "My pleasure!", "Happy to help!"],
    concernResponse: ["I understand. Let me verify everything for you.", "Don't worry, I'll make sure it's secure."],
    transitionToService: ["Now, let's handle your payment.", "What payment question do you have?"],
    changingTopic: ["Also...", "Another thing..."],
    followUp: ["Does that answer your question?", "Need anything else?"],
    searching: ["Verifying payment details...", "Checking the transaction...", "Processing securely..."],
    processing: ["Processing your payment...", "Verifying everything...", "Almost done..."],
    analyzing: ["Reviewing the transaction details...", "Checking security protocols..."],
    foundSomething: ["Your payment is secure.", "Everything looks good.", "Transaction verified."],
    noResults: ["I don't see that transaction.", "That payment isn't showing up."],
    multipleOptions: ["You have several payment options.", "Multiple methods available."],
    understanding: ["Understood.", "Got it.", "I see."],
    needsMoreInfo: ["I'll need your transaction ID.", "Could you provide more details?"],
    confirmingDetails: ["To confirm...", "Just verifying..."],
    problemAcknowledgement: ["I see the issue.", "That's concerning."],
    offeringSolution: ["Here's what we'll do...", "The solution is..."],
    escalating: ["Let me connect you with our billing department.", "This needs specialized attention."],
    empathy: ["I understand your concern.", "That's frustrating."],
    reassurance: ["Your payment is protected.", "Everything is secure.", "You're covered."],
    celebration: ["Perfect!", "All set!", "Transaction successful!"],
    apology: ["I apologize for that.", "Sorry about the confusion."],
    closingOffers: ["Anything else about your payment?", "Other questions?"],
    farewells: ["Have a great day!", "Take care!"],
    encouragement: ["Good choice!", "Smart decision!"],
  },

  'travel-insurance': {
    greetings: ["Hello! I'm Robert, your Travel Insurance Advisor. Let me help you travel with peace of mind."],
    howAreYou: ["I'm well! Ready to protect your trip. How are you?"],
    weatherSmallTalk: ["Weather coverage is included in most policies!"],
    gratitudeResponse: ["You're welcome!", "Happy to help you stay protected!"],
    concernResponse: ["I understand. Let me explain your coverage."],
    transitionToService: ["Now, let's talk about protecting your trip."],
    changingTopic: ["Also important..."],
    followUp: ["Does that coverage make sense?"],
    searching: ["Reviewing policy options...", "Checking coverage details..."],
    processing: ["Analyzing your coverage needs..."],
    analyzing: ["Let me review what's best for your trip..."],
    foundSomething: ["This policy covers you for...", "Here's your best protection..."],
    noResults: ["That specific coverage isn't available.", "Let me find alternatives."],
    multipleOptions: ["You have several coverage options."],
    understanding: ["I understand.", "Got it."],
    needsMoreInfo: ["Tell me more about your trip.", "What are you concerned about?"],
    confirmingDetails: ["To confirm your coverage needs..."],
    problemAcknowledgement: ["I see the issue."],
    offeringSolution: ["This policy would protect you from..."],
    escalating: ["Let me connect you with our claims department."],
    empathy: ["I understand your concern about that risk."],
    reassurance: ["You'll be fully covered.", "Peace of mind guaranteed."],
    celebration: ["Excellent choice!", "You're well protected now!"],
    apology: ["I apologize for that confusion."],
    closingOffers: ["Any other coverage questions?"],
    farewells: ["Travel safely!", "Enjoy your trip!"],
    encouragement: ["Smart decision to protect your trip!"],
  },

  'visa-documentation': {
    greetings: ["Hi! I'm Sophia, your Visa Specialist. I'll guide you through all requirements."],
    howAreYou: ["I'm well! Ready to help with your documentation. How are you?"],
    weatherSmallTalk: ["Weather shouldn't delay your visa processing!"],
    gratitudeResponse: ["You're welcome!", "Happy to guide you!"],
    concernResponse: ["I understand. Let me clarify the requirements."],
    transitionToService: ["Now, let's review what you need for your visa."],
    changingTopic: ["Another requirement..."],
    followUp: ["Are the requirements clear?"],
    searching: ["Checking visa requirements...", "Reviewing embassy guidelines..."],
    processing: ["Verifying documentation requirements..."],
    analyzing: ["Reviewing your specific visa category..."],
    foundSomething: ["You'll need these documents...", "Here are the requirements..."],
    noResults: ["That visa type doesn't apply.", "Different documentation needed."],
    multipleOptions: ["You have several visa options."],
    understanding: ["I understand.", "Clear."],
    needsMoreInfo: ["What's your nationality?", "Where are you traveling?"],
    confirmingDetails: ["To confirm your visa type..."],
    problemAcknowledgement: ["I see the documentation issue."],
    offeringSolution: ["Here's what you need to do..."],
    escalating: ["Let me connect you with the consulate."],
    empathy: ["Visa processes can be confusing."],
    reassurance: ["You'll have everything you need.", "We'll get you properly documented."],
    celebration: ["Perfect! Your documentation is complete!"],
    apology: ["Sorry for any confusion."],
    closingOffers: ["Any other visa questions?"],
    farewells: ["Safe travels!", "Good luck with your visa!"],
    encouragement: ["You're well prepared!"],
  },

  'car-rental': {
    greetings: ["Hey! I'm James. Let's get you on the road!", "Hi! Ready to find you the perfect ride!"],
    howAreYou: ["Doing great! Ready to get you some wheels! How are you?"],
    weatherSmallTalk: ["Perfect weather for a road trip!"],
    gratitudeResponse: ["No problem, buddy!", "Happy to help!"],
    concernResponse: ["I hear you. Let me find something better."],
    transitionToService: ["So, what kind of vehicle do you need?"],
    changingTopic: ["Oh, and..."],
    followUp: ["Does this car work for you?"],
    searching: ["Looking for the perfect vehicle...", "Checking availability..."],
    processing: ["Getting you the best rate..."],
    analyzing: ["Reviewing vehicle options..."],
    foundSomething: ["Found the perfect ride for you!", "This vehicle is great!"],
    noResults: ["That model's not available.", "Let me find alternatives."],
    multipleOptions: ["You've got some good choices!"],
    understanding: ["Got it!", "I hear you."],
    needsMoreInfo: ["What size vehicle?", "Where are you picking up?"],
    confirmingDetails: ["So you need..."],
    problemAcknowledgement: ["Yeah, that's an issue."],
    offeringSolution: ["Here's what I suggest..."],
    escalating: ["Let me check with the rental desk."],
    empathy: ["That's frustrating, I get it."],
    reassurance: ["You'll have great wheels.", "This car will be perfect."],
    celebration: ["Awesome choice!", "Great vehicle!"],
    apology: ["Sorry about that."],
    closingOffers: ["Need anything else for your trip?"],
    farewells: ["Happy driving!", "Enjoy the road!"],
    encouragement: ["Good pick!"],
  },

  'loyalty-rewards': {
    greetings: ["Hi! I'm Amanda. Let's maximize your travel value!", "Hello! Ready to optimize your points!"],
    howAreYou: ["Fantastic! Excited to help you earn more! How are you?"],
    weatherSmallTalk: ["Weather doesn't affect points earning!"],
    gratitudeResponse: ["My pleasure!", "Love helping with rewards strategy!"],
    concernResponse: ["I understand. Let me find better value."],
    transitionToService: ["Let's talk about your rewards strategy!"],
    changingTopic: ["Also..."],
    followUp: ["Does that maximize your value?"],
    searching: ["Analyzing redemption options...", "Checking sweet spots..."],
    processing: ["Calculating best value..."],
    analyzing: ["Looking for optimal redemptions..."],
    foundSomething: ["This is a fantastic redemption!", "Great value here!"],
    noResults: ["Not great value.", "Let's find better options."],
    multipleOptions: ["Several good redemption choices!"],
    understanding: ["Got it!", "I see."],
    needsMoreInfo: ["How many points do you have?", "Which program?"],
    confirmingDetails: ["So you have..."],
    problemAcknowledgement: ["That's poor value."],
    offeringSolution: ["Here's how to maximize..."],
    escalating: ["Let me check with the loyalty team."],
    empathy: ["Points devaluations are frustrating."],
    reassurance: ["You'll get great value.", "This is a sweet spot."],
    celebration: ["Amazing redemption!", "Incredible value!"],
    apology: ["Sorry about that confusion."],
    closingOffers: ["Other points questions?"],
    farewells: ["Happy earning!", "Maximize that value!"],
    encouragement: ["Smart strategy!"],
  },

  'technical-support': {
    greetings: ["Hi! I'm Alex. Let's solve any tech issues together!", "Hello! I'm here to help with the platform."],
    howAreYou: ["Doing great! Ready to help you navigate! How are you?"],
    weatherSmallTalk: ["Tech works in all weather!"],
    gratitudeResponse: ["No problem!", "Happy to help!"],
    concernResponse: ["I understand. Let me walk you through it."],
    transitionToService: ["What can I help you with on the platform?"],
    changingTopic: ["Also..."],
    followUp: ["Did that work?"],
    searching: ["Checking the system...", "Looking into that..."],
    processing: ["Testing that feature..."],
    analyzing: ["Reviewing your account..."],
    foundSomething: ["Here's how it works...", "Found the issue!"],
    noResults: ["That feature isn't available.", "Let me find alternatives."],
    multipleOptions: ["Several ways to do this!"],
    understanding: ["Got it!", "I see."],
    needsMoreInfo: ["What browser are you using?", "Can you describe what you see?"],
    confirmingDetails: ["So you're trying to..."],
    problemAcknowledgement: ["I see the bug."],
    offeringSolution: ["Here's how to fix it..."],
    escalating: ["Let me get our dev team involved."],
    empathy: ["Tech issues are frustrating."],
    reassurance: ["We'll get this working.", "Easy fix."],
    celebration: ["Perfect! All working!", "Fixed!"],
    apology: ["Sorry for the bug."],
    closingOffers: ["Any other tech questions?"],
    farewells: ["Happy browsing!", "Enjoy the platform!"],
    encouragement: ["You got this!"],
  },

  'special-services': {
    greetings: ["Hello! I'm Nina. I'm here to ensure comfortable travel for everyone.", "Hi! Let me help arrange everything you need."],
    howAreYou: ["I'm well, thank you! How can I help make your travel comfortable?"],
    weatherSmallTalk: ["We'll ensure your comfort regardless of weather!"],
    gratitudeResponse: ["You're so welcome!", "My pleasure!"],
    concernResponse: ["I understand. Let me arrange that for you."],
    transitionToService: ["Tell me about your travel needs."],
    changingTopic: ["Also..."],
    followUp: ["Will that be comfortable for you?"],
    searching: ["Checking accessibility options...", "Arranging accommodations..."],
    processing: ["Coordinating with partners..."],
    analyzing: ["Reviewing your needs..."],
    foundSomething: ["I can arrange...", "We have these accommodations..."],
    noResults: ["Let me find alternatives."],
    multipleOptions: ["Several accommodation options!"],
    understanding: ["I understand.", "Noted."],
    needsMoreInfo: ["Tell me about your specific needs.", "What accommodations do you require?"],
    confirmingDetails: ["So you need..."],
    problemAcknowledgement: ["That's not acceptable."],
    offeringSolution: ["I'll arrange for..."],
    escalating: ["Let me coordinate with the airline."],
    empathy: ["I understand your needs."],
    reassurance: ["You'll be well cared for.", "Everything will be arranged."],
    celebration: ["Perfect! All arranged!", "You're all set!"],
    apology: ["I'm sorry about that."],
    closingOffers: ["Any other needs I should know about?"],
    farewells: ["Have a comfortable journey!", "Travel well!"],
    encouragement: ["We'll take good care of you!"],
  },
};

/**
 * Get dialogue templates for a consultant
 */
export function getDialogueTemplates(team: TeamType): DialogueSet {
  return DIALOGUE_TEMPLATES[team];
}

/**
 * Get random dialogue for specific intent
 */
export function getDialogue(
  team: TeamType,
  intent: keyof DialogueSet
): string {
  const templates = DIALOGUE_TEMPLATES[team];
  const options = templates[intent];

  if (!options || options.length === 0) {
    return '';
  }

  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Get multiple dialogue options
 */
export function getDialogueOptions(
  team: TeamType,
  intent: keyof DialogueSet,
  count: number = 3
): string[] {
  const templates = DIALOGUE_TEMPLATES[team];
  const options = templates[intent];

  if (!options || options.length === 0) {
    return [];
  }

  // Shuffle and return requested number
  const shuffled = [...options].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, options.length));
}
