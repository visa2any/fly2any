'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Package, Sparkles, Plane, Hotel, Car, Utensils,
  Users, Clock, Calendar, Star, Shield, MapPin,
  ChevronRight, CheckCircle, Award, Zap, Globe,
  Heart, TrendingDown, Gift, Briefcase, Sun, Mountain
} from 'lucide-react';
import { MobileHomeSearchWrapper } from '@/components/home/MobileHomeSearchWrapper';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import { CompactTrustBar } from '@/components/conversion/CompactTrustBar';
import { useTranslations } from 'next-intl';
import { useLanguage } from '@/lib/i18n/client';

type Language = 'en' | 'pt' | 'es';

// Base data arrays (language-agnostic)
const packageTypeImages = [
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
  'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&q=80',
  'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80',
  'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80',
  'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&q=80'
];

const destinationImages = [
  'https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=800&q=80',
  'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80',
  'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
  'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
  'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80'
];

const destinationRatings = [4.8, 4.9, 4.7, 4.8, 4.6, 4.7];
const providerRatings = [4.7, 4.8, 4.6, 4.5, 4.7, 4.6];

export default function PackagesPage() {
  const t = useTranslations('PackagesPage');
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
      {/* Hero Section - Green/Emerald Theme */}
      <div className="relative bg-gradient-to-br from-emerald-50 via-teal-50/30 to-green-50 border-b border-emerald-200/60 overflow-hidden md:overflow-visible max-h-[100vh] md:max-h-none">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="floating-orb floating-orb-1"></div>
          <div className="floating-orb floating-orb-2"></div>
          <div className="floating-orb floating-orb-3"></div>
        </div>

        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(16, 185, 129) 1px, transparent 0)',
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
              <span className="hidden md:inline-block text-emerald-400 text-2xl font-bold mx-1">•</span>
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
        .floating-orb-1 { width: 200px; height: 200px; background: linear-gradient(135deg, #10b981, #14b8a6); top: -80px; left: 5%; animation-delay: 0s; animation-duration: 25s; }
        .floating-orb-2 { width: 180px; height: 180px; background: linear-gradient(135deg, #14b8a6, #22c55e); top: -60px; right: 10%; animation-delay: 5s; animation-duration: 30s; }
        .floating-orb-3 { width: 150px; height: 150px; background: linear-gradient(135deg, #22c55e, #10b981); bottom: -50px; left: 50%; animation-delay: 10s; animation-duration: 28s; }
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
        .hero-title { color: #059669; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(5, 150, 105, 0.15); position: relative; z-index: 10; transform: translateZ(0); -webkit-transform: translateZ(0); -moz-transform: translateZ(0); backface-visibility: hidden; -webkit-backface-visibility: hidden; -moz-backface-visibility: hidden; isolation: isolate; font-weight: 800; }
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
      <MobileHomeSearchWrapper lang={lang} defaultService="packages" />

      {/* Trust Bar */}
      <CompactTrustBar />

      {/* Package Types & Categories */}
      <section className="py-6 sm:py-8 md:py-12 bg-white">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="px-4 md:px-0 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Package className="w-7 h-7 text-emerald-600" />
              {t('packageTypes')}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">Save big with bundled travel deals and all-inclusive packages</p>
          </div>

          <div className="grid px-2 md:px-0 gap-2 sm:gap-3 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {['beachVacation', 'cityBreak', 'adventure', 'cruise', 'safari', 'ski'].map((pkgKey, index) => {
              const pkg = {
                type: t(`packageType_${pkgKey}`),
                description: t(`packageType_${pkgKey}_desc`),
                priceRange: t(`packageType_${pkgKey}_priceRange`),
                duration: t(`packageType_${pkgKey}_duration`),
                features: [
                  t(`packageType_${pkgKey}_feature1`),
                  t(`packageType_${pkgKey}_feature2`),
                  t(`packageType_${pkgKey}_feature3`),
                  t(`packageType_${pkgKey}_feature4`)
                ],
                examples: t(`packageType_${pkgKey}_examples`),
                bestFor: t(`packageType_${pkgKey}_bestFor`),
                image: packageTypeImages[index]
              };

              const colors = [
                'from-emerald-500 to-teal-600',
                'from-teal-500 to-cyan-600',
                'from-green-500 to-emerald-600',
                'from-cyan-500 to-blue-600',
                'from-lime-500 to-green-600',
                'from-teal-600 to-emerald-700'
              ];

              return (
                <div
                  key={index}
                  className="relative rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all border border-gray-200 hover:border-emerald-400 group cursor-pointer h-[420px]"
                >
                  {/* Background Image */}
                  <Image
                    src={pkg.image}
                    alt={pkg.type}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Primary Gradient - Dark at bottom, transparent at top */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                  {/* Subtle color tint - only 20% opacity */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${colors[index]} opacity-20 mix-blend-overlay`} />

                  {/* Content */}
                  <div className="relative h-full p-6 flex flex-col justify-end">
                    {/* Icon - MAXIMUM visibility */}
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-2xl flex items-center justify-center mb-4 border-2 border-white/30 ring-2 ring-emerald-400/30">
                      <Package className="w-9 h-9 text-emerald-600" strokeWidth={2.5} />
                    </div>

                    {/* Title - Pure white, maximum impact */}
                    <h3 className="text-2xl font-black text-white mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] leading-tight tracking-tight">
                      {pkg.type}
                    </h3>

                    {/* Price - BRIGHT YELLOW for attention */}
                    <div className="text-2xl font-black text-yellow-300 mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 0 20px rgba(253,224,71,0.3)' }}>
                      {pkg.priceRange}
                    </div>

                    {/* Description - 95% opacity */}
                    <p className="text-sm text-white/95 mb-3 line-clamp-2 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] font-medium leading-relaxed">
                      {pkg.description}
                    </p>

                    {/* Duration */}
                    <div className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full mb-3 w-fit">
                      <Clock className="w-4 h-4 text-white" />
                      <span className="text-sm font-semibold text-white">{pkg.duration}</span>
                    </div>

                    {/* Features */}
                    <div className="space-y-1 mb-3">
                      {pkg.features.slice(0, 3).map((feature: string, i: number) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-300 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                          <span className="text-sm text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Best For */}
                    <p className="text-xs text-white/75 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                      <span className="font-semibold">Best for:</span> {pkg.bestFor}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </MaxWidthContainer>
      </section>

      {/* Popular Package Destinations */}
      <section className="py-6 sm:py-8 md:py-12 bg-gray-50">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="px-4 md:px-0 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Globe className="w-7 h-7 text-emerald-600" />
              {t('popularDestinations')}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">Top destinations with the best package deals and bundles</p>
          </div>

          <div className="grid px-2 md:px-0 gap-2 sm:gap-3 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {['cancun', 'maldives', 'dubai', 'bali', 'paris', 'newyork'].map((destKey, index) => {
              const dest = {
                destination: t(`dest_${destKey}`),
                packages: t(`dest_${destKey}_packages`),
                rating: destinationRatings[index],
                topPackages: [
                  t(`dest_${destKey}_pkg1`),
                  t(`dest_${destKey}_pkg2`),
                  t(`dest_${destKey}_pkg3`),
                  t(`dest_${destKey}_pkg4`)
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
                  <p className="text-sm text-gray-600 mb-3">{dest.packages} available</p>

                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-semibold text-gray-700">Popular Packages:</p>
                    {dest.topPackages.slice(0, 3).map((pkg: string, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">{pkg}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Packages from</p>
                      <p className="text-xl font-bold text-emerald-600">{dest.priceFrom}</p>
                    </div>
                    <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-semibold">
                      View Packages
                    </button>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        </MaxWidthContainer>
      </section>

      {/* Package Duration Options */}
      <section className="py-6 sm:py-8 md:py-12 bg-white">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="px-4 md:px-0 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Clock className="w-7 h-7 text-emerald-600" />
              {t('packageDurations')}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">Find packages that fit your schedule and vacation time</p>
          </div>

          <div className="grid px-2 md:px-0 gap-2 sm:gap-3 md:gap-6 grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto">
            {['weekendGetaway', 'weekLong', 'extended'].map((durationKey, index) => {
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
                className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border-2 border-emerald-200 hover:border-emerald-400 transition-all hover:shadow-lg"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4">
                  <Clock className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{duration.duration}</h3>
                <p className="text-lg font-semibold text-emerald-600 mb-3">{duration.time}</p>
                <p className="text-sm text-gray-600 mb-4">{duration.description}</p>

                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Examples:</p>
                  <p className="text-sm text-gray-600">{duration.examples}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-emerald-200">
                  <div>
                    <p className="text-xs text-gray-500">Price Range</p>
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
              <CheckCircle className="w-7 h-7 text-emerald-600" />
              {t('whatsIncluded')}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">Essential components bundled in most vacation packages</p>
          </div>

          <div className="grid px-2 md:px-0 gap-2 sm:gap-3 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {[
              { key: 'flights', icon: Plane },
              { key: 'accommodation', icon: Hotel },
              { key: 'meals', icon: Utensils },
              { key: 'activities', icon: Sparkles }
            ].map((itemType, index) => {
              const item = {
                feature: t(`included_${itemType.key}`),
                description: t(`included_${itemType.key}_desc`)
              };
              const IconComponent = itemType.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all border border-gray-200 hover:border-emerald-300">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.feature}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              );
            })}
          </div>
        </MaxWidthContainer>
      </section>

      {/* Top Package Providers */}
      <section className="py-6 sm:py-8 md:py-12 bg-white">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="px-4 md:px-0 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Award className="w-7 h-7 text-emerald-600" />
              {t('topProviders')}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">Trusted companies offering the best vacation package deals</p>
          </div>

          <div className="grid px-2 md:px-0 gap-2 sm:gap-3 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {['expedia', 'costco', 'apple', 'funjet', 'pleasant', 'gate1'].map((providerKey, index) => {
              const provider = {
                provider: t(`provider_${providerKey}`),
                speciality: t(`provider_${providerKey}_specialty`),
                rating: providerRatings[index],
                discount: t(`provider_${providerKey}_discount`)
              };
              return (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-2 border-gray-200 hover:border-emerald-400 transition-all hover:shadow-lg">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{provider.provider}</h3>
                  <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full">
                    <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                    <span className="text-sm font-bold text-yellow-700">{provider.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{provider.speciality}</p>
                <div className="flex items-center gap-2 text-emerald-600">
                  <TrendingDown className="w-5 h-5" />
                  <span className="text-sm font-semibold">{provider.discount}</span>
                </div>
              </div>
            );
            })}
          </div>
        </MaxWidthContainer>
      </section>

      {/* Expert Booking Tips */}
      <section className="py-6 sm:py-8 md:py-12 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="px-4 md:px-0 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Zap className="w-7 h-7 text-emerald-600" />
              {t('bookingTips')}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">Maximize savings and get the best value from vacation packages</p>
          </div>

          <div className="grid px-2 md:px-0 gap-2 sm:gap-3 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[
              { key: 'bundleSavings', icon: TrendingDown },
              { key: 'checkIncluded', icon: CheckCircle },
              { key: 'offSeason', icon: Calendar },
              { key: 'readDetails', icon: Shield },
              { key: 'compareProviders', icon: Award },
              { key: 'addedValue', icon: Gift }
            ].map((tipType, index) => {
              const tip = {
                tip: t(`tip_${tipType.key}`),
                description: t(`tip_${tipType.key}_desc`)
              };
              const IconComponent = tipType.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all border border-gray-200 hover:border-emerald-300">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 mb-2">{tip.tip}</h3>
                      <p className="text-sm text-gray-600">{tip.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </MaxWidthContainer>
      </section>

      {/* FAQ Section */}
      <section className="py-6 sm:py-8 md:py-12 bg-white">
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          <div className="px-4 md:px-0 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 md:mt-5">❓ {t('faq')}</h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">Everything you need to know about booking vacation packages</p>
          </div>

          <div className="grid px-2 md:px-0 gap-2 sm:gap-3 md:gap-6 grid-cols-1 lg:grid-cols-2">
            {['savings', 'included', 'customize', 'bestTime', 'refundable', 'insurance'].map((faqKey, index) => {
              const faq = {
                question: t(`faq_${faqKey}_q`),
                answer: t(`faq_${faqKey}_a`)
              };
              return (
              <details key={index} className="bg-white rounded-xl p-5 md:p-6 hover:shadow-lg transition-all border border-gray-200 hover:border-emerald-300 group">
                <summary className="flex items-start justify-between cursor-pointer list-none">
                  <span className="font-semibold text-gray-900 pr-4 group-hover:text-emerald-600 transition-colors">
                    {faq.question}
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-all group-open:rotate-90 flex-shrink-0" />
                </summary>
                <p className="mt-3 text-gray-600 leading-relaxed text-sm md:text-base">
                  {faq.answer}
                </p>
              </details>
            );
            })}
          </div>

          {/* Contact CTA */}
          <div className="px-4 md:px-0 mt-6 sm:mt-8 text-center">
            <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-4">Have more questions about vacation packages?</p>
            <a
              href="mailto:support@fly2any.com"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-md hover:shadow-lg"
            >
              <Shield className="w-5 h-5" />
              Contact Our Package Experts
            </a>
          </div>
        </MaxWidthContainer>
      </section>
    </div>
  );
}
