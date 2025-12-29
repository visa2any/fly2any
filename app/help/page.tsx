'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plane, Hotel, CreditCard, RefreshCw, Luggage, Shield, MessageCircle, Phone, Mail, ChevronDown, ChevronRight, HelpCircle, FileText } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  { id: 'booking', icon: Plane, title: 'Booking & Reservations', desc: 'Search, book, manage flights', color: 'bg-blue-500' },
  { id: 'payment', icon: CreditCard, title: 'Payments & Refunds', desc: 'Payment methods, invoices', color: 'bg-green-500' },
  { id: 'changes', icon: RefreshCw, title: 'Changes & Cancellations', desc: 'Modify or cancel booking', color: 'bg-orange-500' },
  { id: 'baggage', icon: Luggage, title: 'Baggage & Check-in', desc: 'Luggage rules, check-in', color: 'bg-purple-500' },
  { id: 'account', icon: Shield, title: 'Account & Security', desc: 'Login, password, privacy', color: 'bg-red-500' },
  { id: 'hotels', icon: Hotel, title: 'Hotels & Stays', desc: 'Hotel bookings & policies', color: 'bg-indigo-500' },
];

const FAQS = [
  { q: 'How do I cancel my flight booking?', a: 'Go to My Bookings, select your flight, and click "Cancel Booking". Refund policies vary by airline and fare type.' },
  { q: 'Can I change my travel dates?', a: 'Yes, most bookings can be modified. Go to My Bookings and select "Change Flight". Change fees may apply.' },
  { q: 'How do I get a refund?', a: 'Refunds are processed within 5-10 business days after cancellation. Amount depends on your fare type.' },
  { q: 'What is the baggage allowance?', a: 'Baggage allowance varies by airline. Check your booking confirmation or use our Baggage Calculator.' },
  { q: 'Is my payment secure?', a: 'Yes, we use bank-level 256-bit SSL encryption and are PCI DSS compliant.' },
];

export default function HelpPage() {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50 overflow-x-hidden">
      {/* Hero */}
      <section className="relative pt-20 md:pt-32 pb-16 px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-emerald-200/50 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-teal-200/50 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-6">
              <HelpCircle className="w-4 h-4" /> Help Center
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              How Can We <span className="text-emerald-600">Help?</span>
            </h1>
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Search for help..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-gray-200 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none text-gray-900" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-6 px-4 border-y border-gray-100 bg-white/80 backdrop-blur">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-3">
          {[
            { icon: MessageCircle, label: 'Live Chat', href: '#', color: 'text-green-600' },
            { icon: Phone, label: 'Call Us', href: 'tel:+13057971087', color: 'text-blue-600' },
            { icon: Mail, label: 'Email', href: 'mailto:support@fly2any.com', color: 'text-purple-600' },
            { icon: FileText, label: 'My Bookings', href: '/account/bookings', color: 'text-orange-600' },
          ].map((a) => (
            <Link key={a.label} href={a.href}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-sm font-medium transition-colors">
              <a.icon className={`w-4 h-4 ${a.color}`} />{a.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {CATEGORIES.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="group p-6 rounded-2xl bg-white shadow-sm hover:shadow-lg border border-gray-100 cursor-pointer transition-all">
                <div className={`w-12 h-12 rounded-xl ${c.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <c.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-1 group-hover:text-emerald-600 transition-colors">{c.title}</h3>
                <p className="text-sm text-gray-500">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 md:py-24 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                className="rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden">
                <button onClick={() => setExpanded(expanded === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-100 transition-colors">
                  <span className="font-medium text-gray-900 pr-4">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expanded === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {expanded === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="px-6 pb-4 text-gray-600">{faq.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="p-8 md:p-12 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Still Need Help?</h2>
            <p className="text-white/80 mb-8">Our support team is available 24/7</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="px-8 py-4 rounded-full bg-white text-emerald-600 font-semibold hover:bg-gray-100 transition-colors">
                Contact Us
              </Link>
              <a href="https://wa.me/13057971087" className="px-8 py-4 rounded-full bg-white/20 text-white font-semibold hover:bg-white/30 transition-colors flex items-center justify-center gap-2">
                <MessageCircle className="w-5 h-5" /> WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
