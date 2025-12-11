import { ProductDetailClient } from "@/components/product/product-detail-client";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;

  // Product detail page is now publicly accessible - no authentication required
  return <ProductDetailClient productId={id} />;
}