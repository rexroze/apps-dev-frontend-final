import { ProtectedRoute } from "@/components/auth/protected-route";
import { ProductsClient } from "@/components/product/products-client";

export default function ProductsPage() {
  return (
    <ProtectedRoute>
      <ProductsClient />
    </ProtectedRoute>
  );
}