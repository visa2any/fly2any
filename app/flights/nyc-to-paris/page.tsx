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

const parisAirports = [
    { code: 'CDG', name: 'Charles de Gaulle Airport', airlines: 85, facilities: 'World-class lounges, TGV trains, luxury shopping' },
    { code: 'ORY', name: 'Orly Airport', airlines: 40, facilities: 'Modern terminals, easy metro access' },
    { code: 'BVA', name: 'Beauvais-Tillé Airport', airlines: 15, facilities: 'Budget-friendly, shuttle services' },
];

const airlines = [
    { name: 'Air France', type: 'Direct', duration: '7h 20m', frequency: 'Daily multiple flights', priceRange: '$620-2,100' },
    { name: 'Delta', type: 'Direct', duration: '7h 20m', frequency: 'Daily', priceRange: '$580-1,900' },
    { name: 'American Airlines', type: 'Direct', duration: '7h 20m', frequency: 'Daily', priceRange: '$550-1,850' },
    { name: 'United', type: '1-stop', duration: '10-14h', frequency: 'Daily', priceRange: '$480-1,600' },
    { name: 'British Airways', type: '1-stop', duration: '10-13h', frequency: 'Daily', priceRange: '$420-1,700' },
    { name: 'Norwegian', type: '1-stop', duration: '11-15h', frequency: 'Several weekly', priceRange: '$420-1,400' },
];

const priceData = {
    economy: { min: 420, avg: 750, max: 1800, unit: 'USD' },
    bestMonths: [
        { month: 'January', avgPrice: 520, savings: '31%' },
        { month: 'February', avgPrice: 490, savings: '35%' },
        { month: 'March', avgPrice: 540, savings: '28%' },
        { month: 'November', avgPrice: 570, savings: '24%' },
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
        title: 'Compare Paris airports',
        description: 'Charles de Gaulle (CDG) offers most direct flights, but Orly (ORY) and Beauvais (BVA) often have better deals, especially with budget carriers.',
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
        title: 'Consider budget airlines',
        description: 'Norwegian and other budget carriers offer 1-stop flights at significantly lower prices. Small layovers in Oslo or Copenhagen can save hundreds.',
        icon: Plane,
        savings: 'Average 20-30% savings',
    },
    {
        title: 'Use flexible dates',
        description: 'Moving your travel by 1-3 days can save $100-300. Paris flight prices are highly sensitive to demand and timing.',
        icon: Info,
        savings: 'Average 12-20% savings',
    },
    {
        title: 'Book in advance',
        description: 'Paris is one of the world\'s busiest routes. Book 5-7 weeks ahead for best prices. Last-minute options are limited and expensive.',
        icon: Star,
        savings: 'Average 10-15% savings',
    },
];

const faqs = [
    {
        question: 'How long is flight from New York to Paris?',
        answer: 'Direct flights from New York to Paris take approximately 7 hours 20 minutes. This is one of the most popular transatlantic routes. One-stop flights typically take 10-15 hours depending on connection cities.'
    },
    {
        question: 'What is cheapest month to fly from NYC to Paris?',
        answer: 'The cheapest months to fly from New York to Paris are January, February, March, and November. These off-peak months offer average prices of $490-570, which is 24-35% lower than peak summer and holiday periods. Avoid July-August and December for best deals.'
    },
    {
        question: 'Which airlines fly direct from New York to Paris?',
        answer: 'Multiple airlines offer direct flights from New York to Paris. Air France and Delta are the primary carriers with multiple daily flights. American Airlines also operates direct services from JFK and Newark to Charles de Gaulle.'
    },
    {
        question: 'How far in advance should I book NYC to Paris flights?',
        answer: 'For best prices on NYC to Paris flights, book 5-7 weeks before departure. Peak seasons (July-August, December holidays) require booking 2-3 months ahead. Last-minute bookings (within 2 weeks) typically cost 12% more. This is a high-demand route with limited last-minute availability.'
    },
    {
        question: 'What is average flight price from NYC to Paris?',
        answer: 'The average economy flight price from New York to Paris is $750 USD. Prices range from $420-570 in off-peak months to $1,200-1,800 during peak seasons. Premium economy averages $1,400-2,200, while business class ranges from $3,000-6,500 depending on airline and season.'
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

export default function NYCToParisPage() {
    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-neutral-50 via-blue-50/20 to-neutral-50 border-b border-neutral-200/60 overflow-hidden">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10 relative">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-xs md:text-sm font-medium text-blue-600 mb-4 md:mb-6 border border-blue-100/50 shadow-sm">
                            <TrendingDown className="w-3 h-3 md:w-4 md:h-4" />
                            Save up to 40% on NYC-Paris flights
                        </div>

                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-4 md:mb-6 text-neutral-900" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.06)' }}>
                            Flights from New York to Paris
                        </h1>

                        <p className="text-sm md:text-base lg:text-lg text-neutral-600 leading-relaxed mb-2 max-w-3xl mx-auto">
                            Compare prices from 500+ airlines and find best deals on NYC to Paris flights. Travelers comparing European hubs may also consider flights from New York to London or Frankfurt depending on schedule flexibility and pricing.
                        </p>

                        <p className="text-xs md:text-sm text-neutral-500 mb-6 md:mb-8 max-w-2xl mx-auto">
                            Fly direct with Air France or save with 1-stop options. Best prices from $420 USD.
                        </p>

                        <p className="text-xs md:text-sm font-semibold text-blue-600 mb-6 md:mb-8">
                            Compare prices now to find your perfect flight
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-xs md:text-sm text-neutral-600">
                            <span className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-neutral-200/50 shadow-sm">
                                <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-500" />
                                7h 20m direct
                            </span>
                            <span className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-neutral-200/50 shadow-sm">
                                <Plane className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-500" />
                                3+ airlines
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
                            Best Time to Book Flights from NYC to Paris
                        </h2>
                        <p className="text-sm md:text-base text-neutral-600 max-w-3xl mx-auto">
                            Strategic booking can save you hundreds. Here's when to book for best prices.
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
                            Cheapest Months to Fly from NYC to Paris
                        </h2>
                        <p className="text-sm md:text-base text-neutral-600 max-w-3xl mx-auto">
                            Plan your trip during these months for best deals on Paris flights.
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
                            Airlines Flying NYC to Paris
                        </h2>
                        <p className="text-sm md:text-base text-neutral-600 max-w-3xl mx-auto">
                            Compare options from major airlines serving this popular transatlantic route.
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
                            Understanding flight times helps you plan better for your Paris trip.
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
                                    <span><strong>Duration:</strong> 7 hours 20 minutes</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Award className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <span><strong>Airlines:</strong> Air France, Delta, American</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Plane className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <span><strong>Aircraft:</strong> Airbus A350, Boeing 777, 787 Dreamliner</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Users className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <span><strong>Frequency:</strong> 3+ daily flights</span>
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
                                    <span><strong>Duration:</strong> 10-15 hours total</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <span><strong>Popular hubs:</strong> Dublin, Amsterdam, Frankfurt, Oslo</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <TrendingDown className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <span><strong>Savings:</strong> 20-35% cheaper than direct</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <span><strong>Layover:</strong> 1-4 hours typical</span>
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
                            NYC vs Paris Airports Comparison
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
                                Paris Area Airports
                            </h3>
                            <div className="space-y-4">
                                {parisAirports.map((airport) => (
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
                            Tips to Find Cheaper NYC to Paris Flights
                        </h2>
                        <p className="text-sm md:text-base text-neutral-600 max-w-3xl mx-auto">
                            Data-driven strategies to save on your Paris trip.
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
                <p className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-sm md:text-base text-neutral-600 leading-relaxed">
                    New York to Paris represents one of the highest-volume transatlantic corridors with consistent annual demand across major carriers. Seasonal fare volatility typically ranges 24-35% between winter lows and summer peaks, driven by leisure travel patterns and business cycle variations. Air France maintains route dominance through joint venture capacity, while competition from Delta, American, and budget carriers creates fare compression during off-peak periods.
                </p>
            </section>

            {/* FAQ Section */}
            <section className="py-8 md:py-12 lg:py-16 bg-white">
                    <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                        <div className="text-center mb-8 md:mb-10">
                            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-neutral-900 mb-2 md:mb-3">
                                Frequently Asked Questions
                            </h2>
                            <p className="text-sm md:text-base text-neutral-600 max-w-2xl mx-auto">
                                Common questions about NYC to Paris flights answered.
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
                            Ready to Book Your NYC to Paris Flight?
                        </h2>
                        <p className="text-base md:text-lg lg:text-xl text-white/90 mb-6 md:mb-8 max-w-2xl mx-auto">
                            Compare prices from 500+ airlines and find your perfect flight today. Save up to 40% with our smart search.
                        </p>
                        <p className="text-sm md:text-base font-semibold mb-6 md:mb-8">
                            Compare prices now to find best deals
                        </p>
                        <Link
                            href="/flights?origin=NYC&destination=PAR"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-neutral-100 transition-all duration-200 text-base md:text-lg shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
                        >
                            Search NYC to Paris Flights
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
