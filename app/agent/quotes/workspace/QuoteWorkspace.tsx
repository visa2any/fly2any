"use client";

import { useSearchParams } from "next/navigation";
import { useCallback } from "react";
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
import ClientSelectModal from "@/components/agent/quote-workspace/overlays/ClientSelectModal";
import QuotePreviewOverlay from "@/components/agent/quote-workspace/overlays/QuotePreviewOverlay";
import SendQuoteModal from "@/components/agent/quote-workspace/overlays/SendQuoteModal";
import QuoteTemplatesPanel from "@/components/agent/quote-workspace/overlays/QuoteTemplatesPanel";
import { GlobalErrorBoundary } from "@/components/error/GlobalErrorBoundary";

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
    <>
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
    </>
  );
}
