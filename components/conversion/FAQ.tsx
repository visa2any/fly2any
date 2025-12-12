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
  // Allow multiple categories to be open simultaneously for visual balance
  const [openCategories, setOpenCategories] = useState<string[]>(() => {
    // Default: Open first 2 categories for visual balance in 2-column layout
    return categories.slice(0, 2).map(cat => cat.id).filter(Boolean);
  });
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
    <section className="py-4 md:py-8 bg-gradient-to-br from-neutral-50 via-primary-50/10 to-neutral-50">
      <div className="mx-auto px-0 md:px-6" style={{ maxWidth: '1600px' }}>
        {/* Section Header - Level-6: Same row, no break, edge-to-edge */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4 md:mb-6 px-3 md:px-0">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-sm md:text-2xl font-bold text-neutral-800 whitespace-nowrap">
              {title}
            </h2>
            <span className="hidden md:inline text-neutral-400">•</span>
            <p className="text-xs md:text-sm text-neutral-500 whitespace-nowrap truncate">{subtitle}</p>
          </div>

          {/* Search Bar - Compact */}
          <div className="w-full md:w-auto md:min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 border border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 transition-all text-xs bg-white/80"
              />
            </div>
          </div>
        </div>

        {/* FAQ Categories Grid - Edge-to-edge on mobile */}
        <div className="grid md:grid-cols-2 gap-0.5 md:gap-4 mb-4 md:mb-8">
          {filteredCategories.map((category) => {
            const Icon = category.icon;
            const isOpen = openCategories.includes(category.id);

            return (
              <div
                key={category.id}
                className="bg-white md:rounded-xl border-y md:border-2 border-neutral-200 overflow-hidden transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:border-primary-300 md:hover:shadow-lg"
              >
                {/* Category Header - Level-6 Compact */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-neutral-50 transition-colors active:scale-[0.99]"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary-500" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-neutral-800 text-sm">
                        {category.title}
                      </h3>
                      <p className="text-[10px] text-neutral-500">
                        {category.items.length} {language === 'en' ? 'questions' : language === 'pt' ? 'perguntas' : 'preguntas'}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Questions List - Compact */}
                {isOpen && (
                  <div className="px-4 pt-2 pb-3 space-y-1 animate-slideDown bg-neutral-50/50">
                    {category.items.map((item, itemIdx) => {
                      const questionId = `${category.id}-${itemIdx}`;
                      const isQuestionOpen = openQuestion === questionId;

                      return (
                        <div
                          key={itemIdx}
                          className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/50 hover:border-primary-200 transition-colors"
                        >
                          <button
                            onClick={() => setOpenQuestion(isQuestionOpen ? null : questionId)}
                            className="w-full px-4 py-3 flex items-start justify-between text-left hover:bg-white transition-colors"
                          >
                            <span className="font-semibold text-gray-900 text-sm pr-3">
                              {item.question}
                            </span>
                            <ChevronDown
                              className={`w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5 transition-transform duration-200 ${
                                isQuestionOpen ? 'rotate-180' : ''
                              }`}
                            />
                          </button>

                          {isQuestionOpen && (
                            <div className="px-4 pb-3 pt-2 animate-fadeIn">
                              <div className="text-gray-700 text-sm leading-relaxed">
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

        {/* Contact CTA - Compact */}
        <div className="mt-4 md:mt-6 bg-white md:rounded-xl border-y md:border-2 border-neutral-200 px-3 py-3 md:p-6 mx-0">
          <div className="flex items-center gap-3 md:flex-col md:text-center">
            <MessageCircle className="w-8 h-8 md:w-10 md:h-10 text-primary-500 flex-shrink-0" />
            <div className="flex-1 md:mb-3">
              <p className="text-neutral-800 font-semibold text-sm md:text-base">{t.stillNeedHelp}</p>
              <p className="text-neutral-500 text-xs md:text-sm">
                {language === 'en' ? '24/7 support' : language === 'pt' ? 'Suporte 24/7' : 'Soporte 24/7'}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <a
                href="tel:+13322200838"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-medium rounded-lg transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] active:scale-[0.97]"
              >
                <HeadphonesIcon className="w-4 h-4" />
                <span>{language === 'en' ? 'Call' : language === 'pt' ? 'Ligar' : 'Llamar'}</span>
              </a>
              <a
                href="mailto:support@fly2any.com"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-secondary-500 hover:bg-secondary-600 text-white text-xs font-medium rounded-lg transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] active:scale-[0.97]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Email</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
