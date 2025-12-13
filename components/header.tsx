"use client";

import React from "react";
import Link from "next/link";
import CartButton from "@/components/cart/cart-button";
import WishlistButton from "@/components/wishlist/wishlist-button";
import AvatarDropdown from "@/components/auth/avatar-dropdown";

export default function Header() {

  return (
    <header className="sticky top-0 z-[100] bg-green-900 dark:bg-green-950 shadow-sm border-b border-green-800 dark:border-green-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Link href="/store" aria-label="Go to store" className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-500 dark:text-yellow-400 hover:text-yellow-400 dark:hover:text-yellow-300 transition-colors whitespace-nowrap">
              TechCraftersHQ
            </Link>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 md:gap-6 flex-shrink-0">
            <WishlistButton />
            <CartButton />
            <AvatarDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}
