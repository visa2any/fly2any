"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface CompareItem {
  id: string;
  type: "flight" | "hotel" | "activity" | "transfer" | "car";
  title: string;
  subtitle?: string;
  price: number;
  currency?: string;
  image?: string;
  details: Record<string, string | number | boolean | undefined>;
  /** Full raw data for adding to quote */
  raw: any;
}

interface CompareContextType {
  items: CompareItem[];
  add: (item: CompareItem) => void;
  remove: (id: string) => void;
  clear: () => void;
  isSelected: (id: string) => boolean;
  isOpen: boolean;
  openCompare: () => void;
  closeCompare: () => void;
}

const CompareContext = createContext<CompareContextType | null>(null);

const MAX_COMPARE = 3;

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const add = useCallback((item: CompareItem) => {
    setItems((prev) => {
      if (prev.length >= MAX_COMPARE) return prev;
      if (prev.some((i) => i.id === item.id)) return prev;
      return [...prev, item];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    setIsOpen(false);
  }, []);

  const isSelected = useCallback(
    (id: string) => items.some((i) => i.id === id),
    [items]
  );

  const openCompare = useCallback(() => setIsOpen(true), []);
  const closeCompare = useCallback(() => setIsOpen(false), []);

  return (
    <CompareContext.Provider
      value={{ items, add, remove, clear, isSelected, isOpen, openCompare, closeCompare }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}
