"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ShoppingBag, RefreshCw, CreditCard, Star, Luggage, Armchair } from "lucide-react";
import { useState } from "react";

interface FareComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  fares: any[]; // Array of fare family objects
  onSelect: (fareId: number) => void;
  onAdd: (fareId: number) => void;
  selectedFareId: number;
}

export function FareComparisonModal({ isOpen, onClose, fares, onSelect, onAdd, selectedFareId }: FareComparisonModalProps) {
  if (!isOpen) return null;

  // Helper to get feature status
  const getFeatureStatus = (fare: any, feature: string) => {
    switch (feature) {
      case "checkedBags":
        return fare.bags?.quantity > 0 ? { label: `${fare.bags.quantity} Bag${fare.bags.quantity > 1 ? 's' : ''}`, check: true } : { label: "No Bags", check: false };
      case "carryOn":
        return { label: "Standard", check: true }; // Most have carry-on
      case "changes":
        return fare.changeable 
          ? (fare.changeFee ? { label: `$${fare.changeFee} Fee`, check: 'partial' } : { label: "Free", check: true })
          : { label: "Not Permitted", check: false };
      case "refunds":
        return fare.refundable ? { label: "Refundable", check: true } : { label: "Non-Ref", check: false };
      case "seat":
        return fare.amenities?.find((a: any) => a.description?.toLowerCase().includes("seat")) 
          ? { label: "Pick Seat", check: true } 
          : { label: "Assigned", check: false };
      default:
        return { label: "-", check: false };
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Compare Fare Families</h3>
                  <p className="text-xs text-gray-500">Select the best option for your client</p>
                </div>
                <button 
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Grid Content */}
              <div className="flex-1 overflow-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {fares.map((fare, idx) => {
                    const isSelected = selectedFareId === fare.id;
                    const isRecommended = fare.recommended;
                    
                    return (
                      <div 
                        key={fare.id || idx}
                        className={`relative rounded-xl border-2 transition-all flex flex-col ${
                          isSelected 
                            ? "border-indigo-500 bg-indigo-50/10 shadow-lg ring-4 ring-indigo-50" 
                            : "border-gray-100 hover:border-indigo-200 hover:shadow-md bg-white"
                        }`}
                      >
                         {/* Recommended Badge */}
                         {isRecommended && (
                           <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1 shadow-sm">
                             <Star className="w-3 h-3 fill-amber-500" /> RECOMMENDED
                           </div>
                         )}

                         {/* Header: Name + Price */}
                         <div className={`p-4 text-center rounded-t-lg ${isSelected ? 'bg-indigo-50/30' : 'bg-gray-50'}`}>
                           <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-1">
                             {fare.fareType || fare.cabin || "Standard"}
                           </h4>
                           <div className="text-2xl font-black text-gray-900">
                             ${Math.round(fare.price)}
                           </div>
                           <p className="text-[10px] text-gray-500">per person</p>
                         </div>

                         {/* Features List */}
                         <div className="flex-1 p-4 space-y-3">
                           {/* Bags */}
                           <FeatureRow 
                             icon={<Luggage className="w-3.5 h-3.5" />} 
                             label="Checked Bags" 
                             status={getFeatureStatus(fare, 'checkedBags')} 
                           />
                           {/* Carry-on */}
                           <FeatureRow 
                             icon={<ShoppingBag className="w-3.5 h-3.5" />} 
                             label="Carry-on" 
                             status={getFeatureStatus(fare, 'carryOn')} 
                           />
                           {/* Changes */}
                           <FeatureRow 
                             icon={<RefreshCw className="w-3.5 h-3.5" />} 
                             label="Changes" 
                             status={getFeatureStatus(fare, 'changes')} 
                           />
                           {/* Refunds */}
                           <FeatureRow 
                             icon={<CreditCard className="w-3.5 h-3.5" />} 
                             label="Refundable" 
                             status={getFeatureStatus(fare, 'refunds')} 
                           />
                           {/* Seat Selection */}
                           <FeatureRow 
                             icon={<Armchair className="w-3.5 h-3.5" />} 
                             label="Seat Selection" 
                             status={getFeatureStatus(fare, 'seat')} 
                           />
                         </div>

                         {/* Footer Action */}
                         <div className="p-4 border-t border-gray-100 bg-gray-50/30">
                           <button
                             onClick={() => {
                               onSelect(fare.id);
                               onAdd(fare.id);
                               onClose();
                             }}
                             className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
                               isSelected
                                 ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"
                                 : "bg-white text-gray-700 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                             }`}
                           >
                             {isSelected ? "Selected" : "Select Fare"}
                           </button>
                         </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function FeatureRow({ icon, label, status }: { icon: any, label: string, status: { label: string, check: boolean | 'partial' } }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-2 text-gray-500">
        {icon}
        <span>{label}</span>
      </div>
      <div className={`flex items-center gap-1 font-semibold ${
        status.check === true ? 'text-emerald-600' : 
        status.check === 'partial' ? 'text-amber-600' : 'text-gray-400'
      }`}>
        {status.check === true && <Check className="w-3 h-3" />}
        {status.check === false && <X className="w-3 h-3" />}
        <span>{status.label}</span>
      </div>
    </div>
  );
}
