'use client';

import { useState } from 'react';
import EnhancedSearchBar from '@/components/flights/EnhancedSearchBar';
import Link from 'next/link';
import { Plane, Star, Shield, Users, Award, Wifi, DollarSign, Tv, ChevronDown, ChevronUp, ArrowRight, CheckCircle2, Globe, CreditCard, Headphones, MapPin, Sparkles, Luggage, Zap } from 'lucide-react';

const spiritData = {
  name: 'Spirit Airlines', code: 'NK', type: 'Ultra Low-Cost Carrier',
  hubs: ['Fort Lauderdale (FLL)', 'Las Vegas (LAS)', 'Orlando (MCO)', 'Atlantic City (ACY)', 'Dallas (DFW)'],
  founded: '1992', fleet: '200+ aircraft', destinations: '90+ destinations', rating: 3.8, reviews: 34567,
  cabinClasses: [
    { name: 'Big Front Seat', icon: Sparkles, features: ['Extra legroom', 'Wider seat', 'More recline', 'Priority boarding'] },
    { name: 'Standard Seat', icon: Plane, features: ['Lowest fares', 'Personal item free', 'Buy what you need', 'A la carte pricing'] },
  ],
  popularRoutes: [
    { from: 'Fort Lauderdale (FLL)', to: 'New York (LGA)', duration: '3h' },
    { from: 'Las Vegas (LAS)', to: 'Los Angeles (LAX)', duration: '1h' },
    { from: 'Orlando (MCO)', to: 'Chicago (ORD)', duration: '2h 45m' },
    { from: 'Dallas (DFW)', to: 'Denver (DEN)', duration: '2h 15m' },
    { from: 'Fort Lauderdale (FLL)', to: 'San Juan (SJU)', duration: '2h 30m' },
    { from: 'Los Angeles (LAX)', to: 'Cancun (CUN)', duration: '4h' },
  ],
  amenities: [
    { icon: DollarSign, name: 'Bare Fare', desc: 'Pay only for what you need' },
    { icon: Luggage, name: 'A La Carte', desc: 'Add bags, seats, extras' },
    { icon: Wifi, name: 'Wi-Fi Available', desc: 'Purchase onboard' },
    { icon: Zap, name: 'Free Spirit', desc: 'Earn & redeem points' },
  ],
  faqs: [
    { q: 'What is Spirit\'s Bare Fare?', a: 'Bare Fare is Spirit\'s base ticket price that includes your seat and a personal item. Everything else (carry-on, checked bags, seat selection) is optional and priced separately.' },
    { q: 'How do I avoid Spirit bag fees?', a: 'Buy bags online during booking for the lowest rates. Use a Spirit credit card for free bags. Pack light with just a personal item (18x14x8 inches).' },
    { q: 'Is Spirit Airlines safe?', a: 'Yes! Spirit maintains an excellent safety record and is fully FAA-certified. They operate a young, fuel-efficient fleet of Airbus aircraft.' },
    { q: 'What is the Big Front Seat?', a: 'Big Front Seats offer extra legroom, wider seats, and more recline in the first two rows. They\'re Spirit\'s premium option at a fraction of business class prices.' },
    { q: 'Does Spirit charge for seat selection?', a: 'Yes, seat selection costs extra. Skip it and Spirit will assign your seat at check-in for free, though you may not sit together.' },
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

export default function SpiritPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-black py-12 md:py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-black/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4"><DollarSign className="w-4 h-4" /> Ultra Low-Cost Carrier</span>
            <div className="mb-6"><img src="https://logos-world.net/wp-content/uploads/2023/01/Spirit-Airlines-Logo.png" alt="Spirit Airlines Logo" className="h-16 md:h-20 mx-auto object-contain" /></div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Spirit Airlines Flights</h1>
            <p className="text-xl max-w-2xl mx-auto">Less Money. More Go. Find the cheapest Spirit Airlines tickets to 90+ destinations.</p>
            <div className="flex items-center justify-center gap-4 text-sm mt-4">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Hub: Fort Lauderdale</span>
              <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> 90+ Destinations</span>
              <span className="flex items-center gap-1"><Star className="w-4 h-4" /> {spiritData.rating}/5</span>
            </div>
          </div>
          <div className="w-full bg-white rounded-2xl shadow-2xl p-6"><EnhancedSearchBar compact={false} /></div>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm">
            <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-600" /> Lowest Fares</span>
            <span className="flex items-center gap-2"><Shield className="w-5 h-5" /> Safe & Reliable</span>
            <span className="flex items-center gap-2"><Headphones className="w-5 h-5" /> 24/7 Support</span>
          </div>
        </div>
      </section>

      <section className="py-10 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4"><Globe className="w-8 h-8 text-yellow-500 mx-auto mb-2" /><p className="text-sm text-gray-600">Destinations</p><p className="text-xl font-bold">90+</p></div>
          <div className="text-center p-4"><Plane className="w-8 h-8 text-yellow-500 mx-auto mb-2" /><p className="text-sm text-gray-600">Fleet Size</p><p className="text-xl font-bold">200+</p></div>
          <div className="text-center p-4"><Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" /><p className="text-sm text-gray-600">Rating</p><p className="text-xl font-bold">3.8/5</p></div>
          <div className="text-center p-4"><Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" /><p className="text-sm text-gray-600">Founded</p><p className="text-xl font-bold">1992</p></div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Sparkles className="w-6 h-6 text-yellow-500" /> Spirit Seat Options</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {spiritData.cabinClasses.map((cabin) => (
              <div key={cabin.name} className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <cabin.icon className="w-8 h-8 text-yellow-500 mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">{cabin.name}</h3>
                <ul className="space-y-1">{cabin.features.map((f, i) => <li key={i} className="text-sm text-gray-600 flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" />{f}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Spirit Routes</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {spiritData.popularRoutes.map((route, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 flex items-center gap-4 hover:bg-yellow-50 transition-colors">
                <Plane className="w-6 h-6 text-yellow-500" /><div className="flex-1"><p className="font-medium text-gray-900">{route.from} → {route.to}</p><p className="text-sm text-gray-500">{route.duration}</p></div><ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Spirit Airlines Features</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {spiritData.amenities.map((a, i) => (<div key={i} className="bg-white rounded-xl p-5 text-center shadow-md"><a.icon className="w-8 h-8 text-yellow-500 mx-auto mb-2" /><p className="font-bold text-gray-900">{a.name}</p><p className="text-sm text-gray-500">{a.desc}</p></div>))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Why Book Spirit with Fly2Any?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-white/5 rounded-2xl"><Shield className="w-10 h-10 text-yellow-400 mx-auto mb-3" /><h3 className="font-bold mb-2">Best Price</h3><p className="text-gray-400 text-sm">Compare from 500+ sources.</p></div>
            <div className="text-center p-6 bg-white/5 rounded-2xl"><CreditCard className="w-10 h-10 text-green-400 mx-auto mb-3" /><h3 className="font-bold mb-2">All Fees Shown</h3><p className="text-gray-400 text-sm">See total cost upfront.</p></div>
            <div className="text-center p-6 bg-white/5 rounded-2xl"><Users className="w-10 h-10 text-yellow-400 mx-auto mb-3" /><h3 className="font-bold mb-2">34K+ Reviews</h3><p className="text-gray-400 text-sm">Trusted worldwide.</p></div>
            <div className="text-center p-6 bg-white/5 rounded-2xl"><Headphones className="w-10 h-10 text-yellow-400 mx-auto mb-3" /><h3 className="font-bold mb-2">24/7 Support</h3><p className="text-gray-400 text-sm">Always here to help.</p></div>
          </div>
          <div className="text-center mt-10"><Link href="/flights" className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-xl transition-colors text-lg">Search Spirit Flights <ArrowRight className="w-5 h-5" /></Link></div>
        </div>
      </section>

      <section className="py-12 bg-gradient-to-r from-yellow-400 to-yellow-500">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-black mb-3">Get Exclusive Spirit Deals</h2>
          <p className="text-black/80 mb-6">Be first to know about Spirit sales & Free Spirit promotions. Save up to 50%!</p>
          <form className="flex flex-col md:flex-row gap-3 max-w-2xl mx-auto" onSubmit={(e) => { e.preventDefault(); alert('Thanks! We\'ll send you Spirit deals soon.'); }}>
            <input type="email" placeholder="Email address" required className="flex-1 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-black/20" />
            <input type="tel" placeholder="Phone (optional)" className="md:w-48 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-black/20" />
            <button type="submit" className="px-6 py-3 bg-black text-yellow-400 font-bold rounded-xl hover:bg-gray-900 transition-colors whitespace-nowrap">Get Deals</button>
          </form>
          <p className="text-black/60 text-xs mt-3">No spam. Unsubscribe anytime.</p>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Spirit Airlines FAQ</h2>
          <div className="bg-gray-50 rounded-2xl p-6">{spiritData.faqs.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}</div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Book Spirit Airlines Flights</h2>
          <p>Looking for cheap Spirit Airlines tickets? Fly2Any helps you compare Spirit flights from multiple sources. Spirit's Bare Fare model means you pay only for what you need—add bags, seats, and extras as desired.</p>
          <p>Spirit operates 200+ Airbus aircraft to 90+ destinations across the US, Caribbean, and Latin America. Join Free Spirit to earn and redeem points on flights.</p>
          <p>Popular: Spirit Airlines, spirit.com, Spirit flights, Spirit Airlines reservations, Spirit bag fees. Search cheap Spirit tickets now.</p>
        </div>
      </section>

      <section className="py-16 bg-yellow-400 text-black text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Save with Spirit?</h2>
          <p className="text-xl mb-8">Compare prices and book your Spirit flight today.</p>
          <Link href="/flights" className="inline-flex items-center gap-2 px-10 py-4 bg-black text-yellow-400 font-bold rounded-xl hover:bg-gray-900 transition-colors text-lg">Search Spirit Flights <ArrowRight className="w-5 h-5" /></Link>
        </div>
      </section>
    </div>
  );
}
