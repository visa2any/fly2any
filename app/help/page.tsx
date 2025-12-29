'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plane,
  Hotel,
  CreditCard,
  Calendar,
  Shield,
  MessageCircle,
  Phone,
  Mail,
  ChevronDown,
  ChevronRight,
  Clock,
  HelpCircle,
  FileText,
  RefreshCw,
  Luggage,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';

const HELP_CATEGORIES = [
  { id: 'booking', icon: Plane, title: 'Booking & Reservations', desc: 'How to search, book, and manage flights', color: 'from-blue-500 to-cyan-500' },
  { id: 'payment', icon: CreditCard, title: 'Payments & Refunds', desc: 'Payment methods, invoices, refunds', color: 'from-green-500 to-emerald-500' },
  { id: 'changes', icon: RefreshCw, title: 'Changes & Cancellations', desc: 'Modify or cancel your booking', color: 'from-orange-500 to-amber-500' },
  { id: 'baggage', icon: Luggage, title: 'Baggage & Check-in', desc: 'Luggage rules, online check-in', color: 'from-purple-500 to-pink-500' },
  { id: 'account', icon: Shield, title: 'Account & Security', desc: 'Login, password, privacy settings', color: 'from-red-500 to-rose-500' },
  { id: 'hotels', icon: Hotel, title: 'Hotels & Stays', desc: 'Hotel bookings and policies', color: 'from-indigo-500 to-violet-500' },
];

const POPULAR_QUESTIONS = [
  { q: 'How do I cancel my flight booking?', a: 'Go to My Bookings, select your flight, and click "Cancel Booking". Refund policies vary by airline and fare type.' },
  { q: 'Can I change my travel dates?', a: 'Yes, most bookings can be modified. Go to My Bookings and select "Change Flight". Change fees may apply depending on your fare.' },
  { q: 'How do I get a refund?', a: 'Refunds are processed within 5-10 business days after cancellation. Refund amount depends on your fare type and airline policy.' },
  { q: 'What is the baggage allowance?', a: 'Baggage allowance varies by airline and ticket class. Check your booking confirmation or use our Baggage Calculator tool.' },
  { q: 'How do I add extra baggage?', a: 'You can add extra baggage during booking or later through Manage Booking. Pre-booking baggage is usually cheaper than at the airport.' },
  { q: 'Is my payment secure?', a: 'Yes, we use bank-level 256-bit SSL encryption and are PCI DSS compliant. Your payment details are never stored on our servers.' },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Hero */}
      <section className="relative pt-20 md:pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
              <HelpCircle className="w-4 h-4" /> Help Center
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              How Can We
              <span className="block bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Help You?</span>
            </h1>
            <p className="text-lg text-gray-400 mb-8">Search our help center or browse categories below</p>

            {/* Search */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-emerald-500/50 focus:outline-none text-white placeholder-gray-500"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-8 px-4 border-y border-white/10">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-4">
          {[
            { icon: MessageCircle, label: 'Live Chat', href: '#' },
            { icon: Phone, label: 'Call Us', href: 'tel:+13057971087' },
            { icon: Mail, label: 'Email Support', href: 'mailto:support@fly2any.com' },
            { icon: FileText, label: 'My Bookings', href: '/account/bookings' },
          ].map((action) => (
            <Link key={action.label} href={action.href}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/5 border border-white/10 hover:border-emerald-500/30 hover:bg-white/10 transition-all text-sm font-medium">
              <action.icon className="w-4 h-4 text-emerald-400" />
              {action.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {HELP_CATEGORIES.map((cat, i) => (
              <motion.div key={cat.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 cursor-pointer transition-all">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-4`}>
                  <cat.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-1 group-hover:text-emerald-400 transition-colors">{cat.title}</h3>
                <p className="text-sm text-gray-400">{cat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Questions */}
      <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-transparent via-emerald-950/10 to-transparent">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {POPULAR_QUESTIONS.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left">
                  <span className="font-medium pr-4">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {expandedFaq === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="px-6 pb-4 text-gray-400">{faq.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-white/10 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Still Need Help?</h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">Our support team is available 24/7 to assist you with any questions.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-black font-semibold hover:bg-gray-100 transition-colors">
                Contact Us <ChevronRight className="w-5 h-5" />
              </Link>
              <a href="https://wa.me/13057971087" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors">
                <MessageCircle className="w-5 h-5" /> WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
