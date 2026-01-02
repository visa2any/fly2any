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
  // ═══════════════════════════════════════════════════════════════════════════
  // USA - TOP 50 MOST VISITED CITIES
  // ═══════════════════════════════════════════════════════════════════════════
  "new york": [
    { url: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1920&q=80", alt: "New York Manhattan" },
    { url: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1920&q=80", alt: "NYC Times Square" },
  ],
  "los angeles": [
    { url: "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=1920&q=80", alt: "Los Angeles skyline" },
    { url: "https://images.unsplash.com/photo-1515896769750-31548aa180ed?w=1920&q=80", alt: "Hollywood sign" },
  ],
  miami: [
    { url: "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=1920&q=80", alt: "Miami Beach" },
    { url: "https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?w=1920&q=80", alt: "Miami skyline" },
  ],
  "san francisco": [
    { url: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&q=80", alt: "Golden Gate Bridge" },
    { url: "https://images.unsplash.com/photo-1521747116042-5a810fda9664?w=1920&q=80", alt: "San Francisco hills" },
  ],
  "las vegas": [
    { url: "https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=1920&q=80", alt: "Las Vegas strip" },
    { url: "https://images.unsplash.com/photo-1581351721010-8cf859cb14a4?w=1920&q=80", alt: "Vegas night" },
  ],
  chicago: [
    { url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=80", alt: "Chicago skyline" },
    { url: "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=1920&q=80", alt: "Chicago Bean" },
  ],
  orlando: [
    { url: "https://images.unsplash.com/photo-1575089776834-8be34696ffb9?w=1920&q=80", alt: "Orlando theme parks" },
    { url: "https://images.unsplash.com/photo-1597466599360-3b9775841aec?w=1920&q=80", alt: "Orlando sunset" },
  ],
  honolulu: [
    { url: "https://images.unsplash.com/photo-1507876466758-bc54f384809c?w=1920&q=80", alt: "Honolulu Waikiki" },
    { url: "https://images.unsplash.com/photo-1573995663829-c04dfc384c4f?w=1920&q=80", alt: "Diamond Head" },
  ],
  washington: [
    { url: "https://images.unsplash.com/photo-1501466044931-62695aada8e9?w=1920&q=80", alt: "Washington Monument" },
    { url: "https://images.unsplash.com/photo-1585108076498-d2d4258c5f3d?w=1920&q=80", alt: "Capitol Building" },
  ],
  seattle: [
    { url: "https://images.unsplash.com/photo-1502175353174-a7a70e73b362?w=1920&q=80", alt: "Seattle Space Needle" },
    { url: "https://images.unsplash.com/photo-1438401171849-74ac270044ee?w=1920&q=80", alt: "Seattle skyline" },
  ],
  boston: [
    { url: "https://images.unsplash.com/photo-1501979376754-2ff867a4f659?w=1920&q=80", alt: "Boston skyline" },
    { url: "https://images.unsplash.com/photo-1573074617613-fc8ef27eaa2f?w=1920&q=80", alt: "Boston harbor" },
  ],
  "san diego": [
    { url: "https://images.unsplash.com/photo-1538964173425-93884d739780?w=1920&q=80", alt: "San Diego coastline" },
    { url: "https://images.unsplash.com/photo-1566802725728-94c741f08dde?w=1920&q=80", alt: "San Diego downtown" },
  ],
  denver: [
    { url: "https://images.unsplash.com/photo-1546156929-a4c0ac411f47?w=1920&q=80", alt: "Denver skyline mountains" },
    { url: "https://images.unsplash.com/photo-1619856699906-09e1f58c98b4?w=1920&q=80", alt: "Denver downtown" },
  ],
  atlanta: [
    { url: "https://images.unsplash.com/photo-1575917649705-5b59aaa12e6b?w=1920&q=80", alt: "Atlanta skyline" },
  ],
  phoenix: [
    { url: "https://images.unsplash.com/photo-1558645836-e44122a743ee?w=1920&q=80", alt: "Phoenix desert skyline" },
  ],
  dallas: [
    { url: "https://images.unsplash.com/photo-1545194445-dddb8f4487c6?w=1920&q=80", alt: "Dallas skyline" },
  ],
  houston: [
    { url: "https://images.unsplash.com/photo-1530089711124-9ca31fb9e863?w=1920&q=80", alt: "Houston skyline" },
  ],
  "new orleans": [
    { url: "https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=1920&q=80", alt: "New Orleans French Quarter" },
    { url: "https://images.unsplash.com/photo-1571893544028-06b07af6dade?w=1920&q=80", alt: "New Orleans jazz" },
  ],
  nashville: [
    { url: "https://images.unsplash.com/photo-1545419913-775e3e4f6024?w=1920&q=80", alt: "Nashville Broadway" },
  ],
  austin: [
    { url: "https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=1920&q=80", alt: "Austin skyline" },
  ],
  "san antonio": [
    { url: "https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=1920&q=80", alt: "San Antonio River Walk" },
  ],
  philadelphia: [
    { url: "https://images.unsplash.com/photo-1569761316261-9a8696fa2ca3?w=1920&q=80", alt: "Philadelphia skyline" },
  ],
  scottsdale: [
    { url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80", alt: "Scottsdale desert" },
  ],
  "fort lauderdale": [
    { url: "https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=1920&q=80", alt: "Fort Lauderdale beach" },
  ],
  tampa: [
    { url: "https://images.unsplash.com/photo-1562095241-8c6714fd4178?w=1920&q=80", alt: "Tampa Bay skyline" },
  ],
  "palm beach": [
    { url: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=1920&q=80", alt: "Palm Beach" },
  ],
  "key west": [
    { url: "https://images.unsplash.com/photo-1580256079322-4f3cf2e5b57e?w=1920&q=80", alt: "Key West sunset" },
  ],
  savannah: [
    { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80", alt: "Savannah squares" },
  ],
  charleston: [
    { url: "https://images.unsplash.com/photo-1569974507005-6dc61f97fb5c?w=1920&q=80", alt: "Charleston historic" },
  ],
  "santa fe": [
    { url: "https://images.unsplash.com/photo-1570654621852-9dd25b76b38d?w=1920&q=80", alt: "Santa Fe adobe" },
  ],
  sedona: [
    { url: "https://images.unsplash.com/photo-1558862107-d49ef2a04d72?w=1920&q=80", alt: "Sedona red rocks" },
  ],
  "grand canyon": [
    { url: "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=1920&q=80", alt: "Grand Canyon" },
  ],
  maui: [
    { url: "https://images.unsplash.com/photo-1542259009477-d625272157b7?w=1920&q=80", alt: "Maui beach" },
    { url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80", alt: "Maui coastline" },
  ],
  "palm springs": [
    { url: "https://images.unsplash.com/photo-1581791538302-03537b9c97bf?w=1920&q=80", alt: "Palm Springs" },
  ],
  portland: [
    { url: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=1920&q=80", alt: "Portland bridges" },
  ],
  minneapolis: [
    { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80", alt: "Minneapolis skyline" },
  ],
  detroit: [
    { url: "https://images.unsplash.com/photo-1564685315123-5c3dd73fd90c?w=1920&q=80", alt: "Detroit skyline" },
  ],
  baltimore: [
    { url: "https://images.unsplash.com/photo-1569974507005-6dc61f97fb5c?w=1920&q=80", alt: "Baltimore harbor" },
  ],
  // ═══════════════════════════════════════════════════════════════════════════
  // MIDDLE EAST & NORTH AFRICA
  // ═══════════════════════════════════════════════════════════════════════════
  dubai: [
    { url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80", alt: "Dubai Burj Khalifa" },
    { url: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1920&q=80", alt: "Dubai Marina" },
  ],
  "abu dhabi": [
    { url: "https://images.unsplash.com/photo-1558277510-c4c0dca7e32c?w=1920&q=80", alt: "Sheikh Zayed Mosque" },
  ],
  doha: [
    { url: "https://images.unsplash.com/photo-1559242977-bf04821cae2d?w=1920&q=80", alt: "Doha skyline" },
  ],
  riyadh: [
    { url: "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=1920&q=80", alt: "Riyadh Kingdom Tower" },
  ],
  jeddah: [
    { url: "https://images.unsplash.com/photo-1578895101408-1a36b834405b?w=1920&q=80", alt: "Jeddah waterfront" },
  ],
  cairo: [
    { url: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=1920&q=80", alt: "Cairo pyramids" },
    { url: "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=1920&q=80", alt: "Cairo Nile" },
  ],
  marrakech: [
    { url: "https://images.unsplash.com/photo-1517821099606-cef63a9bcda6?w=1920&q=80", alt: "Marrakech medina" },
  ],
  casablanca: [
    { url: "https://images.unsplash.com/photo-1569383746724-6f1b882b8f46?w=1920&q=80", alt: "Casablanca mosque" },
  ],
  amman: [
    { url: "https://images.unsplash.com/photo-1580834341580-8c17a3a630ca?w=1920&q=80", alt: "Amman citadel" },
  ],
  petra: [
    { url: "https://images.unsplash.com/photo-1579606032821-4e6161c81571?w=1920&q=80", alt: "Petra Treasury" },
  ],
  "tel aviv": [
    { url: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=1920&q=80", alt: "Tel Aviv beach" },
  ],
  jerusalem: [
    { url: "https://images.unsplash.com/photo-1552423314-cf29ab68ad73?w=1920&q=80", alt: "Jerusalem old city" },
  ],
  tunis: [
    { url: "https://images.unsplash.com/photo-1590517862150-8a6d6ea4e15b?w=1920&q=80", alt: "Tunis medina" },
  ],
  // ═══════════════════════════════════════════════════════════════════════════
  // EUROPE - COMPREHENSIVE
  // ═══════════════════════════════════════════════════════════════════════════
  paris: [
    { url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=80", alt: "Eiffel Tower" },
    { url: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1920&q=80", alt: "Paris cityscape" },
  ],
  london: [
    { url: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1920&q=80", alt: "Tower Bridge" },
    { url: "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=1920&q=80", alt: "Big Ben" },
  ],
  rome: [
    { url: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1920&q=80", alt: "Colosseum" },
    { url: "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=1920&q=80", alt: "Vatican" },
  ],
  barcelona: [
    { url: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1920&q=80", alt: "Sagrada Familia" },
    { url: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1920&q=80", alt: "Barcelona beach" },
  ],
  amsterdam: [
    { url: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1920&q=80", alt: "Amsterdam canals" },
  ],
  berlin: [
    { url: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=1920&q=80", alt: "Brandenburg Gate" },
  ],
  vienna: [
    { url: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=1920&q=80", alt: "Vienna palace" },
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
    { url: "https://images.unsplash.com/photo-1555993539-1732b0258235?w=1920&q=80", alt: "Acropolis" },
  ],
  istanbul: [
    { url: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1920&q=80", alt: "Blue Mosque" },
    { url: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1920&q=80", alt: "Bosphorus" },
  ],
  moscow: [
    { url: "https://images.unsplash.com/photo-1513326738677-b964603b136d?w=1920&q=80", alt: "Red Square" },
  ],
  "st petersburg": [
    { url: "https://images.unsplash.com/photo-1556610961-2fecc5927173?w=1920&q=80", alt: "St Petersburg Hermitage" },
  ],
  zurich: [
    { url: "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1920&q=80", alt: "Zurich lake" },
  ],
  geneva: [
    { url: "https://images.unsplash.com/photo-1573108724029-4c46571d6490?w=1920&q=80", alt: "Geneva jet" },
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
  frankfurt: [
    { url: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1920&q=80", alt: "Frankfurt skyline" },
  ],
  dublin: [
    { url: "https://images.unsplash.com/photo-1549918864-48ac978761a4?w=1920&q=80", alt: "Dublin Temple Bar" },
  ],
  edinburgh: [
    { url: "https://images.unsplash.com/photo-1506377585622-bedcbb027afc?w=1920&q=80", alt: "Edinburgh castle" },
  ],
  copenhagen: [
    { url: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=1920&q=80", alt: "Copenhagen Nyhavn" },
  ],
  stockholm: [
    { url: "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=1920&q=80", alt: "Stockholm old town" },
  ],
  oslo: [
    { url: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80", alt: "Oslo opera" },
  ],
  helsinki: [
    { url: "https://images.unsplash.com/photo-1538332576228-eb5b4c4de6f5?w=1920&q=80", alt: "Helsinki cathedral" },
  ],
  budapest: [
    { url: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=1920&q=80", alt: "Budapest parliament" },
  ],
  warsaw: [
    { url: "https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=1920&q=80", alt: "Warsaw old town" },
  ],
  krakow: [
    { url: "https://images.unsplash.com/photo-1558278728-6fcc3f2c8c9d?w=1920&q=80", alt: "Krakow square" },
  ],
  brussels: [
    { url: "https://images.unsplash.com/photo-1559113202-c916b8e44373?w=1920&q=80", alt: "Brussels Grand Place" },
  ],
  seville: [
    { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80", alt: "Seville Plaza" },
  ],
  valencia: [
    { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80", alt: "Valencia arts" },
  ],
  porto: [
    { url: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1920&q=80", alt: "Porto Douro" },
  ],
  nice: [
    { url: "https://images.unsplash.com/photo-1491166617655-0723a0999cfc?w=1920&q=80", alt: "Nice promenade" },
  ],
  cannes: [
    { url: "https://images.unsplash.com/photo-1572915600028-efe2ad83ed3f?w=1920&q=80", alt: "Cannes Croisette" },
  ],
  monaco: [
    { url: "https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=1920&q=80", alt: "Monaco harbor" },
  ],
  santorini: [
    { url: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1920&q=80", alt: "Santorini sunset" },
  ],
  mykonos: [
    { url: "https://images.unsplash.com/photo-1601581875039-e899893d520c?w=1920&q=80", alt: "Mykonos windmills" },
  ],
  dubrovnik: [
    { url: "https://images.unsplash.com/photo-1555990538-1e6c6c614e4f?w=1920&q=80", alt: "Dubrovnik walls" },
  ],
  split: [
    { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80", alt: "Split palace" },
  ],
  reykjavik: [
    { url: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=1920&q=80", alt: "Reykjavik church" },
  ],
  // ═══════════════════════════════════════════════════════════════════════════
  // ASIA PACIFIC - COMPREHENSIVE
  // ═══════════════════════════════════════════════════════════════════════════
  tokyo: [
    { url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1920&q=80", alt: "Tokyo Shibuya" },
    { url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1920&q=80", alt: "Tokyo Tower" },
  ],
  osaka: [
    { url: "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=1920&q=80", alt: "Osaka castle" },
  ],
  kyoto: [
    { url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920&q=80", alt: "Kyoto temple" },
  ],
  singapore: [
    { url: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1920&q=80", alt: "Marina Bay Sands" },
  ],
  bangkok: [
    { url: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1920&q=80", alt: "Bangkok temples" },
  ],
  phuket: [
    { url: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=1920&q=80", alt: "Phuket beach" },
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
    { url: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1920&q=80", alt: "Gateway of India" },
  ],
  delhi: [
    { url: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1920&q=80", alt: "India Gate" },
  ],
  jaipur: [
    { url: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1920&q=80", alt: "Jaipur Hawa Mahal" },
  ],
  goa: [
    { url: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1920&q=80", alt: "Goa beach" },
  ],
  "kuala lumpur": [
    { url: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1920&q=80", alt: "Petronas Towers" },
  ],
  hanoi: [
    { url: "https://images.unsplash.com/photo-1555921015-5532091f6026?w=1920&q=80", alt: "Hanoi old quarter" },
  ],
  "ho chi minh": [
    { url: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1920&q=80", alt: "Ho Chi Minh City" },
  ],
  manila: [
    { url: "https://images.unsplash.com/photo-1549315972-8e29a0c8a7ca?w=1920&q=80", alt: "Manila skyline" },
  ],
  boracay: [
    { url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80", alt: "Boracay beach" },
  ],
  beijing: [
    { url: "https://images.unsplash.com/photo-1508804052814-cd3ba865a116?w=1920&q=80", alt: "Great Wall" },
  ],
  shanghai: [
    { url: "https://images.unsplash.com/photo-1538428494232-9c0d8a3ab403?w=1920&q=80", alt: "Shanghai Bund" },
  ],
  taipei: [
    { url: "https://images.unsplash.com/photo-1470004914212-05527e49370b?w=1920&q=80", alt: "Taipei 101" },
  ],
  macau: [
    { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80", alt: "Macau casinos" },
  ],
  kathmandu: [
    { url: "https://images.unsplash.com/photo-1558799401-1dcba79834c2?w=1920&q=80", alt: "Kathmandu temples" },
  ],
  colombo: [
    { url: "https://images.unsplash.com/photo-1576185450842-6b1fa23fe0f7?w=1920&q=80", alt: "Colombo skyline" },
  ],
  maldives: [
    { url: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1920&q=80", alt: "Maldives villa" },
  ],
  // ═══════════════════════════════════════════════════════════════════════════
  // OCEANIA
  // ═══════════════════════════════════════════════════════════════════════════
  sydney: [
    { url: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1920&q=80", alt: "Sydney Opera House" },
  ],
  melbourne: [
    { url: "https://images.unsplash.com/photo-1514395462725-fb4566210144?w=1920&q=80", alt: "Melbourne" },
  ],
  brisbane: [
    { url: "https://images.unsplash.com/photo-1566734904496-9309bb1798ae?w=1920&q=80", alt: "Brisbane skyline" },
  ],
  perth: [
    { url: "https://images.unsplash.com/photo-1573973579169-f1a61e8f0d05?w=1920&q=80", alt: "Perth skyline" },
  ],
  "gold coast": [
    { url: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1920&q=80", alt: "Gold Coast beach" },
  ],
  auckland: [
    { url: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=1920&q=80", alt: "Auckland Sky Tower" },
  ],
  queenstown: [
    { url: "https://images.unsplash.com/photo-1589871973318-9ca1258faa5d?w=1920&q=80", alt: "Queenstown mountains" },
  ],
  fiji: [
    { url: "https://images.unsplash.com/photo-1566296314736-6eaac1ca0cb9?w=1920&q=80", alt: "Fiji beach" },
  ],
  "bora bora": [
    { url: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1920&q=80", alt: "Bora Bora lagoon" },
  ],
  tahiti: [
    { url: "https://images.unsplash.com/photo-1566296314736-6eaac1ca0cb9?w=1920&q=80", alt: "Tahiti paradise" },
  ],
  // ═══════════════════════════════════════════════════════════════════════════
  // LATIN AMERICA & CARIBBEAN
  // ═══════════════════════════════════════════════════════════════════════════
  cancun: [
    { url: "https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=1920&q=80", alt: "Cancun beach" },
  ],
  "mexico city": [
    { url: "https://images.unsplash.com/photo-1518659526054-190340b32735?w=1920&q=80", alt: "Mexico City palace" },
  ],
  "playa del carmen": [
    { url: "https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=1920&q=80", alt: "Playa del Carmen" },
  ],
  "los cabos": [
    { url: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1920&q=80", alt: "Los Cabos" },
  ],
  "puerto vallarta": [
    { url: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1920&q=80", alt: "Puerto Vallarta" },
  ],
  "rio de janeiro": [
    { url: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1920&q=80", alt: "Rio de Janeiro" },
  ],
  "sao paulo": [
    { url: "https://images.unsplash.com/photo-1543059080-f9b1272213d5?w=1920&q=80", alt: "Sao Paulo skyline" },
  ],
  "buenos aires": [
    { url: "https://images.unsplash.com/photo-1612294037637-ec328d0e075e?w=1920&q=80", alt: "Buenos Aires" },
  ],
  lima: [
    { url: "https://images.unsplash.com/photo-1531968455001-5c5272a41129?w=1920&q=80", alt: "Lima coast" },
  ],
  cusco: [
    { url: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1920&q=80", alt: "Machu Picchu" },
  ],
  cartagena: [
    { url: "https://images.unsplash.com/photo-1533050487297-09b450131914?w=1920&q=80", alt: "Cartagena old city" },
  ],
  bogota: [
    { url: "https://images.unsplash.com/photo-1536875698888-1b96a3b0e5a4?w=1920&q=80", alt: "Bogota mountains" },
  ],
  santiago: [
    { url: "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=1920&q=80", alt: "Santiago skyline" },
  ],
  "punta cana": [
    { url: "https://images.unsplash.com/photo-1580237541049-2d715a09486e?w=1920&q=80", alt: "Punta Cana" },
  ],
  nassau: [
    { url: "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=1920&q=80", alt: "Bahamas" },
  ],
  jamaica: [
    { url: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1920&q=80", alt: "Jamaica beach" },
  ],
  aruba: [
    { url: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=1920&q=80", alt: "Aruba beach" },
  ],
  "st maarten": [
    { url: "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=1920&q=80", alt: "St Maarten" },
  ],
  barbados: [
    { url: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1920&q=80", alt: "Barbados" },
  ],
  "turks and caicos": [
    { url: "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=1920&q=80", alt: "Turks Caicos" },
  ],
  bermuda: [
    { url: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=1920&q=80", alt: "Bermuda beach" },
  ],
  "cayman islands": [
    { url: "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=1920&q=80", alt: "Cayman beach" },
  ],
  "costa rica": [
    { url: "https://images.unsplash.com/photo-1518061296418-eb36a48c4a23?w=1920&q=80", alt: "Costa Rica rainforest" },
  ],
  panama: [
    { url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1920&q=80", alt: "Panama City" },
  ],
  havana: [
    { url: "https://images.unsplash.com/photo-1500759285222-a95626b934cb?w=1920&q=80", alt: "Havana Cuba" },
  ],
  // ═══════════════════════════════════════════════════════════════════════════
  // CANADA
  // ═══════════════════════════════════════════════════════════════════════════
  toronto: [
    { url: "https://images.unsplash.com/photo-1517090504586-fde19ea6066f?w=1920&q=80", alt: "CN Tower" },
  ],
  vancouver: [
    { url: "https://images.unsplash.com/photo-1559511260-66a654ae982a?w=1920&q=80", alt: "Vancouver skyline" },
  ],
  montreal: [
    { url: "https://images.unsplash.com/photo-1519178614-68673b201f36?w=1920&q=80", alt: "Montreal old port" },
  ],
  quebec: [
    { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80", alt: "Quebec City" },
  ],
  calgary: [
    { url: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=1920&q=80", alt: "Calgary skyline" },
  ],
  banff: [
    { url: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=1920&q=80", alt: "Banff mountains" },
  ],
  whistler: [
    { url: "https://images.unsplash.com/photo-1548883354-94bcfe321cbb?w=1920&q=80", alt: "Whistler ski" },
  ],
  // ═══════════════════════════════════════════════════════════════════════════
  // AFRICA
  // ═══════════════════════════════════════════════════════════════════════════
  "cape town": [
    { url: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1920&q=80", alt: "Table Mountain" },
  ],
  johannesburg: [
    { url: "https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=1920&q=80", alt: "Johannesburg" },
  ],
  nairobi: [
    { url: "https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=1920&q=80", alt: "Nairobi" },
  ],
  zanzibar: [
    { url: "https://images.unsplash.com/photo-1566296314736-6eaac1ca0cb9?w=1920&q=80", alt: "Zanzibar beach" },
  ],
  mauritius: [
    { url: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1920&q=80", alt: "Mauritius beach" },
  ],
  seychelles: [
    { url: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1920&q=80", alt: "Seychelles" },
  ],
  lagos: [
    { url: "https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=1920&q=80", alt: "Lagos" },
  ],
  accra: [
    { url: "https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=1920&q=80", alt: "Accra" },
  ],
};

// IATA code to city mapping - Comprehensive global coverage
const IATA_TO_CITY: Record<string, string> = {
  // USA - Major Airports
  JFK: "new york", LGA: "new york", EWR: "new york",
  LAX: "los angeles", SFO: "san francisco", OAK: "san francisco",
  MIA: "miami", FLL: "fort lauderdale", PBI: "palm beach",
  ORD: "chicago", MDW: "chicago",
  LAS: "las vegas", PHX: "phoenix", TUS: "phoenix",
  SEA: "seattle", PDX: "portland",
  BOS: "boston", DCA: "washington", IAD: "washington", BWI: "baltimore",
  ATL: "atlanta", MCO: "orlando", TPA: "tampa", RSW: "fort lauderdale",
  DEN: "denver", SAN: "san diego",
  DFW: "dallas", IAH: "houston", HOU: "houston", AUS: "austin", SAT: "san antonio",
  MSY: "new orleans", BNA: "nashville", MEM: "nashville",
  PHL: "philadelphia", CLT: "charleston", RDU: "charleston",
  HNL: "honolulu", OGG: "maui", KOA: "honolulu", LIH: "honolulu",
  DTW: "detroit", MSP: "minneapolis", STL: "minneapolis",
  SLC: "salt lake city", ABQ: "santa fe", PHX: "scottsdale",
  EYW: "key west", SAV: "savannah", CHS: "charleston",
  PSP: "palm springs", SNA: "los angeles", BUR: "los angeles",

  // Middle East
  DXB: "dubai", AUH: "abu dhabi", DOH: "doha",
  RUH: "riyadh", JED: "jeddah", DMM: "riyadh",
  AMM: "amman", TLV: "tel aviv", CAI: "cairo",
  CMN: "casablanca", RAK: "marrakech", TUN: "tunis",

  // Europe - Major Hubs
  CDG: "paris", ORY: "paris",
  LHR: "london", LGW: "london", STN: "london", LCY: "london", LTN: "london",
  FCO: "rome", CIA: "rome", MXP: "milan", LIN: "milan",
  BCN: "barcelona", MAD: "madrid", PMI: "mallorca", AGP: "malaga",
  AMS: "amsterdam", BRU: "brussels",
  FRA: "frankfurt", MUC: "munich", BER: "berlin", HAM: "berlin", DUS: "frankfurt",
  VIE: "vienna", ZRH: "zurich", GVA: "geneva",
  PRG: "prague", BUD: "budapest", WAW: "warsaw", KRK: "krakow",
  LIS: "lisbon", OPO: "porto", FAO: "lisbon",
  ATH: "athens", SKG: "athens", JTR: "santorini", JMK: "mykonos",
  IST: "istanbul", SAW: "istanbul", ESB: "istanbul",
  SVO: "moscow", DME: "moscow", LED: "st petersburg",
  DUB: "dublin", EDI: "edinburgh", MAN: "london", BHX: "london",
  CPH: "copenhagen", ARN: "stockholm", OSL: "oslo", HEL: "helsinki",
  NCE: "nice", LYS: "paris", MRS: "nice",
  FLR: "florence", VCE: "venice", NAP: "rome",
  DBV: "dubrovnik", SPU: "split", ZAG: "dubrovnik",
  KEF: "reykjavik",
  MCO: "monaco",
  SVQ: "seville", VLC: "valencia", BIO: "barcelona",

  // Asia Pacific
  NRT: "tokyo", HND: "tokyo", KIX: "osaka", ITM: "osaka",
  SIN: "singapore", BKK: "bangkok", DMK: "bangkok", HKT: "phuket",
  HKG: "hong kong", ICN: "seoul", GMP: "seoul",
  DPS: "bali", CGK: "jakarta", KUL: "kuala lumpur",
  BOM: "mumbai", DEL: "delhi", BLR: "bangalore", MAA: "chennai",
  CCU: "kolkata", JAI: "jaipur", GOI: "goa",
  HAN: "hanoi", SGN: "ho chi minh", DAD: "hanoi",
  MNL: "manila", CEB: "boracay",
  PEK: "beijing", PKX: "beijing", PVG: "shanghai", SHA: "shanghai",
  TPE: "taipei", MFM: "macau",
  KTM: "kathmandu", CMB: "colombo", MLE: "maldives",

  // Oceania
  SYD: "sydney", MEL: "melbourne", BNE: "brisbane", PER: "perth", OOL: "gold coast",
  AKL: "auckland", CHC: "queenstown", ZQN: "queenstown", WLG: "auckland",
  NAN: "fiji", PPT: "tahiti", BOB: "bora bora",

  // Latin America & Caribbean
  CUN: "cancun", MEX: "mexico city", GDL: "mexico city",
  SJD: "los cabos", PVR: "puerto vallarta",
  GIG: "rio de janeiro", GRU: "sao paulo", CGH: "sao paulo",
  EZE: "buenos aires", AEP: "buenos aires",
  LIM: "lima", CUZ: "cusco", BOG: "bogota", CTG: "cartagena",
  SCL: "santiago", PTY: "panama", SJO: "costa rica", LIR: "costa rica",
  HAV: "havana", PUJ: "punta cana", SDQ: "punta cana",
  NAS: "nassau", MBJ: "jamaica", KIN: "jamaica",
  AUA: "aruba", CUR: "aruba", SXM: "st maarten",
  BGI: "barbados", PLS: "turks and caicos", BDA: "bermuda", GCM: "cayman islands",

  // Canada
  YYZ: "toronto", YVR: "vancouver", YUL: "montreal", YQB: "quebec",
  YYC: "calgary", YEG: "calgary", YOW: "toronto",

  // Africa
  CPT: "cape town", JNB: "johannesburg", DUR: "johannesburg",
  NBO: "nairobi", ZNZ: "zanzibar", DAR: "zanzibar",
  MRU: "mauritius", SEZ: "seychelles",
  LOS: "lagos", ACC: "accra",
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
