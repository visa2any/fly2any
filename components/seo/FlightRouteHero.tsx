'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plane, Clock, MapPin, Search, Calendar, Sparkles, TrendingDown, ShieldCheck } from 'lucide-react';

interface RouteHeroProps {
  origin: string;
  destination: string;
  originName: string;
  destinationName: string;
  pricing: {
    minPrice: number | null;
    avgPrice: number | null;
    flightDuration: string | null;
    distance: number | null;
    isEstimated?: boolean;
  };
}

export function FlightRouteHero({ origin, destination, originName, destinationName, pricing }: RouteHeroProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-violet-900 text-white py-16 md:py-24 rounded-b-[3rem] shadow-2xl">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated Clouds/Glows */}
        <div className="absolute top-[-50%] left-[-20%] w-[80%] h-[80%] bg-blue-500/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-500/20 rounded-full blur-[100px] animate-float-slow" />
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        {/* Animated Particles */}
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className="absolute bg-white/10 rounded-full blur-sm animate-float-particle"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 10 + 2}px`,
                height: `${Math.random() * 10 + 2}px`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 10}s`
              }}
            />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        {/* Breadcrumb / Navigation */}
        <nav className="flex items-center gap-2 text-sm text-blue-200/80 mb-8 font-medium">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/flights" className="hover:text-white transition-colors">Flights</Link>
          <span>/</span>
          <span className="text-white bg-white/10 px-2 py-0.5 rounded-full">{origin} to {destination}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-400/30 rounded-full px-4 py-1.5 text-yellow-300 text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(250,204,21,0.2)] backdrop-blur-sm animate-fade-in-up">
              <Sparkles className="w-3 h-3 animate-pulse" />
              Best Value Route
            </div>

            <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight animate-fade-in-up delay-100">
              Flights from <br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-white to-blue-200">
                {originName}
              </span>
              <span className="text-white/30 font-light mx-4 text-3xl align-middle">to</span>
              <br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-white to-yellow-200">
                {destinationName}
              </span>
            </h1>

            <p className="text-lg text-blue-100/80 max-w-xl leading-relaxed animate-fade-in-up delay-200">
              Compare prices from 500+ airlines, find exclusive deals, and book your trip to {destinationName} with confidence.
              {pricing.isEstimated && <span className="block mt-2 text-sm opacity-60 italic">*Prices shown are estimated based on historical data.</span>}
            </p>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 pt-4 animate-fade-in-up delay-300">
              {/* Duration Card */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-all hover:scale-105 group cursor-default">
                <div className="flex items-center gap-2 text-blue-300 mb-1 group-hover:text-blue-200">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Avg Time</span>
                </div>
                <div className="text-xl md:text-2xl font-bold text-white group-hover:text-blue-50">
                  {pricing.flightDuration || '--'}
                </div>
              </div>

              {/* Distance Card */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-all hover:scale-105 group cursor-default">
                <div className="flex items-center gap-2 text-purple-300 mb-1 group-hover:text-purple-200">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Distance</span>
                </div>
                <div className="text-xl md:text-2xl font-bold text-white group-hover:text-purple-50">
                  {pricing.distance ? `${pricing.distance} mi` : '--'}
                </div>
              </div>

               {/* Price Card */}
               <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-md border border-green-500/20 p-4 rounded-2xl hover:from-green-500/20 hover:to-emerald-500/20 transition-all hover:scale-105 group cursor-default relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:animate-shimmer" />
                <div className="flex items-center gap-2 text-green-300 mb-1 group-hover:text-green-200">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">From</span>
                </div>
                <div className="text-xl md:text-2xl font-bold text-emerald-100 group-hover:text-white">
                  ${pricing.minPrice || '--'}*
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Visual/Action */}
          <div className="relative animate-fade-in-up delay-500 hidden lg:block">
            {/* Visual Card Composition */}
            <div className="relative w-full aspect-square max-w-md mx-auto">
              {/* Abstract Plane Path Line */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" viewBox="0 0 100 100">
                <path d="M 10 80 Q 50 10 90 20" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" className="animate-dash-draw" />
                <circle cx="10" cy="80" r="1.5" fill="white" className="animate-pulse" />
                <circle cx="90" cy="20" r="1.5" fill="white" className="animate-pulse delay-700" />
              </svg>

              {/* Main Glass Card */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center">
                 <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
                    <Plane className="w-8 h-8 text-white rotate-[-45deg]" />
                 </div>
                 
                 <h3 className="text-2xl font-bold mb-2">Ready to Fly?</h3>
                 <p className="text-blue-200 mb-8 text-sm">
                   Book now and lock in the best price for your trip to {destinationName}.
                 </p>

                 <Link 
                   href={`/flights/results?origin=${origin}&destination=${destination}`}
                   className="w-full bg-white text-blue-900 font-bold text-lg py-4 rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
                 >
                    <span className="relative z-10">Check Availability</span>
                    <Search className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                 </Link>

                 <div className="mt-6 flex items-center justify-center gap-4 text-xs text-blue-300">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Secure Booking
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Free Cancellation
                    </span>
                 </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute top-0 right-0 bg-white text-blue-900 rounded-xl p-3 shadow-xl animate-float-slow backdrop-blur-sm bg-opacity-90">
                 <div className="text-xs font-bold text-gray-500 uppercase">Save up to</div>
                 <div className="text-2xl font-black text-green-600">40%</div>
              </div>

               <div className="absolute bottom-10 left-[-20px] bg-white/10 backdrop-blur-md text-white rounded-xl p-3 shadow-xl border border-white/20 animate-float-delayed">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
                    <span className="text-xs font-bold">500+ Airlines</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

       {/* Custom Styles for this component only */}
      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(10px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 7s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
        .animate-shimmer { animation: shimmer 2s infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-500 { animation-delay: 500ms; }
      `}</style>
    </section>
  );
}
