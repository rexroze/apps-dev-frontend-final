import { ProductsClient } from "@/components/product/products-client";

export default function ProductsPage() {
  // Store page is now publicly accessible - no authentication required
  return <ProductsClient />;
}