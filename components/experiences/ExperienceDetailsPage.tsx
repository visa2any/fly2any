'use client';

/**
 * Shared Experience Details Page Component
 * Reusable for Tours, Activities, and Transfers
 * Level 6 Ultra-Premium Design
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft, Clock, MapPin, Users, Calendar, Star, Check, X, ChevronDown,
  Shield, Heart, Share2, Loader2, ShoppingBag, Sparkles, Info, AlertCircle
} from 'lucide-react';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import { useExperiencesCart, ExperienceType, typeIcons, typeColors } from '@/lib/cart/experiences-cart';

interface ExperienceData {
  id: string;
  type: ExperienceType;
  name: string;
  description: string;
  images: string[];
  price: number;
  currency: string;
  duration?: string;
  location: string;
  rating?: number;
  reviewCount?: number;
  highlights?: string[];
  includes?: string[];
  excludes?: string[];
  meetingPoint?: string;
  cancellationPolicy?: string;
  bookingLink?: string;
}

interface ExperienceDetailsPageProps {
  experience: ExperienceData;
  accentColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export default function ExperienceDetailsPage({
  experience,
  accentColor = 'orange',
  gradientFrom = 'from-orange-50/50',
  gradientTo = 'to-white',
}: ExperienceDetailsPageProps) {
  const router = useRouter();
  const { addItem } = useExperiencesCart();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'includes' | 'policy'>('overview');

  const colors = typeColors[experience.type];
  const totalParticipants = adults + children;
  const totalPrice = experience.price * totalParticipants;

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: experience.currency || 'USD',
    }).format(amount);
  };

  // Generate available dates (next 30 days)
  const availableDates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    return date.toISOString().split('T')[0];
  });

  // Time slots
  const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

  const handleAddToCart = useCallback(async () => {
    if (!selectedDate) {
      alert('Please select a date');
      return;
    }

    setIsAdding(true);

    // Simulate brief delay for UX
    await new Promise(resolve => setTimeout(resolve, 300));

    addItem({
      type: experience.type,
      productId: experience.id,
      name: experience.name,
      image: experience.images[0] || '',
      date: selectedDate,
      time: selectedTime || undefined,
      duration: experience.duration,
      location: experience.location,
      participants: { adults, children },
      unitPrice: experience.price,
      totalPrice,
      currency: experience.currency || 'USD',
      bookingLink: experience.bookingLink,
    });

    setIsAdding(false);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 3000);
  }, [addItem, experience, selectedDate, selectedTime, adults, children, totalPrice]);

  return (
    <div className={`min-h-screen bg-gradient-to-b ${gradientFrom} ${gradientTo}`}>
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100/80 shadow-sm">
        <MaxWidthContainer>
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2.5 rounded-xl hover:bg-gray-100/80 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <span className={`text-xs font-semibold ${colors.text}`}>
                  {typeIcons[experience.type]} {experience.type.toUpperCase()}
                </span>
                <h1 className="text-sm font-bold text-gray-900 line-clamp-1">{experience.name}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <Share2 className="w-5 h-5 text-gray-500" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <Heart className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </MaxWidthContainer>
      </div>

      <MaxWidthContainer>
        <div className="py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="space-y-3">
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-gray-100">
                {experience.images[selectedImage] ? (
                  <Image
                    src={experience.images[selectedImage]}
                    alt={experience.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className={`w-full h-full ${colors.bg} flex items-center justify-center text-6xl`}>
                    {typeIcons[experience.type]}
                  </div>
                )}
                {/* Type Badge */}
                <span className={`absolute top-4 left-4 px-3 py-1.5 text-sm font-semibold rounded-xl ${colors.bg} ${colors.text} backdrop-blur-sm`}>
                  {typeIcons[experience.type]} {experience.type}
                </span>
              </div>
              {/* Thumbnails */}
              {experience.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {experience.images.slice(0, 5).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 ${
                        selectedImage === idx ? 'ring-2 ring-primary-500 ring-offset-2' : ''
                      }`}
                    >
                      <Image src={img} alt="" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Meta */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">{experience.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {experience.location}
                </span>
                {experience.duration && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {experience.duration}
                  </span>
                )}
                {experience.rating && (
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="font-semibold">{experience.rating}</span>
                    <span className="text-gray-400">({experience.reviewCount} reviews)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex border-b border-gray-100">
                {(['overview', 'includes', 'policy'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3.5 text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? `text-${accentColor}-600 border-b-2 border-${accentColor}-500`
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab === 'overview' && 'Overview'}
                    {tab === 'includes' && 'What\'s Included'}
                    {tab === 'policy' && 'Cancellation'}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <p className="text-gray-600 leading-relaxed">{experience.description}</p>
                    {experience.highlights && experience.highlights.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Highlights</h3>
                        <ul className="space-y-2">
                          {experience.highlights.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-gray-600">
                              <Sparkles className={`w-4 h-4 text-${accentColor}-500 flex-shrink-0 mt-0.5`} />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {experience.meetingPoint && (
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <MapPin className="w-4 h-4" /> Meeting Point
                        </h3>
                        <p className="text-gray-600 text-sm">{experience.meetingPoint}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'includes' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {experience.includes && experience.includes.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" /> Included
                        </h3>
                        <ul className="space-y-2">
                          {experience.includes.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-gray-600 text-sm">
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {experience.excludes && experience.excludes.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <X className="w-4 h-4 text-red-500" /> Not Included
                        </h3>
                        <ul className="space-y-2">
                          {experience.excludes.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-gray-600 text-sm">
                              <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'policy' && (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                      <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-green-800 mb-1">Free Cancellation</h3>
                        <p className="text-sm text-green-700">
                          {experience.cancellationPolicy || 'Full refund up to 24 hours before the experience starts.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                {/* Price */}
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-3xl font-bold text-gray-900">{formatPrice(experience.price)}</span>
                  <span className="text-gray-500">/ person</span>
                </div>

                {/* Date Selection */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1.5" />
                      Select Date
                    </label>
                    <select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    >
                      <option value="">Choose a date</option>
                      {availableDates.map(date => (
                        <option key={date} value={date}>
                          {new Date(date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Time Selection (optional) */}
                  {experience.type !== 'transfer' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Clock className="w-4 h-4 inline mr-1.5" />
                        Select Time (optional)
                      </label>
                      <select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      >
                        <option value="">Any time</option>
                        {timeSlots.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Participants */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Users className="w-4 h-4 inline mr-1.5" />
                      Participants
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">Adults</span>
                        <div className="flex items-center border border-gray-200 rounded-xl">
                          <button
                            onClick={() => setAdults(Math.max(1, adults - 1))}
                            className="px-3 py-2 text-gray-500 hover:text-gray-700"
                          >
                            -
                          </button>
                          <span className="flex-1 text-center font-semibold">{adults}</span>
                          <button
                            onClick={() => setAdults(adults + 1)}
                            className="px-3 py-2 text-gray-500 hover:text-gray-700"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">Children</span>
                        <div className="flex items-center border border-gray-200 rounded-xl">
                          <button
                            onClick={() => setChildren(Math.max(0, children - 1))}
                            className="px-3 py-2 text-gray-500 hover:text-gray-700"
                          >
                            -
                          </button>
                          <span className="flex-1 text-center font-semibold">{children}</span>
                          <button
                            onClick={() => setChildren(children + 1)}
                            className="px-3 py-2 text-gray-500 hover:text-gray-700"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-600">Total ({totalParticipants} {totalParticipants === 1 ? 'person' : 'people'})</span>
                    <span className="text-2xl font-bold text-gray-900">{formatPrice(totalPrice)}</span>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={isAdding || !selectedDate}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                      isAdded
                        ? 'bg-green-500'
                        : !selectedDate
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25 hover:shadow-xl'
                    }`}
                  >
                    {isAdding ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : isAdded ? (
                      <>
                        <Check className="w-5 h-5" />
                        Added to Trip!
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5" />
                        Add to Trip
                      </>
                    )}
                  </button>
                </div>

                {/* Manual Ticketing Notice */}
                <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200/50">
                  <p className="text-xs text-amber-800 flex items-start gap-2">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Pending Confirmation:</strong> Your booking will be confirmed within 24 hours after checkout.
                    </span>
                  </p>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-green-600" />
                  Secure Booking
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-600" />
                  Best Price
                </span>
              </div>
            </div>
          </div>
        </div>
      </MaxWidthContainer>
    </div>
  );
}
