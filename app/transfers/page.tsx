'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import EnhancedSearchBar from '@/components/flights/EnhancedSearchBar';
import { MobileHomeSearchWrapper } from '@/components/home/MobileHomeSearchWrapper';
import { CompactTrustBar } from '@/components/conversion/CompactTrustBar';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import {
  Car, Shield, MapPin, DollarSign, Clock, Users, Luggage,
  Plane, Baby, Wifi, Navigation, Phone, Award, TrendingUp,
  Calendar, AlertCircle, ChevronRight, CheckCircle, Building2, Globe,
  CreditCard, FileCheck, Key, Sparkles, Star, MessageCircle
} from 'lucide-react';

// Transfer Types Data
const transferTypes = [
  {
    type: 'Private Sedan',
    description: 'Comfortable sedans for 1-3 passengers with luggage',
    priceRange: '$45-$85',
    icon: Car,
    color: 'from-teal-500 to-cyan-600',
    features: ['3 Passengers', '2 Luggage', 'Meet & Greet', 'Flight Tracking'],
    examples: 'Mercedes E-Class, BMW 5 Series, Audi A6',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80'
  },
  {
    type: 'Private SUV',
    description: 'Spacious SUVs ideal for families or groups',
    priceRange: '$65-$120',
    icon: Car,
    color: 'from-blue-500 to-indigo-600',
    features: ['5-6 Passengers', '4 Luggage', 'Child Seats', 'Door-to-Door'],
    examples: 'Cadillac Escalade, Lincoln Navigator, Mercedes GLS',
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80'
  },
  {
    type: 'Luxury Sedan',
    description: 'Premium vehicles with professional chauffeurs',
    priceRange: '$120-$250',
    icon: Sparkles,
    color: 'from-amber-500 to-orange-600',
    features: ['VIP Service', 'Complimentary Water', 'WiFi', 'Executive Class'],
    examples: 'Mercedes S-Class, BMW 7 Series, Rolls Royce',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80'
  },
  {
    type: 'Private Van',
    description: 'Perfect for large groups or families with luggage',
    priceRange: '$85-$150',
    icon: Users,
    color: 'from-purple-500 to-pink-600',
    features: ['7-8 Passengers', '6+ Luggage', 'Spacious', 'Group Friendly'],
    examples: 'Mercedes V-Class, Ford Transit, Sprinter Van',
    image: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=800&q=80'
  },
  {
    type: 'Shared Shuttle',
    description: 'Budget-friendly shared rides to common destinations',
    priceRange: '$15-$35',
    icon: Globe,
    color: 'from-green-500 to-emerald-600',
    features: ['Economical', 'Fixed Routes', 'Regular Schedule', 'AC Comfort'],
    examples: 'Airport shuttles, hotel transfers',
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&q=80'
  },
  {
    type: 'Minibus / Coach',
    description: 'Large groups, events, and corporate travel',
    priceRange: '$150-$400',
    icon: Building2,
    color: 'from-indigo-500 to-violet-600',
    features: ['16-50 Passengers', 'Event Ready', 'Professional Driver', 'Custom Routes'],
    examples: 'Mercedes Sprinter, Coach buses',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80'
  },
];

// Transfer Companies
const transferCompanies = [
  { name: 'Blacklane', logo: '🚘', rating: 4.8, coverage: 'Global', color: 'from-gray-800 to-gray-900', benefits: ['Premium service', 'Professional chauffeurs', 'Fixed prices'] },
  { name: 'Supershuttle', logo: '🚐', rating: 4.3, coverage: 'USA & Europe', color: 'from-blue-500 to-indigo-600', benefits: ['Shared shuttles', 'Airport coverage', 'Budget friendly'] },
  { name: 'Welcome Pickups', logo: '👋', rating: 4.7, coverage: '100+ airports', color: 'from-teal-500 to-cyan-600', benefits: ['Meet & greet', 'Flight tracking', 'Local drivers'] },
  { name: 'GetTransfer', logo: '✈️', rating: 4.5, coverage: '150+ countries', color: 'from-orange-500 to-red-600', benefits: ['Bid system', 'Best prices', 'Wide selection'] },
  { name: 'Jayride', logo: '🌏', rating: 4.4, coverage: 'Global', color: 'from-green-500 to-emerald-600', benefits: ['Compare prices', 'Easy booking', 'Local operators'] },
  { name: 'Carmel', logo: '🏆', rating: 4.6, coverage: 'Major cities', color: 'from-purple-500 to-pink-600', benefits: ['Flat rates', '24/7 service', 'NYC specialist'] },
];

// Features
const features = [
  { name: 'Flight Tracking', icon: Plane, desc: 'We monitor your flight for delays' },
  { name: 'Meet & Greet', icon: MessageCircle, desc: 'Driver waits with your name sign' },
  { name: 'Free Cancellation', icon: Shield, desc: 'Cancel up to 24-48h before' },
  { name: 'Fixed Prices', icon: DollarSign, desc: 'No surprises, no surge pricing' },
  { name: 'Door-to-Door', icon: MapPin, desc: 'Pickup to exact destination' },
  { name: '24/7 Support', icon: Phone, desc: 'Help whenever you need it' },
];

// Tips
const tips = [
  { tip: 'Book 24-48 hours ahead', description: 'Last-minute bookings cost more. Pre-booking saves 20-40% and guarantees availability', icon: Calendar },
  { tip: 'Share your flight number', description: 'Drivers can track delays automatically. No extra wait charges if flight is late', icon: Plane },
  { tip: 'Confirm pickup location', description: 'Airports have multiple terminals. Confirm exact meeting point to avoid confusion', icon: MapPin },
  { tip: 'Check luggage capacity', description: 'Standard sedans fit 2 large bags. Book SUV/Van for more luggage or equipment', icon: Luggage },
  { tip: 'Compare shared vs private', description: 'Shared shuttles save 50-70% but take longer. Private is faster and more convenient', icon: DollarSign },
  { tip: 'Save driver contact', description: 'Keep driver phone number handy. Useful if you need to communicate on arrival', icon: Phone },
];

// FAQs
const faqs = [
  { q: 'How do airport transfers work?', a: 'Book online, receive confirmation with driver details. Driver monitors your flight, meets you at arrivals with name sign, helps with luggage, and drives you to destination. Payment is usually pre-paid online.' },
  { q: 'What if my flight is delayed?', a: 'We track all flights automatically. Your driver adjusts pickup time accordingly at no extra charge. For significant delays, we\'ll contact you to confirm new arrangements.' },
  { q: 'Where will I meet my driver?', a: 'For airport pickups: usually in arrivals hall with name sign. For hotel pickups: at lobby or specified address. Exact meeting point sent in confirmation email 24h before.' },
  { q: 'Can I book a child seat?', a: 'Yes, request child/booster seats when booking. Most providers offer them free or for small fee ($5-15). Specify child age for correct seat type.' },
  { q: 'What\'s included in the price?', a: 'Typically includes: vehicle, professional driver, meet & greet, flight tracking, waiting time (usually 60 min for flights, 15 min otherwise), tolls. Excludes: parking fees at some locations.' },
  { q: 'How do I pay?', a: 'Most transfers are prepaid online by credit card. Some providers accept cash payment to driver. Tips are optional but appreciated (10-15% for excellent service).' },
];

export default function TransfersPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Teal Theme */}
      <div className="relative bg-gradient-to-br from-teal-50 via-cyan-50/30 to-teal-50 border-b border-teal-200/60 overflow-hidden md:overflow-visible">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-20 -left-20 w-72 h-72 bg-cyan-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(20, 184, 166) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>

        <MaxWidthContainer className="relative z-10 pt-6 md:pt-10 pb-8 md:pb-14">
          {/* Hero Text */}
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100/80 backdrop-blur-sm rounded-full mb-4">
              <span className="text-2xl">🚗</span>
              <span className="text-sm font-semibold text-teal-700">Airport & City Transfers</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Reliable Transfers</span>
              <br className="md:hidden" />
              <span className="text-gray-800"> Worldwide</span>
            </h1>
            <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
              Pre-book airport pickups, hotel transfers & private rides. Fixed prices, flight tracking, professional drivers.
            </p>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:block">
            <EnhancedSearchBar defaultService="transfers" lang="en" />
          </div>

          {/* Mobile Search */}
          <div className="md:hidden">
            <MobileHomeSearchWrapper defaultService="transfers" />
          </div>
        </MaxWidthContainer>
      </div>

      {/* Trust Bar */}
      <CompactTrustBar />

      {/* Transfer Types Section */}
      <section className="py-12 md:py-16 bg-white">
        <MaxWidthContainer>
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Transfer Types & Vehicles</h2>
            <p className="text-gray-600">Choose the perfect ride for your journey</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {transferTypes.map((item, i) => (
              <div key={i} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="relative h-40 overflow-hidden">
                  <Image src={item.image} alt={item.type} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${item.color} opacity-60`}></div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-bold text-lg drop-shadow-md">{item.type}</h3>
                    <p className="text-white/90 text-sm drop-shadow">{item.priceRange}</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {item.features.map((f, j) => (
                      <span key={j} className="px-2 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-lg">{f}</span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">{item.examples}</p>
                </div>
              </div>
            ))}
          </div>
        </MaxWidthContainer>
      </section>

      {/* Features Section */}
      <section className="py-10 md:py-14 bg-gradient-to-b from-teal-50/50 to-white">
        <MaxWidthContainer>
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Why Book With Us</h2>
            <p className="text-gray-600">Professional service, every time</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {features.map((f, i) => (
              <div key={i} className="text-center p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{f.name}</h3>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </MaxWidthContainer>
      </section>

      {/* Transfer Companies */}
      <section className="py-12 md:py-16 bg-white">
        <MaxWidthContainer>
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Our Transfer Partners</h2>
            <p className="text-gray-600">Trusted providers worldwide</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {transferCompanies.map((c, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 text-center hover:shadow-lg transition-all group">
                <div className={`w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-2xl`}>
                  {c.logo}
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{c.name}</h3>
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-medium text-gray-700">{c.rating}</span>
                </div>
                <p className="text-xs text-gray-500">{c.coverage}</p>
              </div>
            ))}
          </div>
        </MaxWidthContainer>
      </section>

      {/* Tips Section */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white">
        <MaxWidthContainer>
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Transfer Tips</h2>
            <p className="text-gray-600">Make the most of your transfer booking</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tips.map((t, i) => (
              <div key={i} className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-teal-100 flex items-center justify-center">
                  <t.icon className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{t.tip}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{t.description}</p>
                </div>
              </div>
            ))}
          </div>
        </MaxWidthContainer>
      </section>

      {/* FAQs Section */}
      <section className="py-12 md:py-16 bg-white">
        <MaxWidthContainer>
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h2>
            <p className="text-gray-600">Everything you need to know about transfers</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                  <span className="font-semibold text-gray-900 text-sm pr-4">{faq.q}</span>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </MaxWidthContainer>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-teal-600 to-cyan-600">
        <MaxWidthContainer>
          <div className="text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to Book Your Transfer?</h2>
            <p className="text-teal-100 mb-6 max-w-xl mx-auto">Compare prices from trusted providers and book your airport transfer in minutes.</p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-8 py-4 bg-white text-teal-600 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Search Transfers Now
            </button>
          </div>
        </MaxWidthContainer>
      </section>
    </div>
  );
}
