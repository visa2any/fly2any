import 'dotenv/config';
import Amadeus from 'amadeus';
import fs from 'fs';

// Initialize Amadeus client
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET,
  environment: process.env.AMADEUS_ENVIRONMENT === 'production' ? 'production' : 'test',
});

// Currently mapped models (the 30 we just did)
const mappedModels = [
  'toyota corolla', 'honda civic', 'toyota camry', 'nissan altima', 'toyota rav4',
  'bmw 5 series', 'honda odyssey', 'ford mustang convertible', 'mustang convertible',
  'chevrolet equinox', 'chevy equinox', 'jeep wrangler', 'hyundai sonata', 'kia sportage',
  'ford explorer', 'dodge charger', 'ford f-150', 'f-150', 'tesla model 3',
  'volkswagen golf', 'vw golf', 'golf', 'fiat 500', 'renault clio', 'peugeot 208',
  'mercedes c-class', 'mercedes-benz c-class', 'audi a3', 'chevrolet onix', 'fiat argo',
  'toyota yaris', 'toyota land cruiser', 'honda city', 'nissan sunny', 'nissan versa',
  'hyundai elantra', 'toyota hilux', 'mazda cx-5'
];

// Global airports to sample
const targetAirports = [
  'MIA', 'LAX', 'DEN', 'JFK', // US
  'LHR', 'CDG', 'FRA', 'FCO', // Europe
  'DXB', 'NRT', 'BKK', 'SIN', // Asia / Middle East
  'GRU', 'GIG', 'CUN', 'MEX', // LatAm
  'SYD', 'MEL', 'JNB', 'CPT'  // Oceania / Africa
];

async function scanForMissingModels() {
  console.log('Starting global scan for unmapped car models...');
  const missingModels = new Set<string>();
  const categoryCounts: Record<string, number> = {};

  // Get date 2 weeks from now
  const pickupDate = new Date();
  pickupDate.setDate(pickupDate.getDate() + 14);
  const pDateStr = pickupDate.toISOString().split('T')[0];

  const dropoffDate = new Date(pickupDate);
  dropoffDate.setDate(dropoffDate.getDate() + 3);
  const dDateStr = dropoffDate.toISOString().split('T')[0];

  for (const airport of targetAirports) {
    try {
      console.log(`Scanning ${airport}...`);
      const response = await amadeus.shopping.carRentals.get({
        pickupLocationCode: airport,
        pickupDate: pDateStr,
        dropoffDate: dDateStr,
      });

      if (response.data && response.data.length > 0) {
        for (const offer of response.data) {
          const vehicle = offer.vehicle;
          if (!vehicle) continue;

          const modelName = (vehicle.model || vehicle.description || vehicle.name || '').trim();
          const category = vehicle.category || 'UNKNOWN';

          if (modelName) {
            const normalized = modelName.toLowerCase();
            
            // Check if it's already exactly mapped
            const isMapped = mappedModels.some(mapped => 
              normalized === mapped || 
              (normalized.includes(mapped) && mapped.length > 4)
            );

            if (!isMapped && modelName.length > 2 && !modelName.includes('OR SIMILAR')) {
              const key = `${modelName} (${category}) [${airport}]`;
              missingModels.add(key);
              
              // Count categories to know what types of cars we're missing most
              categoryCounts[category] = (categoryCounts[category] || 0) + 1;
            }
          }
        }
      }
      
      // Brief pause to respect API rate limits
      await new Promise(r => setTimeout(r, 1000));
      
    } catch (err: any) {
      console.error(`Error scanning ${airport}: ${err.message}`);
    }
  }

  // Sort and display results
  const sortedMissing = Array.from(missingModels).sort();
  console.log('\n--- UNMAPPED MODELS FOUND ---');
  sortedMissing.forEach(m => console.log(`- ${m}`));

  console.log('\n--- MISSING BY CATEGORY ---');
  Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => console.log(`${cat}: ${count} cars`));

  console.log(`\nFound ${missingModels.size} unique unmapped car entries.`);
}

scanForMissingModels();
