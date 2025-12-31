"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { QuoteData } from "../QuoteBuilder";
import { Plane, Building2, Car, Compass, Bus, Shield, Package, Plus, Edit2, Trash2, DollarSign } from "lucide-react";
import {
  FlightEntryModal,
  HotelEntryModal,
  ActivityEntryModal,
  TransferEntryModal,
  CarRentalEntryModal,
  InsuranceEntryModal,
  CustomItemEntryModal,
} from "./ProductEntryModals";

interface Step3ProductsProps {
  quoteData: QuoteData;
  updateQuoteData: (data: Partial<QuoteData>) => void;
  products: Array<any>;
  suppliers: Array<any>;
  onNext: () => void;
  onPrev: () => void;
}

export default function QuoteBuilderStep3Products({
  quoteData,
  updateQuoteData,
  onNext,
  onPrev,
}: Step3ProductsProps) {
  // Modal states
  const [flightModal, setFlightModal] = useState(false);
  const [hotelModal, setHotelModal] = useState(false);
  const [activityModal, setActivityModal] = useState(false);
  const [transferModal, setTransferModal] = useState(false);
  const [carModal, setCarModal] = useState(false);
  const [insuranceModal, setInsuranceModal] = useState(false);
  const [customModal, setCustomModal] = useState(false);

  // Edit states
  const [editItem, setEditItem] = useState<any>(null);
  const [editIndex, setEditIndex] = useState<number>(-1);
  const [editType, setEditType] = useState<string>("");

  const totalItems =
    quoteData.flights.length +
    quoteData.hotels.length +
    quoteData.activities.length +
    quoteData.transfers.length +
    quoteData.carRentals.length +
    quoteData.insurance.length +
    quoteData.customItems.length;

  const totalCost =
    quoteData.flightsCost +
    quoteData.hotelsCost +
    quoteData.activitiesCost +
    quoteData.transfersCost +
    quoteData.carRentalsCost +
    quoteData.insuranceCost +
    quoteData.customItemsCost;

  // Generic handlers
  const handleAdd = (type: string, item: any) => {
    const key = type === "car" ? "carRentals" : type === "custom" ? "customItems" : `${type}s`;
    const costKey = type === "car" ? "carRentalsCost" : type === "custom" ? "customItemsCost" : `${type}sCost`;
    updateQuoteData({
      [key]: [...(quoteData as any)[key], item],
      [costKey]: (quoteData as any)[costKey] + (item.price || 0),
    });
  };

  const handleUpdate = (type: string, index: number, item: any) => {
    const key = type === "car" ? "carRentals" : type === "custom" ? "customItems" : `${type}s`;
    const costKey = type === "car" ? "carRentalsCost" : type === "custom" ? "customItemsCost" : `${type}sCost`;
    const items = [...(quoteData as any)[key]];
    const oldPrice = items[index]?.price || 0;
    items[index] = item;
    updateQuoteData({
      [key]: items,
      [costKey]: (quoteData as any)[costKey] - oldPrice + (item.price || 0),
    });
    setEditItem(null);
    setEditIndex(-1);
    setEditType("");
  };

  const handleDelete = (type: string, index: number) => {
    const key = type === "car" ? "carRentals" : type === "custom" ? "customItems" : `${type}s`;
    const costKey = type === "car" ? "carRentalsCost" : type === "custom" ? "customItemsCost" : `${type}sCost`;
    const items = (quoteData as any)[key];
    const deletedPrice = items[index]?.price || 0;
    updateQuoteData({
      [key]: items.filter((_: any, i: number) => i !== index),
      [costKey]: (quoteData as any)[costKey] - deletedPrice,
    });
  };

  const openEdit = (type: string, index: number) => {
    const key = type === "car" ? "carRentals" : type === "custom" ? "customItems" : `${type}s`;
    setEditItem((quoteData as any)[key][index]);
    setEditIndex(index);
    setEditType(type);
    // Open appropriate modal
    if (type === "flight") setFlightModal(true);
    else if (type === "hotel") setHotelModal(true);
    else if (type === "activity") setActivityModal(true);
    else if (type === "transfer") setTransferModal(true);
    else if (type === "car") setCarModal(true);
    else if (type === "insurance") setInsuranceModal(true);
    else if (type === "custom") setCustomModal(true);
  };

  // Product card component
  const ProductCard = ({ item, type, index, icon: Icon, gradient }: any) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">
            {item.name || item.airline || item.company || item.provider || "Item"}
          </h4>
          <p className="text-sm text-gray-500 truncate">
            {item.destination || item.location || item.pickupLocation || item.planName || item.category || ""}
          </p>
          <p className="text-sm font-bold text-emerald-600 mt-1">
            ${(item.price || 0).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => openEdit(type, index)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(type, index)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );

  // Section component
  const ProductSection = ({ title, items, type, icon: Icon, gradient, onAdd }: any) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {items.length > 0 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
              {items.length}
            </span>
          )}
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>
      {items.length > 0 ? (
        <div className="grid gap-2">
          {items.map((item: any, index: number) => (
            <ProductCard key={item.id || index} item={item} type={type} index={index} icon={Icon} gradient={gradient} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic py-2">No {title.toLowerCase()} added</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Package className="w-7 h-7 text-teal-500" />
          Review & Add Products
        </h2>
        <p className="text-gray-600">
          Edit, add, or remove products from your quote. All products you added in Step 1 appear here.
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Products Cost</p>
              <p className="text-2xl font-bold text-gray-900">${totalCost.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-emerald-600">{totalItems}</p>
            <p className="text-sm text-gray-500">items</p>
          </div>
        </div>
      </div>

      {/* Product Sections */}
      <div className="space-y-6">
        <ProductSection
          title="Flights"
          items={quoteData.flights}
          type="flight"
          icon={Plane}
          gradient="from-blue-500 to-indigo-600"
          onAdd={() => { setEditItem(null); setFlightModal(true); }}
        />
        <ProductSection
          title="Hotels"
          items={quoteData.hotels}
          type="hotel"
          icon={Building2}
          gradient="from-purple-500 to-pink-600"
          onAdd={() => { setEditItem(null); setHotelModal(true); }}
        />
        <ProductSection
          title="Car Rentals"
          items={quoteData.carRentals}
          type="car"
          icon={Car}
          gradient="from-cyan-500 to-blue-600"
          onAdd={() => { setEditItem(null); setCarModal(true); }}
        />
        <ProductSection
          title="Tours & Activities"
          items={quoteData.activities}
          type="activity"
          icon={Compass}
          gradient="from-emerald-500 to-teal-600"
          onAdd={() => { setEditItem(null); setActivityModal(true); }}
        />
        <ProductSection
          title="Transfers"
          items={quoteData.transfers}
          type="transfer"
          icon={Bus}
          gradient="from-amber-500 to-orange-600"
          onAdd={() => { setEditItem(null); setTransferModal(true); }}
        />
        <ProductSection
          title="Insurance"
          items={quoteData.insurance}
          type="insurance"
          icon={Shield}
          gradient="from-rose-500 to-pink-600"
          onAdd={() => { setEditItem(null); setInsuranceModal(true); }}
        />
        <ProductSection
          title="Custom Items"
          items={quoteData.customItems}
          type="custom"
          icon={Package}
          gradient="from-gray-600 to-gray-800"
          onAdd={() => { setEditItem(null); setCustomModal(true); }}
        />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button
          onClick={onPrev}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        <button
          onClick={onNext}
          className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-500/25 flex items-center gap-2"
        >
          Next: Pricing
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>

      {/* Modals */}
      <FlightEntryModal
        isOpen={flightModal}
        onClose={() => { setFlightModal(false); setEditItem(null); }}
        onSave={(item) => editType === "flight" && editIndex >= 0 ? handleUpdate("flight", editIndex, item) : handleAdd("flight", item)}
        editData={editType === "flight" ? editItem : undefined}
      />
      <HotelEntryModal
        isOpen={hotelModal}
        onClose={() => { setHotelModal(false); setEditItem(null); }}
        onSave={(item) => editType === "hotel" && editIndex >= 0 ? handleUpdate("hotel", editIndex, item) : handleAdd("hotel", item)}
        editData={editType === "hotel" ? editItem : undefined}
      />
      <ActivityEntryModal
        isOpen={activityModal}
        onClose={() => { setActivityModal(false); setEditItem(null); }}
        onSave={(item) => editType === "activity" && editIndex >= 0 ? handleUpdate("activity", editIndex, item) : handleAdd("activity", item)}
        editData={editType === "activity" ? editItem : undefined}
      />
      <TransferEntryModal
        isOpen={transferModal}
        onClose={() => { setTransferModal(false); setEditItem(null); }}
        onSave={(item) => editType === "transfer" && editIndex >= 0 ? handleUpdate("transfer", editIndex, item) : handleAdd("transfer", item)}
        editData={editType === "transfer" ? editItem : undefined}
      />
      <CarRentalEntryModal
        isOpen={carModal}
        onClose={() => { setCarModal(false); setEditItem(null); }}
        onSave={(item) => editType === "car" && editIndex >= 0 ? handleUpdate("car", editIndex, item) : handleAdd("car", item)}
        editData={editType === "car" ? editItem : undefined}
      />
      <InsuranceEntryModal
        isOpen={insuranceModal}
        onClose={() => { setInsuranceModal(false); setEditItem(null); }}
        onSave={(item) => editType === "insurance" && editIndex >= 0 ? handleUpdate("insurance", editIndex, item) : handleAdd("insurance", item)}
        editData={editType === "insurance" ? editItem : undefined}
      />
      <CustomItemEntryModal
        isOpen={customModal}
        onClose={() => { setCustomModal(false); setEditItem(null); }}
        onSave={(item) => editType === "custom" && editIndex >= 0 ? handleUpdate("custom", editIndex, item) : handleAdd("custom", item)}
        editData={editType === "custom" ? editItem : undefined}
      />
    </div>
  );
}
