"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { ShoppingBag, LogOut, User, AlertCircle, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import { useActiveProducts } from "@/hooks/use-active-products";
import SearchFilter from "@/components/ui/search-filter";
import CartButton from "@/components/cart/cart-button";
import { useCart } from "@/components/cart/cart-context";
import { toast } from "sonner";
import { Input } from "../ui/input";
import Link from "next/link";
import React from 'react';
import { UserMenu } from "@/components/ui/user-menu";
import { StarRating } from "@/components/review/star-rating";


export function ProductsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  
  // Read initial values from URL params
  const urlSearch = searchParams.get("search") || undefined;
  const urlCategoryId = searchParams.get("categoryId") || undefined;
  
  const [search, setSearch] = React.useState<string | undefined>(urlSearch);
  const [categoryId, setCategoryId] = React.useState<string | undefined>(urlCategoryId);
  const { products, isLoading, isError, error, mutate } = useActiveProducts({ search, categoryId });

  // Sync state with URL params when they change
  React.useEffect(() => {
    const newSearch = searchParams.get("search") || undefined;
    const newCategoryId = searchParams.get("categoryId") || undefined;
    
    if (newSearch !== search) {
      setSearch(newSearch);
    }
    if (newCategoryId !== categoryId) {
      setCategoryId(newCategoryId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleProductClick = (productId: string) => {
    router.push(`/store/${productId}`);
  };

  const { addItem, items } = useCart();

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    if (product.stock === 0) {
      toast.error("Product is out of stock");
      return;
    }
    // Check if adding would exceed stock
    const currentCartItem = items.find(item => item.id === product.id);
    const currentQty = currentCartItem?.quantity || 0;
    if (currentQty >= product.stock) {
      toast.error(`Cannot add more. Only ${product.stock} in stock.`);
      return;
    }
    addItem({ 
      id: product.id, 
      name: product.name, 
      price: product.price, 
      image: product.image,
      stock: product.stock 
    }, 1);
    toast.success("Added to Cart");
  };

  const handleBuyNow = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    if (product.stock === 0) {
      toast.error("Product is out of stock");
      return;
    }
    // Check if user is authenticated
    if (!user) {
      toast.info("Please login to continue");
      router.push(`/login?redirect=/checkout?productId=${product.id}&qty=1`);
      return;
    }
    // Navigate to checkout with product
    router.push(`/checkout?productId=${product.id}&qty=1`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-[100] bg-green-900 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
          {/* Mobile Layout: Stack vertically */}
          <div className="flex flex-col gap-3 sm:hidden">
            <div className="flex items-center justify-between">
              <Link href="/store" className="text-lg font-bold text-yellow-500 hover:text-yellow-400 transition-colors cursor-pointer whitespace-nowrap">
                TechCraftersHQ
              </Link>
              <div className="flex items-center gap-3">
                <CartButton />
                <UserMenu />
              </div>
            </div>
            <div className="w-full">
              <SearchFilter
                initialSearch={urlSearch || ""}
                initialCategoryId={urlCategoryId}
                onChange={({ search, categoryId }) => {
                  setSearch(search);
                  setCategoryId(categoryId);
                  // Update URL without navigation
                  const params = new URLSearchParams();
                  if (search) params.set("search", search);
                  if (categoryId) params.set("categoryId", categoryId);
                  const qs = params.toString();
                  router.replace(`/store${qs ? `?${qs}` : ""}`, { scroll: false });
                }}
                redirectToStore={false}
              />
            </div>
          </div>
          
          {/* Desktop Layout: Horizontal */}
          <div className="hidden sm:flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link href="/store" className="text-xl md:text-2xl font-bold text-yellow-500 hover:text-yellow-400 transition-colors cursor-pointer whitespace-nowrap">
                TechCraftersHQ
              </Link>
            </div>
            <div className="flex-1 max-w-2xl mx-4">
              <SearchFilter
                initialSearch={urlSearch || ""}
                initialCategoryId={urlCategoryId}
                onChange={({ search, categoryId }) => {
                  setSearch(search);
                  setCategoryId(categoryId);
                  // Update URL without navigation
                  const params = new URLSearchParams();
                  if (search) params.set("search", search);
                  if (categoryId) params.set("categoryId", categoryId);
                  const qs = params.toString();
                  router.replace(`/store${qs ? `?${qs}` : ""}`, { scroll: false });
                }}
                redirectToStore={false}
              />
            </div>
            <div className="flex items-center gap-4 md:gap-6 flex-shrink-0">
              <CartButton />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          {/* <p className="text-gray-600">Browse our active products in the store</p> */}
          
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Spinner className="w-8 h-8" />
              <p className="text-sm text-gray-600">Loading products in the store...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {!isLoading && isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-600">
                {error?.message || "Failed to fetch products in the store"}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => mutate()}
                className="ml-auto"
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && !isError && (
          <>
            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No active products available in the store</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-pointer relative group flex flex-col h-full"
                    onClick={() => handleProductClick(product.id)}
                  >
                    <div className="aspect-square bg-white flex items-center justify-center p-4 relative overflow-hidden flex-shrink-0">
                      {product.image ? (
                        <>
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={500}
                            height={500}
                            className="object-contain transition-all duration-300 group-hover:blur-sm group-hover:scale-105"
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                            <span className="text-white font-semibold bg-black bg-opacity-70 px-4 py-2 rounded backdrop-blur-sm">
                              View Product
                            </span>
                          </div>
                        </>
                      ) : (
                        <ShoppingBag className="w-16 h-16 text-gray-400" />
                      )}
                    </div>
                    <div className="p-3 sm:p-4 flex flex-col flex-grow min-h-0">
                      <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-1 line-clamp-2 min-h-[3rem] sm:min-h-[3.5rem]">
                        {product.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2 flex-shrink-0">
                        {product.description}
                      </p>
                      <div className="mt-auto space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-lg sm:text-xl md:text-2xl font-bold text-primary">
                            ₱{product.price.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          {(product as any).averageRating > 0 ? (
                            <StarRating rating={(product as any).averageRating} size="sm" showValue />
                          ) : (
                            <span className="text-xs text-gray-400">No ratings yet</span>
                          )}
                          {(product as any).soldCount > 0 && (
                            <span className="text-xs text-gray-500">
                              {(product as any).soldCount} sold
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-2 sm:mt-3">
                          <Button
                            size="sm"
                            className="flex-1 text-xs sm:text-sm"
                            disabled={product.stock === 0}
                            onClick={(e) => handleAddToCart(e, product)}
                          >
                            <span className="truncate">{product.stock > 0 ? "Add to Cart" : "Out of Stock"}</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs sm:text-sm"
                            disabled={product.stock === 0}
                            onClick={(e) => handleBuyNow(e, product)}
                          >
                            <span className="truncate">Buy Now</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

