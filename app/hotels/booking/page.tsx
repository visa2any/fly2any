'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Hotel, ChevronLeft, ChevronRight, Loader2, User, CreditCard, MapPin, Calendar, Users as UsersIcon } from 'lucide-react';
import { useScrollDirection } from '@/lib/hooks/useScrollDirection';

// ===========================
// TYPE DEFINITIONS
// ===========================

type BookingStep = 1 | 2 | 3;

interface RoomOption {
  id: string;
  name: string;
  description: string;
  bedType: string;
  maxGuests: number;
  amenities: string[];
  price: number;
  currency: string;
  refundable: boolean;
  breakfastIncluded: boolean;
  selected?: boolean;
}

interface GuestData {
  id: string;
  type: 'adult' | 'child';
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  email?: string;
  phone?: string;
  specialRequests?: string;
}

interface HotelBookingData {
  hotelId: string;
  hotelName: string;
  location: string;
  checkIn: string;
  checkOut: string;
  guests: {
    adults: number;
    children: number;
  };
  nights: number;
  basePrice: number;
  currency: string;
  imageUrl?: string;
  starRating?: number;
}

// ===========================
// MAIN COMPONENT
// ===========================

function HotelBookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentStep, setCurrentStep] = useState<BookingStep>(1);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Hotel data
  const [hotelData, setHotelData] = useState<HotelBookingData | null>(null);

  // Step 1: Room selection
  const [roomOptions, setRoomOptions] = useState<RoomOption[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');

  // Step 2: Guest details
  const [guests, setGuests] = useState<GuestData[]>([]);

  // Step 3: Payment
  const [paymentData, setPaymentData] = useState<any>(null);

  // Price lock timer
  const [priceLockTimer, setPriceLockTimer] = useState({ minutes: 15, seconds: 0 });

  // Scroll direction detection
  const { scrollDirection, isAtTop } = useScrollDirection({
    threshold: 50,
    debounceDelay: 100,
    mobileOnly: true,
  });

  // ===========================
  // LOAD HOTEL DATA
  // ===========================

  useEffect(() => {
    const loadHotelData = async () => {
      try {
        const hotelId = searchParams.get('hotelId');
        if (!hotelId) {
          router.push('/hotels/search');
          return;
        }

        // Try to load from sessionStorage first
        const cachedHotel = sessionStorage.getItem(`hotel_booking_${hotelId}`);
        if (cachedHotel) {
          const data = JSON.parse(cachedHotel);
          setHotelData(data);
          loadRoomOptions(data);
          initializeGuests(data.guests.adults, data.guests.children);
          setLoading(false);
          return;
        }

        // If not in cache, try to fetch from URL params
        const hotelName = searchParams.get('name');
        const location = searchParams.get('location');
        const checkIn = searchParams.get('checkIn');
        const checkOut = searchParams.get('checkOut');
        const adults = parseInt(searchParams.get('adults') || '1');
        const children = parseInt(searchParams.get('children') || '0');
        const price = parseFloat(searchParams.get('price') || '0');
        const currency = searchParams.get('currency') || 'USD';

        if (!hotelName || !checkIn || !checkOut) {
          router.push('/hotels/search');
          return;
        }

        // Calculate nights
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

        const bookingData: HotelBookingData = {
          hotelId,
          hotelName,
          location: location || 'Unknown',
          checkIn,
          checkOut,
          guests: { adults, children },
          nights,
          basePrice: price,
          currency,
          imageUrl: searchParams.get('image') || undefined,
          starRating: parseInt(searchParams.get('stars') || '0') || undefined,
        };

        setHotelData(bookingData);
        loadRoomOptions(bookingData);
        initializeGuests(adults, children);
        setLoading(false);
      } catch (error) {
        console.error('Error loading hotel data:', error);
        router.push('/hotels/search');
      }
    };

    loadHotelData();
  }, [searchParams, router]);

  // Price lock timer
  useEffect(() => {
    const interval = setInterval(() => {
      setPriceLockTimer(prev => {
        if (prev.minutes === 0 && prev.seconds === 0) {
          return prev;
        }

        if (prev.seconds === 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        }

        return { ...prev, seconds: prev.seconds - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ===========================
  // HELPER FUNCTIONS
  // ===========================

  const loadRoomOptions = (bookingData: HotelBookingData) => {
    // Mock room options - In production, this would be an API call
    const mockRooms: RoomOption[] = [
      {
        id: 'standard-queen',
        name: 'Standard Queen Room',
        description: 'Comfortable room with queen bed',
        bedType: 'Queen Bed',
        maxGuests: 2,
        amenities: ['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom'],
        price: bookingData.basePrice * 0.9,
        currency: bookingData.currency,
        refundable: false,
        breakfastIncluded: false,
      },
      {
        id: 'deluxe-king',
        name: 'Deluxe King Room',
        description: 'Spacious room with king bed and city view',
        bedType: 'King Bed',
        maxGuests: 2,
        amenities: ['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom', 'Mini Bar', 'City View'],
        price: bookingData.basePrice,
        currency: bookingData.currency,
        refundable: true,
        breakfastIncluded: true,
        selected: true,
      },
      {
        id: 'suite',
        name: 'Executive Suite',
        description: 'Luxury suite with separate living area',
        bedType: 'King Bed + Sofa Bed',
        maxGuests: 4,
        amenities: ['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom', 'Mini Bar', 'City View', 'Living Area', 'Coffee Maker'],
        price: bookingData.basePrice * 1.4,
        currency: bookingData.currency,
        refundable: true,
        breakfastIncluded: true,
      },
    ];

    setRoomOptions(mockRooms);
    setSelectedRoomId('deluxe-king');
  };

  const initializeGuests = (adults: number, children: number) => {
    const guestList: GuestData[] = [];

    for (let i = 0; i < adults; i++) {
      guestList.push({
        id: `adult-${i + 1}`,
        type: 'adult',
        title: '',
        firstName: '',
        lastName: '',
        email: i === 0 ? '' : undefined,
        phone: i === 0 ? '' : undefined,
      });
    }

    for (let i = 0; i < children; i++) {
      guestList.push({
        id: `child-${i + 1}`,
        type: 'child',
        title: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
      });
    }

    setGuests(guestList);
  };

  // ===========================
  // VALIDATION
  // ===========================

  const areGuestsComplete = () => {
    return guests.every((guest, index) => {
      const required = ['title', 'firstName', 'lastName'];
      if (guest.type === 'child') {
        required.push('dateOfBirth');
      }
      if (index === 0) {
        required.push('email', 'phone');
      }
      return required.every(field => {
        const value = guest[field as keyof GuestData];
        return value && value.toString().trim() !== '';
      });
    });
  };

  // ===========================
  // HANDLERS
  // ===========================

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId(roomId);
  };

  const handleGuestUpdate = (guestId: string, field: string, value: string) => {
    setGuests(prev =>
      prev.map(guest =>
        guest.id === guestId ? { ...guest, [field]: value } : guest
      )
    );
  };

  const handleContinue = () => {
    if (currentStep === 2 && !areGuestsComplete()) {
      alert('Please complete all required guest information before continuing.');
      return;
    }

    if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as BookingStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as BookingStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      if (!hotelData) {
        throw new Error('Hotel data is missing');
      }

      const selectedRoom = roomOptions.find(r => r.id === selectedRoomId);
      if (!selectedRoom) {
        throw new Error('Please select a room');
      }

      // Prepare booking request
      const bookingRequest = {
        hotelId: hotelData.hotelId,
        hotelName: hotelData.hotelName,
        roomId: selectedRoom.id,
        roomName: selectedRoom.name,
        checkIn: hotelData.checkIn,
        checkOut: hotelData.checkOut,
        nights: hotelData.nights,
        guests: guests.map(g => ({
          type: g.type,
          title: g.title,
          firstName: g.firstName,
          lastName: g.lastName,
          dateOfBirth: g.dateOfBirth,
          email: g.email,
          phone: g.phone,
          specialRequests: g.specialRequests,
        })),
        payment: paymentData,
        totalPrice: selectedRoom.price * hotelData.nights,
        currency: hotelData.currency,
      };

      // Call the booking API (which already exists)
      // For now, we'll simulate a successful booking
      const mockBookingId = `HB${Date.now()}`;
      const mockConfirmation = `CONF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

      // Store booking in sessionStorage for confirmation page
      sessionStorage.setItem(`hotel_booking_${mockBookingId}`, JSON.stringify({
        ...bookingRequest,
        id: mockBookingId,
        confirmationNumber: mockConfirmation,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      }));

      // Redirect to confirmation
      router.push(`/hotels/booking/confirmation?bookingId=${mockBookingId}&ref=${mockConfirmation}`);
    } catch (error: any) {
      console.error('Booking error:', error);
      alert(error.message || 'There was an error processing your booking. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ===========================
  // PRICE CALCULATION
  // ===========================

  const getTotalPrice = () => {
    if (!hotelData) return 0;
    const selectedRoom = roomOptions.find(r => r.id === selectedRoomId);
    return selectedRoom ? selectedRoom.price * hotelData.nights : 0;
  };

  const getTaxesAndFees = () => {
    return getTotalPrice() * 0.12; // 12% taxes and fees
  };

  const getGrandTotal = () => {
    return getTotalPrice() + getTaxesAndFees();
  };

  // ===========================
  // RENDER
  // ===========================

  if (loading || !hotelData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading hotel details...</p>
        </div>
      </div>
    );
  }

  const selectedRoom = roomOptions.find(r => r.id === selectedRoomId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Auto-hides on scroll down */}
      <div
        className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm"
        style={{
          transform: scrollDirection === 'down' && !isAtTop ? 'translateY(-100%)' : 'translateY(0)',
          transition: 'transform 300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
          willChange: 'transform',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Hotel className="w-6 h-6 text-primary-500" />
              <h1 className="text-xl font-bold text-gray-900">Complete Your Booking</h1>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center gap-2">
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                      ${currentStep >= step
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                      }
                    `}
                  >
                    {step}
                  </div>
                  {step < 3 && <div className={`w-12 h-1 ${currentStep > step ? 'bg-primary-500' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>
          </div>

          {/* Step Labels */}
          <div className="flex justify-between mt-2 text-xs font-medium">
            <span className={currentStep === 1 ? 'text-primary-600' : 'text-gray-500'}>Room Selection</span>
            <span className={currentStep === 2 ? 'text-primary-600' : 'text-gray-500'}>Guest Details</span>
            <span className={currentStep === 3 ? 'text-primary-600' : 'text-gray-500'}>Payment</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column: Steps */}
          <div className="lg:col-span-2 space-y-4">
            {/* STEP 1: Room Selection */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-3 text-white">
                    <h2 className="text-base font-bold">Choose Your Room</h2>
                  </div>
                  <div className="p-4 space-y-4">
                    {roomOptions.map((room) => (
                      <div
                        key={room.id}
                        onClick={() => handleRoomSelect(room.id)}
                        className={`
                          p-4 rounded-lg border-2 cursor-pointer transition-all
                          ${selectedRoomId === room.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300'
                          }
                        `}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">{room.name}</h3>
                            <p className="text-sm text-gray-600">{room.description}</p>
                            <p className="text-sm text-gray-600 mt-1">{room.bedType} • Max {room.maxGuests} guests</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary-600">
                              {room.currency} {room.price}
                            </p>
                            <p className="text-xs text-gray-600">per night</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {room.amenities.map((amenity, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {amenity}
                            </span>
                          ))}
                        </div>

                        <div className="flex gap-3 text-sm">
                          {room.refundable && (
                            <span className="text-green-600 font-semibold">Free Cancellation</span>
                          )}
                          {room.breakfastIncluded && (
                            <span className="text-blue-600 font-semibold">Breakfast Included</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Guest Details */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-3 text-white">
                    <h2 className="text-base font-bold flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Guest Information
                    </h2>
                  </div>
                  <div className="p-4 space-y-6">
                    {guests.map((guest, index) => (
                      <div key={guest.id} className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-bold text-gray-900 mb-3">
                          {guest.type === 'adult' ? 'Adult' : 'Child'} {index + 1}
                          {index === 0 && ' (Primary Contact)'}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Title *
                            </label>
                            <select
                              value={guest.title}
                              onChange={(e) => handleGuestUpdate(guest.id, 'title', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                              <option value="">Select</option>
                              <option value="Mr">Mr</option>
                              <option value="Ms">Ms</option>
                              <option value="Mrs">Mrs</option>
                              <option value="Dr">Dr</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              First Name *
                            </label>
                            <input
                              type="text"
                              value={guest.firstName}
                              onChange={(e) => handleGuestUpdate(guest.id, 'firstName', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Last Name *
                            </label>
                            <input
                              type="text"
                              value={guest.lastName}
                              onChange={(e) => handleGuestUpdate(guest.id, 'lastName', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                          </div>

                          {guest.type === 'child' && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date of Birth *
                              </label>
                              <input
                                type="date"
                                value={guest.dateOfBirth || ''}
                                onChange={(e) => handleGuestUpdate(guest.id, 'dateOfBirth', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              />
                            </div>
                          )}

                          {index === 0 && (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Email *
                                </label>
                                <input
                                  type="email"
                                  value={guest.email || ''}
                                  onChange={(e) => handleGuestUpdate(guest.id, 'email', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Phone *
                                </label>
                                <input
                                  type="tel"
                                  value={guest.phone || ''}
                                  onChange={(e) => handleGuestUpdate(guest.id, 'phone', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                              </div>
                            </>
                          )}
                        </div>

                        {index === 0 && (
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Special Requests (Optional)
                            </label>
                            <textarea
                              value={guest.specialRequests || ''}
                              onChange={(e) => handleGuestUpdate(guest.id, 'specialRequests', e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              placeholder="e.g., Late check-in, high floor preference..."
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Payment */}
            {currentStep === 3 && (
              <div className="animate-fadeIn">
                <form onSubmit={handlePaymentSubmit} id="payment-form">
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-3 text-white">
                      <h2 className="text-base font-bold flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Payment Information
                      </h2>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-gray-600 mb-4">
                        This is a demo booking flow. Payment processing will be integrated when APIs are configured.
                      </p>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Card Number
                          </label>
                          <input
                            type="text"
                            placeholder="4242 4242 4242 4242"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Expiry Date
                            </label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              onChange={(e) => setPaymentData({ ...paymentData, expiry: e.target.value })}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              CVV
                            </label>
                            <input
                              type="text"
                              placeholder="123"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              onChange={(e) => setPaymentData({ ...paymentData, cvv: e.target.value })}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cardholder Name
                          </label>
                          <input
                            type="text"
                            placeholder="John Doe"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            onChange={(e) => setPaymentData({ ...paymentData, cardholderName: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-900">
                          <strong>Note:</strong> This is a demo environment. No actual payment will be processed.
                          When integrated with real APIs, this will process payments through Stripe or your configured payment gateway.
                        </p>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all text-sm
                  ${currentStep === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }
                `}
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              {currentStep < 3 ? (
                <button
                  onClick={handleContinue}
                  disabled={currentStep === 2 && !areGuestsComplete()}
                  className={`
                    flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm shadow-md transition-all
                    ${currentStep === 2 && !areGuestsComplete()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 hover:shadow-lg'
                    }
                  `}
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  form="payment-form"
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm shadow-md transition-all bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 hover:shadow-lg disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Complete Booking
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-24">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Booking Summary</h3>

              {/* Hotel Info */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                {hotelData.imageUrl && (
                  <img
                    src={hotelData.imageUrl}
                    alt={hotelData.hotelName}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}
                <h4 className="font-bold text-gray-900">{hotelData.hotelName}</h4>
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" />
                  {hotelData.location}
                </p>
                {hotelData.starRating && (
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: hotelData.starRating }).map((_, i) => (
                      <span key={i} className="text-yellow-500">★</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="mb-4 pb-4 border-b border-gray-200 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-gray-600">Check-in</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(hotelData.checkIn).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-gray-600">Check-out</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(hotelData.checkOut).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <UsersIcon className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-gray-600">Guests</p>
                    <p className="font-semibold text-gray-900">
                      {hotelData.guests.adults} Adults{hotelData.guests.children > 0 && `, ${hotelData.guests.children} Children`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Selected Room */}
              {selectedRoom && (
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Selected Room</p>
                  <p className="font-semibold text-gray-900">{selectedRoom.name}</p>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {selectedRoom?.currency} {selectedRoom?.price} x {hotelData.nights} nights
                  </span>
                  <span className="font-semibold text-gray-900">
                    {selectedRoom?.currency} {getTotalPrice().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taxes & Fees</span>
                  <span className="font-semibold text-gray-900">
                    {selectedRoom?.currency} {getTaxesAndFees().toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t-2 border-gray-300">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg text-gray-900">Total</span>
                  <span className="font-bold text-2xl text-primary-600">
                    {selectedRoom?.currency} {getGrandTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Price Lock Timer */}
              <div className="mt-4 p-3 bg-warning-50 border border-warning-300 rounded-lg">
                <p className="text-xs font-semibold text-warning-900 mb-1">
                  Price locked for:
                </p>
                <p className="text-2xl font-bold text-warning-600">
                  {String(priceLockTimer.minutes).padStart(2, '0')}:
                  {String(priceLockTimer.seconds).padStart(2, '0')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HotelBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    }>
      <HotelBookingContent />
    </Suspense>
  );
}
