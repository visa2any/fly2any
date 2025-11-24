const fs = require('fs');
const path = require('path');

// Define all ToursPage translations
const toursPageTranslations = {
  en: {
    ToursPage: {
      // Hero Section
      sectionTitle: 'Discover Amazing Tours & Unforgettable Experiences',
      subtitle: 'Explore the world with expert local guides and authentic adventures',

      // Section Headers
      tourTypes: 'Tour Types & Categories',
      popularDestinations: 'Popular Tour Destinations',
      tourDurations: 'Tour Duration Options',
      whatsIncluded: "What's Included in Tours",
      topOperators: 'Top Tour Operators',
      bookingTips: 'Expert Booking Tips',
      faq: 'Tours FAQ',

      // Section Subtitles
      tourTypesSubtitle: 'Choose from diverse tour experiences tailored to your interests',
      destinationsTitle: 'Explore Top Tour Destinations',
      destinationsSubtitle: "Discover tours in the world's most exciting destinations",
      durationsSubtitle: 'Choose the perfect tour duration for your schedule',
      includedSubtitle: 'Know what to expect before you book',
      operatorsSubtitle: 'Book with confidence from trusted tour providers',
      tipsSubtitle: 'Save money and enhance your experience with insider knowledge',
      faqSubtitle: 'Everything you need to know about booking tours with Fly2Any',

      // Tour Types Data
      tourTypes_cityTours: 'City Tours',
      tourTypes_cityTours_desc: 'Explore urban landmarks, culture, and history with local guides',
      tourTypes_cityTours_duration: '2-8 hours',
      tourTypes_cityTours_feature1: 'Walking Tours',
      tourTypes_cityTours_feature2: 'Bus Tours',
      tourTypes_cityTours_feature3: 'Bike Tours',
      tourTypes_cityTours_feature4: 'Private Options',
      tourTypes_cityTours_examples: 'NYC Walking Tour, Paris City Highlights, Tokyo Street Food',
      tourTypes_cityTours_bestFor: 'First-time visitors, culture enthusiasts',

      tourTypes_adventure: 'Adventure Tours',
      tourTypes_adventure_desc: 'Thrilling outdoor activities and adrenaline-pumping experiences',
      tourTypes_adventure_duration: '4 hours - 3 days',
      tourTypes_adventure_feature1: 'Hiking',
      tourTypes_adventure_feature2: 'Zip-lining',
      tourTypes_adventure_feature3: 'Rafting',
      tourTypes_adventure_feature4: 'Rock Climbing',
      tourTypes_adventure_examples: 'Grand Canyon Hiking, Costa Rica Zip-line, Patagonia Trekking',
      tourTypes_adventure_bestFor: 'Adventure seekers, outdoor enthusiasts',

      tourTypes_foodWine: 'Food & Wine Tours',
      tourTypes_foodWine_desc: 'Taste local cuisine, wine, and culinary traditions',
      tourTypes_foodWine_duration: '3-6 hours',
      tourTypes_foodWine_feature1: 'Food Tastings',
      tourTypes_foodWine_feature2: 'Winery Visits',
      tourTypes_foodWine_feature3: 'Cooking Classes',
      tourTypes_foodWine_feature4: 'Market Tours',
      tourTypes_foodWine_examples: 'Tuscany Wine Tour, Tokyo Food Walk, Barcelona Tapas Experience',
      tourTypes_foodWine_bestFor: 'Foodies, wine lovers, culinary explorers',

      tourTypes_cultural: 'Cultural Tours',
      tourTypes_cultural_desc: 'Immerse in local traditions, art, and heritage sites',
      tourTypes_cultural_duration: '3-8 hours',
      tourTypes_cultural_feature1: 'Museums',
      tourTypes_cultural_feature2: 'Historical Sites',
      tourTypes_cultural_feature3: 'Art Galleries',
      tourTypes_cultural_feature4: 'Local Crafts',
      tourTypes_cultural_examples: 'Rome Ancient Tour, Kyoto Temples, Marrakech Medina Walk',
      tourTypes_cultural_bestFor: 'History buffs, culture enthusiasts',

      tourTypes_natureWildlife: 'Nature & Wildlife',
      tourTypes_natureWildlife_desc: 'Discover natural wonders and observe wildlife in their habitat',
      tourTypes_natureWildlife_duration: '4 hours - 5 days',
      tourTypes_natureWildlife_feature1: 'Safari',
      tourTypes_natureWildlife_feature2: 'Bird Watching',
      tourTypes_natureWildlife_feature3: 'Whale Watching',
      tourTypes_natureWildlife_feature4: 'Eco Tours',
      tourTypes_natureWildlife_examples: 'African Safari, Amazon Jungle Tour, Galapagos Wildlife',
      tourTypes_natureWildlife_bestFor: 'Nature lovers, photographers, families',

      tourTypes_multiDay: 'Multi-Day Tours',
      tourTypes_multiDay_desc: 'Extended journeys combining multiple destinations and activities',
      tourTypes_multiDay_duration: '2-14 days',
      tourTypes_multiDay_feature1: 'Accommodations',
      tourTypes_multiDay_feature2: 'Meals Included',
      tourTypes_multiDay_feature3: 'Transportation',
      tourTypes_multiDay_feature4: 'Multiple Sites',
      tourTypes_multiDay_examples: 'Iceland Ring Road, Peru Machu Picchu Trek, European Grand Tour',
      tourTypes_multiDay_bestFor: 'Deep explorers, vacation planners',

      // Destinations
      dest_paris: 'Paris, France',
      dest_paris_tours: '2,500+ tours',
      dest_paris_exp1: 'Eiffel Tower Skip-the-Line',
      dest_paris_exp2: 'Louvre Museum Tour',
      dest_paris_exp3: 'Versailles Day Trip',
      dest_paris_exp4: 'Seine River Cruise',
      dest_paris_priceFrom: '$35',

      dest_tokyo: 'Tokyo, Japan',
      dest_tokyo_tours: '1,800+ tours',
      dest_tokyo_exp1: 'Mt. Fuji Day Trip',
      dest_tokyo_exp2: 'Tsukiji Fish Market',
      dest_tokyo_exp3: 'Shibuya Food Tour',
      dest_tokyo_exp4: 'Samurai Experience',
      dest_tokyo_priceFrom: '$45',

      dest_rome: 'Rome, Italy',
      dest_rome_tours: '2,200+ tours',
      dest_rome_exp1: 'Colosseum Skip-the-Line',
      dest_rome_exp2: 'Vatican Museums Tour',
      dest_rome_exp3: 'Pasta Cooking Class',
      dest_rome_exp4: 'Pompeii Day Trip',
      dest_rome_priceFrom: '$40',

      dest_nyc: 'New York City, USA',
      dest_nyc_tours: '3,000+ tours',
      dest_nyc_exp1: 'Statue of Liberty Tour',
      dest_nyc_exp2: 'Broadway Behind-the-Scenes',
      dest_nyc_exp3: 'Food Tour Brooklyn',
      dest_nyc_exp4: 'Central Park Bike Tour',
      dest_nyc_priceFrom: '$30',

      dest_barcelona: 'Barcelona, Spain',
      dest_barcelona_tours: '1,500+ tours',
      dest_barcelona_exp1: 'Sagrada Familia Tour',
      dest_barcelona_exp2: 'Tapas Walking Tour',
      dest_barcelona_exp3: 'Park Güell Visit',
      dest_barcelona_exp4: 'Montserrat Day Trip',
      dest_barcelona_priceFrom: '$38',

      dest_dubai: 'Dubai, UAE',
      dest_dubai_tours: '1,200+ tours',
      dest_dubai_exp1: 'Desert Safari',
      dest_dubai_exp2: 'Burj Khalifa Tour',
      dest_dubai_exp3: 'Dubai Marina Cruise',
      dest_dubai_exp4: 'Abu Dhabi Day Trip',
      dest_dubai_priceFrom: '$50',

      // Duration Options
      duration_halfDay: 'Half-Day Tours',
      duration_halfDay_time: '2-4 hours',
      duration_halfDay_desc: 'Perfect for quick explorations and fitting multiple activities in one day',
      duration_halfDay_examples: 'Morning city walk, afternoon food tour, sunset boat cruise',
      duration_halfDay_priceRange: '$30-$80',
      duration_halfDay_bestFor: 'Tight schedules, sampler experiences',

      duration_fullDay: 'Full-Day Tours',
      duration_fullDay_time: '6-10 hours',
      duration_fullDay_desc: 'Comprehensive experiences with meals and multiple stops included',
      duration_fullDay_examples: 'Day trip to nearby city, full museum tour with lunch, wine region visit',
      duration_fullDay_priceRange: '$80-$200',
      duration_fullDay_bestFor: 'Deep dives, immersive experiences',

      duration_multiDay: 'Multi-Day Tours',
      duration_multiDay_time: '2-14 days',
      duration_multiDay_desc: 'Extended journeys with accommodations, meals, and transportation',
      duration_multiDay_examples: 'Week-long safari, European tour package, trekking expedition',
      duration_multiDay_priceRange: '$200-$500/day',
      duration_multiDay_bestFor: 'Complete vacations, bucket list trips',

      // What's Included
      included_guide: 'Expert Guide',
      included_guide_desc: 'Professional, knowledgeable guides fluent in multiple languages',
      included_guide_status: 'Always Included',

      included_transport: 'Transportation',
      included_transport_desc: 'Comfortable vehicles, public transit tickets, or bike rentals',
      included_transport_status: 'Usually Included',

      included_entrance: 'Entrance Fees',
      included_entrance_desc: 'Skip-the-line access to museums, monuments, and attractions',
      included_entrance_status: 'Often Included',

      included_meals: 'Meals & Drinks',
      included_meals_desc: 'Lunch, snacks, water, or food tastings depending on tour type',
      included_meals_status: 'Varies by Tour',

      // Top Operators
      operator_viator: 'Viator',
      operator_viator_tours: '300,000+ tours',
      operator_viator_destinations: '2,700+ destinations',
      operator_viator_specialty: 'Largest selection worldwide',
      operator_viator_cancellation: 'Free up to 24 hours',

      operator_getyourguide: 'GetYourGuide',
      operator_getyourguide_tours: '200,000+ tours',
      operator_getyourguide_destinations: '11,000+ destinations',
      operator_getyourguide_specialty: 'Mobile tickets & instant booking',
      operator_getyourguide_cancellation: 'Flexible cancellation',

      operator_intrepid: 'Intrepid Travel',
      operator_intrepid_tours: '1,000+ tours',
      operator_intrepid_destinations: '120+ countries',
      operator_intrepid_specialty: 'Small group adventures',
      operator_intrepid_cancellation: 'Varies by tour',

      operator_gadventures: 'G Adventures',
      operator_gadventures_tours: '750+ tours',
      operator_gadventures_destinations: '100+ countries',
      operator_gadventures_specialty: 'Sustainable travel',
      operator_gadventures_cancellation: 'Flexible policies',

      operator_context: 'Context Travel',
      operator_context_tours: '500+ tours',
      operator_context_destinations: '60+ cities',
      operator_context_specialty: 'Expert-led walking tours',
      operator_context_cancellation: 'Free up to 72 hours',

      operator_airbnb: 'Airbnb Experiences',
      operator_airbnb_tours: '40,000+ experiences',
      operator_airbnb_destinations: 'Worldwide',
      operator_airbnb_specialty: 'Local hosts & unique activities',
      operator_airbnb_cancellation: 'Free up to 24 hours',

      // Booking Tips
      tip_bookEarly: 'Book Early for Popular Tours',
      tip_bookEarly_desc: 'Famous attractions like Vatican Museums or Machu Picchu fill up weeks in advance. Book 2-4 weeks ahead.',

      tip_cancellation: 'Check Cancellation Policies',
      tip_cancellation_desc: 'Look for tours with free cancellation up to 24-48 hours before. Weather or schedule changes happen.',

      tip_reviews: 'Read Recent Reviews',
      tip_reviews_desc: 'Focus on reviews from the last 3-6 months. Tour quality, guides, and routes can change over time.',

      tip_smallGroup: 'Consider Small Group Tours',
      tip_smallGroup_desc: 'Groups of 8-15 people offer better interaction with guides and more personalized experiences.',

      tip_checkIncluded: "Check What's Included",
      tip_checkIncluded_desc: 'Verify if entrance fees, meals, transportation, and gratuities are included to avoid surprises.',

      tip_skipLine: 'Book Skip-the-Line Tickets',
      tip_skipLine_desc: 'Save hours at popular attractions. Skip-the-line access is worth the extra $10-20 in most cases.',

      // FAQ
      faq_cancellation_q: 'What is the cancellation policy for tours?',
      faq_cancellation_a: "Most tours offer free cancellation if you cancel 24-48 hours before the start time. Some popular tours may have stricter policies (72 hours). Always check the specific tour's cancellation terms before booking. Refunds are typically processed within 5-7 business days.",

      faq_tipping_q: 'Are tour guides tipped? How much should I tip?',
      faq_tipping_a: 'Tipping is customary in most countries and not included in the tour price. Standard tips are 10-20% of the tour cost or $5-10 per person for half-day tours, $10-20 for full-day tours. For exceptional service, you can tip more. Some operators include a tip suggestion in their confirmation email.',

      faq_weather_q: 'What happens if the weather is bad?',
      faq_weather_a: 'Most outdoor tours operate rain or shine, though extreme weather (storms, heavy snow) may lead to cancellations. Tour operators will notify you in advance and offer a full refund or alternative date. Indoor tours are rarely affected. Check the weather forecast and dress appropriately.',

      faq_mobility_q: 'Can I join a tour if I have mobility issues?',
      faq_mobility_a: 'Many tours offer wheelchair accessibility or modified routes for guests with mobility limitations. Check the tour description for "wheelchair accessible" or "mobility friendly" labels. Contact the operator directly to discuss your specific needs before booking.',

      faq_meals_q: 'Are meals included in tour prices?',
      faq_meals_a: 'It depends on the tour type. Food tours include tastings and meals. Full-day tours often include lunch. Half-day tours typically don\'t include meals. Always check "What\'s Included" section in the tour description. Bring snacks and water if unsure.',

      faq_meetingPoint_q: 'How do I find my tour guide on the day of the tour?',
      faq_meetingPoint_a: 'Your confirmation email will have meeting point details (address, landmark) and guide identification (holding a sign, wearing specific clothing). Arrive 10-15 minutes early. Many tours provide a phone number to call if you can\'t find the guide. Use Google Maps to navigate to the meeting point.',

      // Common UI text
      toursAvailable: 'available',
      topExperiences: 'Top Experiences:',
      toursFrom: 'Tours from',
      exploreTours: 'Explore Tours',
      priceRange: 'Price Range',
      examples: 'Examples:',
      stillQuestions: 'Still have questions?',
      contactSupport: 'Contact Our Support Team',
      viewTours: 'View Tours',
    },
  },
  pt: {
    ToursPage: {
      // Hero Section
      sectionTitle: 'Descubra Tours Incríveis e Experiências Inesquecíveis',
      subtitle: 'Explore o mundo com guias locais especializados e aventuras autênticas',

      // Section Headers
      tourTypes: 'Tipos e Categorias de Tours',
      popularDestinations: 'Destinos de Tours Populares',
      tourDurations: 'Opções de Duração de Tours',
      whatsIncluded: 'O Que Está Incluído nos Tours',
      topOperators: 'Principais Operadoras de Tours',
      bookingTips: 'Dicas de Reserva',
      faq: 'Perguntas Frequentes sobre Tours',

      // Section Subtitles
      tourTypesSubtitle: 'Escolha entre diversas experiências de tours adaptadas aos seus interesses',
      destinationsTitle: 'Explore os Principais Destinos de Tours',
      destinationsSubtitle: 'Descubra tours nos destinos mais emocionantes do mundo',
      durationsSubtitle: 'Escolha a duração perfeita do tour para sua agenda',
      includedSubtitle: 'Saiba o que esperar antes de reservar',
      operatorsSubtitle: 'Reserve com confiança de provedores de tours confiáveis',
      tipsSubtitle: 'Economize dinheiro e melhore sua experiência com conhecimento interno',
      faqSubtitle: 'Tudo o que você precisa saber sobre reservar tours com Fly2Any',

      // Tour Types Data
      tourTypes_cityTours: 'Tours pela Cidade',
      tourTypes_cityTours_desc: 'Explore marcos urbanos, cultura e história com guias locais',
      tourTypes_cityTours_duration: '2-8 horas',
      tourTypes_cityTours_feature1: 'Tours a Pé',
      tourTypes_cityTours_feature2: 'Tours de Ônibus',
      tourTypes_cityTours_feature3: 'Tours de Bicicleta',
      tourTypes_cityTours_feature4: 'Opções Privadas',
      tourTypes_cityTours_examples: 'Tour a Pé em NYC, Destaques de Paris, Comida de Rua em Tóquio',
      tourTypes_cityTours_bestFor: 'Visitantes de primeira viagem, entusiastas da cultura',

      tourTypes_adventure: 'Tours de Aventura',
      tourTypes_adventure_desc: 'Atividades ao ar livre emocionantes e experiências cheias de adrenalina',
      tourTypes_adventure_duration: '4 horas - 3 dias',
      tourTypes_adventure_feature1: 'Caminhadas',
      tourTypes_adventure_feature2: 'Tirolesa',
      tourTypes_adventure_feature3: 'Rafting',
      tourTypes_adventure_feature4: 'Escalada',
      tourTypes_adventure_examples: 'Trilha no Grand Canyon, Tirolesa na Costa Rica, Trekking na Patagônia',
      tourTypes_adventure_bestFor: 'Aventureiros, entusiastas do ar livre',

      tourTypes_foodWine: 'Tours Gastronômicos',
      tourTypes_foodWine_desc: 'Prove culinária local, vinhos e tradições culinárias',
      tourTypes_foodWine_duration: '3-6 horas',
      tourTypes_foodWine_feature1: 'Degustações',
      tourTypes_foodWine_feature2: 'Visitas a Vinícolas',
      tourTypes_foodWine_feature3: 'Aulas de Culinária',
      tourTypes_foodWine_feature4: 'Tours em Mercados',
      tourTypes_foodWine_examples: 'Tour de Vinho na Toscana, Caminhada Gastronômica em Tóquio, Tapas em Barcelona',
      tourTypes_foodWine_bestFor: 'Amantes da gastronomia, apreciadores de vinho',

      tourTypes_cultural: 'Tours Culturais',
      tourTypes_cultural_desc: 'Mergulhe em tradições locais, arte e sítios históricos',
      tourTypes_cultural_duration: '3-8 horas',
      tourTypes_cultural_feature1: 'Museus',
      tourTypes_cultural_feature2: 'Sítios Históricos',
      tourTypes_cultural_feature3: 'Galerias de Arte',
      tourTypes_cultural_feature4: 'Artesanato Local',
      tourTypes_cultural_examples: 'Tour Antiga Roma, Templos de Kyoto, Caminhada na Medina de Marrakech',
      tourTypes_cultural_bestFor: 'Aficionados por história, entusiastas da cultura',

      tourTypes_natureWildlife: 'Natureza e Vida Selvagem',
      tourTypes_natureWildlife_desc: 'Descubra maravilhas naturais e observe animais em seu habitat',
      tourTypes_natureWildlife_duration: '4 horas - 5 dias',
      tourTypes_natureWildlife_feature1: 'Safari',
      tourTypes_natureWildlife_feature2: 'Observação de Aves',
      tourTypes_natureWildlife_feature3: 'Observação de Baleias',
      tourTypes_natureWildlife_feature4: 'Eco Tours',
      tourTypes_natureWildlife_examples: 'Safari Africano, Tour na Amazônia, Vida Selvagem em Galápagos',
      tourTypes_natureWildlife_bestFor: 'Amantes da natureza, fotógrafos, famílias',

      tourTypes_multiDay: 'Tours de Vários Dias',
      tourTypes_multiDay_desc: 'Jornadas prolongadas combinando múltiplos destinos e atividades',
      tourTypes_multiDay_duration: '2-14 dias',
      tourTypes_multiDay_feature1: 'Acomodações',
      tourTypes_multiDay_feature2: 'Refeições Incluídas',
      tourTypes_multiDay_feature3: 'Transporte',
      tourTypes_multiDay_feature4: 'Múltiplos Locais',
      tourTypes_multiDay_examples: 'Estrada em Anel da Islândia, Trilha Machu Picchu no Peru, Grand Tour Europeu',
      tourTypes_multiDay_bestFor: 'Exploradores profundos, planejadores de férias',

      // Destinations
      dest_paris: 'Paris, França',
      dest_paris_tours: '+2.500 tours',
      dest_paris_exp1: 'Torre Eiffel Fura-fila',
      dest_paris_exp2: 'Tour no Museu do Louvre',
      dest_paris_exp3: 'Viagem de um Dia a Versalhes',
      dest_paris_exp4: 'Cruzeiro no Rio Sena',
      dest_paris_priceFrom: '$35',

      dest_tokyo: 'Tóquio, Japão',
      dest_tokyo_tours: '+1.800 tours',
      dest_tokyo_exp1: 'Viagem de um Dia ao Monte Fuji',
      dest_tokyo_exp2: 'Mercado de Peixe Tsukiji',
      dest_tokyo_exp3: 'Tour Gastronômico em Shibuya',
      dest_tokyo_exp4: 'Experiência Samurai',
      dest_tokyo_priceFrom: '$45',

      dest_rome: 'Roma, Itália',
      dest_rome_tours: '+2.200 tours',
      dest_rome_exp1: 'Coliseu Fura-fila',
      dest_rome_exp2: 'Tour nos Museus do Vaticano',
      dest_rome_exp3: 'Aula de Culinária de Massas',
      dest_rome_exp4: 'Viagem de um Dia a Pompeia',
      dest_rome_priceFrom: '$40',

      dest_nyc: 'Nova York, EUA',
      dest_nyc_tours: '+3.000 tours',
      dest_nyc_exp1: 'Tour na Estátua da Liberdade',
      dest_nyc_exp2: 'Bastidores da Broadway',
      dest_nyc_exp3: 'Tour Gastronômico no Brooklyn',
      dest_nyc_exp4: 'Tour de Bicicleta no Central Park',
      dest_nyc_priceFrom: '$30',

      dest_barcelona: 'Barcelona, Espanha',
      dest_barcelona_tours: '+1.500 tours',
      dest_barcelona_exp1: 'Tour na Sagrada Família',
      dest_barcelona_exp2: 'Tour de Tapas a Pé',
      dest_barcelona_exp3: 'Visita ao Parque Güell',
      dest_barcelona_exp4: 'Viagem de um Dia a Montserrat',
      dest_barcelona_priceFrom: '$38',

      dest_dubai: 'Dubai, EAU',
      dest_dubai_tours: '+1.200 tours',
      dest_dubai_exp1: 'Safari no Deserto',
      dest_dubai_exp2: 'Tour no Burj Khalifa',
      dest_dubai_exp3: 'Cruzeiro na Marina de Dubai',
      dest_dubai_exp4: 'Viagem de um Dia a Abu Dhabi',
      dest_dubai_priceFrom: '$50',

      // Duration Options
      duration_halfDay: 'Tours de Meio Dia',
      duration_halfDay_time: '2-4 horas',
      duration_halfDay_desc: 'Perfeito para explorações rápidas e encaixar múltiplas atividades em um dia',
      duration_halfDay_examples: 'Caminhada matinal pela cidade, tour gastronômico à tarde, cruzeiro ao pôr do sol',
      duration_halfDay_priceRange: '$30-$80',
      duration_halfDay_bestFor: 'Agendas apertadas, experiências de amostra',

      duration_fullDay: 'Tours de Dia Inteiro',
      duration_fullDay_time: '6-10 horas',
      duration_fullDay_desc: 'Experiências abrangentes com refeições e múltiplas paradas incluídas',
      duration_fullDay_examples: 'Viagem de um dia para cidade próxima, tour completo de museu com almoço, visita à região vinícola',
      duration_fullDay_priceRange: '$80-$200',
      duration_fullDay_bestFor: 'Mergulhos profundos, experiências imersivas',

      duration_multiDay: 'Tours de Vários Dias',
      duration_multiDay_time: '2-14 dias',
      duration_multiDay_desc: 'Jornadas prolongadas com acomodações, refeições e transporte',
      duration_multiDay_examples: 'Safari de uma semana, pacote de tour europeu, expedição de trekking',
      duration_multiDay_priceRange: '$200-$500/dia',
      duration_multiDay_bestFor: 'Férias completas, viagens de lista de desejos',

      // What's Included
      included_guide: 'Guia Especializado',
      included_guide_desc: 'Guias profissionais e conhecedores fluentes em vários idiomas',
      included_guide_status: 'Sempre Incluído',

      included_transport: 'Transporte',
      included_transport_desc: 'Veículos confortáveis, bilhetes de transporte público ou aluguel de bicicletas',
      included_transport_status: 'Geralmente Incluído',

      included_entrance: 'Taxas de Entrada',
      included_entrance_desc: 'Acesso fura-fila a museus, monumentos e atrações',
      included_entrance_status: 'Frequentemente Incluído',

      included_meals: 'Refeições e Bebidas',
      included_meals_desc: 'Almoço, lanches, água ou degustações dependendo do tipo de tour',
      included_meals_status: 'Varia por Tour',

      // Top Operators
      operator_viator: 'Viator',
      operator_viator_tours: '+300.000 tours',
      operator_viator_destinations: '+2.700 destinos',
      operator_viator_specialty: 'Maior seleção mundial',
      operator_viator_cancellation: 'Grátis até 24 horas',

      operator_getyourguide: 'GetYourGuide',
      operator_getyourguide_tours: '+200.000 tours',
      operator_getyourguide_destinations: '+11.000 destinos',
      operator_getyourguide_specialty: 'Bilhetes móveis e reserva instantânea',
      operator_getyourguide_cancellation: 'Cancelamento flexível',

      operator_intrepid: 'Intrepid Travel',
      operator_intrepid_tours: '+1.000 tours',
      operator_intrepid_destinations: '+120 países',
      operator_intrepid_specialty: 'Aventuras em pequenos grupos',
      operator_intrepid_cancellation: 'Varia por tour',

      operator_gadventures: 'G Adventures',
      operator_gadventures_tours: '+750 tours',
      operator_gadventures_destinations: '+100 países',
      operator_gadventures_specialty: 'Viagem sustentável',
      operator_gadventures_cancellation: 'Políticas flexíveis',

      operator_context: 'Context Travel',
      operator_context_tours: '+500 tours',
      operator_context_destinations: '+60 cidades',
      operator_context_specialty: 'Tours a pé liderados por especialistas',
      operator_context_cancellation: 'Grátis até 72 horas',

      operator_airbnb: 'Airbnb Experiences',
      operator_airbnb_tours: '+40.000 experiências',
      operator_airbnb_destinations: 'Mundial',
      operator_airbnb_specialty: 'Anfitriões locais e atividades únicas',
      operator_airbnb_cancellation: 'Grátis até 24 horas',

      // Booking Tips
      tip_bookEarly: 'Reserve Cedo para Tours Populares',
      tip_bookEarly_desc: 'Atrações famosas como Museus do Vaticano ou Machu Picchu lotam semanas antes. Reserve com 2-4 semanas de antecedência.',

      tip_cancellation: 'Verifique as Políticas de Cancelamento',
      tip_cancellation_desc: 'Procure tours com cancelamento gratuito até 24-48 horas antes. Mudanças de clima ou agenda acontecem.',

      tip_reviews: 'Leia Avaliações Recentes',
      tip_reviews_desc: 'Concentre-se em avaliações dos últimos 3-6 meses. Qualidade do tour, guias e rotas podem mudar com o tempo.',

      tip_smallGroup: 'Considere Tours em Pequenos Grupos',
      tip_smallGroup_desc: 'Grupos de 8-15 pessoas oferecem melhor interação com guias e experiências mais personalizadas.',

      tip_checkIncluded: 'Verifique o Que Está Incluído',
      tip_checkIncluded_desc: 'Verifique se taxas de entrada, refeições, transporte e gorjetas estão incluídos para evitar surpresas.',

      tip_skipLine: 'Reserve Bilhetes Fura-fila',
      tip_skipLine_desc: 'Economize horas em atrações populares. Acesso fura-fila vale os $10-20 extras na maioria dos casos.',

      // FAQ
      faq_cancellation_q: 'Qual é a política de cancelamento para tours?',
      faq_cancellation_a: 'A maioria dos tours oferece cancelamento gratuito se você cancelar 24-48 horas antes do horário de início. Alguns tours populares podem ter políticas mais rígidas (72 horas). Sempre verifique os termos de cancelamento específicos do tour antes de reservar. Os reembolsos geralmente são processados ​​em 5-7 dias úteis.',

      faq_tipping_q: 'Os guias de tour recebem gorjetas? Quanto devo dar de gorjeta?',
      faq_tipping_a: 'Dar gorjeta é costumeiro na maioria dos países e não está incluído no preço do tour. As gorjetas padrão são 10-20% do custo do tour ou $5-10 por pessoa para tours de meio dia, $10-20 para tours de dia inteiro. Para serviço excepcional, você pode dar mais gorjeta. Algumas operadoras incluem uma sugestão de gorjeta em seu e-mail de confirmação.',

      faq_weather_q: 'O que acontece se o tempo estiver ruim?',
      faq_weather_a: 'A maioria dos tours ao ar livre opera faça chuva ou faça sol, embora condições climáticas extremas (tempestades, neve pesada) possam levar a cancelamentos. As operadoras de tours irão notificá-lo com antecedência e oferecer um reembolso total ou data alternativa. Tours indoor raramente são afetados. Verifique a previsão do tempo e vista-se adequadamente.',

      faq_mobility_q: 'Posso participar de um tour se tiver problemas de mobilidade?',
      faq_mobility_a: 'Muitos tours oferecem acessibilidade para cadeiras de rodas ou rotas modificadas para hóspedes com limitações de mobilidade. Verifique a descrição do tour para rótulos "acessível para cadeiras de rodas" ou "amigável para mobilidade". Entre em contato diretamente com a operadora para discutir suas necessidades específicas antes de reservar.',

      faq_meals_q: 'As refeições estão incluídas nos preços dos tours?',
      faq_meals_a: 'Depende do tipo de tour. Tours gastronômicos incluem degustações e refeições. Tours de dia inteiro geralmente incluem almoço. Tours de meio dia normalmente não incluem refeições. Sempre verifique a seção "O Que Está Incluído" na descrição do tour. Traga lanches e água se não tiver certeza.',

      faq_meetingPoint_q: 'Como encontro meu guia turístico no dia do tour?',
      faq_meetingPoint_a: 'Seu e-mail de confirmação terá detalhes do ponto de encontro (endereço, marco) e identificação do guia (segurando uma placa, vestindo roupas específicas). Chegue 10-15 minutos mais cedo. Muitos tours fornecem um número de telefone para ligar se você não conseguir encontrar o guia. Use o Google Maps para navegar até o ponto de encontro.',

      // Common UI text
      toursAvailable: 'disponíveis',
      topExperiences: 'Principais Experiências:',
      toursFrom: 'Tours a partir de',
      exploreTours: 'Explorar Tours',
      priceRange: 'Faixa de Preço',
      examples: 'Exemplos:',
      stillQuestions: 'Ainda tem dúvidas?',
      contactSupport: 'Entre em Contato com Nossa Equipe de Suporte',
      viewTours: 'Ver Tours',
    },
  },
  es: {
    ToursPage: {
      // Hero Section
      sectionTitle: 'Descubre Tours Increíbles y Experiencias Inolvidables',
      subtitle: 'Explora el mundo con guías locales expertos y aventuras auténticas',

      // Section Headers
      tourTypes: 'Tipos y Categorías de Tours',
      popularDestinations: 'Destinos de Tours Populares',
      tourDurations: 'Opciones de Duración de Tours',
      whatsIncluded: 'Qué Está Incluido en los Tours',
      topOperators: 'Principales Operadores de Tours',
      bookingTips: 'Consejos de Reserva',
      faq: 'Preguntas Frecuentes sobre Tours',

      // Section Subtitles
      tourTypesSubtitle: 'Elige entre diversas experiencias de tours adaptadas a tus intereses',
      destinationsTitle: 'Explora los Principales Destinos de Tours',
      destinationsSubtitle: 'Descubre tours en los destinos más emocionantes del mundo',
      durationsSubtitle: 'Elige la duración perfecta del tour para tu horario',
      includedSubtitle: 'Sabe qué esperar antes de reservar',
      operatorsSubtitle: 'Reserva con confianza de proveedores de tours confiables',
      tipsSubtitle: 'Ahorra dinero y mejora tu experiencia con conocimiento interno',
      faqSubtitle: 'Todo lo que necesitas saber sobre reservar tours con Fly2Any',

      // Tour Types Data
      tourTypes_cityTours: 'Tours por la Ciudad',
      tourTypes_cityTours_desc: 'Explora puntos de referencia urbanos, cultura e historia con guías locales',
      tourTypes_cityTours_duration: '2-8 horas',
      tourTypes_cityTours_feature1: 'Tours a Pie',
      tourTypes_cityTours_feature2: 'Tours en Autobús',
      tourTypes_cityTours_feature3: 'Tours en Bicicleta',
      tourTypes_cityTours_feature4: 'Opciones Privadas',
      tourTypes_cityTours_examples: 'Tour a Pie en NYC, Destacados de París, Comida Callejera en Tokio',
      tourTypes_cityTours_bestFor: 'Visitantes primerizos, entusiastas de la cultura',

      tourTypes_adventure: 'Tours de Aventura',
      tourTypes_adventure_desc: 'Actividades al aire libre emocionantes y experiencias llenas de adrenalina',
      tourTypes_adventure_duration: '4 horas - 3 días',
      tourTypes_adventure_feature1: 'Senderismo',
      tourTypes_adventure_feature2: 'Tirolesa',
      tourTypes_adventure_feature3: 'Rafting',
      tourTypes_adventure_feature4: 'Escalada',
      tourTypes_adventure_examples: 'Senderismo en el Gran Cañón, Tirolesa en Costa Rica, Trekking en Patagonia',
      tourTypes_adventure_bestFor: 'Buscadores de aventuras, entusiastas del aire libre',

      tourTypes_foodWine: 'Tours Gastronómicos',
      tourTypes_foodWine_desc: 'Prueba cocina local, vinos y tradiciones culinarias',
      tourTypes_foodWine_duration: '3-6 horas',
      tourTypes_foodWine_feature1: 'Degustaciones',
      tourTypes_foodWine_feature2: 'Visitas a Bodegas',
      tourTypes_foodWine_feature3: 'Clases de Cocina',
      tourTypes_foodWine_feature4: 'Tours de Mercados',
      tourTypes_foodWine_examples: 'Tour de Vino en Toscana, Caminata Gastronómica en Tokio, Tapas en Barcelona',
      tourTypes_foodWine_bestFor: 'Amantes de la comida, amantes del vino',

      tourTypes_cultural: 'Tours Culturales',
      tourTypes_cultural_desc: 'Sumérgete en tradiciones locales, arte y sitios históricos',
      tourTypes_cultural_duration: '3-8 horas',
      tourTypes_cultural_feature1: 'Museos',
      tourTypes_cultural_feature2: 'Sitios Históricos',
      tourTypes_cultural_feature3: 'Galerías de Arte',
      tourTypes_cultural_feature4: 'Artesanías Locales',
      tourTypes_cultural_examples: 'Tour de la Roma Antigua, Templos de Kioto, Caminata por la Medina de Marrakech',
      tourTypes_cultural_bestFor: 'Aficionados a la historia, entusiastas de la cultura',

      tourTypes_natureWildlife: 'Naturaleza y Vida Silvestre',
      tourTypes_natureWildlife_desc: 'Descubre maravillas naturales y observa vida silvestre en su hábitat',
      tourTypes_natureWildlife_duration: '4 horas - 5 días',
      tourTypes_natureWildlife_feature1: 'Safari',
      tourTypes_natureWildlife_feature2: 'Observación de Aves',
      tourTypes_natureWildlife_feature3: 'Observación de Ballenas',
      tourTypes_natureWildlife_feature4: 'Eco Tours',
      tourTypes_natureWildlife_examples: 'Safari Africano, Tour de la Selva Amazónica, Vida Silvestre en Galápagos',
      tourTypes_natureWildlife_bestFor: 'Amantes de la naturaleza, fotógrafos, familias',

      tourTypes_multiDay: 'Tours de Varios Días',
      tourTypes_multiDay_desc: 'Viajes prolongados que combinan múltiples destinos y actividades',
      tourTypes_multiDay_duration: '2-14 días',
      tourTypes_multiDay_feature1: 'Alojamiento',
      tourTypes_multiDay_feature2: 'Comidas Incluidas',
      tourTypes_multiDay_feature3: 'Transporte',
      tourTypes_multiDay_feature4: 'Múltiples Sitios',
      tourTypes_multiDay_examples: 'Carretera de Circunvalación de Islandia, Trekking a Machu Picchu en Perú, Gran Tour Europeo',
      tourTypes_multiDay_bestFor: 'Exploradores profundos, planificadores de vacaciones',

      // Destinations
      dest_paris: 'París, Francia',
      dest_paris_tours: '+2.500 tours',
      dest_paris_exp1: 'Torre Eiffel Sin Colas',
      dest_paris_exp2: 'Tour del Museo del Louvre',
      dest_paris_exp3: 'Viaje de un Día a Versalles',
      dest_paris_exp4: 'Crucero por el Río Sena',
      dest_paris_priceFrom: '$35',

      dest_tokyo: 'Tokio, Japón',
      dest_tokyo_tours: '+1.800 tours',
      dest_tokyo_exp1: 'Viaje de un Día al Monte Fuji',
      dest_tokyo_exp2: 'Mercado de Pescado Tsukiji',
      dest_tokyo_exp3: 'Tour Gastronómico de Shibuya',
      dest_tokyo_exp4: 'Experiencia Samurai',
      dest_tokyo_priceFrom: '$45',

      dest_rome: 'Roma, Italia',
      dest_rome_tours: '+2.200 tours',
      dest_rome_exp1: 'Coliseo Sin Colas',
      dest_rome_exp2: 'Tour de los Museos Vaticanos',
      dest_rome_exp3: 'Clase de Cocina de Pasta',
      dest_rome_exp4: 'Viaje de un Día a Pompeya',
      dest_rome_priceFrom: '$40',

      dest_nyc: 'Nueva York, EE.UU.',
      dest_nyc_tours: '+3.000 tours',
      dest_nyc_exp1: 'Tour de la Estatua de la Libertad',
      dest_nyc_exp2: 'Detrás de Escenas de Broadway',
      dest_nyc_exp3: 'Tour Gastronómico de Brooklyn',
      dest_nyc_exp4: 'Tour en Bicicleta por Central Park',
      dest_nyc_priceFrom: '$30',

      dest_barcelona: 'Barcelona, España',
      dest_barcelona_tours: '+1.500 tours',
      dest_barcelona_exp1: 'Tour de la Sagrada Familia',
      dest_barcelona_exp2: 'Tour de Tapas a Pie',
      dest_barcelona_exp3: 'Visita al Parque Güell',
      dest_barcelona_exp4: 'Viaje de un Día a Montserrat',
      dest_barcelona_priceFrom: '$38',

      dest_dubai: 'Dubái, EAU',
      dest_dubai_tours: '+1.200 tours',
      dest_dubai_exp1: 'Safari en el Desierto',
      dest_dubai_exp2: 'Tour del Burj Khalifa',
      dest_dubai_exp3: 'Crucero por Dubai Marina',
      dest_dubai_exp4: 'Viaje de un Día a Abu Dhabi',
      dest_dubai_priceFrom: '$50',

      // Duration Options
      duration_halfDay: 'Tours de Medio Día',
      duration_halfDay_time: '2-4 horas',
      duration_halfDay_desc: 'Perfecto para exploraciones rápidas y encajar múltiples actividades en un día',
      duration_halfDay_examples: 'Caminata matutina por la ciudad, tour gastronómico por la tarde, crucero al atardecer',
      duration_halfDay_priceRange: '$30-$80',
      duration_halfDay_bestFor: 'Horarios ajustados, experiencias de muestra',

      duration_fullDay: 'Tours de Día Completo',
      duration_fullDay_time: '6-10 horas',
      duration_fullDay_desc: 'Experiencias completas con comidas y múltiples paradas incluidas',
      duration_fullDay_examples: 'Viaje de un día a ciudad cercana, tour completo de museo con almuerzo, visita a región vitivinícola',
      duration_fullDay_priceRange: '$80-$200',
      duration_fullDay_bestFor: 'Inmersiones profundas, experiencias inmersivas',

      duration_multiDay: 'Tours de Varios Días',
      duration_multiDay_time: '2-14 días',
      duration_multiDay_desc: 'Viajes prolongados con alojamiento, comidas y transporte',
      duration_multiDay_examples: 'Safari de una semana, paquete de tour europeo, expedición de trekking',
      duration_multiDay_priceRange: '$200-$500/día',
      duration_multiDay_bestFor: 'Vacaciones completas, viajes de lista de deseos',

      // What's Included
      included_guide: 'Guía Experto',
      included_guide_desc: 'Guías profesionales y conocedores fluidos en varios idiomas',
      included_guide_status: 'Siempre Incluido',

      included_transport: 'Transporte',
      included_transport_desc: 'Vehículos cómodos, boletos de transporte público o alquiler de bicicletas',
      included_transport_status: 'Generalmente Incluido',

      included_entrance: 'Tarifas de Entrada',
      included_entrance_desc: 'Acceso sin colas a museos, monumentos y atracciones',
      included_entrance_status: 'A Menudo Incluido',

      included_meals: 'Comidas y Bebidas',
      included_meals_desc: 'Almuerzo, snacks, agua o degustaciones dependiendo del tipo de tour',
      included_meals_status: 'Varía por Tour',

      // Top Operators
      operator_viator: 'Viator',
      operator_viator_tours: '+300.000 tours',
      operator_viator_destinations: '+2.700 destinos',
      operator_viator_specialty: 'Mayor selección mundial',
      operator_viator_cancellation: 'Gratis hasta 24 horas',

      operator_getyourguide: 'GetYourGuide',
      operator_getyourguide_tours: '+200.000 tours',
      operator_getyourguide_destinations: '+11.000 destinos',
      operator_getyourguide_specialty: 'Boletos móviles y reserva instantánea',
      operator_getyourguide_cancellation: 'Cancelación flexible',

      operator_intrepid: 'Intrepid Travel',
      operator_intrepid_tours: '+1.000 tours',
      operator_intrepid_destinations: '+120 países',
      operator_intrepid_specialty: 'Aventuras en grupos pequeños',
      operator_intrepid_cancellation: 'Varía por tour',

      operator_gadventures: 'G Adventures',
      operator_gadventures_tours: '+750 tours',
      operator_gadventures_destinations: '+100 países',
      operator_gadventures_specialty: 'Viaje sostenible',
      operator_gadventures_cancellation: 'Políticas flexibles',

      operator_context: 'Context Travel',
      operator_context_tours: '+500 tours',
      operator_context_destinations: '+60 ciudades',
      operator_context_specialty: 'Tours a pie liderados por expertos',
      operator_context_cancellation: 'Gratis hasta 72 horas',

      operator_airbnb: 'Airbnb Experiences',
      operator_airbnb_tours: '+40.000 experiencias',
      operator_airbnb_destinations: 'Mundial',
      operator_airbnb_specialty: 'Anfitriones locales y actividades únicas',
      operator_airbnb_cancellation: 'Gratis hasta 24 horas',

      // Booking Tips
      tip_bookEarly: 'Reserva Temprano para Tours Populares',
      tip_bookEarly_desc: 'Atracciones famosas como los Museos Vaticanos o Machu Picchu se llenan semanas antes. Reserva con 2-4 semanas de anticipación.',

      tip_cancellation: 'Verifica las Políticas de Cancelación',
      tip_cancellation_desc: 'Busca tours con cancelación gratuita hasta 24-48 horas antes. Los cambios de clima o horario suceden.',

      tip_reviews: 'Lee Reseñas Recientes',
      tip_reviews_desc: 'Concéntrate en reseñas de los últimos 3-6 meses. La calidad del tour, guías y rutas pueden cambiar con el tiempo.',

      tip_smallGroup: 'Considera Tours en Grupos Pequeños',
      tip_smallGroup_desc: 'Grupos de 8-15 personas ofrecen mejor interacción con guías y experiencias más personalizadas.',

      tip_checkIncluded: 'Verifica Qué Está Incluido',
      tip_checkIncluded_desc: 'Verifica si las tarifas de entrada, comidas, transporte y propinas están incluidas para evitar sorpresas.',

      tip_skipLine: 'Reserva Boletos Sin Colas',
      tip_skipLine_desc: 'Ahorra horas en atracciones populares. El acceso sin colas vale los $10-20 extra en la mayoría de los casos.',

      // FAQ
      faq_cancellation_q: '¿Cuál es la política de cancelación para tours?',
      faq_cancellation_a: 'La mayoría de los tours ofrecen cancelación gratuita si cancelas 24-48 horas antes de la hora de inicio. Algunos tours populares pueden tener políticas más estrictas (72 horas). Siempre verifica los términos de cancelación específicos del tour antes de reservar. Los reembolsos generalmente se procesan en 5-7 días hábiles.',

      faq_tipping_q: '¿Se dan propinas a los guías turísticos? ¿Cuánto debo dar de propina?',
      faq_tipping_a: 'Dar propina es costumbre en la mayoría de los países y no está incluido en el precio del tour. Las propinas estándar son 10-20% del costo del tour o $5-10 por persona para tours de medio día, $10-20 para tours de día completo. Para un servicio excepcional, puedes dar más propina. Algunos operadores incluyen una sugerencia de propina en su correo de confirmación.',

      faq_weather_q: '¿Qué sucede si el clima es malo?',
      faq_weather_a: 'La mayoría de los tours al aire libre operan llueva o truene, aunque el clima extremo (tormentas, nieve pesada) puede llevar a cancelaciones. Los operadores de tours te notificarán con anticipación y ofrecerán un reembolso completo o fecha alternativa. Los tours en interiores rara vez se ven afectados. Verifica el pronóstico del tiempo y vístete apropiadamente.',

      faq_mobility_q: '¿Puedo unirme a un tour si tengo problemas de movilidad?',
      faq_mobility_a: 'Muchos tours ofrecen accesibilidad para sillas de ruedas o rutas modificadas para huéspedes con limitaciones de movilidad. Verifica la descripción del tour para etiquetas "accesible para sillas de ruedas" o "amigable con la movilidad". Contacta directamente con el operador para discutir tus necesidades específicas antes de reservar.',

      faq_meals_q: '¿Las comidas están incluidas en los precios de los tours?',
      faq_meals_a: 'Depende del tipo de tour. Los tours gastronómicos incluyen degustaciones y comidas. Los tours de día completo a menudo incluyen almuerzo. Los tours de medio día típicamente no incluyen comidas. Siempre verifica la sección "Qué Está Incluido" en la descripción del tour. Trae snacks y agua si no estás seguro.',

      faq_meetingPoint_q: '¿Cómo encuentro a mi guía turístico el día del tour?',
      faq_meetingPoint_a: 'Tu correo de confirmación tendrá detalles del punto de encuentro (dirección, punto de referencia) e identificación del guía (sosteniendo un cartel, vistiendo ropa específica). Llega 10-15 minutos antes. Muchos tours proporcionan un número de teléfono para llamar si no puedes encontrar al guía. Usa Google Maps para navegar al punto de encuentro.',

      // Common UI text
      toursAvailable: 'disponibles',
      topExperiences: 'Principales Experiencias:',
      toursFrom: 'Tours desde',
      exploreTours: 'Explorar Tours',
      priceRange: 'Rango de Precio',
      examples: 'Ejemplos:',
      stillQuestions: '¿Aún tienes preguntas?',
      contactSupport: 'Contacta con Nuestro Equipo de Soporte',
      viewTours: 'Ver Tours',
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
      ...toursPageTranslations[lang],
    };

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2) + '\n', 'utf8');

    console.log(`✅ Added ToursPage translations to ${lang}.json`);
  } catch (error) {
    console.error(`❌ Error updating ${lang}.json:`, error.message);
  }
});

console.log('\n✨ ToursPage translations added to all language files!');
