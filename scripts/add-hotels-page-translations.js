const fs = require('fs');
const path = require('path');

// Define all HotelsPage translations
const hotelsPageTranslations = {
  en: {
    HotelsPage: {
      pageTitle: 'Find Your Perfect Hotel',
      sectionTitle: 'Discover Amazing Hotels Worldwide',
      subtitle: 'Smart search across 1M+ hotels with exclusive rates and instant booking',
      starRatingTitle: '⭐ Hotels by Star Rating',
      starRatingSubtitle: 'Find the perfect accommodation for your budget and style',
      propertyTypesTitle: '🏨 Hotel Property Types',
      propertyTypesSubtitle: 'Choose the perfect accommodation style for your trip',
      dealsTitle: '🎁 Hotel Deals by Category',
      dealsSubtitle: 'Limited-time offers and exclusive discounts',
      amenitiesTitle: '🎯 Hotel Amenities Explorer',
      amenitiesSubtitle: 'Filter hotels by your must-have amenities',
      chainsTitle: '🏅 Top Hotel Chains',
      chainsSubtitle: 'Book directly with leading brands and earn loyalty points',
      tipsTitle: '💡 Expert Hotel Booking Tips',
      tipsSubtitle: 'Save money and get the best experience',
      faqTitle: '❓ Hotel Booking FAQ',
      faqIntro: 'Everything you need to know about booking hotels with Fly2Any',
      stillHaveQuestions: 'Still have questions?',
      contactSupport: 'Contact Our Support Team',
    },
  },
  pt: {
    HotelsPage: {
      pageTitle: 'Encontre Seu Hotel Perfeito',
      sectionTitle: 'Descubra Hotéis Incríveis pelo Mundo',
      subtitle: 'Busca inteligente em +1M hotéis com tarifas exclusivas e reserva instantânea',
      starRatingTitle: '⭐ Hotéis por Classificação',
      starRatingSubtitle: 'Encontre a acomodação perfeita para seu orçamento',
      propertyTypesTitle: '🏨 Tipos de Propriedade',
      propertyTypesSubtitle: 'Escolha o estilo perfeito para sua viagem',
      dealsTitle: '🎁 Ofertas por Categoria',
      dealsSubtitle: 'Ofertas limitadas e descontos exclusivos',
      amenitiesTitle: '🎯 Explorador de Comodidades',
      amenitiesSubtitle: 'Filtre hotéis por comodidades essenciais',
      chainsTitle: '🏅 Principais Redes de Hotéis',
      chainsSubtitle: 'Reserve diretamente e ganhe pontos de fidelidade',
      tipsTitle: '💡 Dicas de Reserva',
      tipsSubtitle: 'Economize e tenha a melhor experiência',
      faqTitle: '❓ Perguntas Frequentes',
      faqIntro: 'Tudo que você precisa saber sobre reservar hotéis com Fly2Any',
      stillHaveQuestions: 'Ainda tem dúvidas?',
      contactSupport: 'Entre em Contato com Nosso Suporte',
    },
  },
  es: {
    HotelsPage: {
      pageTitle: 'Encuentra Tu Hotel Perfecto',
      sectionTitle: 'Descubre Hoteles Increíbles en Todo el Mundo',
      subtitle: 'Búsqueda inteligente en +1M hoteles con tarifas exclusivas y reserva instantánea',
      starRatingTitle: '⭐ Hoteles por Clasificación',
      starRatingSubtitle: 'Encuentra el alojamiento perfecto para tu presupuesto',
      propertyTypesTitle: '🏨 Tipos de Propiedad',
      propertyTypesSubtitle: 'Elige el estilo perfecto para tu viaje',
      dealsTitle: '🎁 Ofertas por Categoría',
      dealsSubtitle: 'Ofertas limitadas y descuentos exclusivos',
      amenitiesTitle: '🎯 Explorador de Comodidades',
      amenitiesSubtitle: 'Filtra hoteles por comodidades esenciales',
      chainsTitle: '🏅 Principales Cadenas de Hoteles',
      chainsSubtitle: 'Reserva directamente y gana puntos de fidelidad',
      tipsTitle: '💡 Consejos de Reserva',
      tipsSubtitle: 'Ahorra y ten la mejor experiencia',
      faqTitle: '❓ Preguntas Frecuentes',
      faqIntro: 'Todo lo que necesitas saber sobre reservar hoteles con Fly2Any',
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
      ...hotelsPageTranslations[lang],
    };

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2) + '\n', 'utf8');

    console.log(`✅ Added HotelsPage translations to ${lang}.json`);
  } catch (error) {
    console.error(`❌ Error updating ${lang}.json:`, error.message);
  }
});

console.log('\n✨ HotelsPage translations added to all language files!');
