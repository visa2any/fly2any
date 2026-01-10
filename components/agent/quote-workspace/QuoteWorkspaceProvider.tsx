"use client";

import { createContext, useContext, useReducer, useCallback, useEffect, useMemo, ReactNode } from "react";
import { produce } from "immer";
import { useDebouncedCallback } from "use-debounce";
import { UnifiedSearchProvider } from "./unified-search/UnifiedSearchProvider";
import { detectConflicts, type TimeConflict } from "./utils/conflict-detection";
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
    subtotal: 0,
    markupPercent: 15,
    markupAmount: 0,
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

// Calculate pricing from items
function calculatePricing(items: QuoteItem[], markupPercent: number, taxes: number, fees: number, discount: number, travelers: number, currency: Currency): QuotePricing {
  const subtotal = items.reduce((sum, item) => sum + (item.price || 0), 0);
  const markupAmount = (subtotal * markupPercent) / 100;
  const total = Math.max(0, subtotal + markupAmount + taxes + fees - discount);
  const perPerson = travelers > 0 ? total / travelers : total;

  return { subtotal, markupPercent, markupAmount, taxes, fees, discount, total, perPerson, currency };
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
        // Recalc pricing
        draft.pricing = calculatePricing(
          draft.items,
          draft.pricing.markupPercent,
          draft.pricing.taxes,
          draft.pricing.fees,
          draft.pricing.discount,
          draft.travelers.total,
          draft.pricing.currency
        );
        break;

      case "ADD_ITEM":
        const newItem = { ...action.payload, id: action.payload.id || generateId(), sortOrder: draft.items.length };
        draft.items.push(newItem);
        // Recalc pricing
        draft.pricing = calculatePricing(
          draft.items,
          draft.pricing.markupPercent,
          draft.pricing.taxes,
          draft.pricing.fees,
          draft.pricing.discount,
          draft.travelers.total,
          draft.pricing.currency
        );
        break;

      case "UPDATE_ITEM":
        const updateIdx = draft.items.findIndex((i) => i.id === action.payload.id);
        if (updateIdx !== -1) {
          Object.assign(draft.items[updateIdx], action.payload.updates);
          draft.pricing = calculatePricing(
            draft.items,
            draft.pricing.markupPercent,
            draft.pricing.taxes,
            draft.pricing.fees,
            draft.pricing.discount,
            draft.travelers.total,
            draft.pricing.currency
          );
        }
        break;

      case "REMOVE_ITEM":
        draft.items = draft.items.filter((i) => i.id !== action.payload);
        draft.pricing = calculatePricing(
          draft.items,
          draft.pricing.markupPercent,
          draft.pricing.taxes,
          draft.pricing.fees,
          draft.pricing.discount,
          draft.travelers.total,
          draft.pricing.currency
        );
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
        draft.pricing = calculatePricing(
          draft.items,
          action.payload,
          draft.pricing.taxes,
          draft.pricing.fees,
          draft.pricing.discount,
          draft.travelers.total,
          draft.pricing.currency
        );
        break;

      case "SET_CURRENCY":
        draft.pricing.currency = action.payload;
        break;

      case "SET_TAXES":
        draft.pricing.taxes = action.payload;
        draft.pricing = calculatePricing(
          draft.items,
          draft.pricing.markupPercent,
          action.payload,
          draft.pricing.fees,
          draft.pricing.discount,
          draft.travelers.total,
          draft.pricing.currency
        );
        break;

      case "SET_DISCOUNT":
        draft.pricing.discount = action.payload;
        draft.pricing = calculatePricing(
          draft.items,
          draft.pricing.markupPercent,
          draft.pricing.taxes,
          draft.pricing.fees,
          action.payload,
          draft.travelers.total,
          draft.pricing.currency
        );
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
  saveQuote: () => Promise<void>;
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
    if (state.items.length === 0 && !state.tripName) return; // Don't save empty quotes

    dispatch({ type: "SET_SAVING", payload: true });
    try {
      // Transform items by type
      const flights = state.items.filter(i => i.type === 'flight').map(i => i.data || {});
      const hotels = state.items.filter(i => i.type === 'hotel').map(i => i.data || {});
      const activities = state.items.filter(i => i.type === 'activity').map(i => i.data || {});
      const transfers = state.items.filter(i => i.type === 'transfer').map(i => i.data || {});
      const carRentals = state.items.filter(i => i.type === 'car').map(i => i.data || {});
      const customItems = state.items.filter(i => i.type === 'custom').map(i => i.data || {});

      const payload = {
        clientId: state.client?.id || '',
        tripName: state.tripName || 'Untitled Trip',
        destination: state.destination || '',
        startDate: state.startDate || new Date().toISOString(),
        endDate: state.endDate || new Date().toISOString(),
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
        if (!state.id && data.quote?.id) {
          dispatch({ type: "LOAD_QUOTE", payload: { id: data.quote.id } });
        }
        dispatch({ type: "SET_LAST_SAVED", payload: new Date().toISOString() });
        return data.quote; // Return saved quote data
      }
      return null;
    } catch (error) {
      console.error("Save quote error:", error);
      return null;
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

  // Autosave on state changes (excluding UI changes)
  useEffect(() => {
    if (state.items.length > 0 || state.tripName) {
      debouncedSave();
    }
  }, [state.items, state.tripName, state.destination, state.startDate, state.endDate, state.travelers, state.pricing.markupPercent, state.client]);

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
