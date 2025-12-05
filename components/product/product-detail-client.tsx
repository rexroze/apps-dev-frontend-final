"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-context";
import CartButton from "@/components/cart/cart-button";
import { Spinner } from "@/components/ui/spinner";
import { ShoppingBag, ArrowLeft, PhilippinePeso, Package, Calendar, ShoppingCart } from "lucide-react";
import { getProductByIdService } from "@/services/product";
import { ProductDetailResponse } from "@/types/product";
import { toast } from "sonner";
import { apiErrorHandler } from "@/lib/axios";
import { AxiosError } from "axios";
import Image from "next/image";
import { Input } from "../ui/input";
import SearchFilter from "@/components/ui/search-filter";
import Link from "next/link";

interface ProductDetailClientProps {
  productId: string;
}

export function ProductDetailClient({ productId }: ProductDetailClientProps) {
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProductDetail();
  }, [productId]);

  const fetchProductDetail = async () => {
    setIsLoading(true);
    try {
      const response = await getProductByIdService(productId);
      if (response.status === "success" && response.data) {
        setProduct(response.data);
      } else {
        toast.error("Failed to fetch product details");
      }
    } catch (error: unknown) {
      const errorMessage = apiErrorHandler(error as AxiosError).message;
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const { addItem } = useCart();

  const handleAddToCart = () => {
    if (!product) return;
    addItem({ id: product.id, name: product.name, price: product.price, image: product.image }, 1);
    toast.success("Added to Cart");
  };

  const handleBuyNow = () => {
    toast.success("Buy Now");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-900 shadow-sm border-b max-h-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* <ShoppingBag className="w-6 h-6 text-primary" /> */}
              <Button
              variant="outline"
              className="mt-4 my-2"
              size="sm"
              onClick={() => router.push("/store")}
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
              <h1 className="text-2xl font-bold text-yellow-500">Product Detail</h1>
            </div>
            <SearchFilter />
            <div className="flex items-center gap-6">
              <CartButton />
            </div>
          </div>
        </div>
      </header>

      {/* Product Detail */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Spinner className="w-8 h-8" />
              <p className="text-sm text-gray-600">Loading product details...</p>
            </div>
          </div>
        ) : product ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="aspect-square bg-white rounded-lg flex items-center justify-center p-8">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  width={500}
                  height={500}
                  className="object-contain rounded-lg"
                />
              ) : (
                <ShoppingBag className="w-32 h-32 text-gray-400" />
              )}
            </div>

            {/* Product Information */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
                <p className="text-lg text-gray-600 mb-6">{product.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <PhilippinePeso className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="text-2xl font-bold text-gray-900">₱{product.price.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Package className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-gray-600">Stock</p>
                    <p className="text-2xl font-bold text-gray-900">{product.stock} units</p>
                  </div>
                </div>
              </div>

              {/* <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(product.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div> */}

              <div className="pt-4 border-t space-y-3">
                <Button
                  className="w-full"
                  size="lg"
                  disabled={product.stock === 0}
                  onClick={handleAddToCart}
                >
                  {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  disabled={product.stock === 0}
                  onClick={handleBuyNow}
                >
                  Buy Now
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Product not found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/products")}
            >
              Back to Products
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}