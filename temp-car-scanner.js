const fs = require('fs');

const CLIENT_ID = "Euk10pPNlhKnXPGuIM7RF0X14GGqyTJk";
const CLIENT_SECRET = "P8HsorFxlacf4LVk";
const BASE_URL = "https://api.amadeus.com";

// Currently mapped models
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

async function getAccessToken() {
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', CLIENT_ID);
  params.append('client_secret', CLIENT_SECRET);

  const res = await fetch(`${BASE_URL}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });
  
  if (!res.ok) throw new Error('Failed to get token');
  const data = await res.json();
  return data.access_token;
}

async function scanForMissingModels() {
  console.log('Authenticating...');
  const token = await getAccessToken();
  
  console.log('Starting global scan for unmapped car models...');
  const missingModels = new Set();
  const categoryCounts = {};

  const pickupDate = new Date();
  pickupDate.setDate(pickupDate.getDate() + 14);
  const pDateStr = pickupDate.toISOString().split('T')[0];

  const dropoffDate = new Date(pickupDate);
  dropoffDate.setDate(dropoffDate.getDate() + 3);
  const dDateStr = dropoffDate.toISOString().split('T')[0];

  for (const airport of targetAirports) {
    try {
      console.log(`Scanning ${airport}...`);
      
      const res = await fetch(
        `${BASE_URL}/v2/shopping/car-rentals?pickupLocationCode=${airport}&pickupDate=${pDateStr}&dropoffDate=${dDateStr}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (!res.ok) {
         console.log(`  Skipped ${airport} (Status: ${res.status})`);
         continue;
      }
      
      const response = await res.json();

      if (response.data && response.data.length > 0) {
        for (const offer of response.data) {
          const vehicle = offer.vehicle;
          if (!vehicle) continue;

          const modelName = (vehicle.model || vehicle.description || vehicle.name || '').trim();
          const category = vehicle.category || 'UNKNOWN';

          if (modelName) {
            const normalized = modelName.toLowerCase();
            
            const isMapped = mappedModels.some(mapped => 
              normalized === mapped || 
              (normalized.includes(mapped) && mapped.length > 4)
            );

            if (!isMapped && modelName.length > 2 && !modelName.includes('OR SIMILAR')) {
              const key = `${modelName} (${category}) [${airport}]`;
              missingModels.add(key);
              categoryCounts[category] = (categoryCounts[category] || 0) + 1;
            }
          }
        }
      }
      
      await new Promise(r => setTimeout(r, 1000));
      
    } catch (err) {
      console.error(`Error scanning ${airport}: ${err.message}`);
    }
  }

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
