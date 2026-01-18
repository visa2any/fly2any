'use client';

import { ReactNode } from 'react';
import { ArticleHero } from './ArticleHero';
import { ArticleContent } from './ArticleContent';
import { InlineSearchWidget } from './InlineSearchWidget';
import { UrgencyBanner } from './UrgencyBanner';
import { AIAssistantPromo } from './AIAssistantPromo';

interface ArticleTemplateProps {
    article: {
        slug: string;
        title: string;
        excerpt: string;
        category: string;
        author: {
            name: string;
            role: string;
        };
        publishedAt: Date;
        readTime: number;
        views?: number;
        likes?: number;
        featuredImage: {
            url: string;
            alt: string;
            credit?: string;
        };
        content?: ReactNode;
    };
    relatedDeals?: any[]; // Allow passing dynamic deals
}

/**
 * Reusable Article Template Pattern
 * 
 * Implements the "Inspiration → Logic → Action" flow:
 * 1. Hero: Inspiration (Image + Title)
 * 2. Content: Logic (Data + Tips)
 * 3. Marketing: Action (Widgets + CTAs)
 */
export function ArticleTemplate({ article, relatedDeals = [] }: ArticleTemplateProps) {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Section - Inspiration */}
            <ArticleHero {...article} />

            {/* Main Content Area */}
            <ArticleContent content={article.content}>

                {/* Standard Marketing Slots - If not manually embedded in content */}
                {!article.content && (
                    <div className="space-y-12">
                        {/* Slot 1: Mid-Article Search or Promo */}
                        <div className="my-8">
                            <AIAssistantPromo destination="Flexible" />
                        </div>

                        {/* Slot 2: Urgency if deals are present */}
                        {relatedDeals.length > 0 && (
                            <UrgencyBanner
                                type="scarcity"
                                seatsLeft={Math.floor(Math.random() * 5) + 3}
                                message="Deals for this route are selling out!"
                            />
                        )}

                        {/* Slot 3: Final Call to Action */}
                        <div className="my-10">
                            <InlineSearchWidget variant="full" />
                        </div>
                    </div>
                )}
            </ArticleContent>

            {/* Footer / Newsletter (Could be added here) */}
        </div>
    );
}
