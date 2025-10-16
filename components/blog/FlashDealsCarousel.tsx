'use client';

import Image from 'next/image';
import { useRef, useState, useEffect } from 'react';
import { CountdownTimer } from './CountdownTimer';

export interface FlashDeal {
  id: string;
  title: string;
  destination: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  dealEndsAt: string;
  description?: string;
}

interface FlashDealsCarouselProps {
  deals: FlashDeal[];
  language?: 'en' | 'pt' | 'es';
}

export function FlashDealsCarousel({ deals, language = 'en' }: FlashDealsCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const translations = {
    en: { title: '🔥 Flash Deals', save: 'Save', viewDeal: 'View Deal' },
    pt: { title: '🔥 Ofertas Relâmpago', save: 'Economize', viewDeal: 'Ver Oferta' },
    es: { title: '🔥 Ofertas Flash', save: 'Ahorra', viewDeal: 'Ver Oferta' },
  };

  const t = translations[language];

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      return () => container.removeEventListener('scroll', checkScroll);
    }
  }, [deals]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320; // card width + gap
      const newScrollLeft =
        direction === 'left'
          ? scrollContainerRef.current.scrollLeft - scrollAmount
          : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-6 bg-gradient-to-br from-orange-50 to-red-50">
      <div className="w-[90%] mx-auto">
        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {t.title}
        </h2>

        {/* Carousel Container */}
        <div className="relative">
          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all duration-300"
              aria-label="Scroll left"
            >
              <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {deals.map((deal) => (
              <div
                key={deal.id}
                className="flex-shrink-0 w-[300px] bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                {/* Deal Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={deal.image}
                    alt={deal.destination}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Discount Badge */}
                  <div className="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    {t.save} {deal.discount}%
                  </div>
                </div>

                {/* Deal Content */}
                <div className="p-3">
                  <h3 className="font-bold text-base mb-2 text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                    {deal.destination}
                  </h3>

                  {deal.description && (
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {deal.description}
                    </p>
                  )}

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-2xl font-bold text-orange-600">
                      ${deal.price}
                    </span>
                    <span className="text-sm text-gray-400 line-through">
                      ${deal.originalPrice}
                    </span>
                  </div>

                  {/* Countdown Timer */}
                  <div className="bg-gray-50 rounded-lg p-2 mb-3">
                    <CountdownTimer endTime={deal.dealEndsAt} size="sm" />
                  </div>

                  {/* CTA Button */}
                  <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg font-medium transition-colors">
                    {t.viewDeal} →
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all duration-300"
              aria-label="Scroll right"
            >
              <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
