"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/components/auth/contexts/auth-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, Package, DollarSign, TrendingUp, BarChart3 } from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import Image from "next/image";
import { AdminLayout } from "@/components/admin/admin-layout";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

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

export function AdminSalesPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/orders/v1/admin");
      if (response.data.status === "success") {
        setOrders(response.data.data || []);
      } else {
        setError(response.data.message || "Failed to fetch sales");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load sales");
      toast.error("Failed to load sales history");
    } finally {
      setIsLoading(false);
    }
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const totalItems = orders.reduce((sum, order) => sum + order.items.reduce((s, item) => s + item.quantity, 0), 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Calculate revenue over time (daily)
  const revenueOverTime = useMemo(() => {
    const revenueMap = new Map<string, number>();
    const ordersMap = new Map<string, number>();

    orders.forEach((order) => {
      const date = new Date(order.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      revenueMap.set(date, (revenueMap.get(date) || 0) + order.total);
      ordersMap.set(date, (ordersMap.get(date) || 0) + 1);
    });

    const sortedDates = Array.from(revenueMap.keys()).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    });

    return sortedDates.map((date) => ({
      date,
      revenue: revenueMap.get(date) || 0,
      orders: ordersMap.get(date) || 0,
    }));
  }, [orders]);

  // Calculate top selling products
  const topProducts = useMemo(() => {
    const productMap = new Map<
      string,
      { name: string; quantity: number; revenue: number }
    >();

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const existing = productMap.get(item.product.id) || {
          name: item.product.name,
          quantity: 0,
          revenue: 0,
        };
        existing.quantity += item.quantity;
        existing.revenue += item.price * item.quantity;
        productMap.set(item.product.id, existing);
      });
    });

    return Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map((product, index) => ({
        ...product,
        name: product.name.length > 20 
          ? product.name.substring(0, 20) + "..." 
          : product.name,
      }));
  }, [orders]);

  // Calculate revenue by day of week
  const revenueByDay = useMemo(() => {
    const dayMap = new Map<string, number>();
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    orders.forEach((order) => {
      const dayIndex = new Date(order.createdAt).getDay();
      const dayName = dayNames[dayIndex];
      dayMap.set(dayName, (dayMap.get(dayName) || 0) + order.total);
    });

    return dayNames.map((day) => ({
      day,
      revenue: dayMap.get(day) || 0,
    }));
  }, [orders]);

  // Calculate recent trend (last 7 days vs previous 7 days)
  const recentTrend = useMemo(() => {
    if (orders.length === 0) return { change: 0, isPositive: true };
    
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const last7Days = orders
      .filter((order) => new Date(order.createdAt) >= sevenDaysAgo)
      .reduce((sum, order) => sum + order.total, 0);

    const previous7Days = orders
      .filter(
        (order) =>
          new Date(order.createdAt) >= fourteenDaysAgo &&
          new Date(order.createdAt) < sevenDaysAgo
      )
      .reduce((sum, order) => sum + order.total, 0);

    if (previous7Days === 0) return { change: 100, isPositive: true };
    
    const change = ((last7Days - previous7Days) / previous7Days) * 100;
    return { change: Math.abs(change), isPositive: change >= 0 };
  }, [orders]);

  // Chart colors matching the theme
  const CHART_COLORS = [
    "#3b82f6", // Blue
    "#10b981", // Green
    "#8b5cf6", // Purple
    "#f59e0b", // Amber
    "#ef4444", // Red
  ];

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AdminLayout title="Sales History">
          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-gray-100 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600">Total Revenue</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 truncate">₱{totalRevenue.toFixed(2)}</p>
                  {recentTrend.change > 0 && (
                    <p className={`text-xs mt-1 ${recentTrend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {recentTrend.isPositive ? '↑' : '↓'} {recentTrend.change.toFixed(1)}% vs last week
                    </p>
                  )}
                </div>
                <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0 ml-2" />
              </div>
            </div>
            <div className="bg-gray-100 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600">Total Orders</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{totalOrders}</p>
                </div>
                <Package className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0 ml-2" />
              </div>
            </div>
            <div className="bg-gray-100 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600">Avg Order Value</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 truncate">₱{averageOrderValue.toFixed(2)}</p>
                </div>
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0 ml-2" />
              </div>
            </div>
            <div className="bg-gray-100 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600">Total Items Sold</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{totalItems}</p>
                </div>
                <Package className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 flex-shrink-0 ml-2" />
              </div>
            </div>
          </div>

          {/* Analytics Charts */}
          {orders.length > 0 && (
            <div className="space-y-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Analytics Dashboard
              </h2>

              {/* Revenue and Orders Over Time */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-gray-100 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Revenue Over Time</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={revenueOverTime}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.8} />
                          <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#6b7280"
                        fontSize={12}
                        tick={{ fill: '#6b7280' }}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        fontSize={12}
                        tick={{ fill: '#6b7280' }}
                        tickFormatter={(value) => `₱${value.toFixed(0)}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => [`₱${value.toFixed(2)}`, 'Revenue']}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke={CHART_COLORS[0]}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-gray-100 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Orders Over Time</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={revenueOverTime}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#6b7280"
                        fontSize={12}
                        tick={{ fill: '#6b7280' }}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        fontSize={12}
                        tick={{ fill: '#6b7280' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="orders"
                        stroke={CHART_COLORS[1]}
                        strokeWidth={2}
                        dot={{ fill: CHART_COLORS[1], r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Products and Revenue by Day */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-gray-100 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={topProducts} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        type="number"
                        stroke="#6b7280"
                        fontSize={12}
                        tick={{ fill: '#6b7280' }}
                        tickFormatter={(value) => `₱${value.toFixed(0)}`}
                      />
                      <YAxis 
                        type="category"
                        dataKey="name"
                        stroke="#6b7280"
                        fontSize={11}
                        tick={{ fill: '#6b7280' }}
                        width={120}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number, name: string, props: any) => [
                          `₱${value.toFixed(2)} (${props.payload.quantity} sold)`,
                          'Revenue'
                        ]}
                      />
                      <Bar dataKey="revenue" fill={CHART_COLORS[2]} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-gray-100 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Revenue by Day of Week</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={revenueByDay}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="day" 
                        stroke="#6b7280"
                        fontSize={12}
                        tick={{ fill: '#6b7280' }}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        fontSize={12}
                        tick={{ fill: '#6b7280' }}
                        tickFormatter={(value) => `₱${value.toFixed(0)}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => [`₱${value.toFixed(2)}`, 'Revenue']}
                      />
                      <Bar dataKey="revenue" fill={CHART_COLORS[3]} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          <h2 className="text-xl font-semibold text-gray-900 mb-6">All Orders</h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="w-8 h-8" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-600">{error}</p>
                <Button variant="outline" size="sm" onClick={fetchSales} className="ml-auto">
                  Retry
                </Button>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No sales yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-gray-100 rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 pb-4 border-b">
                    <div>
                      <div className="text-xs sm:text-sm text-gray-500">Order ID</div>
                      <div className="font-semibold text-sm sm:text-base text-gray-900 break-all">{order.id.slice(0, 8)}...</div>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm text-gray-500">Buyer</div>
                      <div className="font-medium text-sm sm:text-base text-gray-900">{order.user.name}</div>
                      <div className="text-xs text-gray-500 truncate">{order.user.email}</div>
                    </div>
                    <div className="sm:text-right">
                      <div className="text-xs sm:text-sm text-gray-500">Purchase Date</div>
                      <div className="font-medium text-xs sm:text-sm text-gray-900">
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
                      <div className="text-xs sm:text-sm text-gray-500">Total</div>
                      <div className="text-lg sm:text-xl font-bold text-primary">₱{order.total.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm font-semibold text-gray-700 mb-2">Items Purchased:</div>
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 bg-gray-50 rounded">
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
                          <div className="font-medium text-sm sm:text-base break-words">{item.product.name}</div>
                          <div className="text-xs sm:text-sm text-gray-600">
                            Quantity: {item.quantity} × ₱{item.price.toFixed(2)}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-semibold text-sm sm:text-base">₱{(item.price * item.quantity).toFixed(2)}</div>
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

