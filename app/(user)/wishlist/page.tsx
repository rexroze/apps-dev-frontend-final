import { Suspense } from "react";
import { WishlistClient } from "@/components/wishlist/wishlist-client";
import { Spinner } from "@/components/ui/spinner";

export default function WishlistPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center gap-4 min-h-[400px]">
        <Spinner className="w-8 h-8" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    }>
      <WishlistClient />
    </Suspense>
  );
}

