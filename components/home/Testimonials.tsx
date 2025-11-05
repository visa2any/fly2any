'use client';

import { Card } from '@/components/ui/card';

interface Testimonial {
  name: string;
  location: string;
  rating: number;
  text: string;
  image: string;
}

interface Props {
  title: string;
  subtitle: string;
  testimonials: Testimonial[];
}

export function Testimonials({ title, subtitle, testimonials }: Props) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-xl text-gray-600">{subtitle}</p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              variant="elevated"
              padding="lg"
              className="group hover:shadow-2xl transition-shadow duration-300"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-warning text-xl">⭐</span>
                ))}
              </div>

              {/* Review Text */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Reviewer Info */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <div className="text-4xl">
                  {testimonial.image}
                </div>
                <div>
                  <div className="font-bold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.location}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
