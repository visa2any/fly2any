'use client';

import Image from 'next/image';
import { BlogPost } from './BlogCard';
import { CountdownTimer } from './CountdownTimer';

interface FlashDeal {
  id: string;
  title: string;
  destination: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  dealEndsAt: string;
}

interface HeroSectionProps {
  featuredPost: BlogPost;
  flashDeals: FlashDeal[];
  language?: 'en' | 'pt' | 'es';
}

export function HeroSection({ featuredPost, flashDeals, language = 'en' }: HeroSectionProps) {
  const translations = {
    en: {
      featured: 'Featured Article',
      flashDeals: '🔥 Flash Deals',
      save: 'Save',
      readMore: 'Read More',
      viewDeal: 'View Deal',
    },
    pt: {
      featured: 'Artigo em Destaque',
      flashDeals: '🔥 Ofertas Relâmpago',
      save: 'Economize',
      readMore: 'Ler Mais',
      viewDeal: 'Ver Oferta',
    },
    es: {
      featured: 'Artículo Destacado',
      flashDeals: '🔥 Ofertas Flash',
      save: 'Ahorra',
      readMore: 'Leer Más',
      viewDeal: 'Ver Oferta',
    },
  };

  const t = translations[language];

  return (
    <section className="w-[90%] mx-auto py-6">
      <div className="grid lg:grid-cols-3 gap-3">
        {/* Left Side - Featured Article */}
        <div className="lg:col-span-2 relative h-[400px] lg:h-[500px] rounded-lg overflow-hidden group cursor-pointer">
          <Image
            src={featuredPost.image}
            alt={featuredPost.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            priority
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="inline-block bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium mb-3">
              {t.featured}
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold mb-3 line-clamp-2 group-hover:text-blue-300 transition-colors">
              {featuredPost.title}
            </h1>

            <p className="text-base lg:text-lg text-gray-200 mb-4 line-clamp-2">
              {featuredPost.excerpt}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                {featuredPost.author && (
                  <span className="font-medium">{featuredPost.author}</span>
                )}
                <span>{featuredPost.readTime} min</span>
                <span>{new Date(featuredPost.publishedAt).toLocaleDateString()}</span>
              </div>

              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                {t.readMore} →
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Flash Deals */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t.flashDeals}
          </h2>

          <div className="space-y-3">
            {flashDeals.slice(0, 3).map((deal) => (
              <div
                key={deal.id}
                className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer"
              >
                {/* Deal Image & Badge */}
                <div className="relative h-32">
                  <Image
                    src={deal.image}
                    alt={deal.destination}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                    {t.save} {deal.discount}%
                  </div>
                </div>

                {/* Deal Content */}
                <div className="p-3">
                  <h3 className="font-bold text-sm mb-2 text-gray-900 group-hover:text-orange-600 transition-colors">
                    {deal.destination}
                  </h3>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-xl font-bold text-orange-600">
                      ${deal.price}
                    </span>
                    <span className="text-xs text-gray-400 line-through">
                      ${deal.originalPrice}
                    </span>
                  </div>

                  {/* Compact Countdown */}
                  <div className="bg-gray-50 rounded p-2">
                    <CountdownTimer endTime={deal.dealEndsAt} size="sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
