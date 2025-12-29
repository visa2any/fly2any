'use client';

import { motion } from 'framer-motion';
import {
  Shield,
  Plane,
  Luggage,
  Heart,
  Clock,
  DollarSign,
  CheckCircle,
  ChevronRight,
  Phone,
  Globe,
  AlertCircle,
  FileText,
  Stethoscope,
  Car,
  Home,
  Smartphone,
} from 'lucide-react';
import Link from 'next/link';

const COVERAGE_PLANS = [
  {
    name: 'Basic',
    price: 29,
    color: 'from-gray-500 to-gray-600',
    features: [
      { text: 'Trip Cancellation up to $1,500', included: true },
      { text: 'Trip Delay (6+ hours)', included: true },
      { text: 'Lost Baggage up to $500', included: true },
      { text: 'Emergency Medical up to $10,000', included: true },
      { text: '24/7 Travel Assistance', included: true },
      { text: 'Adventure Sports', included: false },
      { text: 'Cancel for Any Reason', included: false },
    ],
  },
  {
    name: 'Premium',
    price: 59,
    popular: true,
    color: 'from-blue-500 to-purple-600',
    features: [
      { text: 'Trip Cancellation up to $5,000', included: true },
      { text: 'Trip Delay (3+ hours)', included: true },
      { text: 'Lost Baggage up to $2,000', included: true },
      { text: 'Emergency Medical up to $100,000', included: true },
      { text: '24/7 Travel Assistance', included: true },
      { text: 'Adventure Sports', included: true },
      { text: 'Cancel for Any Reason (75%)', included: true },
    ],
  },
  {
    name: 'Platinum',
    price: 99,
    color: 'from-amber-500 to-orange-500',
    features: [
      { text: 'Trip Cancellation up to $10,000', included: true },
      { text: 'Trip Delay (1+ hour)', included: true },
      { text: 'Lost Baggage up to $5,000', included: true },
      { text: 'Emergency Medical up to $500,000', included: true },
      { text: '24/7 Concierge Service', included: true },
      { text: 'All Adventure Sports', included: true },
      { text: 'Cancel for Any Reason (100%)', included: true },
    ],
  },
];

const COVERAGE_TYPES = [
  { icon: Plane, title: 'Trip Cancellation', desc: 'Get reimbursed if you need to cancel' },
  { icon: Stethoscope, title: 'Medical Emergency', desc: 'Coverage for illness or injury abroad' },
  { icon: Luggage, title: 'Lost Baggage', desc: 'Compensation for delayed or lost luggage' },
  { icon: Clock, title: 'Travel Delays', desc: 'Expenses covered for flight delays' },
  { icon: AlertCircle, title: 'Emergency Evacuation', desc: 'Medical evacuation if needed' },
  { icon: Globe, title: '24/7 Assistance', desc: 'Support anywhere in the world' },
];

export default function InsurancePage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-green-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Hero */}
      <section className="relative pt-20 md:pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium mb-6">
              <Shield className="w-4 h-4" /> Travel Protection
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Travel With
              <span className="block bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Peace of Mind</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
              Comprehensive travel insurance that covers trip cancellations, medical emergencies, lost baggage, and more.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#plans" className="px-8 py-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 font-semibold hover:opacity-90 transition-opacity">
                View Plans
              </a>
              <Link href="/contact" className="px-8 py-4 rounded-full bg-white/5 border border-white/10 font-semibold hover:bg-white/10 transition-colors">
                Get Quote
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-white/10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '2M+', label: 'Travelers Protected' },
              { value: '$50M+', label: 'Claims Paid' },
              { value: '190+', label: 'Countries Covered' },
              { value: '4.8★', label: 'Customer Rating' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage Types */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">What&apos;s Covered</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {COVERAGE_TYPES.map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-green-500/30 transition-colors">
                <item.icon className="w-8 h-8 text-green-400 mb-4" />
                <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="py-16 md:py-24 px-4 bg-gradient-to-b from-transparent via-green-950/10 to-transparent">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">Choose Your Plan</h2>
          <p className="text-gray-400 text-center mb-12">Protection that fits your travel needs</p>
          <div className="grid md:grid-cols-3 gap-6">
            {COVERAGE_PLANS.map((plan, i) => (
              <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`relative p-6 rounded-2xl bg-white/5 border ${plan.popular ? 'border-green-500/50' : 'border-white/10'}`}>
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-green-500 text-sm font-semibold text-black">Most Popular</span>
                )}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-gray-500">/trip</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((f) => (
                    <li key={f.text} className="flex items-start gap-2 text-sm">
                      {f.included ? (
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-gray-600 mt-0.5 flex-shrink-0" />
                      )}
                      <span className={f.included ? 'text-gray-300' : 'text-gray-500'}>{f.text}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                  plan.popular
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:opacity-90'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}>
                  Select Plan
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-white/10 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Need a Custom Quote?</h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">Our travel insurance experts can help you find the perfect coverage for your trip.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-black font-semibold hover:bg-gray-100 transition-colors">
                Get Custom Quote <ChevronRight className="w-5 h-5" />
              </Link>
              <a href="tel:+13057971087" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/10 border border-white/20 font-semibold hover:bg-white/20 transition-colors">
                <Phone className="w-5 h-5" /> Call Expert
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
