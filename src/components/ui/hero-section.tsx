'use client';

import * as React from "react";
import { useState, useEffect } from 'react';

interface FeatureItem {
  icon: string;
  text: string;
}

interface HeroSectionProps {
  title: string;
  subtitle: string;
  features: FeatureItem[];
  children?: React.ReactNode;
}

function HeroSection({ title, subtitle, features, children }: HeroSectionProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Trigger visibility animation
    setTimeout(() => setIsVisible(true), 100);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section className={`text-center py-4 md:py-8 px-4 w-full transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {/* Hero Content */}
      <div className="w-full mb-4 md:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-slate-900 mb-2 md:mb-3 leading-tight tracking-tight px-2">
          {title}
        </h1>
        <p className="text-base md:text-lg lg:text-xl text-slate-700 mb-4 md:mb-6 leading-relaxed px-4">
          {subtitle}
        </p>
        
        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-12">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-hotel-card rounded-xl p-3 md:p-4 shadow-hotel-card hover:shadow-hotel-hover transition-all duration-300 transform hover:scale-105"
              style={{
                animationDelay: `${index * 100}ms`,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 0.6s ease-out ${index * 100}ms, transform 0.6s ease-out ${index * 100}ms`
              }}
            >
              <span className="text-xl md:text-2xl mb-2 block">{feature.icon}</span>
              <span className="text-slate-700 text-xs md:text-sm font-medium">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Search Form Container */}
      {children && (
        <div className="w-full flex justify-center">
          <div className="w-full max-w-5xl">
            {children}
          </div>
        </div>
      )}
    </section>
  );
}

export { HeroSection };
export type { FeatureItem, HeroSectionProps };