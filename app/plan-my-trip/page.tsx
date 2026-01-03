"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, MessageCircle, Calendar, Users, Globe, CheckCircle, ArrowRight, Bot, UserCheck, Clock, Shield } from "lucide-react";

const PLANNING_OPTIONS = [
  {
    id: "ai",
    icon: Bot,
    title: "AI Trip Planner",
    desc: "Get instant itinerary suggestions powered by AI",
    time: "2 minutes",
    cta: "Start Planning",
    href: "/tripmatch",
    color: "from-violet-500 to-purple-600",
  },
  {
    id: "expert",
    icon: UserCheck,
    title: "Expert Consultation",
    desc: "Work with a travel advisor for complex trips",
    time: "24-48 hours",
    cta: "Talk to Expert",
    href: "/agent/quotes/workspace",
    color: "from-emerald-500 to-teal-600",
  },
];

const TRIP_TYPES = [
  { label: "Romantic Getaway", href: "/journeys/romantic-getaways" },
  { label: "Family Vacation", href: "/journeys/family-vacations" },
  { label: "Adventure Trip", href: "/journeys/adventure-travel" },
  { label: "Beach Holiday", href: "/journeys/beach-holidays" },
  { label: "Multi-City Tour", href: "/multi-city" },
  { label: "Group Travel", href: "/group-travel" },
];

const BENEFITS = [
  { icon: Clock, title: "Save Hours", desc: "We research so you don't have to" },
  { icon: Shield, title: "Best Price", desc: "Access to exclusive deals" },
  { icon: Globe, title: "Local Expertise", desc: "Insider tips for every destination" },
  { icon: CheckCircle, title: "Stress-Free", desc: "We handle all the details" },
];

export default function PlanMyTripPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 text-white py-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full mb-6"
          >
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">Free Trip Planning Service</span>
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Let Us Plan Your<br />Perfect Trip
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Tell us where you want to go and we'll create a personalized itinerary
            with the best flights, hotels, and experiences—at the best prices.
          </p>
        </div>
      </section>

      {/* Planning Options */}
      <section className="max-w-5xl mx-auto px-4 -mt-12">
        <div className="grid md:grid-cols-2 gap-6">
          {PLANNING_OPTIONS.map((opt) => (
            <motion.div
              key={opt.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${opt.color} flex items-center justify-center mb-4`}>
                <opt.icon className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{opt.title}</h2>
              <p className="text-gray-600 mb-4">{opt.desc}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Clock className="w-4 h-4" />
                <span>Response time: {opt.time}</span>
              </div>
              <Link
                href={opt.href}
                className={`inline-flex items-center gap-2 bg-gradient-to-r ${opt.color} text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity`}
              >
                {opt.cta} <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trip Types */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">What Kind of Trip Are You Planning?</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {TRIP_TYPES.map((type) => (
            <Link
              key={type.label}
              href={type.href}
              className="bg-white rounded-xl p-4 text-center hover:shadow-lg transition-shadow border border-gray-100 group"
            >
              <span className="font-semibold text-gray-900 group-hover:text-primary-600">{type.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Why Let Us Plan Your Trip?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {BENEFITS.map((b) => (
              <div key={b.title} className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <b.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{b.title}</h3>
                <p className="text-sm text-gray-600">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12 text-center text-white">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-primary-400" />
          <h2 className="text-3xl font-bold mb-4">Ready to Start Planning?</h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">
            Tell us your dream destination and we'll create a custom itinerary just for you.
          </p>
          <Link
            href="/agent/quotes/workspace"
            className="inline-flex items-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors"
          >
            <Sparkles className="w-6 h-6" />
            Plan My Trip Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
