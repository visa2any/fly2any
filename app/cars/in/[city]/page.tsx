"use client";

import { useParams } from "next/navigation";
import { Car, MapPin, Calendar, ArrowRight, Shield, Star, Clock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const CITY_DATA: Record<string, { name: string; airport: string; providers: string[] }> = {
  "new-york": { name: "New York", airport: "JFK/LGA/EWR", providers: ["Hertz", "Enterprise", "Avis", "Budget"] },
  "los-angeles": { name: "Los Angeles", airport: "LAX", providers: ["Hertz", "Enterprise", "National", "Alamo"] },
  "miami": { name: "Miami", airport: "MIA/FLL", providers: ["Enterprise", "Hertz", "Avis", "Sixt"] },
  "las-vegas": { name: "Las Vegas", airport: "LAS", providers: ["Enterprise", "Hertz", "Budget", "Dollar"] },
  "chicago": { name: "Chicago", airport: "ORD/MDW", providers: ["Enterprise", "Hertz", "Avis", "National"] },
  "san-francisco": { name: "San Francisco", airport: "SFO/OAK", providers: ["Hertz", "Enterprise", "Avis", "Budget"] },
  "orlando": { name: "Orlando", airport: "MCO", providers: ["Enterprise", "Hertz", "Alamo", "National"] },
  "denver": { name: "Denver", airport: "DEN", providers: ["Enterprise", "Hertz", "National", "Avis"] },
  "seattle": { name: "Seattle", airport: "SEA", providers: ["Enterprise", "Hertz", "Budget", "Avis"] },
  "dallas": { name: "Dallas", airport: "DFW/DAL", providers: ["Enterprise", "Hertz", "National", "Avis"] },
  "atlanta": { name: "Atlanta", airport: "ATL", providers: ["Enterprise", "Hertz", "Avis", "Budget"] },
  "boston": { name: "Boston", airport: "BOS", providers: ["Enterprise", "Hertz", "Avis", "National"] },
};

const CAR_CATEGORIES = [
  { name: "Economy", price: 25, seats: 4, example: "Toyota Yaris" },
  { name: "Compact", price: 32, seats: 5, example: "Honda Civic" },
  { name: "SUV", price: 55, seats: 5, example: "Toyota RAV4" },
  { name: "Full-Size", price: 45, seats: 5, example: "Toyota Camry" },
  { name: "Luxury", price: 120, seats: 5, example: "BMW 5 Series" },
  { name: "Minivan", price: 65, seats: 7, example: "Chrysler Pacifica" },
];

export default function CarsInCityPage() {
  const params = useParams()!;
  const citySlug = (params?.city as string) || '';
  const city = CITY_DATA[citySlug] || { name: citySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), airport: "", providers: [] };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-white/70 text-sm mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/cars" className="hover:text-white">Car Rentals</Link>
            <span>/</span>
            <span className="text-white">{city.name}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-3">Car Rental in {city.name}</h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Compare prices from {city.providers.length > 0 ? city.providers.join(', ') : 'top providers'} at {city.airport || 'local'} locations. Free cancellation on most bookings.
          </p>
          <div className="flex items-center gap-6 mt-6 text-sm text-white/70">
            <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> Free cancellation</span>
            <span className="flex items-center gap-1"><Car className="w-4 h-4" /> No hidden fees</span>
            <span className="flex items-center gap-1"><Star className="w-4 h-4" /> Best price guarantee</span>
          </div>
        </div>
      </section>

      {/* Car Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Car Categories in {city.name}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CAR_CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                <Car className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-sm text-gray-500 mb-1">{cat.example} or similar</p>
              <p className="text-xs text-gray-400 mb-4">{cat.seats} passengers</p>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-gray-900">${cat.price}</span>
                  <span className="text-sm text-gray-500">/day</span>
                </div>
                <span className="text-xs text-green-600 font-medium">Free cancellation</span>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href={`/cars/results?pickup=${citySlug}`}
            className="inline-flex items-center gap-2 bg-[#E74035] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#D63930] transition-colors"
          >
            Search Car Rentals in {city.name}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Providers */}
      {city.providers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-16">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Available Providers at {city.airport}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {city.providers.map(provider => (
              <div key={provider} className="bg-white rounded-xl p-4 text-center shadow-sm">
                <p className="font-medium text-gray-900">{provider}</p>
                <p className="text-xs text-gray-500 mt-1">Airport counter available</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
