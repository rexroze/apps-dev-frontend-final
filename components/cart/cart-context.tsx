"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
  stock?: number; // Add stock information
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  count: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as CartItem[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const addItem = (item: Omit<CartItem, "quantity">, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === item.id);
      if (idx === -1) {
        // Check stock limit when adding new item
        const maxQty = item.stock !== undefined ? Math.min(qty, item.stock) : qty;
        return [...prev, { ...item, quantity: maxQty }];
      }
      const copy = [...prev];
      const currentItem = copy[idx];
      // Check stock limit when increasing quantity
      const maxQty = currentItem.stock !== undefined 
        ? Math.min(currentItem.quantity + qty, currentItem.stock) 
        : currentItem.quantity + qty;
      copy[idx] = { ...copy[idx], quantity: maxQty };
      return copy;
    });
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((p) => p.id !== id));

  const updateQuantity = (id: string, quantity: number) => {
    setItems((prev) => prev.map((p) => {
      if (p.id === id) {
        // Enforce stock limit
        const maxQty = p.stock !== undefined ? Math.min(quantity, p.stock) : quantity;
        return { ...p, quantity: Math.max(0, maxQty) };
      }
      return p;
    }));
  };

  const clear = () => setItems([]);

  const count = useMemo(() => items.reduce((s, it) => s + it.quantity, 0), [items]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clear, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export default CartProvider;
