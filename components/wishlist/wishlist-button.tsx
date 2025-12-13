"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/components/wishlist/wishlist-context";
import React from "react";

export function WishlistButton() {
  const { count } = useWishlist();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Link href="/wishlist" className="relative inline-flex items-center hover:opacity-80 transition-opacity">
      <Heart className="text-yellow-400 dark:text-yellow-300 w-6 h-6" />
      {mounted && count > 0 && (
        <span className="absolute -top-1 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
          {count}
        </span>
      )}
    </Link>
  );
}

export default WishlistButton;

