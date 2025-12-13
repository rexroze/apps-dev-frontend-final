"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-context";
import CartButton from "@/components/cart/cart-button";
import WishlistButton from "@/components/wishlist/wishlist-button";
import { Spinner } from "@/components/ui/spinner";
import { ShoppingBag, ArrowLeft, PhilippinePeso, Package, Calendar, ShoppingCart } from "lucide-react";
import { getProductByIdService, getActiveProductsService } from "@/services/product";
import { ProductDetailResponse, ProductListResponse } from "@/types/product";
import { toast } from "sonner";
import { apiErrorHandler } from "@/lib/axios";
import { AxiosError } from "axios";
import Image from "next/image";
import { Input } from "../ui/input";
import SearchFilter from "@/components/ui/search-filter";
import Link from "next/link";
import { UserMenu } from "@/components/ui/user-menu";
import { useActiveProducts } from "@/hooks/use-active-products";
import { useAuth } from "@/components/auth/contexts/auth-context";
import { ReviewForm } from "@/components/review/review-form";
import { ReviewList } from "@/components/review/review-list";
import { StarRating } from "@/components/review/star-rating";

interface ProductDetailClientProps {
  productId: string;
}

export function ProductDetailClient({ productId }: ProductDetailClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [product, setProduct] = useState<ProductDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<ProductListResponse[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  useEffect(() => {
    fetchProductDetail();
  }, [productId]);

  useEffect(() => {
    if (product) {
      fetchRecommendations();
    }
  }, [product]);

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

  const fetchRecommendations = async () => {
    if (!product) return;
    setIsLoadingRecommendations(true);
    try {
      const opts: { categoryId?: string; limit?: number } = { limit: 8 };
      // If product has a category, get products from same category
      if (product.categoryId) {
        opts.categoryId = product.categoryId;
      }
      const response = await getActiveProductsService(opts);
      if (response.status === "success" && response.data) {
        // Filter out current product and limit to 6 recommendations
        const filtered = (Array.isArray(response.data) ? response.data : [])
          .filter((p: ProductListResponse) => p.id !== product.id)
          .slice(0, 6);
        setRecommendations(filtered);
      }
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const { addItem } = useCart();

  const handleAddToCart = () => {
    if (!product) return;
    if (product.stock === 0) {
      toast.error("Product is out of stock");
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

  const handleBuyNow = () => {
    if (!product) return;
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
    // Navigate to checkout
    router.push(`/checkout?productId=${product.id}&qty=1`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-[100] bg-green-900 dark:bg-green-950 shadow-sm border-b border-green-800 dark:border-green-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
          {/* Mobile Layout: Stack vertically */}
          <div className="flex flex-col gap-3 sm:hidden">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/store")}
                  className="h-8 px-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Link href="/store" className="text-lg font-bold text-yellow-500 dark:text-yellow-400 hover:text-yellow-400 dark:hover:text-yellow-300 transition-colors cursor-pointer whitespace-nowrap">
                  TechCraftersHQ
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <WishlistButton />
                <CartButton />
                <UserMenu />
              </div>
            </div>
            <div className="w-full">
              <SearchFilter />
            </div>
          </div>
          
          {/* Desktop Layout: Horizontal */}
          <div className="hidden sm:flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/store")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Link href="/store" className="text-xl md:text-2xl font-bold text-yellow-500 dark:text-yellow-400 hover:text-yellow-400 dark:hover:text-yellow-300 transition-colors cursor-pointer whitespace-nowrap">
                TechCraftersHQ
              </Link>
            </div>
            <div className="flex-1 max-w-2xl mx-4">
              <SearchFilter />
            </div>
            <div className="flex items-center gap-4 md:gap-6 flex-shrink-0">
              <WishlistButton />
              <CartButton />
              <UserMenu />
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
              <p className="text-sm text-muted-foreground">Loading product details...</p>
            </div>
          </div>
        ) : product ? (
          <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="aspect-square bg-card rounded-lg border border-border flex items-center justify-center p-8">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  width={500}
                  height={500}
                  className="object-contain rounded-lg"
                />
              ) : (
                <ShoppingBag className="w-32 h-32 text-muted-foreground" />
              )}
            </div>

            {/* Product Information */}
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 break-words">{product.name}</h1>
                <p className="text-base sm:text-lg text-muted-foreground mb-6 break-words">{product.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-border">
                  <PhilippinePeso className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="text-2xl font-bold text-foreground">₱{product.price.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-border">
                  <Package className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Stock</p>
                    <p className="text-2xl font-bold text-foreground">{product.stock} units</p>
                  </div>
                </div>
              </div>

              {/* <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-border">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(product.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div> */}

              <div className="pt-4 border-t border-border space-y-3">
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

          {/* Reviews Section */}
          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Reviews & Ratings</h2>
            <ReviewForm productId={product.id} />
            <div className="mt-8">
              <ReviewList productId={product.id} highlightCount={3} />
            </div>
          </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Product not found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/store")}
            >
              Back to Store
            </Button>
          </div>
        )}

        {/* Product Recommendations */}
        {product && recommendations.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">You may also like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-card rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/store/${rec.id}`)}
                >
                  <div className="aspect-square bg-muted/30 flex items-center justify-center p-2">
                    {rec.image ? (
                      <Image
                        src={rec.image}
                        alt={rec.name}
                        width={200}
                        height={200}
                        className="object-contain"
                      />
                    ) : (
                      <ShoppingBag className="w-12 h-12 text-muted-foreground" />
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm text-card-foreground mb-1 line-clamp-2">{rec.name}</h3>
                    <p className="text-lg font-bold text-primary mb-2">₱{rec.price.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      {rec.stock > 0 ? `${rec.stock} in stock` : "Out of stock"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}