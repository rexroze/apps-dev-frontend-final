import { Suspense } from "react";
import { ProductsClient } from "@/components/product/products-client";
import { Spinner } from "@/components/ui/spinner";

export default function ProductsPage() {
  // Store page is now publicly accessible - no authentication required
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center gap-4 min-h-[400px]">
        <Spinner className="w-8 h-8" />
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    }>
      <ProductsClient />
    </Suspense>
  );
}