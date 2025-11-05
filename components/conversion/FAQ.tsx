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
    <section className="py-12 bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: '1600px' }}>
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {title}
          </h2>
          <p className="text-lg text-gray-600 mb-6">{subtitle}</p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors text-sm"
              />
            </div>
          </div>

          {/* Popular Questions Quick Links */}
          {!searchQuery && popularQuestions.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="text-gray-500 font-medium">{t.popular}:</span>
              {popularQuestions.map((question, idx) => {
                const category = categories[idx];
                if (!category) return null;

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      // Ensure category is open
                      setOpenCategories(prev =>
                        prev.includes(category.id) ? prev : [...prev, category.id]
                      );
                      // Small delay to ensure category opens before question
                      setTimeout(() => {
                        setOpenQuestion(`${category.id}-0`);
                      }, 50);
                    }}
                    className="text-primary-600 hover:text-primary-700 hover:underline transition-colors"
                  >
                    {question.length > 40 ? question.substring(0, 40) + '...' : question}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* FAQ Categories Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {filteredCategories.map((category) => {
            const Icon = category.icon;
            const isOpen = openCategories.includes(category.id);

            return (
              <div
                key={category.id}
                className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden transition-all duration-300 hover:border-primary-300 hover:shadow-md"
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-gray-900 text-base">
                        {category.title}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {category.items.length} {language === 'en' ? 'questions' : language === 'pt' ? 'perguntas' : 'preguntas'}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 flex-shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Questions List */}
                {isOpen && (
                  <div className="px-5 pt-4 pb-4 space-y-2 animate-slideDown">
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

        {/* Contact CTA */}
        <div className="mt-10 text-center bg-white rounded-xl border-2 border-gray-200 p-8">
          <MessageCircle className="w-12 h-12 text-primary-600 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold text-lg mb-2">{t.stillNeedHelp}</p>
          <p className="text-gray-600 mb-6">
            {language === 'en'
              ? 'Our support team is available 24/7 to assist you'
              : language === 'pt'
              ? 'Nossa equipe de suporte está disponível 24/7 para ajudá-lo'
              : 'Nuestro equipo de soporte está disponible 24/7 para ayudarte'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="tel:+13322200838"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <HeadphonesIcon className="w-5 h-5" />
              <span>{language === 'en' ? 'Call Us' : language === 'pt' ? 'Ligar' : 'Llamar'}</span>
            </a>
            <a
              href="mailto:support@fly2any.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-secondary-600 hover:bg-secondary-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{language === 'en' ? 'Email Support' : language === 'pt' ? 'Email' : 'Email'}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
