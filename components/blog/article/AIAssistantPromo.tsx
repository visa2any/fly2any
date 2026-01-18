'use client';

import { motion } from 'framer-motion';
import { Sparkles, MessageCircle, ArrowRight, Bot, Wand2 } from 'lucide-react';
import Link from 'next/link';

interface AIAssistantPromoProps {
    destination?: string;
    variant?: 'inline' | 'banner';
    className?: string;
}

/**
 * Ultra-Premium AI Travel Assistant Promotion
 * Level 6 - Apple-Class with glass morphism, floating particles, and premium animations
 */
export function AIAssistantPromo({
    destination = 'Paris',
    variant = 'inline',
    className = '',
}: AIAssistantPromoProps) {
    // Inline Variant
    if (variant === 'inline') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={`my-10 ${className}`}
            >
                <div className="relative overflow-hidden rounded-3xl shadow-[0_8px_40px_rgba(99,102,241,0.15),0_4px_20px_rgba(99,102,241,0.1)]">
                    {/* Gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-violet-50" />

                    {/* Subtle grid pattern */}
                    <div className="absolute inset-0 opacity-30" style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, rgb(99 102 241 / 0.15) 1px, transparent 0)`,
                        backgroundSize: '24px 24px'
                    }} />

                    {/* Floating orbs */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-violet-400/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl" />

                    {/* Border glow */}
                    <div className="absolute inset-0 rounded-3xl border-2 border-indigo-200/50" />

                    <div className="relative z-10 p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                            {/* Icon with glow */}
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-40 animate-pulse" />
                                <motion.div
                                    className="relative w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl"
                                    animate={{ rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                >
                                    <Sparkles className="w-8 h-8 text-white" />
                                    {/* Sparkle particles */}
                                    <motion.div
                                        className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"
                                        animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    />
                                </motion.div>
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2.5 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold rounded-full">
                                        AI-POWERED
                                    </span>
                                </div>
                                <h4 className="font-black text-gray-900 text-xl mb-2">
                                    Need Help Planning Your {destination} Trip?
                                </h4>
                                <p className="text-gray-600 leading-relaxed">
                                    Our AI Travel Assistant creates personalized itineraries, finds the best deals, and answers all your questions instantly.
                                </p>
                            </div>

                            <motion.button
                                onClick={() => {
                                    const widget = document.querySelector('[data-ai-widget]');
                                    if (widget) (widget as HTMLElement).click();
                                }}
                                className="relative overflow-hidden px-7 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-3 whitespace-nowrap group"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {/* Shine effect */}
                                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                                    <div className="absolute -inset-full animate-[shine_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                                </div>
                                <MessageCircle className="w-5 h-5 relative z-10" />
                                <span className="relative z-10">Ask AI Assistant</span>
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    // Banner Variant - Full-width premium
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className={`my-12 ${className}`}
        >
            <div className="relative overflow-hidden rounded-[2rem] shadow-[0_20px_60px_rgba(99,102,241,0.25),0_8px_30px_rgba(99,102,241,0.15)]">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-[length:200%_100%] animate-[shimmer_6s_ease-in-out_infinite]" />

                {/* Glass overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/10" />

                {/* Floating orbs */}
                <motion.div
                    className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[100px]"
                    animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute bottom-0 left-0 w-60 h-60 bg-white/10 rounded-full blur-[80px]"
                    animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Floating particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-white/30 rounded-full"
                            style={{
                                left: `${10 + i * 12}%`,
                                top: `${20 + (i % 3) * 30}%`,
                            }}
                            animate={{
                                y: [-20, 20, -20],
                                x: [-10, 10, -10],
                                opacity: [0.2, 0.6, 0.2],
                            }}
                            transition={{
                                duration: 4 + i * 0.5,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                delay: i * 0.3,
                            }}
                        />
                    ))}
                </div>

                {/* Shine sweep */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -inset-full animate-[shine_5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12" />
                </div>

                <div className="relative z-10 p-8 sm:p-10 lg:p-12">
                    <div className="text-center max-w-3xl mx-auto">
                        {/* Badge */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-5 py-2.5 mb-6 border border-white/30"
                        >
                            <Sparkles className="w-5 h-5 text-yellow-300" />
                            <span className="text-white font-bold">Powered by AI</span>
                            <Wand2 className="w-4 h-4 text-yellow-300" />
                        </motion.div>

                        <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight">
                            Your Personal Travel Concierge
                        </h3>
                        <p className="text-lg sm:text-xl text-white/90 mb-8 leading-relaxed">
                            Get instant answers about {destination} flights, hotels, visa requirements,
                            and create a custom itinerary tailored just for you.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <motion.button
                                onClick={() => {
                                    const widget = document.querySelector('[data-ai-widget]');
                                    if (widget) (widget as HTMLElement).click();
                                }}
                                className="relative overflow-hidden px-10 py-5 bg-white text-indigo-600 font-black rounded-2xl shadow-2xl hover:shadow-3xl transition-all flex items-center gap-3 group"
                                whileHover={{ scale: 1.03, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Bot className="w-6 h-6 group-hover:animate-bounce" />
                                <span className="text-lg">Chat with AI Assistant</span>
                            </motion.button>

                            <Link
                                href="/trips/plan"
                                className="px-10 py-5 bg-white/15 backdrop-blur-md text-white font-bold rounded-2xl border-2 border-white/30 hover:bg-white/25 transition-all flex items-center gap-3"
                            >
                                <span>Create Trip Plan</span>
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
