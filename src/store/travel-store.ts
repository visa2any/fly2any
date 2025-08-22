/**
 * 🏪 UNIFIED TRAVEL STATE MANAGEMENT
 * Central state management for the entire travel booking platform
 * Using Zustand for lightweight, TypeScript-friendly state management
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { persist } from 'zustand/middleware';

// Types
import { type UnifiedSearchParams, type TravelIntent } from '@/components/travel/UnifiedTravelSearch';
import { type SmartBundle } from '@/lib/travel/smart-bundling-engine';
import { type CarRentalOffer } from '@/lib/amadeus/car-rentals';
import { type ActivityOffer } from '@/lib/amadeus/activities';
import { type Notification } from '@/lib/realtime/notification-system';

// ========================================
// STATE INTERFACES
// ========================================

export interface TravelSearchResults {
  flights: any[];
  hotels: any[];
  cars: CarRentalOffer[];
  activities: ActivityOffer[];
  bundles: SmartBundle[];
  meta: {
    totalResults: number;
    searchTime: number;
    searchId: string;
  };
}

export interface UserPreferences {
  currency: string;
  language: string;
  travelClass: 'economy' | 'premium' | 'business' | 'first';
  accommodationType: 'budget' | 'mid-range' | 'luxury';
  budgetRange: {
    min: number;
    max: number;
  };
  favoritesDestinations: string[];
  dietaryRestrictions: string[];
  accessibilityNeeds: string[];
  notificationPreferences: {
    priceAlerts: boolean;
    bookingUpdates: boolean;
    promotions: boolean;
  };
}

export interface BookingCart {
  items: Array<{
    id: string;
    type: 'flight' | 'hotel' | 'car' | 'activity' | 'bundle';
    data: any;
    price: number;
    currency: string;
    quantity: number;
    selectedDate?: string;
    selectedTime?: string;
    passengers?: any[];
    rooms?: any[];
  }>;
  totalPrice: number;
  currency: string;
  estimatedTaxes: number;
  totalSavings: number;
}

export interface TravelState {
  // Search State
  searchParams: UnifiedSearchParams | null;
  searchResults: TravelSearchResults | null;
  isSearching: boolean;
  searchError: string | null;
  currentIntent: TravelIntent | null;

  // User State  
  userPreferences: UserPreferences;
  isAuthenticated: boolean;
  userId: string | null;

  // Booking State
  cart: BookingCart;
  selectedBundle: SmartBundle | null;
  bookingStep: 'search' | 'select' | 'details' | 'payment' | 'confirmation';

  // UI State
  view: 'search' | 'results' | 'bundles' | 'booking' | 'account';
  sidebarOpen: boolean;
  loadingStates: {
    flights: boolean;
    hotels: boolean;
    cars: boolean;
    activities: boolean;
    bundles: boolean;
  };

  // Real-time State
  notifications: Notification[];
  unreadNotifications: number;
  conversionData: {
    activeViewers: number;
    recentBookings: Array<{
      destination: string;
      timeAgo: number;
      travelers: number;
    }>;
    inventory: {
      flightsLeft?: number;
      hotelsLeft?: number;
      spotsLeft?: number;
    };
  };
}

// ========================================
// STATE ACTIONS INTERFACE
// ========================================

export interface TravelActions {
  // Search Actions
  setSearchParams: (params: UnifiedSearchParams) => void;
  setSearchResults: (results: TravelSearchResults) => void;
  setSearching: (isSearching: boolean) => void;
  setSearchError: (error: string | null) => void;
  setCurrentIntent: (intent: TravelIntent | null) => void;
  clearSearch: () => void;

  // User Actions
  setUserPreferences: (preferences: Partial<UserPreferences>) => void;
  setAuthenticated: (isAuth: boolean, userId?: string) => void;
  updateCurrency: (currency: string) => void;
  addFavoriteDestination: (destination: string) => void;
  removeFavoriteDestination: (destination: string) => void;

  // Booking Actions
  addToCart: (item: any) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItem: (itemId: string, updates: any) => void;
  clearCart: () => void;
  selectBundle: (bundle: SmartBundle) => void;
  setBookingStep: (step: TravelState['bookingStep']) => void;
  calculateCartTotal: () => void;

  // UI Actions
  setView: (view: TravelState['view']) => void;
  setSidebarOpen: (open: boolean) => void;
  setLoadingState: (service: keyof TravelState['loadingStates'], loading: boolean) => void;

  // Notification Actions
  addNotification: (notification: Notification) => void;
  markNotificationRead: (notificationId: string) => void;
  clearNotifications: () => void;
  setUnreadCount: (count: number) => void;

  // Real-time Actions
  updateConversionData: (data: Partial<TravelState['conversionData']>) => void;
  incrementViewers: () => void;
  decrementViewers: () => void;
  updateInventory: (updates: Partial<TravelState['conversionData']['inventory']>) => void;
}

// ========================================
// INITIAL STATE
// ========================================

const initialState: TravelState = {
  // Search State
  searchParams: null,
  searchResults: null,
  isSearching: false,
  searchError: null,
  currentIntent: null,

  // User State
  userPreferences: {
    currency: 'USD',
    language: 'en',
    travelClass: 'economy',
    accommodationType: 'mid-range',
    budgetRange: { min: 0, max: 10000 },
    favoritesDestinations: [],
    dietaryRestrictions: [],
    accessibilityNeeds: [],
    notificationPreferences: {
      priceAlerts: true,
      bookingUpdates: true,
      promotions: false
    }
  },
  isAuthenticated: false,
  userId: null,

  // Booking State
  cart: {
    items: [],
    totalPrice: 0,
    currency: 'USD',
    estimatedTaxes: 0,
    totalSavings: 0
  },
  selectedBundle: null,
  bookingStep: 'search',

  // UI State
  view: 'search',
  sidebarOpen: false,
  loadingStates: {
    flights: false,
    hotels: false,
    cars: false,
    activities: false,
    bundles: false
  },

  // Real-time State
  notifications: [],
  unreadNotifications: 0,
  conversionData: {
    activeViewers: Math.floor(Math.random() * 12) + 3,
    recentBookings: [],
    inventory: {}
  }
};

// ========================================
// ZUSTAND STORE
// ========================================

export const useTravelStore = create<TravelState & TravelActions>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        ...initialState,

        // ========================================
        // SEARCH ACTIONS
        // ========================================

        setSearchParams: (params) => {
          set({ searchParams: params });
          
          // Track search in analytics
          if (typeof window !== 'undefined' && 'gtag' in window) {
            (window as any).gtag('event', 'search', {
              event_category: 'travel',
              event_label: params.query,
              custom_parameter_1: Object.keys(params.services).filter(k => params.services[k as keyof typeof params.services]).join(',')
            });
          }
        },

        setSearchResults: (results) => {
          set({ 
            searchResults: results,
            isSearching: false,
            searchError: null
          });
        },

        setSearching: (isSearching) => {
          set({ isSearching });
          
          if (isSearching) {
            // Reset loading states
            set({
              loadingStates: {
                flights: true,
                hotels: true,
                cars: true,
                activities: true,
                bundles: true
              }
            });
          }
        },

        setSearchError: (error) => {
          set({ 
            searchError: error, 
            isSearching: false,
            loadingStates: {
              flights: false,
              hotels: false,
              cars: false,
              activities: false,
              bundles: false
            }
          });
        },

        setCurrentIntent: (intent) => {
          set({ currentIntent: intent });
        },

        clearSearch: () => {
          set({
            searchParams: null,
            searchResults: null,
            searchError: null,
            currentIntent: null,
            view: 'search'
          });
        },

        // ========================================
        // USER ACTIONS
        // ========================================

        setUserPreferences: (preferences) => {
          set((state) => ({
            userPreferences: { ...state.userPreferences, ...preferences }
          }));
        },

        setAuthenticated: (isAuth: boolean, userId: string | null = null) => {
          set({ isAuthenticated: isAuth, userId });
        },

        updateCurrency: (currency) => {
          set((state) => ({
            userPreferences: { ...state.userPreferences, currency },
            cart: { ...state.cart, currency }
          }));
        },

        addFavoriteDestination: (destination) => {
          set((state) => ({
            userPreferences: {
              ...state.userPreferences,
              favoritesDestinations: [
                ...state.userPreferences.favoritesDestinations.filter(d => d !== destination),
                destination
              ].slice(-10) // Keep last 10
            }
          }));
        },

        removeFavoriteDestination: (destination) => {
          set((state) => ({
            userPreferences: {
              ...state.userPreferences,
              favoritesDestinations: state.userPreferences.favoritesDestinations.filter(d => d !== destination)
            }
          }));
        },

        // ========================================
        // BOOKING ACTIONS
        // ========================================

        addToCart: (item) => {
          set((state) => {
            const existingItemIndex = state.cart.items.findIndex(
              cartItem => cartItem.id === item.id && cartItem.type === item.type
            );

            let updatedItems;
            if (existingItemIndex >= 0) {
              // Update existing item quantity
              updatedItems = [...state.cart.items];
              updatedItems[existingItemIndex].quantity += 1;
            } else {
              // Add new item
              updatedItems = [...state.cart.items, { ...item, quantity: 1 }];
            }

            const newCart = { ...state.cart, items: updatedItems };
            get().calculateCartTotal();
            
            return { cart: newCart };
          });

          // Track add to cart event
          if (typeof window !== 'undefined' && 'gtag' in window) {
            (window as any).gtag('event', 'add_to_cart', {
              event_category: 'ecommerce',
              event_label: item.type,
              value: item.price
            });
          }
        },

        removeFromCart: (itemId) => {
          set((state) => {
            const updatedItems = state.cart.items.filter(item => item.id !== itemId);
            const newCart = { ...state.cart, items: updatedItems };
            get().calculateCartTotal();
            
            return { cart: newCart };
          });
        },

        updateCartItem: (itemId, updates) => {
          set((state) => {
            const updatedItems = state.cart.items.map(item =>
              item.id === itemId ? { ...item, ...updates } : item
            );
            const newCart = { ...state.cart, items: updatedItems };
            get().calculateCartTotal();
            
            return { cart: newCart };
          });
        },

        clearCart: () => {
          set({
            cart: {
              items: [],
              totalPrice: 0,
              currency: get().userPreferences.currency,
              estimatedTaxes: 0,
              totalSavings: 0
            }
          });
        },

        selectBundle: (bundle) => {
          set({ selectedBundle: bundle, view: 'booking' });
          
          // Track bundle selection
          if (typeof window !== 'undefined' && 'gtag' in window) {
            (window as any).gtag('event', 'select_bundle', {
              event_category: 'conversion',
              event_label: bundle.name,
              value: bundle.pricing.totalBundlePrice
            });
          }
        },

        setBookingStep: (step) => {
          set({ bookingStep: step });
        },

        calculateCartTotal: () => {
          const state = get();
          const items = state.cart.items;
          
          const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
          const estimatedTaxes = subtotal * 0.08; // 8% estimated tax
          const totalPrice = subtotal + estimatedTaxes;

          set((prevState) => ({
            cart: {
              ...prevState.cart,
              totalPrice,
              estimatedTaxes
            }
          }));
        },

        // ========================================
        // UI ACTIONS
        // ========================================

        setView: (view) => {
          set({ view });
        },

        setSidebarOpen: (open) => {
          set({ sidebarOpen: open });
        },

        setLoadingState: (service, loading) => {
          set((state) => ({
            loadingStates: {
              ...state.loadingStates,
              [service]: loading
            }
          }));
        },

        // ========================================
        // NOTIFICATION ACTIONS
        // ========================================

        addNotification: (notification) => {
          set((state) => ({
            notifications: [notification, ...state.notifications].slice(0, 50), // Keep last 50
            unreadNotifications: state.unreadNotifications + 1
          }));
        },

        markNotificationRead: (notificationId) => {
          set((state) => ({
            notifications: state.notifications.map(n =>
              n.id === notificationId ? { ...n, readAt: new Date().toISOString() } : n
            ),
            unreadNotifications: Math.max(0, state.unreadNotifications - 1)
          }));
        },

        clearNotifications: () => {
          set({ notifications: [], unreadNotifications: 0 });
        },

        setUnreadCount: (count) => {
          set({ unreadNotifications: count });
        },

        // ========================================
        // REAL-TIME ACTIONS
        // ========================================

        updateConversionData: (data) => {
          set((state) => ({
            conversionData: { ...state.conversionData, ...data }
          }));
        },

        incrementViewers: () => {
          set((state) => ({
            conversionData: {
              ...state.conversionData,
              activeViewers: state.conversionData.activeViewers + 1
            }
          }));
        },

        decrementViewers: () => {
          set((state) => ({
            conversionData: {
              ...state.conversionData,
              activeViewers: Math.max(1, state.conversionData.activeViewers - 1)
            }
          }));
        },

        updateInventory: (updates) => {
          set((state) => ({
            conversionData: {
              ...state.conversionData,
              inventory: { ...state.conversionData.inventory, ...updates }
            }
          }));
        },
      }),
      {
        name: 'fly2any-travel-store',
        partialize: (state) => ({
          // Only persist user preferences and cart
          userPreferences: state.userPreferences,
          cart: state.cart,
          isAuthenticated: state.isAuthenticated,
          userId: state.userId
        }),
      }
    )
  )
);

// ========================================
// STORE SELECTORS (for performance)
// ========================================

export const useSearchState = () => useTravelStore((state) => ({
  searchParams: state.searchParams,
  searchResults: state.searchResults,
  isSearching: state.isSearching,
  searchError: state.searchError,
  currentIntent: state.currentIntent
}));

export const useCartState = () => useTravelStore((state) => ({
  cart: state.cart,
  selectedBundle: state.selectedBundle,
  bookingStep: state.bookingStep
}));

export const useUserState = () => useTravelStore((state) => ({
  userPreferences: state.userPreferences,
  isAuthenticated: state.isAuthenticated,
  userId: state.userId
}));

export const useNotificationState = () => useTravelStore((state) => ({
  notifications: state.notifications,
  unreadNotifications: state.unreadNotifications
}));

export const useConversionState = () => useTravelStore((state) => ({
  conversionData: state.conversionData
}));

// ========================================
// STORE SUBSCRIPTIONS (for side effects)
// ========================================

// Subscribe to cart changes and recalculate total
useTravelStore.subscribe(
  (state) => state.cart.items,
  () => {
    useTravelStore.getState().calculateCartTotal();
  }
);

// Subscribe to search results and update view
useTravelStore.subscribe(
  (state) => state.searchResults,
  (searchResults) => {
    if (searchResults && searchResults.bundles.length > 0) {
      useTravelStore.getState().setView('bundles');
    } else if (searchResults) {
      useTravelStore.getState().setView('results');
    }
  }
);

// Subscribe to currency changes and update cart
useTravelStore.subscribe(
  (state) => state.userPreferences.currency,
  (currency) => {
    const state = useTravelStore.getState();
    if (state.cart.currency !== currency) {
      useTravelStore.getState().updateCurrency(currency);
    }
  }
);

export default useTravelStore;