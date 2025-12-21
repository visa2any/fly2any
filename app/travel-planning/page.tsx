'use client';

import { useState } from 'react';
import EnhancedSearchBar from '@/components/flights/EnhancedSearchBar';
import Link from 'next/link';
import { Plane, Calendar, DollarSign, MapPin, CheckSquare, Luggage, FileText, Clock, Globe, Star, Shield, ChevronDown, ChevronUp, ArrowRight, CheckCircle2, Headphones, Compass, ListChecks, Wallet, Hotel, Car } from 'lucide-react';

const planningData = {
  steps: [
    { step: 1, title: 'Choose Destination', icon: MapPin, desc: 'Research destinations based on interests, budget, and season', tips: ['Consider visa requirements', 'Check travel advisories', 'Look at weather patterns'] },
    { step: 2, title: 'Set Your Budget', icon: Wallet, desc: 'Calculate total trip cost including buffer', tips: ['Use 50/30/20 rule (flights/accommodation/activities)', 'Add 10-15% emergency buffer', 'Track exchange rates'] },
    { step: 3, title: 'Book Flights', icon: Plane, desc: 'Compare prices and book at optimal time', tips: ['Book 6-8 weeks ahead for domestic', 'Book 2-4 months for international', 'Use price alerts'] },
    { step: 4, title: 'Book Accommodation', icon: Hotel, desc: 'Find the right stay for your style', tips: ['Compare hotels, hostels, Airbnb', 'Book refundable when possible', 'Check location and transport links'] },
    { step: 5, title: 'Plan Activities', icon: Compass, desc: 'Research and book tours and experiences', tips: ['Pre-book popular attractions', 'Leave room for spontaneity', 'Check for combo deals'] },
    { step: 6, title: 'Prepare & Pack', icon: Luggage, desc: 'Use checklists and pack smart', tips: ['Start packing list a week ahead', 'Check airline baggage rules', 'Pack versatile clothing'] },
  ],
  budgetGuide: [
    { category: 'Budget Travel', daily: '$30-60', destinations: 'Southeast Asia, Eastern Europe, Central America', includes: 'Hostels, street food, public transport' },
    { category: 'Mid-Range', daily: '$100-200', destinations: 'Western Europe, Japan, Australia', includes: 'Hotels, restaurants, some tours' },
    { category: 'Luxury', daily: '$300+', destinations: 'Anywhere', includes: 'Premium hotels, fine dining, private tours' },
  ],
  packingEssentials: ['Passport & copies', 'Travel insurance docs', 'Phone charger & adapter', 'Medications', 'Comfortable shoes', 'Weather-appropriate layers', 'Toiletries (3-1-1 compliant)', 'Camera', 'Day bag/backpack', 'Entertainment for flights'],
  faqs: [
    { q: 'How far in advance should I plan a trip?', a: 'For international trips, start 3-6 months ahead. Domestic trips can be planned 1-3 months in advance. Peak seasons and popular destinations need more lead time.' },
    { q: 'How do I find cheap flights?', a: 'Use flight comparison sites like Fly2Any, set price alerts, be flexible with dates, book 6-8 weeks ahead for domestic and 2-4 months for international, and consider nearby airports.' },
    { q: 'What\'s the best way to create a travel budget?', a: 'Calculate: flights + accommodation + (daily food budget x days) + activities + transport + 15% buffer. Research destination-specific costs and track in a spreadsheet.' },
    { q: 'Should I book everything in advance?', a: 'Book flights and first night accommodation. For popular destinations, pre-book key attractions. Leave some flexibility for spontaneous discoveries.' },
    { q: 'How do I avoid travel scams?', a: 'Research common scams for your destination, book through verified platforms, never show large amounts of cash, and be wary of unsolicited help or too-good-to-be-true deals.' },
  ],
};

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full py-4 flex items-center justify-between text-left hover:bg-gray-50">
        <span className="font-medium text-gray-900 pr-4">{q}</span>
        {open ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
      </button>
      {open && <p className="pb-4 text-gray-600">{a}</p>}
    </div>
  );
}

export default function TravelPlanningPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-800 text-white py-12 md:py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
              <ListChecks className="w-4 h-4" /> Complete Planning Guide
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Travel Planning</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">Plan your perfect trip step by step. From destination research to packing lists, we've got you covered.</p>
            <div className="flex items-center justify-center gap-4 text-sm text-white/80 mt-4">
              <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> 500+ Destinations</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Step-by-Step Guide</span>
              <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> 4.9/5 Rated</span>
            </div>
          </div>
          <div className="w-full bg-white rounded-2xl shadow-2xl p-6"><EnhancedSearchBar compact={false} /></div>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-white/90 text-sm">
            <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-400" /> Best Price Guarantee</span>
            <span className="flex items-center gap-2"><Shield className="w-5 h-5 text-blue-400" /> Expert Tips</span>
            <span className="flex items-center gap-2"><Headphones className="w-5 h-5 text-yellow-400" /> 24/7 Support</span>
          </div>
        </div>
      </section>

      {/* Planning Steps */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">How to Plan Your Trip</h2>
          <p className="text-gray-600 text-center mb-8">Follow these 6 steps for stress-free travel planning</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {planningData.steps.map((step) => (
              <div key={step.step} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-bold">{step.step}</div>
                  <step.icon className="w-6 h-6 text-sky-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{step.desc}</p>
                <ul className="space-y-1">
                  {step.tips.map((tip, i) => <li key={i} className="text-xs text-gray-500 flex items-start gap-2"><CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />{tip}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Budget Guide */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><DollarSign className="w-6 h-6 text-sky-600" /> Travel Budget Guide</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {planningData.budgetGuide.map((budget, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <h3 className="font-bold text-gray-900 text-lg mb-1">{budget.category}</h3>
                <p className="text-2xl font-bold text-sky-600 mb-3">{budget.daily}<span className="text-sm text-gray-500">/day</span></p>
                <p className="text-sm text-gray-600 mb-2"><strong>Best for:</strong> {budget.destinations}</p>
                <p className="text-xs text-gray-500">{budget.includes}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packing Checklist */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Luggage className="w-6 h-6 text-sky-600" /> Essential Packing Checklist</h2>
          <div className="bg-sky-50 rounded-xl p-6 border border-sky-100">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {planningData.packingEssentials.map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg text-sm">
                  <CheckSquare className="w-4 h-4 text-sky-600" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Lead Capture */}
      <section className="py-12 bg-gradient-to-r from-sky-500 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Get Free Travel Planning Resources</h2>
          <p className="text-white/90 mb-6">Receive packing checklists, budget templates, and exclusive travel deals!</p>
          <form className="flex flex-col md:flex-row gap-3 max-w-2xl mx-auto" onSubmit={(e) => { e.preventDefault(); alert('Check your email for travel planning resources!'); }}>
            <input type="email" placeholder="Email address" required className="flex-1 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-white/50" />
            <input type="tel" placeholder="Phone (optional)" className="md:w-48 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-white/50" />
            <button type="submit" className="px-6 py-3 bg-white text-sky-600 font-bold rounded-xl hover:bg-gray-100 transition-colors whitespace-nowrap">Get Resources</button>
          </form>
          <p className="text-white/70 text-xs mt-3">Free templates & weekly tips. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Start Planning</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Link href="/flights" className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all text-center group">
              <Plane className="w-10 h-10 text-sky-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900">Search Flights</h3>
              <p className="text-sm text-gray-500">Compare prices</p>
            </Link>
            <Link href="/hotels" className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all text-center group">
              <Hotel className="w-10 h-10 text-sky-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900">Find Hotels</h3>
              <p className="text-sm text-gray-500">Best rates</p>
            </Link>
            <Link href="/cars" className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all text-center group">
              <Car className="w-10 h-10 text-sky-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900">Rent Cars</h3>
              <p className="text-sm text-gray-500">Airport pickup</p>
            </Link>
            <Link href="/travel-insurance" className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all text-center group">
              <Shield className="w-10 h-10 text-sky-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900">Get Insurance</h3>
              <p className="text-sm text-gray-500">Travel protected</p>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Travel Planning FAQ</h2>
          <div className="bg-gray-50 rounded-2xl p-6">{planningData.faqs.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}</div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Travel Planning Guide 2025</h2>
          <p>Planning a trip? Fly2Any's comprehensive travel planning guide walks you through every step, from choosing your destination to packing your bags. Whether you're a first-time traveler or seasoned explorer, our expert tips help you plan smarter.</p>
          <p>Start with destination research, set a realistic budget, book flights 6-8 weeks ahead for best prices, secure accommodation, plan activities, and use our packing checklists. Our tools help you compare flights, hotels, and rental cars all in one place.</p>
          <p>Popular searches: travel planning, how to plan a trip, vacation planning, travel itinerary, trip planner, travel budget, travel checklist. Start planning your dream trip today!</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-sky-700 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Planning?</h2>
          <p className="text-xl text-white/90 mb-8">Search flights, hotels, and more to begin your journey.</p>
          <Link href="/flights" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-sky-700 font-bold rounded-xl hover:bg-gray-100 transition-colors text-lg">Start Planning <ArrowRight className="w-5 h-5" /></Link>
        </div>
      </section>
    </div>
  );
}
