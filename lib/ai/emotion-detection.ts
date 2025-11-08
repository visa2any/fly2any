/**
 * Emotion Detection System for AI Travel Assistant
 *
 * This module detects emotional states from user messages and provides
 * appropriate response strategies to make the AI more empathetic and responsive.
 */

import type { TeamType } from './consultant-profiles';

export type EmotionalState =
  | 'frustrated'
  | 'confused'
  | 'excited'
  | 'worried'
  | 'satisfied'
  | 'urgent'
  | 'casual'
  | 'neutral'
  | 'travel_anxiety'
  | 'vacation_excitement'
  | 'business_urgency'
  | 'family_stress'
  | 'budget_concerned'
  | 'first_time_flyer'
  | 'honeymoon_bliss';

export interface EmotionAnalysis {
  emotion: EmotionalState;
  confidence: number; // 0-1
  urgency: 'low' | 'medium' | 'high';
  keywords: string[];
  responseStrategy: 'reassuring' | 'enthusiastic' | 'professional' | 'empathetic';
  typingSpeedMultiplier: number; // e.g., 1.5 for 50% faster, 0.8 for 20% slower
  priority: 'low' | 'medium' | 'high';
}

interface EmotionPattern {
  keywords: RegExp[];
  emotion: EmotionalState;
  confidence: number;
  urgency: 'low' | 'medium' | 'high';
  responseStrategy: 'reassuring' | 'enthusiastic' | 'professional' | 'empathetic';
  typingSpeedMultiplier: number;
  priority: 'low' | 'medium' | 'high';
}

/**
 * Emotion detection patterns
 * Patterns are checked in order of priority (urgent/frustrated first)
 */
const EMOTION_PATTERNS: EmotionPattern[] = [
  // URGENT/EMERGENCY - Highest priority
  {
    keywords: [
      /\b(urgent|emergency|asap|immediately|right now|hurry|quick)\b/i,
      /\b(help|lost|cancelled|stranded|stuck|trapped)\b/i,
      /\b(flight.{0,20}(cancel|delay)|delay.{0,20}flight)\b/i,
      /\b(need.{0,10}now|happening now)\b/i,
    ],
    emotion: 'urgent',
    confidence: 0.9,
    urgency: 'high',
    responseStrategy: 'professional',
    typingSpeedMultiplier: 1.5,
    priority: 'high',
  },

  // FRUSTRATED/ANGRY - High priority
  {
    keywords: [
      /\b(frustrated|angry|upset|mad|furious|annoyed)\b/i,
      /\b(terrible|worst|horrible|awful|pathetic|ridiculous)\b/i,
      /\b(hate|can't stand|fed up|sick of|tired of)\b/i,
      /\b(unacceptable|disappointing|disaster|nightmare)\b/i,
      /\b(what the (hell|heck|fuck)|wtf|seriously\?!)\b/i,
      /\b(this is (crazy|insane|stupid|wrong))\b/i,
    ],
    emotion: 'frustrated',
    confidence: 0.85,
    urgency: 'high',
    responseStrategy: 'empathetic',
    typingSpeedMultiplier: 1.3,
    priority: 'high',
  },

  // WORRIED/ANXIOUS - Medium-high priority
  {
    keywords: [
      /\b(worried|concerned|anxious|nervous|scared|afraid)\b/i,
      /\b(what if|concerned about|worry about)\b/i,
      /\b(safe|safety|secure|security|risk)\b/i,
      /\b(problem|issue|trouble|complication)\b/i,
      /\b(hope (everything|it)|please (help|confirm))\b/i,
    ],
    emotion: 'worried',
    confidence: 0.75,
    urgency: 'medium',
    responseStrategy: 'reassuring',
    typingSpeedMultiplier: 1.0,
    priority: 'medium',
  },

  // CONFUSED - Medium priority
  {
    keywords: [
      /\b(confused|don't understand|unclear|lost|not sure)\b/i,
      /\b(what (does|is|do|are)|how (do|does|can|to))\b/i,
      /\b(explain|clarify|mean|help me understand)\b/i,
      /\b(\?\?|what\?|huh\?|confused about)\b/i,
      /\b(can you (explain|clarify|help))\b/i,
    ],
    emotion: 'confused',
    confidence: 0.75,
    urgency: 'medium',
    responseStrategy: 'reassuring',
    typingSpeedMultiplier: 0.9,
    priority: 'medium',
  },

  // EXCITED/HAPPY - Low-medium priority
  {
    keywords: [
      /\b(excited|thrilled|amazing|perfect|awesome|wonderful)\b/i,
      /\b(great|fantastic|excellent|brilliant|fabulous)\b/i,
      /\b(love|loving|can't wait|looking forward)\b/i,
      /\b(yay|yes!|woohoo|!!!)\b/i,
      /\b(dream (trip|vacation)|bucket list)\b/i,
    ],
    emotion: 'excited',
    confidence: 0.8,
    urgency: 'low',
    responseStrategy: 'enthusiastic',
    typingSpeedMultiplier: 1.1,
    priority: 'low',
  },

  // SATISFIED - Low priority
  {
    keywords: [
      /\b(thank you|thanks|appreciate|helpful|great service)\b/i,
      /\b(perfect|exactly|that's great|wonderful)\b/i,
      /\b(satisfied|happy with|pleased with)\b/i,
      /\b(good|nice|ok|okay|fine)\b/i,
    ],
    emotion: 'satisfied',
    confidence: 0.7,
    urgency: 'low',
    responseStrategy: 'professional',
    typingSpeedMultiplier: 1.0,
    priority: 'low',
  },

  // CASUAL - Low priority
  {
    keywords: [
      /\b(hey|hi|hello|sup|what's up)\b/i,
      /\b(just (wondering|curious|looking|checking))\b/i,
      /\b(maybe|might|possibly|considering)\b/i,
      /\b(lol|haha|btw|tbh)\b/i,
    ],
    emotion: 'casual',
    confidence: 0.6,
    urgency: 'low',
    responseStrategy: 'professional',
    typingSpeedMultiplier: 1.0,
    priority: 'low',
  },

  // ===== TRAVEL-SPECIFIC EMOTIONS =====

  // BUSINESS URGENCY - High priority
  {
    keywords: [
      /\b(business (trip|meeting|conference)|corporate travel)\b/i,
      /\b(need to (be there|arrive|get there) (by|before))\b/i,
      /\b(important (meeting|conference|presentation))\b/i,
      /\b(asap|urgent|time-sensitive|deadline)\b/i,
      /\b(last.{0,10}minute.{0,10}(trip|flight|travel))\b/i,
      /\b(same.{0,10}day.{0,10}(flight|trip))\b/i,
    ],
    emotion: 'business_urgency',
    confidence: 0.85,
    urgency: 'high',
    responseStrategy: 'professional',
    typingSpeedMultiplier: 1.4,
    priority: 'high',
  },

  // TRAVEL ANXIETY (First-time flyers) - Medium-high priority
  {
    keywords: [
      /\b(first (time|flight)|never (flown|traveled))\b/i,
      /\b(afraid (of|to) (fly|flying)|fear of flying)\b/i,
      /\b(nervous (about|to) (fly|flying))\b/i,
      /\b(anxious (about|to) (travel|flying))\b/i,
      /\b(scared (of|to) (fly|flying|travel))\b/i,
      /\b(turbulence|safety concerns)\b/i,
      /\b(never been (abroad|overseas|on a plane))\b/i,
    ],
    emotion: 'travel_anxiety',
    confidence: 0.82,
    urgency: 'medium',
    responseStrategy: 'reassuring',
    typingSpeedMultiplier: 0.9,
    priority: 'medium',
  },

  // BUDGET CONCERNS - Medium priority
  {
    keywords: [
      /\b(cheap|cheapest|budget|affordable)\b/i,
      /\b(save money|good deal|best price)\b/i,
      /\b(too (expensive|much|costly)|price is (high|steep))\b/i,
      /\b(discount|promo|coupon|sale)\b/i,
      /\b(low.{0,10}cost|budget.{0,10}(airline|flight))\b/i,
      /\b(can't afford|tight budget|limited funds)\b/i,
      /\b(price.{0,10}(sensitive|conscious|match))\b/i,
    ],
    emotion: 'budget_concerned',
    confidence: 0.78,
    urgency: 'medium',
    responseStrategy: 'empathetic',
    typingSpeedMultiplier: 1.0,
    priority: 'medium',
  },

  // FAMILY STRESS - Medium priority
  {
    keywords: [
      /\b(traveling with (kids|children|baby|infant|toddler))\b/i,
      /\b(family (trip|vacation|travel))\b/i,
      /\b((kids|children).{0,20}(friendly|appropriate))\b/i,
      /\b(stroller|car seat|diaper|formula)\b/i,
      /\b((multiple|several).{0,10}children)\b/i,
      /\b(parent.{0,10}(traveling|flying))\b/i,
      /\b(family.{0,10}friendly)\b/i,
    ],
    emotion: 'family_stress',
    confidence: 0.76,
    urgency: 'medium',
    responseStrategy: 'empathetic',
    typingSpeedMultiplier: 1.0,
    priority: 'medium',
  },

  // VACATION EXCITEMENT - Low-medium priority
  {
    keywords: [
      /\b(vacation|holiday|getaway)\b/i,
      /\b(can't wait|so excited|really looking forward)\b/i,
      /\b(dream (trip|vacation|destination))\b/i,
      /\b(bucket list|always wanted to)\b/i,
      /\b(celebration|special occasion)\b/i,
      /\b(relaxation|beach|resort|spa)\b/i,
      /\b(adventure|explore|discover)\b/i,
    ],
    emotion: 'vacation_excitement',
    confidence: 0.8,
    urgency: 'low',
    responseStrategy: 'enthusiastic',
    typingSpeedMultiplier: 1.1,
    priority: 'low',
  },

  // HONEYMOON BLISS - Low priority
  {
    keywords: [
      /\b(honeymoon|just (married|got married))\b/i,
      /\b(wedding trip|romantic (getaway|trip))\b/i,
      /\b(newlywed|bride|groom)\b/i,
      /\b(anniversary trip)\b/i,
      /\b(romantic (destination|location))\b/i,
      /\b(couple.{0,10}(trip|vacation|getaway))\b/i,
    ],
    emotion: 'honeymoon_bliss',
    confidence: 0.85,
    urgency: 'low',
    responseStrategy: 'enthusiastic',
    typingSpeedMultiplier: 1.0,
    priority: 'low',
  },

  // FIRST TIME FLYER - Medium priority
  {
    keywords: [
      /\b(first (time|international) (flight|trip))\b/i,
      /\b(never (flown|traveled) (before|internationally))\b/i,
      /\b(new to (flying|traveling))\b/i,
      /\b(don't know (how|what to expect))\b/i,
      /\b(what (should|do) I (bring|pack|expect))\b/i,
      /\b(passport.{0,10}first.{0,10}time)\b/i,
    ],
    emotion: 'first_time_flyer',
    confidence: 0.8,
    urgency: 'medium',
    responseStrategy: 'reassuring',
    typingSpeedMultiplier: 0.9,
    priority: 'medium',
  },
];

/**
 * Detect emotion from user message
 *
 * @param message - The user's message text
 * @returns EmotionAnalysis object with detected emotion and metadata
 */
export function detectEmotion(message: string): EmotionAnalysis {
  const msg = message.toLowerCase();
  const detectedKeywords: string[] = [];

  // Check each pattern in priority order
  for (const pattern of EMOTION_PATTERNS) {
    let matchCount = 0;

    for (const keyword of pattern.keywords) {
      const match = msg.match(keyword);
      if (match) {
        matchCount++;
        detectedKeywords.push(match[0]);
      }
    }

    // If we found matches, calculate confidence based on match count
    if (matchCount > 0) {
      const adjustedConfidence = Math.min(
        pattern.confidence + (matchCount - 1) * 0.05,
        0.95
      );

      return {
        emotion: pattern.emotion,
        confidence: adjustedConfidence,
        urgency: pattern.urgency,
        keywords: detectedKeywords,
        responseStrategy: pattern.responseStrategy,
        typingSpeedMultiplier: pattern.typingSpeedMultiplier,
        priority: pattern.priority,
      };
    }
  }

  // Default to neutral if no patterns matched
  return {
    emotion: 'neutral',
    confidence: 0.5,
    urgency: 'low',
    keywords: [],
    responseStrategy: 'professional',
    typingSpeedMultiplier: 1.0,
    priority: 'low',
  };
}

/**
 * Get empathy marker based on emotional state
 * These are conversational phrases that acknowledge the user's emotional state
 */
export function getEmpathyMarker(
  emotion: EmotionalState,
  language: 'en' | 'pt' | 'es' = 'en'
): string {
  const markers: Record<EmotionalState, Record<'en' | 'pt' | 'es', string[]>> = {
    frustrated: {
      en: [
        "I'm really sorry you're experiencing this frustration.",
        "I understand how frustrating this must be.",
        "I apologize for the inconvenience.",
        "I can see why you'd be upset about this.",
      ],
      pt: [
        "Lamento muito que você esteja passando por essa frustração.",
        "Entendo o quanto isso deve ser frustrante.",
        "Peço desculpas pelo inconveniente.",
        "Posso ver por que você estaria chateado com isso.",
      ],
      es: [
        "Lamento mucho que estés experimentando esta frustración.",
        "Entiendo lo frustrante que debe ser esto.",
        "Me disculpo por el inconveniente.",
        "Puedo ver por qué estarías molesto por esto.",
      ],
    },
    urgent: {
      en: [
        "I understand the urgency.",
        "I'm on it right now.",
        "Let me handle this immediately.",
        "I see this requires immediate attention.",
      ],
      pt: [
        "Entendo a urgência.",
        "Estou cuidando disso agora mesmo.",
        "Deixe-me tratar disso imediatamente.",
        "Vejo que isso requer atenção imediata.",
      ],
      es: [
        "Entiendo la urgencia.",
        "Estoy en ello ahora mismo.",
        "Permíteme manejar esto inmediatamente.",
        "Veo que esto requiere atención inmediata.",
      ],
    },
    worried: {
      en: [
        "I understand your concerns.",
        "That's a valid concern.",
        "Don't worry, we can address this.",
        "Let me help ease your worries.",
      ],
      pt: [
        "Entendo suas preocupações.",
        "Essa é uma preocupação válida.",
        "Não se preocupe, podemos resolver isso.",
        "Deixe-me ajudar a aliviar suas preocupações.",
      ],
      es: [
        "Entiendo tus preocupaciones.",
        "Esa es una preocupación válida.",
        "No te preocupes, podemos abordar esto.",
        "Déjame ayudar a aliviar tus preocupaciones.",
      ],
    },
    confused: {
      en: [
        "No worries, let me explain this clearly.",
        "I understand this can be confusing.",
        "Great question!",
        "Let me break this down for you.",
      ],
      pt: [
        "Sem problemas, deixe-me explicar isso claramente.",
        "Entendo que isso pode ser confuso.",
        "Ótima pergunta!",
        "Deixe-me explicar isso para você.",
      ],
      es: [
        "No te preocupes, déjame explicar esto claramente.",
        "Entiendo que esto puede ser confuso.",
        "¡Excelente pregunta!",
        "Déjame desglosar esto para ti.",
      ],
    },
    excited: {
      en: [
        "That's wonderful!",
        "I'm excited to help you with this!",
        "Great!",
        "I love your enthusiasm!",
      ],
      pt: [
        "Isso é maravilhoso!",
        "Estou animado para ajudá-lo com isso!",
        "Ótimo!",
        "Adoro seu entusiasmo!",
      ],
      es: [
        "¡Eso es maravilloso!",
        "¡Estoy emocionado de ayudarte con esto!",
        "¡Genial!",
        "¡Me encanta tu entusiasmo!",
      ],
    },
    satisfied: {
      en: [
        "I'm glad I could help!",
        "Great to hear that!",
        "Happy to assist!",
        "Wonderful!",
      ],
      pt: [
        "Fico feliz em poder ajudar!",
        "Ótimo ouvir isso!",
        "Feliz em ajudar!",
        "Maravilhoso!",
      ],
      es: [
        "¡Me alegra poder ayudar!",
        "¡Genial escuchar eso!",
        "¡Feliz de asistir!",
        "¡Maravilloso!",
      ],
    },
    casual: {
      en: [
        "Sure thing!",
        "Happy to help!",
        "Of course!",
        "Absolutely!",
      ],
      pt: [
        "Claro!",
        "Feliz em ajudar!",
        "Com certeza!",
        "Absolutamente!",
      ],
      es: [
        "¡Claro!",
        "¡Feliz de ayudar!",
        "¡Por supuesto!",
        "¡Absolutamente!",
      ],
    },
    neutral: {
      en: [
        "I'd be happy to help.",
        "Let me assist you with that.",
        "I'm here to help.",
        "Certainly.",
      ],
      pt: [
        "Terei prazer em ajudar.",
        "Deixe-me ajudá-lo com isso.",
        "Estou aqui para ajudar.",
        "Certamente.",
      ],
      es: [
        "Estaré encantado de ayudar.",
        "Déjame ayudarte con eso.",
        "Estoy aquí para ayudar.",
        "Ciertamente.",
      ],
    },
    // Travel-specific emotions
    travel_anxiety: {
      en: [
        "I understand flying can be nerve-wracking, especially for first-timers.",
        "It's completely normal to feel anxious about flying. Let me help ease your concerns.",
        "I'm here to make your first flight experience as smooth as possible.",
        "Your safety and comfort are our top priorities. I'll guide you through everything.",
      ],
      pt: [
        "Entendo que voar pode ser estressante, especialmente para iniciantes.",
        "É completamente normal se sentir ansioso sobre voar. Deixe-me ajudar a aliviar suas preocupações.",
        "Estou aqui para tornar sua primeira experiência de voo o mais suave possível.",
        "Sua segurança e conforto são nossas principais prioridades. Vou orientá-lo em tudo.",
      ],
      es: [
        "Entiendo que volar puede ser estresante, especialmente para principiantes.",
        "Es completamente normal sentirse ansioso por volar. Déjame ayudar a aliviar tus preocupaciones.",
        "Estoy aquí para hacer que tu primera experiencia de vuelo sea lo más fluida posible.",
        "Tu seguridad y comodidad son nuestras principales prioridades. Te guiaré en todo.",
      ],
    },
    vacation_excitement: {
      en: [
        "How exciting! A vacation is just what you need!",
        "I love planning dream vacations! Let's make this trip unforgettable!",
        "That sounds amazing! Let's find you the perfect getaway.",
        "Your vacation awaits! I'm thrilled to help you plan this!",
      ],
      pt: [
        "Que emocionante! Umas férias são exatamente o que você precisa!",
        "Adoro planejar férias dos sonhos! Vamos tornar esta viagem inesquecível!",
        "Isso parece incrível! Vamos encontrar a escapada perfeita para você.",
        "Suas férias aguardam! Estou animado para ajudá-lo a planejar isso!",
      ],
      es: [
        "¡Qué emocionante! ¡Unas vacaciones son justo lo que necesitas!",
        "¡Me encanta planear vacaciones de ensueño! ¡Hagamos este viaje inolvidable!",
        "¡Eso suena increíble! Vamos a encontrar la escapada perfecta para ti.",
        "¡Tus vacaciones te esperan! ¡Estoy emocionado de ayudarte a planear esto!",
      ],
    },
    business_urgency: {
      en: [
        "I understand this is time-sensitive. Let me find you the fastest options.",
        "Business travel requires efficiency. I'll prioritize speed and convenience.",
        "Got it - let's get you there on time for your important meeting.",
        "I'll focus on direct flights and flexible options for your business trip.",
      ],
      pt: [
        "Entendo que isso é urgente. Deixe-me encontrar as opções mais rápidas para você.",
        "Viagens de negócios exigem eficiência. Vou priorizar velocidade e conveniência.",
        "Entendi - vamos levá-lo lá a tempo para sua reunião importante.",
        "Vou me concentrar em voos diretos e opções flexíveis para sua viagem de negócios.",
      ],
      es: [
        "Entiendo que esto es urgente. Déjame encontrar las opciones más rápidas para ti.",
        "Los viajes de negocios requieren eficiencia. Priorizaré velocidad y conveniencia.",
        "Entendido - te llevaré allí a tiempo para tu reunión importante.",
        "Me centraré en vuelos directos y opciones flexibles para tu viaje de negocios.",
      ],
    },
    family_stress: {
      en: [
        "Traveling with family can be challenging! Let me find family-friendly options.",
        "I'll help make traveling with kids as stress-free as possible.",
        "Family travel requires special attention. I've got you covered!",
        "Let's find flights and accommodations that work perfectly for your family.",
      ],
      pt: [
        "Viajar com a família pode ser desafiador! Deixe-me encontrar opções adequadas para famílias.",
        "Vou ajudar a tornar as viagens com crianças o mais tranquilas possível.",
        "Viagens em família requerem atenção especial. Estou aqui para ajudar!",
        "Vamos encontrar voos e acomodações que funcionem perfeitamente para sua família.",
      ],
      es: [
        "¡Viajar con la familia puede ser desafiante! Déjame encontrar opciones aptas para familias.",
        "Ayudaré a hacer que viajar con niños sea lo más libre de estrés posible.",
        "Los viajes familiares requieren atención especial. ¡Te tengo cubierto!",
        "Vamos a encontrar vuelos y alojamientos que funcionen perfectamente para tu familia.",
      ],
    },
    budget_concerned: {
      en: [
        "I totally understand - let's find you the best value for your money!",
        "Budget travel doesn't mean sacrificing quality. Let me find great deals!",
        "I'll help you save money while still getting a great travel experience.",
        "Smart spending is important. I'll find you affordable options without compromising.",
      ],
      pt: [
        "Eu entendo completamente - vamos encontrar o melhor valor para seu dinheiro!",
        "Viajar com orçamento não significa sacrificar qualidade. Deixe-me encontrar ótimas ofertas!",
        "Vou ajudá-lo a economizar dinheiro enquanto ainda tem uma ótima experiência de viagem.",
        "Gastar com sabedoria é importante. Vou encontrar opções acessíveis sem comprometer.",
      ],
      es: [
        "¡Lo entiendo totalmente - vamos a encontrar el mejor valor por tu dinero!",
        "Viajar con presupuesto no significa sacrificar calidad. ¡Déjame encontrar grandes ofertas!",
        "Te ayudaré a ahorrar dinero mientras aún tienes una gran experiencia de viaje.",
        "Gastar inteligentemente es importante. Encontraré opciones asequibles sin comprometer.",
      ],
    },
    first_time_flyer: {
      en: [
        "Congratulations on your first flight! I'll guide you through every step.",
        "First-time flying is exciting! Let me help you prepare.",
        "I'll make sure you have all the information you need for your first flight.",
        "Welcome to the world of travel! I'm here to answer all your questions.",
      ],
      pt: [
        "Parabéns pelo seu primeiro voo! Vou orientá-lo em cada etapa.",
        "Voar pela primeira vez é emocionante! Deixe-me ajudá-lo a se preparar.",
        "Vou garantir que você tenha todas as informações necessárias para seu primeiro voo.",
        "Bem-vindo ao mundo das viagens! Estou aqui para responder todas as suas perguntas.",
      ],
      es: [
        "¡Felicitaciones por tu primer vuelo! Te guiaré en cada paso.",
        "¡Volar por primera vez es emocionante! Déjame ayudarte a prepararte.",
        "Me aseguraré de que tengas toda la información que necesitas para tu primer vuelo.",
        "¡Bienvenido al mundo de los viajes! Estoy aquí para responder todas tus preguntas.",
      ],
    },
    honeymoon_bliss: {
      en: [
        "Congratulations on your wedding! Let's plan the perfect honeymoon!",
        "How romantic! I'll help you create unforgettable honeymoon memories.",
        "A honeymoon is so special! Let me find you the most romantic destinations.",
        "Newlyweds deserve the best! Let's make your honeymoon magical!",
      ],
      pt: [
        "Parabéns pelo casamento! Vamos planejar a lua de mel perfeita!",
        "Que romântico! Vou ajudá-lo a criar memórias inesquecíveis de lua de mel.",
        "Uma lua de mel é tão especial! Deixe-me encontrar os destinos mais românticos para você.",
        "Recém-casados merecem o melhor! Vamos tornar sua lua de mel mágica!",
      ],
      es: [
        "¡Felicitaciones por tu boda! ¡Vamos a planear la luna de miel perfecta!",
        "¡Qué romántico! Te ayudaré a crear recuerdos inolvidables de luna de miel.",
        "¡Una luna de miel es tan especial! Déjame encontrar los destinos más románticos para ti.",
        "¡Los recién casados merecen lo mejor! ¡Hagamos tu luna de miel mágica!",
      ],
    },
  };

  const emotionMarkers = markers[emotion]?.[language] || markers.neutral[language];
  return emotionMarkers[Math.floor(Math.random() * emotionMarkers.length)];
}

/**
 * Get appropriate consultant for emotional state
 * Some emotions (like urgent/frustrated) should route to crisis management
 */
export function getConsultantForEmotion(
  emotion: EmotionalState,
  defaultConsultantTeam: TeamType
): TeamType {
  switch (emotion) {
    case 'urgent':
    case 'frustrated':
      // Route to crisis management for urgent/frustrated cases
      return 'crisis-management';

    case 'worried':
      // Worried customers might benefit from customer service
      return 'customer-service';

    default:
      // For other emotions, keep the default consultant
      return defaultConsultantTeam;
  }
}

/**
 * Calculate typing delay based on emotion
 *
 * @param baseDelay - Base delay in milliseconds (e.g., 1500)
 * @param emotion - Detected emotional state
 * @returns Adjusted delay in milliseconds
 */
export function getTypingDelay(
  baseDelay: number,
  emotionAnalysis: EmotionAnalysis
): number {
  return Math.round(baseDelay / emotionAnalysis.typingSpeedMultiplier);
}

/**
 * Get visual indicator for emotion
 * Returns CSS classes and color schemes for UI adjustments
 */
export function getEmotionVisualIndicator(emotion: EmotionalState): {
  color: string;
  bgColor: string;
  borderColor: string;
  pulseAnimation: boolean;
  iconColor: string;
} {
  const indicators: Record<EmotionalState, {
    color: string;
    bgColor: string;
    borderColor: string;
    pulseAnimation: boolean;
    iconColor: string;
  }> = {
    urgent: {
      color: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300',
      pulseAnimation: true,
      iconColor: 'text-red-600',
    },
    frustrated: {
      color: 'text-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-300',
      pulseAnimation: false,
      iconColor: 'text-orange-600',
    },
    worried: {
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-300',
      pulseAnimation: false,
      iconColor: 'text-yellow-600',
    },
    confused: {
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      pulseAnimation: false,
      iconColor: 'text-blue-600',
    },
    excited: {
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      pulseAnimation: false,
      iconColor: 'text-green-600',
    },
    satisfied: {
      color: 'text-teal-700',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-300',
      pulseAnimation: false,
      iconColor: 'text-teal-600',
    },
    casual: {
      color: 'text-gray-700',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-300',
      pulseAnimation: false,
      iconColor: 'text-gray-600',
    },
    neutral: {
      color: 'text-gray-700',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      pulseAnimation: false,
      iconColor: 'text-gray-600',
    },
    // Travel-specific emotions
    travel_anxiety: {
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-300',
      pulseAnimation: false,
      iconColor: 'text-amber-600',
    },
    vacation_excitement: {
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-300',
      pulseAnimation: false,
      iconColor: 'text-emerald-600',
    },
    business_urgency: {
      color: 'text-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-300',
      pulseAnimation: true,
      iconColor: 'text-purple-600',
    },
    family_stress: {
      color: 'text-pink-700',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-300',
      pulseAnimation: false,
      iconColor: 'text-pink-600',
    },
    budget_concerned: {
      color: 'text-cyan-700',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-300',
      pulseAnimation: false,
      iconColor: 'text-cyan-600',
    },
    first_time_flyer: {
      color: 'text-indigo-700',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-300',
      pulseAnimation: false,
      iconColor: 'text-indigo-600',
    },
    honeymoon_bliss: {
      color: 'text-rose-700',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-300',
      pulseAnimation: false,
      iconColor: 'text-rose-600',
    },
  };

  return indicators[emotion];
}
