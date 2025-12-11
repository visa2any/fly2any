/**
 * Fly2Any Airline Data Service
 *
 * Comprehensive service for managing airline profiles from multiple sources:
 * - Duffel API
 * - Amadeus API
 * - Static data (lib/flights/airline-data.ts)
 * - External scrapers (future)
 *
 * Provides internal API and ML knowledge base integration
 */

import { getPrismaClient } from '@/lib/prisma';
import { AIRLINE_DATABASE, getAirlineData } from '@/lib/flights/airline-data';
import type { Prisma } from '@prisma/client';

const prisma = getPrismaClient();

// ==========================================
// Types
// ==========================================

export interface AirlineProfileInput {
  iataCode: string;
  name: string;
  icaoCode?: string;
  callsign?: string;
  shortName?: string;
  legalName?: string;
  alliance?: string;
  logoUrl?: string;
  logoUrlSvg?: string;
  brandPrimaryColor?: string;
  brandSecondaryColor?: string;
  country?: string;
  countryName?: string;
  headquarters?: string;
  foundedYear?: number;
  websiteUrl?: string;
  customerServicePhone?: string;
  hubAirports?: string[];
  loyaltyProgramName?: string;
  loyaltyTiers?: any;
  fleetSize?: number;
  averageFleetAge?: number;
  aircraftTypes?: string[];
  cabinClasses?: string[];
  hasPremiumEconomy?: boolean;
  hasLieFlat?: boolean;
  hasWifi?: boolean;
  wifiType?: string;
  hasIFE?: boolean;
  hasPowerOutlets?: boolean;
  mealService?: string;
  alcoholPolicy?: string;
  carryOnIncluded?: boolean;
  checkedBagIncluded?: boolean;
  firstBagFeeUSD?: number;
  secondBagFeeUSD?: number;
  overallRating?: number;
  onTimeRating?: number;
  comfortRating?: number;
  serviceRating?: number;
  valueRating?: number;
  onTimePercentage?: number;
  cancellationRate?: number;
  avgDelayMinutes?: number;
  duffelId?: string;
  amadeusId?: string;
  airlineType?: 'FSC' | 'LCC' | 'ULCC' | 'HYBRID' | 'REGIONAL' | 'CHARTER' | 'CARGO';
  isActive?: boolean;
  tags?: string[];
  dataSource?: string;
}

export interface AirlineSearchParams {
  query?: string;
  alliance?: string;
  country?: string;
  type?: string;
  hasWifi?: boolean;
  hasPremiumEconomy?: boolean;
  limit?: number;
  offset?: number;
}

// ==========================================
// Core Service Functions
// ==========================================

/**
 * Get airline profile by IATA code
 */
export async function getAirlineProfile(iataCode: string) {
  if (!prisma) return null;

  try {
    return await prisma.airlineProfile.findUnique({
      where: { iataCode: iataCode.toUpperCase() },
      include: {
        fleet: true,
        routes: { take: 50 },
        operationalStats: { take: 12, orderBy: { periodStart: 'desc' } },
      },
    });
  } catch (error) {
    console.error(`Error fetching airline profile for ${iataCode}:`, error);
    return null;
  }
}

/**
 * Search airline profiles
 */
export async function searchAirlineProfiles(params: AirlineSearchParams) {
  if (!prisma) return { airlines: [], total: 0 };

  const { query, alliance, country, type, hasWifi, hasPremiumEconomy, limit = 50, offset = 0 } = params;

  const where: Prisma.AirlineProfileWhereInput = {
    isActive: true,
  };

  if (query) {
    where.OR = [
      { iataCode: { contains: query.toUpperCase() } },
      { name: { contains: query, mode: 'insensitive' } },
      { shortName: { contains: query, mode: 'insensitive' } },
    ];
  }

  if (alliance) where.alliance = alliance;
  if (country) where.country = country.toUpperCase();
  if (type) where.airlineType = type as any;
  if (hasWifi !== undefined) where.hasWifi = hasWifi;
  if (hasPremiumEconomy !== undefined) where.hasPremiumEconomy = hasPremiumEconomy;

  try {
    const [airlines, total] = await Promise.all([
      prisma.airlineProfile.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { name: 'asc' },
      }),
      prisma.airlineProfile.count({ where }),
    ]);

    return { airlines, total };
  } catch (error) {
    console.error('Error searching airline profiles:', error);
    return { airlines: [], total: 0 };
  }
}

/**
 * Create or update airline profile
 */
export async function upsertAirlineProfile(data: AirlineProfileInput) {
  if (!prisma) return null;

  const iataCode = data.iataCode.toUpperCase();

  try {
    return await prisma.airlineProfile.upsert({
      where: { iataCode },
      create: {
        ...data,
        iataCode,
        hubAirports: data.hubAirports || [],
        aircraftTypes: data.aircraftTypes || [],
        cabinClasses: data.cabinClasses || [],
        tags: data.tags || [],
        descriptionEmbedding: [],
      },
      update: {
        ...data,
        iataCode,
        lastSyncedAt: new Date(),
      },
    });
  } catch (error) {
    console.error(`Error upserting airline profile for ${iataCode}:`, error);
    return null;
  }
}

/**
 * Bulk upsert airline profiles
 */
export async function bulkUpsertAirlineProfiles(airlines: AirlineProfileInput[]) {
  const results = {
    created: 0,
    updated: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const airline of airlines) {
    try {
      const existing = await prisma?.airlineProfile.findUnique({
        where: { iataCode: airline.iataCode.toUpperCase() },
      });

      await upsertAirlineProfile(airline);

      if (existing) {
        results.updated++;
      } else {
        results.created++;
      }
    } catch (error: any) {
      results.failed++;
      results.errors.push(`${airline.iataCode}: ${error.message}`);
    }
  }

  return results;
}

// ==========================================
// Data Ingestion Functions
// ==========================================

/**
 * Sync static airline data from lib/flights/airline-data.ts
 */
export async function syncStaticAirlineData() {
  console.log('🔄 Syncing static airline data...');
  const startTime = Date.now();

  const airlines: AirlineProfileInput[] = [];

  // Convert AIRLINE_DATABASE to AirlineProfileInput format
  for (const [code, data] of Object.entries(AIRLINE_DATABASE)) {
    airlines.push({
      iataCode: code,
      name: data.name,
      alliance: data.alliance?.toLowerCase().replace(' ', '_'),
      brandPrimaryColor: data.brandColors?.primary,
      brandSecondaryColor: data.brandColors?.secondary,
      hubAirports: data.hubAirports || [],
      loyaltyProgramName: data.frequentFlyerProgram,
      overallRating: data.ratings?.overall,
      onTimeRating: data.ratings?.onTimePerformance,
      comfortRating: data.ratings?.comfort,
      serviceRating: data.ratings?.service,
      airlineType: classifyAirlineType(code),
      tags: generateAirlineTags(code, data),
      dataSource: 'static',
    });
  }

  const results = await bulkUpsertAirlineProfiles(airlines);

  // Log sync
  if (prisma) {
    await prisma.airlineDataSyncLog.create({
      data: {
        source: 'static',
        status: results.failed > 0 ? 'partial' : 'completed',
        airlinesCreated: results.created,
        airlinesUpdated: results.updated,
        errorMessage: results.errors.length > 0 ? results.errors.join('; ') : null,
        duration: Date.now() - startTime,
      },
    });
  }

  console.log(`✅ Static sync complete: ${results.created} created, ${results.updated} updated, ${results.failed} failed`);
  return results;
}

/**
 * Extract airline data from Duffel flight search results
 */
export function extractAirlineFromDuffel(duffelAirline: any): AirlineProfileInput | null {
  if (!duffelAirline?.iata_code) return null;

  return {
    iataCode: duffelAirline.iata_code,
    name: duffelAirline.name || duffelAirline.iata_code,
    duffelId: duffelAirline.id,
    logoUrl: duffelAirline.logo_symbol_url || duffelAirline.logo_lockup_url,
    logoUrlSvg: duffelAirline.logo_symbol_url,
    dataSource: 'duffel',
  };
}

/**
 * Extract airline data from Amadeus flight search results
 */
export function extractAirlineFromAmadeus(amadeusAirline: any): AirlineProfileInput | null {
  if (!amadeusAirline?.iataCode) return null;

  return {
    iataCode: amadeusAirline.iataCode,
    name: amadeusAirline.businessName || amadeusAirline.commonName || amadeusAirline.iataCode,
    icaoCode: amadeusAirline.icaoCode,
    amadeusId: amadeusAirline.id,
    dataSource: 'amadeus',
  };
}

/**
 * Update airline from flight search (merge data)
 */
export async function updateAirlineFromFlightSearch(
  iataCode: string,
  source: 'duffel' | 'amadeus',
  data: Partial<AirlineProfileInput>
) {
  if (!prisma) return null;

  try {
    const existing = await prisma.airlineProfile.findUnique({
      where: { iataCode: iataCode.toUpperCase() },
    });

    if (existing) {
      // Merge: don't overwrite existing good data with API data
      const updates: Partial<AirlineProfileInput> = {};

      if (!existing.logoUrl && data.logoUrl) updates.logoUrl = data.logoUrl;
      if (!existing.duffelId && data.duffelId) updates.duffelId = data.duffelId;
      if (!existing.amadeusId && data.amadeusId) updates.amadeusId = data.amadeusId;

      if (Object.keys(updates).length > 0) {
        return await prisma.airlineProfile.update({
          where: { iataCode: iataCode.toUpperCase() },
          data: { ...updates, lastSyncedAt: new Date() },
        });
      }
    } else {
      // Create new airline with minimal data
      return await upsertAirlineProfile({
        iataCode,
        name: data.name || iataCode,
        ...data,
        dataSource: source,
      });
    }

    return existing;
  } catch (error) {
    console.error(`Error updating airline from ${source}:`, error);
    return null;
  }
}

// ==========================================
// Helper Functions
// ==========================================

/**
 * Classify airline type based on code
 */
function classifyAirlineType(code: string): 'FSC' | 'LCC' | 'ULCC' | 'HYBRID' | 'REGIONAL' {
  const ulccAirlines = ['F9', 'NK', 'G4', 'WO']; // Frontier, Spirit, Allegiant, Swoop
  const lccAirlines = ['WN', 'FR', 'U2', 'VY', 'W6', 'EW', 'DY', '6E']; // Southwest, Ryanair, easyJet, etc.
  const hybridAirlines = ['B6', 'AS', 'WS', 'HA']; // JetBlue, Alaska, WestJet, Hawaiian
  const regionalAirlines = ['OO', 'YX', 'MQ', 'OH', 'ZW', '9E']; // SkyWest, Republic, Envoy, etc.

  if (ulccAirlines.includes(code)) return 'ULCC';
  if (lccAirlines.includes(code)) return 'LCC';
  if (hybridAirlines.includes(code)) return 'HYBRID';
  if (regionalAirlines.includes(code)) return 'REGIONAL';
  return 'FSC';
}

/**
 * Generate tags for airline
 */
function generateAirlineTags(code: string, data: any): string[] {
  const tags: string[] = [];

  const type = classifyAirlineType(code);
  tags.push(type.toLowerCase());

  if (data.alliance) tags.push(data.alliance.toLowerCase().replace(' ', '_'));
  if (data.ratings?.overall >= 4.0) tags.push('highly_rated');
  if (data.ratings?.onTimePerformance >= 4.0) tags.push('punctual');
  if (data.hubAirports?.length >= 5) tags.push('major_carrier');

  return tags;
}

/**
 * Get all airlines by alliance
 */
export async function getAirlinesByAlliance(alliance: string) {
  if (!prisma) return [];

  return await prisma.airlineProfile.findMany({
    where: { alliance, isActive: true },
    orderBy: { name: 'asc' },
  });
}

/**
 * Get airline statistics
 */
export async function getAirlineStats() {
  if (!prisma) return null;

  const [total, byType, byAlliance] = await Promise.all([
    prisma.airlineProfile.count({ where: { isActive: true } }),
    prisma.airlineProfile.groupBy({
      by: ['airlineType'],
      _count: true,
      where: { isActive: true },
    }),
    prisma.airlineProfile.groupBy({
      by: ['alliance'],
      _count: true,
      where: { isActive: true, alliance: { not: null } },
    }),
  ]);

  return { total, byType, byAlliance };
}

// ==========================================
// Export
// ==========================================

export const airlineDataService = {
  getProfile: getAirlineProfile,
  search: searchAirlineProfiles,
  upsert: upsertAirlineProfile,
  bulkUpsert: bulkUpsertAirlineProfiles,
  syncStatic: syncStaticAirlineData,
  extractFromDuffel: extractAirlineFromDuffel,
  extractFromAmadeus: extractAirlineFromAmadeus,
  updateFromSearch: updateAirlineFromFlightSearch,
  getByAlliance: getAirlinesByAlliance,
  getStats: getAirlineStats,
};

export default airlineDataService;
