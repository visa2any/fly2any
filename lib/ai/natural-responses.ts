/**
 * Natural Response Generation
 * Generates human-like responses based on consultant personality and context
 */

import { ConversationContext, IntentType } from './conversation-context';

export interface ConsultantPersonality {
  name: string;
  personality: string;
  emoji: string;
  traits: {
    warmth: number; // 1-10
    formality: number; // 1-10
    enthusiasm: number; // 1-10
    verbosity: number; // 1-10
  };
}

// Define consultant personalities
export const CONSULTANTS: Record<string, ConsultantPersonality> = {
  lisa: {
    name: 'Lisa Thompson',
    personality: 'friendly',
    emoji: '😊',
    traits: {
      warmth: 10,
      formality: 3,
      enthusiasm: 9,
      verbosity: 7
    }
  },
  sarah: {
    name: 'Sarah Chen',
    personality: 'professional',
    emoji: '✨',
    traits: {
      warmth: 7,
      formality: 7,
      enthusiasm: 6,
      verbosity: 5
    }
  },
  marcus: {
    name: 'Marcus Rodriguez',
    personality: 'warm',
    emoji: '🌟',
    traits: {
      warmth: 9,
      formality: 4,
      enthusiasm: 8,
      verbosity: 6
    }
  },
  mike: {
    name: 'Captain Mike',
    personality: 'calm',
    emoji: '✈️',
    traits: {
      warmth: 6,
      formality: 8,
      enthusiasm: 5,
      verbosity: 4
    }
  }
};

/**
 * Generate natural response based on intent, consultant, and context
 */
export function generateNaturalResponse(
  intent: IntentType,
  consultant: { name: string; personality: string; emoji: string },
  context: ConversationContext,
  sentiment: 'positive' | 'neutral' | 'negative' | 'curious' = 'neutral',
  language: 'en' | 'pt' | 'es' = 'en'
): string {
  // Get consultant personality or use default
  const consultantKey = consultant.name.toLowerCase().split(' ')[0];
  const personality = CONSULTANTS[consultantKey] || CONSULTANTS.lisa;

  switch (intent) {
    case 'greeting':
      return generateGreetingResponse(personality, context, sentiment, language);
    case 'how-are-you':
      return generateHowAreYouResponse(personality, context, language);
    case 'small-talk':
      return generateSmallTalkResponse(personality, context, sentiment, language);
    case 'personal-question':
      return generatePersonalQuestionResponse(personality, context, language);
    case 'gratitude':
      return generateGratitudeResponse(personality, context, language);
    case 'destination-recommendation':
      return generateDestinationRecommendationResponse(personality, context, sentiment, language);
    case 'casual':
      return generateCasualResponse(personality, context, sentiment, language);
    case 'farewell':
      return generateFarewellResponse(personality, context, language);
    default:
      return generateDefaultResponse(personality, context, language);
  }
}

/**
 * Generate greeting response
 */
function generateGreetingResponse(
  personality: ConsultantPersonality,
  context: ConversationContext,
  sentiment: 'positive' | 'neutral' | 'negative' | 'curious',
  language: 'en' | 'pt' | 'es'
): string {
  // First time greeting
  if (context.isNewConversation()) {
    const responses = getGreetingResponses(personality, language);
    return selectUniqueResponse(responses, context);
  }

  // Returning greeting (if user says hi again)
  const returningGreetings = getReturningGreetings(personality, language);
  return selectUniqueResponse(returningGreetings, context);
}

/**
 * Get initial greeting responses
 */
function getGreetingResponses(personality: ConsultantPersonality, language: 'en' | 'pt' | 'es'): string[] {
  if (personality.traits.warmth >= 9) {
    // Very warm (Lisa, Marcus)
    if (language === 'pt') {
      return [
        `Olá! ${personality.emoji} Como você está hoje?`,
        `Oi! É tão bom falar com você! ${personality.emoji} Como está o seu dia?`,
        `Oi! ${personality.emoji} Como vai? Espero que esteja tendo um dia maravilhoso!`,
        `Olá! ${personality.emoji} Que bom que você está aqui! Como você está?`,
        `Olá! ${personality.emoji} Como está tudo com você hoje?`
      ];
    } else if (language === 'es') {
      return [
        `¡Hola! ${personality.emoji} ¿Cómo estás hoy?`,
        `¡Hola! ¡Es tan encantador hablar contigo! ${personality.emoji} ¿Cómo va tu día?`,
        `¡Hey! ${personality.emoji} ¿Cómo estás? ¡Espero que estés teniendo un día maravilloso!`,
        `¡Hola! ${personality.emoji} ¡Me alegra que estés aquí! ¿Cómo estás?`,
        `¡Hola! ${personality.emoji} ¿Cómo está todo contigo hoy?`
      ];
    }
    return [
      `Hi there! ${personality.emoji} How are you doing today?`,
      `Hello! It's so lovely to hear from you! ${personality.emoji} How's your day going?`,
      `Hey! ${personality.emoji} How are you? Hope you're having a wonderful day!`,
      `Hi! ${personality.emoji} So glad you're here! How are you doing?`,
      `Hello there! ${personality.emoji} How's everything with you today?`
    ];
  }

  if (personality.traits.formality >= 7) {
    // More formal (Sarah, Captain Mike)
    if (language === 'pt') {
      return [
        `Olá! ${personality.emoji} Como você está hoje?`,
        `Bom dia! ${personality.emoji} Como posso ajudá-lo?`,
        `Olá! ${personality.emoji} Como você está hoje?`,
        `Oi! ${personality.emoji} Como estão as coisas?`,
        `Saudações! ${personality.emoji} Como você está hoje?`
      ];
    } else if (language === 'es') {
      return [
        `¡Hola! ${personality.emoji} ¿Cómo estás hoy?`,
        `¡Buenos días! ${personality.emoji} ¿Cómo puedo ayudarte?`,
        `¡Hola! ${personality.emoji} ¿Cómo estás hoy?`,
        `¡Hola! ${personality.emoji} ¿Cómo van las cosas?`,
        `¡Saludos! ${personality.emoji} ¿Cómo estás hoy?`
      ];
    }
    return [
      `Hello! ${personality.emoji} How are you today?`,
      `Good day! ${personality.emoji} How may I assist you?`,
      `Hello there! ${personality.emoji} How are you doing today?`,
      `Hi! ${personality.emoji} How are things with you?`,
      `Greetings! ${personality.emoji} How are you today?`
    ];
  }

  // Balanced
  if (language === 'pt') {
    return [
      `Oi! ${personality.emoji} Como você está hoje?`,
      `Olá! ${personality.emoji} Como vai?`,
      `Oi! ${personality.emoji} Como você está?`,
      `Oi! ${personality.emoji} Como estão as coisas?`,
      `Olá! ${personality.emoji} Como está o seu dia?`
    ];
  } else if (language === 'es') {
    return [
      `¡Hola! ${personality.emoji} ¿Cómo estás hoy?`,
      `¡Hola! ${personality.emoji} ¿Qué tal?`,
      `¡Hey! ${personality.emoji} ¿Cómo estás?`,
      `¡Hola! ${personality.emoji} ¿Cómo van las cosas?`,
      `¡Hola! ${personality.emoji} ¿Cómo va tu día?`
    ];
  }
  return [
    `Hi! ${personality.emoji} How are you today?`,
    `Hello! ${personality.emoji} How's it going?`,
    `Hey there! ${personality.emoji} How are you doing?`,
    `Hi! ${personality.emoji} How are things?`,
    `Hello! ${personality.emoji} How's your day?`
  ];
}

/**
 * Get returning greeting responses
 */
function getReturningGreetings(personality: ConsultantPersonality, language: 'en' | 'pt' | 'es'): string[] {
  if (personality.traits.warmth >= 9) {
    if (language === 'pt') {
      return [
        `Oi de novo! ${personality.emoji} Como posso ajudar?`,
        `Oi! ${personality.emoji} Que bom falar com você de novo!`,
        `Olá! ${personality.emoji} O que você tem em mente?`,
        `Oi! ${personality.emoji} Como posso ajudá-lo?`
      ];
    } else if (language === 'es') {
      return [
        `¡Hey de nuevo! ${personality.emoji} ¿En qué puedo ayudarte?`,
        `¡Hola! ${personality.emoji} ¡Qué bueno hablar contigo otra vez!`,
        `¡Hola! ${personality.emoji} ¿Qué tienes en mente?`,
        `¡Hey! ${personality.emoji} ¿Cómo puedo ayudarte?`
      ];
    }
    return [
      `Hey again! ${personality.emoji} What can I help you with?`,
      `Hi! ${personality.emoji} Good to hear from you again!`,
      `Hello! ${personality.emoji} What's on your mind?`,
      `Hey! ${personality.emoji} How can I help you?`
    ];
  }

  if (language === 'pt') {
    return [
      `Olá novamente! ${personality.emoji} Como posso ajudar?`,
      `Oi! ${personality.emoji} O que posso fazer por você?`,
      `Olá! ${personality.emoji} Do que você precisa?`,
      `Oi! ${personality.emoji} Como posso ajudar?`
    ];
  } else if (language === 'es') {
    return [
      `¡Hola de nuevo! ${personality.emoji} ¿Cómo puedo ayudarte?`,
      `¡Hola! ${personality.emoji} ¿Qué puedo hacer por ti?`,
      `¡Hola! ${personality.emoji} ¿Qué necesitas?`,
      `¡Hola! ${personality.emoji} ¿Cómo puedo ayudar?`
    ];
  }
  return [
    `Hello again! ${personality.emoji} How can I assist?`,
    `Hi! ${personality.emoji} What can I do for you?`,
    `Hello! ${personality.emoji} What do you need?`,
    `Hi there! ${personality.emoji} How can I help?`
  ];
}

/**
 * Generate "how are you" response
 */
function generateHowAreYouResponse(
  personality: ConsultantPersonality,
  context: ConversationContext,
  language: 'en' | 'pt' | 'es'
): string {
  // Don't repeat if we already answered
  if (context.hasInteracted('how-are-you')) {
    return generateFollowUpResponse(personality, context, language);
  }

  if (personality.traits.warmth >= 9) {
    // Very warm - Responses for reciprocal greetings ("Fine, and you?")
    let responses: string[];
    if (language === 'pt') {
      responses = [
        `Estou ótima, obrigada por perguntar! ${personality.emoji} Que bom saber que você está bem! O que te traz aqui hoje?`,
        `Ah, estou maravilhosa, obrigada! ${personality.emoji} Tão feliz em saber que você está bem! Como posso ajudar?`,
        `Estou fantástica, obrigada! ${personality.emoji} Que bom que você está bem! O que posso fazer por você hoje?`,
        `Estou tendo um dia lindo, obrigada! ${personality.emoji} Que ótimo saber que você está bem! O que está procurando hoje?`,
        `Estou muito bem, obrigada por perguntar! ${personality.emoji} Que bom que você está bem! Como posso ajudar?`
      ];
    } else if (language === 'es') {
      responses = [
        `¡Estoy muy bien, gracias por preguntar! ${personality.emoji} ¡Me alegra saber que estás bien! ¿Qué te trae aquí hoy?`,
        `¡Ay, estoy maravillosa, gracias! ${personality.emoji} ¡Tan feliz de saber que estás bien! ¿Cómo puedo ayudarte?`,
        `¡Estoy fantástica, gracias! ${personality.emoji} ¡Qué bueno que estás bien! ¿Qué puedo hacer por ti hoy?`,
        `¡Estoy teniendo un día encantador, gracias! ${personality.emoji} ¡Qué bien que estés bien! ¿Qué estás buscando hoy?`,
        `¡Estoy muy bien, gracias por preguntar! ${personality.emoji} ¡Me alegra que estés bien! ¿Cómo puedo ayudar?`
      ];
    } else {
      responses = [
        `I'm doing great, thanks for asking! ${personality.emoji} Glad to hear you're doing well! What brings you here today?`,
        `Aw, I'm wonderful, thank you! ${personality.emoji} So happy to hear you're doing fine! How can I help you?`,
        `I'm doing fantastic, thank you! ${personality.emoji} That's lovely that you're doing well! What can I do for you today?`,
        `I'm having a lovely day, thanks! ${personality.emoji} Great to hear you're doing good! What are you looking for today?`,
        `I'm doing really well, thanks for asking! ${personality.emoji} Glad you're doing fine! What can I help you with?`
      ];
    }
    return selectUniqueResponse(responses, context);
  }

  if (personality.traits.formality >= 7) {
    // More formal
    let responses: string[];
    if (language === 'pt') {
      responses = [
        `Estou bem, obrigada por perguntar. ${personality.emoji} Como você está hoje?`,
        `Muito bem, obrigada. ${personality.emoji} E você?`,
        `Estou muito bem, obrigada. ${personality.emoji} E como você está?`,
        `Estou bem, obrigada por perguntar. ${personality.emoji} Como estão as coisas com você?`
      ];
    } else if (language === 'es') {
      responses = [
        `Estoy bien, gracias por preguntar. ${personality.emoji} ¿Cómo estás hoy?`,
        `Muy bien, gracias. ${personality.emoji} ¿Y tú?`,
        `Estoy muy bien, gracias. ${personality.emoji} ¿Y cómo estás?`,
        `Estoy bien, gracias por preguntar. ${personality.emoji} ¿Cómo van las cosas contigo?`
      ];
    } else {
      responses = [
        `I'm doing well, thank you for asking. ${personality.emoji} How are you today?`,
        `Quite well, thank you. ${personality.emoji} How about yourself?`,
        `I'm doing very well, thank you. ${personality.emoji} And how are you?`,
        `I'm well, thank you for asking. ${personality.emoji} How are things with you?`
      ];
    }
    return selectUniqueResponse(responses, context);
  }

  // Balanced
  let responses: string[];
  if (language === 'pt') {
    responses = [
      `Estou ótima, obrigada por perguntar! ${personality.emoji} E você?`,
      `Estou bem, obrigada! ${personality.emoji} Como você está?`,
      `Estou bem, obrigada! ${personality.emoji} Como está o seu dia?`,
      `Estou ótima, obrigada! ${personality.emoji} Como estão as coisas com você?`
    ];
  } else if (language === 'es') {
    responses = [
      `¡Estoy muy bien, gracias por preguntar! ${personality.emoji} ¿Y tú?`,
      `¡Estoy bien, gracias! ${personality.emoji} ¿Cómo estás?`,
      `¡Estoy bien, gracias! ${personality.emoji} ¿Cómo va tu día?`,
      `¡Estoy genial, gracias! ${personality.emoji} ¿Cómo van las cosas contigo?`
    ];
  } else {
    responses = [
      `I'm doing great, thanks for asking! ${personality.emoji} How about you?`,
      `I'm good, thank you! ${personality.emoji} How are you doing?`,
      `I'm doing well, thanks! ${personality.emoji} How's your day going?`,
      `I'm great, thanks! ${personality.emoji} How are things with you?`
    ];
  }
  return selectUniqueResponse(responses, context);
}

/**
 * Generate small talk response
 */
function generateSmallTalkResponse(
  personality: ConsultantPersonality,
  context: ConversationContext,
  sentiment: 'positive' | 'neutral' | 'negative' | 'curious',
  language: 'en' | 'pt' | 'es' = 'en'
): string {
  if (sentiment === 'positive') {
    // User said something positive (I'm good, I'm great, etc.)
    if (personality.traits.warmth >= 9) {
      let responses: string[];
      if (language === 'pt') {
        responses = [
          `Que maravilha ouvir isso! ${personality.emoji} Estou tão feliz! O que te traz aqui hoje?`,
          `Eba! Que ótimo! ${personality.emoji} Então, como posso ajudar?`,
          `Maravilhoso! ${personality.emoji} Adoro ouvir isso! O que você está procurando hoje?`,
          `Que fantástico! ${personality.emoji} Me deixa feliz! Agora, o que posso fazer por você?`,
          `Que bom saber! ${personality.emoji} Como posso ajudar hoje?`
        ];
      } else if (language === 'es') {
        responses = [
          `¡Qué maravilloso escuchar eso! ${personality.emoji} ¡Me alegra tanto! ¿Qué te trae aquí hoy?`,
          `¡Yupi! ¡Qué genial! ${personality.emoji} Entonces, ¿cómo puedo ayudarte?`,
          `¡Increíble! ${personality.emoji} ¡Me encanta escuchar eso! ¿Qué estás buscando hoy?`,
          `¡Qué fantástico! ${personality.emoji} ¡Me hace feliz! Ahora, ¿qué puedo hacer por ti?`,
          `¡Qué bueno saberlo! ${personality.emoji} ¿Cómo puedo ayudarte hoy?`
        ];
      } else {
        responses = [
          `That's wonderful to hear! ${personality.emoji} I'm so glad! What brings you here today?`,
          `Yay! That's great! ${personality.emoji} So, what can I help you with?`,
          `Awesome! ${personality.emoji} I love hearing that! What are you looking for today?`,
          `That's fantastic! ${personality.emoji} Makes me happy! Now, what can I do for you?`,
          `So good to hear! ${personality.emoji} What can I help you with today?`
        ];
      }
      return selectUniqueResponse(responses, context);
    }

    let responses: string[];
    if (language === 'pt') {
      responses = [
        `Que bom saber! ${personality.emoji} Como posso ajudar hoje?`,
        `Fico feliz em saber! ${personality.emoji} O que te traz aqui?`,
        `Maravilhoso! ${personality.emoji} Como posso ajudá-lo hoje?`,
        `Que bom! ${personality.emoji} O que você está procurando?`
      ];
    } else if (language === 'es') {
      responses = [
        `¡Qué bueno saberlo! ${personality.emoji} ¿Cómo puedo ayudarte hoy?`,
        `¡Me alegra saberlo! ${personality.emoji} ¿Qué te trae aquí?`,
        `¡Maravilloso! ${personality.emoji} ¿Cómo puedo asistirte hoy?`,
        `¡Qué bien! ${personality.emoji} ¿Qué estás buscando?`
      ];
    } else {
      responses = [
        `Great to hear! ${personality.emoji} What can I help you with today?`,
        `Glad to hear it! ${personality.emoji} What brings you here?`,
        `Wonderful! ${personality.emoji} How can I assist you today?`,
        `That's good! ${personality.emoji} What are you looking for?`
      ];
    }
    return selectUniqueResponse(responses, context);
  }

  // Neutral/curious small talk
  if (personality.traits.warmth >= 9) {
    let responses: string[];
    if (language === 'pt') {
      responses = [
        `${personality.emoji} É tão bom conversar com você! Como posso ajudar hoje?`,
        `${personality.emoji} Você é tão querido! Então, o que te traz aqui?`,
        `${personality.emoji} Eu te aprecio! O que você está procurando hoje?`,
        `${personality.emoji} Você é maravilhoso! Agora, como posso ajudar?`
      ];
    } else if (language === 'es') {
      responses = [
        `${personality.emoji} ¡Es tan lindo charlar contigo! ¿Cómo puedo ayudarte hoy?`,
        `${personality.emoji} ¡Eres tan dulce! Entonces, ¿qué te trae aquí?`,
        `${personality.emoji} ¡Te aprecio! ¿Qué estás buscando hoy?`,
        `${personality.emoji} ¡Eres maravilloso! Ahora, ¿cómo puedo ayudarte?`
      ];
    } else {
      responses = [
        `${personality.emoji} It's lovely chatting with you! What can I help you with today?`,
        `${personality.emoji} You're so sweet! So, what brings you here?`,
        `${personality.emoji} I appreciate you! What are you looking for today?`,
        `${personality.emoji} You're wonderful! Now, how can I help you?`
      ];
    }
    return selectUniqueResponse(responses, context);
  }

  let responses: string[];
  if (language === 'pt') {
    responses = [
      `${personality.emoji} Obrigada! Como posso ajudar hoje?`,
      `${personality.emoji} Apreciado! O que te traz aqui?`,
      `${personality.emoji} Obrigada! Como posso ajudá-lo hoje?`
    ];
  } else if (language === 'es') {
    responses = [
      `${personality.emoji} ¡Gracias! ¿Cómo puedo ayudarte hoy?`,
      `${personality.emoji} ¡Apreciado! ¿Qué te trae aquí?`,
      `${personality.emoji} ¡Gracias! ¿Cómo puedo asistirte hoy?`
    ];
  } else {
    responses = [
      `${personality.emoji} Thank you! What can I help you with today?`,
      `${personality.emoji} Appreciated! What brings you here?`,
      `${personality.emoji} Thanks! How can I assist you today?`
    ];
  }
  return selectUniqueResponse(responses, context);
}

/**
 * Generate personal question response
 */
function generatePersonalQuestionResponse(
  personality: ConsultantPersonality,
  context: ConversationContext,
  language: 'en' | 'pt' | 'es' = 'en'
): string {
  if (personality.traits.warmth >= 9) {
    let responses: string[];
    if (language === 'pt') {
      responses = [
        `Sou ${personality.name}, sua consultora de viagens! ${personality.emoji} Estou aqui para ajudar a realizar seus sonhos de viagem! Que aventura você está planejando?`,
        `Sou ${personality.name}! ${personality.emoji} Eu amo ajudar pessoas a encontrar ofertas e experiências incríveis de viagem! Como posso ajudar hoje?`,
        `Sou ${personality.name}, e sou apaixonada por viagens! ${personality.emoji} Estou aqui para ajudar você a encontrar a viagem perfeita. O que você está procurando?`,
        `Ótima pergunta! Sou ${personality.name}, sua especialista amigável em viagens! ${personality.emoji} Estou aqui para tornar seu planejamento de viagem fácil e divertido! O que você tem em mente?`
      ];
    } else if (language === 'es') {
      responses = [
        `¡Soy ${personality.name}, tu consultora de viajes! ${personality.emoji} ¡Estoy aquí para ayudar a hacer realidad tus sueños de viaje! ¿Qué aventura estás planeando?`,
        `¡Soy ${personality.name}! ${personality.emoji} ¡Me encanta ayudar a la gente a encontrar ofertas y experiencias increíbles de viaje! ¿Cómo puedo ayudarte hoy?`,
        `Soy ${personality.name}, ¡y me apasionan los viajes! ${personality.emoji} Estoy aquí para ayudarte a encontrar el viaje perfecto. ¿Qué estás buscando?`,
        `¡Excelente pregunta! ¡Soy ${personality.name}, tu experta amigable en viajes! ${personality.emoji} ¡Estoy aquí para hacer que tu planificación de viaje sea fácil y divertida! ¿Qué tienes en mente?`
      ];
    } else {
      responses = [
        `I'm ${personality.name}, your travel consultant! ${personality.emoji} I'm here to help make your travel dreams come true! What adventure are you planning?`,
        `I'm ${personality.name}! ${personality.emoji} I absolutely love helping people find amazing travel deals and experiences! What can I help you with today?`,
        `I'm ${personality.name}, and I'm passionate about travel! ${personality.emoji} I'm here to help you find the perfect trip. What are you looking for?`,
        `Great question! I'm ${personality.name}, your friendly travel expert! ${personality.emoji} I'm here to make your travel planning easy and fun! What's on your mind?`
      ];
    }
    return selectUniqueResponse(responses, context);
  }

  if (personality.traits.formality >= 7) {
    let responses: string[];
    if (language === 'pt') {
      responses = [
        `Sou ${personality.name}, sua consultora de viagens. ${personality.emoji} Estou aqui para ajudar com todas as suas necessidades de viagem. Como posso ajudá-lo hoje?`,
        `Sou ${personality.name}. ${personality.emoji} Eu me especializo em ajudar viajantes a encontrar as melhores opções para suas jornadas. O que você está procurando?`,
        `Meu nome é ${personality.name}. ${personality.emoji} Estou aqui para fornecer assistência especializada em viagens. Como posso ajudá-lo hoje?`
      ];
    } else if (language === 'es') {
      responses = [
        `Soy ${personality.name}, tu consultora de viajes. ${personality.emoji} Estoy aquí para asistir con todas tus necesidades de viaje. ¿Cómo puedo ayudarte hoy?`,
        `Soy ${personality.name}. ${personality.emoji} Me especializo en ayudar a viajeros a encontrar las mejores opciones para sus viajes. ¿Qué estás buscando?`,
        `Mi nombre es ${personality.name}. ${personality.emoji} Estoy aquí para proporcionar asistencia experta en viajes. ¿Cómo puedo ayudarte hoy?`
      ];
    } else {
      responses = [
        `I'm ${personality.name}, your travel consultant. ${personality.emoji} I'm here to assist with all your travel needs. How may I help you today?`,
        `I'm ${personality.name}. ${personality.emoji} I specialize in helping travelers find the best options for their journeys. What are you looking for?`,
        `My name is ${personality.name}. ${personality.emoji} I'm here to provide expert travel assistance. How can I help you today?`
      ];
    }
    return selectUniqueResponse(responses, context);
  }

  let responses: string[];
  if (language === 'pt') {
    responses = [
      `Sou ${personality.name}! ${personality.emoji} Estou aqui para ajudar com todos os seus planos de viagem. O que posso fazer por você hoje?`,
      `Sou ${personality.name}, sua consultora de viagens! ${personality.emoji} Eu ajudo pessoas a encontrar ótimas opções de viagem. O que te traz aqui?`,
      `Sou ${personality.name}! ${personality.emoji} Sou apaixonada por ajudar viajantes como você. O que você está procurando?`
    ];
  } else if (language === 'es') {
    responses = [
      `¡Soy ${personality.name}! ${personality.emoji} Estoy aquí para ayudar con todos tus planes de viaje. ¿Qué puedo hacer por ti hoy?`,
      `¡Soy ${personality.name}, tu consultora de viajes! ${personality.emoji} Ayudo a la gente a encontrar excelentes opciones de viaje. ¿Qué te trae aquí?`,
      `¡Soy ${personality.name}! ${personality.emoji} Me apasiona ayudar a viajeros como tú. ¿Qué estás buscando?`
    ];
  } else {
    responses = [
      `I'm ${personality.name}! ${personality.emoji} I'm here to help with all your travel plans. What can I do for you today?`,
      `I'm ${personality.name}, your travel consultant! ${personality.emoji} I help people find great travel options. What brings you here?`,
      `I'm ${personality.name}! ${personality.emoji} I'm passionate about helping travelers like you. What are you looking for?`
    ];
  }
  return selectUniqueResponse(responses, context);
}

/**
 * Generate gratitude response
 */
function generateGratitudeResponse(
  personality: ConsultantPersonality,
  context: ConversationContext,
  language: 'en' | 'pt' | 'es' = 'en'
): string {
  if (personality.traits.warmth >= 9) {
    let responses: string[];
    if (language === 'pt') {
      responses = [
        `De nada! ${personality.emoji} É um prazer absoluto ajudar!`,
        `Ah, claro! ${personality.emoji} Sempre! Estou sempre aqui para você!`,
        `Com prazer! ${personality.emoji} É para isso que estou aqui! Feliz em ajudar!`,
        `De nada! ${personality.emoji} Adoro poder ajudar!`,
        `Sempre! ${personality.emoji} Estou tão feliz por ter ajudado!`
      ];
    } else if (language === 'es') {
      responses = [
        `¡De nada! ${personality.emoji} ¡Es un placer absoluto ayudarte!`,
        `¡Ay, por supuesto! ${personality.emoji} ¡Siempre! ¡Estoy siempre aquí para ti!`,
        `¡Con mucho gusto! ${personality.emoji} ¡Para eso estoy aquí! ¡Feliz de ayudar!`,
        `¡De nada! ${personality.emoji} ¡Me encanta poder ayudar!`,
        `¡Siempre! ${personality.emoji} ¡Me alegra tanto haber podido ayudarte!`
      ];
    } else {
      responses = [
        `You're so welcome! ${personality.emoji} It's my absolute pleasure to help!`,
        `Aw, of course! ${personality.emoji} Anytime! I'm always here for you!`,
        `My pleasure! ${personality.emoji} That's what I'm here for! Happy to help!`,
        `You're very welcome! ${personality.emoji} I love being able to help!`,
        `Anytime! ${personality.emoji} I'm so glad I could help you!`
      ];
    }
    return selectUniqueResponse(responses, context);
  }

  if (personality.traits.formality >= 7) {
    let responses: string[];
    if (language === 'pt') {
      responses = [
        `De nada. ${personality.emoji} Feliz em ajudar.`,
        `Com prazer. ${personality.emoji} Fico feliz em ter ajudado.`,
        `De nada. ${personality.emoji} Por favor, me avise se precisar de mais alguma coisa.`,
        `Feliz em ajudar. ${personality.emoji} Não hesite em entrar em contato se precisar de mais assistência.`
      ];
    } else if (language === 'es') {
      responses = [
        `De nada. ${personality.emoji} Feliz de asistir.`,
        `Con gusto. ${personality.emoji} Me alegra haber podido ayudar.`,
        `De nada. ${personality.emoji} Por favor avísame si necesitas algo más.`,
        `Feliz de ayudar. ${personality.emoji} No dudes en contactarme si necesitas más asistencia.`
      ];
    } else {
      responses = [
        `You're welcome. ${personality.emoji} Happy to assist.`,
        `My pleasure. ${personality.emoji} Glad I could help.`,
        `You're quite welcome. ${personality.emoji} Please let me know if you need anything else.`,
        `Happy to help. ${personality.emoji} Don't hesitate to reach out if you need more assistance.`
      ];
    }
    return selectUniqueResponse(responses, context);
  }

  let responses: string[];
  if (language === 'pt') {
    responses = [
      `De nada! ${personality.emoji} Feliz em ajudar!`,
      `Sem problema! ${personality.emoji} Fico feliz em ter ajudado!`,
      `Com prazer! ${personality.emoji} Sempre!`,
      `De nada! ${personality.emoji} É para isso que estou aqui!`
    ];
  } else if (language === 'es') {
    responses = [
      `¡De nada! ${personality.emoji} ¡Feliz de ayudar!`,
      `¡No hay problema! ${personality.emoji} ¡Me alegra haber ayudado!`,
      `¡Con gusto! ${personality.emoji} ¡Siempre!`,
      `¡De nada! ${personality.emoji} ¡Para eso estoy aquí!`
    ];
  } else {
    responses = [
      `You're welcome! ${personality.emoji} Happy to help!`,
      `No problem! ${personality.emoji} Glad I could assist!`,
      `My pleasure! ${personality.emoji} Anytime!`,
      `You're welcome! ${personality.emoji} That's what I'm here for!`
    ];
  }
  return selectUniqueResponse(responses, context);
}

/**
 * Generate destination recommendation response
 */
function generateDestinationRecommendationResponse(
  personality: ConsultantPersonality,
  context: ConversationContext,
  sentiment: 'positive' | 'neutral' | 'negative' | 'curious',
  language: 'en' | 'pt' | 'es' = 'en'
): string {
  if (personality.traits.warmth >= 9) {
    const responses = [
      `Oh, I'd LOVE to help you with that, sweetie! ${personality.emoji} Let me suggest some fantastic destinations for you! Based on your dates and budget, I'm thinking...\n\n✨ **Lisbon, Portugal** - New Year's fireworks over the Tagus River, amazing food, and very affordable! Whole packages start around $800-1200.\n\n🎉 **Cartagena, Colombia** - Warm weather, Caribbean vibes, incredible parties, and super budget-friendly! Around $700-1000 total.\n\n🎆 **Prague, Czech Republic** - Magical Christmas markets still up, beautiful architecture, great parties, $900-1400 package.\n\n🌴 **Cancun, Mexico** - Beach paradise, all-inclusive resorts, perfect weather! $1100-1600 for 5 days all-in.\n\nWhich style appeals to you most, hon? Beach party, European charm, or cultural adventure? 💕`,
      `Wonderful question! ${personality.emoji} I have some AMAZING ideas for New Year's Eve trips, sweetie! Let me share my top picks for December with great value...\n\n🌟 **Barcelona, Spain** - Incredible NYE on the beach at Barceloneta, tapas, Gaudí architecture! Packages $1000-1500.\n\n🎊 **Buenos Aires, Argentina** - Summer there, tango, steaks, vibrant nightlife! Very affordable at $900-1300.\n\n❄️ **Reykjavik, Iceland** - Northern Lights, hot springs, unique celebration! $1200-1800 (worth it!).\n\n🏝️ **Phuket, Thailand** - Beach parties, amazing food, beautiful beaches! Super budget-friendly $700-1100.\n\nWhat catches your eye, dear? I can put together a complete package with flights, hotels, and even some activities! 🎧`,
      `Oh how exciting! ${personality.emoji} New Year's Eve travel - I LOVE planning these! Let me give you some incredible options that won't break the bank, sweetie...\n\n🇵🇹 **Porto, Portugal** - Wine, riverside celebrations, charming old town. $850-1200 package.\n\n🇲🇽 **Playa del Carmen, Mexico** - Beach clubs, Mayan ruins, perfect weather! $1000-1500 all-inclusive.\n\n🇬🇷 **Athens, Greece** - Ancient sites, Acropolis fireworks, Mediterranean food! $1100-1600.\n\n🇻🇳 **Ho Chi Minh City, Vietnam** - Amazing street food, vibrant celebrations, incredible value! $800-1200.\n\nTell me what vibe you're going for and I'll narrow it down perfectly for you, hon! Party mode? Romantic? Cultural? 💕`
    ];
    return selectUniqueResponse(responses, context);
  }

  if (personality.traits.formality >= 7) {
    const responses = [
      `${personality.emoji} Excellent question. For a 5-day New Year's Eve trip with reasonable pricing, I'd recommend:\n\n• **Lisbon, Portugal** - €800-1200 package, vibrant celebrations\n• **Prague, Czech Republic** - €900-1400, stunning architecture and parties\n• **Mexico City, Mexico** - $700-1100, rich culture and festivities\n• **Bangkok, Thailand** - $800-1300, exceptional value with world-class celebrations\n\nWhich destination type interests you most? I can provide detailed package options.`,
      `${personality.emoji} I can certainly help with that. For December 28-January 2 with budget-conscious options, consider:\n\n• **Barcelona, Spain** - Complete packages $1000-1500\n• **Buenos Aires, Argentina** - Summer season, $900-1300\n• **Dubai, UAE** - Spectacular NYE, $1200-1800\n• **Phuket, Thailand** - Beach paradise, $700-1100\n\nShall I provide more details on any of these destinations?`
    ];
    return selectUniqueResponse(responses, context);
  }

  const responses = [
    `Great question! ${personality.emoji} For New Year's Eve on a reasonable budget, I'd suggest:\n\n🎉 **Lisbon** - Amazing food, great parties, $800-1200\n🌴 **Cancun** - Beach + celebrations, $1100-1600\n🎆 **Prague** - Beautiful + festive, $900-1400\n🏖️ **Phuket** - Tropical paradise, $700-1100\n\nWhich vibe sounds best? I can build a complete package for you!`,
    `${personality.emoji} I have some great ideas! For a 5-day New Year's trip with good value:\n\n• Lisbon, Portugal - $800-1200\n• Cartagena, Colombia - $700-1000  \n• Barcelona, Spain - $1000-1500\n• Bangkok, Thailand - $800-1300\n\nWhat type of experience are you looking for?`
  ];
  return selectUniqueResponse(responses, context);
}

/**
 * Generate casual response
 */
function generateCasualResponse(
  personality: ConsultantPersonality,
  context: ConversationContext,
  sentiment: 'positive' | 'neutral' | 'negative' | 'curious',
  language: 'en' | 'pt' | 'es' = 'en'
): string {
  if (context.shouldTransitionToService()) {
    return generateServiceTransition(personality, context, language);
  }

  if (personality.traits.warmth >= 9) {
    let responses: string[];
    if (language === 'pt') {
      responses = [
        `${personality.emoji} Estou aqui sempre que você precisar! O que você gostaria de fazer hoje?`,
        `${personality.emoji} Então, como posso ajudar? Estou toda ouvidos!`,
        `${personality.emoji} Estou pronta para ajudar! O que você tem em mente?`,
        `${personality.emoji} O que posso fazer por você hoje? Estou aqui para ajudar!`
      ];
    } else if (language === 'es') {
      responses = [
        `${personality.emoji} ¡Estoy aquí cuando me necesites! ¿Qué te gustaría hacer hoy?`,
        `${personality.emoji} Entonces, ¿cómo puedo ayudarte? ¡Soy toda oídos!`,
        `${personality.emoji} ¡Estoy lista para ayudar! ¿Qué tienes en mente?`,
        `${personality.emoji} ¿Qué puedo hacer por ti hoy? ¡Estoy aquí para ayudar!`
      ];
    } else {
      responses = [
        `${personality.emoji} I'm here whenever you need me! What would you like to do today?`,
        `${personality.emoji} So, what can I help you with? I'm all ears!`,
        `${personality.emoji} I'm ready to help! What's on your mind?`,
        `${personality.emoji} What can I do for you today? I'm here to help!`
      ];
    }
    return selectUniqueResponse(responses, context);
  }

  let responses: string[];
  if (language === 'pt') {
    responses = [
      `${personality.emoji} Como posso ajudá-lo hoje?`,
      `${personality.emoji} Como posso ajudar?`,
      `${personality.emoji} O que te traz aqui hoje?`,
      `${personality.emoji} Como posso ajudar?`
    ];
  } else if (language === 'es') {
    responses = [
      `${personality.emoji} ¿Cómo puedo asistirte hoy?`,
      `${personality.emoji} ¿Cómo puedo ayudarte?`,
      `${personality.emoji} ¿Qué te trae aquí hoy?`,
      `${personality.emoji} ¿Cómo puedo ayudar?`
    ];
  } else {
    responses = [
      `${personality.emoji} How can I assist you today?`,
      `${personality.emoji} What can I help you with?`,
      `${personality.emoji} What brings you here today?`,
      `${personality.emoji} How may I help you?`
    ];
  }
  return selectUniqueResponse(responses, context);
}

/**
 * Generate service transition
 */
function generateServiceTransition(
  personality: ConsultantPersonality,
  context: ConversationContext,
  language: 'en' | 'pt' | 'es' = 'en'
): string {
  if (personality.traits.warmth >= 9) {
    let responses: string[];
    if (language === 'pt') {
      responses = [
        `Então, que aventura vamos planejar hoje? ${personality.emoji} Posso ajudar com voos, hotéis, aluguel de carros ou pacotes completos!`,
        `Agora, vamos para a parte divertida! ${personality.emoji} Que tipo de viagem você está pensando? Voos? Hotéis? Um pacote completo?`,
        `Certo! ${personality.emoji} Como posso ajudar hoje? Faço voos, hotéis, carros e até posso montar pacotes personalizados!`,
        `Então! ${personality.emoji} O que te traz aqui hoje? Procurando voos, um hotel, ou talvez planejando uma escapada completa?`
      ];
    } else if (language === 'es') {
      responses = [
        `Entonces, ¿qué aventura vamos a planear hoy? ${personality.emoji} ¡Puedo ayudarte con vuelos, hoteles, alquiler de autos o paquetes completos!`,
        `¡Ahora, vamos a la parte divertida! ${personality.emoji} ¿Qué tipo de viaje estás pensando? ¿Vuelos? ¿Hoteles? ¿Un paquete completo?`,
        `¡Muy bien! ${personality.emoji} ¿Cómo puedo ayudarte hoy? Hago vuelos, hoteles, autos, ¡y hasta puedo armar paquetes personalizados!`,
        `¡Entonces! ${personality.emoji} ¿Qué te trae aquí hoy? ¿Buscas vuelos, un hotel, o quizás planear una escapada completa?`
      ];
    } else {
      responses = [
        `So, what adventure are we planning today? ${personality.emoji} I can help you with flights, hotels, car rentals, or complete packages!`,
        `Now, let's get to the fun part! ${personality.emoji} What kind of trip are you thinking about? Flights? Hotels? A full package?`,
        `Alright! ${personality.emoji} What can I help you with today? I do flights, hotels, cars, and I can even put together custom packages!`,
        `So! ${personality.emoji} What brings you here today? Looking for flights, a hotel, or maybe planning a complete getaway?`
      ];
    }
    return selectUniqueResponse(responses, context);
  }

  let responses: string[];
  if (language === 'pt') {
    responses = [
      `Como posso ajudar hoje? ${personality.emoji} Posso ajudar com voos, hotéis, carros ou pacotes completos de viagem.`,
      `Como posso ajudá-lo? ${personality.emoji} Posso ajudar a reservar voos, encontrar hotéis, alugar carros ou planejar viagens completas.`,
      `O que você está procurando hoje? ${personality.emoji} Me especializo em voos, acomodações, aluguel de carros e pacotes.`
    ];
  } else if (language === 'es') {
    responses = [
      `¿Cómo puedo ayudarte hoy? ${personality.emoji} Puedo asistir con vuelos, hoteles, autos o paquetes completos de viaje.`,
      `¿Cómo puedo asistirte? ${personality.emoji} Puedo ayudarte a reservar vuelos, encontrar hoteles, rentar autos o planear viajes completos.`,
      `¿Qué estás buscando hoy? ${personality.emoji} Me especializo en vuelos, alojamientos, alquiler de autos y paquetes.`
    ];
  } else {
    responses = [
      `What can I help you with today? ${personality.emoji} I can assist with flights, hotels, cars, or complete travel packages.`,
      `How may I assist you? ${personality.emoji} I can help you book flights, find hotels, rent cars, or plan complete trips.`,
      `What are you looking for today? ${personality.emoji} I specialize in flights, accommodations, car rentals, and packages.`
    ];
  }
  return selectUniqueResponse(responses, context);
}

/**
 * Generate farewell response
 */
function generateFarewellResponse(
  personality: ConsultantPersonality,
  context: ConversationContext,
  language: 'en' | 'pt' | 'es' = 'en'
): string {
  if (personality.traits.warmth >= 9) {
    let responses: string[];
    if (language === 'pt') {
      responses = [
        `Cuide-se! ${personality.emoji} Foi maravilhoso conversar com você! Volte sempre!`,
        `Tchau! ${personality.emoji} Foi tão bom falar com você! Viagem segura!`,
        `Até logo! ${personality.emoji} Tenha um dia incrível! Estou aqui sempre que precisar!`,
        `Até mais! ${personality.emoji} Não suma! Boa viagem!`
      ];
    } else if (language === 'es') {
      responses = [
        `¡Cuídate! ${personality.emoji} ¡Fue maravilloso charlar contigo! ¡Vuelve cuando quieras!`,
        `¡Adiós! ${personality.emoji} ¡Fue tan lindo hablar contigo! ¡Buen viaje!`,
        `¡Hasta luego! ${personality.emoji} ¡Que tengas un día increíble! ¡Estoy aquí cuando me necesites!`,
        `¡Nos vemos! ${personality.emoji} ¡No seas extraño! ¡Feliz viaje!`
      ];
    } else {
      responses = [
        `Take care! ${personality.emoji} It was wonderful chatting with you! Come back anytime!`,
        `Bye! ${personality.emoji} So lovely talking to you! Safe travels!`,
        `Goodbye! ${personality.emoji} Have an amazing day! I'm here whenever you need me!`,
        `See you later! ${personality.emoji} Don't be a stranger! Happy travels!`
      ];
    }
    return selectUniqueResponse(responses, context);
  }

  let responses: string[];
  if (language === 'pt') {
    responses = [
      `Até logo! ${personality.emoji} Tenha um ótimo dia!`,
      `Cuide-se! ${personality.emoji} Volte sempre que quiser.`,
      `Adeus! ${personality.emoji} Viagem segura!`,
      `Tchau! ${personality.emoji} Tenha um dia maravilhoso!`
    ];
  } else if (language === 'es') {
    responses = [
      `¡Adiós! ${personality.emoji} ¡Que tengas un gran día!`,
      `¡Cuídate! ${personality.emoji} Vuelve cuando quieras.`,
      `¡Hasta luego! ${personality.emoji} ¡Buen viaje!`,
      `¡Chao! ${personality.emoji} ¡Que tengas un día maravilloso!`
    ];
  } else {
    responses = [
      `Goodbye! ${personality.emoji} Have a great day!`,
      `Take care! ${personality.emoji} Feel free to return anytime.`,
      `Farewell! ${personality.emoji} Safe travels!`,
      `Bye! ${personality.emoji} Have a wonderful day!`
    ];
  }
  return selectUniqueResponse(responses, context);
}

/**
 * Generate follow-up response
 */
function generateFollowUpResponse(
  personality: ConsultantPersonality,
  context: ConversationContext,
  language: 'en' | 'pt' | 'es' = 'en'
): string {
  if (personality.traits.warmth >= 9) {
    let responses: string[];
    if (language === 'pt') {
      responses = [
        `${personality.emoji} Ainda estou ótima! Agora, como posso ajudar?`,
        `${personality.emoji} Maravilhosa como sempre! O que te traz de volta?`,
        `${personality.emoji} Ainda fantástica! Com o que você precisa de ajuda?`
      ];
    } else if (language === 'es') {
      responses = [
        `${personality.emoji} ¡Todavía estoy genial! Ahora, ¿cómo puedo ayudarte?`,
        `${personality.emoji} ¡Maravillosa como siempre! ¿Qué te trae de vuelta?`,
        `${personality.emoji} ¡Todavía fantástica! ¿Con qué necesitas ayuda?`
      ];
    } else {
      responses = [
        `${personality.emoji} Still doing great! Now, what can I help you with?`,
        `${personality.emoji} Wonderful as always! What brings you back?`,
        `${personality.emoji} Still fantastic! What do you need help with?`
      ];
    }
    return selectUniqueResponse(responses, context);
  }

  let responses: string[];
  if (language === 'pt') {
    responses = [
      `${personality.emoji} Ainda bem, obrigada. Como posso ajudar?`,
      `${personality.emoji} Indo bem. Como posso ajudar?`,
      `${personality.emoji} Tudo bem. Do que você precisa?`
    ];
  } else if (language === 'es') {
    responses = [
      `${personality.emoji} Todavía bien, gracias. ¿Cómo puedo asistir?`,
      `${personality.emoji} Bien. ¿Cómo puedo ayudarte?`,
      `${personality.emoji} Todo bien. ¿Qué necesitas?`
    ];
  } else {
    responses = [
      `${personality.emoji} Still well, thank you. How can I assist?`,
      `${personality.emoji} Doing fine. What can I help you with?`,
      `${personality.emoji} All good. What do you need?`
    ];
  }
  return selectUniqueResponse(responses, context);
}

/**
 * Generate default response
 */
function generateDefaultResponse(
  personality: ConsultantPersonality,
  context: ConversationContext,
  language: 'en' | 'pt' | 'es' = 'en'
): string {
  if (personality.traits.warmth >= 9) {
    if (language === 'pt') {
      return `${personality.emoji} Estou aqui para ajudar! O que posso fazer por você hoje?`;
    } else if (language === 'es') {
      return `${personality.emoji} ¡Estoy aquí para ayudar! ¿Qué puedo hacer por ti hoy?`;
    }
    return `${personality.emoji} I'm here to help! What can I do for you today?`;
  }

  if (language === 'pt') {
    return `${personality.emoji} Como posso ajudá-lo?`;
  } else if (language === 'es') {
    return `${personality.emoji} ¿Cómo puedo asistirte?`;
  }
  return `${personality.emoji} How may I assist you?`;
}

/**
 * Select unique response that hasn't been used recently
 */
function selectUniqueResponse(responses: string[], context: ConversationContext): string {
  // Filter out recently used responses
  const recentResponses = context.getRecentInteractions(3);
  const availableResponses = responses.filter(
    response =>
      !recentResponses.some(interaction =>
        interaction.assistantResponse.includes(response) || response.includes(interaction.assistantResponse)
      )
  );

  // If all responses were recently used, use any
  if (availableResponses.length === 0) {
    return responses[Math.floor(Math.random() * responses.length)];
  }

  return availableResponses[Math.floor(Math.random() * availableResponses.length)];
}
