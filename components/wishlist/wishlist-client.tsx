"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { ShoppingBag, AlertCircle, Heart, ArrowLeft, Share2, Eye } from "lucide-react";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import { useWishlist } from "@/components/wishlist/wishlist-context";
import { useActiveProducts } from "@/hooks/use-active-products";
import CartButton from "@/components/cart/cart-button";
import WishlistButton from "@/components/wishlist/wishlist-button";
import { useCart } from "@/components/cart/cart-context";
import { toast } from "sonner";
import Link from "next/link";
import React from 'react';
import { UserMenu } from "@/components/ui/user-menu";
import { StarRating } from "@/components/review/star-rating";
import { ProductListResponse } from "@/types/product";
import { ProductBadges } from "@/components/product/product-badges";
import { QuickViewModal } from "@/components/product/quick-view-modal";

export function WishlistClient() {
  const router = useRouter();
  const { user } = useAuth();
  const { wishlist, toggleWishlist } = useWishlist();
  const { products, isLoading } = useActiveProducts({});
  const [quickViewProduct, setQuickViewProduct] = React.useState<ProductListResponse | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = React.useState(false);

  const wishlistProducts = React.useMemo(() => {
    if (!products || products.length === 0) return [];
    return products.filter((p) => wishlist.includes(p.id));
  }, [products, wishlist]);

  const handleProductClick = (productId: string) => {
    router.push(`/store/${productId}`);
  };

  const handleQuickView = (e: React.MouseEvent, product: ProductListResponse) => {
    e.stopPropagation();
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  const handleWishlistToggle = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    toggleWishlist(productId);
    toast.success(wishlist.includes(productId) ? "Removed from wishlist" : "Added to wishlist");
  };

  const handleShare = async (e: React.MouseEvent, product: ProductListResponse) => {
    e.stopPropagation();
    const url = `${window.location.origin}/store/${product.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Product link copied to clipboard!");
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        await navigator.clipboard.writeText(url);
        toast.success("Product link copied to clipboard!");
      }
    }
  };

  const { addItem, items } = useCart();

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    if (product.stock === 0) {
      toast.error("Product is out of stock");
      return;
    }
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
    if (!user) {
      toast.info("Please login to continue");
      router.push(`/login?redirect=/checkout?productId=${product.id}&qty=1`);
      return;
    }
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
                <h1 className="text-lg font-bold text-yellow-500 dark:text-yellow-400 whitespace-nowrap">My Wishlist</h1>
              </div>
              <div className="flex items-center gap-3">
                <WishlistButton />
                <CartButton />
                <UserMenu />
              </div>
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
              <h1 className="text-xl md:text-2xl font-bold text-yellow-500 dark:text-yellow-400 whitespace-nowrap">My Wishlist</h1>
            </div>
            <div className="flex items-center gap-4 md:gap-6 flex-shrink-0 ml-auto">
              <WishlistButton />
              <CartButton />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Wishlist Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Spinner className="w-8 h-8" />
              <p className="text-sm text-muted-foreground">Loading wishlist...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && wishlistProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Your wishlist is empty</p>
          </div>
        )}

        {/* Wishlist Products */}
        {!isLoading && wishlistProducts.length > 0 && (
          <div className="grid grid-cols-1 min-[375px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {wishlistProducts.map((product) => (
              <div
                key={product.id}
                className="bg-card rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-md transition-all cursor-pointer relative group flex flex-col h-full w-full"
                onClick={() => handleProductClick(product.id)}
              >
                <div className="aspect-square bg-muted/30 flex items-center justify-center p-3 sm:p-4 relative overflow-hidden flex-shrink-0">
                  <ProductBadges product={product} />
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
                    <ShoppingBag className="w-16 h-16 text-muted-foreground" />
                  )}
                  {/* Action Buttons Overlay */}
                  <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0"
                      onClick={(e) => handleQuickView(e, product)}
                      title="Quick View"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0 text-red-500"
                      onClick={(e) => handleWishlistToggle(e, product.id)}
                      title="Remove from Wishlist"
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0"
                      onClick={(e) => handleShare(e, product)}
                      title="Share Product"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-3 sm:p-4 flex flex-col flex-grow min-h-0">
                  <h3 className="font-semibold text-sm sm:text-base md:text-lg text-card-foreground mb-1.5 sm:mb-2 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] md:min-h-[3.5rem]">
                    {product.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2 flex-shrink-0">
                    {product.description}
                  </p>
                  <div className="mt-auto space-y-2 sm:space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-primary">
                        ₱{product.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      {(product as any).averageRating > 0 ? (
                        <StarRating rating={(product as any).averageRating} size="sm" showValue />
                      ) : (
                        <span className="text-xs text-muted-foreground">No ratings yet</span>
                      )}
                      {(product as any).soldCount > 0 && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {(product as any).soldCount} sold
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2.5 sm:mt-3">
                      <Button
                        size="sm"
                        className="flex-1 text-xs sm:text-sm h-9 sm:h-10"
                        disabled={product.stock === 0}
                        onClick={(e) => handleAddToCart(e, product)}
                      >
                        <span className="truncate">{product.stock > 0 ? "Add to Cart" : "Out of Stock"}</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs sm:text-sm h-9 sm:h-10"
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
      </main>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        open={isQuickViewOpen}
        onOpenChange={setIsQuickViewOpen}
        onViewFullPage={() => quickViewProduct && handleProductClick(quickViewProduct.id)}
      />
    </div>
  );
}

