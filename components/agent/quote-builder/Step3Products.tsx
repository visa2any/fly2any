"use client";

import { useState } from "react";
import { QuoteData } from "../QuoteBuilder";

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
  products,
  suppliers,
  onNext,
  onPrev,
}: Step3ProductsProps) {
  const [activeTab, setActiveTab] = useState<"flights" | "hotels" | "activities" | "transfers" | "cars" | "insurance" | "custom">("flights");

  const tabs = [
    { id: "flights", name: "Flights", icon: "✈️", count: quoteData.flights.length },
    { id: "hotels", name: "Hotels", icon: "🏨", count: quoteData.hotels.length },
    { id: "activities", name: "Activities", icon: "🎯", count: quoteData.activities.length },
    { id: "transfers", name: "Transfers", icon: "🚗", count: quoteData.transfers.length },
    { id: "cars", name: "Car Rentals", icon: "🚙", count: quoteData.carRentals.length },
    { id: "insurance", name: "Insurance", icon: "🛡️", count: quoteData.insurance.length },
    { id: "custom", name: "Custom Items", icon: "📝", count: quoteData.customItems.length },
  ];

  const totalItems =
    quoteData.flights.length +
    quoteData.hotels.length +
    quoteData.activities.length +
    quoteData.transfers.length +
    quoteData.carRentals.length +
    quoteData.insurance.length +
    quoteData.customItems.length;

  // Functions to add/remove items
  const addFlight = (flight: any) => {
    updateQuoteData({ flights: [...quoteData.flights, flight] });
  };

  const removeFlight = (index: number) => {
    updateQuoteData({ flights: quoteData.flights.filter((_, i) => i !== index) });
  };

  const addHotel = (hotel: any) => {
    updateQuoteData({ hotels: [...quoteData.hotels, hotel] });
  };

  const removeHotel = (index: number) => {
    updateQuoteData({ hotels: quoteData.hotels.filter((_, i) => i !== index) });
  };

  const addActivity = (activity: any) => {
    updateQuoteData({ activities: [...quoteData.activities, activity] });
  };

  const removeActivity = (index: number) => {
    updateQuoteData({ activities: quoteData.activities.filter((_, i) => i !== index) });
  };

  const addTransfer = (transfer: any) => {
    updateQuoteData({ transfers: [...quoteData.transfers, transfer] });
  };

  const removeTransfer = (index: number) => {
    updateQuoteData({ transfers: quoteData.transfers.filter((_, i) => i !== index) });
  };

  const addCarRental = (car: any) => {
    updateQuoteData({ carRentals: [...quoteData.carRentals, car] });
  };

  const removeCarRental = (index: number) => {
    updateQuoteData({ carRentals: quoteData.carRentals.filter((_, i) => i !== index) });
  };

  const addInsurance = (insurance: any) => {
    updateQuoteData({ insurance: [...quoteData.insurance, insurance] });
  };

  const removeInsurance = (index: number) => {
    updateQuoteData({ insurance: quoteData.insurance.filter((_, i) => i !== index) });
  };

  const addCustomItem = (item: any) => {
    updateQuoteData({ customItems: [...quoteData.customItems, item] });
  };

  const removeCustomItem = (index: number) => {
    updateQuoteData({ customItems: quoteData.customItems.filter((_, i) => i !== index) });
  };

  const handleNext = () => {
    // Can proceed without products (will show warning later)
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Products</h2>
        <p className="text-gray-600">
          Build your quote by adding flights, hotels, activities, and more
        </p>
      </div>

      {/* Product Count Summary */}
      {totalItems > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-900">
                {totalItems} {totalItems === 1 ? "item" : "items"} added to quote
              </span>
            </div>
            <span className="text-xs text-gray-600">You can add more items or proceed to pricing</span>
          </div>
        </div>
      )}

      {/* Product Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
              {tab.count > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === "flights" && (
          <FlightsTab
            flights={quoteData.flights}
            addFlight={addFlight}
            removeFlight={removeFlight}
            tripData={{
              destination: quoteData.destination,
              startDate: quoteData.startDate,
              endDate: quoteData.endDate,
              travelers: quoteData.travelers,
            }}
          />
        )}

        {activeTab === "hotels" && (
          <HotelsTab
            hotels={quoteData.hotels}
            addHotel={addHotel}
            removeHotel={removeHotel}
            tripData={{
              destination: quoteData.destination,
              startDate: quoteData.startDate,
              endDate: quoteData.endDate,
              travelers: quoteData.travelers,
            }}
          />
        )}

        {activeTab === "activities" && (
          <ProductCatalogTab
            type="ACTIVITY"
            items={quoteData.activities}
            products={products.filter(p => p.productType === "ACTIVITY")}
            addItem={addActivity}
            removeItem={removeActivity}
          />
        )}

        {activeTab === "transfers" && (
          <ProductCatalogTab
            type="TRANSFER"
            items={quoteData.transfers}
            products={products.filter(p => p.productType === "TRANSFER")}
            addItem={addTransfer}
            removeItem={removeTransfer}
          />
        )}

        {activeTab === "cars" && (
          <ProductCatalogTab
            type="CAR_RENTAL"
            items={quoteData.carRentals}
            products={products.filter(p => p.productType === "CAR_RENTAL")}
            addItem={addCarRental}
            removeItem={removeCarRental}
          />
        )}

        {activeTab === "insurance" && (
          <ProductCatalogTab
            type="INSURANCE"
            items={quoteData.insurance}
            products={products.filter(p => p.productType === "INSURANCE")}
            addItem={addInsurance}
            removeItem={removeInsurance}
          />
        )}

        {activeTab === "custom" && (
          <CustomItemsTab
            items={quoteData.customItems}
            addItem={addCustomItem}
            removeItem={removeCustomItem}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          onClick={onPrev}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-medium hover:from-primary-700 hover:to-primary-800 transition-all shadow-sm"
        >
          Next: Pricing →
        </button>
      </div>
    </div>
  );
}

// Sub-components for each tab
function FlightsTab({ flights, addFlight, removeFlight, tripData }: any) {
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualFlight, setManualFlight] = useState({
    name: "",
    description: "",
    price: 0,
  });

  const handleAdd = () => {
    if (!manualFlight.name.trim()) {
      alert("Please enter flight details");
      return;
    }
    addFlight(manualFlight);
    setManualFlight({ name: "", description: "", price: 0 });
    setShowManualEntry(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          💡 <strong>Tip:</strong> Flight search integration coming soon! For now, manually enter flight details or cost.
        </p>
      </div>

      {/* Added Flights */}
      {flights.length > 0 && (
        <div className="space-y-3">
          {flights.map((flight: any, index: number) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{flight.name}</p>
                {flight.description && <p className="text-sm text-gray-600 mt-1">{flight.description}</p>}
                <p className="text-sm font-semibold text-primary-600 mt-2">${flight.price.toLocaleString()}</p>
              </div>
              <button
                onClick={() => removeFlight(index)}
                className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Manual Entry Form */}
      {showManualEntry ? (
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Flight Details *</label>
              <input
                type="text"
                value={manualFlight.name}
                onChange={(e) => setManualFlight(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., NYC to Paris - Air France - Roundtrip"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
              <input
                type="text"
                value={manualFlight.description}
                onChange={(e) => setManualFlight(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Economy class, 1 checked bag included"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (Total for all travelers) *</label>
              <input
                type="number"
                value={manualFlight.price}
                onChange={(e) => setManualFlight(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                placeholder="1200"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Add Flight
              </button>
              <button
                onClick={() => setShowManualEntry(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowManualEntry(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors"
        >
          <svg className="w-5 h-5 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Flight Manually
        </button>
      )}
    </div>
  );
}

// Similar tabs for Hotels, Product Catalog, and Custom Items (shortened for brevity)
function HotelsTab({ hotels, addHotel, removeHotel, tripData }: any) {
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualHotel, setManualHotel] = useState({
    name: "",
    description: "",
    price: 0,
  });

  const handleAdd = () => {
    if (!manualHotel.name.trim()) {
      alert("Please enter hotel details");
      return;
    }
    addHotel(manualHotel);
    setManualHotel({ name: "", description: "", price: 0 });
    setShowManualEntry(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-sm text-purple-900">
          💡 <strong>Tip:</strong> Hotel search available! Use the search below or add manually.
        </p>
      </div>

      {/* Added Hotels */}
      {hotels.length > 0 && (
        <div className="space-y-3">
          {hotels.map((hotel: any, index: number) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{hotel.name}</p>
                {hotel.description && <p className="text-sm text-gray-600 mt-1">{hotel.description}</p>}
                <p className="text-sm font-semibold text-primary-600 mt-2">${hotel.price.toLocaleString()}</p>
              </div>
              <button
                onClick={() => removeHotel(index)}
                className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Manual Entry */}
      {showManualEntry ? (
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Name *</label>
              <input
                type="text"
                value={manualHotel.name}
                onChange={(e) => setManualHotel(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Marriott Paris - Deluxe Room"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={manualHotel.description}
                onChange={(e) => setManualHotel(prev => ({ ...prev, description: e.target.value }))}
                placeholder="5 nights, breakfast included"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Price *</label>
              <input
                type="number"
                value={manualHotel.price}
                onChange={(e) => setManualHotel(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                placeholder="800"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Add Hotel
              </button>
              <button
                onClick={() => setShowManualEntry(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowManualEntry(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors"
        >
          <svg className="w-5 h-5 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Hotel Manually
        </button>
      )}
    </div>
  );
}

// Product Catalog Tab (for activities, transfers, cars, insurance)
function ProductCatalogTab({ type, items, products, addItem, removeItem }: any) {
  const typeName = type === "CAR_RENTAL" ? "Car Rental" : type.charAt(0) + type.slice(1).toLowerCase();

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p className="text-gray-600 mb-4">No {typeName.toLowerCase()}s in your product catalog</p>
        <a
          href="/agent/products"
          className="inline-block text-primary-600 hover:text-primary-700 font-medium"
        >
          Add products to your catalog →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Added Items */}
      {items.length > 0 && (
        <div className="space-y-3 mb-6">
          <h3 className="font-medium text-gray-900">Added to Quote:</h3>
          {items.map((item: any, index: number) => (
            <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.name}</p>
                {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
                <p className="text-sm font-semibold text-green-600 mt-2">${item.price.toLocaleString()}</p>
              </div>
              <button
                onClick={() => removeItem(index)}
                className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Product Catalog */}
      <h3 className="font-medium text-gray-900">Select from your catalog:</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
        {products.map((product: any) => (
          <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{product.name}</p>
                {product.description && <p className="text-xs text-gray-600 mt-1">{product.description}</p>}
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-primary-600">${product.sellingPrice.toLocaleString()}</p>
                  <button
                    onClick={() => addItem({
                      name: product.name,
                      description: product.description,
                      price: product.sellingPrice,
                    })}
                    className="px-3 py-1 bg-primary-600 text-white text-xs rounded-lg hover:bg-primary-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Custom Items Tab
function CustomItemsTab({ items, addItem, removeItem }: any) {
  const [showForm, setShowForm] = useState(false);
  const [customItem, setCustomItem] = useState({
    name: "",
    description: "",
    price: 0,
  });

  const handleAdd = () => {
    if (!customItem.name.trim()) {
      alert("Please enter item name");
      return;
    }
    addItem(customItem);
    setCustomItem({ name: "", description: "", price: 0 });
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Add any custom items like visa fees, parking, special equipment, or other costs not covered by the other categories.
      </p>

      {/* Added Custom Items */}
      {items.length > 0 && (
        <div className="space-y-3">
          {items.map((item: any, index: number) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.name}</p>
                {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
                <p className="text-sm font-semibold text-primary-600 mt-2">${item.price.toLocaleString()}</p>
              </div>
              <button
                onClick={() => removeItem(index)}
                className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Custom Item Form */}
      {showForm ? (
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
              <input
                type="text"
                value={customItem.name}
                onChange={(e) => setCustomItem(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Visa Fee, Travel Guide, Parking Pass"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
              <textarea
                value={customItem.description}
                onChange={(e) => setCustomItem(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Additional details about this item"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
              <input
                type="number"
                value={customItem.price}
                onChange={(e) => setCustomItem(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                placeholder="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Add Item
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors"
        >
          <svg className="w-5 h-5 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Custom Item
        </button>
      )}
    </div>
  );
}
