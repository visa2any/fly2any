'use client';

import * as React from "react";
import { useState, useEffect } from 'react';

interface BenefitItem {
  icon: string;
  badge: string;
  badgeVariant?: 'default' | 'success' | 'warning' | 'secondary';
  title: string;
  description: string;
  stats?: string;
}

interface SocialProofItem {
  value: string;
  label: string;
}

interface BenefitsSectionProps {
  title: string;
  subtitle?: string;
  benefits: BenefitItem[];
  socialProof?: SocialProofItem[];
}

function BenefitsSection({ 
  title, 
  subtitle, 
  benefits, 
  socialProof
}: BenefitsSectionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger visibility animation
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const getBadgeClasses = (variant: string = 'default') => {
    const variants = {
      default: 'bg-gradient-to-r from-blue-600 to-blue-800',
      success: 'bg-gradient-to-r from-green-500 to-green-600',
      warning: 'bg-gradient-to-r from-yellow-500 to-orange-600',
      secondary: 'bg-gradient-to-r from-purple-500 to-purple-700'
    };
    return variants[variant as keyof typeof variants] || variants.default;
  };

  return (
    <section className="relative mt-10 md:mt-16 py-16 md:py-20 px-5 md:px-10 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="text-center mb-12 md:mb-16">
        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-base md:text-xl text-slate-700 font-medium max-w-4xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 md:gap-8 mb-12 md:mb-16">
        {benefits.map((benefit, index) => (
          <div 
            key={index}
            className={`glass-card rounded-2xl p-6 md:p-8 xl:p-6 2xl:p-8 border border-white/20 shadow-2xl transition-all duration-700 ease-out hover:-translate-y-2 hover:shadow-3xl relative overflow-hidden ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{
              transitionDelay: `${0.2 * index}s`
            }}
          >
            {/* Badge */}
            <div className={`inline-flex items-center gap-2 text-white px-4 py-2 rounded-full text-xs font-bold tracking-wide uppercase mb-5 ${getBadgeClasses(benefit.badgeVariant)}`}>
              <span className="text-base">{benefit.icon}</span>
              <span>{benefit.badge}</span>
            </div>

            {/* Content */}
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 leading-tight">
              {benefit.title}
            </h3>
            
            <p className="text-sm md:text-base leading-relaxed text-slate-600 mb-4 font-medium">
              {benefit.description}
            </p>

            {/* Stats */}
            {benefit.stats && (
              <div className="inline-flex items-center bg-blue-50 text-blue-800 px-3 py-2 rounded-lg text-xs font-semibold">
                {benefit.stats}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Social Proof */}
      {socialProof && socialProof.length > 0 && (
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 xl:gap-20 p-10 md:p-12 bg-hotel-card rounded-2xl shadow-hotel-card max-w-6xl mx-auto">
          {socialProof.map((item, index) => (
            <div key={index} className="text-center">
              <div className="block text-3xl md:text-4xl font-extrabold accent-fly2any mb-1">
                {item.value}
              </div>
              <div className="text-xs md:text-sm text-slate-600 font-medium">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export { BenefitsSection };
export type { BenefitItem, SocialProofItem, BenefitsSectionProps };