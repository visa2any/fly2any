/**
 * WhatsApp Lead Extractor
 * Extrai informações de viagem das mensagens do WhatsApp e cria leads estruturados
 */

interface ExtractedLeadData {
  // Dados básicos
  nome?: string;
  email?: string;
  telefone?: string;
  whatsapp: string;
  
  // Dados da viagem
  origem?: string;
  destino?: string;
  dataPartida?: string;
  dataRetorno?: string;
  tipoViagem?: 'ida' | 'ida_volta';
  
  // Passageiros
  numeroPassageiros?: number;
  adultos?: number;
  criancas?: number;
  bebes?: number;
  
  // Preferências
  classeViagem?: 'economica' | 'executiva' | 'primeira';
  orcamentoAproximado?: string;
  prioridadeOrcamento?: 'baixo' | 'medio' | 'alto';
  
  // Serviços adicionais
  precisaHospedagem?: boolean;
  precisaTransporte?: boolean;
  precisaSeguro?: boolean;
  
  // Metadados
  intent: string;
  confidence: number;
  extractedFrom: string[];
  conversationContext: string;
}

export class WhatsAppLeadExtractor {
  
  // Padrões para extração de dados
  private static readonly PATTERNS = {
    // Cidades brasileiras e americanas
    cities: {
      brasil: [
        'são paulo', 'sp', 'rio de janeiro', 'rio', 'rj', 'belo horizonte', 'bh', 'mg',
        'salvador', 'ba', 'brasília', 'df', 'fortaleza', 'ce', 'recife', 'pe',
        'porto alegre', 'poa', 'rs', 'curitiba', 'cwb', 'pr', 'goiânia', 'go',
        'belém', 'pa', 'manaus', 'am', 'natal', 'rn', 'joão pessoa', 'pb',
        'maceió', 'al', 'aracaju', 'se', 'teresina', 'pi', 'campo grande', 'ms'
      ],
      eua: [
        'new york', 'ny', 'nova york', 'nova iorque', 'manhattan',
        'miami', 'fl', 'florida', 'orlando', 'tampa',
        'los angeles', 'la', 'california', 'san francisco', 'sf',
        'chicago', 'il', 'illinois',
        'atlanta', 'ga', 'georgia',
        'boston', 'ma', 'massachusetts',
        'washington', 'dc', 'seattle', 'wa',
        'denver', 'co', 'colorado',
        'houston', 'tx', 'texas', 'dallas', 'austin',
        'las vegas', 'nevada', 'nv'
      ]
    },
    
    // Padrões de datas
    dates: [
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/g, // DD/MM/YYYY ou DD-MM-YYYY
      /(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+(\d{1,2})/gi,
      /(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\s+(\d{1,2})/gi,
      /(\d{1,2})\s+(de\s+)?(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)/gi
    ],
    
    // Números de passageiros
    passengers: [
      /(\d+)\s+(pessoas?|passageiros?|adultos?)/gi,
      /(\d+)\s+(crianças?|kids?)/gi,
      /(\d+)\s+(bebês?|babies?)/gi,
      /(somos|vamos)\s+(\d+)/gi,
      /(\d+)\s+(pax|passageiros)/gi
    ],
    
    // Orçamento
    budget: [
      /\$?\s?(\d+(?:,\d{3})*(?:\.\d{2})?)\s?(dollars?|reais?|r\$|\$)/gi,
      /(até|máximo|limite)\s+\$?\s?(\d+(?:,\d{3})*)/gi,
      /(barato|econômico|mais em conta)/gi,
      /(premium|primeira classe|business)/gi
    ],
    
    // Contato
    contact: [
      /([a-zA-Z\s]+)(?:\s+é\s+o\s+meu\s+nome|me\s+chamo|sou\s+o)/gi,
      /meu\s+nome\s+é\s+([a-zA-Z\s]+)/gi,
      /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi, // Email
      /(\d{2,3})\s?(\d{4,5})\s?(\d{4})/g // Telefone
    ]
  };

  /**
   * Extrai dados de lead de uma mensagem WhatsApp
   */
  public static extractLeadData(
    phone: string, 
    messages: string[], 
    contactName?: string
  ): ExtractedLeadData {
    
    const fullText = messages.join(' ').toLowerCase();
    const leadData: ExtractedLeadData = {
      whatsapp: phone,
      nome: contactName,
      telefone: phone,
      intent: this.detectTravelIntent(fullText),
      confidence: 0,
      extractedFrom: messages,
      conversationContext: fullText
    };

    // Extrair origem e destino
    const locations = this.extractLocations(fullText);
    leadData.origem = locations.origem;
    leadData.destino = locations.destino;

    // Extrair datas
    const dates = this.extractDates(messages);
    leadData.dataPartida = dates.partida;
    leadData.dataRetorno = dates.retorno;
    leadData.tipoViagem = dates.retorno ? 'ida_volta' : 'ida';

    // Extrair passageiros
    const passengers = this.extractPassengers(fullText);
    leadData.numeroPassageiros = passengers.total;
    leadData.adultos = passengers.adultos;
    leadData.criancas = passengers.criancas;
    leadData.bebes = passengers.bebes;

    // Extrair orçamento e classe
    const budget = this.extractBudget(fullText);
    leadData.orcamentoAproximado = budget.value;
    leadData.classeViagem = budget.class;
    leadData.prioridadeOrcamento = budget.priority;

    // Extrair serviços adicionais
    leadData.precisaHospedagem = /hotel|hospedagem|ficar|dormir/.test(fullText);
    leadData.precisaTransporte = /carro|aluguel|uber|transporte/.test(fullText);
    leadData.precisaSeguro = /seguro|proteção|cobertura/.test(fullText);

    // Extrair dados de contato
    const contact = this.extractContactInfo(messages.join(' '));
    if (contact.nome && !leadData.nome) leadData.nome = contact.nome;
    if (contact.email) leadData.email = contact.email;

    // Calcular confiança
    leadData.confidence = this.calculateConfidence(leadData);

    return leadData;
  }

  /**
   * Detecta se a mensagem tem intenção de viagem
   */
  private static detectTravelIntent(text: string): string {
    const travelKeywords = [
      'voo', 'voar', 'passagem', 'viagem', 'avião', 'aeroporto',
      'brasil', 'eua', 'estados unidos', 'america',
      'cotação', 'preço', 'quanto custa', 'valor',
      'hotel', 'hospedagem', 'carro', 'aluguel'
    ];
    
    const urgentKeywords = ['urgente', 'rápido', 'logo', 'hoje', 'amanhã'];
    const inquiryKeywords = ['preciso', 'quero', 'gostaria', 'posso', 'como'];
    
    if (urgentKeywords.some(keyword => text.includes(keyword))) {
      return 'urgent_travel_inquiry';
    }
    
    if (travelKeywords.some(keyword => text.includes(keyword))) {
      if (inquiryKeywords.some(keyword => text.includes(keyword))) {
        return 'travel_inquiry';
      }
      return 'travel_interest';
    }
    
    return 'general_inquiry';
  }

  /**
   * Extrai localizações (origem e destino)
   */
  private static extractLocations(text: string): { origem?: string; destino?: string } {
    const result: { origem?: string; destino?: string } = {};
    
    // Procurar padrões como "de X para Y", "X para Y", "saindo de X"
    const patterns = [
      /(?:de|saindo\s+de|partindo\s+de)\s+([^,\.\n]+?)\s+(?:para|até|destino)\s+([^,\.\n]+)/gi,
      /([^,\.\n]+?)\s+(?:para|até|→|->)\s+([^,\.\n]+)/gi,
      /(?:origem|saída)[:]\s*([^,\.\n]+?)(?:destino|chegada)[:]\s*([^,\.\n]+)/gi
    ];
    
    for (const pattern of patterns) {
      const matches = Array.from(text.matchAll(pattern));
      if (matches.length > 0) {
        const match = matches[0];
        result.origem = this.normalizeLocation(match[1]);
        result.destino = this.normalizeLocation(match[2]);
        break;
      }
    }
    
    // Se não encontrou padrão direto, procurar cidades mencionadas
    if (!result.origem || !result.destino) {
      const brasilCities = this.findCities(text, 'brasil');
      const euaCities = this.findCities(text, 'eua');
      
      if (brasilCities.length > 0 && euaCities.length > 0) {
        // Assumir que primeira cidade mencionada é origem
        result.origem = euaCities[0];
        result.destino = brasilCities[0];
      }
    }
    
    return result;
  }

  /**
   * Encontra cidades mencionadas no texto
   */
  private static findCities(text: string, country: 'brasil' | 'eua'): string[] {
    const cities = this.PATTERNS.cities[country];
    const found: string[] = [];
    
    for (const city of cities) {
      if (text.includes(city)) {
        found.push(this.normalizeLocation(city));
      }
    }
    
    return found;
  }

  /**
   * Normaliza nomes de localizações
   */
  private static normalizeLocation(location: string): string {
    const normalized = location.trim().toLowerCase();
    
    // Mapeamento de abreviações para nomes completos
    const locationMap: Record<string, string> = {
      'sp': 'São Paulo',
      'rj': 'Rio de Janeiro',
      'bh': 'Belo Horizonte',
      'ny': 'New York',
      'la': 'Los Angeles',
      'sf': 'San Francisco',
      'miami': 'Miami',
      'orlando': 'Orlando',
      'nova york': 'New York',
      'nova iorque': 'New York',
      'são paulo': 'São Paulo',
      'rio de janeiro': 'Rio de Janeiro'
    };
    
    return locationMap[normalized] || this.capitalizeWords(location);
  }

  /**
   * Capitaliza palavras
   */
  private static capitalizeWords(str: string): string {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  /**
   * Extrai datas das mensagens
   */
  private static extractDates(messages: string[]): { partida?: string; retorno?: string } {
    const result: { partida?: string; retorno?: string } = {};
    const fullText = messages.join(' ');
    
    // Procurar padrões de data
    for (const pattern of this.PATTERNS.dates) {
      const matches = Array.from(fullText.matchAll(pattern));
      if (matches.length > 0) {
        result.partida = this.normalizeDate(matches[0][0]);
        if (matches.length > 1) {
          result.retorno = this.normalizeDate(matches[1][0]);
        }
        break;
      }
    }
    
    return result;
  }

  /**
   * Normaliza formato de data
   */
  private static normalizeDate(dateStr: string): string {
    // Tentar converter para formato ISO
    try {
      // Remover palavras como "de" e normalizar
      const cleaned = dateStr.replace(/\s+de\s+/gi, ' ').trim();
      
      // Se já está em formato DD/MM/YYYY, converter para YYYY-MM-DD
      const ddmmyyyy = cleaned.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
      if (ddmmyyyy) {
        const [, day, month, year] = ddmmyyyy;
        const fullYear = year.length === 2 ? `20${year}` : year;
        return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      return cleaned;
    } catch {
      return dateStr;
    }
  }

  /**
   * Extrai informações de passageiros
   */
  private static extractPassengers(text: string): {
    total?: number;
    adultos?: number;
    criancas?: number;
    bebes?: number;
  } {
    const result: any = {};
    
    for (const pattern of this.PATTERNS.passengers) {
      const matches = Array.from(text.matchAll(pattern));
      for (const match of matches) {
        const number = parseInt(match[1] || match[2]);
        const type = (match[0] || '').toLowerCase();
        
        if (type.includes('criança') || type.includes('kid')) {
          result.criancas = number;
        } else if (type.includes('bebê') || type.includes('baby')) {
          result.bebes = number;
        } else if (type.includes('adulto') || type.includes('pessoa') || type.includes('passageiro')) {
          result.adultos = number;
        } else if (type.includes('somos') || type.includes('vamos')) {
          result.total = number;
        }
      }
    }
    
    // Calcular total se não informado
    if (!result.total && (result.adultos || result.criancas || result.bebes)) {
      result.total = (result.adultos || 0) + (result.criancas || 0) + (result.bebes || 0);
    }
    
    // Se só tem total, assumir que são adultos
    if (result.total && !result.adultos && !result.criancas && !result.bebes) {
      result.adultos = result.total;
    }
    
    return result;
  }

  /**
   * Extrai informações de orçamento
   */
  private static extractBudget(text: string): {
    value?: string;
    class?: 'economica' | 'executiva' | 'primeira';
    priority?: 'baixo' | 'medio' | 'alto';
  } {
    const result: any = {};
    
    // Extrair valores monetários
    for (const pattern of this.PATTERNS.budget) {
      const matches = Array.from(text.matchAll(pattern));
      if (matches.length > 0) {
        const match = matches[0];
        if (match[1] && /\d/.test(match[1])) {
          result.value = `$${match[1]}`;
        }
      }
    }
    
    // Detectar classe preferida
    if (/primeira\s+classe|first\s+class/.test(text)) {
      result.class = 'primeira';
      result.priority = 'alto';
    } else if (/business|executiva/.test(text)) {
      result.class = 'executiva';
      result.priority = 'alto';
    } else if (/econômica|economy|barato|mais\s+barato/.test(text)) {
      result.class = 'economica';
      result.priority = 'baixo';
    }
    
    // Detectar prioridade de orçamento
    if (/barato|econômico|mais\s+em\s+conta|menor\s+preço/.test(text)) {
      result.priority = 'baixo';
    } else if (/premium|luxo|melhor|primeira/.test(text)) {
      result.priority = 'alto';
    } else {
      result.priority = result.priority || 'medio';
    }
    
    return result;
  }

  /**
   * Extrai informações de contato
   */
  private static extractContactInfo(text: string): { nome?: string; email?: string } {
    const result: any = {};
    
    // Extrair nome
    const namePatterns = this.PATTERNS.contact.slice(0, 2);
    for (const pattern of namePatterns) {
      const matches = Array.from(text.matchAll(pattern));
      if (matches.length > 0) {
        result.nome = this.capitalizeWords(matches[0][1].trim());
        break;
      }
    }
    
    // Extrair email
    const emailPattern = this.PATTERNS.contact[2];
    const emailMatches = Array.from(text.matchAll(emailPattern));
    if (emailMatches.length > 0) {
      result.email = emailMatches[0][0].toLowerCase();
    }
    
    return result;
  }

  /**
   * Calcula confiança na extração de dados
   */
  private static calculateConfidence(data: ExtractedLeadData): number {
    let score = 0;
    let maxScore = 0;
    
    // Pontuação por campo preenchido
    const fields = [
      { field: 'origem', weight: 20 },
      { field: 'destino', weight: 20 },
      { field: 'dataPartida', weight: 15 },
      { field: 'numeroPassageiros', weight: 10 },
      { field: 'orcamentoAproximado', weight: 10 },
      { field: 'classeViagem', weight: 5 },
      { field: 'nome', weight: 10 },
      { field: 'email', weight: 10 }
    ];
    
    for (const { field, weight } of fields) {
      maxScore += weight;
      if (data[field as keyof ExtractedLeadData]) {
        score += weight;
      }
    }
    
    return Math.round((score / maxScore) * 100);
  }

  /**
   * Verifica se os dados são suficientes para criar um lead
   */
  public static isValidLead(data: ExtractedLeadData): boolean {
    // Critérios mínimos para um lead válido
    const hasLocation = !!(data.origem || data.destino);
    const hasTravelIntent = data.intent.includes('travel');
    const hasMinimalInfo = data.confidence >= 30;
    
    return hasLocation && hasTravelIntent && hasMinimalInfo;
  }

  /**
   * Converte dados extraídos para formato de lead da API
   */
  public static toLeadFormat(data: ExtractedLeadData): any {
    return {
      nome: data.nome || 'Cliente WhatsApp',
      email: data.email || '',
      whatsapp: data.whatsapp,
      telefone: data.telefone,
      origem: data.origem || '',
      destino: data.destino || '',
      dataPartida: data.dataPartida || '',
      dataRetorno: data.dataRetorno || '',
      tipoViagem: data.tipoViagem || 'ida_volta',
      numeroPassageiros: data.numeroPassageiros || 1,
      adultos: data.adultos || data.numeroPassageiros || 1,
      criancas: data.criancas || 0,
      bebes: data.bebes || 0,
      classeViagem: data.classeViagem || 'economica',
      orcamentoAproximado: data.orcamentoAproximado || '',
      prioridadeOrcamento: data.prioridadeOrcamento || 'medio',
      precisaHospedagem: data.precisaHospedagem || false,
      precisaTransporte: data.precisaTransporte || false,
      precisaSeguro: data.precisaSeguro || false,
      selectedServices: [
        'voos',
        ...(data.precisaHospedagem ? ['hospedagem'] : []),
        ...(data.precisaTransporte ? ['transporte'] : []),
        ...(data.precisaSeguro ? ['seguro'] : [])
      ],
      source: 'whatsapp',
      observacoes: `Dados extraídos do WhatsApp (confiança: ${data.confidence}%):\n\n${data.conversationContext}`,
      metadata: {
        whatsappExtraction: true,
        confidence: data.confidence,
        intent: data.intent,
        extractedFrom: data.extractedFrom
      }
    };
  }
}