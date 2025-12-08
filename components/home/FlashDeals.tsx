'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';

interface Deal {
  destination: string;
  nights: number;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  endsIn: string;
}

interface Props {
  deals: Deal[];
  title: string;
  subtitle: string;
  saveText: string;
  endsInText: string;
  bookText: string;
}

export function FlashDeals({ deals, title, subtitle, saveText, endsInText, bookText }: Props) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-1 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            🔥 {title}
          </h2>
          <p className="text-xl text-gray-600">{subtitle}</p>
        </div>

        {/* Deals Carousel/Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {deals.map((deal, index) => (
            <Card
              key={index}
              variant="elevated"
              padding="none"
              hover
              className="overflow-hidden group"
            >
              {/* Deal Badge */}
              <div className="relative h-40 bg-gradient-to-br from-secondary-400 to-error flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-300">
                {deal.image}
                {/* Discount Badge */}
                <div className="absolute top-4 right-4 bg-error text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  {saveText} {deal.discount}%
                </div>
              </div>

              {/* Deal Info */}
              <div className="p-5">
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  {deal.destination}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {deal.nights} nights
                </p>

                {/* Pricing */}
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-3xl font-bold text-error">
                    ${deal.price}
                  </span>
                  <span className="text-lg text-gray-400 line-through">
                    ${deal.originalPrice}
                  </span>
                </div>

                {/* Countdown Timer */}
                <div className="bg-gray-100 rounded-lg p-3 mb-4">
                  <div className="text-xs text-gray-600 mb-1">{endsInText}:</div>
                  <div className="text-lg font-bold text-gray-900 font-mono">
                    {deal.endsIn}
                  </div>
                </div>

                <Button variant="secondary" fullWidth>
                  {bookText} →
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
