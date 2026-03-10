"use client";

import { createContext, useContext, useReducer, useCallback, useEffect, useMemo, useRef, useState, ReactNode } from "react";
import toast from "react-hot-toast";
import { produce } from "immer";
import { useDebouncedCallback } from "use-debounce";
import { UnifiedSearchProvider } from "./unified-search/UnifiedSearchProvider";
import { detectConflicts, type TimeConflict } from "./utils/conflict-detection";
import { calculateQuotePricing, type PriceBreakdown, type PricingContext } from "@/lib/pricing/QuotePricingService";
import { QuoteSaveError, createQuoteSaveError } from "@/lib/errors/QuoteSaveError";
import { sendCriticalAlert } from "@/lib/alerting/AdminAlertSystem";
import { logQuoteSaveError } from "@/lib/logging/BusinessCriticalLogger";
import type {
  QuoteWorkspaceState,
  WorkspaceAction,
  QuoteItem,
  QuoteClient,
  QuoteDocument,
  Currency,
  ProductType,
  Travelers,
  QuotePricing,
  HistoryEntry,
  QuoteOption,
  QuoteOptionTier,
} from "./types/quote-workspace.types";

// Generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// History constants
const MAX_HISTORY_SIZE = 50;
// Price staleness threshold: 2 hours
const PRICE_STALE_THRESHOLD_MS = 2 * 60 * 60 * 1000;

// FX rates relative to USD — seeded with recent static values, refreshed live on mount
let FX_RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, CAD: 1.36, AUD: 1.53, MXN: 17.15, BRL: 4.97,
  JPY: 149.5, CHF: 0.88, INR: 83.1, NZD: 1.63, SGD: 1.34, HKD: 7.82, AED: 3.67,
  THB: 35.1, ILS: 3.71, COP: 3900, CLP: 870, ARS: 350, DKK: 6.88, NOK: 10.55,
  SEK: 10.42, PLN: 3.97, CZK: 22.6, ZAR: 18.7, TRY: 30.5,
};

// Initial pricing
const initialPricing: QuotePricing = {
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
  conversionRate: 1,
};

// Initial state
const initialState: QuoteWorkspaceState = {
  id: null,
  status: "draft",
  tripName: "",
  destination: "",
  startDate: "",
  endDate: "",
  expiryDate: null,
  travelers: { adults: 1, children: 0, infants: 0, total: 1 },
  items: [],
  options: [],
  activeOptionId: null,
  pricing: { ...initialPricing },
  client: null,
  documents: [],
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
  history: [],
  historyIndex: -1,
};

// Helper: Transform QuotePricingService output to state.pricing format
function toStatePricing(breakdown: PriceBreakdown, conversionRate = 1): QuotePricing {
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
    currency: breakdown.currency as Currency,
    conversionRate,
  };
}

// Helper: create a pricing context from draft state
function buildPricingContext(draft: QuoteWorkspaceState): PricingContext {
  return {
    travelers: draft.travelers.total,
    currency: draft.pricing.currency,
    agentMarkupPercent: draft.pricing.markupPercent,
    taxes: draft.pricing.taxes,
    fees: draft.pricing.fees,
    discount: draft.pricing.discount,
  };
}

// Helper: push a history snapshot (call BEFORE mutating items/pricing)
function pushHistory(draft: QuoteWorkspaceState, label: string) {
  // Truncate any future entries if we're not at the end
  if (draft.historyIndex < draft.history.length - 1) {
    draft.history = draft.history.slice(0, draft.historyIndex + 1);
  }
  // Push current state snapshot
  draft.history.push({
    items: JSON.parse(JSON.stringify(draft.items)),
    pricing: { ...draft.pricing },
    timestamp: Date.now(),
    label,
  });
  // Trim history if too large
  if (draft.history.length > MAX_HISTORY_SIZE) {
    draft.history = draft.history.slice(draft.history.length - MAX_HISTORY_SIZE);
  }
  draft.historyIndex = draft.history.length - 1;
}

// Helper: recalculate pricing from items
function recalcPricing(draft: QuoteWorkspaceState) {
  const ctx = buildPricingContext(draft);
  const breakdown = calculateQuotePricing(draft.items, ctx);
  draft.pricing = toStatePricing(breakdown, draft.pricing.conversionRate ?? 1);
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
        recalcPricing(draft);
        break;

      case "ADD_ITEM":
        pushHistory(draft, `Added ${action.payload.type}`);
        const newItem = { ...action.payload, id: action.payload.id || generateId(), sortOrder: draft.items.length };
        draft.items.push(newItem);
        recalcPricing(draft);
        break;

      case "UPDATE_ITEM":
        const updateIdx = draft.items.findIndex((i) => i.id === action.payload.id);
        if (updateIdx !== -1) {
          pushHistory(draft, `Updated ${draft.items[updateIdx].type}`);
          Object.assign(draft.items[updateIdx], action.payload.updates);
          recalcPricing(draft);
        }
        break;

      case "REMOVE_ITEM":
        pushHistory(draft, `Removed item`);
        draft.items = draft.items.filter((i) => i.id !== action.payload);
        recalcPricing(draft);
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
        recalcPricing(draft);
        break;

      case "SET_CURRENCY":
        draft.pricing.currency = action.payload as Currency;
        draft.pricing.conversionRate = FX_RATES[action.payload] ?? 1;
        break;

      case "SET_TAXES":
        draft.pricing.taxes = action.payload;
        recalcPricing(draft);
        break;

      case "SET_DISCOUNT":
        draft.pricing.discount = action.payload;
        recalcPricing(draft);
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
        // Cache results for current tab (memory + sessionStorage)
        if (!action.payload.loading && action.payload.results && action.payload.tab) {
          const cacheEntry = {
            params: action.payload.params || {},
            results: action.payload.results,
            timestamp: Date.now(),
          };
          draft.ui.searchCache[action.payload.tab] = cacheEntry;
          // Persist to sessionStorage (non-blocking)
          try {
            if (typeof window !== "undefined") {
              sessionStorage.setItem(
                `fly2any_search_cache_${action.payload.tab}`,
                JSON.stringify(cacheEntry)
              );
            }
          } catch { /* quota exceeded — ignore */ }
        }
        break;

      case "RESTORE_CACHED_SEARCH": {
        let cached = draft.ui.searchCache[action.payload];
        // Try sessionStorage fallback if not in memory
        if (!cached && typeof window !== "undefined") {
          try {
            const stored = sessionStorage.getItem(`fly2any_search_cache_${action.payload}`);
            if (stored) cached = JSON.parse(stored);
          } catch { /* corrupt data — ignore */ }
        }
        if (cached && Date.now() - cached.timestamp < 15 * 60 * 1000) { // 15min TTL
          draft.ui.searchResults = cached.results;
          draft.ui.searchCache[action.payload] = cached;
        }
        break;
      }

      case "EXPAND_ITEM":
        draft.ui.expandedItemId = action.payload;
        break;

      case "LOAD_QUOTE": {
        const p = action.payload as any;
        Object.assign(draft, action.payload);
        // Rebuild unified items[] from DB arrays (flights/hotels/etc.) when loading from API
        const dbItems = [
          ...(p.flights || []),
          ...(p.hotels || []),
          ...(p.activities || []),
          ...(p.transfers || []),
          ...(p.carRentals || []),
          ...(p.customItems || []),
        ];
        if (dbItems.length > 0) {
          draft.items = dbItems;
        }
        // Normalize travelers: DB stores as number, state expects object
        if (typeof p.travelers === 'number') {
          draft.travelers = {
            adults: p.adults ?? p.travelers,
            children: p.children ?? 0,
            infants: p.infants ?? 0,
            total: p.travelers,
          };
        }
        // Normalize dates: DB may return Date objects or full ISO strings
        if (p.startDate && (typeof p.startDate !== 'string' || p.startDate.includes('T'))) {
          draft.startDate = new Date(p.startDate).toISOString().split('T')[0];
        }
        if (p.endDate && (typeof p.endDate !== 'string' || p.endDate.includes('T'))) {
          draft.endDate = new Date(p.endDate).toISOString().split('T')[0];
        }
        // Normalize status: DB stores as UPPERCASE
        if (p.status && typeof p.status === 'string') {
          draft.status = p.status.toLowerCase() as any;
        }
        // Sync agent markup percent from DB field
        if (p.agentMarkupPercent !== undefined) {
          draft.pricing.markupPercent = p.agentMarkupPercent;
        }
        // Load expiry date from DB
        if (p.expiresAt) {
          draft.expiryDate = new Date(p.expiresAt).toISOString().split('T')[0];
        }
        // Load version for optimistic locking
        if (p.version) {
          draft.version = p.version;
        }
        // Load options if present
        if (p.options && Array.isArray(p.options) && p.options.length > 0) {
          draft.options = p.options;
          if (!draft.activeOptionId && draft.options.length > 0) {
            draft.activeOptionId = draft.options[0].id;
          }
        }
        break;
      }

      case "RESET_WORKSPACE":
        return initialState;

      case "SET_SAVING":
        draft.ui.isSaving = action.payload;
        break;

      case "SET_LAST_SAVED":
        draft.ui.lastSavedAt = action.payload;
        break;

      // ═══ UNDO / REDO ═══
      case "UNDO": {
        if (draft.historyIndex < 0 || draft.history.length === 0) break;
        // If at latest, save current state first so we can redo back to it
        if (draft.historyIndex === draft.history.length - 1) {
          draft.history.push({
            items: JSON.parse(JSON.stringify(draft.items)),
            pricing: { ...draft.pricing },
            timestamp: Date.now(),
            label: "Current state",
          });
        }
        const entry = draft.history[draft.historyIndex];
        if (entry) {
          draft.items = JSON.parse(JSON.stringify(entry.items));
          draft.pricing = { ...entry.pricing };
          draft.historyIndex = Math.max(0, draft.historyIndex - 1);
        }
        break;
      }

      case "REDO": {
        if (draft.historyIndex >= draft.history.length - 1) break;
        draft.historyIndex += 1;
        const entry = draft.history[draft.historyIndex + 1] || draft.history[draft.historyIndex];
        if (entry) {
          draft.items = JSON.parse(JSON.stringify(entry.items));
          draft.pricing = { ...entry.pricing };
        }
        break;
      }

      case "PUSH_HISTORY":
        pushHistory(draft, action.payload.label);
        break;

      // ═══ EXPIRY DATE (server-persisted) ═══
      case "SET_EXPIRY_DATE":
        draft.expiryDate = action.payload;
        break;

      // ═══ MULTI-OPTION QUOTES ═══
      case "ADD_OPTION": {
        const optionId = generateId();
        const newOption: QuoteOption = {
          id: optionId,
          tier: action.payload.tier,
          label: action.payload.label,
          items: [],
          pricing: { ...initialPricing },
          isActive: false,
        };
        // If first option, move current items into it
        if (draft.options.length === 0 && draft.items.length > 0) {
          const defaultOption: QuoteOption = {
            id: generateId(),
            tier: 'standard',
            label: 'Option A',
            items: JSON.parse(JSON.stringify(draft.items)),
            pricing: { ...draft.pricing },
            isActive: false,
          };
          draft.options.push(defaultOption);
        }
        draft.options.push(newOption);
        draft.activeOptionId = optionId;
        // Switch items/pricing to new option
        draft.items = newOption.items;
        draft.pricing = { ...newOption.pricing };
        break;
      }

      case "REMOVE_OPTION": {
        const idx = draft.options.findIndex(o => o.id === action.payload);
        if (idx !== -1) {
          draft.options.splice(idx, 1);
          // If removing active option, switch to first or exit multi-option mode
          if (draft.activeOptionId === action.payload) {
            if (draft.options.length > 0) {
              const first = draft.options[0];
              draft.activeOptionId = first.id;
              draft.items = JSON.parse(JSON.stringify(first.items));
              draft.pricing = { ...first.pricing };
            } else {
              draft.activeOptionId = null;
            }
          }
        }
        break;
      }

      case "SET_ACTIVE_OPTION": {
        // Save current items to current option before switching
        if (draft.activeOptionId) {
          const currentOpt = draft.options.find(o => o.id === draft.activeOptionId);
          if (currentOpt) {
            currentOpt.items = JSON.parse(JSON.stringify(draft.items));
            currentOpt.pricing = { ...draft.pricing };
            currentOpt.isActive = false;
          }
        }
        if (action.payload === null) {
          // Exit multi-option mode — merge first option back
          if (draft.options.length > 0) {
            const first = draft.options[0];
            draft.items = JSON.parse(JSON.stringify(first.items));
            draft.pricing = { ...first.pricing };
          }
          draft.activeOptionId = null;
        } else {
          const target = draft.options.find(o => o.id === action.payload);
          if (target) {
            draft.activeOptionId = action.payload;
            draft.items = JSON.parse(JSON.stringify(target.items));
            draft.pricing = { ...target.pricing };
            target.isActive = true;
          }
        }
        break;
      }

      case "DUPLICATE_TO_OPTION": {
        const sourceItems = action.payload.sourceOptionId
          ? draft.options.find(o => o.id === action.payload.sourceOptionId)?.items || []
          : draft.items;
        const sourcePricing = action.payload.sourceOptionId
          ? draft.options.find(o => o.id === action.payload.sourceOptionId)?.pricing || { ...initialPricing }
          : draft.pricing;
        const dupId = generateId();
        const dupOption: QuoteOption = {
          id: dupId,
          tier: action.payload.targetTier,
          label: action.payload.targetLabel,
          items: JSON.parse(JSON.stringify(sourceItems)),
          pricing: { ...sourcePricing },
          isActive: false,
        };
        draft.options.push(dupOption);
        break;
      }

      // ═══ DOCUMENT ATTACHMENTS ═══
      case "ADD_DOCUMENT":
        draft.documents.push(action.payload);
        break;

      case "REMOVE_DOCUMENT":
        draft.documents = draft.documents.filter(d => d.id !== action.payload);
        break;
    }
  });
}

// Context type
interface QuoteWorkspaceContextType {
  state: QuoteWorkspaceState;
  dispatch: React.Dispatch<WorkspaceAction>;
  conflicts: Map<string, TimeConflict>;
  isSaving: boolean;
  // Undo/Redo
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  // Price staleness
  staleItems: string[]; // IDs of items with stale prices
  recheckPrice: (itemId: string) => Promise<void>;
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
  setExpiryDate: (date: string | null) => void;
  // Multi-option quotes
  addOption: (tier: QuoteOptionTier, label: string) => void;
  removeOption: (optionId: string) => void;
  setActiveOption: (optionId: string | null) => void;
  duplicateToOption: (sourceOptionId: string | null, tier: QuoteOptionTier, label: string) => void;
  // Document attachments
  addDocument: (doc: QuoteDocument) => void;
  removeDocument: (id: string) => void;
  // Save/Load
  saveQuote: () => Promise<{ success: boolean; quote?: any; error?: string }>;
  loadQuote: (id: string) => Promise<void>;
}

const QuoteWorkspaceContext = createContext<QuoteWorkspaceContextType | null>(null);

// Provider component
export function QuoteWorkspaceProvider({ children, initialQuoteId }: { children: ReactNode; initialQuoteId?: string }) {
  const [state, dispatch] = useReducer(workspaceReducer, initialState);
  const lastDeletedItemRef = useRef<QuoteItem | null>(null);

  // Refresh FX rates from live API on mount (fire-and-forget, fallback to static)
  useEffect(() => {
    fetch("/api/fx/rates")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.rates && typeof d.rates === "object") Object.assign(FX_RATES, d.rates); })
      .catch(() => {});
  }, []);

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

  const removeItem = useCallback((id: string) => {
    // Store item for potential undo before removing
    const itemToDelete = state.items.find((i) => i.id === id);
    if (itemToDelete) lastDeletedItemRef.current = itemToDelete;
    dispatch({ type: "REMOVE_ITEM", payload: id });
    // Show undo toast
    toast(
      (t) => (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-700">Item removed</span>
          <button
            onClick={() => {
              if (lastDeletedItemRef.current) {
                dispatch({ type: "ADD_ITEM", payload: lastDeletedItemRef.current });
                lastDeletedItemRef.current = null;
              }
              toast.dismiss(t.id);
            }}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline"
          >
            Undo
          </button>
        </div>
      ),
      { duration: 4000, icon: "🗑️" }
    );
  }, [state.items]);
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
  const setExpiryDate = useCallback((date: string | null) => dispatch({ type: "SET_EXPIRY_DATE", payload: date }), []);

  // Undo/Redo
  const canUndo = state.historyIndex >= 0 && state.history.length > 0;
  const canRedo = state.historyIndex < state.history.length - 1;
  const undo = useCallback(() => dispatch({ type: "UNDO" }), []);
  const redo = useCallback(() => dispatch({ type: "REDO" }), []);

  // Price staleness detection
  const staleItems = useMemo(() => {
    const now = Date.now();
    return state.items
      .filter(item => {
        const createdAt = new Date(item.createdAt).getTime();
        return now - createdAt > PRICE_STALE_THRESHOLD_MS;
      })
      .map(item => item.id);
  }, [state.items]);

  // Price recheck (calls price-check API)
  const recheckPrice = useCallback(async (itemId: string) => {
    const item = state.items.find(i => i.id === itemId);
    if (!item || !state.id) return;
    try {
      const res = await fetch(`/api/agents/quotes/${state.id}/price-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, itemType: item.type, details: item.details }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.newPrice !== undefined && data.newPrice !== item.price) {
          dispatch({ type: "UPDATE_ITEM", payload: { id: itemId, updates: { price: data.newPrice, createdAt: new Date().toISOString() } as any } });
          toast.success(`Price updated: ${item.type} — was $${item.price}, now $${data.newPrice}`);
        } else {
          // Update createdAt to mark as fresh
          dispatch({ type: "UPDATE_ITEM", payload: { id: itemId, updates: { createdAt: new Date().toISOString() } as any } });
          toast.success("Price confirmed — still valid");
        }
      }
    } catch {
      toast.error("Could not verify price");
    }
  }, [state.items, state.id]);

  // Multi-option quote actions
  const addOption = useCallback((tier: QuoteOptionTier, label: string) =>
    dispatch({ type: "ADD_OPTION", payload: { tier, label } }), []);
  const removeOption = useCallback((optionId: string) =>
    dispatch({ type: "REMOVE_OPTION", payload: optionId }), []);
  const setActiveOption = useCallback((optionId: string | null) =>
    dispatch({ type: "SET_ACTIVE_OPTION", payload: optionId }), []);
  const duplicateToOption = useCallback((sourceOptionId: string | null, tier: QuoteOptionTier, label: string) =>
    dispatch({ type: "DUPLICATE_TO_OPTION", payload: { sourceOptionId, targetTier: tier, targetLabel: label } }), []);

  // Document attachments
  const addDocument = useCallback((doc: QuoteDocument) =>
    dispatch({ type: "ADD_DOCUMENT", payload: doc }), []);
  const removeDocument = useCallback((id: string) =>
    dispatch({ type: "REMOVE_DOCUMENT", payload: id }), []);

  // Get current environment
  const getEnvironment = (): 'production' | 'staging' | 'development' => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'fly2any.com' || hostname === 'www.fly2any.com') return 'production';
      if (hostname.includes('staging') || hostname.includes('stage')) return 'staging';
    }
    return 'development';
  };

  // Save quote to API with hardened error handling
  const saveQuote = useCallback(async () => {
    const environment = getEnvironment();

    // Validation: Check for empty quote
    if (state.items.length === 0 && !state.tripName) {
      return { success: false, error: 'Cannot save empty quote. Add items or trip name first.' };
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
        clientId: state.client?.id || null,
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
        // Include expiryDate for server-side persistence
        ...(state.expiryDate ? { expiresAt: new Date(state.expiryDate).toISOString() } : {}),
        // Include multi-option data if present
        ...(state.options.length > 0 ? { options: state.options } : {}),
        // Include version for PATCH optimistic-locking
        ...(state.version ? { version: state.version } : {}),
      };

      const payloadSize = JSON.stringify(payload).length;

      const url = state.id ? `/api/agents/quotes/${state.id}` : "/api/agents/quotes";
      const method = state.id ? "PATCH" : "POST";

      // AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      let res: Response;
      let saveError: QuoteSaveError | null = null;

      try {
        res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        // Detect specific failure modes
        let failureMode: QuoteSaveError['metadata']['failureMode'] = 'unknown';
        let errorMessage = 'Network error occurred';

        if (fetchError instanceof Error) {
          if (fetchError.name === 'AbortError') {
            failureMode = 'timeout';
            errorMessage = 'Request timeout - server took too long to respond';
          } else if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('Network request failed')) {
            failureMode = 'network';
            errorMessage = 'Network connection failed - please check your internet connection';
          }
        }

        // Create structured error
        saveError = createQuoteSaveError(
          errorMessage,
          failureMode,
          {
            quoteId: state.id || undefined,
            clientId: state.client?.id || undefined,
            payloadSize,
          },
          environment
        );

        // Log to business-critical logger (non-blocking)
        try {
          logQuoteSaveError(saveError);
        } catch (loggingError) {
          // Never let logging failures break the flow
          console.warn('[QuoteWorkspace] Failed to log quote save error:', loggingError);
        }

        // Send admin alert (fire-and-forget)
        sendCriticalAlert({
          errorName: saveError.name,
          summary: saveError.getSummary(),
          page: '/agent/quotes/workspace',
          agentId: undefined, // Will be populated from auth context if available
          quoteId: state.id || undefined,
          environment,
          timestamp: Date.now(),
          metadata: saveError.metadata,
          severity: 'CRITICAL',
        }).catch(() => {
          // Fire-and-forget - never throw
        });

        // Re-throw to ensure error is not swallowed
        throw saveError;
      }

      // Handle HTTP response
      if (res.ok) {
        const data = await res.json();
        // QuoteSuccessResponse shape: { success, quoteId, version, savedAt, quote }
        // Prefer data.quoteId (top-level), fallback to nested for backwards compat
        const newQuoteId = data.quoteId || data.quote?.id || data.quote?.quote?.id;
        const newVersion = data.version;
        const savedQuote = data.quote?.quote || data.quote;
        if (!state.id && newQuoteId) {
          dispatch({ type: "LOAD_QUOTE", payload: { id: newQuoteId, ...(newVersion ? { version: newVersion } : {}), ...(savedQuote?.shareableLink ? { shareableLink: savedQuote.shareableLink } : {}) } as any });
        }
        dispatch({ type: "SET_LAST_SAVED", payload: new Date().toISOString() });
        return { success: true, quote: data.quote };
      } else {
        // Non-2xx HTTP response
        let errorData: any;
        try {
          errorData = await res.json();
        } catch {
          errorData = { error: 'Unknown error' };
        }

        console.error("Save quote failed:", errorData);
        
        // Log validation details for debugging
        if (errorData.details) {
          console.error("Validation details:", JSON.stringify(errorData.details, null, 2));
        }

        // Create structured error
        const errorMsg = errorData.details
          ? `Validation error: ${errorData.details[0]?.message || 'Check console for details'}`
          : errorData.error || 'Failed to save quote';

        saveError = createQuoteSaveError(
          errorMsg,
          'http',
          {
            quoteId: state.id || undefined,
            clientId: state.client?.id || undefined,
            payloadSize,
            httpStatus: res.status,
            backendError: errorData.error || errorData.details?.[0]?.message,
          },
          environment
        );

        // Log to business-critical logger (non-blocking)
        try {
          logQuoteSaveError(saveError);
        } catch (loggingError) {
          // Never let logging failures break the flow
          console.warn('[QuoteWorkspace] Failed to log quote save error:', loggingError);
        }

        // Send admin alert (fire-and-forget)
        sendCriticalAlert({
          errorName: saveError.name,
          summary: saveError.getSummary(),
          page: '/agent/quotes/workspace',
          agentId: undefined,
          quoteId: state.id || undefined,
          environment,
          timestamp: Date.now(),
          metadata: saveError.metadata,
          severity: 'CRITICAL',
        }).catch(() => {
          // Fire-and-forget - never throw
        });

        return { success: false, error: errorMsg };
      }
    } catch (error) {
      // Handle any unexpected exceptions
      console.error("Save quote error:", error);
      
      if (error instanceof QuoteSaveError) {
        // Already handled above, just return error
        return { success: false, error: error.message };
      }

      // Unknown error - still escalate
      const unknownError = createQuoteSaveError(
        error instanceof Error ? error.message : 'Unknown error occurred while saving quote',
        'unknown',
        {
          quoteId: state.id || undefined,
          clientId: state.client?.id || undefined,
        },
        environment
      );

      // Log to business-critical logger (non-blocking)
      try {
        logQuoteSaveError(unknownError);
      } catch (loggingError) {
        // Never let logging failures break the flow
        console.warn('[QuoteWorkspace] Failed to log quote save error:', loggingError);
      }

      // Send admin alert (fire-and-forget)
      sendCriticalAlert({
        errorName: unknownError.name,
        summary: unknownError.getSummary(),
        page: '/agent/quotes/workspace',
        agentId: undefined,
        quoteId: state.id || undefined,
        environment,
        timestamp: Date.now(),
        metadata: unknownError.metadata,
        severity: 'CRITICAL',
      }).catch(() => {
        // Fire-and-forget - never throw
      });

      return { success: false, error: unknownError.message };
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

  // ═══ AUTOSAVE WITH RETRY QUEUE ═══
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const saveWithRetry = useCallback(async () => {
    const result = await saveQuote();
    if (result.success) {
      retryCountRef.current = 0;
      return;
    }
    // Exponential backoff retry
    if (retryCountRef.current < maxRetries) {
      retryCountRef.current += 1;
      const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 16000);
      setTimeout(() => {
        saveWithRetry();
      }, delay);
    } else {
      retryCountRef.current = 0;
      toast.error("Auto-save failed after retries. Please save manually.", { duration: 6000 });
    }
  }, [saveQuote]);

  const debouncedSave = useDebouncedCallback(saveWithRetry, 2000);

  // Autosave on state changes - only for editable (draft) quotes
  useEffect(() => {
    const hasContent = state.items.length > 0 || !!state.tripName;
    const isEditable = !['SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED'].includes(state.status);
    if (hasContent && isEditable) {
      debouncedSave();
    }
  }, [state.items, state.tripName, state.destination, state.startDate, state.endDate, state.travelers, state.pricing.markupPercent, state.client, state.status, state.expiryDate, debouncedSave]);

  // Load initial quote if ID provided
  useEffect(() => {
    if (initialQuoteId) {
      loadQuote(initialQuoteId);
    }
  }, [initialQuoteId, loadQuote]);

  // Compute conflicts whenever items change — deferred to avoid blocking renders
  const [conflicts, setConflicts] = useState<Map<string, TimeConflict>>(() => new Map());
  const conflictItemsRef = useRef(state.items);
  useEffect(() => {
    conflictItemsRef.current = state.items;
    const run = () => {
      setConflicts(detectConflicts(conflictItemsRef.current));
    };
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const id = (window as any).requestIdleCallback(run, { timeout: 500 });
      return () => (window as any).cancelIdleCallback(id);
    }
    // Fallback for browsers without requestIdleCallback
    const tid = setTimeout(run, 50);
    return () => clearTimeout(tid);
  }, [state.items]);

  const contextValue = useMemo(
    () => ({
      state,
      dispatch,
      conflicts,
      isSaving: state.ui.isSaving,
      // Undo/Redo
      canUndo,
      canRedo,
      undo,
      redo,
      // Price staleness
      staleItems,
      recheckPrice,
      // Actions
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
      setExpiryDate,
      // Multi-option
      addOption,
      removeOption,
      setActiveOption,
      duplicateToOption,
      // Documents
      addDocument,
      removeDocument,
      // Save/Load
      saveQuote,
      loadQuote,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, conflicts, canUndo, canRedo, staleItems]
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
