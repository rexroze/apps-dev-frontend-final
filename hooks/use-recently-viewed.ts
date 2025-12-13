"use client";

import { useState, useEffect, useCallback } from "react";
import { ProductListResponse } from "@/types/product";

const RECENTLY_VIEWED_STORAGE_KEY = "recently_viewed_v1";
const MAX_RECENT_ITEMS = 12;

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<ProductListResponse[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(recentlyViewed));
    } catch {}
  }, [recentlyViewed]);

  const addToRecentlyViewed = useCallback((product: ProductListResponse) => {
    setRecentlyViewed((prev) => {
      // Remove if already exists
      const filtered = prev.filter((p) => p.id !== product.id);
      // Add to beginning and limit to MAX_RECENT_ITEMS
      return [product, ...filtered].slice(0, MAX_RECENT_ITEMS);
    });
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([]);
  }, []);

  return {
    recentlyViewed,
    addToRecentlyViewed,
    clearRecentlyViewed,
  };
}

