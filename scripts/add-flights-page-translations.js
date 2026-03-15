const fs = require('fs');
const path = require('path');

// Define all FlightsPage translations
const flightsPageTranslations = {
  en: {
    FlightsPage: {
      pageTitle: 'Find Your Perfect Flight',
      sectionTitle: 'Search, Compare & Book Flights with Confidence',
      subtitle: 'AI-powered search across 900+ airlines for the best deals',
      cabinClassTitle: '✈️ Flight Classes & Cabin Types',
      cabinClassSubtitle: 'Choose the perfect cabin for your journey',
      alliancesTitle: '🌐 Airlines by Alliance',
      alliancesSubtitle: 'Maximize your loyalty benefits and global network',
      featuresTitle: '💼 Flight Features & Services',
      featuresSubtitle: 'What to expect on modern flights',
      tipsTitle: '🎯 Expert Flight Booking Tips',
      tipsSubtitle: 'Save money and get the best experience',
      faqTitle: '❓ Flight Booking FAQ',
      faqIntro: 'Everything you need to know about booking flights with Fly2Any',
      stillHaveQuestions: 'Still have questions?',
      contactSupport: 'Contact Our Support Team',
    },
  },
  pt: {
    FlightsPage: {
      pageTitle: 'Encontre Seu Voo Perfeito',
      sectionTitle: 'Busque, Compare e Reserve Voos com Confiança',
      subtitle: 'Busca com IA em 500+ companhias aéreas para as melhores ofertas',
      cabinClassTitle: '✈️ Classes e Tipos de Cabine',
      cabinClassSubtitle: 'Escolha a cabine perfeita para sua viagem',
      alliancesTitle: '🌐 Companhias por Aliança',
      alliancesSubtitle: 'Maximize benefícios de fidelidade e rede global',
      featuresTitle: '💼 Recursos e Serviços de Voo',
      featuresSubtitle: 'O que esperar em voos modernos',
      tipsTitle: '🎯 Dicas de Reserva',
      tipsSubtitle: 'Economize e tenha a melhor experiência',
      faqTitle: '❓ Perguntas Frequentes',
      faqIntro: 'Tudo que você precisa saber sobre reservar voos com Fly2Any',
      stillHaveQuestions: 'Ainda tem dúvidas?',
      contactSupport: 'Entre em Contato com Nosso Suporte',
    },
  },
  es: {
    FlightsPage: {
      pageTitle: 'Encuentra Tu Vuelo Perfecto',
      sectionTitle: 'Busca, Compara y Reserva Vuelos con Confianza',
      subtitle: 'Búsqueda con IA en 500+ aerolíneas para las mejores ofertas',
      cabinClassTitle: '✈️ Clases y Tipos de Cabina',
      cabinClassSubtitle: 'Elige la cabina perfecta para tu viaje',
      alliancesTitle: '🌐 Aerolíneas por Alianza',
      alliancesSubtitle: 'Maximiza beneficios de lealtad y red global',
      featuresTitle: '💼 Características y Servicios',
      featuresSubtitle: 'Qué esperar en vuelos modernos',
      tipsTitle: '🎯 Consejos de Reserva',
      tipsSubtitle: 'Ahorra y ten la mejor experiencia',
      faqTitle: '❓ Preguntas Frecuentes',
      faqIntro: 'Todo lo que necesitas saber sobre reservar vuelos con Fly2Any',
      stillHaveQuestions: '¿Aún tienes preguntas?',
      contactSupport: 'Contacta a Nuestro Equipo de Soporte',
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
      ...flightsPageTranslations[lang],
    };

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2) + '\n', 'utf8');

    console.log(`✅ Added FlightsPage translations to ${lang}.json`);
  } catch (error) {
    console.error(`❌ Error updating ${lang}.json:`, error.message);
  }
});

console.log('\n✨ FlightsPage translations added to all language files!');
