"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, Package, ArrowLeft, Star } from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import Link from "next/link";
import { UserMenu } from "@/components/ui/user-menu";
import CartButton from "@/components/cart/cart-button";
import Image from "next/image";
import { ReviewModal } from "@/components/review/review-modal";
import { getUserReviewByOrderItem } from "@/services/review";
import { Review } from "@/types/review";

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image: string;
  };
}

interface Order {
  id: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

export function OrdersClient() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    orderItemId: string;
    name: string;
    image?: string;
  } | null>(null);
  const [orderItemReviews, setOrderItemReviews] = useState<Map<string, Review>>(new Map());

  useEffect(() => {
    fetchOrders();
  }, []);

  // Load reviews for all order items
  useEffect(() => {
    if (orders.length > 0) {
      loadOrderItemReviews();
    }
  }, [orders]);

  const loadOrderItemReviews = async () => {
    const orderItemIds: string[] = [];
    orders.forEach((order) => {
      order.items.forEach((item) => {
        orderItemIds.push(item.id);
      });
    });

    const reviewsMap = new Map<string, Review>();
    await Promise.all(
      orderItemIds.map(async (orderItemId) => {
        try {
          const review = await getUserReviewByOrderItem(orderItemId);
          if (review) {
            reviewsMap.set(orderItemId, review);
          }
        } catch (error) {
          // User hasn't reviewed this order item yet
        }
      })
    );
    setOrderItemReviews(reviewsMap);
  };

  const handleReviewClick = (orderItemId: string, productId: string, productName: string, productImage?: string) => {
    setSelectedProduct({ id: productId, orderItemId, name: productName, image: productImage });
    setReviewModalOpen(true);
  };

  const handleReviewSuccess = () => {
    loadOrderItemReviews();
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/orders/v1");
      if (response.data.status === "success") {
        setOrders(response.data.data || []);
      } else {
        setError(response.data.message || "Failed to fetch orders");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load orders");
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-[100] bg-green-900 shadow-sm border-b">
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
                <Link href="/store" className="text-lg font-bold text-yellow-500 hover:text-yellow-400 transition-colors cursor-pointer whitespace-nowrap">
                  TechCraftersHQ
                </Link>
              </div>
              <div className="flex items-center gap-3">
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
              <Link href="/store" className="text-xl md:text-2xl font-bold text-yellow-500 hover:text-yellow-400 transition-colors cursor-pointer whitespace-nowrap">
                TechCraftersHQ
              </Link>
            </div>
            <div className="flex items-center gap-4 md:gap-6 flex-shrink-0 ml-auto">
              <CartButton />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Orders List */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Order History</h1>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Spinner className="w-8 h-8" />
              <p className="text-sm text-gray-600">Loading orders...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchOrders}
                className="ml-auto"
              >
                Retry
              </Button>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No orders yet</p>
            <Button onClick={() => router.push("/store")}>
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                  <div>
                    <div className="text-sm text-gray-500">Order ID</div>
                    <div className="font-semibold text-gray-900">{order.id.slice(0, 8)}...</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Order Date</div>
                    <div className="font-medium text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Total</div>
                    <div className="text-xl font-bold text-primary">₱{order.total.toFixed(2)}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-semibold text-gray-700 mb-2">Items:</div>
                  {order.items.map((item) => {
                    const hasReview = orderItemReviews.has(item.id);
                    const review = orderItemReviews.get(item.id);
                    return (
                      <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded">
                        {item.product.image && (
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            width={60}
                            height={60}
                            className="object-contain rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{item.product.name}</div>
                          <div className="text-sm text-gray-600">
                            Quantity: {item.quantity} × ₱{item.price.toFixed(2)}
                          </div>
                          {hasReview && review && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-gray-600">You rated {review.rating} stars</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-right">
                            <div className="font-semibold">₱{(item.price * item.quantity).toFixed(2)}</div>
                          </div>
                          <Button
                            variant={hasReview ? "outline" : "default"}
                            size="sm"
                            onClick={() => handleReviewClick(item.id, item.productId, item.product.name, item.product.image)}
                            className="text-xs"
                          >
                            <Star className="w-3 h-3 mr-1" />
                            {hasReview ? "Update Review" : "Review"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Review Modal */}
      {selectedProduct && (
        <ReviewModal
          productId={selectedProduct.id}
          orderItemId={selectedProduct.orderItemId}
          productName={selectedProduct.name}
          productImage={selectedProduct.image}
          open={reviewModalOpen}
          onOpenChange={setReviewModalOpen}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
}

