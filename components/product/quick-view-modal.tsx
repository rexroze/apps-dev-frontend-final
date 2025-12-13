"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductListResponse } from "@/types/product";
import Image from "next/image";
import { ShoppingBag, ShoppingCart } from "lucide-react";
import { StarRating } from "@/components/review/star-rating";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/cart-context";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/contexts/auth-context";

interface QuickViewModalProps {
  product: ProductListResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewFullPage?: () => void;
}

export function QuickViewModal({
  product,
  open,
  onOpenChange,
  onViewFullPage,
}: QuickViewModalProps) {
  const router = useRouter();
  const { addItem, items } = useCart();
  const { user } = useAuth();

  if (!product) return null;

  const handleAddToCart = () => {
    if (product.stock === 0) {
      toast.error("Product is out of stock");
      return;
    }
    const currentCartItem = items.find((item) => item.id === product.id);
    const currentQty = currentCartItem?.quantity || 0;
    if (currentQty >= product.stock) {
      toast.error(`Cannot add more. Only ${product.stock} in stock.`);
      return;
    }
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        stock: product.stock,
      },
      1
    );
    toast.success("Added to Cart");
  };

  const handleBuyNow = () => {
    if (product.stock === 0) {
      toast.error("Product is out of stock");
      return;
    }
    if (!user) {
      toast.info("Please login to continue");
      router.push(`/login?redirect=/checkout?productId=${product.id}&qty=1`);
      return;
    }
    onOpenChange(false);
    router.push(`/checkout?productId=${product.id}&qty=1`);
  };

  const handleViewFullPage = () => {
    onOpenChange(false);
    if (onViewFullPage) {
      onViewFullPage();
    } else {
      router.push(`/store/${product.id}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="aspect-square bg-muted/30 rounded-lg flex items-center justify-center p-4">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                width={400}
                height={400}
                className="object-contain rounded-lg"
              />
            ) : (
              <ShoppingBag className="w-24 h-24 text-muted-foreground" />
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {product.description}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-primary">
                ₱{product.price.toFixed(2)}
              </span>
              {(product as any).averageRating > 0 && (
                <StarRating
                  rating={(product as any).averageRating}
                  size="sm"
                  showValue
                />
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Stock:</span>
                <span className={product.stock > 0 ? "text-green-600" : "text-red-600"}>
                  {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
                </span>
              </div>
              {(product as any).soldCount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Sold:</span>
                  <span>{(product as any).soldCount} units</span>
                </div>
              )}
              {product.category && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span>{product.category.name}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-4">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
              <Button
                onClick={handleBuyNow}
                variant="outline"
                disabled={product.stock === 0}
                className="w-full"
              >
                Buy Now
              </Button>
              <Button
                onClick={handleViewFullPage}
                variant="ghost"
                className="w-full"
              >
                View Full Details
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

