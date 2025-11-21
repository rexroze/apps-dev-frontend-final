"use client";

import useSWR, { type KeyedMutator } from "swr";
import { ProductListResponse } from "@/types/product";
import { getProductListService } from "@/services/product";

interface UseProductsReturn {
  products: ProductListResponse[];
  isLoading: boolean;
  isError: boolean;
  error: Error | undefined;
  mutate: KeyedMutator<any>;
}

export function useProducts(userId: string | undefined): UseProductsReturn {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? ["products", userId] : null,
    ([, userId]) => getProductListService(userId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    }
  );

  // Extract products from API response
  let products: ProductListResponse[] = [];
  if (data) {
    if (data.status === "success" && data.data) {
      products = Array.isArray(data.data) 
        ? data.data 
        : data.data.products || [];
    }
  }

  return {
    products,
    isLoading,
    isError: !!error,
    error: error as Error | undefined,
    mutate,
  };
}