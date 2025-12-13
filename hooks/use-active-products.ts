"use client";

import useSWR, { type KeyedMutator } from "swr";
import { ProductListResponse } from "@/types/product";
import { getActiveProductsService } from "@/services/product";

interface UseActiveProductsReturn {
  products: ProductListResponse[];
  isLoading: boolean;
  isError: boolean;
  error: Error | undefined;
  mutate: KeyedMutator<any>;
}

export function useActiveProducts(opts?: { search?: string; categoryId?: string }): UseActiveProductsReturn {
  const key = ["active-products", opts?.search ?? "", opts?.categoryId ?? ""];
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => getActiveProductsService(opts),
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
      products = Array.isArray(data.data) ? data.data : [];
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