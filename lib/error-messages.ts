/**
 * User-Friendly Error Messages for Travel Booking Platform
 * Maps technical errors to actionable, helpful messages
 */

export interface ErrorMessage {
  title: string;
  description: string;
  suggestions?: string[];
  retryable: boolean;
}

export type ErrorCode =
  | 'network_error'
  | 'timeout'
  | '400'
  | '401'
  | '403'
  | '404'
  | '429'
  | '500'
  | '502'
  | '503'
  | '504'
  | 'no_results'
  | 'invalid_dates'
  | 'invalid_airport'
  | 'api_rate_limit'
  | 'unknown';

export const ERROR_MESSAGES: Record<ErrorCode, Record<'en' | 'pt' | 'es', ErrorMessage>> = {
  network_error: {
    en: {
      title: 'No Internet Connection',
      description: 'Please check your internet connection and try again.',
      suggestions: [
        'Make sure you are connected to the internet',
        'Try switching between Wi-Fi and mobile data',
        'Disable any VPN or proxy services'
      ],
      retryable: true
    },
    pt: {
      title: 'Sem Conexão com a Internet',
      description: 'Por favor, verifique sua conexão com a internet e tente novamente.',
      suggestions: [
        'Certifique-se de estar conectado à internet',
        'Tente alternar entre Wi-Fi e dados móveis',
        'Desative qualquer VPN ou serviços de proxy'
      ],
      retryable: true
    },
    es: {
      title: 'Sin Conexión a Internet',
      description: 'Por favor, verifica tu conexión a internet e inténtalo de nuevo.',
      suggestions: [
        'Asegúrate de estar conectado a internet',
        'Intenta alternar entre Wi-Fi y datos móviles',
        'Desactiva cualquier VPN o servicios proxy'
      ],
      retryable: true
    }
  },

  timeout: {
    en: {
      title: 'Search Taking Longer Than Usual',
      description: 'The flight search is taking longer than expected. This might be due to high demand.',
      suggestions: [
        'Wait a moment and the results should appear',
        'Try searching for fewer passengers',
        'Search for a more flexible date range',
        'Try again in a few minutes'
      ],
      retryable: true
    },
    pt: {
      title: 'Busca Demorando Mais Que o Normal',
      description: 'A busca de voos está demorando mais do que o esperado. Isso pode ser devido à alta demanda.',
      suggestions: [
        'Aguarde um momento e os resultados devem aparecer',
        'Tente buscar para menos passageiros',
        'Busque por um intervalo de datas mais flexível',
        'Tente novamente em alguns minutos'
      ],
      retryable: true
    },
    es: {
      title: 'Búsqueda Tardando Más de lo Normal',
      description: 'La búsqueda de vuelos está tardando más de lo esperado. Esto puede deberse a una alta demanda.',
      suggestions: [
        'Espera un momento y los resultados deberían aparecer',
        'Intenta buscar para menos pasajeros',
        'Busca un rango de fechas más flexible',
        'Inténtalo de nuevo en unos minutos'
      ],
      retryable: true
    }
  },

  '400': {
    en: {
      title: 'Invalid Search Parameters',
      description: 'Some of your search details are incorrect or missing.',
      suggestions: [
        'Check that your departure and return dates are correct',
        'Ensure you have selected valid airports',
        'Verify that your number of passengers is correct'
      ],
      retryable: true
    },
    pt: {
      title: 'Parâmetros de Busca Inválidos',
      description: 'Alguns dos seus detalhes de busca estão incorretos ou faltando.',
      suggestions: [
        'Verifique se suas datas de ida e volta estão corretas',
        'Certifique-se de ter selecionado aeroportos válidos',
        'Verifique se o número de passageiros está correto'
      ],
      retryable: true
    },
    es: {
      title: 'Parámetros de Búsqueda Inválidos',
      description: 'Algunos de tus detalles de búsqueda son incorrectos o faltan.',
      suggestions: [
        'Verifica que tus fechas de ida y vuelta sean correctas',
        'Asegúrate de haber seleccionado aeropuertos válidos',
        'Verifica que el número de pasajeros sea correcto'
      ],
      retryable: true
    }
  },

  '429': {
    en: {
      title: 'Too Many Searches',
      description: 'You have made too many searches in a short time. Please wait a moment before searching again.',
      suggestions: [
        'Wait 1-2 minutes before your next search',
        'Refine your search criteria to be more specific',
        'Try clearing your browser cache'
      ],
      retryable: true
    },
    pt: {
      title: 'Muitas Buscas',
      description: 'Você fez muitas buscas em pouco tempo. Por favor, aguarde um momento antes de buscar novamente.',
      suggestions: [
        'Aguarde 1-2 minutos antes da próxima busca',
        'Refine seus critérios de busca para serem mais específicos',
        'Tente limpar o cache do navegador'
      ],
      retryable: true
    },
    es: {
      title: 'Demasiadas Búsquedas',
      description: 'Has realizado demasiadas búsquedas en poco tiempo. Por favor, espera un momento antes de buscar de nuevo.',
      suggestions: [
        'Espera 1-2 minutos antes de tu próxima búsqueda',
        'Refina tus criterios de búsqueda para ser más específico',
        'Intenta limpiar la caché del navegador'
      ],
      retryable: true
    }
  },

  '500': {
    en: {
      title: 'Technical Issue on Our End',
      description: 'We are experiencing technical difficulties. Our team has been notified and is working to fix this.',
      suggestions: [
        'Try again in a few moments',
        'Search for a different route',
        'Contact our support team if the issue persists'
      ],
      retryable: true
    },
    pt: {
      title: 'Problema Técnico do Nosso Lado',
      description: 'Estamos enfrentando dificuldades técnicas. Nossa equipe foi notificada e está trabalhando para corrigir isso.',
      suggestions: [
        'Tente novamente em alguns momentos',
        'Busque por uma rota diferente',
        'Entre em contato com nossa equipe de suporte se o problema persistir'
      ],
      retryable: true
    },
    es: {
      title: 'Problema Técnico de Nuestra Parte',
      description: 'Estamos experimentando dificultades técnicas. Nuestro equipo ha sido notificado y está trabajando para solucionarlo.',
      suggestions: [
        'Inténtalo de nuevo en unos momentos',
        'Busca una ruta diferente',
        'Contacta a nuestro equipo de soporte si el problema persiste'
      ],
      retryable: true
    }
  },

  '503': {
    en: {
      title: 'Service Temporarily Unavailable',
      description: 'Our flight search service is temporarily unavailable. We are working to restore it as quickly as possible.',
      suggestions: [
        'Try again in 5-10 minutes',
        'Check our status page for updates',
        'Contact support for urgent booking needs'
      ],
      retryable: true
    },
    pt: {
      title: 'Serviço Temporariamente Indisponível',
      description: 'Nosso serviço de busca de voos está temporariamente indisponível. Estamos trabalhando para restaurá-lo o mais rápido possível.',
      suggestions: [
        'Tente novamente em 5-10 minutos',
        'Verifique nossa página de status para atualizações',
        'Entre em contato com o suporte para necessidades urgentes de reserva'
      ],
      retryable: true
    },
    es: {
      title: 'Servicio Temporalmente No Disponible',
      description: 'Nuestro servicio de búsqueda de vuelos no está disponible temporalmente. Estamos trabajando para restaurarlo lo más rápido posible.',
      suggestions: [
        'Inténtalo de nuevo en 5-10 minutos',
        'Consulta nuestra página de estado para actualizaciones',
        'Contacta al soporte para necesidades urgentes de reserva'
      ],
      retryable: true
    }
  },

  no_results: {
    en: {
      title: 'No Flights Found',
      description: 'We could not find any flights matching your search criteria.',
      suggestions: [
        'Try flexible dates (±3 days)',
        'Include flights with stops',
        'Search nearby airports (e.g., EWR instead of JFK)',
        'Increase your budget filter range'
      ],
      retryable: false
    },
    pt: {
      title: 'Nenhum Voo Encontrado',
      description: 'Não conseguimos encontrar voos que correspondam aos seus critérios de busca.',
      suggestions: [
        'Tente datas flexíveis (±3 dias)',
        'Inclua voos com escalas',
        'Busque aeroportos próximos (ex: EWR em vez de JFK)',
        'Aumente o intervalo do filtro de orçamento'
      ],
      retryable: false
    },
    es: {
      title: 'No Se Encontraron Vuelos',
      description: 'No pudimos encontrar vuelos que coincidan con tus criterios de búsqueda.',
      suggestions: [
        'Intenta fechas flexibles (±3 días)',
        'Incluye vuelos con escalas',
        'Busca aeropuertos cercanos (ej: EWR en lugar de JFK)',
        'Aumenta el rango del filtro de presupuesto'
      ],
      retryable: false
    }
  },

  invalid_dates: {
    en: {
      title: 'Invalid Dates Selected',
      description: 'The dates you selected are not valid for booking.',
      suggestions: [
        'Make sure return date is after departure date',
        'Select dates in the future (not in the past)',
        'Check that dates are within the next 12 months'
      ],
      retryable: true
    },
    pt: {
      title: 'Datas Inválidas Selecionadas',
      description: 'As datas que você selecionou não são válidas para reserva.',
      suggestions: [
        'Certifique-se de que a data de retorno seja após a data de partida',
        'Selecione datas no futuro (não no passado)',
        'Verifique se as datas estão dentro dos próximos 12 meses'
      ],
      retryable: true
    },
    es: {
      title: 'Fechas Inválidas Seleccionadas',
      description: 'Las fechas que seleccionaste no son válidas para reservar.',
      suggestions: [
        'Asegúrate de que la fecha de regreso sea después de la fecha de salida',
        'Selecciona fechas en el futuro (no en el pasado)',
        'Verifica que las fechas estén dentro de los próximos 12 meses'
      ],
      retryable: true
    }
  },

  invalid_airport: {
    en: {
      title: 'Invalid Airport Code',
      description: 'One or more of the airport codes you entered are not recognized.',
      suggestions: [
        'Use 3-letter IATA codes (e.g., JFK, LAX, LHR)',
        'Select from the autocomplete suggestions',
        'Try typing the city name instead of the code'
      ],
      retryable: true
    },
    pt: {
      title: 'Código de Aeroporto Inválido',
      description: 'Um ou mais códigos de aeroporto que você inseriu não são reconhecidos.',
      suggestions: [
        'Use códigos IATA de 3 letras (ex: GRU, GIG, SDU)',
        'Selecione das sugestões de autocompletar',
        'Tente digitar o nome da cidade em vez do código'
      ],
      retryable: true
    },
    es: {
      title: 'Código de Aeropuerto Inválido',
      description: 'Uno o más de los códigos de aeropuerto que ingresaste no son reconocidos.',
      suggestions: [
        'Usa códigos IATA de 3 letras (ej: MAD, BCN, AGP)',
        'Selecciona de las sugerencias de autocompletar',
        'Intenta escribir el nombre de la ciudad en lugar del código'
      ],
      retryable: true
    }
  },

  unknown: {
    en: {
      title: 'Something Went Wrong',
      description: 'An unexpected error occurred. Please try your search again.',
      suggestions: [
        'Refresh the page and try again',
        'Clear your browser cache',
        'Try a different browser',
        'Contact support if the problem continues'
      ],
      retryable: true
    },
    pt: {
      title: 'Algo Deu Errado',
      description: 'Ocorreu um erro inesperado. Por favor, tente sua busca novamente.',
      suggestions: [
        'Atualize a página e tente novamente',
        'Limpe o cache do navegador',
        'Tente um navegador diferente',
        'Entre em contato com o suporte se o problema continuar'
      ],
      retryable: true
    },
    es: {
      title: 'Algo Salió Mal',
      description: 'Ocurrió un error inesperado. Por favor, intenta tu búsqueda de nuevo.',
      suggestions: [
        'Actualiza la página e inténtalo de nuevo',
        'Limpia la caché del navegador',
        'Intenta con un navegador diferente',
        'Contacta al soporte si el problema continúa'
      ],
      retryable: true
    }
  },

  // Additional error codes
  '401': {
    en: {
      title: 'Authentication Required',
      description: 'You need to be logged in to access this feature.',
      suggestions: ['Sign in to your account', 'Create a new account if you do not have one'],
      retryable: false
    },
    pt: {
      title: 'Autenticação Necessária',
      description: 'Você precisa estar logado para acessar este recurso.',
      suggestions: ['Entre na sua conta', 'Crie uma nova conta se você não tiver uma'],
      retryable: false
    },
    es: {
      title: 'Autenticación Requerida',
      description: 'Necesitas iniciar sesión para acceder a esta función.',
      suggestions: ['Inicia sesión en tu cuenta', 'Crea una nueva cuenta si no tienes una'],
      retryable: false
    }
  },

  '403': {
    en: {
      title: 'Access Denied',
      description: 'You do not have permission to perform this action.',
      suggestions: ['Check your account permissions', 'Contact support for assistance'],
      retryable: false
    },
    pt: {
      title: 'Acesso Negado',
      description: 'Você não tem permissão para executar esta ação.',
      suggestions: ['Verifique as permissões da sua conta', 'Entre em contato com o suporte para assistência'],
      retryable: false
    },
    es: {
      title: 'Acceso Denegado',
      description: 'No tienes permiso para realizar esta acción.',
      suggestions: ['Verifica los permisos de tu cuenta', 'Contacta al soporte para asistencia'],
      retryable: false
    }
  },

  '404': {
    en: {
      title: 'Resource Not Found',
      description: 'The requested resource could not be found.',
      suggestions: ['Check the URL is correct', 'Try searching from the homepage'],
      retryable: false
    },
    pt: {
      title: 'Recurso Não Encontrado',
      description: 'O recurso solicitado não pôde ser encontrado.',
      suggestions: ['Verifique se a URL está correta', 'Tente buscar a partir da página inicial'],
      retryable: false
    },
    es: {
      title: 'Recurso No Encontrado',
      description: 'No se pudo encontrar el recurso solicitado.',
      suggestions: ['Verifica que la URL sea correcta', 'Intenta buscar desde la página principal'],
      retryable: false
    }
  },

  '502': {
    en: {
      title: 'Gateway Error',
      description: 'We are having trouble connecting to our flight providers.',
      suggestions: ['Try again in a few moments', 'Check our status page', 'Contact support if urgent'],
      retryable: true
    },
    pt: {
      title: 'Erro de Gateway',
      description: 'Estamos tendo problemas para conectar com nossos fornecedores de voos.',
      suggestions: ['Tente novamente em alguns momentos', 'Verifique nossa página de status', 'Entre em contato com o suporte se urgente'],
      retryable: true
    },
    es: {
      title: 'Error de Gateway',
      description: 'Estamos teniendo problemas para conectar con nuestros proveedores de vuelos.',
      suggestions: ['Inténtalo de nuevo en unos momentos', 'Consulta nuestra página de estado', 'Contacta al soporte si es urgente'],
      retryable: true
    }
  },

  '504': {
    en: {
      title: 'Gateway Timeout',
      description: 'Our flight providers are taking too long to respond.',
      suggestions: ['Try again with fewer passengers', 'Search for more flexible dates', 'Try again in a few minutes'],
      retryable: true
    },
    pt: {
      title: 'Timeout do Gateway',
      description: 'Nossos fornecedores de voos estão demorando muito para responder.',
      suggestions: ['Tente novamente com menos passageiros', 'Busque por datas mais flexíveis', 'Tente novamente em alguns minutos'],
      retryable: true
    },
    es: {
      title: 'Timeout del Gateway',
      description: 'Nuestros proveedores de vuelos están tardando demasiado en responder.',
      suggestions: ['Inténtalo de nuevo con menos pasajeros', 'Busca fechas más flexibles', 'Inténtalo de nuevo en unos minutos'],
      retryable: true
    }
  },

  api_rate_limit: {
    en: {
      title: 'Rate Limit Exceeded',
      description: 'You have made too many requests. Please slow down.',
      suggestions: ['Wait a minute before trying again', 'Make sure you are not refreshing too frequently'],
      retryable: true
    },
    pt: {
      title: 'Limite de Taxa Excedido',
      description: 'Você fez muitas solicitações. Por favor, desacelere.',
      suggestions: ['Aguarde um minuto antes de tentar novamente', 'Certifique-se de não estar atualizando com muita frequência'],
      retryable: true
    },
    es: {
      title: 'Límite de Tasa Excedido',
      description: 'Has realizado demasiadas solicitudes. Por favor, reduce la velocidad.',
      suggestions: ['Espera un minuto antes de intentarlo de nuevo', 'Asegúrate de no estar actualizando con demasiada frecuencia'],
      retryable: true
    }
  }
};

/**
 * Get user-friendly error message for a given error
 */
export function getFriendlyErrorMessage(
  error: Error | string | number,
  language: 'en' | 'pt' | 'es' = 'en'
): ErrorMessage {
  let errorCode: ErrorCode = 'unknown';

  // Determine error code from error object
  if (typeof error === 'number') {
    errorCode = error.toString() as ErrorCode;
  } else if (typeof error === 'string') {
    errorCode = error as ErrorCode;
  } else if (error instanceof Error) {
    // Check for network errors
    if (error.message.includes('network') || error.message.includes('Failed to fetch')) {
      errorCode = 'network_error';
    }
    // Check for timeout errors
    else if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
      errorCode = 'timeout';
    }
    // Check for HTTP status codes in message
    else if (error.message.includes('status')) {
      const statusMatch = error.message.match(/status[:\s]+(\d+)/i);
      if (statusMatch) {
        errorCode = statusMatch[1] as ErrorCode;
      }
    }
    // Check error name
    else if (error.name === 'AbortError') {
      errorCode = 'timeout';
    }
  }

  // Return the appropriate error message or fallback to unknown
  const messages = ERROR_MESSAGES[errorCode];
  if (messages && messages[language]) {
    return messages[language];
  }

  return ERROR_MESSAGES.unknown[language];
}

/**
 * Check if user is offline
 */
export function isUserOffline(): boolean {
  return typeof navigator !== 'undefined' && !navigator.onLine;
}
