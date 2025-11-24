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
import { useTranslations } from 'next-intl';
import { useLanguage } from '@/lib/i18n/client';

type Language = 'en' | 'pt' | 'es';

// Base data arrays (language-agnostic - icons, colors, images)
const tourTypeImages = [
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
  'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
  'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80',
  'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80'
];

const destinationImages = [
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
  'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80',
  'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
  'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80',
  'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80'
];

const destinationRatings = [4.8, 4.9, 4.7, 4.6, 4.8, 4.7];
const operatorRatings = [4.7, 4.8, 4.9, 4.8, 4.9, 4.7];

const tourPriceRanges = ['$30-$80', '$80-$250', '$60-$180', '$40-$120', '$90-$300', '$200-$500/day'];

export default function ToursPage() {
  const t = useTranslations('ToursPage');
  const { language: lang, setLanguage: setLang } = useLanguage();

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
                {t('sectionTitle')}
              </h1>
              <span className="hidden md:inline-block text-orange-400 text-2xl font-bold mx-1">•</span>
              <p className="hero-subtitle text-gray-700/90 mb-0 font-medium text-xs sm:text-sm md:text-lg whitespace-nowrap overflow-x-auto scrollbar-hide" style={{ letterSpacing: '0.01em' }}>
                {t('subtitle')}
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
              {t('tourTypes')}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">{t('tourTypesSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-2 md:px-0 gap-2 sm:gap-3 md:gap-6">
            {[
              { key: 'cityTours', icon: Mountain },
              { key: 'adventure', icon: Utensils },
              { key: 'foodWine', icon: Landmark },
              { key: 'cultural', icon: TreePine },
              { key: 'natureWildlife', icon: Camera },
              { key: 'multiDay', icon: Globe }
            ].map((tourType, index) => {
              const tour = {
                type: t(`tourTypes_${tourType.key}`),
                description: t(`tourTypes_${tourType.key}_desc`),
                priceRange: tourPriceRanges[index],
                duration: t(`tourTypes_${tourType.key}_duration`),
                features: [
                  t(`tourTypes_${tourType.key}_feature1`),
                  t(`tourTypes_${tourType.key}_feature2`),
                  t(`tourTypes_${tourType.key}_feature3`),
                  t(`tourTypes_${tourType.key}_feature4`)
                ],
                examples: t(`tourTypes_${tourType.key}_examples`),
                bestFor: t(`tourTypes_${tourType.key}_bestFor`),
                image: tourTypeImages[index]
              };
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
              {t('popularDestinations')}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">{t('destinationsSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-2 md:px-0 gap-2 sm:gap-3 md:gap-6">
            {['paris', 'tokyo', 'rome', 'nyc', 'barcelona', 'dubai'].map((destKey, index) => {
              const dest = {
                destination: t(`dest_${destKey}`),
                tours: t(`dest_${destKey}_tours`),
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
                  <p className="text-sm text-gray-600 mb-3">{dest.tours} {t('toursAvailable')}</p>

                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-semibold text-gray-700">{t('topExperiences')}</p>
                    {dest.topExperiences.slice(0, 3).map((exp: string, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">{exp}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">{t('toursFrom')}</p>
                      <p className="text-xl font-bold text-orange-600">{dest.priceFrom}</p>
                    </div>
                    <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-semibold">
                      {t('exploreTours')}
                    </button>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        </MaxWidthContainer>
      </section>

      {/* Tour Duration Options */}
      <section className="py-6 sm:py-8 md:py-12 bg-white">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="px-4 md:px-0 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Clock className="w-7 h-7 text-orange-600" />
              {t('tourDurations')}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">{t('durationsSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 px-2 md:px-0 gap-2 sm:gap-3 md:gap-6 max-w-6xl mx-auto">
            {['halfDay', 'fullDay', 'multiDay'].map((durationKey, index) => {
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
                className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border-2 border-orange-200 hover:border-orange-400 transition-all hover:shadow-lg"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center mb-4">
                  <Clock className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{duration.duration}</h3>
                <p className="text-lg font-semibold text-orange-600 mb-3">{duration.time}</p>
                <p className="text-sm text-gray-600 mb-4">{duration.description}</p>

                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-700 mb-2">{t('examples')}</p>
                  <p className="text-sm text-gray-600">{duration.examples}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-orange-200">
                  <div>
                    <p className="text-xs text-gray-500">{t('priceRange')}</p>
                    <p className="text-lg font-bold text-gray-900">{duration.priceRange}</p>
                  </div>
                  <div className="text-xs text-gray-500 text-right">
                    {duration.bestFor}
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        </MaxWidthContainer>
      </section>

      {/* What's Included Section */}
      <section className="py-6 sm:py-8 md:py-12 bg-gray-50">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="px-4 md:px-0 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <CheckCircle className="w-7 h-7 text-orange-600" />
              {t('whatsIncluded')}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">{t('includedSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 px-2 md:px-0 gap-2 sm:gap-3 md:gap-6 max-w-6xl mx-auto">
            {[
              { key: 'guide', icon: Users },
              { key: 'transport', icon: MapPin },
              { key: 'entrance', icon: CheckCircle },
              { key: 'meals', icon: Utensils }
            ].map((itemType, index) => {
              const item = {
                feature: t(`included_${itemType.key}`),
                description: t(`included_${itemType.key}_desc`),
                included: t(`included_${itemType.key}_status`)
              };
              const IconComponent = itemType.icon;
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
              {t('topOperators')}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">{t('operatorsSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-2 md:px-0 gap-2 sm:gap-3 md:gap-6">
            {['viator', 'getyourguide', 'intrepid', 'gadventures', 'context', 'airbnb'].map((operatorKey, index) => {
              const operator = {
                name: t(`operator_${operatorKey}`),
                rating: operatorRatings[index],
                tours: t(`operator_${operatorKey}_tours`),
                destinations: t(`operator_${operatorKey}_destinations`),
                specialty: t(`operator_${operatorKey}_specialty`),
                cancellation: t(`operator_${operatorKey}_cancellation`)
              };
              return (
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
                  {t('viewTours')}
                </button>
              </div>
            );
            })}
          </div>
        </MaxWidthContainer>
      </section>

      {/* Expert Booking Tips */}
      <section className="py-6 sm:py-8 md:py-12 bg-gradient-to-br from-orange-50 to-amber-50">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="px-4 md:px-0 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Zap className="w-7 h-7 text-orange-600" />
              {t('bookingTips')}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">{t('tipsSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-2 md:px-0 gap-2 sm:gap-3 md:gap-6 max-w-6xl mx-auto">
            {[
              { key: 'bookEarly', icon: Calendar },
              { key: 'cancellation', icon: Shield },
              { key: 'reviews', icon: Star },
              { key: 'smallGroup', icon: Users },
              { key: 'checkIncluded', icon: CheckCircle },
              { key: 'skipLine', icon: Zap }
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
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">❓ {t('faq')}</h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">{t('faqSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 px-2 md:px-0 gap-2 sm:gap-3 md:gap-6">
            {[
              'cancellation',
              'tipping',
              'weather',
              'mobility',
              'meals',
              'meetingPoint'
            ].map((faqKey, index) => {
              const faq = {
                question: t(`faq_${faqKey}_q`),
                answer: t(`faq_${faqKey}_a`)
              };
              return (
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
            );
            })}
          </div>

          <div className="mt-6 sm:mt-8 text-center px-4 md:px-0">
            <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-4">{t('stillQuestions')}</p>
            <a href="mailto:support@fly2any.com" className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-md hover:shadow-lg">
              <Shield className="w-5 h-5" />
              {t('contactSupport')}
            </a>
          </div>
        </MaxWidthContainer>
      </section>
    </div>
  );
}
