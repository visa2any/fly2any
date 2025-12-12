'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  CreditCard,
  Plane,
  Hotel,
  Car,
  Shield,
  HeadphonesIcon,
  Search,
  ChevronDown,
  MessageCircle
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  icon: any;
  title: string;
  items: FAQItem[];
}

interface Props {
  title: string;
  subtitle: string;
  categories: FAQCategory[];
  language?: 'en' | 'pt' | 'es';
}

export function FAQ({ title, subtitle, categories, language = 'en' }: Props) {
  // All categories collapsed by default - user expands as needed
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Toggle category open/closed
  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId) // Close if open
        : [...prev, categoryId] // Open if closed
    );
    // Reset open question when toggling categories
    setOpenQuestion(null);
  };

  // Translations
  const translations = {
    en: {
      searchPlaceholder: 'Search frequently asked questions...',
      popular: 'Popular',
      stillNeedHelp: 'Still have questions?',
      contactSupport: 'Contact our support team',
      whatsappChat: 'WhatsApp Chat',
      wasHelpful: 'Was this helpful?'
    },
    pt: {
      searchPlaceholder: 'Pesquisar perguntas frequentes...',
      popular: 'Popular',
      stillNeedHelp: 'Ainda tem dúvidas?',
      contactSupport: 'Entre em contato com nosso suporte',
      whatsappChat: 'Chat WhatsApp',
      wasHelpful: 'Isso foi útil?'
    },
    es: {
      searchPlaceholder: 'Buscar preguntas frecuentes...',
      popular: 'Popular',
      stillNeedHelp: '¿Aún tienes preguntas?',
      contactSupport: 'Contacta a nuestro equipo de soporte',
      whatsappChat: 'Chat WhatsApp',
      wasHelpful: '¿Fue útil esto?'
    }
  };

  const t = translations[language];

  // Popular questions (first question from each category)
  const popularQuestions = categories.slice(0, 3).map(cat => cat.items[0]?.question).filter(Boolean);

  // Filter questions based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;

    return categories.map(category => ({
      ...category,
      items: category.items.filter(
        item =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(category => category.items.length > 0);
  }, [categories, searchQuery]);

  return (
    <section className="py-4 md:py-8 lg:py-12 bg-gradient-to-br from-neutral-50 via-primary-50/10 to-neutral-50">
      <div className="mx-auto px-0 md:px-6" style={{ maxWidth: '1600px' }}>
        {/* Section Header - Level-6: Mobile compact, Desktop cinematic */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4 md:mb-6 lg:mb-8 px-3 md:px-0">
          <div className="flex items-center gap-2 lg:gap-3 min-w-0">
            <h2 className="text-sm md:text-[26px] lg:text-[32px] font-bold text-neutral-800 tracking-[0.01em] whitespace-nowrap">
              {title}
            </h2>
            <span className="hidden md:inline text-neutral-400 lg:text-xl">•</span>
            <p className="text-xs md:text-sm lg:text-base text-neutral-500 whitespace-nowrap truncate">{subtitle}</p>
          </div>

          {/* Search Bar - Level-6: Responsive sizing */}
          <div className="w-full md:w-auto md:min-w-[300px] lg:min-w-[400px]">
            <div className="relative">
              <Search className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-9 lg:pl-11 pr-3 lg:pr-4 py-2 lg:py-3 border border-neutral-200 rounded-lg lg:rounded-xl focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] text-xs lg:text-sm bg-white/80 shadow-sm focus:shadow-md"
              />
            </div>
          </div>
        </div>

        {/* FAQ Categories Grid - Level-6: Edge-to-edge mobile, spacious desktop */}
        <div className="grid md:grid-cols-2 gap-0.5 md:gap-4 lg:gap-6 mb-4 md:mb-8 lg:mb-10">
          {filteredCategories.map((category) => {
            const Icon = category.icon;
            const isOpen = openCategories.includes(category.id);

            return (
              <div
                key={category.id}
                className="bg-white md:rounded-xl lg:rounded-2xl border-y md:border-2 border-neutral-200 overflow-hidden transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:border-primary-300 md:hover:shadow-lg lg:hover:shadow-xl lg:hover:-translate-y-0.5"
              >
                {/* Category Header - Level-6: Responsive sizing */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full px-4 lg:px-6 py-3 lg:py-4 flex items-center justify-between hover:bg-neutral-50 transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] active:scale-[0.99]"
                >
                  <div className="flex items-center gap-2 lg:gap-3">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 lg:w-5 lg:h-5 text-primary-500" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-neutral-800 text-sm lg:text-base">
                        {category.title}
                      </h3>
                      <p className="text-[10px] lg:text-xs text-neutral-500">
                        {category.items.length} {language === 'en' ? 'questions' : language === 'pt' ? 'perguntas' : 'preguntas'}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 lg:w-5 lg:h-5 text-neutral-400 transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Questions List - Level-6: Responsive spacing */}
                {isOpen && (
                  <div className="px-4 lg:px-6 pt-2 pb-3 lg:pb-4 space-y-1 lg:space-y-2 animate-slideDown bg-neutral-50/50">
                    {category.items.map((item, itemIdx) => {
                      const questionId = `${category.id}-${itemIdx}`;
                      const isQuestionOpen = openQuestion === questionId;

                      return (
                        <div
                          key={itemIdx}
                          className="border border-gray-200 rounded-lg lg:rounded-xl overflow-hidden bg-gray-50/50 hover:border-primary-200 transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
                        >
                          <button
                            onClick={() => setOpenQuestion(isQuestionOpen ? null : questionId)}
                            className="w-full px-4 lg:px-5 py-3 lg:py-4 flex items-start justify-between text-left hover:bg-white transition-colors"
                          >
                            <span className="font-semibold text-gray-900 text-sm lg:text-base pr-3">
                              {item.question}
                            </span>
                            <ChevronDown
                              className={`w-4 h-4 lg:w-5 lg:h-5 text-primary-600 flex-shrink-0 mt-0.5 transition-transform duration-200 ${
                                isQuestionOpen ? 'rotate-180' : ''
                              }`}
                            />
                          </button>

                          {isQuestionOpen && (
                            <div className="px-4 lg:px-5 pb-3 lg:pb-4 pt-2 animate-fadeIn">
                              <div className="text-gray-700 text-sm lg:text-base leading-relaxed">
                                {item.answer}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact CTA - Level-6: Premium help section */}
        <div className="mt-4 md:mt-6 lg:mt-8 bg-white md:rounded-xl lg:rounded-2xl border-y md:border-2 border-neutral-200 px-3 py-3 md:p-6 lg:p-8 mx-0 shadow-sm lg:shadow-md">
          <div className="flex items-center gap-3 md:flex-col md:text-center">
            <MessageCircle className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-primary-500 flex-shrink-0" />
            <div className="flex-1 md:mb-3 lg:mb-4">
              <p className="text-neutral-800 font-semibold text-sm md:text-base lg:text-lg">{t.stillNeedHelp}</p>
              <p className="text-neutral-500 text-xs md:text-sm lg:text-base">
                {language === 'en' ? '24/7 support' : language === 'pt' ? 'Suporte 24/7' : 'Soporte 24/7'}
              </p>
            </div>
            <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
              <a
                href="tel:+13322200838"
                className="inline-flex items-center gap-1.5 lg:gap-2 px-3 lg:px-5 py-2 lg:py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-xs lg:text-sm font-medium rounded-lg lg:rounded-xl transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] active:scale-[0.97] hover:-translate-y-0.5 shadow-md hover:shadow-lg"
              >
                <HeadphonesIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                <span>{language === 'en' ? 'Call' : language === 'pt' ? 'Ligar' : 'Llamar'}</span>
              </a>
              <a
                href="mailto:support@fly2any.com"
                className="inline-flex items-center gap-1.5 lg:gap-2 px-3 lg:px-5 py-2 lg:py-2.5 bg-secondary-500 hover:bg-secondary-600 text-white text-xs lg:text-sm font-medium rounded-lg lg:rounded-xl transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] active:scale-[0.97] hover:-translate-y-0.5 shadow-md hover:shadow-lg"
              >
                <MessageCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                <span>Email</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
