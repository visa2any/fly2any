/**
 * Fly2Any Aviation Intelligence Service
 *
 * Comprehensive service for extracting and storing ALL aviation data from flight searches.
 * Captures: Aircraft, Airports, Airlines, Routes, Fare Classes, Flight Schedules, Price Trends
 *
 * This builds the most powerful aviation knowledge base by learning from every search.
 */

import { getPrismaClient } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

const prisma = getPrismaClient();

// ==========================================
// Types for Duffel Response Extraction
// ==========================================

interface DuffelOffer {
  id: string;
  owner: DuffelAirline;
  slices: DuffelSlice[];
  passengers: DuffelPassenger[];
  total_amount: string;
  total_currency: string;
  base_amount?: string;
  tax_amount?: string;
  conditions?: DuffelConditions;
  available_services?: any[];
  payment_requirements?: any;
  live_mode: boolean;
}

interface DuffelSlice {
  origin: DuffelAirport;
  destination: DuffelAirport;
  duration: string;
  segments: DuffelSegment[];
  fare_brand_name?: string;
}

interface DuffelSegment {
  id: string;
  origin: DuffelAirport;
  destination: DuffelAirport;
  departing_at: string;
  arriving_at: string;
  duration: string;
  marketing_carrier: DuffelAirline;
  marketing_carrier_flight_number: string;
  operating_carrier: DuffelAirline;
  operating_carrier_flight_number?: string;
  aircraft?: DuffelAircraft;
  passengers: DuffelSegmentPassenger[];
  origin_terminal?: string;
  destination_terminal?: string;
  distance?: string;
}

interface DuffelAirport {
  id?: string;
  iata_code: string;
  iata_city_code?: string;
  iata_country_code?: string;
  name: string;
  city_name?: string;
  city?: { name: string };
  latitude?: number;
  longitude?: number;
  time_zone?: string;
}

interface DuffelAirline {
  id?: string;
  iata_code: string;
  name: string;
  logo_symbol_url?: string;
  logo_lockup_url?: string;
}

interface DuffelAircraft {
  id?: string;
  iata_code: string;
  name: string;
}

interface DuffelPassenger {
  id: string;
  type: string;
  given_name?: string;
  family_name?: string;
}

interface DuffelSegmentPassenger {
  passenger_id: string;
  cabin_class: string;
  cabin_class_marketing_name?: string;
  fare_basis_code?: string;
  baggages?: DuffelBaggage[];
}

interface DuffelBaggage {
  type: string;
  quantity: number;
}

interface DuffelConditions {
  refund_before_departure?: { allowed: boolean; penalty_amount?: string; penalty_currency?: string };
  change_before_departure?: { allowed: boolean; penalty_amount?: string; penalty_currency?: string };
}

// ==========================================
// Extraction Results
// ==========================================

export interface ExtractionResult {
  airlines: { processed: number; created: number; updated: number };
  aircraft: { processed: number; created: number; updated: number };
  airports: { processed: number; created: number; updated: number };
  routes: { processed: number; created: number; updated: number };
  flights: { processed: number; created: number };
  fareClasses: { processed: number; created: number; updated: number };
  priceTrends: { processed: number; created: number };
  duration: number;
}

// ==========================================
// Main Extraction Function
// ==========================================

/**
 * Extract ALL aviation data from Duffel offers
 * This is the master function that captures everything
 */
export async function extractAllAviationData(offers: DuffelOffer[]): Promise<ExtractionResult> {
  const startTime = Date.now();

  const result: ExtractionResult = {
    airlines: { processed: 0, created: 0, updated: 0 },
    aircraft: { processed: 0, created: 0, updated: 0 },
    airports: { processed: 0, created: 0, updated: 0 },
    routes: { processed: 0, created: 0, updated: 0 },
    flights: { processed: 0, created: 0 },
    fareClasses: { processed: 0, created: 0, updated: 0 },
    priceTrends: { processed: 0, created: 0 },
    duration: 0,
  };

  if (!offers || offers.length === 0 || !prisma) {
    result.duration = Date.now() - startTime;
    return result;
  }

  // Deduplicate data to extract
  const airlines = new Map<string, DuffelAirline>();
  const aircraft = new Map<string, DuffelAircraft>();
  const airports = new Map<string, DuffelAirport>();
  const routes = new Map<string, { origin: string; destination: string; airlines: Set<string>; durations: number[] }>();
  const fareClasses = new Map<string, { code: string; name: string; cabin: string; airline: string }>();

  // Process all offers
  for (const offer of offers) {
    // Extract owner airline
    if (offer.owner?.iata_code) {
      airlines.set(offer.owner.iata_code, offer.owner);
    }

    // Process slices
    for (const slice of offer.slices || []) {
      // Extract airports
      if (slice.origin?.iata_code) airports.set(slice.origin.iata_code, slice.origin);
      if (slice.destination?.iata_code) airports.set(slice.destination.iata_code, slice.destination);

      // Extract route
      const routeKey = `${slice.origin?.iata_code}-${slice.destination?.iata_code}`;
      const durationMinutes = parseDuration(slice.duration);
      if (routeKey && slice.origin?.iata_code && slice.destination?.iata_code) {
        const existing = routes.get(routeKey) || {
          origin: slice.origin.iata_code,
          destination: slice.destination.iata_code,
          airlines: new Set<string>(),
          durations: [],
        };
        if (offer.owner?.iata_code) existing.airlines.add(offer.owner.iata_code);
        if (durationMinutes) existing.durations.push(durationMinutes);
        routes.set(routeKey, existing);
      }

      // Process segments
      for (const segment of slice.segments || []) {
        // Airlines
        if (segment.marketing_carrier?.iata_code) {
          airlines.set(segment.marketing_carrier.iata_code, segment.marketing_carrier);
        }
        if (segment.operating_carrier?.iata_code) {
          airlines.set(segment.operating_carrier.iata_code, segment.operating_carrier);
        }

        // Aircraft
        if (segment.aircraft?.iata_code) {
          aircraft.set(segment.aircraft.iata_code, segment.aircraft);
        }

        // Segment airports
        if (segment.origin?.iata_code) airports.set(segment.origin.iata_code, segment.origin);
        if (segment.destination?.iata_code) airports.set(segment.destination.iata_code, segment.destination);

        // Fare classes from passengers
        for (const pax of segment.passengers || []) {
          if (pax.fare_basis_code && pax.cabin_class) {
            const fcKey = `${pax.fare_basis_code}-${segment.marketing_carrier?.iata_code || 'XX'}`;
            fareClasses.set(fcKey, {
              code: pax.fare_basis_code,
              name: pax.cabin_class_marketing_name || pax.cabin_class,
              cabin: pax.cabin_class,
              airline: segment.marketing_carrier?.iata_code || '',
            });
          }
        }
      }
    }
  }

  // Execute all extractions in parallel
  const [airlineResult, aircraftResult, airportResult, routeResult, fareResult] = await Promise.all([
    extractAirlines(Array.from(airlines.values())),
    extractAircraft(Array.from(aircraft.values())),
    extractAirports(Array.from(airports.values())),
    extractRoutes(routes),
    extractFareClasses(Array.from(fareClasses.values())),
  ]);

  // Extract flight records and price trends
  const [flightResult, priceResult] = await Promise.all([
    extractFlightRecords(offers),
    extractPriceTrends(offers),
  ]);

  result.airlines = airlineResult;
  result.aircraft = aircraftResult;
  result.airports = airportResult;
  result.routes = routeResult;
  result.fareClasses = fareResult;
  result.flights = flightResult;
  result.priceTrends = priceResult;
  result.duration = Date.now() - startTime;

  // Log sync
  await logSync(result);

  return result;
}

// ==========================================
// Individual Extraction Functions
// ==========================================

async function extractAirlines(airlines: DuffelAirline[]): Promise<{ processed: number; created: number; updated: number }> {
  const result = { processed: 0, created: 0, updated: 0 };
  if (!prisma || airlines.length === 0) return result;

  for (const airline of airlines) {
    if (!airline.iata_code) continue;
    result.processed++;

    try {
      const existing = await prisma.airlineProfile.findUnique({
        where: { iataCode: airline.iata_code.toUpperCase() },
      });

      if (existing) {
        // Update with new data if missing
        const updates: any = {};
        if (!existing.duffelId && airline.id) updates.duffelId = airline.id;
        if (!existing.logoUrl && airline.logo_symbol_url) updates.logoUrl = airline.logo_symbol_url;

        if (Object.keys(updates).length > 0) {
          await prisma.airlineProfile.update({
            where: { iataCode: airline.iata_code.toUpperCase() },
            data: { ...updates, lastSyncedAt: new Date() },
          });
          result.updated++;
        }
      } else {
        // Create new airline
        await prisma.airlineProfile.create({
          data: {
            iataCode: airline.iata_code.toUpperCase(),
            name: airline.name || airline.iata_code,
            duffelId: airline.id,
            logoUrl: airline.logo_symbol_url || airline.logo_lockup_url,
            dataSource: 'duffel',
            descriptionEmbedding: [],
            hubAirports: [],
            aircraftTypes: [],
            cabinClasses: [],
            tags: [],
          },
        });
        result.created++;
      }
    } catch (error: any) {
      console.warn(`Failed to upsert airline ${airline.iata_code}:`, error.message);
    }
  }

  return result;
}

async function extractAircraft(aircraftList: DuffelAircraft[]): Promise<{ processed: number; created: number; updated: number }> {
  const result = { processed: 0, created: 0, updated: 0 };
  if (!prisma || aircraftList.length === 0) return result;

  for (const ac of aircraftList) {
    if (!ac.iata_code) continue;
    result.processed++;

    try {
      const existing = await prisma.aircraft.findUnique({
        where: { iataCode: ac.iata_code },
      });

      if (existing) {
        // Already exists, maybe update name
        if (ac.name && ac.name !== existing.fullName) {
          await prisma.aircraft.update({
            where: { iataCode: ac.iata_code },
            data: { fullName: ac.name, lastUpdated: new Date() },
          });
          result.updated++;
        }
      } else {
        // Parse aircraft info
        const parsed = parseAircraftName(ac.name || ac.iata_code);

        await prisma.aircraft.create({
          data: {
            iataCode: ac.iata_code,
            manufacturer: parsed.manufacturer,
            model: parsed.model,
            fullName: ac.name || ac.iata_code,
            family: parsed.family,
            category: parsed.category as any,
            hasWideBody: parsed.isWidebody,
            aisleCount: parsed.isWidebody ? 2 : 1,
            dataSource: 'duffel',
            operators: [],
          },
        });
        result.created++;
      }
    } catch (error: any) {
      console.warn(`Failed to upsert aircraft ${ac.iata_code}:`, error.message);
    }
  }

  return result;
}

async function extractAirports(airportList: DuffelAirport[]): Promise<{ processed: number; created: number; updated: number }> {
  const result = { processed: 0, created: 0, updated: 0 };
  if (!prisma || airportList.length === 0) return result;

  for (const apt of airportList) {
    if (!apt.iata_code) continue;
    result.processed++;

    try {
      const existing = await prisma.airport.findUnique({
        where: { iataCode: apt.iata_code.toUpperCase() },
      });

      if (existing) {
        // Update with additional data
        const updates: any = {};
        if (!existing.duffelId && apt.id) updates.duffelId = apt.id;
        if (!existing.latitude && apt.latitude) updates.latitude = apt.latitude;
        if (!existing.longitude && apt.longitude) updates.longitude = apt.longitude;
        if (!existing.timezone && apt.time_zone) updates.timezone = apt.time_zone;
        if (!existing.cityCode && apt.iata_city_code) updates.cityCode = apt.iata_city_code;

        if (Object.keys(updates).length > 0) {
          await prisma.airport.update({
            where: { iataCode: apt.iata_code.toUpperCase() },
            data: { ...updates, lastUpdated: new Date() },
          });
          result.updated++;
        }
      } else {
        // Create new airport
        await prisma.airport.create({
          data: {
            iataCode: apt.iata_code.toUpperCase(),
            name: apt.name || apt.iata_code,
            city: apt.city_name || apt.city?.name || apt.name || apt.iata_code,
            cityCode: apt.iata_city_code,
            country: apt.iata_country_code || 'XX',
            latitude: apt.latitude,
            longitude: apt.longitude,
            timezone: apt.time_zone,
            duffelId: apt.id,
            dataSource: 'duffel',
            hubFor: [],
          },
        });
        result.created++;
      }
    } catch (error: any) {
      console.warn(`Failed to upsert airport ${apt.iata_code}:`, error.message);
    }
  }

  return result;
}

async function extractRoutes(
  routes: Map<string, { origin: string; destination: string; airlines: Set<string>; durations: number[] }>
): Promise<{ processed: number; created: number; updated: number }> {
  const result = { processed: 0, created: 0, updated: 0 };
  if (!prisma || routes.size === 0) return result;

  for (const [routeKey, data] of routes) {
    result.processed++;

    try {
      const avgDuration = data.durations.length > 0
        ? Math.round(data.durations.reduce((a, b) => a + b, 0) / data.durations.length)
        : null;

      const existing = await prisma.routeStatistics.findUnique({
        where: { routeKey },
      });

      if (existing) {
        // Merge airlines and update
        const existingAirlines = new Set(existing.operatingAirlines || []);
        data.airlines.forEach((a) => existingAirlines.add(a));

        await prisma.routeStatistics.update({
          where: { routeKey },
          data: {
            operatingAirlines: Array.from(existingAirlines),
            carrierCount: existingAirlines.size,
            dataPoints: existing.dataPoints + 1,
            flightTimeMin: avgDuration || existing.flightTimeMin,
            lastAnalyzed: new Date(),
          },
        });
        result.updated++;
      } else {
        await prisma.routeStatistics.create({
          data: {
            routeKey,
            originIata: data.origin,
            destinationIata: data.destination,
            operatingAirlines: Array.from(data.airlines),
            carrierCount: data.airlines.size,
            flightTimeMin: avgDuration,
            dataPoints: 1,
            peakMonths: [],
          },
        });
        result.created++;
      }
    } catch (error: any) {
      console.warn(`Failed to upsert route ${routeKey}:`, error.message);
    }
  }

  return result;
}

async function extractFareClasses(
  fareClasses: Array<{ code: string; name: string; cabin: string; airline: string }>
): Promise<{ processed: number; created: number; updated: number }> {
  const result = { processed: 0, created: 0, updated: 0 };
  if (!prisma || fareClasses.length === 0) return result;

  for (const fc of fareClasses) {
    if (!fc.code) continue;
    result.processed++;

    try {
      const cabinClass = mapCabinClass(fc.cabin);
      const airlineCode = fc.airline || null;

      const existing = await prisma.fareClass.findFirst({
        where: { code: fc.code, airlineCode },
      });

      if (existing) {
        // Update name if better
        if (fc.name && fc.name !== existing.name && fc.name !== fc.cabin) {
          await prisma.fareClass.update({
            where: { id: existing.id },
            data: { name: fc.name, brandName: fc.name },
          });
          result.updated++;
        }
      } else {
        await prisma.fareClass.create({
          data: {
            code: fc.code,
            airlineCode,
            name: fc.name || fc.cabin,
            brandName: fc.name !== fc.cabin ? fc.name : null,
            cabinClass,
            bookingClasses: [fc.code],
            dataSource: 'duffel',
          },
        });
        result.created++;
      }
    } catch (error: any) {
      console.warn(`Failed to upsert fare class ${fc.code}:`, error.message);
    }
  }

  return result;
}

async function extractFlightRecords(offers: DuffelOffer[]): Promise<{ processed: number; created: number }> {
  const result = { processed: 0, created: 0 };
  if (!prisma || offers.length === 0) return result;

  // Only sample a subset to avoid database bloat
  const sampled = offers.slice(0, Math.min(10, offers.length));

  for (const offer of sampled) {
    for (const slice of offer.slices || []) {
      for (const segment of slice.segments || []) {
        result.processed++;

        try {
          // Get airport IDs
          const [originApt, destApt] = await Promise.all([
            prisma.airport.findUnique({ where: { iataCode: segment.origin?.iata_code?.toUpperCase() || '' } }),
            prisma.airport.findUnique({ where: { iataCode: segment.destination?.iata_code?.toUpperCase() || '' } }),
          ]);

          if (!originApt || !destApt) continue;

          const departureDate = new Date(segment.departing_at);
          const cabinClass = segment.passengers?.[0]?.cabin_class || 'economy';
          const price = parseFloat(offer.total_amount);

          await prisma.flightRecord.create({
            data: {
              flightNumber: `${segment.marketing_carrier?.iata_code || 'XX'}${segment.marketing_carrier_flight_number || ''}`,
              airlineCode: segment.marketing_carrier?.iata_code || 'XX',
              operatingCarrier: segment.operating_carrier?.iata_code !== segment.marketing_carrier?.iata_code
                ? segment.operating_carrier?.iata_code
                : null,
              originId: originApt.id,
              destinationId: destApt.id,
              originIata: segment.origin?.iata_code?.toUpperCase() || '',
              destinationIata: segment.destination?.iata_code?.toUpperCase() || '',
              aircraftIata: segment.aircraft?.iata_code,
              aircraftName: segment.aircraft?.name,
              departureDate,
              departureTime: departureDate.toISOString().substring(11, 16),
              durationMinutes: parseDuration(segment.duration),
              economyPrice: cabinClass === 'economy' ? price : null,
              businessPrice: cabinClass === 'business' ? price : null,
              firstPrice: cabinClass === 'first' ? price : null,
              currency: offer.total_currency,
              fareClass: segment.passengers?.[0]?.fare_basis_code,
              offerId: offer.id,
              source: 'duffel',
            },
          });
          result.created++;
        } catch (error: any) {
          // Likely duplicate, ignore
        }
      }
    }
  }

  return result;
}

async function extractPriceTrends(offers: DuffelOffer[]): Promise<{ processed: number; created: number }> {
  const result = { processed: 0, created: 0 };
  if (!prisma || offers.length === 0) return result;

  // Group by route
  const routePrices = new Map<string, { prices: number[]; departureDates: Date[] }>();

  for (const offer of offers) {
    const firstSlice = offer.slices?.[0];
    if (!firstSlice?.origin?.iata_code || !firstSlice?.destination?.iata_code) continue;

    const routeKey = `${firstSlice.origin.iata_code}-${firstSlice.destination.iata_code}`;
    const existing = routePrices.get(routeKey) || { prices: [], departureDates: [] };

    existing.prices.push(parseFloat(offer.total_amount));

    const firstSegment = firstSlice.segments?.[0];
    if (firstSegment?.departing_at) {
      existing.departureDates.push(new Date(firstSegment.departing_at));
    }

    routePrices.set(routeKey, existing);
    result.processed++;
  }

  // Create price trend records
  const searchDate = new Date();
  for (const [routeKey, data] of routePrices) {
    if (data.prices.length === 0) continue;

    const [origin, dest] = routeKey.split('-');
    const departureDate = data.departureDates[0] || new Date();
    const daysInAdvance = Math.ceil((departureDate.getTime() - searchDate.getTime()) / (1000 * 60 * 60 * 24));

    const prices = data.prices.sort((a, b) => a - b);

    try {
      await prisma.priceTrend.create({
        data: {
          originIata: origin,
          destinationIata: dest,
          searchDate,
          departureDate,
          daysInAdvance: Math.max(0, daysInAdvance),
          economyMin: prices[0],
          economyAvg: prices.reduce((a, b) => a + b, 0) / prices.length,
          economyMax: prices[prices.length - 1],
          currency: offers[0]?.total_currency || 'USD',
          offersCount: prices.length,
          source: 'duffel',
        },
      });
      result.created++;
    } catch (error: any) {
      // Ignore duplicates
    }
  }

  return result;
}

// ==========================================
// Helper Functions
// ==========================================

function parseDuration(duration?: string): number | null {
  if (!duration) return null;
  // Format: "PT5H30M" or "5:30"
  const match = duration.match(/PT(\d+)H(\d+)?M?/);
  if (match) {
    return parseInt(match[1]) * 60 + (parseInt(match[2]) || 0);
  }
  const colonMatch = duration.match(/(\d+):(\d+)/);
  if (colonMatch) {
    return parseInt(colonMatch[1]) * 60 + parseInt(colonMatch[2]);
  }
  return null;
}

function parseAircraftName(name: string): {
  manufacturer: string;
  model: string;
  family: string;
  category: string;
  isWidebody: boolean;
} {
  const lowerName = name.toLowerCase();

  // Widebody detection
  const widebodies = ['777', '787', '747', '767', 'a330', 'a340', 'a350', 'a380'];
  const isWidebody = widebodies.some((wb) => lowerName.includes(wb));

  // Regional detection
  const regionals = ['crj', 'erj', 'embraer e1', 'e170', 'e175', 'e190', 'e195'];
  const isRegional = regionals.some((r) => lowerName.includes(r));

  // Turboprop detection
  const turboprops = ['atr', 'dash', 'q400', 'dhc'];
  const isTurboprop = turboprops.some((t) => lowerName.includes(t));

  // Manufacturer detection
  let manufacturer = 'Unknown';
  let family = '';
  if (lowerName.includes('boeing') || lowerName.includes('737') || lowerName.includes('747') ||
      lowerName.includes('757') || lowerName.includes('767') || lowerName.includes('777') ||
      lowerName.includes('787')) {
    manufacturer = 'Boeing';
    const familyMatch = name.match(/7[0-9]{2}/);
    if (familyMatch) family = familyMatch[0];
  } else if (lowerName.includes('airbus') || lowerName.match(/a[23][0-9]{2}/)) {
    manufacturer = 'Airbus';
    const familyMatch = name.match(/A[23][0-9]{2}/i);
    if (familyMatch) family = familyMatch[0].toUpperCase();
  } else if (lowerName.includes('embraer') || lowerName.match(/e[0-9]{3}/)) {
    manufacturer = 'Embraer';
    const familyMatch = name.match(/E[0-9]{3}/i);
    if (familyMatch) family = familyMatch[0].toUpperCase();
  } else if (lowerName.includes('bombardier') || lowerName.includes('crj')) {
    manufacturer = 'Bombardier';
    family = 'CRJ';
  } else if (lowerName.includes('atr')) {
    manufacturer = 'ATR';
    family = 'ATR';
  }

  let category = 'NARROWBODY';
  if (isWidebody) category = 'WIDEBODY';
  else if (isRegional) category = 'REGIONAL_JET';
  else if (isTurboprop) category = 'TURBOPROP';

  return {
    manufacturer,
    model: name,
    family,
    category,
    isWidebody,
  };
}

function mapCabinClass(cabin: string): 'FIRST' | 'BUSINESS' | 'PREMIUM_ECONOMY' | 'ECONOMY' | 'BASIC_ECONOMY' {
  const lower = cabin.toLowerCase();
  if (lower.includes('first')) return 'FIRST';
  if (lower.includes('business')) return 'BUSINESS';
  if (lower.includes('premium')) return 'PREMIUM_ECONOMY';
  if (lower.includes('basic')) return 'BASIC_ECONOMY';
  return 'ECONOMY';
}

async function logSync(result: ExtractionResult): Promise<void> {
  if (!prisma) return;

  try {
    await prisma.aviationDataSyncLog.create({
      data: {
        entityType: 'all',
        source: 'duffel',
        operation: 'extract',
        status: 'success',
        recordsProcessed:
          result.airlines.processed +
          result.aircraft.processed +
          result.airports.processed +
          result.routes.processed +
          result.flights.processed +
          result.fareClasses.processed +
          result.priceTrends.processed,
        recordsCreated:
          result.airlines.created +
          result.aircraft.created +
          result.airports.created +
          result.routes.created +
          result.flights.created +
          result.fareClasses.created +
          result.priceTrends.created,
        recordsUpdated:
          result.airlines.updated +
          result.aircraft.updated +
          result.airports.updated +
          result.routes.updated +
          result.fareClasses.updated,
        recordsFailed: 0,
        durationMs: result.duration,
        metadata: result as any,
      },
    });
  } catch (error) {
    console.warn('Failed to log sync:', error);
  }
}

// ==========================================
// Query Functions for Knowledge
// ==========================================

export async function getAircraftByCode(iataCode: string) {
  return prisma?.aircraft.findUnique({
    where: { iataCode },
    include: { seatMaps: true },
  });
}

export async function getAirportByCode(iataCode: string) {
  return prisma?.airport.findUnique({
    where: { iataCode: iataCode.toUpperCase() },
  });
}

export async function getRouteStats(origin: string, destination: string) {
  const routeKey = `${origin.toUpperCase()}-${destination.toUpperCase()}`;
  return prisma?.routeStatistics.findUnique({
    where: { routeKey },
  });
}

export async function getPriceTrends(origin: string, destination: string, days: number = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  return prisma?.priceTrend.findMany({
    where: {
      originIata: origin.toUpperCase(),
      destinationIata: destination.toUpperCase(),
      searchDate: { gte: since },
    },
    orderBy: { searchDate: 'desc' },
  });
}

export async function getAviationStats() {
  if (!prisma) return null;

  const [airlines, aircraft, airports, routes, flights, fareClasses, priceTrends] = await Promise.all([
    prisma.airlineProfile.count(),
    prisma.aircraft.count(),
    prisma.airport.count(),
    prisma.routeStatistics.count(),
    prisma.flightRecord.count(),
    prisma.fareClass.count(),
    prisma.priceTrend.count(),
  ]);

  return { airlines, aircraft, airports, routes, flights, fareClasses, priceTrends };
}

// ==========================================
// Export
// ==========================================

export const aviationIntelligence = {
  extractAll: extractAllAviationData,
  getAircraft: getAircraftByCode,
  getAirport: getAirportByCode,
  getRouteStats,
  getPriceTrends,
  getStats: getAviationStats,
};

export default aviationIntelligence;
