import Link from 'next/link';
import {
    Plane, Calendar, Clock, TrendingDown, MapPin, Award,
    CheckCircle2, ArrowRight, Star, Info, Users
} from 'lucide-react';

const nycAirports = [
    { code: 'JFK', name: 'John F. Kennedy International', airlines: 50, distance: '15 miles from Manhattan' },
    { code: 'EWR', name: 'Newark Liberty International', airlines: 42, distance: '18 miles from Manhattan' },
    { code: 'LGA', name: 'LaGuardia Airport', airlines: 8, distance: '8 miles from Manhattan' },
];

const frankfurtAirports = [
    { code: 'FRA', name: 'Frankfurt Airport', airlines: 75, facilities: 'World-class lounges, ICE trains, duty-free shopping' },
    { code: 'MUC', name: 'Munich Airport', airlines: 60, facilities: 'Modern terminals, S-Bahn connections' },
    { code: 'DUS', name: 'Dusseldorf Airport', airlines: 45, facilities: 'Efficient facilities, railway access' },
];

const airlines = [
    { name: 'Lufthansa', type: 'Direct', duration: '8h 15m', frequency: 'Daily multiple flights', priceRange: '$520-2,000' },
    { name: 'United Airlines', type: 'Direct', duration: '8h 15m', frequency: 'Daily', priceRange: '$480-1,800' },
    { name: 'Delta Air Lines', type: 'Direct', duration: '8h 15m', frequency: 'Daily', priceRange: '$450-1,700' },
    { name: 'Condor', type: 'Direct', duration: '8h 15m', frequency: 'Several weekly', priceRange: '$410-1,600' },
    { name: 'American Airlines', type: '1-stop', duration: '11-15h', frequency: 'Daily', priceRange: '$410-1,500' },
    { name: 'British Airways', type: '1-stop', duration: '11-14h', frequency: 'Daily', priceRange: '$380-1,400' },
];

const priceData = {
    economy: { min: 410, avg: 850, max: 2100, unit: 'USD' },
    bestMonths: [
        { month: 'January', avgPrice: 530, savings: '38%' },
        { month: 'February', avgPrice: 500, savings: '41%' },
        { month: 'March', avgPrice: 550, savings: '35%' },
        { month: 'November', avgPrice: 590, savings: '32%' },
    ],
    bookingWindow: {
        bestTime: '5-7 weeks before departure',
        lastMinute: '+12% higher prices',
        earlyBooking: '2-3 months for peak seasons',
    },
};

const bookingTips = [
    {
        title: 'Book mid-week flights',
        description: 'Tuesday and Wednesday departures typically offer the lowest fares. Weekend flights (Friday-Sunday) cost 15-25% more on this popular route.',
        icon: Calendar,
        savings: 'Average 15-20% savings',
    },
    {
        title: 'Compare Frankfurt airports',
        description: 'Frankfurt Airport (FRA) offers most direct flights, but Munich (MUC) and Dusseldorf (DUS) often have competitive deals, especially with connecting carriers.',
        icon: MapPin,
        savings: 'Average 10-18% savings',
    },
    {
        title: 'Fly off-peak seasons',
        description: 'Avoid July-August and December holidays. January-February and November offer the lowest prices with fewer crowds.',
        icon: TrendingDown,
        savings: 'Average 25-35% savings',
    },
    {
        title: 'Consider 1-stop flights',
        description: 'Connecting flights via major European hubs like Munich or Amsterdam offer competitive prices. Layovers of 2-3 hours can provide significant savings.',
        icon: Plane,
        savings: 'Average 20-30% savings',
    },
    {
        title: 'Use flexible dates',
        description: 'Moving your travel by 1-3 days can save $150-400. Frankfurt flight prices are highly sensitive to demand and timing.',
        icon: Info,
        savings: 'Average 12-20% savings',
    },
    {
        title: 'Book in advance',
        description: 'Frankfurt is one of Europe\'s busiest business hubs. Book 5-7 weeks ahead for best prices. Last-minute options are limited and expensive.',
        icon: Star,
        savings: 'Average 10-15% savings',
    },
];

const faqs = [
    {
        question: 'How long is flight from New York to Frankfurt?',
        answer: 'Direct flights from New York to Frankfurt take approximately 8 hours 15 minutes. This is a popular transatlantic business route. One-stop flights typically take 11-15 hours depending on connection cities.'
    },
    {
        question: 'What is cheapest month to fly from NYC to Frankfurt?',
        answer: 'The cheapest months to fly from New York to Frankfurt are January, February, March, and November. These off-peak months offer average prices of $500-590, which is 32-41% lower than peak summer and holiday periods. Avoid July-August and December for best deals.'
    },
    {
        question: 'Which airlines fly direct from New York to Frankfurt?',
        answer: 'Multiple airlines offer direct flights from New York to Frankfurt. Lufthansa is the primary carrier with multiple daily flights. United Airlines and Delta Air Lines also operate direct services from JFK and Newark to Frankfurt.'
    },
    {
        question: 'How far in advance should I book NYC to Frankfurt flights?',
        answer: 'For best prices on NYC to Frankfurt flights, book 5-7 weeks before departure. Peak seasons (July-August, December holidays) require booking 2-3 months ahead. Last-minute bookings (within 2 weeks) typically cost 12% more. This is a high-demand business route with limited last-minute availability.'
    },
    {
        question: 'What is average flight price from NYC to Frankfurt?',
        answer: 'The average economy flight price from New York to Frankfurt is $850 USD. Prices range from $410-590 in off-peak months to $1,500-2,100 during peak seasons. Premium economy averages $1,500-2,300, while business class ranges from $3,000-6,500 depending on airline and season.'
    },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
    return (
        <div className="border-b border-neutral-200/60 last:border-0">
            <details className="group py-4 md:py-5">
                <summary className="cursor-pointer font-semibold text-neutral-900 pr-4 text-sm md:text-base lg:text-lg leading-snug hover:text-primary-600 transition-colors list-none flex items-start justify-between">
                    {question}
                    <span className="text-neutral-500 group-hover:text-primary-500 transition-colors flex-shrink-0 mt-0.5">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </span>
                </summary>
                <div className="pb-4 md:pb-5 text-neutral-600 text-sm md:text-base leading-relaxed mt-2">
                    {answer}
                </div>
            </details>
        </div>
    );
}

export default function NYCToFrankfurtPage() {
    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-neutral-50 via-blue-50/20 to-neutral-50 border-b border-neutral-200/60 overflow-hidden">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10 relative">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-xs md:text-sm font-medium text-blue-600 mb-4 md:mb-6 border border-blue-100/50 shadow-sm">
                            <TrendingDown className="w-3 h-3 md:w-4 md:h-4" />
                            Save up to 40% on NYC-Frankfurt flights
                        </div>

                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-4 md:mb-6 text-neutral-900" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.06)' }}>
                            Flights from New York to Frankfurt
                        </h1>

                        <p className="text-sm md:text-base lg:text-lg text-neutral-600 leading-relaxed mb-2 max-w-3xl mx-auto">
                            Compare prices from 500+ airlines and find best deals on NYC to Frankfurt flights. Travelers comparing European hubs may also consider flights from New York to <Link href="/flights/nyc-to-london" className="text-blue-600 hover:text-blue-700 underline">London</Link> or <Link href="/flights/nyc-to-paris" className="text-blue-600 hover:text-blue-700 underline">Paris</Link> depending on schedule flexibility and pricing.
                        </p>

                        <p className="text-xs md:text-sm text-neutral-500 mb-6 md:mb-8 max-w-2xl mx-auto">
                            Fly direct with Lufthansa or save with 1-stop options. Best prices from $410 USD.
                        </p>

                        <p className="text-xs md:text-sm font-semibold text-blue-600 mb-6 md:mb-8">
                            Compare prices now to find your perfect flight
                        </p>

                        <p className="text-xs md:text-sm text-neutral-500 mb-4 md:mb-6 max-w-2xl mx-auto">
                            Prices shown are based on recent fare searches and historical pricing data from past 12 months.
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-xs md:text-sm text-neutral-600">
                            <span className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-neutral-200/50 shadow-sm">
                                <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-500" />
                                8h 15m direct
                            </span>
                            <span className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-neutral-200/50 shadow-sm">
                                <Plane className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-500" />
                                4+ airlines
                            </span>
                            <span className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-neutral-200/50 shadow-sm">
                                <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-500" />
                                Daily flights
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Best Time to Book Section */}
            <section className="py-8 md:py-12 lg:py-16 bg-white">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    <div className="text-center mb-8 md:mb-10">
                        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-neutral-900 mb-2 md:mb-3">
                            Best Time to Book Flights from NYC to Frankfurt
                        </h2>
                        <p className="text-sm md:text-base text-neutral-600 max-w-3xl mx-auto">
                            Strategic booking can save you hundreds. Here's when to book for best prices. Historical data shows NYC to Frankfurt fares typically increase 8-14% within 2-3 weeks of departure.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 md:p-8 border border-blue-100/50 shadow-sm hover:shadow-md transition-all duration-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
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
                                    <span><strong>Best time:</strong> 5-7 weeks before departure</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span><strong>Peak seasons:</strong> Book 2-3 months ahead</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span><strong>Last-minute:</strong> +12% higher prices</span>
                                </li>
                            </ul>
                        </div>

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
                                    <span><strong>Peak:</strong> $1,000-$1,600 (July, Dec)</span>
                                </li>
                            </ul>
                        </div>

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
                                    <span><strong>Tuesday-Wednesday:</strong> 15-20% cheaper</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span><strong>Midday flights:</strong> Often lower fares</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span><strong>Avoid weekends:</strong> +15-25% higher</span>
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
                            Cheapest Months to Fly from NYC to Frankfurt
                        </h2>
                        <p className="text-sm md:text-base text-neutral-600 max-w-3xl mx-auto">
                            Plan your trip during these months for best deals on Frankfurt flights.
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
                                <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1">
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
                            Airlines Flying NYC to Frankfurt
                        </h2>
                        <p className="text-sm md:text-base text-neutral-600 max-w-3xl mx-auto">
                            Compare options from major airlines serving this popular transatlantic business route.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {airlines.map((airline) => (
                            <div
                                key={airline.name}
                                className="bg-neutral-50 rounded-2xl p-5 md:p-6 border border-neutral-200/60 hover:border-blue-300 hover:shadow-lg transition-all duration-200 group"
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
                                        <TrendingDown className="w-4 h-4 text-blue-500" />
                                        <span className="font-semibold text-blue-600">{airline.priceRange}</span>
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
                            Understanding flight times helps you plan better for your Frankfurt trip.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl p-6 md:p-8 border border-neutral-200/60 shadow-sm">
                            <h3 className="text-lg md:text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                                <Plane className="w-5 h-5 text-blue-500" />
                                Direct Flights
                            </h3>
                            <ul className="space-y-3 text-sm md:text-base text-neutral-700">
                                <li className="flex items-start gap-2">
                                    <Clock className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <span><strong>Duration:</strong> 8 hours 15 minutes</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Award className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <span><strong>Airlines:</strong> Lufthansa, United, Delta Air Lines, Condor</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Plane className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <span><strong>Aircraft:</strong> Boeing 777, 787 Dreamliner, Airbus A350</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Users className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <span><strong>Frequency:</strong> 4+ daily flights</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-2xl p-6 md:p-8 border border-neutral-200/60 shadow-sm">
                            <h3 className="text-lg md:text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-blue-500" />
                                One-Stop Flights
                            </h3>
                            <ul className="space-y-3 text-sm md:text-base text-neutral-700">
                                <li className="flex items-start gap-2">
                                    <Clock className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <span><strong>Duration:</strong> 11-15 hours total</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <span><strong>Popular hubs:</strong> Munich, Amsterdam, London</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <TrendingDown className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <span><strong>Savings:</strong> 20-35% cheaper than direct</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <span><strong>Layover:</strong> 2-4 hours typical</span>
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
                            NYC vs Frankfurt Airports Comparison
                        </h2>
                        <p className="text-sm md:text-base text-neutral-600 max-w-3xl mx-auto">
                            Know your airport options to find best deals and convenience.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg md:text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-blue-500" />
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
                                                    <span className="text-xl font-bold text-blue-600">{airport.code}</span>
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

                        <div>
                            <h3 className="text-lg md:text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-blue-500" />
                                Frankfurt Area Airports
                            </h3>
                            <div className="space-y-4">
                                {frankfurtAirports.map((airport) => (
                                    <div
                                        key={airport.code}
                                        className="bg-neutral-50 rounded-xl p-5 border border-neutral-200/60"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl font-bold text-blue-600">{airport.code}</span>
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
            <section className="py-8 md:py-12 lg:py-16 bg-gradient-to-br from-blue-50 to-white">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    <div className="text-center mb-8 md:mb-10">
                        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-neutral-900 mb-2 md:mb-3">
                            Tips to Find Cheaper NYC to Frankfurt Flights
                        </h2>
                        <p className="text-sm md:text-base text-neutral-600 max-w-3xl mx-auto">
                            Data-driven strategies to save on your Frankfurt trip.
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
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                                            <IconComponent className="w-5 h-5 text-blue-600" />
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

            <p className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-sm md:text-base text-neutral-600 leading-relaxed">
                New York to Frankfurt represents a major transatlantic business corridor with significant corporate travel demand and airline capacity controlled by Lufthansa joint ventures. Seasonal fare volatility typically ranges 32-41% between winter lows and summer peaks, while competition from United, Delta, and Condor creates price compression during off-peak periods.
            </p>

            {/* FAQ Section */}
            <section className="py-8 md:py-12 lg:py-16 bg-white">
                <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    <div className="text-center mb-8 md:mb-10">
                        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-neutral-900 mb-2 md:mb-3">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-sm md:text-base text-neutral-600 max-w-2xl mx-auto">
                            Common questions about NYC to Frankfurt flights answered.
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
            <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
                <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6">
                        Ready to Book Your NYC to Frankfurt Flight?
                    </h2>
                    <p className="text-base md:text-lg lg:text-xl text-white/90 mb-6 md:mb-8 max-w-2xl mx-auto">
                        Compare prices from 500+ airlines and find your perfect flight today. Save up to 40% with our smart search.
                    </p>
                    <p className="text-sm md:text-base font-semibold mb-6 md:mb-8">
                        Compare prices now to find best deals
                    </p>
                    <Link
                        href="/flights?origin=NYC&destination=FRA"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-neutral-100 transition-all duration-200 text-base md:text-lg shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
                    >
                        Search NYC to Frankfurt Flights
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
