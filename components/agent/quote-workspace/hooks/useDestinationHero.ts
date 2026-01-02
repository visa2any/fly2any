"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// DESTINATION HERO HOOK - Dynamic background based on flight destination
// Premium travel imagery for emotional conversion
// ═══════════════════════════════════════════════════════════════════════════════

export interface DestinationImage {
  url: string;
  alt: string;
  credit?: string;
}

export interface DestinationHeroData {
  city: string;
  country: string;
  images: DestinationImage[];
  gradient: string;
}

interface UseDestinationHeroReturn {
  heroData: DestinationHeroData | null;
  isLoading: boolean;
  hasImages: boolean;
}

// ═══ CURATED DESTINATION IMAGE MAP ═══
// High-quality, royalty-free images from Unsplash CDN
const DESTINATION_IMAGES: Record<string, DestinationImage[]> = {
  // Middle East
  dubai: [
    { url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80", alt: "Dubai skyline with Burj Khalifa" },
    { url: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1920&q=80", alt: "Dubai Marina at night" },
  ],
  "abu dhabi": [
    { url: "https://images.unsplash.com/photo-1558277510-c4c0dca7e32c?w=1920&q=80", alt: "Sheikh Zayed Grand Mosque" },
  ],
  doha: [
    { url: "https://images.unsplash.com/photo-1559242977-bf04821cae2d?w=1920&q=80", alt: "Doha skyline" },
  ],
  // Europe
  paris: [
    { url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=80", alt: "Eiffel Tower Paris" },
    { url: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1920&q=80", alt: "Paris cityscape" },
  ],
  london: [
    { url: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1920&q=80", alt: "London Tower Bridge" },
    { url: "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=1920&q=80", alt: "Big Ben London" },
  ],
  rome: [
    { url: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1920&q=80", alt: "Rome Colosseum" },
    { url: "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=1920&q=80", alt: "Vatican City" },
  ],
  barcelona: [
    { url: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1920&q=80", alt: "Barcelona Sagrada Familia" },
  ],
  amsterdam: [
    { url: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1920&q=80", alt: "Amsterdam canals" },
  ],
  berlin: [
    { url: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=1920&q=80", alt: "Berlin Brandenburg Gate" },
  ],
  vienna: [
    { url: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=1920&q=80", alt: "Vienna architecture" },
  ],
  prague: [
    { url: "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=1920&q=80", alt: "Prague Charles Bridge" },
  ],
  lisbon: [
    { url: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1920&q=80", alt: "Lisbon tram" },
  ],
  madrid: [
    { url: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1920&q=80", alt: "Madrid Gran Via" },
  ],
  athens: [
    { url: "https://images.unsplash.com/photo-1555993539-1732b0258235?w=1920&q=80", alt: "Athens Acropolis" },
  ],
  istanbul: [
    { url: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1920&q=80", alt: "Istanbul Blue Mosque" },
    { url: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1920&q=80", alt: "Bosphorus Istanbul" },
  ],
  // Asia
  tokyo: [
    { url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1920&q=80", alt: "Tokyo Shibuya" },
    { url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1920&q=80", alt: "Tokyo Tower" },
  ],
  singapore: [
    { url: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1920&q=80", alt: "Singapore Marina Bay" },
  ],
  bangkok: [
    { url: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1920&q=80", alt: "Bangkok temples" },
  ],
  "hong kong": [
    { url: "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=1920&q=80", alt: "Hong Kong skyline" },
  ],
  seoul: [
    { url: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=1920&q=80", alt: "Seoul cityscape" },
  ],
  bali: [
    { url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1920&q=80", alt: "Bali rice terraces" },
    { url: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=1920&q=80", alt: "Bali temple" },
  ],
  mumbai: [
    { url: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1920&q=80", alt: "Mumbai Gateway of India" },
  ],
  delhi: [
    { url: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1920&q=80", alt: "Delhi India Gate" },
  ],
  // Americas
  "new york": [
    { url: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1920&q=80", alt: "New York Manhattan" },
    { url: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1920&q=80", alt: "NYC Times Square" },
  ],
  "los angeles": [
    { url: "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=1920&q=80", alt: "Los Angeles skyline" },
  ],
  miami: [
    { url: "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=1920&q=80", alt: "Miami Beach" },
  ],
  "san francisco": [
    { url: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&q=80", alt: "San Francisco Golden Gate" },
  ],
  chicago: [
    { url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=80", alt: "Chicago skyline" },
  ],
  "las vegas": [
    { url: "https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=1920&q=80", alt: "Las Vegas strip" },
  ],
  cancun: [
    { url: "https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=1920&q=80", alt: "Cancun beach" },
  ],
  "rio de janeiro": [
    { url: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1920&q=80", alt: "Rio de Janeiro" },
  ],
  "buenos aires": [
    { url: "https://images.unsplash.com/photo-1612294037637-ec328d0e075e?w=1920&q=80", alt: "Buenos Aires" },
  ],
  toronto: [
    { url: "https://images.unsplash.com/photo-1517090504586-fde19ea6066f?w=1920&q=80", alt: "Toronto CN Tower" },
  ],
  vancouver: [
    { url: "https://images.unsplash.com/photo-1559511260-66a654ae982a?w=1920&q=80", alt: "Vancouver skyline" },
  ],
  // Africa & Oceania
  cairo: [
    { url: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=1920&q=80", alt: "Cairo pyramids" },
  ],
  "cape town": [
    { url: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1920&q=80", alt: "Cape Town Table Mountain" },
  ],
  sydney: [
    { url: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1920&q=80", alt: "Sydney Opera House" },
  ],
  melbourne: [
    { url: "https://images.unsplash.com/photo-1514395462725-fb4566210144?w=1920&q=80", alt: "Melbourne city" },
  ],
  auckland: [
    { url: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=1920&q=80", alt: "Auckland skyline" },
  ],
  // Caribbean
  punta_cana: [
    { url: "https://images.unsplash.com/photo-1580237541049-2d715a09486e?w=1920&q=80", alt: "Punta Cana beach" },
  ],
  nassau: [
    { url: "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=1920&q=80", alt: "Bahamas beach" },
  ],
  // More destinations
  maldives: [
    { url: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1920&q=80", alt: "Maldives overwater villa" },
  ],
  santorini: [
    { url: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1920&q=80", alt: "Santorini Greece" },
  ],
  maui: [
    { url: "https://images.unsplash.com/photo-1542259009477-d625272157b7?w=1920&q=80", alt: "Maui Hawaii beach" },
  ],
  marrakech: [
    { url: "https://images.unsplash.com/photo-1517821099606-cef63a9bcda6?w=1920&q=80", alt: "Marrakech medina" },
  ],
  moscow: [
    { url: "https://images.unsplash.com/photo-1513326738677-b964603b136d?w=1920&q=80", alt: "Moscow Red Square" },
  ],
  zurich: [
    { url: "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1920&q=80", alt: "Zurich Switzerland" },
  ],
  milan: [
    { url: "https://images.unsplash.com/photo-1520440229-6469a149ac59?w=1920&q=80", alt: "Milan Duomo" },
  ],
  florence: [
    { url: "https://images.unsplash.com/photo-1543429258-c5ca3cb66c6d?w=1920&q=80", alt: "Florence Duomo" },
  ],
  venice: [
    { url: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1920&q=80", alt: "Venice canals" },
  ],
  munich: [
    { url: "https://images.unsplash.com/photo-1595867818082-083862f3d630?w=1920&q=80", alt: "Munich Marienplatz" },
  ],
};

// IATA code to city mapping
const IATA_TO_CITY: Record<string, string> = {
  DXB: "dubai", AUH: "abu dhabi", DOH: "doha",
  CDG: "paris", ORY: "paris", LHR: "london", LGW: "london", STN: "london",
  FCO: "rome", BCN: "barcelona", AMS: "amsterdam", BER: "berlin",
  VIE: "vienna", PRG: "prague", LIS: "lisbon", MAD: "madrid",
  ATH: "athens", IST: "istanbul", SAW: "istanbul",
  NRT: "tokyo", HND: "tokyo", SIN: "singapore", BKK: "bangkok",
  HKG: "hong kong", ICN: "seoul", DPS: "bali", BOM: "mumbai", DEL: "delhi",
  JFK: "new york", LGA: "new york", EWR: "new york",
  LAX: "los angeles", MIA: "miami", SFO: "san francisco",
  ORD: "chicago", LAS: "las vegas", CUN: "cancun",
  GIG: "rio de janeiro", EZE: "buenos aires",
  YYZ: "toronto", YVR: "vancouver",
  CAI: "cairo", CPT: "cape town",
  SYD: "sydney", MEL: "melbourne", AKL: "auckland",
  PUJ: "punta_cana", NAS: "nassau",
  MLE: "maldives", JTR: "santorini", OGG: "maui",
  RAK: "marrakech", SVO: "moscow", DME: "moscow",
  ZRH: "zurich", MXP: "milan", FLR: "florence", VCE: "venice", MUC: "munich",
};

// Premium gradients for fallback
const DESTINATION_GRADIENTS: Record<string, string> = {
  default: "from-indigo-600 via-purple-600 to-pink-500",
  beach: "from-cyan-500 via-blue-500 to-indigo-600",
  city: "from-slate-700 via-gray-800 to-zinc-900",
  desert: "from-amber-500 via-orange-500 to-red-500",
  tropical: "from-emerald-500 via-teal-500 to-cyan-500",
  european: "from-blue-600 via-indigo-600 to-violet-600",
  asian: "from-rose-500 via-pink-500 to-fuchsia-500",
};

// City to gradient category
const CITY_GRADIENT: Record<string, string> = {
  dubai: "desert", "abu dhabi": "desert", doha: "desert", cairo: "desert", marrakech: "desert",
  miami: "beach", cancun: "beach", bali: "beach", maldives: "beach", punta_cana: "beach", nassau: "beach", maui: "beach",
  singapore: "tropical", bangkok: "tropical", "hong kong": "city",
  "new york": "city", "los angeles": "city", chicago: "city", tokyo: "city", seoul: "city",
  paris: "european", london: "european", rome: "european", barcelona: "european",
};

// Image cache
const imageCache = new Map<string, DestinationHeroData>();

export function useDestinationHero(
  destination: string | null,
  destinationCode?: string | null
): UseDestinationHeroReturn {
  const [heroData, setHeroData] = useState<DestinationHeroData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Normalize city name
  const normalizedCity = useMemo(() => {
    if (!destination && !destinationCode) return null;

    // Try IATA code first
    if (destinationCode) {
      const fromIata = IATA_TO_CITY[destinationCode.toUpperCase()];
      if (fromIata) return fromIata;
    }

    // Normalize destination string
    if (destination) {
      const lower = destination.toLowerCase().trim();
      // Direct match
      if (DESTINATION_IMAGES[lower]) return lower;
      // Try without country suffix (e.g., "Paris, France" → "paris")
      const cityOnly = lower.split(",")[0].trim();
      if (DESTINATION_IMAGES[cityOnly]) return cityOnly;
      // Try partial match
      for (const key of Object.keys(DESTINATION_IMAGES)) {
        if (lower.includes(key) || key.includes(cityOnly)) return key;
      }
      return cityOnly; // Return for gradient fallback
    }
    return null;
  }, [destination, destinationCode]);

  // Resolve hero data
  const resolveHeroData = useCallback((city: string): DestinationHeroData => {
    // Check cache
    if (imageCache.has(city)) {
      return imageCache.get(city)!;
    }

    const images = DESTINATION_IMAGES[city] || [];
    const gradientKey = CITY_GRADIENT[city] || "default";
    const gradient = DESTINATION_GRADIENTS[gradientKey];

    // Parse city name for display
    const displayCity = city.split("_").map(w =>
      w.charAt(0).toUpperCase() + w.slice(1)
    ).join(" ");

    const data: DestinationHeroData = {
      city: displayCity,
      country: "", // Could be enhanced with country lookup
      images,
      gradient,
    };

    // Cache result
    imageCache.set(city, data);
    return data;
  }, []);

  useEffect(() => {
    if (!normalizedCity) {
      setHeroData(null);
      return;
    }

    setIsLoading(true);

    // Simulate async for potential future API integration
    const timer = setTimeout(() => {
      const data = resolveHeroData(normalizedCity);
      setHeroData(data);
      setIsLoading(false);
    }, 50);

    return () => clearTimeout(timer);
  }, [normalizedCity, resolveHeroData]);

  return {
    heroData,
    isLoading,
    hasImages: (heroData?.images?.length || 0) > 0,
  };
}

export default useDestinationHero;
