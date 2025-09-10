'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon, MicrophoneIcon } from '@heroicons/react/24/outline';
import { brazilianVoiceSearchPatterns, voiceSearchResponses } from '@/lib/voice-search/portuguese-voice-patterns';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  region?: string;
  relatedQuestions: string[];
  voiceOptimized: boolean;
  searchVolume: number;
  intent: string;
}

interface PortugueseFAQProps {
  category?: string;
  region?: string;
  showVoiceIndicator?: boolean;
}

const PortugueseFAQ: React.FC<PortugueseFAQProps> = ({ 
  category = 'all', 
  region = 'general',
  showVoiceIndicator = true 
}) => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFAQs, setFilteredFAQs] = useState<FAQItem[]>([]);
  const [isListening, setIsListening] = useState(false);

  // Comprehensive Brazilian Portuguese FAQ Database
  const brazilianFAQs: FAQItem[] = [
    // TRAVEL BOOKING - HIGH VOLUME VOICE QUERIES
    {
      id: 'price-brasil-usa-1',
      question: 'Quanto custa uma passagem para o Brasil?',
      answer: 'Os preços de passagens para o Brasil variam entre R$ 1.800 e R$ 4.500, dependendo da época do ano, cidade de origem nos EUA, destino no Brasil e antecedência da compra. Para conseguir os melhores preços, recomendamos comprar com 45-60 dias de antecedência. As rotas mais populares como Miami-São Paulo ou New York-Rio de Janeiro têm preços mais competitivos devido ao maior número de voos.',
      category: 'precos',
      region: 'general',
      relatedQuestions: [
        'De qual cidade sai mais barato para o Brasil?',
        'Quando é mais barato viajar para o Brasil?',
        'Qual companhia aérea tem melhor preço?'
      ],
      voiceOptimized: true,
      searchVolume: 8500,
      intent: 'price-inquiry'
    },

    {
      id: 'cheap-flights-sao-paulo-1',
      question: 'Como encontrar passagem barata para São Paulo?',
      answer: 'Para encontrar passagens baratas para São Paulo, siga estas dicas: 1) Use nosso comparador de preços para ver todas as opções, 2) Seja flexível com as datas (+/- 3 dias pode economizar até 40%), 3) Considere voos com escala (geralmente 20-30% mais baratos), 4) Compre com antecedência mínima de 45 dias, 5) Evite feriados e alta temporada (dezembro-março), 6) Inscreva-se para receber alertas de promoções. Miami, Orlando e New York são os pontos de partida com melhores preços.',
      category: 'passagens',
      region: 'general',
      relatedQuestions: [
        'Qual o dia da semana mais barato para viajar?',
        'Vale a pena voo com escala?',
        'Como receber alertas de promoção?'
      ],
      voiceOptimized: true,
      searchVolume: 12000,
      intent: 'travel-booking'
    },

    {
      id: 'visa-requirement-1',
      question: 'Precisa de visto para brasileiro viajar pros Estados Unidos?',
      answer: 'Sim, brasileiros precisam de visto para entrar nos Estados Unidos. É necessário solicitar o visto de turista B1/B2 no consulado americano. O processo inclui: preenchimento do formulário DS-160, pagamento da taxa de $185, agendamento da entrevista, e apresentação dos documentos necessários. O tempo de processamento varia de 5 a 60 dias úteis. Recomendamos solicitar com pelo menos 3 meses de antecedência da viagem.',
      category: 'documentos',
      region: 'general',
      relatedQuestions: [
        'Quanto custa o visto americano?',
        'Quais documentos precisa para visto americano?',
        'Quanto tempo demora para sair o visto?'
      ],
      voiceOptimized: true,
      searchVolume: 15000,
      intent: 'travel-requirements'
    },

    // REGIONAL VARIATIONS - NORTHEAST
    {
      id: 'salvador-carnival-1',
      question: 'Oxe, quanto custa ir para Salvador no carnaval?',
      answer: 'Ôxe, meu rei! No carnaval, Salvador fica mais cara mesmo, viu? As passagens podem custar entre R$ 2.800 e R$ 6.000, dependendo de onde você tá partindo. Miami e New York têm as melhores conexões. Mas ó, se você comprar com 4-5 meses de antecedência, dá pra economizar até uns 40%. E olha, vale muito a pena! Salvador no carnaval é massa demais! Tem os blocos, o axé music, e a energia da galera é contagiante.',
      category: 'destinos',
      region: 'northeast',
      relatedQuestions: [
        'Qual o melhor bloco de carnaval em Salvador?',
        'Onde ficar hospedado em Salvador no carnaval?',
        'Precisa comprar antecipado ingresso dos blocos?'
      ],
      voiceOptimized: true,
      searchVolume: 4500,
      intent: 'price-inquiry'
    },

    // SOUTHEAST VARIATIONS
    {
      id: 'belo-horizonte-direct-1',
      question: 'Uai, tem voo direto de Miami para Belo Horizonte?',
      answer: 'Uai sô, infelizmente não tem voo direto de Miami para Belo Horizonte não. Mas ó, você pode fazer conexão em São Paulo (Guarulhos) ou Rio de Janeiro (Galeão), que fica bem tranquilo. A LATAM tem umas conexões boas que chegam no Confins em umas 12-14 horas total de viagem. São Paulo é geralmente mais rápido, com conexão de 2-3 horas só. E olha, às vezes sai até mais barato que voo direto pros outros destinos!',
      category: 'rotas',
      region: 'southeast',
      relatedQuestions: [
        'Quanto tempo de conexão em São Paulo?',
        'É melhor conexão em São Paulo ou Rio?',
        'Precisa pegar bagagem na conexão?'
      ],
      voiceOptimized: true,
      searchVolume: 2800,
      intent: 'travel-booking'
    },

    // SOUTH REGION
    {
      id: 'porto-alegre-price-1',
      question: 'Bah, qual o valor da passagem Porto Alegre New York?',
      answer: 'Bah tchê, passagem de POA pra New York anda custando entre R$ 3.200 e R$ 5.800, dependendo da época. Geralmente você vai fazer conexão em São Paulo ou às vezes em Santiago do Chile. A LATAM e a American têm as melhores rotas. Se tu conseguir viajar fora da alta temporada (evita dezembro-março e julho), dá pra economizar uma baita grana! E ó, comprando uns 2 meses antes, já ajuda bastante no preço.',
      category: 'precos',
      region: 'south',
      relatedQuestions: [
        'Qual companhia aérea voa de Porto Alegre?',
        'É melhor sair de POA ou ir até São Paulo?',
        'Tem desconto pra estudante gaúcho?'
      ],
      voiceOptimized: true,
      searchVolume: 1800,
      intent: 'price-inquiry'
    },

    // DIASPORA COMMUNITY QUERIES
    {
      id: 'money-transfer-brazil-1',
      question: 'Como mandar dinheiro para família no Brasil?',
      answer: 'Existem várias formas seguras de enviar dinheiro para o Brasil: 1) Remitly - taxas baixas e rápido (1-2 dias), 2) Western Union - disponível em muitos locais, 3) Wise (ex-TransferWise) - taxa de câmbio boa, 4) Remessa Online - empresa brasileira confiável, 5) MoneyGram - rede grande de agentes. Compare sempre as taxas e tempo de entrega. Para valores acima de $1000, Wise e Remitly geralmente oferecem as melhores condições. Evite bancos tradicionais, que cobram taxas altas.',
      category: 'servicos',
      region: 'general',
      relatedQuestions: [
        'Qual o limite para envio sem declarar?',
        'Quanto tempo demora transferência internacional?',
        'É seguro mandar dinheiro pela internet?'
      ],
      voiceOptimized: true,
      searchVolume: 7200,
      intent: 'local-info'
    },

    {
      id: 'brazilian-food-nearby-1',
      question: 'Onde encontrar comida brasileira aqui perto?',
      answer: 'Para encontrar restaurantes brasileiros perto de você, experimente: 1) Google Maps - busque por "restaurante brasileiro" ou "churrascaria", 2) Yelp - filtre por culinária brasileira, 3) Apps como DoorDash e Uber Eats têm filtros por país, 4) Facebook - grupos de brasileiros locais sempre indicam lugares, 5) Nossa lista de restaurantes recomendados por cidade. Procure por churrascarias, lanchonetes com açaí, ou restaurantes que servem feijoada aos sábados.',
      category: 'gastronomia',
      region: 'general',
      relatedQuestions: [
        'Que pratos brasileiros posso pedir?',
        'Churrascaria é caro nos EUA?',
        'Onde comprar ingredientes brasileiros?'
      ],
      voiceOptimized: true,
      searchVolume: 5400,
      intent: 'local-info'
    },

    // COMPARISON QUERIES
    {
      id: 'airline-comparison-1',
      question: 'Qual é melhor, LATAM ou American para o Brasil?',
      answer: 'Ambas são excelentes opções, mas têm características diferentes: LATAM - Melhor para: brasileiros (tripulação fala português, comida brasileira, mais voos diretos), programa de fidelidade TAM/LATAM aceito no Brasil, geralmente mais pontual. American - Melhor para: preços competitivos, rede maior nos EUA, upgrades mais fáceis se você tem status, melhor entretenimento a bordo. Nossa recomendação: LATAM para conforto e familiaridade, American para economia e flexibilidade.',
      category: 'companhias',
      region: 'general',
      relatedQuestions: [
        'Qual companhia tem melhor comida?',
        'LATAM é mais cara que American?',
        'Bagagem grátis em qual companhia?'
      ],
      voiceOptimized: true,
      searchVolume: 4200,
      intent: 'comparison'
    },

    // SEASONAL QUERIES
    {
      id: 'black-friday-deals-1',
      question: 'Tem desconto de Black Friday para passagens Brasil?',
      answer: 'Sim! Black Friday é uma das melhores épocas para comprar passagens para o Brasil. Descontos típicos: 20-40% em passagens internacionais, até 50% em pacotes completos com hotel, ofertas relâmpago com 24-48h de duração. Dicas: 1) Se inscreva em nossas newsletters, 2) Siga redes sociais das companhias aéreas, 3) Tenha datas flexíveis preparadas, 4) Compare preços antes para identificar desconto real, 5) Cyber Monday também tem ótimas ofertas.',
      category: 'promocoes',
      region: 'general',
      relatedQuestions: [
        'Quando começam ofertas Black Friday?',
        'Cyber Monday tem desconto também?',
        'Como saber se é desconto real?'
      ],
      voiceOptimized: true,
      searchVolume: 6800,
      intent: 'price-inquiry'
    },

    // EMERGENCY TRAVEL
    {
      id: 'urgent-travel-brazil-1',
      question: 'Preciso viajar urgente para o Brasil, como faço?',
      answer: 'Para viagem urgente ao Brasil: 1) Ligue diretamente para companhias aéreas (LATAM, American, Delta) - às vezes têm assentos não mostrados online, 2) Considere rotas alternativas com conexões, 3) Aeroportos menores podem ter disponibilidade, 4) Procure agências especializadas em emergência (cobramos taxa mas resolvemos rápido), 5) Se for emergência familiar, algumas companhias oferecem tarifas especiais. Para hoje/amanhã: Miami e New York têm mais opções. Ligue agora: (555) 123-BRASIL.',
      category: 'emergencia',
      region: 'general',
      relatedQuestions: [
        'Passagem de última hora é muito cara?',
        'Como conseguir visto americano urgente?',
        'Tem seguro para viagem emergência?'
      ],
      voiceOptimized: true,
      searchVolume: 3200,
      intent: 'travel-booking'
    },

    // TECHNICAL QUERIES
    {
      id: 'phone-brazil-roaming-1',
      question: 'Meu celular vai funcionar no Brasil?',
      answer: 'Sim, a maioria dos celulares americanos funciona no Brasil, mas atenção aos custos! Opções: 1) Roaming internacional - caro ($5-15/dia), 2) Comprar chip brasileiro - mais barato para estadias longas, 3) eSIM internacional - prático e barato, 4) WiFi apenas - economiza mas limita uso. Recomendação: para até 10 dias, use eSIM internacional. Mais de 10 dias, compre chip brasileiro (Vivo, Claro, TIM) no aeroporto. Não esqueça de desbloquear seu aparelho antes de viajar!',
      category: 'tecnologia',
      region: 'general',
      relatedQuestions: [
        'Quanto custa roaming no Brasil?',
        'Onde comprar chip brasileiro?',
        'Como desbloquear celular para viagem?'
      ],
      voiceOptimized: true,
      searchVolume: 4800,
      intent: 'travel-requirements'
    },

    // CULTURAL/TOURISM
    {
      id: 'rio-must-see-1',
      question: 'O que não pode perder no Rio de Janeiro?',
      answer: 'No Rio de Janeiro, você não pode perder: 1) Cristo Redentor - símbolo da cidade, vista incrível, 2) Pão de Açúcar - pôr do sol espetacular, 3) Praias de Copacabana e Ipanema - clássicas cariocas, 4) Santa Teresa - bairro boêmio com arte e cultura, 5) Lapa - vida noturna e arcos históricos, 6) Maracanã - templo do futebol, 7) Lagoa Rodrigo de Freitas - pedalinho e caminhada. Dica local: experimente açaí na praia e água de coco gelada!',
      category: 'turismo',
      region: 'general',
      relatedQuestions: [
        'Quantos dias precisa para conhecer Rio?',
        'Rio de Janeiro é seguro para turistas?',
        'Melhor época para visitar Rio?'
      ],
      voiceOptimized: true,
      searchVolume: 9200,
      intent: 'destination-info'
    },

    // HEALTH/SAFETY
    {
      id: 'vaccine-brazil-travel-1',
      question: 'Precisa tomar vacina para viajar pro Brasil?',
      answer: 'Para a maioria das regiões do Brasil, não há vacinas obrigatórias para turistas americanos. Exceções: 1) Febre amarela - obrigatória para Amazônia, Pantanal e algumas áreas rurais, 2) Recomendadas sempre: hepatite A e B, tétano atualizado, 3) Consulte CDC.gov para updates, 4) Se vier de país com risco de febre amarela, certificado é obrigatório. Consulte seu médico 4-6 semanas antes da viagem. A vacina de febre amarela deve ser tomada pelo menos 10 dias antes da viagem.',
      category: 'saude',
      region: 'general',
      relatedQuestions: [
        'Onde tomar vacina febre amarela?',
        'Precisa certificado internacional vacinação?',
        'Brasil tem dengue ou zika?'
      ],
      voiceOptimized: true,
      searchVolume: 5600,
      intent: 'travel-requirements'
    },

    // BEST TIME TO TRAVEL
    {
      id: 'best-time-brazil-1',
      question: 'Qual a melhor época para viajar para o Brasil?',
      answer: 'A melhor época depende da região: 1) Sudeste/Sul (Rio, São Paulo): Outono/Inverno (março-setembro) - menos chuva, temperaturas agradáveis, 2) Nordeste (Salvador, Recife): Ano todo é bom, evite junho-agosto (mais chuva), 3) Norte/Amazônia: Seca (junho-novembro), 4) Pantanal: Seca (maio-setembro) para ver animais. Para economia: evite dezembro-março (alta temporada), julho (férias escolares) e carnaval. Abril-junho e agosto-novembro têm melhores preços e clima agradável.',
      category: 'planejamento',
      region: 'general',
      relatedQuestions: [
        'Quando é carnaval no Brasil?',
        'Dezembro é boa época para Brasil?',
        'Qual época tem menos turista?'
      ],
      voiceOptimized: true,
      searchVolume: 7400,
      intent: 'destination-info'
    }
  ];

  // Filter FAQs based on category, region, and search term
  useEffect(() => {
    let filtered = brazilianFAQs;

    if (category !== 'all') {
      filtered = filtered.filter(faq => faq.category === category);
    }

    if (region !== 'general') {
      filtered = filtered.filter(faq => faq.region === region || faq.region === 'general');
    }

    if (searchTerm) {
      filtered = filtered.filter(faq => 
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by search volume (popularity)
    filtered.sort((a, b) => b.searchVolume - a.searchVolume);

    setFilteredFAQs(filtered);
  }, [category, region, searchTerm]);

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const startVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window) {
      setIsListening(true);
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchTerm(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      {/* Search Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Perguntas Frequentes - Viagens para o Brasil
        </h2>
        <p className="text-gray-600 mb-6">
          Encontre respostas rápidas para suas dúvidas sobre viagens para o Brasil. 
          Perguntas otimizadas para busca por voz em português.
        </p>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Digite sua pergunta ou use a busca por voz..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {showVoiceIndicator && (
            <button
              onClick={startVoiceSearch}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full ${
                isListening 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600'
              } transition-colors`}
              title="Busca por voz"
            >
              <MicrophoneIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* FAQ Items */}
      <div className="space-y-4">
        {filteredFAQs.map((faq) => (
          <div
            key={faq.id}
            className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Question Header */}
            <button
              onClick={() => toggleItem(faq.id)}
              className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {faq.question}
                  </h3>
                  <div className="flex items-center space-x-3 text-sm text-gray-500">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full capitalize">
                      {faq.category}
                    </span>
                    {faq.voiceOptimized && showVoiceIndicator && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center">
                        <MicrophoneIcon className="w-3 h-3 mr-1" />
                        Voz
                      </span>
                    )}
                    <span className="text-gray-400">
                      {faq.searchVolume.toLocaleString()} buscas/mês
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  {openItems.has(faq.id) ? (
                    <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
            </button>

            {/* Answer Content */}
            {openItems.has(faq.id) && (
              <div className="px-6 py-4 bg-white border-t border-gray-100">
                <div className="prose prose-blue max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {faq.answer}
                  </p>
                  
                  {/* Related Questions */}
                  {faq.relatedQuestions.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Perguntas relacionadas:
                      </h4>
                      <ul className="space-y-2">
                        {faq.relatedQuestions.map((relatedQ, index) => (
                          <li key={index}>
                            <button
                              onClick={() => setSearchTerm(relatedQ)}
                              className="text-blue-600 hover:text-blue-800 text-sm hover:underline"
                            >
                              • {relatedQ}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Voice Search Optimization Indicator */}
                  {faq.voiceOptimized && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        📱 <strong>Otimizado para busca por voz:</strong> Esta resposta foi criada 
                        especificamente para funcionar bem com assistentes de voz em português 
                        (Google Assistant, Siri, Alexa).
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* No Results Message */}
      {filteredFAQs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.464-.881-6.08-2.333M5.198 13.726A7.962 7.962 0 013 8a7.962 7.962 0 018-8 7.962 7.962 0 018 8 7.962 7.962 0 01-1.336 4.437" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma pergunta encontrada
          </h3>
          <p className="text-gray-500 mb-4">
            Tente usar termos diferentes ou limpe o filtro de busca.
          </p>
          <button
            onClick={() => setSearchTerm('')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Mostrar todas as perguntas
          </button>
        </div>
      )}

      {/* Voice Search Help */}
      {showVoiceIndicator && (
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            💡 Dica: Use a busca por voz!
          </h3>
          <p className="text-blue-800 text-sm">
            Clique no ícone do microfone e faça sua pergunta naturalmente em português. 
            Nosso sistema foi otimizado para entender perguntas como "Quanto custa viajar para o Brasil?" 
            ou "Precisa de visto para ir aos Estados Unidos?".
          </p>
        </div>
      )}
    </div>
  );
};

export default PortugueseFAQ;