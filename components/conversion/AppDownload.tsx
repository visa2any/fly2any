'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';

interface Props {
  title: string;
  subtitle: string;
  benefits: string[];
  downloadText: string;
}

export function AppDownload({ title, subtitle, benefits, downloadText }: Props) {
  return (
    <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {title}
            </h2>
            <p className="text-xl text-white/90 mb-8">
              {subtitle}
            </p>

            {/* Benefits List */}
            <ul className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-success flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-lg">{benefit}</span>
                </li>
              ))}
            </ul>

            {/* App Store Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 border-white/30 hover:bg-white/20 backdrop-blur-sm"
              >
                <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                App Store
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 border-white/30 hover:bg-white/20 backdrop-blur-sm"
              >
                <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                </svg>
                Google Play
              </Button>
            </div>

            {/* QR Code hint */}
            <div className="mt-6 text-sm text-white/75">
              Or scan the QR code with your phone →
            </div>
          </div>

          {/* Right: Phone Mockup + QR Code */}
          <div className="relative">
            <Card variant="glass" padding="lg" className="max-w-sm mx-auto">
              {/* QR Code Placeholder */}
              <div className="bg-white p-8 rounded-2xl mb-4">
                <div className="w-full aspect-square bg-gray-900 rounded-xl flex items-center justify-center text-white text-6xl">
                  📱
                </div>
              </div>

              <div className="text-center">
                <p className="font-semibold text-gray-900 mb-2">
                  Scan to Download
                </p>
                <p className="text-sm text-gray-600">
                  Available on iOS and Android
                </p>
              </div>
            </Card>

            {/* Floating Badge */}
            <div className="absolute -top-4 -right-4 bg-secondary-500 text-white px-4 py-2 rounded-full shadow-xl font-bold animate-bounce">
              Save 10%
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
