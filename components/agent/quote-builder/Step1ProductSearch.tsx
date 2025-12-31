"use client";

import { useState } from "react";
import { QuoteData } from "../QuoteBuilder";
import { motion } from "framer-motion";
import { Plane, Building2, Car, Compass, Bus, Shield, Package, Plus, ExternalLink, Sparkles } from "lucide-react";
import {
  FlightEntryModal,
  HotelEntryModal,
  ActivityEntryModal,
  TransferEntryModal,
  CarRentalEntryModal,
  InsuranceEntryModal,
  CustomItemEntryModal,
} from "./ProductEntryModals";

interface Step1ProductSearchProps {
  quoteData: QuoteData;
  updateQuoteData: (data: Partial<QuoteData>) => void;
  onNext: () => void;
}

export default function QuoteBuilderStep1ProductSearch({
  quoteData,
  updateQuoteData,
  onNext,
}: Step1ProductSearchProps) {
  // Modal states
  const [flightModal, setFlightModal] = useState(false);
  const [hotelModal, setHotelModal] = useState(false);
  const [activityModal, setActivityModal] = useState(false);
  const [transferModal, setTransferModal] = useState(false);
  const [carModal, setCarModal] = useState(false);
  const [insuranceModal, setInsuranceModal] = useState(false);
  const [customModal, setCustomModal] = useState(false);

  const hasProducts =
    quoteData.flights.length > 0 ||
    quoteData.hotels.length > 0 ||
    quoteData.activities.length > 0 ||
    quoteData.transfers.length > 0 ||
    quoteData.carRentals.length > 0 ||
    quoteData.insurance.length > 0 ||
    quoteData.customItems.length > 0;

  const totalProducts =
    quoteData.flights.length +
    quoteData.hotels.length +
    quoteData.activities.length +
    quoteData.transfers.length +
    quoteData.carRentals.length +
    quoteData.insurance.length +
    quoteData.customItems.length;

  // Product handlers
  const handleAddFlight = (flight: any) => {
    updateQuoteData({
      flights: [...quoteData.flights, flight],
      flightsCost: quoteData.flightsCost + (flight.price || 0),
    });
  };

  const handleAddHotel = (hotel: any) => {
    updateQuoteData({
      hotels: [...quoteData.hotels, hotel],
      hotelsCost: quoteData.hotelsCost + (hotel.price || 0),
    });
  };

  const handleAddActivity = (activity: any) => {
    updateQuoteData({
      activities: [...quoteData.activities, activity],
      activitiesCost: quoteData.activitiesCost + (activity.price || 0),
    });
  };

  const handleAddTransfer = (transfer: any) => {
    updateQuoteData({
      transfers: [...quoteData.transfers, transfer],
      transfersCost: quoteData.transfersCost + (transfer.price || 0),
    });
  };

  const handleAddCar = (car: any) => {
    updateQuoteData({
      carRentals: [...quoteData.carRentals, car],
      carRentalsCost: quoteData.carRentalsCost + (car.price || 0),
    });
  };

  const handleAddInsurance = (insurance: any) => {
    updateQuoteData({
      insurance: [...quoteData.insurance, insurance],
      insuranceCost: quoteData.insuranceCost + (insurance.price || 0),
    });
  };

  const handleAddCustom = (item: any) => {
    updateQuoteData({
      customItems: [...quoteData.customItems, item],
      customItemsCost: quoteData.customItemsCost + (item.price || 0),
    });
  };

  // Product cards config
  const searchCards = [
    {
      type: "flights",
      title: "Flights",
      description: "Search and compare flights",
      icon: Plane,
      gradient: "from-blue-500 to-indigo-600",
      bgLight: "from-blue-50 to-indigo-50",
      border: "border-blue-200 hover:border-blue-400",
      searchUrl: "/flights?source=quote-builder",
      onAdd: () => setFlightModal(true),
      count: quoteData.flights.length,
    },
    {
      type: "hotels",
      title: "Hotels",
      description: "Find accommodations worldwide",
      icon: Building2,
      gradient: "from-purple-500 to-pink-600",
      bgLight: "from-purple-50 to-pink-50",
      border: "border-purple-200 hover:border-purple-400",
      searchUrl: "/hotels?source=quote-builder",
      onAdd: () => setHotelModal(true),
      count: quoteData.hotels.length,
    },
    {
      type: "cars",
      title: "Car Rentals",
      description: "Rent vehicles at destination",
      icon: Car,
      gradient: "from-cyan-500 to-blue-600",
      bgLight: "from-cyan-50 to-blue-50",
      border: "border-cyan-200 hover:border-cyan-400",
      searchUrl: "/cars?source=quote-builder",
      onAdd: () => setCarModal(true),
      count: quoteData.carRentals.length,
    },
    {
      type: "activities",
      title: "Tours & Activities",
      description: "Experiences and excursions",
      icon: Compass,
      gradient: "from-emerald-500 to-teal-600",
      bgLight: "from-emerald-50 to-teal-50",
      border: "border-emerald-200 hover:border-emerald-400",
      searchUrl: "/activities?source=quote-builder",
      onAdd: () => setActivityModal(true),
      count: quoteData.activities.length,
    },
    {
      type: "transfers",
      title: "Transfers",
      description: "Airport & point-to-point",
      icon: Bus,
      gradient: "from-amber-500 to-orange-600",
      bgLight: "from-amber-50 to-orange-50",
      border: "border-amber-200 hover:border-amber-400",
      searchUrl: null,
      onAdd: () => setTransferModal(true),
      count: quoteData.transfers.length,
    },
    {
      type: "insurance",
      title: "Insurance",
      description: "Travel protection plans",
      icon: Shield,
      gradient: "from-rose-500 to-pink-600",
      bgLight: "from-rose-50 to-pink-50",
      border: "border-rose-200 hover:border-rose-400",
      searchUrl: null,
      onAdd: () => setInsuranceModal(true),
      count: quoteData.insurance.length,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Sparkles className="w-7 h-7 text-violet-500" />
          Add Products to Quote
        </h2>
        <p className="text-gray-600">
          Search or manually add flights, hotels, activities, and more. Client info comes later!
        </p>
      </div>

      {/* Product Grid - Level 6 Apple-Class */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {searchCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`relative group bg-gradient-to-br ${card.bgLight} border-2 ${card.border} rounded-2xl p-5 transition-all hover:shadow-lg`}
            >
              {/* Count Badge */}
              {card.count > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-emerald-500 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-lg"
                >
                  {card.count}
                </motion.div>
              )}

              {/* Icon */}
              <div className={`w-12 h-12 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>

              {/* Title & Description */}
              <h3 className="font-bold text-gray-900 mb-1">{card.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{card.description}</p>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={card.onAdd}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r ${card.gradient} text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity`}
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
                {card.searchUrl && (
                  <a
                    href={card.searchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2.5 bg-white/80 border border-gray-200 rounded-lg hover:bg-white transition-colors"
                    title="Search"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-600" />
                  </a>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Custom Item Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative group bg-gradient-to-br from-gray-50 to-slate-100 border-2 border-gray-200 hover:border-gray-400 rounded-2xl p-5 transition-all hover:shadow-lg"
        >
          {quoteData.customItems.length > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 w-7 h-7 bg-emerald-500 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-lg"
            >
              {quoteData.customItems.length}
            </motion.div>
          )}
          <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
            <Package className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Custom Item</h3>
          <p className="text-sm text-gray-600 mb-4">Fees, visa, documents, etc.</p>
          <button
            onClick={() => setCustomModal(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-gray-700 to-gray-900 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Custom
          </button>
        </motion.div>
      </div>

      {/* Products Summary */}
      {hasProducts && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-3">
                {totalProducts} Product{totalProducts > 1 ? "s" : ""} Added
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                {quoteData.flights.length > 0 && (
                  <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-lg">
                    <Plane className="w-4 h-4 text-blue-600" />
                    <span>{quoteData.flights.length} Flight{quoteData.flights.length > 1 ? "s" : ""}</span>
                  </div>
                )}
                {quoteData.hotels.length > 0 && (
                  <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-lg">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    <span>{quoteData.hotels.length} Hotel{quoteData.hotels.length > 1 ? "s" : ""}</span>
                  </div>
                )}
                {quoteData.carRentals.length > 0 && (
                  <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-lg">
                    <Car className="w-4 h-4 text-cyan-600" />
                    <span>{quoteData.carRentals.length} Car{quoteData.carRentals.length > 1 ? "s" : ""}</span>
                  </div>
                )}
                {quoteData.activities.length > 0 && (
                  <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-lg">
                    <Compass className="w-4 h-4 text-emerald-600" />
                    <span>{quoteData.activities.length} Activity</span>
                  </div>
                )}
                {quoteData.transfers.length > 0 && (
                  <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-lg">
                    <Bus className="w-4 h-4 text-amber-600" />
                    <span>{quoteData.transfers.length} Transfer{quoteData.transfers.length > 1 ? "s" : ""}</span>
                  </div>
                )}
                {quoteData.insurance.length > 0 && (
                  <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-lg">
                    <Shield className="w-4 h-4 text-rose-600" />
                    <span>{quoteData.insurance.length} Insurance</span>
                  </div>
                )}
                {quoteData.customItems.length > 0 && (
                  <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-lg">
                    <Package className="w-4 h-4 text-gray-600" />
                    <span>{quoteData.customItems.length} Custom</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Pro Tips</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Click <strong>Add</strong> to enter product details manually</li>
              <li>• Click <ExternalLink className="w-3 h-3 inline" /> to search in our booking engine</li>
              <li>• You can add more products later in Step 3</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Cancel
        </button>

        <button
          onClick={onNext}
          className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-500/25 flex items-center gap-2"
        >
          {hasProducts ? `Continue (${totalProducts} items)` : "Skip for Now"}
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>

      {/* Modals */}
      <FlightEntryModal isOpen={flightModal} onClose={() => setFlightModal(false)} onSave={handleAddFlight} />
      <HotelEntryModal isOpen={hotelModal} onClose={() => setHotelModal(false)} onSave={handleAddHotel} />
      <ActivityEntryModal isOpen={activityModal} onClose={() => setActivityModal(false)} onSave={handleAddActivity} />
      <TransferEntryModal isOpen={transferModal} onClose={() => setTransferModal(false)} onSave={handleAddTransfer} />
      <CarRentalEntryModal isOpen={carModal} onClose={() => setCarModal(false)} onSave={handleAddCar} />
      <InsuranceEntryModal isOpen={insuranceModal} onClose={() => setInsuranceModal(false)} onSave={handleAddInsurance} />
      <CustomItemEntryModal isOpen={customModal} onClose={() => setCustomModal(false)} onSave={handleAddCustom} />
    </div>
  );
}
