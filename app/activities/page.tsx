'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Activity, Sparkles, Palette, Music, Waves, Mountain,
  Users, Clock, Calendar, Star, Shield, MapPin,
  ChevronRight, CheckCircle, Award, Zap, Globe,
  Heart, Compass, Bike, TreePine, Camera, Utensils
} from 'lucide-react';
import { MobileHomeSearchWrapper } from '@/components/home/MobileHomeSearchWrapper';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import { CompactTrustBar } from '@/components/conversion/CompactTrustBar';

type Language = 'en' | 'pt' | 'es';

const content = {
  en: {
    // Compact Hero Section
    sectionTitle: 'Discover Exciting Activities & Unique Experiences',
    subtitle: 'From adventure sports to cultural workshops, create unforgettable memories',

    // Sections
    activityTypes: 'Activity Types & Categories',
    popularDestinations: 'Top Destinations for Activities',
    activityDurations: 'Activity Duration Options',
    whatsIncluded: "What's Included in Activities",
    topProviders: 'Top Activity Providers',
    bookingTips: 'Expert Booking Tips',
    faq: 'Activities FAQ',

    // Activity Types
    activityTypesData: [
      {
        type: 'Adventure Sports',
        description: 'Adrenaline-pumping activities from skydiving to bungee jumping',
        priceRange: '$50-$300',
        duration: '2-6 hours',
        features: ['Skydiving', 'Bungee Jump', 'Paragliding', 'White Water Rafting'],
        examples: 'Dubai Skydive, Queenstown Bungee, Swiss Paragliding',
        bestFor: 'Thrill-seekers, adventure enthusiasts',
        image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&q=80'
      },
      {
        type: 'Water Activities',
        description: 'Explore oceans, lakes, and rivers with exciting water sports',
        priceRange: '$40-$200',
        duration: '1-4 hours',
        features: ['Scuba Diving', 'Surfing', 'Kayaking', 'Jet Skiing'],
        examples: 'Bali Surf Lessons, Maldives Diving, Hawaii Snorkeling',
        bestFor: 'Water lovers, marine life enthusiasts',
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80'
      },
      {
        type: 'Cultural Workshops',
        description: 'Learn local crafts, cooking, and traditional arts from experts',
        priceRange: '$30-$150',
        duration: '2-5 hours',
        features: ['Cooking Classes', 'Pottery', 'Painting', 'Dance Lessons'],
        examples: 'Thai Cooking Class, Japanese Pottery, Flamenco Dance',
        bestFor: 'Culture enthusiasts, creative learners',
        image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80'
      },
      {
        type: 'Outdoor Adventures',
        description: 'Hiking, camping, and nature exploration activities',
        priceRange: '$25-$180',
        duration: '3 hours - 2 days',
        features: ['Hiking Tours', 'Rock Climbing', 'Camping', 'Zip-lining'],
        examples: 'Grand Canyon Hike, Alps Climbing, Costa Rica Zip-line',
        bestFor: 'Nature lovers, outdoor enthusiasts',
        image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80'
      },
      {
        type: 'Wellness & Spa',
        description: 'Relaxation activities including yoga, meditation, and spa treatments',
        priceRange: '$40-$250',
        duration: '1-8 hours',
        features: ['Yoga Classes', 'Spa Treatments', 'Meditation', 'Hot Springs'],
        examples: 'Bali Yoga Retreat, Iceland Hot Springs, Thai Massage',
        bestFor: 'Wellness seekers, relaxation lovers',
        image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&q=80'
      },
      {
        type: 'Entertainment & Shows',
        description: 'Live performances, concerts, and cultural entertainment',
        priceRange: '$35-$200',
        duration: '1-3 hours',
        features: ['Theater Shows', 'Concerts', 'Cabaret', 'Dinner Shows'],
        examples: 'Broadway Shows, Moulin Rouge, Cirque du Soleil',
        bestFor: 'Entertainment lovers, night life enthusiasts',
        image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80'
      }
    ],

    // Popular Destinations
    destinationsData: [
      {
        destination: 'Dubai, UAE',
        activities: '1,500+ activities',
        rating: 4.8,
        topExperiences: ['Desert Safari', 'Skydiving', 'Burj Khalifa', 'Water Parks'],
        priceFrom: '$45',
        image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80'
      },
      {
        destination: 'Bali, Indonesia',
        activities: '2,000+ activities',
        rating: 4.9,
        topExperiences: ['Surf Lessons', 'Temple Tours', 'Yoga Retreats', 'Cooking Classes'],
        priceFrom: '$25',
        image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80'
      },
      {
        destination: 'Barcelona, Spain',
        activities: '1,200+ activities',
        rating: 4.7,
        topExperiences: ['Tapas Tour', 'Sailing', 'Flamenco Show', 'Beach Activities'],
        priceFrom: '$35',
        image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80'
      },
      {
        destination: 'Queenstown, New Zealand',
        activities: '800+ activities',
        rating: 4.9,
        topExperiences: ['Bungee Jumping', 'Skiing', 'Jet Boating', 'Hiking'],
        priceFrom: '$60',
        image: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800&q=80'
      },
      {
        destination: 'Paris, France',
        activities: '1,800+ activities',
        rating: 4.6,
        topExperiences: ['Cooking Classes', 'Wine Tasting', 'Art Workshops', 'Seine Cruise'],
        priceFrom: '$40',
        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80'
      },
      {
        destination: 'Costa Rica',
        activities: '900+ activities',
        rating: 4.8,
        topExperiences: ['Zip-lining', 'Wildlife Tours', 'Surfing', 'Volcano Tours'],
        priceFrom: '$50',
        image: 'https://images.unsplash.com/photo-1621956474307-48f39639007d?w=800&q=80'
      }
    ],

    // Duration Options
    durationsData: [
      {
        duration: 'Quick Activities',
        time: '1-2 hours',
        description: 'Short experiences perfect for filling gaps in your itinerary',
        examples: 'City bike rental, cooking demo, quick spa treatment',
        priceRange: '$20-$60',
        bestFor: 'Time-limited travelers, sampling experiences'
      },
      {
        duration: 'Half-Day Activities',
        time: '3-5 hours',
        description: 'Morning or afternoon experiences with guided instruction',
        examples: 'Cooking class, surf lesson, art workshop, city tour',
        priceRange: '$40-$120',
        bestFor: 'Balanced schedules, learning experiences'
      },
      {
        duration: 'Full-Day Adventures',
        time: '6-10 hours',
        description: 'Complete immersive experiences with meals and equipment included',
        examples: 'Desert safari, diving expedition, hiking trip, multi-activity package',
        priceRange: '$80-$250',
        bestFor: 'Deep immersion, special occasions'
      }
    ],

    // What's Included
    includedData: [
      {
        feature: 'Expert Instruction',
        description: 'Certified instructors and guides for safe, enjoyable experiences',
        icon: Users,
        included: 'Always Included'
      },
      {
        feature: 'Equipment & Gear',
        description: 'All necessary equipment, safety gear, and materials provided',
        icon: Shield,
        included: 'Usually Included'
      },
      {
        feature: 'Transportation',
        description: 'Hotel pickup, drop-off, or meeting point instructions',
        icon: MapPin,
        included: 'Often Included'
      },
      {
        feature: 'Photos & Videos',
        description: 'Professional photos or videos of your experience',
        icon: Camera,
        included: 'Sometimes Included'
      }
    ],

    // Top Providers
    providersData: [
      {
        name: 'Viator',
        rating: 4.7,
        activities: '300,000+ activities',
        destinations: 'Worldwide',
        specialty: 'Largest selection globally',
        cancellation: 'Free up to 24 hours'
      },
      {
        name: 'GetYourGuide',
        rating: 4.8,
        activities: '200,000+ activities',
        destinations: '11,000+ destinations',
        specialty: 'Instant booking & mobile tickets',
        cancellation: 'Flexible cancellation'
      },
      {
        name: 'Klook',
        rating: 4.7,
        activities: '400,000+ activities',
        destinations: '1,000+ destinations',
        specialty: 'Asia Pacific specialist',
        cancellation: 'Free cancellation available'
      },
      {
        name: 'Airbnb Experiences',
        rating: 4.6,
        activities: '40,000+ experiences',
        destinations: 'Worldwide',
        specialty: 'Unique local hosted activities',
        cancellation: 'Free up to 24 hours'
      },
      {
        name: 'TripAdvisor',
        rating: 4.5,
        activities: '150,000+ activities',
        destinations: 'Worldwide',
        specialty: 'Verified reviews & ratings',
        cancellation: 'Varies by provider'
      },
      {
        name: 'Headout',
        rating: 4.7,
        activities: '25,000+ activities',
        destinations: '60+ cities',
        specialty: 'Last-minute bookings',
        cancellation: 'Free up to 48 hours'
      }
    ],

    // Booking Tips
    tipsData: [
      {
        title: 'Book Adventure Activities Early',
        description: 'Popular activities like skydiving and bungee jumping fill up fast, especially during peak season. Book 1-2 weeks ahead.',
        icon: Calendar
      },
      {
        title: 'Check Weather Requirements',
        description: 'Many outdoor activities are weather-dependent. Understand cancellation policies for bad weather conditions.',
        icon: Shield
      },
      {
        title: 'Verify Age & Health Requirements',
        description: 'Adventure activities often have age, weight, or health restrictions. Check requirements before booking to avoid disappointment.',
        icon: CheckCircle
      },
      {
        title: 'Compare Group vs Private Options',
        description: 'Group activities are cheaper but private sessions offer personalized attention. Weigh cost vs. experience quality.',
        icon: Users
      },
      {
        title: 'Read Safety Records',
        description: 'For adventure activities, check the operator\'s safety record and certifications. Don\'t compromise on safety for price.',
        icon: Award
      },
      {
        title: 'Book Packages for Better Value',
        description: 'Multi-activity packages often save 20-30% compared to booking separately. Great for families and groups.',
        icon: Zap
      }
    ],

    // FAQ
    faqData: [
      {
        question: 'What should I wear for adventure activities?',
        answer: 'Wear comfortable, weather-appropriate clothing and closed-toe shoes. Most operators provide specialized gear like helmets and harnesses. Avoid loose jewelry and tie back long hair. Check your confirmation email for specific dress code requirements.'
      },
      {
        question: 'Are activities suitable for children?',
        answer: 'Many activities have age and height restrictions for safety. Family-friendly activities are clearly marked. Check the age requirements before booking. Some operators offer modified versions for younger children. Always supervise children during activities.'
      },
      {
        question: 'What happens if I need to cancel?',
        answer: 'Cancellation policies vary by provider and activity type. Most offer free cancellation 24-48 hours before the activity. Adventure activities may have stricter policies. Weather cancellations usually result in full refunds or rescheduling options. Check specific terms before booking.'
      },
      {
        question: 'Do I need travel insurance for activities?',
        answer: 'We strongly recommend travel insurance that covers adventure activities. Standard policies may exclude high-risk activities like skydiving or scuba diving. Read your policy carefully and consider activity-specific coverage for peace of mind.'
      },
      {
        question: 'How far in advance should I book?',
        answer: 'Popular activities in peak season should be booked 1-2 weeks ahead. Specialized activities (hot air balloons, helicopter tours) may require more advance notice. Last-minute bookings are possible but may have limited availability or higher prices.'
      },
      {
        question: 'Are photos and videos included?',
        answer: 'Photo inclusion varies by activity and provider. Adventure activities often offer professional photos/videos for an additional fee ($20-50). Some experiences include basic photos for free. Check "What\'s Included" section or contact the provider directly.'
      }
    ]
  },
  pt: {
    sectionTitle: 'Descubra Atividades Emocionantes e Experiências Únicas',
    subtitle: 'De esportes radicais a workshops culturais, crie memórias inesquecíveis',
    activityTypes: 'Tipos e Categorias de Atividades',
    popularDestinations: 'Principais Destinos para Atividades',
    activityDurations: 'Opções de Duração de Atividades',
    whatsIncluded: 'O Que Está Incluído nas Atividades',
    topProviders: 'Principais Provedores de Atividades',
    bookingTips: 'Dicas de Reserva',
    faq: 'Perguntas Frequentes sobre Atividades'
  },
  es: {
    sectionTitle: 'Descubre Actividades Emocionantes y Experiencias Únicas',
    subtitle: 'Desde deportes de aventura hasta talleres culturales, crea recuerdos inolvidables',
    activityTypes: 'Tipos y Categorías de Actividades',
    popularDestinations: 'Principales Destinos para Actividades',
    activityDurations: 'Opciones de Duración de Actividades',
    whatsIncluded: 'Qué Está Incluido en las Actividades',
    topProviders: 'Principales Proveedores de Actividades',
    bookingTips: 'Consejos de Reserva',
    faq: 'Preguntas Frecuentes sobre Actividades'
  }
};

export default function ActivitiesPage() {
  const [lang, setLang] = useState<Language>('en');
  const [animationKey, setAnimationKey] = useState(0);
  const [mounted, setMounted] = useState(false);
  const t = content[lang] as any;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationKey(prev => prev + 1);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Purple/Violet Theme */}
      <div className="relative bg-gradient-to-br from-purple-50 via-violet-50/30 to-purple-50 border-b border-purple-200/60 overflow-hidden md:overflow-visible max-h-[100vh] md:max-h-none">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="floating-orb floating-orb-1"></div>
          <div className="floating-orb floating-orb-2"></div>
          <div className="floating-orb floating-orb-3"></div>
        </div>

        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(147, 51, 234) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>

        <MaxWidthContainer className="relative overflow-hidden md:overflow-visible" noPadding={true} style={{ padding: '12px 0 8px' }}>
          <div className="px-4 md:px-6">
            <div className="flex items-baseline gap-1 md:gap-3 flex-nowrap animate-fadeIn overflow-x-auto">
              <h1 key={`title-${animationKey}`} className="hero-title text-xl md:text-3xl font-extrabold tracking-wide whitespace-nowrap">
                {mounted ? t.sectionTitle.split('').map((char: string, index: number) => (
                  <span key={index} className="letter-elastic" style={{ animationDelay: `${index * 0.038}s`, display: 'inline-block', minWidth: char === ' ' ? '0.3em' : 'auto' }}>
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                )) : <span style={{ opacity: 0 }}>{t.sectionTitle}</span>}
              </h1>
              <span className="separator-dot text-purple-400 font-medium text-base md:text-xl flex-shrink-0">•</span>
              <p key={`subtitle-${animationKey}`} className="hero-subtitle text-gray-700/90 mb-0 font-medium text-sm md:text-lg whitespace-nowrap" style={{ letterSpacing: '0.01em' }}>
                {mounted ? t.subtitle.split('').map((char: string, index: number) => (
                  <span key={index} className="letter-elastic" style={{ animationDelay: `${2.0 + (index * 0.028)}s`, display: 'inline-block', minWidth: char === ' ' ? '0.3em' : 'auto' }}>
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                )) : <span style={{ opacity: 0 }}>{t.subtitle}</span>}
              </p>
            </div>
          </div>
        </MaxWidthContainer>
      </div>

      <style jsx>{`
        .floating-orb { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.15; animation: float 20s ease-in-out infinite; z-index: 0; }
        .floating-orb-1 { width: 200px; height: 200px; background: linear-gradient(135deg, #9333ea, #a855f7); top: -80px; left: 5%; animation-delay: 0s; animation-duration: 25s; }
        .floating-orb-2 { width: 180px; height: 180px; background: linear-gradient(135deg, #a855f7, #c084fc); top: -60px; right: 10%; animation-delay: 5s; animation-duration: 30s; }
        .floating-orb-3 { width: 150px; height: 150px; background: linear-gradient(135deg, #c084fc, #9333ea); bottom: -50px; left: 50%; animation-delay: 10s; animation-duration: 28s; }
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
        .hero-title { color: #7e22ce; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(126, 34, 206, 0.15); position: relative; z-index: 10; transform: translateZ(0); backface-visibility: hidden; isolation: isolate; font-weight: 800; }
        .separator-dot { animation: fadeIn 0.8s ease-out, dotPulse 2s ease-in-out infinite; display: inline-block; position: relative; z-index: 10; transform: translateZ(0); backface-visibility: hidden; }
        @keyframes dotPulse { 0%, 100% { transform: scale(1) translateZ(0); opacity: 0.7; } 50% { transform: scale(1.2) translateZ(0); opacity: 1; } }
        .letter-elastic { opacity: 0; animation: elasticLetterEntrance 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards; transform-origin: center center; position: relative; z-index: 1; backface-visibility: hidden; }
        @keyframes elasticLetterEntrance { 0% { opacity: 0; transform: translateY(-5px) scale(0.9) translateZ(0); } 100% { opacity: 1; transform: translateY(0) scale(1) translateZ(0); } }
        .hero-subtitle { position: relative; z-index: 10; transform: translateZ(0); backface-visibility: hidden; isolation: isolate; color: #374151; font-weight: 500; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
        @media (prefers-reduced-motion: reduce) { .hero-title, .separator-dot, .letter-elastic, .floating-orb { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; } }
      `}</style>

      {/* Top Search Bar */}
      <MobileHomeSearchWrapper lang={lang} defaultService="activities" />

      {/* Trust Bar */}
      <CompactTrustBar />

      {/* Activity Types & Categories Section */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Activity className="w-7 h-7 text-purple-600" />
              {t.activityTypes}
            </h2>
            <p className="text-gray-600">Explore diverse activities tailored to every interest and skill level</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(Array.isArray((t as any).activityTypesData) ? (t as any).activityTypesData : content.en.activityTypesData).map((activity: any, index: number) => {
              const icons = [Sparkles, Waves, Palette, Mountain, Heart, Music];
              const IconComponent = icons[index % icons.length];
              const colors = [
                'from-purple-500 to-violet-600',
                'from-blue-500 to-cyan-600',
                'from-pink-500 to-rose-600',
                'from-green-500 to-emerald-600',
                'from-orange-500 to-amber-600',
                'from-indigo-500 to-purple-600'
              ];

              return (
                <div
                  key={index}
                  className="relative rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all border border-gray-200 hover:border-purple-400 group cursor-pointer h-[340px]"
                >
                  {/* Background Image */}
                  <Image
                    src={activity.image}
                    alt={activity.type}
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
                      <div className="w-16 h-16 rounded-2xl bg-white shadow-2xl flex items-center justify-center mb-4 border-2 border-white/30 ring-2 ring-purple-400/30">
                        <IconComponent className="w-9 h-9 text-purple-600" strokeWidth={2.5} />
                      </div>

                      {/* Title - Pure White, Maximum Impact */}
                      <h3 className="text-2xl font-black text-white mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] leading-tight tracking-tight">
                        {activity.type}
                      </h3>

                      {/* Description - Slightly Dimmed for Hierarchy */}
                      <p className="text-sm text-white/95 mb-3 line-clamp-2 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] font-medium leading-relaxed">
                        {activity.description}
                      </p>

                      {/* Price - BRIGHT YELLOW/GOLD to stand out */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="text-2xl font-black text-yellow-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 0 20px rgba(253,224,71,0.3)' }}>
                          {activity.priceRange}
                        </div>
                        <div className="text-xs font-bold text-white bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/30 shadow-lg">
                          {activity.duration}
                        </div>
                      </div>

                      {/* Examples - Dimmed More for Hierarchy */}
                      <p className="text-xs text-white/80 mb-2 line-clamp-1 drop-shadow-md font-medium">
                        {activity.examples}
                      </p>
                    </div>

                    <div>
                      {/* Feature tags - Subtle but readable */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {activity.features.map((feat: string, i: number) => (
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
                        <span className="font-semibold">Best for:</span> {activity.bestFor}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Destinations Section */}
      <section className="py-8 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Globe className="w-7 h-7 text-purple-600" />
              {t.popularDestinations}
            </h2>
            <p className="text-gray-600">Discover activities in the world's most exciting destinations</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(Array.isArray((t as any).destinationsData) ? (t as any).destinationsData : content.en.destinationsData).map((dest: any, index: number) => (
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
                  <p className="text-sm text-gray-600 mb-3">{dest.activities} available</p>

                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-semibold text-gray-700">Top Experiences:</p>
                    {dest.topExperiences.slice(0, 3).map((exp: string, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">{exp}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Activities from</p>
                      <p className="text-xl font-bold text-purple-600">{dest.priceFrom}</p>
                    </div>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold">
                      Explore Activities
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Activity Duration Options */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Clock className="w-7 h-7 text-purple-600" />
              {t.activityDurations}
            </h2>
            <p className="text-gray-600">Choose the perfect activity duration for your schedule</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {(Array.isArray((t as any).durationsData) ? (t as any).durationsData : content.en.durationsData).map((duration: any, index: number) => (
              <div
                key={index}
                className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-lg"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mb-4">
                  <Clock className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{duration.duration}</h3>
                <p className="text-lg font-semibold text-purple-600 mb-3">{duration.time}</p>
                <p className="text-sm text-gray-600 mb-4">{duration.description}</p>

                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Examples:</p>
                  <p className="text-sm text-gray-600">{duration.examples}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-purple-200">
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
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-8 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <CheckCircle className="w-7 h-7 text-purple-600" />
              {t.whatsIncluded}
            </h2>
            <p className="text-gray-600">Know what to expect before you book</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {(Array.isArray((t as any).includedData) ? (t as any).includedData : content.en.includedData).map((item: any, index: number) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.feature}</h3>
                  <p className="text-sm text-gray-600 mb-3">{item.description}</p>

                  <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                    {item.included}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Top Activity Providers */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Award className="w-7 h-7 text-purple-600" />
              {t.topProviders}
            </h2>
            <p className="text-gray-600">Book with confidence from trusted activity providers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(Array.isArray((t as any).providersData) ? (t as any).providersData : content.en.providersData).map((provider: any, index: number) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-purple-400 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{provider.name}</h3>
                  <div className="flex items-center gap-1 bg-purple-100 px-2 py-1 rounded">
                    <Star className="w-4 h-4 text-purple-600 fill-purple-600" />
                    <span className="text-sm font-bold text-purple-600">{provider.rating}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Activity className="w-4 h-4 text-purple-600" />
                    <span>{provider.activities}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Globe className="w-4 h-4 text-purple-600" />
                    <span>{provider.destinations}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Award className="w-4 h-4 text-purple-600" />
                    <span>{provider.specialty}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4 text-purple-600" />
                    <span>{provider.cancellation}</span>
                  </div>
                </div>

                <button className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg hover:from-purple-700 hover:to-violet-700 transition-all font-semibold">
                  View Activities
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expert Booking Tips */}
      <section className="py-8 md:py-12 bg-gradient-to-br from-purple-50 to-violet-50">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Zap className="w-7 h-7 text-purple-600" />
              {t.bookingTips}
            </h2>
            <p className="text-gray-600">Save money and enhance your experience with insider knowledge</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {(Array.isArray((t as any).tipsData) ? (t as any).tipsData : content.en.tipsData).map((tip: any, index: number) => {
              const IconComponent = tip.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mb-4">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-3">{tip.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{tip.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Activities FAQ Section */}
      <section className="py-8 md:py-12 bg-gradient-to-br from-purple-50 via-violet-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">❓ Activities FAQ</h2>
            <p className="text-gray-600">Everything you need to know about booking activities with Fly2Any</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {(Array.isArray((t as any).faqData) ? (t as any).faqData : content.en.faqData).map((faq: any, index: number) => (
              <details
                key={index}
                className="bg-white rounded-xl p-5 md:p-6 hover:shadow-lg transition-all border border-gray-200 hover:border-purple-300 group"
              >
                <summary className="font-bold text-gray-900 cursor-pointer list-none flex justify-between items-center gap-3">
                  <span className="flex-1 text-base md:text-lg">{faq.question}</span>
                  <ChevronRight className="w-5 h-5 text-purple-600 group-open:rotate-90 transition-transform flex-shrink-0" />
                </summary>
                <p className="mt-4 text-gray-600 text-sm md:text-base leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <a href="mailto:support@fly2any.com" className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-md hover:shadow-lg">
              <Shield className="w-5 h-5" />
              Contact Our Support Team
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
