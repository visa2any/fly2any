'use client';

import { useState, useEffect } from 'react';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import { MobileHomeSearchWrapper } from '@/components/home/MobileHomeSearchWrapper';
import { CompactTrustBar } from '@/components/conversion/CompactTrustBar';

export default function NYCtoDubaiPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="min-h-screen bg-neutral-50">
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    "mainEntity": [
                        {
                            "@type": "Question",
                            "name": "What is the cheapest month to fly from New York to Dubai?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "The cheapest months to fly from New York to Dubai are typically September, October, and November. During these months, average economy fares range from $650-$800, which is 25-35% lower than peak season prices."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "How long is the flight from NYC to Dubai?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Direct flights from New York (JFK) to Dubai (DXB) take approximately 12-13 hours. Flights with one layover typically range from 15-20 hours depending on the connection city and layover duration."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "Which airlines fly direct from New York to Dubai?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Emirates offers direct flights from JFK to Dubai. Other airlines with one-stop connections include Qatar Airways, Etihad Airways, Turkish Airlines, and Delta Air Lines, among others."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "How far in advance should I book NYC to Dubai flights?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "For the best prices on NYC to Dubai flights, book 6-12 weeks in advance. Last-minute bookings (within 2 weeks) typically cost 40-60% more than advance purchases."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "What airports serve New York and Dubai?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "New York is served by three major airports: John F. Kennedy International (JFK), LaGuardia (LGA), and Newark Liberty International (EWR). Dubai is served by Dubai International Airport (DXB). Most flights to Dubai depart from JFK due to its international connections."
                            }
                        }
                    ]
                })
            }}></script>

            <style jsx>{`
        .hero-title {
          color: #E74035;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(231, 64, 53, 0.12);
          position: relative;
          z-index: 10;
          transform: translateZ(0);
          backface-visibility: hidden;
          isolation: isolate;
          font-weight: 800;
          letter-spacing: 0.01em;
        }
        .letter-elastic {
          opacity: 0;
          animation: elasticLetterEntrance 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          transform-origin: center center;
          position: relative;
          z-index: 1;
          backface-visibility: hidden;
        }
        @keyframes elasticLetterEntrance {
          0% { opacity: 0; transform: translateY(-5px) scale(0.9) translateZ(0); }
          100% { opacity: 1; transform: translateY(0) scale(1) translateZ(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .letter-elastic { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
        }
        .cta-link {
          color: #E74035;
          font-weight: 600;
          text-decoration: none;
          border-bottom: 2px solid #E74035;
          transition: all 0.15s ease;
        }
        .cta-link:hover {
          color: #D63B34;
          border-bottom-color: #D63B34;
        }
      `}</style>

            {/* Hero Section - Level-6 Fly2Any Brand Theme */}
            <div className="relative bg-gradient-to-br from-neutral-50 via-primary-50/20 to-neutral-50 border-b border-neutral-200/60 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="floating-orb floating-orb-1"></div>
                    <div className="floating-orb floating-orb-2"></div>
                    <div className="floating-orb floating-orb-3"></div>
                </div>

                <div className="absolute inset-0 opacity-[0.02]" style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, #E74035 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }}></div>

                <MaxWidthContainer className="relative" noPadding={true}>
                    <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
                        <h1 className="hero-title text-[13px] sm:text-lg md:text-3xl lg:text-[36px] font-extrabold tracking-[0.01em] leading-tight mb-3 md:mb-4 animate-fadeIn">
                            {mounted ? 'Cheap Flights from New York to Dubai'.split('').map((char, index) => (
                                <span key={index} className="letter-elastic" style={{ animationDelay: `${index * 0.038}s`, display: 'inline-block', minWidth: char === ' ' ? '0.3em' : 'auto' }}>
                                    {char === ' ' ? '\u00A0' : char}
                                </span>
                            )) : <span style={{ opacity: 0 }}>Cheap Flights from New York to Dubai</span>}
                        </h1>
                        <p className="text-neutral-600 font-medium text-[11px] sm:text-sm md:text-base lg:text-lg leading-relaxed tracking-[0.01em] animate-fadeIn">
                            Save up to $400 on flights from NYC airports to Dubai. Compare prices across 100+ airlines and find the best deals for your journey.
                        </p>
                        <p className="text-primary-600 font-semibold text-[11px] sm:text-sm md:text-base mt-2 md:mt-3 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                            Compare prices now to find your perfect flight
                        </p>
                    </div>
                </MaxWidthContainer>
            </div>

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
        @media (prefers-reduced-motion: reduce) {
          .floating-orb { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
        }
      `}</style>

            {/* Search Bar */}
            <div className="border-b border-neutral-100">
                <MobileHomeSearchWrapper lang="en" />
            </div>

            {/* Compact Trust Bar */}
            <CompactTrustBar sticky />

            {/* Main Content - Level-6 Spacing */}
            <div className="py-4 md:py-8 lg:py-12">
                <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
                    <div className="px-3 md:px-0">

                        {/* Best Time to Book */}
                        <section className="mb-8 md:mb-12">
                            <h2 className="text-sm md:text-[26px] lg:text-[32px] font-bold text-neutral-800 tracking-[0.01em] mb-4 md:mb-6">Best Time to Book Flights from NYC to Dubai</h2>
                            <div className="bg-white md:rounded-2xl p-4 md:p-6 lg:p-8 shadow-md border border-neutral-200">
                                <p className="text-neutral-700 text-xs md:text-sm lg:text-base leading-relaxed mb-4">
                                    Based on historical price data, the optimal booking window for flights from New York to Dubai is 6-12 weeks before departure. Booking within this timeframe typically yields savings of 20-35% compared to last-minute purchases. Prices tend to stabilize 3-4 months ahead, while bookings made within 2 weeks of departure often cost 40-60% more.
                                </p>
                                <p className="text-neutral-700 text-xs md:text-sm lg:text-base leading-relaxed">
                                    Tuesday and Wednesday departures generally offer the lowest fares, with mid-week flights averaging 15-20% cheaper than weekend departures. Morning flights (before 10 AM) also tend to be less expensive than afternoon or evening departures. <a href="#" className="cta-link">Compare prices now</a> to find the best options for your travel dates.
                                </p>
                            </div>
                        </section>

                        {/* Average Flight Prices */}
                        <section className="mb-8 md:mb-12">
                            <h2 className="text-sm md:text-[26px] lg:text-[32px] font-bold text-neutral-800 tracking-[0.01em] mb-4 md:mb-6">Average Flight Prices: NYC to Dubai</h2>
                            <div className="bg-gradient-to-br from-neutral-50 to-white md:rounded-2xl p-4 md:p-6 lg:p-8 shadow-md border border-neutral-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                    <div>
                                        <h3 className="text-sm md:text-base font-bold text-neutral-800 mb-3">Economy Class</h3>
                                        <ul className="space-y-2 text-xs md:text-sm text-neutral-700">
                                            <li className="flex justify-between items-center py-2 border-b border-neutral-200">
                                                <span>Low Season</span>
                                                <span className="font-bold text-green-600">$650-$800</span>
                                            </li>
                                            <li className="flex justify-between items-center py-2 border-b border-neutral-200">
                                                <span>Mid Season</span>
                                                <span className="font-bold text-neutral-600">$800-$1,100</span>
                                            </li>
                                            <li className="flex justify-between items-center py-2">
                                                <span>Peak Season</span>
                                                <span className="font-bold text-red-600">$1,100-$1,600</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="text-sm md:text-base font-bold text-neutral-800 mb-3">Premium Class Options</h3>
                                        <ul className="space-y-2 text-xs md:text-sm text-neutral-700">
                                            <li className="flex justify-between items-center py-2 border-b border-neutral-200">
                                                <span>Premium Economy</span>
                                                <span className="font-bold text-neutral-600">$1,200-$1,800</span>
                                            </li>
                                            <li className="flex justify-between items-center py-2 border-b border-neutral-200">
                                                <span>Business Class</span>
                                                <span className="font-bold text-neutral-600">$3,500-$7,000</span>
                                            </li>
                                            <li className="flex justify-between items-center py-2">
                                                <span>First Class</span>
                                                <span className="font-bold text-neutral-600">$8,000-$15,000</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Cheapest Months to Fly */}
                        <section className="mb-8 md:mb-12">
                            <h2 className="text-sm md:text-[26px] lg:text-[32px] font-bold text-neutral-800 tracking-[0.01em] mb-4 md:mb-6">Cheapest Months to Fly to Dubai</h2>
                            <div className="bg-white md:rounded-2xl p-4 md:p-6 lg:p-8 shadow-md border border-neutral-200">
                                <p className="text-neutral-700 text-xs md:text-sm lg:text-base leading-relaxed mb-4">
                                    September, October, and November represent the most affordable months to fly from New York to Dubai, with average economy fares ranging from $650-$800. This shoulder season avoids the extreme summer heat and the peak winter travel period, resulting in lower demand and better prices.
                                </p>
                                <p className="text-neutral-700 text-xs md:text-sm lg:text-base leading-relaxed mb-4">
                                    January and February also offer competitive pricing, averaging $750-$900 for economy tickets. The most expensive months are December and July-September, when fares can exceed $1,500 due to holiday travel and summer vacation demand. <a href="#" className="cta-link">Check prices by month</a> to identify the best deals for your travel window.
                                </p>
                                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3 mt-4">
                                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, idx) => {
                                        const priceLevel = ['low', 'low', 'medium', 'medium', 'high', 'high', 'peak', 'peak', 'low', 'low', 'low', 'peak'][idx];
                                        const colors = {
                                            low: 'bg-green-100 text-green-700 border-green-200',
                                            medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                                            high: 'bg-orange-100 text-orange-700 border-orange-200',
                                            peak: 'bg-red-100 text-red-700 border-red-200'
                                        };
                                        return (
                                            <div key={month} className={`text-center py-2 md:py-3 px-1 md:px-2 rounded-lg border ${colors[priceLevel]}`}>
                                                <div className="text-[10px] md:text-xs font-bold">{month}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>

                        {/* Airlines Flying This Route */}
                        <section className="mb-8 md:mb-12">
                            <h2 className="text-sm md:text-[26px] lg:text-[32px] font-bold text-neutral-800 tracking-[0.01em] mb-4 md:mb-6">Airlines Flying NYC to Dubai</h2>
                            <div className="bg-gradient-to-br from-neutral-50 to-white md:rounded-2xl p-4 md:p-6 lg:p-8 shadow-md border border-neutral-200">
                                <p className="text-neutral-700 text-xs md:text-sm lg:text-base leading-relaxed mb-4">
                                    Emirates operates the only direct flights from John F. Kennedy International Airport (JFK) to Dubai International Airport (DXB), with daily service. The direct flight takes approximately 12-13 hours eastbound and 14-15 hours westbound due to headwinds.
                                </p>
                                <p className="text-neutral-700 text-xs md:text-sm lg:text-base leading-relaxed mb-6">
                                    Multiple airlines offer one-stop connections with varying layover durations and prices. Popular connecting hubs include Doha (Qatar Airways), Abu Dhabi (Etihad Airways), Istanbul (Turkish Airlines), and various European cities via Lufthansa, British Airways, and Air France. <a href="#" className="cta-link">Compare airline prices</a> to find the best value for your trip.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                                    {[
                                        { name: 'Emirates', type: 'Direct', duration: '12-13 hrs' },
                                        { name: 'Qatar Airways', type: '1 Stop', duration: '15-19 hrs' },
                                        { name: 'Etihad Airways', type: '1 Stop', duration: '16-20 hrs' },
                                        { name: 'Turkish Airlines', type: '1 Stop', duration: '15-18 hrs' },
                                        { name: 'Delta Air Lines', type: '1 Stop', duration: '16-22 hrs' },
                                        { name: 'Lufthansa', type: '1 Stop', duration: '15-21 hrs' }
                                    ].map((airline, idx) => (
                                        <div key={idx} className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-neutral-200 hover:border-primary-300 transition-all duration-150">
                                            <div className="text-sm md:text-base font-bold text-neutral-800 mb-1">{airline.name}</div>
                                            <div className="flex justify-between text-xs md:text-sm text-neutral-600">
                                                <span>{airline.type}</span>
                                                <span>{airline.duration}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Flight Duration & Layover Insights */}
                        <section className="mb-8 md:mb-12">
                            <h2 className="text-sm md:text-[26px] lg:text-[32px] font-bold text-neutral-800 tracking-[0.01em] mb-4 md:mb-6">Flight Duration & Layover Insights</h2>
                            <div className="bg-white md:rounded-2xl p-4 md:p-6 lg:p-8 shadow-md border border-neutral-200">
                                <p className="text-neutral-700 text-xs md:text-sm lg:text-base leading-relaxed mb-4">
                                    Direct flights from New York to Dubai take approximately 12-13 hours eastbound and 14-15 hours westbound. The time difference is due to prevailing jet streams, which affect flight times significantly.
                                </p>
                                <p className="text-neutral-700 text-xs md:text-sm lg:text-base leading-relaxed mb-6">
                                    For one-stop flights, total travel time typically ranges from 15-22 hours depending on the layover duration. Common layover cities include Doha (2-3 hours), Istanbul (2-4 hours), and various European hubs (3-5 hours). Consider booking flights with shorter layovers for faster travel, or longer layovers if you want to stretch your legs or explore connecting cities. <a href="#" className="cta-link">Compare flight durations</a> to find the best option for your schedule.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                    <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-4 md:p-5 border border-green-100">
                                        <h3 className="text-sm md:text-base font-bold text-neutral-800 mb-3">Direct Flights</h3>
                                        <ul className="space-y-2 text-xs md:text-sm text-neutral-700">
                                            <li className="flex items-start gap-2">
                                                <span className="text-green-600">✓</span>
                                                <span>12-13 hours eastbound, 14-15 hours westbound</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-green-600">✓</span>
                                                <span>No layovers, fastest option</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-green-600">✓</span>
                                                <span>Emirates offers daily service</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 md:p-5 border border-blue-100">
                                        <h3 className="text-sm md:text-base font-bold text-neutral-800 mb-3">One-Stop Flights</h3>
                                        <ul className="space-y-2 text-xs md:text-sm text-neutral-700">
                                            <li className="flex items-start gap-2">
                                                <span className="text-blue-600">✓</span>
                                                <span>15-22 hours total travel time</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-blue-600">✓</span>
                                                <span>2-5 hour layovers typical</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-blue-600">✓</span>
                                                <span>Often 20-35% cheaper than direct</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Frequently Asked Questions */}
                        <section className="mb-8 md:mb-12">
                            <h2 className="text-sm md:text-[26px] lg:text-[32px] font-bold text-neutral-800 tracking-[0.01em] mb-4 md:mb-6">Frequently Asked Questions</h2>
                            <div className="space-y-4">
                                <details className="bg-white md:rounded-xl p-4 md:p-6 shadow-sm border border-neutral-200">
                                    <summary className="cursor-pointer font-semibold text-neutral-800 text-sm md:text-base">What is the cheapest month to fly from New York to Dubai?</summary>
                                    <p className="mt-3 text-neutral-700 text-xs md:text-sm leading-relaxed">
                                        The cheapest months to fly from New York to Dubai are typically September, October, and November. During these months, average economy fares range from $650-$800, which is 25-35% lower than peak season prices.
                                    </p>
                                </details>
                                <details className="bg-white md:rounded-xl p-4 md:p-6 shadow-sm border border-neutral-200">
                                    <summary className="cursor-pointer font-semibold text-neutral-800 text-sm md:text-base">How long is the flight from NYC to Dubai?</summary>
                                    <p className="mt-3 text-neutral-700 text-xs md:text-sm leading-relaxed">
                                        Direct flights from New York (JFK) to Dubai (DXB) take approximately 12-13 hours. Flights with one layover typically range from 15-20 hours depending on the connection city and layover duration.
                                    </p>
                                </details>
                                <details className="bg-white md:rounded-xl p-4 md:p-6 shadow-sm border border-neutral-200">
                                    <summary className="cursor-pointer font-semibold text-neutral-800 text-sm md:text-base">Which airlines fly direct from New York to Dubai?</summary>
                                    <p className="mt-3 text-neutral-700 text-xs md:text-sm leading-relaxed">
                                        Emirates offers direct flights from JFK to Dubai. Other airlines with one-stop connections include Qatar Airways, Etihad Airways, Turkish Airlines, and Delta Air Lines, among others.
                                    </p>
                                </details>
                                <details className="bg-white md:rounded-xl p-4 md:p-6 shadow-sm border border-neutral-200">
                                    <summary className="cursor-pointer font-semibold text-neutral-800 text-sm md:text-base">How far in advance should I book NYC to Dubai flights?</summary>
                                    <p className="mt-3 text-neutral-700 text-xs md:text-sm leading-relaxed">
                                        For the best prices on NYC to Dubai flights, book 6-12 weeks in advance. Last-minute bookings (within 2 weeks) typically cost 40-60% more than advance purchases.
                                    </p>
                                </details>
                                <details className="bg-white md:rounded-xl p-4 md:p-6 shadow-sm border border-neutral-200">
                                    <summary className="cursor-pointer font-semibold text-neutral-800 text-sm md:text-base">What airports serve New York and Dubai?</summary>
                                    <p className="mt-3 text-neutral-700 text-xs md:text-sm leading-relaxed">
                                        New York is served by three major airports: John F. Kennedy International (JFK), LaGuardia (LGA), and Newark Liberty International (EWR). Dubai is served by Dubai International Airport (DXB). Most flights to Dubai depart from JFK due to its international connections.
                                    </p>
                                </details>
                            </div>
                        </section>
                    </div>
                </MaxWidthContainer>
            </div>
        </div>
    );
}
