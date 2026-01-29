"use client";

import { useSearchParams } from "next/navigation";
import {
  QuoteWorkspaceProvider,
  useQuoteWorkspace,
} from "@/components/agent/quote-workspace/QuoteWorkspaceProvider";
import QuoteWorkspaceLayout from "@/components/agent/quote-workspace/QuoteWorkspaceLayout";
import QuoteHeader from "@/components/agent/quote-workspace/QuoteHeader";
import QuoteFooter from "@/components/agent/quote-workspace/QuoteFooter";
import DiscoveryZone from "@/components/agent/quote-workspace/discovery/DiscoveryZone";
import ItineraryZone from "@/components/agent/quote-workspace/itinerary/ItineraryZone";
import PricingZone from "@/components/agent/quote-workspace/pricing/PricingZone";
import { ViewModeProvider } from "@/components/agent/quote-workspace/itinerary/ViewModeContext";
import ClientSelectModal from "@/components/agent/quote-workspace/overlays/ClientSelectModal";
import QuotePreviewOverlay from "@/components/agent/quote-workspace/overlays/QuotePreviewOverlay";
import SendQuoteModal from "@/components/agent/quote-workspace/overlays/SendQuoteModal";
import QuoteTemplatesPanel from "@/components/agent/quote-workspace/overlays/QuoteTemplatesPanel";

export default function QuoteWorkspace() {
  const searchParams = useSearchParams();
  const quoteId = searchParams.get("id") || undefined;

  return (
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
  );
}

function WorkspaceOverlays() {
  return (
    <>
      <ClientSelectModal />
      <QuotePreviewOverlay />
      <SendQuoteModal />
      <QuoteTemplatesPanel />
    </>
  );
}
