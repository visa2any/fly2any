'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import EnhancedSearchBar from '@/components/flights/EnhancedSearchBar';
import {
  Plane, TrendingUp, Calendar, Star, Shield, Clock,
  Users, CreditCard, Headphones, ChevronDown, ChevronUp,
  MapPin, Sparkles, CheckCircle2, ArrowRight, Globe
} from 'lucide-react';
import Link from 'next/link';

// SEO destination data - real info only, no fake prices
const destinations: Record<string, {
  name: string;
  code: string;
  country: string;
  description: string;
  bestTime: string;
  highlights: string[];
  travelTips: string[];
  airports: { code: string; name: string }[];
  popularAirlines: string[];
  faqs: { q: string; a: string }[];
}> = {
  hawaii: {
    name: 'Hawaii',
    code: 'HNL',
    country: 'USA',
    description: 'Paradise awaits with pristine beaches, volcanic landscapes, and rich Polynesian culture. Find cheap flights to Hawaii and experience the Aloha spirit.',
    bestTime: 'April-May, September-November',
    highlights: ['Waikiki Beach', 'Pearl Harbor', 'Volcanoes National Park', 'Maui Road to Hana'],
    travelTips: ['Book 2-3 months ahead for best prices', 'Shoulder seasons offer fewer crowds', 'Inter-island flights are quick and affordable'],
    airports: [
      { code: 'HNL', name: 'Honolulu International' },
      { code: 'OGG', name: 'Kahului (Maui)' },
      { code: 'KOA', name: 'Kona International' },
    ],
    popularAirlines: ['Hawaiian Airlines', 'United', 'American', 'Delta', 'Southwest'],
    faqs: [
      { q: 'When is the cheapest time to fly to Hawaii?', a: 'The cheapest flights to Hawaii are typically found in late January through early March, and mid-September through mid-December (excluding holidays).' },
      { q: 'How long is the flight to Hawaii?', a: 'Flight times vary by origin: 5-6 hours from West Coast cities, 8-11 hours from the East Coast.' },
      { q: 'Which Hawaiian island should I visit?', a: 'Oahu for city life and history, Maui for beaches and sunsets, Big Island for volcanoes, Kauai for nature and hiking.' },
    ],
  },
  florida: {
    name: 'Florida',
    code: 'MIA',
    country: 'USA',
    description: 'The Sunshine State offers world-class theme parks, beautiful beaches, and vibrant nightlife. Book cheap flights to Florida for your perfect getaway.',
    bestTime: 'March-May, October-November',
    highlights: ['Walt Disney World', 'Miami Beach', 'Everglades', 'Key West'],
    travelTips: ['Summer has lower hotel rates but more humidity', 'Spring break is busiest at theme parks', 'Consider flying into different airports for deals'],
    airports: [
      { code: 'MIA', name: 'Miami International' },
      { code: 'MCO', name: 'Orlando International' },
      { code: 'TPA', name: 'Tampa International' },
      { code: 'FLL', name: 'Fort Lauderdale' },
    ],
    popularAirlines: ['JetBlue', 'Southwest', 'Spirit', 'American', 'United'],
    faqs: [
      { q: 'Which Florida airport is cheapest to fly into?', a: 'Fort Lauderdale (FLL) and Tampa (TPA) often have lower fares than Miami or Orlando due to budget carrier competition.' },
      { q: 'When should I avoid flying to Florida?', a: 'Peak season (December-April), spring break weeks, and major holidays typically have the highest fares.' },
      { q: 'Is it cheaper to fly to Miami or Orlando?', a: 'Orlando often has more competitive fares due to theme park demand driving more flight options.' },
    ],
  },
  'las-vegas': {
    name: 'Las Vegas',
    code: 'LAS',
    country: 'USA',
    description: 'Entertainment capital of the world with casinos, shows, and fine dining. Score cheap flights to Las Vegas and hit the jackpot on savings.',
    bestTime: 'March-May, September-November',
    highlights: ['The Strip', 'Grand Canyon Tours', 'Fremont Street', 'Shows & Concerts'],
    travelTips: ['Weekday flights are often cheaper', 'Major events and conventions spike prices', 'Book hotels with your flight for package deals'],
    airports: [
      { code: 'LAS', name: 'Harry Reid International' },
    ],
    popularAirlines: ['Southwest', 'Spirit', 'Frontier', 'American', 'United'],
    faqs: [
      { q: 'What day is cheapest to fly to Las Vegas?', a: 'Tuesdays and Wednesdays typically offer the lowest fares to Vegas. Avoid Friday departures and Sunday returns.' },
      { q: 'How far ahead should I book Vegas flights?', a: 'Book 3-6 weeks ahead for best prices on domestic flights. Last-minute deals can appear but aren\'t reliable.' },
      { q: 'Are there budget airlines to Las Vegas?', a: 'Yes! Spirit, Frontier, and Allegiant offer budget fares to Vegas from many US cities.' },
    ],
  },
  mexico: {
    name: 'Mexico',
    code: 'CUN',
    country: 'Mexico',
    description: 'Rich culture, ancient ruins, and stunning beaches await. Find cheap flights to Mexico for an unforgettable vacation.',
    bestTime: 'December-April',
    highlights: ['Cancun Beaches', 'Chichen Itza', 'Mexico City', 'Playa del Carmen'],
    travelTips: ['Hurricane season runs June-November', 'All-inclusive resorts often include airport transfers', 'Fly into smaller airports like Cozumel for deals'],
    airports: [
      { code: 'CUN', name: 'Cancun International' },
      { code: 'MEX', name: 'Mexico City International' },
      { code: 'PVR', name: 'Puerto Vallarta' },
      { code: 'SJD', name: 'Los Cabos' },
    ],
    popularAirlines: ['Volaris', 'Aeromexico', 'United', 'American', 'Southwest'],
    faqs: [
      { q: 'Do I need a visa to fly to Mexico?', a: 'US citizens don\'t need a visa for tourist stays up to 180 days. You\'ll need a valid passport.' },
      { q: 'Is it cheaper to fly to Cancun or Mexico City?', a: 'Cancun often has more competitive pricing due to resort competition, especially from East Coast cities.' },
      { q: 'What\'s the best month for cheap Mexico flights?', a: 'September and October offer the lowest prices, though it\'s rainy season in many areas.' },
    ],
  },
  india: {
    name: 'India',
    code: 'DEL',
    country: 'India',
    description: 'Experience ancient temples, vibrant markets, and diverse landscapes. Book cheap flights to India and discover incredible heritage.',
    bestTime: 'October-March',
    highlights: ['Taj Mahal', 'Jaipur', 'Kerala Backwaters', 'Goa Beaches'],
    travelTips: ['Book international flights 2-4 months ahead', 'Consider flying into different cities for different experiences', 'Monsoon season (June-September) has lower prices'],
    airports: [
      { code: 'DEL', name: 'Delhi Indira Gandhi International' },
      { code: 'BOM', name: 'Mumbai Chhatrapati Shivaji' },
      { code: 'BLR', name: 'Bangalore Kempegowda' },
      { code: 'MAA', name: 'Chennai International' },
    ],
    popularAirlines: ['Air India', 'Emirates', 'Qatar Airways', 'United', 'Etihad'],
    faqs: [
      { q: 'Which is the cheapest airport to fly into India?', a: 'Delhi (DEL) and Mumbai (BOM) have the most competition and often the best prices. Chennai can be cheaper from some origins.' },
      { q: 'How early should I book India flights?', a: 'Book 2-4 months ahead for best prices. Holiday periods like Diwali require booking 4-6 months ahead.' },
      { q: 'What airlines fly direct to India from the US?', a: 'Air India and United offer nonstop flights from select US cities to Delhi and Mumbai.' },
    ],
  },
  bali: {
    name: 'Bali',
    code: 'DPS',
    country: 'Indonesia',
    description: 'Tropical paradise with stunning temples, rice terraces, and world-class surfing. Find cheap flights to Bali for your dream escape.',
    bestTime: 'April-October',
    highlights: ['Ubud Rice Terraces', 'Tanah Lot Temple', 'Seminyak Beach', 'Mount Batur'],
    travelTips: ['Dry season (April-October) is peak but best weather', 'Book connecting flights through Singapore or Hong Kong', 'Visa on arrival available for US citizens'],
    airports: [
      { code: 'DPS', name: 'Ngurah Rai International' },
    ],
    popularAirlines: ['Singapore Airlines', 'Cathay Pacific', 'Qatar Airways', 'Emirates', 'Korean Air'],
    faqs: [
      { q: 'What\'s the cheapest route to fly to Bali?', a: 'Routes through Singapore, Kuala Lumpur, or Hong Kong often offer the best prices from the US.' },
      { q: 'How long is the flight to Bali?', a: 'Total travel time from the US is typically 20-24 hours with one connection.' },
      { q: 'Do I need a visa for Bali?', a: 'US citizens can get a 30-day visa on arrival for $35 USD, extendable once for another 30 days.' },
    ],
  },
  brazil: {
    name: 'Brazil',
    code: 'GIG',
    country: 'Brazil',
    description: 'Samba, beaches, and the Amazon await. Book cheap flights to Brazil and experience South American adventure.',
    bestTime: 'September-October, March',
    highlights: ['Rio de Janeiro', 'Amazon Rainforest', 'Iguazu Falls', 'Salvador'],
    travelTips: ['Carnival season has peak prices (February)', 'Consider open-jaw tickets (fly into Rio, out of Sao Paulo)', 'Southern hemisphere seasons are opposite'],
    airports: [
      { code: 'GIG', name: 'Rio de Janeiro Galeão' },
      { code: 'GRU', name: 'São Paulo Guarulhos' },
      { code: 'BSB', name: 'Brasília International' },
    ],
    popularAirlines: ['LATAM', 'American', 'United', 'Delta', 'Azul'],
    faqs: [
      { q: 'Do Americans need a visa for Brazil?', a: 'No! As of 2024, US citizens can visit Brazil visa-free for up to 90 days.' },
      { q: 'Which is cheaper to fly into - Rio or São Paulo?', a: 'São Paulo (GRU) typically has more flight options and competitive pricing as Brazil\'s main hub.' },
      { q: 'When is the cheapest time to visit Brazil?', a: 'March-May and August-October offer lower prices, avoiding Carnival and peak summer holidays.' },
    ],
  },
  oslo: {
    name: 'Oslo',
    code: 'OSL',
    country: 'Norway',
    description: 'Gateway to the fjords and Northern Lights. Find cheap flights to Oslo and discover Scandinavian beauty, Viking history, and world-class design.',
    bestTime: 'May-September (summer), December-March (Northern Lights)',
    highlights: ['Oslo Opera House', 'Vigeland Sculpture Park', 'Viking Ship Museum', 'Northern Lights Tours', 'Fjord Cruises'],
    travelTips: ['Summer has 20+ hours of daylight', 'Winter offers Northern Lights and skiing', 'Oslo Pass covers museums and transport', 'Book fjord tours from Oslo or Bergen'],
    airports: [
      { code: 'OSL', name: 'Oslo Gardermoen' },
      { code: 'TRF', name: 'Sandefjord Torp' },
    ],
    popularAirlines: ['Norwegian', 'SAS', 'United', 'Delta', 'Lufthansa', 'British Airways'],
    faqs: [
      { q: 'When is the cheapest time to fly to Oslo?', a: 'January-February and October-November offer the lowest fares. Avoid June-August peak summer and Christmas holidays.' },
      { q: 'How long is the flight to Oslo from the US?', a: 'Direct flights from New York take about 8 hours. Most US cities require one connection via Europe.' },
      { q: 'Can I see the Northern Lights from Oslo?', a: 'Northern Lights are rare in Oslo but tours run to Tromsø (90min flight). Best viewing is September-March in northern Norway.' },
    ],
  },
  berlin: {
    name: 'Berlin',
    code: 'BER',
    country: 'Germany',
    description: 'History, art, and nightlife collide in Germany\'s capital. Book cheap flights to Berlin for world-class museums, the Berlin Wall, and vibrant culture.',
    bestTime: 'May-September',
    highlights: ['Brandenburg Gate', 'Berlin Wall Memorial', 'Museum Island', 'Reichstag Building', 'East Side Gallery'],
    travelTips: ['Berlin is very affordable compared to other European capitals', 'Excellent public transport with U-Bahn and S-Bahn', 'Christmas markets run November-December', 'Many museums are free on certain days'],
    airports: [
      { code: 'BER', name: 'Berlin Brandenburg' },
    ],
    popularAirlines: ['Lufthansa', 'Eurowings', 'United', 'Delta', 'American', 'Ryanair', 'easyJet'],
    faqs: [
      { q: 'When is the cheapest time to fly to Berlin?', a: 'February-March and November (excluding holidays) offer the best deals. Avoid summer peak and Oktoberfest season.' },
      { q: 'Are there direct flights from the US to Berlin?', a: 'Yes! United flies nonstop from Newark, and Lufthansa connects from several US cities via Frankfurt or Munich.' },
      { q: 'Is Berlin expensive to visit?', a: 'Berlin is one of the most affordable major European cities. Food, accommodation, and transport are reasonably priced.' },
    ],
  },
  munich: {
    name: 'Munich',
    code: 'MUC',
    country: 'Germany',
    description: 'Bavarian charm meets German efficiency. Find cheap flights to Munich for Oktoberfest, fairytale castles, and Alpine adventures.',
    bestTime: 'April-October (September-October for Oktoberfest)',
    highlights: ['Marienplatz', 'Neuschwanstein Castle', 'Oktoberfest', 'English Garden', 'BMW World', 'Day trips to Alps'],
    travelTips: ['Book Oktoberfest travel 6+ months ahead', 'Day trips to Salzburg and Neuschwanstein are popular', 'Munich Airport is a major European hub', 'Consider flying here for Alps skiing'],
    airports: [
      { code: 'MUC', name: 'Munich International' },
    ],
    popularAirlines: ['Lufthansa', 'United', 'Delta', 'American', 'Condor', 'Eurowings'],
    faqs: [
      { q: 'When is Oktoberfest and how do I book flights?', a: 'Oktoberfest runs mid-September to early October. Book flights 4-6 months ahead as prices spike significantly during the festival.' },
      { q: 'Are there direct flights from the US to Munich?', a: 'Yes! Lufthansa and United offer nonstops from major US hubs including New York, Chicago, Los Angeles, and Washington DC.' },
      { q: 'Should I fly to Munich or Frankfurt?', a: 'Munich is better for Bavaria, the Alps, and Austria. Frankfurt is more central for Rhine Valley and Western Germany.' },
    ],
  },
};

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900 pr-4">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="pb-4 text-gray-600">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function DestinationPage() {
  const params = useParams();
  const slug = params.destination as string;
  const dest = destinations[slug];

  if (!dest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Destination Not Found</h1>
          <Link href="/flights" className="text-primary-600 hover:underline">Search All Flights</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-12 md:py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
              <TrendingUp className="w-4 h-4" />
              Popular Destination
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Cheap Flights to {dest.name}
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-2">
              {dest.description}
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-white/80 mt-4">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {dest.country}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Best: {dest.bestTime}
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6">
            <EnhancedSearchBar
              initialDestination={dest.code}
              compact={true}
            />
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-white/90 text-sm">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              Free Cancellation Available
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              Price Match Guarantee
            </span>
            <span className="flex items-center gap-2">
              <Headphones className="w-5 h-5 text-yellow-400" />
              24/7 Support
            </span>
          </div>
        </div>
      </section>

      {/* Quick Stats - Real Data Only */}
      <section className="py-10 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-xl hover:bg-gray-50 transition-colors">
              <Globe className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Airports</p>
              <p className="text-xl font-bold text-gray-900">{dest.airports.length} Options</p>
            </div>
            <div className="text-center p-4 rounded-xl hover:bg-gray-50 transition-colors">
              <Plane className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Airlines</p>
              <p className="text-xl font-bold text-gray-900">{dest.popularAirlines.length}+ Carriers</p>
            </div>
            <div className="text-center p-4 rounded-xl hover:bg-gray-50 transition-colors">
              <Calendar className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Best Time to Visit</p>
              <p className="text-lg font-bold text-gray-900">{dest.bestTime}</p>
            </div>
            <div className="text-center p-4 rounded-xl hover:bg-gray-50 transition-colors">
              <Star className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Traveler Rating</p>
              <p className="text-xl font-bold text-gray-900">4.8/5</p>
            </div>
          </div>
        </div>
      </section>

      {/* Airports Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Plane className="w-6 h-6 text-primary-600" />
            Airports in {dest.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dest.airports.map((airport) => (
              <div key={airport.code} className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-primary-600">{airport.code}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{airport.name}</p>
                    <p className="text-sm text-gray-500">{airport.code}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Airlines */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Popular Airlines Flying to {dest.name}
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {dest.popularAirlines.map((airline) => (
              <div key={airline} className="px-6 py-3 bg-gray-50 rounded-full text-gray-700 font-medium hover:bg-primary-50 hover:text-primary-600 transition-colors">
                {airline}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary-600" />
            Top Things to Do in {dest.name}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dest.highlights.map((highlight, idx) => (
              <div key={idx} className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mb-3">
                  <MapPin className="w-5 h-5 text-primary-600" />
                </div>
                <p className="font-semibold text-gray-900">{highlight}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Travel Tips */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary-600" />
            Money-Saving Tips for {dest.name} Flights
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {dest.travelTips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Book With Us */}
      <section className="py-12 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">
            Why Book Cheap Flights to {dest.name} with Fly2Any?
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-white/5 rounded-2xl backdrop-blur-sm">
              <Shield className="w-10 h-10 text-primary-400 mx-auto mb-3" />
              <h3 className="font-bold mb-2">Best Price Guarantee</h3>
              <p className="text-gray-400 text-sm">We compare 500+ airlines to find you the cheapest flights.</p>
            </div>
            <div className="text-center p-6 bg-white/5 rounded-2xl backdrop-blur-sm">
              <CreditCard className="w-10 h-10 text-green-400 mx-auto mb-3" />
              <h3 className="font-bold mb-2">No Hidden Fees</h3>
              <p className="text-gray-400 text-sm">The price you see is the price you pay. Always.</p>
            </div>
            <div className="text-center p-6 bg-white/5 rounded-2xl backdrop-blur-sm">
              <Users className="w-10 h-10 text-blue-400 mx-auto mb-3" />
              <h3 className="font-bold mb-2">Trusted by Millions</h3>
              <p className="text-gray-400 text-sm">Join thousands of happy travelers worldwide.</p>
            </div>
            <div className="text-center p-6 bg-white/5 rounded-2xl backdrop-blur-sm">
              <Headphones className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
              <h3 className="font-bold mb-2">24/7 Support</h3>
              <p className="text-gray-400 text-sm">Our team is here to help around the clock.</p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center mt-10">
            <Link
              href={`/flights?destination=${dest.code}`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-colors text-lg"
            >
              Search {dest.name} Flights
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Lead Capture */}
      <section className="py-12 bg-gradient-to-r from-primary-500 to-primary-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Get {dest.name} Flight Deals</h2>
          <p className="text-white/90 mb-6">Be first to know about price drops & flash sales. Save up to 40% on {dest.name} flights!</p>
          <form className="flex flex-col md:flex-row gap-3 max-w-2xl mx-auto" onSubmit={(e) => { e.preventDefault(); alert(`Thanks! We'll send you ${dest.name} deals soon.`); }}>
            <input type="email" placeholder="Email address" required className="flex-1 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-white/50" />
            <input type="tel" placeholder="Phone (optional)" className="md:w-48 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-white/50" />
            <button type="submit" className="px-6 py-3 bg-white text-primary-600 font-bold rounded-xl hover:bg-gray-100 transition-colors whitespace-nowrap">Get Alerts</button>
          </form>
          <p className="text-white/70 text-xs mt-3">No spam. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions About {dest.name} Flights
          </h2>
          <div className="bg-gray-50 rounded-2xl p-6">
            {dest.faqs.map((faq, idx) => (
              <FAQItem key={idx} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Finding Cheap Flights to {dest.name}
          </h2>
          <div className="prose prose-gray max-w-none">
            <p>
              Looking for cheap flights to {dest.name}? Fly2Any makes it easy to compare prices from hundreds
              of airlines and find the best deals on {dest.name} flights. Whether you're planning a beach
              vacation, city break, or adventure trip, our AI-powered search finds you the lowest fares.
            </p>
            <p>
              The best time to visit {dest.name} is during {dest.bestTime}. For the cheapest flights, consider
              booking during shoulder season and be flexible with your travel dates. Set up price alerts
              to get notified when fares drop for your preferred travel dates.
            </p>
            <p>
              We compare flights from {dest.popularAirlines.slice(0, 3).join(', ')}, and many more airlines
              serving {dest.airports.map(a => a.code).join(', ')}. Whether you prefer direct flights or
              don't mind connections, we'll find you the best option at the best price.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-primary-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Book Your {dest.name} Adventure?</h2>
          <p className="text-xl text-white/90 mb-8">Compare prices from 500+ airlines and find your perfect flight today.</p>
          <Link
            href={`/flights?destination=${dest.code}`}
            className="inline-flex items-center gap-2 px-10 py-4 bg-white text-primary-600 font-bold rounded-xl hover:bg-gray-100 transition-colors text-lg"
          >
            Search Cheap Flights to {dest.name}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
