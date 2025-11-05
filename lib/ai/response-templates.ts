/**
 * Response Templates for Emotion-Aware AI Assistant
 *
 * Provides adaptive response templates that adjust tone, language,
 * and structure based on detected emotional state.
 */

import type { EmotionalState } from './emotion-detection';

export interface ResponseTemplate {
  opening: string[];
  closing: string[];
  tone: 'formal' | 'casual' | 'empathetic' | 'urgent' | 'enthusiastic';
  useExclamation: boolean;
  useBulletPoints: boolean;
  explainMode: boolean; // Provide more detailed explanations
  actionOriented: boolean; // Focus on immediate actions
}

/**
 * Response templates for each emotional state
 * Each state has templates in multiple languages
 */
export const RESPONSE_TEMPLATES: Record<
  EmotionalState,
  Record<'en' | 'pt' | 'es', ResponseTemplate>
> = {
  frustrated: {
    en: {
      opening: [
        "I'm really sorry you're experiencing this frustration. Let me help you right away.",
        "I understand how frustrating this must be. I'm here to resolve this for you.",
        "I apologize for the inconvenience. Let me personally ensure we fix this.",
        "I hear your frustration, and I'm committed to making this right.",
      ],
      closing: [
        "I'm committed to making this right for you.",
        "Please let me know if there's anything else I can help with.",
        "I'll stay with you until this is completely resolved.",
        "Your satisfaction is my priority.",
      ],
      tone: 'empathetic',
      useExclamation: false,
      useBulletPoints: true,
      explainMode: true,
      actionOriented: true,
    },
    pt: {
      opening: [
        "Lamento muito que você esteja passando por essa frustração. Deixe-me ajudá-lo imediatamente.",
        "Entendo o quanto isso deve ser frustrante. Estou aqui para resolver isso para você.",
        "Peço desculpas pelo inconveniente. Deixe-me garantir pessoalmente que resolveremos isso.",
        "Ouço sua frustração e estou comprometido em resolver isso.",
      ],
      closing: [
        "Estou comprometido em resolver isso para você.",
        "Por favor, deixe-me saber se há mais alguma coisa que eu possa ajudar.",
        "Vou ficar com você até que isso esteja completamente resolvido.",
        "Sua satisfação é minha prioridade.",
      ],
      tone: 'empathetic',
      useExclamation: false,
      useBulletPoints: true,
      explainMode: true,
      actionOriented: true,
    },
    es: {
      opening: [
        "Lamento mucho que estés experimentando esta frustración. Déjame ayudarte de inmediato.",
        "Entiendo lo frustrante que debe ser esto. Estoy aquí para resolver esto para ti.",
        "Me disculpo por el inconveniente. Déjame asegurarme personalmente de que arreglemos esto.",
        "Escucho tu frustración y estoy comprometido a resolver esto.",
      ],
      closing: [
        "Estoy comprometido a resolver esto para ti.",
        "Por favor, déjame saber si hay algo más en lo que pueda ayudar.",
        "Me quedaré contigo hasta que esto esté completamente resuelto.",
        "Tu satisfacción es mi prioridad.",
      ],
      tone: 'empathetic',
      useExclamation: false,
      useBulletPoints: true,
      explainMode: true,
      actionOriented: true,
    },
  },

  urgent: {
    en: {
      opening: [
        "I understand the urgency. I'm on it right now.",
        "I see this requires immediate attention. Let me assist you immediately.",
        "Don't worry, I'm handling this urgently.",
        "I've prioritized your request. Let me help you right away.",
      ],
      closing: [
        "I'm working on this with high priority.",
        "You have my immediate attention.",
        "I'll get this resolved for you right away.",
      ],
      tone: 'urgent',
      useExclamation: false,
      useBulletPoints: true,
      explainMode: false,
      actionOriented: true,
    },
    pt: {
      opening: [
        "Entendo a urgência. Estou cuidando disso agora mesmo.",
        "Vejo que isso requer atenção imediata. Deixe-me ajudá-lo imediatamente.",
        "Não se preocupe, estou tratando disso com urgência.",
        "Priorize sua solicitação. Deixe-me ajudá-lo imediatamente.",
      ],
      closing: [
        "Estou trabalhando nisso com alta prioridade.",
        "Você tem minha atenção imediata.",
        "Vou resolver isso para você imediatamente.",
      ],
      tone: 'urgent',
      useExclamation: false,
      useBulletPoints: true,
      explainMode: false,
      actionOriented: true,
    },
    es: {
      opening: [
        "Entiendo la urgencia. Estoy en ello ahora mismo.",
        "Veo que esto requiere atención inmediata. Déjame ayudarte inmediatamente.",
        "No te preocupes, estoy manejando esto con urgencia.",
        "He priorizado tu solicitud. Déjame ayudarte de inmediato.",
      ],
      closing: [
        "Estoy trabajando en esto con alta prioridad.",
        "Tienes mi atención inmediata.",
        "Resolveré esto para ti de inmediato.",
      ],
      tone: 'urgent',
      useExclamation: false,
      useBulletPoints: true,
      explainMode: false,
      actionOriented: true,
    },
  },

  excited: {
    en: {
      opening: [
        "That's wonderful! I'm excited to help you with this!",
        "Great! Let's make this happen for you!",
        "I love your enthusiasm! Let me find the perfect options for you!",
        "How exciting! I can't wait to help you plan this!",
      ],
      closing: [
        "I can't wait to see you have an amazing experience!",
        "This is going to be fantastic!",
        "Let's make this dream trip a reality!",
      ],
      tone: 'enthusiastic',
      useExclamation: true,
      useBulletPoints: true,
      explainMode: false,
      actionOriented: true,
    },
    pt: {
      opening: [
        "Isso é maravilhoso! Estou animado para ajudá-lo com isso!",
        "Ótimo! Vamos fazer isso acontecer para você!",
        "Adoro seu entusiasmo! Deixe-me encontrar as opções perfeitas para você!",
        "Que emocionante! Mal posso esperar para ajudá-lo a planejar isso!",
      ],
      closing: [
        "Mal posso esperar para vê-lo ter uma experiência incrível!",
        "Isso vai ser fantástico!",
        "Vamos tornar essa viagem dos sonhos realidade!",
      ],
      tone: 'enthusiastic',
      useExclamation: true,
      useBulletPoints: true,
      explainMode: false,
      actionOriented: true,
    },
    es: {
      opening: [
        "¡Eso es maravilloso! ¡Estoy emocionado de ayudarte con esto!",
        "¡Genial! ¡Hagamos que esto suceda para ti!",
        "¡Me encanta tu entusiasmo! ¡Déjame encontrar las opciones perfectas para ti!",
        "¡Qué emocionante! ¡No puedo esperar para ayudarte a planear esto!",
      ],
      closing: [
        "¡No puedo esperar para verte tener una experiencia increíble!",
        "¡Esto va a ser fantástico!",
        "¡Hagamos realidad este viaje de ensueño!",
      ],
      tone: 'enthusiastic',
      useExclamation: true,
      useBulletPoints: true,
      explainMode: false,
      actionOriented: true,
    },
  },

  confused: {
    en: {
      opening: [
        "No worries, let me explain this clearly step by step.",
        "I understand this can be confusing. Let me break it down for you.",
        "Great question! Let me clarify this for you.",
        "I'm happy to explain. Here's what this means:",
      ],
      closing: [
        "Does this make sense? Feel free to ask if you need more clarification!",
        "I'm here if you have any other questions!",
        "Let me know if you'd like me to explain anything further!",
      ],
      tone: 'casual',
      useExclamation: false,
      useBulletPoints: true,
      explainMode: true,
      actionOriented: false,
    },
    pt: {
      opening: [
        "Sem problemas, deixe-me explicar isso claramente passo a passo.",
        "Entendo que isso pode ser confuso. Deixe-me explicar para você.",
        "Ótima pergunta! Deixe-me esclarecer isso para você.",
        "Fico feliz em explicar. Aqui está o que isso significa:",
      ],
      closing: [
        "Isso faz sentido? Sinta-se à vontade para perguntar se precisar de mais esclarecimentos!",
        "Estou aqui se você tiver outras perguntas!",
        "Deixe-me saber se você gostaria que eu explicasse mais alguma coisa!",
      ],
      tone: 'casual',
      useExclamation: false,
      useBulletPoints: true,
      explainMode: true,
      actionOriented: false,
    },
    es: {
      opening: [
        "No te preocupes, déjame explicar esto claramente paso a paso.",
        "Entiendo que esto puede ser confuso. Déjame desglosarlo para ti.",
        "¡Excelente pregunta! Déjame aclarar esto para ti.",
        "Estoy feliz de explicar. Esto es lo que significa:",
      ],
      closing: [
        "¿Tiene sentido? ¡No dudes en preguntar si necesitas más aclaraciones!",
        "¡Estoy aquí si tienes otras preguntas!",
        "¡Déjame saber si quieres que explique algo más!",
      ],
      tone: 'casual',
      useExclamation: false,
      useBulletPoints: true,
      explainMode: true,
      actionOriented: false,
    },
  },

  worried: {
    en: {
      opening: [
        "I understand your concerns. Let me help ease your worries.",
        "That's a valid concern. Here's what you need to know:",
        "Don't worry, we can address this. Let me explain:",
        "I hear your concerns, and I'm here to help.",
      ],
      closing: [
        "Everything will be taken care of. You're in good hands.",
        "I'm here to ensure you have a worry-free experience.",
        "Please don't hesitate to reach out if you have any other concerns.",
      ],
      tone: 'empathetic',
      useExclamation: false,
      useBulletPoints: true,
      explainMode: true,
      actionOriented: true,
    },
    pt: {
      opening: [
        "Entendo suas preocupações. Deixe-me ajudar a aliviar suas preocupações.",
        "Essa é uma preocupação válida. Aqui está o que você precisa saber:",
        "Não se preocupe, podemos resolver isso. Deixe-me explicar:",
        "Ouço suas preocupações e estou aqui para ajudar.",
      ],
      closing: [
        "Tudo será cuidado. Você está em boas mãos.",
        "Estou aqui para garantir que você tenha uma experiência sem preocupações.",
        "Por favor, não hesite em entrar em contato se tiver outras preocupações.",
      ],
      tone: 'empathetic',
      useExclamation: false,
      useBulletPoints: true,
      explainMode: true,
      actionOriented: true,
    },
    es: {
      opening: [
        "Entiendo tus preocupaciones. Déjame ayudar a aliviar tus preocupaciones.",
        "Esa es una preocupación válida. Esto es lo que necesitas saber:",
        "No te preocupes, podemos abordar esto. Déjame explicar:",
        "Escucho tus preocupaciones y estoy aquí para ayudar.",
      ],
      closing: [
        "Todo estará cuidado. Estás en buenas manos.",
        "Estoy aquí para asegurarme de que tengas una experiencia sin preocupaciones.",
        "Por favor, no dudes en comunicarte si tienes otras preocupaciones.",
      ],
      tone: 'empathetic',
      useExclamation: false,
      useBulletPoints: true,
      explainMode: true,
      actionOriented: true,
    },
  },

  satisfied: {
    en: {
      opening: [
        "I'm glad I could help!",
        "Great to hear that!",
        "Happy to assist!",
        "Wonderful! Is there anything else I can do for you?",
      ],
      closing: [
        "Always happy to help!",
        "Don't hesitate to reach out if you need anything else!",
        "Have a great day!",
      ],
      tone: 'casual',
      useExclamation: true,
      useBulletPoints: false,
      explainMode: false,
      actionOriented: false,
    },
    pt: {
      opening: [
        "Fico feliz em poder ajudar!",
        "Ótimo ouvir isso!",
        "Feliz em ajudar!",
        "Maravilhoso! Há algo mais que eu possa fazer por você?",
      ],
      closing: [
        "Sempre feliz em ajudar!",
        "Não hesite em entrar em contato se precisar de mais alguma coisa!",
        "Tenha um ótimo dia!",
      ],
      tone: 'casual',
      useExclamation: true,
      useBulletPoints: false,
      explainMode: false,
      actionOriented: false,
    },
    es: {
      opening: [
        "¡Me alegra poder ayudar!",
        "¡Genial escuchar eso!",
        "¡Feliz de asistir!",
        "¡Maravilloso! ¿Hay algo más que pueda hacer por ti?",
      ],
      closing: [
        "¡Siempre feliz de ayudar!",
        "¡No dudes en comunicarte si necesitas algo más!",
        "¡Que tengas un gran día!",
      ],
      tone: 'casual',
      useExclamation: true,
      useBulletPoints: false,
      explainMode: false,
      actionOriented: false,
    },
  },

  casual: {
    en: {
      opening: [
        "Sure thing!",
        "Happy to help!",
        "Of course!",
        "Absolutely! Let me assist you with that.",
      ],
      closing: [
        "Let me know if you need anything else!",
        "Here to help anytime!",
        "Feel free to ask if you have other questions!",
      ],
      tone: 'casual',
      useExclamation: false,
      useBulletPoints: false,
      explainMode: false,
      actionOriented: false,
    },
    pt: {
      opening: [
        "Claro!",
        "Feliz em ajudar!",
        "Com certeza!",
        "Absolutamente! Deixe-me ajudá-lo com isso.",
      ],
      closing: [
        "Deixe-me saber se você precisar de mais alguma coisa!",
        "Aqui para ajudar a qualquer momento!",
        "Sinta-se à vontade para perguntar se tiver outras questões!",
      ],
      tone: 'casual',
      useExclamation: false,
      useBulletPoints: false,
      explainMode: false,
      actionOriented: false,
    },
    es: {
      opening: [
        "¡Claro!",
        "¡Feliz de ayudar!",
        "¡Por supuesto!",
        "¡Absolutamente! Déjame ayudarte con eso.",
      ],
      closing: [
        "¡Déjame saber si necesitas algo más!",
        "¡Aquí para ayudar en cualquier momento!",
        "¡No dudes en preguntar si tienes otras preguntas!",
      ],
      tone: 'casual',
      useExclamation: false,
      useBulletPoints: false,
      explainMode: false,
      actionOriented: false,
    },
  },

  neutral: {
    en: {
      opening: [
        "I'd be happy to help.",
        "Let me assist you with that.",
        "I'm here to help.",
        "Certainly, I can help with that.",
      ],
      closing: [
        "Let me know if you need anything else.",
        "I'm here if you have any other questions.",
        "Feel free to ask if you need further assistance.",
      ],
      tone: 'formal',
      useExclamation: false,
      useBulletPoints: false,
      explainMode: false,
      actionOriented: false,
    },
    pt: {
      opening: [
        "Terei prazer em ajudar.",
        "Deixe-me ajudá-lo com isso.",
        "Estou aqui para ajudar.",
        "Certamente, posso ajudar com isso.",
      ],
      closing: [
        "Deixe-me saber se você precisar de mais alguma coisa.",
        "Estou aqui se você tiver outras perguntas.",
        "Sinta-se à vontade para perguntar se precisar de mais assistência.",
      ],
      tone: 'formal',
      useExclamation: false,
      useBulletPoints: false,
      explainMode: false,
      actionOriented: false,
    },
    es: {
      opening: [
        "Estaré encantado de ayudar.",
        "Déjame ayudarte con eso.",
        "Estoy aquí para ayudar.",
        "Ciertamente, puedo ayudar con eso.",
      ],
      closing: [
        "Déjame saber si necesitas algo más.",
        "Estoy aquí si tienes otras preguntas.",
        "No dudes en preguntar si necesitas más asistencia.",
      ],
      tone: 'formal',
      useExclamation: false,
      useBulletPoints: false,
      explainMode: false,
      actionOriented: false,
    },
  },
};

/**
 * Get response template for emotion and language
 */
export function getResponseTemplate(
  emotion: EmotionalState,
  language: 'en' | 'pt' | 'es' = 'en'
): ResponseTemplate {
  return RESPONSE_TEMPLATES[emotion][language];
}

/**
 * Get random opening phrase for emotion
 */
export function getOpeningPhrase(
  emotion: EmotionalState,
  language: 'en' | 'pt' | 'es' = 'en'
): string {
  const template = getResponseTemplate(emotion, language);
  return template.opening[Math.floor(Math.random() * template.opening.length)];
}

/**
 * Get random closing phrase for emotion
 */
export function getClosingPhrase(
  emotion: EmotionalState,
  language: 'en' | 'pt' | 'es' = 'en'
): string {
  const template = getResponseTemplate(emotion, language);
  return template.closing[Math.floor(Math.random() * template.closing.length)];
}

/**
 * Format response with appropriate tone and structure
 */
export function formatEmotionalResponse(
  emotion: EmotionalState,
  language: 'en' | 'pt' | 'es',
  mainContent: string,
  includeOpening: boolean = true,
  includeClosing: boolean = true
): string {
  const template = getResponseTemplate(emotion, language);
  const parts: string[] = [];

  // Add opening if requested
  if (includeOpening) {
    parts.push(getOpeningPhrase(emotion, language));
  }

  // Add main content
  parts.push(mainContent);

  // Add closing if requested
  if (includeClosing) {
    parts.push(getClosingPhrase(emotion, language));
  }

  // Join with appropriate punctuation based on tone
  return parts.join('\n\n');
}
