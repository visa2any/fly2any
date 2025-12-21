'use client';

import { useState } from 'react';
import EnhancedSearchBar from '@/components/flights/EnhancedSearchBar';
import Link from 'next/link';
import { Plane, Star, Shield, Users, Award, Wifi, UtensilsCrossed, Tv, ChevronDown, ChevronUp, ArrowRight, CheckCircle2, Globe, CreditCard, Headphones, MapPin, Crown, Sparkles, Luggage } from 'lucide-react';

const aaData = {
  name: 'American Airlines',
  code: 'AA',
  alliance: 'Oneworld',
  hubs: ['Dallas/Fort Worth (DFW)', 'Charlotte (CLT)', 'Chicago (ORD)', 'Miami (MIA)', 'New York (JFK)', 'Los Angeles (LAX)', 'Philadelphia (PHL)', 'Phoenix (PHX)', 'Washington (DCA)'],
  founded: '1930',
  fleet: '950+ aircraft',
  destinations: '350+ destinations worldwide',
  rating: 4.4,
  reviews: 45892,
  cabinClasses: [
    { name: 'Flagship First', icon: Crown, features: ['Flagship Lounge', 'Lie-flat seats', 'Multi-course dining', 'Casper bedding'] },
    { name: 'Flagship Business', icon: Sparkles, features: ['Lie-flat beds', 'Direct aisle access', 'Premium dining', 'Amenity kit'] },
    { name: 'Premium Economy', icon: Star, features: ['Extra legroom', 'Wider seats', 'Enhanced meals', 'Priority boarding'] },
    { name: 'Main Cabin Extra', icon: Plane, features: ['More legroom', 'Priority boarding', 'Free drinks', 'Overhead bins'] },
  ],
  popularRoutes: [
    { from: 'Dallas (DFW)', to: 'London (LHR)', duration: '9h 30m' },
    { from: 'Miami (MIA)', to: 'São Paulo (GRU)', duration: '8h 30m' },
    { from: 'Los Angeles (LAX)', to: 'Tokyo (NRT)', duration: '12h' },
    { from: 'New York (JFK)', to: 'Paris (CDG)', duration: '7h 30m' },
    { from: 'Charlotte (CLT)', to: 'Cancun (CUN)', duration: '3h' },
    { from: 'Chicago (ORD)', to: 'Dublin (DUB)', duration: '7h 45m' },
  ],
  amenities: [
    { icon: Tv, name: 'Free Entertainment', desc: 'Seatback screens' },
    { icon: Wifi, name: 'Wi-Fi', desc: 'Stay connected' },
    { icon: UtensilsCrossed, name: 'Fresh Meals', desc: 'On long-haul' },
    { icon: Luggage, name: 'AAdvantage', desc: 'Earn miles' },
  ],
  faqs: [
    { q: 'How do I book American Airlines flights?', a: 'Book on aa.com or compare American Airlines prices on Fly2Any to find the best deals from multiple sources.' },
    { q: 'What is AAdvantage?', a: 'AAdvantage is American\'s loyalty program. Earn miles on flights, credit cards, hotels, and partners. Redeem for flights, upgrades, and more.' },
    { q: 'What is Flagship First?', a: 'Flagship First is American\'s premium first class on select international routes with Flagship Lounge access, lie-flat seats, and chef-designed meals.' },
    { q: 'What is Main Cabin Extra?', a: 'Main Cabin Extra offers more legroom, priority boarding, and complimentary drinks on domestic flights.' },
    { q: 'Does American have free checked bags?', a: 'AAdvantage elite members and certain credit card holders get free checked bags. Standard fares include carry-on only.' },
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

export default function AmericanPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-red-600 via-red-700 to-blue-900 text-white py-12 md:py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
              <Award className="w-4 h-4" /> World's Largest Airline
            </span>
            <div className="mb-6">
              <img src="https://logos-world.net/wp-content/uploads/2021/08/American-Airlines-Logo.png" alt="American Airlines Logo" className="h-16 md:h-20 mx-auto object-contain" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">American Airlines Flights</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">The World's Largest Airline. Compare prices and book AA tickets to 350+ destinations worldwide.</p>
            <div className="flex items-center justify-center gap-4 text-sm text-white/80 mt-4">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Hub: Dallas/Fort Worth</span>
              <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> 350+ Destinations</span>
              <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> {aaData.rating}/5</span>
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

      {/* Stats */}
      <section className="py-10 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4"><Globe className="w-8 h-8 text-red-600 mx-auto mb-2" /><p className="text-sm text-gray-600">Destinations</p><p className="text-xl font-bold">350+</p></div>
          <div className="text-center p-4"><Plane className="w-8 h-8 text-red-600 mx-auto mb-2" /><p className="text-sm text-gray-600">Fleet Size</p><p className="text-xl font-bold">950+</p></div>
          <div className="text-center p-4"><Star className="w-8 h-8 text-red-600 mx-auto mb-2" /><p className="text-sm text-gray-600">Rating</p><p className="text-xl font-bold">4.4/5</p></div>
          <div className="text-center p-4"><Award className="w-8 h-8 text-red-600 mx-auto mb-2" /><p className="text-sm text-gray-600">Founded</p><p className="text-xl font-bold">1930</p></div>
        </div>
      </section>

      {/* Cabin Classes */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Crown className="w-6 h-6 text-red-600" /> American Airlines Cabin Classes</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {aaData.cabinClasses.map((cabin) => (
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular American Airlines Routes</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {aaData.popularRoutes.map((route, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 flex items-center gap-4 hover:bg-red-50 transition-colors">
                <Plane className="w-6 h-6 text-red-600" /><div className="flex-1"><p className="font-medium text-gray-900">{route.from} → {route.to}</p><p className="text-sm text-gray-500">{route.duration}</p></div><ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">American Airlines In-Flight Experience</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {aaData.amenities.map((a, i) => (<div key={i} className="bg-white rounded-xl p-5 text-center shadow-md"><a.icon className="w-8 h-8 text-red-600 mx-auto mb-2" /><p className="font-bold text-gray-900">{a.name}</p><p className="text-sm text-gray-500">{a.desc}</p></div>))}
          </div>
        </div>
      </section>

      {/* Why Book */}
      <section className="py-12 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Why Book American Airlines with Fly2Any?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-white/5 rounded-2xl"><Shield className="w-10 h-10 text-red-400 mx-auto mb-3" /><h3 className="font-bold mb-2">Best Price</h3><p className="text-gray-400 text-sm">Compare from 500+ sources.</p></div>
            <div className="text-center p-6 bg-white/5 rounded-2xl"><CreditCard className="w-10 h-10 text-green-400 mx-auto mb-3" /><h3 className="font-bold mb-2">No Hidden Fees</h3><p className="text-gray-400 text-sm">All taxes included.</p></div>
            <div className="text-center p-6 bg-white/5 rounded-2xl"><Users className="w-10 h-10 text-red-400 mx-auto mb-3" /><h3 className="font-bold mb-2">45K+ Reviews</h3><p className="text-gray-400 text-sm">Trusted worldwide.</p></div>
            <div className="text-center p-6 bg-white/5 rounded-2xl"><Headphones className="w-10 h-10 text-yellow-400 mx-auto mb-3" /><h3 className="font-bold mb-2">24/7 Support</h3><p className="text-gray-400 text-sm">Always here to help.</p></div>
          </div>
          <div className="text-center mt-10"><Link href="/flights" className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors text-lg">Search AA Flights <ArrowRight className="w-5 h-5" /></Link></div>
        </div>
      </section>

      {/* Lead Capture */}
      <section className="py-12 bg-gradient-to-r from-red-500 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Get Exclusive American Airlines Deals</h2>
          <p className="text-white/90 mb-6">Be first to know about AA sales & AAdvantage promotions. Save up to 40%!</p>
          <form className="flex flex-col md:flex-row gap-3 max-w-2xl mx-auto" onSubmit={(e) => { e.preventDefault(); alert('Thanks! We\'ll send you AA deals soon.'); }}>
            <input type="email" placeholder="Email address" required className="flex-1 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-white/50" />
            <input type="tel" placeholder="Phone (optional)" className="md:w-48 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-white/50" />
            <button type="submit" className="px-6 py-3 bg-white text-red-600 font-bold rounded-xl hover:bg-gray-100 transition-colors whitespace-nowrap">Get Deals</button>
          </form>
          <p className="text-white/70 text-xs mt-3">No spam. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">American Airlines FAQ</h2>
          <div className="bg-gray-50 rounded-2xl p-6">{aaData.faqs.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}</div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Book American Airlines Flights</h2>
          <p>Looking for American Airlines flights? Fly2Any helps you compare AA tickets from multiple sources. Book Flagship First, Flagship Business, or Main Cabin—we show real-time prices from aa.com and partners.</p>
          <p>American Airlines, the world's largest airline, operates 950+ aircraft to 350+ destinations. As a Oneworld member, AA partners with British Airways, Qantas, and more. Earn AAdvantage miles on every flight.</p>
          <p>Popular: aa.com, American Airlines flights, AA check in, American Airlines reservations, AAdvantage login. Search cheap AA tickets now.</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-red-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Fly American?</h2>
          <p className="text-xl text-white/90 mb-8">Compare prices and book your AA flight today.</p>
          <Link href="/flights" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-red-600 font-bold rounded-xl hover:bg-gray-100 transition-colors text-lg">Search American Airlines <ArrowRight className="w-5 h-5" /></Link>
        </div>
      </section>
    </div>
  );
}
