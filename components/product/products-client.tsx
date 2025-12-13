"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { ShoppingBag, LogOut, User, AlertCircle, ShoppingCart, Heart, Share2, Grid3x3, List, Eye } from "lucide-react";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import { useActiveProducts } from "@/hooks/use-active-products";
import SearchFilter from "@/components/ui/search-filter";
import CartButton from "@/components/cart/cart-button";
import { useCart } from "@/components/cart/cart-context";
import { toast } from "sonner";
import Link from "next/link";
import React from 'react';
import { UserMenu } from "@/components/ui/user-menu";
import { StarRating } from "@/components/review/star-rating";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { ProductListResponse } from "@/types/product";
import { ProductBadges } from "@/components/product/product-badges";
import { QuickViewModal } from "@/components/product/quick-view-modal";
import { useWishlist } from "@/components/wishlist/wishlist-context";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import WishlistButton from "@/components/wishlist/wishlist-button";


type SortOption = "relevance" | "most-rated" | "most-sales" | "price-asc" | "price-desc";

export function ProductsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  
  // Read initial values from URL params
  const urlSearch = searchParams.get("search") || undefined;
  const urlCategoryId = searchParams.get("categoryId") || undefined;
  const urlSort = (searchParams.get("sort") as SortOption) || "relevance";
  const urlPage = parseInt(searchParams.get("page") || "1", 10);
  
  const [search, setSearch] = React.useState<string | undefined>(urlSearch);
  const [categoryId, setCategoryId] = React.useState<string | undefined>(urlCategoryId);
  const [sortBy, setSortBy] = React.useState<SortOption>(urlSort);
  const [currentPage, setCurrentPage] = React.useState<number>(urlPage);
  const [productsPerPage, setProductsPerPage] = React.useState<number>(8);
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [quickViewProduct, setQuickViewProduct] = React.useState<ProductListResponse | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = React.useState(false);
  
  const { products, isLoading, isError, error, mutate } = useActiveProducts({ 
    search, 
    categoryId
  });
  
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToRecentlyViewed, recentlyViewed } = useRecentlyViewed();


  // Update URL params when sort or page changes
  const updateUrlParams = React.useCallback((updates: { search?: string; categoryId?: string; sort?: SortOption; page?: number }) => {
    const params = new URLSearchParams();
    if (updates.search) params.set("search", updates.search);
    if (updates.categoryId) params.set("categoryId", updates.categoryId);
    if (updates.sort && updates.sort !== "relevance") params.set("sort", updates.sort);
    if (updates.page && updates.page > 1) params.set("page", updates.page.toString());
    
    const qs = params.toString();
    router.replace(`/store${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [router]);
  
  // Sync state with URL params when they change
  React.useEffect(() => {
    const newSearch = searchParams.get("search") || undefined;
    const newCategoryId = searchParams.get("categoryId") || undefined;
    const newSort = (searchParams.get("sort") as SortOption) || "relevance";
    const newPage = parseInt(searchParams.get("page") || "1", 10);
    
    if (newSearch !== search) {
      setSearch(newSearch);
    }
    if (newCategoryId !== categoryId) {
      setCategoryId(newCategoryId);
    }
    if (newSort !== sortBy) {
      setSortBy(newSort);
    }
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  
  // Sort products based on selected option
  const sortedProducts = React.useMemo(() => {
    if (!products || products.length === 0) return [];
    
    const sorted = [...products];
    
    switch (sortBy) {
      case "most-rated":
        return sorted.sort((a, b) => {
          const ratingA = (a as any).averageRating || 0;
          const ratingB = (b as any).averageRating || 0;
          if (ratingB !== ratingA) return ratingB - ratingA;
          // If ratings are equal, sort by number of reviews
          const reviewsA = (a as any).totalReviews || 0;
          const reviewsB = (b as any).totalReviews || 0;
          return reviewsB - reviewsA;
        });
      
      case "most-sales":
        return sorted.sort((a, b) => {
          const salesA = (a as any).soldCount || 0;
          const salesB = (b as any).soldCount || 0;
          return salesB - salesA;
        });
      
      case "price-asc":
        return sorted.sort((a, b) => a.price - b.price);
      
      case "price-desc":
        return sorted.sort((a, b) => b.price - a.price);
      
      case "relevance":
      default:
        // Relevance: prioritize products with ratings and sales, then by name
        return sorted.sort((a, b) => {
          const ratingA = (a as any).averageRating || 0;
          const ratingB = (b as any).averageRating || 0;
          const salesA = (a as any).soldCount || 0;
          const salesB = (b as any).soldCount || 0;
          
          // Products with ratings and sales come first
          if ((ratingA > 0 || salesA > 0) && (ratingB === 0 && salesB === 0)) return -1;
          if ((ratingB > 0 || salesB > 0) && (ratingA === 0 && salesA === 0)) return 1;
          
          // Among products with ratings/sales, sort by rating then sales
          if (ratingB !== ratingA) return ratingB - ratingA;
          if (salesB !== salesA) return salesB - salesA;
          
          // Finally, sort alphabetically
          return a.name.localeCompare(b.name);
        });
    }
  }, [products, sortBy]);
  
  // Paginate products
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, endIndex);
  
  const handleSortChange = React.useCallback((value: SortOption) => {
    setSortBy(value);
    setCurrentPage(1); // Reset to first page when sorting changes
    updateUrlParams({ search, categoryId, sort: value, page: 1 });
  }, [search, categoryId, updateUrlParams]);
  
  const handlePageChange = React.useCallback((page: number) => {
    setCurrentPage(page);
    updateUrlParams({ search, categoryId, sort: sortBy, page });
    // Scroll to top of products section
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [search, categoryId, sortBy, updateUrlParams]);
  
  const handleSearchFilterChange = React.useCallback(({ search, categoryId }: { search?: string; categoryId?: string }) => {
    setSearch(search);
    setCategoryId(categoryId);
    setCurrentPage(1); // Reset to first page when search/filter changes
    updateUrlParams({ search, categoryId, sort: sortBy, page: 1 });
  }, [sortBy, updateUrlParams]);

  const handleProductClick = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      addToRecentlyViewed(product);
    }
    router.push(`/store/${productId}`);
  };
  
  const handleQuickView = (e: React.MouseEvent, product: ProductListResponse) => {
    e.stopPropagation();
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
    addToRecentlyViewed(product);
  };
  
  const handleWishlistToggle = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    toggleWishlist(productId);
    toast.success(isInWishlist(productId) ? "Removed from wishlist" : "Added to wishlist");
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
      // User cancelled or error occurred
      if (error instanceof Error && error.name !== "AbortError") {
        await navigator.clipboard.writeText(url);
        toast.success("Product link copied to clipboard!");
      }
    }
  };
  
  const handleProductsPerPageChange = (value: string) => {
    const newPerPage = parseInt(value, 10);
    setProductsPerPage(newPerPage);
    setCurrentPage(1);
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-[100] bg-green-900 dark:bg-green-950 shadow-sm border-b border-green-800 dark:border-green-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
          {/* Mobile Layout: Just logo and icons */}
          <div className="flex items-center justify-between sm:hidden">
            <Link href="/store" className="text-lg font-bold text-yellow-500 dark:text-yellow-400 hover:text-yellow-400 dark:hover:text-yellow-300 transition-colors cursor-pointer whitespace-nowrap">
              TechCraftersHQ
            </Link>
            <div className="flex items-center gap-3">
              <WishlistButton />
              <CartButton />
              <UserMenu />
            </div>
          </div>
          
          {/* Desktop Layout: Horizontal */}
          <div className="hidden sm:flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link href="/store" className="text-xl md:text-2xl font-bold text-yellow-500 dark:text-yellow-400 hover:text-yellow-400 dark:hover:text-yellow-300 transition-colors cursor-pointer whitespace-nowrap">
                TechCraftersHQ
              </Link>
            </div>
            <div className="flex-1 max-w-2xl mx-4">
              <SearchFilter
                initialSearch={urlSearch || ""}
                initialCategoryId={urlCategoryId}
                onChange={handleSearchFilterChange}
                redirectToStore={false}
              />
            </div>
            <div className="flex items-center gap-4 md:gap-6 flex-shrink-0">
              <WishlistButton />
              <CartButton />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-28 sm:pb-8">
        {/* Sort and Controls */}
        {!isLoading && !isError && products.length > 0 && (
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="text-xs sm:text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, sortedProducts.length)} of {sortedProducts.length} products
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <label htmlFor="sort-select" className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                  Sort:
                </label>
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger id="sort-select" className="w-[140px] sm:w-[180px] text-xs sm:text-sm h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="most-rated">Most Rated</SelectItem>
                    <SelectItem value="most-sales">Most Sales</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-1 border rounded-md p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 p-0"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="per-page-select" className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                  Per page:
                </label>
                <Select value={productsPerPage.toString()} onValueChange={handleProductsPerPageChange}>
                  <SelectTrigger id="per-page-select" className="w-[80px] text-xs sm:text-sm h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8">8</SelectItem>
                    <SelectItem value="16">16</SelectItem>
                    <SelectItem value="24">24</SelectItem>
                    <SelectItem value="32">32</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Spinner className="w-8 h-8" />
              <p className="text-sm text-muted-foreground">Loading products in the store...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {!isLoading && isError && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <p className="text-sm text-destructive">
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
            {sortedProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No active products available in the store</p>
              </div>
            ) : (
              <>
                <div className={viewMode === "grid" 
                  ? "grid grid-cols-1 min-[375px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
                  : "space-y-4"
                }>
                  {paginatedProducts.map((product) => (
                    <div
                      key={product.id}
                      className={`bg-card rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-md transition-all cursor-pointer relative group flex ${
                        viewMode === "list" ? "flex-row gap-4" : "flex-col h-full"
                      } w-full`}
                      onClick={() => handleProductClick(product.id)}
                    >
                      <div className={`${viewMode === "list" ? "w-32 sm:w-40 flex-shrink-0" : "w-full"} aspect-square bg-muted/30 flex items-center justify-center p-3 sm:p-4 relative overflow-hidden`}>
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
                            className={`h-8 w-8 p-0 ${isInWishlist(product.id) ? "text-red-500" : ""}`}
                            onClick={(e) => handleWishlistToggle(e, product.id)}
                            title={isInWishlist(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                          >
                            <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
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
                      <div className={`p-3 sm:p-4 flex flex-col ${viewMode === "list" ? "flex-1 justify-center" : "flex-grow min-h-0"}`}>
                        <h3 className={`font-semibold ${viewMode === "list" ? "text-base sm:text-lg" : "text-sm sm:text-base md:text-lg"} text-card-foreground mb-1.5 sm:mb-2 ${viewMode === "list" ? "line-clamp-1" : "line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] md:min-h-[3.5rem]"}`}>
                          {product.name}
                        </h3>
                        <p className={`text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 ${viewMode === "list" ? "line-clamp-2" : "line-clamp-2"} flex-shrink-0`}>
                          {product.description}
                        </p>
                        <div className={`${viewMode === "list" ? "flex items-center gap-4" : "mt-auto space-y-2 sm:space-y-2.5"}`}>
                          <div className={`flex items-center ${viewMode === "list" ? "gap-4" : "justify-between"}`}>
                            <span className={`${viewMode === "list" ? "text-xl sm:text-2xl" : "text-base sm:text-lg md:text-xl lg:text-2xl"} font-bold text-primary`}>
                              ₱{product.price.toFixed(2)}
                            </span>
                            {viewMode === "list" && (
                              <div className="flex items-center gap-2">
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
                            )}
                          </div>
                          {viewMode === "grid" && (
                            <>
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
                            </>
                          )}
                          {viewMode === "list" && (
                            <div className="flex items-center gap-4">
                              <span className="text-xs text-muted-foreground">
                                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                              </span>
                            </div>
                          )}
                          <div className={`flex gap-2 ${viewMode === "list" ? "mt-2" : "mt-2.5 sm:mt-3"}`}>
                            <Button
                              size="sm"
                              className={`${viewMode === "list" ? "px-4" : "flex-1"} text-xs sm:text-sm h-9 sm:h-10`}
                              disabled={product.stock === 0}
                              onClick={(e) => handleAddToCart(e, product)}
                            >
                              <span className="truncate">{product.stock > 0 ? "Add to Cart" : "Out of Stock"}</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className={`${viewMode === "list" ? "px-4" : "flex-1"} text-xs sm:text-sm h-9 sm:h-10`}
                              disabled={product.stock === 0}
                              onClick={(e) => handleBuyNow(e, product)}
                            >
                              <span className="truncate">Buy Now</span>
                            </Button>
                            {viewMode === "list" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-9 sm:h-10"
                                  onClick={(e) => handleQuickView(e, product)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Quick View
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className={`h-9 sm:h-10 ${isInWishlist(product.id) ? "text-red-500" : ""}`}
                                  onClick={(e) => handleWishlistToggle(e, product.id)}
                                >
                                  <Heart className={`h-4 w-4 mr-1 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-9 sm:h-10"
                                  onClick={(e) => handleShare(e, product)}
                                >
                                  <Share2 className="h-4 w-4 mr-1" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 sm:mt-8 mb-4 sm:mb-0 flex justify-center">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}
        
        {/* Recently Viewed Section */}
        {!isLoading && !isError && recentlyViewed.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-4">Recently Viewed</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {recentlyViewed.slice(0, 5).map((product) => (
                <div
                  key={product.id}
                  className="bg-card rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-md transition-all cursor-pointer relative group flex flex-col h-full"
                  onClick={() => handleProductClick(product.id)}
                >
                  <div className="aspect-square bg-muted/30 flex items-center justify-center p-2 relative overflow-hidden">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={200}
                        height={200}
                        className="object-contain"
                      />
                    ) : (
                      <ShoppingBag className="w-12 h-12 text-muted-foreground" />
                    )}
                  </div>
                  <div className="p-2">
                    <h3 className="font-semibold text-xs line-clamp-2 mb-1">{product.name}</h3>
                    <span className="text-sm font-bold text-primary">₱{product.price.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
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

      {/* Mobile Footer with Search Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-[100] bg-green-900 dark:bg-green-950 border-t border-green-800 dark:border-green-900 shadow-lg sm:hidden safe-area-inset-bottom">
        <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3">
          <SearchFilter
            initialSearch={urlSearch || ""}
            initialCategoryId={urlCategoryId}
            onChange={handleSearchFilterChange}
            redirectToStore={false}
          />
        </div>
      </footer>
    </div>
  );
}

