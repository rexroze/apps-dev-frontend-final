"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getProductByIdService } from "@/services/product";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import { useAuth } from "@/components/auth/contexts/auth-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useCart, CartItem } from "@/components/cart/cart-context";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";

function CheckoutPageContent() {
  const search = useSearchParams();
  const router = useRouter();
  const { clear } = useCart();
  const productId = search.get("productId") ?? undefined;
  const qtyParam = Number(search.get("qty") ?? "1");
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Check if items came from cart (sessionStorage) or single product (query params)
    const cartItemsStr = typeof window !== "undefined" ? sessionStorage.getItem("checkoutItems") : null;
    if (cartItemsStr) {
      try {
        const items = JSON.parse(cartItemsStr) as CartItem[];
        setCheckoutItems(items);
        // Clear sessionStorage after reading
        sessionStorage.removeItem("checkoutItems");
      } catch (err) {
        console.error("Failed to parse checkout items", err);
      }
    } else if (productId) {
      // Single product checkout - fetch product and create cart item
      (async () => {
        try {
          const res = await getProductByIdService(productId);
          if (res?.status === "success" && res.data) {
            setCheckoutItems([{
              id: res.data.id,
              name: res.data.name,
              price: res.data.price,
              quantity: Math.max(1, qtyParam || 1),
              image: res.data.image,
              stock: res.data.stock
            }]);
          }
        } catch (err) {
          toast.error("Failed to load product");
        }
      })();
    }
  }, [productId, qtyParam]);

  const total = checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const doCheckout = async () => {
    if (checkoutItems.length === 0) {
      toast.error("No items to checkout");
      return;
    }

    // Validate stock
    for (const item of checkoutItems) {
      if (item.stock !== undefined && item.quantity > item.stock) {
        toast.error(`Insufficient stock for ${item.name}`);
        return;
      }
    }

    setIsProcessing(true);
    try {
      const items = checkoutItems.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }));

      const resp = await api.post("/api/checkout/v1", { items });
      if (resp?.data?.status !== "success") {
        throw new Error(resp?.data?.message || "checkout failed");
      }

      // If Xendit payment URL is provided, redirect to payment
      if (resp?.data?.data?.paymentUrl) {
        // Redirect to Xendit payment page
        window.location.href = resp.data.data.paymentUrl;
        return;
      }

      // If no payment URL (fallback or payment creation failed), proceed to orders
      toast.success("Order created successfully!");
      router.push("/orders");
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || "Checkout failed";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <p className="text-center text-gray-500">No items to checkout</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/store")}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-semibold mb-6 text-foreground">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
            <h2 className="text-lg font-semibold mb-4 text-foreground">Order Items</h2>
            <div className="space-y-4">
              {checkoutItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-border last:border-0">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="object-contain rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate text-foreground">{item.name}</div>
                    <div className="text-sm text-muted-foreground">₱{item.price.toFixed(2)} × {item.quantity}</div>
                    {item.stock !== undefined && (
                      <div className={`text-xs mt-1 ${item.stock === 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {item.stock === 0 ? 'Out of Stock' : `${item.stock} available`}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-foreground">₱{(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-card p-6 rounded-lg shadow-sm border border-border sticky top-4">
            <h2 className="text-lg font-semibold mb-4 text-foreground">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">₱{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-foreground">₱0.00</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between font-semibold">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">₱{total.toFixed(2)}</span>
              </div>
            </div>
            <Button
              onClick={doCheckout}
              disabled={isProcessing || checkoutItems.some(item => item.stock === 0)}
              className="w-full"
              size="lg"
            >
              {isProcessing ? "Processing..." : `Pay ₱${total.toFixed(2)}`}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="w-full mt-2"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutPageWrapper() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center gap-4 min-h-[400px]">
        <Spinner className="w-8 h-8" />
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}

export default function CheckoutPage() {
  // Checkout requires authentication
  return (
    <ProtectedRoute>
      <CheckoutPageWrapper />
    </ProtectedRoute>
  );
}
