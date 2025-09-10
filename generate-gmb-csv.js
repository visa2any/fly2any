/**
 * ULTRATHINK GOOGLE MY BUSINESS CSV GENERATOR
 * Generate CSV for immediate Google My Business submissions
 */

const brazilianCities = [
  {
    id: 'new-york-ny',
    name: 'New York',
    country: 'USA',
    state: 'NY',
    population: { brazilian: 500000 },
    coordinates: { lat: 40.7128, lng: -74.0060 },
    neighborhoods: ['Long Island City', 'Newark', 'Kearny'],
    phone: '+1 (212) 555-0123',
    address: '123 Business Ave, Long Island City',
    postalCode: '10001',
    priority: 'ultra-high'
  },
  {
    id: 'boston-ma',
    name: 'Boston',
    country: 'USA',
    state: 'MA',
    population: { brazilian: 420000 },
    coordinates: { lat: 42.3601, lng: -71.0589 },
    neighborhoods: ['Framingham', 'Somerville', 'Marlborough'],
    phone: '+1 (617) 555-0124',
    address: '456 Corporate St, Framingham',
    postalCode: '02101',
    priority: 'ultra-high'
  },
  {
    id: 'miami-fl',
    name: 'Miami',
    country: 'USA',
    state: 'FL',
    population: { brazilian: 400000 },
    coordinates: { lat: 25.7617, lng: -80.1918 },
    neighborhoods: ['Brickell', 'Aventura', 'Doral'],
    phone: '+1 (305) 555-0125',
    address: '789 International Blvd, Brickell',
    postalCode: '33101',
    priority: 'ultra-high'
  },
  {
    id: 'orlando-fl',
    name: 'Orlando',
    country: 'USA',
    state: 'FL',
    population: { brazilian: 190000 },
    coordinates: { lat: 28.5383, lng: -81.3792 },
    neighborhoods: ['International Drive', 'Kissimmee'],
    phone: '+1 (407) 555-0126',
    address: '321 Travel Plaza, International Drive',
    postalCode: '32801',
    priority: 'ultra-high'
  },
  {
    id: 'atlanta-ga',
    name: 'Atlanta',
    country: 'USA',
    state: 'GA',
    population: { brazilian: 120000 },
    coordinates: { lat: 33.7490, lng: -84.3880 },
    neighborhoods: ['Marietta', 'Duluth', 'Norcross'],
    phone: '+1 (404) 555-0127',
    address: '654 Commerce Dr, Marietta',
    postalCode: '30301',
    priority: 'high'
  },
  {
    id: 'los-angeles-ca',
    name: 'Los Angeles',
    country: 'USA',
    state: 'CA',
    population: { brazilian: 120000 },
    coordinates: { lat: 34.0522, lng: -118.2437 },
    neighborhoods: ['Beverly Hills', 'West Hollywood'],
    phone: '+1 (213) 555-0128',
    address: '987 Global Way, Beverly Hills',
    postalCode: '90001',
    priority: 'high'
  }
];

function generateGMBCsv() {
  const headers = [
    'Store Name',
    'Address', 
    'City',
    'State',
    'ZIP',
    'Country',
    'Phone',
    'Website',
    'Category',
    'Hours',
    'Description'
  ];

  const rows = brazilianCities.map(city => [
    `Fly2Any - Brazilian Travel Specialists ${city.name}`,
    city.address,
    city.name,
    city.state || '',
    city.postalCode,
    city.country,
    city.phone,
    `https://fly2any.com/cidade/${city.id}`,
    'Travel Agency',
    'Mo-Fr 8:00-22:00, Sa 9:00-20:00, Su 10:00-18:00',
    `Expert Brazil travel specialists serving ${city.name}'s Brazilian community of ${city.population.brazilian.toLocaleString()} people. Flights, hotels, cars, insurance. Portuguese speaking service.`
  ]);

  return [headers, ...rows].map(row => 
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');
}

function generateDirectorySubmissionPlan() {
  const plan = {
    immediate: [],
    week1: [],
    week2: []
  };

  brazilianCities.forEach(city => {
    const businessData = {
      cityId: city.id,
      businessName: `Fly2Any - Brazilian Travel Specialists ${city.name}`,
      website: `https://fly2any.com/cidade/${city.id}`,
      phone: city.phone,
      address: city.address,
      description: `Brazil travel specialists for ${city.name}'s ${city.population.brazilian.toLocaleString()} Brazilians`
    };

    if (city.priority === 'ultra-high') {
      plan.immediate.push({
        ...businessData,
        directories: [
          'Google My Business',
          'Yelp',
          'Facebook Business Page',
          'Yellow Pages'
        ]
      });
    } else {
      plan.week1.push({
        ...businessData,
        directories: [
          'Google My Business',
          'Yelp'
        ]
      });
    }
  });

  return plan;
}

// Generate and output results
console.log('🚀 ULTRATHINK GOOGLE MY BUSINESS CSV GENERATOR');
console.log('='.repeat(60));
console.log('\n📊 GOOGLE MY BUSINESS CSV DATA:');
console.log('='.repeat(30));
console.log(generateGMBCsv());

console.log('\n\n📋 DIRECTORY SUBMISSION PLAN:');
console.log('='.repeat(30));
const plan = generateDirectorySubmissionPlan();
console.log('IMMEDIATE (Priority Cities):');
plan.immediate.forEach((business, index) => {
  console.log(`${index + 1}. ${business.businessName}`);
  console.log(`   Website: ${business.website}`);
  console.log(`   Phone: ${business.phone}`);
  console.log(`   Directories: ${business.directories.join(', ')}\n`);
});

console.log('\n🎯 NEXT ACTIONS:');
console.log('1. Copy CSV above into Google My Business bulk upload');
console.log('2. Submit to Google My Business for all 6 cities');
console.log('3. Create Yelp business listings for each city');
console.log('4. Set up Facebook business pages');
console.log('5. Monitor verification emails and phone calls');

module.exports = { generateGMBCsv, generateDirectorySubmissionPlan };