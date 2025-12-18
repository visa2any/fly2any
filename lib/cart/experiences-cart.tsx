'use client';

/**
 * Experiences Cart System
 * Multi-item cart for Tours, Activities, and Transfers
 * Persisted in localStorage for cross-session support
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Types
export type ExperienceType = 'tour' | 'activity' | 'transfer';

export interface CartItem {
  id: string;
  type: ExperienceType;
  productId: string;
  name: string;
  image: string;
  date: string;
  time?: string;
  duration?: string;
  location?: string;
  participants: {
    adults: number;
    children: number;
  };
  unitPrice: number;
  totalPrice: number;
  currency: string;
  bookingLink?: string;
  addedAt: string;
}

interface CartState {
  items: CartItem[];
  total: number;
  currency: string;
}

interface CartContextType {
  items: CartItem[];
  total: number;
  currency: string;
  itemCount: number;
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'id' | 'addedAt'>) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  getItemsByType: (type: ExperienceType) => CartItem[];
}

const CART_STORAGE_KEY = 'fly2any_experiences_cart';
const DEFAULT_CURRENCY = 'USD';

const CartContext = createContext<CartContextType | null>(null);

// Generate unique ID
const generateId = () => `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Load cart from localStorage
const loadCart = (): CartState => {
  if (typeof window === 'undefined') {
    return { items: [], total: 0, currency: DEFAULT_CURRENCY };
  }
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        items: parsed.items || [],
        total: parsed.total || 0,
        currency: parsed.currency || DEFAULT_CURRENCY,
      };
    }
  } catch (e) {
    console.error('Failed to load cart:', e);
  }
  return { items: [], total: 0, currency: DEFAULT_CURRENCY };
};

// Save cart to localStorage
const saveCart = (state: CartState) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save cart:', e);
  }
};

// Calculate total
const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.totalPrice, 0);
};

export function ExperiencesCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart on mount
  useEffect(() => {
    const cart = loadCart();
    setItems(cart.items);
    setCurrency(cart.currency);
    setIsLoaded(true);
  }, []);

  // Save cart on changes
  useEffect(() => {
    if (isLoaded) {
      saveCart({ items, total: calculateTotal(items), currency });
    }
  }, [items, currency, isLoaded]);

  const addItem = useCallback((item: Omit<CartItem, 'id' | 'addedAt'>) => {
    const newItem: CartItem = {
      ...item,
      id: generateId(),
      addedAt: new Date().toISOString(),
    };
    setItems(prev => [...prev, newItem]);
    setIsOpen(true); // Auto-open cart on add
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<CartItem>) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setIsOpen(false);
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen(prev => !prev), []);

  const getItemsByType = useCallback((type: ExperienceType) => {
    return items.filter(item => item.type === type);
  }, [items]);

  const value: CartContextType = {
    items,
    total: calculateTotal(items),
    currency,
    itemCount: items.length,
    isOpen,
    addItem,
    removeItem,
    updateItem,
    clearCart,
    openCart,
    closeCart,
    toggleCart,
    getItemsByType,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useExperiencesCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useExperiencesCart must be used within ExperiencesCartProvider');
  }
  return context;
}

// Type icons
export const typeIcons: Record<ExperienceType, string> = {
  tour: '🏛️',
  activity: '🎯',
  transfer: '🚗',
};

// Type colors
export const typeColors: Record<ExperienceType, { bg: string; text: string; border: string }> = {
  tour: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  activity: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  transfer: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
};
