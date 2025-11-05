'use client';

import { Star } from 'lucide-react';

interface Testimonial {
  name: string;
  location: string;
  rating: number;
  text: string;
  image: string;
}

interface FooterTestimonialsProps {
  testimonials: Testimonial[];
  language?: 'en' | 'pt' | 'es';
}

export function FooterTestimonials({
  testimonials,
  language = 'en'
}: FooterTestimonialsProps) {
  const title = language === 'en'
    ? 'Trusted by Travelers Worldwide'
    : language === 'pt'
    ? 'Confiável por Viajantes em Todo o Mundo'
    : 'Confiable para Viajeros en Todo el Mundo';

  const rating = '4.9';
  const reviewCount = '10,452';

  return (
    <div className="border-b border-gray-700/50 bg-gradient-to-r from-gray-800/60 to-gray-900/60">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6" style={{ maxWidth: '1600px' }}>
        {/* Header with Overall Rating - Compact */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-3">
          <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
            {title}
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-orange-500 px-3 py-1.5 rounded-lg">
              <Star className="w-4 h-4 fill-white text-white" />
              <span className="text-lg font-bold text-white">{rating}</span>
            </div>
            <div className="text-gray-300 text-xs">
              <div className="font-semibold">{reviewCount}+ {language === 'en' ? 'Reviews' : language === 'pt' ? 'Avaliações' : 'Reseñas'}</div>
              <div className="text-gray-500">{language === 'en' ? 'Verified travelers' : language === 'pt' ? 'Viajantes verificados' : 'Viajeros verificados'}</div>
            </div>
          </div>
        </div>

        {/* Testimonials Grid - Single Row, Full Width */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {testimonials.slice(0, 6).map((testimonial, index) => (
            <div
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 border border-gray-700/50 hover:border-primary-500/50 transition-colors"
            >
              {/* Profile Picture - Top Center */}
              <div className="flex justify-center mb-2">
                {testimonial.image.startsWith('http') ? (
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-gray-600"
                  />
                ) : (
                  <span className="text-2xl">{testimonial.image}</span>
                )}
              </div>

              {/* Stars Row - Center */}
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <div className="flex gap-0.5">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-[11px] text-gray-400 font-semibold">{testimonial.rating}.0</span>
              </div>

              {/* Quote Text - Centered, 3 lines */}
              <p className="text-[13px] text-gray-300 mb-2 line-clamp-3 leading-relaxed italic text-center">
                "{testimonial.text}"
              </p>

              {/* Reviewer Info - Center */}
              <div className="border-t border-gray-700/50 pt-2 text-center">
                <div className="text-xs font-semibold text-white truncate">
                  {testimonial.name}
                </div>
                <div className="text-[11px] text-gray-500 truncate">
                  {testimonial.location}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
