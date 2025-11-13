'use client';

import { useState, useEffect } from 'react';
import FaqItem from '@/components/faq/FaqItem';
import Link from 'next/link';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';

const faqs = [
  // Booking FAQs
  {
    id: 'booking-1',
    category: 'Booking',
    question: 'How do I book a flight?',
    answer: 'Search for flights using our search tool, select your preferred option, fill in passenger details, and complete payment. You will receive a confirmation email with your booking details and e-ticket.',
    tags: ['Getting Started'],
    helpful: 42,
    notHelpful: 3,
  },
  {
    id: 'booking-2',
    category: 'Booking',
    question: 'Can I book flights for multiple passengers?',
    answer: 'Yes! You can book for up to 9 passengers in a single booking. Simply specify the number of adults, children, and infants during your search. All passengers will be on the same itinerary.',
    tags: ['Multiple Passengers'],
    helpful: 35,
    notHelpful: 2,
  },
  {
    id: 'booking-3',
    category: 'Booking',
    question: 'Do I need to create an account to book?',
    answer: 'While you can search for flights without an account, we recommend creating one to access features like booking history, saved searches, price alerts, and wishlist. Guest checkout is available for quick bookings.',
    tags: ['Account'],
    helpful: 28,
    notHelpful: 5,
  },
  {
    id: 'booking-4',
    category: 'Booking',
    question: 'How do I know my booking is confirmed?',
    answer: 'Once payment is processed, you will receive a confirmation email with your booking reference, flight details, and e-ticket. You can also view your booking in the "My Trips" section of your account.',
    tags: ['Confirmation'],
    helpful: 50,
    notHelpful: 1,
  },

  // Payment FAQs
  {
    id: 'payment-1',
    category: 'Payment',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover), debit cards, PayPal, Apple Pay, and Google Pay. All transactions are secured with 256-bit SSL encryption.',
    tags: ['Payment Methods'],
    helpful: 45,
    notHelpful: 2,
  },
  {
    id: 'payment-2',
    category: 'Payment',
    question: 'Is it safe to enter my credit card information?',
    answer: 'Yes, absolutely. We use industry-standard 256-bit SSL encryption and are PCI DSS compliant. Your payment information is processed securely and never stored on our servers.',
    tags: ['Security'],
    helpful: 38,
    notHelpful: 1,
  },
  {
    id: 'payment-3',
    category: 'Payment',
    question: 'When will I be charged?',
    answer: 'Your payment is processed immediately upon booking confirmation. For some airlines, a pre-authorization hold may appear on your card before the final charge is processed.',
    tags: ['Charges'],
    helpful: 32,
    notHelpful: 4,
  },
  {
    id: 'payment-4',
    category: 'Payment',
    question: 'Can I pay in installments?',
    answer: 'We partner with Affirm and Klarna to offer installment payment options on eligible bookings. Select "Pay in installments" during checkout to see available plans and interest rates.',
    tags: ['Installments'],
    helpful: 29,
    notHelpful: 6,
  },

  // Changes & Cancellations
  {
    id: 'changes-1',
    category: 'Changes',
    question: 'Can I change my flight dates?',
    answer: 'Date changes are subject to airline policies and fare rules. Non-refundable tickets typically allow changes for a fee plus fare difference. Refundable tickets offer more flexibility. Check your booking details or contact support.',
    tags: ['Date Changes'],
    helpful: 40,
    notHelpful: 8,
  },
  {
    id: 'changes-2',
    category: 'Changes',
    question: 'How do I change passenger names?',
    answer: 'Name changes depend on airline policy and fare type. Minor corrections (spelling errors) are usually allowed. Full name changes may require cancellation and rebooking. Contact our support team for assistance.',
    tags: ['Name Changes'],
    helpful: 25,
    notHelpful: 10,
  },
  {
    id: 'changes-3',
    category: 'Changes',
    question: 'Can I upgrade my seat or cabin class?',
    answer: 'Yes! You can request seat upgrades or cabin class changes through our support team or directly with the airline. Availability and pricing vary by flight. Premium members get priority upgrade access.',
    tags: ['Upgrades'],
    helpful: 33,
    notHelpful: 4,
  },
  {
    id: 'changes-4',
    category: 'Changes',
    question: 'What if I miss my flight?',
    answer: 'Contact the airline immediately if you miss your flight. Rebooking options depend on your ticket type. Non-refundable tickets may have limited options, while flexible tickets offer better rebooking terms.',
    tags: ['Missed Flight'],
    helpful: 22,
    notHelpful: 7,
  },

  // Refunds
  {
    id: 'refund-1',
    category: 'Refunds',
    question: 'How do I cancel my booking?',
    answer: 'Log into your account, go to "My Trips", select your booking, and click "Cancel Booking". Cancellation policies and fees vary by airline and fare type. Review the terms before confirming.',
    tags: ['Cancellation'],
    helpful: 48,
    notHelpful: 5,
  },
  {
    id: 'refund-2',
    category: 'Refunds',
    question: 'When will I receive my refund?',
    answer: 'Refunds are processed within 7-10 business days after cancellation approval. The actual credit to your account may take 5-14 business days depending on your bank. You will receive email confirmation when processed.',
    tags: ['Refund Processing'],
    helpful: 36,
    notHelpful: 9,
  },
  {
    id: 'refund-3',
    category: 'Refunds',
    question: 'What is your cancellation policy?',
    answer: 'Our cancellation policy follows airline fare rules. Most non-refundable tickets allow cancellations with fees. Refundable tickets offer full or partial refunds. 24-hour free cancellation available on eligible bookings.',
    tags: ['Policy'],
    helpful: 41,
    notHelpful: 6,
  },
  {
    id: 'refund-4',
    category: 'Refunds',
    question: 'Can I get travel insurance for my booking?',
    answer: 'Yes! We offer comprehensive travel insurance covering cancellations, delays, lost baggage, and medical emergencies. Add insurance during checkout or within 24 hours of booking for full coverage.',
    tags: ['Insurance'],
    helpful: 30,
    notHelpful: 3,
  },

  // General FAQs
  {
    id: 'general-1',
    category: 'General',
    question: 'What are the baggage allowances?',
    answer: 'Baggage allowances vary by airline, route, and fare class. Most airlines include 1 carry-on and 1 personal item. Checked baggage may incur fees. Check your booking confirmation or airline website for specific allowances.',
    tags: ['Baggage'],
    helpful: 44,
    notHelpful: 4,
  },
  {
    id: 'general-2',
    category: 'General',
    question: 'How early should I arrive at the airport?',
    answer: 'Domestic flights: 2 hours before departure. International flights: 3 hours before departure. Check-in closes 45-60 minutes before departure. Factor in traffic, security lines, and check-in time.',
    tags: ['Airport'],
    helpful: 52,
    notHelpful: 2,
  },
  {
    id: 'general-3',
    category: 'General',
    question: 'Do I need a visa for my destination?',
    answer: 'Visa requirements depend on your nationality and destination. Check our Travel Guide section for general information, but always verify with the embassy or consulate of your destination country.',
    tags: ['Visa'],
    helpful: 27,
    notHelpful: 8,
  },
  {
    id: 'general-4',
    category: 'General',
    question: 'How can I contact customer support?',
    answer: 'Contact us via email at support@fly2any.com, phone at +1 (315) 306-1646, or WhatsApp at +55 11 5194-4717. Our support team is available 24/7 to assist with bookings, changes, and travel inquiries.',
    tags: ['Support'],
    helpful: 55,
    notHelpful: 1,
  },
];

export default function FaqPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filteredFaqs, setFilteredFaqs] = useState(faqs);

  const categories = [
    { value: 'all', label: 'All Questions', icon: '📚', count: faqs.length },
    { value: 'Booking', label: 'Booking', icon: '✈️', count: faqs.filter(f => f.category === 'Booking').length },
    { value: 'Payment', label: 'Payment', icon: '💳', count: faqs.filter(f => f.category === 'Payment').length },
    { value: 'Changes', label: 'Changes', icon: '🔄', count: faqs.filter(f => f.category === 'Changes').length },
    { value: 'Refunds', label: 'Refunds', icon: '💰', count: faqs.filter(f => f.category === 'Refunds').length },
    { value: 'General', label: 'General', icon: 'ℹ️', count: faqs.filter(f => f.category === 'General').length },
  ];

  useEffect(() => {
    let filtered = faqs;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredFaqs(filtered);
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    // Handle anchor links
    const hash = window.location.hash.slice(1);
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <MaxWidthContainer className="px-0 md:px-6" noPadding={true} style={{ maxWidth: '1024px' }}>
        <div className="py-6 sm:py-8">
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-12 px-4 md:px-0">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-gray-900 mb-3 sm:mb-4 whitespace-nowrap overflow-x-auto scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
              Frequently Asked Questions
            </h1>
            <p className="text-sm sm:text-base md:text-xl text-gray-600 mb-6 sm:mb-8 whitespace-nowrap overflow-x-auto scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
              Find quick answers to common questions about booking, payments, and more
            </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for answers..."
                className="w-full px-6 py-4 pl-12 text-lg border-2 border-gray-300 rounded-full focus:ring-4 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl">
                🔍
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-100 mx-2 md:mx-0">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`p-4 rounded-xl font-semibold transition-all relative ${
                  selectedCategory === cat.value
                    ? 'bg-indigo-600 text-white shadow-lg transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="text-3xl mb-2">{cat.icon}</div>
                <div className="text-sm">{cat.label}</div>
                <div className={`text-xs mt-1 ${selectedCategory === cat.value ? 'text-indigo-200' : 'text-gray-500'}`}>
                  {cat.count} questions
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* FAQ List */}
        {filteredFaqs.length > 0 ? (
          <div className="space-y-3 sm:space-y-4 px-2 md:px-0">
            {filteredFaqs.map((faq) => (
              <FaqItem key={faq.id} {...faq} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center mx-2 md:mx-0">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🔍</div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              No questions found
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Try adjusting your search or browse all questions
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              View All Questions
            </button>
          </div>
        )}

        {/* Still Have Questions */}
        <div className="mt-8 sm:mt-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 sm:p-8 text-white shadow-2xl mx-2 md:mx-0">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">Still Have Questions?</h2>
            <p className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6 opacity-90">
              Our support team is here to help 24/7
            </p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              <Link
                href="/contact"
                className="bg-white text-indigo-600 px-4 sm:px-8 py-2 sm:py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors text-sm sm:text-base"
              >
                Contact Support
              </Link>
              <a
                href="tel:+13153061646"
                className="bg-indigo-700 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-lg font-bold hover:bg-indigo-800 transition-colors text-sm sm:text-base"
              >
                Call Us
              </a>
              <a
                href="https://wa.me/551151944717"
                className="bg-green-500 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-lg font-bold hover:bg-green-600 transition-colors text-sm sm:text-base"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Popular Topics */}
        <div className="mt-6 sm:mt-8 bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 mx-2 md:mx-0">
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Popular Topics</h3>
          <div className="flex flex-wrap gap-2">
            {['Booking', 'Cancellation', 'Refunds', 'Payment Methods', 'Baggage', 'Check-in', 'Seat Selection', 'Travel Insurance'].map((topic) => (
              <button
                key={topic}
                onClick={() => setSearchQuery(topic)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-indigo-100 hover:text-indigo-700 transition-colors text-xs sm:text-sm font-medium"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
        </div>
      </MaxWidthContainer>
    </div>
  );
}
