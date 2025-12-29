'use client';

import { motion } from 'framer-motion';
import { Shield, Plane, Luggage, Clock, CheckCircle, ChevronRight, Phone, AlertCircle, Stethoscope, Globe } from 'lucide-react';
import Link from 'next/link';

const PLANS = [
  {
    name: 'Basic', price: 29, color: 'from-gray-500 to-gray-600',
    features: [
      { text: 'Trip Cancellation up to $1,500', ok: true },
      { text: 'Trip Delay (6+ hours)', ok: true },
      { text: 'Lost Baggage up to $500', ok: true },
      { text: 'Emergency Medical $10K', ok: true },
      { text: 'Adventure Sports', ok: false },
      { text: 'Cancel for Any Reason', ok: false },
    ],
  },
  {
    name: 'Premium', price: 59, popular: true, color: 'from-emerald-500 to-teal-500',
    features: [
      { text: 'Trip Cancellation up to $5,000', ok: true },
      { text: 'Trip Delay (3+ hours)', ok: true },
      { text: 'Lost Baggage up to $2,000', ok: true },
      { text: 'Emergency Medical $100K', ok: true },
      { text: 'Adventure Sports', ok: true },
      { text: 'Cancel for Any Reason (75%)', ok: true },
    ],
  },
  {
    name: 'Platinum', price: 99, color: 'from-amber-500 to-orange-500',
    features: [
      { text: 'Trip Cancellation up to $10,000', ok: true },
      { text: 'Trip Delay (1+ hour)', ok: true },
      { text: 'Lost Baggage up to $5,000', ok: true },
      { text: 'Emergency Medical $500K', ok: true },
      { text: 'All Adventure Sports', ok: true },
      { text: 'Cancel for Any Reason (100%)', ok: true },
    ],
  },
];

const COVERAGE = [
  { icon: Plane, title: 'Trip Cancellation', desc: 'Reimbursement if you cancel', color: 'bg-blue-500' },
  { icon: Stethoscope, title: 'Medical Emergency', desc: 'Coverage for illness abroad', color: 'bg-red-500' },
  { icon: Luggage, title: 'Lost Baggage', desc: 'Compensation for lost luggage', color: 'bg-purple-500' },
  { icon: Clock, title: 'Travel Delays', desc: 'Expenses for flight delays', color: 'bg-orange-500' },
  { icon: AlertCircle, title: 'Evacuation', desc: 'Medical evacuation coverage', color: 'bg-pink-500' },
  { icon: Globe, title: '24/7 Support', desc: 'Help anywhere in the world', color: 'bg-indigo-500' },
];

export default function InsurancePage() {
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
              <Shield className="w-4 h-4" /> Travel Protection
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Travel With <span className="text-emerald-600">Peace of Mind</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Comprehensive coverage for trip cancellations, medical emergencies, and more.
            </p>
            <a href="#plans" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-xl transition-all">
              View Plans <ChevronRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-gray-100 bg-white/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '2M+', label: 'Protected' },
            { value: '$50M+', label: 'Claims Paid' },
            { value: '190+', label: 'Countries' },
            { value: '4.8★', label: 'Rating' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-emerald-600">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Coverage */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">What&apos;s Covered</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {COVERAGE.map((c, i) => (
              <motion.div key={c.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="group p-6 rounded-2xl bg-white shadow-sm hover:shadow-lg border border-gray-100 transition-all">
                <div className={`w-12 h-12 rounded-xl ${c.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <c.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-1">{c.title}</h3>
                <p className="text-sm text-gray-500">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="py-16 md:py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-4">Choose Your Plan</h2>
          <p className="text-gray-500 text-center mb-12">Protection that fits your needs</p>
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((p, i) => (
              <motion.div key={p.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`relative p-6 rounded-2xl bg-white shadow-sm border-2 ${p.popular ? 'border-emerald-500' : 'border-gray-100'}`}>
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-500 text-white text-sm font-semibold">Most Popular</span>
                )}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-4`}>
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{p.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-bold text-gray-900">${p.price}</span>
                  <span className="text-gray-500">/trip</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {p.features.map((f) => (
                    <li key={f.text} className="flex items-start gap-2 text-sm">
                      {f.ok ? <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-200 mt-0.5 flex-shrink-0" />}
                      <span className={f.ok ? 'text-gray-700' : 'text-gray-400'}>{f.text}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  p.popular ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}>Select Plan</button>
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
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Need a Custom Quote?</h2>
            <p className="text-white/80 mb-8">Our experts can help find the perfect coverage.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="px-8 py-4 rounded-full bg-white text-emerald-600 font-semibold hover:bg-gray-100 transition-colors">
                Get Quote
              </Link>
              <a href="tel:+13057971087" className="px-8 py-4 rounded-full bg-white/20 text-white font-semibold hover:bg-white/30 transition-colors flex items-center justify-center gap-2">
                <Phone className="w-5 h-5" /> Call Expert
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
