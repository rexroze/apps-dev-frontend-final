"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { ShoppingBag, LogOut, User, AlertCircle, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import { useActiveProducts } from "@/hooks/use-active-products";
import { toast } from "sonner";
import { Input } from "../ui/input";
import Link from "next/link";


export function ProductsClient() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { products, isLoading, isError, error, mutate } = useActiveProducts();

  const handleProductClick = (productId: string) => {
    router.push(`/store/${productId}`);
  };

  const handleAddToCart = (e: React.MouseEvent, productName: string) => {
    e.stopPropagation();
    toast.success("Added to Cart");
  };

  const handleBuyNow = (e: React.MouseEvent, productName: string) => {
    e.stopPropagation();
    toast.success("Buy Now");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 bg-green-900 shadow-sm border-b max-h-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* <ShoppingBag className="w-6 h-6 text-primary" /> */}
              <h1 className="text-2xl font-bold text-yellow-500">TechCraftersHQ</h1>
            </div>
            <Input
                  placeholder="Search..."
                  className="max-w-xl bg-white rounded-full m-4 p-4"
                />
            <div className="flex items-center gap-6">
              <Link href="/cart">
              <ShoppingCart className="text-secondary"/></Link>
              
              {/* <span className="text-sm text-gray-600">Welcome, {user?.name}</span> */}
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden lg:inline">Logout</span>  
              </Button>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleProductClick(product.id)}
                  >
                    <div className="aspect-square bg-white flex items-center justify-center p-4">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={500}
                          height={500}
                          className="object-contain"
                        />
                      ) : (
                        <ShoppingBag className="w-16 h-16 text-gray-400" />
                      )}
                      
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-bold text-primary">₱{product.price.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">
                          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                        </span>
                      </div>
                      {/* {product.user && (
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                          <User className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">Posted by {product.user.name}</span>
                        </div>
                      )} */}
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          className="flex-1"
                          disabled={product.stock === 0}
                          onClick={(e) => handleAddToCart(e, product.name)}
                        >
                          {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          disabled={product.stock === 0}
                          onClick={(e) => handleBuyNow(e, product.name)}
                        >
                          Buy Now
                        </Button>
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

