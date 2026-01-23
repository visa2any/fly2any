"use client";

import { createContext, useContext, useReducer, useCallback, useEffect, useMemo, ReactNode } from "react";
import { produce } from "immer";
import { useDebouncedCallback } from "use-debounce";
import { UnifiedSearchProvider } from "./unified-search/UnifiedSearchProvider";
import { detectConflicts, type TimeConflict } from "./utils/conflict-detection";
import { calculateQuotePricing, type PriceBreakdown, type PricingContext } from "@/lib/pricing/QuotePricingService";
import type {
  QuoteWorkspaceState,
  WorkspaceAction,
  QuoteItem,
  QuoteClient,
  Currency,
  ProductType,
  Travelers,
  QuotePricing,
} from "./types/quote-workspace.types";

// Generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Initial state
const initialState: QuoteWorkspaceState = {
  id: null,
  status: "draft",
  tripName: "",
  destination: "",
  startDate: "",
  endDate: "",
  travelers: { adults: 1, children: 0, infants: 0, total: 1 },
  items: [],
  pricing: {
    basePrice: 0,
    productMarkup: 0,
    subtotal: 0,
    markupPercent: 15,
    markupAmount: 0,
    agentMarkup: 0,
    taxes: 0,
    fees: 0,
    discount: 0,
    total: 0,
    perPerson: 0,
    currency: "USD",
  },
  client: null,
  ui: {
    activeTab: "flight",
    searchQuery: "",
    searchLoading: false,
    searchResults: null,
    expandedItemId: null,
    previewOpen: false,
    clientModalOpen: false,
    sendModalOpen: false,
    templatesPanelOpen: false,
    isSaving: false,
    lastSavedAt: null,
    sidebarExpanded: false,
    discoveryPanelWidth: 540,
    searchFormCollapsed: false,
    searchCache: {},
  },
  historyIndex: 0,
};

// Helper: Transform QuotePricingService output to state.pricing format
function toStatePricing(breakdown: PriceBreakdown): QuotePricing {
  return {
    basePrice: breakdown.basePrice,
    productMarkup: breakdown.productMarkup,
    subtotal: breakdown.subtotal,
    markupPercent: breakdown.agentMarkupPercent,
    markupAmount: breakdown.agentMarkup,
    agentMarkup: breakdown.agentMarkup,
    taxes: breakdown.taxes,
    fees: breakdown.fees,
    discount: breakdown.discount,
    total: breakdown.total,
    perPerson: breakdown.perPerson,
    currency: breakdown.currency,
  };
}

// Reducer with Immer for immutable updates
function workspaceReducer(state: QuoteWorkspaceState, action: WorkspaceAction): QuoteWorkspaceState {
  return produce(state, (draft) => {
    switch (action.type) {
      case "SET_TRIP_NAME":
        draft.tripName = action.payload;
        break;

      case "SET_DESTINATION":
        draft.destination = action.payload;
        break;

      case "SET_DATES":
        draft.startDate = action.payload.startDate;
        draft.endDate = action.payload.endDate;
        break;

      case "SET_TRAVELERS":
        Object.assign(draft.travelers, action.payload);
        draft.travelers.total = draft.travelers.adults + draft.travelers.children + draft.travelers.infants;
        // Recalc pricing using unified service
        const pricingContext1: PricingContext = {
          travelers: draft.travelers.total,
          currency: draft.pricing.currency,
          agentMarkupPercent: draft.pricing.markupPercent,
          taxes: draft.pricing.taxes,
          fees: draft.pricing.fees,
          discount: draft.pricing.discount,
        };
        const breakdown1 = calculateQuotePricing(draft.items, pricingContext1);
        draft.pricing = toStatePricing(breakdown1);
        break;

      case "ADD_ITEM":
        const newItem = { ...action.payload, id: action.payload.id || generateId(), sortOrder: draft.items.length };
        draft.items.push(newItem);
        // Recalc pricing using unified service
        const pricingContext2: PricingContext = {
          travelers: draft.travelers.total,
          currency: draft.pricing.currency,
          agentMarkupPercent: draft.pricing.markupPercent,
          taxes: draft.pricing.taxes,
          fees: draft.pricing.fees,
          discount: draft.pricing.discount,
        };
        const breakdown2 = calculateQuotePricing(draft.items, pricingContext2);
        draft.pricing = toStatePricing(breakdown2);
        break;

      case "UPDATE_ITEM":
        const updateIdx = draft.items.findIndex((i) => i.id === action.payload.id);
        if (updateIdx !== -1) {
          Object.assign(draft.items[updateIdx], action.payload.updates);
          const pricingContext3: PricingContext = {
            travelers: draft.travelers.total,
            currency: draft.pricing.currency,
            agentMarkupPercent: draft.pricing.markupPercent,
            taxes: draft.pricing.taxes,
            fees: draft.pricing.fees,
            discount: draft.pricing.discount,
          };
          const breakdown3 = calculateQuotePricing(draft.items, pricingContext3);
          draft.pricing = toStatePricing(breakdown3);
        }
        break;

      case "REMOVE_ITEM":
        draft.items = draft.items.filter((i) => i.id !== action.payload);
        const pricingContext4: PricingContext = {
          travelers: draft.travelers.total,
          currency: draft.pricing.currency,
          agentMarkupPercent: draft.pricing.markupPercent,
          taxes: draft.pricing.taxes,
          fees: draft.pricing.fees,
          discount: draft.pricing.discount,
        };
        const breakdown4 = calculateQuotePricing(draft.items, pricingContext4);
        draft.pricing = toStatePricing(breakdown4);
        break;

      case "REORDER_ITEMS":
        const { activeId, overId } = action.payload;
        const oldIndex = draft.items.findIndex((i) => i.id === activeId);
        const newIndex = draft.items.findIndex((i) => i.id === overId);
        if (oldIndex !== -1 && newIndex !== -1) {
          const [removed] = draft.items.splice(oldIndex, 1);
          draft.items.splice(newIndex, 0, removed);
          // Update sort orders
          draft.items.forEach((item, idx) => {
            item.sortOrder = idx;
          });
        }
        break;

      case "SET_MARKUP":
        draft.pricing.markupPercent = action.payload;
        const pricingContext5: PricingContext = {
          travelers: draft.travelers.total,
          currency: draft.pricing.currency,
          agentMarkupPercent: action.payload,
          taxes: draft.pricing.taxes,
          fees: draft.pricing.fees,
          discount: draft.pricing.discount,
        };
        const breakdown5 = calculateQuotePricing(draft.items, pricingContext5);
        draft.pricing = toStatePricing(breakdown5);
        break;

      case "SET_CURRENCY":
        draft.pricing.currency = action.payload;
        break;

      case "SET_TAXES":
        draft.pricing.taxes = action.payload;
        const pricingContext6: PricingContext = {
          travelers: draft.travelers.total,
          currency: draft.pricing.currency,
          agentMarkupPercent: draft.pricing.markupPercent,
          taxes: action.payload,
          fees: draft.pricing.fees,
          discount: draft.pricing.discount,
        };
        const breakdown6 = calculateQuotePricing(draft.items, pricingContext6);
        draft.pricing = toStatePricing(breakdown6);
        break;

      case "SET_DISCOUNT":
        draft.pricing.discount = action.payload;
        const pricingContext7: PricingContext = {
          travelers: draft.travelers.total,
          currency: draft.pricing.currency,
          agentMarkupPercent: draft.pricing.markupPercent,
          taxes: draft.pricing.taxes,
          fees: draft.pricing.fees,
          discount: action.payload,
        };
        const breakdown7 = calculateQuotePricing(draft.items, pricingContext7);
        draft.pricing = toStatePricing(breakdown7);
        break;

      case "SET_CLIENT":
        draft.client = action.payload;
        break;

      case "SET_STATUS":
        draft.status = action.payload;
        break;

      case "SET_UI":
        Object.assign(draft.ui, action.payload);
        break;

      case "SET_ACTIVE_TAB":
        draft.ui.activeTab = action.payload;
        draft.ui.searchResults = null;
        draft.ui.searchLoading = false;
        break;

      case "SET_SEARCH_RESULTS":
        draft.ui.searchLoading = action.payload.loading;
        draft.ui.searchResults = action.payload.results;
        // Cache results for current tab
        if (!action.payload.loading && action.payload.results && action.payload.tab) {
          draft.ui.searchCache[action.payload.tab] = {
            params: action.payload.params || {},
            results: action.payload.results,
            timestamp: Date.now(),
          };
        }
        break;

      case "RESTORE_CACHED_SEARCH":
        const cached = draft.ui.searchCache[action.payload];
        if (cached && Date.now() - cached.timestamp < 15 * 60 * 1000) { // 15min TTL
          draft.ui.searchResults = cached.results;
        }
        break;

      case "EXPAND_ITEM":
        draft.ui.expandedItemId = action.payload;
        break;

      case "LOAD_QUOTE":
        Object.assign(draft, action.payload);
        break;

      case "RESET_WORKSPACE":
        return initialState;

      case "SET_SAVING":
        draft.ui.isSaving = action.payload;
        break;

      case "SET_LAST_SAVED":
        draft.ui.lastSavedAt = action.payload;
        break;
    }
  });
}

// Context type
interface QuoteWorkspaceContextType {
  state: QuoteWorkspaceState;
  dispatch: React.Dispatch<WorkspaceAction>;
  conflicts: Map<string, TimeConflict>;
  isSaving: boolean; // Expose saving state for race condition prevention
  // Convenience actions
  setTripName: (name: string) => void;
  setDestination: (dest: string) => void;
  setDates: (start: string, end: string) => void;
  setTravelers: (travelers: Partial<Travelers>) => void;
  addItem: (item: Omit<QuoteItem, "id" | "sortOrder" | "createdAt">) => void;
  updateItem: (id: string, updates: Partial<QuoteItem>) => void;
  removeItem: (id: string) => void;
  reorderItems: (activeId: string, overId: string) => void;
  setMarkup: (percent: number) => void;
  setCurrency: (currency: Currency) => void;
  setClient: (client: QuoteClient | null) => void;
  setActiveTab: (tab: ProductType) => void;
  setSearchResults: (loading: boolean, results: any[] | null, tab?: ProductType, params?: any) => void;
  restoreCachedSearch: (tab: ProductType) => void;
  expandItem: (id: string | null) => void;
  openPreview: () => void;
  closePreview: () => void;
  openClientModal: () => void;
  closeClientModal: () => void;
  openSendModal: () => void;
  closeSendModal: () => void;
  openTemplatesPanel: () => void;
  closeTemplatesPanel: () => void;
  toggleSidebar: () => void;
  setDiscoveryPanelWidth: (width: number) => void;
  setSearchFormCollapsed: (collapsed: boolean) => void;
  saveQuote: () => Promise<{ success: boolean; quote?: any; error?: string }>;
  loadQuote: (id: string) => Promise<void>;
}

const QuoteWorkspaceContext = createContext<QuoteWorkspaceContextType | null>(null);

// Provider component
export function QuoteWorkspaceProvider({ children, initialQuoteId }: { children: ReactNode; initialQuoteId?: string }) {
  const [state, dispatch] = useReducer(workspaceReducer, initialState);

  // Convenience action creators
  const setTripName = useCallback((name: string) => dispatch({ type: "SET_TRIP_NAME", payload: name }), []);
  const setDestination = useCallback((dest: string) => dispatch({ type: "SET_DESTINATION", payload: dest }), []);
  const setDates = useCallback((start: string, end: string) => dispatch({ type: "SET_DATES", payload: { startDate: start, endDate: end } }), []);
  const setTravelers = useCallback((travelers: Partial<Travelers>) => dispatch({ type: "SET_TRAVELERS", payload: travelers }), []);

  const addItem = useCallback((item: Omit<QuoteItem, "id" | "sortOrder" | "createdAt">) => {
    const fullItem = { ...item, id: generateId(), sortOrder: 0, createdAt: new Date().toISOString() } as QuoteItem;
    dispatch({ type: "ADD_ITEM", payload: fullItem });
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<QuoteItem>) => dispatch({ type: "UPDATE_ITEM", payload: { id, updates } }), []);
  const removeItem = useCallback((id: string) => dispatch({ type: "REMOVE_ITEM", payload: id }), []);
  const reorderItems = useCallback((activeId: string, overId: string) => dispatch({ type: "REORDER_ITEMS", payload: { activeId, overId } }), []);
  const setMarkup = useCallback((percent: number) => dispatch({ type: "SET_MARKUP", payload: percent }), []);
  const setCurrency = useCallback((currency: Currency) => dispatch({ type: "SET_CURRENCY", payload: currency }), []);
  const setClient = useCallback((client: QuoteClient | null) => dispatch({ type: "SET_CLIENT", payload: client }), []);
  const setActiveTab = useCallback((tab: ProductType) => dispatch({ type: "SET_ACTIVE_TAB", payload: tab }), []);
  const setSearchResults = useCallback((loading: boolean, results: any[] | null, tab?: ProductType, params?: any) =>
    dispatch({ type: "SET_SEARCH_RESULTS", payload: { loading, results, tab, params } }), []);
  const restoreCachedSearch = useCallback((tab: ProductType) => dispatch({ type: "RESTORE_CACHED_SEARCH", payload: tab }), []);
  const expandItem = useCallback((id: string | null) => dispatch({ type: "EXPAND_ITEM", payload: id }), []);

  const openPreview = useCallback(() => dispatch({ type: "SET_UI", payload: { previewOpen: true } }), []);
  const closePreview = useCallback(() => dispatch({ type: "SET_UI", payload: { previewOpen: false } }), []);
  const openClientModal = useCallback(() => dispatch({ type: "SET_UI", payload: { clientModalOpen: true } }), []);
  const closeClientModal = useCallback(() => dispatch({ type: "SET_UI", payload: { clientModalOpen: false } }), []);
  const openSendModal = useCallback(() => dispatch({ type: "SET_UI", payload: { sendModalOpen: true } }), []);
  const closeSendModal = useCallback(() => dispatch({ type: "SET_UI", payload: { sendModalOpen: false } }), []);
  const openTemplatesPanel = useCallback(() => dispatch({ type: "SET_UI", payload: { templatesPanelOpen: true } }), []);
  const closeTemplatesPanel = useCallback(() => dispatch({ type: "SET_UI", payload: { templatesPanelOpen: false } }), []);
  const toggleSidebar = useCallback(() => dispatch({ type: "SET_UI", payload: { sidebarExpanded: !state.ui.sidebarExpanded } }), [state.ui.sidebarExpanded]);
  const setDiscoveryPanelWidth = useCallback((width: number) => dispatch({ type: "SET_UI", payload: { discoveryPanelWidth: Math.max(320, Math.min(540, width)) } }), []);
  const setSearchFormCollapsed = useCallback((collapsed: boolean) => dispatch({ type: "SET_UI", payload: { searchFormCollapsed: collapsed } }), []);

  // Save quote to API
  const saveQuote = useCallback(async () => {
    if (state.items.length === 0 && !state.tripName) {
      return { success: false, error: 'Cannot save empty quote. Add items or trip name first.' };
    }

    // Validate client is selected
    if (!state.client?.id) {
      return { success: false, error: 'Please select a client before saving.' };
    }

    dispatch({ type: "SET_SAVING", payload: true });
    try {
      // Transform items by type - items themselves contain all data
      const flights = state.items.filter(i => i.type === 'flight');
      const hotels = state.items.filter(i => i.type === 'hotel');
      const activities = state.items.filter(i => i.type === 'activity');
      const transfers = state.items.filter(i => i.type === 'transfer');
      const carRentals = state.items.filter(i => i.type === 'car');
      const customItems = state.items.filter(i => i.type === 'custom');

      // Ensure dates are in ISO format with timezone
      const formatDateToISO = (dateStr: string) => {
        if (!dateStr) return new Date().toISOString();
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
      };

      const payload = {
        clientId: state.client.id,
        tripName: state.tripName || 'Untitled Trip',
        destination: state.destination || '',
        startDate: formatDateToISO(state.startDate),
        endDate: formatDateToISO(state.endDate),
        adults: state.travelers.adults,
        children: state.travelers.children,
        infants: state.travelers.infants,
        flights,
        hotels,
        activities,
        transfers,
        carRentals,
        customItems,
        agentMarkupPercent: state.pricing.markupPercent,
        discount: state.pricing.discount,
        taxes: state.pricing.taxes,
        fees: state.pricing.fees,
      };

      const url = state.id ? `/api/agents/quotes/${state.id}` : "/api/agents/quotes";
      const method = state.id ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const savedQuote = data.quote;
        if (!state.id && savedQuote?.id) {
          dispatch({ type: "LOAD_QUOTE", payload: { id: savedQuote.id } });
        }
        dispatch({ type: "SET_LAST_SAVED", payload: new Date().toISOString() });
        return { success: true, quote: savedQuote };
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error("Save quote failed:", errorData);
        // Log validation details for debugging
        if (errorData.details) {
          console.error("Validation details:", JSON.stringify(errorData.details, null, 2));
        }
        const errorMsg = errorData.details
          ? `Validation error: ${errorData.details[0]?.message || 'Check console for details'}`
          : errorData.error || 'Failed to save quote';
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      console.error("Save quote error:", error);
      return { success: false, error: error instanceof Error ? error.message : 'Network error occurred' };
    } finally {
      dispatch({ type: "SET_SAVING", payload: false });
    }
  }, [state]);

  // Load quote from API
  const loadQuote = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/agents/quotes/${id}`);
      if (res.ok) {
        const data = await res.json();
        dispatch({ type: "LOAD_QUOTE", payload: data.quote });
      }
    } catch (error) {
      console.error("Load quote error:", error);
    }
  }, []);

  // Debounced autosave
  const debouncedSave = useDebouncedCallback(saveQuote, 2000);

  // Autosave on state changes (excluding UI changes) - only if client is selected and has valid items
  useEffect(() => {
    const hasItems = state.items.length > 0;
    if ((hasItems || state.tripName) && state.client?.id) {
      debouncedSave();
    }
  }, [state.items, state.tripName, state.destination, state.startDate, state.endDate, state.travelers, state.pricing.markupPercent, state.client, debouncedSave]);

  // Load initial quote if ID provided
  useEffect(() => {
    if (initialQuoteId) {
      loadQuote(initialQuoteId);
    }
  }, [initialQuoteId, loadQuote]);

  // Compute conflicts whenever items change
  const conflicts = useMemo(() => {
    return detectConflicts(state.items);
  }, [state.items]);

  const contextValue = useMemo(
    () => ({
      state,
      dispatch,
      conflicts,
      isSaving: state.ui.isSaving,
      setTripName,
      setDestination,
      setDates,
      setTravelers,
      addItem,
      updateItem,
      removeItem,
      reorderItems,
      setMarkup,
      setCurrency,
      setClient,
      setActiveTab,
      setSearchResults,
      restoreCachedSearch,
      expandItem,
      openPreview,
      closePreview,
      openClientModal,
      closeClientModal,
      openSendModal,
      closeSendModal,
      openTemplatesPanel,
      closeTemplatesPanel,
      toggleSidebar,
      setDiscoveryPanelWidth,
      setSearchFormCollapsed,
      saveQuote,
      loadQuote,
    }),
    [state, conflicts, setTripName, setDestination, setDates, setTravelers, addItem, updateItem, removeItem, reorderItems, setMarkup, setCurrency, setClient, setActiveTab, setSearchResults, restoreCachedSearch, expandItem, openPreview, closePreview, openClientModal, closeClientModal, openSendModal, closeSendModal, openTemplatesPanel, closeTemplatesPanel, toggleSidebar, setDiscoveryPanelWidth, setSearchFormCollapsed, saveQuote, loadQuote]
  );

  return (
    <QuoteWorkspaceContext.Provider value={contextValue}>
      <UnifiedSearchProvider>{children}</UnifiedSearchProvider>
    </QuoteWorkspaceContext.Provider>
  );
}

// Hook to use workspace context
export function useQuoteWorkspace() {
  const context = useContext(QuoteWorkspaceContext);
  if (!context) {
    throw new Error("useQuoteWorkspace must be used within QuoteWorkspaceProvider");
  }
  return context;
}

// Selector hooks for performance
export function useQuoteItems() {
  const { state } = useQuoteWorkspace();
  return state.items;
}

export function useQuotePricing() {
  const { state } = useQuoteWorkspace();
  return state.pricing;
}

export function useQuoteUI() {
  const { state } = useQuoteWorkspace();
  return state.ui;
}

export function useQuoteClient() {
  const { state } = useQuoteWorkspace();
  return state.client;
}

export function useQuoteConflicts() {
  const { conflicts } = useQuoteWorkspace();
  return conflicts;
}
