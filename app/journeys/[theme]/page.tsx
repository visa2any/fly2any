"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Check, Calendar, Users, MapPin, Star, Plane, Building2, Compass } from "lucide-react";

const THEME_DATA: Record<string, {
  name: string;
  tagline: string;
  description: string;
  color: string;
  packages: { destination: string; nights: number; price: number; highlights: string[] }[];
}> = {
  "romantic-getaways": {
    name: "Romantic Getaways",
    tagline: "Create unforgettable memories together",
    description: "Escape to the world's most romantic destinations. Our curated packages include luxury accommodations, intimate dining experiences, and couple's activities.",
    color: "from-rose-500 to-pink-600",
    packages: [
      { destination: "Paris, France", nights: 5, price: 2499, highlights: ["Eiffel Tower dinner", "Seine cruise", "Champagne tasting"] },
      { destination: "Santorini, Greece", nights: 6, price: 2899, highlights: ["Sunset cave suite", "Wine tour", "Private boat trip"] },
      { destination: "Maldives", nights: 7, price: 4299, highlights: ["Overwater villa", "Spa treatment", "Underwater dining"] },
      { destination: "Venice, Italy", nights: 4, price: 1999, highlights: ["Gondola ride", "Murano glass tour", "Rooftop dinner"] },
    ],
  },
  "family-vacations": {
    name: "Family Vacations",
    tagline: "Adventures the whole family will love",
    description: "Kid-friendly destinations with activities for all ages. Our family packages include spacious accommodations and exciting experiences everyone can enjoy.",
    color: "from-blue-500 to-cyan-600",
    packages: [
      { destination: "Orlando, Florida", nights: 6, price: 1899, highlights: ["Disney passes", "Universal access", "Water park"] },
      { destination: "San Diego, California", nights: 5, price: 1599, highlights: ["SeaWorld", "Zoo", "LEGOLAND"] },
      { destination: "Cancun, Mexico", nights: 7, price: 2199, highlights: ["All-inclusive resort", "Snorkeling", "Mayan ruins"] },
      { destination: "Hawaii", nights: 7, price: 2999, highlights: ["Beach activities", "Luau dinner", "Volcano tour"] },
    ],
  },
  "adventure-travel": {
    name: "Adventure Travel",
    tagline: "Push your limits, explore the unknown",
    description: "For thrill-seekers and explorers. Our adventure packages combine adrenaline-pumping activities with stunning natural landscapes.",
    color: "from-emerald-500 to-teal-600",
    packages: [
      { destination: "Costa Rica", nights: 8, price: 2699, highlights: ["Zip-lining", "White water rafting", "Volcano hike"] },
      { destination: "New Zealand", nights: 10, price: 4499, highlights: ["Bungee jumping", "Glacier hike", "Skydiving"] },
      { destination: "Iceland", nights: 7, price: 3299, highlights: ["Northern lights", "Ice caves", "Hot springs"] },
      { destination: "Peru", nights: 9, price: 2999, highlights: ["Machu Picchu trek", "Amazon jungle", "Rainbow Mountain"] },
    ],
  },
  "beach-holidays": {
    name: "Beach Holidays",
    tagline: "Sun, sand, and total relaxation",
    description: "Escape to paradise with our beach holiday packages. Pristine shores, crystal-clear waters, and endless sunshine await.",
    color: "from-amber-500 to-orange-600",
    packages: [
      { destination: "Miami Beach", nights: 5, price: 1299, highlights: ["Beachfront hotel", "South Beach access", "Nightlife"] },
      { destination: "Bahamas", nights: 6, price: 1899, highlights: ["Nassau resort", "Swimming pigs", "Snorkeling"] },
      { destination: "Phuket, Thailand", nights: 8, price: 1699, highlights: ["Beach villa", "Island hopping", "Thai massage"] },
      { destination: "Bali, Indonesia", nights: 9, price: 1999, highlights: ["Private pool villa", "Temples", "Rice terraces"] },
    ],
  },
  "celebrations": {
    name: "Celebration Trips",
    tagline: "Mark life's biggest moments in style",
    description: "Anniversaries, birthdays, retirements, graduations—celebrate your milestone with an unforgettable trip designed around you.",
    color: "from-fuchsia-500 to-purple-600",
    packages: [
      { destination: "Napa Valley", nights: 4, price: 1899, highlights: ["Wine tasting", "Balloon ride", "Spa retreat"] },
      { destination: "Amalfi Coast", nights: 6, price: 3299, highlights: ["Cliffside hotel", "Private boat", "Cooking class"] },
      { destination: "Maui, Hawaii", nights: 7, price: 3599, highlights: ["Oceanfront suite", "Sunset sail", "Luau celebration"] },
      { destination: "Swiss Alps", nights: 5, price: 2999, highlights: ["Mountain lodge", "Scenic train", "Fine dining"] },
    ],
  },
  "bachelor-bachelorette": {
    name: "Bachelor & Bachelorette",
    tagline: "The ultimate pre-wedding celebration",
    description: "Send off your single life in style. Party packages with VIP access, group accommodations, and unforgettable experiences.",
    color: "from-pink-500 to-rose-600",
    packages: [
      { destination: "Las Vegas", nights: 4, price: 1299, highlights: ["VIP nightclub", "Pool party", "Show tickets"] },
      { destination: "Miami", nights: 4, price: 1499, highlights: ["South Beach", "Yacht cruise", "Club access"] },
      { destination: "Cancun", nights: 5, price: 1199, highlights: ["All-inclusive", "Beach club", "Cenote tour"] },
      { destination: "Nashville", nights: 3, price: 899, highlights: ["Broadway bars", "Honky tonk tour", "Live music"] },
    ],
  },
  "family-reunion": {
    name: "Family Reunions",
    tagline: "Bring the whole family together",
    description: "Large group accommodations, multi-generational activities, and shared dining experiences that bring families closer.",
    color: "from-sky-500 to-blue-600",
    packages: [
      { destination: "Orlando Resort", nights: 5, price: 1799, highlights: ["Villa rental", "Theme parks", "Group dining"] },
      { destination: "Lake Tahoe", nights: 6, price: 2499, highlights: ["Lakefront cabin", "Water sports", "BBQ facilities"] },
      { destination: "Outer Banks", nights: 7, price: 1999, highlights: ["Beach house", "Fishing trips", "Bonfire nights"] },
      { destination: "Colorado Ranch", nights: 5, price: 2799, highlights: ["Dude ranch", "Horseback riding", "Campfire stories"] },
    ],
  },
  "cultural-exploration": {
    name: "Cultural Exploration",
    tagline: "Discover history, art, and traditions",
    description: "Immerse yourself in world cultures. Museum tours, local cuisine, historic sites, and authentic experiences.",
    color: "from-violet-500 to-indigo-600",
    packages: [
      { destination: "Rome, Italy", nights: 6, price: 2499, highlights: ["Vatican tour", "Colosseum", "Food tour"] },
      { destination: "Tokyo, Japan", nights: 8, price: 3199, highlights: ["Temple visits", "Tea ceremony", "Sushi class"] },
      { destination: "Cairo, Egypt", nights: 7, price: 2299, highlights: ["Pyramids", "Nile cruise", "Bazaar tour"] },
      { destination: "Barcelona, Spain", nights: 5, price: 1899, highlights: ["Gaudi tour", "Tapas crawl", "Flamenco show"] },
    ],
  },
  "business-trips": {
    name: "Business Travel",
    tagline: "Work efficiently, travel comfortably",
    description: "Premium business travel with convenient flights, central hotels, and workspace amenities for the corporate traveler.",
    color: "from-slate-600 to-gray-700",
    packages: [
      { destination: "New York City", nights: 3, price: 999, highlights: ["Midtown hotel", "Airport transfer", "Co-working access"] },
      { destination: "San Francisco", nights: 3, price: 1099, highlights: ["Downtown location", "Wifi included", "Gym access"] },
      { destination: "Chicago", nights: 3, price: 899, highlights: ["Loop hotel", "Business center", "Express checkout"] },
      { destination: "London", nights: 4, price: 1599, highlights: ["City of London", "Lounge access", "Concierge"] },
    ],
  },
};

function PackageCard({ pkg, theme }: { pkg: typeof THEME_DATA["romantic-getaways"]["packages"][0]; theme: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
    >
      <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 relative">
        <div className="absolute bottom-4 left-4">
          <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-semibold">
            {pkg.nights} Nights
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.destination}</h3>

        <div className="space-y-2 mb-4">
          {pkg.highlights.map(h => (
            <div key={h} className="flex items-center gap-2 text-sm text-gray-600">
              <Check className="w-4 h-4 text-emerald-500" />
              {h}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <span className="text-sm text-gray-500">From</span>
            <p className="text-2xl font-bold text-gray-900">${pkg.price.toLocaleString()}</p>
            <span className="text-xs text-gray-500">per person</span>
          </div>
          <Link
            href={`/agent/quotes/workspace?preset=${theme}&destination=${encodeURIComponent(pkg.destination)}&nights=${pkg.nights}`}
            className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            Customize <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function JourneyThemePage() {
  const params = useParams();
  const themeSlug = params.theme as string;
  const theme = THEME_DATA[themeSlug] || {
    name: themeSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    tagline: "Discover amazing destinations",
    description: "Explore our curated travel packages.",
    color: "from-indigo-500 to-purple-600",
    packages: [],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className={`bg-gradient-to-br ${theme.color} text-white py-20`}>
        <div className="max-w-7xl mx-auto px-4">
          <nav className="text-sm mb-6 text-white/70">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/journeys" className="hover:text-white">Journeys</Link>
            <span className="mx-2">/</span>
            <span className="text-white">{theme.name}</span>
          </nav>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-4"
          >
            {theme.name}
          </motion.h1>
          <p className="text-2xl text-white/80 mb-4">{theme.tagline}</p>
          <p className="text-lg text-white/70 max-w-2xl">{theme.description}</p>

          <div className="flex items-center gap-6 mt-8">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-xl">
              <Plane className="w-5 h-5" />
              <span>Flights Included</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-xl">
              <Building2 className="w-5 h-5" />
              <span>Hotels Included</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-xl">
              <Compass className="w-5 h-5" />
              <span>Activities Included</span>
            </div>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Popular Packages</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {theme.packages.map((pkg, i) => (
            <PackageCard key={i} pkg={pkg} theme={themeSlug} />
          ))}
        </div>
      </section>

      {/* CTA: Custom Trip */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12 text-white text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
          <h2 className="text-3xl font-bold mb-4">Want Something Different?</h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">
            Our travel experts can create a completely custom {theme.name.toLowerCase()} package
            tailored to your exact preferences and budget.
          </p>
          <Link
            href={`/agent/quotes/workspace?preset=${themeSlug}`}
            className="inline-flex items-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors"
          >
            Build Custom Trip <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Related Themes */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore Other Journey Types</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(THEME_DATA)
            .filter(([slug]) => slug !== themeSlug)
            .slice(0, 3)
            .map(([slug, t]) => (
              <Link
                key={slug}
                href={`/journeys/${slug}`}
                className="group p-6 bg-white rounded-xl shadow hover:shadow-lg transition-shadow"
              >
                <h3 className="font-bold text-gray-900 group-hover:text-primary-600 mb-1">{t.name}</h3>
                <p className="text-sm text-gray-500">{t.tagline}</p>
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
