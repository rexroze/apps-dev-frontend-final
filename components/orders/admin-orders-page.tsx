"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/components/auth/contexts/auth-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, Package, Search, X } from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import Image from "next/image";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Input } from "@/components/ui/input";

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
  userId: string;
  total: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
}

export function AdminOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState<"all" | "user" | "orderId">("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/orders/v1/admin");
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

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;

    const query = searchQuery.toLowerCase().trim();
    
    return orders.filter((order) => {
      if (filterBy === "user") {
        return (
          order.user.name.toLowerCase().includes(query) ||
          order.user.email.toLowerCase().includes(query)
        );
      } else if (filterBy === "orderId") {
        return order.id.toLowerCase().includes(query);
      } else {
        // Search all fields
        return (
          order.id.toLowerCase().includes(query) ||
          order.user.name.toLowerCase().includes(query) ||
          order.user.email.toLowerCase().includes(query) ||
          order.items.some((item) => item.product.name.toLowerCase().includes(query))
        );
      }
    });
  }, [orders, searchQuery, filterBy]);

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AdminLayout title="Orders Management">
        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search orders by user, order ID, or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterBy === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterBy("all")}
              >
                All
              </Button>
              <Button
                variant={filterBy === "user" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterBy("user")}
              >
                User
              </Button>
              <Button
                variant={filterBy === "orderId" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterBy("orderId")}
              >
                Order ID
              </Button>
            </div>
          </div>
          {searchQuery && (
            <div className="text-sm text-muted-foreground">
              Found {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="w-8 h-8" />
          </div>
        ) : error ? (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <p className="text-sm text-destructive flex-1">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchOrders} className="ml-auto">
                Retry
              </Button>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? "No orders found matching your search" : "No orders yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-card rounded-lg shadow-sm border border-border p-4 sm:p-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 pb-4 border-b border-border">
                  <div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Order ID</div>
                    <div className="font-semibold text-sm sm:text-base text-foreground break-all">
                      {order.id.slice(0, 8)}...
                    </div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Buyer</div>
                    <div className="font-medium text-sm sm:text-base text-foreground">
                      {order.user.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{order.user.email}</div>
                  </div>
                  <div className="sm:text-right">
                    <div className="text-xs sm:text-sm text-muted-foreground">Purchase Date</div>
                    <div className="font-medium text-xs sm:text-sm text-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <div className="text-xs sm:text-sm text-muted-foreground">Total</div>
                    <div className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
                      ₱{order.total.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-semibold text-foreground mb-2">
                    Items Purchased:
                  </div>
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 bg-muted/50 rounded border border-border"
                    >
                      {item.product.image && (
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          width={60}
                          height={60}
                          className="object-contain rounded flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm sm:text-base text-foreground break-words">
                          {item.product.name}
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground">
                          Quantity: {item.quantity} × ₱{item.price.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-semibold text-sm sm:text-base text-foreground">
                          ₱{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminLayout>
    </ProtectedRoute>
  );
}

