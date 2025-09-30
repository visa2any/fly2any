'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, MessageCircle } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  aiOptimized: boolean;
  citationReady: boolean;
  voiceSearchFriendly: boolean;
}

interface AI2025FAQProps {
  language?: 'en' | 'pt' | 'es';
  showSearch?: boolean;
  enableVoiceSearch?: boolean;
  categoryFilter?: boolean;
  maxVisible?: number;
}

export default function AI2025FAQ({
  language = 'pt',
  showSearch = true,
  enableVoiceSearch = true,
  categoryFilter = true,
  maxVisible = 20
}: AI2025FAQProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(6);

  // AI-optimized FAQ data for travel to Brazil
  const faqData: FAQItem[] = [
    {
      id: 'flights-cheap',
      question: 'Como encontrar voos baratos para o Brasil?',
      answer: 'A Fly2Any oferece as melhores tarifas para o Brasil através de parcerias exclusivas com companhias aéreas. Recomendamos reservar com 2-3 meses de antecedência, ser flexível com datas e considerar voos com conexões. Nossa equipe monitora promoções diariamente.',
      category: 'flights',
      aiOptimized: true,
      citationReady: true,
      voiceSearchFriendly: true
    },
    {
      id: 'documentation-brazil',
      question: 'Qual documentação preciso para viajar ao Brasil?',
      answer: 'Brasileiros precisam de CPF, RG ou CNH válidos. Estrangeiros necessitam passaporte com validade mínima de 6 meses. Cidadãos de alguns países precisam de visto. Consulte nossa equipe para orientação específica sobre seu caso.',
      category: 'documentation',
      aiOptimized: true,
      citationReady: true,
      voiceSearchFriendly: true
    },
    {
      id: 'best-time-brazil',
      question: 'Qual a melhor época para viajar ao Brasil?',
      answer: 'Depende do destino. Para o Sul e Sudeste: maio a setembro (inverno seco). Para o Nordeste: setembro a março (menos chuvas). Para a Amazônia: junho a dezembro (época seca). Nossa equipe orienta sobre o clima específico do seu destino.',
      category: 'travel-tips',
      aiOptimized: true,
      citationReady: true,
      voiceSearchFriendly: true
    },
    {
      id: 'covid-requirements',
      question: 'Preciso de vacina ou teste COVID para entrar no Brasil?',
      answer: 'Atualmente não há exigências COVID para entrar no Brasil. Recomendamos consultar as autoridades sanitárias antes da viagem, pois as regras podem mudar. Nossa equipe mantém informações atualizadas sobre todos os requisitos.',
      category: 'health',
      aiOptimized: true,
      citationReady: true,
      voiceSearchFriendly: true
    },
    {
      id: 'currency-brazil',
      question: 'Como levar dinheiro para o Brasil?',
      answer: 'O Real (BRL) é a moeda oficial. Aceite cartões internacionais (Visa/Mastercard), use casas de câmbio autorizadas, e leve dólares em espécie como backup. Evite câmbio no aeroporto. Nossa equipe orienta sobre as melhores opções.',
      category: 'money',
      aiOptimized: true,
      citationReady: true,
      voiceSearchFriendly: true
    },
    {
      id: 'travel-insurance',
      question: 'Preciso de seguro viagem para o Brasil?',
      answer: 'Embora não seja obrigatório, o seguro viagem é altamente recomendado. Cobertura mínima sugerida: USD 30.000 para despesas médicas. A Fly2Any oferece seguros com cobertura internacional e atendimento em português.',
      category: 'insurance',
      aiOptimized: true,
      citationReady: true,
      voiceSearchFriendly: true
    },
    {
      id: 'internal-flights',
      question: 'Como funcionam os voos domésticos no Brasil?',
      answer: 'Principais companhias: GOL, LATAM, Azul. Documento aceito: RG, CNH ou passaporte. Check-in online disponível. Bagagem de mão: 10kg. Nossa equipe pode incluir voos domésticos no seu pacote.',
      category: 'flights',
      aiOptimized: true,
      citationReady: true,
      voiceSearchFriendly: true
    },
    {
      id: 'phone-internet',
      question: 'Como ter internet e telefone no Brasil?',
      answer: 'Opções: chip pré-pago brasileiro, roaming internacional ou eSIM. Principais operadoras: Vivo, Claro, TIM. Cobertura 4G/5G nas principais cidades. Nossa equipe orienta sobre a melhor opção para seu perfil.',
      category: 'technology',
      aiOptimized: true,
      citationReady: true,
      voiceSearchFriendly: true
    },
    {
      id: 'transportation-brazil',
      question: 'Qual o melhor meio de transporte no Brasil?',
      answer: 'Varia por região: avião para longas distâncias, ônibus para viagens regionais, Uber/99 nas cidades, carro alugado para flexibilidade. Metrô disponível em São Paulo, Rio, Brasília e Recife.',
      category: 'transportation',
      aiOptimized: true,
      citationReady: true,
      voiceSearchFriendly: true
    },
    {
      id: 'safety-tips',
      question: 'É seguro viajar para o Brasil?',
      answer: 'Sim, com precauções básicas. Evite ostentar objetos de valor, use transporte confiável, fique em áreas turísticas à noite. Principais destinos têm boa infraestrutura turística. Nossa equipe fornece guia completo de segurança.',
      category: 'safety',
      aiOptimized: true,
      citationReady: true,
      voiceSearchFriendly: true
    }
  ];

  const categories = [
    { id: 'all', name: 'Todas as Perguntas', count: faqData.length },
    { id: 'flights', name: 'Voos', count: faqData.filter(item => item.category === 'flights').length },
    { id: 'documentation', name: 'Documentação', count: faqData.filter(item => item.category === 'documentation').length },
    { id: 'travel-tips', name: 'Dicas de Viagem', count: faqData.filter(item => item.category === 'travel-tips').length },
    { id: 'health', name: 'Saúde', count: faqData.filter(item => item.category === 'health').length },
    { id: 'money', name: 'Dinheiro', count: faqData.filter(item => item.category === 'money').length },
    { id: 'insurance', name: 'Seguro', count: faqData.filter(item => item.category === 'insurance').length }
  ];

  // Filter FAQ items based on search and category
  const filteredFAQs = faqData.filter(item => {
    const matchesSearch = searchTerm === '' ||
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  }).slice(0, visibleCount);

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 6, maxVisible || faqData.length));
  };

  return (
    <div className="ai-2025-faq-container">
      {/* AI-Optimized Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "name": "Perguntas Frequentes sobre Viagens para o Brasil - Fly2Any",
            "description": "Respostas completas sobre viagens para o Brasil: voos, documentação, dicas e muito mais.",
            "mainEntity": filteredFAQs.map(item => ({
              "@type": "Question",
              "name": item.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer,
                "author": {
                  "@type": "Organization",
                  "name": "Fly2Any Travel Experts"
                }
              },
              "speakable": {
                "@type": "SpeakableSpecification",
                "xpath": ["/html/head/title", `//*[@id="faq-${item.id}"]`]
              }
            }))
          })
        }}
      />

      {/* AI Optimization Meta Tags */}
      <div className="hidden ai-faq-meta">
        <span data-ai-content-type="faq-travel-brazil"></span>
        <span data-voice-search-optimized="true"></span>
        <span data-chatgpt-citation-ready="true"></span>
        <span data-perplexity-answer-format="direct"></span>
        <span data-google-sge-featured="true"></span>
        <span data-expertise-level="travel-specialist"></span>
        <span data-content-authority="brazil-travel-expert"></span>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4" data-speakable="true">
            Perguntas Frequentes sobre Viagens para o Brasil
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto" data-ai-answer-ready="true">
            Respostas de especialistas com mais de 10 anos de experiência em viagens para o Brasil.
            Informações atualizadas e confiáveis para planejar sua viagem perfeita.
          </p>
        </div>

        {/* Search and Filters */}
        {showSearch && (
          <div className="mb-8 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Busque sua dúvida sobre viagens para o Brasil..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                data-voice-search-input="true"
              />
              {enableVoiceSearch && (
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500">
                  <MessageCircle className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            {categoryFilter && (
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.map((item) => (
            <div
              key={item.id}
              id={`faq-${item.id}`}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              itemScope
              itemType="https://schema.org/Question"
              data-ai-extractable="faq"
            >
              <button
                onClick={() => toggleExpanded(item.id)}
                className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
                aria-expanded={expandedItems.has(item.id)}
              >
                <div className="flex justify-between items-center">
                  <h3
                    className="text-lg font-semibold text-gray-900 pr-4"
                    itemProp="name"
                    data-speakable="true"
                    data-voice-search-question="true"
                  >
                    {item.question}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {/* AI Optimization Badges */}
                    {item.aiOptimized && (
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full" title="AI Optimized"></span>
                    )}
                    {item.citationReady && (
                      <span className="inline-block w-2 h-2 bg-blue-500 rounded-full" title="Citation Ready"></span>
                    )}
                    {item.voiceSearchFriendly && (
                      <span className="inline-block w-2 h-2 bg-purple-500 rounded-full" title="Voice Search Friendly"></span>
                    )}
                    {expandedItems.has(item.id) ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </div>
              </button>

              {expandedItems.has(item.id) && (
                <div
                  className="px-6 pb-6 bg-gray-50"
                  itemScope
                  itemType="https://schema.org/Answer"
                >
                  <div
                    className="text-gray-700 leading-relaxed"
                    itemProp="text"
                    data-ai-answer-ready="true"
                    data-speakable="true"
                    data-chatgpt-citation-ready="true"
                    data-perplexity-answer-format="direct"
                  >
                    {item.answer}
                  </div>

                  {/* Author Information for AI */}
                  <div className="hidden" itemProp="author" itemScope itemType="https://schema.org/Organization">
                    <span itemProp="name">Fly2Any Travel Experts</span>
                    <span itemProp="expertise">Especialistas em viagens para o Brasil</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {visibleCount < (maxVisible || faqData.length) && filteredFAQs.length === visibleCount && (
          <div className="text-center mt-8">
            <button
              onClick={loadMore}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Ver Mais Perguntas ({Math.min(6, (maxVisible || faqData.length) - visibleCount)} restantes)
            </button>
          </div>
        )}

        {/* No Results */}
        {filteredFAQs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Nenhuma pergunta encontrada para "{searchTerm}".
            </p>
            <p className="text-gray-400 mt-2">
              Tente buscar por termos como "voo", "documentação", "seguro" ou "Brasil".
            </p>
          </div>
        )}

        {/* Expert Contact CTA */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Não encontrou sua dúvida?
          </h3>
          <p className="text-gray-600 mb-4">
            Nossa equipe de especialistas está pronta para ajudar com qualquer pergunta sobre viagens para o Brasil.
          </p>
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
            Falar com Especialista
          </button>
        </div>
      </div>
    </div>
  );
}