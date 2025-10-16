'use client';

import { Card } from '@/components/ui/Card';

interface Destination {
  city: string;
  country: string;
  image: string;
  price: number;
  currency: string;
}

interface Props {
  destinations: Destination[];
  title: string;
  subtitle: string;
  fromText: string;
}

export function TrendingDestinations({ destinations, title, subtitle, fromText }: Props) {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-xl text-gray-600">{subtitle}</p>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {destinations.map((dest, index) => (
            <Card
              key={index}
              variant="elevated"
              padding="none"
              hover
              className="overflow-hidden group cursor-pointer"
            >
              {/* Destination Image */}
              <div className="relative h-48 bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-300">
                {dest.image}
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Destination Info */}
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-1">
                  {dest.city}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{dest.country}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{fromText}</span>
                  <span className="text-2xl font-bold text-primary-600">
                    {dest.currency}{dest.price}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
