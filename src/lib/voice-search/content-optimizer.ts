/**
 * Voice Search Content Optimizer for Brazilian Portuguese
 * Optimizes existing content for long-tail conversational queries
 * Focuses on natural language patterns and question-based content
 */

import { brazilianVoiceSearchPatterns, regionalVoicePatterns } from './portuguese-voice-patterns';
import { brazilianDiaspora } from '../data/brazilian-diaspora';

export interface ContentOptimization {
  originalContent: string;
  optimizedContent: string;
  targetKeywords: string[];
  voiceQueries: string[];
  readabilityScore: number;
  conversationalScore: number;
  localRelevanceScore: number;
  improvements: string[];
}

export interface VoiceOptimizedPage {
  url: string;
  title: string;
  metaDescription: string;
  h1: string;
  h2Tags: string[];
  content: string;
  faqSection: FAQItem[];
  structuredData: object;
  voiceKeywords: string[];
  region: string;
  intent: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category: string;
  voiceOptimized: boolean;
}

export class VoiceSearchContentOptimizer {
  private conversationalWords = [
    'como', 'onde', 'quando', 'quanto', 'qual', 'quem', 'por que', 'para que',
    'que tal', 'será que', 'você sabe', 'me diga', 'pode me falar', 'gostaria de saber',
    'tenho dúvida', 'preciso saber', 'quero entender', 'ajuda com', 'orientação sobre'
  ];

  private voiceConnectors = [
    'então', 'assim', 'bem', 'olha', 'veja', 'repare', 'atenção', 'importante',
    'lembre-se', 'não esqueça', 'dica importante', 'fica a dica', 'vale lembrar'
  ];

  private regionalGreetings = {
    northeast: ['oxe', 'ôxe', 'ei', 'oi gente', 'fala galera'],
    southeast: ['uai', 'ô', 'ei pessoal', 'galera'],
    south: ['bah', 'tchê', 'oi pessoal', 'galera'],
    north: ['rapaz', 'mano', 'véi', 'galera']
  };

  /**
   * Optimize content for voice search queries
   */
  public optimizeContentForVoice(
    content: string, 
    targetRegion: string = 'general',
    intent: string = 'informational'
  ): ContentOptimization {
    const originalContent = content;
    
    // Step 1: Add conversational elements
    let optimizedContent = this.makeContentConversational(content, targetRegion);
    
    // Step 2: Optimize for question-based queries
    optimizedContent = this.optimizeForQuestions(optimizedContent);
    
    // Step 3: Add regional language variations
    optimizedContent = this.addRegionalVariations(optimizedContent, targetRegion);
    
    // Step 4: Improve readability for voice
    optimizedContent = this.improveVoiceReadability(optimizedContent);
    
    // Step 5: Add natural transitions
    optimizedContent = this.addNaturalTransitions(optimizedContent);

    const targetKeywords = this.extractVoiceKeywords(optimizedContent, targetRegion);
    const voiceQueries = this.generateVoiceQueries(optimizedContent, targetRegion);
    
    return {
      originalContent,
      optimizedContent,
      targetKeywords,
      voiceQueries,
      readabilityScore: this.calculateReadabilityScore(optimizedContent),
      conversationalScore: this.calculateConversationalScore(optimizedContent),
      localRelevanceScore: this.calculateLocalRelevanceScore(optimizedContent, targetRegion),
      improvements: this.listImprovements(originalContent, optimizedContent)
    };
  }

  /**
   * Make content more conversational for voice search
   */
  private makeContentConversational(content: string, region: string): string {
    let conversational = content;
    
    // Add greeting based on region
    const regionGreetings = this.regionalGreetings[region as keyof typeof this.regionalGreetings];
    if (regionGreetings && Math.random() > 0.7) {
      const greeting = regionGreetings[Math.floor(Math.random() * regionGreetings.length)];
      conversational = `${greeting}, ${conversational.toLowerCase()}`;
    }
    
    // Replace formal language with conversational
    const formalToConversational = {
      'é necessário': 'você precisa',
      'recomenda-se': 'recomendamos',
      'deve-se': 'você deve',
      'é possível': 'você pode',
      'encontram-se': 'você encontra',
      'realiza-se': 'você faz',
      'considera-se': 'considera',
      'utiliza-se': 'usa',
      'efetua-se': 'faz'
    };
    
    Object.entries(formalToConversational).forEach(([formal, conversational]) => {
      const regex = new RegExp(formal, 'gi');
      conversational = conversational.replace(regex, conversational);
    });
    
    // Add conversational connectors
    const sentences = conversational.split('. ');
    const connectedSentences = sentences.map((sentence, index) => {
      if (index > 0 && Math.random() > 0.6) {
        const connector = this.voiceConnectors[Math.floor(Math.random() * this.voiceConnectors.length)];
        return `${connector}, ${sentence.toLowerCase()}`;
      }
      return sentence;
    });
    
    return connectedSentences.join('. ');
  }

  /**
   * Optimize content for question-based queries
   */
  private optimizeForQuestions(content: string): string {
    // Identify implicit questions and make them explicit
    const questionPatterns = [
      {
        pattern: /preço.*passagem/gi,
        questions: [
          'Quanto custa uma passagem?',
          'Qual o preço da passagem?',
          'Quanto você paga numa passagem?'
        ]
      },
      {
        pattern: /melhor época/gi,
        questions: [
          'Quando é a melhor época para viajar?',
          'Qual o melhor mês para viajar?',
          'Quando viajar?'
        ]
      },
      {
        pattern: /documento.*necessário/gi,
        questions: [
          'Que documentos precisa?',
          'Quais documentos são necessários?',
          'Precisa de documentos especiais?'
        ]
      }
    ];
    
    let questionOptimized = content;
    
    questionPatterns.forEach(({ pattern, questions }) => {
      if (pattern.test(content)) {
        const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
        questionOptimized = `${randomQuestion}\n\n${questionOptimized}`;
      }
    });
    
    return questionOptimized;
  }

  /**
   * Add regional language variations
   */
  private addRegionalVariations(content: string, region: string): string {
    if (region === 'general') return content;
    
    const regionalTerms = regionalVoicePatterns[region as keyof typeof regionalVoicePatterns];
    if (!regionalTerms) return content;
    
    let regionalContent = content;
    
    // Replace generic terms with regional variations
    Object.entries(regionalTerms.localTerms).forEach(([generic, variations]) => {
      const variation = variations[Math.floor(Math.random() * variations.length)];
      const regex = new RegExp(`\\b${generic}\\b`, 'gi');
      if (Math.random() > 0.7) { // Don't replace all instances
        regionalContent = regionalContent.replace(regex, variation);
      }
    });
    
    return regionalContent;
  }

  /**
   * Improve readability for voice assistants
   */
  private improveVoiceReadability(content: string): string {
    let voiceFriendly = content;
    
    // Add pauses for better voice flow
    voiceFriendly = voiceFriendly.replace(/,/g, ', ');
    voiceFriendly = voiceFriendly.replace(/\./g, '. ');
    voiceFriendly = voiceFriendly.replace(/:/g, ': ');
    
    // Break long sentences
    const sentences = voiceFriendly.split('. ');
    const optimizedSentences = sentences.map(sentence => {
      if (sentence.length > 120) {
        // Try to break at logical points
        const breakPoints = [' mas ', ' porém ', ' entretanto ', ' no entanto ', ' porque ', ' já que '];
        for (const breakPoint of breakPoints) {
          if (sentence.includes(breakPoint)) {
            return sentence.replace(breakPoint, `.${breakPoint.trim()}`);
          }
        }
      }
      return sentence;
    });
    
    return optimizedSentences.join('. ');
  }

  /**
   * Add natural transitions between topics
   */
  private addNaturalTransitions(content: string): string {
    const transitions = [
      'Além disso',
      'Também é importante saber que',
      'Outro ponto interessante é',
      'Vale lembrar que',
      'Não esqueça de',
      'Uma dica importante:',
      'Atenção para'
    ];
    
    const paragraphs = content.split('\n\n');
    const transitionedParagraphs = paragraphs.map((paragraph, index) => {
      if (index > 0 && index < paragraphs.length - 1 && Math.random() > 0.6) {
        const transition = transitions[Math.floor(Math.random() * transitions.length)];
        return `${transition}, ${paragraph.toLowerCase()}`;
      }
      return paragraph;
    });
    
    return transitionedParagraphs.join('\n\n');
  }

  /**
   * Extract voice-optimized keywords from content
   */
  private extractVoiceKeywords(content: string, region: string): string[] {
    const voiceKeywords: Set<string> = new Set();
    
    // Add conversational question starters
    this.conversationalWords.forEach(word => {
      if (content.toLowerCase().includes(word)) {
        voiceKeywords.add(word);
      }
    });
    
    // Add regional expressions
    const regionalTerms = regionalVoicePatterns[region as keyof typeof regionalVoicePatterns];
    if (regionalTerms) {
      regionalTerms.commonExpressions.forEach(expr => {
        if (content.toLowerCase().includes(expr)) {
          voiceKeywords.add(expr);
        }
      });
    }
    
    // Add travel-related voice keywords
    const travelVoiceKeywords = [
      'quanto custa', 'como fazer', 'onde encontrar', 'qual o melhor',
      'precisa de', 'tem que', 'é necessário', 'como conseguir',
      'vale a pena', 'é melhor', 'recomenda', 'dica'
    ];
    
    travelVoiceKeywords.forEach(keyword => {
      if (content.toLowerCase().includes(keyword)) {
        voiceKeywords.add(keyword);
      }
    });
    
    return Array.from(voiceKeywords);
  }

  /**
   * Generate natural voice queries from content
   */
  private generateVoiceQueries(content: string, region: string): string[] {
    const queries: string[] = [];
    
    // Extract main topics and convert to questions
    const topics = this.extractTopics(content);
    
    topics.forEach(topic => {
      // Generate questions for each topic
      const questionStarters = ['Como', 'Onde', 'Quando', 'Quanto', 'Qual', 'Precisa'];
      
      questionStarters.forEach(starter => {
        if (Math.random() > 0.7) { // Don't generate too many
          queries.push(`${starter} ${topic}?`);
        }
      });
    });
    
    // Add regional variations
    if (region !== 'general') {
      const regionalGreeting = this.regionalGreetings[region as keyof typeof this.regionalGreetings];
      if (regionalGreeting) {
        const greeting = regionalGreeting[0];
        queries.forEach((query, index) => {
          if (Math.random() > 0.8) {
            queries[index] = `${greeting}, ${query.toLowerCase()}`;
          }
        });
      }
    }
    
    return queries.slice(0, 10); // Limit to top 10 queries
  }

  /**
   * Extract main topics from content
   */
  private extractTopics(content: string): string[] {
    const travelKeywords = [
      'passagem', 'voo', 'viagem', 'brasil', 'preço', 'documento', 'visto',
      'hotel', 'turismo', 'destino', 'companhia aérea', 'aeroporto'
    ];
    
    const topics: string[] = [];
    
    travelKeywords.forEach(keyword => {
      if (content.toLowerCase().includes(keyword)) {
        topics.push(keyword);
      }
    });
    
    return topics;
  }

  /**
   * Calculate readability score for voice
   */
  private calculateReadabilityScore(content: string): number {
    const sentences = content.split(/[.!?]+/).length;
    const words = content.split(/\s+/).length;
    const avgWordsPerSentence = words / sentences;
    
    // Optimal for voice: 10-15 words per sentence
    if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 15) {
      return 100;
    } else if (avgWordsPerSentence <= 20) {
      return 80;
    } else if (avgWordsPerSentence <= 25) {
      return 60;
    } else {
      return 40;
    }
  }

  /**
   * Calculate conversational score
   */
  private calculateConversationalScore(content: string): number {
    let score = 0;
    
    // Check for conversational words
    this.conversationalWords.forEach(word => {
      if (content.toLowerCase().includes(word)) {
        score += 5;
      }
    });
    
    // Check for voice connectors
    this.voiceConnectors.forEach(connector => {
      if (content.toLowerCase().includes(connector)) {
        score += 3;
      }
    });
    
    // Check for questions
    const questionCount = (content.match(/\?/g) || []).length;
    score += questionCount * 10;
    
    return Math.min(score, 100);
  }

  /**
   * Calculate local relevance score
   */
  private calculateLocalRelevanceScore(content: string, region: string): number {
    if (region === 'general') return 50;
    
    let score = 0;
    const regionalTerms = regionalVoicePatterns[region as keyof typeof regionalVoicePatterns];
    
    if (regionalTerms) {
      // Check for regional expressions
      regionalTerms.commonExpressions.forEach(expr => {
        if (content.toLowerCase().includes(expr)) {
          score += 15;
        }
      });
      
      // Check for local terms
      Object.values(regionalTerms.localTerms).flat().forEach(term => {
        if (content.toLowerCase().includes(term)) {
          score += 10;
        }
      });
    }
    
    // Check for diaspora cities
    const relevantCities = brazilianDiaspora.filter(city => 
      city.region.toLowerCase() === region.toLowerCase() || region === 'general'
    );
    
    relevantCities.forEach(city => {
      if (content.toLowerCase().includes(city.name.toLowerCase())) {
        score += 5;
      }
    });
    
    return Math.min(score, 100);
  }

  /**
   * List improvements made to content
   */
  private listImprovements(original: string, optimized: string): string[] {
    const improvements: string[] = [];
    
    if (optimized.length > original.length) {
      improvements.push('Conteúdo expandido para melhor contexto');
    }
    
    if ((optimized.match(/\?/g) || []).length > (original.match(/\?/g) || []).length) {
      improvements.push('Perguntas adicionadas para otimização de voz');
    }
    
    if (optimized.includes('como') || optimized.includes('onde') || optimized.includes('quando')) {
      improvements.push('Linguagem conversacional implementada');
    }
    
    if (optimized.includes('você') && !original.includes('você')) {
      improvements.push('Tom mais direto e pessoal');
    }
    
    const originalSentenceLength = original.split(/[.!?]+/).length;
    const optimizedSentenceLength = optimized.split(/[.!?]+/).length;
    
    if (optimizedSentenceLength > originalSentenceLength) {
      improvements.push('Sentenças quebradas para melhor fluidez na fala');
    }
    
    return improvements;
  }

  /**
   * Create voice-optimized page structure
   */
  public createVoiceOptimizedPage(
    topic: string,
    region: string = 'general',
    intent: string = 'informational'
  ): VoiceOptimizedPage {
    const relevantPatterns = brazilianVoiceSearchPatterns.filter(pattern => 
      pattern.intent === intent && (pattern.region === region || pattern.region === 'general')
    );
    
    const mainQuery = relevantPatterns[0]?.query || topic;
    const variations = relevantPatterns[0]?.naturalVariations || [];
    
    // Generate voice-optimized title
    const title = this.generateVoiceOptimizedTitle(topic, region);
    
    // Generate meta description
    const metaDescription = this.generateVoiceMetaDescription(topic, region);
    
    // Generate H2 tags based on common questions
    const h2Tags = this.generateH2Tags(topic, region);
    
    // Generate FAQ section
    const faqSection = this.generateFAQSection(topic, region);
    
    // Generate structured data
    const structuredData = this.generateStructuredData(topic, faqSection);
    
    return {
      url: `/voice-search/${topic.toLowerCase().replace(/\s+/g, '-')}`,
      title,
      metaDescription,
      h1: title,
      h2Tags,
      content: `Resposta completa sobre ${topic} otimizada para busca por voz em português brasileiro.`,
      faqSection,
      structuredData,
      voiceKeywords: variations,
      region,
      intent
    };
  }

  private generateVoiceOptimizedTitle(topic: string, region: string): string {
    const regionalPrefix = region !== 'general' ? 
      `${region.charAt(0).toUpperCase() + region.slice(1)}: ` : '';
    
    return `${regionalPrefix}${topic} - Guia Completo 2024`;
  }

  private generateVoiceMetaDescription(topic: string, region: string): string {
    return `Descubra tudo sobre ${topic}. Respostas rápidas e precisas para suas perguntas sobre viagens para o Brasil. Otimizado para busca por voz.`;
  }

  private generateH2Tags(topic: string, region: string): string[] {
    return [
      `Como ${topic}?`,
      `Quanto custa ${topic}?`,
      `Onde ${topic}?`,
      `Quando ${topic}?`,
      `Dicas importantes sobre ${topic}`,
      'Perguntas frequentes'
    ];
  }

  private generateFAQSection(topic: string, region: string): FAQItem[] {
    return [
      {
        question: `Como ${topic}?`,
        answer: `Para ${topic}, siga estes passos principais...`,
        category: 'howto',
        voiceOptimized: true
      },
      {
        question: `Quanto custa ${topic}?`,
        answer: `Os preços para ${topic} variam dependendo...`,
        category: 'pricing',
        voiceOptimized: true
      },
      {
        question: `Onde posso ${topic}?`,
        answer: `Você pode ${topic} nos seguintes lugares...`,
        category: 'location',
        voiceOptimized: true
      }
    ];
  }

  private generateStructuredData(topic: string, faqs: FAQItem[]): object {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };
  }
}

export default VoiceSearchContentOptimizer;