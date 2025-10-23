/**
 * Test meal service display for Premium/Business/First class flights
 * Analyzes Amadeus API amenities data to understand why "None" or "Refreshments" appears
 */

const response = await fetch('http://localhost:3000/api/flights/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    origin: 'JFK',
    destination: 'GRU',
    departureDate: '2025-10-25',
    adults: 1,
    children: 0,
    infants: 0,
    travelClass: 'BUSINESS', // Request Business class
  }),
});

const data = await response.json();

console.log('🔍 MEAL SERVICE ANALYSIS FOR PREMIUM CABINS\n');
console.log('='.repeat(80));

if (data.error) {
  console.error('❌ API Error:', data.error);
  process.exit(1);
}

const flights = data.flights || data.data || [];

if (flights.length === 0) {
  console.log('❌ No flights returned');
  process.exit(1);
}

console.log(`\n📊 Analyzing ${flights.length} flights (showing first 5 detailed):\n`);

// Analyze first 5 flights in detail
for (let i = 0; i < Math.min(5, flights.length); i++) {
  const flight = flights[i];
  const travelerPricing = flight.travelerPricings?.[0];

  if (!travelerPricing) {
    console.log(`\nFlight ${i + 1}: ❌ No travelerPricing data`);
    continue;
  }

  const outboundFare = travelerPricing.fareDetailsBySegment?.[0];
  const returnFare = travelerPricing.fareDetailsBySegment?.[1];

  console.log(`\n${'='.repeat(80)}`);
  console.log(`FLIGHT ${i + 1}:`);
  console.log(`${'='.repeat(80)}`);

  // Basic info
  const airline = flight.validatingAirlineCodes?.[0] || 'Unknown';
  const price = `${flight.price.currency} ${flight.price.total}`;
  const outboundCabin = outboundFare?.cabin || 'NOT_FOUND';
  const returnCabin = returnFare?.cabin || 'N/A';

  console.log(`\n📍 Basic Info:`);
  console.log(`   Airline: ${airline}`);
  console.log(`   Price: ${price}`);
  console.log(`   Outbound cabin: ${outboundCabin}`);
  console.log(`   Return cabin: ${returnCabin}`);

  // Outbound segment amenities analysis
  console.log(`\n🎒 Outbound Segment:`);

  const outboundAmenities = outboundFare?.amenities || [];
  console.log(`   Amenities array length: ${outboundAmenities.length}`);

  if (outboundAmenities.length === 0) {
    console.log(`   ⚠️  EMPTY amenities array → Will use ESTIMATED data`);
    console.log(`   → Aircraft code: ${flight.itineraries?.[0]?.segments?.[0]?.aircraft?.code || 'Unknown'}`);
    console.log(`   → Cabin: ${outboundCabin}`);
    console.log(`   → Estimated meal (if BUSINESS): "Hot meal"`);
    console.log(`   → Estimated meal (if FIRST): "Multi-course meal"`);
  } else {
    console.log(`   ✅ Has amenities data (${outboundAmenities.length} items):`);

    // List all amenities
    outboundAmenities.forEach((amenity, idx) => {
      console.log(`\n   Amenity ${idx + 1}:`);
      console.log(`      Type: ${amenity.amenityType || 'N/A'}`);
      console.log(`      Description: "${amenity.description || 'N/A'}"`);
      console.log(`      isChargeable: ${amenity.isChargeable || false}`);
    });

    // Check for MEAL amenity specifically
    const mealAmenity = outboundAmenities.find(a => a.amenityType === 'MEAL');

    console.log(`\n   🍽️  MEAL Amenity Analysis:`);
    if (!mealAmenity) {
      console.log(`      ❌ NO amenity with amenityType === 'MEAL' found`);
      console.log(`      → getMealType() will return: "None"`);
    } else {
      console.log(`      ✅ MEAL amenity found!`);
      console.log(`      Description: "${mealAmenity.description}"`);

      const desc = mealAmenity.description.toLowerCase();
      let mealType = 'Refreshments'; // Default
      if (desc.includes('hot meal')) mealType = 'Hot meal';
      else if (desc.includes('meal')) mealType = 'Meal';
      else if (desc.includes('snack')) mealType = 'Snack';

      console.log(`      → getMealType() will return: "${mealType}"`);

      // Check if description matches patterns
      if (mealType === 'Refreshments') {
        console.log(`      ⚠️  Description doesn't match any pattern!`);
        console.log(`         Patterns checked: "hot meal", "meal", "snack"`);
        console.log(`         Actual description: "${mealAmenity.description}"`);
      }
    }
  }

  // Return segment amenities analysis (if exists)
  if (returnFare) {
    console.log(`\n🎒 Return Segment:`);

    const returnAmenities = returnFare.amenities || [];
    console.log(`   Amenities array length: ${returnAmenities.length}`);

    if (returnAmenities.length === 0) {
      console.log(`   ⚠️  EMPTY amenities array → Will use ESTIMATED data`);
    } else {
      console.log(`   ✅ Has amenities data (${returnAmenities.length} items)`);

      const mealAmenity = returnAmenities.find(a => a.amenityType === 'MEAL');
      if (!mealAmenity) {
        console.log(`   ❌ NO MEAL amenity → will show "None"`);
      } else {
        const desc = mealAmenity.description.toLowerCase();
        let mealType = 'Refreshments';
        if (desc.includes('hot meal')) mealType = 'Hot meal';
        else if (desc.includes('meal')) mealType = 'Meal';
        else if (desc.includes('snack')) mealType = 'Snack';
        console.log(`   ✅ MEAL amenity: "${mealAmenity.description}" → "${mealType}"`);
      }
    }
  }
}

// Summary statistics
console.log(`\n\n${'='.repeat(80)}`);
console.log(`📈 SUMMARY STATISTICS:`);
console.log(`${'='.repeat(80)}\n`);

let emptyAmenitiesCount = 0;
let noMealAmenityCount = 0;
let hasMealAmenityCount = 0;
let businessCabinCount = 0;
let firstCabinCount = 0;
let economyCabinCount = 0;

flights.forEach(flight => {
  const travelerPricing = flight.travelerPricings?.[0];
  const outboundFare = travelerPricing?.fareDetailsBySegment?.[0];

  if (!outboundFare) return;

  const cabin = outboundFare.cabin || 'UNKNOWN';
  if (cabin === 'BUSINESS') businessCabinCount++;
  else if (cabin === 'FIRST') firstCabinCount++;
  else if (cabin === 'ECONOMY') economyCabinCount++;

  const amenities = outboundFare.amenities || [];

  if (amenities.length === 0) {
    emptyAmenitiesCount++;
  } else {
    const hasMeal = amenities.some(a => a.amenityType === 'MEAL');
    if (hasMeal) {
      hasMealAmenityCount++;
    } else {
      noMealAmenityCount++;
    }
  }
});

console.log(`Total flights analyzed: ${flights.length}`);
console.log(`\nCabin Class Distribution:`);
console.log(`   Business: ${businessCabinCount}`);
console.log(`   First: ${firstCabinCount}`);
console.log(`   Economy: ${economyCabinCount}`);

console.log(`\nAmenities Data Quality:`);
console.log(`   Empty amenities array: ${emptyAmenitiesCount} (${Math.round(emptyAmenitiesCount/flights.length*100)}%)`);
console.log(`   Has amenities but NO MEAL: ${noMealAmenityCount} (${Math.round(noMealAmenityCount/flights.length*100)}%)`);
console.log(`   Has MEAL amenity: ${hasMealAmenityCount} (${Math.round(hasMealAmenityCount/flights.length*100)}%)`);

console.log(`\n${'='.repeat(80)}`);
console.log(`🔍 ROOT CAUSE ANALYSIS:`);
console.log(`${'='.repeat(80)}\n`);

if (emptyAmenitiesCount > flights.length * 0.5) {
  console.log(`⚠️  ISSUE #1: Most flights (${emptyAmenitiesCount}/${flights.length}) have EMPTY amenities arrays`);
  console.log(`   → This means Amadeus is not returning amenities data for these flights`);
  console.log(`   → System falls back to getEstimatedAmenities()`);
  console.log(`   → For Business/First, estimated data SHOULD show proper meals`);
  console.log(`   → If showing "None", the fallback logic may not be working correctly\n`);
}

if (noMealAmenityCount > 0) {
  console.log(`⚠️  ISSUE #2: ${noMealAmenityCount} flights have amenities data but NO MEAL amenity`);
  console.log(`   → amenitiesArray exists but doesn't include amenityType === 'MEAL'`);
  console.log(`   → getMealType() returns "None" in this case`);
  console.log(`   → Possible fix: Default to estimated meal based on cabin class\n`);
}

if (hasMealAmenityCount > 0) {
  console.log(`✅ SUCCESS: ${hasMealAmenityCount} flights have proper MEAL amenity data`);
  console.log(`   → Check if descriptions match patterns (hot meal, meal, snack)\n`);
}

console.log(`${'='.repeat(80)}`);
console.log(`💡 RECOMMENDATIONS:`);
console.log(`${'='.repeat(80)}\n`);

console.log(`1. If amenitiesArray is empty → Already using getEstimatedAmenities() ✅`);
console.log(`2. If amenitiesArray exists but NO MEAL amenity → Currently returns "None" ❌`);
console.log(`   → SHOULD fall back to estimated meal based on cabin class`);
console.log(`3. If MEAL amenity exists but description doesn't match → Returns "Refreshments" ⚠️`);
console.log(`   → May need more flexible pattern matching\n`);

console.log(`\n✅ Test complete!\n`);
