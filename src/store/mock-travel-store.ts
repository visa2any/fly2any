/**
 * 🏪 MOCK TRAVEL STATE MANAGEMENT
 * Temporary mock implementation until dependencies are properly installed
 */

// Mock interfaces to prevent TypeScript errors
export interface SearchState {
  isSearching: boolean;
  searchParams: any;
  searchResults: any;
  currentIntent: any;
  error: string | null;
}

export interface CartState {
  items: any[];
  selectedBundle: any;
  total: number;
}

export interface UserState {
  isAuthenticated: boolean;
  userId: string | null;
  userPreferences: any;
}

export interface TravelStore extends SearchState, CartState, UserState {
  setSearchParams: (params: any) => void;
  setSearchResults: (results: any) => void;
  setSearching: (isSearching: boolean) => void;
  setSearchError: (error: string | null) => void;
  setCurrentIntent: (intent: any) => void;
  setUserPreferences: (preferences: any) => void;
  setAuthenticated: (isAuth: boolean, userId?: string | null) => void;
  updateCurrency: (currency: string) => void;
  addFavoriteDestination: (destination: any) => void;
  removeFavoriteDestination: (destination: any) => void;
  addToCart: (item: any) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItem: (itemId: string, updates: any) => void;
  selectBundle: (bundle: any) => void;
  setBookingStep: (step: any) => void;
  setView: (view: any) => void;
  setSidebarOpen: (open: boolean) => void;
  setLoadingState: (service: string, loading: boolean) => void;
  addNotification: (notification: any) => void;
  markNotificationRead: (notificationId: string) => void;
  setUnreadCount: (count: number) => void;
  updateConversionData: (data: any) => void;
  clearSearch: () => void;
  resetCart: () => void;
  updateInventory: (updates: any) => void;
}

// Mock state data (serializable)
const mockState = {
  isSearching: false,
  searchParams: {},
  searchResults: null,
  currentIntent: null,
  error: null,
  items: [],
  selectedBundle: null,
  total: 0,
  isAuthenticated: false,
  userId: null,
  userPreferences: {},
};

// Mock action functions (defined separately to avoid serialization issues)
const mockActions = {
  setSearchParams: () => {},
  setSearchResults: () => {},
  setSearching: () => {},
  setSearchError: () => {},
  setCurrentIntent: () => {},
  setUserPreferences: () => {},
  setAuthenticated: () => {},
  updateCurrency: () => {},
  addFavoriteDestination: () => {},
  removeFavoriteDestination: () => {},
  addToCart: () => {},
  removeFromCart: () => {},
  updateCartItem: () => {},
  selectBundle: () => {},
  setBookingStep: () => {},
  setView: () => {},
  setSidebarOpen: () => {},
  setLoadingState: () => {},
  addNotification: () => {},
  markNotificationRead: () => {},
  setUnreadCount: () => {},
  updateConversionData: () => {},
  clearSearch: () => {},
  resetCart: () => {},
  updateInventory: () => {},
};

// Create store dynamically to avoid serialization of functions
const createMockStore = (): TravelStore => ({
  ...mockState,
  ...mockActions,
});

const mockStore = createMockStore();

// Mock hooks (create new instances to avoid serialization)
export const useTravelStore = () => createMockStore();
export const useSearchState = () => createMockStore();
export const useCartState = () => createMockStore();
export const useUserState = () => createMockStore();
export const useNotificationState = () => createMockStore();
export const useConversionState = () => createMockStore();

export default mockStore;