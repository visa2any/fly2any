'use client';

import { useState } from 'react';
import EnhancedSearchBar from '@/components/flights/EnhancedSearchBar';
import Link from 'next/link';
import { Plane, Star, Shield, Users, Award, Wifi, DollarSign, ChevronDown, ChevronUp, ArrowRight, CheckCircle2, Globe, CreditCard, Headphones, MapPin, Sparkles, Luggage, Leaf } from 'lucide-react';

const frontierData = {
  name: 'Frontier Airlines', code: 'F9', type: 'Ultra Low-Cost Carrier',
  hubs: ['Denver (DEN)', 'Las Vegas (LAS)', 'Orlando (MCO)', 'Phoenix (PHX)', 'Miami (MIA)'],
  founded: '1994', fleet: '130+ aircraft', destinations: '100+ destinations', rating: 3.7, reviews: 21456,
  cabinClasses: [
    { name: 'Stretch Seats', icon: Sparkles, features: ['Extra legroom', 'Up front location', 'Faster boarding', 'More recline'] },
    { name: 'Standard Seats', icon: Plane, features: ['Lowest fares', 'Personal item free', 'A la carte pricing', 'Eco-friendly fleet'] },
  ],
  popularRoutes: [
    { from: 'Denver (DEN)', to: 'Las Vegas (LAS)', duration: '2h' },
    { from: 'Orlando (MCO)', to: 'Philadelphia (PHL)', duration: '2h 30m' },
    { from: 'Miami (MIA)', to: 'New York (LGA)', duration: '3h' },
    { from: 'Phoenix (PHX)', to: 'San Francisco (SFO)', duration: '2h' },
    { from: 'Denver (DEN)', to: 'Chicago (ORD)', duration: '2h 30m' },
    { from: 'Las Vegas (LAS)', to: 'Seattle (SEA)', duration: '2h 30m' },
  ],
  amenities: [
    { icon: DollarSign, name: 'Low Fares', desc: 'Pay only for what you need' },
    { icon: Leaf, name: 'Green Fleet', desc: 'Most fuel-efficient' },
    { icon: Luggage, name: 'A La Carte', desc: 'Customize your trip' },
    { icon: Award, name: 'Discount Den', desc: 'Members save more' },
  ],
  faqs: [
    { q: 'What is Frontier Discount Den?', a: 'Discount Den is Frontier\'s travel club ($59.99/year). Members get exclusive low fares, kids fly free deals, and priority access to sales.' },
    { q: 'What is the GoWild Pass?', a: 'GoWild is Frontier\'s all-you-can-fly pass starting at $499/year. Fly unlimited domestic flights with day-of booking.' },
    { q: 'Does Frontier charge for bags?', a: 'Yes, Frontier charges for carry-on and checked bags. Only a personal item is free. Buy bags online for lower fees.' },
    { q: 'Is Frontier eco-friendly?', a: 'Yes! Frontier operates America\'s greenest fleet with the lowest fuel consumption per passenger mile.' },
    { q: 'Does Frontier have seat selection fees?', a: 'Yes, seat selection costs extra. Skip it for free seat assignment at check-in (you may not sit together).' },
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

export default function FrontierPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative bg-gradient-to-br from-green-500 via-green-600 to-green-800 text-white py-12 md:py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4"><Leaf className="w-4 h-4" /> America's Greenest Airline</span>
            <div className="mb-6"><img src="https://logos-world.net/wp-content/uploads/2023/01/Frontier-Airlines-Logo.png" alt="Frontier Airlines Logo" className="h-16 md:h-20 mx-auto object-contain" /></div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Frontier Airlines Flights</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">Low Fares Done Right. Book Frontier Airlines tickets to 100+ destinations.</p>
            <div className="flex items-center justify-center gap-4 text-sm text-white/80 mt-4">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Hub: Denver (DEN)</span>
              <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> 100+ Destinations</span>
              <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> {frontierData.rating}/5</span>
            </div>
          </div>
          <div className="w-full bg-white rounded-2xl shadow-2xl p-6"><EnhancedSearchBar compact={false} /></div>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-white/90 text-sm">
            <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-300" /> Lowest Fares</span>
            <span className="flex items-center gap-2"><Leaf className="w-5 h-5 text-green-300" /> Greenest Fleet</span>
            <span className="flex items-center gap-2"><Headphones className="w-5 h-5 text-yellow-400" /> 24/7 Support</span>
          </div>
        </div>
      </section>

      <section className="py-10 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4"><Globe className="w-8 h-8 text-green-600 mx-auto mb-2" /><p className="text-sm text-gray-600">Destinations</p><p className="text-xl font-bold">100+</p></div>
          <div className="text-center p-4"><Plane className="w-8 h-8 text-green-600 mx-auto mb-2" /><p className="text-sm text-gray-600">Fleet Size</p><p className="text-xl font-bold">130+</p></div>
          <div className="text-center p-4"><Star className="w-8 h-8 text-green-600 mx-auto mb-2" /><p className="text-sm text-gray-600">Rating</p><p className="text-xl font-bold">3.7/5</p></div>
          <div className="text-center p-4"><Leaf className="w-8 h-8 text-green-600 mx-auto mb-2" /><p className="text-sm text-gray-600">Status</p><p className="text-xl font-bold">Greenest</p></div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Sparkles className="w-6 h-6 text-green-600" /> Frontier Seat Options</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {frontierData.cabinClasses.map((cabin) => (
              <div key={cabin.name} className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <cabin.icon className="w-8 h-8 text-green-600 mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">{cabin.name}</h3>
                <ul className="space-y-1">{cabin.features.map((f, i) => <li key={i} className="text-sm text-gray-600 flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" />{f}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Frontier Routes</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {frontierData.popularRoutes.map((route, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 flex items-center gap-4 hover:bg-green-50 transition-colors">
                <Plane className="w-6 h-6 text-green-600" /><div className="flex-1"><p className="font-medium text-gray-900">{route.from} → {route.to}</p><p className="text-sm text-gray-500">{route.duration}</p></div><ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frontier Features</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {frontierData.amenities.map((a, i) => (<div key={i} className="bg-white rounded-xl p-5 text-center shadow-md"><a.icon className="w-8 h-8 text-green-600 mx-auto mb-2" /><p className="font-bold text-gray-900">{a.name}</p><p className="text-sm text-gray-500">{a.desc}</p></div>))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Why Book Frontier with Fly2Any?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-white/5 rounded-2xl"><Shield className="w-10 h-10 text-green-400 mx-auto mb-3" /><h3 className="font-bold mb-2">Best Price</h3><p className="text-gray-400 text-sm">Compare from 500+ sources.</p></div>
            <div className="text-center p-6 bg-white/5 rounded-2xl"><CreditCard className="w-10 h-10 text-green-400 mx-auto mb-3" /><h3 className="font-bold mb-2">All Fees Shown</h3><p className="text-gray-400 text-sm">See total cost upfront.</p></div>
            <div className="text-center p-6 bg-white/5 rounded-2xl"><Users className="w-10 h-10 text-green-400 mx-auto mb-3" /><h3 className="font-bold mb-2">21K+ Reviews</h3><p className="text-gray-400 text-sm">Trusted worldwide.</p></div>
            <div className="text-center p-6 bg-white/5 rounded-2xl"><Headphones className="w-10 h-10 text-yellow-400 mx-auto mb-3" /><h3 className="font-bold mb-2">24/7 Support</h3><p className="text-gray-400 text-sm">Always here to help.</p></div>
          </div>
          <div className="text-center mt-10"><Link href="/flights" className="inline-flex items-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors text-lg">Search Frontier Flights <ArrowRight className="w-5 h-5" /></Link></div>
        </div>
      </section>

      <section className="py-12 bg-gradient-to-r from-green-500 to-green-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Get Exclusive Frontier Deals</h2>
          <p className="text-white/90 mb-6">Be first to know about Frontier sales & Discount Den promotions. Save up to 50%!</p>
          <form className="flex flex-col md:flex-row gap-3 max-w-2xl mx-auto" onSubmit={(e) => { e.preventDefault(); alert('Thanks! We\'ll send you Frontier deals soon.'); }}>
            <input type="email" placeholder="Email address" required className="flex-1 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-white/50" />
            <input type="tel" placeholder="Phone (optional)" className="md:w-48 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-white/50" />
            <button type="submit" className="px-6 py-3 bg-white text-green-600 font-bold rounded-xl hover:bg-gray-100 transition-colors whitespace-nowrap">Get Deals</button>
          </form>
          <p className="text-white/70 text-xs mt-3">No spam. Unsubscribe anytime.</p>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frontier Airlines FAQ</h2>
          <div className="bg-gray-50 rounded-2xl p-6">{frontierData.faqs.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}</div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Book Frontier Airlines Flights</h2>
          <p>Looking for cheap Frontier flights? Fly2Any helps you compare Frontier tickets from multiple sources. Frontier's a la carte model means you pay only for what you need.</p>
          <p>Frontier operates America's greenest fleet to 100+ destinations. Join Discount Den for exclusive savings or try the GoWild all-you-can-fly pass.</p>
          <p>Popular: Frontier Airlines, flyfrontier.com, Frontier flights, Discount Den, GoWild Pass. Search cheap Frontier tickets now.</p>
        </div>
      </section>

      <section className="py-16 bg-green-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Go Green with Frontier?</h2>
          <p className="text-xl text-white/90 mb-8">Compare prices and book your Frontier flight today.</p>
          <Link href="/flights" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-green-600 font-bold rounded-xl hover:bg-gray-100 transition-colors text-lg">Search Frontier Flights <ArrowRight className="w-5 h-5" /></Link>
        </div>
      </section>
    </div>
  );
}
