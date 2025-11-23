const fs = require('fs');
const path = require('path');

// Define all CarsPage translations
const carsPageTranslations = {
  en: {
    CarsPage: {
      pageTitle: 'Rent Your Perfect Car',
      sectionTitle: 'Find & Book Car Rentals with Ease',
      subtitle: 'Compare 500+ rental companies worldwide for the best deals',
      vehicleTypesTitle: '🚗 Vehicle Types & Categories',
      vehicleTypesSubtitle: 'Choose the perfect car for your journey',
      companiesTitle: '🏢 Top Car Rental Companies',
      companiesSubtitle: 'Trusted brands with worldwide coverage',
      insuranceTitle: '🛡️ Insurance & Protection Options',
      insuranceSubtitle: 'Understand your coverage options and save money',
      locationsTitle: '📍 Rental Locations & Pickup Options',
      locationsSubtitle: 'Where to pick up your rental car',
      fuelPoliciesTitle: '⛽ Fuel Policies Explained',
      fuelPoliciesSubtitle: 'Understand fuel options to avoid surprise charges',
      tipsTitle: '💡 Expert Car Rental Tips',
      tipsSubtitle: 'Save money and avoid common pitfalls',
      faqTitle: '❓ Car Rental FAQ',
    },
  },
  pt: {
    CarsPage: {
      pageTitle: 'Alugue Seu Carro Perfeito',
      sectionTitle: 'Encontre e Reserve Aluguel de Carros com Facilidade',
      subtitle: 'Compare +500 locadoras em todo o mundo para as melhores ofertas',
      vehicleTypesTitle: '🚗 Tipos e Categorias de Veículos',
      vehicleTypesSubtitle: 'Escolha o carro perfeito para sua viagem',
      companiesTitle: '🏢 Principais Locadoras',
      companiesSubtitle: 'Marcas confiáveis com cobertura mundial',
      insuranceTitle: '🛡️ Opções de Seguro',
      insuranceSubtitle: 'Entenda suas opções e economize',
      locationsTitle: '📍 Locais de Retirada',
      locationsSubtitle: 'Onde retirar seu carro alugado',
      fuelPoliciesTitle: '⛽ Políticas de Combustível',
      fuelPoliciesSubtitle: 'Entenda as opções para evitar cobranças surpresa',
      tipsTitle: '💡 Dicas de Aluguel',
      tipsSubtitle: 'Economize e evite armadilhas comuns',
      faqTitle: '❓ Perguntas Frequentes',
    },
  },
  es: {
    CarsPage: {
      pageTitle: 'Alquila Tu Coche Perfecto',
      sectionTitle: 'Encuentra y Reserva Alquiler de Coches Fácilmente',
      subtitle: 'Compara +500 empresas de alquiler en todo el mundo',
      vehicleTypesTitle: '🚗 Tipos y Categorías de Vehículos',
      vehicleTypesSubtitle: 'Elige el coche perfecto para tu viaje',
      companiesTitle: '🏢 Principales Empresas de Alquiler',
      companiesSubtitle: 'Marcas confiables con cobertura mundial',
      insuranceTitle: '🛡️ Opciones de Seguro',
      insuranceSubtitle: 'Comprende tus opciones y ahorra',
      locationsTitle: '📍 Ubicaciones de Recogida',
      locationsSubtitle: 'Dónde recoger tu coche de alquiler',
      fuelPoliciesTitle: '⛽ Políticas de Combustible',
      fuelPoliciesSubtitle: 'Comprende las opciones para evitar cargos sorpresa',
      tipsTitle: '💡 Consejos de Alquiler',
      tipsSubtitle: 'Ahorra y evita trampas comunes',
      faqTitle: '❓ Preguntas Frecuentes',
    },
  },
};

// Read and update each language file
['en', 'pt', 'es'].forEach(lang => {
  const filePath = path.join(__dirname, '..', 'messages', `${lang}.json`);

  try {
    // Read existing content
    const existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Merge with new translations
    const updated = {
      ...existing,
      ...carsPageTranslations[lang],
    };

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2) + '\n', 'utf8');

    console.log(`✅ Added CarsPage translations to ${lang}.json`);
  } catch (error) {
    console.error(`❌ Error updating ${lang}.json:`, error.message);
  }
});

console.log('\n✨ CarsPage translations added to all language files!');
