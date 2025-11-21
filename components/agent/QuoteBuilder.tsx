"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
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

  // NEW WORKFLOW - Product-first!
  const steps = [
    { number: 1, name: "Search Products", icon: "🔍", description: "Find flights & hotels" },
    { number: 2, name: "Trip Details", icon: "✈️", description: "Destination & dates" },
    { number: 3, name: "Add More", icon: "🏨", description: "Activities & extras" },
    { number: 4, name: "Pricing", icon: "💰", description: "Calculate costs" },
    { number: 5, name: "Client & Send", icon: "📧", description: "Select client & send" },
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
      {/* Workflow Explanation Banner */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-primary-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Natural Workflow - Search First!</h3>
            <p className="text-sm text-gray-700">
              <strong>1. Search products</strong> (flights, hotels) →
              <strong> 2. Build quote</strong> →
              <strong> 3. Select client & send</strong>
            </p>
            <p className="text-xs text-gray-600 mt-2">
              💡 No need to create a client first! Search what your client needs, then add their info when saving.
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              {/* Step Circle */}
              <button
                onClick={() => goToStep(step.number)}
                className={`flex items-center justify-center w-12 h-12 rounded-full text-sm font-semibold transition-all ${
                  currentStep === step.number
                    ? "bg-primary-600 text-white scale-110 shadow-lg"
                    : currentStep > step.number
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                {currentStep > step.number ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-xl">{step.icon}</span>
                )}
              </button>

              {/* Step Label */}
              <div className="ml-3 flex-1">
                <p className={`text-sm font-medium ${currentStep === step.number ? "text-primary-600" : "text-gray-600"}`}>
                  Step {step.number}
                </p>
                <p className={`text-xs ${currentStep === step.number ? "text-gray-900 font-semibold" : "text-gray-500"}`}>
                  {step.name}
                </p>
                <p className={`text-xs ${currentStep === step.number ? "text-gray-600" : "text-gray-400"}`}>
                  {step.description}
                </p>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={`h-0.5 flex-1 mx-4 ${currentStep > step.number ? "bg-green-500" : "bg-gray-200"}`}></div>
              )}
            </div>
          ))}
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
