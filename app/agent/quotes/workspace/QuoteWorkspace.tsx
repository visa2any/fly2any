"use client";

import { useSearchParams } from "next/navigation";
import {
  QuoteWorkspaceProvider,
  QuoteWorkspaceLayout,
  QuoteHeader,
  QuoteFooter,
  DiscoveryZone,
  ItineraryZone,
  PricingZone,
} from "@/components/agent/quote-workspace";
import ClientSelectModal from "@/components/agent/quote-workspace/overlays/ClientSelectModal";
import QuotePreviewOverlay from "@/components/agent/quote-workspace/overlays/QuotePreviewOverlay";
import SendQuoteModal from "@/components/agent/quote-workspace/overlays/SendQuoteModal";

export default function QuoteWorkspace() {
  const searchParams = useSearchParams();
  const quoteId = searchParams.get("id") || undefined;

  return (
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
  );
}

function WorkspaceOverlays() {
  return (
    <>
      <ClientSelectModal />
      <QuotePreviewOverlay />
      <SendQuoteModal />
    </>
  );
}
