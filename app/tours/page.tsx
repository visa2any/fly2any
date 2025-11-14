'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Map, Mountain, Utensils, Wine, Camera, Landmark,
  Users, Clock, Calendar, Star, TrendingUp, Shield,
  MapPin, ChevronRight, CheckCircle, Award, Zap,
  Globe, Heart, Compass, Bike, Waves, TreePine,
  Building2, Music, ShoppingBag, Sun, Palette, Book
} from 'lucide-react';
import { MobileHomeSearchWrapper } from '@/components/home/MobileHomeSearchWrapper';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import { CompactTrustBar } from '@/components/conversion/CompactTrustBar';

type Language = 'en' | 'pt' | 'es';

const content = {
  en: {
    // Compact Hero Section
    sectionTitle: 'Discover Amazing Tours & Unforgettable Experiences',
    subtitle: 'Explore the world with expert local guides and authentic adventures',

    // Sections
    tourTypes: 'Tour Types & Categories',
    popularDestinations: 'Popular Tour Destinations',
    tourDurations: 'Tour Duration Options',
    whatsIncluded: "What's Included in Tours",
    topOperators: 'Top Tour Operators',
    bookingTips: 'Expert Booking Tips',
    faq: 'Tours FAQ',

    // Tour Types
    tourTypesData: [
      {
        type: 'City Tours',
        description: 'Explore urban landmarks, culture, and history with local guides',
        priceRange: '$30-$80',
        duration: '2-8 hours',
        features: ['Walking Tours', 'Bus Tours', 'Bike Tours', 'Private Options'],
        examples: 'NYC Walking Tour, Paris City Highlights, Tokyo Street Food',
        bestFor: 'First-time visitors, culture enthusiasts',
        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80'
      },
      {
        type: 'Adventure Tours',
        description: 'Thrilling outdoor activities and adrenaline-pumping experiences',
        priceRange: '$80-$250',
        duration: '4 hours - 3 days',
        features: ['Hiking', 'Zip-lining', 'Rafting', 'Rock Climbing'],
        examples: 'Grand Canyon Hiking, Costa Rica Zip-line, Patagonia Trekking',
        bestFor: 'Adventure seekers, outdoor enthusiasts',
        image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80'
      },
      {
        type: 'Food & Wine Tours',
        description: 'Taste local cuisine, wine, and culinary traditions',
        priceRange: '$60-$180',
        duration: '3-6 hours',
        features: ['Food Tastings', 'Winery Visits', 'Cooking Classes', 'Market Tours'],
        examples: 'Tuscany Wine Tour, Tokyo Food Walk, Barcelona Tapas Experience',
        bestFor: 'Foodies, wine lovers, culinary explorers',
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80'
      },
      {
        type: 'Cultural Tours',
        description: 'Immerse in local traditions, art, and heritage sites',
        priceRange: '$40-$120',
        duration: '3-8 hours',
        features: ['Museums', 'Historical Sites', 'Art Galleries', 'Local Crafts'],
        examples: 'Rome Ancient Tour, Kyoto Temples, Marrakech Medina Walk',
        bestFor: 'History buffs, culture enthusiasts',
        image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80'
      },
      {
        type: 'Nature & Wildlife',
        description: 'Discover natural wonders and observe wildlife in their habitat',
        priceRange: '$90-$300',
        duration: '4 hours - 5 days',
        features: ['Safari', 'Bird Watching', 'Whale Watching', 'Eco Tours'],
        examples: 'African Safari, Amazon Jungle Tour, Galapagos Wildlife',
        bestFor: 'Nature lovers, photographers, families',
        image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80'
      },
      {
        type: 'Multi-Day Tours',
        description: 'Extended journeys combining multiple destinations and activities',
        priceRange: '$200-$500/day',
        duration: '2-14 days',
        features: ['Accommodations', 'Meals Included', 'Transportation', 'Multiple Sites'],
        examples: 'Iceland Ring Road, Peru Machu Picchu Trek, European Grand Tour',
        bestFor: 'Deep explorers, vacation planners',
        image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80'
      }
    ],

    // Popular Destinations
    destinationsTitle: 'Explore Top Tour Destinations',
    destinationsData: [
      {
        destination: 'Paris, France',
        tours: '2,500+ tours',
        rating: 4.8,
        topExperiences: ['Eiffel Tower Skip-the-Line', 'Louvre Museum Tour', 'Versailles Day Trip', 'Seine River Cruise'],
        priceFrom: '$35',
        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80'
      },
      {
        destination: 'Tokyo, Japan',
        tours: '1,800+ tours',
        rating: 4.9,
        topExperiences: ['Mt. Fuji Day Trip', 'Tsukiji Fish Market', 'Shibuya Food Tour', 'Samurai Experience'],
        priceFrom: '$45',
        image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80'
      },
      {
        destination: 'Rome, Italy',
        tours: '2,200+ tours',
        rating: 4.7,
        topExperiences: ['Colosseum Skip-the-Line', 'Vatican Museums Tour', 'Pasta Cooking Class', 'Pompeii Day Trip'],
        priceFrom: '$40',
        image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80'
      },
      {
        destination: 'New York City, USA',
        tours: '3,000+ tours',
        rating: 4.6,
        topExperiences: ['Statue of Liberty Tour', 'Broadway Behind-the-Scenes', 'Food Tour Brooklyn', 'Central Park Bike Tour'],
        priceFrom: '$30',
        image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80'
      },
      {
        destination: 'Barcelona, Spain',
        tours: '1,500+ tours',
        rating: 4.8,
        topExperiences: ['Sagrada Familia Tour', 'Tapas Walking Tour', 'Park Güell Visit', 'Montserrat Day Trip'],
        priceFrom: '$38',
        image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80'
      },
      {
        destination: 'Dubai, UAE',
        tours: '1,200+ tours',
        rating: 4.7,
        topExperiences: ['Desert Safari', 'Burj Khalifa Tour', 'Dubai Marina Cruise', 'Abu Dhabi Day Trip'],
        priceFrom: '$50',
        image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80'
      }
    ],

    // Duration Options
    durationsData: [
      {
        duration: 'Half-Day Tours',
        time: '2-4 hours',
        description: 'Perfect for quick explorations and fitting multiple activities in one day',
        examples: 'Morning city walk, afternoon food tour, sunset boat cruise',
        priceRange: '$30-$80',
        bestFor: 'Tight schedules, sampler experiences'
      },
      {
        duration: 'Full-Day Tours',
        time: '6-10 hours',
        description: 'Comprehensive experiences with meals and multiple stops included',
        examples: 'Day trip to nearby city, full museum tour with lunch, wine region visit',
        priceRange: '$80-$200',
        bestFor: 'Deep dives, immersive experiences'
      },
      {
        duration: 'Multi-Day Tours',
        time: '2-14 days',
        description: 'Extended journeys with accommodations, meals, and transportation',
        examples: 'Week-long safari, European tour package, trekking expedition',
        priceRange: '$200-$500/day',
        bestFor: 'Complete vacations, bucket list trips'
      }
    ],

    // What's Included
    includedData: [
      {
        feature: 'Expert Guide',
        description: 'Professional, knowledgeable guides fluent in multiple languages',
        icon: Users,
        included: 'Always Included'
      },
      {
        feature: 'Transportation',
        description: 'Comfortable vehicles, public transit tickets, or bike rentals',
        icon: MapPin,
        included: 'Usually Included'
      },
      {
        feature: 'Entrance Fees',
        description: 'Skip-the-line access to museums, monuments, and attractions',
        icon: CheckCircle,
        included: 'Often Included'
      },
      {
        feature: 'Meals & Drinks',
        description: 'Lunch, snacks, water, or food tastings depending on tour type',
        icon: Utensils,
        included: 'Varies by Tour'
      }
    ],

    // Top Operators
    operatorsData: [
      {
        name: 'Viator',
        rating: 4.7,
        tours: '300,000+ tours',
        destinations: '2,700+ destinations',
        specialty: 'Largest selection worldwide',
        cancellation: 'Free up to 24 hours'
      },
      {
        name: 'GetYourGuide',
        rating: 4.8,
        tours: '200,000+ tours',
        destinations: '11,000+ destinations',
        specialty: 'Mobile tickets & instant booking',
        cancellation: 'Flexible cancellation'
      },
      {
        name: 'Intrepid Travel',
        rating: 4.9,
        tours: '1,000+ tours',
        destinations: '120+ countries',
        specialty: 'Small group adventures',
        cancellation: 'Varies by tour'
      },
      {
        name: 'G Adventures',
        rating: 4.8,
        tours: '750+ tours',
        destinations: '100+ countries',
        specialty: 'Sustainable travel',
        cancellation: 'Flexible policies'
      },
      {
        name: 'Context Travel',
        rating: 4.9,
        tours: '500+ tours',
        destinations: '60+ cities',
        specialty: 'Expert-led walking tours',
        cancellation: 'Free up to 72 hours'
      },
      {
        name: 'Airbnb Experiences',
        rating: 4.7,
        tours: '40,000+ experiences',
        destinations: 'Worldwide',
        specialty: 'Local hosts & unique activities',
        cancellation: 'Free up to 24 hours'
      }
    ],

    // Booking Tips
    tipsData: [
      {
        title: 'Book Early for Popular Tours',
        description: 'Famous attractions like Vatican Museums or Machu Picchu fill up weeks in advance. Book 2-4 weeks ahead.',
        icon: Calendar
      },
      {
        title: 'Check Cancellation Policies',
        description: 'Look for tours with free cancellation up to 24-48 hours before. Weather or schedule changes happen.',
        icon: Shield
      },
      {
        title: 'Read Recent Reviews',
        description: 'Focus on reviews from the last 3-6 months. Tour quality, guides, and routes can change over time.',
        icon: Star
      },
      {
        title: 'Consider Small Group Tours',
        description: 'Groups of 8-15 people offer better interaction with guides and more personalized experiences.',
        icon: Users
      },
      {
        title: 'Check What\'s Included',
        description: 'Verify if entrance fees, meals, transportation, and gratuities are included to avoid surprises.',
        icon: CheckCircle
      },
      {
        title: 'Book Skip-the-Line Tickets',
        description: 'Save hours at popular attractions. Skip-the-line access is worth the extra $10-20 in most cases.',
        icon: Zap
      }
    ],

    // FAQ
    faqData: [
      {
        question: 'What is the cancellation policy for tours?',
        answer: 'Most tours offer free cancellation if you cancel 24-48 hours before the start time. Some popular tours may have stricter policies (72 hours). Always check the specific tour\'s cancellation terms before booking. Refunds are typically processed within 5-7 business days.'
      },
      {
        question: 'Are tour guides tipped? How much should I tip?',
        answer: 'Tipping is customary in most countries and not included in the tour price. Standard tips are 10-20% of the tour cost or $5-10 per person for half-day tours, $10-20 for full-day tours. For exceptional service, you can tip more. Some operators include a tip suggestion in their confirmation email.'
      },
      {
        question: 'What happens if the weather is bad?',
        answer: 'Most outdoor tours operate rain or shine, though extreme weather (storms, heavy snow) may lead to cancellations. Tour operators will notify you in advance and offer a full refund or alternative date. Indoor tours are rarely affected. Check the weather forecast and dress appropriately.'
      },
      {
        question: 'Can I join a tour if I have mobility issues?',
        answer: 'Many tours offer wheelchair accessibility or modified routes for guests with mobility limitations. Check the tour description for "wheelchair accessible" or "mobility friendly" labels. Contact the operator directly to discuss your specific needs before booking.'
      },
      {
        question: 'Are meals included in tour prices?',
        answer: 'It depends on the tour type. Food tours include tastings and meals. Full-day tours often include lunch. Half-day tours typically don\'t include meals. Always check "What\'s Included" section in the tour description. Bring snacks and water if unsure.'
      },
      {
        question: 'How do I find my tour guide on the day of the tour?',
        answer: 'Your confirmation email will have meeting point details (address, landmark) and guide identification (holding a sign, wearing specific clothing). Arrive 10-15 minutes early. Many tours provide a phone number to call if you can\'t find the guide. Use Google Maps to navigate to the meeting point.'
      }
    ]
  },
  pt: {
    sectionTitle: 'Descubra Tours Incríveis e Experiências Inesquecíveis',
    subtitle: 'Explore o mundo com guias locais especializados e aventuras autênticas',

    tourTypes: 'Tipos e Categorias de Tours',
    popularDestinations: 'Destinos de Tours Populares',
    tourDurations: 'Opções de Duração de Tours',
    whatsIncluded: 'O Que Está Incluído nos Tours',
    topOperators: 'Principais Operadoras de Tours',
    bookingTips: 'Dicas de Reserva',
    faq: 'Perguntas Frequentes sobre Tours',

    tourTypesData: [
      {
        type: 'Tours pela Cidade',
        description: 'Explore marcos urbanos, cultura e história com guias locais',
        priceRange: '$30-$80',
        duration: '2-8 horas',
        features: ['Tours a Pé', 'Tours de Ônibus', 'Tours de Bicicleta', 'Opções Privadas'],
        examples: 'Tour a Pé em NYC, Destaques de Paris, Comida de Rua em Tóquio',
        bestFor: 'Visitantes de primeira viagem, entusiastas da cultura'
      },
      {
        type: 'Tours de Aventura',
        description: 'Atividades ao ar livre emocionantes e experiências cheias de adrenalina',
        priceRange: '$80-$250',
        duration: '4 horas - 3 dias',
        features: ['Caminhadas', 'Tirolesa', 'Rafting', 'Escalada'],
        examples: 'Trilha no Grand Canyon, Tirolesa na Costa Rica, Trekking na Patagônia',
        bestFor: 'Aventureiros, entusiastas do ar livre'
      },
      {
        type: 'Tours Gastronômicos',
        description: 'Prove culinária local, vinhos e tradições culinárias',
        priceRange: '$60-$180',
        duration: '3-6 horas',
        features: ['Degustações', 'Visitas a Vinícolas', 'Aulas de Culinária', 'Tours em Mercados'],
        examples: 'Tour de Vinho na Toscana, Caminhada Gastronômica em Tóquio, Tapas em Barcelona',
        bestFor: 'Amantes da gastronomia, apreciadores de vinho'
      },
      {
        type: 'Tours Culturais',
        description: 'Mergulhe em tradições locais, arte e sítios históricos',
        priceRange: '$40-$120',
        duration: '3-8 horas',
        features: ['Museus', 'Sítios Históricos', 'Galerias de Arte', 'Artesanato Local'],
        examples: 'Tour Antiga Roma, Templos de Kyoto, Caminhada na Medina de Marrakech',
        bestFor: 'Aficionados por história, entusiastas da cultura'
      },
      {
        type: 'Natureza e Vida Selvagem',
        description: 'Descubra maravilhas naturais e observe animais em seu habitat',
        priceRange: '$90-$300',
        duration: '4 horas - 5 dias',
        features: ['Safari', 'Observação de Aves', 'Observação de Baleias', 'Eco Tours'],
        examples: 'Safari Africano, Tour na Amazônia, Vida Selvagem em Galápagos',
        bestFor: 'Amantes da natureza, fotógrafos, famílias'
      },
      {
        type: 'Tours de Vários Dias',
        description: 'Jornadas prolongadas combinando múltiplos destinos e atividades',
        priceRange: '$200-$500/dia',
        duration: '2-14 dias',
        features: ['Acomodações', 'Refeições Incluídas', 'Transporte', 'Múltiplos Locais'],
        examples: 'Estrada em Anel da Islândia, Trilha Machu Picchu no Peru, Grand Tour Europeu',
        bestFor: 'Exploradores profundos, planejadores de férias'
      }
    ]
  },
  es: {
    sectionTitle: 'Descubre Tours Increíbles y Experiencias Inolvidables',
    subtitle: 'Explora el mundo con guías locales expertos y aventuras auténticas',

    tourTypes: 'Tipos y Categorías de Tours',
    popularDestinations: 'Destinos de Tours Populares',
    tourDurations: 'Opciones de Duración de Tours',
    whatsIncluded: 'Qué Está Incluido en los Tours',
    topOperators: 'Principales Operadores de Tours',
    bookingTips: 'Consejos de Reserva',
    faq: 'Preguntas Frecuentes sobre Tours'
  }
};

export default function ToursPage() {
  const [lang, setLang] = useState<Language>('en');
  const t = content[lang] as any;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Orange/Amber Adventure Theme */}
      <div className="relative bg-gradient-to-br from-orange-50 via-amber-50/30 to-orange-50 border-b border-orange-200/60 overflow-hidden md:overflow-visible max-h-[100vh] md:max-h-none">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="floating-orb floating-orb-1"></div>
          <div className="floating-orb floating-orb-2"></div>
          <div className="floating-orb floating-orb-3"></div>
        </div>

        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(249, 115, 22) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>

        <MaxWidthContainer className="relative overflow-hidden md:overflow-visible" noPadding={true} style={{ padding: '12px 0 8px' }}>
          <div className="px-4 md:px-6">
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 animate-fadeIn">
              <h1 className="hero-title text-lg sm:text-xl md:text-3xl font-extrabold tracking-wide whitespace-nowrap overflow-x-auto scrollbar-hide">
                {t.sectionTitle}
              </h1>
              <span className="hidden md:inline-block text-orange-400 text-2xl font-bold mx-1">•</span>
              <p className="hero-subtitle text-gray-700/90 mb-0 font-medium text-xs sm:text-sm md:text-lg whitespace-nowrap overflow-x-auto scrollbar-hide" style={{ letterSpacing: '0.01em' }}>
                {t.subtitle}
              </p>
            </div>
          </div>
        </MaxWidthContainer>
      </div>

      <style jsx>{`
        .floating-orb { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.15; animation: float 20s ease-in-out infinite; z-index: 0; }
        .floating-orb-1 { width: 200px; height: 200px; background: linear-gradient(135deg, #f97316, #fb923c); top: -80px; left: 5%; animation-delay: 0s; animation-duration: 25s; }
        .floating-orb-2 { width: 180px; height: 180px; background: linear-gradient(135deg, #fb923c, #fdba74); top: -60px; right: 10%; animation-delay: 5s; animation-duration: 30s; }
        .floating-orb-3 { width: 150px; height: 150px; background: linear-gradient(135deg, #fdba74, #f97316); bottom: -50px; left: 50%; animation-delay: 10s; animation-duration: 28s; }
        @media (min-width: 768px) {
          .floating-orb-1 { width: 300px; height: 300px; top: -150px; left: 10%; }
          .floating-orb-2 { width: 250px; height: 250px; top: -100px; right: 15%; }
          .floating-orb-3 { width: 200px; height: 200px; bottom: -100px; }
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(10px, -8px) scale(1.02); }
          50% { transform: translate(-8px, 5px) scale(0.98); }
          75% { transform: translate(6px, -6px) scale(1.01); }
        }
        .hero-title { color: #c2410c; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(194, 65, 12, 0.15); position: relative; z-index: 10; transform: translateZ(0); -webkit-transform: translateZ(0); -moz-transform: translateZ(0); backface-visibility: hidden; -webkit-backface-visibility: hidden; -moz-backface-visibility: hidden; }
        .hero-subtitle { position: relative; z-index: 10; color: #374151; font-weight: 500; transform: translateZ(0); -webkit-transform: translateZ(0); -moz-transform: translateZ(0); backface-visibility: hidden; -webkit-backface-visibility: hidden; -moz-backface-visibility: hidden; }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
        @keyframes fadeIn { 0% { opacity: 0; transform: translateY(-10px); } 100% { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Top Search Bar */}
      <MobileHomeSearchWrapper lang={lang} defaultService="tours" />

      {/* Trust Bar */}
      <CompactTrustBar />

      {/* Tour Types & Categories Section */}
      <section className="py-6 sm:py-8 md:py-12 bg-white">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="px-4 md:px-0 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Map className="w-7 h-7 text-orange-600" />
              {t.tourTypes}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">Choose from diverse tour experiences tailored to your interests</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-2 md:px-0 gap-2 sm:gap-3 md:gap-6">
            {((t as any).tourTypesData || []).map((tour: any, index: number) => {
              const icons = [Mountain, Utensils, Landmark, TreePine, Camera, Globe];
              const IconComponent = icons[index % icons.length];
              const colors = [
                'from-orange-500 to-amber-600',
                'from-amber-500 to-yellow-600',
                'from-orange-600 to-red-600',
                'from-green-500 to-emerald-600',
                'from-blue-500 to-cyan-600',
                'from-purple-500 to-pink-600'
              ];

              return (
                <div
                  key={index}
                  className="relative rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all border border-gray-200 hover:border-orange-400 group cursor-pointer h-[340px]"
                >
                  {/* Background Image */}
                  <Image
                    src={tour.image}
                    alt={tour.type}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Gradient Overlay - Dark at bottom for text readability, transparent at top to show image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                  {/* Subtle colored tint overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${colors[index]} opacity-20 mix-blend-overlay`} />

                  <div className="relative h-full p-6 flex flex-col justify-between z-10">
                    <div>
                      {/* Icon with PROMINENT bright background - Highly Visible */}
                      <div className="w-16 h-16 rounded-2xl bg-white shadow-2xl flex items-center justify-center mb-4 border-2 border-white/30 ring-2 ring-orange-400/30">
                        <IconComponent className="w-9 h-9 text-orange-600" strokeWidth={2.5} />
                      </div>

                      {/* Title - Pure White, Maximum Impact */}
                      <h3 className="text-2xl font-black text-white mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] leading-tight tracking-tight">
                        {tour.type}
                      </h3>

                      {/* Description - Slightly Dimmed for Hierarchy */}
                      <p className="text-sm text-white/95 mb-3 line-clamp-2 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] font-medium leading-relaxed">
                        {tour.description}
                      </p>

                      {/* Price - BRIGHT YELLOW/GOLD to stand out */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="text-2xl font-black text-yellow-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 0 20px rgba(253,224,71,0.3)' }}>
                          {tour.priceRange}
                        </div>
                        <div className="text-xs font-bold text-white bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/30 shadow-lg">
                          {tour.duration}
                        </div>
                      </div>

                      {/* Examples - Dimmed More for Hierarchy */}
                      <p className="text-xs text-white/80 mb-2 line-clamp-1 drop-shadow-md font-medium">
                        {tour.examples}
                      </p>
                    </div>

                    <div>
                      {/* Feature tags - Subtle but readable */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {tour.features.map((feat: string, i: number) => (
                          <span
                            key={i}
                            className="text-[11px] bg-black/50 backdrop-blur-md text-white/90 px-3 py-1.5 rounded-full font-bold border border-white/30 shadow-md"
                          >
                            {feat}
                          </span>
                        ))}
                      </div>

                      {/* Best for - Most Subtle */}
                      <div className="text-xs text-white/75 drop-shadow-md font-medium bg-black/40 backdrop-blur-sm px-3 py-2 rounded-lg inline-block border border-white/20">
                        <span className="font-semibold">Best for:</span> {tour.bestFor}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </MaxWidthContainer>
      </section>

      {/* Popular Destinations Section */}
      <section className="py-6 sm:py-8 md:py-12 bg-gray-50">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="px-4 md:px-0 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Globe className="w-7 h-7 text-orange-600" />
              {t.popularDestinations}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">Discover tours in the world's most exciting destinations</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-2 md:px-0 gap-2 sm:gap-3 md:gap-6">
            {((t as any).destinationsData || []).map((dest: any, index: number) => (
              <div
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all group cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={dest.image}
                    alt={dest.destination}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-bold text-gray-900">{dest.rating}</span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{dest.destination}</h3>
                  <p className="text-sm text-gray-600 mb-3">{dest.tours} available</p>

                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-semibold text-gray-700">Top Experiences:</p>
                    {dest.topExperiences.slice(0, 3).map((exp: string, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">{exp}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Tours from</p>
                      <p className="text-xl font-bold text-orange-600">{dest.priceFrom}</p>
                    </div>
                    <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-semibold">
                      Explore Tours
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </MaxWidthContainer>
      </section>

      {/* Tour Duration Options */}
      <section className="py-6 sm:py-8 md:py-12 bg-white">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="px-4 md:px-0 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Clock className="w-7 h-7 text-orange-600" />
              {t.tourDurations}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">Choose the perfect tour duration for your schedule</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 px-2 md:px-0 gap-2 sm:gap-3 md:gap-6 max-w-6xl mx-auto">
            {((t as any).durationsData || []).map((duration: any, index: number) => (
              <div
                key={index}
                className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border-2 border-orange-200 hover:border-orange-400 transition-all hover:shadow-lg"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center mb-4">
                  <Clock className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{duration.duration}</h3>
                <p className="text-lg font-semibold text-orange-600 mb-3">{duration.time}</p>
                <p className="text-sm text-gray-600 mb-4">{duration.description}</p>

                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Examples:</p>
                  <p className="text-sm text-gray-600">{duration.examples}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-orange-200">
                  <div>
                    <p className="text-xs text-gray-500">Price Range</p>
                    <p className="text-lg font-bold text-gray-900">{duration.priceRange}</p>
                  </div>
                  <div className="text-xs text-gray-500 text-right">
                    {duration.bestFor}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </MaxWidthContainer>
      </section>

      {/* What's Included Section */}
      <section className="py-6 sm:py-8 md:py-12 bg-gray-50">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="px-4 md:px-0 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <CheckCircle className="w-7 h-7 text-orange-600" />
              {t.whatsIncluded}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">Know what to expect before you book</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 px-2 md:px-0 gap-2 sm:gap-3 md:gap-6 max-w-6xl mx-auto">
            {((t as any).includedData || []).map((item: any, index: number) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.feature}</h3>
                  <p className="text-sm text-gray-600 mb-3">{item.description}</p>

                  <div className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                    {item.included}
                  </div>
                </div>
              );
            })}
          </div>
        </MaxWidthContainer>
      </section>

      {/* Top Tour Operators */}
      <section className="py-6 sm:py-8 md:py-12 bg-white">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="px-4 md:px-0 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Award className="w-7 h-7 text-orange-600" />
              {t.topOperators}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">Book with confidence from trusted tour providers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-2 md:px-0 gap-2 sm:gap-3 md:gap-6">
            {((t as any).operatorsData || []).map((operator: any, index: number) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-orange-400 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{operator.name}</h3>
                  <div className="flex items-center gap-1 bg-orange-100 px-2 py-1 rounded">
                    <Star className="w-4 h-4 text-orange-600 fill-orange-600" />
                    <span className="text-sm font-bold text-orange-600">{operator.rating}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Map className="w-4 h-4 text-orange-600" />
                    <span>{operator.tours}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Globe className="w-4 h-4 text-orange-600" />
                    <span>{operator.destinations}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Award className="w-4 h-4 text-orange-600" />
                    <span>{operator.specialty}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4 text-orange-600" />
                    <span>{operator.cancellation}</span>
                  </div>
                </div>

                <button className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg hover:from-orange-700 hover:to-amber-700 transition-all font-semibold">
                  View Tours
                </button>
              </div>
            ))}
          </div>
        </MaxWidthContainer>
      </section>

      {/* Expert Booking Tips */}
      <section className="py-6 sm:py-8 md:py-12 bg-gradient-to-br from-orange-50 to-amber-50">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="px-4 md:px-0 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Zap className="w-7 h-7 text-orange-600" />
              {t.bookingTips}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">Save money and enhance your experience with insider knowledge</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-2 md:px-0 gap-2 sm:gap-3 md:gap-6 max-w-6xl mx-auto">
            {((t as any).tipsData || []).map((tip: any, index: number) => {
              const IconComponent = tip.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center mb-4">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-3">{tip.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{tip.description}</p>
                </div>
              );
            })}
          </div>
        </MaxWidthContainer>
      </section>

      {/* Tours FAQ Section */}
      <section className="py-6 sm:py-8 md:py-12 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="px-4 md:px-0 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">❓ Tours FAQ</h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">Everything you need to know about booking tours with Fly2Any</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 px-2 md:px-0 gap-2 sm:gap-3 md:gap-6">
            {((t as any).faqData || []).map((faq: any, index: number) => (
              <details
                key={index}
                className="bg-white rounded-xl p-5 md:p-6 hover:shadow-lg transition-all border border-gray-200 hover:border-orange-300 group"
              >
                <summary className="font-bold text-gray-900 cursor-pointer list-none flex justify-between items-center gap-3">
                  <span className="flex-1 text-base md:text-lg">{faq.question}</span>
                  <ChevronRight className="w-5 h-5 text-orange-600 group-open:rotate-90 transition-transform flex-shrink-0" />
                </summary>
                <p className="mt-4 text-gray-600 text-sm md:text-base leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>

          <div className="mt-6 sm:mt-8 text-center px-4 md:px-0">
            <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-4">Still have questions?</p>
            <a href="mailto:support@fly2any.com" className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-md hover:shadow-lg">
              <Shield className="w-5 h-5" />
              Contact Our Support Team
            </a>
          </div>
        </MaxWidthContainer>
      </section>
    </div>
  );
}
