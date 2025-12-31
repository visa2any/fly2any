"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Package, DollarSign, Send, Check, Sparkles } from "lucide-react";
import QuoteBuilderStep1ProductSearch from "./quote-builder/Step1ProductSearch";
import QuoteBuilderStep2TripDetails from "./quote-builder/Step2TripDetails";
import QuoteBuilderStep3Products from "./quote-builder/Step3Products";
import QuoteBuilderStep4Pricing from "./quote-builder/Step4Pricing";
import QuoteBuilderStep5ClientAndSend from "./quote-builder/Step5ClientAndSend";

interface QuoteBuilderProps {
  agent: {
    id: string;
    tier: string;
    defaultCommission: number;
  };
  clients: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
  }>;
  products: Array<any>;
  suppliers: Array<any>;
}

export interface QuoteData {
  // Products (Step 1 - FIRST!)
  flights: any[];
  hotels: any[];
  activities: any[];
  transfers: any[];
  carRentals: any[];
  insurance: any[];
  customItems: any[];

  // Trip Details (Step 2)
  tripName: string;
  destination: string;
  startDate: string;
  endDate: string;
  duration: number;
  travelers: number;
  adults: number;
  children: number;
  infants: number;

  // Pricing (Step 4)
  flightsCost: number;
  hotelsCost: number;
  activitiesCost: number;
  transfersCost: number;
  carRentalsCost: number;
  insuranceCost: number;
  customItemsCost: number;
  subtotal: number;
  agentMarkupPercent: number;
  agentMarkup: number;
  taxes: number;
  fees: number;
  discount: number;
  total: number;
  currency: string;

  // Client & Send (Step 5 - LAST!)
  clientId: string;
  notes: string;
  agentNotes: string;
  expiresInDays: number;
}

const INITIAL_QUOTE_DATA: QuoteData = {
  // Products FIRST
  flights: [],
  hotels: [],
  activities: [],
  transfers: [],
  carRentals: [],
  insurance: [],
  customItems: [],

  // Trip details
  tripName: "",
  destination: "",
  startDate: "",
  endDate: "",
  duration: 0,
  travelers: 2,
  adults: 2,
  children: 0,
  infants: 0,

  // Pricing
  flightsCost: 0,
  hotelsCost: 0,
  activitiesCost: 0,
  transfersCost: 0,
  carRentalsCost: 0,
  insuranceCost: 0,
  customItemsCost: 0,
  subtotal: 0,
  agentMarkupPercent: 15,
  agentMarkup: 0,
  taxes: 0,
  fees: 0,
  discount: 0,
  total: 0,
  currency: "USD",

  // Client LAST
  clientId: "",
  notes: "",
  agentNotes: "",
  expiresInDays: 7,
};

export default function QuoteBuilder({ agent, clients: initialClients, products, suppliers }: QuoteBuilderProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [quoteData, setQuoteData] = useState<QuoteData>(INITIAL_QUOTE_DATA);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState(initialClients);

  // NEW WORKFLOW - Product-first! (Level 6 Apple-Class)
  const steps = [
    { number: 1, name: "Search", icon: Search, description: "Flights & hotels", gradient: "from-violet-500 to-purple-600" },
    { number: 2, name: "Trip Details", icon: MapPin, description: "Destination & dates", gradient: "from-blue-500 to-cyan-600" },
    { number: 3, name: "Add More", icon: Package, description: "Activities & extras", gradient: "from-teal-500 to-emerald-600" },
    { number: 4, name: "Pricing", icon: DollarSign, description: "Calculate costs", gradient: "from-amber-500 to-orange-600" },
    { number: 5, name: "Send", icon: Send, description: "Select client & send", gradient: "from-rose-500 to-pink-600" },
  ];

  const updateQuoteData = (data: Partial<QuoteData>) => {
    setQuoteData((prev) => ({ ...prev, ...data }));
  };

  // Quick create client handler
  const handleQuickCreateClient = async (clientData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  }): Promise<string> => {
    try {
      const response = await fetch("/api/agents/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create client");
      }

      // Add new client to local state
      const newClient = {
        id: data.client.id,
        firstName: clientData.firstName,
        lastName: clientData.lastName,
        email: clientData.email,
        phone: clientData.phone || null,
      };
      setClients((prev) => [newClient, ...prev]);

      toast.success("Client created successfully!");
      return data.client.id;
    } catch (error: any) {
      console.error("Quick create client error:", error);
      toast.error(error.message || "Failed to create client");
      throw error;
    }
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveQuote = async (sendNow: boolean = false) => {
    setLoading(true);
    try {
      // Validate client is selected
      if (!quoteData.clientId) {
        throw new Error("Please select or create a client before saving");
      }

      // Create quote
      const response = await fetch("/api/agents/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: quoteData.clientId,
          tripName: quoteData.tripName,
          destination: quoteData.destination,
          startDate: quoteData.startDate,
          endDate: quoteData.endDate,
          duration: quoteData.duration,
          travelers: quoteData.travelers,
          adults: quoteData.adults,
          children: quoteData.children,
          infants: quoteData.infants,
          flights: quoteData.flights,
          hotels: quoteData.hotels,
          activities: quoteData.activities,
          transfers: quoteData.transfers,
          carRentals: quoteData.carRentals,
          insurance: quoteData.insurance,
          customItems: quoteData.customItems,
          flightsCost: quoteData.flightsCost,
          hotelsCost: quoteData.hotelsCost,
          activitiesCost: quoteData.activitiesCost,
          transfersCost: quoteData.transfersCost,
          carRentalsCost: quoteData.carRentalsCost,
          insuranceCost: quoteData.insuranceCost,
          customItemsCost: quoteData.customItemsCost,
          subtotal: quoteData.subtotal,
          agentMarkupPercent: quoteData.agentMarkupPercent,
          agentMarkup: quoteData.agentMarkup,
          taxes: quoteData.taxes,
          fees: quoteData.fees,
          discount: quoteData.discount,
          total: quoteData.total,
          currency: quoteData.currency,
          notes: quoteData.notes,
          agentNotes: quoteData.agentNotes,
          expiresInDays: quoteData.expiresInDays,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create quote");
      }

      toast.success("Quote created successfully!");

      // If sendNow is true, send the quote immediately
      if (sendNow) {
        const sendResponse = await fetch(`/api/agents/quotes/${data.quote.id}/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: `Your Travel Quote for ${quoteData.tripName || quoteData.destination}`,
            message: quoteData.notes || `Here is your personalized travel quote for ${quoteData.destination}. Please review and let me know if you have any questions!`,
          }),
        });

        if (sendResponse.ok) {
          toast.success("Quote sent to client!");
        }
      }

      // Redirect to quote detail page
      router.push(`/agent/quotes/${data.quote.id}`);
      router.refresh();
    } catch (error: any) {
      console.error("Save quote error:", error);
      toast.error(error.message || "Failed to save quote");
    } finally {
      setLoading(false);
    }
  };

  // Calculate if quote has content (for save draft button)
  const hasQuoteContent = quoteData.flights.length > 0 ||
                          quoteData.hotels.length > 0 ||
                          quoteData.activities.length > 0 ||
                          quoteData.customItems.length > 0;

  return (
    <div className="space-y-6">
      {/* Level 6 Workflow Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl shadow-purple-500/20"
      >
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="relative flex items-center gap-4">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center"
          >
            <Sparkles className="w-7 h-7" />
          </motion.div>
          <div>
            <h3 className="text-lg font-bold mb-1">Smart Quote Builder</h3>
            <p className="text-sm text-white/90">
              Search products → Build quote → Send to client. No client creation needed first!
            </p>
          </div>
        </div>
      </motion.div>

      {/* Level 6 Progress Steps */}
      <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)] border border-gray-100/80 p-4 md:p-6">
        <div className="flex items-center justify-between gap-2 md:gap-0">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;

            return (
              <div key={step.number} className="flex items-center flex-1">
                {/* Step Button */}
                <motion.button
                  onClick={() => goToStep(step.number)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative flex items-center justify-center w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl font-semibold transition-all ${
                    isActive
                      ? `bg-gradient-to-br ${step.gradient} text-white shadow-lg`
                      : isCompleted
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 md:w-6 md:h-6" strokeWidth={3} />
                  ) : (
                    <Icon className="w-5 h-5 md:w-6 md:h-6" />
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="activeStep"
                      className="absolute inset-0 rounded-xl md:rounded-2xl ring-4 ring-primary-200"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>

                {/* Step Label - Hidden on mobile */}
                <div className="hidden md:block ml-3 flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isActive ? "text-gray-900" : "text-gray-500"}`}>
                    {step.name}
                  </p>
                  <p className={`text-xs truncate ${isActive ? "text-gray-600" : "text-gray-400"}`}>
                    {step.description}
                  </p>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block flex-1 mx-3">
                    <div className="h-0.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: isCompleted ? "100%" : "0%" }}
                        className="h-full bg-emerald-500 rounded-full"
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile Step Label */}
        <div className="md:hidden mt-4 text-center">
          <p className="text-sm font-semibold text-gray-900">{steps[currentStep - 1].name}</p>
          <p className="text-xs text-gray-500">{steps[currentStep - 1].description}</p>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {currentStep === 1 && (
          <QuoteBuilderStep1ProductSearch
            quoteData={quoteData}
            updateQuoteData={updateQuoteData}
            onNext={nextStep}
          />
        )}

        {currentStep === 2 && (
          <QuoteBuilderStep2TripDetails
            quoteData={quoteData}
            updateQuoteData={updateQuoteData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )}

        {currentStep === 3 && (
          <QuoteBuilderStep3Products
            quoteData={quoteData}
            updateQuoteData={updateQuoteData}
            products={products}
            suppliers={suppliers}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )}

        {currentStep === 4 && (
          <QuoteBuilderStep4Pricing
            quoteData={quoteData}
            updateQuoteData={updateQuoteData}
            agentMarkupDefault={agent.defaultCommission * 100}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )}

        {currentStep === 5 && (
          <QuoteBuilderStep5ClientAndSend
            quoteData={quoteData}
            updateQuoteData={updateQuoteData}
            clients={clients}
            onSave={handleSaveQuote}
            onPrev={prevStep}
            onQuickCreate={handleQuickCreateClient}
            loading={loading}
          />
        )}
      </div>

      {/* Save Draft Button (always visible if quote has content) */}
      {currentStep < 5 && hasQuoteContent && (
        <div className="flex justify-end">
          <button
            onClick={() => {
              // If no client, prompt to go to step 5
              if (!quoteData.clientId) {
                toast.error("Please go to Step 5 to select/create a client before saving");
                goToStep(5);
              } else {
                handleSaveQuote(false);
              }
            }}
            disabled={loading}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
          >
            💾 Save as Draft
          </button>
        </div>
      )}
    </div>
  );
}
