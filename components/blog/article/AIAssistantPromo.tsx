'use client';

import { Sparkles, MessageCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface AIAssistantPromoProps {
    destination?: string;
    variant?: 'inline' | 'banner';
    className?: string;
}

/**
 * AI Travel Assistant Promotion for Blog Articles
 * 
 * Promotes the AI Travel Assistant feature within article content
 * to help readers get personalized trip planning assistance.
 */
export function AIAssistantPromo({
    destination = 'Paris',
    variant = 'inline',
    className = '',
}: AIAssistantPromoProps) {
    if (variant === 'inline') {
        return (
            <div className={`my-8 ${className}`}>
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Sparkles className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-lg mb-1">
                                Need Help Planning Your {destination} Trip?
                            </h4>
                            <p className="text-gray-600">
                                Our AI Travel Assistant can create a personalized itinerary, find the best deals, and answer all your questions.
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                // Trigger AI widget open (if available)
                                const widget = document.querySelector('[data-ai-widget]');
                                if (widget) (widget as HTMLElement).click();
                            }}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg flex items-center gap-2 whitespace-nowrap"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Ask AI Assistant
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Banner variant - more prominent
    return (
        <div className={`my-10 ${className}`}>
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl" />

                <div className="relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                        <Sparkles className="w-5 h-5 text-yellow-300" />
                        <span className="text-white font-semibold">Powered by AI</span>
                    </div>

                    <h3 className="text-3xl font-bold text-white mb-3">
                        Your Personal Travel Concierge
                    </h3>
                    <p className="text-lg text-white/90 max-w-2xl mx-auto mb-6">
                        Get instant answers about {destination} flights, hotels, visa requirements,
                        and create a custom itinerary tailored just for you.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => {
                                const widget = document.querySelector('[data-ai-widget]');
                                if (widget) (widget as HTMLElement).click();
                            }}
                            className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-all shadow-xl flex items-center gap-2"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Chat with AI Assistant
                        </button>
                        <Link
                            href="/trips/plan"
                            className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-bold rounded-xl hover:bg-white/30 transition-all border border-white/30 flex items-center gap-2"
                        >
                            Create Trip Plan
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
