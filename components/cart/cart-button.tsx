"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import React from "react";

export function CartButton() {
  const { count } = useCart();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Link href="/cart" className="relative inline-flex items-center">
      <ShoppingCart className="text-secondary w-6 h-6" />
      {mounted && count > 0 && (
        <span className="absolute -top-1 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
          {count}
        </span>
      )}
    </Link>
  );
}

export default CartButton;
