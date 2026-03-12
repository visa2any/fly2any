"use client";

import { useParams } from "next/navigation";
import { Car, MapPin, ArrowRight, Shield, Plane, Clock, Users } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const CITY_DATA: Record<string, { name: string; airport: string; code: string }> = {
  "new-york": { name: "New York", airport: "JFK, LaGuardia & Newark", code: "JFK/LGA/EWR" },
  "los-angeles": { name: "Los Angeles", airport: "LAX Airport", code: "LAX" },
  "miami": { name: "Miami", airport: "Miami International", code: "MIA" },
  "las-vegas": { name: "Las Vegas", airport: "Harry Reid International", code: "LAS" },
  "chicago": { name: "Chicago", airport: "O'Hare & Midway", code: "ORD/MDW" },
  "san-francisco": { name: "San Francisco", airport: "SFO Airport", code: "SFO" },
  "orlando": { name: "Orlando", airport: "Orlando International", code: "MCO" },
  "london": { name: "London", airport: "Heathrow, Gatwick & Stansted", code: "LHR/LGW/STN" },
  "paris": { name: "Paris", airport: "CDG & Orly", code: "CDG/ORY" },
  "dubai": { name: "Dubai", airport: "Dubai International", code: "DXB" },
  "cancun": { name: "Cancun", airport: "Cancun International", code: "CUN" },
  "rome": { name: "Rome", airport: "Fiumicino & Ciampino", code: "FCO/CIA" },
  "bangkok": { name: "Bangkok", airport: "Suvarnabhumi", code: "BKK" },
  "istanbul": { name: "Istanbul", airport: "Istanbul Airport", code: "IST" },
};

const VEHICLE_TYPES = [
  { name: "Economy Sedan", passengers: 3, luggage: 2, price: 35, example: "Toyota Camry" },
  { name: "Premium Sedan", passengers: 3, luggage: 2, price: 55, example: "Mercedes E-Class" },
  { name: "SUV", passengers: 5, luggage: 4, price: 70, example: "Chevrolet Suburban" },
  { name: "Luxury", passengers: 3, luggage: 2, price: 120, example: "Mercedes S-Class" },
  { name: "Minivan", passengers: 7, luggage: 6, price: 85, example: "Mercedes V-Class" },
  { name: "Group Bus", passengers: 16, luggage: 16, price: 150, example: "Mercedes Sprinter" },
];

export default function TransfersAtCityPage() {
  const params = useParams()!;
  const citySlug = (params?.city as string) || '';
  const city = CITY_DATA[citySlug] || { name: citySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), airport: "", code: "" };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-white/70 text-sm mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/transfers" className="hover:text-white">Transfers</Link>
            <span>/</span>
            <span className="text-white">{city.name}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-3">{city.name} Airport Transfer</h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Private airport pickup and drop-off at {city.airport || city.name}. Fixed prices, meet & greet, real-time flight tracking.
          </p>
          <div className="flex flex-wrap items-center gap-6 mt-6 text-sm text-white/70">
            <span className="flex items-center gap-1"><Plane className="w-4 h-4" /> Flight tracking</span>
            <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> Free cancellation</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 24/7 service</span>
          </div>
        </div>
      </section>

      {/* Vehicle Options */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Transfer Options from {city.code || city.name}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {VEHICLE_TYPES.map((vehicle, i) => (
            <motion.div
              key={vehicle.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{vehicle.name}</h3>
                <Car className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-sm text-gray-500 mb-3">{vehicle.example} or similar</p>
              <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {vehicle.passengers} pax</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {vehicle.luggage} bags</span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <span className="text-xs text-gray-400">From</span>
                  <div>
                    <span className="text-2xl font-bold text-gray-900">${vehicle.price}</span>
                    <span className="text-sm text-gray-500"> one-way</span>
                  </div>
                </div>
                <span className="text-xs text-green-600 font-medium">Free cancellation</span>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href={`/transfers/results?pickup=${citySlug}`}
            className="inline-flex items-center gap-2 bg-[#E74035] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#D63930] transition-colors"
          >
            Search Transfers from {city.code || city.name}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <h2 className="text-xl font-bold text-gray-900 mb-6">How Airport Transfers Work</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: "1", title: "Book Online", desc: "Enter your flight number and destination. Choose your vehicle and pay securely online." },
            { step: "2", title: "Meet Your Driver", desc: "Your driver tracks your flight and waits at arrivals with a name sign. No stress if your flight is delayed." },
            { step: "3", title: "Enjoy Your Ride", desc: "Sit back in a clean, air-conditioned vehicle. Fixed price — no meters, no surprises." },
          ].map(item => (
            <div key={item.step} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-[#E74035] text-white flex items-center justify-center font-bold text-sm mb-3">
                {item.step}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
