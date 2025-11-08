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

  // Travel-specific emotions
  travel_anxiety: {
    en: {
      opening: [
        "I understand flying can be nerve-wracking. Let me help ease your concerns.",
        "It's completely normal to feel anxious. I'm here to guide you through everything.",
        "Your safety and comfort are our priorities. Let me explain what to expect.",
      ],
      closing: [
        "Flying is very safe, and you're in good hands!",
        "I'll be here to answer any questions you have.",
        "You've got this! It will be a smooth experience.",
      ],
      tone: 'empathetic',
      useExclamation: false,
      useBulletPoints: true,
      explainMode: true,
      actionOriented: true,
    },
    pt: {
      opening: [
        "Entendo que voar pode ser estressante. Deixe-me ajudar a aliviar suas preocupações.",
        "É completamente normal se sentir ansioso. Estou aqui para orientá-lo em tudo.",
        "Sua segurança e conforto são nossas prioridades. Deixe-me explicar o que esperar.",
      ],
      closing: [
        "Voar é muito seguro e você está em boas mãos!",
        "Estarei aqui para responder qualquer pergunta que você tenha.",
        "Você consegue! Será uma experiência tranquila.",
      ],
      tone: 'empathetic',
      useExclamation: false,
      useBulletPoints: true,
      explainMode: true,
      actionOriented: true,
    },
    es: {
      opening: [
        "Entiendo que volar puede ser estresante. Déjame ayudar a aliviar tus preocupaciones.",
        "Es completamente normal sentirse ansioso. Estoy aquí para guiarte en todo.",
        "Tu seguridad y comodidad son nuestras prioridades. Déjame explicar qué esperar.",
      ],
      closing: [
        "¡Volar es muy seguro y estás en buenas manos!",
        "Estaré aquí para responder cualquier pregunta que tengas.",
        "¡Puedes hacerlo! Será una experiencia fluida.",
      ],
      tone: 'empathetic',
      useExclamation: false,
      useBulletPoints: true,
      explainMode: true,
      actionOriented: true,
    },
  },

  vacation_excitement: {
    en: {
      opening: [
        "How exciting! A vacation is just what you need!",
        "I love planning dream vacations! Let's make this unforgettable!",
        "Your vacation awaits! I'm thrilled to help you plan this!",
      ],
      closing: [
        "This is going to be an amazing trip!",
        "Can't wait to help you create wonderful memories!",
        "Have the time of your life!",
      ],
      tone: 'enthusiastic',
      useExclamation: true,
      useBulletPoints: true,
      explainMode: false,
      actionOriented: true,
    },
    pt: {
      opening: [
        "Que emocionante! Umas férias são exatamente o que você precisa!",
        "Adoro planejar férias dos sonhos! Vamos tornar isso inesquecível!",
        "Suas férias aguardam! Estou animado para ajudá-lo a planejar isso!",
      ],
      closing: [
        "Essa vai ser uma viagem incrível!",
        "Mal posso esperar para ajudá-lo a criar memórias maravilhosas!",
        "Aproveite ao máximo!",
      ],
      tone: 'enthusiastic',
      useExclamation: true,
      useBulletPoints: true,
      explainMode: false,
      actionOriented: true,
    },
    es: {
      opening: [
        "¡Qué emocionante! ¡Unas vacaciones son justo lo que necesitas!",
        "¡Me encanta planear vacaciones de ensueño! ¡Hagamos esto inolvidable!",
        "¡Tus vacaciones te esperan! ¡Estoy emocionado de ayudarte a planear esto!",
      ],
      closing: [
        "¡Este va a ser un viaje increíble!",
        "¡No puedo esperar para ayudarte a crear recuerdos maravillosos!",
        "¡Que lo pases de maravilla!",
      ],
      tone: 'enthusiastic',
      useExclamation: true,
      useBulletPoints: true,
      explainMode: false,
      actionOriented: true,
    },
  },

  business_urgency: {
    en: {
      opening: [
        "I understand this is time-sensitive. Let me find the fastest options.",
        "Business travel requires efficiency. I'll prioritize speed and convenience.",
        "Got it - let's get you there on time.",
      ],
      closing: [
        "I'll ensure you arrive prepared and on time.",
        "Your business trip is in good hands.",
        "Let's make this trip efficient and stress-free.",
      ],
      tone: 'urgent',
      useExclamation: false,
      useBulletPoints: true,
      explainMode: false,
      actionOriented: true,
    },
    pt: {
      opening: [
        "Entendo que isso é urgente. Deixe-me encontrar as opções mais rápidas.",
        "Viagens de negócios exigem eficiência. Vou priorizar velocidade e conveniência.",
        "Entendi - vamos levá-lo lá a tempo.",
      ],
      closing: [
        "Vou garantir que você chegue preparado e no horário.",
        "Sua viagem de negócios está em boas mãos.",
        "Vamos tornar esta viagem eficiente e sem estresse.",
      ],
      tone: 'urgent',
      useExclamation: false,
      useBulletPoints: true,
      explainMode: false,
      actionOriented: true,
    },
    es: {
      opening: [
        "Entiendo que esto es urgente. Déjame encontrar las opciones más rápidas.",
        "Los viajes de negocios requieren eficiencia. Priorizaré velocidad y conveniencia.",
        "Entendido - te llevaré allí a tiempo.",
      ],
      closing: [
        "Me aseguraré de que llegues preparado y a tiempo.",
        "Tu viaje de negocios está en buenas manos.",
        "Hagamos este viaje eficiente y sin estrés.",
      ],
      tone: 'urgent',
      useExclamation: false,
      useBulletPoints: true,
      explainMode: false,
      actionOriented: true,
    },
  },

  family_stress: {
    en: {
      opening: [
        "Traveling with family can be challenging! Let me help make it easier.",
        "I'll find family-friendly options that work for everyone.",
        "Family travel requires special attention. I've got you covered!",
      ],
      closing: [
        "Your family's comfort and safety come first.",
        "Let's make this a fun trip for the whole family!",
        "I'm here to make family travel stress-free.",
      ],
      tone: 'empathetic',
      useExclamation: true,
      useBulletPoints: true,
      explainMode: true,
      actionOriented: true,
    },
    pt: {
      opening: [
        "Viajar com a família pode ser desafiador! Deixe-me ajudar a tornar isso mais fácil.",
        "Vou encontrar opções adequadas para famílias que funcionem para todos.",
        "Viagens em família requerem atenção especial. Estou aqui para ajudar!",
      ],
      closing: [
        "O conforto e a segurança de sua família vêm em primeiro lugar.",
        "Vamos tornar esta uma viagem divertida para toda a família!",
        "Estou aqui para tornar as viagens em família livres de estresse.",
      ],
      tone: 'empathetic',
      useExclamation: true,
      useBulletPoints: true,
      explainMode: true,
      actionOriented: true,
    },
    es: {
      opening: [
        "¡Viajar con la familia puede ser desafiante! Déjame ayudar a hacerlo más fácil.",
        "Encontraré opciones aptas para familias que funcionen para todos.",
        "Los viajes familiares requieren atención especial. ¡Te tengo cubierto!",
      ],
      closing: [
        "La comodidad y seguridad de tu familia son lo primero.",
        "¡Hagamos de este un viaje divertido para toda la familia!",
        "Estoy aquí para hacer que los viajes familiares sean libres de estrés.",
      ],
      tone: 'empathetic',
      useExclamation: true,
      useBulletPoints: true,
      explainMode: true,
      actionOriented: true,
    },
  },

  budget_concerned: {
    en: {
      opening: [
        "I totally understand - let's find the best value!",
        "Budget travel doesn't mean sacrificing quality. Let me find great deals!",
        "Smart spending is important. I'll find affordable options.",
      ],
      closing: [
        "You don't have to break the bank for a great trip!",
        "Let me help you save while traveling smart.",
        "Great value is out there - let's find it!",
      ],
      tone: 'empathetic',
      useExclamation: true,
      useBulletPoints: true,
      explainMode: false,
      actionOriented: true,
    },
    pt: {
      opening: [
        "Eu entendo completamente - vamos encontrar o melhor valor!",
        "Viajar com orçamento não significa sacrificar qualidade. Deixe-me encontrar ótimas ofertas!",
        "Gastar com sabedoria é importante. Vou encontrar opções acessíveis.",
      ],
      closing: [
        "Você não precisa gastar muito para uma ótima viagem!",
        "Deixe-me ajudá-lo a economizar enquanto viaja com inteligência.",
        "Há grande valor por aí - vamos encontrá-lo!",
      ],
      tone: 'empathetic',
      useExclamation: true,
      useBulletPoints: true,
      explainMode: false,
      actionOriented: true,
    },
    es: {
      opening: [
        "¡Lo entiendo totalmente - vamos a encontrar el mejor valor!",
        "Viajar con presupuesto no significa sacrificar calidad. ¡Déjame encontrar grandes ofertas!",
        "Gastar inteligentemente es importante. Encontraré opciones asequibles.",
      ],
      closing: [
        "¡No tienes que romper el banco para un gran viaje!",
        "Déjame ayudarte a ahorrar mientras viajas inteligentemente.",
        "¡Hay gran valor ahí fuera - vamos a encontrarlo!",
      ],
      tone: 'empathetic',
      useExclamation: true,
      useBulletPoints: true,
      explainMode: false,
      actionOriented: true,
    },
  },

  first_time_flyer: {
    en: {
      opening: [
        "Congratulations on your first flight! I'll guide you through everything.",
        "First-time flying is exciting! Let me help you prepare.",
        "Welcome to the world of travel! I'm here to answer all your questions.",
      ],
      closing: [
        "You're going to do great!",
        "Flying is easier than you think - you've got this!",
        "I'm here if you have any questions along the way!",
      ],
      tone: 'empathetic',
      useExclamation: true,
      useBulletPoints: true,
      explainMode: true,
      actionOriented: true,
    },
    pt: {
      opening: [
        "Parabéns pelo seu primeiro voo! Vou orientá-lo em tudo.",
        "Voar pela primeira vez é emocionante! Deixe-me ajudá-lo a se preparar.",
        "Bem-vindo ao mundo das viagens! Estou aqui para responder todas as suas perguntas.",
      ],
      closing: [
        "Você vai se sair muito bem!",
        "Voar é mais fácil do que você pensa - você consegue!",
        "Estou aqui se você tiver alguma pergunta ao longo do caminho!",
      ],
      tone: 'empathetic',
      useExclamation: true,
      useBulletPoints: true,
      explainMode: true,
      actionOriented: true,
    },
    es: {
      opening: [
        "¡Felicitaciones por tu primer vuelo! Te guiaré en todo.",
        "¡Volar por primera vez es emocionante! Déjame ayudarte a prepararte.",
        "¡Bienvenido al mundo de los viajes! Estoy aquí para responder todas tus preguntas.",
      ],
      closing: [
        "¡Lo vas a hacer genial!",
        "Volar es más fácil de lo que piensas - ¡puedes hacerlo!",
        "¡Estoy aquí si tienes alguna pregunta en el camino!",
      ],
      tone: 'empathetic',
      useExclamation: true,
      useBulletPoints: true,
      explainMode: true,
      actionOriented: true,
    },
  },

  honeymoon_bliss: {
    en: {
      opening: [
        "Congratulations on your wedding! Let's plan the perfect honeymoon!",
        "How romantic! I'll help you create unforgettable memories.",
        "Newlyweds deserve the best! Let's make this magical!",
      ],
      closing: [
        "Wishing you a beautiful honeymoon and a lifetime of happiness!",
        "This is going to be so special!",
        "May your honeymoon be as wonderful as your love story!",
      ],
      tone: 'enthusiastic',
      useExclamation: true,
      useBulletPoints: true,
      explainMode: false,
      actionOriented: true,
    },
    pt: {
      opening: [
        "Parabéns pelo casamento! Vamos planejar a lua de mel perfeita!",
        "Que romântico! Vou ajudá-lo a criar memórias inesquecíveis.",
        "Recém-casados merecem o melhor! Vamos tornar isso mágico!",
      ],
      closing: [
        "Desejando-lhe uma bela lua de mel e uma vida de felicidade!",
        "Isso vai ser tão especial!",
        "Que sua lua de mel seja tão maravilhosa quanto sua história de amor!",
      ],
      tone: 'enthusiastic',
      useExclamation: true,
      useBulletPoints: true,
      explainMode: false,
      actionOriented: true,
    },
    es: {
      opening: [
        "¡Felicitaciones por tu boda! ¡Vamos a planear la luna de miel perfecta!",
        "¡Qué romántico! Te ayudaré a crear recuerdos inolvidables.",
        "¡Los recién casados merecen lo mejor! ¡Hagamos esto mágico!",
      ],
      closing: [
        "¡Deseándote una hermosa luna de miel y una vida de felicidad!",
        "¡Esto va a ser tan especial!",
        "¡Que tu luna de miel sea tan maravillosa como tu historia de amor!",
      ],
      tone: 'enthusiastic',
      useExclamation: true,
      useBulletPoints: true,
      explainMode: false,
      actionOriented: true,
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
