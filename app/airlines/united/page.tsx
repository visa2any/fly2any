'use client';

import { useState } from 'react';
import EnhancedSearchBar from '@/components/flights/EnhancedSearchBar';
import Link from 'next/link';
import { Plane, Star, Shield, Users, Award, Wifi, UtensilsCrossed, Tv, ChevronDown, ChevronUp, ArrowRight, CheckCircle2, Globe, CreditCard, Headphones, MapPin, Crown, Sparkles, Luggage } from 'lucide-react';

const unitedData = {
  name: 'United Airlines',
  code: 'UA',
  alliance: 'Star Alliance',
  hubs: ['Chicago (ORD)', 'Denver (DEN)', 'Houston (IAH)', 'Los Angeles (LAX)', 'Newark (EWR)', 'San Francisco (SFO)', 'Washington (IAD)'],
  founded: '1926',
  fleet: '900+ aircraft',
  destinations: '340+ destinations worldwide',
  rating: 4.5,
  reviews: 32145,
  cabinClasses: [
    { name: 'United Polaris', icon: Crown, features: ['Lie-flat beds', 'Polaris lounge', 'Premium dining', 'Direct aisle'] },
    { name: 'United Premium Plus', icon: Sparkles, features: ['Extra legroom', 'Larger screens', 'Enhanced meals', 'Amenity kit'] },
    { name: 'Economy Plus', icon: Star, features: ['Up to 6" more legroom', 'Priority boarding', 'Overhead bins', 'Earlier boarding'] },
    { name: 'Economy', icon: Plane, features: ['Free entertainment', 'Snacks & drinks', 'Wi-Fi available', 'Power outlets'] },
  ],
  popularRoutes: [
    { from: 'Newark (EWR)', to: 'London (LHR)', duration: '7h' },
    { from: 'San Francisco (SFO)', to: 'Tokyo (NRT)', duration: '11h' },
    { from: 'Chicago (ORD)', to: 'Frankfurt (FRA)', duration: '9h' },
    { from: 'Houston (IAH)', to: 'Cancun (CUN)', duration: '2h 30m' },
    { from: 'Los Angeles (LAX)', to: 'Sydney (SYD)', duration: '15h' },
    { from: 'Denver (DEN)', to: 'Honolulu (HNL)', duration: '7h' },
  ],
  amenities: [
    { icon: Tv, name: 'Seatback Screens', desc: 'Free entertainment' },
    { icon: Wifi, name: 'United Wi-Fi', desc: 'Stay connected' },
    { icon: UtensilsCrossed, name: 'Fresh Meals', desc: 'On long-haul' },
    { icon: Luggage, name: 'MileagePlus', desc: 'Earn miles' },
  ],
  faqs: [
    { q: 'How do I book United Airlines flights?', a: 'Book on united.com or compare United prices on Fly2Any to find the best deals from multiple travel sites.' },
    { q: 'What is United MileagePlus?', a: 'MileagePlus is United\'s loyalty program. Earn miles on flights, credit cards, hotels, and car rentals. Redeem for flights, upgrades, and more.' },
    { q: 'What is United Polaris?', a: 'Polaris is United\'s premium business class with lie-flat seats, Polaris lounges, and chef-designed meals on international flights.' },
    { q: 'Does United have free Wi-Fi?', a: 'United offers free messaging. Paid Wi-Fi packages available; MileagePlus Premier members get discounts.' },
    { q: 'What is United Economy Plus?', a: 'Economy Plus offers up to 6" more legroom, preferred overhead bin access, and priority boarding.' },
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

export default function UnitedPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white py-12 md:py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
              <Award className="w-4 h-4" /> Star Alliance Member
            </span>
            <div className="mb-6">
              <img src="https://logos-world.net/wp-content/uploads/2021/08/United-Airlines-Logo.png" alt="United Airlines Logo" className="h-16 md:h-20 mx-auto object-contain" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">United Airlines Flights</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">Good Leads The Way. Compare prices and book United Airlines tickets to 340+ destinations worldwide.</p>
            <div className="flex items-center justify-center gap-4 text-sm text-white/80 mt-4">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Hub: Chicago (ORD)</span>
              <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> 340+ Destinations</span>
              <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> {unitedData.rating}/5</span>
            </div>
          </div>
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6"><EnhancedSearchBar compact={true} /></div>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-white/90 text-sm">
            <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-400" /> Best Price Guarantee</span>
            <span className="flex items-center gap-2"><Shield className="w-5 h-5 text-blue-400" /> Star Alliance</span>
            <span className="flex items-center gap-2"><Headphones className="w-5 h-5 text-yellow-400" /> 24/7 Support</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4"><Globe className="w-8 h-8 text-blue-600 mx-auto mb-2" /><p className="text-sm text-gray-600">Destinations</p><p className="text-xl font-bold">340+</p></div>
          <div className="text-center p-4"><Plane className="w-8 h-8 text-blue-600 mx-auto mb-2" /><p className="text-sm text-gray-600">Fleet Size</p><p className="text-xl font-bold">900+</p></div>
          <div className="text-center p-4"><Star className="w-8 h-8 text-blue-600 mx-auto mb-2" /><p className="text-sm text-gray-600">Rating</p><p className="text-xl font-bold">4.5/5</p></div>
          <div className="text-center p-4"><Award className="w-8 h-8 text-blue-600 mx-auto mb-2" /><p className="text-sm text-gray-600">Founded</p><p className="text-xl font-bold">1926</p></div>
        </div>
      </section>

      {/* Cabin Classes */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Crown className="w-6 h-6 text-blue-600" /> United Cabin Classes</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {unitedData.cabinClasses.map((cabin) => (
              <div key={cabin.name} className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <cabin.icon className="w-8 h-8 text-blue-600 mb-3" />
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular United Routes</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {unitedData.popularRoutes.map((route, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 flex items-center gap-4 hover:bg-blue-50 transition-colors">
                <Plane className="w-6 h-6 text-blue-600" /><div className="flex-1"><p className="font-medium text-gray-900">{route.from} → {route.to}</p><p className="text-sm text-gray-500">{route.duration}</p></div><ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">United In-Flight Experience</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {unitedData.amenities.map((a, i) => (<div key={i} className="bg-white rounded-xl p-5 text-center shadow-md"><a.icon className="w-8 h-8 text-blue-600 mx-auto mb-2" /><p className="font-bold text-gray-900">{a.name}</p><p className="text-sm text-gray-500">{a.desc}</p></div>))}
          </div>
        </div>
      </section>

      {/* Why Book */}
      <section className="py-12 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Why Book United with Fly2Any?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-white/5 rounded-2xl"><Shield className="w-10 h-10 text-blue-400 mx-auto mb-3" /><h3 className="font-bold mb-2">Best Price</h3><p className="text-gray-400 text-sm">Compare from 500+ sources.</p></div>
            <div className="text-center p-6 bg-white/5 rounded-2xl"><CreditCard className="w-10 h-10 text-green-400 mx-auto mb-3" /><h3 className="font-bold mb-2">No Hidden Fees</h3><p className="text-gray-400 text-sm">All taxes included.</p></div>
            <div className="text-center p-6 bg-white/5 rounded-2xl"><Users className="w-10 h-10 text-blue-400 mx-auto mb-3" /><h3 className="font-bold mb-2">32K+ Reviews</h3><p className="text-gray-400 text-sm">Trusted worldwide.</p></div>
            <div className="text-center p-6 bg-white/5 rounded-2xl"><Headphones className="w-10 h-10 text-yellow-400 mx-auto mb-3" /><h3 className="font-bold mb-2">24/7 Support</h3><p className="text-gray-400 text-sm">Always here to help.</p></div>
          </div>
          <div className="text-center mt-10"><Link href="/flights" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors text-lg">Search United Flights <ArrowRight className="w-5 h-5" /></Link></div>
        </div>
      </section>

      {/* Lead Capture */}
      <section className="py-12 bg-gradient-to-r from-blue-500 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Get Exclusive United Deals</h2>
          <p className="text-white/90 mb-6">Be first to know about United sales & MileagePlus promotions. Save up to 40%!</p>
          <form className="flex flex-col md:flex-row gap-3 max-w-2xl mx-auto" onSubmit={(e) => { e.preventDefault(); alert('Thanks! We\'ll send you United deals soon.'); }}>
            <input type="email" placeholder="Email address" required className="flex-1 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-white/50" />
            <input type="tel" placeholder="Phone (optional)" className="md:w-48 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-white/50" />
            <button type="submit" className="px-6 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-100 transition-colors whitespace-nowrap">Get Deals</button>
          </form>
          <p className="text-white/70 text-xs mt-3">No spam. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">United Airlines FAQ</h2>
          <div className="bg-gray-50 rounded-2xl p-6">{unitedData.faqs.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}</div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Book United Airlines Flights</h2>
          <p>Looking for United Airlines reservations? Fly2Any helps you compare United flights from multiple sources. Book United Polaris business class, Economy Plus, or standard Economy—we show real-time prices from the official site and partners.</p>
          <p>United, founded in 1926, operates 900+ aircraft to 340+ destinations as a founding Star Alliance member. Earn MileagePlus miles on every United flight and redeem for rewards.</p>
          <p>Popular: United Airlines official site, United flight status, United check in, United reservations, MileagePlus login. Search cheap United tickets now.</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-blue-700 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Fly United?</h2>
          <p className="text-xl text-white/90 mb-8">Compare prices and book your United flight today.</p>
          <Link href="/flights" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-gray-100 transition-colors text-lg">Search United Flights <ArrowRight className="w-5 h-5" /></Link>
        </div>
      </section>
    </div>
  );
}
