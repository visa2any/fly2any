'use client';

import { useState } from 'react';
import EnhancedSearchBar from '@/components/flights/EnhancedSearchBar';
import Link from 'next/link';
import {
  Plane, Star, Shield, Clock, Users, Award, Wifi, UtensilsCrossed,
  Tv, ChevronDown, ChevronUp, ArrowRight, CheckCircle2, Globe,
  CreditCard, Headphones, MapPin, Crown, Sparkles, Luggage
} from 'lucide-react';

const deltaData = {
  name: 'Delta Air Lines',
  code: 'DL',
  alliance: 'SkyTeam',
  hubs: ['Atlanta (ATL)', 'Detroit (DTW)', 'Minneapolis (MSP)', 'New York (JFK)', 'Salt Lake City (SLC)', 'Seattle (SEA)'],
  founded: '1929',
  fleet: '900+ aircraft',
  destinations: '300+ destinations in 50+ countries',
  rating: 4.7,
  reviews: 28547,
  cabinClasses: [
    { name: 'Delta One', icon: Crown, features: ['Lie-flat seats', 'Direct aisle access', 'Premium dining', 'Tumi amenity kit'] },
    { name: 'Delta Premium Select', icon: Sparkles, features: ['Extra legroom', 'Wider seats', 'Premium meals', 'Priority boarding'] },
    { name: 'Delta Comfort+', icon: Star, features: ['Extra legroom', 'Dedicated bins', 'Priority boarding', 'Free drinks'] },
    { name: 'Main Cabin', icon: Plane, features: ['Free entertainment', 'Snacks & drinks', 'Wi-Fi available', 'Power outlets'] },
  ],
  popularRoutes: [
    { from: 'Atlanta (ATL)', to: 'New York (JFK)', duration: '2h 10m' },
    { from: 'New York (JFK)', to: 'Los Angeles (LAX)', duration: '5h 45m' },
    { from: 'Atlanta (ATL)', to: 'London (LHR)', duration: '8h 30m' },
    { from: 'Detroit (DTW)', to: 'Tokyo (HND)', duration: '13h' },
    { from: 'Seattle (SEA)', to: 'Paris (CDG)', duration: '9h 45m' },
    { from: 'New York (JFK)', to: 'Amsterdam (AMS)', duration: '7h 30m' },
  ],
  amenities: [
    { icon: Tv, name: 'Delta Studio', desc: 'Free entertainment' },
    { icon: Wifi, name: 'Wi-Fi', desc: 'Stay connected' },
    { icon: UtensilsCrossed, name: 'Fresh Meals', desc: 'Premium dining' },
    { icon: Luggage, name: 'Free Bags', desc: 'SkyMiles members' },
  ],
  faqs: [
    { q: 'How do I book Delta flights?', a: 'Book on delta.com or compare Delta prices on Fly2Any to find the best deals from multiple sources.' },
    { q: 'What is Delta SkyMiles?', a: 'SkyMiles is Delta\'s loyalty program. Earn miles on flights, credit cards, and partners. Redeem for flights, upgrades, and more.' },
    { q: 'What is Delta One?', a: 'Delta One is the premium business class on long-haul flights, featuring lie-flat seats, premium dining, and exclusive amenities.' },
    { q: 'Does Delta have free Wi-Fi?', a: 'Delta offers free messaging on most flights. Full Wi-Fi is available for purchase or free for certain SkyMiles members.' },
    { q: 'What is Delta Comfort+?', a: 'Comfort+ offers up to 4" extra legroom, dedicated overhead bins, priority boarding, and complimentary drinks.' },
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

export default function DeltaPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-800 via-blue-900 to-blue-950 text-white py-12 md:py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
              <Award className="w-4 h-4" /> America's Most Trusted Airline
            </span>
            {/* Delta Logo */}
            <div className="mb-6">
              <img src="https://logos-world.net/wp-content/uploads/2021/08/Delta-Air-Lines-Logo.png" alt="Delta Air Lines Logo" className="h-16 md:h-20 mx-auto object-contain" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Delta Air Lines Flights</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Keep Climbing with Delta. Compare prices and book Delta airline tickets to 300+ destinations worldwide.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-white/80 mt-4">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Hub: Atlanta (ATL)</span>
              <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> 300+ Destinations</span>
              <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> {deltaData.rating}/5</span>
            </div>
          </div>

          <div className="w-full bg-white rounded-2xl shadow-2xl p-6">
            <EnhancedSearchBar compact={false} />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-white/90 text-sm">
            <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-400" /> Best Price Guarantee</span>
            <span className="flex items-center gap-2"><Shield className="w-5 h-5 text-blue-400" /> SkyTeam Alliance</span>
            <span className="flex items-center gap-2"><Headphones className="w-5 h-5 text-yellow-400" /> 24/7 Support</span>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-10 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4"><Globe className="w-8 h-8 text-blue-800 mx-auto mb-2" /><p className="text-sm text-gray-600">Destinations</p><p className="text-xl font-bold">300+</p></div>
          <div className="text-center p-4"><Plane className="w-8 h-8 text-blue-800 mx-auto mb-2" /><p className="text-sm text-gray-600">Fleet Size</p><p className="text-xl font-bold">900+</p></div>
          <div className="text-center p-4"><Star className="w-8 h-8 text-blue-800 mx-auto mb-2" /><p className="text-sm text-gray-600">Rating</p><p className="text-xl font-bold">4.7/5</p></div>
          <div className="text-center p-4"><Award className="w-8 h-8 text-blue-800 mx-auto mb-2" /><p className="text-sm text-gray-600">Founded</p><p className="text-xl font-bold">1929</p></div>
        </div>
      </section>

      {/* Cabin Classes */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Crown className="w-6 h-6 text-blue-800" /> Delta Cabin Classes</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {deltaData.cabinClasses.map((cabin) => (
              <div key={cabin.name} className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <cabin.icon className="w-8 h-8 text-blue-800 mb-3" />
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Delta Routes</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {deltaData.popularRoutes.map((route, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 flex items-center gap-4 hover:bg-blue-50 transition-colors">
                <Plane className="w-6 h-6 text-blue-800" />
                <div className="flex-1"><p className="font-medium text-gray-900">{route.from} → {route.to}</p><p className="text-sm text-gray-500">{route.duration}</p></div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Delta In-Flight Experience</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {deltaData.amenities.map((a, i) => (
              <div key={i} className="bg-white rounded-xl p-5 text-center shadow-md">
                <a.icon className="w-8 h-8 text-blue-800 mx-auto mb-2" />
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
          <h2 className="text-2xl font-bold mb-8 text-center">Why Book Delta with Fly2Any?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-white/5 rounded-2xl"><Shield className="w-10 h-10 text-blue-400 mx-auto mb-3" /><h3 className="font-bold mb-2">Best Price Guarantee</h3><p className="text-gray-400 text-sm">Compare Delta fares from 500+ sources.</p></div>
            <div className="text-center p-6 bg-white/5 rounded-2xl"><CreditCard className="w-10 h-10 text-green-400 mx-auto mb-3" /><h3 className="font-bold mb-2">No Hidden Fees</h3><p className="text-gray-400 text-sm">The price you see includes all taxes.</p></div>
            <div className="text-center p-6 bg-white/5 rounded-2xl"><Users className="w-10 h-10 text-blue-400 mx-auto mb-3" /><h3 className="font-bold mb-2">28K+ Reviews</h3><p className="text-gray-400 text-sm">Trusted by travelers worldwide.</p></div>
            <div className="text-center p-6 bg-white/5 rounded-2xl"><Headphones className="w-10 h-10 text-yellow-400 mx-auto mb-3" /><h3 className="font-bold mb-2">24/7 Support</h3><p className="text-gray-400 text-sm">Help when you need it.</p></div>
          </div>
          <div className="text-center mt-10">
            <Link href="/flights" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors text-lg">
              Search Delta Flights <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Lead Capture */}
      <section className="py-12 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Get Exclusive Delta Deals</h2>
          <p className="text-white/90 mb-6">Be first to know about Delta sales & SkyMiles promotions. Save up to 40%!</p>
          <form className="flex flex-col md:flex-row gap-3 max-w-2xl mx-auto" onSubmit={(e) => { e.preventDefault(); alert('Thanks! We\'ll send you Delta deals soon.'); }}>
            <input type="email" placeholder="Email address" required className="flex-1 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-white/50" />
            <input type="tel" placeholder="Phone (optional)" className="md:w-48 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-white/50" />
            <button type="submit" className="px-6 py-3 bg-white text-blue-700 font-bold rounded-xl hover:bg-gray-100 transition-colors whitespace-nowrap">Get Deals</button>
          </form>
          <p className="text-white/70 text-xs mt-3">No spam. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Delta Air Lines FAQ</h2>
          <div className="bg-gray-50 rounded-2xl p-6">
            {deltaData.faqs.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Book Delta Air Lines Flights</h2>
          <p>Looking for Delta flights? Fly2Any helps you compare Delta Air Lines tickets from multiple sources to find the best deals. Book Delta One business class, Delta Comfort+, or Main Cabin—we show real-time prices.</p>
          <p>Delta, founded in 1929, is one of the world's largest airlines with 900+ aircraft serving 300+ destinations. As a SkyTeam member, Delta partners with Air France, KLM, and other global carriers. Earn Delta SkyMiles on every flight.</p>
          <p>Popular searches: Delta flights, Delta airlines official site, Delta SkyMiles login, Delta flight status, Delta vacations. Use our search to find cheap Delta tickets today.</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-blue-800 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Keep Climbing with Delta?</h2>
          <p className="text-xl text-white/90 mb-8">Compare prices and book your Delta flight today.</p>
          <Link href="/flights" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-blue-800 font-bold rounded-xl hover:bg-gray-100 transition-colors text-lg">
            Search Delta Flights <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
