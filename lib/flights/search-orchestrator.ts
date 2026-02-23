import { amadeusAPI } from '@/lib/api/amadeus';
import { duffelAPI } from '@/lib/api/duffel';
import { getCityCode } from '@/lib/data/airport-helpers';
import { requestDeduplicator } from '@/lib/api/request-deduplicator';
import { smartAPISelector } from '@/lib/ml/api-selector';
import { routeProfiler } from '@/lib/ml/route-profiler';
import { groupDuffelFareVariants, deduplicateFlights } from '@/lib/flights/search-logic';
import { smartMixedCarrierSearch, mergeAndSortByPrice, addCheapestBadges, type SmartMixedCarrierResult, type OneWaySearchFunction } from '@/lib/flights/smart-mixed-carrier';
import type { FlightOffer } from '@/lib/flights/scoring';
import type { FlightOffer as TypedFlightOffer } from '@/lib/flights/types';

/**
 * Orchestrates multi-provider flight searches
 */
export class SearchOrchestrator {
  private CONCURRENCY_LIMIT = 8;

  async search(params: any, options: any) {
    const { originCodes, destinationCodes, departureDates, returnDates, travelClass, body } = params;
    const { includeSeparateTickets, oneWaySearchFunction } = options;

    const searchGroups = new Map<string, any>();
    const dateCombinations: { dep: string, ret?: string }[] = [];

    // 1. Generate date combinations
    departureDates.forEach((dep: string, idx: number) => {
      const ret = returnDates.length > idx ? returnDates[idx] : 
                 returnDates.length === 1 ? returnDates[0] : 
                 undefined;
      dateCombinations.push({ dep, ret });
    });

    // 2. Populate search groups (City Code Optimization)
    originCodes.forEach((originCode: string) => {
      destinationCodes.forEach((destinationCode: string) => {
        dateCombinations.forEach(dateCombo => {
          const originCity = getCityCode(originCode);
          const destCity = getCityCode(destinationCode);
          const key = `${originCity}-${destCity}-${dateCombo.dep}-${dateCombo.ret || 'one-way'}`;

          if (!searchGroups.has(key)) {
            searchGroups.set(key, { originCity, destCity, depDate: dateCombo.dep, retDate: dateCombo.ret, requestedPairs: [] });
          }
          searchGroups.get(key).requestedPairs.push({ origin: originCode, dest: destinationCode });
        });
      });
    });

    // 3. Execute tasks
    const allFlights: FlightOffer[] = [];
    let dictionaries: any = {};
    const itemsToProcess: (() => Promise<any>)[] = [];

    searchGroups.forEach((group) => {
      itemsToProcess.push(() => this.searchSingleRoute(group, travelClass, body, includeSeparateTickets, oneWaySearchFunction));
    });

    console.log(`🔍 Orchestrator: ${itemsToProcess.length} search group(s) to process`);

    const results = await this.executeParallel(itemsToProcess);

    results.forEach((result, idx) => {
      if (result) {
        if (result.flights && Array.isArray(result.flights)) {
          console.log(`  ✅ Group ${idx}: ${result.flights.length} flights returned`);
          allFlights.push(...result.flights);
        } else {
          console.warn(`  ⚠️ Group ${idx}: No valid flights array. result.flights type: ${typeof result.flights}, value:`, 
            result.flights ? `keys=[${Object.keys(result.flights).join(',')}]` : 'null/undefined');
        }
        if (result.dictionaries && Object.keys(result.dictionaries).length > 0) {
          dictionaries = { ...dictionaries, ...result.dictionaries };
        }
      } else {
        console.warn(`  ⚠️ Group ${idx}: Null result`);
      }
    });

    console.log(`🔍 Orchestrator: ${allFlights.length} total flights before dedup`);
    const dedupedFlights = deduplicateFlights(allFlights);
    console.log(`🔍 Orchestrator: ${dedupedFlights.length} flights after dedup`);
    return { flights: dedupedFlights, dictionaries };
  }

  private async executeParallel(tasks: (() => Promise<any>)[]) {
    const results: any[] = [];
    const executing: Promise<void>[] = [];

    for (const task of tasks) {
      const p = Promise.resolve().then(() => task());
      results.push(p);

      if (this.CONCURRENCY_LIMIT <= tasks.length) {
        const e: Promise<void> = p.then(() => {
          executing.splice(executing.indexOf(e), 1);
        });
        executing.push(e);
        if (executing.length >= this.CONCURRENCY_LIMIT) {
          await Promise.race(executing);
        }
      }
    }
    return Promise.all(results);
  }

  private async searchSingleRoute(group: any, travelClass: any, body: any, includeSeparateTickets?: boolean, oneWaySearchFunction?: OneWaySearchFunction) {
    const { originCity, destCity, depDate, retDate, requestedPairs } = group;

    try {
      const dedupResult = await requestDeduplicator.deduplicate(
        { origin: originCity, destination: destCity, departureDate: depDate, returnDate: retDate || null, adults: body.adults, travelClass },
        async () => {
          // ... API Selection logic ...
          let apiSelection = await smartAPISelector.selectAPIs({
            origin: originCity, destination: destCity, departureDate: depDate, returnDate: retDate, cabinClass: travelClass?.toLowerCase() || 'economy'
          });

          if (amadeusAPI.isTestMode()) {
            apiSelection = { strategy: 'duffel', confidence: 1.0, reason: 'Amadeus in test mode', estimatedSavings: 0 };
          }

          console.log(`  🔌 API Strategy for ${originCity}→${destCity}: ${apiSelection.strategy} (${apiSelection.reason})`);

          // 1. ALWAYS run the normal round-trip search first
          let amadeusResult, duffelResult;
          if (apiSelection.strategy === 'both') {
            [amadeusResult, duffelResult] = await Promise.allSettled([
              amadeusAPI.searchFlights({ ...body, origin: originCity, destination: destCity, departureDate: depDate, returnDate: retDate }),
              duffelAPI.isAvailable() ? duffelAPI.searchFlights({ origin: originCity, destination: destCity, departureDate: depDate, returnDate: retDate, adults: body.adults }) : Promise.resolve({ data: [] })
            ]);
          } else if (apiSelection.strategy === 'amadeus') {
            amadeusResult = { status: 'fulfilled' as const, value: await amadeusAPI.searchFlights({ ...body, origin: originCity, destination: destCity, departureDate: depDate, returnDate: retDate }) };
            duffelResult = { status: 'fulfilled' as const, value: { data: [] } };
          } else {
            amadeusResult = { status: 'fulfilled' as const, value: { data: [], dictionaries: {} } };
            duffelResult = { status: 'fulfilled' as const, value: await duffelAPI.searchFlights({ origin: originCity, destination: destCity, departureDate: depDate, returnDate: retDate, adults: body.adults }) };
          }

          // Log API results with details
          if (amadeusResult.status === 'rejected') {
            console.error(`  ❌ Amadeus FAILED for ${originCity}→${destCity}: ${(amadeusResult as any).reason?.message || 'Unknown error'}`);
          } else {
            console.log(`  ✅ Amadeus OK: ${Array.isArray(amadeusResult.value?.data) ? amadeusResult.value.data.length : 0} results`);
          }

          if (duffelResult.status === 'rejected') {
            console.error(`  ❌ Duffel FAILED for ${originCity}→${destCity}: ${(duffelResult as any).reason?.message || 'Unknown error'}`);
          } else {
            console.log(`  ✅ Duffel OK: ${Array.isArray(duffelResult.value?.data) ? duffelResult.value.data.length : 0} results`);
          }

          const amadeusFlights = amadeusResult.status === 'fulfilled' ? (amadeusResult.value.data || []) : [];
          const duffelFlights = duffelResult.status === 'fulfilled' ? (duffelResult.value.data || []) : [];

          const groupedDuffel = groupDuffelFareVariants(duffelFlights);
          const safeAmadeus = Array.isArray(amadeusFlights) ? amadeusFlights : [];
          const safeDuffel = Array.isArray(groupedDuffel) ? groupedDuffel : [];
          let merged = [...safeAmadeus, ...safeDuffel];

          console.log(`  📊 Merged: ${merged.length} flights (Amadeus: ${safeAmadeus.length}, Duffel: ${safeDuffel.length})`);

          // Filter by requested pairs
          let filtered = merged.filter(flight => {
            return requestedPairs.some((pair: any) => {
              const outbound = flight.itineraries?.[0]?.segments;
              if (!outbound || outbound.length === 0) return false;
              
              const match = outbound[0].departure.iataCode === pair.origin && outbound[outbound.length - 1].arrival.iataCode === pair.dest;
              if (match && flight.itineraries && flight.itineraries.length > 1) {
                const inbound = flight.itineraries[1]?.segments;
                if (!inbound || !Array.isArray(inbound) || inbound.length === 0) return false;
                return inbound[0].departure?.iataCode === pair.dest && inbound[inbound.length - 1].arrival?.iataCode === pair.origin;
              }
              return match;
            });
          });

          console.log(`  📊 After pair filter: ${filtered.length} flights (from ${merged.length})`);
          if (filtered.length === 0 && merged.length > 0) {
            // Debug: why did the pair filter remove everything?
            console.warn(`  ⚠️ PAIR FILTER REMOVED ALL FLIGHTS! requestedPairs:`, JSON.stringify(requestedPairs));
            if (merged.length > 0) {
              const sample = merged[0];
              const outbound = sample.itineraries?.[0]?.segments;
              console.warn(`  ⚠️ Sample flight: ${outbound?.[0]?.departure?.iataCode || '?'} → ${outbound?.[outbound?.length - 1]?.arrival?.iataCode || '?'}`);
              if (sample.itineraries?.length > 1) {
                const inbound = sample.itineraries[1]?.segments;
                console.warn(`  ⚠️ Return: ${inbound?.[0]?.departure?.iataCode || '?'} → ${inbound?.[inbound?.length - 1]?.arrival?.iataCode || '?'}`);
              }
            }
          }

          // 2. OPTIONALLY merge mixed-carrier results on top of regular results
          if (includeSeparateTickets && oneWaySearchFunction && retDate) {
            try {
              const mixedResults = await smartMixedCarrierSearch(
                filtered, // Pass round-trip flights for comparison
                {
                  origin: originCity,
                  destination: destCity,
                  departureDate: depDate,
                  returnDate: retDate,
                  adults: body.adults,
                  cabinClass: travelClass
                }, 
                oneWaySearchFunction
              );
               
              if (mixedResults.flights && Array.isArray(mixedResults.flights) && mixedResults.flights.length > 0) {
                console.log(`  🎫 Mixed-carrier: ${mixedResults.flights.length} total (mixed + round-trip merged)`);
                filtered = mixedResults.flights;
              }
            } catch (mixedError: any) {
              console.warn('  ⚠️ Mixed-carrier search failed, using regular results:', mixedError.message);
              // Continue with regular results - don't fail the entire search
            }
          }

          // Return flights array directly (not nested in "data")
          return { flights: filtered, dictionaries: amadeusResult.status === 'fulfilled' ? (amadeusResult.value as any).dictionaries || {} : {} };
        }
      );

      // 🔧 CRITICAL FIX: requestDeduplicator.deduplicate() returns { data: T, deduped, waiters }
      // The executor returns { flights: [...], dictionaries: {} }
      // So dedupResult.data = { flights: [...], dictionaries: {} }
      const innerResult = dedupResult.data;
      
      console.log(`  📦 Route ${originCity}→${destCity}: ${innerResult?.flights?.length || 0} flights (deduped: ${dedupResult.deduped})`);

      return { 
        flights: innerResult?.flights || [], 
        dictionaries: innerResult?.dictionaries || {} 
      };
    } catch (error: any) {
      console.error(`  ❌ searchSingleRoute FAILED for ${originCity}→${destCity}:`, error.message);
      // Return empty results instead of crashing the entire search
      return { flights: [], dictionaries: {} };
    }
  }
}

export const searchOrchestrator = new SearchOrchestrator();
