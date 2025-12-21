'use client';

import { useState } from 'react';
import EnhancedSearchBar from '@/components/flights/EnhancedSearchBar';
import Link from 'next/link';
import { Plane, Star, Shield, Users, MapPin, Globe, Heart, Mountain, Sun, Coffee, Camera, ChevronDown, ChevronUp, ArrowRight, CheckCircle2, Headphones, Compass, Sparkles } from 'lucide-react';

const soloData = {
  categories: [
    { name: 'Safest Destinations', icon: Shield, color: 'from-green-500 to-emerald-600', destinations: ['Iceland', 'Japan', 'New Zealand', 'Portugal', 'Singapore'] },
    { name: 'Budget-Friendly', icon: Star, color: 'from-amber-500 to-orange-600', destinations: ['Thailand', 'Vietnam', 'Portugal', 'Mexico', 'Colombia'] },
    { name: 'Adventure Travel', icon: Mountain, color: 'from-blue-500 to-indigo-600', destinations: ['New Zealand', 'Costa Rica', 'Norway', 'Peru', 'Iceland'] },
    { name: 'Self-Discovery', icon: Heart, color: 'from-pink-500 to-rose-600', destinations: ['Bali', 'India', 'Japan', 'Peru', 'Greece'] },
  ],
  topDestinations: [
    { name: 'Japan', code: 'TYO', why: 'Ultra-safe, incredible culture, easy to navigate solo', bestFor: 'First-time solo travelers' },
    { name: 'Portugal', code: 'LIS', why: 'Affordable, friendly locals, great food scene', bestFor: 'Budget solo travel' },
    { name: 'Iceland', code: 'KEF', why: 'Safest country, dramatic landscapes, adventure', bestFor: 'Solo adventure seekers' },
    { name: 'Thailand', code: 'BKK', why: 'Backpacker paradise, affordable, amazing food', bestFor: 'Budget travelers' },
    { name: 'New Zealand', code: 'AKL', why: 'Safe, adventure activities, stunning nature', bestFor: 'Adventure solo travel' },
    { name: 'Bali', code: 'DPS', why: 'Spiritual retreats, wellness, affordable luxury', bestFor: 'Self-discovery journeys' },
  ],
  tips: [
    { title: 'Share Your Itinerary', desc: 'Always let someone know where you\'re going and check in regularly.' },
    { title: 'Stay in Social Hostels', desc: 'Great way to meet other travelers and find trip companions.' },
    { title: 'Learn Basic Phrases', desc: 'Even a few local words can open doors and build connections.' },
    { title: 'Trust Your Instincts', desc: 'If something feels off, remove yourself from the situation.' },
    { title: 'Book First Night Ahead', desc: 'Arrive with accommodation sorted to reduce stress.' },
    { title: 'Join Walking Tours', desc: 'Free or paid tours are perfect for meeting fellow travelers.' },
  ],
  faqs: [
    { q: 'Is solo travel safe?', a: 'Yes! With proper planning and awareness, solo travel is very safe. Millions of people travel alone each year. Choose safe destinations, stay aware of your surroundings, and trust your instincts.' },
    { q: 'What are the best countries for first-time solo travelers?', a: 'Japan, Portugal, Iceland, and New Zealand are perfect for first-timers. They offer safety, easy navigation, English speakers, and welcoming cultures.' },
    { q: 'Is solo travel more expensive?', a: 'It can be, as you can\'t split accommodation. However, hostels, home-stays, and choosing budget destinations can make solo travel very affordable.' },
    { q: 'How do I meet people while traveling solo?', a: 'Stay in social hostels, join walking tours, use apps like Meetup or Couchsurfing, take group activities, and eat at communal tables.' },
    { q: 'Is solo travel good for introverts?', a: 'Absolutely! Solo travel lets you control your social energy. You can be alone when needed and social when you want. It\'s incredibly liberating for introverts.' },
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

export default function SoloTravelPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 text-white py-12 md:py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
              <Compass className="w-4 h-4" /> Solo Travel Guide 2025
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Solo Travel Destinations</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">Discover the best places to travel alone. Safe destinations, budget tips, and unforgettable solo adventures await.</p>
            <div className="flex items-center justify-center gap-4 text-sm text-white/80 mt-4">
              <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> 50+ Destinations</span>
              <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> Safety Rated</span>
              <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> 4.9/5 Traveler Rated</span>
            </div>
          </div>
          <div className="w-full bg-white rounded-2xl shadow-2xl p-6"><EnhancedSearchBar compact={false} /></div>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-white/90 text-sm">
            <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-400" /> Best Price Guarantee</span>
            <span className="flex items-center gap-2"><Shield className="w-5 h-5 text-blue-400" /> Safe Travel Tips</span>
            <span className="flex items-center gap-2"><Headphones className="w-5 h-5 text-yellow-400" /> 24/7 Support</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Solo Travel by Category</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {soloData.categories.map((cat, i) => (
              <div key={i} className={`bg-gradient-to-br ${cat.color} rounded-xl p-5 text-white`}>
                <cat.icon className="w-8 h-8 mb-3" />
                <h3 className="font-bold mb-3">{cat.name}</h3>
                <ul className="space-y-1 text-sm text-white/90">
                  {cat.destinations.map((d, j) => <li key={j} className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3" />{d}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Destinations */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><MapPin className="w-6 h-6 text-violet-600" /> Top Solo Travel Destinations</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {soloData.topDestinations.map((dest, i) => (
              <Link key={i} href={`/flights?to=${dest.code}`} className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all border border-gray-100 hover:border-violet-300 group">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-gray-900 text-lg">{dest.name}</h3>
                  <span className="px-2 py-1 bg-violet-100 text-violet-700 text-xs font-semibold rounded-full">{dest.code}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{dest.why}</p>
                <p className="text-xs text-violet-600 font-medium">{dest.bestFor}</p>
                <div className="mt-3 flex items-center text-violet-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                  Search Flights <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Solo Travel Tips */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Sparkles className="w-6 h-6 text-violet-600" /> Solo Travel Tips</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {soloData.tips.map((tip, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-5 hover:bg-violet-50 transition-colors">
                <h3 className="font-bold text-gray-900 mb-2">{tip.title}</h3>
                <p className="text-sm text-gray-600">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lead Capture */}
      <section className="py-12 bg-gradient-to-r from-violet-500 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Get Solo Travel Deals & Tips</h2>
          <p className="text-white/90 mb-6">Join 50,000+ solo travelers. Get exclusive flight deals, safety tips & destination guides.</p>
          <form className="flex flex-col md:flex-row gap-3 max-w-2xl mx-auto" onSubmit={(e) => { e.preventDefault(); alert('Welcome to the solo travel community!'); }}>
            <input type="email" placeholder="Email address" required className="flex-1 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-white/50" />
            <input type="tel" placeholder="Phone (optional)" className="md:w-48 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-white/50" />
            <button type="submit" className="px-6 py-3 bg-white text-violet-600 font-bold rounded-xl hover:bg-gray-100 transition-colors whitespace-nowrap">Join Community</button>
          </form>
          <p className="text-white/70 text-xs mt-3">Weekly tips. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Solo Travel FAQ</h2>
          <div className="bg-gray-50 rounded-2xl p-6">{soloData.faqs.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}</div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Best Solo Travel Destinations 2025</h2>
          <p>Planning a solo trip? Fly2Any helps you find the best destinations for traveling alone. Whether you're seeking safe solo travel destinations, budget-friendly adventures, or transformative self-discovery journeys, our guide covers it all.</p>
          <p>Top solo travel destinations include Japan (ultra-safe, rich culture), Portugal (affordable, friendly), Iceland (safest country, adventure), and Bali (spiritual, wellness). Each offers unique experiences for solo travelers.</p>
          <p>Popular searches: solo travel destinations, best places to travel alone, safe solo travel, solo female travel destinations, budget solo travel, solo adventure travel, solo travel tips. Start your solo journey today.</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-violet-700 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready for Your Solo Adventure?</h2>
          <p className="text-xl text-white/90 mb-8">Compare flights and start your solo travel journey today.</p>
          <Link href="/flights" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-violet-700 font-bold rounded-xl hover:bg-gray-100 transition-colors text-lg">Search Flights <ArrowRight className="w-5 h-5" /></Link>
        </div>
      </section>
    </div>
  );
}
