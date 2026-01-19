'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Plane, Calendar, Clock, TrendingDown, MapPin, Award,
    Shield, CheckCircle2, ChevronDown, ChevronUp, ArrowRight,
    Star, Info, Users
} from 'lucide-react';

const nycAirports = [
    { code: 'JFK', name: 'John F. Kennedy International', airlines: 45, distance: '15 miles from Manhattan' },
    { code: 'EWR', name: 'Newark Liberty International', airlines: 38, distance: '18 miles from Manhattan' },
    { code: 'LGA', name: 'LaGuardia Airport', airlines: 12, distance: '8 miles from Manhattan' },
];

const dubaiAirports = [
    { code: 'DXB', name: 'Dubai International Airport', airlines: 90, facilities: 'World-class lounges, duty-free, spas' },
];

const airlines = [
    { name: 'Emirates', type: 'Direct', duration: '12h 30m', frequency: 'Daily multiple flights', priceRange: '$800-2,500' },
    { name: 'Delta', type: '1-stop', duration: '15-18h', frequency: 'Daily', priceRange: '$650-1,800' },
    { name: 'United', type: '1-stop', duration: '15-18h', frequency: 'Daily', priceRange: '$700-1,900' },
    { name: 'American Airlines', type: '1-stop', duration: '16-20h', frequency: 'Daily', priceRange: '$680-2,000' },
    { name: 'Qatar Airways', type: '1-stop (DOH)', duration: '16-19h', frequency: 'Daily', priceRange: '$750-2,200' },
    { name: 'Etihad Airways', type: '1-stop (AUH)', duration: '16-19h', frequency: 'Daily', priceRange: '$720-2,100' },
];

const priceData = {
    economy: { min: 620, avg: 950, max: 1800, unit: 'USD' },
    bestMonths: [
        { month: 'January', avgPrice: 720, savings: '24%' },
        { month: 'February', avgPrice: 680, savings: '28%' },
        { month: 'September', avgPrice: 750, savings: '21%' },
        { month: 'October', avgPrice: 700, savings: '26%' },
    ],
    bookingWindow: {
        bestTime: '6-8 weeks before departure',
        lastMinute: '+15% higher prices',
        earlyBooking: '2-4 months for peak seasons',
    },
};

const bookingTips = [
    {
        title: 'Book on Tuesday-Thursday',
        description: 'Airlines release fare sales on Monday evenings. Tuesday-Thursday mornings typically show lower prices from Monday sales.',
        icon: Calendar,
        savings: 'Average 8-12% savings',
    },
    {
        title: 'Use flexible date search',
        description: 'Moving your departure or return by 1-3 days can save $150-400. Tuesday and Wednesday departures are often cheapest.',
        icon: TrendingDown,
        savings: 'Average 15-25% savings',
    },
    {
        title: 'Compare all NYC airports',
        description: 'Check JFK, Newark (EWR), and LaGuardia (LGA). EWR often has better deals on United and Emirates.',
        icon: MapPin,
        savings: 'Average 10-15% savings',
    },
    {
        title: 'Consider 1-stop flights',
        description: 'Direct flights with Emirates are convenient but cost 20-35% more. One-stop options via Doha, Abu Dhabi, or Istanbul offer significant savings.',
        icon: Plane,
        savings: 'Average 20-35% savings',
    },
    {
        title: 'Set price alerts',
        description: 'Enable price tracking to receive notifications when fares drop. Dubai flight prices can fluctuate $200-500 weekly.',
        icon: Info,
        savings: 'Average 12-18% savings',
    },
    {
        title: 'Clear browser cookies',
        description: 'Airlines may track searches and adjust prices. Use incognito mode or clear cookies before final bookings.',
        icon: Shield,
        savings: 'Average 5-8% savings',
    },
];

const faqs = [
    {
        question: 'How long is flight from New York to Dubai?',
        answer: 'Direct flights from New York (JFK) to Dubai (DXB) take approximately 12 hours 30 minutes. One-stop flights typically take 15-20 hours depending on connection city and layover duration. Emirates operates most direct flights on this route.'
    },
    {
        question: 'What is cheapest month to fly from NYC to Dubai?',
        answer: 'The cheapest months to fly from New York to Dubai are January, February, September, and October. These shoulder season months offer average prices of $680-750, which is 20-28% lower than peak summer and holiday periods. Avoid June-August and December for the best prices.'
    },
    {
        question: 'Which airlines fly direct from New York to Dubai?',
        answer: 'Emirates is only airline offering direct flights from New York (JFK) to Dubai (DXB). They operate multiple daily flights on Boeing 777 and Airbus A380 aircraft. The flight time is 12 hours 30 minutes. Most other airlines require one connection through their hubs.'
    },
    {
        question: 'How far in advance should I book NYC to Dubai flights?',
        answer: 'For best prices, book NYC to Dubai flights 6-8 weeks before departure. Peak seasons (December, summer holidays) require booking 2-4 months ahead. Last-minute bookings (within 2 weeks) typically cost 15% more. Tuesday-Thursday bookings often show lower prices.'
    },
    {
        question: 'What is average flight price from NYC to Dubai?',
        answer: 'The average economy flight price from New York to Dubai is $950 USD. Prices range from $620-800 in off-peak months to $1,200-1,800 during peak seasons. Premium economy averages $1,800-2,500, while business class ranges from $4,000-8,000 depending on airline and season.'
    },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-neutral-200/60 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-4 md:py-5 flex items-start justify-between text-left hover:bg-neutral-50/50 transition-all duration-200 group"
            >
                <span className="font-semibold text-neutral-900 pr-4 text-sm md:text-base lg:text-lg leading-snug">
                    {question}
                </span>
                {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-neutral-500 flex-shrink-0 mt-0.5" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-neutral-500 flex-shrink-0 mt-0.5 group-hover:text-primary-500 transition-colors" />
                )}
            </button>
            {isOpen && (
                <div className="pb-4 md:pb-5 text-neutral-600 text-sm md:text-base leading-relaxed">
                    {answer}
                </div>
            )}
        </div>
    );
}

export default function NYCToDubaiPage() {
    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Hero Section - Level-6 Ultra Premium */}
            <section className="relative bg-gradient-to-br from-neutral-50 via-primary-50/20 to-neutral-50 border-b border-neutral-200/60 overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="floating-orb floating-orb-1"></div>
                    <div className="floating-orb floating-orb-2"></div>
                    <div className="floating-orb floating-orb-3"></div>
                </div>

                {/* Subtle Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.02]" style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, #E74035 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }}></div>

                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10 relative">
                    {/* Hero Content - Text Only */}
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-xs md:text-sm font-medium text-primary-600 mb-4 md:mb-6 border border-primary-100/50 shadow-sm">
                            <TrendingDown className="w-3 h-3 md:w-4 md:h-4" />
                            Save up to 40% on NYC-Dubai flights
                        </div>

                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-4 md:mb-6 text-neutral-900" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.06)' }}>
                            Flights from New York to Dubai
                        </h1>

                        <p className="text-sm md:text-base lg:text-lg text-neutral-600 leading-relaxed mb-2 max-w-3xl mx-auto">
                            Compare prices from 500+ airlines and find best deals on NYC to Dubai flights.
                        </p>

                        <p className="text-xs md:text-sm text-neutral-500 mb-6 md:mb-8 max-w-2xl mx-auto">
                            Book direct flights with Emirates or save with 1-stop options. Best prices from $680 USD.
                        </p>

                        {/* Soft CTA Text Only */}
                        <p className="text-xs md:text-sm font-semibold text-primary-600 mb-6 md:mb-8">
                            Compare prices now to find your perfect flight
                        </p>

                        {/* Quick Stats - Trust Signals */}
                        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-xs md:text-sm text-neutral-600">
                            <span className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-neutral-200/50 shadow-sm">
                                <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary-500" />
                                12h 30m direct
                            </span>
                            <span className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-neutral-200/50 shadow-sm">
                                <Plane className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary-500" />
                                6+ airlines
                            </span>
                            <span className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-neutral-200/50 shadow-sm">
                                <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary-500" />
                                Daily flights
                            </span>
                        </div>
                    </div>
                </div>

                {/* Inline Styles for Animations */}
                <style jsx>{`
          .floating-orb { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.12; animation: float 20s ease-in-out infinite; z-index: 0; }
          .floating-orb-1 { width: 200px; height: 200px; background: linear-gradient(135deg, #E74035, #F7C928); top: -80px; left: 5%; animation-delay: 0s; animation-duration: 25s; }
          .floating-orb-2 { width: 180px; height: 180px; background: linear-gradient(135deg, #D63B34, #E74035); top: -60px; right: 10%; animation-delay: 5s; animation-duration: 30s; }
          .floating-orb-3 { width: 150px; height: 150px; background: linear-gradient(135deg, #F7C928, #E74035); bottom: -50px; left: 50%; animation-delay: 10s; animation-duration: 28s; }
          @media (min-width: 768px) {
            .floating-orb-1 { width: 300px; height: 300px; top: -150px; left: 10%; }
            .floating-orb-2 { width: 250px; height: 250px; top: -100px; right: 15%; }
            .floating-orb-3 { width: 200px; height: 200px; bottom: -100px; }
          }
          @keyframes float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(10px, -8px) scale(1.02); }
            50% { transform: translate(-8px, 5px) scale(0.98); }
            75% { transform: translate(6px, -6px) scale(1.01); }
          }
        `}</style>
            </section>

            {/* Best Time to Book Section */}
            <section className="py-8 md:py-12 lg:py-16 bg-white">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    <div className="text-center mb-8 md:mb-10">
                        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-neutral-900 mb-2 md:mb-3">
                            Best Time to Book Flights from NYC to Dubai
                        </h2>
                        <p className="text-sm md:text-base text-neutral-600 max-w-3xl mx-auto">
                            Strategic booking can save you hundreds. Here's when to book for best prices.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Booking Window Card */}
                        <div className="bg-gradient-to-br from-primary-50 to-white rounded-2xl p-6 md:p-8 border border-primary-100/50 shadow-sm hover:shadow-md transition-all duration-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <Calendar className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-neutral-900">Booking Window</h3>
                                    <p className="text-xs md:text-sm text-neutral-600">Optimal timing</p>
                                </div>
                            </div>
                            <ul className="space-y-3 text-sm md:text-base text-neutral-700">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span><strong>Best time:</strong> 6-8 weeks before departure</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span><strong>Peak seasons:</strong> Book 2-4 months ahead</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span><strong>Last-minute:</strong> +15% higher prices</span>
                                </li>
                            </ul>
                        </div>

                        {/* Price Data Card */}
                        <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-6 md:p-8 border border-green-100/50 shadow-sm hover:shadow-md transition-all duration-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <TrendingDown className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-neutral-900">Average Prices</h3>
                                    <p className="text-xs md:text-sm text-neutral-600">Economy class</p>
                                </div>
                            </div>
                            <ul className="space-y-3 text-sm md:text-base text-neutral-700">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span><strong>Average:</strong> ${priceData.economy.avg} USD</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span><strong>Range:</strong> ${priceData.economy.min}-${priceData.economy.max}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span><strong>Peak:</strong> $1,200-$1,800 (Dec, summer)</span>
                                </li>
                            </ul>
                        </div>

                        {/* Best Days Card */}
                        <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl p-6 md:p-8 border border-amber-100/50 shadow-sm hover:shadow-md transition-all duration-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <Star className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-neutral-900">Best Days</h3>
                                    <p className="text-xs md:text-sm text-neutral-600">For lowest fares</p>
                                </div>
                            </div>
                            <ul className="space-y-3 text-sm md:text-base text-neutral-700">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span><strong>Tuesday-Thursday:</strong> 8-12% cheaper</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span><strong>Morning flights:</strong> Often lower fares</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span><strong>Avoid weekends:</strong> +15-20% higher</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Cheapest Months Section */}
            <section className="py-8 md:py-12 lg:py-16 bg-neutral-50">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    <div className="text-center mb-8 md:mb-10">
                        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-neutral-900 mb-2 md:mb-3">
                            Cheapest Months to Fly from NYC to Dubai
                        </h2>
                        <p className="text-sm md:text-base text-neutral-600 max-w-3xl mx-auto">
                            Plan your trip during these months for best deals on Dubai flights.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {priceData.bestMonths.map((month) => (
                            <div
                                key={month.month}
                                className="bg-white rounded-2xl p-5 md:p-6 border border-neutral-200/60 shadow-sm hover:shadow-lg transition-all duration-200 group hover:-translate-y-1"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg md:text-xl font-bold text-neutral-900">{month.month}</h3>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs md:text-sm font-semibold rounded-full">
                                        <TrendingDown className="w-3 h-3" />
                                        {month.savings} off
                                    </span>
                                </div>
                                <div className="text-2xl md:text-3xl font-bold text-primary-600 mb-1">
                                    ${month.avgPrice}
                                </div>
                                <p className="text-xs md:text-sm text-neutral-500">Average price</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Airlines Section */}
            <section className="py-8 md:py-12 lg:py-16 bg-white">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    <div className="text-center mb-8 md:mb-10">
                        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-neutral-900 mb-2 md:mb-3">
                            Airlines Flying NYC to Dubai
                        </h2>
                        <p className="text-sm md:text-base text-neutral-600 max-w-3xl mx-auto">
                            Compare options from major airlines serving this route.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {airlines.map((airline) => (
                            <div
                                key={airline.name}
                                className="bg-neutral-50 rounded-2xl p-5 md:p-6 border border-neutral-200/60 hover:border-primary-300 hover:shadow-lg transition-all duration-200 group"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-base md:text-lg font-bold text-neutral-900">{airline.name}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs md:text-sm font-semibold ${airline.type === 'Direct'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-neutral-200 text-neutral-700'
                                        }`}>
                                        {airline.type}
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm md:text-base">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-neutral-500" />
                                        <span className="text-neutral-700">{airline.duration}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Plane className="w-4 h-4 text-neutral-500" />
                                        <span className="text-neutral-700">{airline.frequency}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <TrendingDown className="w-4 h-4 text-primary-500" />
                                        <span className="font-semibold text-primary-600">{airline.priceRange}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Flight Duration & Layover Section */}
            <section className="py-8 md:py-12 lg:py-16 bg-neutral-50">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    <div className="text-center mb-8 md:mb-10">
                        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-neutral-900 mb-2 md:mb-3">
                            Flight Duration & Layover Insights
                        </h2>
                        <p className="text-sm md:text-base text-neutral-600 max-w-3xl mx-auto">
                            Understanding flight times helps you plan better.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl p-6 md:p-8 border border-neutral-200/60 shadow-sm">
                            <h3 className="text-lg md:text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                                <Plane className="w-5 h-5 text-primary-500" />
                                Direct Flights
                            </h3>
                            <ul className="space-y-3 text-sm md:text-base text-neutral-700">
                                <li className="flex items-start gap-2">
                                    <Clock className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                                    <span><strong>Duration:</strong> 12 hours 30 minutes</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Award className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                                    <span><strong>Airline:</strong> Emirates (JFK to DXB)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Plane className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                                    <span><strong>Aircraft:</strong> Boeing 777 or Airbus A380</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Users className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                                    <span><strong>Frequency:</strong> Multiple daily flights</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-2xl p-6 md:p-8 border border-neutral-200/60 shadow-sm">
                            <h3 className="text-lg md:text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-primary-500" />
                                One-Stop Flights
                            </h3>
                            <ul className="space-y-3 text-sm md:text-base text-neutral-700">
                                <li className="flex items-start gap-2">
                                    <Clock className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                                    <span><strong>Duration:</strong> 15-20 hours total</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                                    <span><strong>Popular hubs:</strong> Doha, Abu Dhabi, Istanbul</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <TrendingDown className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                                    <span><strong>Savings:</strong> 20-35% cheaper than direct</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Info className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                                    <span><strong>Layover:</strong> 2-6 hours typical</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Airports Comparison Section */}
            <section className="py-8 md:py-12 lg:py-16 bg-white">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    <div className="text-center mb-8 md:mb-10">
                        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-neutral-900 mb-2 md:mb-3">
                            NYC vs Dubai Airports Comparison
                        </h2>
                        <p className="text-sm md:text-base text-neutral-600 max-w-3xl mx-auto">
                            Know your airport options to find best deals and convenience.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* NYC Airports */}
                        <div>
                            <h3 className="text-lg md:text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-primary-500" />
                                New York Area Airports
                            </h3>
                            <div className="space-y-4">
                                {nycAirports.map((airport) => (
                                    <div
                                        key={airport.code}
                                        className="bg-neutral-50 rounded-xl p-5 border border-neutral-200/60"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl font-bold text-primary-600">{airport.code}</span>
                                                    <span className="text-xs md:text-sm font-semibold text-neutral-900">{airport.name}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-1 text-sm md:text-base text-neutral-600">
                                            <p>{airport.airlines}+ airlines serving this airport</p>
                                            <p>{airport.distance}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Dubai Airports */}
                        <div>
                            <h3 className="text-lg md:text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-primary-500" />
                                Dubai International Airport
                            </h3>
                            <div className="space-y-4">
                                {dubaiAirports.map((airport) => (
                                    <div
                                        key={airport.code}
                                        className="bg-neutral-50 rounded-xl p-5 border border-neutral-200/60"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl font-bold text-primary-600">{airport.code}</span>
                                                    <span className="text-xs md:text-sm font-semibold text-neutral-900">{airport.name}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-1 text-sm md:text-base text-neutral-600">
                                            <p>{airport.airlines}+ airlines serving this airport</p>
                                            <p>{airport.facilities}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tips Section */}
            <section className="py-8 md:py-12 lg:py-16 bg-gradient-to-br from-primary-50 to-white">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    <div className="text-center mb-8 md:mb-10">
                        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-neutral-900 mb-2 md:mb-3">
                            Tips to Find Cheaper NYC to Dubai Flights
                        </h2>
                        <p className="text-sm md:text-base text-neutral-600 max-w-3xl mx-auto">
                            Data-driven strategies to save on your Dubai trip.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {bookingTips.map((tip, idx) => {
                            const IconComponent = tip.icon;
                            return (
                                <div
                                    key={idx}
                                    className="bg-white rounded-2xl p-5 md:p-6 border border-neutral-200/60 shadow-sm hover:shadow-lg transition-all duration-200 group hover:-translate-y-1"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary-200 transition-colors">
                                            <IconComponent className="w-5 h-5 text-primary-600" />
                                        </div>
                                        <h3 className="text-base md:text-lg font-bold text-neutral-900">{tip.title}</h3>
                                    </div>
                                    <p className="text-sm md:text-base text-neutral-600 mb-3 leading-relaxed">
                                        {tip.description}
                                    </p>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 text-xs md:text-sm font-semibold rounded-full">
                                        <TrendingDown className="w-3 h-3" />
                                        {tip.savings}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-8 md:py-12 lg:py-16 bg-white">
                <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    <div className="text-center mb-8 md:mb-10">
                        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-neutral-900 mb-2 md:mb-3">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-sm md:text-base text-neutral-600 max-w-2xl mx-auto">
                            Common questions about NYC to Dubai flights answered.
                        </p>
                    </div>

                    <div className="bg-neutral-50 rounded-2xl p-6 md:p-8 border border-neutral-200/60 shadow-sm">
                        {faqs.map((faq, idx) => (
                            <FAQItem key={idx} question={faq.question} answer={faq.answer} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
                <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6">
                        Ready to Book Your NYC to Dubai Flight?
                    </h2>
                    <p className="text-base md:text-lg lg:text-xl text-white/90 mb-6 md:mb-8 max-w-2xl mx-auto">
                        Compare prices from 500+ airlines and find your perfect flight today. Save up to 40% with our smart search.
                    </p>
                    <p className="text-sm md:text-base font-semibold mb-6 md:mb-8">
                        Compare prices now to find best deals
                    </p>
                    <Link
                        href="/flights?origin=NYC&destination=DXB"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 font-bold rounded-xl hover:bg-neutral-100 transition-all duration-200 text-base md:text-lg shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
                    >
                        Search NYC to Dubai Flights
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            {/* Structured Data - FAQ Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        mainEntity: faqs.map(faq => ({
                            '@type': 'Question',
                            name: faq.question,
                            acceptedAnswer: {
                                '@type': 'Answer',
                                text: faq.answer
                            }
                        }))
                    })
                }}
            />
        </div>
    );
}
