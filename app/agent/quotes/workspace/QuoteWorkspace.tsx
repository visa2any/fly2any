"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, lazy, Suspense } from "react";
import {
  QuoteWorkspaceProvider,
  QuoteWorkspaceLayout,
  QuoteHeader,
  QuoteFooter,
  DiscoveryZone,
  ItineraryZone,
  PricingZone,
  ViewModeProvider,
  useQuoteWorkspace,
} from "@/components/agent/quote-workspace";
import { GlobalErrorBoundary } from "@/components/error/GlobalErrorBoundary";

// Lazy-load heavy overlay modals — only loaded when first opened
const ClientSelectModal = lazy(() => import("@/components/agent/quote-workspace/overlays/ClientSelectModal"));
const QuotePreviewOverlay = lazy(() => import("@/components/agent/quote-workspace/overlays/QuotePreviewOverlay"));
const SendQuoteModal = lazy(() => import("@/components/agent/quote-workspace/overlays/SendQuoteModal"));
const QuoteTemplatesPanel = lazy(() => import("@/components/agent/quote-workspace/overlays/QuoteTemplatesPanel"));

export default function QuoteWorkspace() {
  const searchParams = useSearchParams();
  const quoteId = searchParams?.get("id") || undefined;

  return (
    <GlobalErrorBoundary>
    <ViewModeProvider>
      <QuoteWorkspaceProvider initialQuoteId={quoteId}>
        <QuoteWorkspaceLayout
          header={<QuoteHeader />}
          discovery={<DiscoveryZone />}
          itinerary={<ItineraryZone />}
          pricing={<PricingZone />}
          footer={<QuoteFooter />}
          overlays={<WorkspaceOverlays />}
        />
      </QuoteWorkspaceProvider>
    </ViewModeProvider>
    </GlobalErrorBoundary>
  );
}

function WorkspaceOverlays() {
  const {
    state,
    closeTemplatesPanel,
    setTripName,
    setDestination,
    setTravelers,
  } = useQuoteWorkspace();

  const handleLoadTemplate = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (template: any) => {
      if (template.name) setTripName(template.name);
      if (template.destination) setDestination(template.destination);
      if (template.travelers) {
        setTravelers({ adults: template.travelers, children: 0, infants: 0 });
      }
      closeTemplatesPanel();
    },
    [setTripName, setDestination, setTravelers, closeTemplatesPanel]
  );

  const currentQuoteData = {
    tripName: state.tripName,
    destination: state.destination,
    startDate: state.startDate,
    endDate: state.endDate,
    travelers: state.travelers.adults,
  };

  return (
    <Suspense fallback={null}>
      <ClientSelectModal />
      <QuotePreviewOverlay />
      <SendQuoteModal />
      <QuoteTemplatesPanel
        isOpen={state.ui.templatesPanelOpen}
        onClose={closeTemplatesPanel}
        onLoadTemplate={handleLoadTemplate}
        onSaveAsTemplate={() => {}} // Handled internally by the panel's own save modal
        currentQuoteData={currentQuoteData}
      />
    </Suspense>
  );
}
