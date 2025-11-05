/**
 * Natural Language Processing Helpers
 *
 * Transform robotic phrases into natural, human-like language
 */

export interface NaturalLanguageOptions {
  useContractions?: boolean;
  addFillers?: boolean;
  varyStructure?: boolean;
  conversationalTone?: boolean;
}

/**
 * Transform robotic text to natural language
 */
export function makeNatural(
  text: string,
  options: NaturalLanguageOptions = {}
): string {
  const {
    useContractions = true,
    addFillers = false,
    varyStructure = true,
    conversationalTone = true,
  } = options;

  let natural = text;

  // Replace robotic patterns
  natural = replaceRoboticPatterns(natural);

  // Add contractions if enabled
  if (useContractions) {
    natural = addContractions(natural);
  }

  // Remove overly formal language
  if (conversationalTone) {
    natural = makeConversational(natural);
  }

  // Vary sentence structure
  if (varyStructure) {
    natural = improveVariety(natural);
  }

  // Add natural fillers (sparingly!)
  if (addFillers) {
    natural = addNaturalFillers(natural);
  }

  return natural;
}

/**
 * Robotic to natural phrase mappings
 */
const ROBOTIC_TO_NATURAL: Record<string, string[]> = {
  // Searching/Finding
  'I will search for': ["I'll find", "Let me look for", "I'll search for"],
  'I will find': ["I'll find", "Let me find", "I'll look for"],
  'I am searching for': ["I'm looking for", "I'm searching for", "Let me find"],
  'I have located': ["I found", "I've found", "Here's what I found:"],

  // Helping/Assisting
  'I will assist you': ["I'll help you", "Let me help you", "I'd be happy to help you"],
  'I will help you': ["I'll help you", "Let me help you", "I can help you"],
  'I am able to': ["I can", "I'd be happy to", "I'll"],
  'I would be pleased to': ["I'd be happy to", "I'd love to", "I'll gladly"],

  // Presenting results
  'Here are the results': ["Here's what I found:", "Check out these options:", "I found these:"],
  'The following options': ["Here are some options:", "These options:", "You can choose from:"],
  'Please find below': ["Here's what I found:", "Here you go:", "Take a look at these:"],

  // Questions
  'Do you require': ["Do you need", "Would you like", "Need"],
  'Would you like me to': ["Should I", "Want me to", "Shall I"],
  'Do you need assistance': ["Can I help you with anything else", "Need anything else", "What else can I help with"],

  // Confirmations
  'I have confirmed': ["I've confirmed", "I confirmed", "All set -"],
  'I have verified': ["I've verified", "I checked", "I've checked"],
  'I have completed': ["I've completed", "Done!", "All finished -"],

  // Information requests
  'Please provide': ["Could you provide", "I'll need", "Can you share"],
  'Kindly provide': ["Could you provide", "Please share", "I'll need"],
  'I require': ["I'll need", "I need", "Could you provide"],

  // Understanding
  'I understand that': ["I see that", "Got it -", "I understand"],
  'I comprehend': ["I understand", "I see", "I get it"],
  'I acknowledge': ["Got it", "Understood", "I see"],

  // Recommendations
  'I recommend that you': ["I'd suggest", "You might want to", "I recommend"],
  'I suggest that you': ["I'd suggest", "You could", "You might want to"],
  'It is advisable': ["I'd recommend", "It's best to", "You should probably"],

  // Apologies
  'I apologize for the inconvenience': ["I'm sorry about that", "My apologies", "Sorry for the trouble"],
  'I regret to inform you': ["Unfortunately", "I'm sorry to say", "I'm afraid"],

  // Thank you
  'I thank you for': ["Thank you for", "Thanks for", "I appreciate"],
  'I appreciate your': ["Thanks for your", "I appreciate your", "Thank you for your"],

  // Conclusions
  'In conclusion': ["So", "To sum up", "Bottom line"],
  'To summarize': ["In short", "To recap", "So"],
  'Therefore': ["So", "That means", "Which means"],
};

/**
 * Replace robotic patterns with natural alternatives
 */
function replaceRoboticPatterns(text: string): string {
  let natural = text;

  for (const [robotic, alternatives] of Object.entries(ROBOTIC_TO_NATURAL)) {
    const regex = new RegExp(robotic, 'gi');
    if (regex.test(natural)) {
      const replacement = alternatives[Math.floor(Math.random() * alternatives.length)];
      natural = natural.replace(regex, replacement);
    }
  }

  return natural;
}

/**
 * Add contractions for natural speech
 */
function addContractions(text: string): string {
  const contractions: Record<string, string> = {
    'I will': "I'll",
    'I would': "I'd",
    'I have': "I've",
    'I am': "I'm",
    'you will': "you'll",
    'you would': "you'd",
    'you have': "you've",
    'you are': "you're",
    'we will': "we'll",
    'we would': "we'd",
    'we have': "we've",
    'we are': "we're",
    'that is': "that's",
    'it is': "it's",
    'there is': "there's",
    'here is': "here's",
    'what is': "what's",
    'who is': "who's",
    'where is': "where's",
    'cannot': "can't",
    'do not': "don't",
    'does not': "doesn't",
    'did not': "didn't",
    'will not': "won't",
    'would not': "wouldn't",
    'should not': "shouldn't",
    'could not': "couldn't",
    'have not': "haven't",
    'has not': "hasn't",
    'had not': "hadn't",
    'is not': "isn't",
    'are not': "aren't",
    'was not': "wasn't",
    'were not': "weren't",
  };

  let contracted = text;

  for (const [full, contraction] of Object.entries(contractions)) {
    const regex = new RegExp(`\\b${full}\\b`, 'gi');
    contracted = contracted.replace(regex, (match) => {
      // Preserve case
      if (match[0] === match[0].toUpperCase()) {
        return contraction.charAt(0).toUpperCase() + contraction.slice(1);
      }
      return contraction;
    });
  }

  return contracted;
}

/**
 * Make language more conversational
 */
function makeConversational(text: string): string {
  let conversational = text;

  // Replace formal words with casual equivalents
  const formalToCasual: Record<string, string> = {
    'utilize': 'use',
    'facilitate': 'help',
    'implement': 'do',
    'commence': 'start',
    'terminate': 'end',
    'endeavor': 'try',
    'assist': 'help',
    'obtain': 'get',
    'purchase': 'buy',
    'regarding': 'about',
    'concerning': 'about',
    'subsequently': 'then',
    'prior to': 'before',
    'in order to': 'to',
    'at this time': 'now',
    'in the event that': 'if',
    'due to the fact that': 'because',
  };

  for (const [formal, casual] of Object.entries(formalToCasual)) {
    const regex = new RegExp(`\\b${formal}\\b`, 'gi');
    conversational = conversational.replace(regex, casual);
  }

  return conversational;
}

/**
 * Add natural sentence variety
 */
function improveVariety(text: string): string {
  // Split into sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

  if (sentences.length < 2) return text;

  // Check for repetitive sentence starts
  const starts = sentences.map(s => {
    const trimmed = s.trim();
    const firstWord = trimmed.split(' ')[0];
    return firstWord.toLowerCase();
  });

  // If too many sentences start the same way, vary them
  let varied = sentences.map((sentence, i) => {
    if (i > 0 && starts[i] === starts[i - 1]) {
      // Add variety by prepending a transition
      const transitions = ['Also, ', 'Additionally, ', 'Plus, ', 'And '];
      const transition = transitions[Math.floor(Math.random() * transitions.length)];

      // Only if sentence doesn't already start with a transition
      if (!sentence.trim().match(/^(Also|Additionally|Plus|And|But|However|Furthermore)/i)) {
        return transition + sentence.trim().charAt(0).toLowerCase() + sentence.trim().slice(1);
      }
    }
    return sentence;
  });

  return varied.join(' ');
}

/**
 * Add natural fillers (use very sparingly!)
 */
function addNaturalFillers(text: string): string {
  // Only add fillers 20% of the time
  if (Math.random() > 0.2) return text;

  const fillers = [
    'Let me see... ',
    'Hmm, ',
    'Okay, ',
    'Alright, ',
    'Well, ',
  ];

  const filler = fillers[Math.floor(Math.random() * fillers.length)];

  // Only add at the beginning of the text
  if (!text.match(/^(Let me|Hmm|Okay|Alright|Well)/i)) {
    return filler + text.charAt(0).toLowerCase() + text.slice(1);
  }

  return text;
}

/**
 * Convert bullet points to natural language
 */
export function bulletPointsToNatural(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;

  // For 3+ items, use comma-separated list with "and" before last item
  const allButLast = items.slice(0, -1).join(', ');
  const last = items[items.length - 1];

  return `${allButLast}, and ${last}`;
}

/**
 * Add personal touch with pronouns
 */
export function addPersonalPronouns(text: string): string {
  let personal = text;

  // Replace passive voice with active when appropriate
  personal = personal.replace(/can be done/gi, 'we can do');
  personal = personal.replace(/will be provided/gi, "I'll provide");
  personal = personal.replace(/is recommended/gi, 'I recommend');
  personal = personal.replace(/should be noted/gi, 'you should note');

  return personal;
}

/**
 * Add emphasis appropriately
 */
export function addEmphasis(
  text: string,
  points: string[]
): string {
  let emphasized = text;

  for (const point of points) {
    // Add emphasis words before important points
    const emphasisWords = ['really', 'definitely', 'especially', 'particularly'];
    const word = emphasisWords[Math.floor(Math.random() * emphasisWords.length)];

    const regex = new RegExp(`\\b${point}\\b`, 'i');
    if (regex.test(emphasized) && Math.random() < 0.5) {
      emphasized = emphasized.replace(regex, `${word} ${point}`);
    }
  }

  return emphasized;
}

/**
 * Remove overly technical jargon
 */
export function simplifyJargon(
  text: string,
  context: 'beginner' | 'intermediate' | 'expert' = 'intermediate'
): string {
  if (context === 'expert') return text; // Keep technical for experts

  const jargonMap: Record<string, string> = {
    'utilize': 'use',
    'leverage': 'use',
    'synergy': 'working together',
    'paradigm': 'approach',
    'bandwidth': 'time',
    'circle back': 'follow up',
    'touch base': 'check in',
    'deep dive': 'detailed look',
    'low-hanging fruit': 'easy wins',
    'move the needle': 'make progress',
  };

  let simplified = text;

  for (const [jargon, simple] of Object.entries(jargonMap)) {
    const regex = new RegExp(`\\b${jargon}\\b`, 'gi');
    simplified = simplified.replace(regex, simple);
  }

  return simplified;
}

/**
 * Add validating language
 */
export function addValidation(text: string): string {
  const validations = [
    "That's a great question. ",
    "Good thinking! ",
    "Smart question. ",
    "I'm glad you asked. ",
  ];

  // Only add validation 30% of the time and only at the start
  if (Math.random() < 0.3 && !text.match(/^(That's|Good|Smart|I'm glad)/i)) {
    const validation = validations[Math.floor(Math.random() * validations.length)];
    return validation + text;
  }

  return text;
}

/**
 * Make explanations more relatable with analogies
 */
export function addAnalogy(concept: string, analogy: string): string {
  const templates = [
    `Think of it like ${analogy} - ${concept}`,
    `It's similar to ${analogy}. ${concept}`,
    `Just like ${analogy}, ${concept}`,
    `You know how ${analogy}? Well, ${concept}`,
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Add empathetic language
 */
export function addEmpathy(
  text: string,
  situation: 'frustration' | 'confusion' | 'urgency' | 'satisfaction'
): string {
  const empathyPhrases = {
    frustration: [
      "I understand that can be frustrating. ",
      "I can see why that would be frustrating. ",
      "I'm sorry you're experiencing this. ",
    ],
    confusion: [
      "I can see how that might be confusing. ",
      "Let me clarify that for you. ",
      "That's a common point of confusion. ",
    ],
    urgency: [
      "I understand this is time-sensitive. ",
      "I know you need this quickly. ",
      "I'll prioritize this for you. ",
    ],
    satisfaction: [
      "I'm so glad that worked out! ",
      "That's wonderful! ",
      "I'm happy I could help! ",
    ],
  };

  const phrases = empathyPhrases[situation];
  const phrase = phrases[Math.floor(Math.random() * phrases.length)];

  return phrase + text;
}
