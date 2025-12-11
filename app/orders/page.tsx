"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { OrdersClient } from "@/components/orders/orders-client";

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersClient />
    </ProtectedRoute>
  );
}

