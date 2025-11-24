'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Activity, Sparkles, Palette, Music, Waves, Mountain,
  Users, Clock, Calendar, Star, Shield, MapPin,
  ChevronRight, CheckCircle, Award, Zap, Globe,
  Heart, Compass, Bike, TreePine, Camera, Utensils,
  Package, Car, TrendingUp
} from 'lucide-react';
import { MobileHomeSearchWrapper } from '@/components/home/MobileHomeSearchWrapper';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import { CompactTrustBar } from '@/components/conversion/CompactTrustBar';
import { useTranslations } from 'next-intl';
import { useLanguage } from '@/lib/i18n/client';

type Language = 'en' | 'pt' | 'es';


// Base data arrays (language-agnostic)
const activityTypeImages = [
  'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&q=80',
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
  'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
  'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
  'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&q=80',
  'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80'
];

const destinationImages = [
  'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
  'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
  'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80',
  'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800&q=80',
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
  'https://images.unsplash.com/photo-1621956474307-48f39639007d?w=800&q=80'
];

const destinationRatings = [4.8, 4.9, 4.7, 4.9, 4.6, 4.8];
const providerRatings = [4.7, 4.8, 4.7, 4.8, 4.6, 4.7];
const activityPriceRanges = ['$50-$300', '$40-$200', '$30-$150', '$25-$180', '$40-$250', '$35-$200'];

export default function ActivitiesPage() {
  const t = useTranslations('ActivitiesPage');
  const { language: lang, setLanguage: setLang } = useLanguage();
  const [animationKey, setAnimationKey] = useState(0);
  const [mounted, setMounted] = useState(false);

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
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
              <h1 key={`title-${animationKey}`} className="hero-title text-lg sm:text-xl md:text-3xl font-extrabold whitespace-nowrap overflow-x-auto scrollbar-hide">
                {mounted ? t('sectionTitle').split('').map((char: string, index: number) => (
                  <span key={index} className="letter-elastic" style={{ animationDelay: `${index * 0.038}s`, display: 'inline-block', minWidth: char === ' ' ? '0.3em' : 'auto' }}>
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                )) : <span style={{ opacity: 0 }}>{t('sectionTitle')}</span>}
              </h1>
              <span className="hidden md:inline-block text-purple-400 text-2xl font-bold mx-1">•</span>
              <p key={`subtitle-${animationKey}`} className="hero-subtitle text-xs sm:text-sm md:text-lg whitespace-nowrap overflow-x-auto scrollbar-hide">
                {mounted ? t('subtitle').split('').map((char: string, index: number) => (
                  <span key={index} className="letter-elastic" style={{ animationDelay: `${2.0 + (index * 0.028)}s`, display: 'inline-block', minWidth: char === ' ' ? '0.3em' : 'auto' }}>
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                )) : <span style={{ opacity: 0 }}>{t('subtitle')}</span>}
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
        .hero-title { color: #7e22ce; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(126, 34, 206, 0.15); position: relative; z-index: 10; transform: translateZ(0); -webkit-transform: translateZ(0); -moz-transform: translateZ(0); backface-visibility: hidden; -webkit-backface-visibility: hidden; -moz-backface-visibility: hidden; isolation: isolate; font-weight: 800; }
        .separator-dot { animation: fadeIn 0.8s ease-out, dotPulse 2s ease-in-out infinite; display: inline-block; position: relative; z-index: 10; transform: translateZ(0); backface-visibility: hidden; }
        @keyframes dotPulse { 0%, 100% { transform: scale(1) translateZ(0); opacity: 0.7; } 50% { transform: scale(1.2) translateZ(0); opacity: 1; } }
        .letter-elastic { opacity: 0; animation: elasticLetterEntrance 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards; transform-origin: center center; position: relative; z-index: 1; backface-visibility: hidden; }
        @keyframes elasticLetterEntrance { 0% { opacity: 0; transform: translateY(-5px) scale(0.9) translateZ(0); } 100% { opacity: 1; transform: translateY(0) scale(1) translateZ(0); } }
        .hero-subtitle { position: relative; z-index: 10; transform: translateZ(0); -webkit-transform: translateZ(0); -moz-transform: translateZ(0); backface-visibility: hidden; -webkit-backface-visibility: hidden; -moz-backface-visibility: hidden; isolation: isolate; color: #374151; font-weight: 500; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
        @media (prefers-reduced-motion: reduce) { .hero-title, .separator-dot, .letter-elastic, .floating-orb { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; } }
      `}</style>

      {/* Top Search Bar */}
      <MobileHomeSearchWrapper lang={lang} defaultService="activities" />

      {/* Trust Bar */}
      <CompactTrustBar />

      {/* Activity Types & Categories Section */}
      <section className="py-6 sm:py-8 md:py-12 bg-white">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="px-4 md:px-0 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Activity className="w-7 h-7 text-purple-600" />
              {t('activityTypes')}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">Explore diverse activities tailored to every interest and skill level</p>
          </div>

          <div className="grid px-2 md:px-0 gap-2 sm:gap-3 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[
              { key: 'adventureSports', icon: Sparkles },
              { key: 'waterActivities', icon: Waves },
              { key: 'culturalWorkshops', icon: Palette },
              { key: 'outdoorAdventures', icon: Mountain },
              { key: 'wellnessSpa', icon: Heart },
              { key: 'entertainmentShows', icon: Music }
            ].map((activityType, index) => {
              const activity = {
                type: t(`activityType_${activityType.key}`),
                description: t(`activityType_${activityType.key}_desc`),
                priceRange: activityPriceRanges[index],
                duration: t(`activityType_${activityType.key}_duration`),
                features: [
                  t(`activityType_${activityType.key}_feature1`),
                  t(`activityType_${activityType.key}_feature2`),
                  t(`activityType_${activityType.key}_feature3`),
                  t(`activityType_${activityType.key}_feature4`)
                ],
                examples: t(`activityType_${activityType.key}_examples`),
                bestFor: t(`activityType_${activityType.key}_bestFor`),
                image: activityTypeImages[index]
              };
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
        </MaxWidthContainer>
      </section>

      {/* Popular Destinations Section */}
      <section className="py-6 sm:py-8 md:py-12 bg-gray-50">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="px-4 md:px-0 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Globe className="w-7 h-7 text-purple-600" />
              {t('popularDestinations')}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">Discover activities in the world's most exciting destinations</p>
          </div>

          <div className="grid px-2 md:px-0 gap-2 sm:gap-3 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {['dubai', 'bali', 'barcelona', 'queenstown', 'paris', 'costarica'].map((destKey, index) => {
              const dest = {
                destination: t(`dest_${destKey}`),
                activities: t(`dest_${destKey}_activities`),
                rating: destinationRatings[index],
                topExperiences: [
                  t(`dest_${destKey}_exp1`),
                  t(`dest_${destKey}_exp2`),
                  t(`dest_${destKey}_exp3`),
                  t(`dest_${destKey}_exp4`)
                ],
                priceFrom: t(`dest_${destKey}_priceFrom`),
                image: destinationImages[index]
              };
              return (
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
            );
            })}
          </div>
        </MaxWidthContainer>
      </section>

      {/* Activity Duration Options */}
      <section className="py-6 sm:py-8 md:py-12 bg-white">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="px-4 md:px-0 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Clock className="w-7 h-7 text-purple-600" />
              {t('activityDurations')}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">Choose the perfect activity duration for your schedule</p>
          </div>

          <div className="grid px-2 md:px-0 gap-2 sm:gap-3 md:gap-6 grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto">
            {['quick', 'halfDay', 'fullDay'].map((durationKey, index) => {
              const duration = {
                duration: t(`duration_${durationKey}`),
                time: t(`duration_${durationKey}_time`),
                description: t(`duration_${durationKey}_desc`),
                examples: t(`duration_${durationKey}_examples`),
                priceRange: t(`duration_${durationKey}_priceRange`),
                bestFor: t(`duration_${durationKey}_bestFor`)
              };
              return (
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
            )})}
          </div>
        </MaxWidthContainer>
      </section>

      {/* What's Included Section */}
      <section className="py-6 sm:py-8 md:py-12 bg-gray-50">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="px-4 md:px-0 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <CheckCircle className="w-7 h-7 text-purple-600" />
              {t('whatsIncluded')}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">Know what to expect before you book</p>
          </div>

          <div className="grid px-2 md:px-0 gap-2 sm:gap-3 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            {[
              { key: 'expertGuides', icon: Users },
              { key: 'equipment', icon: Package },
              { key: 'transportation', icon: Car },
              { key: 'insurance', icon: Shield }
            ].map((itemType, index) => {
              const item = {
                feature: t(`included_${itemType.key}`),
                description: t(`included_${itemType.key}_desc`),
                included: t(`included_${itemType.key}_included`)
              };
              const IconComponent = itemType.icon;
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
        </MaxWidthContainer>
      </section>

      {/* Top Activity Providers */}
      <section className="py-6 sm:py-8 md:py-12 bg-white">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="px-4 md:px-0 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Award className="w-7 h-7 text-purple-600" />
              {t('topProviders')}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">Book with confidence from trusted activity providers</p>
          </div>

          <div className="grid px-2 md:px-0 gap-2 sm:gap-3 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {['viator', 'getyourguide', 'klook', 'airbnb', 'tripadvisor', 'expedia'].map((providerKey, index) => {
              const provider = {
                name: t(`provider_${providerKey}`),
                rating: providerRatings[index],
                activities: t(`provider_${providerKey}_activities`),
                destinations: t(`provider_${providerKey}_destinations`),
                specialty: t(`provider_${providerKey}_specialty`),
                cancellation: t(`provider_${providerKey}_cancellation`)
              };
              return (
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
            )})}
          </div>
        </MaxWidthContainer>
      </section>

      {/* Expert Booking Tips */}
      <section className="py-6 sm:py-8 md:py-12 bg-gradient-to-br from-purple-50 to-violet-50">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="px-4 md:px-0 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Zap className="w-7 h-7 text-purple-600" />
              {t('bookingTips')}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">Save money and enhance your experience with insider knowledge</p>
          </div>

          <div className="grid px-2 md:px-0 gap-2 sm:gap-3 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {[
              { key: 'bookEarly', icon: Clock },
              { key: 'compareProviders', icon: TrendingUp },
              { key: 'weatherCheck', icon: Calendar },
              { key: 'groupDiscounts', icon: Users },
              { key: 'readReviews', icon: Star },
              { key: 'flexibleCancellation', icon: Shield }
            ].map((tipType, index) => {
              const tip = {
                title: t(`tip_${tipType.key}`),
                description: t(`tip_${tipType.key}_desc`)
              };
              const IconComponent = tipType.icon;
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
        </MaxWidthContainer>
      </section>

      {/* Activities FAQ Section */}
      <section className="py-6 sm:py-8 md:py-12 bg-gradient-to-br from-purple-50 via-violet-50 to-purple-50">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="px-4 md:px-0 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 md:mt-5">❓ Activities FAQ</h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">Everything you need to know about booking activities with Fly2Any</p>
          </div>

          <div className="grid px-2 md:px-0 gap-2 sm:gap-3 md:gap-6 grid-cols-1 lg:grid-cols-2">
            {['whatAre', 'howBook', 'cancellation', 'bestTime', 'accessibility', 'groupBookings'].map((faqKey, index) => {
              const faq = {
                question: t(`faq_${faqKey}_q`),
                answer: t(`faq_${faqKey}_a`)
              };
              return (
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
            )})}
          </div>

          <div className="px-4 md:px-0 mt-6 sm:mt-8 text-center">
            <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-4">Still have questions?</p>
            <a href="mailto:support@fly2any.com" className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-md hover:shadow-lg">
              <Shield className="w-5 h-5" />
              Contact Our Support Team
            </a>
          </div>
        </MaxWidthContainer>
      </section>
    </div>
  );
}
