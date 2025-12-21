'use client';

import { useState } from 'react';
import EnhancedSearchBar from '@/components/flights/EnhancedSearchBar';
import Link from 'next/link';
import { Plane, Star, Shield, Users, Award, Wifi, UtensilsCrossed, Tv, ChevronDown, ChevronUp, ArrowRight, CheckCircle2, Globe, CreditCard, Headphones, MapPin, Crown, Sparkles, Luggage, Mountain } from 'lucide-react';

const alaskaData = {
  name: 'Alaska Airlines', code: 'AS', alliance: 'Oneworld',
  hubs: ['Seattle (SEA)', 'Portland (PDX)', 'Los Angeles (LAX)', 'San Francisco (SFO)', 'Anchorage (ANC)'],
  founded: '1932', fleet: '330+ aircraft', destinations: '120+ destinations', rating: 4.6, reviews: 28945,
  cabinClasses: [
    { name: 'First Class', icon: Crown, features: ['Wider seats', 'Premium meals', 'Free drinks', 'Priority boarding'] },
    { name: 'Premium Class', icon: Sparkles, features: ['Extra legroom', 'Free drinks', 'Snacks', 'Priority boarding'] },
    { name: 'Main Cabin', icon: Plane, features: ['Free entertainment', 'Snacks & drinks', 'Power outlets', 'Free texting'] },
  ],
  popularRoutes: [
    { from: 'Seattle (SEA)', to: 'Los Angeles (LAX)', duration: '2h 30m' },
    { from: 'Seattle (SEA)', to: 'Anchorage (ANC)', duration: '3h 30m' },
    { from: 'Los Angeles (LAX)', to: 'Honolulu (HNL)', duration: '5h 45m' },
    { from: 'Portland (PDX)', to: 'San Francisco (SFO)', duration: '1h 30m' },
    { from: 'Seattle (SEA)', to: 'New York (JFK)', duration: '5h 15m' },
    { from: 'San Francisco (SFO)', to: 'Maui (OGG)', duration: '5h 30m' },
  ],
  amenities: [
    { icon: Tv, name: 'Free Entertainment', desc: 'Streaming on your device' },
    { icon: Wifi, name: 'Free Texting', desc: 'Stay connected' },
    { icon: UtensilsCrossed, name: 'Fresh Food', desc: 'Buy onboard' },
    { icon: Mountain, name: 'Mileage Plan', desc: 'Best loyalty program' },
  ],
  faqs: [
    { q: 'What is Alaska Airlines Mileage Plan?', a: 'Mileage Plan is Alaska\'s award-winning loyalty program. Earn miles on Alaska and 20+ partner airlines. Miles never expire and can be redeemed for flights, upgrades, and more.' },
    { q: 'Is Alaska Airlines part of Oneworld?', a: 'Yes! Alaska joined the Oneworld alliance in 2021, partnering with American Airlines, British Airways, Qantas, and other global carriers.' },
    { q: 'Does Alaska have free Wi-Fi?', a: 'Alaska offers free texting on most flights. Full Wi-Fi is available for purchase, with discounts for Mileage Plan members.' },
    { q: 'What is Alaska\'s baggage policy?', a: 'First checked bag is free for Mileage Plan members and credit card holders. Standard fare includes carry-on and personal item.' },
    { q: 'Does Alaska fly to Hawaii?', a: 'Yes! Alaska operates extensive Hawaii service from West Coast cities to Honolulu, Maui, Kauai, and Kona.' },
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

export default function AlaskaPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative bg-gradient-to-br from-teal-600 via-teal-700 to-teal-900 text-white py-12 md:py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4"><Award className="w-4 h-4" /> Oneworld Alliance</span>
            <div className="mb-6"><img src="https://logos-world.net/wp-content/uploads/2021/08/Alaska-Airlines-Logo.png" alt="Alaska Airlines Logo" className="h-16 md:h-20 mx-auto object-contain" /></div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Alaska Airlines Flights</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">Fly smart. Land happy. Book Alaska Airlines tickets to 120+ destinations.</p>
            <div className="flex items-center justify-center gap-4 text-sm text-white/80 mt-4">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Hub: Seattle (SEA)</span>
              <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> 120+ Destinations</span>
              <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> {alaskaData.rating}/5</span>
            </div>
          </div>
          <div className="w-full bg-white rounded-2xl shadow-2xl p-6"><EnhancedSearchBar compact={false} /></div>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-white/90 text-sm">
            <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-400" /> Best Price Guarantee</span>
            <span className="flex items-center gap-2"><Shield className="w-5 h-5 text-blue-400" /> Oneworld Alliance</span>
            <span className="flex items-center gap-2"><Headphones className="w-5 h-5 text-yellow-400" /> 24/7 Support</span>
          </div>
        </div>
      </section>

      <section className="py-10 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4"><Globe className="w-8 h-8 text-teal-600 mx-auto mb-2" /><p className="text-sm text-gray-600">Destinations</p><p className="text-xl font-bold">120+</p></div>
          <div className="text-center p-4"><Plane className="w-8 h-8 text-teal-600 mx-auto mb-2" /><p className="text-sm text-gray-600">Fleet Size</p><p className="text-xl font-bold">330+</p></div>
          <div className="text-center p-4"><Star className="w-8 h-8 text-teal-600 mx-auto mb-2" /><p className="text-sm text-gray-600">Rating</p><p className="text-xl font-bold">4.6/5</p></div>
          <div className="text-center p-4"><Award className="w-8 h-8 text-teal-600 mx-auto mb-2" /><p className="text-sm text-gray-600">Founded</p><p className="text-xl font-bold">1932</p></div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Crown className="w-6 h-6 text-teal-600" /> Alaska Airlines Cabin Classes</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {alaskaData.cabinClasses.map((cabin) => (
              <div key={cabin.name} className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <cabin.icon className="w-8 h-8 text-teal-600 mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">{cabin.name}</h3>
                <ul className="space-y-1">{cabin.features.map((f, i) => <li key={i} className="text-sm text-gray-600 flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" />{f}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Alaska Routes</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {alaskaData.popularRoutes.map((route, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 flex items-center gap-4 hover:bg-teal-50 transition-colors">
                <Plane className="w-6 h-6 text-teal-600" /><div className="flex-1"><p className="font-medium text-gray-900">{route.from} → {route.to}</p><p className="text-sm text-gray-500">{route.duration}</p></div><ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Alaska In-Flight Experience</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {alaskaData.amenities.map((a, i) => (<div key={i} className="bg-white rounded-xl p-5 text-center shadow-md"><a.icon className="w-8 h-8 text-teal-600 mx-auto mb-2" /><p className="font-bold text-gray-900">{a.name}</p><p className="text-sm text-gray-500">{a.desc}</p></div>))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Why Book Alaska with Fly2Any?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-white/5 rounded-2xl"><Shield className="w-10 h-10 text-teal-400 mx-auto mb-3" /><h3 className="font-bold mb-2">Best Price</h3><p className="text-gray-400 text-sm">Compare from 500+ sources.</p></div>
            <div className="text-center p-6 bg-white/5 rounded-2xl"><CreditCard className="w-10 h-10 text-green-400 mx-auto mb-3" /><h3 className="font-bold mb-2">No Hidden Fees</h3><p className="text-gray-400 text-sm">All taxes included.</p></div>
            <div className="text-center p-6 bg-white/5 rounded-2xl"><Users className="w-10 h-10 text-teal-400 mx-auto mb-3" /><h3 className="font-bold mb-2">28K+ Reviews</h3><p className="text-gray-400 text-sm">Trusted worldwide.</p></div>
            <div className="text-center p-6 bg-white/5 rounded-2xl"><Headphones className="w-10 h-10 text-yellow-400 mx-auto mb-3" /><h3 className="font-bold mb-2">24/7 Support</h3><p className="text-gray-400 text-sm">Always here to help.</p></div>
          </div>
          <div className="text-center mt-10"><Link href="/flights" className="inline-flex items-center gap-2 px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl transition-colors text-lg">Search Alaska Flights <ArrowRight className="w-5 h-5" /></Link></div>
        </div>
      </section>

      <section className="py-12 bg-gradient-to-r from-teal-500 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Get Exclusive Alaska Deals</h2>
          <p className="text-white/90 mb-6">Be first to know about Alaska sales & Mileage Plan promotions. Save up to 40%!</p>
          <form className="flex flex-col md:flex-row gap-3 max-w-2xl mx-auto" onSubmit={(e) => { e.preventDefault(); alert('Thanks! We\'ll send you Alaska deals soon.'); }}>
            <input type="email" placeholder="Email address" required className="flex-1 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-white/50" />
            <input type="tel" placeholder="Phone (optional)" className="md:w-48 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-white/50" />
            <button type="submit" className="px-6 py-3 bg-white text-teal-600 font-bold rounded-xl hover:bg-gray-100 transition-colors whitespace-nowrap">Get Deals</button>
          </form>
          <p className="text-white/70 text-xs mt-3">No spam. Unsubscribe anytime.</p>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Alaska Airlines FAQ</h2>
          <div className="bg-gray-50 rounded-2xl p-6">{alaskaData.faqs.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}</div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Book Alaska Airlines Flights</h2>
          <p>Looking for Alaska Airlines flights? Fly2Any helps you compare Alaska tickets from multiple sources. Book First Class, Premium Class, or Main Cabin—we show real-time prices.</p>
          <p>Alaska Airlines, founded in 1932, is a Oneworld alliance member operating 330+ aircraft to 120+ destinations. Earn Mileage Plan miles on every flight.</p>
          <p>Popular: Alaska Airlines, Alaska Air flights, Mileage Plan login, Alaska Airlines reservations. Search Alaska tickets now.</p>
        </div>
      </section>

      <section className="py-16 bg-teal-700 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Fly Alaska?</h2>
          <p className="text-xl text-white/90 mb-8">Compare prices and book your Alaska flight today.</p>
          <Link href="/flights" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-teal-700 font-bold rounded-xl hover:bg-gray-100 transition-colors text-lg">Search Alaska Flights <ArrowRight className="w-5 h-5" /></Link>
        </div>
      </section>
    </div>
  );
}
