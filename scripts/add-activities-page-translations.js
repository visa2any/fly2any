const fs = require('fs');
const path = require('path');

// Define all ActivitiesPage translations
const activitiesPageTranslations = {
  en: {
    ActivitiesPage: {
      // Hero Section
      sectionTitle: 'Discover Exciting Activities & Unique Experiences',
      subtitle: 'From adventure sports to cultural workshops, create unforgettable memories',

      // Section Headers
      activityTypes: 'Activity Types & Categories',
      popularDestinations: 'Top Destinations for Activities',
      activityDurations: 'Activity Duration Options',
      whatsIncluded: "What's Included in Activities",
      topProviders: 'Top Activity Providers',
      bookingTips: 'Expert Booking Tips',
      faq: 'Activities FAQ',

      // Section Subtitles
      activityTypesSubtitle: 'Choose from diverse activity experiences tailored to your interests',
      destinationsSubtitle: "Discover activities in the world's most exciting destinations",
      durationsSubtitle: 'Choose the perfect activity duration for your schedule',
      includedSubtitle: 'Know what to expect before you book',
      providersSubtitle: 'Book with confidence from trusted activity providers',
      tipsSubtitle: 'Save money and enhance your experience with insider knowledge',
      faqSubtitle: 'Everything you need to know about booking activities with Fly2Any',

      // Activity Types
      activityType_adventureSports: 'Adventure Sports',
      activityType_adventureSports_desc: 'Adrenaline-pumping activities from skydiving to bungee jumping',
      activityType_adventureSports_duration: '2-6 hours',
      activityType_adventureSports_feature1: 'Skydiving',
      activityType_adventureSports_feature2: 'Bungee Jump',
      activityType_adventureSports_feature3: 'Paragliding',
      activityType_adventureSports_feature4: 'White Water Rafting',
      activityType_adventureSports_examples: 'Dubai Skydive, Queenstown Bungee, Swiss Paragliding',
      activityType_adventureSports_bestFor: 'Thrill-seekers, adventure enthusiasts',

      activityType_waterActivities: 'Water Activities',
      activityType_waterActivities_desc: 'Explore oceans, lakes, and rivers with exciting water sports',
      activityType_waterActivities_duration: '1-4 hours',
      activityType_waterActivities_feature1: 'Scuba Diving',
      activityType_waterActivities_feature2: 'Surfing',
      activityType_waterActivities_feature3: 'Kayaking',
      activityType_waterActivities_feature4: 'Jet Skiing',
      activityType_waterActivities_examples: 'Bali Surf Lessons, Maldives Diving, Hawaii Snorkeling',
      activityType_waterActivities_bestFor: 'Water lovers, marine life enthusiasts',

      activityType_culturalWorkshops: 'Cultural Workshops',
      activityType_culturalWorkshops_desc: 'Learn local crafts, cooking, and traditional arts from experts',
      activityType_culturalWorkshops_duration: '2-5 hours',
      activityType_culturalWorkshops_feature1: 'Cooking Classes',
      activityType_culturalWorkshops_feature2: 'Pottery',
      activityType_culturalWorkshops_feature3: 'Painting',
      activityType_culturalWorkshops_feature4: 'Dance Lessons',
      activityType_culturalWorkshops_examples: 'Thai Cooking Class, Japanese Pottery, Flamenco Dance',
      activityType_culturalWorkshops_bestFor: 'Culture enthusiasts, creative learners',

      activityType_outdoorAdventures: 'Outdoor Adventures',
      activityType_outdoorAdventures_desc: 'Hiking, camping, and nature exploration activities',
      activityType_outdoorAdventures_duration: '3 hours - 2 days',
      activityType_outdoorAdventures_feature1: 'Hiking Tours',
      activityType_outdoorAdventures_feature2: 'Rock Climbing',
      activityType_outdoorAdventures_feature3: 'Camping',
      activityType_outdoorAdventures_feature4: 'Zip-lining',
      activityType_outdoorAdventures_examples: 'Grand Canyon Hike, Alps Climbing, Costa Rica Zip-line',
      activityType_outdoorAdventures_bestFor: 'Nature lovers, outdoor enthusiasts',

      activityType_wellnessSpa: 'Wellness & Spa',
      activityType_wellnessSpa_desc: 'Relaxation activities including yoga, meditation, and spa treatments',
      activityType_wellnessSpa_duration: '1-8 hours',
      activityType_wellnessSpa_feature1: 'Yoga Classes',
      activityType_wellnessSpa_feature2: 'Spa Treatments',
      activityType_wellnessSpa_feature3: 'Meditation',
      activityType_wellnessSpa_feature4: 'Hot Springs',
      activityType_wellnessSpa_examples: 'Bali Yoga Retreat, Iceland Hot Springs, Thai Massage',
      activityType_wellnessSpa_bestFor: 'Wellness seekers, relaxation lovers',

      activityType_entertainmentShows: 'Entertainment & Shows',
      activityType_entertainmentShows_desc: 'Live performances, concerts, and cultural entertainment',
      activityType_entertainmentShows_duration: '1-3 hours',
      activityType_entertainmentShows_feature1: 'Theater Shows',
      activityType_entertainmentShows_feature2: 'Concerts',
      activityType_entertainmentShows_feature3: 'Cabaret',
      activityType_entertainmentShows_feature4: 'Dinner Shows',
      activityType_entertainmentShows_examples: 'Broadway Shows, Moulin Rouge, Cirque du Soleil',
      activityType_entertainmentShows_bestFor: 'Entertainment lovers, night life enthusiasts',

      // Destinations
      dest_dubai: 'Dubai, UAE',
      dest_dubai_activities: '1,500+ activities',
      dest_dubai_exp1: 'Desert Safari',
      dest_dubai_exp2: 'Skydiving',
      dest_dubai_exp3: 'Burj Khalifa',
      dest_dubai_exp4: 'Water Parks',
      dest_dubai_priceFrom: '$45',

      dest_bali: 'Bali, Indonesia',
      dest_bali_activities: '2,000+ activities',
      dest_bali_exp1: 'Surf Lessons',
      dest_bali_exp2: 'Temple Tours',
      dest_bali_exp3: 'Yoga Retreats',
      dest_bali_exp4: 'Cooking Classes',
      dest_bali_priceFrom: '$25',

      dest_barcelona: 'Barcelona, Spain',
      dest_barcelona_activities: '1,200+ activities',
      dest_barcelona_exp1: 'Tapas Tour',
      dest_barcelona_exp2: 'Sailing',
      dest_barcelona_exp3: 'Flamenco Show',
      dest_barcelona_exp4: 'Beach Activities',
      dest_barcelona_priceFrom: '$35',

      dest_queenstown: 'Queenstown, New Zealand',
      dest_queenstown_activities: '800+ activities',
      dest_queenstown_exp1: 'Bungee Jumping',
      dest_queenstown_exp2: 'Skiing',
      dest_queenstown_exp3: 'Jet Boating',
      dest_queenstown_exp4: 'Hiking',
      dest_queenstown_priceFrom: '$60',

      dest_paris: 'Paris, France',
      dest_paris_activities: '1,800+ activities',
      dest_paris_exp1: 'Cooking Classes',
      dest_paris_exp2: 'Wine Tasting',
      dest_paris_exp3: 'Art Workshops',
      dest_paris_exp4: 'Seine Cruise',
      dest_paris_priceFrom: '$40',

      dest_costarica: 'Costa Rica',
      dest_costarica_activities: '900+ activities',
      dest_costarica_exp1: 'Zip-lining',
      dest_costarica_exp2: 'Wildlife Tours',
      dest_costarica_exp3: 'Surfing',
      dest_costarica_exp4: 'Volcano Tours',
      dest_costarica_priceFrom: '$50',

      // Duration Options
      duration_quick: 'Quick Activities',
      duration_quick_time: '1-2 hours',
      duration_quick_desc: 'Short experiences perfect for filling gaps in your itinerary',
      duration_quick_examples: 'City bike rental, cooking demo, quick spa treatment',
      duration_quick_priceRange: '$20-$60',
      duration_quick_bestFor: 'Time-limited travelers, sampling experiences',

      duration_halfDay: 'Half-Day Activities',
      duration_halfDay_time: '3-5 hours',
      duration_halfDay_desc: 'Morning or afternoon experiences with guided instruction',
      duration_halfDay_examples: 'Cooking class, surf lesson, art workshop, city tour',
      duration_halfDay_priceRange: '$40-$120',
      duration_halfDay_bestFor: 'Balanced schedules, learning experiences',

      duration_fullDay: 'Full-Day Adventures',
      duration_fullDay_time: '6-10 hours',
      duration_fullDay_desc: 'Complete immersive experiences with meals and equipment included',
      duration_fullDay_examples: 'Desert safari, diving expedition, hiking trip, multi-activity package',
      duration_fullDay_priceRange: '$80-$250',
      duration_fullDay_bestFor: 'Deep immersion, special occasions',

      // What's Included
      included_instruction: 'Expert Instruction',
      included_instruction_desc: 'Certified instructors and guides for safe, enjoyable experiences',
      included_instruction_status: 'Always Included',

      included_equipment: 'Equipment & Gear',
      included_equipment_desc: 'All necessary equipment, safety gear, and materials provided',
      included_equipment_status: 'Usually Included',

      included_transport: 'Transportation',
      included_transport_desc: 'Hotel pickup, drop-off, or meeting point instructions',
      included_transport_status: 'Often Included',

      included_photos: 'Photos & Videos',
      included_photos_desc: 'Professional photos or videos of your experience',
      included_photos_status: 'Sometimes Included',

      // Top Providers
      provider_viator: 'Viator',
      provider_viator_activities: '50,000+ activities',
      provider_viator_destinations: '2,700+ destinations',
      provider_viator_specialty: 'Largest activity marketplace',
      provider_viator_cancellation: 'Free up to 24 hours',

      provider_getyourguide: 'GetYourGuide',
      provider_getyourguide_activities: '75,000+ activities',
      provider_getyourguide_destinations: '11,000+ locations',
      provider_getyourguide_specialty: 'Instant booking & mobile tickets',
      provider_getyourguide_cancellation: 'Flexible cancellation',

      provider_airbnb: 'Airbnb Experiences',
      provider_airbnb_activities: '40,000+ experiences',
      provider_airbnb_destinations: 'Worldwide',
      provider_airbnb_specialty: 'Local hosts & unique activities',
      provider_airbnb_cancellation: 'Free up to 24 hours',

      provider_klook: 'Klook',
      provider_klook_activities: '100,000+ activities',
      provider_klook_destinations: '1,000+ destinations',
      provider_klook_specialty: 'Best prices in Asia',
      provider_klook_cancellation: 'Varies by activity',

      provider_tripadvisor: 'TripAdvisor Experiences',
      provider_tripadvisor_activities: '300,000+ activities',
      provider_tripadvisor_destinations: 'Global coverage',
      provider_tripadvisor_specialty: 'Verified reviews',
      provider_tripadvisor_cancellation: 'Varies by provider',

      provider_bookme: 'BookMe',
      provider_bookme_activities: '5,000+ activities',
      provider_bookme_destinations: 'New Zealand & Australia',
      provider_bookme_specialty: 'Last-minute deals',
      provider_bookme_cancellation: 'Varies by activity',

      // Booking Tips
      tip_checkWeather: 'Check Weather Requirements',
      tip_checkWeather_desc: 'Many outdoor activities are weather-dependent. Check forecasts and cancellation policies for rainy days.',

      tip_bookAhead: 'Book Popular Activities Early',
      tip_bookAhead_desc: 'Popular experiences like skydiving or cooking classes can fill up weeks in advance. Book 1-2 weeks ahead.',

      tip_ageRestrictions: 'Verify Age & Fitness Requirements',
      tip_ageRestrictions_desc: 'Many activities have minimum age, weight, or fitness requirements. Check before booking to avoid disappointment.',

      tip_groupDiscounts: 'Look for Group Discounts',
      tip_groupDiscounts_desc: 'Many providers offer 10-20% discounts for groups of 4+. Ask about group rates when booking.',

      tip_readReviews: 'Read Recent Reviews',
      tip_readReviews_desc: 'Focus on reviews from the last 3-6 months. Activity quality and instructors can change over time.',

      tip_insuranceCheck: 'Check Activity Insurance Coverage',
      tip_insuranceCheck_desc: 'Verify if your travel insurance covers adventure activities. Some require additional coverage for high-risk sports.',

      // FAQ
      faq_cancellation_q: 'What is the cancellation policy for activities?',
      faq_cancellation_a: 'Most activities offer free cancellation 24-48 hours before the start time. Weather-dependent activities typically offer full refunds if canceled due to unsafe conditions. Always check the specific activity\'s cancellation terms.',

      faq_fitness_q: 'Do I need to be fit for adventure activities?',
      faq_fitness_a: 'It depends on the activity. Most providers clearly state fitness requirements. Hiking and climbing need moderate fitness, while activities like cooking classes or spa treatments have no requirements. Contact the provider if unsure.',

      faq_whatToBring_q: 'What should I bring to an activity?',
      faq_whatToBring_a: 'Check the activity description for specific requirements. Common items: comfortable clothes, sunscreen, water bottle, closed-toe shoes for active experiences. Most providers supply specialized equipment.',

      faq_ageRestrictions_q: 'Are there age restrictions for activities?',
      faq_ageRestrictions_a: 'Yes, many activities have minimum age requirements. Adventure sports typically require participants to be 12-18+. Family-friendly activities welcome all ages. Check "Age Requirements" in the activity description.',

      faq_groupBooking_q: 'Can I book activities for large groups?',
      faq_groupBooking_a: 'Absolutely! Many providers offer group discounts for 4+ people. For groups of 10+, contact the provider directly for custom arrangements and better pricing. Book well in advance for large groups.',

      faq_meetingPoint_q: 'How do I find the meeting point?',
      faq_meetingPoint_a: 'Your confirmation email will include meeting point details (address, GPS coordinates, landmarks) and what to look for (guide with sign, specific clothing). Arrive 10-15 minutes early. Most providers offer a contact number.',

      // Common UI text
      activitiesAvailable: 'activities available',
      topExperiences: 'Top Experiences:',
      activitiesFrom: 'Activities from',
      exploreActivities: 'Explore Activities',
      priceRange: 'Price Range',
      examples: 'Examples:',
      stillQuestions: 'Still have questions?',
      contactSupport: 'Contact Our Support Team',
      viewActivities: 'View Activities',
    },
  },
  pt: {
    ActivitiesPage: {
      // Hero Section
      sectionTitle: 'Descubra Atividades Emocionantes e Experiências Únicas',
      subtitle: 'De esportes de aventura a workshops culturais, crie memórias inesquecíveis',

      // Section Headers
      activityTypes: 'Tipos e Categorias de Atividades',
      popularDestinations: 'Principais Destinos para Atividades',
      activityDurations: 'Opções de Duração de Atividades',
      whatsIncluded: 'O Que Está Incluído nas Atividades',
      topProviders: 'Principais Provedores de Atividades',
      bookingTips: 'Dicas de Reserva',
      faq: 'Perguntas Frequentes sobre Atividades',

      // Section Subtitles
      activityTypesSubtitle: 'Escolha entre diversas experiências de atividades adaptadas aos seus interesses',
      destinationsSubtitle: 'Descubra atividades nos destinos mais emocionantes do mundo',
      durationsSubtitle: 'Escolha a duração perfeita da atividade para sua agenda',
      includedSubtitle: 'Saiba o que esperar antes de reservar',
      providersSubtitle: 'Reserve com confiança de provedores de atividades confiáveis',
      tipsSubtitle: 'Economize dinheiro e melhore sua experiência com conhecimento interno',
      faqSubtitle: 'Tudo o que você precisa saber sobre reservar atividades com Fly2Any',

      // Activity Types
      activityType_adventureSports: 'Esportes de Aventura',
      activityType_adventureSports_desc: 'Atividades cheias de adrenalina desde paraquedismo até bungee jump',
      activityType_adventureSports_duration: '2-6 horas',
      activityType_adventureSports_feature1: 'Paraquedismo',
      activityType_adventureSports_feature2: 'Bungee Jump',
      activityType_adventureSports_feature3: 'Parapente',
      activityType_adventureSports_feature4: 'Rafting',
      activityType_adventureSports_examples: 'Paraquedismo em Dubai, Bungee em Queenstown, Parapente na Suíça',
      activityType_adventureSports_bestFor: 'Aventureiros, entusiastas de adrenalina',

      activityType_waterActivities: 'Atividades Aquáticas',
      activityType_waterActivities_desc: 'Explore oceanos, lagos e rios com esportes aquáticos emocionantes',
      activityType_waterActivities_duration: '1-4 horas',
      activityType_waterActivities_feature1: 'Mergulho',
      activityType_waterActivities_feature2: 'Surfe',
      activityType_waterActivities_feature3: 'Caiaque',
      activityType_waterActivities_feature4: 'Jet Ski',
      activityType_waterActivities_examples: 'Aulas de Surfe em Bali, Mergulho nas Maldivas, Snorkel no Havaí',
      activityType_waterActivities_bestFor: 'Amantes da água, entusiastas da vida marinha',

      activityType_culturalWorkshops: 'Workshops Culturais',
      activityType_culturalWorkshops_desc: 'Aprenda artesanato local, culinária e artes tradicionais com especialistas',
      activityType_culturalWorkshops_duration: '2-5 horas',
      activityType_culturalWorkshops_feature1: 'Aulas de Culinária',
      activityType_culturalWorkshops_feature2: 'Cerâmica',
      activityType_culturalWorkshops_feature3: 'Pintura',
      activityType_culturalWorkshops_feature4: 'Aulas de Dança',
      activityType_culturalWorkshops_examples: 'Aula de Culinária Tailandesa, Cerâmica Japonesa, Dança Flamenca',
      activityType_culturalWorkshops_bestFor: 'Entusiastas da cultura, aprendizes criativos',

      activityType_outdoorAdventures: 'Aventuras ao Ar Livre',
      activityType_outdoorAdventures_desc: 'Trilhas, camping e atividades de exploração da natureza',
      activityType_outdoorAdventures_duration: '3 horas - 2 dias',
      activityType_outdoorAdventures_feature1: 'Tours de Trilha',
      activityType_outdoorAdventures_feature2: 'Escalada',
      activityType_outdoorAdventures_feature3: 'Camping',
      activityType_outdoorAdventures_feature4: 'Tirolesa',
      activityType_outdoorAdventures_examples: 'Trilha no Grand Canyon, Escalada nos Alpes, Tirolesa na Costa Rica',
      activityType_outdoorAdventures_bestFor: 'Amantes da natureza, entusiastas do ar livre',

      activityType_wellnessSpa: 'Bem-estar e Spa',
      activityType_wellnessSpa_desc: 'Atividades de relaxamento incluindo yoga, meditação e tratamentos de spa',
      activityType_wellnessSpa_duration: '1-8 horas',
      activityType_wellnessSpa_feature1: 'Aulas de Yoga',
      activityType_wellnessSpa_feature2: 'Tratamentos de Spa',
      activityType_wellnessSpa_feature3: 'Meditação',
      activityType_wellnessSpa_feature4: 'Fontes Termais',
      activityType_wellnessSpa_examples: 'Retiro de Yoga em Bali, Fontes Termais na Islândia, Massagem Tailandesa',
      activityType_wellnessSpa_bestFor: 'Buscadores de bem-estar, amantes do relaxamento',

      activityType_entertainmentShows: 'Entretenimento e Shows',
      activityType_entertainmentShows_desc: 'Apresentações ao vivo, concertos e entretenimento cultural',
      activityType_entertainmentShows_duration: '1-3 horas',
      activityType_entertainmentShows_feature1: 'Shows de Teatro',
      activityType_entertainmentShows_feature2: 'Concertos',
      activityType_entertainmentShows_feature3: 'Cabaré',
      activityType_entertainmentShows_feature4: 'Shows com Jantar',
      activityType_entertainmentShows_examples: 'Shows da Broadway, Moulin Rouge, Cirque du Soleil',
      activityType_entertainmentShows_bestFor: 'Amantes do entretenimento, entusiastas da vida noturna',

      // Destinations
      dest_dubai: 'Dubai, EAU',
      dest_dubai_activities: '+1.500 atividades',
      dest_dubai_exp1: 'Safari no Deserto',
      dest_dubai_exp2: 'Paraquedismo',
      dest_dubai_exp3: 'Burj Khalifa',
      dest_dubai_exp4: 'Parques Aquáticos',
      dest_dubai_priceFrom: '$45',

      dest_bali: 'Bali, Indonésia',
      dest_bali_activities: '+2.000 atividades',
      dest_bali_exp1: 'Aulas de Surfe',
      dest_bali_exp2: 'Tours de Templos',
      dest_bali_exp3: 'Retiros de Yoga',
      dest_bali_exp4: 'Aulas de Culinária',
      dest_bali_priceFrom: '$25',

      dest_barcelona: 'Barcelona, Espanha',
      dest_barcelona_activities: '+1.200 atividades',
      dest_barcelona_exp1: 'Tour de Tapas',
      dest_barcelona_exp2: 'Vela',
      dest_barcelona_exp3: 'Show de Flamenco',
      dest_barcelona_exp4: 'Atividades de Praia',
      dest_barcelona_priceFrom: '$35',

      dest_queenstown: 'Queenstown, Nova Zelândia',
      dest_queenstown_activities: '+800 atividades',
      dest_queenstown_exp1: 'Bungee Jumping',
      dest_queenstown_exp2: 'Esqui',
      dest_queenstown_exp3: 'Jet Boat',
      dest_queenstown_exp4: 'Trilhas',
      dest_queenstown_priceFrom: '$60',

      dest_paris: 'Paris, França',
      dest_paris_activities: '+1.800 atividades',
      dest_paris_exp1: 'Aulas de Culinária',
      dest_paris_exp2: 'Degustação de Vinhos',
      dest_paris_exp3: 'Workshops de Arte',
      dest_paris_exp4: 'Cruzeiro no Sena',
      dest_paris_priceFrom: '$40',

      dest_costarica: 'Costa Rica',
      dest_costarica_activities: '+900 atividades',
      dest_costarica_exp1: 'Tirolesa',
      dest_costarica_exp2: 'Tours de Vida Selvagem',
      dest_costarica_exp3: 'Surfe',
      dest_costarica_exp4: 'Tours de Vulcão',
      dest_costarica_priceFrom: '$50',

      // Duration Options
      duration_quick: 'Atividades Rápidas',
      duration_quick_time: '1-2 horas',
      duration_quick_desc: 'Experiências curtas perfeitas para preencher lacunas no seu itinerário',
      duration_quick_examples: 'Aluguel de bicicleta, demonstração culinária, tratamento rápido de spa',
      duration_quick_priceRange: '$20-$60',
      duration_quick_bestFor: 'Viajantes com tempo limitado, experiências de amostra',

      duration_halfDay: 'Atividades de Meio Dia',
      duration_halfDay_time: '3-5 horas',
      duration_halfDay_desc: 'Experiências matinais ou vespertinas com instrução guiada',
      duration_halfDay_examples: 'Aula de culinária, aula de surfe, workshop de arte, tour pela cidade',
      duration_halfDay_priceRange: '$40-$120',
      duration_halfDay_bestFor: 'Agendas equilibradas, experiências de aprendizado',

      duration_fullDay: 'Aventuras de Dia Inteiro',
      duration_fullDay_time: '6-10 horas',
      duration_fullDay_desc: 'Experiências imersivas completas com refeições e equipamento incluídos',
      duration_fullDay_examples: 'Safari no deserto, expedição de mergulho, viagem de trilha, pacote multi-atividade',
      duration_fullDay_priceRange: '$80-$250',
      duration_fullDay_bestFor: 'Imersão profunda, ocasiões especiais',

      // What's Included
      included_instruction: 'Instrução Especializada',
      included_instruction_desc: 'Instrutores e guias certificados para experiências seguras e agradáveis',
      included_instruction_status: 'Sempre Incluído',

      included_equipment: 'Equipamento e Material',
      included_equipment_desc: 'Todo equipamento necessário, equipamento de segurança e materiais fornecidos',
      included_equipment_status: 'Geralmente Incluído',

      included_transport: 'Transporte',
      included_transport_desc: 'Busca no hotel, desembarque ou instruções de ponto de encontro',
      included_transport_status: 'Frequentemente Incluído',

      included_photos: 'Fotos e Vídeos',
      included_photos_desc: 'Fotos ou vídeos profissionais da sua experiência',
      included_photos_status: 'Às Vezes Incluído',

      // Top Providers
      provider_viator: 'Viator',
      provider_viator_activities: '+50.000 atividades',
      provider_viator_destinations: '+2.700 destinos',
      provider_viator_specialty: 'Maior marketplace de atividades',
      provider_viator_cancellation: 'Grátis até 24 horas',

      provider_getyourguide: 'GetYourGuide',
      provider_getyourguide_activities: '+75.000 atividades',
      provider_getyourguide_destinations: '+11.000 locais',
      provider_getyourguide_specialty: 'Reserva instantânea e bilhetes móveis',
      provider_getyourguide_cancellation: 'Cancelamento flexível',

      provider_airbnb: 'Airbnb Experiences',
      provider_airbnb_activities: '+40.000 experiências',
      provider_airbnb_destinations: 'Mundial',
      provider_airbnb_specialty: 'Anfitriões locais e atividades únicas',
      provider_airbnb_cancellation: 'Grátis até 24 horas',

      provider_klook: 'Klook',
      provider_klook_activities: '+100.000 atividades',
      provider_klook_destinations: '+1.000 destinos',
      provider_klook_specialty: 'Melhores preços na Ásia',
      provider_klook_cancellation: 'Varia por atividade',

      provider_tripadvisor: 'TripAdvisor Experiences',
      provider_tripadvisor_activities: '+300.000 atividades',
      provider_tripadvisor_destinations: 'Cobertura global',
      provider_tripadvisor_specialty: 'Avaliações verificadas',
      provider_tripadvisor_cancellation: 'Varia por provedor',

      provider_bookme: 'BookMe',
      provider_bookme_activities: '+5.000 atividades',
      provider_bookme_destinations: 'Nova Zelândia e Austrália',
      provider_bookme_specialty: 'Ofertas de última hora',
      provider_bookme_cancellation: 'Varia por atividade',

      // Booking Tips
      tip_checkWeather: 'Verifique Requisitos Climáticos',
      tip_checkWeather_desc: 'Muitas atividades ao ar livre dependem do clima. Verifique previsões e políticas de cancelamento para dias chuvosos.',

      tip_bookAhead: 'Reserve Atividades Populares com Antecedência',
      tip_bookAhead_desc: 'Experiências populares como paraquedismo ou aulas de culinária podem lotar semanas antes. Reserve com 1-2 semanas de antecedência.',

      tip_ageRestrictions: 'Verifique Requisitos de Idade e Condicionamento',
      tip_ageRestrictions_desc: 'Muitas atividades têm requisitos mínimos de idade, peso ou condicionamento físico. Verifique antes de reservar para evitar decepções.',

      tip_groupDiscounts: 'Procure Descontos para Grupos',
      tip_groupDiscounts_desc: 'Muitos provedores oferecem descontos de 10-20% para grupos de 4+. Pergunte sobre tarifas de grupo ao reservar.',

      tip_readReviews: 'Leia Avaliações Recentes',
      tip_readReviews_desc: 'Concentre-se em avaliações dos últimos 3-6 meses. A qualidade da atividade e instrutores podem mudar com o tempo.',

      tip_insuranceCheck: 'Verifique Cobertura de Seguro de Atividades',
      tip_insuranceCheck_desc: 'Verifique se seu seguro de viagem cobre atividades de aventura. Alguns exigem cobertura adicional para esportes de alto risco.',

      // FAQ
      faq_cancellation_q: 'Qual é a política de cancelamento para atividades?',
      faq_cancellation_a: 'A maioria das atividades oferece cancelamento gratuito 24-48 horas antes do horário de início. Atividades dependentes do clima geralmente oferecem reembolso total se canceladas devido a condições inseguras. Sempre verifique os termos de cancelamento específicos da atividade.',

      faq_fitness_q: 'Preciso estar em forma para atividades de aventura?',
      faq_fitness_a: 'Depende da atividade. A maioria dos provedores declara claramente os requisitos de condicionamento físico. Trilhas e escaladas precisam de condicionamento moderado, enquanto atividades como aulas de culinária ou tratamentos de spa não têm requisitos. Entre em contato com o provedor se não tiver certeza.',

      faq_whatToBring_q: 'O que devo levar para uma atividade?',
      faq_whatToBring_a: 'Verifique a descrição da atividade para requisitos específicos. Itens comuns: roupas confortáveis, protetor solar, garrafa de água, sapatos fechados para experiências ativas. A maioria dos provedores fornece equipamentos especializados.',

      faq_ageRestrictions_q: 'Existem restrições de idade para atividades?',
      faq_ageRestrictions_a: 'Sim, muitas atividades têm requisitos mínimos de idade. Esportes de aventura geralmente exigem que os participantes tenham 12-18+. Atividades para toda a família aceitam todas as idades. Verifique "Requisitos de Idade" na descrição da atividade.',

      faq_groupBooking_q: 'Posso reservar atividades para grupos grandes?',
      faq_groupBooking_a: 'Absolutamente! Muitos provedores oferecem descontos para grupos de 4+ pessoas. Para grupos de 10+, entre em contato diretamente com o provedor para arranjos personalizados e melhores preços. Reserve com bastante antecedência para grupos grandes.',

      faq_meetingPoint_q: 'Como encontro o ponto de encontro?',
      faq_meetingPoint_a: 'Seu e-mail de confirmação incluirá detalhes do ponto de encontro (endereço, coordenadas GPS, marcos) e o que procurar (guia com placa, roupas específicas). Chegue 10-15 minutos mais cedo. A maioria dos provedores oferece um número de contato.',

      // Common UI text
      activitiesAvailable: 'atividades disponíveis',
      topExperiences: 'Principais Experiências:',
      activitiesFrom: 'Atividades a partir de',
      exploreActivities: 'Explorar Atividades',
      priceRange: 'Faixa de Preço',
      examples: 'Exemplos:',
      stillQuestions: 'Ainda tem dúvidas?',
      contactSupport: 'Entre em Contato com Nossa Equipe de Suporte',
      viewActivities: 'Ver Atividades',
    },
  },
  es: {
    ActivitiesPage: {
      // Hero Section
      sectionTitle: 'Descubre Actividades Emocionantes y Experiencias Únicas',
      subtitle: 'Desde deportes de aventura hasta talleres culturales, crea recuerdos inolvidables',

      // Section Headers
      activityTypes: 'Tipos y Categorías de Actividades',
      popularDestinations: 'Principales Destinos para Actividades',
      activityDurations: 'Opciones de Duración de Actividades',
      whatsIncluded: 'Qué Está Incluido en las Actividades',
      topProviders: 'Principales Proveedores de Actividades',
      bookingTips: 'Consejos de Reserva',
      faq: 'Preguntas Frecuentes sobre Actividades',

      // Section Subtitles
      activityTypesSubtitle: 'Elige entre diversas experiencias de actividades adaptadas a tus intereses',
      destinationsSubtitle: 'Descubre actividades en los destinos más emocionantes del mundo',
      durationsSubtitle: 'Elige la duración perfecta de la actividad para tu horario',
      includedSubtitle: 'Sabe qué esperar antes de reservar',
      providersSubtitle: 'Reserva con confianza de proveedores de actividades confiables',
      tipsSubtitle: 'Ahorra dinero y mejora tu experiencia con conocimiento interno',
      faqSubtitle: 'Todo lo que necesitas saber sobre reservar actividades con Fly2Any',

      // Activity Types
      activityType_adventureSports: 'Deportes de Aventura',
      activityType_adventureSports_desc: 'Actividades llenas de adrenalina desde paracaidismo hasta bungee jumping',
      activityType_adventureSports_duration: '2-6 horas',
      activityType_adventureSports_feature1: 'Paracaidismo',
      activityType_adventureSports_feature2: 'Bungee Jump',
      activityType_adventureSports_feature3: 'Parapente',
      activityType_adventureSports_feature4: 'Rafting',
      activityType_adventureSports_examples: 'Paracaidismo en Dubái, Bungee en Queenstown, Parapente en Suiza',
      activityType_adventureSports_bestFor: 'Aventureros, entusiastas de la adrenalina',

      activityType_waterActivities: 'Actividades Acuáticas',
      activityType_waterActivities_desc: 'Explora océanos, lagos y ríos con deportes acuáticos emocionantes',
      activityType_waterActivities_duration: '1-4 horas',
      activityType_waterActivities_feature1: 'Buceo',
      activityType_waterActivities_feature2: 'Surf',
      activityType_waterActivities_feature3: 'Kayak',
      activityType_waterActivities_feature4: 'Jet Ski',
      activityType_waterActivities_examples: 'Clases de Surf en Bali, Buceo en Maldivas, Snorkel en Hawái',
      activityType_waterActivities_bestFor: 'Amantes del agua, entusiastas de la vida marina',

      activityType_culturalWorkshops: 'Talleres Culturales',
      activityType_culturalWorkshops_desc: 'Aprende artesanía local, cocina y artes tradicionales con expertos',
      activityType_culturalWorkshops_duration: '2-5 horas',
      activityType_culturalWorkshops_feature1: 'Clases de Cocina',
      activityType_culturalWorkshops_feature2: 'Cerámica',
      activityType_culturalWorkshops_feature3: 'Pintura',
      activityType_culturalWorkshops_feature4: 'Clases de Baile',
      activityType_culturalWorkshops_examples: 'Clase de Cocina Tailandesa, Cerámica Japonesa, Danza Flamenca',
      activityType_culturalWorkshops_bestFor: 'Entusiastas de la cultura, aprendices creativos',

      activityType_outdoorAdventures: 'Aventuras al Aire Libre',
      activityType_outdoorAdventures_desc: 'Senderismo, camping y actividades de exploración de la naturaleza',
      activityType_outdoorAdventures_duration: '3 horas - 2 días',
      activityType_outdoorAdventures_feature1: 'Tours de Senderismo',
      activityType_outdoorAdventures_feature2: 'Escalada',
      activityType_outdoorAdventures_feature3: 'Camping',
      activityType_outdoorAdventures_feature4: 'Tirolesa',
      activityType_outdoorAdventures_examples: 'Senderismo en el Gran Cañón, Escalada en los Alpes, Tirolesa en Costa Rica',
      activityType_outdoorAdventures_bestFor: 'Amantes de la naturaleza, entusiastas del aire libre',

      activityType_wellnessSpa: 'Bienestar y Spa',
      activityType_wellnessSpa_desc: 'Actividades de relajación incluyendo yoga, meditación y tratamientos de spa',
      activityType_wellnessSpa_duration: '1-8 horas',
      activityType_wellnessSpa_feature1: 'Clases de Yoga',
      activityType_wellnessSpa_feature2: 'Tratamientos de Spa',
      activityType_wellnessSpa_feature3: 'Meditación',
      activityType_wellnessSpa_feature4: 'Aguas Termales',
      activityType_wellnessSpa_examples: 'Retiro de Yoga en Bali, Aguas Termales en Islandia, Masaje Tailandés',
      activityType_wellnessSpa_bestFor: 'Buscadores de bienestar, amantes de la relajación',

      activityType_entertainmentShows: 'Entretenimiento y Shows',
      activityType_entertainmentShows_desc: 'Presentaciones en vivo, conciertos y entretenimiento cultural',
      activityType_entertainmentShows_duration: '1-3 horas',
      activityType_entertainmentShows_feature1: 'Shows de Teatro',
      activityType_entertainmentShows_feature2: 'Conciertos',
      activityType_entertainmentShows_feature3: 'Cabaret',
      activityType_entertainmentShows_feature4: 'Shows con Cena',
      activityType_entertainmentShows_examples: 'Shows de Broadway, Moulin Rouge, Cirque du Soleil',
      activityType_entertainmentShows_bestFor: 'Amantes del entretenimiento, entusiastas de la vida nocturna',

      // Destinations
      dest_dubai: 'Dubái, EAU',
      dest_dubai_activities: '+1.500 actividades',
      dest_dubai_exp1: 'Safari en el Desierto',
      dest_dubai_exp2: 'Paracaidismo',
      dest_dubai_exp3: 'Burj Khalifa',
      dest_dubai_exp4: 'Parques Acuáticos',
      dest_dubai_priceFrom: '$45',

      dest_bali: 'Bali, Indonesia',
      dest_bali_activities: '+2.000 actividades',
      dest_bali_exp1: 'Clases de Surf',
      dest_bali_exp2: 'Tours de Templos',
      dest_bali_exp3: 'Retiros de Yoga',
      dest_bali_exp4: 'Clases de Cocina',
      dest_bali_priceFrom: '$25',

      dest_barcelona: 'Barcelona, España',
      dest_barcelona_activities: '+1.200 actividades',
      dest_barcelona_exp1: 'Tour de Tapas',
      dest_barcelona_exp2: 'Vela',
      dest_barcelona_exp3: 'Show de Flamenco',
      dest_barcelona_exp4: 'Actividades de Playa',
      dest_barcelona_priceFrom: '$35',

      dest_queenstown: 'Queenstown, Nueva Zelanda',
      dest_queenstown_activities: '+800 actividades',
      dest_queenstown_exp1: 'Bungee Jumping',
      dest_queenstown_exp2: 'Esquí',
      dest_queenstown_exp3: 'Jet Boat',
      dest_queenstown_exp4: 'Senderismo',
      dest_queenstown_priceFrom: '$60',

      dest_paris: 'París, Francia',
      dest_paris_activities: '+1.800 actividades',
      dest_paris_exp1: 'Clases de Cocina',
      dest_paris_exp2: 'Cata de Vinos',
      dest_paris_exp3: 'Talleres de Arte',
      dest_paris_exp4: 'Crucero por el Sena',
      dest_paris_priceFrom: '$40',

      dest_costarica: 'Costa Rica',
      dest_costarica_activities: '+900 actividades',
      dest_costarica_exp1: 'Tirolesa',
      dest_costarica_exp2: 'Tours de Vida Silvestre',
      dest_costarica_exp3: 'Surf',
      dest_costarica_exp4: 'Tours de Volcán',
      dest_costarica_priceFrom: '$50',

      // Duration Options
      duration_quick: 'Actividades Rápidas',
      duration_quick_time: '1-2 horas',
      duration_quick_desc: 'Experiencias cortas perfectas para llenar huecos en tu itinerario',
      duration_quick_examples: 'Alquiler de bicicleta, demostración culinaria, tratamiento rápido de spa',
      duration_quick_priceRange: '$20-$60',
      duration_quick_bestFor: 'Viajeros con tiempo limitado, experiencias de muestra',

      duration_halfDay: 'Actividades de Medio Día',
      duration_halfDay_time: '3-5 horas',
      duration_halfDay_desc: 'Experiencias matutinas o vespertinas con instrucción guiada',
      duration_halfDay_examples: 'Clase de cocina, clase de surf, taller de arte, tour por la ciudad',
      duration_halfDay_priceRange: '$40-$120',
      duration_halfDay_bestFor: 'Horarios equilibrados, experiencias de aprendizaje',

      duration_fullDay: 'Aventuras de Día Completo',
      duration_fullDay_time: '6-10 horas',
      duration_fullDay_desc: 'Experiencias inmersivas completas con comidas y equipo incluidos',
      duration_fullDay_examples: 'Safari en el desierto, expedición de buceo, viaje de senderismo, paquete multi-actividad',
      duration_fullDay_priceRange: '$80-$250',
      duration_fullDay_bestFor: 'Inmersión profunda, ocasiones especiales',

      // What's Included
      included_instruction: 'Instrucción Experta',
      included_instruction_desc: 'Instructores y guías certificados para experiencias seguras y agradables',
      included_instruction_status: 'Siempre Incluido',

      included_equipment: 'Equipo y Material',
      included_equipment_desc: 'Todo el equipo necesario, equipo de seguridad y materiales proporcionados',
      included_equipment_status: 'Generalmente Incluido',

      included_transport: 'Transporte',
      included_transport_desc: 'Recogida en el hotel, desembarque o instrucciones de punto de encuentro',
      included_transport_status: 'A Menudo Incluido',

      included_photos: 'Fotos y Videos',
      included_photos_desc: 'Fotos o videos profesionales de tu experiencia',
      included_photos_status: 'A Veces Incluido',

      // Top Providers
      provider_viator: 'Viator',
      provider_viator_activities: '+50.000 actividades',
      provider_viator_destinations: '+2.700 destinos',
      provider_viator_specialty: 'Mayor marketplace de actividades',
      provider_viator_cancellation: 'Gratis hasta 24 horas',

      provider_getyourguide: 'GetYourGuide',
      provider_getyourguide_activities: '+75.000 actividades',
      provider_getyourguide_destinations: '+11.000 ubicaciones',
      provider_getyourguide_specialty: 'Reserva instantánea y boletos móviles',
      provider_getyourguide_cancellation: 'Cancelación flexible',

      provider_airbnb: 'Airbnb Experiences',
      provider_airbnb_activities: '+40.000 experiencias',
      provider_airbnb_destinations: 'Mundial',
      provider_airbnb_specialty: 'Anfitriones locales y actividades únicas',
      provider_airbnb_cancellation: 'Gratis hasta 24 horas',

      provider_klook: 'Klook',
      provider_klook_activities: '+100.000 actividades',
      provider_klook_destinations: '+1.000 destinos',
      provider_klook_specialty: 'Mejores precios en Asia',
      provider_klook_cancellation: 'Varía por actividad',

      provider_tripadvisor: 'TripAdvisor Experiences',
      provider_tripadvisor_activities: '+300.000 actividades',
      provider_tripadvisor_destinations: 'Cobertura global',
      provider_tripadvisor_specialty: 'Reseñas verificadas',
      provider_tripadvisor_cancellation: 'Varía por proveedor',

      provider_bookme: 'BookMe',
      provider_bookme_activities: '+5.000 actividades',
      provider_bookme_destinations: 'Nueva Zelanda y Australia',
      provider_bookme_specialty: 'Ofertas de última hora',
      provider_bookme_cancellation: 'Varía por actividad',

      // Booking Tips
      tip_checkWeather: 'Verifica Requisitos Climáticos',
      tip_checkWeather_desc: 'Muchas actividades al aire libre dependen del clima. Verifica pronósticos y políticas de cancelación para días lluviosos.',

      tip_bookAhead: 'Reserva Actividades Populares con Anticipación',
      tip_bookAhead_desc: 'Experiencias populares como paracaidismo o clases de cocina pueden llenarse semanas antes. Reserva con 1-2 semanas de anticipación.',

      tip_ageRestrictions: 'Verifica Requisitos de Edad y Condición Física',
      tip_ageRestrictions_desc: 'Muchas actividades tienen requisitos mínimos de edad, peso o condición física. Verifica antes de reservar para evitar decepciones.',

      tip_groupDiscounts: 'Busca Descuentos para Grupos',
      tip_groupDiscounts_desc: 'Muchos proveedores ofrecen descuentos del 10-20% para grupos de 4+. Pregunta sobre tarifas de grupo al reservar.',

      tip_readReviews: 'Lee Reseñas Recientes',
      tip_readReviews_desc: 'Concéntrate en reseñas de los últimos 3-6 meses. La calidad de la actividad e instructores pueden cambiar con el tiempo.',

      tip_insuranceCheck: 'Verifica Cobertura de Seguro de Actividades',
      tip_insuranceCheck_desc: 'Verifica si tu seguro de viaje cubre actividades de aventura. Algunos requieren cobertura adicional para deportes de alto riesgo.',

      // FAQ
      faq_cancellation_q: '¿Cuál es la política de cancelación para actividades?',
      faq_cancellation_a: 'La mayoría de las actividades ofrecen cancelación gratuita 24-48 horas antes de la hora de inicio. Las actividades dependientes del clima generalmente ofrecen reembolso completo si se cancelan debido a condiciones inseguras. Siempre verifica los términos de cancelación específicos de la actividad.',

      faq_fitness_q: '¿Necesito estar en forma para actividades de aventura?',
      faq_fitness_a: 'Depende de la actividad. La mayoría de los proveedores declaran claramente los requisitos de condición física. Senderismo y escalada necesitan condición moderada, mientras que actividades como clases de cocina o tratamientos de spa no tienen requisitos. Contacta al proveedor si no estás seguro.',

      faq_whatToBring_q: '¿Qué debo llevar a una actividad?',
      faq_whatToBring_a: 'Verifica la descripción de la actividad para requisitos específicos. Artículos comunes: ropa cómoda, protector solar, botella de agua, zapatos cerrados para experiencias activas. La mayoría de los proveedores suministran equipo especializado.',

      faq_ageRestrictions_q: '¿Hay restricciones de edad para actividades?',
      faq_ageRestrictions_a: 'Sí, muchas actividades tienen requisitos mínimos de edad. Los deportes de aventura generalmente requieren que los participantes tengan 12-18+. Las actividades familiares aceptan todas las edades. Verifica "Requisitos de Edad" en la descripción de la actividad.',

      faq_groupBooking_q: '¿Puedo reservar actividades para grupos grandes?',
      faq_groupBooking_a: '¡Absolutamente! Muchos proveedores ofrecen descuentos para grupos de 4+ personas. Para grupos de 10+, contacta directamente con el proveedor para arreglos personalizados y mejores precios. Reserva con mucha anticipación para grupos grandes.',

      faq_meetingPoint_q: '¿Cómo encuentro el punto de encuentro?',
      faq_meetingPoint_a: 'Tu correo de confirmación incluirá detalles del punto de encuentro (dirección, coordenadas GPS, puntos de referencia) y qué buscar (guía con cartel, ropa específica). Llega 10-15 minutos antes. La mayoría de los proveedores ofrecen un número de contacto.',

      // Common UI text
      activitiesAvailable: 'actividades disponibles',
      topExperiences: 'Principales Experiencias:',
      activitiesFrom: 'Actividades desde',
      exploreActivities: 'Explorar Actividades',
      priceRange: 'Rango de Precio',
      examples: 'Ejemplos:',
      stillQuestions: '¿Aún tienes preguntas?',
      contactSupport: 'Contacta con Nuestro Equipo de Soporte',
      viewActivities: 'Ver Actividades',
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
      ...activitiesPageTranslations[lang],
    };

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2) + '\n', 'utf8');

    console.log(`✅ Added ActivitiesPage translations to ${lang}.json`);
  } catch (error) {
    console.error(`❌ Error updating ${lang}.json:`, error.message);
  }
});

console.log('\n✨ ActivitiesPage translations added to all language files!');
