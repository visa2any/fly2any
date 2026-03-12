const fs = require('fs');

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

async function scanForMissingModels() {
  console.log('Starting global scan using local API...');
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
        `http://localhost:3000/api/cars?pickupLocation=${airport}&pickupDate=${pDateStr}&dropoffDate=${dDateStr}`
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

          // In our API response, the model is usually combined with description correctly
          const modelName = (vehicle.description || vehicle.name || '').trim();
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
      
      await new Promise(r => setTimeout(r, 500));
      
    } catch (err) {
      console.error(`Error scanning ${airport}: ${err.message}`);
    }
  }

  const sortedMissing = Array.from(missingModels).sort();
  console.log('\n--- UNMAPPED MODELS FOUND ---');
  let output = '--- UNMAPPED MODELS FOUND ---\n';
  sortedMissing.forEach(m => {
    console.log(`- ${m}`);
    output += `- ${m}\n`;
  });

  console.log('\n--- MISSING BY CATEGORY ---');
  output += '\n--- MISSING BY CATEGORY ---\n';
  Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`${cat}: ${count} cars`);
      output += `${cat}: ${count} cars\n`;
    });

  console.log(`\nFound ${missingModels.size} unique unmapped car entries.`);
  output += `\nFound ${missingModels.size} unique unmapped car entries.\n`;
  
  fs.writeFileSync('missing-cars-report.txt', output);
  console.log('Saved to missing-cars-report.txt');
}

scanForMissingModels();
