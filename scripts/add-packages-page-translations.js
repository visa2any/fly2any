const fs = require('fs');
const path = require('path');

const packagesPageTranslations = {
  en: {
    PackagesPage: {
      // Hero Section
      sectionTitle: 'All-Inclusive Travel Packages & Vacation Bundles',
      subtitle: 'Save up to 40% with flight + hotel + activities bundled deals',

      // Section Headers
      packageTypes: 'Package Types & Categories',
      popularDestinations: 'Top Package Destinations',
      packageDurations: 'Package Duration Options',
      whatsIncluded: "What's Included in Packages",
      topProviders: 'Top Package Providers',
      bookingTips: 'Expert Package Booking Tips',
      faq: 'Packages FAQ',

      // Package Types (6 types)
      packageType_beachVacation: 'Beach Vacation Packages',
      packageType_beachVacation_desc: 'All-inclusive beach resorts with flights, meals, and activities',
      packageType_beachVacation_priceRange: '$800-$3,500',
      packageType_beachVacation_duration: '5-14 days',
      packageType_beachVacation_feature1: 'Round-trip Flights',
      packageType_beachVacation_feature2: 'All-Inclusive Resort',
      packageType_beachVacation_feature3: 'Airport Transfers',
      packageType_beachVacation_feature4: 'Daily Activities',
      packageType_beachVacation_examples: 'Cancun, Maldives, Phuket, Bali All-Inclusive',
      packageType_beachVacation_bestFor: 'Beach lovers, families, honeymooners',

      packageType_cityBreak: 'City Break Packages',
      packageType_cityBreak_desc: 'Urban adventures with flights, hotels, and sightseeing tours',
      packageType_cityBreak_priceRange: '$600-$2,500',
      packageType_cityBreak_duration: '3-7 days',
      packageType_cityBreak_feature1: 'Flights',
      packageType_cityBreak_feature2: 'Central Hotel',
      packageType_cityBreak_feature3: 'City Tours',
      packageType_cityBreak_feature4: 'Museum Passes',
      packageType_cityBreak_examples: 'Paris, New York, Tokyo, Dubai City Breaks',
      packageType_cityBreak_bestFor: 'Culture enthusiasts, solo travelers, couples',

      packageType_adventure: 'Adventure Packages',
      packageType_adventure_desc: 'Thrilling experiences with extreme sports and nature exploration',
      packageType_adventure_priceRange: '$1,200-$4,000',
      packageType_adventure_duration: '7-14 days',
      packageType_adventure_feature1: 'Flights',
      packageType_adventure_feature2: 'Adventure Lodge',
      packageType_adventure_feature3: 'Equipment Rental',
      packageType_adventure_feature4: 'Expert Guides',
      packageType_adventure_examples: 'New Zealand Adventure, Costa Rica Explorer, Iceland Trek',
      packageType_adventure_bestFor: 'Adventure seekers, outdoor enthusiasts',

      packageType_cruise: 'Cruise Packages',
      packageType_cruise_desc: 'Ocean voyages with flights, cabin, meals, and entertainment',
      packageType_cruise_priceRange: '$1,500-$6,000',
      packageType_cruise_duration: '7-21 days',
      packageType_cruise_feature1: 'Flights',
      packageType_cruise_feature2: 'Cruise Cabin',
      packageType_cruise_feature3: 'All Meals',
      packageType_cruise_feature4: 'Shore Excursions',
      packageType_cruise_examples: 'Mediterranean Cruise, Caribbean Cruise, Alaska Cruise',
      packageType_cruise_bestFor: 'Couples, families, seniors',

      packageType_safari: 'Safari Packages',
      packageType_safari_desc: 'Wildlife adventures with luxury lodges and game drives',
      packageType_safari_priceRange: '$2,500-$8,000',
      packageType_safari_duration: '7-14 days',
      packageType_safari_feature1: 'Flights',
      packageType_safari_feature2: 'Safari Lodge',
      packageType_safari_feature3: 'Game Drives',
      packageType_safari_feature4: 'Expert Rangers',
      packageType_safari_examples: 'Kenya Safari, Tanzania Serengeti, South Africa Big Five',
      packageType_safari_bestFor: 'Wildlife lovers, photographers, luxury travelers',

      packageType_ski: 'Ski & Snow Packages',
      packageType_ski_desc: 'Winter sports with flights, ski resorts, and lift passes',
      packageType_ski_priceRange: '$1,000-$4,500',
      packageType_ski_duration: '5-10 days',
      packageType_ski_feature1: 'Flights',
      packageType_ski_feature2: 'Ski Resort',
      packageType_ski_feature3: 'Lift Passes',
      packageType_ski_feature4: 'Equipment Rental',
      packageType_ski_examples: 'Swiss Alps, Aspen, Whistler, Japan Powder',
      packageType_ski_bestFor: 'Ski enthusiasts, winter lovers, families',

      // Destinations (6 destinations)
      dest_cancun: 'Cancun, Mexico',
      dest_cancun_packages: '500+ packages',
      dest_cancun_pkg1: 'All-Inclusive Beach',
      dest_cancun_pkg2: 'Mayan Ruins Tour',
      dest_cancun_pkg3: 'Party Package',
      dest_cancun_pkg4: 'Family Resort',
      dest_cancun_priceFrom: '$799',

      dest_maldives: 'Maldives',
      dest_maldives_packages: '300+ packages',
      dest_maldives_pkg1: 'Overwater Villa',
      dest_maldives_pkg2: 'Diving Package',
      dest_maldives_pkg3: 'Honeymoon Special',
      dest_maldives_pkg4: 'Luxury Resort',
      dest_maldives_priceFrom: '$1,899',

      dest_dubai: 'Dubai, UAE',
      dest_dubai_packages: '450+ packages',
      dest_dubai_pkg1: 'City + Desert',
      dest_dubai_pkg2: 'Luxury Hotels',
      dest_dubai_pkg3: 'Shopping Tour',
      dest_dubai_pkg4: 'Theme Park Bundle',
      dest_dubai_priceFrom: '$999',

      dest_bali: 'Bali, Indonesia',
      dest_bali_packages: '400+ packages',
      dest_bali_pkg1: 'Beach + Culture',
      dest_bali_pkg2: 'Yoga Retreat',
      dest_bali_pkg3: 'Adventure Package',
      dest_bali_pkg4: 'Villa Stay',
      dest_bali_priceFrom: '$699',

      dest_paris: 'Paris, France',
      dest_paris_packages: '350+ packages',
      dest_paris_pkg1: 'Romantic Getaway',
      dest_paris_pkg2: 'Museums Pass',
      dest_paris_pkg3: 'Wine & Dine',
      dest_paris_pkg4: 'Disneyland Bundle',
      dest_paris_priceFrom: '$899',

      dest_newyork: 'New York, USA',
      dest_newyork_packages: '380+ packages',
      dest_newyork_pkg1: 'Broadway Shows',
      dest_newyork_pkg2: 'Sightseeing Pass',
      dest_newyork_pkg3: 'Shopping Tour',
      dest_newyork_pkg4: 'Food Crawl',
      dest_newyork_priceFrom: '$799',

      // Duration Options (3 durations)
      duration_weekendGetaway: 'Weekend Getaway',
      duration_weekendGetaway_time: '3-4 days',
      duration_weekendGetaway_desc: 'Perfect for quick escapes and short city breaks',
      duration_weekendGetaway_examples: 'City tours, beach weekends, spa retreats',
      duration_weekendGetaway_priceRange: '$500-$1,500',
      duration_weekendGetaway_bestFor: 'Busy professionals',

      duration_weekLong: 'Week-Long Vacation',
      duration_weekLong_time: '7-10 days',
      duration_weekLong_desc: 'Ideal balance of relaxation and exploration',
      duration_weekLong_examples: 'Beach resorts, Europe tours, island hopping',
      duration_weekLong_priceRange: '$1,200-$4,000',
      duration_weekLong_bestFor: 'Families, couples',

      duration_extended: 'Extended Holiday',
      duration_extended_time: '14-21 days',
      duration_extended_desc: 'Comprehensive trips with multiple destinations',
      duration_extended_examples: 'Multi-country tours, cruises, safari adventures',
      duration_extended_priceRange: '$3,000-$10,000',
      duration_extended_bestFor: 'Retirees, adventurers',

      // What's Included (4 items)
      included_flights: 'Round-Trip Flights',
      included_flights_desc: 'Economy or premium class flights from your city',

      included_accommodation: 'Accommodation',
      included_accommodation_desc: 'Hotels, resorts, or vacation rentals for your stay',

      included_meals: 'Meals & Drinks',
      included_meals_desc: 'Breakfast, all-inclusive, or meal vouchers included',

      included_activities: 'Activities & Tours',
      included_activities_desc: 'Guided tours, excursions, and entertainment',

      // Top Providers (6 providers)
      provider_expedia: 'Expedia Packages',
      provider_expedia_specialty: 'Flight + Hotel bundles',
      provider_expedia_discount: 'Up to 30% off',

      provider_costco: 'Costco Travel',
      provider_costco_specialty: 'Member exclusive deals',
      provider_costco_discount: 'Extra perks included',

      provider_apple: 'Apple Vacations',
      provider_apple_specialty: 'All-inclusive resorts',
      provider_apple_discount: 'Resort credits included',

      provider_funjet: 'Funjet Vacations',
      provider_funjet_specialty: 'Beach packages',
      provider_funjet_discount: 'Kids stay free deals',

      provider_pleasant: 'Pleasant Holidays',
      provider_pleasant_specialty: 'Hawaii & Mexico',
      provider_pleasant_discount: 'Room upgrades',

      provider_gate1: 'Gate 1 Travel',
      provider_gate1_specialty: 'Guided tours',
      provider_gate1_discount: 'Early booking savings',

      // Expert Tips (6 tips)
      tip_bundleSavings: 'Bundle for Maximum Savings',
      tip_bundleSavings_desc: 'Book flight + hotel + car together to save 30-40% vs booking separately',

      tip_checkIncluded: "Check What's Included",
      tip_checkIncluded_desc: 'Verify meals, transfers, activities to avoid hidden costs and surprises',

      tip_offSeason: 'Book Off-Season',
      tip_offSeason_desc: 'Travel during shoulder season for same quality at 50% less cost',

      tip_readDetails: 'Read Package Details',
      tip_readDetails_desc: 'Check cancellation policy, room type, flight times before booking',

      tip_compareProviders: 'Compare Providers',
      tip_compareProviders_desc: 'Same destination can vary $500+ between different package providers',

      tip_addedValue: 'Look for Added Value',
      tip_addedValue_desc: 'Free upgrades, resort credits, late checkout add real value to packages',

      // FAQ (6 questions)
      faq_savings_q: 'How much can I save with a vacation package?',
      faq_savings_a: 'Vacation packages typically save you 25-40% compared to booking flights, hotels, and activities separately. The more components you bundle, the greater the savings. Packages also often include added perks like resort credits, free breakfast, or complimentary transfers.',

      faq_included_q: "What's typically included in a package?",
      faq_included_a: 'Most packages include round-trip flights and accommodation. Depending on the package type, you may also get meals (all-inclusive), airport transfers, activities, tours, and travel insurance. Always check the "What\'s Included" section for specific details.',

      faq_customize_q: 'Can I customize my package?',
      faq_customize_a: 'Yes! Most providers allow customization. You can usually upgrade your flight class, choose different hotels, add extra nights, include car rentals, or add excursions. Customizations may affect the package price.',

      faq_bestTime_q: 'When is the best time to book a package?',
      faq_bestTime_a: 'Book 3-4 months in advance for international destinations and 6-8 weeks for domestic trips. Watch for flash sales during off-season, Black Friday, Cyber Monday, and Travel Tuesday. Last-minute deals (2-3 weeks out) can also offer significant savings if you\'re flexible.',

      faq_refundable_q: 'Are packages refundable?',
      faq_refundable_a: 'Refund policies vary by provider and package type. Standard packages often have cancellation fees, while flexible packages cost more but allow free cancellation. Travel insurance is recommended for protection against unexpected changes. Always read the cancellation policy before booking.',

      faq_insurance_q: 'Do I need travel insurance with a package?',
      faq_insurance_a: 'While not mandatory, travel insurance is highly recommended for packages, especially for expensive trips or international travel. It protects against trip cancellations, medical emergencies, lost luggage, and flight delays. Many packages offer insurance as an add-on during booking.'
    }
  },
  pt: {
    PackagesPage: {
      // Hero Section
      sectionTitle: 'Pacotes de Viagem All-Inclusive e Bundles de Férias',
      subtitle: 'Economize até 40% com ofertas combinadas de voo + hotel + atividades',

      // Section Headers
      packageTypes: 'Tipos e Categorias de Pacotes',
      popularDestinations: 'Principais Destinos de Pacotes',
      packageDurations: 'Opções de Duração de Pacotes',
      whatsIncluded: 'O Que Está Incluído nos Pacotes',
      topProviders: 'Principais Fornecedores de Pacotes',
      bookingTips: 'Dicas de Reserva de Pacotes',
      faq: 'Perguntas Frequentes sobre Pacotes',

      // Package Types
      packageType_beachVacation: 'Pacotes de Férias na Praia',
      packageType_beachVacation_desc: 'Resorts all-inclusive na praia com voos, refeições e atividades',
      packageType_beachVacation_priceRange: '$800-$3.500',
      packageType_beachVacation_duration: '5-14 dias',
      packageType_beachVacation_feature1: 'Voos de ida e volta',
      packageType_beachVacation_feature2: 'Resort All-Inclusive',
      packageType_beachVacation_feature3: 'Traslados do aeroporto',
      packageType_beachVacation_feature4: 'Atividades diárias',
      packageType_beachVacation_examples: 'Cancun, Maldivas, Phuket, Bali All-Inclusive',
      packageType_beachVacation_bestFor: 'Amantes da praia, famílias, lua de mel',

      packageType_cityBreak: 'Pacotes de City Break',
      packageType_cityBreak_desc: 'Aventuras urbanas com voos, hotéis e passeios turísticos',
      packageType_cityBreak_priceRange: '$600-$2.500',
      packageType_cityBreak_duration: '3-7 dias',
      packageType_cityBreak_feature1: 'Voos',
      packageType_cityBreak_feature2: 'Hotel Central',
      packageType_cityBreak_feature3: 'Passeios pela cidade',
      packageType_cityBreak_feature4: 'Passes para museus',
      packageType_cityBreak_examples: 'Paris, Nova York, Tóquio, Dubai City Breaks',
      packageType_cityBreak_bestFor: 'Entusiastas da cultura, viajantes solo, casais',

      packageType_adventure: 'Pacotes de Aventura',
      packageType_adventure_desc: 'Experiências emocionantes com esportes radicais e exploração da natureza',
      packageType_adventure_priceRange: '$1.200-$4.000',
      packageType_adventure_duration: '7-14 dias',
      packageType_adventure_feature1: 'Voos',
      packageType_adventure_feature2: 'Lodge de Aventura',
      packageType_adventure_feature3: 'Aluguel de equipamentos',
      packageType_adventure_feature4: 'Guias especializados',
      packageType_adventure_examples: 'Aventura na Nova Zelândia, Explorador da Costa Rica, Trekking na Islândia',
      packageType_adventure_bestFor: 'Buscadores de aventura, entusiastas do ar livre',

      packageType_cruise: 'Pacotes de Cruzeiro',
      packageType_cruise_desc: 'Viagens oceânicas com voos, cabine, refeições e entretenimento',
      packageType_cruise_priceRange: '$1.500-$6.000',
      packageType_cruise_duration: '7-21 dias',
      packageType_cruise_feature1: 'Voos',
      packageType_cruise_feature2: 'Cabine de cruzeiro',
      packageType_cruise_feature3: 'Todas as refeições',
      packageType_cruise_feature4: 'Excursões em terra',
      packageType_cruise_examples: 'Cruzeiro no Mediterrâneo, Cruzeiro no Caribe, Cruzeiro no Alasca',
      packageType_cruise_bestFor: 'Casais, famílias, idosos',

      packageType_safari: 'Pacotes de Safari',
      packageType_safari_desc: 'Aventuras com vida selvagem com lodges de luxo e safáris',
      packageType_safari_priceRange: '$2.500-$8.000',
      packageType_safari_duration: '7-14 dias',
      packageType_safari_feature1: 'Voos',
      packageType_safari_feature2: 'Lodge Safari',
      packageType_safari_feature3: 'Safáris',
      packageType_safari_feature4: 'Rangers especializados',
      packageType_safari_examples: 'Safari no Quênia, Serengeti na Tanzânia, Big Five na África do Sul',
      packageType_safari_bestFor: 'Amantes da vida selvagem, fotógrafos, viajantes de luxo',

      packageType_ski: 'Pacotes de Esqui e Neve',
      packageType_ski_desc: 'Esportes de inverno com voos, resorts de esqui e passes de elevador',
      packageType_ski_priceRange: '$1.000-$4.500',
      packageType_ski_duration: '5-10 dias',
      packageType_ski_feature1: 'Voos',
      packageType_ski_feature2: 'Resort de Esqui',
      packageType_ski_feature3: 'Passes de elevador',
      packageType_ski_feature4: 'Aluguel de equipamentos',
      packageType_ski_examples: 'Alpes Suíços, Aspen, Whistler, Neve no Japão',
      packageType_ski_bestFor: 'Entusiastas do esqui, amantes do inverno, famílias',

      // Destinations
      dest_cancun: 'Cancun, México',
      dest_cancun_packages: '500+ pacotes',
      dest_cancun_pkg1: 'Praia All-Inclusive',
      dest_cancun_pkg2: 'Tour Ruínas Maias',
      dest_cancun_pkg3: 'Pacote Festa',
      dest_cancun_pkg4: 'Resort Família',
      dest_cancun_priceFrom: '$799',

      dest_maldives: 'Maldivas',
      dest_maldives_packages: '300+ pacotes',
      dest_maldives_pkg1: 'Vila sobre a água',
      dest_maldives_pkg2: 'Pacote de mergulho',
      dest_maldives_pkg3: 'Especial Lua de Mel',
      dest_maldives_pkg4: 'Resort de Luxo',
      dest_maldives_priceFrom: '$1.899',

      dest_dubai: 'Dubai, EAU',
      dest_dubai_packages: '450+ pacotes',
      dest_dubai_pkg1: 'Cidade + Deserto',
      dest_dubai_pkg2: 'Hotéis de Luxo',
      dest_dubai_pkg3: 'Tour de Compras',
      dest_dubai_pkg4: 'Bundle Parque Temático',
      dest_dubai_priceFrom: '$999',

      dest_bali: 'Bali, Indonésia',
      dest_bali_packages: '400+ pacotes',
      dest_bali_pkg1: 'Praia + Cultura',
      dest_bali_pkg2: 'Retiro de Yoga',
      dest_bali_pkg3: 'Pacote Aventura',
      dest_bali_pkg4: 'Estadia em Vila',
      dest_bali_priceFrom: '$699',

      dest_paris: 'Paris, França',
      dest_paris_packages: '350+ pacotes',
      dest_paris_pkg1: 'Escapada Romântica',
      dest_paris_pkg2: 'Passe para Museus',
      dest_paris_pkg3: 'Vinho e Jantar',
      dest_paris_pkg4: 'Bundle Disneylândia',
      dest_paris_priceFrom: '$899',

      dest_newyork: 'Nova York, EUA',
      dest_newyork_packages: '380+ pacotes',
      dest_newyork_pkg1: 'Shows da Broadway',
      dest_newyork_pkg2: 'Passe Turístico',
      dest_newyork_pkg3: 'Tour de Compras',
      dest_newyork_pkg4: 'Tour Gastronômico',
      dest_newyork_priceFrom: '$799',

      // Duration Options
      duration_weekendGetaway: 'Escapadela de Fim de Semana',
      duration_weekendGetaway_time: '3-4 dias',
      duration_weekendGetaway_desc: 'Perfeito para fugas rápidas e city breaks curtos',
      duration_weekendGetaway_examples: 'Tours pela cidade, fins de semana na praia, retiros de spa',
      duration_weekendGetaway_priceRange: '$500-$1.500',
      duration_weekendGetaway_bestFor: 'Profissionais ocupados',

      duration_weekLong: 'Férias de Uma Semana',
      duration_weekLong_time: '7-10 dias',
      duration_weekLong_desc: 'Equilíbrio ideal entre relaxamento e exploração',
      duration_weekLong_examples: 'Resorts de praia, tours pela Europa, island hopping',
      duration_weekLong_priceRange: '$1.200-$4.000',
      duration_weekLong_bestFor: 'Famílias, casais',

      duration_extended: 'Férias Prolongadas',
      duration_extended_time: '14-21 dias',
      duration_extended_desc: 'Viagens abrangentes com vários destinos',
      duration_extended_examples: 'Tours multi-país, cruzeiros, aventuras de safari',
      duration_extended_priceRange: '$3.000-$10.000',
      duration_extended_bestFor: 'Aposentados, aventureiros',

      // What's Included
      included_flights: 'Voos de Ida e Volta',
      included_flights_desc: 'Voos econômicos ou premium da sua cidade',

      included_accommodation: 'Acomodação',
      included_accommodation_desc: 'Hotéis, resorts ou aluguéis de férias para sua estadia',

      included_meals: 'Refeições e Bebidas',
      included_meals_desc: 'Café da manhã, all-inclusive ou vouchers de refeição incluídos',

      included_activities: 'Atividades e Tours',
      included_activities_desc: 'Tours guiados, excursões e entretenimento',

      // Top Providers
      provider_expedia: 'Pacotes Expedia',
      provider_expedia_specialty: 'Bundles Voo + Hotel',
      provider_expedia_discount: 'Até 30% de desconto',

      provider_costco: 'Costco Travel',
      provider_costco_specialty: 'Ofertas exclusivas para membros',
      provider_costco_discount: 'Extras incluídos',

      provider_apple: 'Apple Vacations',
      provider_apple_specialty: 'Resorts all-inclusive',
      provider_apple_discount: 'Créditos de resort incluídos',

      provider_funjet: 'Funjet Vacations',
      provider_funjet_specialty: 'Pacotes de praia',
      provider_funjet_discount: 'Crianças ficam grátis',

      provider_pleasant: 'Pleasant Holidays',
      provider_pleasant_specialty: 'Havaí e México',
      provider_pleasant_discount: 'Upgrades de quarto',

      provider_gate1: 'Gate 1 Travel',
      provider_gate1_specialty: 'Tours guiados',
      provider_gate1_discount: 'Economias na reserva antecipada',

      // Expert Tips
      tip_bundleSavings: 'Agrupe para Economias Máximas',
      tip_bundleSavings_desc: 'Reserve voo + hotel + carro juntos para economizar 30-40% vs reservar separadamente',

      tip_checkIncluded: 'Verifique o Que Está Incluído',
      tip_checkIncluded_desc: 'Verifique refeições, transfers, atividades para evitar custos ocultos e surpresas',

      tip_offSeason: 'Reserve Fora de Temporada',
      tip_offSeason_desc: 'Viaje durante a temporada intermediária para mesma qualidade com 50% menos custo',

      tip_readDetails: 'Leia os Detalhes do Pacote',
      tip_readDetails_desc: 'Verifique política de cancelamento, tipo de quarto, horários de voo antes de reservar',

      tip_compareProviders: 'Compare Fornecedores',
      tip_compareProviders_desc: 'O mesmo destino pode variar $500+ entre diferentes fornecedores de pacotes',

      tip_addedValue: 'Procure Valor Agregado',
      tip_addedValue_desc: 'Upgrades grátis, créditos de resort, late checkout agregam valor real aos pacotes',

      // FAQ
      faq_savings_q: 'Quanto posso economizar com um pacote de férias?',
      faq_savings_a: 'Pacotes de férias normalmente economizam 25-40% em comparação com a reserva de voos, hotéis e atividades separadamente. Quanto mais componentes você agrupar, maiores as economias. Pacotes também costumam incluir extras como créditos de resort, café da manhã grátis ou transfers cortesia.',

      faq_included_q: 'O que geralmente está incluído em um pacote?',
      faq_included_a: 'A maioria dos pacotes inclui voos de ida e volta e acomodação. Dependendo do tipo de pacote, você também pode obter refeições (all-inclusive), transfers do aeroporto, atividades, tours e seguro viagem. Sempre verifique a seção "O Que Está Incluído" para detalhes específicos.',

      faq_customize_q: 'Posso personalizar meu pacote?',
      faq_customize_a: 'Sim! A maioria dos fornecedores permite personalização. Você geralmente pode fazer upgrade da classe do voo, escolher hotéis diferentes, adicionar noites extras, incluir aluguel de carro ou adicionar excursões. Personalizações podem afetar o preço do pacote.',

      faq_bestTime_q: 'Qual é a melhor época para reservar um pacote?',
      faq_bestTime_a: 'Reserve com 3-4 meses de antecedência para destinos internacionais e 6-8 semanas para viagens domésticas. Fique atento a ofertas relâmpago durante a baixa temporada, Black Friday, Cyber Monday e Travel Tuesday. Ofertas de última hora (2-3 semanas antes) também podem oferecer economias significativas se você for flexível.',

      faq_refundable_q: 'Os pacotes são reembolsáveis?',
      faq_refundable_a: 'As políticas de reembolso variam por fornecedor e tipo de pacote. Pacotes padrão geralmente têm taxas de cancelamento, enquanto pacotes flexíveis custam mais, mas permitem cancelamento gratuito. Seguro viagem é recomendado para proteção contra mudanças inesperadas. Sempre leia a política de cancelamento antes de reservar.',

      faq_insurance_q: 'Preciso de seguro viagem com um pacote?',
      faq_insurance_a: 'Embora não seja obrigatório, o seguro viagem é altamente recomendado para pacotes, especialmente para viagens caras ou internacionais. Ele protege contra cancelamentos de viagem, emergências médicas, bagagem perdida e atrasos de voos. Muitos pacotes oferecem seguro como complemento durante a reserva.'
    }
  },
  es: {
    PackagesPage: {
      // Hero Section
      sectionTitle: 'Paquetes de Viaje Todo Incluido y Ofertas de Vacaciones',
      subtitle: 'Ahorra hasta 40% con ofertas combinadas de vuelo + hotel + actividades',

      // Section Headers
      packageTypes: 'Tipos y Categorías de Paquetes',
      popularDestinations: 'Principales Destinos de Paquetes',
      packageDurations: 'Opciones de Duración de Paquetes',
      whatsIncluded: 'Qué Está Incluido en los Paquetes',
      topProviders: 'Principales Proveedores de Paquetes',
      bookingTips: 'Consejos de Reserva de Paquetes',
      faq: 'Preguntas Frecuentes sobre Paquetes',

      // Package Types
      packageType_beachVacation: 'Paquetes de Vacaciones en la Playa',
      packageType_beachVacation_desc: 'Resorts todo incluido en la playa con vuelos, comidas y actividades',
      packageType_beachVacation_priceRange: '$800-$3.500',
      packageType_beachVacation_duration: '5-14 días',
      packageType_beachVacation_feature1: 'Vuelos de ida y vuelta',
      packageType_beachVacation_feature2: 'Resort Todo Incluido',
      packageType_beachVacation_feature3: 'Traslados al aeropuerto',
      packageType_beachVacation_feature4: 'Actividades diarias',
      packageType_beachVacation_examples: 'Cancún, Maldivas, Phuket, Bali Todo Incluido',
      packageType_beachVacation_bestFor: 'Amantes de la playa, familias, luna de miel',

      packageType_cityBreak: 'Paquetes de Escapada Urbana',
      packageType_cityBreak_desc: 'Aventuras urbanas con vuelos, hoteles y tours turísticos',
      packageType_cityBreak_priceRange: '$600-$2.500',
      packageType_cityBreak_duration: '3-7 días',
      packageType_cityBreak_feature1: 'Vuelos',
      packageType_cityBreak_feature2: 'Hotel Céntrico',
      packageType_cityBreak_feature3: 'Tours por la ciudad',
      packageType_cityBreak_feature4: 'Pases para museos',
      packageType_cityBreak_examples: 'París, Nueva York, Tokio, Dubai Escapadas Urbanas',
      packageType_cityBreak_bestFor: 'Entusiastas de la cultura, viajeros solitarios, parejas',

      packageType_adventure: 'Paquetes de Aventura',
      packageType_adventure_desc: 'Experiencias emocionantes con deportes extremos y exploración de la naturaleza',
      packageType_adventure_priceRange: '$1.200-$4.000',
      packageType_adventure_duration: '7-14 días',
      packageType_adventure_feature1: 'Vuelos',
      packageType_adventure_feature2: 'Lodge de Aventura',
      packageType_adventure_feature3: 'Alquiler de equipos',
      packageType_adventure_feature4: 'Guías expertos',
      packageType_adventure_examples: 'Aventura en Nueva Zelanda, Explorador de Costa Rica, Trekking en Islandia',
      packageType_adventure_bestFor: 'Buscadores de aventuras, entusiastas del aire libre',

      packageType_cruise: 'Paquetes de Crucero',
      packageType_cruise_desc: 'Viajes oceánicos con vuelos, cabina, comidas y entretenimiento',
      packageType_cruise_priceRange: '$1.500-$6.000',
      packageType_cruise_duration: '7-21 días',
      packageType_cruise_feature1: 'Vuelos',
      packageType_cruise_feature2: 'Cabina de crucero',
      packageType_cruise_feature3: 'Todas las comidas',
      packageType_cruise_feature4: 'Excursiones en tierra',
      packageType_cruise_examples: 'Crucero Mediterráneo, Crucero Caribe, Crucero Alaska',
      packageType_cruise_bestFor: 'Parejas, familias, personas mayores',

      packageType_safari: 'Paquetes de Safari',
      packageType_safari_desc: 'Aventuras de vida silvestre con lodges de lujo y safaris',
      packageType_safari_priceRange: '$2.500-$8.000',
      packageType_safari_duration: '7-14 días',
      packageType_safari_feature1: 'Vuelos',
      packageType_safari_feature2: 'Lodge Safari',
      packageType_safari_feature3: 'Safaris',
      packageType_safari_feature4: 'Rangers expertos',
      packageType_safari_examples: 'Safari en Kenia, Serengeti en Tanzania, Big Five en Sudáfrica',
      packageType_safari_bestFor: 'Amantes de la vida silvestre, fotógrafos, viajeros de lujo',

      packageType_ski: 'Paquetes de Esquí y Nieve',
      packageType_ski_desc: 'Deportes de invierno con vuelos, resorts de esquí y pases de elevador',
      packageType_ski_priceRange: '$1.000-$4.500',
      packageType_ski_duration: '5-10 días',
      packageType_ski_feature1: 'Vuelos',
      packageType_ski_feature2: 'Resort de Esquí',
      packageType_ski_feature3: 'Pases de elevador',
      packageType_ski_feature4: 'Alquiler de equipos',
      packageType_ski_examples: 'Alpes Suizos, Aspen, Whistler, Nieve en Japón',
      packageType_ski_bestFor: 'Entusiastas del esquí, amantes del invierno, familias',

      // Destinations
      dest_cancun: 'Cancún, México',
      dest_cancun_packages: '500+ paquetes',
      dest_cancun_pkg1: 'Playa Todo Incluido',
      dest_cancun_pkg2: 'Tour Ruinas Mayas',
      dest_cancun_pkg3: 'Paquete Fiesta',
      dest_cancun_pkg4: 'Resort Familiar',
      dest_cancun_priceFrom: '$799',

      dest_maldives: 'Maldivas',
      dest_maldives_packages: '300+ paquetes',
      dest_maldives_pkg1: 'Villa sobre el agua',
      dest_maldives_pkg2: 'Paquete de buceo',
      dest_maldives_pkg3: 'Especial Luna de Miel',
      dest_maldives_pkg4: 'Resort de Lujo',
      dest_maldives_priceFrom: '$1.899',

      dest_dubai: 'Dubai, EAU',
      dest_dubai_packages: '450+ paquetes',
      dest_dubai_pkg1: 'Ciudad + Desierto',
      dest_dubai_pkg2: 'Hoteles de Lujo',
      dest_dubai_pkg3: 'Tour de Compras',
      dest_dubai_pkg4: 'Bundle Parque Temático',
      dest_dubai_priceFrom: '$999',

      dest_bali: 'Bali, Indonesia',
      dest_bali_packages: '400+ paquetes',
      dest_bali_pkg1: 'Playa + Cultura',
      dest_bali_pkg2: 'Retiro de Yoga',
      dest_bali_pkg3: 'Paquete Aventura',
      dest_bali_pkg4: 'Estancia en Villa',
      dest_bali_priceFrom: '$699',

      dest_paris: 'París, Francia',
      dest_paris_packages: '350+ paquetes',
      dest_paris_pkg1: 'Escapada Romántica',
      dest_paris_pkg2: 'Pase para Museos',
      dest_paris_pkg3: 'Vino y Cena',
      dest_paris_pkg4: 'Bundle Disneyland',
      dest_paris_priceFrom: '$899',

      dest_newyork: 'Nueva York, EUA',
      dest_newyork_packages: '380+ paquetes',
      dest_newyork_pkg1: 'Shows de Broadway',
      dest_newyork_pkg2: 'Pase Turístico',
      dest_newyork_pkg3: 'Tour de Compras',
      dest_newyork_pkg4: 'Tour Gastronómico',
      dest_newyork_priceFrom: '$799',

      // Duration Options
      duration_weekendGetaway: 'Escapada de Fin de Semana',
      duration_weekendGetaway_time: '3-4 días',
      duration_weekendGetaway_desc: 'Perfecto para escapadas rápidas y city breaks cortos',
      duration_weekendGetaway_examples: 'Tours por la ciudad, fines de semana en la playa, retiros de spa',
      duration_weekendGetaway_priceRange: '$500-$1.500',
      duration_weekendGetaway_bestFor: 'Profesionales ocupados',

      duration_weekLong: 'Vacaciones de Una Semana',
      duration_weekLong_time: '7-10 días',
      duration_weekLong_desc: 'Equilibrio ideal entre relajación y exploración',
      duration_weekLong_examples: 'Resorts de playa, tours por Europa, island hopping',
      duration_weekLong_priceRange: '$1.200-$4.000',
      duration_weekLong_bestFor: 'Familias, parejas',

      duration_extended: 'Vacaciones Extendidas',
      duration_extended_time: '14-21 días',
      duration_extended_desc: 'Viajes completos con múltiples destinos',
      duration_extended_examples: 'Tours multi-país, cruceros, aventuras de safari',
      duration_extended_priceRange: '$3.000-$10.000',
      duration_extended_bestFor: 'Jubilados, aventureros',

      // What's Included
      included_flights: 'Vuelos de Ida y Vuelta',
      included_flights_desc: 'Vuelos económicos o premium desde tu ciudad',

      included_accommodation: 'Alojamiento',
      included_accommodation_desc: 'Hoteles, resorts o alquileres vacacionales para tu estadía',

      included_meals: 'Comidas y Bebidas',
      included_meals_desc: 'Desayuno, todo incluido o vouchers de comida incluidos',

      included_activities: 'Actividades y Tours',
      included_activities_desc: 'Tours guiados, excursiones y entretenimiento',

      // Top Providers
      provider_expedia: 'Paquetes Expedia',
      provider_expedia_specialty: 'Bundles Vuelo + Hotel',
      provider_expedia_discount: 'Hasta 30% de descuento',

      provider_costco: 'Costco Travel',
      provider_costco_specialty: 'Ofertas exclusivas para miembros',
      provider_costco_discount: 'Extras incluidos',

      provider_apple: 'Apple Vacations',
      provider_apple_specialty: 'Resorts todo incluido',
      provider_apple_discount: 'Créditos de resort incluidos',

      provider_funjet: 'Funjet Vacations',
      provider_funjet_specialty: 'Paquetes de playa',
      provider_funjet_discount: 'Niños gratis',

      provider_pleasant: 'Pleasant Holidays',
      provider_pleasant_specialty: 'Hawái y México',
      provider_pleasant_discount: 'Mejoras de habitación',

      provider_gate1: 'Gate 1 Travel',
      provider_gate1_specialty: 'Tours guiados',
      provider_gate1_discount: 'Ahorros por reserva anticipada',

      // Expert Tips
      tip_bundleSavings: 'Agrupa para Ahorros Máximos',
      tip_bundleSavings_desc: 'Reserva vuelo + hotel + carro juntos para ahorrar 30-40% vs reservar por separado',

      tip_checkIncluded: 'Verifica Qué Está Incluido',
      tip_checkIncluded_desc: 'Verifica comidas, transfers, actividades para evitar costos ocultos y sorpresas',

      tip_offSeason: 'Reserva Fuera de Temporada',
      tip_offSeason_desc: 'Viaja durante temporada media para misma calidad con 50% menos costo',

      tip_readDetails: 'Lee los Detalles del Paquete',
      tip_readDetails_desc: 'Verifica política de cancelación, tipo de habitación, horarios de vuelo antes de reservar',

      tip_compareProviders: 'Compara Proveedores',
      tip_compareProviders_desc: 'El mismo destino puede variar $500+ entre diferentes proveedores de paquetes',

      tip_addedValue: 'Busca Valor Agregado',
      tip_addedValue_desc: 'Mejoras gratis, créditos de resort, late checkout agregan valor real a los paquetes',

      // FAQ
      faq_savings_q: '¿Cuánto puedo ahorrar con un paquete de vacaciones?',
      faq_savings_a: 'Los paquetes de vacaciones normalmente te ahorran 25-40% en comparación con reservar vuelos, hoteles y actividades por separado. Cuantos más componentes agrupes, mayores los ahorros. Los paquetes también suelen incluir extras como créditos de resort, desayuno gratis o transfers cortesía.',

      faq_included_q: '¿Qué suele estar incluido en un paquete?',
      faq_included_a: 'La mayoría de los paquetes incluyen vuelos de ida y vuelta y alojamiento. Dependiendo del tipo de paquete, también puedes obtener comidas (todo incluido), transfers del aeropuerto, actividades, tours y seguro de viaje. Siempre verifica la sección "Qué Está Incluido" para detalles específicos.',

      faq_customize_q: '¿Puedo personalizar mi paquete?',
      faq_customize_a: '¡Sí! La mayoría de los proveedores permiten personalización. Generalmente puedes mejorar tu clase de vuelo, elegir hoteles diferentes, agregar noches extras, incluir alquiler de carro o agregar excursiones. Las personalizaciones pueden afectar el precio del paquete.',

      faq_bestTime_q: '¿Cuál es el mejor momento para reservar un paquete?',
      faq_bestTime_a: 'Reserva con 3-4 meses de anticipación para destinos internacionales y 6-8 semanas para viajes domésticos. Busca ofertas flash durante temporada baja, Black Friday, Cyber Monday y Travel Tuesday. Las ofertas de última hora (2-3 semanas antes) también pueden ofrecer ahorros significativos si eres flexible.',

      faq_refundable_q: '¿Los paquetes son reembolsables?',
      faq_refundable_a: 'Las políticas de reembolso varían según el proveedor y tipo de paquete. Los paquetes estándar suelen tener tarifas de cancelación, mientras que los paquetes flexibles cuestan más pero permiten cancelación gratuita. Se recomienda seguro de viaje para protección contra cambios inesperados. Siempre lee la política de cancelación antes de reservar.',

      faq_insurance_q: '¿Necesito seguro de viaje con un paquete?',
      faq_insurance_a: 'Aunque no es obligatorio, el seguro de viaje es altamente recomendado para paquetes, especialmente para viajes caros o internacionales. Protege contra cancelaciones de viaje, emergencias médicas, equipaje perdido y retrasos de vuelos. Muchos paquetes ofrecen seguro como complemento durante la reserva.'
    }
  }
};

// Function to merge translations into existing locale files
function mergeTranslations(localeCode, newTranslations) {
  const localeFilePath = path.join(__dirname, '..', 'messages', `${localeCode}.json`);

  let existingTranslations = {};
  if (fs.existsSync(localeFilePath)) {
    const fileContent = fs.readFileSync(localeFilePath, 'utf8');
    existingTranslations = JSON.parse(fileContent);
  }

  // Merge the new translations
  const mergedTranslations = {
    ...existingTranslations,
    ...newTranslations
  };

  // Write back to file with proper formatting
  fs.writeFileSync(
    localeFilePath,
    JSON.stringify(mergedTranslations, null, 2) + '\n',
    'utf8'
  );

  console.log(`✅ Updated ${localeCode}.json with PackagesPage translations`);
}

// Process each locale
Object.keys(packagesPageTranslations).forEach(locale => {
  mergeTranslations(locale, packagesPageTranslations[locale]);
});

console.log('\n🎉 All Packages page translations have been added successfully!');
