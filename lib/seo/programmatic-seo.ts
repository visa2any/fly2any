/**
 * Programmatic SEO Engine - Fly2Any Growth OS
 * Dynamic page generation for routes, airports, destinations, and airlines
 */

import { prisma } from '@/lib/prisma'

export interface RouteData {
  origin: string
  originCity: string
  originCountry: string
  destination: string
  destinationCity: string
  destinationCountry: string
  slug: string
  avgPrice: number
  lowestPrice: number
  airlines: string[]
  flightDuration: string
  popularity: number
}

export interface AirportData {
  code: string
  name: string
  city: string
  country: string
  continent: string
  latitude: number
  longitude: number
  timezone: string
  slug: string
  popularRoutes: string[]
}

export interface DestinationData {
  city: string
  country: string
  continent: string
  slug: string
  description: string
  highlights: string[]
  bestTimeToVisit: string
  avgFlightPrice: number
  popularOrigins: string[]
  imageUrl?: string
}

export interface AirlineData {
  code: string
  name: string
  country: string
  alliance?: string
  slug: string
  rating: number
  popularRoutes: string[]
  hubAirports: string[]
}

// Top airports database (expandable)
export const TOP_AIRPORTS: AirportData[] = [
  { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'USA', continent: 'North America', latitude: 40.6413, longitude: -73.7781, timezone: 'America/New_York', slug: 'jfk-new-york', popularRoutes: ['LHR', 'CDG', 'LAX', 'MIA'] },
  { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA', continent: 'North America', latitude: 33.9425, longitude: -118.4081, timezone: 'America/Los_Angeles', slug: 'lax-los-angeles', popularRoutes: ['JFK', 'SFO', 'HNL', 'NRT'] },
  { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'UK', continent: 'Europe', latitude: 51.4700, longitude: -0.4543, timezone: 'Europe/London', slug: 'lhr-london', popularRoutes: ['JFK', 'DXB', 'CDG', 'FRA'] },
  { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', continent: 'Europe', latitude: 49.0097, longitude: 2.5479, timezone: 'Europe/Paris', slug: 'cdg-paris', popularRoutes: ['JFK', 'LHR', 'FCO', 'BCN'] },
  { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE', continent: 'Asia', latitude: 25.2532, longitude: 55.3657, timezone: 'Asia/Dubai', slug: 'dxb-dubai', popularRoutes: ['LHR', 'BOM', 'DEL', 'SIN'] },
  { code: 'SIN', name: 'Changi Airport', city: 'Singapore', country: 'Singapore', continent: 'Asia', latitude: 1.3644, longitude: 103.9915, timezone: 'Asia/Singapore', slug: 'sin-singapore', popularRoutes: ['HKG', 'BKK', 'SYD', 'LHR'] },
  { code: 'HKG', name: 'Hong Kong International', city: 'Hong Kong', country: 'Hong Kong', continent: 'Asia', latitude: 22.3080, longitude: 113.9185, timezone: 'Asia/Hong_Kong', slug: 'hkg-hong-kong', popularRoutes: ['SIN', 'TPE', 'NRT', 'BKK'] },
  { code: 'NRT', name: 'Narita International', city: 'Tokyo', country: 'Japan', continent: 'Asia', latitude: 35.7720, longitude: 140.3929, timezone: 'Asia/Tokyo', slug: 'nrt-tokyo', popularRoutes: ['LAX', 'SFO', 'HNL', 'SIN'] },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', continent: 'Europe', latitude: 50.0379, longitude: 8.5622, timezone: 'Europe/Berlin', slug: 'fra-frankfurt', popularRoutes: ['LHR', 'JFK', 'DXB', 'SIN'] },
  { code: 'AMS', name: 'Schiphol Airport', city: 'Amsterdam', country: 'Netherlands', continent: 'Europe', latitude: 52.3105, longitude: 4.7683, timezone: 'Europe/Amsterdam', slug: 'ams-amsterdam', popularRoutes: ['LHR', 'CDG', 'FRA', 'JFK'] },
  { code: 'ORD', name: "O'Hare International", city: 'Chicago', country: 'USA', continent: 'North America', latitude: 41.9742, longitude: -87.9073, timezone: 'America/Chicago', slug: 'ord-chicago', popularRoutes: ['LAX', 'JFK', 'LHR', 'NRT'] },
  { code: 'MIA', name: 'Miami International', city: 'Miami', country: 'USA', continent: 'North America', latitude: 25.7959, longitude: -80.2870, timezone: 'America/New_York', slug: 'mia-miami', popularRoutes: ['JFK', 'LAX', 'GRU', 'BOG'] },
  { code: 'SFO', name: 'San Francisco International', city: 'San Francisco', country: 'USA', continent: 'North America', latitude: 37.6213, longitude: -122.3790, timezone: 'America/Los_Angeles', slug: 'sfo-san-francisco', popularRoutes: ['LAX', 'JFK', 'NRT', 'HKG'] },
  { code: 'BCN', name: 'El Prat Airport', city: 'Barcelona', country: 'Spain', continent: 'Europe', latitude: 41.2974, longitude: 2.0833, timezone: 'Europe/Madrid', slug: 'bcn-barcelona', popularRoutes: ['MAD', 'CDG', 'LHR', 'FCO'] },
  { code: 'FCO', name: 'Fiumicino Airport', city: 'Rome', country: 'Italy', continent: 'Europe', latitude: 41.8003, longitude: 12.2389, timezone: 'Europe/Rome', slug: 'fco-rome', popularRoutes: ['CDG', 'LHR', 'FRA', 'BCN'] },
  { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', continent: 'Europe', latitude: 41.2608, longitude: 28.7418, timezone: 'Europe/Istanbul', slug: 'ist-istanbul', popularRoutes: ['LHR', 'FRA', 'CDG', 'DXB'] },
  { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', continent: 'Asia', latitude: 13.6900, longitude: 100.7501, timezone: 'Asia/Bangkok', slug: 'bkk-bangkok', popularRoutes: ['SIN', 'HKG', 'NRT', 'SYD'] },
  { code: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'Australia', continent: 'Oceania', latitude: -33.9461, longitude: 151.1772, timezone: 'Australia/Sydney', slug: 'syd-sydney', popularRoutes: ['LAX', 'SIN', 'HKG', 'NRT'] },
  { code: 'GRU', name: 'Guarulhos International', city: 'São Paulo', country: 'Brazil', continent: 'South America', latitude: -23.4356, longitude: -46.4731, timezone: 'America/Sao_Paulo', slug: 'gru-sao-paulo', popularRoutes: ['MIA', 'JFK', 'LIS', 'CDG'] },
  { code: 'MEX', name: 'Mexico City International', city: 'Mexico City', country: 'Mexico', continent: 'North America', latitude: 19.4363, longitude: -99.0721, timezone: 'America/Mexico_City', slug: 'mex-mexico-city', popularRoutes: ['LAX', 'JFK', 'MIA', 'DFW'] }
]

// Top airlines database
export const TOP_AIRLINES: AirlineData[] = [
  { code: 'AA', name: 'American Airlines', country: 'USA', alliance: 'Oneworld', slug: 'american-airlines', rating: 4.1, popularRoutes: ['JFK-LAX', 'DFW-LHR', 'MIA-CDG'], hubAirports: ['DFW', 'CLT', 'PHX'] },
  { code: 'UA', name: 'United Airlines', country: 'USA', alliance: 'Star Alliance', slug: 'united-airlines', rating: 3.9, popularRoutes: ['EWR-LHR', 'SFO-NRT', 'ORD-FRA'], hubAirports: ['ORD', 'EWR', 'IAH'] },
  { code: 'DL', name: 'Delta Air Lines', country: 'USA', alliance: 'SkyTeam', slug: 'delta-air-lines', rating: 4.2, popularRoutes: ['ATL-LHR', 'JFK-CDG', 'LAX-NRT'], hubAirports: ['ATL', 'DTW', 'MSP'] },
  { code: 'BA', name: 'British Airways', country: 'UK', alliance: 'Oneworld', slug: 'british-airways', rating: 4.0, popularRoutes: ['LHR-JFK', 'LHR-LAX', 'LHR-DXB'], hubAirports: ['LHR', 'LGW'] },
  { code: 'AF', name: 'Air France', country: 'France', alliance: 'SkyTeam', slug: 'air-france', rating: 4.1, popularRoutes: ['CDG-JFK', 'CDG-LAX', 'CDG-NRT'], hubAirports: ['CDG', 'ORY'] },
  { code: 'LH', name: 'Lufthansa', country: 'Germany', alliance: 'Star Alliance', slug: 'lufthansa', rating: 4.3, popularRoutes: ['FRA-JFK', 'MUC-LAX', 'FRA-SIN'], hubAirports: ['FRA', 'MUC'] },
  { code: 'EK', name: 'Emirates', country: 'UAE', slug: 'emirates', rating: 4.6, popularRoutes: ['DXB-LHR', 'DXB-JFK', 'DXB-SYD'], hubAirports: ['DXB'] },
  { code: 'QR', name: 'Qatar Airways', country: 'Qatar', alliance: 'Oneworld', slug: 'qatar-airways', rating: 4.7, popularRoutes: ['DOH-LHR', 'DOH-JFK', 'DOH-SIN'], hubAirports: ['DOH'] },
  { code: 'SQ', name: 'Singapore Airlines', country: 'Singapore', alliance: 'Star Alliance', slug: 'singapore-airlines', rating: 4.8, popularRoutes: ['SIN-LHR', 'SIN-JFK', 'SIN-SYD'], hubAirports: ['SIN'] },
  { code: 'CX', name: 'Cathay Pacific', country: 'Hong Kong', alliance: 'Oneworld', slug: 'cathay-pacific', rating: 4.4, popularRoutes: ['HKG-LHR', 'HKG-LAX', 'HKG-SYD'], hubAirports: ['HKG'] }
]

// Top destinations database
export const TOP_DESTINATIONS: DestinationData[] = [
  { city: 'Paris', country: 'France', continent: 'Europe', slug: 'paris', description: 'The City of Light, famous for the Eiffel Tower, world-class museums, and romantic ambiance.', highlights: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame', 'Champs-Élysées'], bestTimeToVisit: 'April to June, September to November', avgFlightPrice: 650, popularOrigins: ['JFK', 'LAX', 'LHR', 'ORD'] },
  { city: 'London', country: 'UK', continent: 'Europe', slug: 'london', description: 'Historic capital blending tradition with modern innovation, from Big Ben to cutting-edge art.', highlights: ['Big Ben', 'Tower of London', 'British Museum', 'Buckingham Palace'], bestTimeToVisit: 'March to May, September to November', avgFlightPrice: 550, popularOrigins: ['JFK', 'LAX', 'CDG', 'DXB'] },
  { city: 'Tokyo', country: 'Japan', continent: 'Asia', slug: 'tokyo', description: 'Ultra-modern metropolis where ancient temples meet neon-lit streets and cutting-edge technology.', highlights: ['Shibuya Crossing', 'Senso-ji Temple', 'Mt. Fuji Day Trip', 'Tsukiji Market'], bestTimeToVisit: 'March to May, October to November', avgFlightPrice: 900, popularOrigins: ['LAX', 'SFO', 'JFK', 'SIN'] },
  { city: 'Dubai', country: 'UAE', continent: 'Asia', slug: 'dubai', description: 'Futuristic city of superlatives with the world\'s tallest building, luxury shopping, and desert adventures.', highlights: ['Burj Khalifa', 'Dubai Mall', 'Palm Jumeirah', 'Desert Safari'], bestTimeToVisit: 'November to March', avgFlightPrice: 800, popularOrigins: ['LHR', 'JFK', 'BOM', 'DEL'] },
  { city: 'New York', country: 'USA', continent: 'North America', slug: 'new-york', description: 'The city that never sleeps - iconic skyline, world-class entertainment, and endless energy.', highlights: ['Statue of Liberty', 'Central Park', 'Times Square', 'Broadway'], bestTimeToVisit: 'April to June, September to November', avgFlightPrice: 400, popularOrigins: ['LAX', 'LHR', 'CDG', 'MIA'] },
  { city: 'Singapore', country: 'Singapore', continent: 'Asia', slug: 'singapore', description: 'Garden city blending futuristic architecture, diverse cultures, and world-renowned cuisine.', highlights: ['Marina Bay Sands', 'Gardens by the Bay', 'Sentosa Island', 'Hawker Centers'], bestTimeToVisit: 'February to April', avgFlightPrice: 850, popularOrigins: ['LHR', 'SYD', 'HKG', 'BKK'] },
  { city: 'Barcelona', country: 'Spain', continent: 'Europe', slug: 'barcelona', description: 'Vibrant coastal city famous for Gaudí architecture, Mediterranean beaches, and lively nightlife.', highlights: ['Sagrada Familia', 'Park Güell', 'La Rambla', 'Gothic Quarter'], bestTimeToVisit: 'May to June, September to October', avgFlightPrice: 500, popularOrigins: ['LHR', 'CDG', 'JFK', 'FRA'] },
  { city: 'Rome', country: 'Italy', continent: 'Europe', slug: 'rome', description: 'Eternal city where ancient ruins, Renaissance art, and la dolce vita come together beautifully.', highlights: ['Colosseum', 'Vatican City', 'Trevi Fountain', 'Roman Forum'], bestTimeToVisit: 'April to June, September to October', avgFlightPrice: 550, popularOrigins: ['JFK', 'LHR', 'CDG', 'FRA'] },
  { city: 'Bali', country: 'Indonesia', continent: 'Asia', slug: 'bali', description: 'Tropical paradise with stunning temples, rice terraces, world-class surfing, and spiritual retreats.', highlights: ['Uluwatu Temple', 'Ubud Rice Terraces', 'Seminyak Beach', 'Sacred Monkey Forest'], bestTimeToVisit: 'April to October', avgFlightPrice: 950, popularOrigins: ['SIN', 'SYD', 'HKG', 'NRT'] },
  { city: 'Bangkok', country: 'Thailand', continent: 'Asia', slug: 'bangkok', description: 'Bustling capital known for ornate temples, vibrant street life, and incredible street food.', highlights: ['Grand Palace', 'Wat Pho', 'Chatuchak Market', 'Khao San Road'], bestTimeToVisit: 'November to February', avgFlightPrice: 750, popularOrigins: ['SIN', 'HKG', 'NRT', 'SYD'] }
]

export class ProgrammaticSEOEngine {
  /**
   * Generate all route combinations
   */
  generateRoutes(): RouteData[] {
    const routes: RouteData[] = []

    for (const origin of TOP_AIRPORTS) {
      for (const destCode of origin.popularRoutes) {
        const dest = TOP_AIRPORTS.find(a => a.code === destCode)
        if (!dest) continue

        routes.push({
          origin: origin.code,
          originCity: origin.city,
          originCountry: origin.country,
          destination: dest.code,
          destinationCity: dest.city,
          destinationCountry: dest.country,
          slug: `${origin.code.toLowerCase()}-to-${dest.code.toLowerCase()}`,
          avgPrice: Math.floor(300 + Math.random() * 800),
          lowestPrice: Math.floor(200 + Math.random() * 500),
          airlines: this.getAirlinesForRoute(origin.code, dest.code),
          flightDuration: this.estimateFlightDuration(origin, dest),
          popularity: Math.floor(Math.random() * 100)
        })
      }
    }

    return routes
  }

  /**
   * Get airlines operating a route
   */
  private getAirlinesForRoute(origin: string, destination: string): string[] {
    return TOP_AIRLINES
      .filter(a => a.popularRoutes.some(r => r.includes(origin) || r.includes(destination)))
      .map(a => a.name)
      .slice(0, 5)
  }

  /**
   * Estimate flight duration based on coordinates
   */
  private estimateFlightDuration(origin: AirportData, dest: AirportData): string {
    const R = 6371 // Earth's radius in km
    const dLat = (dest.latitude - origin.latitude) * Math.PI / 180
    const dLon = (dest.longitude - origin.longitude) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(origin.latitude * Math.PI / 180) * Math.cos(dest.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distance = R * c

    // Assume 800 km/h average speed + 1 hour for takeoff/landing
    const hours = Math.round(distance / 800 + 1)
    const minutes = Math.round((distance / 800 - Math.floor(distance / 800)) * 60)

    return `${hours}h ${minutes}m`
  }

  /**
   * Generate sitemap entries for all programmatic pages
   */
  generateSitemapEntries(): Array<{url: string, lastmod: string, changefreq: string, priority: number}> {
    const entries: Array<{url: string, lastmod: string, changefreq: string, priority: number}> = []
    const now = new Date().toISOString().split('T')[0]

    // Route pages
    for (const route of this.generateRoutes()) {
      entries.push({
        url: `/flights/${route.slug}`,
        lastmod: now,
        changefreq: 'daily',
        priority: 0.8
      })
    }

    // Airport pages
    for (const airport of TOP_AIRPORTS) {
      entries.push({
        url: `/airports/${airport.slug}`,
        lastmod: now,
        changefreq: 'weekly',
        priority: 0.7
      })
    }

    // Destination pages
    for (const dest of TOP_DESTINATIONS) {
      entries.push({
        url: `/destinations/${dest.slug}`,
        lastmod: now,
        changefreq: 'weekly',
        priority: 0.8
      })
    }

    // Airline pages
    for (const airline of TOP_AIRLINES) {
      entries.push({
        url: `/airlines/${airline.slug}`,
        lastmod: now,
        changefreq: 'weekly',
        priority: 0.7
      })
    }

    return entries
  }

  /**
   * Get route data by slug
   */
  getRouteBySlug(slug: string): RouteData | null {
    return this.generateRoutes().find(r => r.slug === slug) || null
  }

  /**
   * Get airport data by slug
   */
  getAirportBySlug(slug: string): AirportData | null {
    return TOP_AIRPORTS.find(a => a.slug === slug) || null
  }

  /**
   * Get destination data by slug
   */
  getDestinationBySlug(slug: string): DestinationData | null {
    return TOP_DESTINATIONS.find(d => d.slug === slug) || null
  }

  /**
   * Get airline data by slug
   */
  getAirlineBySlug(slug: string): AirlineData | null {
    return TOP_AIRLINES.find(a => a.slug === slug) || null
  }

  /**
   * Generate meta tags for a route page
   */
  generateRouteMeta(route: RouteData) {
    return {
      title: `${route.originCity} to ${route.destinationCity} Flights from $${route.lowestPrice} | Fly2Any`,
      description: `Find cheap flights from ${route.originCity} (${route.origin}) to ${route.destinationCity} (${route.destination}). Compare prices from ${route.airlines.slice(0, 3).join(', ')}. Book now from $${route.lowestPrice}.`,
      keywords: `${route.originCity} to ${route.destinationCity}, ${route.origin} to ${route.destination}, cheap flights, flight deals, ${route.airlines.join(', ')}`
    }
  }
}

export const seoEngine = new ProgrammaticSEOEngine()
