'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';

interface Route {
  from: string;
  to: string;
  price: number;
  originalPrice: number;
  duration: string;
  carrier: string;
  savings: number;
  popular: boolean;
}

interface Props {
  title: string;
  subtitle: string;
  routes: Route[];
  searchText: string;
}

export function FeaturedRoutes({ title, subtitle, routes, searchText }: Props) {
  return (
    <section className="py-20 bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-xl text-gray-600">{subtitle}</p>
        </div>

        {/* Routes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.map((route, index) => (
            <Card
              key={index}
              variant="elevated"
              padding="none"
              hover
              className="overflow-hidden group"
            >
              {/* Route Header */}
              <div className="relative bg-gradient-to-br from-primary-500 to-primary-600 p-6 text-white">
                {route.popular && (
                  <div className="absolute top-4 right-4 bg-secondary-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                    🔥 POPULAR
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div className="text-lg font-bold">{route.from}</div>
                  <div className="flex-1 flex items-center justify-center px-4">
                    <div className="w-full h-px bg-white/30 relative">
                      <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="text-lg font-bold">{route.to}</div>
                </div>

                <div className="flex items-center justify-between text-sm opacity-90">
                  <span>{route.duration}</span>
                  <span>{route.carrier}</span>
                </div>
              </div>

              {/* Price Section */}
              <div className="p-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <div className="text-3xl font-bold text-primary-600">
                    ${route.price}
                  </div>
                  <div className="text-lg text-gray-400 line-through">
                    ${route.originalPrice}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-success/10 text-success text-sm font-semibold px-3 py-1 rounded-full">
                    Save ${route.savings} ({Math.round((route.savings / route.originalPrice) * 100)}%)
                  </div>
                </div>

                <Button variant="primary" fullWidth className="group-hover:shadow-lg transition-shadow">
                  {searchText} →
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
