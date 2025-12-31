"use client";

import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Plane, Building2, Compass, Car, Bus, Shield, Package } from "lucide-react";

// ===========================================
// FLIGHT ENTRY MODAL
// ===========================================
interface FlightData {
  id: string;
  type: "one-way" | "round-trip" | "multi-city";
  airline: string;
  flightNumber: string;
  origin: string;
  originCity: string;
  destination: string;
  destinationCity: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  cabin: "economy" | "premium_economy" | "business" | "first";
  passengers: number;
  price: number;
  returnFlight?: {
    flightNumber: string;
    departureDate: string;
    departureTime: string;
    arrivalDate: string;
    arrivalTime: string;
  };
}

interface FlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (flight: FlightData) => void;
  editData?: FlightData;
}

export function FlightEntryModal({ isOpen, onClose, onSave, editData }: FlightModalProps) {
  const [formData, setFormData] = useState<Partial<FlightData>>(editData || {
    type: "round-trip",
    cabin: "economy",
    passengers: 1,
    price: 0,
  });

  const handleSave = () => {
    if (!formData.airline || !formData.origin || !formData.destination || !formData.departureDate) {
      return;
    }
    onSave({
      id: editData?.id || `flight-${Date.now()}`,
      type: formData.type || "round-trip",
      airline: formData.airline || "",
      flightNumber: formData.flightNumber || "",
      origin: formData.origin || "",
      originCity: formData.originCity || "",
      destination: formData.destination || "",
      destinationCity: formData.destinationCity || "",
      departureDate: formData.departureDate || "",
      departureTime: formData.departureTime || "",
      arrivalDate: formData.arrivalDate || "",
      arrivalTime: formData.arrivalTime || "",
      cabin: formData.cabin || "economy",
      passengers: formData.passengers || 1,
      price: formData.price || 0,
      returnFlight: formData.type === "round-trip" ? formData.returnFlight : undefined,
    });
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Plane className="w-5 h-5 text-white" />
                    </div>
                    <Dialog.Title className="text-lg font-bold text-white">
                      {editData ? "Edit Flight" : "Add Flight"}
                    </Dialog.Title>
                  </div>
                  <button onClick={onClose} className="text-white/80 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                  {/* Flight Type */}
                  <div className="grid grid-cols-3 gap-2">
                    {["one-way", "round-trip", "multi-city"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setFormData({ ...formData, type: type as FlightData["type"] })}
                        className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                          formData.type === type
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {type.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase())}
                      </button>
                    ))}
                  </div>

                  {/* Airline & Flight Number */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Airline *</label>
                      <input
                        type="text"
                        value={formData.airline || ""}
                        onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
                        placeholder="e.g., United Airlines"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Flight Number</label>
                      <input
                        type="text"
                        value={formData.flightNumber || ""}
                        onChange={(e) => setFormData({ ...formData, flightNumber: e.target.value })}
                        placeholder="e.g., UA1234"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Origin & Destination */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">From (Airport Code) *</label>
                      <input
                        type="text"
                        value={formData.origin || ""}
                        onChange={(e) => setFormData({ ...formData, origin: e.target.value.toUpperCase() })}
                        placeholder="e.g., JFK"
                        maxLength={3}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">To (Airport Code) *</label>
                      <input
                        type="text"
                        value={formData.destination || ""}
                        onChange={(e) => setFormData({ ...formData, destination: e.target.value.toUpperCase() })}
                        placeholder="e.g., LAX"
                        maxLength={3}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                      />
                    </div>
                  </div>

                  {/* Departure */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Departure Date *</label>
                      <input
                        type="date"
                        value={formData.departureDate || ""}
                        onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Departure Time</label>
                      <input
                        type="time"
                        value={formData.departureTime || ""}
                        onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Return (if round-trip) */}
                  {formData.type === "round-trip" && (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-xl">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Return Date</label>
                        <input
                          type="date"
                          value={formData.returnFlight?.departureDate || ""}
                          onChange={(e) => setFormData({
                            ...formData,
                            returnFlight: { ...formData.returnFlight, departureDate: e.target.value } as any
                          })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Return Time</label>
                        <input
                          type="time"
                          value={formData.returnFlight?.departureTime || ""}
                          onChange={(e) => setFormData({
                            ...formData,
                            returnFlight: { ...formData.returnFlight, departureTime: e.target.value } as any
                          })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Cabin & Passengers */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cabin Class</label>
                      <select
                        value={formData.cabin || "economy"}
                        onChange={(e) => setFormData({ ...formData, cabin: e.target.value as FlightData["cabin"] })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="economy">Economy</option>
                        <option value="premium_economy">Premium Economy</option>
                        <option value="business">Business</option>
                        <option value="first">First Class</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Passengers</label>
                      <input
                        type="number"
                        min={1}
                        value={formData.passengers || 1}
                        onChange={(e) => setFormData({ ...formData, passengers: parseInt(e.target.value) })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Price (USD) *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={formData.price || ""}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
                  <button onClick={onClose} className="px-5 py-2.5 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!formData.airline || !formData.origin || !formData.destination || !formData.departureDate}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {editData ? "Update Flight" : "Add Flight"}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

// ===========================================
// HOTEL ENTRY MODAL
// ===========================================
interface HotelData {
  id: string;
  name: string;
  location: string;
  address: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  roomType: string;
  rooms: number;
  guests: number;
  starRating: number;
  amenities: string[];
  price: number;
  pricePerNight: number;
}

interface HotelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (hotel: HotelData) => void;
  editData?: HotelData;
}

export function HotelEntryModal({ isOpen, onClose, onSave, editData }: HotelModalProps) {
  const [formData, setFormData] = useState<Partial<HotelData>>(editData || {
    rooms: 1,
    guests: 2,
    starRating: 4,
    amenities: [],
    nights: 1,
  });

  const calculateNights = (checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return 0;
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleSave = () => {
    if (!formData.name || !formData.checkIn || !formData.checkOut) return;
    const nights = calculateNights(formData.checkIn, formData.checkOut);
    onSave({
      id: editData?.id || `hotel-${Date.now()}`,
      name: formData.name || "",
      location: formData.location || "",
      address: formData.address || "",
      checkIn: formData.checkIn || "",
      checkOut: formData.checkOut || "",
      nights,
      roomType: formData.roomType || "Standard",
      rooms: formData.rooms || 1,
      guests: formData.guests || 2,
      starRating: formData.starRating || 4,
      amenities: formData.amenities || [],
      price: formData.price || 0,
      pricePerNight: formData.price ? formData.price / nights : 0,
    });
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <Dialog.Title className="text-lg font-bold text-white">
                      {editData ? "Edit Hotel" : "Add Hotel"}
                    </Dialog.Title>
                  </div>
                  <button onClick={onClose} className="text-white/80 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                  {/* Hotel Name & Location */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Name *</label>
                      <input
                        type="text"
                        value={formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Marriott Downtown"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={formData.location || ""}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g., New York, NY"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {/* Star Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Star Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setFormData({ ...formData, starRating: star })}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                            (formData.starRating || 0) >= star ? "bg-yellow-400 text-white" : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date *</label>
                      <input
                        type="date"
                        value={formData.checkIn || ""}
                        onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date *</label>
                      <input
                        type="date"
                        value={formData.checkOut || ""}
                        onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {/* Room Details */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                      <select
                        value={formData.roomType || "Standard"}
                        onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option>Standard</option>
                        <option>Deluxe</option>
                        <option>Suite</option>
                        <option>Executive Suite</option>
                        <option>Presidential Suite</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rooms</label>
                      <input
                        type="number"
                        min={1}
                        value={formData.rooms || 1}
                        onChange={(e) => setFormData({ ...formData, rooms: parseInt(e.target.value) })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
                      <input
                        type="number"
                        min={1}
                        value={formData.guests || 2}
                        onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Price (USD) *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={formData.price || ""}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    {formData.checkIn && formData.checkOut && formData.price && (
                      <p className="text-sm text-gray-500 mt-1">
                        ${(formData.price / calculateNights(formData.checkIn, formData.checkOut)).toFixed(2)}/night × {calculateNights(formData.checkIn, formData.checkOut)} nights
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
                  <button onClick={onClose} className="px-5 py-2.5 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!formData.name || !formData.checkIn || !formData.checkOut}
                    className="px-5 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {editData ? "Update Hotel" : "Add Hotel"}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

// ===========================================
// ACTIVITY ENTRY MODAL
// ===========================================
interface ActivityData {
  id: string;
  name: string;
  type: string;
  location: string;
  date: string;
  time: string;
  duration: string;
  participants: number;
  description: string;
  price: number;
}

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: ActivityData) => void;
  editData?: ActivityData;
}

export function ActivityEntryModal({ isOpen, onClose, onSave, editData }: ActivityModalProps) {
  const [formData, setFormData] = useState<Partial<ActivityData>>(editData || {
    type: "Tour",
    participants: 2,
  });

  const handleSave = () => {
    if (!formData.name || !formData.date) return;
    onSave({
      id: editData?.id || `activity-${Date.now()}`,
      name: formData.name || "",
      type: formData.type || "Tour",
      location: formData.location || "",
      date: formData.date || "",
      time: formData.time || "",
      duration: formData.duration || "",
      participants: formData.participants || 2,
      description: formData.description || "",
      price: formData.price || 0,
    });
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Compass className="w-5 h-5 text-white" />
                    </div>
                    <Dialog.Title className="text-lg font-bold text-white">
                      {editData ? "Edit Activity" : "Add Activity"}
                    </Dialog.Title>
                  </div>
                  <button onClick={onClose} className="text-white/80 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Activity Name *</label>
                    <input
                      type="text"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., City Walking Tour"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={formData.type || "Tour"}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      >
                        <option>Tour</option>
                        <option>Excursion</option>
                        <option>Adventure</option>
                        <option>Cultural</option>
                        <option>Food & Drink</option>
                        <option>Entertainment</option>
                        <option>Wellness</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={formData.location || ""}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g., Paris, France"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                      <input
                        type="date"
                        value={formData.date || ""}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                      <input
                        type="time"
                        value={formData.time || ""}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                      <input
                        type="text"
                        value={formData.duration || ""}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        placeholder="e.g., 3 hours"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Participants</label>
                      <input
                        type="number"
                        min={1}
                        value={formData.participants || 2}
                        onChange={(e) => setFormData({ ...formData, participants: parseInt(e.target.value) })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Price *</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          min={0}
                          value={formData.price || ""}
                          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                          className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
                  <button onClick={onClose} className="px-5 py-2.5 text-gray-700 hover:bg-gray-200 rounded-lg font-medium">Cancel</button>
                  <button
                    onClick={handleSave}
                    disabled={!formData.name || !formData.date}
                    className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editData ? "Update" : "Add Activity"}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

// ===========================================
// TRANSFER ENTRY MODAL
// ===========================================
interface TransferData {
  id: string;
  type: "airport" | "hotel" | "point-to-point";
  pickupLocation: string;
  dropoffLocation: string;
  date: string;
  time: string;
  passengers: number;
  vehicleType: string;
  price: number;
}

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transfer: TransferData) => void;
  editData?: TransferData;
}

export function TransferEntryModal({ isOpen, onClose, onSave, editData }: TransferModalProps) {
  const [formData, setFormData] = useState<Partial<TransferData>>(editData || {
    type: "airport",
    passengers: 2,
    vehicleType: "Sedan",
  });

  const handleSave = () => {
    if (!formData.pickupLocation || !formData.dropoffLocation || !formData.date) return;
    onSave({
      id: editData?.id || `transfer-${Date.now()}`,
      type: formData.type || "airport",
      pickupLocation: formData.pickupLocation || "",
      dropoffLocation: formData.dropoffLocation || "",
      date: formData.date || "",
      time: formData.time || "",
      passengers: formData.passengers || 2,
      vehicleType: formData.vehicleType || "Sedan",
      price: formData.price || 0,
    });
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Bus className="w-5 h-5 text-white" />
                    </div>
                    <Dialog.Title className="text-lg font-bold text-white">
                      {editData ? "Edit Transfer" : "Add Transfer"}
                    </Dialog.Title>
                  </div>
                  <button onClick={onClose} className="text-white/80 hover:text-white"><X className="w-6 h-6" /></button>
                </div>

                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-3 gap-2">
                    {["airport", "hotel", "point-to-point"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setFormData({ ...formData, type: type as TransferData["type"] })}
                        className={`py-2 px-3 rounded-lg text-sm font-medium ${formData.type === type ? "bg-amber-600 text-white" : "bg-gray-100 text-gray-700"}`}
                      >
                        {type.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase())}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pickup *</label>
                      <input type="text" value={formData.pickupLocation || ""} onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })} placeholder="e.g., JFK Airport" className="w-full px-4 py-2.5 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dropoff *</label>
                      <input type="text" value={formData.dropoffLocation || ""} onChange={(e) => setFormData({ ...formData, dropoffLocation: e.target.value })} placeholder="e.g., Manhattan Hotel" className="w-full px-4 py-2.5 border rounded-lg" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                      <input type="date" value={formData.date || ""} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                      <input type="time" value={formData.time || ""} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
                      <select value={formData.vehicleType || "Sedan"} onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg">
                        <option>Sedan</option>
                        <option>SUV</option>
                        <option>Van</option>
                        <option>Luxury</option>
                        <option>Minibus</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Passengers</label>
                      <input type="number" min={1} value={formData.passengers || 2} onChange={(e) => setFormData({ ...formData, passengers: parseInt(e.target.value) })} className="w-full px-4 py-2.5 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input type="number" min={0} value={formData.price || ""} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })} className="w-full pl-7 pr-4 py-2.5 border rounded-lg" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                  <button onClick={onClose} className="px-5 py-2.5 text-gray-700 hover:bg-gray-200 rounded-lg font-medium">Cancel</button>
                  <button onClick={handleSave} disabled={!formData.pickupLocation || !formData.dropoffLocation || !formData.date} className="px-5 py-2.5 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    {editData ? "Update" : "Add Transfer"}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

// ===========================================
// CAR RENTAL ENTRY MODAL
// ===========================================
interface CarRentalData {
  id: string;
  company: string;
  carType: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  dropoffDate: string;
  dropoffTime: string;
  days: number;
  price: number;
}

interface CarRentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (car: CarRentalData) => void;
  editData?: CarRentalData;
}

export function CarRentalEntryModal({ isOpen, onClose, onSave, editData }: CarRentalModalProps) {
  const [formData, setFormData] = useState<Partial<CarRentalData>>(editData || {
    carType: "Compact",
  });

  const calculateDays = (pickup: string, dropoff: string) => {
    if (!pickup || !dropoff) return 0;
    const diff = new Date(dropoff).getTime() - new Date(pickup).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const handleSave = () => {
    if (!formData.company || !formData.pickupLocation || !formData.pickupDate || !formData.dropoffDate) return;
    onSave({
      id: editData?.id || `car-${Date.now()}`,
      company: formData.company || "",
      carType: formData.carType || "Compact",
      pickupLocation: formData.pickupLocation || "",
      dropoffLocation: formData.dropoffLocation || formData.pickupLocation || "",
      pickupDate: formData.pickupDate || "",
      pickupTime: formData.pickupTime || "",
      dropoffDate: formData.dropoffDate || "",
      dropoffTime: formData.dropoffTime || "",
      days: calculateDays(formData.pickupDate || "", formData.dropoffDate || ""),
      price: formData.price || 0,
    });
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Car className="w-5 h-5 text-white" />
                    </div>
                    <Dialog.Title className="text-lg font-bold text-white">{editData ? "Edit Car Rental" : "Add Car Rental"}</Dialog.Title>
                  </div>
                  <button onClick={onClose} className="text-white/80 hover:text-white"><X className="w-6 h-6" /></button>
                </div>

                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                      <input type="text" value={formData.company || ""} onChange={(e) => setFormData({ ...formData, company: e.target.value })} placeholder="e.g., Hertz, Enterprise" className="w-full px-4 py-2.5 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Car Type</label>
                      <select value={formData.carType || "Compact"} onChange={(e) => setFormData({ ...formData, carType: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg">
                        <option>Economy</option>
                        <option>Compact</option>
                        <option>Midsize</option>
                        <option>Full-size</option>
                        <option>SUV</option>
                        <option>Luxury</option>
                        <option>Van</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location *</label>
                      <input type="text" value={formData.pickupLocation || ""} onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })} placeholder="e.g., LAX Airport" className="w-full px-4 py-2.5 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dropoff Location</label>
                      <input type="text" value={formData.dropoffLocation || ""} onChange={(e) => setFormData({ ...formData, dropoffLocation: e.target.value })} placeholder="Same as pickup" className="w-full px-4 py-2.5 border rounded-lg" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date *</label>
                      <input type="date" value={formData.pickupDate || ""} onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dropoff Date *</label>
                      <input type="date" value={formData.dropoffDate || ""} onChange={(e) => setFormData({ ...formData, dropoffDate: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Price *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input type="number" min={0} value={formData.price || ""} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })} className="w-full pl-8 pr-4 py-2.5 border rounded-lg" />
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                  <button onClick={onClose} className="px-5 py-2.5 text-gray-700 hover:bg-gray-200 rounded-lg font-medium">Cancel</button>
                  <button onClick={handleSave} disabled={!formData.company || !formData.pickupLocation || !formData.pickupDate || !formData.dropoffDate} className="px-5 py-2.5 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    {editData ? "Update" : "Add Car Rental"}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

// ===========================================
// INSURANCE ENTRY MODAL
// ===========================================
interface InsuranceData {
  id: string;
  provider: string;
  planName: string;
  coverage: string;
  travelers: number;
  startDate: string;
  endDate: string;
  price: number;
}

interface InsuranceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (insurance: InsuranceData) => void;
  editData?: InsuranceData;
}

export function InsuranceEntryModal({ isOpen, onClose, onSave, editData }: InsuranceModalProps) {
  const [formData, setFormData] = useState<Partial<InsuranceData>>(editData || {
    coverage: "Basic",
    travelers: 2,
  });

  const handleSave = () => {
    if (!formData.provider || !formData.planName) return;
    onSave({
      id: editData?.id || `insurance-${Date.now()}`,
      provider: formData.provider || "",
      planName: formData.planName || "",
      coverage: formData.coverage || "Basic",
      travelers: formData.travelers || 2,
      startDate: formData.startDate || "",
      endDate: formData.endDate || "",
      price: formData.price || 0,
    });
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-rose-500 to-pink-600 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <Dialog.Title className="text-lg font-bold text-white">{editData ? "Edit Insurance" : "Add Insurance"}</Dialog.Title>
                  </div>
                  <button onClick={onClose} className="text-white/80 hover:text-white"><X className="w-6 h-6" /></button>
                </div>

                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Provider *</label>
                      <input type="text" value={formData.provider || ""} onChange={(e) => setFormData({ ...formData, provider: e.target.value })} placeholder="e.g., Allianz, World Nomads" className="w-full px-4 py-2.5 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name *</label>
                      <input type="text" value={formData.planName || ""} onChange={(e) => setFormData({ ...formData, planName: e.target.value })} placeholder="e.g., Travel Basic" className="w-full px-4 py-2.5 border rounded-lg" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Coverage</label>
                      <select value={formData.coverage || "Basic"} onChange={(e) => setFormData({ ...formData, coverage: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg">
                        <option>Basic</option>
                        <option>Standard</option>
                        <option>Premium</option>
                        <option>Comprehensive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Travelers</label>
                      <input type="number" min={1} value={formData.travelers || 2} onChange={(e) => setFormData({ ...formData, travelers: parseInt(e.target.value) })} className="w-full px-4 py-2.5 border rounded-lg" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Price *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input type="number" min={0} value={formData.price || ""} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })} className="w-full pl-8 pr-4 py-2.5 border rounded-lg" />
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                  <button onClick={onClose} className="px-5 py-2.5 text-gray-700 hover:bg-gray-200 rounded-lg font-medium">Cancel</button>
                  <button onClick={handleSave} disabled={!formData.provider || !formData.planName} className="px-5 py-2.5 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    {editData ? "Update" : "Add Insurance"}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

// ===========================================
// CUSTOM ITEM ENTRY MODAL
// ===========================================
interface CustomItemData {
  id: string;
  name: string;
  category: string;
  description: string;
  quantity: number;
  price: number;
}

interface CustomItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: CustomItemData) => void;
  editData?: CustomItemData;
}

export function CustomItemEntryModal({ isOpen, onClose, onSave, editData }: CustomItemModalProps) {
  const [formData, setFormData] = useState<Partial<CustomItemData>>(editData || {
    category: "Other",
    quantity: 1,
  });

  const handleSave = () => {
    if (!formData.name) return;
    onSave({
      id: editData?.id || `custom-${Date.now()}`,
      name: formData.name || "",
      category: formData.category || "Other",
      description: formData.description || "",
      quantity: formData.quantity || 1,
      price: formData.price || 0,
    });
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-gray-700 to-gray-900 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <Dialog.Title className="text-lg font-bold text-white">{editData ? "Edit Item" : "Add Custom Item"}</Dialog.Title>
                  </div>
                  <button onClick={onClose} className="text-white/80 hover:text-white"><X className="w-6 h-6" /></button>
                </div>

                <div className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                    <input type="text" value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Visa Processing Fee" className="w-full px-4 py-2.5 border rounded-lg" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select value={formData.category || "Other"} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg">
                        <option>Service Fee</option>
                        <option>Visa</option>
                        <option>Travel Document</option>
                        <option>Equipment Rental</option>
                        <option>Guide Service</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <input type="number" min={1} value={formData.quantity || 1} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })} className="w-full px-4 py-2.5 border rounded-lg" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Optional details..." rows={2} className="w-full px-4 py-2.5 border rounded-lg resize-none" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input type="number" min={0} value={formData.price || ""} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })} className="w-full pl-8 pr-4 py-2.5 border rounded-lg" />
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                  <button onClick={onClose} className="px-5 py-2.5 text-gray-700 hover:bg-gray-200 rounded-lg font-medium">Cancel</button>
                  <button onClick={handleSave} disabled={!formData.name} className="px-5 py-2.5 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed">
                    {editData ? "Update" : "Add Item"}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
