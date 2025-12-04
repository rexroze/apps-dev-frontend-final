import { ProtectedRoute } from "@/components/auth/protected-route";
import { ProductDetailClient } from "@/components/product/product-detail-client";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;

  return (
    <ProtectedRoute>
      <ProductDetailClient productId={id} />
    </ProtectedRoute>
  );
}