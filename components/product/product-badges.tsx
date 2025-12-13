"use client";

import { ProductListResponse } from "@/types/product";
import { Badge } from "@/components/ui/badge";
import { ProductListResponse } from "@/types/product";
import { Award, Sparkles, TrendingUp, Star } from "lucide-react";

interface ProductBadgesProps {
  product: ProductListResponse;
}

export function ProductBadges({ product }: ProductBadgesProps) {
  const badges: Array<{ label: string; icon: React.ReactNode; className: string }> = [];
  const soldCount = (product as any).soldCount || 0;
  const averageRating = (product as any).averageRating || 0;
  const createdAt = product.createdAt ? new Date(product.createdAt) : null;
  const isNew = createdAt && (Date.now() - createdAt.getTime()) < 7 * 24 * 60 * 60 * 1000; // 7 days
  const isBestseller = soldCount >= 50;
  const isTopRated = averageRating >= 4.5 && (product as any).totalReviews >= 5;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  if (isBestseller) {
    badges.push({
      label: "Bestseller",
      icon: <TrendingUp className="w-3 h-3" />,
      className: "bg-orange-500 text-white hover:bg-orange-600",
    });
  }

  if (isNew) {
    badges.push({
      label: "New",
      icon: <Sparkles className="w-3 h-3" />,
      className: "bg-green-500 text-white hover:bg-green-600",
    });
  }

  if (isTopRated) {
    badges.push({
      label: "Top Rated",
      icon: <Star className="w-3 h-3" />,
      className: "bg-yellow-500 text-white hover:bg-yellow-600",
    });
  }

  if (isLowStock) {
    badges.push({
      label: "Low Stock",
      icon: <Award className="w-3 h-3" />,
      className: "bg-red-500 text-white hover:bg-red-600",
    });
  }

  if (badges.length === 0) return null;

  return (
    <div className="absolute top-2 left-2 flex flex-col gap-1 z-20">
      {badges.map((badge, index) => (
        <Badge
          key={index}
          className={`${badge.className} text-xs px-2 py-0.5 flex items-center gap-1 shadow-md`}
        >
          {badge.icon}
          {badge.label}
        </Badge>
      ))}
    </div>
  );
}

