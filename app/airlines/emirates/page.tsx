'use client';

import { useState } from 'react';
import EnhancedSearchBar from '@/components/flights/EnhancedSearchBar';
import Link from 'next/link';
import {
  Plane, Star, Shield, Clock, Users, Award, Wifi, UtensilsCrossed,
  Tv, ChevronDown, ChevronUp, ArrowRight, CheckCircle2, Globe,
  CreditCard, Headphones, MapPin, Crown, Sparkles, Coffee
} from 'lucide-react';

const emiratesData = {
  name: 'Emirates',
  code: 'EK',
  alliance: 'None (Independent)',
  hub: 'Dubai International Airport (DXB)',
  founded: '1985',
  fleet: '260+ aircraft (A380s & Boeing 777s)',
  destinations: '150+ destinations across 80+ countries',
  rating: 4.9,
  reviews: 12847,
  highlights: [
    'World\'s largest A380 operator',
    'Award-winning in-flight entertainment (ICE)',
    '4-class service: First, Business, Premium Economy, Economy',
    'Dubai hub with seamless connections',
    'Skywards loyalty program',
    'Onboard lounges on A380'
  ],
  cabinClasses: [
    { name: 'First Class', icon: Crown, features: ['Private suites', 'Shower spa', 'Onboard lounge', 'Gourmet dining'] },
    { name: 'Business Class', icon: Sparkles, features: ['Lie-flat beds', 'Direct aisle access', 'A380 lounge', 'Multi-course meals'] },
    { name: 'Premium Economy', icon: Star, features: ['Extra legroom', 'Larger screens', 'Premium meals', 'Priority boarding'] },
    { name: 'Economy Class', icon: Plane, features: ['1,000+ channels ICE', 'Gourmet meals', 'Wi-Fi available', 'Generous baggage'] },
  ],
  popularRoutes: [
    { from: 'New York (JFK)', to: 'Dubai (DXB)', duration: '12h 30m' },
    { from: 'Los Angeles (LAX)', to: 'Dubai (DXB)', duration: '16h' },
    { from: 'London (LHR)', to: 'Dubai (DXB)', duration: '7h' },
    { from: 'Dubai (DXB)', to: 'Bangkok (BKK)', duration: '6h 30m' },
    { from: 'Dubai (DXB)', to: 'Sydney (SYD)', duration: '14h' },
    { from: 'Dubai (DXB)', to: 'Tokyo (NRT)', duration: '10h' },
  ],
  amenities: [
    { icon: Tv, name: 'ICE Entertainment', desc: '6,500+ channels' },
    { icon: Wifi, name: 'Free Wi-Fi', desc: 'Stay connected' },
    { icon: UtensilsCrossed, name: 'Gourmet Dining', desc: 'Multi-course meals' },
    { icon: Coffee, name: 'Onboard Lounge', desc: 'A380 exclusive' },
  ],
  faqs: [
    { q: 'How do I book Emirates flights?', a: 'Book directly on Emirates.com or compare prices on Fly2Any to find the best Emirates deals from multiple sources.' },
    { q: 'What is Emirates Skywards?', a: 'Emirates Skywards is the frequent flyer program. Earn miles on Emirates and partner airlines, redeem for flights, upgrades, and experiences.' },
    { q: 'Does Emirates have Premium Economy?', a: 'Yes! Emirates Premium Economy launched in 2022, offering extra legroom, larger screens, premium dining, and enhanced service.' },
    { q: 'What is the Emirates A380 experience?', a: 'The A380 features onboard showers in First Class, a bar lounge for First & Business, and the quietest cabin in the sky.' },
    { q: 'How much baggage is allowed on Emirates?', a: 'Economy: 30kg, Business: 40kg, First: 50kg. Plus carry-on allowance. Skywards members get bonus allowance.' },
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

export default function EmiratesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white py-12 md:py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
              <Award className="w-4 h-4" /> World's Best Airline
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Emirates Flights</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Fly Better with Emirates. Compare prices and book Emirates airline tickets to 150+ destinations worldwide.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-white/80 mt-4">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Hub: Dubai (DXB)</span>
              <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> 150+ Destinations</span>
              <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> {emiratesData.rating}/5</span>
            </div>
          </div>

          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6">
            <EnhancedSearchBar compact={true} />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-white/90 text-sm">
            <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-400" /> Best Price Guarantee</span>
            <span className="flex items-center gap-2"><Shield className="w-5 h-5 text-blue-400" /> Verified Emirates Partner</span>
            <span className="flex items-center gap-2"><Headphones className="w-5 h-5 text-yellow-400" /> 24/7 Support</span>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-10 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4"><Globe className="w-8 h-8 text-red-600 mx-auto mb-2" /><p className="text-sm text-gray-600">Destinations</p><p className="text-xl font-bold">150+</p></div>
          <div className="text-center p-4"><Plane className="w-8 h-8 text-red-600 mx-auto mb-2" /><p className="text-sm text-gray-600">Fleet Size</p><p className="text-xl font-bold">260+</p></div>
          <div className="text-center p-4"><Star className="w-8 h-8 text-red-600 mx-auto mb-2" /><p className="text-sm text-gray-600">Rating</p><p className="text-xl font-bold">4.9/5</p></div>
          <div className="text-center p-4"><Award className="w-8 h-8 text-red-600 mx-auto mb-2" /><p className="text-sm text-gray-600">Founded</p><p className="text-xl font-bold">1985</p></div>
        </div>
      </section>

      {/* Cabin Classes */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Crown className="w-6 h-6 text-red-600" /> Emirates Cabin Classes</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {emiratesData.cabinClasses.map((cabin) => (
              <div key={cabin.name} className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <cabin.icon className="w-8 h-8 text-red-600 mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">{cabin.name}</h3>
                <ul className="space-y-1">{cabin.features.map((f, i) => <li key={i} className="text-sm text-gray-600 flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" />{f}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Emirates Routes</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {emiratesData.popularRoutes.map((route, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 flex items-center gap-4 hover:bg-red-50 transition-colors">
                <Plane className="w-6 h-6 text-red-600" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{route.from} → {route.to}</p>
                  <p className="text-sm text-gray-500">{route.duration}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Emirates In-Flight Experience</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {emiratesData.amenities.map((a, i) => (
              <div key={i} className="bg-white rounded-xl p-5 text-center shadow-md">
                <a.icon className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="font-bold text-gray-900">{a.name}</p>
                <p className="text-sm text-gray-500">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Book */}
      <section className="py-12 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Why Book Emirates with Fly2Any?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-white/5 rounded-2xl"><Shield className="w-10 h-10 text-red-400 mx-auto mb-3" /><h3 className="font-bold mb-2">Best Price Guarantee</h3><p className="text-gray-400 text-sm">Compare Emirates fares from 500+ sources.</p></div>
            <div className="text-center p-6 bg-white/5 rounded-2xl"><CreditCard className="w-10 h-10 text-green-400 mx-auto mb-3" /><h3 className="font-bold mb-2">No Hidden Fees</h3><p className="text-gray-400 text-sm">The price you see includes all taxes.</p></div>
            <div className="text-center p-6 bg-white/5 rounded-2xl"><Users className="w-10 h-10 text-blue-400 mx-auto mb-3" /><h3 className="font-bold mb-2">12K+ Reviews</h3><p className="text-gray-400 text-sm">Trusted by travelers worldwide.</p></div>
            <div className="text-center p-6 bg-white/5 rounded-2xl"><Headphones className="w-10 h-10 text-yellow-400 mx-auto mb-3" /><h3 className="font-bold mb-2">24/7 Support</h3><p className="text-gray-400 text-sm">Help when you need it.</p></div>
          </div>
          <div className="text-center mt-10">
            <Link href="/flights" className="inline-flex items-center gap-2 px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors text-lg">
              Search Emirates Flights <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Lead Capture */}
      <section className="py-12 bg-gradient-to-r from-red-500 to-orange-500">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Get Exclusive Emirates Deals</h2>
          <p className="text-white/90 mb-6">Be the first to know about Emirates sales, flash deals & price drops. Up to 40% off!</p>
          <form className="flex flex-col md:flex-row gap-3 max-w-2xl mx-auto" onSubmit={(e) => { e.preventDefault(); alert('Thanks! We\'ll send you Emirates deals soon.'); }}>
            <input type="email" placeholder="Email address" required className="flex-1 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-white/50" />
            <input type="tel" placeholder="Phone (optional)" className="md:w-48 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-white/50" />
            <button type="submit" className="px-6 py-3 bg-white text-red-600 font-bold rounded-xl hover:bg-gray-100 transition-colors whitespace-nowrap">
              Get Deals
            </button>
          </form>
          <p className="text-white/70 text-xs mt-3">No spam. Unsubscribe anytime. We respect your privacy.</p>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Emirates Airlines FAQ</h2>
          <div className="bg-gray-50 rounded-2xl p-6">
            {emiratesData.faqs.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Book Emirates Airlines Flights</h2>
          <p>Looking for Emirates flights? Fly2Any helps you compare Emirates airline tickets from multiple sources to find the best deals. Whether you're booking Emirates business class, Emirates economy, or the new Emirates premium economy, we show you real-time prices.</p>
          <p>Emirates, the flagship carrier of the UAE, operates the world's largest fleet of Airbus A380s and Boeing 777s. Their Dubai hub (DXB) offers seamless connections to over 150 destinations. Emirates Skywards members earn miles on every flight.</p>
          <p>Popular searches include Emirates flights to Dubai, Emirates flights from New York, Emirates booking, and Emirates flight status. Use our search to find cheap Emirates tickets today.</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-red-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Fly Better with Emirates?</h2>
          <p className="text-xl text-white/90 mb-8">Compare prices and book your Emirates flight today.</p>
          <Link href="/flights" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-red-600 font-bold rounded-xl hover:bg-gray-100 transition-colors text-lg">
            Search Emirates Flights <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
